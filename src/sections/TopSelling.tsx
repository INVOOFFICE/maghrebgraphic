import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, ImageOff } from 'lucide-react';
import { products } from '../data/products';
import { WHATSAPP_NUMBER } from '../data/whatsapp';
import { trackEvent } from '../lib/tracking';

gsap.registerPlugin(ScrollTrigger);

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildImageUrls(productName: string): string[] {
  const variants = [productName];
  const sanitized = sanitizeFileName(productName);
  if (sanitized !== productName) {
    variants.push(sanitized);
  }
  const urls: string[] = [];
  for (const variant of variants) {
    for (const ext of IMAGE_EXTENSIONS) {
      urls.push(`/assets/${variant}${ext}`);
    }
  }
  return urls;
}

function ProductImage({ productName }: { productName: string }) {
  const urls = buildImageUrls(productName);
  const [attempt, setAttempt] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const handleError = () => {
    if (attempt < urls.length - 1) {
      setAttempt((prev) => prev + 1);
    } else {
      setNotFound(true);
    }
  };

  if (notFound) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
        <ImageOff className="w-10 h-10" />
        <span className="text-[11px] text-gray-400">Aucune image</span>
      </div>
    );
  }

  return (
    <img
      src={urls[attempt]}
      alt={productName}
      onError={handleError}
      loading="lazy"
      decoding="async"
      className="max-h-[80%] max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300"
    />
  );
}

function buildWhatsAppUrl(productName: string): string {
  const message = `Bonjour,%0AJe souhaite obtenir plus d'informations concernant le produit :%0A%0A*${encodeURIComponent(productName)}*%0A%0APouvez-vous m'envoyer un devis ainsi que les différentes options disponibles ?%0A%0AMerci.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export default function TopSelling() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.top-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        '.product-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.products-grid', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="catalogue" className="bg-gray-100 py-20 lg:py-24">
      <div className="container-main">
        {/* Header */}
        <div className="top-header text-center mb-12">
          <h2 className="text-3xl lg:text-[40px] font-bold text-gray-900 leading-tight mb-4">
            <span className="text-primary">Notre</span> Catalogue
          </h2>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            Nos Produits<br />
            Découvrez notre gamme complète de supports d'impression et fournitures professionnelles.
          </p>
        </div>

        {/* Products Grid */}
        <div className="products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {products.map((product) => (
            <div key={product.name} className="product-card group card-shadow rounded-card overflow-hidden bg-white flex flex-col h-full">
              {/* Image */}
              <div className="relative bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
                <ProductImage productName={product.name} />
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                  {product.name}
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed mt-1.5 min-h-[2.5rem]">
                  {product.specs !== '—' ? product.specs : ''}
                </p>
                <div className="flex-1" />
                <a
                  href={buildWhatsAppUrl(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { product_name: product.name, location: 'product_card' })}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-white text-[13px] font-medium rounded-button hover:bg-primary-dark hover:shadow-button transition-all duration-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Consulter
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
