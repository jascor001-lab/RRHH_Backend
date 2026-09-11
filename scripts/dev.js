/**
 * Arranque en watch sin shell=true.
 * En Windows, rutas con "&" (ej. RRHH_Front&Back) rompen `nest start --watch`.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const node = process.execPath;
const tsc = require.resolve('typescript/bin/tsc');
const mainJs = path.join(root, 'dist', 'main.js');

let app = null;
let restartTimer = null;

function killApp() {
  if (!app || !app.pid) return;
  const pid = app.pid;
  app = null;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(pid), '/f', '/t'], {
        stdio: 'ignore',
        shell: false,
        windowsHide: true,
      });
    } else {
      process.kill(pid, 'SIGTERM');
    }
  } catch {
    // proceso ya cerrado
  }
}

function startApp() {
  if (!fs.existsSync(mainJs)) {
    console.error('[dev] No existe dist/main.js. Compila primero.');
    return;
  }

  killApp();
  if (restartTimer) clearTimeout(restartTimer);

  restartTimer = setTimeout(() => {
    console.log('[dev] Iniciando aplicación...');
    app = spawn(node, [mainJs], {
      cwd: root,
      stdio: 'inherit',
      shell: false,
      env: process.env,
      windowsHide: true,
    });

    app.on('exit', (code, signal) => {
      if (signal) return;
      if (code && code !== 0) {
        console.error(`[dev] App salió con código ${code}`);
      }
    });
  }, 250);
}

function runTsc(args) {
  return spawn(node, [tsc, ...args], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
}

function buildOnce() {
  return new Promise((resolve, reject) => {
    const child = runTsc(['-p', 'tsconfig.build.json']);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Compilación falló (${code})`));
    });
  });
}

async function main() {
  console.log('[dev] Compilando...');
  await buildOnce();
  startApp();

  console.log('[dev] Watch activo (seguro con rutas que contienen &)');
  const watch = spawn(
    node,
    [tsc, '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    },
  );

  const handleOut = (buf) => {
    const text = buf.toString();
    process.stdout.write(text);
    if (/Found 0 errors\. Watching for file changes\./.test(text)) {
      startApp();
    }
  };

  watch.stdout.on('data', handleOut);
  watch.stderr.on('data', (buf) => process.stderr.write(buf));

  const shutdown = () => {
    killApp();
    try {
      watch.kill();
    } catch {
      // ignore
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
