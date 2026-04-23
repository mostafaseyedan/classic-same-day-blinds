import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const CartPage = lazy(() => import('../pages/cart/page'));
const AccountPage = lazy(() => import('../pages/account/page'));
const ProductPage = lazy(() => import('../pages/product/page'));
const AuthPage = lazy(() => import('../pages/auth/page'));
const MembershipPage = lazy(() => import('../pages/membership/page'));
const ConferencesPage = lazy(() => import('../pages/conferences/page'));
const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const AdminLayout = lazy(() => import('../pages/admin/layout/AdminLayout'));
const AdminOrdersPage = lazy(() => import('../pages/admin/orders/page'));
const AdminProductsPage = lazy(() => import('../pages/admin/products/page'));
const AdminUsersPage = lazy(() => import('../pages/admin/users/page'));
const AdminVisitorsPage = lazy(() => import('../pages/admin/visitors/page'));
const AdminReviewsPage = lazy(() => import('../pages/admin/reviews/page'));
const AdminRestockHistoryPage = lazy(() => import('../pages/admin/restock-history/page'));
const AdminRestockRequestsPage = lazy(() => import('../pages/admin/restock-requests/page'));
const AdminDashboardPage = lazy(() => import('../pages/admin/dashboard/page'));
const OrderHistoryPage = lazy(() => import('../pages/orders/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const FreeSamplePage = lazy(() => import('../pages/free-sample/page'));
const SameDayDeliveryPage = lazy(() => import('../pages/same-day-delivery/page'));
const TrackOrderPage = lazy(() => import('../pages/track-order/page'));
const ProductsPage = lazy(() => import('../pages/products/page'));
const OrderConfirmationPage = lazy(() => import('../pages/order-confirmation/page'));
const AdminAdminsPage = lazy(() => import('../pages/admin/admins/page'));
const AdminInvitePage = lazy(() => import('../pages/admin/invite/page'));
const AdminEmailAlertsPage = lazy(() => import('../pages/admin/email-alerts/page'));
const AdminProfilePage = lazy(() => import('../pages/admin/profile/page'));
const AdminCompetitorPricingPage = lazy(() => import('../pages/admin/competitor-pricing/page'));
const AdminCustomersPage = lazy(() => import('../pages/admin/customers/page'));
const AdminCompaniesPage = lazy(() => import('../pages/admin/companies/page'));
const AdminSuppliersPage = lazy(() => import('../pages/admin/suppliers/page'));
const AdminPurchaseOrdersPage = lazy(() => import('../pages/admin/purchase-orders/page'));
const AdminSystemSettingsPage = lazy(() => import('../pages/admin/settings/page'));
const OrderDetailPage = lazy(() => import('../pages/admin/orders/detail-page'));
const CustomerDetailPage = lazy(() => import('../pages/admin/customers/detail-page'));
const CompanyDetailPage = lazy(() => import('../pages/admin/companies/detail-page'));
const ProductDetailPage = lazy(() => import('../pages/admin/products/detail-page'));
const HowToMeasurePage = lazy(() => import('../pages/how-to-measure/page'));
const WishlistPage = lazy(() => import('../pages/wishlist/page'));
const RoomVisualizerPage = lazy(() => import('../pages/room-visualizer/page'));
const PrivacyPolicyPage = lazy(() => import('../pages/privacy-policy/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/account',
    element: <AccountPage />,
  },
  {
    path: '/product/:id',
    element: <ProductPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/membership',
    element: <MembershipPage />,
  },
  {
    path: '/conferences',
    element: <ConferencesPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/invite',
    element: <AdminInvitePage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetailPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'restock-requests',
        element: <AdminRestockRequestsPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'visitors',
        element: <AdminVisitorsPage />,
      },
      {
        path: 'reviews',
        element: <AdminReviewsPage />,
      },
      {
        path: 'restock-history',
        element: <AdminRestockHistoryPage />,
      },
      {
        path: 'email-alerts',
        element: <AdminEmailAlertsPage />,
      },
      {
        path: 'admins',
        element: <AdminAdminsPage />,
      },
      {
        path: 'profile',
        element: <AdminProfilePage />,
      },
      {
        path: 'competitor-pricing',
        element: <AdminCompetitorPricingPage />,
      },
      {
        path: 'customers',
        element: <AdminCustomersPage />,
      },
      {
        path: 'customers/:id',
        element: <CustomerDetailPage />,
      },
      {
        path: 'companies',
        element: <AdminCompaniesPage />,
      },
      {
        path: 'companies/:id',
        element: <CompanyDetailPage />,
      },
      {
        path: 'suppliers',
        element: <AdminSuppliersPage />,
      },
      {
        path: 'purchase-orders',
        element: <AdminPurchaseOrdersPage />,
      },
      {
        path: 'settings',
        element: <AdminSystemSettingsPage />,
      },
    ],
  },
  {
    path: '/orders',
    element: <OrderHistoryPage />,
  },
  {
    path: '/free-sample',
    element: <FreeSamplePage />,
  },
  {
    path: '/same-day-delivery',
    element: <SameDayDeliveryPage />,
  },
  {
    path: '/track-order',
    element: <TrackOrderPage />,
  },
  {
    path: '/products',
    element: <ProductsPage />,
  },
  {
    path: '/order-confirmation',
    element: <OrderConfirmationPage />,
  },
  {
    path: '/how-to-measure',
    element: <HowToMeasurePage />,
  },
  {
    path: '/wishlist',
    element: <WishlistPage />,
  },
  {
    path: '/room-visualizer',
    element: <RoomVisualizerPage />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;