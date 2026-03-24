export default function Loading() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 90% at 0% 0%, #e0e7ff 0%, transparent 42%), radial-gradient(110% 90% at 100% 100%, #fde68a 0%, transparent 38%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%)",
        }}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-11 w-11">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-300 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
              ninestar.app
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Loading your workspace...
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="h-2.5 w-[92%] rounded-full bg-slate-200/80 animate-pulse" />
          <div className="h-2.5 w-[80%] rounded-full bg-slate-200/70 animate-pulse" />
          <div className="h-2.5 w-[65%] rounded-full bg-slate-200/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
