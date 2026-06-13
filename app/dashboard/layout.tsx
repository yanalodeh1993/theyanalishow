import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardStatsPanel } from '@/components/dashboard/DashboardStatsPanel'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div
      className="dashboard-shell flex h-screen overflow-hidden"
      style={{ background: '#0d0d0f' }}
    >
      <DashboardSidebar email={user.email ?? ''} />
      <DashboardStatsPanel />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
