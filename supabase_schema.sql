-- eSaleAgreement Supabase Database Setup & RLS Schema Script

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    agreement_count INT DEFAULT 0,
    registration_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    features TEXT[],
    image_url TEXT,
    icon_url TEXT,
    button_text TEXT DEFAULT 'Get Started',
    button_link TEXT DEFAULT '/contact.html',
    display_order INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    agreement_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'verified', 'completed', 'cancelled')),
    pdf_file_url TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    designation TEXT,
    company TEXT,
    review TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    profile_image TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    price TEXT NOT NULL,
    duration TEXT DEFAULT 'per agreement',
    features TEXT[],
    highlighted_plan BOOLEAN DEFAULT FALSE,
    button_text TEXT DEFAULT 'Choose Plan',
    button_link TEXT DEFAULT '/contact.html',
    display_order INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT UNIQUE NOT NULL,
    content_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    cloudinary_public_id TEXT,
    file_type TEXT DEFAULT 'image',
    size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, key)
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow public access to view active catalog items
CREATE POLICY "Public Read Active Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Read Active Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Read Active FAQs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Public Read Active Pricing" ON public.pricing_plans FOR SELECT USING (true);
CREATE POLICY "Public Read Website Content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Public Insert Contact Requests" ON public.contact_requests FOR INSERT WITH CHECK (true);

-- Allow full access to authenticated admins
CREATE POLICY "Admin Full Access Admins" ON public.admins FOR ALL USING (true);
CREATE POLICY "Admin Full Access Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Admin Full Access Services" ON public.services FOR ALL USING (true);
CREATE POLICY "Admin Full Access Agreements" ON public.agreements FOR ALL USING (true);
CREATE POLICY "Admin Full Access Testimonials" ON public.testimonials FOR ALL USING (true);
CREATE POLICY "Admin Full Access FAQs" ON public.faqs FOR ALL USING (true);
CREATE POLICY "Admin Full Access Pricing" ON public.pricing_plans FOR ALL USING (true);
CREATE POLICY "Admin Full Access Contact Requests" ON public.contact_requests FOR ALL USING (true);
CREATE POLICY "Admin Full Access Website Content" ON public.website_content FOR ALL USING (true);
CREATE POLICY "Admin Full Access Media" ON public.media FOR ALL USING (true);
CREATE POLICY "Admin Full Access Settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Admin Full Access Activity Logs" ON public.activity_logs FOR ALL USING (true);

-- 5. Seed Initial Data
INSERT INTO public.admins (email, full_name, role, status)
VALUES ('admin@esaleagreement.in', 'Super Administrator', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.services (title, description, features, image_url, icon_url, display_order, status)
VALUES 
('Rental & Lease Agreement', 'Legally binding digital rent agreements with eSign & Aadhaar eKYC.', ARRAY['Aadhaar eKYC', 'Biometric & OTP Verification', 'Stamp Duty Collection', 'Instant PDF Download'], 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service1.jpg', 'FileText', 1, 'active'),
('Commercial Property Sale', 'Comprehensive digital agreements for commercial space sales & leases.', ARRAY['Title Verification', 'Custom Clauses', 'Dual Party eSign', 'Audit Trail'], 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service2.jpg', 'Building', 2, 'active'),
('Residential Sale Deed', 'Draft and execute residential property purchase sale agreements digitally.', ARRAY['Instant Stamp Paper', 'QR Code Verification', 'Secure Storage', 'Legal Expert Review'], 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service3.jpg', 'Home', 3, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.pricing_plans (plan_name, price, duration, features, highlighted_plan, display_order)
VALUES
('Basic Agreement', '₹499', 'per document', ARRAY['1 Agreement Draft', 'Aadhaar OTP eKYC', 'Standard Stamp Duty', 'PDF Download'], false, 1),
('Pro eSign Plan', '₹999', 'per document', ARRAY['Instant Digital eSign', 'Priority Legal Review', 'Custom Clause Editor', 'QR Code Verification', 'Cloud Backup (5 Yrs)'], true, 2),
('Enterprise Bulk', '₹2,499', '10 agreements', ARRAY['Dedicated Account Manager', 'Bulk Aadhaar eKYC', 'API Access', '24/7 Priority Support'], false, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, display_order)
VALUES
('Is an eSaleAgreement legally valid in India?', 'Yes, digital sale agreements with Aadhaar eKYC and eSign are legally binding under the Information Technology Act 2000 and Indian Evidence Act.', 1),
('How long does it take to create an agreement?', 'The entire process takes under 10 minutes from filling details to verifying with OTP and generating your signed PDF.', 2),
('How is stamp duty handled?', 'We automatically compute required stamp duty based on state regulations and attach legal e-stamp certificates.', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.website_content (section_key, content_json)
VALUES
('hero', '{"title":"Secure Every Sale Digitally","subtitle":"Create secure digital sale agreements in minutes with Aadhaar eKYC, OTP Verification, eSign, QR Verification, Secure Cloud Storage, and Verifiable Audit Trails.","badge":"India''s Trusted Digital Agreement Platform","ctaText":"Get Started","ctaLink":"contact.html"}'::jsonb),
('about', '{"title":"About eSaleAgreement","description":"We simplify real estate legal documentation with bank-grade encryption, instant Aadhaar verification, and legal compliance.","mission":"To make property agreements instant, transparent, and legally tamper-proof across India.","vision":"To become India''s premier digital real estate documentation ecosystem."}'::jsonb),
('contact', '{"phone":"+91 98765 43210","email":"support@esaleagreement.in","address":"Level 4, Legal Tech Park, Hyderabad, India","hours":"Mon - Sat: 9:00 AM - 7:00 PM"}'::jsonb),
('seo', '{"metaTitle":"eSaleAgreement - Secure Every Sale Digitally","metaDescription":"Create secure digital sale agreements in minutes with Aadhaar eKYC, OTP Verification, eSign, QR Verification, and Secure Cloud Storage.","keywords":"digital sale agreement, rent agreement online, eSign agreement India, Aadhaar eKYC real estate","ogImage":"https://res.cloudinary.com/fz0eqlir/image/upload/v1/og-banner.png","favicon":"assets/logo.png"}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;
