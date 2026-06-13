import { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProducts,
  getGetProductsQueryKey,
  useAddToCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { HeroSlider } from "@/components/hero-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Package, Heart, Share2, ShoppingCart, Star, Laptop, Shirt, BookOpen, Home, Dumbbell, Gamepad2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function PromoSlider() {
  return (
    <div className="w-full my-12">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-6 px-4 sm:px-6 lg:px-8 container mx-auto">
        Горячие предложения
      </h2>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="flex flex-col justify-center rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white h-48 lg:h-56 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
            <h3 className="text-2xl font-black mb-2 relative z-10 leading-tight">Распродажа электроники -30%</h3>
            <Link href="/products?category=электроника">
              <button className="mt-auto w-fit bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors relative z-10">
                Смотреть
              </button>
            </Link>
          </div>

          <div className="flex flex-col justify-center rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-[#F97316] to-[#EF4444] text-white h-48 lg:h-56 shadow-lg relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
            <h3 className="text-2xl font-black mb-2 relative z-10 leading-tight">Новая коллекция одежды</h3>
            <Link href="/products?category=одежда">
              <button className="mt-auto w-fit bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors relative z-10">
                Купить
              </button>
            </Link>
          </div>

          <div className="flex flex-col justify-center rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] text-white h-48 lg:h-56 shadow-lg relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
            <h3 className="text-2xl font-black mb-2 relative z-10 leading-tight">Книги месяца от 15 ₽</h3>
            <Link href="/products?category=книги">
              <button className="mt-auto w-fit bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors relative z-10">
                Читать
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCards() {
  const categories = [
    { name: "Электроника", icon: Laptop, color: "bg-yellow-50 hover:bg-yellow-100", iconColor: "text-yellow-600" },
    { name: "Одежда", icon: Shirt, color: "bg-pink-50 hover:bg-pink-100", iconColor: "text-pink-600" },
    { name: "Книги", icon: BookOpen, color: "bg-blue-50 hover:bg-blue-100", iconColor: "text-blue-600" },
    { name: "Дом", icon: Home, color: "bg-green-50 hover:bg-green-100", iconColor: "text-green-600" },
    { name: "Спорт", icon: Dumbbell, color: "bg-orange-50 hover:bg-orange-100", iconColor: "text-orange-600" },
    { name: "Игрушки", icon: Gamepad2, color: "bg-purple-50 hover:bg-purple-100", iconColor: "text-purple-600" },
  ];

  return (
    <div className="w-full mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-6 px-4 sm:px-6 lg:px-8 container mx-auto">
        Категории
      </h2>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}>
                <div className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl cursor-pointer transition-colors duration-200 ${cat.color} border border-transparent`}>
                  <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 ${cat.iconColor}`} />
                  <span className="text-sm font-semibold text-gray-900 text-center">{cat.name}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || undefined;

  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addToCartMutation = useAddToCart();

  const { data: rawProducts, isLoading } = useGetProducts(
    category ? { category } : undefined,
    { query: { queryKey: getGetProductsQueryKey(category ? { category } : undefined) } }
  );

  const products = searchQuery
    ? rawProducts?.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawProducts;

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleShare = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/product/${id}`);
    toast({ title: "Ссылка скопирована", description: "Ссылка на товар скопирована в буфер обмена." });
  };

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { setLocation("/login"); return; }
    addToCartMutation.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Товар добавлен", description: "Товар успешно добавлен в корзину." });
      },
      onError: () => toast({ title: "Ошибка", description: "Не удалось добавить в корзину.", variant: "destructive" }),
    });
  };

  const skeletonCount = 12;
  const hasFilters = Boolean(category || searchQuery);

  return (
    <div className="animate-in fade-in duration-500 pb-16 bg-gray-50/50 min-h-screen">
      {!hasFilters && <HeroSlider />}
      {!hasFilters && <PromoSlider />}
      {!hasFilters && <CategoryCards />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 capitalize">
              {category ? category : searchQuery ? `Результаты для "${searchQuery}"` : "Все товары"}
            </h1>
            {products && (
              <p className="text-gray-500 text-sm mt-1">{products.length} товаров</p>
            )}
          </div>
          {hasFilters && (
            <Link href="/products">
              <button className="text-sm font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors">
                Сбросить фильтры
              </button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {products.map((product) => {
              const hasDiscount = product.price > 100;
              const isFav = favorites.has(product.id);
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="block cursor-pointer">
                      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            -20%
                          </span>
                        )}

                        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                          <button
                            className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:border-[#F59E0B] transition-colors ${isFav ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                            onClick={(e) => toggleFavorite(e, product.id)}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                          </button>
                          <button
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:border-[#F59E0B] text-gray-400 hover:text-[#F59E0B] transition-colors"
                            onClick={(e) => handleShare(e, product.id)}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-10 h-10" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-2 min-h-[2.5rem] text-gray-900 group-hover:text-[#F59E0B] transition-colors">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-xs font-bold text-gray-700">4.5</span>
                          <span className="text-xs text-gray-400 ml-auto">{product.stock} шт.</span>
                        </div>

                        <div className="flex flex-col">
                          {hasDiscount && (
                            <span className="text-xs font-medium text-gray-400 line-through leading-none">
                              {formatCurrency(product.price * 1.25)}
                            </span>
                          )}
                          <span className="text-lg font-black text-gray-900 leading-tight">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-4 pb-4 mt-auto">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-[#F59E0B] text-gray-900 hover:text-black text-sm font-bold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
                      onClick={(e) => handleAddToCart(e, product.id)}
                      disabled={addToCartMutation.isPending || product.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      В корзину
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Товары не найдены</h3>
            <p className="text-gray-500 max-w-md mx-auto">По вашему запросу ничего не найдено. Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
            {hasFilters && (
              <Link href="/products">
                <button className="mt-6 px-6 py-3 bg-[#F59E0B] text-black font-bold rounded-xl hover:bg-[#D97706] transition-colors">
                  Сбросить фильтры
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
