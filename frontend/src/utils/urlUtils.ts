const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
const MAX_FREE_SHORTENS = 3;

export const isMockMode = () => MOCK_MODE;

export const generateMockShortUrl = () => {
  const mockId = Math.random().toString(36).substring(2, 8);
  return `${window.location.origin}/s/${mockId}`;
};

export const canShortenMore = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return true; // Authenticated users have no limit
  }
  const count = parseInt(localStorage.getItem('shortenCount') || '0');
  return count < MAX_FREE_SHORTENS;
};

export const incrementShortenCount = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Only increment count for non-authenticated users
    const count = parseInt(localStorage.getItem('shortenCount') || '0');
    localStorage.setItem('shortenCount', (count + 1).toString());
  }
};
