module.exports = {
  entryPoints: ['src/client.ts', 'src/host.ts'],
  includes: 'doc',
  out: 'dist/docs',
  excludeExternals: true,
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  includeVersion: true
};
