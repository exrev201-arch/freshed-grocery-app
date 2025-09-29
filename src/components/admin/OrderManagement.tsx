import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Package,
    Truck,
    CheckCircle,
    User,
    Phone,
    MapPin,
    RefreshCw,
    Eye
} from 'lucide-react';
import {
    getOrdersByStatus,
    updateOrderStatus,
    assignDeliveryPerson,
    type OrderStatus
} from '@/lib/delivery-service';
import { table } from '@/lib/backend-service';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

// Use table API for database operations

interface Order {
    _id: string;
    _uid: string;
    status: string;
    total_amount: number;
    payment_method: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes?: string;
    created_at: number;
    updated_at: number;
    delivery_date: string;
    delivery_time: string;
}

interface AdminOrderItem {
    _id: string;
    order_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
}

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Record<string, Order[]>>({});
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<AdminOrderItem[]>([]);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deliveryPerson] = useState({
        name: 'Juma Delivery',
        phone: '+255 123 456 789'
    });
    const { toast } = useToast();
    const { t } = useLanguage();

    const statuses: OrderStatus[] = [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered'
    ];

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const ordersByStatus: Record<string, Order[]> = {};

        try {
            for (const status of statuses) {
                const statusOrders = await getOrdersByStatus(status);
                ordersByStatus[status] = statusOrders as Order[];
            }
            setOrders(ordersByStatus);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast({
                title: t('error'),
                description: t('failedToLoadOrders'),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadOrderItems = async (orderId: string) => {
        try {
            // Get all order items and filter by order_id
            const result = await table.getItems('order_items', {
                limit: 100
            });
            const allItems = result.items as unknown as AdminOrderItem[] || [];
            const orderItems = allItems.filter(item => item.order_id === orderId);
            setOrderItems(orderItems);
        } catch (error) {
            console.error('Error loading order items:', error);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
        try {
            const success = await updateOrderStatus(orderId, newStatus, 'admin', notes);
            if (success) {
                toast({
                    title: t('success'),
                    description: `${t('orderStatusUpdatedTo')} ${newStatus.replace('_', ' ')}`,
                });
                loadOrders(); // Refresh orders
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            toast({
                title: t('error'),
                description: t('failedToUpdateOrderStatus'),
                variant: "destructive"
            });
        }
    };

    const handleAssignDelivery = async (orderId: string) => {
        try {
            const success = await assignDeliveryPerson(
                orderId,
                deliveryPerson.phone,
                deliveryPerson.name,
                'admin'
            );
            if (success) {
                toast({
                    title: t('success'),
                    description: t('deliveryPersonAssigned'),
                });
                loadOrders();
            } else {
                throw new Error('Failed to assign delivery person');
            }
        } catch (error) {
            console.error('Delivery assignment error:', error);
            toast({
                title: t('error'),
                description: t('failedToAssignDeliveryPerson'),
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'ready_for_pickup': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'out_for_delivery': return 'bg-green-100 text-green-800 border-green-200';
            case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('orderManagement')}</h2>
                <Button onClick={loadOrders} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('refresh')}
                </Button>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList className="grid grid-cols-6 w-full">
                    {statuses.map((status) => (
                        <TabsTrigger key={status} value={status} className="text-xs">
                            {formatStatus(status)}
                            {orders[status] && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {orders[status].length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">{t('loadingOrders')}</span>
                    </div>
                ) : (
                    statuses.map((status) => (
                        <TabsContent key={status} value={status} className="space-y-4">
                            {orders[status]?.length === 0 ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>{t('noStatusOrders').replace('{status}', formatStatus(status).toLowerCase())}</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {orders[status]?.map((order) => (
                                        <Card key={order._id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">
                                                        {t('orderNumberLabel')} #{order._id.slice(-8)}
                                                    </CardTitle>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {formatStatus(order.status)}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-muted-foreground">{t('amount')}:</span>
                                                        <p className="font-semibold">TZS {order.total_amount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-muted-foreground">{t('payment')}:</span>
                                                        <p>{order.payment_method === 'cash_on_delivery' ? t('cashOnDelivery') : t('mobileMoney')}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-muted-foreground">{t('date')}:</span>
                                                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-muted-foreground">{t('time')}:</span>
                                                        <p>{new Date(order.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-start space-x-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                        <span className="text-sm">{order.delivery_address}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{order.delivery_phone}</span>
                                                    </div>
                                                    {order.delivery_notes && (
                                                        <div className="flex items-start space-x-2">
                                                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <span className="text-sm">{order.delivery_notes}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <Dialog
                                                        open={detailsOpen && selectedOrder?._id === order._id}
                                                        onOpenChange={(open) => {
                                                            setDetailsOpen(open);
                                                            if (open) {
                                                                setSelectedOrder(order);
                                                                loadOrderItems(order._id);
                                                            }
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                {t('viewDetails')}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>{t('orderDetails')} - #{order._id.slice(-8)}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label>{t('customerPhone')}</Label>
                                                                        <p className="text-sm">{order.delivery_phone}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label>{t('deliveryDate')}</Label>
                                                                        <p className="text-sm">{order.delivery_date} {t('at')} {order.delivery_time}</p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <Label>{t('deliveryAddress')}</Label>
                                                                    <p className="text-sm">{order.delivery_address}</p>
                                                                </div>

                                                                <div>
                                                                    <Label>{t('orderItems')}</Label>
                                                                    <div className="border rounded-lg divide-y">
                                                                        {orderItems.map((item) => (
                                                                            <div key={item._id} className="p-3 flex justify-between">
                                                                                <div>
                                                                                    <p className="font-medium">{item.product_name}</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        {t('qty')}: {item.quantity} × TZS {item.product_price.toLocaleString()}
                                                                                    </p>
                                                                                </div>
                                                                                <p className="font-semibold">TZS {item.subtotal.toLocaleString()}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <div className="flex space-x-2">
                                                        {status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                                                            >
                                                                {t('confirmOrder')}
                                                            </Button>
                                                        )}
                                                        {status === 'confirmed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                                            >
                                                                {t('startPreparing')}
                                                            </Button>
                                                        )}
                                                        {status === 'preparing' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order._id, 'ready_for_pickup')}
                                                            >
                                                                {t('readyForPickup')}
                                                            </Button>
                                                        )}
                                                        {status === 'ready_for_pickup' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAssignDelivery(order._id)}
                                                            >
                                                                <Truck className="h-4 w-4 mr-1" />
                                                                {t('assignDelivery')}
                                                            </Button>
                                                        )}
                                                        {(status === 'out_for_delivery') && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                {t('markDelivered')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))
                )}
            </Tabs>
        </div>
    );
};

export default OrderManagement;