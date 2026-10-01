import { storage } from '@/lib/storage';
import type { Registration, RegistrationInput } from '@/types';

const SUBMISSIONS_KEY = 'btn:registrations';
const DRAFT_KEY = 'btn:registration-draft';

const makeReference = () =>
  `BTN-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/**
 * Business registration submissions.
 *
 * No backend is connected yet, so submissions are stored on this device only
 * and the UI says so. Replace `submit` with a call to Firestore
 * (`registrations` collection) or an API endpoint when available.
 */
export const registrationService = {
  isRemoteEnabled: false,

  async submit(input: RegistrationInput): Promise<Registration> {
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
