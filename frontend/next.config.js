/** @type {import('next').NextConfig} */
const nextConfig = {
    // ... existing code ...
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
    webpack: (config, { isServer }) => {
        // Exclude v1 routes from build
        config.module.rules.push({
            test: /\/api\/v1\/.*/,
            use: 'ignore-loader'
        });
        return config;
    }
}

module.exports = nextConfig 