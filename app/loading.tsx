export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mx-auto h-[3px] w-full bg-gradient-to-r from-transparent via-white/70 to-transparent shadow-[0_0_28px_rgba(255,255,255,0.24)] animate-pulse" />
      </div>
    </div>
  );
}
