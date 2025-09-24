/**
 * Checkout Page - Complete ClickPesa Integration
 * 
 * This replaces the old simple checkout with the comprehensive
 * ClickPesa checkout component supporting all Tanzania payment methods
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import ClickPesaCheckout from '@/components/checkout/ClickPesaCheckout';
import Header from '@/components/layout/Header';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items } = useCartStore();

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Kikapu Tupu</h1>
                        <p className="text-gray-600 mb-8">Ongeza bidhaa kwanza kabla ya kumaliza ununuzi.</p>
                        <Button 
                            onClick={() => navigate('/')} 
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Rudi Kwenye Maduka
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            <Header />
            
            {/* Back Button */}
            <div className="container mx-auto px-4 py-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Rudi Kwenye Maduka
                </Button>
            </div>

            {/* ClickPesa Checkout Component */}
            <div className="container mx-auto px-4 pb-8">
                <ClickPesaCheckout />
            </div>
        </div>
    );
}