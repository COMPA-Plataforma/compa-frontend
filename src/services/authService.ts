import api from "@/lib/axiosConfig";

export interface RegisterData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
}

const TOKEN_KEY = "compa_token";
const USER_KEY = "compa_user";

export const authService = {
  async register(data: RegisterData): Promise<void> {
    await api.post("/api/auth/register", data);
  },

  async verifyEmail(token: string): Promise<void> {
    await api.get("/api/auth/verify", { params: { token } });
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};