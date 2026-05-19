/**
 * Typography tokens — identical to the Customer App for brand consistency.
 */
export const fonts = {
  primary: 'Montserrat',
  display: 'Outfit',
  serif: 'Baskervville',
};

export const fontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  small: 14,
  xs: 12,
  xxs: 10,
};

export const fontWeights = {
  thin: '200',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontSizeName = keyof typeof fontSizes;
