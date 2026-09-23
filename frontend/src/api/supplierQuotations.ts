import { ApiError } from './auth'

export interface CreateQuotationData {
    rfq_id: number
    price: number
    estimated_delivery_time: number
    message: string | null
}

export interface QuotationResponse extends CreateQuotationData {
    id: number
    supplier_id: number
    created_at: string
    updated_at: string
}

export async function createSupplierQuotation(
    token: string,
    data: CreateQuotationData,
): Promise<QuotationResponse> {
    const response = await fetch('/api/supplier/quotations', {
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
            : detail || 'Unable to submit the quotation.'

        throw new ApiError(message, response.status)
    }

    return body as QuotationResponse
}

export async function getSupplierQuotations(token: string): Promise<QuotationResponse[]> {
    const response = await fetch('/api/supplier/quotations', {
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

    return body as QuotationResponse[]
}