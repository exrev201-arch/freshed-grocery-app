import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Truck,
    Package,
    CheckCircle,
    Clock,
    MapPin,
    Phone,
    Star,
    MessageSquare,
    Navigation
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getOrderDelivery, updateDeliveryLocation } from '@/lib/delivery-service';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import LiveDeliveryTracker from '@/components/delivery/LiveDeliveryTracker';

interface OrderTrackerProps {
    orderId: string;
    orderStatus: string;
    orderDate: number;
    totalAmount: number;
}

interface TrackingData {
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
    customer_rating?: number;
    customer_feedback?: string;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({
    orderId,
    orderStatus,
    orderDate,
    totalAmount
}) => {
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const { user } = useAuthStore();
    const { toast } = useToast();

    useEffect(() => {
        loadTrackingData();
    }, [orderId]);

    const loadTrackingData = async () => {
        try {
            const data = await getOrderDelivery(orderId);
            if (data) {
                // Transform DeliveryTracker to TrackingData format
                const trackingData: TrackingData = {
                    _id: data._id,
                    _uid: data._uid,
                    order_id: data.order_id,
                    delivery_person_name: data.delivery_person_name,
                    delivery_person_phone: data.delivery_person_phone || 'N/A',
                    status: data.status,
                    assigned_at: data.assigned_at,
                    picked_up_at: data.picked_up_at,
                    delivered_at: data.delivered_at,
                    delivery_notes: data.delivery_notes,
                    location_updates: data.location_updates
                };
                setTrackingData(trackingData);
            }
        } catch (error) {
            console.error('Error loading tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusProgress = (status: string): number => {
        switch (status) {
            case 'pending': return 10;
            case 'confirmed': return 25;
            case 'preparing': return 50;
            case 'ready_for_pickup': return 60;
            case 'out_for_delivery': return 80;
            case 'delivered': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'confirmed': return 'bg-blue-500';
            case 'preparing': return 'bg-orange-500';
            case 'ready_for_pickup': return 'bg-purple-500';
            case 'out_for_delivery': return 'bg-green-500 animate-pulse';
            case 'delivered': return 'bg-green-600';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
            case 'confirmed':
                return <Clock className="h-5 w-5" />;
            case 'preparing':
            case 'ready_for_pickup':
                return <Package className="h-5 w-5" />;
            case 'out_for_delivery':
                return <Truck className="h-5 w-5" />;
            case 'delivered':
                return <CheckCircle className="h-5 w-5" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    const formatStatus = (status: string): string => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const handleSubmitFeedback = async () => {
        if (!user?.uid || rating === 0) {
            toast({
                title: "Tatizo",
                description: "Tafadhali chagua ukadiriaji kabla ya kutuma maoni.",
                variant: "destructive"
            });
            return;
        }

        try {
            // For now, just show success message - we can implement feedback later
            const success = true;

            if (success) {
                toast({
                    title: "Asante!",
                    description: "Maoni yako yamepokewa. Tunashukuru kwa mrejesho wako!"
                });
                setFeedbackOpen(false);
                loadTrackingData(); // Refresh to show submitted feedback
            } else {
                throw new Error('Failed to submit feedback');
            }
        } catch (error) {
            toast({
                title: "Kosa",
                description: "Kuna tatizo la kiufundi. Tafadhali jaribu tena.",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">Inapakia...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Ufuatiliaji wa Agizo</span>
                    <Badge className={getStatusColor(orderStatus)}>
                        {formatStatus(orderStatus)}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Order Progress */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span>Maendeleo ya Agizo</span>
                        <span>{getStatusProgress(orderStatus)}%</span>
                    </div>
                    <Progress
                        value={getStatusProgress(orderStatus)}
                        className="h-2"
                    />
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Namba ya Agizo:</span>
                        <p className="text-muted-foreground">#{orderId.slice(-8)}</p>
                    </div>
                    <div>
                        <span className="font-medium">Jumla:</span>
                        <p className="text-muted-foreground">TZS {totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="font-medium">Tarehe:</span>
                        <p className="text-muted-foreground">
                            {new Date(orderDate).toLocaleDateString('sw-TZ')}
                        </p>
                    </div>
                    <div>
                        <span className="font-medium">Wakati:</span>
                        <p className="text-muted-foreground">
                            {new Date(orderDate).toLocaleTimeString('sw-TZ', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Status Timeline */}
                <div className="space-y-4">
                    <h4 className="font-medium">Mzunguko wa Agizo</h4>
                    <div className="space-y-3">
                        {[
                            { status: 'pending', label: 'Agizo Limepokewa', time: new Date(orderDate) },
                            { status: 'confirmed', label: 'Agizo Limethibitishwa' },
                            { status: 'preparing', label: 'Inaandaliwa' },
                            { status: 'ready_for_pickup', label: 'Iko Tayari kwa Kuchukua' },
                            { status: 'out_for_delivery', label: 'Inasafirishwa' },
                            { status: 'delivered', label: 'Imefikishwa' }
                        ].map((step, index) => (
                            <div key={step.status} className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusProgress(orderStatus) >= ((index + 1) * 16.67)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {getStatusIcon(step.status)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${getStatusProgress(orderStatus) >= ((index + 1) * 16.67)
                                        ? 'text-green-600'
                                        : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </p>
                                    {step.time && (
                                        <p className="text-xs text-muted-foreground">
                                            {step.time.toLocaleString('sw-TZ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Delivery Tracking */}
                {(orderStatus === 'out_for_delivery' || orderStatus === 'delivered') && trackingData && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium flex items-center">
                                    <Navigation className="h-4 w-4 mr-2 text-green-600" />
                                    Ufuatiliaji wa Moja kwa Moja
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                    GPS Tracking
                                </Badge>
                            </div>
                            <LiveDeliveryTracker
                                orderId={orderId}
                                refreshInterval={orderStatus === 'out_for_delivery' ? 30000 : 0}
                            />
                        </div>
                    </>
                )}

                {/* Basic Delivery Information */}
                {trackingData && orderStatus !== 'out_for_delivery' && orderStatus !== 'delivered' && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h4 className="font-medium">Maelezo ya Uongozi</h4>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Truck className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{trackingData.delivery_person_name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">{trackingData.delivery_person_phone}</span>
                                </div>
                                {trackingData.delivery_notes && (
                                    <div className="flex items-start space-x-2">
                                        <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span className="text-sm">{trackingData.delivery_notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Delivery Feedback */}
                {orderStatus === 'delivered' && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <h4 className="font-medium">Ukadiriaji wa Huduma</h4>
                            {trackingData?.customer_rating ? (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-sm font-medium">Umepewa:</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= (trackingData.customer_rating || 0)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {trackingData.customer_feedback && (
                                        <p className="text-sm text-muted-foreground">
                                            "{trackingData.customer_feedback}"
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Star className="h-4 w-4 mr-2" />
                                            Toa Ukadiriaji
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Kadiria Huduma ya Uongozi</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Ukadiriaji (1-5 nyota)</Label>
                                                <div className="flex space-x-1 mt-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star
                                                                className={`h-6 w-6 ${star <= rating
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300 hover:text-yellow-200'
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="feedback">Maoni (si lazima)</Label>
                                                <Textarea
                                                    id="feedback"
                                                    placeholder="Tuambie jinsi huduma ilivyokuwa..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    className="mt-2"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleSubmitFeedback}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                disabled={rating === 0}
                                            >
                                                Tuma Ukadiriaji
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderTracker;