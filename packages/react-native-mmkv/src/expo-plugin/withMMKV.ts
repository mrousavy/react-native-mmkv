import configPlugins, {type ConfigPlugin } from '@expo/config-plugins'

const withMMKV: ConfigPlugin<{}> = (config) => {
  // remove 32-bit architectures from gradle.properties
  return configPlugins.withGradleProperties(config, (cfg) => {
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
      // Overwrite it
      cfg.modResults[index] = property
    } else {
      // Append it
      cfg.modResults.push(property)
    }
    return cfg
  })
}

export default withMMKV