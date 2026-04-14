export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {children}
    </div>
  )
}
