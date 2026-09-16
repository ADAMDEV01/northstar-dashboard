import type { Order } from '../types'

const orders: Order[] = [
  { id: 'ORD-7829', customer: 'Olivia Martin', email: 'olivia@example.com', date: 'Sep 16, 2026', amount: 249.00, status: 'Paid' },
  { id: 'ORD-7828', customer: 'Ethan Williams', email: 'ethan@example.com', date: 'Sep 16, 2026', amount: 128.50, status: 'Pending' },
  { id: 'ORD-7827', customer: 'Sophia Brown', email: 'sophia@example.com', date: 'Sep 15, 2026', amount: 420.00, status: 'Paid' },
  { id: 'ORD-7826', customer: 'Liam Davis', email: 'liam@example.com', date: 'Sep 15, 2026', amount: 89.99, status: 'Refunded' },
]

export function fetchOrders(): Promise<Order[]> {
  return Promise.resolve(orders)
}
