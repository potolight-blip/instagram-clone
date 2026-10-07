/**
 * start-backend.mjs
 * 
 * npm run dev 시 concurrently가 백엔드를 실행할 때
 * backend/ 디렉터리를 cwd로 지정하여 uvicorn을 올바르게 구동합니다.
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.join(__dirname, 'backend');

const python = process.platform === 'win32' ? 'python' : 'python3';

const proc = spawn(
  python,
  ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
  {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: false,
  }
);

proc.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => proc.kill('SIGINT'));
process.on('SIGTERM', () => proc.kill('SIGTERM'));
