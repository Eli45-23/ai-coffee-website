-- Supabase Storage Bucket Setup for AIChatFlows
-- Run these commands in your Supabase SQL Editor

-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('menus', 'menus', true),
  ('faqs', 'faqs', true),
  ('documents', 'documents', true);

-- 2. Set up storage policies for file uploads
-- Allow authenticated and anonymous users to upload files

-- Policy for menus bucket
CREATE POLICY "Allow file uploads to menus bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'menus');

CREATE POLICY "Allow public access to menus bucket files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'menus');

-- Policy for faqs bucket
CREATE POLICY "Allow file uploads to faqs bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'faqs');

CREATE POLICY "Allow public access to faqs bucket files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'faqs');

-- Policy for documents bucket
CREATE POLICY "Allow file uploads to documents bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public access to documents bucket files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- 3. Verify buckets were created successfully
SELECT * FROM storage.buckets WHERE name IN ('menus', 'faqs', 'documents');