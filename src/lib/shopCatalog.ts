/** Solo cosméticos — sin ventaja competitiva */
export type ShopProductId = 'premium_skin' | 'wonder_trail' | 'spirit_aura';

export type PayMode = 'wld' | 'rcol';

export interface ShopProduct {
  id: ShopProductId;
  name: string;
  description: string;
  emoji: string;
  /** Precio base en WLD; RCOL se deriva con rcolPriceForWld(). */
  wldAmount: number;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'premium_skin',
    name: 'Neon Runner Skin',
    description: 'Skin premium con estela magenta. Solo visual.',
    emoji: '✨',
    wldAmount: 0.5,
  },
  {
    id: 'wonder_trail',
    name: 'Wonder Trail',
    description: 'Estela arcoíris estilo Mario Wonder. Solo visual.',
    emoji: '🌈',
    wldAmount: 0.15,
  },
  {
    id: 'spirit_aura',
    name: 'Spirit Aura',
    description: 'Aura Sein de Ori alrededor de tu mariposa. Solo visual.',
    emoji: '🕯️',
    wldAmount: 0.15,
  },
];

export const WORLD_ID_ACTION = 'world-runner-verify';
