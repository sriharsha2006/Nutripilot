import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
}

// In a real environment, this might use `fetchApi` directly to the FastAPI server 
// if FastAPI was handling the Next.js API proxying, but here we call our Next.js API routes
// which will handle the HttpOnly cookie setting.
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to login");
    }
    return res.json();
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to register");
    }
    return res.json();
  },

  logout: async (): Promise<void> => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) {
      throw new Error("Failed to logout");
    }
  },

  me: async (): Promise<AuthResponse['user']> => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      throw new Error("Not authenticated");
    }
    const data = await res.json();
    return data.user;
  }
};
