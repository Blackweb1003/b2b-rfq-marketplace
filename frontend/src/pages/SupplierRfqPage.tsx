import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { getSupplierRfqs, type Rfq } from '../api/rfqs'
import { useAuth } from '../auth/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function RfqCard({ rfq, onView }: { rfq: Rfq; onView: (id: number) => void }) {
    return (
        <article className="rfq-card">
            <div className="rfq-card-header">
                <div>
                    <p className="card-kicker">RFQ #{rfq.id}</p>
                    <h2>{rfq.product_service_name}</h2>
                </div>
                <span className="status-badge status-open">{rfq.status}</span>
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
                <button className="secondary-button" type="button" onClick={() => onView(rfq.id)}>
                    View details
                </button>
            </div>
        </article>
    )
}

export function SupplierRfqPage() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [rfqs, setRfqs] = useState<Rfq[]>([])
    const [search, setSearch] = useState('')
    const [deliveryLocation, setDeliveryLocation] = useState('')
    const [activeFilters, setActiveFilters] = useState({ search: '', delivery_location: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function loadRfqs(filters = activeFilters) {
        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        setLoading(true)
        setError('')
        try {
            setRfqs(await getSupplierRfqs(token, filters))
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setError(
                caughtError instanceof ApiError
                    ? caughtError.message
                    : 'Unable to load available RFQs.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadRfqs({ search: '', delivery_location: '' })
    }, [token])

    function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const filters = {
            search: search.trim(),
            delivery_location: deliveryLocation.trim(),
        }
        setActiveFilters(filters)
        void loadRfqs(filters)
    }

    function handleReset() {
        setSearch('')
        setDeliveryLocation('')
        const filters = { search: '', delivery_location: '' }
        setActiveFilters(filters)
        void loadRfqs(filters)
    }

    return (
        <main className="dashboard-page">
            <section className="dashboard-heading">
                <div>
                    <p className="eyebrow">SUPPLIER MARKETPLACE</p>
                    <h1>Available RFQs</h1>
                    <p className="dashboard-copy">
                        Find open sourcing requests from buyers across the marketplace.
                    </p>
                </div>
            </section>

            <form className="marketplace-filters" onSubmit={handleFilterSubmit}>
                <label>
                    Search
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Product or requirement"
                    />
                </label>
                <label>
                    Delivery location
                    <input
                        type="search"
                        value={deliveryLocation}
                        onChange={(event) => setDeliveryLocation(event.target.value)}
                        placeholder="City or region"
                    />
                </label>
                <button className="primary-button filter-button" type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Search RFQs'}
                </button>
                <button className="secondary-button filter-button" type="button" onClick={handleReset} disabled={loading}>
                    Reset
                </button>
            </form>

            {loading && <div className="state-panel">Loading available RFQs...</div>}

            {!loading && error && (
                <div className="state-panel error-state" role="alert">
                    <p>{error}</p>
                    <button className="secondary-button" type="button" onClick={() => void loadRfqs()}>
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && rfqs.length === 0 && (
                <div className="state-panel empty-state">
                    <p className="card-kicker">NO MATCHING RFQS</p>
                    <h2>No open RFQs match these filters.</h2>
                    <p>Try a broader search or reset the filters to see all available requests.</p>
                </div>
            )}

            {!loading && !error && rfqs.length > 0 && (
                <section className="rfq-grid" aria-label="Available RFQs">
                    {rfqs.map((rfq) => (
                        <RfqCard key={rfq.id} rfq={rfq} onView={(id) => navigate(`/supplier/rfqs/${id}`)} />
                    ))}
                </section>
            )}
        </main>
    )
}