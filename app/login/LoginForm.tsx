'use client'
import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <form action={action} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label className="font-chakra text-xs text-muted uppercase tracking-widest">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="bg-surface border rounded-lg px-4 py-3 font-chakra text-sm text-body outline-none transition-colors focus:border-cyan"
          style={{ borderColor: 'rgba(100,120,255,0.2)' }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-chakra text-xs text-muted uppercase tracking-widest">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="bg-surface border rounded-lg px-4 py-3 font-chakra text-sm text-body outline-none transition-colors focus:border-cyan"
          style={{ borderColor: 'rgba(100,120,255,0.2)' }}
        />
      </div>

      {state?.error && (
        <p className="font-chakra text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 py-3 rounded-lg font-russo text-sm tracking-widest uppercase transition-opacity disabled:opacity-50"
        style={{ background: '#6478ff', color: '#fff' }}
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
