import { USE_API, apiRequest } from '@/lib/api';
import { storage } from '@/lib/storage';
import type { ContactMessage, ContactMessageInput } from '@/types';

const KEY = 'btn:contact-messages';

/**
 * Contact form messages. With the API enabled they are delivered to the admin
 * inbox; in demo mode they are kept on this device and the UI offers an email
 * fallback.
 */
export const contactService = {
  isRemoteEnabled: USE_API,

  async send(input: ContactMessageInput & { businessSlug?: string }, hp = ''): Promise<ContactMessage> {
    if (USE_API) return apiRequest<ContactMessage>('/contact', { method: 'POST', body: { ...input, hp } });
    const message: ContactMessage = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      storage: 'local',
    };
    storage.set(KEY, [message, ...storage.get<ContactMessage[]>(KEY, [])]);
    return message;
  },
};
