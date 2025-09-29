import { Product } from '@/store/cart-store'

export const categories = [
    { id: 'vegetables', name: 'Fresh Vegetables', icon: '🥬' },
    { id: 'fruits', name: 'Fresh Fruits', icon: '🍎' },
    { id: 'herbs', name: 'Herbs & Spices', icon: '🌿' },
    { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
    { id: 'grains', name: 'Grains & Cereals', icon: '🌾' },
    { id: 'meat', name: 'Fresh Meat', icon: '🥩' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'household', name: 'Household', icon: '🧽' },
    { id: 'other', name: 'Other', icon: '📦' }
]

export const mockProducts: Product[] = [
    // Vegetables
    {
        id: 'freshTomatoes',
        name: 'freshTomatoes',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per kg',
        description: 'freshTomatoesDesc',
        inStock: true
    },
    {
        id: 'greenSpinach',
        name: 'greenSpinach',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per bunch',
        description: 'greenSpinachDesc',
        inStock: true
    },
    {
        id: 'redOnions',
        name: 'redOnions',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per kg',
        description: 'redOnionsDesc',
        inStock: true
    },
    {
        id: 'freshCarrots',
        name: 'freshCarrots',
        price: 1900,
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per kg',
        description: 'freshCarrotsDesc',
        inStock: true
    },

    // Fruits
    {
        id: 'sweetMangoes',
        name: 'sweetMangoes',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1605027990121-cbae9167133a?w=400&h=300&fit=crop',
        category: 'fruits',
        unit: 'per kg',
        description: 'sweetMangoesDesc',
        inStock: true
    },
    {
        id: 'freshBananas',
        name: 'freshBananas',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
        category: 'fruits',
        unit: 'per dozen',
        description: 'freshBananasDesc',
        inStock: true
    },
    {
        id: 'greenAvocados',
        name: 'greenAvocados',
        price: 5200,
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
        category: 'fruits',
        unit: 'per kg',
        description: 'greenAvocadosDesc',
        inStock: true
    },

    // Herbs
    {
        id: 'freshCoriander',
        name: 'freshCoriander',
        price: 800,
        image: 'https://images.unsplash.com/photo-1607742195653-e4d9ce6e8c3b?w=400&h=300&fit=crop',
        category: 'herbs',
        unit: 'per bunch',
        description: 'freshCorianderDesc',
        inStock: true
    },
    {
        id: 'freshMint',
        name: 'freshMint',
        price: 900,
        image: 'https://images.unsplash.com/photo-1628556270448-4d8c9d0b5c41?w=400&h=300&fit=crop',
        category: 'herbs',
        unit: 'per bunch',
        description: 'freshMintDesc',
        inStock: true
    },

    // Dairy
    {
        id: 'freshMilk',
        name: 'freshMilk',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
        category: 'dairy',
        unit: 'per liter',
        description: 'freshMilkDesc',
        inStock: true
    },
    {
        id: 'farmEggs',
        name: 'farmEggs',
        price: 4800,
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
        category: 'dairy',
        unit: 'per tray (30 eggs)',
        description: 'farmEggsDesc',
        inStock: true
    },

    // Grains
    {
        id: 'whiteRice',
        name: 'whiteRice',
        price: 6500,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
        category: 'grains',
        unit: 'per 5kg bag',
        description: 'whiteRiceDesc',
        inStock: true
    },

    // Beverages
    {
        id: 'freshOrangeJuice',
        name: 'freshOrangeJuice',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
        category: 'beverages',
        unit: 'per 500ml',
        description: 'freshOrangeJuiceDesc',
        inStock: true
    },
    {
        id: 'coconutWater',
        name: 'coconutWater',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        category: 'beverages',
        unit: 'per bottle',
        description: 'coconutWaterDesc',
        inStock: true
    },

    // Snacks
    {
        id: 'mixedNuts',
        name: 'mixedNuts',
        price: 4200,
        image: 'https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400&h=300&fit=crop',
        category: 'snacks',
        unit: 'per 250g',
        description: 'mixedNutsDesc',
        inStock: true
    },
    {
        id: 'driedFruitsMix',
        name: 'driedFruitsMix',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        category: 'snacks',
        unit: 'per 200g',
        description: 'driedFruitsMixDesc',
        inStock: true
    }
]

export const featuredProducts = mockProducts.slice(0, 6)
export const popularCategories = categories.slice(0, 4)