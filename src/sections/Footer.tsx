import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, ArrowUp, MessageCircle, Check, Clock } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/whatsapp';
import { trackEvent } from '../lib/tracking';

gsap.registerPlugin(ScrollTrigger);

function buildWhatsAppUrl(): string {
  const message = `Bonjour,%0AJe souhaite obtenir un devis pour vos services d'impression.%0A%0APouvez-vous me communiquer vos tarifs et disponibilités ?%0A%0AMerci.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-brand',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        }
      );

      gsap.fromTo(
        '.footer-cta',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        }
      );

      gsap.fromTo(
        '.footer-contact',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.25,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        }
      );

      gsap.fromTo(
        '.footer-bottom',
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" ref={sectionRef} className="bg-gray-100 pt-16 pb-6">
      <div className="container-main">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 mb-14">
          {/* Brand Column */}
          <div className="footer-brand lg:col-span-3">
            <div className="flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="Maghreb Graphic" className="h-10 w-auto" loading="lazy" decoding="async" />
              <span className="text-lg font-bold text-gray-900">Maghreb Graphic</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-6">
              Maghreb Graphic est née à Casablanca pour offrir des solutions d'impression
              professionnelles avec une forte identité. Nous combinons savoir-faire traditionnel
              et technologies modernes pour donner vie à vos projets avec une qualité
              irréprochable.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm6.2 8.8c-.01.17-.01.34-.01.51 0 5.18-3.94 11.15-11.15 11.15-2.21 0-4.27-.65-6.01-1.76.31.04.62.06.94.06 1.84 0 3.53-.63 4.87-1.68-1.72-.03-3.17-1.17-3.67-2.73.24.05.49.07.74.07.36 0 .71-.05 1.04-.14-1.8-.36-3.15-1.95-3.15-3.86v-.05c.53.29 1.13.47 1.77.49-1.05-.7-1.75-1.9-1.75-3.26 0-.72.19-1.39.53-1.97 1.93 2.37 4.81 3.93 8.06 4.09-.07-.29-.1-.59-.1-.9 0-2.18 1.77-3.95 3.95-3.95 1.14 0 2.16.48 2.88 1.25.9-.18 1.75-.51 2.51-.96-.3.92-.92 1.7-1.73 2.19.8-.09 1.56-.31 2.27-.62-.53.78-1.2 1.47-1.97 2.02z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* WhatsApp CTA */}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { location: 'footer' })}
              className="footer-cta flex items-center justify-center gap-3 w-full px-5 py-3.5 bg-primary text-white font-semibold rounded-card hover:bg-primary-dark hover:shadow-button hover:scale-[1.02] transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              Demander un devis
            </a>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-white rounded-full px-3 py-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                Devis gratuit
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-white rounded-full px-3 py-1.5">
                <Clock className="w-3 h-3 text-emerald-500" />
                Réponse rapide
              </span>
            </div>

            {/* Address */}
            <div className="footer-contact flex items-center gap-4 bg-white rounded-card px-5 py-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-0.5">
                  Adresse
                </p>
                <p className="text-sm font-medium text-gray-800">Casablanca, Maroc</p>
              </div>
            </div>

            {/* Phone */}
            <div className="footer-contact flex items-center gap-4 bg-white rounded-card px-5 py-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-0.5">
                  Téléphone
                </p>
                <a
                  href="tel:+212661317773"
                  className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
                >
                  +212 661 317 773
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Copyright © {new Date().getFullYear()}{' '}
            <span className="text-gray-700 font-medium">Maghreb Graphic</span>. Tous droits réservés.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            HAUT DE PAGE
            <span className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-primary" aria-hidden="true">
              <ArrowUp className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
