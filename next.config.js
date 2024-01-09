/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        hostname: "scontent.fdac22-1.fna.fbcdn.net",
      },
    ],
  },
};

module.exports = nextConfig;
