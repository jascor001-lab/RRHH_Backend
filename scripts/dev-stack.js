/**
 * Arranca RRHH (PostgreSQL, puerto 3007) + MinIO (puerto 3010).
 * Evita el error de Nest con "&" en rutas de Windows.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const node = process.execPath;
const backendRoot = path.resolve(__dirname, '..');
const minioRoot = path.resolve(
  backendRoot,
  '..',
  '..',
  'MinioBackendserv',
  'miniobackendserv',
);

const children = [];

function startService(label, scriptPath, cwd) {
  if (!fs.existsSync(scriptPath)) {
    console.error(`[stack] No se encontró ${scriptPath}`);
    return null;
  }

  console.log(`[stack] Iniciando ${label}...`);
  const child = spawn(node, [scriptPath], {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
    windowsHide: true,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[stack] ${label} terminó con código ${code}`);
    }
  });

  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], {
          stdio: 'ignore',
          shell: false,
          windowsHide: true,
        });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('========================================');
console.log(' RRHH Stack');
console.log(' - Backend + PostgreSQL : puerto 3007');
console.log(' - MinIO (boletas)      : puerto 3010');
console.log(' - Frontend             : puerto 3004');
console.log('========================================');

if (!fs.existsSync(minioRoot)) {
  console.error(`[stack] Carpeta MinIO no encontrada: ${minioRoot}`);
  process.exit(1);
}

startService(
  'RRHH Backend',
  path.join(backendRoot, 'scripts', 'dev.js'),
  backendRoot,
);

startService(
  'MinIO Backend',
  path.join(minioRoot, 'scripts', 'dev.js'),
  minioRoot,
);
