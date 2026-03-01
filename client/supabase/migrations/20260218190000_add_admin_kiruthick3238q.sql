-- Add admin role for kiruthick3238q@gmail.com
-- Run this in Supabase SQL Editor after the user has signed up

-- First, ensure the user exists in auth.users and has a profile
-- Then add the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'
FROM public.profiles p
WHERE p.email = 'kiruthick3238q@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was added
SELECT 
  p.email,
  p.full_name,
  ur.role
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.user_id
WHERE p.email = 'kiruthick3238q@gmail.com';
