Cypress.Commands.add('login', (email, password) => {
  cy.visit('https://qauto.forstudy.space/', {
    auth: {
      username: 'guest',
      password: 'welcome2qauto',
    },
  });

  cy.contains('Sign In').click();

  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password, { sensitive: true });

  cy.contains('Login').click();
});

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  if (options && options.sensitive) {
    options.log = false;
    Cypress.log({
      $el: element,
      name: 'type',
      message: '*'.repeat(text.length),
    });
  }

  return originalFn(element, text, options);
});