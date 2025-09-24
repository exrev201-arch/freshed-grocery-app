import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeliveryPerson {
    id: string;
    name: string;
    phone: string;
    email?: string;
    vehicleType: 'motorcycle' | 'car' | 'bicycle';
    licenseNumber?: string;
    isActive: boolean;
    currentOrderId?: string;
}

interface DeliveryAuthState {
    deliveryPerson: DeliveryPerson | null;
    isDeliveryAuthenticated: boolean;
    isLoading: boolean;
    
    // Actions
    deliveryLogin: (person: DeliveryPerson) => void;
    deliveryLogout: () => void;
    updateDeliveryPerson: (person: DeliveryPerson) => void;
    assignOrder: (orderId: string) => void;
    clearOrder: () => void;
}

export const useDeliveryAuthStore = create<DeliveryAuthState>()(
    persist(
        (set, get) => ({
            deliveryPerson: null,
            isDeliveryAuthenticated: false,
            isLoading: false,

            deliveryLogin: (person: DeliveryPerson) => {
                set({
                    deliveryPerson: person,
                    isDeliveryAuthenticated: true,
                    isLoading: false,
                });
                console.log(`🚚 Delivery person logged in: ${person.name} (${person.phone})`);
            },

            deliveryLogout: () => {
                const { deliveryPerson } = get();
                if (deliveryPerson) {
                    console.log(`🚚 Delivery person logged out: ${deliveryPerson.name}`);
                }
                
                set({
                    deliveryPerson: null,
                    isDeliveryAuthenticated: false,
                });
            },

            updateDeliveryPerson: (person: DeliveryPerson) => {
                set({ deliveryPerson: person });
            },

            assignOrder: (orderId: string) => {
                const { deliveryPerson } = get();
                if (deliveryPerson) {
                    set({
                        deliveryPerson: {
                            ...deliveryPerson,
                            currentOrderId: orderId,
                        },
                    });
                }
            },

            clearOrder: () => {
                const { deliveryPerson } = get();
                if (deliveryPerson) {
                    set({
                        deliveryPerson: {
                            ...deliveryPerson,
                            currentOrderId: undefined,
                        },
                    });
                }
            },
        }),
        {
            name: 'delivery-auth-storage',
            partialize: (state) => ({
                deliveryPerson: state.deliveryPerson,
                isDeliveryAuthenticated: state.isDeliveryAuthenticated,
            }),
        }
    )
);