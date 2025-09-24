import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Heart, Share2, Star, Truck, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import ProductCard from '@/components/products/ProductCard';
import { Product, useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/lib/user-service';
import { mockProducts } from '@/lib/mock-data';
import { Toaster } from '@/components/ui/toaster';
import CustomerSupport from '@/components/support/CustomerSupport';

function ProductPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { addItem, updateQuantity, items } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();
    const { toast } = useToast();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock product images array (in real app, these would come from product data)
    const productImages = [
        product?.image || '',
        product?.image || '',
        product?.image || '',
    ];

    useEffect(() => {
        if (productId) {
            // Find product by ID (in real app, this would be an API call)
            const foundProduct = mockProducts.find(p => p.id === productId);
            if (foundProduct) {
                setProduct(foundProduct);
                // Get related products from same category
                const related = mockProducts
                    .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
                    .slice(0, 4);
                setRelatedProducts(related);
            }
            setLoading(false);
        }
    }, [productId]);

    // Check if product is favorited
    useEffect(() => {
        if (isAuthenticated && user && product) {
            UserService.isProductFavorited(user.uid, product.id)
                .then(setIsFavorited)
                .catch(() => setIsFavorited(false));
        }
    }, [isAuthenticated, user, product]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleAddToCart = () => {
        if (!product) return;
        
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
        
        toast({
            title: "Added to cart!",
            description: `${quantity} x ${product.name} added to your cart.`,
            duration: 2000,
        });
    };

    const handleToggleFavorite = async () => {
        if (!product || !isAuthenticated || !user) {
            toast({
                title: "Login Required",
                description: "Please log in to save favorites.",
                variant: "destructive",
            });
            return;
        }

        setIsTogglingFavorite(true);

        try {
            if (isFavorited) {
                const favorite = await UserService.getFavoriteByProductId(user.uid, product.id);
                if (favorite) {
                    await UserService.removeFromFavorites(user.uid, favorite._id);
                    setIsFavorited(false);
                    toast({
                        title: "Removed from favorites",
                        description: `${product.name} has been removed from your favorites.`,
                    });
                }
            } else {
                await UserService.addToFavorites({
                    product_id: product.id,
                    product_name: product.name,
                    product_price: product.price,
                    product_category: product.category,
                });
                setIsFavorited(true);
                toast({
                    title: "Added to favorites!",
                    description: `${product.name} has been added to your favorites.`,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update favorites. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share && product) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out this fresh ${product.name} on Fresh Grocery!`,
                    url: window.location.href,
                });
            } catch (error) {
                // Fallback to copying URL
                navigator.clipboard.writeText(window.location.href);
                toast({
                    title: "Link copied!",
                    description: "Product link copied to clipboard.",
                });
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied!",
                description: "Product link copied to clipboard.",
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                        <Button onClick={() => navigate('/')}>Return to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="p-0 h-auto text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Products
                    </Button>
                    <span>/</span>
                    <span className="capitalize">{product.category}</span>
                    <span>/</span>
                    <span className="text-foreground">{product.name}</span>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
                            <img
                                src={productImages[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {productImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                                        selectedImage === index ? 'border-primary' : 'border-transparent'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <Badge variant="secondary" className="mb-2 capitalize">
                                    {product.category}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleToggleFavorite}
                                        disabled={isTogglingFavorite}
                                        className={isFavorited ? 'text-red-500' : 'text-gray-400'}
                                    >
                                        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">(25 reviews)</span>
                            </div>

                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-3xl font-bold text-primary">
                                    {formatPrice(product.price)}
                                </span>
                                <span className="text-sm text-muted-foreground">per {product.unit}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                {product.inStock ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        ✓ In Stock
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        Out of Stock
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Quantity Selector & Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Quantity:</span>
                                <div className="flex items-center border rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-10 w-10"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="h-10 w-10"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                                className="w-full"
                            >
                                Add to Cart - {formatPrice(product.price * quantity)}
                            </Button>
                        </div>

                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <Truck className="h-4 w-4 text-primary" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>30min Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-primary" />
                                <span>Quality Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <Tabs defaultValue="description" className="mb-12">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="description" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-3">About this product</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {product.description || `Fresh and high-quality ${product.name} sourced directly from local farms. Perfect for your daily cooking needs with guaranteed freshness and taste.`}
                                </p>
                                <Separator className="my-4" />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Category:</span>
                                        <span className="ml-2 capitalize">{product.category}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Unit:</span>
                                        <span className="ml-2">{product.unit}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Origin:</span>
                                        <span className="ml-2">Local Farms, Tanzania</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Freshness:</span>
                                        <span className="ml-2">Harvested Daily</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="nutrition" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-3">Nutritional Information</h3>
                                <p className="text-muted-foreground mb-4">Per 100g serving</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span>Calories</span>
                                        <span className="font-medium">25 kcal</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Protein</span>
                                        <span className="font-medium">2g</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Carbohydrates</span>
                                        <span className="font-medium">5g</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Fiber</span>
                                        <span className="font-medium">3g</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Fat</span>
                                        <span className="font-medium">0.2g</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vitamin C</span>
                                        <span className="font-medium">15mg</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                                    <Button variant="outline" size="sm">Write Review</Button>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((review) => (
                                        <div key={review} className="border-b pb-4 last:border-b-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-sm">John D.</span>
                                                <span className="text-xs text-muted-foreground">2 days ago</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Great quality and very fresh. Delivered quickly and packaging was excellent.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Toaster />
            <CustomerSupport />
        </div>
    );
}

export default ProductPage;