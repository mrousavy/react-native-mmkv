/* global TextEncoder */
export function createTextEncoder(): TextEncoder {
  if (global.TextEncoder != null) {
    return new global.TextEncoder();
  } else {
    return {
      encode: () => {
        throw new Error('TextEncoder is not supported in this environment!');
      },
      encodeInto: () => {
        throw new Error('TextEncoder is not supported in this environment!');
      },
      encoding: 'utf-8',
    };
  }
}
