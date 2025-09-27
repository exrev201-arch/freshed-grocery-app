import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    cartTitle: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    cartEmptyDescription: 'Add items to get started!',
    cartTotal: 'Total',
    checkoutButton: 'Proceed to Checkout',
    removeFromCart: 'Remove from cart',
    cartItems: 'items'
  },
  sw: {
    cartTitle: 'Kikapu Chako',
    cartEmpty: 'Kikapu tupu',
    cartEmptyDescription: 'Ongeza bidhaa ili kuanza kununua!',
    cartTotal: 'Jumla',
    checkoutButton: 'Maliza Ununuzi',
    removeFromCart: 'Ondoa kikapu',
    cartItems: 'bidhaa'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('fresh_language') as Language | null;
    console.log('Loaded language from localStorage:', savedLanguage);
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving language to localStorage:', language);
    localStorage.setItem('fresh_language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations.en];
    return translation || key;
  };

  const setLanguageWrapper = (newLanguage: Language) => {
    console.log('Setting language to:', newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageWrapper, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}