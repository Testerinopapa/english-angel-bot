-- Superadmin privileges for designated emails: lorendamasio@gmail.com, gmalavaes@gmail.com

-- 1. Insert existing users with these emails into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE LOWER(email) IN ('lorendamasio@gmail.com', 'gmalavaes@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Trigger function to auto-assign admin role on signup or email update
CREATE OR REPLACE FUNCTION public.handle_superadmin_emails()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF LOWER(NEW.email) IN ('lorendamasio@gmail.com', 'gmalavaes@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_superadmin ON auth.users;
CREATE TRIGGER on_auth_user_superadmin
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_superadmin_emails();
