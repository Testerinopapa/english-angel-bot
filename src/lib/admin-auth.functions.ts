import { createServerFn } from "@tanstack/react-start";
import { SUPERADMIN_EMAILS } from "@/lib/admin.server";

export const confirmAdminEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): { email: string } => {
    if (!input || typeof input !== "object" || !("email" in input)) {
      throw new Error("Email is required");
    }
    const email = String((input as any).email).trim().toLowerCase();
    if (!email) throw new Error("Email is required");
    return { email };
  })
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    if (!SUPERADMIN_EMAILS.includes(email)) {
      throw new Error("This email is not authorized for administrator access.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. List users from Supabase Auth admin
    const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError);
      throw new Error(listError.message);
    }

    const user = userData?.users?.find((u) => u.email?.toLowerCase().trim() === email);
    if (!user) {
      throw new Error(`No account found with email ${email}. Please create the account first.`);
    }

    // 2. Mark email as confirmed in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (updateError) {
      console.error("Error confirming user email:", updateError);
      throw new Error(updateError.message);
    }

    // 3. Ensure role in user_roles table
    try {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: user.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
    } catch (roleErr) {
      console.warn("Could not upsert user_role:", roleErr);
    }

    return { ok: true, message: `Email ${email} confirmed successfully!` };
  });
