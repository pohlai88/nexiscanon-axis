"use client";

import { useState } from "react";
import {
  removeTeamMemberAction,
  updateMemberRoleAction,
} from "@/lib/actions/team";
import type { User, TenantUser, UserRole } from "@/lib/db/users";

interface MemberRowProps {
  member: User;
  membership: TenantUser;
  tenantSlug: string;
  canManage: boolean;
  isCurrentUser: boolean;
}

export function MemberRow({
  member,
  membership,
  tenantSlug,
  canManage,
  isCurrentUser,
}: MemberRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setIsRemoving(true);
    await removeTeamMemberAction(tenantSlug, member.id);
    setIsRemoving(false);
  };

  const handleRoleChange = async (newRole: UserRole) => {
    setIsUpdating(true);
    await updateMemberRoleAction(tenantSlug, member.id, newRole);
    setIsUpdating(false);
  };

  const roleColors: Record<UserRole, string> = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-gray-100 text-gray-800",
    viewer: "bg-gray-100 text-gray-600",
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {member.name?.[0]?.toUpperCase() ?? member.email[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-medium">
              {member.name ?? member.email.split("@")[0]}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (you)
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {member.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {canManage && !isCurrentUser && membership.role !== "owner" ? (
          <select
            value={membership.role}
            onChange={(e) =>
              handleRoleChange(e.target.value as UserRole)
            }
            disabled={isUpdating}
            className="px-2 py-1 text-xs rounded-lg border border-border bg-background"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        ) : (
          <span
            className={`px-2 py-1 text-xs rounded-full capitalize ${roleColors[membership.role]}`}
          >
            {membership.role}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {membership.createdAt.toLocaleDateString()}
      </td>
      {canManage && (
        <td className="px-6 py-4 text-right">
          {!isCurrentUser && membership.role !== "owner" && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
