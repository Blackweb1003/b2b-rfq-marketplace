import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, ApiError, type Role } from '../api/auth'

export function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('buyer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Complete every field to create your account.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      })
      navigate('/login', {
        replace: true,
        state: { message: 'Account created. Log in to continue.' },
      })
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : 'Unable to create your account right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">JOIN THE MARKETPLACE</p>
        <h1>Create your account.</h1>
        <p className="auth-copy">Choose the workspace that matches your role.</p>
        {error && <div className="error-message" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <fieldset>
            <legend>I am joining as</legend>
            <div className="role-options">
              <label className={role === 'buyer' ? 'role-option selected' : 'role-option'}>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === 'buyer'}
                  onChange={() => setRole('buyer')}
                />
                Buyer
              </label>
              <label className={role === 'supplier' ? 'role-option selected' : 'role-option'}>
                <input
                  type="radio"
                  name="role"
                  value="supplier"
                  checked={role === 'supplier'}
                  onChange={() => setRole('supplier')}
                />
                Supplier
              </label>
            </div>
          </fieldset>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="form-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}