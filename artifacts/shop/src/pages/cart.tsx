import { useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetCart, 
  getGetCartQueryKey, 
  useUpdateCartItem, 
  useRemoveFromCart 
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: cart, isLoading } = useGetCart({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetCartQueryKey()
    }
  });

  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveFromCart();

  const updateItemRef = useRef(updateItemMutation.mutate);
  updateItemRef.current = updateItemMutation.mutate;

  const removeItemRef = useRef(removeItemMutation.mutate);
  removeItemRef.current = removeItemMutation.mutate;

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Optimistic update
    queryClient.setQueryData(getGetCartQueryKey(), (old: any) => {
      if (!old) return old;
      const items = old.items.map((item: any) => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      const total = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
      return { ...old, items, total };
    });

    updateItemRef.current(
      { data: { cartItemId, quantity: newQuantity } },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  const handleRemoveItem = (cartItemId: number) => {
    // Optimistic update
    queryClient.setQueryData(getGetCartQueryKey(), (old: any) => {
      if (!old) return old;
      const items = old.items.filter((item: any) => item.id !== cartItemId);
      const total = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
      return { ...old, items, total };
    });

    removeItemRef.current(
      { data: { cartItemId } },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Корзина</h1>
      
      {isEmpty ? (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">Ваша корзина пуста</h3>
          <p className="text-muted-foreground mb-8">Загляните в каталог, чтобы выбрать товары.</p>
          <Button onClick={() => setLocation("/products")} size="lg">
            Перейти в каталог
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                    <Link href={`/product/${item.product.id}`} className="shrink-0">
                      <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center border">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground/40" />
                        )}
                      </div>
                    </Link>
                    
                    <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                      <Link href={`/product/${item.product.id}`} className="hover:underline">
                        <h3 className="font-semibold text-foreground truncate block w-full">
                          {item.product.name}
                        </h3>
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(item.product.price)} / шт.
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                      <div className="flex items-center border rounded-md h-9">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-full rounded-none rounded-l-md px-2"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="w-10 text-center font-medium text-sm">
                          {item.quantity}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-full rounded-none rounded-r-md px-2"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="font-bold w-24 text-right">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Итого к оплате</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Товары ({cart.items.length})</span>
                    <span className="font-medium">{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="text-green-600 font-medium">Бесплатно</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>К оплате</span>
                    <span className="text-primary">{formatCurrency(cart.total)}</span>
                  </div>
                </div>
                
                <Button className="w-full h-12 text-lg">
                  Оформить заказ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
