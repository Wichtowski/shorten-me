export const isMockMode = () => {
    const params = new URLSearchParams();
    return params.has('applyMocks');
};

export const generateMockShortUrl = (originalUrl: string) => {
    const rand = Math.random();
    const mockId = rand !== undefined ? rand.toString(36).substring(2, 8) : '';
    return `http://localhost:3000/${mockId}`;
};

export const getShortenCount = () => {
    const count = localStorage.getItem('shortenCount');
    return count ? parseInt(count, 10) : 0;
};

export const incrementShortenCount = () => {
    const currentCount = getShortenCount();
    localStorage.setItem('shortenCount', currentCount !== undefined ? (currentCount + 1).toString() : '1');
    return currentCount + 1;
};

export const canShortenMore = () => {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    return getShortenCount() < 3;
};

export const getApiUrl = (): string => {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:8000';
    } else {
        return process.env.BACKEND_API_BASE_URL!;
    }
};
