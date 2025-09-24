import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart-store'

function CartSheet() {
    const navigate = useNavigate()
    const { items, isOpen, toggleCart, closeCart, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore()

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(price)
    }

    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Kikapu Chako ({getTotalItems()} bidhaa)
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto py-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Kikapu tupu</h3>
                                <p className="text-muted-foreground">Ongeza bidhaa ili kuanza kununua!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">{item.unit}</p>
                                            <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Jumla:</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatPrice(getTotalPrice())}
                                </span>
                            </div>

                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                size="lg"
                                onClick={() => {
                                    closeCart()
                                    navigate('/checkout')
                                }}
                            >
                                Maliza Ununuzi
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default CartSheet