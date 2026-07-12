import { test, expect } from '@playwright/test'

type Customer = {
  id: number
  name: string
  employees: number
  contactInfo?: {
    name: string
    email: string
  }
  size: string
  industry: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

test.describe('GET /customers', () => {
  test('gets customers successfully', async ({ request }) => {
    const response = await request.get('/customers')

    expect(response.status()).toBe(200)
    expect(response.ok()).toBeTruthy()

    const body = await response.json()

    expect(body).toHaveProperty('customers')
    expect(body).toHaveProperty('pageInfo')
    expect(body.customers).toBeInstanceOf(Array)
    expect(body.pageInfo).toBeInstanceOf(Object)

    body.customers.forEach((customer: Customer) => {
      expect(customer).toHaveProperty('id')
      expect(customer).toHaveProperty('name')
      expect(customer).toHaveProperty('employees')
      expect(customer).toHaveProperty('contactInfo')
      expect(customer).toHaveProperty('size')
      expect(customer).toHaveProperty('industry')
      expect(customer).toHaveProperty('address')

      expect(typeof customer.id).toBe('number')
      expect(typeof customer.name).toBe('string')
      expect(typeof customer.employees).toBe('number')
      expect(typeof customer.size).toBe('string')
      expect(typeof customer.industry).toBe('string')

      if (customer.contactInfo) {
        expect(customer.contactInfo).toHaveProperty('name')
        expect(customer.contactInfo).toHaveProperty('email')

        expect(typeof customer.contactInfo.name).toBe('string')
        expect(typeof customer.contactInfo.email).toBe('string')
      }

      if (customer.address) {
        expect(customer.address).toHaveProperty('street')
        expect(customer.address).toHaveProperty('city')
        expect(customer.address).toHaveProperty('state')
        expect(customer.address).toHaveProperty('zipCode')
        expect(customer.address).toHaveProperty('country')

        expect(typeof customer.address.street).toBe('string')
        expect(typeof customer.address.city).toBe('string')
        expect(typeof customer.address.state).toBe('string')
        expect(typeof customer.address.zipCode).toBe('string')
        expect(typeof customer.address.country).toBe('string')
      }
    })

    expect(body.pageInfo).toHaveProperty('currentPage')
    expect(body.pageInfo).toHaveProperty('totalPages')
    expect(body.pageInfo).toHaveProperty('totalCustomers')

    expect(typeof body.pageInfo.currentPage).toBe('number')
    expect(typeof body.pageInfo.totalPages).toBe('number')
    expect(typeof body.pageInfo.totalCustomers).toBe('number')
  })

  test('get customers from page 2', async ({ request }) => {
    const response = await request.get('/customers', { params: { page: 2 } })

    expect(response.status()).toBe(200)
    expect(response.ok()).toBeTruthy()

    const body = await response.json()

    expect(body.pageInfo.currentPage).toBe(2)
  })

  test('get customers limited to 5 per page', async ({ request }) => {
    const response = await request.get('/customers', { params: { limit: 5 } })

    expect(response.status()).toBe(200)
    expect(response.ok()).toBeTruthy()

    const body = await response.json()

    expect(body.customers.length).toBeLessThanOrEqual(5)
  })
})
