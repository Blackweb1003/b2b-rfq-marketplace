import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './auth/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RoleHomePage } from './pages/RoleHomePage'
import { SignupPage } from './pages/SignupPage'
import { BuyerRfqPage } from './pages/BuyerRfqPage'
import { CreateRfqPage } from './pages/CreateRfqPage'
import { EditRfqPage } from './pages/EditRfqPage'
import { BuyerQuotationsPage } from './pages/BuyerQuotationsPage'
import { SupplierRfqPage } from './pages/SupplierRfqPage'
import { SupplierRfqDetailPage } from './pages/SupplierRfqDetailPage'
import { SupplierQuotationsPage } from './pages/SupplierQuotationsPage'

function HomePage() {
  return (
    <main className="status-page">
      <div className="status-mark" aria-hidden="true">M</div>
      <p className="eyebrow">B2B RFQ MARKETPLACE</p>
      <h1>Merzado frontend is running.</h1>
      <p className="intro">
        The React and Vite foundation is ready for authentication, RFQs, and
        quotation workflows.
      </p>
      <div className="status-panel">
        <span className="status-dot" aria-hidden="true" />
        <span>Frontend online</span>
      </div>
      <Link className="next-link" to="/status">
        View setup status <span aria-hidden="true">-&gt;</span>
      </Link>
    </main>
  )
}

function StatusPage() {
  return (
    <main className="status-page">
      <p className="eyebrow">SETUP STATUS</p>
      <h1>Ready for the marketplace UI.</h1>
      <p className="intro">
        Routing is configured. Backend requests can use the Vite proxy at
        <code>/api</code>.
      </p>
      <Link className="next-link" to="/">Back to home</Link>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/buyer"
            element={
              <ProtectedRoute role="buyer">
                <RoleHomePage role="buyer" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/rfqs"
            element={
              <ProtectedRoute role="buyer">
                <BuyerRfqPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/rfqs/create"
            element={
              <ProtectedRoute role="buyer">
                <CreateRfqPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/rfqs/:rfq_id/edit"
            element={
              <ProtectedRoute role="buyer">
                <EditRfqPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/quotations"
            element={
              <ProtectedRoute role="buyer">
                <BuyerQuotationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier"
            element={
              <ProtectedRoute role="supplier">
                <RoleHomePage role="supplier" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/rfqs"
            element={
              <ProtectedRoute role="supplier">
                <SupplierRfqPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/rfqs/:rfq_id"
            element={
              <ProtectedRoute role="supplier">
                <SupplierRfqDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/quotations"
            element={
              <ProtectedRoute role="supplier">
                <SupplierQuotationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
