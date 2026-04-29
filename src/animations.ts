import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function initHeroParallax() {
  const heroVideo = document.querySelector<HTMLElement>('.hero-parallax-video')
  if (!heroVideo) return

  gsap.to(heroVideo, {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: heroVideo.closest('section') ?? heroVideo,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}

export function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>('.scroll-progress-bar')
  if (!bar) return

  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
    },
  })
}

export function initSectionBgParallax() {
  gsap.utils.toArray<HTMLElement>('.section-parallax-bg').forEach((el) => {
    gsap.fromTo(
      el,
      { y: -24 },
      {
        y: 24,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
  })
}

export function initLineGrow() {
  gsap.utils.toArray<HTMLElement>('.gsap-line-grow').forEach((line) => {
    gsap.fromTo(
      line,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    )
  })
}

function splitIntoWordSpans(el: HTMLElement) {
  const html = el.innerHTML
  const fragment = document.createDocumentFragment()
  const div = document.createElement('div')
  div.innerHTML = html

  const processNode = (node: ChildNode): HTMLElement[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = (node.textContent ?? '').split(/(\s+)/)
      return words.map((w) => {
        if (/^\s+$/.test(w)) {
          const sp = document.createElement('span')
          sp.innerHTML = w
          return sp
        }
        const span = document.createElement('span')
        span.className = 'word-split'
        span.style.display = 'inline-block'
        span.style.overflow = 'hidden'
        span.style.paddingBottom = '0.35em'
        span.style.marginBottom = '-0.35em'
        span.style.paddingTop = '0.1em'
        span.style.marginTop = '-0.1em'
        const inner = document.createElement('span')
        inner.className = 'word-inner'
        inner.style.display = 'inline-block'
        inner.textContent = w
        span.appendChild(inner)
        return span
      })
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = (node as Element).cloneNode(false) as HTMLElement
      Array.from(node.childNodes).forEach((child) => {
        processNode(child).forEach((n) => clone.appendChild(n))
      })
      return [clone]
    }
    return []
  }

  Array.from(div.childNodes).forEach((child) => {
    processNode(child).forEach((n) => fragment.appendChild(n))
  })

  el.innerHTML = ''
  el.appendChild(fragment)

  return el.querySelectorAll<HTMLElement>('.word-inner')
}

export function initHeadingReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.utils.toArray<HTMLElement>('.gsap-heading-reveal').forEach((heading) => {
    const words = splitIntoWordSpans(heading)
    if (!words.length) return

    gsap.fromTo(
      words,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    )
  })
}

export function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
        delay: i * 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    )
  })

  gsap.utils.toArray<HTMLElement>('.gsap-stagger-group').forEach((group) => {
    const children = group.querySelectorAll<HTMLElement>(':scope > *')
    gsap.fromTo(
      children,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  })
}

export function destroyAnimations() {
  ScrollTrigger.getAll().forEach((t) => t.kill())
  lenis?.destroy()
  lenis = null
  gsap.ticker.remove(() => {})
}
