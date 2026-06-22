import api from "@/lib/axios";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  User,
} from "@/types";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/login/", credentials).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register/", payload).then((r) => r.data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }).then((r) => r.data),

  me: () => api.get<User>("/auth/me/").then((r) => r.data),

  refreshToken: (refresh: string) =>
    api
      .post<{ access: string }>("/auth/token/refresh/", { refresh })
      .then((r) => r.data),

  changePassword: (payload: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => api.post("/auth/change-password/", payload).then((r) => r.data),
};
