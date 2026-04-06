describe('QAuto login', () => {
  beforeEach(() => {
    cy.useTestEnvironment('qauto')
  })

  it('logs in to qauto with qauto credentials', () => {
    cy.visitLoginPage()
    cy.loginWithCurrentUser(Cypress.env('loginEmail'), Cypress.env('loginPassword'))
    cy.url().should('include', '/panel/garage')
  })
})
