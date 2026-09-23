import { ApiError } from './auth'

export interface Rfq {
    id: number
    buyer_id: number
    product_service_name: string
    requirement_description: string
    quantity: number
    delivery_location: string
    deadline: string
    status: string
    created_at: string
    updated_at: string
}

export async function getBuyerRfqs(token: string): Promise<Rfq[]> {
    const response = await fetch('/api/buyer/rfqs', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'Unable to load your RFQs.'

        throw new ApiError(message, response.status)
    }

    return body as Rfq[]
}