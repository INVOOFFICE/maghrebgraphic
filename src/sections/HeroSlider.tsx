import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '../lib/tracking';

export default function HeroSlider() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-label',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
      );
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.35 }
      );
      gsap.fromTo(
        '.hero-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      );
      gsap.fromTo(
        '.hero-btn',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.65 }
      );
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const scrollToCatalogue = () => {
    trackEvent('hero_cta_click');
    const el = document.getElementById('catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="top" className="relative overflow-hidden min-h-[550px] lg:min-h-[600px] flex items-center">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/maghrib.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div ref={contentRef} className="container-main relative z-10 py-16 lg:py-20">
        <div className="w-full lg:w-[55%]">
          <p className="hero-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-light mb-6">
            Votre partenaire impression
          </p>
          <h1 className="hero-title text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            MAGHREB GRAPHIC
          </h1>
          <p className="hero-desc text-base text-white/70 mb-10 max-w-[580px] leading-relaxed">
            Découvrez tous nos supports d'impression et solutions professionnelles.
          </p>
          <button onClick={scrollToCatalogue} className="hero-btn btn-primary">
            Découvrir le catalogue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
