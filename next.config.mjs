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
  // Baseline security headers on every route. Deliberately no Content-Security-
  // Policy yet: a correct CSP needs per-request nonces for Next's inline scripts
  // and a relaxed variant for the embedded Studio at /studio, and a wrong CSP
  // silently breaks the site — so it gets its own tested pass rather than a
  // guess here.
  async headers() {
    const securityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
