import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Package,
    MapPin,
    Clock,
    User,
    Phone,
    AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useDeliveryAuthStore } from '@/store/delivery-auth-store';
import { useToast } from '@/hooks/use-toast';
import { getOrderDelivery, getOrdersByStatus } from '@/lib/delivery-service';
import { OrderService } from '@/lib/order-service';
import DeliveryPersonInterface from '@/components/delivery/DeliveryPersonInterface';
import LiveDeliveryTracker from '@/components/delivery/LiveDeliveryTracker';
import { useLanguage } from '@/contexts/LanguageContext';

interface Order {
    _id: string;
    _uid: string;
    status: string;
    total_amount: number;
    payment_method: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes: string;
    delivery_date: string;
    delivery_time: string;
    created_at: number;
}

interface DeliveryInfo {
    _id: string;
    _uid: string;
    order_id: string;
    delivery_person_name: string;
    delivery_person_phone: string;
    status: string;
    assigned_at: string;
    picked_up_at?: string;
    delivered_at?: string;
    delivery_notes?: string;
}

const DeliveryPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { deliveryPerson, isDeliveryAuthenticated } = useDeliveryAuthStore();
    const { toast } = useToast();
    const { t } = useLanguage();

    const [order, setOrder] = useState<Order | null>(null);
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeliveryPerson, setIsDeliveryPerson] = useState(false);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        loadOrderAndDeliveryInfo();
    }, [orderId, navigate]);

    const loadOrderAndDeliveryInfo = async () => {
        if (!orderId || !user?.uid) return;

        setLoading(true);
        try {
            // Verify order ownership before proceeding
            const isOwner = await OrderService.verifyOrderOwnership(orderId, user.uid);
            if (!isOwner) {
                toast({
                    title: t('error'),
                    description: t('orderNotFoundOrNoPermission'),
                    variant: "destructive"
                });
                navigate('/');
                return;
            }

            // Get user's orders to find the specific order
            const userOrders = await OrderService.getUserOrders(user.uid);
            const foundOrder = userOrders.find(o => o._id === orderId);

            if (!foundOrder) {
                toast({
                    title: t('error'),
                    description: t('orderNotFoundOrNoPermission'),
                    variant: "destructive"
                });
                navigate('/');
                return;
            }

            setOrder(foundOrder);

            // Get delivery information
            const delivery = await getOrderDelivery(orderId);
            if (delivery) {
                setDeliveryInfo(delivery);

                // Check if current user is a authenticated delivery person for this order
                if (isDeliveryAuthenticated && deliveryPerson) {
                    const isAssignedDeliveryPerson = deliveryPerson.currentOrderId === orderId ||
                        deliveryPerson.phone === delivery.delivery_person_phone;
                    setIsDeliveryPerson(isAssignedDeliveryPerson);
                } else {
                    setIsDeliveryPerson(false);
                }
            }

        } catch (error) {
            console.error('Error loading order/delivery info:', error);
            toast({
                title: t('error'),
                description: t('failedToLoadOrderInfo'),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <span className="ml-2">{t('loading')}...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">{t('orderNotFound')}</h2>
                            <p className="text-muted-foreground mb-4">
                                {t('orderNotFoundOrNoPermission')}
                            </p>
                            <Button onClick={() => navigate('/')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('back')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('back')}
                    </Button>
                    <Badge variant="outline">
                        {t('order')} #{orderId?.slice(-8)}
                    </Badge>
                </div>

                {/* Order Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="h-5 w-5" />
                            <span>{t('orderDetails')}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('customer')}:</span>
                                    <span>{user?.email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('phone')}:</span>
                                    <span>{order.delivery_phone}</span>
                                </div>
                                <div className="flex items-start space-x-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span className="font-medium">{t('orderConfirmationAddress')}:</span>
                                    <span className="flex-1">{order.delivery_address}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('deliveryTime')}:</span>
                                    <span>
                                        {new Date(order.created_at).toLocaleString('sw-TZ')}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="font-medium">{t('total')}:</span>
                                    <span className="font-bold text-green-600">
                                        TZS {order.total_amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="font-medium">{t('status')}:</span>
                                    <Badge className="capitalize">
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {order.delivery_notes && (
                            <>
                                <Separator />
                                <div className="text-sm">
                                    <span className="font-medium">{t('deliveryNotes')}:</span>
                                    <p className="text-muted-foreground mt-1">{order.delivery_notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Delivery Interface - Show appropriate interface based on user type */}
                {deliveryInfo ? (
                    <>
                        {isDeliveryPerson ? (
                            /* Delivery Person Interface */
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-center text-green-600">
                                            {t('deliveryPersonSystem')}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <DeliveryPersonInterface
                                    orderId={orderId!}
                                    deliveryPersonName={deliveryInfo.delivery_person_name}
                                    deliveryPersonPhone={deliveryInfo.delivery_person_phone}
                                />
                            </div>
                        ) : (
                            /* Customer Tracking Interface */
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-center">
                                            {t('liveTracking')}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <LiveDeliveryTracker
                                    orderId={orderId!}
                                    refreshInterval={order.status === 'out_for_delivery' ? 30000 : 0}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    /* No Delivery Assigned Yet */
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">{t('notAssignedToDelivery')}</h3>
                            <p className="text-muted-foreground">
                                {t('orderNotAssignedYet')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Help Section */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>{t('needHelpContact')} 
                                <span className="font-medium text-foreground"> +255 123 456 789</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DeliveryPage;