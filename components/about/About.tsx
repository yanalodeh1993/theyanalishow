import Image from 'next/image'

export function About() {
  return (
    <section id="about" className="py-24 px-10 bg-surface border-t border-cyan/5">
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="shrink-0">
          <Image
            src="/logo-transparent.png"
            alt="Yanali"
            width={180}
            height={180}
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,229,229,0.3))' }}
          />
        </div>
        <div>
          <h2
            className="font-russo text-white uppercase mb-6"
            style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
          >
            WHO IS<br />
            <span className="text-cyan">YANALI?</span>
          </h2>
          <p className="font-chakra font-light text-body/80 leading-relaxed text-base mb-4">
            Competitive gamer. Battle royale player. Future van lifer.
            TheYanaliShow is where the grind of ranked play meets the freedom of the open road.
          </p>
          <p className="font-chakra font-light text-muted leading-relaxed text-sm">
            Every stream is a battle. Every road is a new arena.<br />
            Follow the journey — wherever it goes.
          </p>
        </div>
      </div>
    </section>
  )
}
