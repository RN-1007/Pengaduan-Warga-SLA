-- =========================================================================
-- 1. EXTENSIONS & ENUMS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.user_role AS ENUM ('CITIZEN', 'ADMIN', 'OFFICER', 'SUPERVISOR');
CREATE TYPE public.complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');
CREATE TYPE public.complaint_status AS ENUM ('SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role public.user_role NOT NULL DEFAULT 'CITIZEN',
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.complaint_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.sla_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.complaint_categories(id) ON DELETE CASCADE,
    priority public.complaint_priority NOT NULL,
    resolution_time_hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, priority)
);

CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.complaint_categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    photo_url TEXT,
    priority public.complaint_priority,
    status public.complaint_status NOT NULL DEFAULT 'SUBMITTED',
    sla_deadline TIMESTAMP WITH TIME ZONE,
    is_escalated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.complaint_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    previous_status public.complaint_status,
    new_status public.complaint_status,
    notes TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.escalation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    escalated_to_role public.user_role DEFAULT 'SUPERVISOR',
    reason TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX idx_complaints_citizen_id ON public.complaints(citizen_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category_id ON public.complaints(category_id);
CREATE INDEX idx_complaint_assignments_officer_id ON public.complaint_assignments(officer_id);

-- =========================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================
ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua pengguna bisa melihat aturan SLA" ON public.sla_rules FOR SELECT USING (true);
CREATE POLICY "Hanya Admin yang bisa kelola aturan SLA" ON public.sla_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Petugas melihat tugasnya, Admin/Supervisor melihat semua" ON public.complaint_assignments FOR SELECT USING (
    officer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERVISOR'))
);
CREATE POLICY "Hanya Admin yang bisa menugaskan petugas" ON public.complaint_assignments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Pihak terkait bisa melihat progres" ON public.complaint_updates FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.complaints c
        LEFT JOIN public.users u ON u.id = auth.uid()
        WHERE c.id = complaint_updates.complaint_id
        AND (c.citizen_id = auth.uid() OR complaint_updates.officer_id = auth.uid() OR u.role IN ('ADMIN', 'SUPERVISOR'))
    )
);
CREATE POLICY "Hanya petugas yang ditugaskan yang bisa update progres" ON public.complaint_updates FOR INSERT WITH CHECK (
    officer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.complaint_assignments WHERE complaint_id = complaint_updates.complaint_id AND officer_id = auth.uid())
);

CREATE POLICY "Warga kelola rating sendiri, Admin/Spv bisa melihat" ON public.ratings FOR ALL USING (
    citizen_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERVISOR'))
);

-- =========================================================================
-- 5. FUNCTIONS & TRIGGERS
-- =========================================================================

-- A. Auto Update 'updated_at' Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_complaint_categories_modtime BEFORE UPDATE ON public.complaint_categories FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_sla_rules_modtime BEFORE UPDATE ON public.sla_rules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_complaints_modtime BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- B. Handle New User from Auth Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone_number, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone_number', 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'CITIZEN'::public.user_role)
  );
  RETURN new;
END;
$$;

-- C. Kalkulasi SLA Otomatis
CREATE OR REPLACE FUNCTION public.calculate_sla_deadline()
RETURNS TRIGGER AS $$
DECLARE
    v_hours INTEGER;
BEGIN
    IF NEW.status = 'VERIFIED' AND OLD.status != 'VERIFIED' AND NEW.priority IS NOT NULL THEN
        SELECT resolution_time_hours INTO v_hours
        FROM public.sla_rules
        WHERE category_id = NEW.category_id AND priority = NEW.priority;

        IF FOUND THEN
            NEW.sla_deadline = NOW() + (v_hours || ' hours')::INTERVAL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_calculate_sla_deadline
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.calculate_sla_deadline();

-- D. Sinkronisasi Status Laporan
CREATE OR REPLACE FUNCTION public.sync_complaint_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.new_status IS NOT NULL THEN
        UPDATE public.complaints
        SET status = NEW.new_status, 
            updated_at = NOW()
        WHERE id = NEW.complaint_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_complaint_status
AFTER INSERT ON public.complaint_updates
FOR EACH ROW
EXECUTE FUNCTION public.sync_complaint_status();

-- =========================================================================
-- 6. STORAGE BUCKETS & POLICIES (Pastikan ekstensi storage diaktifkan di Supabase)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaints', 'complaints', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Foto pengaduan dapat dilihat oleh publik" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'complaints' );

CREATE POLICY "Pengguna terautentikasi dapat mengunggah foto" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK ( bucket_id = 'complaints' );

CREATE POLICY "Pengguna dapat menghapus fotonya sendiri"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
  bucket_id = 'complaints' 
  AND auth.uid() = owner 
);