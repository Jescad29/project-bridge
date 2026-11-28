import { create } from 'zustand';
import { authApi } from '@/api/auth.api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/api/client';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || error.response?.data?.message || fallback;

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem(AUTH_TOKEN_KEY) || null,
  loading: false,
  submitting: false,
  error: null,

  setSession: (accessToken, userData) => {
    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }

    set({
      token: accessToken || null,
      user: userData || null,
      error: null,
    });
  },

  login: async (credentials) => {
    set({ submitting: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { access_token: accessToken, user } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({
        token: accessToken,
        user,
        submitting: false,
        error: null,
      });
      return { ok: true, user };
    } catch (err) {
      const message = getErrorMessage(err, 'No se pudo iniciar sesión.');
      set({ error: message, submitting: false });
      return { ok: false, error: message };
    }
  },

  register: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const response = await authApi.register(payload);
      const { access_token: accessToken, user } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({
        token: accessToken,
        user,
        submitting: false,
        error: null,
      });
      return { ok: true, user };
    } catch (err) {
      const message = getErrorMessage(err, 'No se pudo completar el registro.');
      set({ error: message, submitting: false });
      return { ok: false, error: message };
    }
  },

  fetchMe: async () => {
    const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!currentToken) {
      set({ user: null, token: null, loading: false });
      return { ok: false };
    }

    set({ loading: true, error: null });
    try {
      const response = await authApi.me();
      const user = response.data.user;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({ user, token: currentToken, loading: false });
      return { ok: true, user };
    } catch (err) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      set({
        user: null,
        token: null,
        loading: false,
        error: getErrorMessage(err, 'Sesión no válida.'),
      });
      return { ok: false };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    set({
      user: null,
      token: null,
      error: null,
    });
  },
}));