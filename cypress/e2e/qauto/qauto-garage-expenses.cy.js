require('cypress-xpath')

const getRandomOption = ($options) => {
  const options = [...$options]
    .filter((option) => option?.value)
    .map((option) => ({
      value: option.value,
      text: (option.textContent || option.innerText || '').trim(),
    }))
    .filter((option) => option.text)

  return Cypress._.sample(options)
}

describe('QAuto garage and expenses', () => {
  const createdCar = {
    mileage: Math.floor(Math.random() * 200000)
  }

  beforeEach(() => {
    cy.useTestEnvironment(Cypress.env('targetEnv') || 'qauto')
  })

  it('creates a car from the garage page', () => {
    createdCar.mileage = Cypress._.random(10000, 200000)

    cy.openAuthenticatedPage('/panel/garage')
    cy.contains('button', 'Add car').click()

    cy.get('#addCarBrand option').then(($brandOptions) => {
      const brand = getRandomOption($brandOptions)

      createdCar.brand = brand.text
      cy.get('#addCarBrand').select(brand.value).find('option:selected').should('have.text', createdCar.brand);
    })

    cy.get('#addCarModel')
      .should('be.visible')
      .and('not.be.disabled')
      

    cy.get('#addCarModel option').should('have.length.greaterThan', 1).then(($modelOptions) => {
      const model = getRandomOption($modelOptions)

      createdCar.model = model.text
      createdCar.name = `${createdCar.brand} ${createdCar.model}`
      cy.get('#addCarModel').select(model.value)
    })
    
    cy.get('#addCarMileage').clear().type(String(createdCar.mileage))
    cy.contains('.modal-footer button', /^Add$/).should('not.be.disabled').click().should('not.be.visible');

    cy.xpath('.//ul[@class = "car-list"]/li/app-car')
      .filter((index, el) => el.innerText.includes(createdCar.name))
      .first()
      .within(() => {
      cy.xpath('.//div[@class = "car-group"]')
        .should('have.text', createdCar.name);
  
      cy.xpath('.//input[@name = "miles"]')
        .should('have.value', createdCar.mileage);
    });
   
  })

  it('creates an expense for the created car', () => {
    cy.then(() => {
      expect(createdCar.name).to.be.a('string')
      expect(createdCar.mileage).to.be.a('number')
    })

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const expenseDate = [
      yesterday.getDate(),
      String(yesterday.getMonth() + 1).padStart(2, '0'),
      yesterday.getFullYear(),
    ].join('.')

    const expense = {
      date: expenseDate,
      mileage: createdCar.mileage + 10,
      liters: 12,
      totalCost: 25,
    }

    cy.openAuthenticatedPage('/panel/expenses')
    cy.get('body').then(($body) => {
      if ($body.find('select:visible').length) {
        cy.get('select:visible').first().select(createdCar.name)
        return
      }

      const dropdownSelectors = [
        'button.dropdown-toggle:visible',
        '[role="combobox"]:visible',
        '.dropdown-toggle:visible',
        '.car-select-dropdown:visible',
      ]

      cy.get(dropdownSelectors.join(', ')).first().click()
      cy.contains(createdCar.name).click()
    })

    cy.contains('button', 'Add an expense').click()
    cy.get('#addExpenseDate').clear().type(expense.date)
    cy.get('#addExpenseMileage').clear().type(String(expense.mileage))
    cy.get('#addExpenseLiters').clear().type(String(expense.liters))
    cy.get('#addExpenseTotalCost').clear().type(String(expense.totalCost))
    cy.contains('.modal-footer button', /^Add$/).click()

    cy.get('table tbody tr').first().within(() => {
      cy.contains(String(expense.mileage)).should('be.visible')
      cy.contains(String(expense.liters)).should('be.visible')
      cy.contains(String(expense.totalCost)).should('be.visible')
    })
  })
})
