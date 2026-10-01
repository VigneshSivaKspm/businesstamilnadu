import { lazy } from 'react';
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

/**
 * Route map. Future routes (/login, /dashboard, /business-dashboard, /admin,
 * /pricing, /claim-business, /favorites, /reviews) slot in as additional
 * children here, wrapped in an auth guard element where required.
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
]);
