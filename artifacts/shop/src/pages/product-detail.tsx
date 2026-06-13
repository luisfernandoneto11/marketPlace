import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetProduct,
  getGetProductQueryKey,
  useAddToCart,
  useGetProducts,
  getGetProductsQueryKey,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Heart,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function getProductImages(imageUrl: string, productId: number): string[] {
  const baseId = Math.max(1, (productId % 40) + 1);
  const ids = [baseId, ((baseId + 10) % 84) + 1, ((baseId + 25) % 84) + 1, ((baseId + 45) % 84) + 1];
  return ids.map((id) => `https://picsum.photos/id/${id}/600/600`);
}

export function ProductDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  
  const productId = parseInt(id || "0", 10);

  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: { enabled: !isNaN(productId) && productId > 0, queryKey: getGetProductQueryKey(productId), retry: false },
  });

  const { data: allProducts } = useGetProducts(undefined, {
    query: { queryKey: getGetProductsQueryKey() },
  });

  const addToCartMutation = useAddToCart();

  const relatedProducts = allProducts
    ? allProducts.filter((p) => p.id !== productId).slice(0, 10)
    : [];

  const images = product ? getProductImages(product.imageUrl, productId) : [];

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const prevImage = () => setActiveImage((p) => (p - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((p) => (p + 1) % images.length);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({ title: "Требуется авторизация", description: "Войдите, чтобы добавить товар в корзину.", variant: "destructive" });
      setLocation("/login");
      return;
    }
    addToCartMutation.mutate(
      { data: { productId, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Товар добавлен в корзину" });
        },
        onError: (err) => {
          toast({ title: "Ошибка", description: (err?.data?.message as string) || "Не удалось добавить товар.", variant: "destructive" });
        },
      }
    );
  };
  
  const handleStickyAddToCart = () => {
    if (!isAuthenticated) {
      toast({ title: "Требуется авторизация", description: "Войдите, чтобы добавить товар в корзину.", variant: "destructive" });
      setLocation("/login");
      return;
    }
    addToCartMutation.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Товар добавлен в корзину" });
        },
        onError: (err) => {
          toast({ title: "Ошибка", description: (err?.data?.message as string) || "Не удалось добавить товар.", variant: "destructive" });
        },
      }
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Ссылка скопирована" });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Товар не найден</h2>
        <p className="text-gray-400 mb-6">Возможно, он был удалён или не существует.</p>
        <button
          onClick={() => setLocation("/products")}
          className="inline-flex items-center gap-2 bg-[#F59E0B] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#D97706] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться в каталог
        </button>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="w-20 h-20 rounded-lg flex-shrink-0" />)}
            </div>
          </div>
          <div className="space-y-5 pt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.price > 100;
  const originalPrice = hasDiscount ? product.price * 1.25 : null;
  const sku = `SKU-${String(productId).padStart(5, "0")}`;

  return (
    <>
      <div 
        className={`fixed top-0 left-0 w-full z-40 backdrop-blur-xl bg-white/80 border-b border-gray-100 h-14 flex items-center transition-transform duration-300 ${
          showStickyHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-semibold text-sm sm:text-base text-gray-900 truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#F59E0B] hidden sm:block">{formatCurrency(product.price)}</span>
            <button
              className="bg-[#F59E0B] hover:bg-[#D97706] text-black text-sm font-bold px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
              onClick={handleStickyAddToCart}
              disabled={addToCartMutation.isPending || product.stock === 0}
            >
              В корзину
            </button>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in duration-500 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/products" className="hover:text-[#F59E0B] transition-colors">Каталог</Link>
            <span>/</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#F59E0B] transition-colors capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 xl:gap-14">
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 group" style={{ aspectRatio: "1/1" }}>
                {hasDiscount && (
                  <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-20%</span>
                )}
                <img
                  src={images[activeImage]}
                  alt={`${product.name} — фото ${activeImage + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                  key={activeImage}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-[#F59E0B] hover:text-black transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-[#F59E0B] hover:text-black transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all ${i === activeImage ? "bg-[#F59E0B] w-5" : "bg-white/60 w-1.5"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${i === activeImage ? "border-[#F59E0B] shadow-md" : "border-transparent hover:border-gray-200"}`}
                  >
                    <img src={img} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> В наличии
                  </span>
                ) : (
                  <span className="text-red-500 text-xs font-medium">Нет в наличии</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= 4 ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">4.5</span>
                <span className="text-sm text-gray-400">(128 отзывов)</span>
              </div>

              <div className="flex items-end gap-3 mb-5">
                <span className="text-4xl font-black text-[#F59E0B]">{formatCurrency(product.price)}</span>
                {originalPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">{formatCurrency(originalPrice)}</span>
                )}
                {hasDiscount && (
                  <span className="text-sm font-bold text-red-500 mb-1">Скидка 20%</span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Артикул</span>
                  <span className="font-mono font-medium">{sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Категория</span>
                  <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-[#F59E0B] font-medium hover:underline capitalize">
                    {product.category}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Остаток на складе</span>
                  <span className={`font-medium ${product.stock < 5 ? "text-red-500" : "text-gray-700"}`}>{product.stock} шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Доставка</span>
                  <span className="text-green-600 font-medium">Бесплатно от 1000 ₽</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 w-24">Количество</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">макс. {product.stock}</span>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold py-4 rounded-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                  disabled={product.stock === 0 || addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartMutation.isPending ? "Добавление..." : product.stock === 0 ? "Нет в наличии" : "В корзину"}
                </button>
                <button
                  onClick={() => setIsFav(!isFav)}
                  className={`w-14 flex items-center justify-center rounded-xl border-2 transition-all ${isFav ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 hover:border-gray-300 text-gray-400"}`}
                  aria-label="Избранное"
                >
                  <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-14 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-gray-300 text-gray-400 transition-all"
                  aria-label="Поделиться"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl gap-1">
                  <Truck className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-xs font-medium text-gray-700">Быстрая доставка</span>
                  <span className="text-[10px] text-gray-400">1-3 дня</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl gap-1">
                  <Shield className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-xs font-medium text-gray-700">Гарантия</span>
                  <span className="text-[10px] text-gray-400">12 месяцев</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl gap-1">
                  <RefreshCw className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-xs font-medium text-gray-700">Возврат</span>
                  <span className="text-[10px] text-gray-400">30 дней</span>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {relatedProducts.map((p) => {
                  const hasDsc = p.price > 100;
                  return (
                    <Link key={p.id} href={`/product/${p.id}`}>
                      <div className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                          {hasDsc && (
                            <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-20%</span>
                          )}
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-gray-900 mb-1.5 min-h-[2.5rem]">{p.name}</h3>
                          <div className="flex flex-col">
                            {hasDsc && (
                              <span className="text-[10px] text-gray-400 line-through">{formatCurrency(p.price * 1.25)}</span>
                            )}
                            <span className="text-sm font-black text-[#F59E0B]">{formatCurrency(p.price)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
