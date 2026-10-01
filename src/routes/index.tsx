import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import HomePage from '@/pages/Home/HomePage';
import { RouteError } from '@/pages/NotFound/RouteError';

// Home is eagerly loaded for the fastest first paint; everything else is split.
const BusinessesPage = lazy(() => import('@/pages/Businesses/BusinessesPage'));
const BusinessProfilePage = lazy(() => import('@/pages/BusinessProfile/BusinessProfilePage'));
const CategoriesPage = lazy(() => import('@/pages/Categories/CategoriesPage'));
const CategoryDetailPage = lazy(() => import('@/pages/CategoryDetail/CategoryDetailPage'));
const DistrictsPage = lazy(() => import('@/pages/Districts/DistrictsPage'));
const DistrictDetailPage = lazy(() => import('@/pages/DistrictDetail/DistrictDetailPage'));
const DistrictCategoryPage = lazy(() => import('@/pages/DistrictCategory/DistrictCategoryPage'));
const SearchPage = lazy(() => import('@/pages/Search/SearchPage'));
const RegisterBusinessPage = lazy(() => import('@/pages/RegisterBusiness/RegisterBusinessPage'));
const AboutPage = lazy(() => import('@/pages/About/AboutPage'));
const ContactPage = lazy(() => import('@/pages/Contact/ContactPage'));
const LegalPage = lazy(() => import('@/pages/Legal/LegalPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

// Admin panel — loaded only when someone visits /admin.
const AdminShell = lazy(() => import('@/admin/AdminShell'));
const AdminGuard = lazy(() => import('@/admin/AdminShell').then((m) => ({ default: m.RequireAdmin })));
const AdminLogin = lazy(() => import('@/admin/pages/LoginPage'));
const AdminDashboard = lazy(() => import('@/admin/pages/DashboardPage'));
const AdminRegistrations = lazy(() => import('@/admin/pages/RegistrationsPage'));
const AdminRegistrationDetail = lazy(() => import('@/admin/pages/RegistrationDetailPage'));
const AdminMessages = lazy(() => import('@/admin/pages/MessagesPage'));
const AdminListings = lazy(() => import('@/admin/pages/ListingsPage'));
const AdminListingEditor = lazy(() => import('@/admin/pages/ListingEditorPage'));
const AdminSettings = lazy(() => import('@/admin/pages/SettingsPage'));

/**
 * Route map. The admin panel lives under /admin with its own layout; future
 * routes (/dashboard for owners, /pricing, /favorites, /reviews) slot in as
 * additional children here.
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'businesses', element: <BusinessesPage /> },
      { path: 'business/:businessSlug', element: <BusinessProfilePage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/:categorySlug', element: <CategoryDetailPage /> },
      { path: 'districts', element: <DistrictsPage /> },
      { path: 'district', element: <Navigate to="/districts" replace /> },
      { path: 'district/:districtSlug', element: <DistrictDetailPage /> },
      { path: 'district/:districtSlug/:categorySlug', element: <DistrictCategoryPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'register-business', element: <RegisterBusinessPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy-policy', element: <LegalPage doc="privacy" /> },
      { path: 'terms', element: <LegalPage doc="terms" /> },
      { path: 'disclaimer', element: <LegalPage doc="disclaimer" /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin',
    element: (
      <Suspense fallback={null}>
        <AdminShell />
      </Suspense>
    ),
    errorElement: <RouteError />,
    children: [
      { path: 'login', element: <AdminLogin /> },
      {
        element: <AdminGuard />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'registrations', element: <AdminRegistrations /> },
          { path: 'registrations/:id', element: <AdminRegistrationDetail /> },
          { path: 'messages', element: <AdminMessages /> },
          { path: 'messages/:id', element: <AdminMessages /> },
          { path: 'listings', element: <AdminListings /> },
          { path: 'listings/new', element: <AdminListingEditor /> },
          { path: 'listings/:id', element: <AdminListingEditor /> },
          { path: 'settings', element: <AdminSettings /> },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
]);
