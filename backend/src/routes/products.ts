import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation middleware
const productValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be 2-200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category must be 2-50 characters'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('unit').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Unit must be 1-20 characters'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
  body('sku').optional().trim().isLength({ min: 1, max: 50 }).withMessage('SKU must be 1-50 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  validateRequest
];

const updateProductValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim().isLength({ min: 2, max: 50 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('unit').optional().trim().isLength({ min: 1, max: 20 }),
  body('imageUrl').optional().isURL(),
  body('sku').optional().trim().isLength({ min: 1, max: 50 }),
  body('tags').optional().isArray(),
  body('isActive').optional().isBoolean(),
  validateRequest
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim().isLength({ min: 1 }),
  query('search').optional().trim().isLength({ min: 1 }),
  query('inStock').optional().isBoolean(),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'stockQuantity']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  validateRequest
];

// GET /api/products - Get all products with filtering and pagination
router.get('/', queryValidation, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } }
      ];
    }
    
    if (inStock !== undefined) {
      where.stockQuantity = inStock === 'true' ? { gt: 0 } : { lte: 0 };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          _count: {
            select: {
              orderItems: true,
              favorites: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = Number(page) < totalPages;
    const hasPreviousPage = Number(page) > 1;

    logger.info(`Retrieved ${products.length} products`, 'PRODUCTS', {
      page,
      limit,
      totalCount,
      filters: { category, search, inStock }
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: take,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error: any) {
    logger.error('Error fetching products', 'PRODUCTS', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET /api/products/categories - Get all unique categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.product.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      where: {
        isActive: true
      }
    });

    const categoryList = categories.map(c => c.category).sort();

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error: any) {
    logger.error('Error fetching categories', 'PRODUCTS', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { gt: 0 }
      },
      orderBy: [
        { orderItems: { _count: 'desc' } }, // Most ordered
        { createdAt: 'desc' }
      ],
      take: 6,
      include: {
        _count: {
          select: {
            orderItems: true,
            favorites: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: featuredProducts
    });
  } catch (error: any) {
    logger.error('Error fetching featured products', 'PRODUCTS', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products',
      message: error.message
    });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', param('id').isLength({ min: 1 }), validateRequest, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            favorites: true
          }
        },
        inventoryLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            type: true,
            quantity: true,
            reason: true,
            createdAt: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    return res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    logger.error('Error fetching product', 'PRODUCTS', { 
      error: error.message, 
      productId: req.params.id 
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', productValidation, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stockQuantity = 0,
      unit = 'pc',
      imageUrl,
      sku,
      tags = []
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku }
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'Product with this SKU already exists'
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        stockQuantity,
        unit,
        imageUrl,
        sku,
        tags
      }
    });

    // Log inventory addition
    if (stockQuantity > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          type: 'addition',
          quantity: stockQuantity,
          reason: 'Initial stock',
          createdBy: req.user?.id || 'system'
        }
      });
    }

    logger.info('Product created', 'PRODUCTS', { 
      productId: product.id, 
      name: product.name 
    });

    return res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    logger.error('Error creating product', 'PRODUCTS', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', param('id').isLength({ min: 1 }), updateProductValidation, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check SKU uniqueness if being updated
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      });

      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          error: 'Product with this SKU already exists'
        });
      }
    }

    // Handle stock quantity changes
    if (updateData.stockQuantity !== undefined && updateData.stockQuantity !== existingProduct.stockQuantity) {
      const difference = updateData.stockQuantity - existingProduct.stockQuantity;
      
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          type: difference > 0 ? 'addition' : 'deduction',
          quantity: Math.abs(difference),
          reason: 'Stock adjustment',
          createdBy: req.user?.id || 'system'
        }
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    logger.info('Product updated', 'PRODUCTS', { 
      productId: product.id, 
      name: product.name 
    });

    return res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    logger.error('Error updating product', 'PRODUCTS', { 
      error: error.message,
      productId: req.params.id
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', param('id').isLength({ min: 1 }), validateRequest, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if product has associated orders
    if (existingProduct.orderItems.length > 0) {
      // Soft delete - just mark as inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info('Product soft deleted (has orders)', 'PRODUCTS', { 
        productId: id, 
        name: existingProduct.name 
      });

      return res.json({
        success: true,
        message: 'Product deactivated successfully (has existing orders)'
      });
    }

    // Hard delete if no orders
    await prisma.product.delete({
      where: { id }
    });

    logger.info('Product deleted', 'PRODUCTS', { 
      productId: id, 
      name: existingProduct.name 
    });

    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    logger.error('Error deleting product', 'PRODUCTS', { 
      error: error.message,
      productId: req.params.id
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

// POST /api/products/:id/stock - Update stock quantity
router.post('/:id/stock', [
  param('id').isLength({ min: 1 }),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('type').isIn(['addition', 'deduction', 'adjustment']).withMessage('Invalid stock operation type'),
  body('reason').optional().trim().isLength({ min: 1, max: 200 }),
  validateRequest
], async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason } = req.body;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    let newStockQuantity;
    switch (type) {
      case 'addition':
        newStockQuantity = product.stockQuantity + quantity;
        break;
      case 'deduction':
        newStockQuantity = Math.max(0, product.stockQuantity - quantity);
        break;
      case 'adjustment':
        newStockQuantity = quantity;
        break;
    }

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stockQuantity: newStockQuantity }
    });

    // Log the inventory change
    await prisma.inventoryLog.create({
      data: {
        productId: id,
        type,
        quantity,
        reason: reason || `Stock ${type}`,
        createdBy: req.user?.id || 'system'
      }
    });

    logger.info('Product stock updated', 'PRODUCTS', { 
      productId: id,
      type,
      quantity,
      newStock: newStockQuantity
    });

    return res.json({
      success: true,
      data: updatedProduct,
      message: `Stock ${type} completed successfully`
    });
  } catch (error: any) {
    logger.error('Error updating stock', 'PRODUCTS', { 
      error: error.message,
      productId: req.params.id
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to update stock',
      message: error.message
    });
  }
});

export default router;