"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import type { UserRole } from "@/types/domain";

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const access = await getAdminAccess();
  if (!access.canView || access.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can modify user roles.");
  }

  if (!["student", "editor", "admin"].includes(newRole)) {
    throw new Error("Invalid role specified.");
  }

  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  // Audit log
  await db.from("audit_logs").insert({
    action: "update_user_role",
    entity_type: "profiles",
    entity_id: userId,
    metadata: {
      newRole,
      updatedBy: access.email,
    },
  });

  revalidatePath("/admin/users");
}
