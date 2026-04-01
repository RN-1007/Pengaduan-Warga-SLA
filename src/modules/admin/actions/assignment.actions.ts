"use server";

import { createClient } from "@supabase/supabase-js";

const getAdminSupabase = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

/** Fetch semua laporan berstatus VERIFIED, diurutkan berdasarkan SLA deadline terdekat */
export async function getVerifiedComplaintsAction() {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
        .from("complaints")
        .select(`
            *,
            complaint_categories ( name ),
            users!complaints_citizen_id_fkey ( full_name )
        `)
        .eq("status", "VERIFIED")
        .order("sla_deadline", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

/** Fetch semua user dengan role OFFICER */
export async function getAvailableOfficersAction() {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, role, phone_number")
        .eq("role", "OFFICER")
        .order("full_name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

/** Assign laporan ke officer: insert ke complaint_assignments, update status, log ke complaint_updates */
export async function assignComplaintAction(payload: {
    complaintId: string;
    officerId: string;
    assignedBy: string;
}) {
    const supabase = getAdminSupabase();

    // 1. Insert assignment record
    const { error: assignErr } = await supabase
        .from("complaint_assignments")
        .insert({
            complaint_id: payload.complaintId,
            officer_id: payload.officerId,
            assigned_by: payload.assignedBy,
        });
    if (assignErr) throw new Error(assignErr.message);

    // 2. Update status laporan → ASSIGNED
    const { error: updateErr } = await supabase
        .from("complaints")
        .update({ status: "ASSIGNED", updated_at: new Date().toISOString() })
        .eq("id", payload.complaintId);
    if (updateErr) throw new Error(updateErr.message);

    // 3. Tulis log ke complaint_updates
    const { error: logErr } = await supabase.from("complaint_updates").insert({
        complaint_id: payload.complaintId,
        officer_id: payload.assignedBy,
        notes: `[DITUGASKAN] Laporan ditugaskan ke Officer ID: ${payload.officerId}`,
    });
    if (logErr) throw new Error(logErr.message);

    return true;
}
