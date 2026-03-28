import { createClient } from '@/lib/supabase/client' // Use server client in real prod, but edge/client is fine if RLS bypassed properly for server admin context.
import { createServerClient, type CookieOptions } from '@supabase/ssr' // Should use anon or service_role
import { cookies } from 'next/headers'

// Ideally, cron jobs use the SERVICE_ROLE_KEY to bypass RLS.
// Here we assume createClient sets it up, or we pass service_role directly.

export const escalationRepository = {
  async processSlaEscalation() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // We import directly to bypass next/headers rules if this runs as generic crons
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch complaints that are not resolved AND past their SLA deadline.
    // Assuming SLA deadline is calculated upon creation/verification and saved in `sla_deadline`.
    // Alternatively, calculate inline. For now we use the `sla_deadline` field.
    
    const now = new Date().toISOString()

    const { data: overdue, error } = await supabase
      .from('complaints')
      .select('id, title')
      .lt('sla_deadline', now)
      .eq('is_escalated', false)
      .not('status', 'in', '("RESOLVED", "CLOSED")')

    if (error) throw error
    if (!overdue || overdue.length === 0) return { escalated: 0 }

    const ids = overdue.map((c: any) => c.id)

    // 2. Update to EMERGENCY and is_escalated = true
    const { error: updateError } = await supabase
      .from('complaints')
      .update({ priority: 'EMERGENCY', is_escalated: true })
      .in('id', ids)

    if (updateError) throw updateError

    // 3. Log to escalation_logs
    const logs = overdue.map((c: any) => ({
      complaint_id: c.id,
      reason: 'SLA deadline exceeded automatic escalation',
    }))

    const { error: logError } = await supabase
      .from('escalation_logs')
      .insert(logs)

    if (logError) throw logError

    return { escalated: ids.length, ids }
  }
}
