import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Navigation,
    Clock,
    Truck,
    Phone,
    RefreshCw,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { getOrderDelivery, LocationUpdate } from '@/lib/delivery-service';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveDeliveryTrackerProps {
    orderId: string;
    refreshInterval?: number; // in milliseconds, default 30 seconds
}

interface DeliveryData {
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
    location_updates?: string;
    current_location?: string;
    estimated_arrival?: string;
    distance_remaining?: number;
}

const LiveDeliveryTracker: React.FC<LiveDeliveryTrackerProps> = ({
    orderId,
    refreshInterval = 30000
}) => {
    const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [locationHistory, setLocationHistory] = useState<LocationUpdate[]>([]);
    const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        loadDeliveryData();

        // Set up auto-refresh
        if (refreshInterval > 0) {
            intervalRef.current = setInterval(() => {
                loadDeliveryData(true);
            }, refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [orderId, refreshInterval]);

    const loadDeliveryData = async (isAutoRefresh = false) => {
        if (!isAutoRefresh) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            const data = await getOrderDelivery(orderId);
            if (data) {
                setDeliveryData(data);
                setLastUpdate(new Date());

                // Parse location data
                if (data.location_updates) {
                    try {
                        const locations = JSON.parse(data.location_updates) as LocationUpdate[];
                        setLocationHistory(locations);
                    } catch (e) {
                        console.error('Error parsing location updates:', e);
                    }
                }

                if (data.current_location) {
                    try {
                        const current = JSON.parse(data.current_location) as LocationUpdate;
                        setCurrentLocation(current);
                    } catch (e) {
                        console.error('Error parsing current location:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading delivery data:', error);
            if (!isAutoRefresh) {
                toast({
                    title: t('error'),
                    description: t('failedToLoadDeliveryData'),
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const formatTimeAgo = (timestamp: string): string => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return t('justNow');
        if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ${t('daysAgo')}`;
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'assigned': return 'bg-blue-500';
            case 'picked_up': return 'bg-orange-500';
            case 'in_transit': return 'bg-green-500 animate-pulse';
            case 'delivered': return 'bg-green-600';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'assigned': return <AlertCircle className="h-4 w-4" />;
            case 'picked_up': return <Truck className="h-4 w-4" />;
            case 'in_transit': return <Navigation className="h-4 w-4" />;
            case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const formatStatus = (status: string): string => {
        switch (status) {
            case 'assigned': return t('assigned');
            case 'picked_up': return t('pickedUp');
            case 'in_transit': return t('inTransit');
            case 'delivered': return t('deliveredStatus');
            case 'failed': return t('failed');
            default: return status;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">{t('loadingDeliveryInfo')}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!deliveryData) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t('noDeliveryInfo')}</p>
                        <p className="text-sm">{t('orderNotAssignedToDelivery')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Live Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                {getStatusIcon(deliveryData.status)}
                                {deliveryData.status === 'in_transit' && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                )}
                            </div>
                            <span>{t('liveTracking')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(deliveryData.status)}>
                                {formatStatus(deliveryData.status)}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadDeliveryData()}
                                disabled={isRefreshing}
                                className="h-8 w-8 p-0"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Delivery Person Info */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                            <p className="font-medium">{deliveryData.delivery_person_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {deliveryData.delivery_person_phone}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${deliveryData.delivery_person_phone}`)}
                        >
                            <Phone className="h-4 w-4 mr-1" />
                            {t('call')}
                        </Button>
                    </div>

                    {/* Estimated Arrival */}
                    {deliveryData.estimated_arrival && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">{t('estimatedArrival')}:</span>
                            </div>
                            <span className="font-medium text-green-700">
                                {new Date(deliveryData.estimated_arrival).toLocaleTimeString('sw-TZ', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}

                    {/* Distance Remaining */}
                    {deliveryData.distance_remaining && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t('distanceRemaining')}:</span>
                            <span className="font-medium">{deliveryData.distance_remaining.toFixed(1)} km</span>
                        </div>
                    )}

                    {/* Current Location */}
                    {currentLocation && (
                        <div className="space-y-2">
                            <Separator />
                            <h4 className="font-medium flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-green-600" />
                                {t('currentLocation')}
                            </h4>
                            <div className="bg-muted/30 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Latitude:</span>
                                        <p className="font-mono">{currentLocation.latitude.toFixed(6)}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Longitude:</span>
                                        <p className="font-mono">{currentLocation.longitude.toFixed(6)}</p>
                                    </div>
                                    {currentLocation.address && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">{t('address')}:</span>
                                            <p>{currentLocation.address}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-muted-foreground">{t('updated')}:</span>
                                        <p>{formatTimeAgo(currentLocation.timestamp)}</p>
                                    </div>
                                    {currentLocation.speed && (
                                        <div>
                                            <span className="text-muted-foreground">{t('speed')}:</span>
                                            <p>{currentLocation.speed.toFixed(1)} km/h</p>
                                        </div>
                                    )}
                                </div>
                                {currentLocation.notes && (
                                    <>
                                        <Separator className="my-2" />
                                        <p className="text-sm text-muted-foreground">
                                            <strong>{t('notes')}:</strong> {currentLocation.notes}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Google Maps Link */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    const mapsUrl = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
                                    window.open(mapsUrl, '_blank');
                                }}
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                {t('openInGoogleMaps')}
                            </Button>
                        </div>
                    )}

                    {/* Location History */}
                    {locationHistory.length > 1 && (
                        <div className="space-y-2">
                            <Separator />
                            <h4 className="font-medium">{t('locationHistory')} ({locationHistory.length} {t('updates')})</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {locationHistory.slice().reverse().map((location, index) => (
                                    <div key={index} className="flex items-start space-x-2 text-sm p-2 hover:bg-muted/30 rounded">
                                        <MapPin className="h-3 w-3 mt-1 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-xs">
                                                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(location.timestamp)}
                                                </span>
                                            </div>
                                            {location.address && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {location.address}
                                                </p>
                                            )}
                                            {location.notes && (
                                                <p className="text-xs text-muted-foreground">
                                                    {location.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Last Update Info */}
                    {lastUpdate && (
                        <div className="text-center pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                                {t('updated')}: {formatTimeAgo(lastUpdate.toISOString())}
                                {refreshInterval > 0 && (
                                    <span className="ml-2">
                                        • {t('refreshingEvery')} {Math.floor(refreshInterval / 1000)} {t('seconds')}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LiveDeliveryTracker;