/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoginResponse {
  token: string;
}

import api from './api';

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Login/Senha errado(s)');
    }
    throw new Error(error.response?.data?.message || 'Erro ao autenticar');
  }
}

export function saveToken(token: string) {
  localStorage.setItem('jwt_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('jwt_token');
}

export function removeToken() {
  localStorage.removeItem('jwt_token');
}

export function isTokenValid(token: string): boolean {
  // Validação simples: checa expiração do JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
