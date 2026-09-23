import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
