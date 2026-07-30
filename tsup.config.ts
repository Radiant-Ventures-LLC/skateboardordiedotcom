import { defineConfig } from 'tsup';

export default defineConfig({
  // One entry per source module.
  entry: ['src/index.ts', 'src/voice.ts', 'src/lib/cn.ts', 'src/components/*.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Transpile-only (no bundling). esbuild emits one output per input file,
  // preserving the module graph AND module-level directives — a bundled build
  // strips `'use client'` ("directives cause errors when bundled"), but a
  // transpile-only build keeps them. This makes each interactive component its
  // own client boundary while the barrel (index) stays a thin set of
  // re-exports, so React Server Components can import server-safe pieces
  // (voice, cn, presentational components) without crossing a client boundary.
  bundle: false,
  external: ['react', 'react-dom', 'clsx', 'tailwind-merge'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
});
