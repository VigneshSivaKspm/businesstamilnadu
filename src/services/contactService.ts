import { storage } from '@/lib/storage';
import type { ContactMessage, ContactMessageInput } from '@/types';

const KEY = 'btn:contact-messages';

/**
 * Contact form messages. Until a backend or form endpoint is configured,
 * messages are kept on this device and the UI offers an email fallback.
 */
export const contactService = {
  isRemoteEnabled: false,

  async send(input: ContactMessageInput): Promise<ContactMessage> {
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
