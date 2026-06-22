import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Home, Loader2, LogOut, PackageOpen, PlusSquare, ShieldCheck, Store, Trash2, User, Edit3, X, GraduationCap } from 'lucide-react';
import {
  getCurrentUser,
  getUserProfile,
  saveUserProfile,
  subscribeToListings,
  createListing,
  deleteListing,
  updateListing,
  uploadListingImage,
  logoutUser,
  subscribeToAuthChanges,
  isFirebaseConfigured,
} from './firebaseClient';

const Feed = lazy(() => import('./views/Feed'));
const Detail = lazy(() => import('./views/Detail'));
const AuthGate = lazy(() => import('./views/AuthGate'));
const Onboarding = lazy(() => import('./views/Onboarding'));
const Sell = lazy(() => import('./views/Sell'));

const ROUTE_VIEWS = new Set(['feed', 'detail', 'auth-gate', 'onboarding', 'sell', 'profile']);

const inputClass = 'w-full rounded-lg border border-primary/10 bg-white px-3.5 py-3 text-sm font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-4 focus:ring-accent/20';
const labelClass = 'mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-gray-500';
const batches = Array.from({ length: 11 }, (_, index) => 2020 + index);

function getInitialView() {
  const pathView = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'feed';
  return ROUTE_VIEWS.has(pathView) ? pathView : 'feed';
}

const NAV = [
  { id: 'feed', icon: Home, label: 'Home' },
  { id: 'sell', icon: PlusSquare, label: 'Sell' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function App() {
  const [view, setView] = useState(getInitialView);
  const [prevView, setPrevView] = useState(null);
  const viewRef = useRef(view);
  const prevViewRef = useRef(prevView);
  const [userSession, setUserSession] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isSubmittingSell, setIsSubmittingSell] = useState(false);

  const [product, setProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [onboardingData, setOnboardingData] = useState({ name: '', rollNumber: '', batch: '', whatsapp: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', rollNumber: '', batch: '', whatsapp: '' });
  const [sellForm, setSellForm] = useState({
    title: '',
    price: '',
    category: 'books',
    condition: 'Like New',
    location: '',
    description: '',
    imageFile: null,
  });

  const setActiveView = (target) => {
    viewRef.current = target;
    setView(target);
  };

  const setPreviousView = (target) => {
    prevViewRef.current = target;
    setPrevView(target);
  };

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    prevViewRef.current = prevView;
  }, [prevView]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = subscribeToListings((newListings) => {
      setListings(newListings);
    });
    return unsubscribe;
  }, []);



  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.email);
          if (profile) {
            setUserSession({
              ...profile,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            });
            const currentView = viewRef.current;
            if (currentView === 'auth-gate' || currentView === 'onboarding') {
              const previousView = prevViewRef.current;
              const target = previousView && !['auth-gate', 'onboarding'].includes(previousView) ? previousView : 'feed';
              setPreviousView(null);
              setActiveView(target);
            }
          } else {
            const parts = firebaseUser.email.split('@')[0].split('.');
            const inferredName = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
            setOnboardingData({
              name: inferredName,
              rollNumber: '',
              batch: '',
              whatsapp: '',
            });
            setActiveView('onboarding');
          }
        } catch (error) {
          console.error('Error retrieving user profile:', error);
        }
      } else {
        setUserSession(null);
      }
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const goTo = (target, savePrev = false) => {
    if (savePrev) setPreviousView(viewRef.current);
    setActiveView(target);
  };

  const requireAuth = (target) => {
    if (userSession) {
      goTo(target);
    } else {
      setPreviousView(viewRef.current);
      setActiveView('auth-gate');
    }
  };

  const handleNavClick = (id) => {
    if (id === 'sell') {
      requireAuth('sell');
      return;
    }
    if (id === 'profile') {
      requireAuth('profile');
      return;
    }
    setActiveView(id);
  };

  const handleProductClick = (listing) => {
    setProduct(listing);
    goTo('detail', true);
  };

  const handleContactSeller = (listing) => {
    const msg = encodeURIComponent(`Hi! I saw your listing for "${listing.title}" on SSPM Marketplace. Is it still available?`);
    window.open(`https://wa.me/${listing.seller.phone}?text=${msg}`, '_blank');
  };

  const handleOnboardingSubmit = async (event) => {
    event.preventDefault();
    if (onboardingData.name && onboardingData.whatsapp) {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const profileData = {
        name: onboardingData.name,
        rollNumber: onboardingData.rollNumber,
        batch: onboardingData.batch,
        whatsapp: onboardingData.whatsapp,
      };

      try {
        await saveUserProfile(currentUser.email, profileData);
        setUserSession({
          ...profileData,
          email: currentUser.email,
          uid: currentUser.uid,
        });

        const previousView = prevViewRef.current;
        const target = previousView && !['auth-gate', 'onboarding'].includes(previousView) ? previousView : 'feed';
        setPreviousView(null);
        goTo(target);
      } catch (error) {
        console.error('Failed to save onboarding data:', error);
        alert(`Error saving profile: ${error.message}`);
      }
    }
  };

  const handleProfileEditSubmit = async (event) => {
    event.preventDefault();
    if (!userSession) return;
    setIsSavingProfile(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("User not authenticated.");

      const profileData = {
        name: editProfileForm.name,
        rollNumber: editProfileForm.rollNumber,
        batch: editProfileForm.batch,
        whatsapp: editProfileForm.whatsapp,
      };

      await saveUserProfile(currentUser.email, profileData);

      setUserSession((prev) => ({
        ...prev,
        ...profileData,
      }));

      // Update listings in Firestore with the updated seller details
      const userListings = listings.filter((listing) => (
        (listing.sellerEmail && listing.sellerEmail.toLowerCase() === userSession.email.toLowerCase()) ||
        (listing.sellerUid && listing.sellerUid === userSession.uid) ||
        listing.seller?.phone === `91${userSession.whatsapp}` ||
        listing.seller?.phone === userSession.whatsapp
      ));

      for (const listing of userListings) {
        await updateListing(listing.id, {
          seller: {
            name: profileData.name,
            phone: `91${profileData.whatsapp}`,
          }
        });
      }

      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSellSubmit = async (event) => {
    event.preventDefault();
    if (!userSession) return;
    setIsSubmittingSell(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600&h=600';
      if (sellForm.imageFile) {
        let extension = 'jpg';
        const match = sellForm.imageFile.match(/^data:image\/(\w+);base64/);
        if (match) {
          extension = match[1];
        }
        const fileName = `image_${Date.now()}.${extension}`;
        const uploadedUrl = await uploadListingImage(sellForm.imageFile, fileName);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const currentUser = await getCurrentUser();
      const newItem = {
        title: sellForm.title,
        price: parseInt(sellForm.price, 10),
        category: sellForm.category,
        condition: sellForm.condition,
        location: sellForm.location,
        description: sellForm.description,
        image: imageUrl,
        seller: {
          name: userSession.name,
          phone: `91${userSession.whatsapp}`,
        },
        sellerEmail: userSession.email.toLowerCase(),
        sellerUid: currentUser?.uid || '',
      };

      await createListing(newItem);
      setSellForm({ title: '', price: '', category: 'books', condition: 'Like New', location: '', description: '', imageFile: null });
      goTo('feed');
    } catch (error) {
      console.error('Failed to post listing:', error);
      alert(`Error posting listing: ${error.message}`);
    } finally {
      setIsSubmittingSell(false);
    }
  };

  const handleDeleteListing = async (id) => {
    try {
      await deleteListing(id);
      if (product?.id === id) {
        setProduct(null);
      }
      if (view !== 'profile') {
        goTo(prevView && prevView !== 'auth-gate' && prevView !== 'onboarding' ? prevView : 'feed');
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert(`Error deleting listing: ${error.message}`);
    }
  };

  const myListings = listings.filter((listing) => userSession && (
    (listing.sellerEmail && listing.sellerEmail.toLowerCase() === userSession.email.toLowerCase()) ||
    (listing.sellerUid && listing.sellerUid === userSession.uid) ||
    listing.seller?.phone === `91${userSession.whatsapp}` ||
    listing.seller?.phone === userSession.whatsapp
  ));

  const noNav = ['detail', 'auth-gate', 'onboarding', 'sell'].includes(view);

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5ef] px-4 font-sans text-gray-900">
        <div className="w-full max-w-md rounded-xl border border-primary/10 bg-white p-6 shadow-xl md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 mb-4">
            <ShieldCheck size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-[#123c36]">Configuration Required</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            The Firebase environment variables are missing. Since <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-red-600 font-semibold">.env</code> is ignored in Git for security, you need to configure these variables in your Vercel deployment settings.
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-xs font-semibold font-mono text-gray-600 space-y-1">
            <p>VITE_FIREBASE_API_KEY</p>
            <p>VITE_FIREBASE_AUTH_DOMAIN</p>
            <p>VITE_FIREBASE_PROJECT_ID</p>
            <p>VITE_FIREBASE_STORAGE_BUCKET</p>
            <p>VITE_FIREBASE_MESSAGING_SENDER_ID</p>
            <p>VITE_FIREBASE_APP_ID</p>
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">
            Once added, trigger a redeployment in Vercel to apply the changes.
          </p>
        </div>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5ef] px-4 font-sans">
        <div className="market-card flex w-full max-w-sm flex-col items-center rounded-lg p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/15">
            <Loader2 size={24} className="animate-spin" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-accent-dark">SSPM Market</p>
          <p className="mt-2 text-sm font-semibold text-gray-500">Preparing your campus marketplace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5ef] font-sans text-gray-950">
      {!noNav && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-24 border-r border-primary/10 bg-[#f4f5ef]/90 px-3 py-5 backdrop-blur-xl md:flex md:flex-col">
          <button
            onClick={() => handleNavClick('feed')}
            className="mb-8 flex h-12 w-12 items-center justify-center self-center rounded-lg bg-primary text-white shadow-lg shadow-primary/15 transition hover:bg-primary-light active:scale-[0.98]"
            aria-label="Go to feed"
          >
            <Store size={22} />
          </button>
          <nav className="flex flex-1 flex-col items-center gap-2">
            {NAV.map(({ id, icon: Icon, label }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`flex w-full flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-black transition active:scale-[0.98] ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/15'
                      : 'text-gray-500 hover:bg-white hover:text-primary hover:shadow-sm'
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.6 : 2} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      <div className={`min-h-screen ${!noNav ? 'md:pl-24' : ''}`}>
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            {view === 'feed' && (
              <Feed
                listings={listings}
                searchQuery={search}
                setSearchQuery={setSearch}
                activeCategory={category}
                setActiveCategory={setCategory}
                onProductClick={handleProductClick}
                userSession={userSession}
                onLoginClick={() => { setPreviousView('feed'); setActiveView('auth-gate'); }}
                onSellClick={() => requireAuth('sell')}
              />
            )}
            {view === 'detail' && (
              <Detail
                product={product}
                userSession={userSession}
                onBack={() => {
                  const backTarget = prevView && !['auth-gate', 'onboarding'].includes(prevView) ? prevView : 'feed';
                  goTo(backTarget);
                }}
                onContactSeller={handleContactSeller}
                onLoginRequired={() => { setPreviousView('detail'); setActiveView('auth-gate'); }}
                onDelete={handleDeleteListing}
              />
            )}
            {view === 'auth-gate' && (
              <AuthGate
                onBack={() => goTo(prevView && prevView !== 'auth-gate' && prevView !== 'onboarding' ? prevView : 'feed')}
              />
            )}
            {view === 'onboarding' && (
              <Onboarding
                data={onboardingData}
                setData={setOnboardingData}
                onSubmit={handleOnboardingSubmit}
              />
            )}
            {view === 'sell' && (
              <Sell
                form={sellForm}
                setForm={setSellForm}
                onSubmit={handleSellSubmit}
                onBack={() => goTo(prevView && prevView !== 'auth-gate' && prevView !== 'onboarding' ? prevView : 'feed')}
                isSubmitting={isSubmittingSell}
              />
            )}
          </Suspense>
          {view === 'profile' && (
            <div className="min-h-screen bg-[#f4f5ef] pb-24 md:pb-12">
              <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-lg bg-primary text-white shadow-2xl shadow-primary/15">
                  <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-accent text-2xl font-black text-primary shadow-lg shadow-black/10">
                        {userSession?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent-light">Student profile</p>
                        <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-white sm:text-3xl">{userSession?.name}</h1>
                        <p className="mt-1 truncate text-sm font-medium text-white/70">
                          {userSession?.hostel || 'Campus member'} · {userSession?.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                      <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                        <p className="text-2xl font-black">{myListings.length}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/60">Active listings</p>
                      </div>
                      <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                        <ShieldCheck size={24} className="text-accent" />
                        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-white/60">Verified seller</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                  <section className="market-card rounded-lg p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Inventory</p>
                        <h2 className="mt-1 text-xl font-black text-gray-950">My Listings</h2>
                      </div>
                      <button
                        onClick={() => goTo('sell')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary-light active:scale-[0.98]"
                      >
                        <PlusSquare size={16} />
                        Add item
                      </button>
                    </div>

                    {myListings.length === 0 ? (
                      <div className="py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-accent-light text-accent-dark">
                          <PackageOpen size={25} />
                        </div>
                        <h3 className="mt-4 text-lg font-black text-gray-950">No listings yet</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-gray-500">
                          Start with textbooks, instruments, or hostel items students are already looking for.
                        </p>
                        <button
                          onClick={() => goTo('sell')}
                          className="mt-5 rounded-lg border border-primary/15 bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white"
                        >
                          Sell something now
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 divide-y divide-gray-100">
                        {myListings.map((listing) => (
                          <div key={listing.id} className="group flex items-center gap-3 py-3.5">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="h-16 w-16 shrink-0 cursor-pointer rounded-lg object-cover transition group-hover:opacity-90"
                              onClick={() => handleProductClick(listing)}
                            />
                            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleProductClick(listing)}>
                              <p className="line-clamp-1 text-sm font-black text-gray-900 transition group-hover:text-primary">{listing.title}</p>
                              <p className="mt-1 text-sm font-black text-gray-950">₹{Number(listing.price || 0).toLocaleString('en-IN')}</p>
                              <p className="mt-1 line-clamp-1 text-xs font-semibold text-gray-500">{listing.location || 'Campus handoff'}</p>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this listing?')) {
                                  handleDeleteListing(listing.id);
                                }
                              }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete listing"
                              aria-label={`Delete ${listing.title}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <aside className="space-y-4">
                    <div className="market-card rounded-lg p-5">
                      <div className="flex items-center justify-between border-b border-primary/5 pb-2.5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Trading details</p>
                        <button
                          onClick={() => {
                            setEditProfileForm({
                              name: userSession?.name || '',
                              rollNumber: userSession?.rollNumber || '',
                              batch: userSession?.batch || '',
                              whatsapp: userSession?.whatsapp || '',
                              hostel: userSession?.hostel || '',
                            });
                            setIsEditingProfile(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-light transition"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                      </div>
                      <dl className="mt-3.5 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">Roll number</dt>
                          <dd className="font-black text-gray-900">{userSession?.rollNumber || 'Not added'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">Batch</dt>
                          <dd className="font-black text-gray-900">{userSession?.batch || 'Not added'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">WhatsApp</dt>
                          <dd className="font-black text-gray-900">{userSession?.whatsapp ? `+91 ${userSession.whatsapp}` : 'Not added'}</dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to log out?')) {
                          try {
                            await logoutUser();
                            goTo('feed');
                          } catch (error) {
                            console.error('Error logging out:', error);
                          }
                        }
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 shadow-sm transition hover:bg-red-50 active:scale-[0.98]"
                    >
                      <LogOut size={17} />
                      Log out
                    </button>
                  </aside>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!noNav && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-white/95 px-2 pb-2 pt-2 shadow-[0_-16px_40px_rgba(18,60,54,0.12)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-md items-end justify-around">
            {NAV.map(({ id, icon: Icon, label }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`flex min-w-20 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] font-black transition active:scale-[0.98] ${
                    active ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {id === 'sell' ? (
                    <>
                      <span className="flex h-12 w-12 -translate-y-2 items-center justify-center rounded-lg bg-accent text-primary shadow-lg shadow-accent/30 ring-4 ring-white">
                        <Icon size={21} />
                      </span>
                      <span className="-mt-1">{label}</span>
                    </>
                  ) : (
                    <>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-primary text-white' : 'text-gray-500'}`}>
                        <Icon size={20} strokeWidth={active ? 2.6 : 2} />
                      </span>
                      <span>{label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl bg-[#f4f5ef] p-6 text-gray-950 shadow-2xl animate-fade-in md:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
              aria-label="Close modal"
              type="button"
            >
              <X size={20} />
            </button>

            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Profile details</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#123c36]">Edit Trading Profile</h2>
              <p className="mt-1.5 text-xs font-semibold text-gray-500 leading-normal">
                Update your contact and hostel details. Changing these will also update the seller details on your active listings.
              </p>
            </div>

            <form onSubmit={handleProfileEditSubmit} className="grid gap-4">
              <div>
                <label className={labelClass}>Full name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(event) => setEditProfileForm({ ...editProfileForm, name: event.target.value })}
                    placeholder="Rahul Sharma"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Roll number</label>
                  <input
                    type="text"
                    value={editProfileForm.rollNumber}
                    onChange={(event) => setEditProfileForm({ ...editProfileForm, rollNumber: event.target.value })}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Batch</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={editProfileForm.batch}
                      onChange={(event) => setEditProfileForm({ ...editProfileForm, batch: event.target.value })}
                      className={`${inputClass} pl-10`}
                    >
                      <option value="">Select year</option>
                      {batches.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>WhatsApp number *</label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border border-r-0 border-primary/10 bg-white px-3 text-sm font-black text-gray-500">+91</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={editProfileForm.whatsapp}
                    onChange={(event) => setEditProfileForm({ ...editProfileForm, whatsapp: event.target.value })}
                    placeholder="10-digit number"
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Hostel or status</label>
                <div className="relative">
                  <Home size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={editProfileForm.hostel}
                    onChange={(event) => setEditProfileForm({ ...editProfileForm, hostel: event.target.value })}
                    className={`${inputClass} pl-10`}
                  >
                    <option value="">Select hostel</option>
                    {['Hostel A', 'Hostel B', 'Hostel C', 'Girls Hostel A', 'Girls Hostel B', 'Day Scholar'].map((hostel) => (
                      <option key={hostel} value={hostel}>{hostel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light active:scale-[0.98] disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
