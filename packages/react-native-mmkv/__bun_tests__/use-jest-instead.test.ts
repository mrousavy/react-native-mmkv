import { test } from 'bun:test'

test('❌ DO NOT USE `bun test` - Use `bun run test` instead!', () => {
  console.error(`
🚨 WRONG TEST RUNNER! 🚨

You ran: \`bun test\`
You should run: \`bun run test\`

Why?
- This project uses Jest for testing React Native components
- Bun's test runner doesn't support Flow syntax in React Native
- Jest is configured with proper Babel transforms for TypeScript/JSX
- MMKV's mock system is designed for Jest environment

To run tests correctly:
  bun run test

This will use Jest with the proper configuration.
  `)

  throw new Error("Use 'bun run test' instead of 'bun test'!")
})
