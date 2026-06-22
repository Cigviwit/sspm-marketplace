import {
  BookOpen,
  ChevronDown,
  Clock3,
  Laptop,
  LogIn,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Package,
  X,
} from 'lucide-react';
import { CATEGORIES } from '../data';

const conditionColor = {
  'Like New': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Good: 'text-blue-700 bg-blue-50 border-blue-200',
  Fair: 'text-amber-700 bg-amber-50 border-amber-200',
  New: 'text-teal-800 bg-teal-50 border-teal-200',
};

const categoryIcons = {
  all: ShoppingBag,
  books: BookOpen,
  electronics: Laptop,
  'daily-essentials': Package,
  others: ShoppingBag,
};

function getCategoryCount(listings, categoryId) {
  if (categoryId === 'all') return listings.length;
  return listings.filter((listing) => listing.category === categoryId).length;
}

export default function Feed({
  listings,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  onProductClick,
  userSession,
  onLoginClick,
  onSellClick,
}) {
  const filtered = listings.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    return (
      (activeCategory === 'all' || item.category === activeCategory) &&
      (!q || title.includes(q) || description.includes(q))
    );
  });

  const activeLabel = CATEGORIES.find((category) => category.id === activeCategory)?.label || 'All';

  return (
    <div className="min-h-screen bg-[#f4f5ef] pb-24 md:pb-12">
      <header className="border-b border-primary/10 bg-[#f4f5ef]/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/15">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-accent-dark">Campus only</p>
              <h1 className="text-lg font-black tracking-tight text-primary sm:text-xl">SSPM Market</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userSession ? (
              <div className="hidden items-center gap-2 rounded-lg border border-primary/10 bg-white px-3 py-2 shadow-sm sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-light text-sm font-black text-primary">
                  {userSession.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-gray-900">{userSession.name}</p>
                  <p className="text-[11px] font-semibold text-gray-500">Verified student</p>
                </div>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm font-bold text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary hover:text-white active:scale-[0.98]"
              >
                <LogIn size={16} />
                Log in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg bg-primary text-white shadow-2xl shadow-primary/15">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-accent-light">
                  <ShieldCheck size={14} />
                  Verified student marketplace
                </div>
                <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Buy and sell campus essentials without leaving SSPM.
                </h2>
                <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/72 sm:text-base">
                  Books, electronics, daily essentials, and everyday finds from students you can actually meet.
                </p>
              </div>

              <div className="relative max-w-2xl">
                <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/55" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search books, stethoscopes, lab coats, lamps..."
                  className="h-14 w-full rounded-lg border border-white/20 bg-white pl-12 pr-12 text-base font-semibold text-gray-900 shadow-xl shadow-primary-dark/20 outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-4 focus:ring-accent/25"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                <p className="text-2xl font-black text-white">{listings.length}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/60">Live listings</p>
              </div>
              <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                <p className="text-2xl font-black text-white">{CATEGORIES.length - 1}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/60">Categories</p>
              </div>
              <button
                onClick={onSellClick}
                className="rounded-lg bg-accent p-4 text-left text-primary shadow-lg shadow-black/10 transition hover:bg-[#f0bd4c] active:scale-[0.98]"
              >
                <Sparkles size={18} className="mb-3" />
                <p className="text-sm font-black">List an item</p>
                <p className="mt-1 hidden text-xs font-semibold text-primary/70 sm:block">Post in under a minute</p>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="hide-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2">
              {CATEGORIES.map((category) => {
                const Icon = categoryIcons[category.id] || ShoppingBag;
                const active = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-bold transition active:scale-[0.98] ${
                      active
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/15'
                        : 'border-primary/10 bg-white text-gray-700 shadow-sm hover:border-primary/25 hover:text-primary'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{category.label}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${active ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {getCategoryCount(listings, category.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">{activeLabel}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950">
              {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} available
            </h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary/10 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-primary/25 hover:text-primary">
            <SlidersHorizontal size={16} />
            Newest
            <ChevronDown size={14} />
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <article
                key={item.id}
                onClick={() => onProductClick(item)}
                className="market-card group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10 active:scale-[0.99]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-2 top-2 rounded-md border px-2 py-1 text-[10px] font-black ${conditionColor[item.condition] || 'border-gray-200 bg-white text-gray-600'}`}>
                    {item.condition}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-lg font-black tracking-tight text-gray-950">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                    <span className="rounded-md bg-accent-light px-2 py-1 text-[10px] font-black uppercase text-accent-dark">
                      {CATEGORIES.find((category) => category.id === item.category)?.label || 'Item'}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-gray-800 transition group-hover:text-primary">
                    {item.title}
                  </h3>

                  <div className="mt-auto pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <MapPin size={13} className="shrink-0 text-primary/55" />
                      <span className="line-clamp-1">{item.location || 'Campus handoff'}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                        <Clock3 size={12} />
                        {item.postedAgo || 'Just posted'}
                      </span>
                      <span className="text-[11px] font-black text-primary">View</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="market-card mt-4 rounded-lg px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-accent-light text-accent-dark">
              <Search size={24} />
            </div>
            <h3 className="mt-4 text-lg font-black text-gray-950">No matching listings found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-gray-500">
              Try another category or clear your search to see everything currently posted on campus.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary-light active:scale-[0.98]"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
