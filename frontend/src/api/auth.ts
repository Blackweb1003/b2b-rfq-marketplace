export type Role = 'buyer' | 'supplier'

export interface LoginCredentials {
    email: string
    password: string
}

export interface SignupData extends LoginCredentials {
    full_name: string
    role: Role
}

export interface AuthUser {
    id: number
    role: Role
}

interface TokenResponse {
    access_token: string
    token_type: string
}

interface UserResponse {
    id: number
    role: Role
}

export class ApiError extends Error {
    readonly status: number

    constructor(
        message: string,
        status: number,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
        const detail = body?.detail
        const message = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || 'The request could not be completed.'

        throw new ApiError(message, response.status)
    }

    return body as T
}

export function registerUser(data: SignupData): Promise<UserResponse> {
    return request<UserResponse>('/users/', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export function loginUser(
    credentials: LoginCredentials,
): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    })
}

export function getUserFromToken(token: string): AuthUser {
    const payload = token.split('.')[1]
    if (!payload) {
        throw new Error('The login response contained an invalid token.')
    }

    const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = base64Payload.padEnd(
        base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
        '=',
    )
    const decoded = JSON.parse(atob(paddedPayload)) as {
        sub?: string
        role?: Role
    }

    if (!decoded.sub || !decoded.role || !['buyer', 'supplier'].includes(decoded.role)) {
        throw new Error('The login response did not contain a valid user role.')
    }

    return {
        id: Number(decoded.sub),
        role: decoded.role,
    }
}