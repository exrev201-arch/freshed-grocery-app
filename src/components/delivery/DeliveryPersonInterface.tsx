import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    MapPin,
    Navigation,
    Play,
    Pause,
    CheckCircle2,
    AlertTriangle,
    Truck,
    Clock,
    Phone,
    Camera,
    Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    updateDeliveryLocation,
    startDeliveryRoute,
    completeDelivery,
    updateEstimatedArrival,
    getOrderDelivery,
    LocationUpdate
} from '@/lib/delivery-service';
import { useToast } from '@/hooks/use-toast';

interface DeliveryPersonInterfaceProps {
    orderId: string;
    deliveryPersonName: string;
    deliveryPersonPhone: string;
}

interface GeolocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number;
    heading?: number;
}

const DeliveryPersonInterface: React.FC<DeliveryPersonInterfaceProps> = ({
    orderId,
    deliveryPersonName,
    deliveryPersonPhone
}) => {
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<GeolocationData | null>(null);
    const [deliveryStarted, setDeliveryStarted] = useState(false);
    const [deliveryCompleted, setDeliveryCompleted] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [updateInterval, setUpdateInterval] = useState(30); // seconds
    const [notes, setNotes] = useState('');
    const [estimatedArrival, setEstimatedArrival] = useState('');
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
    const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

    const watchIdRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadDeliveryStatus();

        return () => {
            stopLocationTracking();
        };
    }, [orderId]);

    useEffect(() => {
        if (isTracking && autoUpdate) {
            startAutoUpdates();
        } else {
            stopAutoUpdates();
        }
    }, [isTracking, autoUpdate, updateInterval]);

    const loadDeliveryStatus = async () => {
        try {
            const delivery = await getOrderDelivery(orderId);
            if (delivery) {
                setDeliveryStarted(delivery.status !== 'assigned');
                setDeliveryCompleted(delivery.status === 'delivered');
            }
        } catch (error) {
            console.error('Error loading delivery status:', error);
        }
    };

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Kosa",
                description: "Kifaa hiki hakitumii GPS.",
                variant: "destructive"
            });
            return;
        }

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const locationData: GeolocationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed || undefined,
                    heading: position.coords.heading || undefined
                };

                setCurrentLocation(locationData);
                setLocationAccuracy(position.coords.accuracy);

                if (autoUpdate && deliveryStarted && !deliveryCompleted) {
                    updateLocationAutomatically(locationData);
                }
            },
            (error) => {
                console.error('Location error:', error);
                toast({
                    title: "Kosa la Mahali",
                    description: "Imeshindwa kupata mahali. Hakikisha GPS imewashwa.",
                    variant: "destructive"
                });
            },
            options
        );

        setIsTracking(true);
        toast({
            title: "GPS Imewashwa",
            description: "Sasa inafuatilia mahali pako."
        });
    };

    const stopLocationTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        stopAutoUpdates();
        setIsTracking(false);
    };

    const startAutoUpdates = () => {
        stopAutoUpdates();
        intervalRef.current = setInterval(() => {
            if (currentLocation && deliveryStarted && !deliveryCompleted) {
                updateLocationAutomatically(currentLocation);
            }
        }, updateInterval * 1000);
    };

    const stopAutoUpdates = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const updateLocationAutomatically = async (location: GeolocationData) => {
        if (isUpdatingLocation) return;

        setIsUpdatingLocation(true);
        try {
            await updateDeliveryLocation(
                orderId,
                location.latitude,
                location.longitude,
                undefined, // address will be resolved by the system if needed
                notes || 'Mrejesho wa otomatiki wa mahali',
                location.speed,
                location.accuracy
            );
            setLastLocationUpdate(new Date());
        } catch (error) {
            console.error('Error auto-updating location:', error);
        } finally {
            setIsUpdatingLocation(false);
        }
    };

    const handleStartDelivery = async () => {
        try {
            const success = await startDeliveryRoute(orderId);
            if (success) {
                setDeliveryStarted(true);
                toast({
                    title: "Uongozi Umeanza",
                    description: "Umeanza safari ya uongozi. GPS inafuatilia mahali pako."
                });

                if (!isTracking) {
                    startLocationTracking();
                }
            } else {
                throw new Error('Failed to start delivery');
            }
        } catch (error) {
            toast({
                title: "Kosa",
                description: "Imeshindwa kuanza uongozi. Jaribu tena.",
                variant: "destructive"
            });
        }
    };

    const handleManualLocationUpdate = async () => {
        if (!currentLocation) {
            toast({
                title: "Hakuna Mahali",
                description: "Tafadhali anza GPS kwanza.",
                variant: "destructive"
            });
            return;
        }

        setIsUpdatingLocation(true);
        try {
            await updateDeliveryLocation(
                orderId,
                currentLocation.latitude,
                currentLocation.longitude,
                undefined,
                notes || 'Mrejesho wa mkono wa mahali',
                currentLocation.speed,
                currentLocation.accuracy
            );

            setNotes('');
            setLastLocationUpdate(new Date());
            toast({
                title: "Mahali Yamesasishwa",
                description: "Taarifa za mahali zimesasishwa."
            });
        } catch (error) {
            toast({
                title: "Kosa",
                description: "Imeshindwa kusasisha mahali. Jaribu tena.",
                variant: "destructive"
            });
        } finally {
            setIsUpdatingLocation(false);
        }
    };

    const handleUpdateEstimatedArrival = async () => {
        if (!estimatedArrival) return;

        try {
            const arrivalTime = new Date();
            const [hours, minutes] = estimatedArrival.split(':');
            arrivalTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const success = await updateEstimatedArrival(orderId, arrivalTime.toISOString());
            if (success) {
                toast({
                    title: "Wakati Umesasishwa",
                    description: `Wakati wa kufika: ${estimatedArrival}`
                });
            }
        } catch (error) {
            toast({
                title: "Kosa",
                description: "Imeshindwa kusasisha wakati wa kufika.",
                variant: "destructive"
            });
        }
    };

    const handleCompleteDelivery = async () => {
        try {
            const finalLocation: LocationUpdate | undefined = currentLocation ? {
                timestamp: new Date().toISOString(),
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                notes: 'Mahali pa mwisho pa uongozi',
                accuracy: currentLocation.accuracy,
                speed: currentLocation.speed
            } : undefined;

            const success = await completeDelivery(orderId, finalLocation);
            if (success) {
                setDeliveryCompleted(true);
                stopLocationTracking();
                toast({
                    title: "Uongozi Umekamilika",
                    description: "Umekamilisha uongozi kwa mafanikio!"
                });
            } else {
                throw new Error('Failed to complete delivery');
            }
        } catch (error) {
            toast({
                title: "Kosa",
                description: "Imeshindwa kukamilisha uongozi. Jaribu tena.",
                variant: "destructive"
            });
        }
    };

    const getAccuracyColor = (accuracy: number): string => {
        if (accuracy <= 10) return 'text-green-600';
        if (accuracy <= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAccuracyText = (accuracy: number): string => {
        if (accuracy <= 10) return 'Sahihi sana';
        if (accuracy <= 50) return 'Sahihi';
        return 'Si sahihi';
    };

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Truck className="h-5 w-5" />
                            <span>Mfumo wa Uongozi</span>
                        </div>
                        <Badge variant={deliveryCompleted ? "default" : deliveryStarted ? "secondary" : "outline"}>
                            {deliveryCompleted ? 'Umekamilika' : deliveryStarted ? 'Unaendelea' : 'Haujaanza'}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Delivery Person Info */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-medium">{deliveryPersonName}</p>
                            <p className="text-sm text-muted-foreground">{deliveryPersonPhone}</p>
                        </div>
                    </div>

                    {!deliveryCompleted && (
                        <>
                            {/* GPS Controls */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="gps-tracking">GPS Tracking</Label>
                                    <Button
                                        variant={isTracking ? "destructive" : "default"}
                                        size="sm"
                                        onClick={isTracking ? stopLocationTracking : startLocationTracking}
                                    >
                                        {isTracking ? (
                                            <>
                                                <Pause className="h-4 w-4 mr-2" />
                                                Acha GPS
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4 mr-2" />
                                                Anza GPS
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {isTracking && currentLocation && (
                                    <div className="bg-green-50 p-3 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-800">GPS Imewashwa</span>
                                            <div className="flex items-center space-x-1">
                                                <div className={`w-2 h-2 rounded-full ${locationAccuracy && locationAccuracy <= 10 ? 'bg-green-500' : locationAccuracy && locationAccuracy <= 50 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                                                <span className={`text-xs ${locationAccuracy ? getAccuracyColor(locationAccuracy) : 'text-gray-500'}`}>
                                                    {locationAccuracy ? getAccuracyText(locationAccuracy) : 'Inapima...'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                                            <div>Lat: {currentLocation.latitude.toFixed(6)}</div>
                                            <div>Lng: {currentLocation.longitude.toFixed(6)}</div>
                                            {currentLocation.speed && (
                                                <>
                                                    <div>Kasi: {(currentLocation.speed * 3.6).toFixed(1)} km/h</div>
                                                    <div>Usahihi: ±{currentLocation.accuracy.toFixed(0)}m</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Delivery Controls */}
                            {!deliveryStarted ? (
                                <Button
                                    onClick={handleStartDelivery}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={!isTracking}
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Anza Uongozi
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    {/* Auto Update Settings */}
                                    <div className="space-y-3 p-3 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="auto-update">Mrejesho wa Otomatiki</Label>
                                            <Switch
                                                id="auto-update"
                                                checked={autoUpdate}
                                                onCheckedChange={setAutoUpdate}
                                            />
                                        </div>

                                        {autoUpdate && (
                                            <div className="space-y-2">
                                                <Label htmlFor="interval">Muda wa Mrejesho (sekunde)</Label>
                                                <Input
                                                    id="interval"
                                                    type="number"
                                                    min="10"
                                                    max="300"
                                                    value={updateInterval}
                                                    onChange={(e) => setUpdateInterval(parseInt(e.target.value) || 30)}
                                                    className="w-full"
                                                />
                                            </div>
                                        )}

                                        {lastLocationUpdate && (
                                            <p className="text-xs text-muted-foreground">
                                                Mrejesho wa mwisho: {lastLocationUpdate.toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Manual Location Update */}
                                    <div className="space-y-3">
                                        <Label htmlFor="notes">Maelezo ya Mahali (si lazima)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Kwa mfano: Niko nje ya mlango, nafungua..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                        />
                                        <Button
                                            onClick={handleManualLocationUpdate}
                                            disabled={!currentLocation || isUpdatingLocation}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            {isUpdatingLocation ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                            ) : (
                                                <Send className="h-4 w-4 mr-2" />
                                            )}
                                            Sasisha Mahali Sasa
                                        </Button>
                                    </div>

                                    {/* Estimated Arrival */}
                                    <div className="space-y-2">
                                        <Label htmlFor="arrival">Wakati wa Kufika (tahmini)</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="arrival"
                                                type="time"
                                                value={estimatedArrival}
                                                onChange={(e) => setEstimatedArrival(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleUpdateEstimatedArrival}
                                                disabled={!estimatedArrival}
                                                variant="outline"
                                            >
                                                <Clock className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Complete Delivery */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Kamilisha Uongozi
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Thibitisha Ukamilishaji</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <p>Una uhakika umekamilisha uongozi wa agizo hili?</p>
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span>Hatua hii haiwezi kubadilishwa.</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => { }}
                                                    >
                                                        Ghairi
                                                    </Button>
                                                    <Button
                                                        onClick={handleCompleteDelivery}
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                    >
                                                        Kamilisha
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </>
                    )}

                    {deliveryCompleted && (
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <h3 className="font-medium text-green-800 mb-1">Uongozi Umekamilika!</h3>
                            <p className="text-sm text-green-600">Asante kwa huduma nzuri.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DeliveryPersonInterface;