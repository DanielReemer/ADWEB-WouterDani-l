import { render, screen } from '@testing-library/react'
import Statistics from '@/app/books/[slug]/Statistics'
import '@testing-library/jest-dom'

describe('Statistics', () => {
  it('renders all labels', () => {
    render(<Statistics income={1000} expense={500} />)
    expect(screen.getByText('Statistieken')).toBeInTheDocument()
    expect(screen.getByText(/Inkomsten/)).toBeInTheDocument()
    expect(screen.getByText(/Uitgaven/)).toBeInTheDocument()
    expect(screen.getByText(/Saldo/)).toBeInTheDocument()
  })

  it('renders formatted income, expense, and balance', () => {
    render(<Statistics income={1234.56} expense={789.01} />)
    expect(screen.getByText('Inkomsten: €1234.56')).toBeInTheDocument()
    expect(screen.getByText('Uitgaven: €789.01')).toBeInTheDocument()
    expect(screen.getByText('Saldo: €445.55')).toBeInTheDocument()
  })

  it('renders negative balance correctly', () => {
    render(<Statistics income={500} expense={800} />)
    expect(screen.getByText('Saldo: €-300.00')).toBeInTheDocument()
  })

  it('renders zero values', () => {
    render(<Statistics income={0} expense={0} />)
    expect(screen.getByText('Inkomsten: €0.00')).toBeInTheDocument()
    expect(screen.getByText('Uitgaven: €0.00')).toBeInTheDocument()
    expect(screen.getByText('Saldo: €0.00')).toBeInTheDocument()
  })
})