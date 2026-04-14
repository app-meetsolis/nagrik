import { isAuthority } from '@/lib/clerk'
import { redirect } from 'next/navigation'

export default async function AuthorityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ok = await isAuthority()
  if (!ok) redirect('/')

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {children}
    </div>
  )
}
