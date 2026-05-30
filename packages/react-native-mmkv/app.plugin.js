const {
  createRunOncePlugin,
  withGradleProperties,
  withPodfile,
} = require('@expo/config-plugins')
const pkg = require('./package.json')

const ANDROID_LOG_LEVEL_PROPERTY = 'MMKV_logLevel'
const IOS_LOG_LEVEL_VARIABLE = '$MMKVLogLevel'

function normalizeLogLevel(logLevel) {
  if (logLevel == null) {
    return null
  }

  if (typeof logLevel === 'string' && logLevel.trim() === '') {
    throw new Error('react-native-mmkv: logLevel must be an integer between 0 and 4.')
  }

  const value = Number(logLevel)

  if (!Number.isInteger(value) || value < 0 || value > 4) {
    throw new Error('react-native-mmkv: logLevel must be an integer between 0 and 4.')
  }

  return String(value)
}

function setGradleProperty(properties, key, value) {
  const existing = properties.find(
    (item) => item.type === 'property' && item.key === key
  )

  if (existing != null) {
    existing.value = value
  } else {
    properties.push({
      type: 'property',
      key,
      value,
    })
  }

  return properties
}

function setPodfileVariable(contents, value) {
  const line = `${IOS_LOG_LEVEL_VARIABLE} = ${value}`
  const pattern = /^\s*\$MMKVLogLevel\s*=.*$/m

  if (pattern.test(contents)) {
    return contents.replace(pattern, line)
  }

  return `${line}\n${contents}`
}

function withMMKV(config, props = {}) {
  const logLevel = normalizeLogLevel(props.logLevel)

  if (logLevel == null) {
    return config
  }

  config = withGradleProperties(config, (config) => {
    config.modResults = setGradleProperty(
      config.modResults,
      ANDROID_LOG_LEVEL_PROPERTY,
      logLevel
    )

    return config
  })

  config = withPodfile(config, (config) => {
    config.modResults.contents = setPodfileVariable(
      config.modResults.contents,
      logLevel
    )

    return config
  })

  return config
}

module.exports = createRunOncePlugin(withMMKV, pkg.name, pkg.version)
