/**
 * Regenerate the browser assets from the supplied, untouched Models3D files.
 * Run: node scripts/optimize-models.mjs
 * Installs pinned build tools in the OS temporary directory, never in the app.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolDir = await mkdtemp(join(tmpdir(), 'kemet-gltf-'));
const models = [
  ['KEMET ROYAL 3D.glb', 'temple', 1536, 0.045, 0.001],
  ['estatua.glb', 'statue', 1024, 0.023, 0.0015],
  ['eyes of orus.glb', 'eye', 1024, 0.025, 0.002],
  ['papiro.glb', 'papyrus', 1024, 0.023, 0.0015],
  ['pyramid.glb', 'pyramid', 1024, 0.023, 0.0015],
];

try {
  execFileSync('npm', ['install', '--prefix', toolDir, '--no-audit', '--no-fund',
    '@gltf-transform/cli@4.5.0', '@gltf-transform/core@4.5.0', '@gltf-transform/functions@4.5.0'],
  { stdio: 'inherit' });
  const packagePath = (...parts) => join(toolDir, 'node_modules', '@gltf-transform', ...parts);
  const { NodeIO } = await import(pathToFileURL(packagePath('core', 'dist', 'index.js')));
  const { prune } = await import(pathToFileURL(packagePath('functions', 'dist', 'index.js')));
  const io = new NodeIO();
  await mkdir(join(root, 'public', 'models'), { recursive: true });

  for (const [source, name, textureSize, ratio, error] of models) {
    const output = join(root, 'public', 'models', `${name}.glb`);
    execFileSync(process.execPath, [packagePath('cli', 'bin', 'cli.js'), 'optimize',
      join(root, 'Models3D', source), output,
      '--compress', 'false', '--texture-compress', 'auto', '--texture-size', String(textureSize),
      '--simplify-ratio', String(ratio), '--simplify-error', String(error), '--instance', 'false'],
    { stdio: 'inherit' });
    const document = await io.read(output);
    // Three.js derives the normal-map tangent frame in the shader when tangents
    // are absent. This saves 16 bytes per vertex without requiring a decoder.
    for (const mesh of document.getRoot().listMeshes()) {
      for (const primitive of mesh.listPrimitives()) primitive.setAttribute('TANGENT', null);
    }
    await document.transform(prune());
    await io.write(output, document);
  }
} finally {
  await rm(toolDir, { recursive: true, force: true });
}
