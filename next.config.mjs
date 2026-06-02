/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse pulls in pdfjs-dist, which breaks when bundled by webpack for the
  // server runtime — it must be loaded natively from node_modules at request
  // time. Keeping these external mirrors how they run under plain Node. mammoth
  // is along for the same ride to be safe. Both are only imported in the
  // /api/parse-file route at runtime, never on the client.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
