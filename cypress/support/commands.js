Cypress.Commands.add('useTestEnvironment', (target) => {
  cy.wrap(null).then(() => {
    const { testEnvironments } = require('./testEnvironments')
    const selectedEnvironment = testEnvironments[target]

    Object.entries(selectedEnvironment).forEach(([key, value]) => {
      Cypress.env(key, value)
    })

    Cypress.env('targetEnv', target)
  })
})

Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
  const username = Cypress.env('basicAuthUsername')
  const password = Cypress.env('basicAuthPassword')

  if (!username || !password) {
    return originalFn(url, options)
  }

  return originalFn(url, {
    ...options,
    auth: {
      username,
      password,
    },
  })
})

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  if (options && options.sensitive) {
    options.log = false
    Cypress.log({
      $el: element,
      name: 'type',
      message: '*'.repeat(text.length),
    })
  }

  return originalFn(element, text, options)
})

Cypress.Commands.add('visitLoginPage', () => {
  cy.visit(Cypress.env('baseUrl') || '/')
})

Cypress.Commands.add('loginWithCurrentUser', (email = Cypress.env('loginEmail'), password = Cypress.env('loginPassword')) => {
  cy.contains('button', /sign in/i).click()
  cy.get('#signinEmail').clear().type(email)
  cy.get('#signinPassword').clear().type(password, { log: false })
  cy.contains('.modal-content button', /^Login$/).click()
})

Cypress.Commands.add('loginToCurrentApp', () => {
  const baseUrl = Cypress.env('baseUrl')
  const email = Cypress.env('loginEmail')
  const password = Cypress.env('loginPassword')
  const targetEnv = Cypress.env('targetEnv')

  cy.session([targetEnv, email], () => {
    cy.visit(baseUrl)
    cy.loginWithCurrentUser(email, password)
    cy.url().should('include', '/panel/garage')
  })
})

Cypress.Commands.add('openAuthenticatedPage', (path = '/panel/garage') => {
  cy.loginToCurrentApp()
  cy.visit(`${Cypress.env('baseUrl')}${path}`)
})

Cypress.Commands.add('login', (email, password) => {
  cy.visit('https://qauto.forstudy.space/', {
    auth: {
      username: 'guest',
      password: 'welcome2qauto',
    },
  })

  cy.contains('Sign In').click()
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password, { sensitive: true })
  cy.contains('Login').click()
})

Cypress.Commands.add('createExpenseByApi', (expensePayload) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('baseUrl')}/api/expenses`,
    auth: {
      username: Cypress.env('basicAuthUsername'),
      password: Cypress.env('basicAuthPassword'),
    },
    body: expensePayload,
  })
})
