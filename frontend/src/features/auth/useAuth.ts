import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { toast } from "@/components/ui/useToast";
import type { LoginCredentials, RegisterPayload } from "@/types";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      toast({ title: "Welcome back!", variant: "default" });
      if (data.user.role === "employer") navigate("/dashboard");
      else navigate("/jobs");
    },
    onError: () => {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      toast({ title: "Account created!", description: "Welcome to JobBoard." });
      if (data.user.role === "employer") navigate("/dashboard");
      else navigate("/jobs");
    },
    onError: () => {
      toast({ title: "Registration failed", description: "Please check your details.", variant: "destructive" });
    },
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken ?? ""),
    onSettled: () => {
      logout();
      qc.clear();
      navigate("/login");
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
