import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useGetProduct, getGetProductQueryKey, useAddToCart } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Package, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";

export function ProductDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const productId = parseInt(id || "0", 10);

  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: {
      enabled: !isNaN(productId),
      queryKey: getGetProductQueryKey(productId),
      retry: false
    }
  });

  const addToCartMutation = useAddToCart();
  const addToCartRef = useRef(addToCartMutation.mutate);
  addToCartRef.current = addToCartMutation.mutate;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в систему, чтобы добавить товар в корзину",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }

    addToCartRef.current(
      { data: { productId, quantity } },
      {
        onSuccess: () => {
          toast({
            title: "Успешно",
            description: "Товар добавлен в корзину",
            className: "bg-green-500 text-white border-green-600"
          });
        },
        onError: (err) => {
          toast({
            title: "Ошибка",
            description: (err?.data?.message as string) || "Не удалось добавить товар в корзину",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (error) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-destructive mb-4">Товар не найден</h2>
        <Button onClick={() => setLocation("/products")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться в каталог
        </Button>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-6 pt-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
        onClick={() => setLocation("/products")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад в каталог
      </Button>
      
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl border shadow-sm">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="w-24 h-24 opacity-20" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col pt-2 lg:pt-8">
          <div className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">
            {product.category}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {product.name}
          </h1>
          <div className="text-3xl font-bold text-foreground mb-6">
            {formatCurrency(product.price)}
          </div>
          
          <div className="prose prose-sm sm:prose-base dark:prose-invert mb-8 text-muted-foreground">
            <p>{product.description}</p>
          </div>
          
          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-medium text-foreground">Количество:</span>
              <div className="flex items-center border rounded-md h-10 w-32">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-full rounded-none rounded-l-md px-2"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center font-medium">
                  {quantity}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-full rounded-none rounded-r-md px-2"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                В наличии: {product.stock}
              </span>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 text-lg bg-[#10B981] hover:bg-[#059669] text-white"
              disabled={product.stock === 0 || addToCartMutation.isPending}
              onClick={handleAddToCart}
            >
              {addToCartMutation.isPending ? (
                "Добавление..."
              ) : product.stock === 0 ? (
                "Нет в наличии"
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  В корзину
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
