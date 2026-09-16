export type OrderStatus = 'Paid' | 'Pending' | 'Refunded'

export type Order = {
  id: string
  customer: string
  email: string
  date: string
  amount: number
  status: OrderStatus
}
