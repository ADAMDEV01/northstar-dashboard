import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { Order } from './types'

const orders: Order[] = [
  { id: 'ORD-1001', customer: 'Ava Stone', email: 'ava@example.com', date: 'Sep 16, 2026', amount: 125, status: 'Paid' },
  { id: 'ORD-1002', customer: 'Noah Lee', email: 'noah@example.com', date: 'Sep 15, 2026', amount: 80.5, status: 'Pending' },
]

const fetchOrdersMock = vi.fn<() => Promise<Order[]>>()
vi.mock('./services/orders', () => ({ fetchOrders: () => fetchOrdersMock() }))

async function renderLoadedApp(data = orders) {
  fetchOrdersMock.mockResolvedValueOnce(data)
  const user = userEvent.setup()
  render(<App />)
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  return user
}

describe('dashboard workflows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows KPI cards and recent orders after loading', async () => {
    await renderLoadedApp()
    expect(screen.getByText('Total revenue')).toBeInTheDocument()
    expect(screen.getByText('$48,290')).toBeInTheDocument()
    expect(screen.getByText('ORD-1001')).toBeInTheDocument()
    expect(screen.getByText('Ava Stone')).toBeInTheDocument()
  })

  it('exposes a loading status while orders are requested', async () => {
    let resolveOrders!: (value: Order[]) => void
    fetchOrdersMock.mockReturnValueOnce(new Promise((resolve) => { resolveOrders = resolve }))
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading orders...')
    resolveOrders(orders)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })

  it('shows an accessible error and retries a failed request', async () => {
    fetchOrdersMock.mockRejectedValueOnce(new Error('network'))
    fetchOrdersMock.mockResolvedValueOnce(orders)
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load orders')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('ORD-1001')).toBeInTheDocument()
  })

  it('filters rows by search text and status', async () => {
    const user = await renderLoadedApp()
    await user.type(screen.getByRole('textbox', { name: 'Search orders' }), 'Noah')
    expect(screen.getByText('Noah Lee')).toBeInTheDocument()
    expect(screen.queryByText('Ava Stone')).not.toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Search orders' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), 'Paid')
    expect(screen.getByText('Ava Stone')).toBeInTheDocument()
    expect(screen.queryByText('Noah Lee')).not.toBeInTheDocument()
  })

  it('shows an empty state when filters have no matches', async () => {
    const user = await renderLoadedApp()
    await user.type(screen.getByRole('textbox', { name: 'Search orders' }), 'missing')
    expect(screen.getByText('No orders match your filters.')).toBeInTheDocument()
  })

  it('opens and closes the accessible new order dialog', async () => {
    const user = await renderLoadedApp()
    await user.click(screen.getByRole('button', { name: /new order/i }))
    expect(screen.getByRole('dialog', { name: 'Create new order' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('validates required fields before submitting', async () => {
    const user = await renderLoadedApp()
    await user.click(screen.getByRole('button', { name: /new order/i }))
    await user.click(screen.getByRole('button', { name: 'Create order' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Complete all required fields.')
  })

  it('rejects an invalid email address', async () => {
    const user = await renderLoadedApp()
    await user.click(screen.getByRole('button', { name: /new order/i }))
    await user.type(screen.getByLabelText('Customer'), 'Mia Green')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Amount'), '39')
    await user.click(screen.getByRole('button', { name: 'Create order' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('creates a new pending order from a valid form', async () => {
    const user = await renderLoadedApp()
    await user.click(screen.getByRole('button', { name: /new order/i }))
    await user.type(screen.getByLabelText('Customer'), 'Mia Green')
    await user.type(screen.getByLabelText('Email'), 'mia@example.com')
    await user.type(screen.getByLabelText('Amount'), '39')
    await user.click(screen.getByRole('button', { name: 'Create order' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const customerCell = await screen.findByText('Mia Green')
    expect(customerCell.closest('tr')).toHaveTextContent('Pending')
  })

  it('updates the selected navigation item for keyboard and pointer users', async () => {
    const user = await renderLoadedApp()
    await user.click(screen.getByRole('button', { name: 'Orders' }))
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveClass('active')
  })
})
