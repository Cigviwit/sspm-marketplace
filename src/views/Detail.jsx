import { ArrowLeft, Clock3, MapPin, MessageCircle, ShieldCheck, Trash2, User } from 'lucide-react';

const conditionBadge = {
  'Like New': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Good: 'bg-blue-50 text-blue-700 border-blue-200',
  Fair: 'bg-amber-50 text-amber-700 border-amber-200',
  New: 'bg-teal-50 text-teal-800 border-teal-200',
};

export default function Detail({ product, userSession, onBack, onContactSeller, onLoginRequired, onDelete }) {
  if (!product) return null;

  const isOwner = userSession && (
    (product.sellerEmail && product.sellerEmail.toLowerCase() === userSession.email.toLowerCase()) ||
    (product.sellerUid && product.sellerUid === userSession.uid) ||
    product.seller?.phone === `91${userSession.whatsapp}` ||
    product.seller?.phone === userSession.whatsapp
  );

  const handleCTA = () => {
    if (isOwner) {
      if (confirm('Are you sure you want to delete this listing?')) {
        onDelete(product.id);
      }
    } else if (userSession) {
      onContactSeller(product);
    } else {
      onLoginRequired();
    }
  };

  const ctaLabel = isOwner ? 'Delete Listing' : userSession ? 'Chat on WhatsApp' : 'Log in to Contact Seller';
  const CTAIcon = isOwner ? Trash2 : userSession ? MessageCircle : User;
  const ctaClass = isOwner
    ? 'bg-red-600 text-white shadow-red-200 hover:bg-red-700'
    : userSession
      ? 'bg-whatsapp text-white shadow-emerald-100 hover:brightness-95'
      : 'bg-primary text-white shadow-primary/20 hover:bg-primary-light';

  const renderActionButton = (className = '') => (
    <button
      onClick={handleCTA}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-black shadow-lg transition active:scale-[0.98] ${ctaClass} ${className}`}
    >
      <CTAIcon size={18} />
      {ctaLabel}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f4f5ef] pb-28 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-primary/10 bg-[#f4f5ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary shadow-sm transition hover:border-primary/25 hover:bg-primary hover:text-white active:scale-[0.98]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Listing details</p>
            <h1 className="line-clamp-1 text-base font-black text-gray-950 sm:text-lg">{product.title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_380px] lg:px-8">
        <section className="space-y-4">
          <div className="market-card overflow-hidden rounded-lg">
            <div className="relative aspect-[4/3] bg-gray-100 md:aspect-[5/4]">
              <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
              <span className={`absolute left-3 top-3 rounded-md border px-2.5 py-1 text-xs font-black ${conditionBadge[product.condition] || 'border-gray-200 bg-white text-gray-600'}`}>
                {product.condition}
              </span>
            </div>
          </div>

          <div className="market-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Description</p>
            <p className="mt-3 whitespace-pre-line text-sm font-medium leading-7 text-gray-600">{product.description}</p>
          </div>
        </section>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <section className="market-card rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-3xl font-black tracking-tight text-gray-950">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                <h2 className="mt-3 text-xl font-black leading-tight text-gray-950">{product.title}</h2>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-gray-600">
                <MapPin size={17} className="text-primary" />
                <span className="font-bold">{product.location || 'Campus handoff'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-gray-600">
                <Clock3 size={17} className="text-primary" />
                <span className="font-bold">{product.postedAgo || 'Recently posted'}</span>
              </div>
            </div>

            <div className="mt-5 hidden md:block">
              {renderActionButton()}
              {!userSession && (
                <p className="mt-3 text-center text-xs font-semibold text-gray-500">Only verified SSPM students can contact sellers.</p>
              )}
            </div>
          </section>

          <section className="market-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Seller</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-black text-white">
                {product.seller.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-black text-gray-950">{product.seller.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-gray-500">{product.seller.hostel || 'SSPM Campus'}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
                <ShieldCheck size={13} />
                Verified
              </span>
            </div>
          </section>

          <section className="rounded-lg border border-primary/10 bg-accent-light p-5">
            <p className="text-sm font-black text-primary">Meet on campus, pay after inspection.</p>
            <p className="mt-2 text-sm font-medium leading-6 text-primary/70">
              Prefer public handoff points like the library, canteen, hostel gate, or department lobby.
            </p>
          </section>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/10 bg-white/95 px-4 py-3 shadow-[0_-16px_40px_rgba(18,60,54,0.12)] backdrop-blur-xl md:hidden">
        <div className="mx-auto max-w-md">
          {renderActionButton()}
          {!userSession && (
            <p className="mt-2 text-center text-[11px] font-semibold text-gray-500">Only verified SSPM students can contact sellers.</p>
          )}
        </div>
      </div>
    </div>
  );
}
