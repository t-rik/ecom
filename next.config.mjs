/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/products/auto/aspirateur-sans-fil',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
