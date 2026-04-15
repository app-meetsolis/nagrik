import { CitizenNav } from '@/components/CitizenNav'

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CitizenNav />
      {/* md:pl-56 offsets the fixed 224px sidebar on desktop */}
      <div className="flex flex-col min-h-screen bg-white text-slate-900 md:pl-56">
        {children}
      </div>
    </>
  )
}
