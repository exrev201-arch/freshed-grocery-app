import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminStore } from '@/store/admin-store';
import {
    Package,
    Phone,
    MapPin,
    Calendar,
    RefreshCw,
    Eye,
    Search,
    Filter,
    Download,
    ArrowUpDown,
    X
} from 'lucide-react';
import {
    updateOrderStatus,
    assignDeliveryPerson,
    getAllOrders,
    type OrderStatus,
} from '@/lib/delivery-service';
import { table } from '@/lib/backend-service';

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

interface OrderFilters {
    status: string;
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
    sortBy: 'created_at' | 'total_amount' | 'delivery_date';
    sortOrder: 'asc' | 'desc';
}

const EnhancedOrderManagement: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<AdminOrderItem[]>([]);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);
    
    const [filters, setFilters] = useState<OrderFilters>({
        status: 'all',
        dateFrom: '',
        dateTo: '',
        searchTerm: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
    });
    
    const [deliveryPerson] = useState({
        name: 'Juma Delivery',
        phone: '+255 123 456 789'
    });
    
    const { toast } = useToast();
    const { hasPermission, updateLastActivity } = useAdminStore();

    const statuses: OrderStatus[] = [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered'
    ];

    // Load orders with real-time refresh capability
    const loadOrders = useCallback(async (showRefreshToast = false) => {
        if (showRefreshToast) setRefreshing(true);
        else setLoading(true);
        
        try {
            const orders = await getAllOrders();
            setAllOrders(orders as Order[]);
            updateLastActivity();
            
            if (showRefreshToast) {
                toast({
                    title: "Orders Refreshed",
                    description: `Loaded ${orders.length} orders`,
                });
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast({
                title: "Error",
                description: "Failed to load orders. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [toast, updateLastActivity]);

    // Auto-refresh orders every 30 seconds with proper cleanup
    useEffect(() => {
        loadOrders();
        
        const interval = setInterval(() => {
            loadOrders();
        }, 30000);
        
        return () => {
            clearInterval(interval);
        };
    }, [loadOrders]);

    // Apply filters when orders or filters change
    useEffect(() => {
        let filtered = [...allOrders];

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(order => order.status === filters.status);
        }

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom).getTime();
            filtered = filtered.filter(order => order.created_at >= fromDate);
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo).getTime() + (24 * 60 * 60 * 1000); // End of day
            filtered = filtered.filter(order => order.created_at <= toDate);
        }

        // Search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(order => 
                order._id.toLowerCase().includes(searchLower) ||
                order.delivery_address.toLowerCase().includes(searchLower) ||
                order.delivery_phone.includes(filters.searchTerm) ||
                order.payment_method.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue: number, bValue: number;
            
            switch (filters.sortBy) {
                case 'total_amount':
                    aValue = a.total_amount || 0;
                    bValue = b.total_amount || 0;
                    break;
                case 'delivery_date':
                    aValue = new Date(a.delivery_date).getTime();
                    bValue = new Date(b.delivery_date).getTime();
                    break;
                default:
                    aValue = a.created_at;
                    bValue = b.created_at;
            }
            
            if (filters.sortOrder === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });

        setFilteredOrders(filtered);
    }, [allOrders, filters]);

    const loadOrderItems = async (orderId: string) => {
        try {
            const result = await table.getItems('order_items', {
                limit: 100
            });
            const allItems = result.items as unknown as AdminOrderItem[] || [];
            const filteredOrderItems = allItems.filter(item => item.order_id === orderId);
            setOrderItems(filteredOrderItems);
        } catch (error) {
            console.error('Error loading order items:', error);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
        if (!hasPermission('write')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to update orders.",
                variant: "destructive",
            });
            return;
        }

        setUpdateLoading(orderId);
        
        try {
            const success = await updateOrderStatus(orderId, newStatus, 'admin', notes);
            if (success) {
                toast({
                    title: "Success",
                    description: `Order status updated to ${formatStatus(newStatus)}`,
                });
                loadOrders();
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update order status. Please try again.';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setUpdateLoading(null);
        }
    };

    const handleAssignDelivery = useCallback(async (orderId: string) => {
        if (!hasPermission('write')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to assign delivery.",
                variant: "destructive",
            });
            return;
        }

        try {
            const success = await assignDeliveryPerson(
                orderId,
                deliveryPerson.phone,
                deliveryPerson.name,
                'admin'
            );
            if (success) {
                toast({
                    title: "Success",
                    description: "Delivery person assigned successfully",
                });
                loadOrders();
            } else {
                throw new Error('Failed to assign delivery person');
            }
        } catch (error: unknown) {
            console.error('Delivery assignment error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to assign delivery person. Please try again.';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    }, [hasPermission, deliveryPerson.phone, deliveryPerson.name, toast, loadOrders]);

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

    const exportOrders = () => {
        if (!hasPermission('read')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to export data.",
                variant: "destructive",
            });
            return;
        }

        const csvData = filteredOrders.map(order => ({
            'Order ID': order._id,
            'Status': formatStatus(order.status),
            'Total Amount': order.total_amount || 0,
            'Payment Method': order.payment_method,
            'Delivery Address': order.delivery_address,
            'Delivery Phone': order.delivery_phone,
            'Delivery Date': order.delivery_date,
            'Delivery Time': order.delivery_time,
            'Created At': new Date(order.created_at).toLocaleString(),
        }));

        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
            title: "Export Successful",
            description: `Exported ${filteredOrders.length} orders to CSV`,
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Order Management</h2>
                    <p className="text-gray-600 mt-1">
                        {filteredOrders.length} of {allOrders.length} orders
                        {refreshing && <span className="ml-2 text-primary">• Refreshing...</span>}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportOrders} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button 
                        onClick={() => loadOrders(true)} 
                        variant="outline" 
                        size="sm"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search">Search Orders</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    id="search"
                                    placeholder="Order ID, address, phone..."
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="status-filter">Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {statuses.map(status => (
                                        <SelectItem key={status} value={status}>
                                            {formatStatus(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="date-from">From Date</Label>
                            <Input
                                id="date-from"
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="date-to">To Date</Label>
                            <Input
                                id="date-to"
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="sort-by">Sort by:</Label>
                            <Select
                                value={filters.sortBy}
                                onValueChange={(value: 'created_at' | 'total_amount' | 'delivery_date') => setFilters(prev => ({ ...prev, sortBy: value }))}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Created Date</SelectItem>
                                    <SelectItem value="total_amount">Total Amount</SelectItem>
                                    <SelectItem value="delivery_date">Delivery Date</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters(prev => ({ 
                                ...prev, 
                                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                            }))}
                        >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters({
                                status: 'all',
                                dateFrom: '',
                                dateTo: '',
                                searchTerm: '',
                                sortBy: 'created_at',
                                sortOrder: 'desc'
                            })}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table/Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">
                                {filters.searchTerm || filters.status !== 'all' ? 
                                    'Try adjusting your filters to see more orders.' : 
                                    'No orders have been placed yet.'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">Order #{order._id.slice(-8)}</h3>
                                            <Badge className={getStatusColor(order.status)}>
                                                {formatStatus(order.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg">
                                            TZS {(order.total_amount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {order.payment_method?.replace('_', ' ') || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Delivery Address</p>
                                            <p className="text-sm text-gray-600">{order.delivery_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Contact</p>
                                            <p className="text-sm text-gray-600">{order.delivery_phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium">Delivery Schedule</p>
                                            <p className="text-sm text-gray-600">
                                                {order.delivery_date} at {order.delivery_time}
                                            </p>
                                        </div>
                                    </div>
                                    {order.delivery_notes && (
                                        <div className="flex items-start gap-2">
                                            <Package className="h-4 w-4 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium">Notes</p>
                                                <p className="text-sm text-gray-600">{order.delivery_notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            loadOrderItems(order._id);
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button>
                                    
                                    {hasPermission('write') && order.status !== 'delivered' && (
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) => handleStatusUpdate(order._id, value as OrderStatus)}
                                            disabled={updateLoading === order._id}
                                        >
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        {formatStatus(status)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    
                                    {updateLoading === order._id && (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                            Updating...
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            
            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex justify-between items-center">
                            <DialogTitle>Order Details - #{selectedOrder?._id?.slice(-8)}</DialogTitle>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Order ID</p>
                                        <p className="font-medium">#{selectedOrder._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <Badge className={getStatusColor(selectedOrder.status)}>
                                            {formatStatus(selectedOrder.status)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Order Date</p>
                                        <p className="font-medium">
                                            {new Date(selectedOrder.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="font-bold text-lg">
                                            TZS {(selectedOrder.total_amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Method</p>
                                        <p className="font-medium capitalize">
                                            {selectedOrder.payment_method?.replace('_', ' ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Delivery Date & Time</p>
                                        <p className="font-medium">
                                            {selectedOrder.delivery_date} at {selectedOrder.delivery_time}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Delivery Address</p>
                                        <p className="font-medium">{selectedOrder.delivery_address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Contact Phone</p>
                                        <p className="font-medium">{selectedOrder.delivery_phone}</p>
                                    </div>
                                    {selectedOrder.delivery_notes && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-600">Delivery Notes</p>
                                            <p className="font-medium">{selectedOrder.delivery_notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {orderItems.length > 0 ? (
                                        <div className="space-y-3">
                                            {orderItems.map((item) => (
                                                <div key={item._id} className="flex justify-between items-center py-2 border-b">
                                                    <div>
                                                        <p className="font-medium">{item.product_name}</p>
                                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            TZS {(item.product_price || 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Total: TZS {(item.subtotal || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-4 border-t">
                                                <p className="font-semibold">Order Total</p>
                                                <p className="font-bold text-lg">
                                                    TZS {(selectedOrder.total_amount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No items found for this order</p>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Order Actions */}
                            <div className="flex flex-wrap gap-2">
                                {hasPermission('write') && selectedOrder.status !== 'delivered' && (
                                    <Select
                                        value={selectedOrder.status}
                                        onValueChange={(value) => handleStatusUpdate(selectedOrder._id, value as OrderStatus)}
                                        disabled={updateLoading === selectedOrder._id}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {formatStatus(status)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                
                                {hasPermission('write') && selectedOrder.status === 'confirmed' && (
                                    <Button onClick={() => handleAssignDelivery(selectedOrder._id)}>
                                        Assign Delivery Person
                                    </Button>
                                )}
                                
                                {updateLoading === selectedOrder._id && (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                        Updating...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EnhancedOrderManagement;