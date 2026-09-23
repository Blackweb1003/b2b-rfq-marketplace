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

export interface CreateRfqData {
    product_service_name: string
    requirement_description: string
    quantity: number
    delivery_location: string
    deadline: string
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

async function getBuyerRfqRequest(token: string, path: string): Promise<Rfq> {
    const response = await fetch(path, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'Unable to load the RFQ.'

        throw new ApiError(message, response.status)
    }

    return body as Rfq
}

export function getBuyerRfq(token: string, rfqId: number): Promise<Rfq> {
    return getBuyerRfqRequest(token, `/api/buyer/rfqs/${rfqId}`)
}

export async function createBuyerRfq(
    token: string,
    data: CreateRfqData,
): Promise<Rfq> {
    const response = await fetch('/api/buyer/rfqs', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'Unable to create the RFQ.'

        throw new ApiError(message, response.status)
    }

    return body as Rfq
}

export async function updateBuyerRfq(
    token: string,
    rfqId: number,
    data: CreateRfqData,
): Promise<Rfq> {
    const response = await fetch(`/api/buyer/rfqs/${rfqId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'Unable to update the RFQ.'

        throw new ApiError(message, response.status)
    }

    return body as Rfq
}

export async function deleteBuyerRfq(token: string, rfqId: number): Promise<void> {
    const response = await fetch(`/api/buyer/rfqs/${rfqId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (response.status === 204) {
        return
    }

    const body = await response.json().catch(() => null)
    const detail = body?.detail
    const message = Array.isArray(detail)
        ? detail.map((item) => item.msg).join(', ')
        : detail || 'Unable to delete the RFQ.'

    throw new ApiError(message, response.status)
}

export async function closeBuyerRfq(token: string, rfqId: number): Promise<Rfq> {
    const response = await fetch(`/api/buyer/rfqs/${rfqId}/close`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'Unable to close the RFQ.'

        throw new ApiError(message, response.status)
    }

    return body as Rfq
}