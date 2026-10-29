import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// SVG is the source asset; generated files are shipped in the native packages.
const assets = fileURLToPath(new URL('../electron/assets/', import.meta.url));
for (const args of [
  ['-background', 'none', path.join(assets, 'sidemaster-icon.svg'), '-resize', '512x512', '-depth', '8', '-strip', path.join(assets, 'sidemaster-icon.png')],
  [path.join(assets, 'sidemaster-icon.png'), '-define', 'icon:auto-resize=256,128,64,48,32,16', path.join(assets, 'sidemaster-icon.ico')],
]) {
  const result = spawnSync('magick', args, { stdio: 'inherit' });
  if (result.error) throw new Error(`A geração de ícones precisa do ImageMagick (magick): ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Ícones PNG (512 px) e ICO (16–256 px) gerados do SVG.');
