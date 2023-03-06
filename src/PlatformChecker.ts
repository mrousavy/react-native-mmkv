export function isJest(): boolean {
  if (global.process == null) {
    // In a WebBrowser/Electron the `process` variable does not exist
    return false;
  }
  return process.env.JEST_WORKER_ID != null;
}
