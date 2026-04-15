'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Building2, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registerCitizen, verifyAuthorityCode, registerAuthority } from '@/actions/onboard'

type Step = 'pick-role' | 'citizen-form' | 'authority-code' | 'authority-profile'

interface Props {
  wards:       { id: string; name: string }[]
  defaultName: string
}

const INPUT_CLS =
  'w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50'

export function OnboardingShell({ wards, defaultName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step,   setStep]   = useState<Step>('pick-role')
  const [name,   setName]   = useState(defaultName)
  const [phone,  setPhone]  = useState('')
  const [code,   setCode]   = useState('')
  const [wardId, setWardId] = useState('')
  const [error,  setError]  = useState<string | null>(null)

  function go(s: Step) { setError(null); setStep(s) }

  function submitCitizen() {
    if (!name.trim()) { setError('Name is required'); return }
    setError(null)
    startTransition(async () => {
      const r = await registerCitizen(name, phone)
      if (!r.success) { setError(r.error); return }
      router.replace(
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? '/report' : '/home',
      )
    })
  }

  function submitCode() {
    if (!code.trim()) { setError('Enter the access code'); return }
    setError(null)
    startTransition(async () => {
      const r = await verifyAuthorityCode(code)
      if (!r.success) { setError(r.error); return }
      setStep('authority-profile')
    })
  }

  function submitAuthority() {
    if (!name.trim()) { setError('Name is required'); return }
    if (!wardId)       { setError('Select a ward'); return }
    setError(null)
    startTransition(async () => {
      const r = await registerAuthority(name, wardId)
      if (!r.success) { setError(r.error); return }
      router.replace('/dashboard')
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Brand */}
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-900">nagrik</span>
          <p className="text-xs text-slate-400 mt-0.5">Citizen Portal</p>
        </div>

        {/* ── Step: pick-role ──────────────────────────────────────── */}
        {step === 'pick-role' && (
          <>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">How are you joining?</h1>
              <p className="text-sm text-slate-400 mt-1">Choose your role to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => go('citizen-form')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Citizen</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">Report civic issues in your ward</p>
                </div>
              </button>

              <button
                onClick={() => go('authority-code')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Authority</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">Manage and resolve ward issues</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Step: citizen-form ───────────────────────────────────── */}
        {step === 'citizen-form' && (
          <>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Your profile</h1>
              <p className="text-sm text-slate-400 mt-1">Just two quick fields</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input
                  className={INPUT_CLS}
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Phone number</label>
                <input
                  className={INPUT_CLS}
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={isPending}
                  type="tel"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}

            <div className="flex flex-col gap-2">
              <Button
                onClick={submitCitizen}
                disabled={isPending}
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => go('pick-role')}
                disabled={isPending}
                className="w-full text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </div>
          </>
        )}

        {/* ── Step: authority-code ─────────────────────────────────── */}
        {step === 'authority-code' && (
          <>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Authority access</h1>
              <p className="text-sm text-slate-400 mt-1">Enter the access code provided to your department</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Access code</label>
              <input
                className={INPUT_CLS}
                placeholder="Enter access code"
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={isPending}
                autoComplete="off"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-col gap-2">
              <Button
                onClick={submitCode}
                disabled={isPending}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => go('pick-role')}
                disabled={isPending}
                className="w-full text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </div>
          </>
        )}

        {/* ── Step: authority-profile ──────────────────────────────── */}
        {step === 'authority-profile' && (
          <>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Step 2 of 2</p>
              <h1 className="text-lg font-semibold text-slate-900 mt-1">Your authority profile</h1>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input
                  className={INPUT_CLS}
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Assigned ward</label>
                <Select value={wardId} onValueChange={v => setWardId(v ?? '')} disabled={isPending}>
                  <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm">
                    <SelectValue placeholder="Select your ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}

            <div className="flex flex-col gap-2">
              <Button
                onClick={submitAuthority}
                disabled={isPending}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register as Authority'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => go('pick-role')}
                disabled={isPending}
                className="w-full text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
