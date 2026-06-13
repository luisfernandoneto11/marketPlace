import { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetProducts, 
  getGetProductsQueryKey, 
  useAddToCart,
  getGetCartQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { HeroSlider } from "@/components/hero-slider";
import { Button } from "@/components/ui/button";
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

  const { data: products, isLoading: isLoadingProducts } = useGetProducts(
    category ? { category } : undefined,
    { query: { queryKey: getGetProductsQueryKey(category ? { category } : undefined) } }
  );

  const handleToggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleShare = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/product/${productId}`);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на товар скопирована в буфер обмена.",
    });
  };

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    addToCartMutation.mutate({
      data: { productId, quantity: 1 }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Товар добавлен",
          description: "Товар успешно добавлен в корзину.",
        });
      },
      onError: () => {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить товар в корзину.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {!category && <HeroSlider />}
      
      <div className="container mx-auto px-4 mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {category ? `Категория: ${category}` : "Все товары"}
          </h1>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link href={`/product/${product.id}`}>
                  <div className="block cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      {product.price > 100 && (
                        <div className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                          -20%
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded capitalize border border-border/50">
                        {product.category}
                      </div>
                      
                      <div className="absolute top-12 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className={`rounded-full h-8 w-8 shadow-sm ${favorites.has(product.id) ? 'text-red-500' : 'text-foreground'}`}
                          onClick={(e) => handleToggleFavorite(e, product.id)}
                        >
                          <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="rounded-full h-8 w-8 shadow-sm text-foreground"
                          onClick={(e) => handleShare(e, product.id)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">4.5</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          В наличии: {product.stock}
                        </span>
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                          {product.price > 100 && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.price * 1.25)}
                            </span>
                          )}
                          <span className="text-xl font-black text-primary">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <Button 
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                    onClick={(e) => handleAddToCart(e, product.id)}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    В корзину
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-xl border border-dashed">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Товары не найдены</h3>
            <p className="text-muted-foreground">В этой категории пока нет товаров.</p>
          </div>
        )}
      </div>
    </div>
  );
}
