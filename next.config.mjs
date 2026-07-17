/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Review images come from Sanity's CDN. next/image rejects any remote host
    // that isn't allowlisted here — without this, every review throws
    // "Invalid src prop … hostname not configured" and the page renders nothing.
    // This could not surface while the site ran on the local /art fixture.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
