import { LoginForm } from './LoginForm'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0d' }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <Image
          src="/logo.png"
          alt="TheYanaliShow"
          width={72}
          height={72}
          style={{ filter: 'drop-shadow(0 0 12px rgba(100,120,255,0.4))' }}
        />
        <div className="text-center">
          <h1 className="font-russo text-xl uppercase tracking-widest text-body mb-1">
            Dashboard
          </h1>
          <p className="font-chakra text-xs text-muted">TheYanaliShow — Owner access</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
