export function AdventureTeaser() {
  return (
    <section
      id="adventure"
      className="px-10 md:px-14 py-28 flex items-center justify-center min-h-[55vh] relative overflow-hidden grid-bg"
      style={{ background: '#14141a', borderTop: '1px solid rgba(100,120,255,0.1)' }}
    >
      {/* faint ghost text */}
      <div
        className="absolute font-russo pointer-events-none select-none whitespace-nowrap"
        style={{
          fontSize: 'clamp(120px, 20vw, 280px)',
          color: 'rgba(100,120,255,0.025)',
          letterSpacing: '8px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        ADVENTURE
      </div>

      <div className="relative z-10 text-center max-w-3xl">
        <div
          className="inline-block font-chakra text-[11px] font-semibold tracking-[3px] uppercase px-4 py-2 mb-8 rounded-full"
          style={{ color: '#6478ff', border: '1px solid rgba(100,120,255,0.3)' }}
        >
          Coming Soon
        </div>

        <h2
          className="font-russo uppercase leading-[0.95] tracking-[2px]"
          style={{ fontSize: 'clamp(56px, 8vw, 110px)' }}
        >
          <span className="block text-white">THE NEXT</span>
          <span
            className="block"
            style={{ WebkitTextStroke: '2px rgba(100,120,255,0.5)', color: 'transparent' }}
          >
            CHAPTER
          </span>
        </h2>

        <p className="font-chakra text-muted text-base leading-[1.7] mt-7 max-w-md mx-auto">
          A van. The open road. No walls. The same competitive energy — just no fixed address.
        </p>

        <div
          className="w-0.5 h-16 mx-auto mt-12"
          style={{
            background: 'linear-gradient(to bottom, rgba(100,120,255,0.4), transparent)',
          }}
        />
      </div>
    </section>
  )
}
