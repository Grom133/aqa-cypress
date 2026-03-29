/// <reference types="cypress" />

const BASE_URL = 'https://qauto.forstudy.space/';
const BASIC_AUTH = {
  username: 'guest',
  password: 'welcome2qauto',
};

const registrationPassword = 'Qaauto123';
const fixedLoginEmail = 'naizbatkovich@gmail.com';

function openRegistrationModal() {
  cy.visit(BASE_URL, { auth: BASIC_AUTH });
  cy.contains('Sign up').click();
  cy.get('#signupName').should('be.visible');
}

describe('Registration form', () => {
  it('Validation tests: required, invalid and length checks', () => {
    openRegistrationModal();

    cy.contains('button', 'Register').should('be.disabled');

    cy.get('#signupName').focus().blur();
    cy.contains('.invalid-feedback', 'Name required').should('be.visible');

    cy.get('#signupLastName').focus().blur();
    cy.contains('.invalid-feedback', 'Last name required').should('be.visible');

    cy.get('#signupEmail').focus().blur();
    cy.contains('.invalid-feedback', 'Email required').should('be.visible');

    cy.get('#signupPassword').focus().blur();
    cy.contains('.invalid-feedback', 'Password required').should('be.visible');

    cy.get('#signupName').type('1').blur();
    cy.contains('.invalid-feedback', 'Name is invalid').should('be.visible');
    cy.get('#signupName').clear().type('A').blur();
    cy.contains('.invalid-feedback', 'Name has to be from 2 to 20 characters long').should('be.visible');

    cy.get('#signupLastName').type('!').blur();
    cy.contains('.invalid-feedback', 'Last name is invalid').should('be.visible');
    cy.get('#signupLastName').clear().type('B').blur();
    cy.contains('.invalid-feedback', 'Last name has to be from 2 to 20 characters long').should('be.visible');

    cy.get('#signupEmail').type('invalid').blur();
    cy.contains('.invalid-feedback', 'Email is incorrect').should('be.visible');

    cy.get('#signupPassword').type('short').blur();
    cy.contains('.invalid-feedback', 'Password has to be from 8 to 15 characters long').should('be.visible');

    cy.get('#signupPassword').clear().type('alllowercase1').blur();
    cy.contains(
      '.invalid-feedback',
      'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter'
    ).should('be.visible');

    cy.get('#signupPassword').clear().type('ALLUPPERCASE1').blur();
    cy.contains(
      '.invalid-feedback',
      'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter'
    ).should('be.visible');

    cy.get('#signupPassword').clear().type('NoDigitsHere').blur();
    cy.contains(
      '.invalid-feedback',
      'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter'
    ).should('be.visible');

    cy.get('#signupPassword').clear().type(registrationPassword);
    cy.get('#signupRepeatPassword').type(`${registrationPassword}x`).blur();
    cy.contains('.invalid-feedback', 'Passwords do not match').should('be.visible');

    cy.contains('button', 'Register').should('be.disabled');
  });

  it('Successful registration', () => {
    const email = `naizbatkovich+${Date.now()}@gmail.com`;

    openRegistrationModal();

    cy.get('#signupName').type('Andrii');
    cy.get('#signupLastName').type('Naizbatkovich');
    cy.get('#signupEmail').type(email);
    cy.get('#signupPassword').type(registrationPassword, { sensitive: true });
    cy.get('#signupRepeatPassword').type(registrationPassword, { sensitive: true });

    cy.contains('button', 'Register').should('not.be.disabled').click();

    cy.url().should('contain', '/panel');
    cy.contains('Garage').should('be.visible');
  });

  it('Login with fixed credentials', () => {
    cy.login(fixedLoginEmail, registrationPassword);
    cy.contains('Wrong email or password')
      .should('be.visible')
      .and('have.text', 'Wrong email or password');
  });
});

