"use server";

import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "complaint-photos";

const getAdminSupabase = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

/**
 * Upload foto pengaduan ke Supabase Storage.
 * Menerima base64 string agar bisa dipakai dari Client Component via Server Action.
 * Bucket akan dibuat otomatis jika belum ada.
 */
export async function uploadComplaintPhotoAction(payload: {
    base64: string;       // data URL: "data:image/png;base64,..."
    fileName: string;
    mimeType: string;
    citizenId: string;
}): Promise<string> {
    const supabase = getAdminSupabase();

    // 1. Pastikan bucket ada — buat jika belum
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
        const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024, // 5MB
            allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        });
        if (createErr) throw new Error("Gagal membuat bucket: " + createErr.message);
    }

    // 2. Decode base64 → Buffer
    const base64Data = payload.base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 3. Upload file
    const ext = payload.fileName.split(".").pop() || "jpg";
    const filePath = `${payload.citizenId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: payload.mimeType,
            upsert: false,
        });

    if (uploadErr) throw new Error("Gagal upload foto: " + uploadErr.message);

    // 4. Ambil public URL
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
}
