// All types
export type { MMKV } from './specs/MMKV.nitro'
export type {
  BackupAllMMKVOptions,
  BackupMMKVOptions,
  Configuration,
  Mode,
  RestoreAllMMKVOptions,
  RestoreMMKVOptions,
} from './specs/MMKVFactory.nitro'

// The create function
export { createMMKV } from './createMMKV/createMMKV'

// Exists + Delete
export { existsMMKV } from './existsMMKV/existsMMKV'
export { deleteMMKV } from './deleteMMKV/deleteMMKV'

// Backup + Restore
export { backupMMKV } from './backupMMKV/backupMMKV'
export { restoreMMKV } from './restoreMMKV/restoreMMKV'
export { backupAllMMKV } from './backupAllMMKV/backupAllMMKV'
export { restoreAllMMKV } from './restoreAllMMKV/restoreAllMMKV'

// All the hooks
export { useMMKV } from './hooks/useMMKV'
export { useMMKVBoolean } from './hooks/useMMKVBoolean'
export { useMMKVBuffer } from './hooks/useMMKVBuffer'
export { useMMKVNumber } from './hooks/useMMKVNumber'
export { useMMKVObject } from './hooks/useMMKVObject'
export { useMMKVString } from './hooks/useMMKVString'
export { useMMKVListener } from './hooks/useMMKVListener'
export { useMMKVKeys } from './hooks/useMMKVKeys'
