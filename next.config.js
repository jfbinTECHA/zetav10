/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // You may add CSP if safe
        ],
      },
    ];
  },
};

module.exports = nextConfig;
