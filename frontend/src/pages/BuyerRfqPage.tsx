import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/auth'
import { closeBuyerRfq, deleteBuyerRfq, getBuyerRfqs, type Rfq } from '../api/rfqs'
import { useAuth } from '../auth/AuthContext'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function RfqAction({ label, onClick }: { label: string; onClick?: () => void }) {
    return (
        <button
            className="rfq-action"
            type="button"
            disabled={!onClick}
            onClick={onClick}
            title={`${label} will be available in a later module`}
        >
            {label}
        </button>
    )
}

function RfqCard({
    rfq,
    onEdit,
    onClose,
    onDelete,
}: {
    rfq: Rfq
    onEdit: (id: number) => void
    onClose: (rfq: Rfq) => void
    onDelete: (rfq: Rfq) => void
}) {
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
                            <RfqAction label="Edit" onClick={() => onEdit(rfq.id)} />
                            <RfqAction label="Close" onClick={() => onClose(rfq)} />
                            <RfqAction label="Delete" onClick={() => onDelete(rfq)} />
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
    const location = useLocation()
    const [rfqs, setRfqs] = useState<Rfq[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [pendingDelete, setPendingDelete] = useState<Rfq | null>(null)
    const [pendingClose, setPendingClose] = useState<Rfq | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [closingId, setClosingId] = useState<number | null>(null)
    const successMessage = (location.state as { message?: string } | null)?.message

    async function loadRfqs() {
        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        setLoading(true)
        setLoadError('')
        setError('')
        try {
            setRfqs(await getBuyerRfqs(token))
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setLoadError(
                caughtError instanceof ApiError
                    ? caughtError.message
                    : 'Unable to load your RFQs.',
            )
        } finally {
            setLoading(false)
        }
    }

    async function confirmDelete() {
        if (!token || !pendingDelete || deletingId !== null) return

        setDeletingId(pendingDelete.id)
        setError('')
        try {
            await deleteBuyerRfq(token, pendingDelete.id)
            setRfqs((currentRfqs) => currentRfqs.filter((rfq) => rfq.id !== pendingDelete.id))
            setSuccess(`RFQ "${pendingDelete.product_service_name}" was deleted.`)
            setPendingDelete(null)
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            if (caughtError instanceof ApiError && caughtError.status === 409) {
                setError('This RFQ cannot be deleted because quotations are associated with it.')
            } else {
                setError(
                    caughtError instanceof ApiError
                        ? caughtError.message
                        : 'Unable to delete the RFQ right now.',
                )
            }
        } finally {
            setDeletingId(null)
        }
    }

    async function confirmClose() {
        if (!token || !pendingClose || closingId !== null) return

        setClosingId(pendingClose.id)
        setError('')
        try {
            const closedRfq = await closeBuyerRfq(token, pendingClose.id)
            setRfqs((currentRfqs) => currentRfqs.map((rfq) => (
                rfq.id === closedRfq.id ? closedRfq : rfq
            )))
            setSuccess(`RFQ "${pendingClose.product_service_name}" was closed.`)
            setPendingClose(null)
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.status === 401) {
                logout()
                navigate('/login', { replace: true })
                return
            }

            setError(
                caughtError instanceof ApiError
                    ? caughtError.message
                    : 'Unable to close the RFQ right now.',
            )
        } finally {
            setClosingId(null)
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
                <button
                    className="primary-button create-button"
                    type="button"
                    onClick={() => navigate('/buyer/rfqs/create')}
                >
                    Create RFQ
                </button>
            </section>

            {(successMessage || success) && (
                <div className="success-message dashboard-success">{successMessage || success}</div>
            )}

            {error && <div className="error-message dashboard-success" role="alert">{error}</div>}

            {loading && <div className="state-panel">Loading your RFQs...</div>}

            {!loading && loadError && (
                <div className="state-panel error-state" role="alert">
                    <p>{loadError}</p>
                    <button className="secondary-button" type="button" onClick={loadRfqs}>
                        Try again
                    </button>
                </div>
            )}

            {!loading && !loadError && rfqs.length === 0 && (
                <div className="state-panel empty-state">
                    <p className="card-kicker">NO RFQS YET</p>
                    <h2>Your sourcing requests will appear here.</h2>
                    <p>Create an RFQ to start collecting supplier quotations.</p>
                </div>
            )}

            {!loading && !loadError && rfqs.length > 0 && (
                <section className="rfq-grid" aria-label="Your RFQs">
                    {rfqs.map((rfq) => (
                        <RfqCard
                            key={rfq.id}
                            rfq={rfq}
                            onEdit={(id) => navigate(`/buyer/rfqs/${id}/edit`)}
                            onClose={setPendingClose}
                            onDelete={setPendingDelete}
                        />
                    ))}
                </section>
            )}

            {pendingDelete && (
                <div className="dialog-backdrop" role="presentation">
                    <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
                        <p className="eyebrow">CONFIRM DELETION</p>
                        <h2 id="delete-title">Delete this RFQ?</h2>
                        <p>
                            This will remove <strong>{pendingDelete.product_service_name}</strong> from your RFQ list.
                        </p>
                        <div className="form-actions">
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                className="danger-button"
                                type="button"
                                onClick={() => void confirmDelete()}
                                disabled={deletingId !== null}
                            >
                                {deletingId !== null ? 'Deleting...' : 'Delete RFQ'}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {pendingClose && (
                <div className="dialog-backdrop" role="presentation">
                    <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="close-title">
                        <p className="eyebrow">CONFIRM CLOSURE</p>
                        <h2 id="close-title">Close this RFQ?</h2>
                        <p>
                            <strong>{pendingClose.product_service_name}</strong> will no longer be editable or available for new supplier quotations.
                        </p>
                        <div className="form-actions">
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() => setPendingClose(null)}
                                disabled={closingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() => void confirmClose()}
                                disabled={closingId !== null}
                            >
                                {closingId !== null ? 'Closing...' : 'Close RFQ'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    )
}