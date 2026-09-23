import { ApiError } from './auth'

export interface Quotation {
    id: number
    rfq_id: number
    supplier_id: number
    price: number
    estimated_delivery_time: number
    message: string | null
    created_at: string
    updated_at: string
}

export async function getBuyerQuotations(token: string): Promise<Quotation[]> {
    const response = await fetch('/api/buyer/quotations', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'Unable to load your quotations.'

        throw new ApiError(message, response.status)
    }

    return body as Quotation[]
}