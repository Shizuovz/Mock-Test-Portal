import type { UserRole } from "@/types/domain";

export const userRoles = ["student", "editor", "admin"] as const satisfies readonly UserRole[];

export function isAdmin(role: UserRole) {
  return role === "admin";
}

export function isEditorOrAdmin(role: UserRole) {
  return role === "editor" || role === "admin";
}
