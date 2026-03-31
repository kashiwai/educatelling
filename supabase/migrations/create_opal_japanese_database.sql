-- 顧客申し込み情報テーブル
CREATE TABLE public.applications_2026_03_11_21_20 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    child_age INTEGER NOT NULL CHECK (child_age >= 3 AND child_age <= 18),
    current_level VARCHAR(50) NOT NULL,
    selected_plan VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プラン情報テーブル
CREATE TABLE public.plans_2026_03_11_21_20 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    price_aud DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    description TEXT,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 決済記録テーブル
CREATE TABLE public.payments_2026_03_11_21_20 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.applications_2026_03_11_21_20(id),
    square_payment_id VARCHAR(255),
    amount_aud DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プランデータの初期挿入
INSERT INTO public.plans_2026_03_11_21_20 (name, name_ja, price_aud, duration_months, description, features) VALUES
('Starter Program', 'スタータープログラム', 742.00, 12, 'Basic Japanese learning program for beginners', '["PDF教材", "基本オンライン授業", "メールサポート"]'),
('Standard Program', '標準プログラム', 1107.00, 12, 'Comprehensive Japanese learning with interactive lessons', '["PDF教材", "オンライン授業", "宿題サポート", "進捗レポート"]'),
('Premium Japan Immersion', 'プレミアム・ジャパン・イマージョン', 3255.00, 12, 'Full immersion program with cultural activities', '["全教材アクセス", "個別指導", "文化体験", "JLPT対策"]'),
('2-Week Japan Study Tour', '2週間日本教育ツアー', 4631.00, 1, '2-week educational tour to Japan', '["日本滞在", "文化体験", "学校訪問", "ガイド付き"]'),
('1-Month Japan Study Tour', '1ヶ月日本教育ツアー', 8351.00, 1, '1-month intensive Japan study program', '["1ヶ月滞在", "集中学習", "ホームステイ", "修了証"]'),
('JLPT + Japan Program', 'JLPT + 日本プログラム', 16275.00, 6, 'JLPT preparation with Japan experience', '["JLPT対策", "日本滞在", "試験サポート", "合格保証"]');

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE public.applications_2026_03_11_21_20 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans_2026_03_11_21_20 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_2026_03_11_21_20 ENABLE ROW LEVEL SECURITY;

-- 申し込み情報は管理者のみアクセス可能
CREATE POLICY "Admin access applications" ON public.applications_2026_03_11_21_20
    FOR ALL USING (auth.role() = 'service_role');

-- プラン情報は誰でも読み取り可能
CREATE POLICY "Public read plans" ON public.plans_2026_03_11_21_20
    FOR SELECT USING (is_active = true);

-- 決済情報は管理者のみアクセス可能
CREATE POLICY "Admin access payments" ON public.payments_2026_03_11_21_20
    FOR ALL USING (auth.role() = 'service_role');