import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { getBuyerRfq, updateBuyerRfq } from '../api/rfqs'
import { useAuth } from '../auth/AuthContext'

function toDateTimeLocal(value: string) {
    const date = new Date(value)
    const pad = (part: number) => String(part).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function EditRfqPage() {
    const { rfq_id: rfqIdParam } = useParams()
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const rfqId = Number(rfqIdParam)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const [productServiceName, setProductServiceName] = useState('')
    const [requirementDescription, setRequirementDescription] = useState('')
    const [quantity, setQuantity] = useState('')
    const [deliveryLocation, setDeliveryLocation] = useState('')
    const [deadline, setDeadline] = useState('')

    useEffect(() => {
        async function loadRfq() {
            if (!token || !Number.isInteger(rfqId) || rfqId <= 0) {
                if (!token) {
                    navigate('/login', { replace: true })
                } else {
                    setLoadError('The RFQ ID is invalid.')
                    setLoading(false)
                }
                return
            }

            try {
                const rfq = await getBuyerRfq(token, rfqId)
                setProductServiceName(rfq.product_service_name)
                setRequirementDescription(rfq.requirement_description)
                setQuantity(String(rfq.quantity))
                setDeliveryLocation(rfq.delivery_location)
                setDeadline(toDateTimeLocal(rfq.deadline))
                setStatus(rfq.status)
            } catch (caughtError) {
                if (caughtError instanceof ApiError && caughtError.status === 401) {
                    logout()
                    navigate('/login', { replace: true })
                    return
                }

                setLoadError(
                    caughtError instanceof ApiError
                        ? caughtError.message
                        : 'Unable to load this RFQ.',
                )
            } finally {
                setLoading(false)
            }
        }

        void loadRfq()
    }, [logout, navigate, rfqId, token])

    function validateForm() {
        if (
            !productServiceName.trim() ||
            !requirementDescription.trim() ||
            !quantity.trim() ||
            !deliveryLocation.trim() ||
            !deadline
        ) {
            return 'Complete every field before submitting.'
        }

        const parsedQuantity = Number(quantity)
        if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
            return 'Quantity must be a positive whole number.'
        }

        if (Number.isNaN(new Date(deadline).getTime())) {
            return 'Enter a valid deadline.'
        }

        return ''
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const validationError = validateForm()
        setError(validationError)
        if (validationError || !token) {
            if (!token) navigate('/login', { replace: true })
            return
        }

        setSubmitting(true)
        try {
            await updateBuyerRfq(token, rfqId, {
                product_service_name: productServiceName.trim(),
                requirement_description: requirementDescription.trim(),
                quantity: Number(quantity),
                delivery_location: deliveryLocation.trim(),
                deadline: new Date(deadline).toISOString(),
            })
            navigate('/buyer/rfqs', {
                replace: true,
                state: { message: 'RFQ updated successfully.' },
            })
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setError(
                caughtError instanceof ApiError
                    ? caughtError.message
                    : 'Unable to update the RFQ right now.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <main className="auth-page"><div className="state-panel">Loading RFQ...</div></main>
    }

    if (loadError) {
        return (
            <main className="auth-page">
                <div className="state-panel error-state" role="alert">
                    <p>{loadError}</p>
                    <button className="secondary-button" type="button" onClick={() => navigate('/buyer/rfqs')}>
                        Back to RFQs
                    </button>
                </div>
            </main>
        )
    }

    if (status !== 'OPEN') {
        return (
            <main className="auth-page">
                <div className="state-panel">
                    <p>This RFQ is closed and cannot be edited.</p>
                    <button className="secondary-button" type="button" onClick={() => navigate('/buyer/rfqs')}>
                        Back to RFQs
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <section className="auth-card rfq-form-card">
                <p className="eyebrow">BUYER WORKSPACE</p>
                <h1>Edit your RFQ.</h1>
                <p className="auth-copy">Keep the request details current for suppliers.</p>
                {error && <div className="error-message" role="alert">{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Product / Service Name
                        <input type="text" value={productServiceName} onChange={(event) => setProductServiceName(event.target.value)} required />
                    </label>
                    <label>
                        Requirement Description
                        <textarea value={requirementDescription} onChange={(event) => setRequirementDescription(event.target.value)} rows={4} required />
                    </label>
                    <label>
                        Quantity
                        <input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
                    </label>
                    <label>
                        Delivery Location
                        <input type="text" value={deliveryLocation} onChange={(event) => setDeliveryLocation(event.target.value)} required />
                    </label>
                    <label>
                        Deadline
                        <input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} required />
                    </label>
                    <div className="form-actions">
                        <button className="secondary-button" type="button" onClick={() => navigate('/buyer/rfqs')} disabled={submitting}>
                            Cancel
                        </button>
                        <button className="primary-button" type="submit" disabled={submitting}>
                            {submitting ? 'Saving changes...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}