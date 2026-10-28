import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { run } from './utils/run.mjs'

// A version check does not load the bundled rendering plugins. Exercise them
// outside the checkout so local node_modules cannot hide missing SEA assets.
/** @param {string} bin @returns {Promise<void>} */
export async function smokeTest(bin) {
  await run(bin, ['-v'])

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'marp-cli-smoke-'))
  const input = path.join(tmpDir, 'slides.md')
  const output = path.join(tmpDir, 'slides.html')

  try {
    await fs.writeFile(
      input,
      [
        '```javascript\nconst answer = 42\n```',
        '$x^2$',
        '```mermaid\ngraph LR\n  A --> B\n```',
      ].join('\n\n')
    )
    await run(bin, [input, '-o', output], { cwd: tmpDir })

    const html = await fs.readFile(output, 'utf8')
    assert.match(html, /--marp-shiki-token-keyword/)
    assert.match(html, /data-mml-node="math"/)
    assert.match(html, /<svg data-marp-mermaid/)
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}
