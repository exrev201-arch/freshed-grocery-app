import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Heart, Package, MapPin, Phone, Save, Clock, Truck, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserService, UserFavorite, UserProfile as UserProfileType } from '@/lib/user-service';
import { OrderService, Order } from '@/lib/order-service';
import OrderTracker from '@/components/orders/OrderTracker';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
    const { user, logout } = useAuthStore();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
    const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    // Load user data when modal opens
    useEffect(() => {
        if (isOpen && user) {
            loadUserData();
        }
    }, [isOpen, user]);

    // Set up interval to refresh orders periodically
    useEffect(() => {
        if (!isOpen || !user) return;

        const interval = setInterval(() => {
            if (activeTab === 'orders') {
                loadUserOrders();
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [isOpen, user, activeTab]);

    const loadUserData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Load profile
            const profile = await UserService.getUserProfile(user.uid);
            setUserProfile(profile);

            if (profile) {
                setFormData({
                    name: profile.name || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                });
            } else {
                setFormData({
                    name: user.name || '',
                    phone: '',
                    address: '',
                });
            }

            // Load favorites
            const userFavorites = await UserService.getUserFavorites(user.uid);
            setFavorites(userFavorites);

            // Load orders
            await loadUserOrders();
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserOrders = async () => {
        if (!user) return;

        try {
            console.log(`🔍 UserProfile loading orders for userId: ${user.uid}`);
            const userOrders = await OrderService.getUserOrders(user.uid);
            console.log(`🔍 UserProfile loaded ${userOrders.length} orders:`, userOrders);
            setOrders(userOrders);
        } catch (error) {
            console.error('Error loading user orders:', error);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            if (userProfile) {
                // Update existing profile
                await UserService.updateProfile(user.uid, userProfile._id, formData);
            } else {
                // Create new profile
                await UserService.createOrUpdateProfile(formData);
            }

            toast({
                title: t('profileUpdated'),
                description: t('profileSavedSuccessfully'),
            });

            // Reload data
            await loadUserData();
        } catch (error) {
            toast({
                title: t('error'),
                description: t('failedToSaveProfile'),
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveFavorite = async (favorite: UserFavorite) => {
        if (!user) return;

        try {
            await UserService.removeFromFavorites(user.uid, favorite._id);
            setFavorites(prev => prev.filter(f => f._id !== favorite._id));
            toast({
                title: t('removedFromFavorites'),
                description: `${favorite.product_name} ${t('removedFromFavoritesDescription')}`,
            });
        } catch (error) {
            toast({
                title: t('error'),
                description: t('failedToRemoveFromFavorites'),
                variant: "destructive",
            });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: t('loggedOut'),
                description: t('successfullyLoggedOut'),
            });
            onClose();
        } catch (error) {
            toast({
                title: t('error'),
                description: t('failedToLogout'),
                variant: "destructive",
            });
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="bg-background rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden border shadow-lg">
                {/* Header */}
                <div className="bg-primary text-primary-foreground p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold">{user.name || t('freshUser')}</h2>
                                <p className="text-primary-foreground/80 text-sm">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-border bg-background">
                    {[
                        { id: 'profile', label: t('userProfile'), icon: User },
                        { id: 'orders', label: t('orders'), icon: Package },
                        { id: 'favorites', label: t('favorites'), icon: Heart },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                                activeTab === id
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto bg-background">
                    {activeTab === 'profile' && (
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mb-2"></div>
                                    <p className="text-sm text-muted-foreground">{t('loadingProfile')}</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <Label htmlFor="name">{t('fullName')}</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder={t('enterFullName')}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">{t('email')}</Label>
                                        <Input
                                            id="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">{t('phoneNumber')}</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder={t('phoneNumberPlaceholder')}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="address">{t('deliveryAddress')}</Label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder={t('enterDeliveryAddress')}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="w-full"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaving ? t('saving') : t('saveProfile')}
                                    </Button>

                                    <Separator />

                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>{t('memberSince')}: {user ? new Date(user.createdTime).toLocaleDateString() : 'N/A'}</p>
                                        <p>{t('lastLogin')}: {user ? new Date(user.lastLoginTime).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            {isLoading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mb-2"></div>
                                    <p className="text-sm text-muted-foreground">{t('loadingOrders')}</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="font-medium text-foreground mb-2">{t('noOrdersYet')}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        {t('orderHistoryWillAppearHere')}
                                    </p>
                                    <Button
                                        onClick={onClose}
                                    >
                                        {t('startShoppingButton')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <OrderTracker
                                            key={order._id}
                                            orderId={order._id}
                                            orderStatus={order.status}
                                            orderDate={order.created_at}
                                            totalAmount={order.total_amount}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div>
                            {isLoading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mb-2"></div>
                                    <p className="text-sm text-muted-foreground">{t('loadingFavorites')}</p>
                                </div>
                            ) : favorites.length === 0 ? (
                                <div className="text-center py-8">
                                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="font-medium text-foreground mb-2">{t('noFavoritesYet')}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        {t('productsYouFavoriteWillAppearHere')}
                                    </p>
                                    <Button
                                        onClick={onClose}
                                    >
                                        {t('browseProducts')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {favorites.map((favorite) => (
                                        <div key={favorite._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-foreground">{favorite.product_name}</h4>
                                                <p className="text-xs text-muted-foreground capitalize">{favorite.product_category}</p>
                                                <p className="text-sm font-semibold text-primary">
                                                    {new Intl.NumberFormat('en-TZ', {
                                                        style: 'currency',
                                                        currency: 'TZS',
                                                        minimumFractionDigits: 0
                                                    }).format(favorite.product_price)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFavorite(favorite)}
                                                className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-colors"
                                            >
                                                <Heart className="h-4 w-4 fill-current" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 bg-background">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('logout')}
                    </Button>
                </div>
            </div>
        </div>
    );
}