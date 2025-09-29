import { Plus, ShoppingCart, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product, useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useToast } from '@/hooks/use-toast'
import { UserService } from '@/lib/user-service'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProductCardProps {
    product: Product
}

function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore(state => state.addItem)
    const { isAuthenticated, user } = useAuthStore()
    const { toast } = useToast()
    const [isFavorited, setIsFavorited] = useState(false)
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
    const { t } = useLanguage()

    // Check if product is favorited when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            UserService.isProductFavorited(user.uid, product.id)
                .then(setIsFavorited)
                .catch(() => setIsFavorited(false))
        } else {
            setIsFavorited(false)
        }
    }, [isAuthenticated, user, product.id])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(price)
    }

    const handleAddToCart = () => {
        addItem(product)
        toast({
            title: t('addedToCart'),
            description: `${product.name} ${t('addedToCartDescription')}`,
            duration: 2000,
        })
    }

    const handleToggleFavorite = async () => {
        if (!isAuthenticated || !user) {
            toast({
                title: t('loginRequired'),
                description: t('loginToAddToFavorites'),
                variant: "destructive",
            })
            return
        }

        setIsTogglingFavorite(true)

        try {
            if (isFavorited) {
                // Remove from favorites
                const favorite = await UserService.getFavoriteByProductId(user.uid, product.id)
                if (favorite) {
                    await UserService.removeFromFavorites(user.uid, favorite._id)
                    setIsFavorited(false)
                    toast({
                        title: t('removedFromFavorites'),
                        description: `${product.name} ${t('removedFromFavoritesDescription')}`,
                    })
                }
            } else {
                // Add to favorites
                await UserService.addToFavorites({
                    product_id: product.id,
                    product_name: product.name,
                    product_price: product.price,
                    product_category: product.category,
                })
                setIsFavorited(true)
                toast({
                    title: t('addedToFavorites'),
                    description: `${product.name} ${t('addedToFavoritesDescription')}`,
                })
            }
        } catch (error) {
            toast({
                title: t('error'),
                description: t('failedToUpdateFavorites'),
                variant: "destructive",
            })
        } finally {
            setIsTogglingFavorite(false)
        }
    }

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
            <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-muted overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                </div>
            </Link>

            <CardContent className="p-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between">
                        <Link to={`/product/${product.id}`} className="flex-1">
                            <h3 className="font-medium leading-tight hover:text-primary transition-colors">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleToggleFavorite}
                                disabled={isTogglingFavorite}
                                className={`p-1 rounded-full transition-all duration-200 ${isFavorited
                                        ? 'text-red-500 hover:text-red-600'
                                        : 'text-gray-400 hover:text-red-500'
                                    } ${isTogglingFavorite ? 'opacity-50' : ''}`}
                            >
                                <Heart
                                    className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`}
                                />
                            </button>
                            {product.inStock ? (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-800">
                                    {t('inStock')}
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                    {t('outOfStock')}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{product.unit}</p>

                    {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                        </span>

                        <Button
                            size="sm"
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className="gap-1"
                        >
                            <Plus className="h-3 w-3" />
                            {t('addToCart')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProductCard