import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import CategoryNav from '@/components/categories/CategoryNav'
import ProductCard from '@/components/products/ProductCard'
import { mockProducts } from '@/lib/mock-data'
import { adminService, Product } from '@/lib/admin-service'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import CustomerSupport from '@/components/support/CustomerSupport'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'

function ProductsPage() {
    const { t } = useLanguage()
    const { toast } = useToast()
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)

    // Initialize search from URL params
    useEffect(() => {
        const urlSearch = searchParams.get('search')
        const urlCategory = searchParams.get('category')
        
        if (urlSearch) {
            setSearchQuery(urlSearch)
        }
        if (urlCategory) {
            setSelectedCategory(urlCategory)
        }
    }, [searchParams])

    // Update URL when filters change
    const updateURL = (newSearch?: string, newCategory?: string | null) => {
        const params = new URLSearchParams()
        
        const search = newSearch !== undefined ? newSearch : searchQuery
        const category = newCategory !== undefined ? newCategory : selectedCategory
        
        if (search) params.set('search', search)
        if (category) params.set('category', category)
        
        setSearchParams(params)
    }

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        updateURL(value)
    }

    // Handle category change
    const handleCategoryChange = (category: string | null) => {
        setSelectedCategory(category)
        updateURL(undefined, category)
    }

    // Load products from database
    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const products = await adminService.getActiveProducts()
            setDatabaseProducts(products)
        } catch (error: unknown) {
            console.error('Error loading products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    // Use database products if available, otherwise use mock data
    const productsToShow = databaseProducts.length > 0
        ? databaseProducts.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image_url,
            unit: 'pc',
            inStock: p.stock_quantity > 0,
            rating: 4.5,
            reviews: 25
        }))
        : mockProducts

    // Filter products based on search and category
    const filteredProducts = productsToShow.filter(product => {
        const matchesSearch = t(product.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t(product.description).toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === null || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Auto-clear filters after showing results
    useEffect(() => {
        if ((searchQuery || selectedCategory) && filteredProducts.length > 0) {
            const timer = setTimeout(() => {
                // Clear only the URL params after user has seen results
                const params = new URLSearchParams()
                setSearchParams(params, { replace: true })
            }, 5000) // Clear after 5 seconds to give user time to see results

            return () => clearTimeout(timer)
        }
    }, [searchQuery, selectedCategory, filteredProducts.length, setSearchParams])

    const clearFilters = () => {
        setSelectedCategory(null)
        setSearchQuery('')
        setSearchParams({})
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            
            <div className="container mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">{t('allProducts')}</h1>
                    <p className="text-muted-foreground">
                        {t('discoverGroceries')}
                    </p>
                </div>

                {/* Category Navigation */}
                <div className="mb-8">
                    <CategoryNav
                        selectedCategory={selectedCategory}
                        onCategorySelect={handleCategoryChange}
                    />
                </div>

                {/* Clear Filters */}
                {(selectedCategory || searchQuery) && (
                    <div className="mb-6">
                        <Button variant="outline" onClick={clearFilters}>
                            {t('clearFilters')}
                        </Button>
                    </div>
                )}

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                        {t('showingProducts')} {filteredProducts.length} {t('ofProducts')} {productsToShow.length} {t('productsCount')}
                        {selectedCategory && (
                            <span> {t('inCategory')} <span className="font-medium capitalize">{t(selectedCategory)}</span></span>
                        )}
                    </p>
                </div>

                {/* Products Grid */}
                {loadingProducts ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">{t('loadingProducts')}</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold mb-2">{t('noProductsFound')}</h3>
                        <p className="text-muted-foreground mb-4">
                            {t('noProductsFoundDescription')}
                        </p>
                        <Button onClick={clearFilters}>
                            {t('clearFilters')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Footer Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold">{t('readyToGetFresh')}</h2>
                        <p className="text-lg opacity-90 max-w-2xl mx-auto">
                            {t('readyToGetFreshDescription')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                            <Link to="/">
                                {t('browseMore')} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Toaster />
            <CustomerSupport />
        </div>
    )
}

export default ProductsPage