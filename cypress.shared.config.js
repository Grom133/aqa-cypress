const { defineConfig } = require('cypress')
const { testEnvironments } = require('./cypress/support/testEnvironments')

function createConfig(target) {
  const { baseUrl, basicAuthUsername, basicAuthPassword, loginEmail, loginPassword } = testEnvironments[target]

  return defineConfig({
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: true,
      html: true,
      json: true,
    },
    e2e: {
      baseUrl,
      setupNodeEvents(on, config) {
        return config
      },
    },
    env: {
      targetEnv: target,
      baseUrl,
      basicAuthUsername,
      basicAuthPassword,
      loginEmail,
      loginPassword,
    },
  })
}

module.exports = { createConfig }
