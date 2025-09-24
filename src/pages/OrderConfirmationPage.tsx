import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderService, Order, OrderItem } from '@/lib/order-service';
import { useAuthStore } from '@/store/auth-store';

export default function OrderConfirmationPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
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
    }, [orderId, user?.uid, navigate]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Inasubiri Uthibitisho',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    description: 'Agizo lako limepokewa na linangojea uthibitisho'
                };
            case 'confirmed':
                return {
                    label: 'Limethibitishwa',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    description: 'Agizo lako limethibitishwa na linatengenezwa'
                };
            case 'preparing':
                return {
                    label: 'Linaandaliwa',
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                    description: 'Bidhaa zako zinaandaliwa kwa ajili ya utolewaji'
                };
            case 'out_for_delivery':
                return {
                    label: 'Njiani',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    description: 'Bidhaa zako ziko njiani za kufika kwako'
                };
            case 'delivered':
                return {
                    label: 'Zimefikishwa',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    description: 'Bidhaa zako zimefikishwa kikamilifu'
                };
            case 'cancelled':
                return {
                    label: 'Limeghairiwa',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    description: 'Agizo hili limeghairiwa'
                };
            default:
                return {
                    label: status,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    description: 'Hali ya agizo'
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Inapakia taarifa za agizo...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Agizo halikupatikana</p>
                    <Button onClick={() => navigate('/')}>Rudi Mwanzoni</Button>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Hongera!</h1>
                    <p className="text-gray-600">Agizo lako limekamilika na limetumwa</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Nambari ya agizo: <span className="font-mono font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                    </p>
                </div>

                {/* Order Status */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-emerald-600" />
                            Hali ya Agizo
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
                            Taarifa za Utolewaji
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-1 shrink-0" />
                            <div>
                                <div className="font-medium">Anwani</div>
                                <div className="text-sm text-gray-600">{order.delivery_address}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                            <div>
                                <div className="font-medium">Simu</div>
                                <div className="text-sm text-gray-600">{order.delivery_phone}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                            <div>
                                <div className="font-medium">Tarehe na Muda</div>
                                <div className="text-sm text-gray-600">
                                    {new Date(order.delivery_date).toLocaleDateString('sw-TZ', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} - {order.delivery_time}
                                </div>
                            </div>
                        </div>

                        {order.delivery_notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium mb-1">Maelezo ya Ziada</div>
                                <div className="text-sm text-gray-600">{order.delivery_notes}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Bidhaa Zilizoagizwa</CardTitle>
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
                                <span>Jumla ya Bidhaa</span>
                                <span>TZS {(order.total_amount - 5000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ada ya Utolewaji</span>
                                <span>TZS 5,000</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Jumla</span>
                                <span className="text-emerald-600">TZS {order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Taarifa za Malipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="font-medium text-blue-800 mb-1">
                                {order.payment_method === 'cash_on_delivery' ? 'Malipo Wakati wa Utolewaji' : 'Pesa za Simu'}
                            </div>
                            <div className="text-sm text-blue-700">
                                {order.payment_method === 'cash_on_delivery'
                                    ? 'Lipa kwa pesa taslimu wakati bidhaa zikifika'
                                    : 'Utapokea ujumbe wa malipo kwa simu yako'
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
                        Endelea Kununua
                    </Button>
                    <Button
                        onClick={() => navigate(`/delivery/${orderId}`)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        Fuatilia Uongozi
                    </Button>
                    <Button
                        onClick={() => navigate('/profile')}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                    >
                        Angalia Historia ya Agizo
                    </Button>
                </div>

                {/* Contact Information */}
                <div className="text-center mt-8 p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-2">Unahitaji Msaada?</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        Wasiliana nasi kwa maswali yoyote kuhusu agizo lako
                    </p>
                    <p className="text-sm font-medium text-emerald-600">
                        Simu: +255 XXX XXX XXX | Barua pepe: msaada@fresh.co.tz
                    </p>
                </div>
            </div>
        </div>
    );
}