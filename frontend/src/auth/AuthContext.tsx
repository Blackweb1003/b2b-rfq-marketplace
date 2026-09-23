import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  getUserFromToken,
  loginUser,
  type AuthUser,
  type LoginCredentials,
} from '../api/auth'

interface AuthState {
  token: string
  user: AuthUser
}

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  logout: () => void
}

const STORAGE_KEY = 'merzado.auth'

function loadAuthState(): AuthState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as AuthState) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(loadAuthState)

  async function login(credentials: LoginCredentials) {
    const response = await loginUser(credentials)
    const user = getUserFromToken(response.access_token)
    const nextAuth = { token: response.access_token, user }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth))
    setAuth(nextAuth)
    return user
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token: auth?.token ?? null,
        user: auth?.user ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}