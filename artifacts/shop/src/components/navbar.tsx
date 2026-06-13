import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, getGetCartQueryKey, useGetCategories, getGetCategoriesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../lib/auth";
import { ShoppingCart, Store, LogOut, Menu, X, Search, ChevronDown, User, Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navigateToCategory = (cat: string) => {
    setLocation(`/products?category=${encodeURIComponent(cat)}`);
    setIsCategoryOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A] text-white h-16 flex items-center shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Left: Logo & Categories */}
        <div className="flex items-center gap-6">
          <Link href="/products" className="flex items-center gap-2 text-[#F59E0B] font-bold text-xl tracking-tight">
            <Store className="w-6 h-6 text-[#F59E0B]" />
            <span>МаркетПлаза</span>
          </Link>
          
          <div className="hidden md:flex relative" ref={categoryRef}>
            <button 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Категории
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isCategoryOpen && (
              <div className="absolute top-full mt-4 left-0 w-48 bg-[#111827] rounded-xl shadow-xl p-2 z-50">
                {categories?.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => navigateToCategory(cat)}
                    className="w-full text-left hover:bg-white/10 rounded-lg px-4 py-2 text-sm text-gray-200 capitalize transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-[400px] min-w-[200px] mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Искать товары..."
              className="w-full h-9 bg-white/10 border border-white/20 rounded-full pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] transition-colors"
            />
          </form>
        </div>

        {/* Right: User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative text-gray-300 hover:text-white transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-black">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F59E0B] text-black font-bold text-sm hover:scale-105 transition-transform"
                >
                  {initials}
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-56 bg-[#111827] rounded-xl shadow-xl p-2 z-50">
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="h-px bg-gray-700 my-1" />
                    <Link href="/profile">
                      <button onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors">
                        <User className="w-4 h-4" /> Мой профиль
                      </button>
                    </Link>
                    <Link href="/favorites">
                      <button onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors">
                        <Heart className="w-4 h-4" /> Избранное
                      </button>
                    </Link>
                    <Link href="/cart">
                      <button onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors">
                        <ShoppingCart className="w-4 h-4" /> Корзина
                      </button>
                    </Link>
                    <div className="h-px bg-gray-700 my-1" />
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} 
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-4 py-1.5 text-sm font-medium text-white border border-white/30 rounded-full hover:bg-white hover:text-black transition-colors">
                  Войти
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-1.5 text-sm font-medium bg-[#F59E0B] text-black rounded-full hover:bg-[#D97706] transition-colors">
                  Регистрация
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
           {isAuthenticated && (
              <Link href="/cart" className="relative text-white hover:text-gray-300">
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-black">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
           )}
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
             className="text-white hover:text-gray-300"
           >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#111827] border-t border-gray-800 p-4 flex flex-col gap-4 md:hidden shadow-xl z-50">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Искать товары..."
              className="w-full h-10 bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B]"
            />
          </form>
          
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2 px-2">Категории</div>
            {categories?.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => navigateToCategory(cat)}
                  className="text-left text-gray-200 text-sm hover:bg-white/10 rounded-lg px-2 py-2 capitalize transition-colors"
                >
                  {cat}
                </button>
            ))}
          </div>
          
          <div className="h-px bg-gray-800 my-1" />
          
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-white/5 rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F59E0B] text-black font-bold text-sm">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user?.username}</span>
                  <span className="text-xs text-gray-400">{user?.email}</span>
                </div>
              </div>
              
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg">
                  <User className="w-4 h-4" /> Мой профиль
                </button>
              </Link>
              <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg">
                  <Heart className="w-4 h-4" /> Избранное
                </button>
              </Link>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} 
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" /> Выйти
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-2.5 text-sm font-medium text-white border border-white/30 rounded-xl hover:bg-white hover:text-black transition-colors">
                  Войти
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-2.5 text-sm font-medium bg-[#F59E0B] text-black rounded-xl hover:bg-[#D97706] transition-colors">
                  Регистрация
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
