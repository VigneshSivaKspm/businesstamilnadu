import { useState, type FormEvent } from 'react';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { TextField } from '@/components/forms/Field';
import { ApiError } from '@/lib/api';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, DetailList, Panel } from '../components/AdminUi';
import { formatDateTime } from '../hooks';

export default function SettingsPage() {
  const { admin } = useAdmin();
  const notify = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!current) found.currentPassword = 'Enter your current password.';
    if (next.length < 10) found.newPassword = 'Use at least 10 characters.';
    if (next !== confirm) found.confirm = 'Passwords don’t match.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await adminApi.auth.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      notify('Password changed. Other devices have been signed out.');
    } catch (err) {
      if (err instanceof ApiError) setErrors(Object.keys(err.fields).length ? err.fields : { currentPassword: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Settings" description="Your account and admin access." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your account">
          <DetailList
            items={[
              ['Name', admin?.name],
              ['Email', admin?.email],
              ['Role', 'Administrator'],
              ['Last sign-in', formatDateTime(admin?.lastLoginAt)],
            ]}
          />
        </Panel>

        <Panel title="Change password">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <input type="text" name="username" autoComplete="username" value={admin?.email ?? ''} readOnly hidden />
            <TextField label="Current password" type="password" autoComplete="current-password" optionalLabel={false} value={current} error={errors.currentPassword} onChange={(e) => setCurrent(e.target.value)} />
            <TextField label="New password" type="password" autoComplete="new-password" optionalLabel={false} hint="At least 10 characters. A short phrase works well." value={next} error={errors.newPassword} onChange={(e) => setNext(e.target.value)} />
            <TextField label="Confirm new password" type="password" autoComplete="new-password" optionalLabel={false} value={confirm} error={errors.confirm} onChange={(e) => setConfirm(e.target.value)} />
            <Button type="submit" variant="primary" loading={busy}>
              Update password
            </Button>
          </form>
        </Panel>

        <Panel title="Adding admins" className="lg:col-span-2">
          <p className="flex items-start gap-3 text-sm text-navy-600">
            <Terminal className="mt-0.5 size-4 shrink-0 text-navy-400" aria-hidden />
            <span>
              For security, admin accounts are created from the server, not the browser. On the server, run{' '}
              <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-[0.8125rem] text-navy-900">npm run admin:create -- --email name@example.com --name "Full Name"</code>{' '}
              and enter a password when prompted. Running it for an existing email resets that admin’s password and signs them out.
            </span>
          </p>
        </Panel>
      </div>
    </>
  );
}
