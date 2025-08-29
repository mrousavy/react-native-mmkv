import type { ConfigPlugin } from '@expo/config-plugins'
import { createRunOncePlugin, withGradleProperties } from '@expo/config-plugins'

const pkg = require('../../package.json')

const withMMKV: ConfigPlugin<{}> = (config) => {
  // remove 32-bit architectures from gradle.properties
  return withGradleProperties(config, (cfg) => {
    // Drop any existing entry…
    cfg.modResults = cfg.modResults.filter(
      (p) => !(p.type === 'property' && p.key === 'reactNativeArchitectures')
    )
    // …and force 64-bit only.
    cfg.modResults.push({
      type: 'property',
      key: 'reactNativeArchitectures',
      value: 'arm64-v8a,x86_64',
    })
    return cfg
  })
}

export default createRunOncePlugin(withMMKV, pkg.name, pkg.version)
