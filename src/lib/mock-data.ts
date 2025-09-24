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
        id: '1',
        name: 'Fresh Tomatoes',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per kg',
        description: 'Farm-fresh red tomatoes, perfect for cooking and salads',
        inStock: true
    },
    {
        id: '2',
        name: 'Green Spinach',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per bunch',
        description: 'Nutrient-rich spinach leaves, freshly harvested',
        inStock: true
    },
    {
        id: '3',
        name: 'Red Onions',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per kg',
        description: 'Sweet red onions, ideal for all cooking needs',
        inStock: true
    },
    {
        id: '4',
        name: 'Fresh Carrots',
        price: 1900,
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
        category: 'vegetables',
        unit: 'per kg',
        description: 'Crunchy orange carrots, rich in vitamins',
        inStock: true
    },

    // Fruits
    {
        id: '5',
        name: 'Sweet Mangoes',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1605027990121-cbae9167133a?w=400&h=300&fit=crop',
        category: 'fruits',
        unit: 'per kg',
        description: 'Ripe, juicy mangoes from local farms',
        inStock: true
    },
    {
        id: '6',
        name: 'Fresh Bananas',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
        category: 'fruits',
        unit: 'per dozen',
        description: 'Yellow bananas, perfect ripeness for eating',
        inStock: true
    },
    {
        id: '7',
        name: 'Green Avocados',
        price: 5200,
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
        category: 'fruits',
        unit: 'per kg',
        description: 'Premium avocados, creamy and nutritious',
        inStock: true
    },

    // Herbs
    {
        id: '8',
        name: 'Fresh Coriander',
        price: 800,
        image: 'https://images.unsplash.com/photo-1607742195653-e4d9ce6e8c3b?w=400&h=300&fit=crop',
        category: 'herbs',
        unit: 'per bunch',
        description: 'Aromatic coriander leaves for seasoning',
        inStock: true
    },
    {
        id: '9',
        name: 'Fresh Mint',
        price: 900,
        image: 'https://images.unsplash.com/photo-1628556270448-4d8c9d0b5c41?w=400&h=300&fit=crop',
        category: 'herbs',
        unit: 'per bunch',
        description: 'Fresh mint leaves for teas and cooking',
        inStock: true
    },

    // Dairy
    {
        id: '10',
        name: 'Fresh Milk',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
        category: 'dairy',
        unit: 'per liter',
        description: 'Fresh cow milk, delivered daily',
        inStock: true
    },
    {
        id: '11',
        name: 'Farm Eggs',
        price: 4800,
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
        category: 'dairy',
        unit: 'per tray (30 eggs)',
        description: 'Free-range chicken eggs from local farms',
        inStock: true
    },

    // Grains
    {
        id: '12',
        name: 'White Rice',
        price: 6500,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
        category: 'grains',
        unit: 'per 5kg bag',
        description: 'Premium white rice, perfect for daily meals',
        inStock: true
    },

    // Beverages
    {
        id: '13',
        name: 'Fresh Orange Juice',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
        category: 'beverages',
        unit: 'per 500ml',
        description: 'Freshly squeezed orange juice, no preservatives',
        inStock: true
    },
    {
        id: '14',
        name: 'Coconut Water',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        category: 'beverages',
        unit: 'per bottle',
        description: 'Natural coconut water, refreshing and healthy',
        inStock: true
    },

    // Snacks
    {
        id: '15',
        name: 'Mixed Nuts',
        price: 4200,
        image: 'https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400&h=300&fit=crop',
        category: 'snacks',
        unit: 'per 250g',
        description: 'Premium mixed nuts, perfect for healthy snacking',
        inStock: true
    },
    {
        id: '16',
        name: 'Dried Fruits Mix',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        category: 'snacks',
        unit: 'per 200g',
        description: 'Natural dried fruits, no added sugar',
        inStock: true
    }
]

export const featuredProducts = mockProducts.slice(0, 6)
export const popularCategories = categories.slice(0, 4)