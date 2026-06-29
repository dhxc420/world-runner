import { hashNonce } from '@/auth/wallet/client-helpers';
import { fetchWorldUserProfile } from '@/lib/worldUserProfile';
import type { MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js/commands';
import { verifySiweMessage } from '@worldcoin/minikit-js/siwe';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    walletAddress: string;
    username: string;
    profilePictureUrl: string;
    isGuest?: boolean;
  }

  interface Session {
    user: {
      walletAddress: string;
      username: string;
      profilePictureUrl: string;
      isGuest?: boolean;
    } & DefaultSession['user'];
  }
}

// Auth configuration for Wallet Auth based sessions
// For more information on each option (and a full list of options) go to
// https://authjs.dev/getting-started/authentication/credentials
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'World App Wallet',
      credentials: {
        mode: { label: 'Mode', type: 'text' },
        nonce: { label: 'Nonce', type: 'text' },
        signedNonce: { label: 'Signed Nonce', type: 'text' },
        statement: { label: 'Statement', type: 'text' },
        finalPayloadJson: { label: 'Final Payload', type: 'text' },
      },
      // @ts-expect-error TODO
      authorize: async ({
        mode,
        nonce,
        signedNonce,
        statement,
        finalPayloadJson,
      }: {
        mode?: string;
        nonce: string;
        signedNonce: string;
        statement?: string;
        finalPayloadJson: string;
      }) => {
        if (mode === 'guest') {
          return {
            id: `guest_${crypto.randomUUID()}`,
            walletAddress: '',
            username: 'invitado',
            profilePictureUrl: '',
            isGuest: true,
          };
        }

        const expectedSignedNonce = hashNonce({ nonce });

        if (signedNonce !== expectedSignedNonce) {
          console.log('Invalid signed nonce');
          return null;
        }

        const finalPayload: MiniAppWalletAuthSuccessPayload =
          JSON.parse(finalPayloadJson);
        const result = await verifySiweMessage(finalPayload, nonce, statement);

        if (!result.isValid || !result.siweMessageData.address) {
          console.log('Invalid SIWE payload');
          return null;
        }

        const userInfo = await fetchWorldUserProfile(finalPayload.address);

        return {
          id: finalPayload.address,
          ...userInfo,
          isGuest: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.username = user.username;
        token.profilePictureUrl = user.profilePictureUrl;
        token.isGuest = user.isGuest ?? false;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.walletAddress = token.walletAddress as string;
        session.user.username = token.username as string;
        session.user.profilePictureUrl = token.profilePictureUrl as string;
        session.user.isGuest = Boolean(token.isGuest);
      }

      return session;
    },
  },
});
