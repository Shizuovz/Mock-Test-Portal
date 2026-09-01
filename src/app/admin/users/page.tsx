import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import { getAdminUsers } from "@/lib/admin/admin-management";
import { updateUserRoleAction } from "@/lib/actions/user-role-actions";
import type { UserRole } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const access = await getAdminAccess();
  const users = access.canView ? await getAdminUsers() : [];
  const isAdmin = access.role === "admin";

  return (
    <AdminPageFrame
      access={access}
      title="User & Role Management"
      description="Manage registered student and staff accounts. Assign editor or administrator roles with strict audit tracking."
    >
      <div className="rounded-lg border border-[#d9dee7] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#d9dee7] px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#15171a]">Registered Users ({users.length})</h2>
          {!isAdmin && (
            <span className="text-xs text-[#b42318] bg-[#fef3f2] px-2.5 py-1 rounded">
              Read-only mode: Only administrators can modify roles.
            </span>
          )}
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#eaecf0] bg-[#f9fafb] font-semibold text-[#475467]">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Current Role</th>
                  <th className="px-6 py-3">Attempts Count</th>
                  <th className="px-6 py-3">Registered On</th>
                  <th className="px-6 py-3">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8f9fa]">
                    <td className="px-6 py-4 font-medium text-[#15171a]">
                      {u.fullName || "Unnamed User"}
                    </td>
                    <td className="px-6 py-4 text-[#475467]">
                      {u.email || "No email available"}
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "admin" && (
                        <span className="rounded-full bg-[#ecfdf3] px-2.5 py-0.5 font-semibold text-[#027a48]">
                          Administrator
                        </span>
                      )}
                      {u.role === "editor" && (
                        <span className="rounded-full bg-[#eff8ff] px-2.5 py-0.5 font-semibold text-[#175cd3]">
                          Content Editor
                        </span>
                      )}
                      {u.role === "student" && (
                        <span className="rounded-full bg-[#f2f4f7] px-2.5 py-0.5 font-semibold text-[#344054]">
                          Student
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#475467]">
                      {u.attemptsCount} {u.attemptsCount === 1 ? "attempt" : "attempts"}
                    </td>
                    <td className="px-6 py-4 text-[#667085]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <form
                          action={async (formData) => {
                            "use server";
                            const newRole = formData.get("role") as UserRole;
                            if (newRole) {
                              await updateUserRoleAction(u.id, newRole);
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <select
                            name="role"
                            defaultValue={u.role}
                            className="rounded border border-[#ccd8d4] bg-white px-2 py-1 text-xs focus:border-[#146b5f] focus:outline-none"
                          >
                            <option value="student">Student</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded bg-[#146b5f] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#0f544a]"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <span className="text-[#98a2b3]">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#475467]">
            No user profiles found.
          </div>
        )}
      </div>
    </AdminPageFrame>
  );
}
