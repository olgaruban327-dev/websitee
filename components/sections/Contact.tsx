'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useLang } from '@/lib/LanguageContext'
import { t } from '@/lib/translations'

const EMAIL = 'olgaruban@web.de'

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' })
  const { lang } = useLang()
  const tr = t[lang]
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <section
      ref={ref}
      id="contact"
      className="relative overflow-hidden px-6 py-28 md:py-36"
      style={{ background: '#0a0908' }}
    >
      <div className="absolute -top-24 -left-16 w-[58%] h-[70%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(40,120,200,0.16) 0%, transparent 65%)' }} />
      <div className="absolute -bottom-24 -right-16 w-[55%] h-[65%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(30,160,100,0.14) 0%, transparent 65%)' }} />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="text-caption mb-6"
          style={{ color: 'rgba(158,142,120,0.65)' }}
        >
          {tr.contact_caption}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.12 }}
          className="font-serif font-light mb-6"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
            color: 'var(--color-paper)',
            letterSpacing: '-0.02em',
          }}
        >
          {tr.contact_title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.25 }}
          className="font-serif italic mx-auto mb-14 max-w-xl"
          style={{
            fontSize: 'clamp(1.15rem, 2.6vw, 1.45rem)',
            color: 'rgba(196,168,130,0.72)',
            lineHeight: 1.6,
          }}
        >
          {tr.contact_lead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-lg px-8 py-10"
          style={{
            background: 'rgba(196,168,130,0.05)',
            border: '1px solid rgba(196,168,130,0.18)',
          }}
        >
          <div className="mb-6 flex justify-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                border: '1px solid rgba(196,168,130,0.28)',
                background: 'rgba(196,168,130,0.08)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="6" width="18" height="12" rx="1.5" stroke="#c8ad86" strokeWidth="1.4" />
                <path d="M4 7.5 12 13l8-5.5" stroke="#c8ad86" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <p
            className="mb-3"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(158,142,120,0.7)',
            }}
          >
            {tr.hero_eyebrow}
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="font-serif inline-block mb-8 transition-colors duration-300 hover:text-[var(--color-warm)]"
            style={{
              fontSize: 'clamp(1.35rem, 3.4vw, 1.85rem)',
              fontWeight: 300,
              color: 'var(--color-paper)',
              letterSpacing: '0.01em',
            }}
          >
            {EMAIL}
          </a>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center px-7 py-3 transition-all duration-300"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#f0ebe0',
                border: '1px solid rgba(196,168,130,0.45)',
                background: 'rgba(196,168,130,0.14)',
              }}
            >
              {tr.contact_write}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center justify-center px-7 py-3 transition-all duration-300"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: copied ? '#c8ad86' : 'rgba(240,235,224,0.7)',
                border: '1px solid rgba(196,168,130,0.22)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {copied ? tr.contact_copied : EMAIL}
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.55 }}
          className="font-serif italic mx-auto mt-12 max-w-xl"
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.08rem)',
            color: 'rgba(196,168,130,0.55)',
            lineHeight: 1.7,
          }}
        >
          {tr.copyright_rights}
        </motion.p>
      </div>
    </section>
  )
}
