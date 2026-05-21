import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const DEV_SERVER_URL = 'http://127.0.0.1:5173'
const vite = spawn('npm', ['run', 'dev:web', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

const shutdown = () => {
  if (!vite.killed) {
    vite.kill()
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('exit', shutdown)

const waitForDevServer = async () => {
  for (let i = 0; i < 120; i += 1) {
    try {
      await fetch(DEV_SERVER_URL)
      return
    } catch {
      await delay(500)
    }
  }
  throw new Error('Vite dev server failed to start within 60s')
}

try {
  await waitForDevServer()
  const electron = spawn('npx', ['electron', './electron/main.mjs'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: DEV_SERVER_URL
    }
  })

  electron.on('exit', () => {
    shutdown()
    process.exit(0)
  })
} catch (error) {
  shutdown()
  console.error(error)
  process.exit(1)
}
