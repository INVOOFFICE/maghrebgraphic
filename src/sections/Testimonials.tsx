import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-text',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        '.about-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="a-propos" className="bg-white py-20 lg:py-28">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Left — Text */}
          <div className="about-text flex-1">
            <p className="section-label mb-4">À PROPOS</p>
            <h2 className="text-3xl lg:text-[42px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-8">
              Née à Casablanca,<br />
              <span className="text-primary">dédiée à l'excellence</span>
            </h2>
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-xl">
              Maghreb Graphic est née à Casablanca pour offrir des solutions d'impression
              professionnelles avec une forte identité. Nous combinons savoir-faire traditionnel
              et technologies modernes pour donner vie à vos projets avec une qualité
              irréprochable.
            </p>
          </div>

          {/* Right — Contact Cards */}
          <div className="about-card w-full lg:w-[380px] flex flex-col gap-5">
            <div className="flex items-center gap-5 bg-gray-50 rounded-card px-6 py-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">
                  Adresse
                </p>
                <p className="text-sm font-medium text-gray-800">Casablanca, Maroc</p>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-gray-50 rounded-card px-6 py-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">
                  Téléphone
                </p>
                <a
                  href="tel:+212661317773"
                  className="text-sm font-medium text-gray-800 hover:text-primary transition-colors duration-200"
                >
                  +212 661 317 773
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
