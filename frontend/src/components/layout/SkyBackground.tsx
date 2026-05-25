export function SkyBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, background: 'linear-gradient(135deg,#09090e 0%,#12121a 100%)' }}
      aria-hidden="true"
    />
  )
}
