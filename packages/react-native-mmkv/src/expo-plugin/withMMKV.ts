import type { ConfigPlugin } from '@expo/config-plugins'
import { createRunOncePlugin, withGradleProperties } from '@expo/config-plugins'

const pkg = require('../../package.json')

const withMMKV: ConfigPlugin<{}> = (config) => {
  // remove 32-bit architectures from gradle.properties
  return withGradleProperties(config, (cfg) => {
    // Define the wanted property
    const property = {
      type: 'property',
      key: 'reactNativeArchitectures',
      value: 'arm64-v8a,x86_64',
    } as const
    // If it exists, update its value
    const index = cfg.modResults.findIndex(
      (p) => p.type === 'property' && p.key === property.key
    )
    if (index !== -1) {
      cfg.modResults[index] = property
    }
    // Else add it to the properties
    else {
      cfg.modResults.push(property)
    }
    return cfg
  })
}

export default createRunOncePlugin(withMMKV, pkg.name, pkg.version)
