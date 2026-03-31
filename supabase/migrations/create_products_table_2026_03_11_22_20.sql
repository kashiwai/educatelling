-- Create products table for managing items
CREATE TABLE IF NOT EXISTS public.products_2026_03_11_22_20 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    price_aud DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 999,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_active_order_2026_03_11_22_20 
ON public.products_2026_03_11_22_20 (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_products_category_2026_03_11_22_20 
ON public.products_2026_03_11_22_20 (category);

-- Enable RLS
ALTER TABLE public.products_2026_03_11_22_20 ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Allow public read access to active products" ON public.products_2026_03_11_22_20
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage products" ON public.products_2026_03_11_22_20
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample products
INSERT INTO public.products_2026_03_11_22_20 (name, name_en, description, price_aud, category, is_featured, display_order, stock_quantity) VALUES
('初級日本語教材セット', 'Beginner Japanese Learning Kit', 'Complete beginner-friendly Japanese learning materials including textbooks, workbooks, and audio CDs', 89.99, 'Learning Materials', true, 1, 50),
('中級日本語教材セット', 'Intermediate Japanese Learning Kit', 'Comprehensive intermediate level Japanese learning materials with advanced grammar and vocabulary', 129.99, 'Learning Materials', false, 2, 30),
('JLPT N5対策テキスト', 'JLPT N5 Preparation Book', 'Official JLPT N5 exam preparation textbook with practice tests and answer keys', 45.99, 'JLPT Prep', false, 3, 25),
('JLPT N4対策テキスト', 'JLPT N4 Preparation Book', 'Comprehensive JLPT N4 exam preparation materials with mock tests', 55.99, 'JLPT Prep', false, 4, 20),
('日本文化体験キット', 'Japanese Culture Experience Kit', 'Hands-on Japanese culture learning kit including origami, calligraphy supplies, and cultural guides', 75.99, 'Culture Kit', true, 5, 15),
('オンライン授業1回券', 'Single Online Lesson Voucher', 'One-time online Japanese lesson voucher (60 minutes) with certified instructor', 35.99, 'Online Lessons', false, 6, 100);

COMMENT ON TABLE public.products_2026_03_11_22_20 IS 'Products table for Opal Japanese Kids e-commerce functionality';