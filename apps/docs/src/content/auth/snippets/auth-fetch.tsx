import { useAuth } from '@glyphui/auth'
import { useEffect, useState } from 'react'

interface Invoice {
  id: string
  total: number
}

export function useInvoices() {
  const { fetch } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  useEffect(() => {
    // Sends the session (cookie or bearer token). On a 401 it refreshes once and retries;
    // if that fails, SessionExpiredDialog asks the user to sign in again.
    fetch('/api/invoices')
      .then((response) => (response.ok ? response.json() : []))
      .then(setInvoices)
  }, [fetch])
  return invoices
}
