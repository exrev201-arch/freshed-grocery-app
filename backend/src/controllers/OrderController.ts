import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class OrderController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Extract order and payment data from request body
      const { items, totalAmount, paymentMethod, deliveryAddress, deliveryPhone, deliveryDate, deliveryTime, ...rest } = req.body;

      // 1. Create order in DB (simplified, add more fields as needed)
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          paymentMethod,
          deliveryAddress,
          deliveryPhone,
          deliveryDate,
          deliveryTime,
          status: 'pending',
          paymentStatus: 'pending',
          ...rest,
        },
      });

      // 2. Create order items in DB (optional, for completeness)
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
            },
          });
        }
      }

      // 3. Initiate ClickPesa payment (call backend service)
      const { initiateClickPesaPayment } = await import('../services/clickpesaService');
      const clickpesaResponse = await initiateClickPesaPayment({
        orderId: order.id,
        amount: totalAmount,
        phone: deliveryPhone,
        // Add more fields as required by ClickPesa API
        ...rest,
      });

      // 4. Return ClickPesa checkout URL to frontend
      res.status(200).json({
        success: true,
        orderId: order.id,
        checkoutUrl: clickpesaResponse?.checkout_url || clickpesaResponse?.url,
        clickpesa: clickpesaResponse,
      });
    } catch (error: any) {
      logger.error('Error creating order', 'ORDER', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        message: error.message,
      });
    }
  }

  async getUserOrders(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'User orders retrieval will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error getting user orders', 'ORDER', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get user orders',
        message: error.message
      });
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Order retrieval by ID will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error getting order by ID', 'ORDER', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get order',
        message: error.message
      });
    }
  }

  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Admin order retrieval will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error getting all orders', 'ORDER', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get all orders',
        message: error.message
      });
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Order status update will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error updating order status', 'ORDER', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        message: error.message
      });
    }
  }

  async assignDeliveryPerson(req: AuthRequest, res: Response) {
    try {
      res.status(501).json({
        success: false,
        error: 'Not implemented yet',
        message: 'Delivery person assignment will be implemented when frontend is connected'
      });
    } catch (error: any) {
      logger.error('Error assigning delivery person', 'ORDER', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to assign delivery person',
        message: error.message
      });
    }
  }
}