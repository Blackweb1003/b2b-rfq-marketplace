import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { createBuyerRfq } from '../api/rfqs'
import { useAuth } from '../auth/AuthContext'

export function CreateRfqPage() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [productServiceName, setProductServiceName] = useState('')
    const [requirementDescription, setRequirementDescription] = useState('')
    const [quantity, setQuantity] = useState('')
    const [deliveryLocation, setDeliveryLocation] = useState('')
    const [deadline, setDeadline] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

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
            await createBuyerRfq(token, {
                product_service_name: productServiceName.trim(),
                requirement_description: requirementDescription.trim(),
                quantity: Number(quantity),
                delivery_location: deliveryLocation.trim(),
                deadline: new Date(deadline).toISOString(),
            })
            navigate('/buyer/rfqs', {
                replace: true,
                state: { message: 'RFQ created successfully.' },
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
                    : 'Unable to create the RFQ right now.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card rfq-form-card">
                <p className="eyebrow">BUYER WORKSPACE</p>
                <h1>Create an RFQ.</h1>
                <p className="auth-copy">
                    Tell suppliers what you need and when you need it.
                </p>
                {error && <div className="error-message" role="alert">{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Product / Service Name
                        <input
                            type="text"
                            value={productServiceName}
                            onChange={(event) => setProductServiceName(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Requirement Description
                        <textarea
                            value={requirementDescription}
                            onChange={(event) => setRequirementDescription(event.target.value)}
                            rows={4}
                            required
                        />
                    </label>
                    <label>
                        Quantity
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Delivery Location
                        <input
                            type="text"
                            value={deliveryLocation}
                            onChange={(event) => setDeliveryLocation(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Deadline
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(event) => setDeadline(event.target.value)}
                            required
                        />
                    </label>
                    <div className="form-actions">
                        <button
                            className="secondary-button"
                            type="button"
                            onClick={() => navigate('/buyer/rfqs')}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button className="primary-button" type="submit" disabled={submitting}>
                            {submitting ? 'Creating RFQ...' : 'Create RFQ'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}