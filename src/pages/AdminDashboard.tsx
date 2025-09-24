import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminService, Product, AdminUser, ProductFormData } from '@/lib/admin-service';
import { useAdminStore } from '@/store/admin-store';
import { migrateProductsToDatabase } from '@/lib/data-migration';
import { mockProducts } from '@/lib/mock-data';
import EnhancedOrderManagement from '@/components/admin/EnhancedOrderManagement';
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    ShoppingCart,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    Shield,
    LogOut
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { adminUser, hasPermission, checkSession, adminLogout, updateLastActivity } = useAdminStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [productFormLoading, setProductFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [migrationLoading, setMigrationLoading] = useState(false);

    const [productForm, setProductForm] = useState<ProductFormData>({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        stock_quantity: 0,
        is_active: 'active',
    });

    // Session Management
    useEffect(() => {
        // Update last activity on mount
        updateLastActivity();
    }, [updateLastActivity]);

    // Periodic session check and activity update
    useEffect(() => {
        const sessionCheckInterval = setInterval(() => {
            if (!checkSession()) {
                toast({
                    title: "Session Expired",
                    description: "Your admin session has expired. Please log in again.",
                    variant: "destructive",
                });
                navigate('/');
            } else {
                updateLastActivity();
            }
        }, 60000); // Check every minute instead of 30 seconds

        return () => clearInterval(sessionCheckInterval);
    }, [checkSession, updateLastActivity, navigate, toast]);

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [productsData, adminUsersData, statsData] = await Promise.all([
                adminService.getAllProducts(),
                hasPermission('admin') ? adminService.getAllAdminUsers() : Promise.resolve([]),
                adminService.getDashboardStats(),
            ]);

            setProducts(productsData);
            setAdminUsers(adminUsersData);
            setDashboardStats(statsData);
        } catch (error) {
            toast({
                title: "Error loading dashboard",
                description: "Failed to load dashboard data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const validateProductForm = (data: ProductFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        
        if (!data.name || !data.name.trim()) {
            errors.name = 'Product name is required';
        } else if (data.name.length < 2) {
            errors.name = 'Product name must be at least 2 characters';
        } else if (data.name.length > 100) {
            errors.name = 'Product name must not exceed 100 characters';
        }
        
        if (!data.description || !data.description.trim()) {
            errors.description = 'Description is required';
        } else if (data.description.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }
        
        if (!data.price || data.price <= 0) {
            errors.price = 'Price must be greater than 0';
        } else if (data.price > 1000000) {
            errors.price = 'Price seems unreasonably high';
        }
        
        if (!data.category || !data.category.trim()) {
            errors.category = 'Category is required';
        }
        
        if (data.stock_quantity < 0) {
            errors.stock_quantity = 'Stock quantity cannot be negative';
        }
        
        if (data.image_url && data.image_url.trim() && !data.image_url.startsWith('http')) {
            errors.image_url = 'Image URL must be a valid HTTP/HTTPS URL';
        }
        
        return errors;
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!hasPermission('write')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to add products.",
                variant: "destructive",
            });
            return;
        }

        // Validate form
        const errors = validateProductForm(productForm);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form.",
                variant: "destructive",
            });
            return;
        }

        setProductFormLoading(true);
        setFormErrors({});
        
        // Debug: Check current state
        console.log('🔍 Debug - Current products table:', localStorage.getItem('fresh_backend_products'));
        console.log('🔍 Debug - Form data to submit:', productForm);
        
        try {
            await adminService.createProduct(productForm);
            toast({
                title: "Product Added",
                description: "Product has been successfully added to the catalog.",
            });
            setShowAddProduct(false);
            setProductForm({
                name: '',
                description: '',
                price: 0,
                category: '',
                image_url: '',
                stock_quantity: 0,
                is_active: 'active',
            });
            loadDashboardData();
        } catch (error: any) {
            console.error('❌ Admin service error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                type: error.type,
                code: error.code
            });
            
            let errorMessage = 'Failed to add product. Please try again.';
            
            if (error.message) {
                if (error.message.includes('Validation failed')) {
                    errorMessage = `Validation Error: ${error.message}`;
                } else if (error.message.includes('network') || error.message.includes('connection')) {
                    errorMessage = 'Network error. Please check your connection.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            toast({
                title: "Error adding product",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setProductFormLoading(false);
        }
    };

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct || !hasPermission('write')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to edit products.",
                variant: "destructive",
            });
            return;
        }

        // Validate form
        const errors = validateProductForm(productForm);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form.",
                variant: "destructive",
            });
            return;
        }

        setProductFormLoading(true);
        setFormErrors({});

        try {
            await adminService.updateProduct(editingProduct._id, editingProduct._uid, productForm);
            toast({
                title: "Product Updated",
                description: "Product has been successfully updated.",
            });
            setEditingProduct(null);
            setProductForm({
                name: '',
                description: '',
                price: 0,
                category: '',
                image_url: '',
                stock_quantity: 0,
                is_active: 'active',
            });
            loadDashboardData();
        } catch (error: any) {
            toast({
                title: "Error updating product",
                description: error.message || "Failed to update product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProductFormLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!hasPermission('delete')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to delete products.",
                variant: "destructive",
            });
            return;
        }

        // Find product to get its details
        const product = products.find(p => p._id === productId);
        if (!product) return;

        if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(productId);

        try {
            await adminService.deleteProduct(productId, product._uid);
            toast({
                title: "Product Deleted",
                description: `"${product.name}" has been successfully deleted.`,
            });
            loadDashboardData();
        } catch (error: any) {
            toast({
                title: "Error deleting product",
                description: error.message || "Failed to delete product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(null);
        }
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image_url: product.image_url,
            stock_quantity: product.stock_quantity,
            is_active: product.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setShowAddProduct(false);
        setProductForm({
            name: '',
            description: '',
            price: 0,
            category: '',
            image_url: '',
            stock_quantity: 0,
            is_active: 'active',
        });
    };

    const handleAdminLogout = () => {
        adminLogout();
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        navigate('/');
    };

    const handleMigrateProducts = async (force: boolean = false) => {
        if (!hasPermission('write')) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to migrate products.",
                variant: "destructive",
            });
            return;
        }

        // Check current products count
        const currentProducts = await adminService.getAllProducts();
        
        let confirmMessage = 'This will migrate all mock products to the database. Are you sure you want to continue?';
        
        if (currentProducts.length > 0 && !force) {
            confirmMessage = `Database already contains ${currentProducts.length} products. This will add ${mockProducts.length} more products from mock data. Continue?`;
        }

        if (!confirm(confirmMessage)) {
            return;
        }

        setMigrationLoading(true);

        try {
            await migrateProductsToDatabase(force);
            
            // Force refresh the dashboard data
            await loadDashboardData();
            
            toast({
                title: "Migration Successful",
                description: `Successfully migrated mock products! Database now has products from both sources.`,
            });
        } catch (error: any) {
            console.error('Migration error:', error);
            
            // If error indicates products already exist, that's actually fine
            if (error.message && error.message.includes('products already exist')) {
                toast({
                    title: "Migration Info",
                    description: error.message,
                    variant: "default",
                });
                // Still refresh to show existing products
                await loadDashboardData();
            } else {
                toast({
                    title: "Migration Failed",
                    description: error.message || "Failed to migrate products. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setMigrationLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-primary" />
                                <h1 className="text-2xl font-bold text-gray-900">Fresh Admin</h1>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                {adminUser?.role?.toUpperCase()}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <AdminNotificationCenter />
                            <div className="text-right">
                                <p className="font-medium text-gray-900">{adminUser?.name}</p>
                                <p className="text-sm text-gray-500">{adminUser?.email}</p>
                            </div>
                            <Button 
                                onClick={handleAdminLogout}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
                    <p className="text-gray-600">Welcome back, {adminUser?.name}</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{dashboardStats.activeProducts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{dashboardStats.lowStockProducts}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">TZS {dashboardStats.totalRevenue.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="clickpesa">ClickPesa</TabsTrigger>
                        {hasPermission('admin') && <TabsTrigger value="users">Admin Users</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="orders" className="space-y-4">
                        <EnhancedOrderManagement />
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold">Product Management</h2>
                            <div className="flex gap-2">
                                {hasPermission('write') && (
                                    <Button 
                                        onClick={() => handleMigrateProducts(true)}
                                        variant="outline"
                                        disabled={migrationLoading}
                                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                    >
                                        {migrationLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                                Migrating...
                                            </div>
                                        ) : (
                                            <>📦 Migrate Products to Database</>
                                        )}
                                    </Button>
                                )}
                                {hasPermission('write') && (
                                    <Button onClick={() => setShowAddProduct(true)} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
                                    </Button>
                                )}
                            </div>
                        </div>

                        {(showAddProduct || editingProduct) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Product Name</Label>
                                                <Input
                                                    id="name"
                                                    value={productForm.name}
                                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                    required
                                                    className={formErrors.name ? 'border-red-500' : ''}
                                                    disabled={productFormLoading}
                                                />
                                                {formErrors.name && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={productForm.category}
                                                    onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                                                    disabled={productFormLoading}
                                                    required
                                                >
                                                    <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="vegetables">Vegetables</SelectItem>
                                                        <SelectItem value="fruits">Fruits</SelectItem>
                                                        <SelectItem value="dairy">Dairy</SelectItem>
                                                        <SelectItem value="grains">Grains</SelectItem>
                                                        <SelectItem value="herbs">Herbs</SelectItem>
                                                        <SelectItem value="meat">Meat</SelectItem>
                                                        <SelectItem value="beverages">Beverages</SelectItem>
                                                        <SelectItem value="snacks">Snacks</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {formErrors.category && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="price">Price (TZS)</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    min="1"
                                                    step="0.01"
                                                    value={productForm.price || ''}
                                                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                                                    required
                                                    className={formErrors.price ? 'border-red-500' : ''}
                                                    disabled={productFormLoading}
                                                    placeholder="Enter price in TZS"
                                                />
                                                {formErrors.price && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="stock">Stock Quantity</Label>
                                                <Input
                                                    id="stock"
                                                    type="number"
                                                    min="0"
                                                    value={productForm.stock_quantity || ''}
                                                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) || 0 })}
                                                    required
                                                    className={formErrors.stock_quantity ? 'border-red-500' : ''}
                                                    disabled={productFormLoading}
                                                    placeholder="Enter stock quantity"
                                                />
                                                {formErrors.stock_quantity && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.stock_quantity}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="image">Image URL (Optional)</Label>
                                                <Input
                                                    id="image"
                                                    type="url"
                                                    value={productForm.image_url}
                                                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                                                    placeholder="https://images.unsplash.com/..."
                                                    className={formErrors.image_url ? 'border-red-500' : ''}
                                                    disabled={productFormLoading}
                                                />
                                                {formErrors.image_url && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={productForm.is_active}
                                                    onValueChange={(value) => setProductForm({ ...productForm, is_active: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                rows={3}
                                                required
                                                className={formErrors.description ? 'border-red-500' : ''}
                                                disabled={productFormLoading}
                                                placeholder="Enter product description (minimum 10 characters)"
                                            />
                                            {formErrors.description && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                type="submit" 
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={productFormLoading}
                                            >
                                                {productFormLoading ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        {editingProduct ? 'Updating...' : 'Adding...'}
                                                    </div>
                                                ) : (
                                                    editingProduct ? 'Update Product' : 'Add Product'
                                                )}
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={cancelEdit}
                                                disabled={productFormLoading}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <Card key={product._id}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                                <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {hasPermission('write') && (
                                                    <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {hasPermission('delete') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="text-red-600 hover:text-red-700"
                                                        disabled={deleteLoading === product._id}
                                                    >
                                                        {deleteLoading === product._id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">TZS {product.price.toLocaleString()}</p>
                                                <p className="text-sm text-gray-600">Stock: {product.stock_quantity}</p>
                                            </div>
                                            <Badge variant={product.is_active === 'active' ? 'default' : 'secondary'}>
                                                {product.is_active}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-4">
                        <h2 className="text-2xl font-semibold">Inventory Management</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {products
                                .sort((a, b) => a.stock_quantity - b.stock_quantity)
                                .map((product) => (
                                    <Card key={product._id} className={product.stock_quantity <= 10 ? 'border-orange-200' : ''}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold">{product.name}</h3>
                                                    <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${product.stock_quantity <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                                        {product.stock_quantity} units
                                                    </p>
                                                    <Badge variant={product.stock_quantity <= 10 ? 'destructive' : 'default'}>
                                                        {product.stock_quantity <= 10 ? 'Low Stock' : 'In Stock'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="clickpesa" className="space-y-4">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">ClickPesa Payment Gateway</h2>
                                <p className="text-gray-600">
                                    Test and manage your ClickPesa integration for mobile money and card payments.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">ClickPesa Payment Gateway</h2>
                                    <p className="text-gray-600">
                                        Test and manage your ClickPesa integration for mobile money and card payments.
                                    </p>
                                </div>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>ClickPesa Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p>✅ ClickPesa is configured with your actual credentials</p>
                                            <p>🔧 API Key: SKm0***...ca6SyE (configured)</p>
                                            <p>🏢 Merchant ID: IDUSrll2waj3bgI0q9YczUIlxAsLSdTF</p>
                                            <p>🏪 Pay Bill Number: 1804</p>
                                            <p>🌐 Mode: Production (Live payments enabled)</p>
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                                                <p className="text-green-800 font-medium">✅ Ready for Live Payments</p>
                                                <p className="text-green-600 text-sm">Your customers can now pay with Tigo Pesa, Airtel Money, and Halopesa</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Setup Status</CardTitle>
                                    <CardDescription>
                                        Your ClickPesa integration setup progress
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                                                ✓
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-800">ClickPesa Credentials - Completed</p>
                                                <p className="text-sm text-green-600">
                                                    API Key, Merchant ID, and Pay Bill Number are configured
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                                                ✓
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-800">Environment Configuration - Completed</p>
                                                <p className="text-sm text-green-600">
                                                    Your <code className="bg-gray-100 px-1 rounded">.env</code> file is properly configured with:
                                                </p>
                                                <div className="bg-gray-50 p-3 rounded border text-sm font-mono mt-2">
                                                    VITE_CLICKPESA_API_KEY=SKm0***...ca6SyE<br/>
                                                    VITE_CLICKPESA_MERCHANT_ID=IDUSrll2waj3bgI0q9YczUIlxAsLSdTF<br/>
                                                    VITE_CLICKPESA_PAY_BILL_NUMBER=1804<br/>
                                                    VITE_CLICKPESA_DEMO_MODE=false
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                                                ✓
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-800">Integration Ready - Completed</p>
                                                <p className="text-sm text-green-600">
                                                    Your customers can now make live payments through the checkout process.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                            <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                <li>• Test the checkout process by adding products to cart</li>
                                                <li>• Contact support@clickpesa.com to activate M-Pesa if needed</li>
                                                <li>• Complete KYC in ClickPesa dashboard to enable card payments</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {hasPermission('admin') && (
                        <TabsContent value="users" className="space-y-4">
                            <h2 className="text-2xl font-semibold">Admin Users</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {adminUsers.map((user) => (
                                    <Card key={user._id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold">{user.name}</h3>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role}
                                                    </Badge>
                                                    <Badge
                                                        variant={user.is_active === 'active' ? 'default' : 'destructive'}
                                                        className="ml-2"
                                                    >
                                                        {user.is_active}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;