import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import HomePage from "@/pages/HomePage"; // Keep HomePage as non-lazy since it's the main landing page
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminRouteGuard from "@/components/security/AdminRouteGuard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorBoundary from "@/components/ui/error-boundary";
import PWAStatusIndicator from '@/components/pwa/PWAStatusIndicator';
import PWAOnboarding from '@/components/pwa/PWAOnboarding';
import AppNavigation from '@/components/pwa/AppNavigation';
import PWAFeatureSummary from '@/components/pwa/PWAFeatureSummary';

// Lazy load heavy pages for better performance
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("@/pages/OrderConfirmationPage"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const DeliveryPage = lazy(() => import("@/pages/DeliveryPage"));
const DemoPaymentPage = lazy(() => import("@/pages/DemoPaymentPage"));
const OrderDebugComponent = lazy(() => import("@/components/debug/OrderDebugComponent"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function App() {
    // IMMEDIATE FIX: Force light mode
    useEffect(() => {
        document.documentElement.classList.remove('dark')
        console.log('Forced light mode in App component')
    }, [])

    return (
        <ErrorBoundary>
            <TooltipProvider>
                <PWAStatusIndicator />
                <PWAOnboarding />
                {/* <AppThemeManager /> - Temporarily disabled */}
                <PWAFeatureSummary />
                <BrowserRouter>
                    <Suspense fallback={<LoadingSpinner fullScreen text="Inapakia ukurasa..." />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/product/:productId" element={<ProductPage />} />
                            <Route path="/checkout" element={
                                <ProtectedRoute>
                                    <CheckoutPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/order-confirmation/:orderId" element={
                                <ProtectedRoute>
                                    <OrderConfirmationPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/delivery/:orderId" element={
                                <ProtectedRoute>
                                    <DeliveryPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/demo-payment" element={<DemoPaymentPage />} />
                            <Route path="/debug-orders" element={<OrderDebugComponent />} />
                            <Route path="/admin/login" element={
                                <AdminRouteGuard requireAdmin={false}>
                                    <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
                                        <AdminLoginPage />
                                    </Suspense>
                                </AdminRouteGuard>
                            } />
                            <Route path="/admin" element={
                                <AdminRouteGuard requireAdmin={true}>
                                    <AdminProtectedRoute requiredPermission="read">
                                        <AdminDashboard />
                                    </AdminProtectedRoute>
                                </AdminRouteGuard>
                            } />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                        <AppNavigation />
                    </Suspense>
                </BrowserRouter>
                <Toaster />
            </TooltipProvider>
        </ErrorBoundary>
    );
}

export default App;
