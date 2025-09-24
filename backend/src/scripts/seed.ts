import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Tanzania-specific product data
const tanzaniaProducts = [
  // Vegetables
  {
    name: 'Fresh Tomatoes',
    description: 'Locally grown red tomatoes, perfect for cooking ugali accompaniments and salads. Rich in vitamins and ideal for daily meals.',
    price: 2500, // TSh per kg
    category: 'vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
    stockQuantity: 150,
    unit: 'per kg',
    sku: 'VEG-TOM-001',
    tags: ['fresh', 'local', 'organic', 'vitamins']
  },
  {
    name: 'Green Spinach (Mchicha)',
    description: 'Fresh spinach leaves locally known as mchicha. Perfect for traditional Tanzanian dishes and rich in iron.',
    price: 1800,
    category: 'vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
    stockQuantity: 80,
    unit: 'per bunch',
    sku: 'VEG-SPI-001',
    tags: ['fresh', 'local', 'iron-rich', 'traditional']
  },
  {
    name: 'Red Onions (Vitunguu)',
    description: 'Sweet red onions grown in Tanzanian highlands. Essential for all traditional cooking and perfect for daily use.',
    price: 2200,
    category: 'vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
    stockQuantity: 200,
    unit: 'per kg',
    sku: 'VEG-ONI-001',
    tags: ['local', 'highland-grown', 'essential', 'cooking']
  },
  {
    name: 'Fresh Carrots',
    description: 'Orange carrots from Arusha region, crunchy and sweet. Great for children and rich in vitamin A.',
    price: 1900,
    category: 'vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
    stockQuantity: 120,
    unit: 'per kg',
    sku: 'VEG-CAR-001',
    tags: ['arusha-grown', 'vitamin-a', 'kids-friendly', 'crunchy']
  },
  {
    name: 'Green Cabbage (Kabichi)',
    description: 'Fresh green cabbage perfect for making traditional coleslaw and cooking with other vegetables.',
    price: 1500,
    category: 'vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1594282486756-8ad295ac2346?w=400&h=300&fit=crop',
    stockQuantity: 90,
    unit: 'per head',
    sku: 'VEG-CAB-001',
    tags: ['fresh', 'traditional', 'vitamin-c', 'versatile']
  },

  // Fruits
  {
    name: 'Sweet Mangoes',
    description: 'Ripe, juicy mangoes from Coast region. Naturally sweet and perfect for the whole family. Available during season.',
    price: 4500,
    category: 'fruits',
    imageUrl: 'https://images.unsplash.com/photo-1605027990121-cbae9167133a?w=400&h=300&fit=crop',
    stockQuantity: 75,
    unit: 'per kg',
    sku: 'FRU-MAN-001',
    tags: ['coast-region', 'seasonal', 'sweet', 'family-favorite']
  },
  {
    name: 'Fresh Bananas (Ndizi)',
    description: 'Yellow bananas from Kilimanjaro region. Perfect ripeness for eating fresh or making traditional dishes.',
    price: 2800,
    category: 'fruits',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    stockQuantity: 160,
    unit: 'per dozen',
    sku: 'FRU-BAN-001',
    tags: ['kilimanjaro', 'energy-rich', 'traditional', 'perfect-ripeness']
  },
  {
    name: 'Green Avocados (Parachichi)',
    description: 'Premium avocados from highland farms. Creamy texture and rich in healthy fats. Great for breakfast.',
    price: 5200,
    category: 'fruits',
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
    stockQuantity: 60,
    unit: 'per kg',
    sku: 'FRU-AVO-001',
    tags: ['highland', 'premium', 'healthy-fats', 'breakfast']
  },
  {
    name: 'Sweet Oranges (Machungwa)',
    description: 'Juicy oranges from Morogoro region. High in vitamin C and perfect for fresh juice or eating.',
    price: 3200,
    category: 'fruits',
    imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
    stockQuantity: 100,
    unit: 'per kg',
    sku: 'FRU-ORA-001',
    tags: ['morogoro', 'vitamin-c', 'juice', 'fresh']
  },

  // Herbs & Spices
  {
    name: 'Fresh Coriander (Giligilani)',
    description: 'Aromatic coriander leaves perfect for seasoning rice, meat, and traditional dishes. Freshly harvested.',
    price: 800,
    category: 'herbs',
    imageUrl: 'https://images.unsplash.com/photo-1607742195653-e4d9ce6e8c3b?w=400&h=300&fit=crop',
    stockQuantity: 45,
    unit: 'per bunch',
    sku: 'HER-COR-001',
    tags: ['aromatic', 'seasoning', 'traditional', 'fresh-harvested']
  },
  {
    name: 'Fresh Mint (Nanaa)',
    description: 'Fresh mint leaves perfect for making traditional mint tea and flavoring dishes. Grown locally.',
    price: 900,
    category: 'herbs',
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d8c9d0b5c41?w=400&h=300&fit=crop',
    stockQuantity: 35,
    unit: 'per bunch',
    sku: 'HER-MIN-001',
    tags: ['mint-tea', 'flavoring', 'local-grown', 'refreshing']
  },
  {
    name: 'Ginger Root (Tangawizi)',
    description: 'Fresh ginger root perfect for cooking, making tea, and traditional medicine. Grown in coastal regions.',
    price: 3500,
    category: 'herbs',
    imageUrl: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=400&h=300&fit=crop',
    stockQuantity: 40,
    unit: 'per kg',
    sku: 'HER-GIN-001',
    tags: ['medicinal', 'tea', 'coastal', 'cooking']
  },

  // Dairy & Eggs
  {
    name: 'Fresh Cow Milk (Maziwa)',
    description: 'Fresh cow milk delivered daily from local dairy farms. Pasteurized and safe for the whole family.',
    price: 3200,
    category: 'dairy',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
    stockQuantity: 50,
    unit: 'per liter',
    sku: 'DAI-MIL-001',
    tags: ['daily-delivery', 'pasteurized', 'local-farms', 'family-safe']
  },
  {
    name: 'Farm Fresh Eggs (Mayai)',
    description: 'Free-range chicken eggs from local farms in Arusha. High quality protein source for healthy living.',
    price: 4800,
    category: 'dairy',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
    stockQuantity: 30,
    unit: 'per tray (30 eggs)',
    sku: 'DAI-EGG-001',
    tags: ['free-range', 'arusha-farms', 'protein', 'healthy']
  },
  {
    name: 'Local Yogurt (Mtindi)',
    description: 'Traditional fermented milk (mtindi) made locally. Probiotic-rich and great for digestion.',
    price: 2500,
    category: 'dairy',
    imageUrl: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop',
    stockQuantity: 25,
    unit: 'per 500ml',
    sku: 'DAI-YOG-001',
    tags: ['traditional', 'probiotic', 'digestion', 'fermented']
  },

  // Grains & Cereals
  {
    name: 'White Rice (Mchele)',
    description: 'Premium white rice from Morogoro. Perfect for pilau, wali, and daily meals. High quality and well-cleaned.',
    price: 6500,
    category: 'grains',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
    stockQuantity: 40,
    unit: 'per 5kg bag',
    sku: 'GRA-RIC-001',
    tags: ['morogoro', 'premium', 'pilau', 'daily-meals']
  },
  {
    name: 'Maize Flour (Unga wa Mahindi)',
    description: 'Fine maize flour for making ugali, the staple food of Tanzania. Fresh ground and high quality.',
    price: 4200,
    category: 'grains',
    imageUrl: 'https://images.unsplash.com/photo-1574323340679-98d9b1e521a0?w=400&h=300&fit=crop',
    stockQuantity: 60,
    unit: 'per 2kg packet',
    sku: 'GRA-MAI-001',
    tags: ['ugali', 'staple-food', 'fresh-ground', 'traditional']
  },
  {
    name: 'Wheat Flour (Unga wa Ngano)',
    description: 'All-purpose wheat flour perfect for making chapati, mandazi, and baking. Fine texture and premium quality.',
    price: 3800,
    category: 'grains',
    imageUrl: 'https://images.unsplash.com/photo-1574323340679-98d9b1e521a0?w=400&h=300&fit=crop',
    stockQuantity: 45,
    unit: 'per 2kg packet',
    sku: 'GRA-WHE-001',
    tags: ['chapati', 'mandazi', 'baking', 'all-purpose']
  },

  // Fresh Meat
  {
    name: 'Fresh Beef (Nyama ya Ng\'ombe)',
    description: 'Fresh beef from local cattle farms. Cut to order and perfect for traditional dishes like mchuzi.',
    price: 12000,
    category: 'meat',
    imageUrl: 'https://images.unsplash.com/photo-1558030137-d1d3e2d9b870?w=400&h=300&fit=crop',
    stockQuantity: 25,
    unit: 'per kg',
    sku: 'MEA-BEE-001',
    tags: ['local-farms', 'cut-to-order', 'mchuzi', 'traditional']
  },
  {
    name: 'Fresh Chicken (Kuku)',
    description: 'Fresh whole chicken from free-range farms. Perfect for family meals and special occasions.',
    price: 15000,
    category: 'meat',
    imageUrl: 'https://images.unsplash.com/photo-1548247414-60eaf5a94ac4?w=400&h=300&fit=crop',
    stockQuantity: 20,
    unit: 'per whole chicken (1.5-2kg)',
    sku: 'MEA-CHI-001',
    tags: ['free-range', 'whole-chicken', 'family-meals', 'special-occasions']
  },
  {
    name: 'Fresh Fish (Samaki)',
    description: 'Fresh fish from Lake Victoria and Indian Ocean. Daily catch, cleaned and ready for cooking.',
    price: 8500,
    category: 'meat',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    stockQuantity: 15,
    unit: 'per kg',
    sku: 'MEA-FIS-001',
    tags: ['lake-victoria', 'indian-ocean', 'daily-catch', 'cleaned']
  }
];

// Create admin users
const adminUsers = [
  {
    email: 'admin@fresh.co.tz',
    name: 'Fresh Admin',
    password: 'admin123', // Will be hashed
    role: 'SUPER_ADMIN' as const,
    isActive: true
  },
  {
    email: 'manager@fresh.co.tz',
    name: 'Fresh Manager',
    password: 'manager123', // Will be hashed
    role: 'ADMIN' as const,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in development only) - without transactions
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      
      // Clear data in the correct order to avoid foreign key constraints
      try {
        await prisma.inventoryLog.deleteMany();
      } catch (e) { console.log('No inventory logs to clear'); }
      
      try {
        await prisma.orderItem.deleteMany();
      } catch (e) { console.log('No order items to clear'); }
      
      try {
        await prisma.userFavorite.deleteMany();
      } catch (e) { console.log('No user favorites to clear'); }
      
      try {
        await prisma.otpCode.deleteMany();
      } catch (e) { console.log('No OTP codes to clear'); }
      
      try {
        await prisma.product.deleteMany();
      } catch (e) { console.log('No products to clear'); }
      
      try {
        await prisma.adminUser.deleteMany();
      } catch (e) { console.log('No admin users to clear'); }
      
      console.log('✅ Existing data cleared');
    }

    // Seed admin users
    console.log('👤 Creating admin users...');
    for (const admin of adminUsers) {
      const hashedPassword = await bcrypt.hash(admin.password, 12);
      
      await prisma.adminUser.create({
        data: {
          ...admin,
          password: hashedPassword
        }
      });
      
      console.log(`✅ Created admin user: ${admin.email}`);
    }

    // Seed products
    console.log('🛒 Creating products...');
    for (const [index, product] of tanzaniaProducts.entries()) {
      const createdProduct = await prisma.product.create({
        data: product
      });

      // Create initial inventory log
      await prisma.inventoryLog.create({
        data: {
          productId: createdProduct.id,
          type: 'addition',
          quantity: product.stockQuantity,
          reason: 'Initial stock - Database seeding',
          createdBy: 'system'
        }
      });

      console.log(`✅ Created product: ${product.name} (${index + 1}/${tanzaniaProducts.length})`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${adminUsers.length} admin users and ${tanzaniaProducts.length} products`);

    // Display summary
    console.log('\n📋 Seeding Summary:');
    console.log(`🏪 Products by category:`);
    
    const categoryCounts = tanzaniaProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });

    console.log(`\n👤 Admin users:`);
    adminUsers.forEach(admin => {
      console.log(`   ${admin.email} (${admin.role})`);
    });

    console.log('\n💡 Development credentials:');
    console.log('   admin@fresh.co.tz / admin123 (Super Admin)');
    console.log('   manager@fresh.co.tz / manager123 (Admin)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, tanzaniaProducts, adminUsers };