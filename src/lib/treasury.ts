/** Wallet tesorería que recibe pagos WLD y transferencias $RCOL (Vuela RCOl). */
export function getTreasuryAddress(): `0x${string}` | undefined {
  const addr =
    process.env.NEXT_PUBLIC_TREASURY_ADDRESS?.trim() ||
    process.env.NEXT_PUBLIC_PAYMENT_ADDRESS?.trim();
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) return undefined;
  return addr as `0x${string}`;
}

export function getRcolTokenAddress(): `0x${string}` | undefined {
  const addr = process.env.NEXT_PUBLIC_RCOL_TOKEN?.trim();
  if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) return undefined;
  return addr as `0x${string}`;
}

export function isRcolPaymentsConfigured(): boolean {
  return Boolean(getTreasuryAddress() && getRcolTokenAddress());
}
