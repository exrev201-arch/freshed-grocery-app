import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderService, Order, OrderItem } from '@/lib/order-service';
import { useAuthStore } from '@/store/auth-store';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OrderConfirmationPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { t } = useLanguage();

    const [order, setOrder] = useState<any | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId || !user?.uid) {
                navigate('/');
                return;
            }

            try {
                // Use secure order method with ownership verification
                const orderData = await OrderService.getOrderSecure(orderId, user.uid);
                const items = await OrderService.getOrderItems(orderId);

                setOrder(orderData);
                setOrderItems(items);
            } catch (error) {
                console.error('Error fetching order:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();

        // Set up interval to refresh order status
        const interval = setInterval(() => {
            if (orderId && user?.uid) {
                OrderService.getOrderSecure(orderId, user.uid)
                    .then(orderData => setOrder(orderData))
                    .catch(error => console.error('Error refreshing order:', error));
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [orderId, user?.uid, navigate]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    label: t('orderPending'),
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    description: t('orderPendingDescription')
                };
            case 'confirmed':
                return {
                    label: t('orderConfirmedStatus'),
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    description: t('orderConfirmedDescription')
                };
            case 'preparing':
                return {
                    label: t('orderPreparing'),
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                    description: t('orderPreparingDescription')
                };
            case 'out_for_delivery':
                return {
                    label: t('orderOutForDelivery'),
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    description: t('orderOutForDeliveryDescription')
                };
            case 'delivered':
                return {
                    label: t('orderDelivered'),
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    description: t('orderDeliveredDescription')
                };
            case 'cancelled':
                return {
                    label: t('orderCancelled'),
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    description: t('orderCancelledDescription')
                };
            default:
                return {
                    label: status,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    description: t('orderStatus')
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('loadingOrderInfo')}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{t('orderNotFound')}</p>
                    <Button onClick={() => navigate('/')}>{t('returnToHome')}</Button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('congratulations')}</h1>
                    <p className="text-gray-600">{t('orderCompleted')}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('orderNumber')}: <span className="font-mono font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                    </p>
                </div>

                {/* Order Status */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-emerald-600" />
                            {t('orderStatus')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
                            <div className={`font-semibold ${statusInfo.color} mb-1`}>
                                {statusInfo.label}
                            </div>
                            <div className="text-sm text-gray-600">
                                {statusInfo.description}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-emerald-600" />
                            {t('deliveryInformation')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-1 shrink-0" />
                            <div>
                                <div className="font-medium">{t('orderConfirmationAddress')}</div>
                                <div className="text-sm text-gray-600">{order.deliveryAddress?.street || order.delivery_address || 'N/A'}</div>
                                <div className="text-sm text-gray-600">{order.deliveryAddress?.ward || ''}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                            <div>
                                <div className="font-medium">{t('orderConfirmationPhone')}</div>
                                <div className="text-sm text-gray-600">{order.customerInfo?.phoneNumber || order.delivery_phone || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                            <div>
                                <div className="font-medium">{t('dateAndTime')}</div>
                                <div className="text-sm text-gray-600">
                                  {/* Fix date display to handle potential undefined values */}
                                  {order.deliveryDate && order.deliveryDate !== 'Invalid Date' 
                                    ? new Date(order.deliveryDate).toLocaleDateString('sw-TZ', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      }) 
                                    : (order.delivery_date && order.delivery_date !== 'Invalid Date'
                                      ? new Date(order.delivery_date).toLocaleDateString('sw-TZ', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })
                                      : t('dateNotSet'))}
                                  {(order.deliveryTimeSlot || order.delivery_time) && ` - ${order.deliveryTimeSlot || order.delivery_time}`}
                                </div>
                            </div>
                        </div>

                        {order.delivery_notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium mb-1">{t('additionalNotes')}</div>
                                <div className="text-sm text-gray-600">{order.delivery_notes}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t('orderedItems')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {orderItems.map((item) => (
                                <div key={item._id} className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="font-medium">{item.product_name}</div>
                                        <div className="text-sm text-gray-500">
                                            TZS {item.product_price.toLocaleString()} × {item.quantity}
                                        </div>
                                    </div>
                                    <div className="font-medium">
                                        TZS {item.subtotal.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{t('productTotal')}</span>
                            {/* Fix calculation: total_amount - delivery fee */}
                            <span>TZS {((order.totalAmount || order.total_amount || 0) >= 5000 ? (order.totalAmount || order.total_amount || 0) - 3000 : (order.totalAmount || order.total_amount || 0) - 3000).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('deliveryFee')}</span>
                            {/* Fix delivery fee display based on order total */}
                            <span>TZS {(order.totalAmount || order.total_amount || 0) >= 50000 ? '0' : '3,000'}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>{t('total')}</span>
                            <span className="text-emerald-600">TZS {(order.totalAmount || order.total_amount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{t('paymentInformation')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="font-medium text-blue-800 mb-1">
                                {order.payment_method === 'cash_on_delivery' ? t('cashOnDelivery') : t('mobileMoney')}
                            </div>
                            <div className="text-sm text-blue-700">
                                {order.payment_method === 'cash_on_delivery'
                                    ? t('payOnDelivery')
                                    : t('paymentMessage')
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto"
                    >
                        {t('continueShopping')}
                    </Button>
                    <Button
                        onClick={() => navigate(`/delivery/${orderId}`)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        {t('trackOrder')}
                    </Button>
                    <Button
                        onClick={() => navigate('/profile')}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                    >
                        {t('viewOrderHistory')}
                    </Button>
                </div>

                {/* Contact Information */}
                <div className="text-center mt-8 p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-2">{t('needHelp')}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {t('contactUsForQuestions')}
                    </p>
                    <p className="text-sm font-medium text-emerald-600">
                        {t('phone')}: +255 XXX XXX XXX | {t('contactEmail')}: msaada@fresh.co.tz
                    </p>
                </div>
            </div>
        </div>
    );
}