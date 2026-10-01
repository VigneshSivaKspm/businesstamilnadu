import { apiRequest } from '@/lib/api';
import type {
  ActivityEntry,
  AdminStats,
  AdminUser,
  Business,
  ContactMessage,
  MessageStatus,
  Paginated,
  Registration,
  RegistrationStatus,
} from '@/types';

type Query = Record<string, string | number | boolean | undefined | null>;

/** Payload accepted by POST/PUT /admin/businesses. */
export type BusinessPayload = Omit<
  Business,
  'id' | 'categoryName' | 'rating' | 'reviewCount' | 'views' | 'createdAt' | 'updatedAt' | 'registrationId' | 'ownerId'
>;

export const adminApi = {
  auth: {
    me: () => apiRequest<{ admin: AdminUser }>('/admin/auth/me'),
    login: (email: string, password: string) =>
      apiRequest<{ admin: AdminUser }>('/admin/auth/login', { method: 'POST', body: { email, password } }),
    logout: () => apiRequest<{ ok: true }>('/admin/auth/logout', { method: 'POST' }),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiRequest<{ ok: true }>('/admin/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),
  },

  stats: () => apiRequest<AdminStats>('/admin/stats'),
  activity: () => apiRequest<{ items: ActivityEntry[] }>('/admin/activity'),

  registrations: {
    list: (query: Query & { status?: RegistrationStatus | 'all' }) =>
      apiRequest<Paginated<Registration>>('/admin/registrations', { query }),
    get: (id: string) => apiRequest<Registration>(`/admin/registrations/${id}`),
    approve: (id: string, options: { verified: boolean; featured: boolean }) =>
      apiRequest<{ businessId: string; slug: string }>(`/admin/registrations/${id}/approve`, { method: 'POST', body: options }),
    reject: (id: string, reason: string) =>
      apiRequest<{ ok: true }>(`/admin/registrations/${id}/reject`, { method: 'POST', body: { reason } }),
    reopen: (id: string) => apiRequest<{ ok: true }>(`/admin/registrations/${id}/reopen`, { method: 'POST' }),
    saveNotes: (id: string, notes: string) =>
      apiRequest<{ ok: true }>(`/admin/registrations/${id}`, { method: 'PATCH', body: { notes } }),
    remove: (id: string) => apiRequest<{ ok: true }>(`/admin/registrations/${id}`, { method: 'DELETE' }),
  },

  messages: {
    list: (query: Query & { status?: MessageStatus | 'inbox' | 'all' }) =>
      apiRequest<Paginated<ContactMessage>>('/admin/messages', { query }),
    get: (id: string) => apiRequest<ContactMessage>(`/admin/messages/${id}`),
    setStatus: (id: string, status: MessageStatus) =>
      apiRequest<{ ok: true }>(`/admin/messages/${id}`, { method: 'PATCH', body: { status } }),
    remove: (id: string) => apiRequest<{ ok: true }>(`/admin/messages/${id}`, { method: 'DELETE' }),
  },

  businesses: {
    list: (query: Query) => apiRequest<Paginated<Business>>('/admin/businesses', { query }),
    get: (id: string) => apiRequest<Business>(`/admin/businesses/${id}`),
    create: (payload: BusinessPayload) => apiRequest<Business>('/admin/businesses', { method: 'POST', body: payload }),
    update: (id: string, payload: BusinessPayload) =>
      apiRequest<Business>(`/admin/businesses/${id}`, { method: 'PUT', body: payload }),
    patch: (id: string, changes: Partial<Pick<Business, 'verified' | 'featured' | 'status'>>) =>
      apiRequest<Business>(`/admin/businesses/${id}`, { method: 'PATCH', body: changes }),
    remove: (id: string) => apiRequest<{ ok: true }>(`/admin/businesses/${id}`, { method: 'DELETE' }),
  },
};
