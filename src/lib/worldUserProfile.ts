export async function fetchWorldUserProfile(address: string) {
  const res = await fetch('https://usernames.worldcoin.org/api/v1/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses: [address] }),
  });

  if (!res.ok) {
    return {
      walletAddress: address,
      username: '',
      profilePictureUrl: '',
    };
  }

  const usernames = (await res.json()) as Array<{
    username?: string | null;
    profile_picture_url?: string | null;
  }>;
  const profile = usernames?.[0];

  return {
    walletAddress: address,
    username: profile?.username ?? '',
    profilePictureUrl: profile?.profile_picture_url ?? '',
  };
}
