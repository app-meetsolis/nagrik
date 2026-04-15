import { isAuthority } from '@/lib/clerk'
import { redirect } from 'next/navigation'
import { Sidebar } from './dashboard/Sidebar'

export default async function AuthorityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ok = await isAuthority()
  if (!ok) redirect('/')

  return (
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
