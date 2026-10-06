/** Ambient mesh behind the app; gradients only, since a blurred fixed layer repaints on scroll. */
export function Ambient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-40"
    >
      <div
        className="absolute -inset-1/4"
        style={{
          backgroundImage: [
            "radial-gradient(38rem 30rem at 12% -8%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
            "radial-gradient(34rem 28rem at 92% 4%, color-mix(in oklch, var(--brand-blue) 13%, transparent), transparent 68%)",
            "radial-gradient(40rem 32rem at 78% 96%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
            "radial-gradient(30rem 26rem at 2% 88%, color-mix(in oklch, var(--brand-green) 11%, transparent), transparent 66%)",
            "linear-gradient(180deg, color-mix(in oklch, var(--background) 88%, white) 0%, var(--background) 100%)",
          ].join(","),
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-sunken/45 to-transparent" />
    </div>
  )
}
