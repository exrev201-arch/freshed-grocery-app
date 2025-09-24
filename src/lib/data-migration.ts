import { adminService } from './admin-service';
import { mockProducts } from './mock-data';

export async function migrateProductsToDatabase(forceOverwrite: boolean = false): Promise<void> {
    try {
        console.log('Starting product migration...');

        // Check if products already exist
        const existingProducts = await adminService.getAllProducts();
        console.log(`Found ${existingProducts.length} existing products in database`);
        
        if (existingProducts.length > 0 && !forceOverwrite) {
            console.log('Products already exist in database, skipping migration');
            throw new Error(`Migration skipped: ${existingProducts.length} products already exist in database. Use force option to overwrite.`);
        }

        console.log(`Starting migration of ${mockProducts.length} mock products${forceOverwrite ? ' (force mode)' : ''}...`);

        // Migrate each product
        let migratedCount = 0;
        for (const product of mockProducts) {
            const productData = {
                name: product.name,
                description: product.description || `Fresh ${product.name.toLowerCase()} from our local farms`,
                price: product.price,
                category: product.category,
                image_url: product.image || '',
                stock_quantity: Math.floor(Math.random() * 100) + 20, // Random stock between 20-120
                is_active: 'active' as const,
            };

            try {
                await adminService.createProduct(productData);
                migratedCount++;
                console.log(`✅ Migrated product ${migratedCount}/${mockProducts.length}: ${product.name}`);
            } catch (productError) {
                console.error(`❌ Failed to migrate product: ${product.name}`, productError);
                throw new Error(`Failed to migrate product "${product.name}": ${productError}`);
            }
        }

        console.log(`🎉 Product migration completed successfully! Migrated ${migratedCount} products.`);
        
        // Verify migration
        const finalProducts = await adminService.getAllProducts();
        console.log(`✅ Verification: Database now contains ${finalProducts.length} products`);
        
    } catch (error) {
        console.error('❌ Error during product migration:', error);
        throw error;
    }
}

// Helper function to populate initial admin user
export async function createInitialAdmin(): Promise<void> {
    try {
        const existingAdmin = await adminService.getAdminUserByEmail('admin@fresh.co.tz');
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        await adminService.createAdminUser({
            email: 'admin@fresh.co.tz',
            name: 'Fresh Admin',
            role: 'ADMIN',
        });

        console.log('Initial admin user created: admin@fresh.co.tz');
    } catch (error) {
        console.error('Error creating initial admin:', error);
        throw error;
    }
}