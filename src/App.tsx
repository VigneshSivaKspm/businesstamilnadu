import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/components/common/Toast';
import { router } from '@/routes';

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </HelmetProvider>
  );
}
