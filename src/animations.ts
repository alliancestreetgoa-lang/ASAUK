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
