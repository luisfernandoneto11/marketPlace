import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useGetCategories, getGetCategoriesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../lib/auth";
import { ShoppingCart, Store, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cart } = useGetCart({
    query: {
      enabled: isAuthenticated,
      queryKey: ["cart", isAuthenticated],
    }
  });

  const { data: categories } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navigateToCategory = (cat: string) => {
    setLocation(`/products?category=${encodeURIComponent(cat)}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A] text-white h-16 flex items-center shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/products" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Store className="w-6 h-6 text-primary" />
            <span>МаркетПлаза</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/products" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Каталог
            </Link>
            {categories?.map((cat) => (
              <button 
                key={cat} 
                onClick={() => navigateToCategory(cat)}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors capitalize"
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-white hover:text-white hover:bg-white/10">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Выйти" className="text-white hover:text-white hover:bg-white/10">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Регистрация
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center">
           {isAuthenticated && (
              <Link href="/cart" className="mr-4">
                <Button variant="ghost" size="icon" className="relative text-white hover:text-white hover:bg-white/10">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
           )}
           <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:bg-white/10">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#111827] border-t border-gray-800 p-4 flex flex-col gap-4 md:hidden">
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium">
            Каталог
          </Link>
          {categories?.map((cat) => (
              <button 
                key={cat} 
                onClick={() => navigateToCategory(cat)}
                className="text-left text-gray-300 font-medium capitalize"
              >
                {cat}
              </button>
          ))}
          <div className="h-px bg-gray-800 my-2" />
          {isAuthenticated ? (
            <Button variant="ghost" className="justify-start px-0 text-white" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Выйти
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-black">
                  Войти
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Регистрация
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
