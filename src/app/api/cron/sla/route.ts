import { NextResponse } from 'next/server'
import { escalationRepository } from '@/modules/complaints/repositories/escalation.repository'

// Example Vercel Cron or Supabase pg_net HTTP call target
// Requires Authorization header to protect the route
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Basic protection against public triggering
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow only if match env CRON_SECRET, or pass through if not set for dev purposes
      if (process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const result = await escalationRepository.processSlaEscalation()
    
    return NextResponse.json({
      success: true,
      message: `Processed SLA successfully. Escalated ${result.escalated} complaints.`,
      result
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
