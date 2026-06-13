import { Link, useLocation } from "wouter";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import {
  useGetFavorites,
  useRemoveFavorite,
  useAddToCart,
  getGetCartQueryKey,
  getGetFavoritesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addToCartMutation = useAddToCart();
  const removeFavoriteMutation = useRemoveFavorite();

  const { data: favorites, isLoading } = useGetFavorites({
    query: {
      queryKey: getGetFavoritesQueryKey(),
      enabled: isAuthenticated,
    },
  });

  const handleRemove = (productId: number) => {
    removeFavoriteMutation.mutate(
      { productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          toast({ title: "Удалено из избранного" });
        },
      },
    );
  };

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    addToCartMutation.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Товар добавлен в корзину" });
        },
      },
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 animate-in fade-in duration-500">
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Войдите, чтобы увидеть избранное</h3>
          <p className="text-gray-400 mb-6 text-sm">Ваш список избранного сохраняется в аккаунте.</p>
          <button
            onClick={() => setLocation("/login")}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold px-6 py-3 rounded-full transition-colors"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-red-400 fill-red-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Избранное</h1>
        {favorites && favorites.length > 0 && (
          <span className="text-sm text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {favorites.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Список избранного пуст</h3>
          <p className="text-gray-400 mb-6 text-sm">Нажмите на сердечко на карточке товара, чтобы сохранить его здесь.</p>
          <Link href="/products">
            <button className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold px-6 py-3 rounded-full transition-colors">
              Перейти в каталог
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {favorites.map((product) => {
            const hasDiscount = product.price > 100;
            return (
              <div key={product.id} className="group relative flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <Link href={`/product/${product.id}`}>
                  <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-20%</span>
                    )}
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                </Link>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 mb-2 min-h-[2.5rem]">{product.name}</h3>
                  <div className="flex flex-col mb-3">
                    {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price * 1.25)}</span>}
                    <span className="text-base font-black text-[#F59E0B]">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#0A0A0A] hover:bg-[#F59E0B] text-white hover:text-black text-xs font-semibold py-2 rounded-lg transition-all"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      В корзину
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      onClick={() => handleRemove(product.id)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
