import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  initLenis, initHeroParallax, initScrollAnimations,
  initScrollProgress, initSectionBgParallax, initLineGrow, initHeadingReveal,
  destroyAnimations,
} from './animations'

gsap.registerPlugin(ScrollTrigger)

const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'
const ACCENT = 'linear-gradient(90deg, #E40014 0%, #FB2C36 100%)'
const WEB3FORMS_KEY = '9f92669a-aa40-4112-98a0-2bae71b40cab'
const LOGO_URL = '/logo.png?v=4'

function SectionBg({ src, opacity = 0.28, position = 'right', overlay = 1 }: { src: string; opacity?: number; position?: 'left' | 'right' | 'center'; overlay?: number }) {
  const pos = position === 'left' ? 'left center' : position === 'center' ? 'center' : 'right center'
  const o = overlay
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="section-parallax-bg absolute inset-0" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: pos, opacity }} />
      <div className="absolute inset-0" style={{ background: position === 'center' ? `radial-gradient(ellipse at center, rgba(255,255,255,0.0) 0%, rgba(255,255,255,${0.35 * o}) 75%)` : `linear-gradient(to right, rgba(255,255,255,${0.52 * o}) 0%, rgba(255,255,255,${0.25 * o}) 55%, rgba(255,255,255,${0.05 * o}) 100%)` }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(255,255,255,${0.45 * o}) 0%, transparent 50%, rgba(255,255,255,${0.05 * o}) 100%)` }} />
    </div>
  )
}

interface ModalData { title: string; tag?: string; img?: string; body: React.ReactNode }

function Modal({ data, onClose }: { data: ModalData; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-4 sm:p-8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative w-full max-w-2xl bg-surface border border-stroke rounded-3xl overflow-hidden"
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
          {data.img && (
            <div className="relative h-52 overflow-hidden">
              <img src={data.img} alt={data.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white text-sm hover:bg-black/70 transition-colors cursor-pointer">✕</button>
            </div>
          )}
          <div className="p-6 sm:p-8">
            {!data.img && (
              <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stroke/50 flex items-center justify-center text-muted text-sm hover:bg-stroke hover:text-text-primary transition-colors cursor-pointer">✕</button>
            )}
            {data.tag && <span className="text-xs uppercase tracking-[0.25em] text-muted mb-3 inline-block">{data.tag}</span>}
            <h2 className="text-2xl sm:text-3xl text-text-primary mb-4 leading-tight" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{data.title}</h2>
            <div className="text-sm text-muted leading-relaxed space-y-4">{data.body}</div>
            <div className="mt-8"><a href="#contact" onClick={onClose} className="inline-block text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: ACCENT }}>Get Started →</a></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const handleEnded = () => onComplete()
    v.addEventListener('ended', handleEnded)
    const fallback = setTimeout(onComplete, 15000)
    return () => { v.removeEventListener('ended', handleEnded); clearTimeout(fallback) }
  }, [onComplete])

  return (
    <motion.div className="fixed inset-0 z-[9999] bg-black overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-contain md:object-cover object-center"
        src="/loading.mp4"
      />
    </motion.div>
  )
}

function FadeIn({ children, delay = 0, duration = 1000, className = '' }: { children: React.ReactNode; delay?: number; duration?: number; className?: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div className={`transition-opacity ${className}`} style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  )
}

function AnimatedHeading({ text, className = '' }: { text: string; className?: string }) {
  const [animated, setAnimated] = useState(false)
  const charDelay = 30
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])
  const lines = text.split('\n')
  let globalCharIdx = 0
  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, li) => {
        const words = line.split(' ')
        return (
          <span key={li} style={{ display: 'block' }}>
            {words.map((word, wi) => {
              const wordChars = word.split('')
              const wordEl = (
                <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                  {wordChars.map((char, ci) => {
                    const delay = globalCharIdx * charDelay
                    globalCharIdx++
                    return (
                      <span key={ci} style={{ display: 'inline-block', opacity: animated ? 1 : 0, transform: animated ? 'translateX(0)' : 'translateX(-18px)', transition: 'opacity 500ms, transform 500ms', transitionDelay: `${delay}ms` }}>
                        {char}
                      </span>
                    )
                  })}
                </span>
              )
              return wi < words.length - 1 ? <span key={wi}>{wordEl}{'\u00A0'}</span> : wordEl
            })}
          </span>
        )
      })}
    </h1>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Services', 'Pricing', 'About', 'Contact']

function Hero() {
  const [taxHov, setTaxHov] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <section id="home" className="relative h-screen flex flex-col overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover hero-parallax-video" src={HERO_VIDEO} />

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: 'rgba(0,0,0,0.96)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <a href="#home" onClick={() => setMenuOpen(false)}>
                <img src={LOGO_URL} alt="Alliance Street" className="h-12 w-auto object-contain" />
              </a>
              <button onClick={() => setMenuOpen(false)} className="text-white p-2" aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-3xl font-light text-white py-3 border-b border-white/10"
                  style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  {link}
                </motion.a>
              ))}
              <motion.a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-6 text-center text-white py-4 rounded-xl font-medium"
                style={{ background: ACCENT }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              >
                Book Free Call
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 px-4 md:px-12 lg:px-16 pt-4 md:pt-6">
        <nav className="liquid-glass rounded-xl px-3 md:px-4 py-2 flex items-center justify-between">
          <a href="#home" className="flex items-center"><img src={LOGO_URL} alt="Alliance Street Accountancy Ltd" className="h-10 md:h-14 w-auto object-contain" /></a>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-white hover:text-gray-300 transition-colors duration-200">{link}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href="#contact" className="hidden sm:inline-block text-white px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200" style={{ background: ACCENT }}>Book Free Call</a>
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 text-white"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </nav>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end px-5 md:px-12 lg:px-16 pb-10 md:pb-12 lg:pb-16">
        <div className="max-w-4xl">
          <AnimatedHeading text={"Finance and Accounting Built\nfor International Growth"} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-normal text-white mb-4" />
          <FadeIn delay={800} duration={1000}>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-5 max-w-2xl">
              Tax structuring and advisory with international expertise — UK & HMRC compliance, UAE restructuring, bookkeeping, and corporate tax. Built for founders, limited companies, and ambitious entrepreneurs.
            </p>
          </FadeIn>
          <FadeIn delay={1200} duration={1000}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a href="#contact" className="text-center text-white px-7 py-3 rounded-lg font-medium btn-press" style={{ background: ACCENT }}>Book Free Consultation</a>
              <button
                className="liquid-glass border border-white/20 text-white px-7 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200"
                style={{ backgroundColor: taxHov ? 'white' : undefined, color: taxHov ? 'black' : undefined }}
                onMouseEnter={() => setTaxHov(true)} onMouseLeave={() => setTaxHov(false)}>
                Get Free Tax Review
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// ── Trust ─────────────────────────────────────────────────────────────────────
function Trust() {
  const badges = [{ value: '200+', label: 'UK Businesses Served' }, { value: '4.9/5', label: 'Average Client Rating' }, { value: '100%', label: 'On-Time HMRC Filings' }]
  return (
    <section className="bg-bg py-14 border-b border-stroke">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.p className="text-center text-muted text-xs uppercase tracking-[0.25em] mb-5"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Trusted by UK limited companies, agencies, and freelancers
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
          {badges.map((b, i) => (
            <motion.div key={b.label} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 text-left sm:text-center py-3 sm:py-0 border-b sm:border-b-0 border-stroke last:border-0"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <p className="text-4xl sm:text-3xl md:text-5xl text-text-primary font-light sm:mb-1 shrink-0" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{b.value}</p>
              <p className="text-xs text-muted uppercase tracking-[0.2em]">{b.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ── Solution ──────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  'Cloud bookkeeping on Xero, QuickBooks or FreeAgent',
  'Quarterly MTD-compliant VAT returns',
  'Payroll, PAYE, RTI & auto-enrolment pensions',
  'Year-end accounts & corporation tax (CT600)',
  'Quarterly management reports & KPI dashboards',
  'Strategic tax planning, not just compliance',
  'A dedicated accountant — same person, every month',
]

function Solution() {
  return (
    <section className="relative overflow-hidden bg-surface/30 py-10 md:py-14 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80&auto=format&fit=crop" opacity={0.55} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Our Solution</span></div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
            <div>
              <h2 className="gsap-heading-reveal text-3xl md:text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>
                We handle your numbers — so you can run your business
              </h2>
              <p className="text-muted text-base md:text-lg leading-relaxed text-pretty">
                From your first invoice to your year-end filing, our UK team delivers accurate accounting, proactive tax planning, and the kind of straight-talking advice that actually moves your business forward.
              </p>
            </div>
            <div className="mt-5 lg:mt-0 space-y-4">
              {SOLUTION_ITEMS.map((item, i) => (
                <motion.div key={i} className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: ACCENT }}>✓</span>
                  <p className="text-text-primary text-sm">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Why Choose Us ─────────────────────────────────────────────────────────────
const WHY_POINTS = [
  { title: 'A dedicated UK accountant', desc: 'One named expert who knows your business — not a call centre or rotating junior.' },
  { title: 'Fixed monthly pricing', desc: 'Know exactly what you pay every month. No hourly meters, no surprise invoices.' },
  { title: '24-hour response promise', desc: 'Real answers from your accountant within one working day, every working day.' },
  { title: 'Cloud-first by default', desc: 'Xero, QuickBooks or FreeAgent included — and the licence stays in your name.' },
  { title: 'Proactive tax planning', desc: 'We hunt for legitimate savings year-round, not the week before deadline.' },
  { title: 'No long-term contracts', desc: 'Roll monthly. Stay because we are worth it, not because you are locked in.' },
]

function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-bg py-10 md:py-14 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop" opacity={0.52} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Why Choose Us</span></div>
          <h2 className="gsap-heading-reveal text-3xl md:text-5xl text-text-primary mb-6" style={{ fontFamily: "'Instrument Serif',serif" }}>
            Why UK businesses <em>choose us</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_POINTS.map((p, i) => (
              <motion.div key={i} className="p-6 bg-surface/50 border border-stroke rounded-2xl hover:border-gray-400 transition-all duration-300 hover-lift"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <span className="inline-block text-xs font-medium text-white px-3 py-1 rounded-full mb-4" style={{ background: ACCENT }}>0{i + 1}</span>
                <h3 className="text-text-primary font-medium text-sm mb-2">{p.title}</h3>
                <p className="text-muted text-xs leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────
const TEAM_VALUES = [
  {
    title: 'Integrity first',
    desc: 'We tell you what you need to hear, not just what you want to hear. Honest advice, transparent fees — always.',
  },
  {
    title: 'Proactive, not reactive',
    desc: 'We plan ahead, flag risks early, and hunt for savings year-round rather than scrambling at year-end.',
  },
  {
    title: 'International perspective',
    desc: 'With expertise across UK, UAE and multiple markets, we help founders structure efficiently wherever they operate.',
  },
  {
    title: 'Plain English, always',
    desc: 'No jargon. No confusing reports. We explain your numbers in language that actually helps you make decisions.',
  },
  {
    title: 'Fixed fees, no surprises',
    desc: 'You know your monthly cost on day one. No hidden charges, no hourly meters, no shock invoices.',
  },
  {
    title: 'Long-term partnership',
    desc: 'We grow with you. From your first invoice to your Series A, your dedicated accountant knows your business inside out.',
  },
]

const ACCREDITATIONS = [
  { label: 'HMRC Registered Agent', note: 'Authorised to act on behalf of UK businesses with HMRC' },
  { label: 'ICAEW Affiliated Practice', note: 'Committed to the highest standards of professional conduct' },
  { label: 'Xero Gold Partner', note: 'Certified experts in cloud-based accounting for modern businesses' },
  { label: 'QuickBooks Pro Advisor', note: 'Fully certified across the QuickBooks product suite' },
]

function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-bg py-10 md:py-20 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80&auto=format&fit=crop" opacity={0.45} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="gsap-line-grow w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">About Us</span>
          </div>

          {/* Two-column intro */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start mb-12 md:mb-16">
            <div>
              <h2 className="gsap-heading-reveal text-3xl md:text-5xl text-text-primary mb-6 leading-tight" style={{ fontFamily: "'Instrument Serif',serif" }}>
                The team behind <em>your numbers</em>
              </h2>
              <p className="text-muted text-base md:text-lg leading-relaxed mb-4">
                Alliance Street Accountancy was founded on a simple belief: UK businesses deserve an accountant who actually cares about their growth — not just their compliance deadlines.
              </p>
              <p className="text-muted text-sm leading-relaxed mb-4">
                Based in Basildon, Essex, we serve limited companies, agencies, freelancers, and founder-led businesses across the UK and internationally. From your first invoice to complex multi-jurisdiction structures, our team brings deep technical expertise alongside the kind of straight-talking communication that makes accounting feel less like a burden and more like a business advantage.
              </p>
              <p className="text-muted text-sm leading-relaxed">
                We combine cloud-first tools — Xero, QuickBooks, FreeAgent — with human expertise to give you real-time visibility into your business finances, not just a once-a-year report. Our clients average over £12,000 in annual tax savings, and across our entire portfolio, we have never missed an HMRC deadline.
              </p>
            </div>

            {/* Stats + Accreditations */}
            <div className="mt-8 lg:mt-0 space-y-5">
              {/* Founded / size callouts */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '2018', label: 'Year founded' },
                  { value: '200+', label: 'Active UK clients' },
                  { value: 'Essex', label: 'Headquartered in' },
                  { value: 'Global', label: 'International reach' },
                ].map((s, i) => (
                  <motion.div key={s.label}
                    className="p-5 bg-surface/50 border border-stroke rounded-2xl hover-lift"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                    <p className="text-2xl md:text-3xl font-light text-text-primary mb-1" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{s.value}</p>
                    <p className="text-xs text-muted uppercase tracking-[0.2em]">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Accreditations */}
              <div className="p-6 bg-surface/50 border border-stroke rounded-2xl">
                <p className="text-xs text-muted uppercase tracking-[0.25em] mb-4">Accreditations & Memberships</p>
                <ul className="space-y-3">
                  {ACCREDITATIONS.map((a, i) => (
                    <motion.li key={a.label} className="flex items-start gap-3"
                      initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white" style={{ background: ACCENT }}>✓</span>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{a.label}</p>
                        <p className="text-muted text-xs leading-relaxed">{a.note}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Values grid */}
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.3em] mb-6">Our Values</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TEAM_VALUES.map((v, i) => (
                <motion.div key={v.title}
                  className="p-6 bg-surface/50 border border-stroke rounded-2xl hover-lift"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                  <h3 className="text-text-primary font-medium text-sm mb-2">{v.title}</h3>
                  <p className="text-muted text-xs leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}

// ── Results ───────────────────────────────────────────────────────────────────
const RESULTS = [
  { value: '£12,400+', label: 'Average annual tax saved', desc: 'Per limited company, through proactive planning, R&D claims and dividend optimisation.' },
  { value: 'Zero', label: 'Late filing penalties this year', desc: 'Across our entire UK client portfolio — not a single missed HMRC deadline.' },
  { value: '24h', label: 'Average response time', desc: 'Most client queries answered the same working day, in plain English.' },
]

function Results() {
  return (
    <section className="relative overflow-hidden bg-surface/30 py-10 md:py-14 px-6 border-b border-stroke">
      <SectionBg src="/results-bg.png?v=2" opacity={0.95} position="right" overlay={0.5} />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-white/60" /><span className="text-xs uppercase tracking-[0.3em] font-semibold text-white">Real Results</span></div>
          <h2 className="text-3xl md:text-5xl mb-6" style={{ fontFamily: "'Instrument Serif',serif", color: '#fff' }}>
            Real results for growing <em style={{ color: '#FB2C36' }}>UK businesses</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESULTS.map((r, i) => (
              <motion.div key={i} className="p-8 border border-stroke rounded-3xl hover-lift" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
                <p className="text-4xl md:text-5xl mb-2" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: '#111' }}>{r.value}</p>
                <p className="text-sm font-medium mb-2" style={{ color: '#111' }}>{r.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#333' }}>{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────
const ServiceBody = ({ intro, features, note }: { intro: string; features: string[]; note?: string }) => (
  <>
    <p>{intro}</p>
    <div>
      <p className="text-text-primary font-medium mb-3">What's included:</p>
      <ul className="space-y-2">
        {features.map(item => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ background: ACCENT }}>✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
    {note && <p className="text-xs border-t border-stroke pt-4 text-muted/70">{note}</p>}
  </>
)

const SERVICES_DATA = [
  {
    name: 'Bookkeeping', tag: 'Bookkeeping UK',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop',
    desc: 'Accurate, real-time bookkeeping to keep your finances organised and up to date.',
    body: <ServiceBody
      intro="We handle all your day-to-day bookkeeping on cloud platforms like Xero and QuickBooks, so you always have a clear, real-time picture of your finances — no backlogs, no guesswork, no month-end panic."
      features={[
        'Daily transaction recording & bank reconciliation',
        'Accounts receivable & payable management',
        'Expense categorisation and receipt capture',
        'Monthly management reports & cash flow summaries',
        'Xero, QuickBooks & FreeAgent certified support',
        'Making Tax Digital (MTD) compliant records',
        'Dedicated bookkeeper as your single point of contact',
      ]}
      note="Plans start from £99/month. Typical onboarding and historic catch-up completed within 7–10 working days."
    />
  },
  {
    name: 'VAT Services', tag: 'VAT Services UK',
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&q=80&auto=format&fit=crop',
    desc: 'Stress-free VAT registration and returns, fully compliant with UK regulations.',
    body: <ServiceBody
      intro="From initial VAT registration to quarterly returns, we ensure you're fully Making Tax Digital compliant, on the right scheme for your business, and never miss an HMRC deadline."
      features={[
        'VAT registration & de-registration with HMRC',
        'Quarterly MTD-compliant VAT return preparation & filing',
        'Scheme review: Flat Rate, Cash, Annual & Standard',
        'EC Sales Lists & reverse charge guidance',
        'Import/export VAT and post-Brexit compliance',
        'HMRC enquiry and VAT inspection support',
        'Proactive reminders so you never miss a deadline',
      ]}
      note="VAT returns from £75 per quarter. Registration handled within 2–3 weeks of instruction."
    />
  },
  {
    name: 'Payroll', tag: 'Payroll Management',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop',
    desc: 'Reliable payroll management, ensuring your team is paid correctly and on time.',
    body: <ServiceBody
      intro="We manage your full payroll end-to-end — weekly, fortnightly, or monthly — including PAYE, RTI submissions, auto-enrolment pension duties, and branded payslips. Every pay run, on time, every time."
      features={[
        'PAYE registration and full RTI submissions to HMRC',
        'Digital payslips and P60s/P45s for every employee',
        'Auto-enrolment pension setup & ongoing compliance',
        'Statutory pay calculations (SSP, SMP, SPP, holiday)',
        'CIS returns for construction industry contractors',
        'Year-end reporting and P11D benefits in kind',
        'Employee self-service portal for payslips & documents',
      ]}
      note="From £4 per payslip. Unlimited employee changes included. No setup fees for new clients."
    />
  },
  {
    name: 'Corporation Tax', tag: 'Tax Filing UK',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80&auto=format&fit=crop',
    desc: 'Smart tax planning and compliant filings to minimise your liabilities.',
    body: <ServiceBody
      intro="We prepare and file your corporation tax return (CT600) while proactively identifying every legitimate saving — so you only pay what you legally owe, and often a lot less than you expected."
      features={[
        'Statutory accounts preparation under FRS 102/105',
        'CT600 corporation tax return filing with HMRC',
        'Companies House accounts filing & confirmation statement',
        'R&D tax credit claims for eligible innovators',
        'Capital allowances & Annual Investment Allowance optimisation',
        'Director remuneration & dividend planning',
        'Year-round tax planning, not just a year-end scramble',
      ]}
      note="Fixed-fee engagements from £450 per year. Free tax review for new clients — often saves more than our fee."
    />
  },
  {
    name: 'Virtual CFO', tag: 'Strategic Advisory',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80&auto=format&fit=crop',
    desc: 'Strategic financial guidance to help you scale your business with confidence.',
    body: <ServiceBody
      intro="Get CFO-level insight without the £100k+ salary. We become an extension of your leadership team — translating numbers into decisions, stress-testing plans, and helping you scale sustainably."
      features={[
        '13-week rolling cash flow forecasts & scenario modelling',
        'Monthly KPI dashboards tailored to your business model',
        'Budgeting, financial planning & management reporting',
        'Fundraising, loan and investor-readiness support',
        'Pricing, margin and profitability analysis',
        'Board-level strategic reviews every month',
        'Exit planning and business valuation guidance',
      ]}
      note="Retainers from £750/month. Ideal for businesses turning over £500k–£10m ready to scale."
    />
  },
  {
    name: 'Company Formation', tag: 'UK Accounting',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80&auto=format&fit=crop',
    desc: 'Start your UK business the right way with expert setup and support.',
    body: <ServiceBody
      intro="We register your UK company at Companies House, set up your tax accounts, and make sure you're ready to trade from day one — with the right structure, the right registrations, and no costly mistakes."
      features={[
        'Companies House incorporation (same-day available)',
        'Registered office & director service address',
        'Share structure advice and Memorandum & Articles',
        'HMRC registration: Corporation Tax, PAYE, VAT',
        'Business bank account introductions (Tide, Starling, Revolut)',
        'Xero or QuickBooks setup with chart of accounts',
        'Post-formation onboarding call with your accountant',
      ]}
      note="Formation packages from £99 — often free when you sign up for ongoing accounting. Trading-ready in 24 hours."
    />
  },
]

function Services() {
  const [modal, setModal] = useState<ModalData | null>(null)
  return (
    <section id="services" className="bg-bg py-16 md:py-24 border-b border-stroke">
      {modal && <Modal data={modal} onClose={() => setModal(null)} />}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-3"><div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Accounting Services UK</span></div>
          <h2 className="gsap-heading-reveal text-3xl md:text-5xl text-text-primary" style={{ fontFamily: "'Instrument Serif',serif" }}>Accounting services that <em>keep you compliant & growing</em></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_DATA.map((svc, i) => (
            <motion.div key={svc.name}
              className="group relative rounded-3xl overflow-hidden cursor-pointer border border-stroke hover:border-gray-400 transition-all duration-300 hover-lift"
              onClick={() => setModal({ title: svc.name, tag: svc.tag, img: svc.img, body: svc.body })}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, delay: i * 0.1 }}>
              <div className="relative h-40 overflow-hidden">
                <img src={svc.img} alt={svc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="p-6 bg-surface/50">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted mb-2">{svc.tag}</p>
                <h3 className="text-text-primary font-semibold mb-2">{svc.name}</h3>
                <p className="text-muted text-xs leading-relaxed">{svc.desc}</p>
                <p className="text-xs text-muted/60 mt-3 group-hover:text-text-primary transition-colors">Learn more →</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  { name: 'Starter', price: 'From £99/month', popular: false, features: ['For sole traders & micro-companies', 'Cloud bookkeeping', 'Self-assessment OR Corporation Tax', 'VAT returns (if registered)', 'Email support, 1 working day reply'] },
  { name: 'Growth', price: 'From £199/month', popular: true, features: ['For limited companies & agencies', 'Everything in Starter', 'Monthly payroll (up to 5 staff)', 'Quarterly tax-planning calls', 'Management reports & KPIs', 'Priority WhatsApp support'] },
  { name: 'Scale', price: 'Custom pricing', popular: false, features: ['For VC-backed startups & £1m+ businesses', 'Everything in Growth', 'Virtual CFO & cash-flow forecasting', 'R&D tax credit claims', 'EMI scheme & investor reporting', 'Dedicated finance partner'] },
]

function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-10 md:py-14 px-6" style={{ background: 'hsl(0 0% 4%)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=1600&q=80&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'right center', opacity: 0.25 }} />
      </div>
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px" style={{ background: 'hsl(0 0% 60%)' }} /><span className="text-xs uppercase tracking-[0.3em]" style={{ color: 'hsl(0 0% 80%)' }}>Transparent Pricing</span></div>
          <h2 className="gsap-heading-reveal text-3xl md:text-5xl mb-6" style={{ fontFamily: "'Instrument Serif',serif", color: 'hsl(0 0% 95%)' }}>Transparent pricing — <em>no surprises, ever</em></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name}
                className="relative p-8 rounded-3xl border transition-all duration-300"
                style={{ background: plan.popular ? 'hsl(0 0% 12%)' : 'hsl(0 0% 9%)', borderColor: plan.popular ? 'hsl(0 0% 28%)' : 'hsl(0 0% 18%)' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-4 py-1 rounded-full font-medium" style={{ background: ACCENT, color: '#fff' }}>Most Popular</span>
                )}
                <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: 'hsl(0 0% 50%)' }}>{plan.name} Plan</p>
                <p className="text-2xl md:text-3xl mb-6" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: 'hsl(0 0% 95%)' }}>{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm" style={{ color: 'hsl(0 0% 65%)' }}>
                      <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white" style={{ background: ACCENT }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact"
                  className="block text-center py-3 rounded-xl text-sm font-medium transition-colors duration-200"
                  style={{ background: ACCENT, color: '#fff' }}>
                  {plan.name === 'Scale' ? 'Get a Quote' : 'Get Started'}
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-surface/30 py-10 md:py-14 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80&auto=format&fit=crop" opacity={0.55} position="center" />
      <div className="relative z-10 max-w-[800px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Get Started</span><div className="gsap-line-grow w-8 h-px bg-stroke" />
          </div>
          <h2 className="gsap-heading-reveal text-4xl md:text-6xl text-text-primary mb-6 leading-tight" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>
            Ready to take accounting off your plate?
          </h2>
          <p className="text-muted text-base md:text-lg mb-5 max-w-lg mx-auto">
            Book a free 30-minute call. No obligation — just clear answers about your numbers, where you're overpaying, and what we'd do differently.
          </p>
          <a href="#contact" className="inline-block text-white px-10 py-4 rounded-xl font-medium text-base transition-colors duration-200" style={{ background: ACCENT }}>
            Book Your Free Call →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ── Reviews & Comments ────────────────────────────────────────────────────────
interface Review { name: string; role: string; rating: number; quote: string; initials: string }
const SEED_REVIEWS: Review[] = [
  { name: 'James Whitford', role: 'Founder, Halo Studios — Marketing Agency', rating: 5, quote: 'Switched to Alliance Street last year and it was night and day. Same-day replies, no surprise invoices, and they spotted £8k of allowable expenses my old accountant had missed.', initials: 'JW' },
  { name: 'Priya Shah', role: 'Director, Verdant Trade Ltd — eCommerce', rating: 5, quote: 'Filed our first VAT return three days after onboarding. The team handles Xero, Shopify reconciliations and our quarterly review without me chasing once.', initials: 'PS' },
  { name: 'Daniel Okafor', role: 'CEO, Northstack — SaaS Startup', rating: 5, quote: 'They got us R&D credits we did not know we qualified for, set up EMI options for the team, and our accounts are now investor-ready. Worth every penny.', initials: 'DO' },
  { name: 'Sophie Marlow', role: 'Sole Trader — Independent Consultant', rating: 5, quote: 'I needed someone who would actually pick up the phone. Alliance Street replies within hours and explains everything in plain English. Massive relief.', initials: 'SM' },
  { name: 'Rajiv Mehta', role: 'Co-founder, Brick & Bloom — Hospitality', rating: 5, quote: 'Three restaurants, fifteen staff, and our payroll has run flawlessly for nine months straight. They also restructured our director pay and saved us tax.', initials: 'RM' },
  { name: 'Chloe Bennett', role: 'Founder, Loom Atelier — Limited Company', rating: 5, quote: 'Honest pricing, proper advice, and they actually care about how the business is doing. Best accountant I have worked with in a decade of self-employment.', initials: 'CB' },
]

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'text-base' : 'text-sm'
  return (
    <div className={`flex gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#FBBF24' : 'hsl(0 0% 80%)' }}>★</span>
      ))}
    </div>
  )
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS)
  const [form, setForm] = useState({ name: '', role: '', rating: 5, quote: '' })
  const [submitted, setSubmitted] = useState(false)

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.quote.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Review from ${form.name.trim()} — ${form.rating} stars`,
          from_name: 'Alliance Street Website — Reviews',
          name: form.name.trim(),
          business_role: form.role.trim() || 'N/A',
          rating: `${form.rating} / 5`,
          message: form.quote.trim(),
        }),
      })
      const result = await res.json()
      if (!result.success) {
        console.error('Web3Forms error:', result)
        setError(result.message || 'Could not send review. Please try again.')
        setSending(false)
        return
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please check your connection and try again.')
      setSending(false)
      return
    }
    const initials = form.name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || 'AS'
    setReviews(prev => [{ name: form.name.trim(), role: form.role.trim() || 'Verified Client', rating: form.rating, quote: form.quote.trim(), initials }, ...prev])
    setForm({ name: '', role: '', rating: 5, quote: '' })
    setSubmitted(true)
    setSending(false)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section id="reviews" className="bg-bg py-10 md:py-14 px-6 border-b border-stroke">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Client Reviews</span></div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <h2 className="gsap-heading-reveal text-3xl md:text-5xl text-text-primary" style={{ fontFamily: "'Instrument Serif',serif" }}>What our clients <em>say about us</em></h2>
            <div className="flex items-center gap-3">
              <StarRow rating={5} size="md" />
              <span className="text-sm text-muted"><span className="text-text-primary font-medium">4.9 / 5</span> · {reviews.length} reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {reviews.map((r, i) => (
              <motion.div key={r.name + i} className="p-6 bg-surface/50 border border-stroke rounded-2xl flex flex-col hover-lift"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 5) * 0.08, duration: 0.5 }}>
                <StarRow rating={r.rating} />
                <p className="text-text-primary text-sm leading-relaxed my-4 flex-1">"{r.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stroke">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ background: ACCENT }}>{r.initials}</div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{r.name}</p>
                    <p className="text-muted text-xs">{r.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-3xl border border-stroke bg-surface/30 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-2"><div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Leave a Review</span></div>
            <h3 className="text-2xl md:text-3xl text-text-primary mb-2" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>Share your experience</h3>
            <p className="text-muted text-sm mb-6">Worked with Alliance Street? We would love to hear how it went.</p>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">Your Name</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-gray-600 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">Business / Role <span className="opacity-50 normal-case tracking-normal">(optional)</span></label>
                <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="Founder, Acme Ltd"
                  className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-gray-600 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">Rating</label>
                <div className="flex gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}
                      className="cursor-pointer transition-transform hover:scale-110"
                      style={{ color: n <= form.rating ? '#FBBF24' : 'hsl(0 0% 80%)' }}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">Your Review</label>
                <textarea required rows={4} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                  placeholder="Tell us about your experience working with Alliance Street..."
                  className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-gray-600 transition-colors resize-none" />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-muted">Reviews appear instantly here. We may also feature them on our marketing with your permission.</p>
                <button type="submit" disabled={sending} className="text-white px-8 py-3 rounded-xl font-medium text-sm transition-colors duration-200 cursor-pointer disabled:opacity-60" style={{ background: ACCENT }}>
                  {submitted ? 'Thanks — review posted ✓' : sending ? 'Sending…' : 'Submit Review'}
                </button>
              </div>
              {error && <p className="md:col-span-2 text-xs text-red-600">{error}</p>}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Enquiry from ${form.name} — ${form.type}`,
          from_name: 'Alliance Street Website — Get In Touch',
          name: form.name,
          email: form.email,
          phone: form.phone,
          business_type: form.type,
          replyto: form.email,
        }),
      })
      const result = await res.json()
      if (!result.success) {
        console.error('Web3Forms error:', result)
        setError(result.message || 'Could not send message. Please try again.')
        setSending(false)
        return
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please check your connection and try again.')
      setSending(false)
      return
    }
    setSending(false)
    setSent(true)
  }
  return (
    <section id="contact" className="relative overflow-hidden bg-surface/30 py-10 md:py-14 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80&auto=format&fit=crop" opacity={0.55} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="gsap-line-grow w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Get In Touch</span></div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl md:text-5xl text-text-primary mb-4" style={{ fontFamily: "'Instrument Serif',serif" }}>
                Let's talk about <em>your business</em>
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-8">Send us a message or book a free strategy call. We reply within one working day — every working day.</p>
              <div className="space-y-3">
                <a href="mailto:accounts@alliancestreet.co.uk" className="flex items-center gap-3 text-sm text-muted hover:text-text-primary transition-colors"><span className="text-[10px] uppercase tracking-[0.2em] w-14">Email</span> accounts@alliancestreet.co.uk</a>
                <p className="flex items-start gap-3 text-sm text-muted"><span className="text-[10px] uppercase tracking-[0.2em] w-14 shrink-0 mt-1">Office</span> Pine Tree House, Gardiners Close,<br />Basildon, Essex, England, SS14 3AN</p>
              </div>
            </div>
            <div className="mt-5 lg:mt-0">
              {sent ? (
                <div className="p-8 bg-bg border border-stroke rounded-3xl text-center">
                  <p className="text-text-primary font-medium">Message received</p>
                  <p className="text-muted text-sm mt-2">We'll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handle} className="space-y-4">
                  {[{ key: 'name', label: 'Name', type: 'text', placeholder: 'Your full name' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' }, { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+44 ...' }].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">{label}</label>
                      <input type={type} placeholder={placeholder} required value={form[key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-gray-600 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">Business Type</label>
                    <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-gray-600 transition-colors">
                      <option value="" disabled>Select your business type</option>
                      {['Startup', 'Agency', 'Freelancer', 'eCommerce', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={sending} className="w-full text-white py-3 rounded-xl font-medium text-sm transition-colors duration-200 disabled:opacity-60" style={{ background: ACCENT }}>{sending ? 'Sending…' : 'Send Message'}</button>
                  {error && <p className="text-xs text-red-600">{error}</p>}
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const [emailHov, setEmailHov] = useState(false)
  return (
    <footer className="dark-section pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <video autoPlay loop muted playsInline src={HERO_VIDEO}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
          style={{ transform: 'translateX(-50%) translateY(-50%)' }} />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
        <div className="text-center mb-8">
          <p className="text-xs text-muted uppercase tracking-[0.3em] mb-6">Let's simplify your accounting</p>
          <div className="relative inline-block rounded-full max-w-full px-4" onMouseEnter={() => setEmailHov(true)} onMouseLeave={() => setEmailHov(false)}>
            <span className="absolute rounded-full transition-opacity duration-300 pointer-events-none" style={{ inset: '-1px', background: ACCENT, opacity: emailHov ? 1 : 0 }} />
            <a href="mailto:accounts@alliancestreet.co.uk?subject=Enquiry%20from%20Alliance%20Street%20Website"
              className="relative block text-sm sm:text-lg md:text-2xl lg:text-4xl text-text-primary px-4 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full border border-stroke transition-colors duration-300 cursor-pointer no-underline break-all sm:break-normal"
              style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', borderColor: emailHov ? 'transparent' : undefined }}>
              accounts@alliancestreet.co.uk
            </a>
          </div>
          <p className="text-muted text-sm mt-4">Serving UK businesses nationwide</p>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-5 border-t border-stroke pt-5">
            <div>
              <img src={LOGO_URL} alt="Alliance Street Accountancy Ltd" className="h-16 md:h-24 lg:h-32 w-auto object-contain mb-4" />
              <p className="text-muted text-xs leading-relaxed">UK accounting & advisory built for limited companies, agencies, and growing teams.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">Navigation</p>
              <ul className="space-y-2">
                {[['Home', '#home'], ['About', '#about'], ['Services', '#services'], ['Pricing', '#pricing'], ['Blog', '#'], ['Contact', '#contact']].map(([label, href]) => (
                  <li key={label}><a href={href} className="text-muted text-xs hover:text-text-primary transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">Services</p>
              <ul className="space-y-2">
                {['Bookkeeping', 'VAT Services', 'Payroll', 'Corporation Tax', 'Virtual CFO', 'Company Formation'].map(s => (
                  <li key={s}><a href="#services" className="text-muted text-xs hover:text-text-primary transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">Contact</p>
              <ul className="space-y-2 text-muted text-xs">
                <li>accounts@alliancestreet.co.uk</li>
                <li className="leading-relaxed">Pine Tree House, Gardiners Close, Basildon, Essex, England, SS14 3AN</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stroke pt-6">
            <p className="text-muted text-xs">© 2026 Alliance Street Accountancy Ltd — UK Accounting Services · HMRC-compliant | Cloud-based | Trusted by UK businesses</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-muted">Available for new UK clients</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const handleComplete = useCallback(() => setIsLoading(false), [])

  useEffect(() => {
    if (isLoading) return
    initLenis()
    const frame = requestAnimationFrame(() => {
      initScrollProgress()
      initHeroParallax()
      initSectionBgParallax()
      initLineGrow()
      initHeadingReveal()
      initScrollAnimations()
    })
    return () => {
      cancelAnimationFrame(frame)
      destroyAnimations()
    }
  }, [isLoading])

  return (
    <>
      <div
        className="scroll-progress-bar"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, transformOrigin: 'left center', transform: 'scaleX(0)', background: 'linear-gradient(90deg, #E40014 0%, #FB2C36 100%)', pointerEvents: 'none' }}
      />
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleComplete} />}
      </AnimatePresence>
      <AnimatePresence>
        {!isLoading && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Hero />
            <Trust />
            <Solution />
            <WhyChooseUs />
            <About />
            <Results />
            <Services />
            <Pricing />
            <FinalCTA />
            <Reviews />
            <Contact />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
