import { CheckCircle2, GraduationCap, Home, Phone, ShieldCheck, UserRound } from 'lucide-react';

const inputClass = 'w-full rounded-lg border border-primary/10 bg-white px-3.5 py-3 text-sm font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-4 focus:ring-accent/20';
const labelClass = 'mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-gray-500';

export default function Onboarding({ data, setData, onSubmit }) {
  const batches = Array.from({ length: 11 }, (_, index) => 2020 + index);

  return (
    <div className="min-h-screen bg-primary text-white">
      <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8">
        <section className="py-4 md:py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-primary shadow-lg shadow-black/10">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-accent-light">One-time verification</p>
          <h1 className="mt-3 max-w-xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Complete your student trading profile.
          </h1>
          <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/70">
            These details help buyers and sellers recognize each other before meeting on campus.
          </p>

          <div className="mt-6 grid max-w-lg grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/12 bg-white/10 p-4">
              <CheckCircle2 size={22} className="text-accent" />
              <p className="mt-3 text-sm font-black">Buy with trust</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/60">Profiles make student-to-student handoffs clearer.</p>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/10 p-4">
              <Phone size={22} className="text-accent" />
              <p className="mt-3 text-sm font-black">Fast contact</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/60">WhatsApp opens directly from listing pages.</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-[#f4f5ef] p-4 text-gray-950 shadow-2xl shadow-black/20 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Profile details</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Set up your account</h2>
          </div>

          <form onSubmit={onSubmit} className="grid gap-4">
            <div>
              <label className={labelClass}>Full name *</label>
              <div className="relative">
                <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={data.name}
                  onChange={(event) => setData({ ...data, name: event.target.value })}
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
                  value={data.rollNumber}
                  onChange={(event) => setData({ ...data, rollNumber: event.target.value })}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Batch</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={data.batch}
                    onChange={(event) => setData({ ...data, batch: event.target.value })}
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
                  value={data.whatsapp}
                  onChange={(event) => setData({ ...data, whatsapp: event.target.value })}
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
                  value={data.hostel}
                  onChange={(event) => setData({ ...data, hostel: event.target.value })}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select hostel</option>
                  {['Hostel A', 'Hostel B', 'Hostel C', 'Girls Hostel A', 'Girls Hostel B', 'Day Scholar'].map((hostel) => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light active:scale-[0.98]"
            >
              <CheckCircle2 size={18} />
              Verify and start trading
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
