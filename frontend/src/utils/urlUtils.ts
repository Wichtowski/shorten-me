const MAX_FREE_SHORTENS = 3;

export const canShortenMore = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return true; // Authenticated users have no limit
  }
  const count = parseInt(localStorage.getItem("shortenCount") || "0");
  return count < MAX_FREE_SHORTENS;
};

export const incrementShortenCount = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Only increment count for non-authenticated users
    const count = parseInt(localStorage.getItem("shortenCount") || "0");
    localStorage.setItem("shortenCount", (count + 1).toString());
  }
};
