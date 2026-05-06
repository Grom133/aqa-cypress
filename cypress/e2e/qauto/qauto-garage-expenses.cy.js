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
  const createdApiExpense = {}

  beforeEach(() => {
    cy.useTestEnvironment(Cypress.env('targetEnv') || 'qauto')
  })

  it('creates a car from the garage page', () => {
    createdCar.mileage = Cypress._.random(10000, 200000)

    cy.openAuthenticatedPage('/panel/garage')
    cy.intercept('POST', '**/api/cars').as('createCar')
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

    cy.wait('@createCar').then(({ response }) => {
      expect(response?.statusCode).to.eq(201)

      const createdCarId = response?.body?.data?.id ?? response?.body?.id
      expect(createdCarId, 'created car id from POST /api/cars response').to.be.a('number')

      createdCar.id = createdCarId
    })

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
      expect(createdCar.id).to.be.a('number')
      expect(createdCar.name).to.be.a('string')
      expect(createdCar.mileage).to.be.a('number')
    })

    const today = new Date()
    const expenseDate = [
      today.getDate(),
      String(today.getMonth() + 1).padStart(2, '0'),
      today.getFullYear(),
    ].join('.')

    const expense = {
      date: expenseDate,
      mileage: createdCar.mileage + 10,
      liters: 12,
      totalCost: 25,
    }

    cy.openAuthenticatedPage('/panel/expenses')
    cy.request({
      method: 'GET',
      url: `${Cypress.env('baseUrl')}/api/cars`,
      auth: {
        username: Cypress.env('basicAuthUsername'),
        password: Cypress.env('basicAuthPassword'),
      },
    }).then(({ status, body }) => {
      expect(status).to.eq(200)

      const cars = Array.isArray(body?.data) ? body.data : []
      const createdCarFromApi = cars.find((car) => car.id === createdCar.id)

      expect(createdCarFromApi, `car with id ${createdCar.id} is returned by GET /api/cars`).to.exist
    })

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

  it('creates an expense for the created car via API', () => {
    cy.then(() => {
      expect(createdCar.id).to.be.a('number')
      expect(createdCar.mileage).to.be.a('number')
    })

    const today = new Date()
    const reportedAt = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-')

    const expensePayload = {
      carId: createdCar.id,
      reportedAt,
      mileage: createdCar.mileage + 20,
      liters: 11,
      totalCost: 11,
      forceMileage: false,
    }

    cy.openAuthenticatedPage('/panel/expenses')
    cy.createExpenseByApi(expensePayload).then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body).to.have.property('status', 'ok')
      expect(body.data).to.include({
        carId: expensePayload.carId,
        reportedAt: expensePayload.reportedAt,
        mileage: expensePayload.mileage,
        liters: expensePayload.liters,
        totalCost: expensePayload.totalCost,
      })
      expect(body.data.id).to.be.a('number')

      createdApiExpense.id = body.data.id
      createdApiExpense.carId = body.data.carId
      createdApiExpense.reportedAt = body.data.reportedAt
      createdApiExpense.mileage = body.data.mileage
      createdApiExpense.liters = body.data.liters
      createdApiExpense.totalCost = body.data.totalCost
    })
  })

  it('finds the created car via UI and validates expense created via API', () => {
    cy.then(() => {
      expect(createdCar.name).to.be.a('string')
      expect(createdApiExpense.id).to.be.a('number')
      expect(createdApiExpense.carId).to.eq(createdCar.id)
    })

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

    cy.get('table tbody tr')
      .contains('td', String(createdApiExpense.mileage))
      .parents('tr')
      .first()
      .within(() => {
        cy.contains(String(createdApiExpense.liters)).should('be.visible')
        cy.contains(String(createdApiExpense.totalCost)).should('be.visible')
      })
  })
})
