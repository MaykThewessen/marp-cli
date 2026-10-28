import { smokeTest } from './scripts/standalone/smoke-test.mjs'
import { updateWindowsMetadata } from './scripts/standalone/win-meta.mjs'

const optimized = !!process.env.MARP_CLI_PKG_OPTIMIZED
const debug = !!process.env.MARP_CLI_PKG_DEBUG
const compress = process.env.MARP_CLI_PKG_COMPRESS || 'Brotli'

export default {
  compress,
  outputPath: 'bin',
  scripts: [
    'lib/**/*.js',
    // MathJax resolves this through a package #imports alias that pkg's walker
    // cannot discover from the JavaScript import alone.
    'node_modules/mhchemparser/esm/**/*.js',
  ],
  assets: ['node_modules/mhchemparser/esm/package.json'],
  sea: true,
  targets: ['host'],
  debug,
  postBuild: async (bin) => {
    // Windows: Update resource metadata (icon, version info, etc.)
    if (process.platform === 'win32') await updateWindowsMetadata(bin)

    await smokeTest(bin)
  },
  ...(optimized && {
    ignore: [
      '**/node_modules/**/typescript/**',
      '**/*.map',
      '**/*.ts',
      '**/{test,tests,__tests__}/**',
      '**/*.{test,spec}.*',
      '**/*.md',
      `**/prebuilds/!(${process.platform}-${process.arch})/**/*.bare`,
    ],
  }),
}
