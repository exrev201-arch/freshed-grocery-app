import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AdminController {
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      // Get basic dashboard statistics
      const [totalProducts, totalUsers, totalOrders] = await Promise.all([
        prisma.product.count(),
        prisma.user.count(),
        prisma.order.count()
      ]);

      const stats = {
        totalProducts,
        totalUsers,
        totalOrders,
        activeProducts: await prisma.product.count({ where: { isActive: true } }),
        lowStockProducts: await prisma.product.count({ where: { stockQuantity: { lt: 10 } } }),
        outOfStockProducts: await prisma.product.count({ where: { stockQuantity: 0 } })
      };

      logger.info('Dashboard stats retrieved', 'ADMIN', { stats });

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      logger.error('Error getting dashboard stats', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard stats',
        message: error.message
      });
    }
  }

  async getAdminUsers(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Admin user management will be implemented when needed'
      });
    } catch (error: any) {
      logger.error('Error getting admin users', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get admin users',
        message: error.message
      });
    }
  }

  async createAdminUser(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Admin user creation will be implemented when needed'
      });
    } catch (error: any) {
      logger.error('Error creating admin user', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create admin user',
        message: error.message
      });
    }
  }

  async updateAdminUser(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Admin user update will be implemented when needed'
      });
    } catch (error: any) {
      logger.error('Error updating admin user', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update admin user',
        message: error.message
      });
    }
  }

  async deleteAdminUser(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Admin user deletion will be implemented when needed'
      });
    } catch (error: any) {
      logger.error('Error deleting admin user', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to delete admin user',
        message: error.message
      });
    }
  }

  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Order management will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error getting all orders', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get all orders',
        message: error.message
      });
    }
  }

  async getOrderStats(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Order statistics will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error getting order stats', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get order stats',
        message: error.message
      });
    }
  }

  async getProductStats(req: AuthRequest, res: Response) {
    try {
      const [totalProducts, activeProducts, categories] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.findMany({
          select: { category: true },
          distinct: ['category']
        })
      ]);

      const lowStockProducts = await prisma.product.count({
        where: { stockQuantity: { lt: 10 } }
      });

      const outOfStockProducts = await prisma.product.count({
        where: { stockQuantity: 0 }
      });

      const stats = {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        totalCategories: categories.length,
        lowStockProducts,
        outOfStockProducts,
        categories: categories.map(c => c.category)
      };

      logger.info('Product stats retrieved', 'ADMIN', { stats });

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      logger.error('Error getting product stats', 'ADMIN', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get product stats',
        message: error.message
      });
    }
  }
}