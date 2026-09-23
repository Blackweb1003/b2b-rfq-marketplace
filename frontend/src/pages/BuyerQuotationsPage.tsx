import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { getBuyerQuotations, type Quotation } from '../api/quotations'
import { useAuth } from '../auth/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function formatPrice(value: number) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}

function QuotationCard({ quotation }: { quotation: Quotation }) {
    return (
        <article className="quotation-card">
            <div className="quotation-card-header">
                <div>
                    <p className="card-kicker">QUOTATION #{quotation.id}</p>
                    <h2>RFQ #{quotation.rfq_id}</h2>
                </div>
                <span className="status-badge status-open">RECEIVED</span>
            </div>
            <dl className="quotation-details">
                <div>
                    <dt>Supplier</dt>
                    <dd>Supplier #{quotation.supplier_id}</dd>
                </div>
                <div>
                    <dt>Quoted price</dt>
                    <dd>{formatPrice(quotation.price)}</dd>
                </div>
                <div>
                    <dt>Estimated delivery</dt>
                    <dd>{quotation.estimated_delivery_time} days</dd>
                </div>
                <div>
                    <dt>Submitted</dt>
                    <dd>{formatDate(quotation.created_at)}</dd>
                </div>
            </dl>
            <p className="quotation-message">
                {quotation.message || 'No additional supplier notes were provided.'}
            </p>
            <p className="updated-label">Updated {formatDate(quotation.updated_at)}</p>
        </article>
    )
}

export function BuyerQuotationsPage() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [quotations, setQuotations] = useState<Quotation[]>([])
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
            setQuotations(await getBuyerQuotations(token))
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setError(
                caughtError instanceof ApiError
                    ? caughtError.message
                    : 'Unable to load your quotations.',
            )
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
                    <p className="eyebrow">BUYER WORKSPACE</p>
                    <h1>Quotations received</h1>
                    <p className="dashboard-copy">
                        Review supplier responses to your RFQs.
                    </p>
                </div>
            </section>

            {loading && <div className="state-panel">Loading quotations...</div>}

            {!loading && error && (
                <div className="state-panel error-state" role="alert">
                    <p>{error}</p>
                    <button className="secondary-button" type="button" onClick={loadQuotations}>
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && quotations.length === 0 && (
                <div className="state-panel empty-state">
                    <p className="card-kicker">NO QUOTATIONS YET</p>
                    <h2>Supplier responses will appear here.</h2>
                    <p>Quotations submitted for your RFQs will be collected in this view.</p>
                </div>
            )}

            {!loading && !error && quotations.length > 0 && (
                <section className="quotation-grid" aria-label="Quotations received">
                    {quotations.map((quotation) => (
                        <QuotationCard key={quotation.id} quotation={quotation} />
                    ))}
                </section>
            )}
        </main>
    )
}