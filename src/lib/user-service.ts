import { table } from './backend-service';

const USER_PROFILES_TABLE_ID = 'user_profiles';
const USER_FAVORITES_TABLE_ID = 'user_favorites';

export interface UserProfile {
    _uid: string;
    _id: string;
    _tid: string;
    name: string;
    phone?: string;
    address?: string;
    preferences?: string;
    created_at: string;
    updated_at: string;
}

export interface UserFavorite {
    _uid: string;
    _id: string;
    _tid: string;
    product_id: string;
    product_name: string;
    product_price: number;
    product_category: string;
    created_at: string;
}

export interface UserPreferences {
    favoriteCategories: string[];
    dietaryRestrictions: string[];
    deliveryPreferences: {
        preferredTime: string;
        deliveryInstructions?: string;
    };
}

export class UserService {
    // Profile Management
    static async createOrUpdateProfile(userData: {
        name: string;
        phone?: string;
        address?: string;
        preferences?: UserPreferences;
    }): Promise<void> {
        const now = new Date().toISOString();

        try {
            await table.addItem(USER_PROFILES_TABLE_ID, {
                name: userData.name,
                phone: userData.phone || '',
                address: userData.address || '',
                preferences: userData.preferences ? JSON.stringify(userData.preferences) : '{}',
                created_at: now,
                updated_at: now,
            });
        } catch (error) {
            console.error('Error creating/updating profile:', error);
            throw error;
        }
    }

    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const result = await table.getItems(USER_PROFILES_TABLE_ID, {
                query: { _uid: userId },
                limit: 1,
            });

            return result.items.length > 0 ? result.items[0] as UserProfile : null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    static async updateProfile(userId: string, profileId: string, updates: {
        name?: string;
        phone?: string;
        address?: string;
        preferences?: UserPreferences;
    }): Promise<void> {
        const now = new Date().toISOString();

        try {
            await table.updateItem(USER_PROFILES_TABLE_ID, {
                _uid: userId,
                _id: profileId,
                ...updates,
                preferences: updates.preferences ? JSON.stringify(updates.preferences) : undefined,
                updated_at: now,
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Favorites Management
    static async addToFavorites(productData: {
        product_id: string;
        product_name: string;
        product_price: number;
        product_category: string;
    }): Promise<void> {
        const now = new Date().toISOString();

        try {
            await table.addItem(USER_FAVORITES_TABLE_ID, {
                product_id: productData.product_id,
                product_name: productData.product_name,
                product_price: productData.product_price,
                product_category: productData.product_category,
                created_at: now,
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    }

    static async removeFromFavorites(userId: string, favoriteId: string): Promise<void> {
        try {
            await table.deleteItem(USER_FAVORITES_TABLE_ID, {
                _uid: userId,
                _id: favoriteId,
            });
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    }

    static async getUserFavorites(userId: string): Promise<UserFavorite[]> {
        try {
            const result = await table.getItems(USER_FAVORITES_TABLE_ID, {
                query: { _uid: userId },
                sort: 'created_at',
                order: 'desc',
                limit: 100,
            });

            return result.items as UserFavorite[];
        } catch (error) {
            console.error('Error fetching user favorites:', error);
            return [];
        }
    }

    static async isProductFavorited(userId: string, productId: string): Promise<boolean> {
        try {
            const result = await table.getItems(USER_FAVORITES_TABLE_ID, {
                query: {
                    _uid: userId,
                    product_id: productId
                },
                limit: 1,
            });

            return result.items.length > 0;
        } catch (error) {
            console.error('Error checking if product is favorited:', error);
            return false;
        }
    }

    static async getFavoriteByProductId(userId: string, productId: string): Promise<UserFavorite | null> {
        try {
            const result = await table.getItems(USER_FAVORITES_TABLE_ID, {
                query: {
                    _uid: userId,
                    product_id: productId
                },
                limit: 1,
            });

            return result.items.length > 0 ? result.items[0] as UserFavorite : null;
        } catch (error) {
            console.error('Error getting favorite by product ID:', error);
            return null;
        }
    }
}