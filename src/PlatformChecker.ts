export function isJest(): boolean {
  return process.env.JEST_WORKER_ID != null;
}
