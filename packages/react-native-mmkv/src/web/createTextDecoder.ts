export function createTextDecoder(): TextDecoder {
  const g = global ?? globalThis ?? window
  if (g.TextDecoder != null) {
    return new g.TextDecoder()
  } else {
    return {
      decode: () => {
        throw new Error('TextDecoder is not supported in this environment!')
      },
      encoding: 'utf-8',
      fatal: false,
      ignoreBOM: false,
    }
  }
}
