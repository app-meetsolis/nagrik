import { CitizenNav } from '@/components/CitizenNav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] bg-white text-slate-900 overflow-hidden">
      <CitizenNav />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
