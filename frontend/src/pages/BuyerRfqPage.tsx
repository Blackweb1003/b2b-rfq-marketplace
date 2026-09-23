import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { getBuyerRfqs, type Rfq } from '../api/rfqs'
import { useAuth } from '../auth/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function RfqAction({ label }: { label: string }) {
    return (
        <button
            className="rfq-action"
            type="button"
            disabled
            title={`${label} will be available in a later module`}
        >
            {label}
        </button>
    )
}

function RfqCard({ rfq }: { rfq: Rfq }) {
    return (
        <article className="rfq-card">
            <div className="rfq-card-header">
                <div>
                    <p className="card-kicker">RFQ #{rfq.id}</p>
                    <h2>{rfq.product_service_name}</h2>
                </div>
                <span className={`status-badge status-${rfq.status.toLowerCase()}`}>
                    {rfq.status}
                </span>
            </div>
            <p className="rfq-description">{rfq.requirement_description}</p>
            <dl className="rfq-details">
                <div>
                    <dt>Quantity</dt>
                    <dd>{rfq.quantity}</dd>
                </div>
                <div>
                    <dt>Delivery location</dt>
                    <dd>{rfq.delivery_location}</dd>
                </div>
                <div>
                    <dt>Deadline</dt>
                    <dd>{formatDate(rfq.deadline)}</dd>
                </div>
                <div>
                    <dt>Created</dt>
                    <dd>{formatDate(rfq.created_at)}</dd>
                </div>
            </dl>
            <div className="rfq-card-footer">
                <div className="rfq-actions" aria-label={`Actions for RFQ ${rfq.id}`}>
                    <RfqAction label="View" />
                    {rfq.status === 'OPEN' && (
                        <>
                            <RfqAction label="Edit" />
                            <RfqAction label="Close" />
                            <RfqAction label="Delete" />
                        </>
                    )}
                </div>
                <span className="updated-label">Updated {formatDate(rfq.updated_at)}</span>
            </div>
        </article>
    )
}

export function BuyerRfqPage() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [rfqs, setRfqs] = useState<Rfq[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function loadRfqs() {
        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        setLoading(true)
        setError('')
        try {
            setRfqs(await getBuyerRfqs(token))
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setError(
                caughtError instanceof ApiError
                    ? caughtError.message
                    : 'Unable to load your RFQs.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadRfqs()
    }, [token])

    return (
        <main className="dashboard-page">
            <section className="dashboard-heading">
                <div>
                    <p className="eyebrow">BUYER WORKSPACE</p>
                    <h1>My RFQs</h1>
                    <p className="dashboard-copy">
                        Keep your sourcing requests organized from one place.
                    </p>
                </div>
                <button className="primary-button create-button" type="button" disabled>
                    Create RFQ
                </button>
            </section>

            {loading && <div className="state-panel">Loading your RFQs...</div>}

            {!loading && error && (
                <div className="state-panel error-state" role="alert">
                    <p>{error}</p>
                    <button className="secondary-button" type="button" onClick={loadRfqs}>
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && rfqs.length === 0 && (
                <div className="state-panel empty-state">
                    <p className="card-kicker">NO RFQS YET</p>
                    <h2>Your sourcing requests will appear here.</h2>
                    <p>Create an RFQ to start collecting supplier quotations.</p>
                </div>
            )}

            {!loading && !error && rfqs.length > 0 && (
                <section className="rfq-grid" aria-label="Your RFQs">
                    {rfqs.map((rfq) => <RfqCard key={rfq.id} rfq={rfq} />)}
                </section>
            )}
        </main>
    )
}