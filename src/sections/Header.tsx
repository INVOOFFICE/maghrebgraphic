import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '../lib/tracking';

const navLinks = [
  { label: 'Accueil', target: 'top' },
  { label: 'À Propos', target: 'a-propos' },
  { label: 'Catalogue', target: 'catalogue' },
  { label: 'Contact', target: 'contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const ids = navLinks.map((l) => l.target);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-70px 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((target: string, label: string) => {
    trackEvent('navigation_click', { section: label });
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-header' : ''
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img src="/logo2.png" alt="Maghreb Graphic" className="h-[5.25rem] w-auto object-contain" decoding="async" />
            <span className="text-xl font-bold text-gray-900">
              Maghreb{' '}
              <span className="bg-primary text-white px-1.5 py-0.5 rounded-md">
                Graphic
              </span>
            </span>
          </a>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.target, link.label)}
                className={`flex items-center gap-1 text-xs font-medium tracking-[0.05em] transition-colors duration-200 ${
                  activeSection === link.target
                    ? 'text-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
