import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { getSupplierQuotations, type QuotationResponse } from '../api/supplierQuotations'
import { useAuth } from '../auth/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

function QuotationCard({ quotation }: { quotation: QuotationResponse }) {
    return (
        <article className="quotation-card">
            <div className="quotation-card-header">
                <div>
                    <p className="card-kicker">QUOTATION #{quotation.id}</p>
                    <h2>RFQ #{quotation.rfq_id}</h2>
                </div>
                <span className="status-badge status-open">SUBMITTED</span>
            </div>
            <dl className="quotation-details">
                <div><dt>Quoted price</dt><dd>{quotation.price}</dd></div>
                <div><dt>Estimated delivery</dt><dd>{quotation.estimated_delivery_time} days</dd></div>
                <div><dt>Submitted</dt><dd>{formatDate(quotation.created_at)}</dd></div>
                <div><dt>Updated</dt><dd>{formatDate(quotation.updated_at)}</dd></div>
            </dl>
            <p className="quotation-message">
                {quotation.message || 'No additional notes were provided.'}
            </p>
        </article>
    )
}

export function SupplierQuotationsPage() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [quotations, setQuotations] = useState<QuotationResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function loadQuotations() {
        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        setLoading(true)
        setError('')
        try {
            setQuotations(await getSupplierQuotations(token))
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to load your quotations.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadQuotations()
    }, [token])

    return (
        <main className="dashboard-page">
            <section className="dashboard-heading">
                <div>
                    <p className="eyebrow">SUPPLIER WORKSPACE</p>
                    <h1>My Quotations</h1>
                    <p className="dashboard-copy">Review the quotations you have submitted.</p>
                </div>
            </section>

            {loading && <div className="state-panel">Loading your quotations...</div>}

            {!loading && error && (
                <div className="state-panel error-state" role="alert">
                    <p>{error}</p>
                    <button className="secondary-button" type="button" onClick={() => void loadQuotations()}>
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && quotations.length === 0 && (
                <div className="state-panel empty-state">
                    <p className="card-kicker">NO QUOTATIONS YET</p>
                    <h2>Your submitted quotations will appear here.</h2>
                    <p>Visit the RFQ Marketplace to find an open request.</p>
                </div>
            )}

            {!loading && !error && quotations.length > 0 && (
                <section className="quotation-grid" aria-label="My quotations">
                    {quotations.map((quotation) => <QuotationCard key={quotation.id} quotation={quotation} />)}
                </section>
            )}
        </main>
    )
}