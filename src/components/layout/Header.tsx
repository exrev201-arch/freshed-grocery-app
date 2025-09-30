import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, User, Search, Menu, X, Shield, Package, Home, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useAdminStore } from '@/store/admin-store'
import { LoginModal } from '@/components/auth/LoginModal'
import { UserProfile } from '@/components/auth/UserProfile'
import CartSheet from '@/components/cart/CartSheet'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mockProducts } from '@/lib/mock-data'
import { adminService } from '@/lib/admin-service'
import { LanguageSwitcher, MobileLanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'

function Header() {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showUserProfile, setShowUserProfile] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileSearchQuery, setMobileSearchQuery] = useState('')
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
    const [showMobileSuggestions, setShowMobileSuggestions] = useState(false)
    const [availableProducts, setAvailableProducts] = useState<any[]>([])
    const searchRef = useRef<HTMLDivElement>(null)
    const mobileSearchRef = useRef<HTMLDivElement>(null)
    const { getTotalItems, toggleCart } = useCartStore()
    const { isAuthenticated, user } = useAuthStore()
    const { isAdminAuthenticated } = useAdminStore()
    const { language, t } = useLanguage()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        console.log('Header: Language changed to', language)
    }, [language])

    // Load available products for suggestions
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await adminService.getActiveProducts()
                if (products.length > 0) {
                    setAvailableProducts(products)
                } else {
                    setAvailableProducts(mockProducts)
                }
            } catch (error) {
                setAvailableProducts(mockProducts)
            }
        }
        loadProducts()
    }, [])

    // Extract product names for intelligent suggestions
    const getProductSuggestions = (query: string) => {
        if (!query) return []
        
        const queryLower = query.toLowerCase()
        const suggestions = new Set<string>()
        
        availableProducts.forEach(product => {
            const name = product.name.toLowerCase()
            const words = name.split(' ')
            
            // Add products that start with the query
            if (name.startsWith(queryLower)) {
                suggestions.add(product.name)
            }
            
            // Add products where any word starts with the query
            words.forEach(word => {
                if (word.startsWith(queryLower)) {
                    suggestions.add(product.name)
                }
            })
            
            // Add products that contain the query
            if (name.includes(queryLower) && suggestions.size < 10) {
                suggestions.add(product.name)
            }
        })
        
        return Array.from(suggestions).slice(0, 8)
    }

    // Popular search terms
    const popularSearches = [t('categoryVegetables'), t('categoryFruits'), t('categoryDairy'), t('categoryMeat'), t('categoryBeverages'), t('categorySnacks')]

    // Get search history from localStorage
    const getSearchHistory = () => {
        return JSON.parse(localStorage.getItem('fresh_search_history') || '[]')
    }

    // Handle clicks outside search dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchSuggestions(false)
            }
            if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
                setShowMobileSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Determine navigation based on current page
    const isOnProductsPage = location.pathname === '/products'
    const navItem = isOnProductsPage 
        ? { to: '/', text: t('home'), icon: Home }
        : { to: '/products', text: t('products'), icon: Package }

    // Handle search functionality
    const handleSearch = (query: string) => {
        if (query.trim()) {
            // Save to search history
            const searchHistory = JSON.parse(localStorage.getItem('fresh_search_history') || '[]')
            const newHistory = [query.trim(), ...searchHistory.filter((item: string) => item !== query.trim())].slice(0, 10)
            localStorage.setItem('fresh_search_history', JSON.stringify(newHistory))
            
            // Navigate to products page with search query
            navigate(`/products?search=${encodeURIComponent(query.trim())}`)
            
            // Clear search inputs and hide suggestions
            setSearchQuery('')
            setMobileSearchQuery('')
            setShowSearchSuggestions(false)
            setShowMobileSuggestions(false)
            setMobileMenuOpen(false)
        }
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        handleSearch(suggestion)
    }

    // Handle search input changes
    const handleSearchInputChange = (value: string, isMobile: boolean = false) => {
        if (isMobile) {
            setMobileSearchQuery(value)
            setShowMobileSuggestions(value.length > 0)
        } else {
            setSearchQuery(value)
            setShowSearchSuggestions(value.length > 0)
        }
    }

    // Handle input focus
    const handleSearchFocus = (isMobile: boolean = false) => {
        if (isMobile) {
            setShowMobileSuggestions(true)
        } else {
            setShowSearchSuggestions(true)
        }
    }

    // Filter suggestions based on input
    const getFilteredSuggestions = (query: string) => {
        const history = getSearchHistory()
        const productSuggestions = getProductSuggestions(query)
        
        if (!query) {
            // When no query, show recent history and popular searches
            return {
                history: history.slice(0, 5),
                popular: popularSearches.slice(0, 4),
                products: []
            }
        }
        
        // Filter history based on query
        const filteredHistory = history.filter((item: string) => 
            item.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3)
        
        // Filter popular searches based on query
        const filteredPopular = popularSearches.filter((item: string) => 
            item.toLowerCase().includes(query.toLowerCase()) && 
            !filteredHistory.includes(item)
        ).slice(0, 3)
        
        return {
            history: filteredHistory,
            popular: filteredPopular,
            products: productSuggestions
        }
    }

    const handleDesktopSearch = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(searchQuery)
    }

    const handleMobileSearch = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(mobileSearchQuery)
    }

    const handleCartClick = () => {
        toggleCart()
    }

    const handleUserClick = () => {
        if (isAuthenticated) {
            setShowUserProfile(true)
        } else {
            setShowLoginModal(true)
        }
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                    {/* Logo - Fixed to show on all screen sizes */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">F</span>
                        </div>
                        <span className="text-xl font-bold">Freshed</span>
                    </Link>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
                        <form onSubmit={handleDesktopSearch} className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input 
                                placeholder={t('searchPlaceholder')} 
                                className="pl-10 pr-4"
                                value={searchQuery}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onFocus={() => handleSearchFocus()}
                            />
                            
                            {/* Search Suggestions Dropdown */}
                            {showSearchSuggestions && (
                                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                                    {(() => {
                                        const { history, popular, products } = getFilteredSuggestions(searchQuery)
                                        const hasHistory = history.length > 0
                                        const hasPopular = popular.length > 0
                                        const hasProducts = products.length > 0
                                        
                                        if (!hasHistory && !hasPopular && !hasProducts && !searchQuery) {
                                            const allHistory = getSearchHistory()
                                            return (
                                                <div className="p-2">
                                                    {allHistory.length > 0 && (
                                                        <>
                                                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                {t('recentSearches')}
                                                            </div>
                                                            {allHistory.slice(0, 5).map((item: string, index: number) => (
                                                                <button
                                                                    key={`history-${index}`}
                                                                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center gap-2 text-sm"
                                                                    onClick={() => handleSuggestionClick(item)}
                                                                >
                                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                                    {item}
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}
                                                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">
                                                        {t('popularSearches')}
                                                    </div>
                                                    {popularSearches.slice(0, 4).map((item: string, index: number) => (
                                                        <button
                                                            key={`popular-${index}`}
                                                            className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center gap-2 text-sm"
                                                            onClick={() => handleSuggestionClick(item)}
                                                        >
                                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            )
                                        }
                                        
                                        if (!hasHistory && !hasPopular && !hasProducts) {
                                            return (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {t('noSuggestions')}
                                                </div>
                                            )
                                        }
                                        
                                        return (
                                            <div className="p-2">
                                                {hasProducts && (
                                                    <>
                                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                            {t('products')}
                                                        </div>
                                                        {products.map((item: string, index: number) => (
                                                            <button
                                                                key={`product-${index}`}
                                                                className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center gap-2 text-sm"
                                                                onClick={() => handleSuggestionClick(item)}
                                                            >
                                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                                {item}
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                                {hasHistory && (
                                                    <>
                                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">
                                                            {t('recentSearches')}
                                                        </div>
                                                        {history.map((item: string, index: number) => (
                                                            <button
                                                                key={`history-${index}`}
                                                                className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center gap-2 text-sm"
                                                                onClick={() => handleSuggestionClick(item)}
                                                            >
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                {item}
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                                {hasPopular && (
                                                    <>
                                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">
                                                            {t('popularSearches')}
                                                        </div>
                                                        {popular.map((item: string, index: number) => (
                                                            <button
                                                                key={`popular-${index}`}
                                                                className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center gap-2 text-sm"
                                                                onClick={() => handleSuggestionClick(item)}
                                                            >
                                                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                                {item}
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })()} 
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to={navItem.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {navItem.text}
                        </Link>
                        
                        {/* Admin Login Link - only show when not admin authenticated */}
                        {!isAdminAuthenticated && (
                            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                {t('admin')}
                            </Link>
                        )}
                        
                        {/* Only show admin link to authenticated admin users */}
                        {isAdminAuthenticated && (
                            <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                {t('admin')}
                            </Link>
                        )}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Language Switcher */}
                        <LanguageSwitcher />
                        
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleUserClick}
                            className="relative"
                        >
                            <User className="h-5 w-5" />
                            {isAuthenticated && (
                                <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-green-500" />
                            )}
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleCartClick}
                            className="relative"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {getTotalItems() > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {getTotalItems()}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-background">
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {/* Mobile Navigation */}
                            <div className="flex justify-center space-x-6 pb-4 border-b">
                                <Link to={navItem.to} className="flex flex-col items-center space-y-1">
                                    <navItem.icon className="h-5 w-5" />
                                    <span className="text-xs">{navItem.text}</span>
                                </Link>
                                
                                {/* Only show admin link to authenticated admin users */}
                                {isAdminAuthenticated && (
                                    <Link to="/admin" className="flex flex-col items-center space-y-1">
                                        <Shield className="h-5 w-5" />
                                        <span className="text-xs">{t('admin')}</span>
                                    </Link>
                                )}
                            </div>
                            
                            {/* Mobile Actions */}
                            <div className="flex justify-center space-x-6">
                                {/* Language Switcher */}
                                <MobileLanguageSwitcher />
                                
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={handleUserClick}
                                    className="flex flex-col items-center space-y-1"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="text-xs">
                                        {isAuthenticated ? user?.name || t('profile') : t('login')}
                                    </span>
                                </Button>
                                
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={handleCartClick}
                                    className="flex flex-col items-center space-y-1 relative"
                                >
                                    <div className="relative">
                                        <ShoppingCart className="h-5 w-5" />
                                        {getTotalItems() > 0 && (
                                            <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs">
                                                {getTotalItems()}
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs">{t('cart')}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Modals */}
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
            />
            
            <UserProfile 
                isOpen={showUserProfile} 
                onClose={() => setShowUserProfile(false)} 
            />
            
            {/* Pass language as a key to force re-render when language changes */}
            <CartSheet key={language} />
        </>
    )
}

export default Header