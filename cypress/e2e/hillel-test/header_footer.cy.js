/// <reference types="cypress" />

const BASE_URL = 'https://qauto.forstudy.space/';
const GUEST_USERNAME = 'guest';
const GUEST_PASSWORD = 'welcome2qauto';

function loginAsGuest() {
  cy.visit(BASE_URL, {
    auth: {
      username: GUEST_USERNAME,
      password: GUEST_PASSWORD,
    },
  });
}

describe('Header and footer queries', () => {
  beforeEach(() => {
    loginAsGuest();
    cy.get('header').should('be.visible');
    cy.get('footer').scrollIntoView().should('be.visible');
  });

  it('Test 1: Header elements', () => {
    cy.get('header')
      .find('a[href], button')
      .should('have.length.greaterThan', 0)
      .each(($el) => {
        cy.wrap($el).should('exist').and('be.visible');
      });
  });

  it('Test 2: Footer elements', () => {
    const footerScope = '#contactsSection';

    function assertFooterLink(relativeSelector, hrefPattern) {
      cy.get(footerScope)
        .find(relativeSelector)
        .should('exist')
        .first()
        .should('be.visible')
        .invoke('attr', 'href')
        .should('match', hrefPattern);
    }

    // Social icons (direct href selectors, scoped to footer section)
    assertFooterLink('a[href*="facebook"]', /facebook/i);
    assertFooterLink('a[href*="t.me"]', /t\.me/i);
    assertFooterLink('a[href*="youtube"], a[href*="youtu.be"]', /youtube/i);
    assertFooterLink('a[href*="instagram"]', /instagram/i);
    assertFooterLink('a[href*="linkedin"], a[href*="lnkd.in"]', /linkedin/i);

    // Link
    assertFooterLink('a[href*="ithillel.ua"]', /ithillel\.ua/i);

    // Email (verify visible address, validate mailto scheme/domain)
    cy.get(footerScope)
      .contains('a[href^="mailto:"][href*="ithillel.ua"]', 'support@ithillel.ua')
      .should('exist')
      .and('be.visible')
      .invoke('attr', 'href')
      .should('match', /mailto:(support|developer)@ithillel\.ua/i);
  });
});

