import type { NextConfig } from 'next';
const config: NextConfig = {
  // Use the TS6 compiler API; CLI stdout parsing failed in the managed runner.
  // Type checking remains enabled, and CI also runs tsc independently.
  experimental: { useTypeScriptCli: false },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(self)' },
      { key: 'X-Frame-Options', value: 'DENY' }
    ] }];
  }
};
export default config;
