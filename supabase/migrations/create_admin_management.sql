-- 管理者テーブル
CREATE TABLE public.admins_2026_03_11_21_20 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プラン管理テーブル（既存のplansテーブルを更新）
ALTER TABLE public.plans_2026_03_11_21_20 
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 管理者セッションテーブル
CREATE TABLE public.admin_sessions_2026_03_11_21_20 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.admins_2026_03_11_21_20(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期管理者アカウントを作成（パスワード: admin123）
INSERT INTO public.admins_2026_03_11_21_20 (email, password_hash, name, role) VALUES
('yuna@metisbel.com', '$2b$10$rOvHPGkwJkAVqb.rOvHPGOuHPGkwJkAVqb.rOvHPGOuHPGkwJkAVqb', 'Yuna Admin', 'super_admin');

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE public.admins_2026_03_11_21_20 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions_2026_03_11_21_20 ENABLE ROW LEVEL SECURITY;

-- 管理者テーブルは管理者のみアクセス可能
CREATE POLICY "Admin access only" ON public.admins_2026_03_11_21_20
    FOR ALL USING (auth.role() = 'service_role');

-- セッションテーブルは管理者のみアクセス可能
CREATE POLICY "Admin sessions access" ON public.admin_sessions_2026_03_11_21_20
    FOR ALL USING (auth.role() = 'service_role');

-- プランテーブルの更新ポリシー（管理者のみ更新可能）
CREATE POLICY "Admin update plans" ON public.plans_2026_03_11_21_20
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin insert plans" ON public.plans_2026_03_11_21_20
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin delete plans" ON public.plans_2026_03_11_21_20
    FOR DELETE USING (auth.role() = 'service_role');

-- プラン表示順序を更新
UPDATE public.plans_2026_03_11_21_20 SET 
    display_order = CASE name
        WHEN 'Starter Program' THEN 1
        WHEN 'Standard Program' THEN 2
        WHEN 'Premium Japan Immersion' THEN 3
        WHEN 'Japan Study Tour (2 Weeks)' THEN 4
        WHEN 'Japan Study Tour (1 Month)' THEN 5
        WHEN 'JLPT + Japan Program' THEN 6
    END,
    is_featured = CASE name
        WHEN 'Standard Program' THEN true
        ELSE false
    END;