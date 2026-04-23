import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hls from 'hls.js'

gsap.registerPlugin(ScrollTrigger)

const HLS_SRC = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'
const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'
const ACCENT = 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)'
const LOGO_URL = 'https://alliancestreetaccounting.com/images/logo.png'

function SectionBg({ src, opacity = 0.28, position = 'right' }: { src: string; opacity?: number; position?: 'left' | 'right' | 'center' }) {
  const pos = position === 'left' ? 'left center' : position === 'center' ? 'center' : 'right center'
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: pos, opacity }} />
      <div className="absolute inset-0" style={{ background: position === 'center' ? 'radial-gradient(ellipse at center, rgba(15,15,15,0.35) 0%, rgba(15,15,15,0.85) 75%)' : 'linear-gradient(to right, hsl(0 0% 6% / 0.9) 0%, hsl(0 0% 6% / 0.55) 55%, hsl(0 0% 6% / 0.25) 100%)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-bg/40" />
    </div>
  )
}

function HLSVideo({ src, className, style, ...props }: React.VideoHTMLAttributes<HTMLVideoElement> & { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current; if (!v) return
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src); hls.attachMedia(v)
      hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(() => {}))
      return () => hls.destroy()
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = src; v.play().catch(() => {})
    }
  }, [src])
  return <video ref={ref} className={className} style={style} {...props} />
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
            <div className="mt-8"><a href="#contact" onClick={onClose} className="inline-block bg-white text-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Get Started →</a></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const LOADING_WORDS = ['Accounting', 'Tax Planning', 'Advisory']

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  useEffect(() => {
    const start = performance.now(); const dur = 2700; let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setCount(Math.floor(p * 100))
      if (p < 1) { raf = requestAnimationFrame(tick) } else { setCount(100); setTimeout(onComplete, 400) }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])
  useEffect(() => {
    const iv = setInterval(() => setWordIndex(i => (i + 1) % LOADING_WORDS.length), 900)
    return () => clearInterval(iv)
  }, [])
  return (
    <motion.div className="fixed inset-0 z-[9999] bg-bg flex flex-col overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <motion.div className="absolute top-8 left-8" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <img src={LOGO_URL} alt="Alliance Street Accountancy Ltd" className="h-[3.75rem] w-auto object-contain" />
      </motion.div>
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span key={wordIndex} className="text-4xl md:text-6xl lg:text-7xl text-text-primary/80"
            style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }}>
            {LOADING_WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-12 right-8">
        <span className="text-6xl md:text-8xl lg:text-9xl text-text-primary tabular-nums" style={{ fontFamily: "'Instrument Serif',serif" }}>
          {String(count).padStart(3, '0')}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stroke/50">
        <motion.div className="h-full origin-left" style={{ background: ACCENT }} animate={{ scaleX: count / 100 }} transition={{ duration: 0.05, ease: 'linear' }} />
      </div>
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
  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {line.split('').map((char, ci) => (
            <span key={ci} style={{ display: 'inline-block', opacity: animated ? 1 : 0, transform: animated ? 'translateX(0)' : 'translateX(-18px)', transition: 'opacity 500ms, transform 500ms', transitionDelay: `${(li * line.length * charDelay) + (ci * charDelay)}ms` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Services', 'Pricing', 'About', 'Contact']

function Hero() {
  const [taxHov, setTaxHov] = useState(false)
  return (
    <section id="home" className="relative h-screen flex flex-col overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" src={HERO_VIDEO} />
      <div className="relative z-10 px-6 md:px-12 lg:px-16 pt-6">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <a href="#home" className="flex items-center"><img src={LOGO_URL} alt="Alliance Street Accountancy Ltd" className="h-12 md:h-14 w-auto object-contain" /></a>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-white hover:text-gray-300 transition-colors duration-200">{link}</a>
            ))}
          </div>
          <a href="#contact" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 cursor-pointer">Book Free Call</a>
        </nav>
      </div>
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-end">
          <div>
            <AnimatedHeading text={"UK Accountants That Help\nYou Save Tax & Grow Faster"} className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white mb-4" />
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5">
                Fixed monthly pricing. HMRC-compliant accounting for startups, agencies, and small businesses across the UK.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">Book Free Consultation</a>
                <button
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: taxHov ? 'white' : undefined, color: taxHov ? 'black' : undefined }}
                  onMouseEnter={() => setTaxHov(true)} onMouseLeave={() => setTaxHov(false)}>
                  Get Free Tax Review
                </button>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
              <p className="text-lg md:text-xl lg:text-2xl font-light text-white">HMRC-compliant · Cloud-based · Fixed pricing</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// ── Trust ─────────────────────────────────────────────────────────────────────
function Trust() {
  const badges = [{ value: '100+', label: 'Clients Served' }, { value: '5★', label: 'Client Satisfaction' }, { value: 'UK', label: 'Based Experts' }]
  return (
    <section className="bg-bg py-14 border-b border-stroke">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.p className="text-center text-muted text-xs uppercase tracking-[0.25em] mb-10"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Trusted by UK startups, agencies, and growing businesses
        </motion.p>
        <div className="grid grid-cols-3 gap-6">
          {badges.map((b, i) => (
            <motion.div key={b.label} className="text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <p className="text-3xl md:text-5xl text-text-primary font-light mb-1" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{b.value}</p>
              <p className="text-xs text-muted uppercase tracking-[0.2em]">{b.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Problem ───────────────────────────────────────────────────────────────────
const PROBLEMS = [
  'Confusing tax rules and HMRC deadlines',
  'Overpaying tax without realising it',
  'No clear view of cash flow or profits',
  'Accountant only contacts you once a year',
]

function Problem() {
  return (
    <section id="about" className="relative overflow-hidden bg-bg py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80&auto=format&fit=crop" opacity={0.12} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">The Problem</span></div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>
                Struggling with accounting, tax, or compliance?
              </h2>
              <p className="text-muted text-base md:text-lg leading-relaxed">
                Managing finances shouldn't slow your business down — but for many UK business owners, it does.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 space-y-4">
              {PROBLEMS.map((p, i) => (
                <motion.div key={i} className="flex items-start gap-4 p-4 bg-surface/50 border border-stroke rounded-2xl"
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  <p className="text-text-primary text-sm leading-relaxed">{p}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Solution ──────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = ['Monthly bookkeeping', 'VAT returns (Making Tax Digital compliant)', 'Payroll & PAYE', 'Corporation tax filing', 'Financial reporting', 'Ongoing advisory support']

function Solution() {
  return (
    <section className="relative overflow-hidden bg-surface/30 py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80&auto=format&fit=crop" opacity={0.12} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Our Solution</span></div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>
                We take care of your finances — so you can focus on growth
              </h2>
              <p className="text-muted text-base md:text-lg leading-relaxed">
                Our expert team handles everything from bookkeeping to tax planning, giving you clarity and confidence in your numbers.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 space-y-4">
              {SOLUTION_ITEMS.map((item, i) => (
                <motion.div key={i} className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-black" style={{ background: ACCENT }}>✓</span>
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
  { title: 'Dedicated accountant for your business', desc: 'One expert who knows your business inside out.' },
  { title: 'Fixed monthly pricing — no surprises', desc: 'Know exactly what you pay, every month.' },
  { title: 'Fast response time (within 24 hours)', desc: 'Never left waiting when you need answers.' },
  { title: 'Cloud accounting (Xero, QuickBooks, FreeAgent)', desc: 'Real-time access to your financial data.' },
  { title: 'Proactive tax-saving strategies', desc: 'We find savings before HMRC deadlines hit.' },
]

function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-bg py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop" opacity={0.1} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Why Choose Us</span></div>
          <h2 className="text-3xl md:text-5xl text-text-primary mb-12" style={{ fontFamily: "'Instrument Serif',serif" }}>
            Why UK businesses <em>choose us</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_POINTS.map((p, i) => (
              <motion.div key={i} className="p-6 bg-surface/50 border border-stroke rounded-2xl hover:border-white/20 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <span className="inline-block text-xs font-medium text-black px-3 py-1 rounded-full mb-4" style={{ background: ACCENT }}>0{i + 1}</span>
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

// ── Results ───────────────────────────────────────────────────────────────────
const RESULTS = [
  { value: '£10,000+', label: 'Tax saved for a digital agency', desc: 'Through proactive tax planning and R&D credits.' },
  { value: 'Zero', label: 'Late filing penalties', desc: 'Eliminated for multiple clients across the UK.' },
  { value: '100%', label: 'Financial clarity', desc: 'Improved reporting and visibility for eCommerce founders.' },
]

function Results() {
  return (
    <section className="relative overflow-hidden bg-surface/30 py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80&auto=format&fit=crop" opacity={0.12} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Real Results</span></div>
          <h2 className="text-3xl md:text-5xl text-text-primary mb-12" style={{ fontFamily: "'Instrument Serif',serif" }}>
            Real results for growing <em>UK businesses</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESULTS.map((r, i) => (
              <motion.div key={i} className="p-8 bg-bg border border-stroke rounded-3xl"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
                <p className="text-4xl md:text-5xl text-text-primary mb-2" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{r.value}</p>
                <p className="text-text-primary text-sm font-medium mb-2">{r.label}</p>
                <p className="text-muted text-xs leading-relaxed">{r.desc}</p>
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
          <div className="flex items-center gap-3 mb-3"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Accounting Services UK</span></div>
          <h2 className="text-3xl md:text-5xl text-text-primary" style={{ fontFamily: "'Instrument Serif',serif" }}>Everything you need to <em>stay compliant & grow</em></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_DATA.map((svc, i) => (
            <motion.div key={svc.name}
              className="group relative rounded-3xl overflow-hidden cursor-pointer border border-stroke hover:border-white/30 transition-all duration-300"
              onClick={() => setModal({ title: svc.name, tag: svc.tag, img: svc.img, body: svc.body })}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.7, delay: i * 0.1 }}>
              <div className="relative h-40 overflow-hidden">
                <img src={svc.img} alt={svc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
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
  { name: 'Starter', price: 'From £99/month', popular: false, features: ['Bookkeeping', 'VAT returns', 'Email support'] },
  { name: 'Growth', price: 'From £199/month', popular: true, features: ['Everything in Starter', 'Payroll', 'Tax planning', 'Priority support'] },
  { name: 'Scale', price: 'Custom pricing', popular: false, features: ['Full accounting + CFO services', 'Forecasting & strategy', 'Dedicated advisor'] },
]

function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-surface/30 py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=1600&q=80&auto=format&fit=crop" opacity={0.1} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Transparent Pricing</span></div>
          <h2 className="text-3xl md:text-5xl text-text-primary mb-12" style={{ fontFamily: "'Instrument Serif',serif" }}>Fixed monthly pricing — <em>no surprises</em></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name}
                className={`relative p-8 rounded-3xl border transition-all duration-300 ${plan.popular ? 'bg-bg border-white/30 md:scale-105' : 'bg-bg border-stroke hover:border-white/20'}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-4 py-1 rounded-full text-black font-medium" style={{ background: ACCENT }}>Most Popular</span>
                )}
                <p className="text-xs text-muted uppercase tracking-[0.2em] mb-3">{plan.name} Plan</p>
                <p className="text-2xl md:text-3xl text-text-primary mb-6" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-muted">
                      <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-black" style={{ background: ACCENT }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className={`block text-center py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${plan.popular ? 'bg-white text-black hover:bg-gray-100' : 'border border-stroke text-text-primary hover:border-white/40'}`}>
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
    <section className="relative overflow-hidden bg-surface/30 py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80&auto=format&fit=crop" opacity={0.12} position="center" />
      <div className="relative z-10 max-w-[800px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Get Started</span><div className="w-8 h-px bg-stroke" />
          </div>
          <h2 className="text-4xl md:text-6xl text-text-primary mb-6 leading-tight" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>
            Ready to simplify your accounting?
          </h2>
          <p className="text-muted text-base md:text-lg mb-10 max-w-lg mx-auto">
            Book a free consultation and get a clear plan to manage your finances and reduce tax.
          </p>
          <a href="#contact" className="inline-block bg-white text-black px-10 py-4 rounded-xl font-medium text-base hover:bg-gray-100 transition-colors duration-200">
            Book Your Free Call →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ── Lead Magnet ───────────────────────────────────────────────────────────────
function LeadMagnet() {
  return (
    <section className="bg-bg py-16 px-6 border-b border-stroke">
      <div className="max-w-[1200px] mx-auto">
        <motion.div className="relative rounded-3xl border border-stroke overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '4px 4px' }} />
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs text-muted uppercase tracking-[0.3em] mb-2">Free Download</p>
            <h3 className="text-2xl md:text-3xl text-text-primary mb-2" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>Free UK Tax Saving Checklist</h3>
            <p className="text-muted text-sm">Discover simple strategies to reduce your tax bill and stay compliant.</p>
          </div>
          <a href="#contact" className="relative shrink-0 bg-white text-black px-8 py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors duration-200">Download Now →</a>
        </motion.div>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '' })
  const [sent, setSent] = useState(false)
  const handle = (e: React.FormEvent) => { e.preventDefault(); setSent(true) }
  return (
    <section id="contact" className="relative overflow-hidden bg-surface/30 py-20 md:py-28 px-6 border-b border-stroke">
      <SectionBg src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80&auto=format&fit=crop" opacity={0.12} position="right" />
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-3 mb-6"><div className="w-8 h-px bg-stroke" /><span className="text-xs text-muted uppercase tracking-[0.3em]">Get In Touch</span></div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl text-text-primary mb-4" style={{ fontFamily: "'Instrument Serif',serif" }}>
                Let's talk about <em>your business</em>
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-8">Or book a call directly. We're available for UK businesses of all sizes.</p>
              <div className="space-y-3">
                <a href="mailto:shaukin@alliancestreet.ae" className="flex items-center gap-3 text-sm text-muted hover:text-text-primary transition-colors"><span className="text-[10px] uppercase tracking-[0.2em] w-14">Email</span> shaukin@alliancestreet.ae</a>
                <a href="tel:+917375096163" className="flex items-center gap-3 text-sm text-muted hover:text-text-primary transition-colors"><span className="text-[10px] uppercase tracking-[0.2em] w-14">Phone</span> +91 7375096163</a>
                <p className="flex items-start gap-3 text-sm text-muted"><span className="text-[10px] uppercase tracking-[0.2em] w-14 shrink-0 mt-1">Office</span> Pine Tree House, Gardiners Close,<br />Basildon, Essex, England, SS14 3AN</p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
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
                        className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-muted uppercase tracking-[0.2em] mb-1 block">Business Type</label>
                    <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-bg border border-stroke rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-white/30 transition-colors">
                      <option value="" disabled>Select your business type</option>
                      {['Startup', 'Agency', 'Freelancer', 'eCommerce', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-white text-black py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors duration-200">Send Message</button>
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
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [emailHov, setEmailHov] = useState(false)
  useEffect(() => {
    const ctx = gsap.context(() => { gsap.to('.marquee-inner', { xPercent: -50, duration: 40, ease: 'none', repeat: -1 }) }, marqueeRef)
    return () => ctx.revert()
  }, [])
  return (
    <footer className="bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <HLSVideo src={HLS_SRC} autoPlay muted loop playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
          style={{ transform: 'translateX(-50%) translateY(-50%) scaleY(-1)' }} />
        <div className="absolute inset-0 bg-black/65" />
      </div>
      <div className="relative z-10">
        <div className="overflow-hidden mb-12 md:mb-20" ref={marqueeRef}>
          <div className="marquee-inner whitespace-nowrap inline-flex">
            {Array(20).fill('UK ACCOUNTANT · BOOKKEEPING UK · VAT SERVICES UK · TAX PLANNING · ').map((text, i) => (
              <span key={i} className="text-3xl md:text-5xl lg:text-7xl text-text-primary/10 pr-8" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>{text}</span>
            ))}
          </div>
        </div>
        <div className="text-center mb-16">
          <p className="text-xs text-muted uppercase tracking-[0.3em] mb-6">Let's simplify your accounting</p>
          <div className="relative inline-block rounded-full" onMouseEnter={() => setEmailHov(true)} onMouseLeave={() => setEmailHov(false)}>
            <span className="absolute rounded-full transition-opacity duration-300 pointer-events-none" style={{ inset: '-1px', background: ACCENT, opacity: emailHov ? 1 : 0 }} />
            <a href="mailto:shaukin@alliancestreet.ae"
              className="relative block text-xl md:text-3xl lg:text-4xl text-text-primary px-10 py-5 rounded-full border border-stroke transition-colors duration-300"
              style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', borderColor: emailHov ? 'transparent' : undefined }}>
              shaukin@alliancestreet.ae
            </a>
          </div>
          <p className="text-muted text-sm mt-4">+91 7375096163 · Serving UK businesses nationwide</p>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 border-t border-stroke pt-10">
            <div>
              <img src={LOGO_URL} alt="Alliance Street Accountancy Ltd" className="h-[9rem] w-auto object-contain mb-4" />
              <p className="text-muted text-xs leading-relaxed">UK accounting services for startups, agencies, and growing businesses.</p>
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
                <li>shaukin@alliancestreet.ae</li>
                <li>+91 7375096163</li>
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
  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleComplete} />}
      </AnimatePresence>
      <AnimatePresence>
        {!isLoading && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Hero />
            <Trust />
            <Problem />
            <Solution />
            <WhyChooseUs />
            <Results />
            <Services />
            <Pricing />
            <FinalCTA />
            <LeadMagnet />
            <Contact />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
