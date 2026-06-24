import { signIn } from 'next-auth/react';

export type GuestAuthResult = { ok: true } | { ok: false; error: string };

export const guestAuth = async (): Promise<GuestAuthResult> => {
  const result = await signIn('credentials', {
    redirect: false,
    mode: 'guest',
    nonce: '',
    signedNonce: '',
    finalPayloadJson: '{}',
  });

  if (result?.error) {
    return { ok: false, error: result.error };
  }

  if (result?.ok === false) {
    return { ok: false, error: 'No se pudo iniciar sesión de invitado' };
  }

  return { ok: true };
};
