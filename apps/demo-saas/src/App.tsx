import { Route, Routes } from 'react-router'
import { CustomersPage } from './app/customers'
import { DashboardPage } from './app/dashboard'
import { InvoicesPage } from './app/invoices'
import { AppLayout } from './app/layout'
import { SettingsPage } from './app/settings'
import { LandingPage } from './pages/landing'
import { SignInPage } from './pages/sign-in'

export default function App() {
  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route path="sign-in" element={<SignInPage />} />
      <Route path="app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
