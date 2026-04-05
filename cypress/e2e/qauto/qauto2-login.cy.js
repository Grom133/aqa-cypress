describe('QAuto2 login', () => {
  beforeEach(() => {
    cy.useTestEnvironment('qauto2')
  })

  it('logs in to qauto2 with qauto2 credentials', () => {
    cy.visitLoginPage()
    cy.loginWithCurrentUser(Cypress.env('loginEmail'), Cypress.env('loginPassword'))
    cy.url().should('include', '/panel/garage')
  })
})
