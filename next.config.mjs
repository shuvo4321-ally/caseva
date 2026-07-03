/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Allow phones on the LAN to load dev-server assets (Next blocks
  // non-localhost origins by default in development)
  allowedDevOrigins: ["192.168.0.175"],
};

export default nextConfig;
