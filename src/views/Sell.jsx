import { useRef } from 'react';
import { ArrowLeft, Camera, CheckCircle2, ImagePlus, Loader2, MapPin, ShieldCheck, Tag, X } from 'lucide-react';
import { CATEGORIES } from '../data';

const inputClass = 'w-full rounded-lg border border-primary/10 bg-white px-3.5 py-3 text-sm font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-4 focus:ring-accent/20';
const labelClass = 'mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-gray-500';

export default function Sell({ form, setForm, onSubmit, onBack, isSubmitting }) {
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setForm({ ...form, imageFile: compressedDataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (event) => {
    event.stopPropagation();
    setForm({ ...form, imageFile: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f4f5ef] pb-10">
      <header className="sticky top-0 z-20 border-b border-primary/10 bg-[#f4f5ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary shadow-sm transition hover:border-primary/25 hover:bg-primary hover:text-white active:scale-[0.98]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Sell on campus</p>
            <h1 className="text-lg font-black text-gray-950">Post a Listing</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="market-card group relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-primary/15 text-center transition hover:border-accent"
            >
              {form.imageFile ? (
                <>
                  <img src={form.imageFile} alt="Listing preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/45 opacity-0 transition group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-primary shadow-lg">
                      <ImagePlus size={16} />
                      Change photo
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-black/65 text-white shadow-lg transition hover:bg-black"
                    aria-label="Remove uploaded photo"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="px-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent-light text-accent-dark transition group-hover:scale-105">
                    <Camera size={26} />
                  </div>
                  <p className="text-base font-black text-gray-950">Add a clear item photo</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">Good lighting and a clean background help your listing sell faster.</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="rounded-lg border border-primary/10 bg-accent-light p-4">
              <div className="flex gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-black text-primary">Verified campus listing</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-primary/70">
                    Buyers will see your name and preferred handoff location.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="market-card rounded-lg p-4 sm:p-5">
            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Listing title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="e.g. Harrison's Principles 20th Ed"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Price (₹)</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      placeholder="1500"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Condition</label>
                  <select
                    value={form.condition}
                    onChange={(event) => setForm({ ...form, condition: event.target.value })}
                    className={inputClass}
                  >
                    {['New', 'Like New', 'Good', 'Fair'].map((condition) => <option key={condition}>{condition}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className={inputClass}
                  >
                    {CATEGORIES.filter((category) => category.id !== 'all').map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Handoff location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                      placeholder="Library steps"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  rows={6}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Mention condition, included accessories, notes, availability, or any defects."
                  className={`${inputClass} resize-none leading-6`}
                />
              </div>

              <div className="rounded-lg border border-primary/10 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium leading-6 text-gray-600">
                    Keep pricing fair and meet in a public campus spot. Listings with accurate descriptions get better responses.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting listing...
                  </>
                ) : (
                  <>
                    <ImagePlus size={17} />
                    Post listing
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
