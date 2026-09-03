export function isTest(): boolean {
  if (global.process == null) {
    // In a WebBrowser/Electron the `process` variable does not exist
    return false
  }
  // Read through a variable rather than as `process.env.JEST_WORKER_ID`.
  //
  // Metro parallelises transforms with jest-worker, which sets JEST_WORKER_ID
  // in each worker process, and bundlers such as babel-preset-expo inline
  // static `process.env.X` member expressions at transform time -- including
  // inside node_modules. The transform worker's id therefore gets baked into
  // the app bundle as a literal, isTest() returns true in a normal debug or
  // release build, and createMMKV() silently returns the in-memory mock.
  // Storage then appears to work in-session but is never written to disk.
  //
  // Only static member expressions are inlined, so indexing a variable sees
  // the real runtime environment. Jest and Vitest still set these at runtime
  // in their workers, so genuine test runs are unaffected.
  const env: Record<string, string | undefined> = global.process.env || {}
  return Boolean(env['JEST_WORKER_ID'] || env['VITEST_WORKER_ID'])
}
