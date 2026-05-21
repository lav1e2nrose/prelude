import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const distIndex = join(process.cwd(), 'dist', 'index.html')
if (!existsSync(distIndex)) {
  console.error('未找到 dist/index.html，请先运行 npm run build')
  process.exit(1)
}

const electron = spawn('npx', ['electron', './electron/main.mjs'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env
})

electron.on('exit', (code) => process.exit(code ?? 0))
