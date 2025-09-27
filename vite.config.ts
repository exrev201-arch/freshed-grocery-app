import * as path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        // Optimize chunk splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for large libraries
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // UI chunk for component libraries  
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
                    // Charts chunk for analytics
                    charts: ['recharts'],
                    // Utils chunk for utilities
                    utils: ['lodash', 'date-fns', 'uuid'],
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable source maps for better debugging
        sourcemap: process.env.NODE_ENV === 'development',
    },
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom', 
            'react-router-dom',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'zustand',
            'axios'
        ],
    },
    // Development server optimization
    server: {
        host: true, // Bind to 0.0.0.0
        port: 5173, // Default Vite port
        hmr: {
            overlay: false // Disable error overlay for better performance
        }
    }
})