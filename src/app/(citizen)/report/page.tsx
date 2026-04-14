import { currentUser } from '@clerk/nextjs/server'
import ReportFlow from './ReportFlow'

export default async function ReportPage() {
  const user = await currentUser()
  return <ReportFlow firstName={user?.firstName ?? 'Citizen'} />
}
