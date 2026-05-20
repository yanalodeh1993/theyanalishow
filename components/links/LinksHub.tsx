'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SiteLink } from '@/lib/types'

export function LinksHub() {
  const [links, setLinks] = useState<SiteLink[]>([])

  useEffect(() => {
    supabase
      .from('site_links')
      .select('*')
      .order('order')
      .then(({ data }) => { if (data) setLinks(data) })
  }, [])

  return (
    <section id="find-me-everywhere" className="py-24 px-10 bg-bg">
      <div className="max-w-6xl mx-auto">
        <h2
          className="font-russo text-white uppercase mb-12"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          FIND ME<br />
          <span className="text-cyan">EVERYWHERE</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 border border-cyan/10 bg-surface hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,229,0.1)] transition-all group"
            >
              <span className="text-3xl">{
                link.platform === 'twitch' ? '🟣' :
                link.platform === 'youtube' ? '🔴' :
                link.platform === 'tiktok' ? '⬛' :
                link.platform === 'instagram' ? '🟠' : '🐦'
              }</span>
              <span className="font-chakra font-medium text-sm text-body group-hover:text-cyan transition-colors">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
