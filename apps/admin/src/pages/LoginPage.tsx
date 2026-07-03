import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { role, loading } = useAuth()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [nonAdminError, setNonAdminError] = useState(false)

  // Redirect if already authenticated as admin
  if (!loading && role === 'admin') {
    return <Navigate to="/" replace />
  }

  async function sendCode() {
    if (!email.trim()) return
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    })
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Code sent — check your email')
      setStep('otp')
    }
  }

  async function verifyCode() {
    if (!otp.trim()) return
    setBusy(true)
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    })
    if (error) {
      setBusy(false)
      if (
        error.message.toLowerCase().includes('expired') ||
        error.message.toLowerCase().includes('invalid')
      ) {
        toast.error('Invalid or expired code. Request a new one.')
      } else {
        toast.error(error.message)
      }
      return
    }

    // Check if the verified user is admin
    const userId = data.user?.id
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut()
        setNonAdminError(true)
        setBusy(false)
        return
      }
    }

    setBusy(false)
    // Auth state change will trigger redirect via RequireAdmin
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-top to-dark-bottom">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Settlr Admin</h1>
            <p className="text-muted text-sm mt-1">Sign in to your admin account</p>
          </div>

          {nonAdminError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              This account does not have admin access.
            </div>
          )}

          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 border border-violet-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet"
                  autoFocus
                />
              </div>
              <button
                id="send-code-btn"
                onClick={sendCode}
                disabled={busy || !email.trim()}
                className="w-full py-3 bg-violet text-white rounded-xl font-medium hover:bg-violet/90 disabled:opacity-60 transition-colors"
              >
                {busy ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
              </p>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Verification code
                </label>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-violet-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet tracking-widest text-center text-lg"
                  autoFocus
                />
              </div>
              <button
                id="verify-otp-btn"
                onClick={verifyCode}
                disabled={busy || otp.length < 6}
                className="w-full py-3 bg-violet text-white rounded-xl font-medium hover:bg-violet/90 disabled:opacity-60 transition-colors"
              >
                {busy ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={() => { setStep('email'); setOtp(''); setNonAdminError(false) }}
                className="w-full py-2 text-sm text-muted hover:text-ink transition-colors"
              >
                ← Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
