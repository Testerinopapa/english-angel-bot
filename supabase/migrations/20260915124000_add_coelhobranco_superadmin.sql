-- Superadmin privileges for coelhobranco@proton.me
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE LOWER(email) = 'coelhobranco@proton.me'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update trigger function to include coelhobranco@proton.me
CREATE OR REPLACE FUNCTION public.handle_superadmin_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS 
BEGIN
  IF LOWER(NEW.email) IN ('lorendamasio@gmail.com', 'gmalavaes@gmail.com', 'coelhobranco@proton.me') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
;
