import type { UserRole } from "@/types/domain";
import { isAdmin, isEditorOrAdmin } from "./roles";

export function canManageContent(role: UserRole) {
  return isEditorOrAdmin(role);
}

export function canManageUsers(role: UserRole) {
  return isAdmin(role);
}

export function assertRole(
  role: UserRole | null | undefined,
  allowedRoles: UserRole[],
) {
  if (!role || !allowedRoles.includes(role)) {
    throw new Error("Unauthorized");
  }
}
