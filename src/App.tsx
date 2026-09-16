import { useEffect, useMemo, useState } from 'react'
import { fetchOrders } from './services/orders'
import type { FormEvent } from 'react'
import type { Order, OrderStatus } from './types'
import './App.css'

const statuses: Array<OrderStatus | 'All statuses'> = [
  'All statuses',
  'Paid',
  'Pending',
  'Refunded',
]

const navItems = [
  { label: 'Overview', icon: '⌂' },
  { label: 'Orders', icon: '▣' },
  { label: 'Customers', icon: '♙' },
  { label: 'Reports', icon: '▥' },
]

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>
}

function KpiCard({ label, value, detail, trend }: { label: string; value: string; detail: string; trend: string }) {
  return (
    <article className="kpi-card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      <p className="kpi-detail"><span className="trend">{trend}</span> {detail}</p>
    </article>
  )
}

function OrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: (order: Order) => void }) {
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!customer.trim() || !email.trim() || !amount.trim()) {
      setError('Complete all required fields.')
      return
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    onCreated({
      id: 'ORD-NEW',
      customer,
      email,
      amount: Number(amount),
      status: 'Pending',
      date: 'Today',
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-order-title">
        <div className="modal-heading">
          <div><p className="eyebrow">Orders</p><h2 id="new-order-title">Create new order</h2></div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} noValidate>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>Customer<input value={customer} onChange={(event) => setCustomer(event.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Amount<input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Create order</button></div>
        </form>
      </section>
    </div>
  )
}

function App() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'All statuses'>('All statuses')
  const [isModalOpen, setModalOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [isMenuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeMenuOnEscape)
    return () => window.removeEventListener('keydown', closeMenuOnEscape)
  }, [])

  function loadOrders() {
    setLoading(true)
    setLoadError('')
    fetchOrders().then(setOrders).catch(() => setLoadError('Unable to load orders. Please try again.')).finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [])

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'All statuses' || order.status === status)
  }), [orders, query, status])

  function addOrder(order: Order) {
    setOrders((current) => [order, ...current])
  }

  function selectNav(item: string) {
    setActiveNav(item)
    setMenuOpen(false)
  }

  const showOrders = activeNav === 'Overview' || activeNav === 'Orders'

  return (
    <div className="app-shell">
      <div className={`sidebar-backdrop ${isMenuOpen ? 'visible' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="brand"><span className="brand-mark">N</span><span>Northstar</span></div>
        <button className="sidebar-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>×</button>
        <p className="nav-heading">Workspace</p>
        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} aria-current={activeNav === item.label ? 'page' : undefined} onClick={() => selectNav(item.label)}>
              <span aria-hidden="true">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer"><div className="avatar">AS</div><div><strong>Alex Smith</strong><small>Administrator</small></div><button aria-label="Account menu">•••</button></div>
      </aside>
      <main className="main-content">
        <header className="mobile-header"><button className="menu-toggle" aria-label="Open navigation" aria-expanded={isMenuOpen} onClick={() => setMenuOpen(true)}>☰</button><div className="mobile-brand"><span className="brand-mark">N</span><strong>Northstar</strong></div><button className="notification" aria-label="Notifications">♢<span /></button></header>
        <header className="topbar"><div><p className="eyebrow">Wednesday, September 16, 2026</p><h1>{activeNav === 'Overview' ? 'Good morning, Alex' : activeNav}<span aria-hidden="true">{activeNav === 'Overview' ? ' 👋' : ''}</span></h1></div><div className="top-actions"><button className="notification desktop-notification" aria-label="Notifications">♢<span /></button><button className="primary-button" onClick={() => setModalOpen(true)}>＋ New order</button></div></header>
        {activeNav === 'Overview' && <section className="kpi-grid" aria-label="Key performance indicators">
          <KpiCard label="Total revenue" value="$48,290" trend="+12.5%" detail="vs. last month" />
          <KpiCard label="Orders" value="1,284" trend="+8.2%" detail="vs. last month" />
          <KpiCard label="Customers" value="8,492" trend="+5.7%" detail="vs. last month" />
          <KpiCard label="Conversion rate" value="24.8%" trend="+2.1%" detail="vs. last month" />
        </section>}
        {showOrders && <section className="orders-panel" aria-labelledby="orders-title">
          <div className="section-heading"><div><h2 id="orders-title">{activeNav === 'Orders' ? 'All orders' : 'Recent orders'}</h2><p>{activeNav === 'Orders' ? 'Search, filter and manage every transaction' : 'Track and manage your latest transactions'}</p></div>{activeNav === 'Overview' && <button className="text-button" onClick={() => selectNav('Orders')}>View all orders <span aria-hidden="true">→</span></button>}</div>
          <div className="filters"><label className="search-label"><span aria-hidden="true">⌕</span><span className="sr-only">Search orders</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." /></label><label className="select-label"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | 'All statuses')}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label></div>
          {loading && <p className="state-message" role="status">Loading orders...</p>}
          {loadError && <div className="state-message error-state" role="alert"><p>{loadError}</p><button className="secondary-button" onClick={loadOrders}>Try again</button></div>}
          {!loading && !loadError && filteredOrders.length === 0 && <p className="state-message">No orders match your filters.</p>}
          {!loading && !loadError && filteredOrders.length > 0 && <div className="table-wrap"><table><caption className="sr-only">Recent orders</caption><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td><div className="customer"><span className="customer-avatar">{order.customer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span>{order.customer}<small>{order.email}</small></span></div></td><td>{order.date}</td><td><strong>${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td><td><StatusBadge status={order.status} /></td><td><button className="row-menu" aria-label={`Actions for ${order.id}`}>•••</button></td></tr>)}</tbody></table></div>}
        </section>}
        {activeNav === 'Customers' && <section className="empty-panel"><span className="panel-icon">♙</span><h2>Customers</h2><p>Customer insights and profiles will appear here.</p><button className="primary-button" onClick={() => selectNav('Overview')}>Back to overview</button></section>}
        {activeNav === 'Reports' && <section className="empty-panel"><span className="panel-icon">▥</span><h2>Reports</h2><p>Build and export performance reports from your workspace.</p><button className="primary-button" onClick={() => selectNav('Overview')}>Back to overview</button></section>}
        <footer>© 2026 Northstar Analytics <span>•</span> All systems operational</footer>
      </main>
      {isModalOpen && <OrderModal onClose={() => setModalOpen(false)} onCreated={addOrder} />}
    </div>
  )
}

export default App
