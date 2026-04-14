import { CitizenNav } from '@/components/CitizenNav'

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto min-h-0">
        {children}
      </main>
      <CitizenNav />
    </div>
  )
}
