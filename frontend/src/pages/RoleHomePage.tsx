import { useAuth } from '../auth/AuthContext'
import type { Role } from '../api/auth'

export function RoleHomePage({ role }: { role: Role }) {
  const { user } = useAuth()

  return (
    <main className="workspace-page">
      <p className="eyebrow">{role.toUpperCase()} WORKSPACE</p>
      <h1>Your marketplace workspace.</h1>
      <p className="intro">
        You are signed in as a <strong>{user?.role}</strong>. Marketplace
        features will appear here next.
      </p>
      <div className="status-panel">
        <span className="status-dot" aria-hidden="true" />
        <span>Authentication is active</span>
      </div>
    </main>
  )
}