/**
 * Tasa RCOL↔WLD (Vuela RCOl): 100.000 RCOL ≈ 1.7727 WLD.
 * Ajusta solo RCOL_PER_WLD si cambia el mercado.
 */
export const RCOL_PER_WLD = 100_000 / 1.7727;

export function rcolPriceForWld(wld: number): number {
  return Math.round(wld * RCOL_PER_WLD);
}

export function formatRcol(amount: number): string {
  return amount.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
