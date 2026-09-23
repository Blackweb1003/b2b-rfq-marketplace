import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppHeader() {
    const { user, logout } = useAuth()

    return (
        <header className="app-header">
            <Link className="brand" to="/">
                <span className="brand-mark" aria-hidden="true">M</span>
                <span>Merzado</span>
            </Link>
            {user ? (
                <div className="header-actions">
                    {user.role === 'buyer' && (
                        <>
                            <Link className="text-link" to="/buyer/rfqs">
                                My RFQs
                            </Link>
                            <Link className="text-link" to="/buyer/quotations">
                                Quotations
                            </Link>
                        </>
                    )}
                    {user.role === 'supplier' && (
                        <Link className="text-link" to="/supplier/rfqs">
                            RFQ Marketplace
                        </Link>
                    )}
                    <Link className="role-link" to={`/${user.role}`}>
                        {user.role}
                    </Link>
                    <button className="text-button" type="button" onClick={logout}>
                        Log out
                    </button>
                </div>
            ) : (
                <nav className="header-actions" aria-label="Authentication">
                    <Link className="text-link" to="/login">Log in</Link>
                    <Link className="header-button" to="/signup">Sign up</Link>
                </nav>
            )}
        </header>
    )
}