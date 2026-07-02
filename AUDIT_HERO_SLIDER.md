# Audit du Hero Slider

> **Date** : 02/07/2026  
> **Fichier principal** : `src/sections/HeroSlider.tsx`  
> **Méthodologie** : Analyse statique du code, inspection des dépendances, revue d’architecture

---

## 1. Architecture

### 1.1 Composant principal
| Élément | Valeur |
|---------|--------|
| Composant | `HeroSlider` (export default) |
| Emplacement | `src/sections/HeroSlider.tsx` (115 lignes) |
| Point d'entrée | `src/pages/Home.tsx:17` → `<HeroSlider />` |
| Type de composant | Composant fonctionnel React, autoportant (pas de props) |

### 1.2 Fichiers impliqués
| Fichier | Rôle |
|---------|------|
| `src/sections/HeroSlider.tsx` | Composant unique du slider |
| `src/pages/Home.tsx` | Page qui importe et affiche le slider |
| `src/index.css` | Styles globaux (`btn-primary`, `container-main`) |
| `tailwind.config.js` | Couleurs `primary`, `gray`, shadow `header` |
| `public/assets/hero-slide-1.jpg` | Image slide 1 (69 KB) |
| `public/assets/hero-slide-2.jpg` | Image slide 2 (77 KB) |

### 1.3 Flux de fonctionnement
```
1. Home.tsx monte <HeroSlider />
2. useEffect [mount] → animateIn() → GSAP timeline anime les éléments visibles
3. useEffect [currentSlide, goToSlide] → setInterval(5000ms) qui appelle goToSlide(suivant)
4. goToSlide(index) :
   a. Vérifie isAnimating ou même slide → return early
   b. setIsAnimating(true)
   c. GSAP timeline : fade-out content + image (0.3s)
   d. onComplete → setCurrentSlide(index) + setIsAnimating(false) + animateIn()
5. setCurrentSlide déclenche le re-render → React met à jour le DOM avec le nouveau slide
6. animateIn() → GSAP timeline : fade-in du nouveau contenu
7. Retour à l'étape 3 (nouvel interval créé car currentSlide a changé)
```

### 1.4 Structure du DOM
```
<section.relative.bg-gray-100>
  <div.container-main>
    <div.flex>                    ← flex row
      <div.w-full.lg:w-1/2>      ← contenu texte (gauche)
        <p.hero-label>            ← label (optionnel)
        <h1.hero-title>           ← titre
        <p.hero-desc>             ← description
        <button.hero-btn>         ← CTA (optionnel)
      </div>
      <div.hidden.lg:block>      ← image (droite, cachée sur mobile)
        <img>
      </div>
    </div>
  </div>
  <div.absolute>                 ← dots de pagination
    <button> × 2
  </div>
</section>
```

---

## 2. Bibliothèque utilisée

### 2.1 Choix technique
Le slider utilise **GSAP (GreenSock Animation Platform) v3.15.0** pour les transitions d'entrée/sortie. Il s'agit d'une **implémentation 100% maison** — aucun framework de slider/carousel n'est utilisé.

### 2.2 Contexte des dépendances
| Dépendance | Version | Utilisée dans HeroSlider | Présente dans le projet |
|-----------|---------|-------------------------|------------------------|
| `gsap` | ^3.15.0 | **Oui** (transitions) | Utilisé dans 8 sections |
| `embla-carousel-react` | ^8.6.0 | **Non** | Utilisé dans `src/components/ui/carousel.tsx` (shadcn, non lié) |

**Constat** : Le projet dispose d'Embla Carousel (bibliothèque de slider légère, accessible, testée) mais ne l'utilise pas pour le Hero Slider. GSAP est utilisé uniquement pour des animations de fade-in/out, ce qui représente un surdimensionnement de l'outil.

### 2.3 Qualité d'intégration GSAP
- ✅ GSAP est importé comme module ES
- ✅ Les timelines sont créées correctement (`gsap.timeline()`)
- ❌ **Aucun `kill()` ou `clear()`** des timelines lors du démontage
- ❌ Les animations ciblent des **classes CSS globales** (`.hero-content`, `.hero-image`, etc.) plutôt que des refs React
- ❌ Risque de **conflit entre plusieurs instances** du composant sur la même page (mêmes sélecteurs)

---

## 3. État (State Management)

### 3.1 États déclarés
```ts
const [currentSlide, setCurrentSlide] = useState(0);  // Index du slide actif
const [isAnimating, setIsAnimating] = useState(false); // Verrou d'animation
```

### 3.2 Problèmes identifiés

#### 🔴 Critique : Boucle de dépendances infinie
```ts
// goToSlide dépend de currentSlide et isAnimating
const goToSlide = useCallback((index: number) => {
  // ...
}, [currentSlide, isAnimating]);

// L'effet autoplay dépend de currentSlide et goToSlide
useEffect(() => {
  const interval = setInterval(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, 5000);
  return () => clearInterval(interval);
}, [currentSlide, goToSlide]);
```

**Chaîne de re-création** :
1. `setCurrentSlide` change → `currentSlide` change
2. → `goToSlide` est recréé (nouvelle référence)
3. → L'effet autoplay se ré-exécute
4. → L'ancien interval est clear, un nouveau est créé
5. → Chaque changement de slide déclenche un nettoyage/re-création complet du timer

**Conséquence** : Le timer est réinitialisé après chaque transition. Si l'animation dure 0.9s, le délai réel entre slides est ~5.9s au lieu de 5s. De plus, cela provoque des re-renders et nettoyages inutiles.

#### 🟠 Modéré : Fenêtre de race condition sur isAnimating
```ts
// Clics rapides sur les dots
goToSlide(0); // isAnimating = false → passe, setIsAnimating(true)
goToSlide(1); // isAnimating = encore false (state batché) → peut passer aussi
```
React 19 batche les `setState` dans les event handlers, donc deux clics dans la même microtask pourraient tous deux passer le guard `if (isAnimating) return`.

#### 🟡 Mineur : animateIn n'est pas mémorisé avec les bonnes dépendances
`animateIn` est un `useCallback([], [])` — il ne change jamais. C'est correct pour l'effet de montage, mais il référence des classes CSS qui dépendent du DOM. Si React reuse le composant ou si le DOM change, `animateIn` sera stale.

#### 🟡 Mineur : Pas de reset d'état au démontage
Aucun cleanup des states si le composant est démonté puis remonté.

---

## 4. Bugs potentiels

### 🔴 Critique : Absence de cleanup GSAP (memory leak)
```ts
// Dans goToSlide :
const tl = gsap.timeline({ onComplete: () => { setCurrentSlide(index); animateIn(); } });
// JAMAIS nettoyé. Si le composant unmount pendant l'animation :
// → La timeline continue de tourner
// → onComplete appelle setState sur un composant unmount
// → La timeline et ses références DOM restent en mémoire
```

### 🔴 Critique : Conflit d'animations GSAP parallèles
```ts
useEffect(() => { animateIn(); }, [animateIn]); // Animation initiale au montage

// Si l'utilisateur clique sur un dot AVANT la fin de l'animation initiale :
// → goToSlide crée une NOUVELLE timeline (fade-out)
// → animateIn tourne encore (fade-in initial)
// → Les deux timelines manipulent les MÊMES éléments DOM → combat d'animations
```
**Scénario repro** : Charger la page, cliquer immédiatement sur le dot 2 → les animations se chevauchent → flicker visuel.

### 🔴 Critique : Sauts entre slides (pas de préchargement)
Il n'y a qu'un seul `<img>` dans le DOM. Quand `currentSlide` change, l'`src` change → le navigateur doit charger la nouvelle image. Pendant le chargement, l'ancienne image disparaît (opacity 0 via GSAP) et la nouvelle n'est pas encore prête → **flash blanc / zone vide**.

### 🟠 Modéré : Autoplay désynchronisé
```
T=0s   : Slide 0 affiché, interval 5s créé
T=2s   : L'utilisateur clique dot 1 → goToSlide(1)
T=2.9s : Animation terminée → setCurrentSlide(1) → interval recréé (5s reset)
T=7.9s : Prochain autoplay → slide 2
```
→ L'autoplay est repoussé à chaque interaction manuelle. Pas forcément un bug mais comportement non documenté qui peut surprendre.

### 🟠 Modéré : Pas de pause au hover/focus
L'autoplay continue même si l'utilisateur :
- Survole le slider avec la souris
- Focus un élément interactif dans le slide
- Est en train de lire le contenu

### 🟠 Modéré : Pas de support touch/swipe
Sur mobile, pas de gesture swipe pour naviguer entre les slides.

### 🟡 Mineur : Classe CSS inexistante
```tsx
<button className="hero-primary btn-primary">  {/* 'hero-primary' n'existe pas */}
```
`hero-primary` n'est définie ni dans `index.css` ni dans `tailwind.config.js`. Classe morte sans effet.

### 🟡 Mineur : Problème de resize
Si le viewport est redimensionné (ex: rotation mobile), les éléments GSAP conservent leurs styles inline (`opacity`, `transform`). Aucun handler `resize` pour nettoyer/réinitialiser. GSAP peut laisser des `style="opacity:0; transform:..."` qui bloquent l'affichage.

### 🟡 Mineur : Pas de prévention SSR/Hydration
Bien que le projet utilise Vite (CSR uniquement), si un jour le SSR est ajouté, GSAP échouera car il nécessite `window`.

### 🟡 Mineur : Pas de lazy loading natif
```tsx
<img src={slide.image} alt={slide.title} />  {/* Pas de loading="lazy" */}
```

---

## 5. Performance

### 5.1 Taille des assets
| Fichier | Format | Taille | Optimisé |
|---------|--------|--------|----------|
| hero-slide-1.jpg | JPEG | 69 KB | Partiellement |
| hero-slide-2.jpg | JPEG | 77 KB | Partiellement |

Les images sont de taille raisonnable pour du hero (146 KB total).

### 5.2 Problèmes

| Problème | Sévérité | Détail |
|----------|----------|--------|
| Pas de `loading="lazy"` | 🟠 Modéré | Le LCP pourrait être amélioré |
| Pas de `srcset` / responsive images | 🟠 Modéré | Même image chargée sur mobile et desktop |
| Pas de `decoding="async"` | 🟡 Mineur | Blocage potentiel du thread principal |
| Pas de placeholder/blur-up | 🟡 Mineur | Flash blanc pendant le chargement |
| GSAP modifie le DOM via classes | 🟠 Modéré | Force le navigateur à recalculer le layout |
| CLS potentiel | 🟡 Mineur | Hauteur fixe (`min-h-[500px]`), mais pas de `aspect-ratio` sur l'image |
| FPS en animation | 🟡 Mineur | GSAP utilise `requestAnimationFrame`, généralement fluide |
| Bundle GSAP | 🟡 Mineur | ~60 KB gzippé, impact modéré |

### 5.3 Re-renders inutiles
- Le composant entier re-render à chaque changement de `currentSlide` ou `isAnimating`
- `slides` est défini hors composant → OK, pas de re-création
- Les fonctions `goToSlide` et `animateIn` changent de référence inutilement (voir section 3.2)
- Le `<img>` est re-rendu avec une nouvelle `src` à chaque slide → le navigateur doit gérer le changement

---

## 6. Responsive

### 6.1 Comportement actuel
| Breakpoint | Layout | Image |
|-----------|--------|-------|
| Desktop (≥1024px) | 2 colonnes (texte + image) | Visible |
| Tablette (<1024px) | 1 colonne (texte uniquement) | Cachée via `hidden lg:block` |
| Mobile (<640px) | 1 colonne (texte uniquement) | Cachée |

### 6.2 Problèmes
| Problème | Sévérité |
|----------|----------|
| Pas d'image sur mobile → perte d'impact visuel | 🟠 Modéré |
| Pas d'image de fallback pour mobile | 🟠 Modéré |
| `min-h-[500px]` fixe → peut être trop grand sur petit mobile | 🟡 Mineur |
| Texte `text-4xl lg:text-5xl` → adapté mais pas de `sm:` | 🟡 Mineur |
| Padding `py-12` fixe → pourrait être réduit sur mobile | 🟡 Mineur |
| Dots en `absolute bottom-6` → OK sur tous les écrans | ✅ |
| Pas de test sur écrans ultra-larges (>1920px) | 🟡 Mineur |
| `container-main` → `max-w-7xl` → OK, centré avec marges | ✅ |

---

## 7. Accessibilité

### Score global : 1/10

| Critère | Statut | Détail |
|---------|--------|--------|
| Navigation clavier (Tab/Arrow) | ❌ Absent | Les dots sont des `<button>` donc focusables, mais pas de ArrowLeft/Right |
| `aria-label` sur les dots | ❌ Absent | Aucun attribut ARIA |
| `aria-live` / `aria-roledescription` | ❌ Absent | Les lecteurs d'écran ne savent pas qu'il s'agit d'un carousel |
| `role="region"` | ❌ Absent | La section n'a pas de rôle |
| `aria-roledescription="carousel"` | ❌ Absent | Non conforme WCAG 2.1 |
| Focus management | ❌ Absent | Le focus n'est pas déplacé quand le slide change |
| Contraste | ✅ OK | `text-gray-900` sur `bg-gray-100` → ratio > 7:1 |
| Taille de police | ✅ OK | 13px minimum, lisible |
| `prefers-reduced-motion` | ❌ Absent | L'autoplay et les animations GSAP ignorent la préférence utilisateur |
| Touch target | ✅ OK | Dots de 10px → acceptable mais améliorable (recommandé 24px minimum) |
| Texte alternatif images | ✅ OK | `alt={slide.title}` présent |
| Structure sémantique | 🟡 Partiel | `<section>`, `<h1>`, `<p>`, `<button>` utilisés |

---

## 8. Qualité du code

### 8.1 Métriques
| Métrique | Valeur |
|----------|--------|
| Lignes totales | 115 |
| Nombre de `useEffect` | 2 |
| Nombre de `useState` | 2 |
| Nombre de `useCallback` | 2 |
| Fonctions exportées | 1 (default) |
| Props | 0 (tout est hardcodé) |
| Tests | 0 |

### 8.2 Problèmes

| Problème | Sévérité | Explication |
|----------|----------|-------------|
| Composant monolithique | 🔴 Critique | 115 lignes, tout dans un seul fichier : données, logique, animation, rendu |
| Données hardcodées | 🟠 Modéré | `slides` est dans le composant → impossible de réutiliser le slider ailleurs |
| Aucune props | 🟠 Modéré | Le slider n'accepte ni `slides`, ni `autoplay`, ni `interval` → zero réutilisabilité |
| Sélection par classes CSS | 🔴 Critique | GSAP cible `.hero-content` au lieu de refs React → pas de isolation |
| Logique métier + animation + rendu mélangés | 🟠 Modéré | `goToSlide` gère à la fois le state, l'animation GSAP et le callback |
| Pas de gestion d'erreur | 🟠 Modéré | Si l'image 404, pas de fallback |
| Pas de typage TypeScript avancé | 🟡 Mineur | `slides` est typé implicitement, pas d'interface dédiée |
| Duplication de classes | 🟡 Mineur | `text-xs font-semibold uppercase tracking-[0.15em]` duplique `.section-label` |
| Fonction `isAnimating` non utilisée comme ref | 🟡 Mineur | `isAnimating` est dans le state → cause des re-renders → devrait être une `useRef` |
| Pas de constante pour l'interval | 🟡 Mineur | `5000` est en dur ligne 58 |

### 8.3 Violations des principes SOLID
- **S (Single Responsibility)** : ❌ Le composant gère données + animation + state + rendu
- **O (Open/Closed)** : ❌ Impossible d'étendre sans modifier (pas de props)
- **L (Liskov)** : N/A
- **I (Interface Segregation)** : N/A
- **D (Dependency Inversion)** : ❌ Fortement couplé à GSAP, pas d'abstraction

---

## 9. Dépendances

### 9.1 Dépendances directes du HeroSlider

| Package | Version | Utilisation | Poids (gzip) |
|---------|---------|-------------|--------------|
| `react` | ^19.2.0 | Composant, hooks | ~45 KB (partagé) |
| `gsap` | ^3.15.0 | Timelines d'animation | ~60 KB |
| `lucide-react` | ^0.562.0 | Icône `ArrowRight` | ~1 KB (tree-shaken) |

### 9.2 Dépendances non utilisées mais présentes
| Package | Pourrait être utilisé pour |
|---------|--------------------------|
| `embla-carousel-react` v8.6.0 | Remplacer l'implémentation maison par un slider robuste, accessible et testé |

### 9.3 Dépendances indirectes (styles)
- `tailwindcss` v3.4.19 → classes utilitaires
- `autoprefixer` → préfixes CSS
- Aucune dépendance externe pour le slider (pas de swiper, splide, etc.)

---

## 10. Améliorations proposées

### 10.1 Corrections critiques

| # | Problème | Solution | Effort |
|---|----------|----------|--------|
| 1 | Pas de cleanup GSAP | Ajouter un `useEffect` de cleanup avec `gsap.killTweensOf()` | 5 min |
| 2 | Boucle de dépendances autoplay | Utiliser `useRef` pour `currentSlide` et `goToSlide`, stabiliser l'effet | 15 min |
| 3 | Conflit d'animations parallèles | Ajouter un `useRef` `isAnimatingRef` vérifié avant toute animation | 10 min |
| 4 | Flash blanc au changement de slide | Précharger les images, utiliser 2 `<img>` superposées avec opacity | 30 min |
| 5 | Sélection par classes CSS | Remplacer par `useRef` React pour tous les éléments animés | 20 min |

### 10.2 Améliorations modérées

| # | Problème | Solution | Effort |
|---|----------|----------|--------|
| 6 | Pas de pause au hover | Ajouter `onMouseEnter`/`onMouseLeave` pour suspendre l'autoplay | 10 min |
| 7 | Pas de swipe mobile | Ajouter des handlers `touchstart`/`touchend` ou utiliser Embla | 30 min |
| 8 | Composant non réutilisable | Extraire les `slides` en props, créer une interface `SlideData` | 15 min |
| 9 | Pas d'accessibilité | Ajouter les attributs ARIA, navigation clavier, `prefers-reduced-motion` | 1h |
| 10 | Autoplay non configurable | Ajouter les props `autoplay`, `interval`, `pauseOnHover` | 10 min |

### 10.3 Améliorations mineures

| # | Problème | Solution | Effort |
|---|----------|----------|--------|
| 11 | Image non responsive | Ajouter `srcset` avec différentes résolutions | 15 min |
| 12 | `hero-primary` inexistante | Supprimer la classe ou la définir | 1 min |
| 13 | Interval en dur | Extraire en constante `AUTOPLAY_INTERVAL` | 1 min |
| 14 | `isAnimating` dans le state | Remplacer par `useRef` (pas besoin de re-render) | 5 min |
| 15 | Image mobile absente | Ajouter une variante mobile de l'image ou masquer `hidden sm:block` | 10 min |

### 10.4 Proposition alternative majeure
Remplacer l'implémentation GSAP maison par **Embla Carousel** (déjà installé dans le projet) :
- ✅ Slides, navigation, autoplay, boucle gérés nativement
- ✅ Accessible par défaut (aria, keyboard)
- ✅ Touch/swipe natif
- ✅ Lazy loading intégré
- ✅ Lighter que GSAP (~15 KB vs ~60 KB gzippé)
- ✅ Pas de manipulation DOM manuelle
- ⚠️ Perte des animations GSAP personnalisées (fade-in/out custom)

---

## 11. Plan de refactorisation

### Étape 1 : Correctifs rapides (sécurité) — 30 min
1. Ajouter `gsap.context()` ou un cleanup dans un `useEffect` de retour
2. Remplacer `useState(isAnimating)` par `useRef(isAnimating)` pour éviter les re-renders
3. Ajouter un `isAnimatingRef.current` check dans `goToSlide` pour éviter les race conditions
4. Corriger la boucle de dépendances autoplay (ref au lieu de state)

### Étape 2 : Stabilisation — 45 min
5. Remplacer la sélection par classes CSS par des `useRef`
6. Ajouter un mécanisme de préchargement d'images (deux balises `<img>` superposées)
7. Ajouter `gsap.killTweensOf()` dans le cleanup
8. Ajouter `prefers-reduced-motion` (désactiver animations + autoplay)

### Étape 3 : Accessibilité — 1h
9. Ajouter `role="region"`, `aria-roledescription="carousel"`, `aria-label`
10. Ajouter `aria-label` sur chaque dot
11. Ajouter navigation au clavier (ArrowLeft/ArrowRight)
12. Gérer le focus pendant les transitions

### Étape 4 : Réutilisabilité — 30 min
13. Créer une interface `SlideData` avec `label`, `title`, `description`, `image`, `cta`
14. Passer `slides` en props avec valeurs par défaut
15. Ajouter les props `autoplay`, `interval`, `pauseOnHover`, `showDots`, `showArrows`

### Étape 5 : Performance — 30 min
16. Ajouter `loading="lazy"` et `decoding="async"` sur les images
17. Ajouter `srcset` pour les différents breakpoints
18. Utiliser le format WebP avec fallback JPEG
19. Ajouter un placeholder/blur-up pendant le chargement

### Étape 6 : Qualité de code — 30 min
20. Extraire la logique d'animation dans un hook `useSlideAnimation`
21. Extraire la logique d'autoplay dans un hook `useAutoplay`
22. Extraire les constantes (INTERVAL, TRANSITION_DURATION)
23. Ajouter un typage strict TypeScript

### Étape 7 : Amélioration UX — 30 min
24. Ajouter le swipe sur mobile
25. Ajouter la pause au hover
26. Ajouter une image sur mobile (pas seulement desktop)
27. Ajouter une transition de progression (barre de timer)

**Temps total estimé** : ~4h30

---

## 12. Conclusion

### Scores

| Axe | Score | Commentaire |
|-----|-------|-------------|
| **Stabilité** | 4/10 | Fonctionne en utilisation normale, mais fragile : pas de cleanup, race conditions, conflits d'animation |
| **Maintenabilité** | 3/10 | Composant monolithique sans props, sélection par classes CSS, logique mélangée, zéro test |
| **Performance** | 5/10 | Images de taille correcte, mais pas de lazy loading, pas de responsive images, bundle GSAP lourd |
| **Qualité du code** | 3/10 | Pas de typage, classes mortes, duplication, constantes en dur, non réutilisable |
| **Accessibilité** | 1/10 | Aucun attribut ARIA, pas de navigation clavier, ignore `prefers-reduced-motion` |
| **Responsive** | 5/10 | Layout adaptatif correct mais pas d'image sur mobile |

### Score global : **3.5 / 10**

### Résumé
Le Hero Slider est un composant fonctionnel qui remplit son rôle de base (afficher 2 slides avec autoplay) mais souffre de **problèmes structurels importants** : pas de cleanup GSAP, boucle de dépendances React, absence totale d'accessibilité, et code non réutilisable.

La bonne nouvelle : le projet dispose déjà d'**Embla Carousel** (`embla-carousel-react` v8.6.0) qui pourrait remplacer avantageusement l'implémentation maison. Une refactorisation progressive en 7 étapes permettrait d'atteindre un niveau professionnel sans casser le reste du projet.

### Recommandation principale
**Remplacer l'implémentation GSAP maison par Embla Carousel** (déjà dans les dépendances). Cela résoudrait d'un coup les problèmes de stabilité, d'accessibilité, de swipe mobile, de préchargement et de maintenabilité, tout en réduisant la taille du code de ~115 lignes à ~30 lignes.
