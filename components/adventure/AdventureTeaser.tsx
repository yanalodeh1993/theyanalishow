export function AdventureTeaser() {
  return (
    <section
      id="adventure"
      className="relative py-32 px-10 overflow-hidden flex items-center justify-center min-h-[60vh]"
      style={{ background: 'linear-gradient(180deg, #0A1E1E 0%, #050E0E 100%)' }}
    >
      <div className="relative z-10 text-center max-w-3xl">
        <p className="font-mono text-xs tracking-[0.5em] text-cyan/60 uppercase mb-6">
          Coming Soon
        </p>
        <h2
          className="font-russo text-white uppercase leading-none mb-6"
          style={{ fontSize: 'clamp(48px, 7vw, 100px)' }}
        >
          THE NEXT<br />
          <span className="text-cyan" style={{ textShadow: '0 0 30px rgba(0,229,229,0.4)' }}>
            CHAPTER
          </span>
        </h2>
        <p className="font-chakra font-light text-body/60 text-lg leading-relaxed">
          A van. The open road. Streaming from everywhere.<br />
          The same competitive energy — just no walls.
        </p>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-gradient-to-b from-cyan/30 to-transparent"
      />
    </section>
  )
}
