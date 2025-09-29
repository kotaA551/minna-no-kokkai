import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ 本番ビルド中は ESLint エラーで失敗しない
  eslint: {
    ignoreDuringBuilds: true,
  },

  // （本当に詰まった時だけ有効化。型エラーでも落ちなくなる）
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
