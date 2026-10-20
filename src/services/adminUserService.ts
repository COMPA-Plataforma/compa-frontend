import api from "@/lib/axiosConfig";
import type { Role } from "@/lib/roles";

export type AdminUserType = "PERSONAL" | "ESTUDIANTE";

export interface AdminUser {
  id: number;
  type: AdminUserType;
  name: string;
  lastName: string;
  email: string | null;
  role: Role;
  status: string;
  active: boolean;
  createdAt: string | null;
}

export interface AdminUserFilters {
  type?: AdminUserType;
  role?: Role;
  active?: boolean;
  search?: string;
}

export interface CreateAdminUserPayload {
  name: string;
  lastName: string;
  email: string;
  role: Exclude<Role, "ESTUDIANTE">;
  password: string;
}

export interface UpdateAdminUserPayload {
  name: string;
  lastName: string;
  email: string | null;
  role?: Role;
}

export const adminUserService = {
  list: (filters: AdminUserFilters = {}) =>
    api
      .get<AdminUser[]>("/api/admin/users", {
        params: {
          ...(filters.type && { type: filters.type }),
          ...(filters.role && { role: filters.role }),
          ...(filters.active !== undefined && { active: filters.active }),
          ...(filters.search && { search: filters.search }),
        },
      })
      .then((r) => r.data),

  create: (payload: CreateAdminUserPayload) =>
    api.post<AdminUser>("/api/admin/users", payload).then((r) => r.data),

  update: (type: AdminUserType, id: number, payload: UpdateAdminUserPayload) =>
    api.put<AdminUser>(`/api/admin/users/${type}/${id}`, payload).then((r) => r.data),

  deactivate: (type: AdminUserType, id: number) =>
    api.patch<AdminUser>(`/api/admin/users/${type}/${id}/deactivate`).then((r) => r.data),

  reactivate: (type: AdminUserType, id: number) =>
    api.patch<AdminUser>(`/api/admin/users/${type}/${id}/reactivate`).then((r) => r.data),
};
