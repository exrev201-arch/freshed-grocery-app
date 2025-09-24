import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/lib/logger';
import { AdminUser } from '@/lib/admin-service';
import { ADMIN_PERMISSIONS, AdminRole } from '@/lib/admin-config';

interface AdminState {
    adminUser: AdminUser | null;
    isAdminAuthenticated: boolean;
    sessionTimeout: number | null;
    lastActivity: number;
    adminLogin: (user: AdminUser) => void;
    adminLogout: () => void;
    updateAdminUser: (user: AdminUser) => void;
    updateLastActivity: () => void;
    hasPermission: (permission: keyof typeof ADMIN_PERMISSIONS['ADMIN']) => boolean;
    hasSpecificPermission: (role: AdminRole, permission: string) => boolean;
    checkSession: () => boolean;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            adminUser: null,
            isAdminAuthenticated: false,
            sessionTimeout: null,
            lastActivity: Date.now(),

            adminLogin: (user: AdminUser) => {
                const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
                const sessionTimeout = Date.now() + sessionDuration;
                
                set({
                    adminUser: user,
                    isAdminAuthenticated: true,
                    sessionTimeout,
                    lastActivity: Date.now(),
                });
                
                logger.info(`Admin login successful: ${user.email} (${user.role})`, 'ADMIN_AUTH');
                logger.info(`Session expires at: ${new Date(sessionTimeout).toLocaleString()}`, 'ADMIN_AUTH');
            },

            adminLogout: () => {
                const { adminUser } = get();
                if (adminUser) {
                    logger.info(`Admin logout: ${adminUser.email}`, 'ADMIN_AUTH');
                }
                
                set({
                    adminUser: null,
                    isAdminAuthenticated: false,
                    sessionTimeout: null,
                    lastActivity: Date.now(),
                });
            },

            updateAdminUser: (user: AdminUser) => {
                set({ adminUser: user });
            },

            hasPermission: (permission: keyof typeof ADMIN_PERMISSIONS['ADMIN']) => {
                const { adminUser } = get();
                
                if (!adminUser || adminUser.is_active !== 'active') {
                    console.warn('🚫 Permission denied: User not active or not found');
                    return false;
                }

                // Normalize role to uppercase to match ADMIN_PERMISSIONS keys
                const role = adminUser.role.toUpperCase() as AdminRole;
                const permissions = ADMIN_PERMISSIONS[role];
                
                if (!permissions) {
                    console.warn('🚫 Permission denied: Invalid role', adminUser.role, 'normalized to:', role);
                    return false;
                }

                const hasAccess = permissions[permission] === true;
                
                if (!hasAccess) {
                    console.warn(`🚫 Permission denied: ${adminUser.email} (${role}) lacks ${permission} permission`);
                }
                
                return hasAccess;
            },

            updateLastActivity: () => {
                set({ lastActivity: Date.now() });
            },

            checkSession: () => {
                const { sessionTimeout, isAdminAuthenticated, adminUser } = get();
                
                if (!isAdminAuthenticated || !sessionTimeout || !adminUser) {
                    return false;
                }
                
                const now = Date.now();
                if (now > sessionTimeout) {
                    logger.warn(`Admin session expired for ${adminUser.email}`, 'ADMIN_AUTH');
                    get().adminLogout();
                    return false;
                }
                
                // Check for inactivity (2 hours)
                const inactivityTimeout = 2 * 60 * 60 * 1000;
                const { lastActivity } = get();
                if (now - lastActivity > inactivityTimeout) {
                    logger.warn(`Admin session expired due to inactivity: ${adminUser.email}`, 'ADMIN_AUTH');
                    get().adminLogout();
                    return false;
                }
                
                return true;
            },

            hasSpecificPermission: (role: AdminRole, permission: string) => {
                // Normalize role to uppercase
                const normalizedRole = role.toUpperCase() as AdminRole;
                const permissions = ADMIN_PERMISSIONS[normalizedRole];
                if (!permissions) return false;
                
                return permissions[permission as keyof typeof permissions] === true;
            }
        }),
        {
            name: 'fresh-admin-storage',
            partialize: (state) => ({
                adminUser: state.adminUser,
                isAdminAuthenticated: state.isAdminAuthenticated,
                sessionTimeout: state.sessionTimeout,
                lastActivity: state.lastActivity,
            }),
        }
    )
);