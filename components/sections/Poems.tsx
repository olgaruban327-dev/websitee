'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import FadeIn from '@/components/ui/FadeIn'
import { useLang } from '@/lib/LanguageContext'
import { t } from '@/lib/translations'
import { useAdmin } from '@/lib/AdminContext'

interface Poem {
  id: number
  title: string
  text: string
  date: string
}

export default function Poems() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' })
  const [poems, setPoems] = useState<Poem[]>([])
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newText, setNewText] = useState('')
  const { lang } = useLang()
  const { isAdmin } = useAdmin()

  // Загрузка стихов
  useEffect(() => {
    fetch('/api/poems')
      .then(res => res.json())
      .then(data => setPoems(data.poems || []))
      .catch(console.error)
  }, [])

  const handleAddPoem = async () => {
    if (!newTitle.trim() || !newText.trim()) return

    try {
      const res = await fetch('/api/poems', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, text: newText }),
      })

      if (res.ok) {
        const data = await res.json()
        setPoems([...poems, data.poem])
        setNewTitle('')
        setNewText('')
        setShowAddModal(false)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Не удалось сохранить стихотворение')
      }
    } catch (error) {
      console.error('Error adding poem:', error)
    }
  }

  const handleDeletePoem = async (id: number) => {
    if (!confirm('Удалить это стихотворение?')) return

    try {
      const res = await fetch(`/api/poems?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        setPoems(poems.filter(p => p.id !== id))
        if (selectedPoem?.id === id) setSelectedPoem(null)
      }
    } catch (error) {
      console.error('Error deleting poem:', error)
    }
  }

  return (
    <section ref={ref} id="poems" className="bg-[#0d0b09] py-24 px-8 md:px-16 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <FadeIn>
          <div className="flex items-center justify-center gap-5 mb-6">
            <h2 className="font-serif font-light text-center"
              style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', color: 'var(--color-paper)' }}>
              {lang === 'ru' ? 'Стихи' : lang === 'en' ? 'Poems' : 'Gedichte'}
            </h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                aria-label={lang === 'ru' ? 'Добавить стихотворение' : lang === 'en' ? 'Add poem' : 'Gedicht hinzufügen'}
                title={lang === 'ru' ? 'Добавить стихотворение' : lang === 'en' ? 'Add poem' : 'Gedicht hinzufügen'}
                className="flex items-center justify-center w-12 h-12 rounded-full shrink-0
                  border border-[rgba(196,168,130,0.45)] bg-[rgba(196,168,130,0.12)]
                  hover:bg-[rgba(196,168,130,0.24)] hover:border-[rgba(196,168,130,0.75)]
                  transition-all duration-300"
              >
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="rgba(196,168,130,0.95)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          <p
            className="mx-auto mb-16 max-w-2xl text-center font-serif italic"
            style={{
              fontSize: 'clamp(0.98rem, 2.2vw, 1.15rem)',
              color: 'rgba(196,168,130,0.72)',
              lineHeight: 1.7,
            }}
          >
            {t[lang].copyright_rights}
          </p>
        </FadeIn>

        {/* Список стихов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map((poem, i) => (
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08 }}
              onClick={() => setSelectedPoem(poem)}
              className="group relative p-6 cursor-pointer
                bg-[rgba(26,22,18,0.65)] border border-[rgba(196,168,130,0.12)]
                hover:bg-[rgba(56,140,200,0.06)] hover:border-[rgba(100,165,220,0.28)]
                transition-all duration-400 rounded-sm"
            >
              <h3 className="font-serif text-xl mb-3 text-[var(--color-paper)] group-hover:text-[var(--color-warm)] transition-colors">
                {poem.title}
              </h3>
              <p className="text-sm text-[var(--color-muted)]/60 font-light tracking-wide mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}>
                {new Date(poem.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US')}
              </p>
              <p className="text-[var(--color-muted)]/80 line-clamp-3 text-sm leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {poem.text}
              </p>

              {/* Кнопка удалить для админа */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePoem(poem.id)
                  }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full
                    bg-red-500/10 border border-red-500/30
                    hover:bg-red-500/20 hover:border-red-500/50
                    flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <span className="text-red-400 text-sm">×</span>
                </button>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-warm)]/0 to-transparent group-hover:via-[var(--color-warm)]/40 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Пустое состояние */}
        {poems.length === 0 && (
          <FadeIn delay={0.3}>
            <p className="text-center text-[var(--color-muted)]/70 italic font-serif"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {lang === 'ru' ? 'Пока нет стихотворений...' : lang === 'en' ? 'No poems yet...' : 'Noch keine Gedichte...'}
            </p>
          </FadeIn>
        )}
      </div>

      {/* Модальное окно просмотра */}
      <AnimatePresence>
        {selectedPoem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedPoem(null)}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-sm p-8
                bg-gradient-to-b from-[#0d0b09] to-[#121010]
                border border-[rgba(196,168,130,0.25)]"
            >
              <button
                onClick={() => setSelectedPoem(null)}
                className="absolute top-6 right-6 text-3xl text-[var(--color-muted)] hover:text-[var(--color-paper)] transition-colors"
              >
                ×
              </button>

              <h2 className="font-serif text-3xl md:text-4xl mb-6 text-[var(--color-paper)] pr-8">
                {selectedPoem.title}
              </h2>

              <p className="text-sm text-[var(--color-muted)]/60 mb-8 tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif' }}>
                {new Date(selectedPoem.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              <div className="whitespace-pre-wrap text-[var(--color-paper)]/90 leading-loose text-lg"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {selectedPoem.text}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно добавления */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-xl rounded-sm overflow-hidden
                bg-gradient-to-b from-[#0d0b09] to-[#121010]
                border border-[rgba(196,168,130,0.25)]"
            >
              <div className="px-8 py-6 border-b border-[rgba(196,168,130,0.15)]">
                <h3 className="font-serif text-2xl text-[var(--color-paper)]">
                  {lang === 'ru' ? 'Добавить стихотворение' : lang === 'en' ? 'Add Poem' : 'Gedicht hinzufügen'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-6 right-8 text-3xl text-[var(--color-muted)] hover:text-[var(--color-paper)] transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="px-8 py-6 space-y-5">
                <div>
                  <label className="block mb-2 text-sm text-[var(--color-warm)] tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif' }}>
                    {lang === 'ru' ? 'Название' : lang === 'en' ? 'Title' : 'Titel'}
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm
                      bg-[rgba(0,0,0,0.3)] border border-[rgba(196,168,130,0.20)]
                      text-[var(--color-paper)] placeholder:text-[var(--color-muted)]/40
                      focus:border-[rgba(196,168,130,0.50)] focus:outline-none transition-colors"
                    placeholder={lang === 'ru' ? 'Название стихотворения...' : lang === 'en' ? 'Poem title...' : 'Gedichttitel...'}
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem' }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-[var(--color-warm)] tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif' }}>
                    {lang === 'ru' ? 'Текст' : lang === 'en' ? 'Text' : 'Text'}
                  </label>
                  <textarea
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 rounded-sm
                      bg-[rgba(0,0,0,0.3)] border border-[rgba(196,168,130,0.20)]
                      text-[var(--color-paper)] placeholder:text-[var(--color-muted)]/40
                      focus:border-[rgba(196,168,130,0.50)] focus:outline-none transition-colors
                      resize-none"
                    placeholder={lang === 'ru' ? 'Текст стихотворения...' : lang === 'en' ? 'Poem text...' : 'Gedichttext...'}
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', lineHeight: 1.7 }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-5 py-3 rounded-sm border border-[rgba(196,168,130,0.25)]
                      text-[var(--color-muted)] hover:text-[var(--color-paper)] hover:border-[rgba(196,168,130,0.40)]
                      transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', letterSpacing: '0.05em' }}
                  >
                    {lang === 'ru' ? 'Отмена' : lang === 'en' ? 'Cancel' : 'Abbrechen'}
                  </button>
                  <button
                    onClick={handleAddPoem}
                    disabled={!newTitle.trim() || !newText.trim()}
                    className="flex-1 px-5 py-3 rounded-sm
                      bg-gradient-to-r from-[rgba(196,168,130,0.20)] to-[rgba(196,168,130,0.30)]
                      border border-[rgba(196,168,130,0.40)]
                      text-[var(--color-paper)] hover:from-[rgba(196,168,130,0.30)] hover:to-[rgba(196,168,130,0.40)]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', letterSpacing: '0.05em' }}
                  >
                    {lang === 'ru' ? 'Добавить' : lang === 'en' ? 'Add' : 'Hinzufügen'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
