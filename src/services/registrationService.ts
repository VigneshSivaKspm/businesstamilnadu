import { USE_API, apiRequest } from '@/lib/api';
import { storage } from '@/lib/storage';
import type { Registration, RegistrationInput } from '@/types';

const SUBMISSIONS_KEY = 'btn:registrations';
const DRAFT_KEY = 'btn:registration-draft';

const makeReference = () =>
  `BTN-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/**
 * Business registration submissions. With the API enabled they are sent to
 * the server and appear in the admin panel; otherwise (demo mode) they are
 * kept on this device and the UI says so.
 */
export const registrationService = {
  isRemoteEnabled: USE_API,

  /** `hp` is the hidden honeypot field from the form. */
  async submit(input: RegistrationInput, hp = ''): Promise<Registration> {
    if (USE_API) {
      const registration = await apiRequest<Registration>('/registrations', { method: 'POST', body: { ...input, hp } });
      storage.remove(DRAFT_KEY);
      return registration;
    }
    const { confirmAccuracy: _confirmed, ...data } = input;
    void _confirmed;
    const registration: Registration = {
      ...data,
      id: crypto.randomUUID(),
      reference: makeReference(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      storage: 'local',
    };
    const existing = storage.get<Registration[]>(SUBMISSIONS_KEY, []);
    storage.set(SUBMISSIONS_KEY, [registration, ...existing]);
    storage.remove(DRAFT_KEY);
    return registration;
  },

  saveDraft(input: Partial<RegistrationInput>) {
    storage.set(DRAFT_KEY, input);
  },

  loadDraft(): Partial<RegistrationInput> | null {
    return storage.get<Partial<RegistrationInput> | null>(DRAFT_KEY, null);
  },

  clearDraft() {
    storage.remove(DRAFT_KEY);
  },
};
