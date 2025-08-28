export function createTextEncoder() {
  const g = global ?? globalThis ?? window
  if (g.TextEncoder != null) {
    return new g.TextEncoder()
  } else {
    return {
      encode: () => {
        throw new Error('TextEncoder is not supported in this environment!')
      },
      encodeInto: () => {
        throw new Error('TextEncoder is not supported in this environment!')
      },
      encoding: 'utf-8',
    }
  }
}
