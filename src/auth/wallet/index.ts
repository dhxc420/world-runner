import { MiniKit } from '@worldcoin/minikit-js';
import { signIn } from 'next-auth/react';
import { getNewNonces } from './server-helpers';

export type WalletAuthResult = { ok: true } | { ok: false; error: string };

/**
 * Authenticates a user via their wallet using a nonce-based challenge-response mechanism.
 */
export const walletAuth = async (): Promise<WalletAuthResult> => {
  try {
    const { nonce, signedNonce } = await getNewNonces();
    const statement = `Authenticate (${crypto.randomUUID().replace(/-/g, '')}).`;

    const result = await MiniKit.walletAuth({
      nonce,
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
      statement,
    });

    if (!result?.data?.address || !result.data.message || !result.data.signature) {
      return { ok: false, error: 'Wallet auth cancelled or incomplete' };
    }

    const signInResult = await signIn('credentials', {
      redirect: false,
      nonce,
      signedNonce,
      statement,
      finalPayloadJson: JSON.stringify({
        status: 'success',
        address: result.data.address,
        message: result.data.message,
        signature: result.data.signature,
      }),
    });

    if (signInResult?.error) {
      return { ok: false, error: signInResult.error };
    }

    return { ok: true };
  } catch (error) {
    console.error('walletAuth error', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Wallet auth failed',
    };
  }
};
