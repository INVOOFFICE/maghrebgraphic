// Produits extraits de produi.md
// Pour modifier le catalogue : ajouter/supprimer des entrées dans ce tableau

export interface Product {
  name: string;
  specs: string;
}

export const products: Product[] = [
  { name: 'Oneway Vision', specs: '—' },
  { name: "Vinyl d'impression", specs: '—' },
  { name: 'Vinyl super clair', specs: '—' },
  { name: 'Vinyl sablé', specs: '—' },
  { name: 'Vinyl / Floor Graphic', specs: '—' },
  { name: 'Bâche laminée', specs: '440g' },
  { name: 'Bâche enduite', specs: '450g' },
  { name: 'Film PET pour Roll-up', specs: '—' },
  { name: 'Backlit tissu', specs: 'Solvent, UV' },
  { name: 'Canvas coton', specs: '280g' },
  { name: 'Canvas polyester', specs: '280g' },
  { name: 'Papier peint', specs: 'Solvent, UV' },
  { name: 'Poly', specs: '2m × 3m — 5mm (850g / 950g)' },
  { name: 'Forex', specs: '3mm, 5mm, 10mm, 15mm, 19mm' },
  { name: 'Plexi miroir doré (adhésif)', specs: '0,8mm — 1,22 × 2,44 m' },
  { name: 'LED Lightbox', specs: '1m × 2m / 2m × 2m' },
  { name: 'ABS Plastic Promotable', specs: '—' },
  { name: 'Cadre Clic Clac Coin Rond', specs: 'A3 / A4' },
  { name: 'Roll-up de Luxe', specs: '85cm × 2m / 1m × 2m / 2m × 2m' },
  { name: 'New UK Roll-up', specs: '85cm × 2m / 1,2m × 2m' },
  { name: 'X-Banner', specs: '80 × 180 cm' },
  { name: 'Photocall réglable', specs: '2,4m × 2,4m' },
  { name: 'Curved Spring Pop-up avec cintre', specs: '—' },
  { name: 'Pop-up velcro 16 poteaux', specs: '—' },
  { name: 'A1 Stop Trottoirs double face', specs: '—' },
];
