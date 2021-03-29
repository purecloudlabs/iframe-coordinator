module.exports = {
  entryPoints: ['src/client.ts', 'src/host.ts'],
  out: 'doc',
  excludeExternals: true,
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  includeVersion: true
};
