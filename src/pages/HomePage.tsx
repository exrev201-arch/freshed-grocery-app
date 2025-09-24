import { useState, useEffect } from 'react'
import { ArrowRight, Truck, Clock, Shield, Leaf, Database, ShoppingCart, Users, CheckCircle, Star, Quote, Download, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Header from '@/components/layout/Header'
import ProductCard from '@/components/products/ProductCard'
import { mockProducts, featuredProducts } from '@/lib/mock-data'
import { adminService, Product } from '@/lib/admin-service'
import { useAdminStore } from '@/store/admin-store'
import { migrateProductsToDatabase, createInitialAdmin } from '@/lib/data-migration'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import CustomerSupport from '@/components/support/CustomerSupport'
import { Link } from 'react-router-dom'

function HomePage() {
    const { toast } = useToast()
    const { hasPermission } = useAdminStore()
    const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [migrating, setMigrating] = useState(false)
    const [showDownloadDialog, setShowDownloadDialog] = useState(false)

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

    const handleMigration = async () => {
        if (!hasPermission('write')) {
            toast({
                title: "Access Denied",
                description: "You need admin privileges to migrate data.",
                variant: "destructive",
            })
            return
        }

        setMigrating(true)
        try {
            await createInitialAdmin()
            await migrateProductsToDatabase()
            await loadProducts()
            toast({
                title: "Migration Complete",
                description: "Products have been migrated to the database successfully!",
            })
        } catch (error) {
            toast({
                title: "Migration Failed",
                description: "Failed to migrate products. Please try again.",
                variant: "destructive",
            })
        } finally {
            setMigrating(false)
        }
    }

    const handleDownloadApp = () => {
        setShowDownloadDialog(true)
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
            unit: 'pc', // Default unit
            inStock: p.stock_quantity > 0,
            rating: 4.5, // Default rating
            reviews: 25 // Default reviews
        }))
        : mockProducts

    const featuredToShow = databaseProducts.length > 0
        ? productsToShow.slice(0, 6)
        : featuredProducts

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/5 via-secondary/30 to-primary/5">
                <div className="container mx-auto px-4 py-12 lg:py-20">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                                    Fresh Groceries
                                    <span className="block text-primary">Delivered Fast</span>
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    Get farm-fresh vegetables, fruits, and groceries delivered to your doorstep in Dar es Salaam. Quick, reliable, and always fresh.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="text-lg px-8 py-6" asChild>
                                    <Link to="/products">
                                        Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="text-lg px-8 py-6"
                                    onClick={handleDownloadApp}
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Download App
                                </Button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                                {[
                                    { icon: Truck, text: 'Fast Delivery' },
                                    { icon: Leaf, text: 'Farm Fresh' },
                                    { icon: Clock, text: '30min Delivery' },
                                    { icon: Shield, text: 'Quality Guaranteed' }
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="text-muted-foreground">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/20 rounded-3xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop"
                                    alt="Fresh groceries basket"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating Cards */}
                            <Card className="absolute -top-4 -left-4 w-24 h-24 shadow-lg">
                                <CardContent className="p-3 text-center">
                                    <div className="text-2xl">🥬</div>
                                    <div className="text-xs font-medium">Fresh Veggies</div>
                                </CardContent>
                            </Card>

                            <Card className="absolute -bottom-4 -right-4 w-24 h-24 shadow-lg">
                                <CardContent className="p-3 text-center">
                                    <div className="text-2xl">🍎</div>
                                    <div className="text-xs font-medium">Sweet Fruits</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-8">
                        <h2 className="text-3xl font-bold">Featured Products</h2>
                        <p className="text-muted-foreground">Handpicked fresh items just for you</p>
                    </div>

                    {loadingProducts ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading products...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            {featuredToShow.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Getting fresh groceries delivered has never been easier. Just 3 simple steps to freshness.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: '01',
                                icon: ShoppingCart,
                                title: 'Browse & Select',
                                description: 'Choose from our wide selection of fresh vegetables, fruits, and groceries. Filter by category or search for specific items.',
                                color: 'bg-primary/10 text-primary'
                            },
                            {
                                step: '02',
                                icon: Clock,
                                title: 'Schedule Delivery',
                                description: 'Pick your preferred delivery time slot. We offer same-day delivery across Dar es Salaam from 8 AM to 8 PM.',
                                color: 'bg-accent/10 text-accent'
                            },
                            {
                                step: '03',
                                icon: CheckCircle,
                                title: 'Receive Fresh',
                                description: 'Our delivery team will bring your fresh groceries right to your doorstep. Quality guaranteed or your money back.',
                                color: 'bg-success/10 text-success'
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative">
                                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-8 text-center space-y-6">
                                        <div className="relative">
                                            <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                                                <item.icon className="h-8 w-8" />
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className="absolute -top-2 -right-2 bg-background text-xs font-bold px-2 py-1"
                                            >
                                                {item.step}
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-semibold">{item.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                </Card>
                                {index < 2 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button size="lg" asChild>
                            <Link to="/products">
                                Start Shopping Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Why Choose Fresh Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold">Why Choose Fresh?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We're not just another grocery delivery service. Here's what makes us different.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div className="space-y-8">
                            {[
                                {
                                    icon: Leaf,
                                    title: 'Farm-to-Door Freshness',
                                    description: 'Direct partnerships with local farmers ensure you get the freshest produce, harvested within 24 hours of delivery.',
                                    stat: '< 24hrs',
                                    statLabel: 'from farm'
                                },
                                {
                                    icon: Clock,
                                    title: 'Lightning Fast Delivery',
                                    description: 'Average delivery time of just 30 minutes across Dar es Salaam. Same-day delivery available for all orders.',
                                    stat: '30min',
                                    statLabel: 'avg delivery'
                                },
                                {
                                    icon: Shield,
                                    title: 'Quality Guarantee',
                                    description: 'Every item is hand-picked and quality-checked. Not satisfied? We\'ll replace it for free or give you a full refund.',
                                    stat: '100%',
                                    statLabel: 'guarantee'
                                },
                                {
                                    icon: Users,
                                    title: 'Trusted by Thousands',
                                    description: 'Join over 10,000 satisfied customers who trust Fresh for their daily grocery needs across Tanzania.',
                                    stat: '10k+',
                                    statLabel: 'customers'
                                }
                            ].map((feature, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{feature.title}</h3>
                                            <Badge variant="outline" className="text-xs font-bold">
                                                {feature.stat}
                                                <span className="ml-1 text-muted-foreground font-normal">{feature.statLabel}</span>
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/20">
                                <img
                                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"
                                    alt="Fresh vegetables and fruits"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Stats Overlay */}
                            <Card className="absolute -bottom-6 -left-6 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">4.9★</div>
                                        <div className="text-xs text-muted-foreground">Customer Rating</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="absolute -top-6 -right-6 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-success">98%</div>
                                        <div className="text-xs text-muted-foreground">On-time Delivery</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Testimonials Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold">What Our Customers Say</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Don't just take our word for it. Here's what real customers have to say about Fresh.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                name: 'Amina Hassan',
                                role: 'Working Mother',
                                location: 'Mikocheni, Dar es Salaam',
                                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
                                rating: 5,
                                testimonial: 'Fresh has been a game-changer for our family. The vegetables are always crisp and the fruits are perfectly ripe. Delivery is so reliable - they\'ve never been late!',
                                verified: true
                            },
                            {
                                name: 'John Mwalimu',
                                role: 'Restaurant Owner',
                                location: 'Masaki, Dar es Salaam',
                                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                                rating: 5,
                                testimonial: 'As a restaurant owner, quality is everything. Fresh consistently delivers the highest quality produce. Their farm partnerships really show in the freshness.',
                                verified: true
                            },
                            {
                                name: 'Grace Kimaro',
                                role: 'Health Enthusiast',
                                location: 'Oyster Bay, Dar es Salaam',
                                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                                rating: 5,
                                testimonial: 'Love that I can get organic produce delivered so quickly. The app is super easy to use and the customer service is excellent. Highly recommend!',
                                verified: true
                            }
                        ].map((testimonial, index) => (
                            <Card key={index} className="relative hover:shadow-lg transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Quote Icon */}
                                        <Quote className="h-8 w-8 text-primary/20" />
                                        
                                        {/* Rating */}
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current text-amber-400" />
                                            ))}
                                        </div>

                                        {/* Testimonial */}
                                        <blockquote className="text-muted-foreground leading-relaxed">
                                            "{testimonial.testimonial}"
                                        </blockquote>

                                        {/* Customer Info */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{testimonial.name}</h4>
                                                    {testimonial.verified && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Verified
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Social Proof Stats */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {[
                                { number: '10,000+', label: 'Happy Customers' },
                                { number: '50,000+', label: 'Orders Delivered' },
                                { number: '4.9/5', label: 'Average Rating' },
                                { number: '98%', label: 'Customer Retention' }
                            ].map((stat, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.number}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold">Ready to Get Fresh?</h2>
                        <p className="text-lg opacity-90 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust Fresh for their daily grocery needs.
                            Fast delivery, guaranteed quality, unbeatable prices.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                            <Link to="/products">
                                Start Shopping
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-black hover:bg-primary-foreground/20 hover:text-primary-foreground">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            <Toaster />
            <CustomerSupport />
            
            {/* Hidden admin access - only visible on triple-click of logo */}
            <div 
                id="hidden-admin-access" 
                style={{ display: 'none' }}
                className="fixed bottom-2 left-2 z-50"
            >
                <button 
                    onClick={() => window.location.href = '/admin/login'}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    title="Admin Portal"
                >
                    Admin Access
                </button>
            </div>
            
            <script dangerouslySetInnerHTML={{
                __html: `
                    let clickCount = 0;
                    const logo = document.querySelector('a[href="/"]');
                    if (logo) {
                        logo.addEventListener('click', (e) => {
                            clickCount++;
                            if (clickCount === 3) {
                                e.preventDefault();
                                document.getElementById('hidden-admin-access').style.display = 'block';
                                setTimeout(() => {
                                    document.getElementById('hidden-admin-access').style.display = 'none';
                                    clickCount = 0;
                                }, 10000);
                            }
                            setTimeout(() => clickCount = 0, 1000);
                        });
                    }
                `
            }} />

            {/* Download App Dialog */}
            <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center flex items-center justify-center gap-2">
                            <Download className="h-6 w-6 text-primary" />
                            Download Fresh App
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="text-center space-y-2">
                            <p className="text-muted-foreground">
                                Get the Fresh Grocery app for the best shopping experience on your mobile device.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {/* App Store Button */}
                            <Button 
                                className="w-full flex items-center justify-center gap-3 h-14 bg-black hover:bg-gray-800 text-white"
                                onClick={() => {
                                    toast({
                                        title: "Coming Soon!",
                                        description: "iOS app will be available on the App Store soon.",
                                    })
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                        <span className="text-black font-bold text-lg">📱</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs opacity-75">Download on the</div>
                                        <div className="font-semibold">App Store</div>
                                    </div>
                                </div>
                            </Button>

                            {/* Google Play Button */}
                            <Button 
                                className="w-full flex items-center justify-center gap-3 h-14 bg-black hover:bg-gray-800 text-white"
                                onClick={() => {
                                    toast({
                                        title: "Coming Soon!",
                                        description: "Android app will be available on Google Play soon.",
                                    })
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                        <span className="text-black font-bold text-lg">📱</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs opacity-75">Get it on</div>
                                        <div className="font-semibold">Google Play</div>
                                    </div>
                                </div>
                            </Button>
                        </div>

                        <div className="border-t pt-4">
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium">📱 For now, use our web app!</p>
                                <p className="text-xs text-muted-foreground">
                                    Add this website to your home screen for a native app-like experience.
                                </p>
                                <div className="flex items-center justify-center gap-4 pt-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Smartphone className="h-3 w-3" />
                                        <span>Mobile Optimized</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Tablet className="h-3 w-3" />
                                        <span>Tablet Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default HomePage 