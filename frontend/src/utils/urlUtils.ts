export const isMockMode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.has('applyMocks');
};

export const generateMockShortUrl = (originalUrl: string) => {
    const mockId = Math.random().toString(36).substring(2, 8);
    return `http://localhost:3000/${mockId}`;
};

export const getShortenCount = () => {
    const count = localStorage.getItem('shortenCount');
    return count ? parseInt(count, 10) : 0;
};

export const incrementShortenCount = () => {
    const currentCount = getShortenCount();
    localStorage.setItem('shortenCount', (currentCount + 1).toString());
    return currentCount + 1;
};

export const canShortenMore = () => {
    return getShortenCount() < 3;
}; 