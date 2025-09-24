import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAdminStore } from '@/store/admin-store';
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    Clock,
    Package,
    Users,
} from 'lucide-react';

interface AdminNotification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface AdminAlert {
    id: string;
    type: 'low_stock' | 'pending_orders' | 'system_error' | 'new_user';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    count?: number;
    timestamp: number;
}

const AdminNotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const { hasPermission } = useAdminStore();

    // Sample notifications for demo
    useEffect(() => {
        const sampleNotifications: AdminNotification[] = [
            {
                id: '1',
                type: 'warning',
                title: 'Low Stock Alert',
                message: '5 products are running low on stock',
                timestamp: Date.now() - 300000, // 5 minutes ago
                read: false,
                action: {
                    label: 'View Products',
                    onClick: () => {
                        toast({
                            title: "Navigating to Products",
                            description: "Showing low stock products",
                        });
                    }
                }
            },
            {
                id: '2',
                type: 'info',
                title: 'New Orders',
                message: '3 new orders received in the last hour',
                timestamp: Date.now() - 900000, // 15 minutes ago
                read: false,
                action: {
                    label: 'View Orders',
                    onClick: () => {
                        toast({
                            title: "Navigating to Orders",
                            description: "Showing recent orders",
                        });
                    }
                }
            },
            {
                id: '3',
                type: 'success',
                title: 'System Update',
                message: 'Admin dashboard successfully updated',
                timestamp: Date.now() - 1800000, // 30 minutes ago
                read: true
            }
        ];

        const sampleAlerts: AdminAlert[] = [
            {
                id: 'alert1',
                type: 'low_stock',
                severity: 'high',
                title: 'Critical Stock Levels',
                description: 'Multiple products below minimum threshold',
                count: 5,
                timestamp: Date.now() - 600000
            },
            {
                id: 'alert2',
                type: 'pending_orders',
                severity: 'medium',
                title: 'Pending Orders',
                description: 'Orders waiting for confirmation',
                count: 12,
                timestamp: Date.now() - 1200000
            }
        ];

        setNotifications(sampleNotifications);
        setAlerts(sampleAlerts);
    }, [toast]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const dismissNotification = (notificationId: string) => {
        setNotifications(prev => 
            prev.filter(notification => notification.id !== notificationId)
        );
    };

    const dismissAlert = (alertId: string) => {
        setAlerts(prev => 
            prev.filter(alert => alert.id !== alertId)
        );
    };

    const getNotificationIcon = (type: AdminNotification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default:
                return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getAlertIcon = (type: AdminAlert['type']) => {
        switch (type) {
            case 'low_stock':
                return <Package className="h-4 w-4" />;
            case 'pending_orders':
                return <Clock className="h-4 w-4" />;
            case 'new_user':
                return <Users className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const formatTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return 'Just now';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

    if (!hasPermission('read')) {
        return null;
    }

    return (
        <div className="relative">
            {/* Notification Bell */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {(unreadCount > 0 || criticalAlerts.length > 0) && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                        {unreadCount + criticalAlerts.length}
                    </Badge>
                )}
            </Button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 z-50">
                    <Card className="shadow-lg border-2">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Admin Notifications</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-96 overflow-hidden">
                                <ScrollArea className="h-96">
                                    <div className="p-4 space-y-4">
                                        {/* Critical Alerts */}
                                        {criticalAlerts.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Critical Alerts
                                                </h4>
                                                <div className="space-y-2">
                                                    {criticalAlerts.map((alert) => (
                                                        <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-2">
                                                                    {getAlertIcon(alert.type)}
                                                                    <div>
                                                                        <p className="font-medium text-sm">{alert.title}</p>
                                                                        <p className="text-xs text-gray-600">{alert.description}</p>
                                                                        {alert.count && (
                                                                            <Badge variant="secondary" className="mt-1">
                                                                                {alert.count} items
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => dismissAlert(alert.id)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Regular Notifications */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                                            <div className="space-y-2">
                                                {notifications.length === 0 ? (
                                                    <p className="text-sm text-gray-500 text-center py-4">
                                                        No notifications
                                                    </p>
                                                ) : (
                                                    notifications.map((notification) => (
                                                        <div 
                                                            key={notification.id} 
                                                            className={`p-3 rounded-lg border ${
                                                                notification.read 
                                                                    ? 'bg-gray-50 border-gray-200' 
                                                                    : 'bg-blue-50 border-blue-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-2">
                                                                    {getNotificationIcon(notification.type)}
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-sm">{notification.title}</p>
                                                                        <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs text-gray-500">
                                                                                {formatTimeAgo(notification.timestamp)}
                                                                            </span>
                                                                            {notification.action && (
                                                                                <Button
                                                                                    variant="link"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        notification.action?.onClick();
                                                                                        markAsRead(notification.id);
                                                                                    }}
                                                                                    className="h-auto p-0 text-xs"
                                                                                >
                                                                                    {notification.action.label}
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {!notification.read && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => markAsRead(notification.id)}
                                                                            className="h-6 w-6 p-0"
                                                                        >
                                                                            <CheckCircle className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => dismissNotification(notification.id)}
                                                                        className="h-6 w-6 p-0"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminNotificationCenter;