import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { getSupplierRfq, type Rfq } from '../api/rfqs'
import { createSupplierQuotation } from '../api/supplierQuotations'
import { useAuth } from '../auth/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date(value))
}

export function SupplierRfqDetailPage() {
    const { rfq_id: rfqIdParam } = useParams()
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const rfqId = Number(rfqIdParam)
    const [rfq, setRfq] = useState<Rfq | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [price, setPrice] = useState('')
    const [deliveryTime, setDeliveryTime] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function loadRfq() {
            if (!token || !Number.isInteger(rfqId) || rfqId <= 0) {
                if (!token) navigate('/login', { replace: true })
                else setLoadError('The RFQ ID is invalid.')
                setLoading(false)
                return
            }

            try {
                setRfq(await getSupplierRfq(token, rfqId))
            } catch (caughtError) {
                if (caughtError instanceof ApiError && caughtError.status === 401) {
                    logout()
                    navigate('/login', { replace: true })
                    return
                }
                setLoadError(caughtError instanceof ApiError ? caughtError.message : 'Unable to load this RFQ.')
            } finally {
                setLoading(false)
            }
        }

        void loadRfq()
    }, [logout, navigate, rfqId, token])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setSuccess('')
        const parsedPrice = Number(price)
        const parsedDeliveryTime = Number(deliveryTime)

        if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            setError('Enter a price greater than zero.')
            return
        }
        if (!deliveryTime.trim() || !Number.isInteger(parsedDeliveryTime) || parsedDeliveryTime <= 0) {
            setError('Estimated delivery time must be a positive whole number.')
            return
        }
        if (!token || !rfq || submitting) return

        setSubmitting(true)
        try {
            await createSupplierQuotation(token, {
                rfq_id: rfq.id,
                price: parsedPrice,
                estimated_delivery_time: parsedDeliveryTime,
                message: message.trim() || null,
            })
            setSuccess('Quotation submitted successfully.')
            setPrice('')
            setDeliveryTime('')
            setMessage('')
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }
            setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to submit the quotation right now.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <main className="auth-page"><div className="state-panel">Loading RFQ...</div></main>
    if (loadError || !rfq) {
        return <main className="auth-page"><div className="state-panel error-state" role="alert"><p>{loadError || 'RFQ is unavailable.'}</p><Link className="secondary-button" to="/supplier/rfqs">Back to marketplace</Link></div></main>
    }

    return (
        <main className="detail-page">
            <Link className="back-link" to="/supplier/rfqs">&lt;- Back to marketplace</Link>
            <section className="detail-layout">
                <article className="detail-card">
                    <p className="eyebrow">AVAILABLE RFQ #{rfq.id}</p>
                    <div className="detail-title-row"><h1>{rfq.product_service_name}</h1><span className="status-badge status-open">{rfq.status}</span></div>
                    <p className="detail-description">{rfq.requirement_description}</p>
                    <dl className="rfq-details detail-fields">
                        <div><dt>Quantity</dt><dd>{rfq.quantity}</dd></div>
                        <div><dt>Delivery location</dt><dd>{rfq.delivery_location}</dd></div>
                        <div><dt>Deadline</dt><dd>{formatDate(rfq.deadline)}</dd></div>
                        <div><dt>Created</dt><dd>{formatDate(rfq.created_at)}</dd></div>
                    </dl>
                </article>
                <section className="auth-card quotation-form-card">
                    <p className="eyebrow">SUPPLIER RESPONSE</p>
                    <h2>Submit a quotation.</h2>
                    <p className="auth-copy">Send your best price and delivery estimate to the buyer.</p>
                    {success && <div className="success-message" role="status">{success}</div>}
                    {error && <div className="error-message" role="alert">{error}</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label>Quoted price<input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /></label>
                        <label>Estimated delivery time (days)<input type="number" min="1" step="1" value={deliveryTime} onChange={(event) => setDeliveryTime(event.target.value)} required /></label>
                        <label>Message / Notes<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Optional notes for the buyer" /></label>
                        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit quotation'}</button>
                    </form>
                </section>
            </section>
        </main>
    )
}