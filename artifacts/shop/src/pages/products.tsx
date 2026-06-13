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
import { Package, Heart, Share2, ShoppingCart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProductsPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get("category") || undefined;

  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addToCartMutation = useAddToCart();

  const { data: products, isLoading } = useGetProducts(
    category ? { category } : undefined,
    { query: { queryKey: getGetProductsQueryKey(category ? { category } : undefined) } }
  );

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

  return (
    <div className="animate-in fade-in duration-500 pb-16">
      {!category && <HeroSlider />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {category ? category : "Все товары"}
          </h1>
          {products && (
            <p className="text-muted-foreground text-sm mt-1">{products.length} товаров</p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
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
                  className="group relative flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="block cursor-pointer">
                      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            -20%
                          </span>
                        )}

                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                          <button
                            className={`w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:border-[#F59E0B] transition-colors ${isFav ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                            onClick={(e) => toggleFavorite(e, product.id)}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:border-[#F59E0B] text-gray-400 hover:text-[#F59E0B] transition-colors"
                            onClick={(e) => handleShare(e, product.id)}
                          >
                            <Share2 className="w-3.5 h-3.5" />
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

                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-2 min-h-[2.5rem] text-gray-900">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-xs font-medium text-gray-700">4.5</span>
                          <span className="text-xs text-gray-400 ml-auto">{product.stock} шт.</span>
                        </div>

                        <div className="flex flex-col">
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through leading-none">
                              {formatCurrency(product.price * 1.25)}
                            </span>
                          )}
                          <span className="text-base font-black text-[#F59E0B] leading-tight">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-3 pb-3 mt-auto">
                    <button
                      className="w-full flex items-center justify-center gap-1.5 bg-[#0A0A0A] hover:bg-[#F59E0B] text-white hover:text-black text-xs font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                      onClick={(e) => handleAddToCart(e, product.id)}
                      disabled={addToCartMutation.isPending}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      В корзину
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Товары не найдены</h3>
            <p className="text-gray-400 text-sm">В этой категории пока нет товаров.</p>
          </div>
        )}
      </div>
    </div>
  );
}
