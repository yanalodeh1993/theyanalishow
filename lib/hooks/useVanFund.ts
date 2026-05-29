'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { VanFund, Donor } from '@/lib/types'

export function useVanFund() {
  const [fund, setFund] = useState<VanFund | null>(null)
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('van_fund').select('*').single(),
      supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }).limit(5),
    ])
      .then(([fundRes, donorsRes]) => {
        if (fundRes.data) setFund(fundRes.data)
        if (donorsRes.data) setDonors(donorsRes.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const percentage = fund
    ? Math.min(100, Math.round((fund.current_amount / fund.goal_amount) * 100))
    : 0

  return { fund, donors, loading, percentage }
}
