import { useState, useEffect, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProducts,
  getGetProductsQueryKey,
  useAddToCart,
  getGetCartQueryKey,
  useGetFavorites,
  useAddFavorite,
  useRemoveFavorite,
  getGetFavoritesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { HeroSlider } from "@/components/hero-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Package, Heart, Share2, ShoppingCart, Star, ChevronLeft, ChevronRight, Tag, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
};

// ─── New Arrivals Section ───────────────────────────────────────────────────
function NewArrivalsSection({ products }: { products: Product[] }) {
  const newest = [...products].sort((a, b) => b.id - a.id).slice(0, 6);
  if (newest.length === 0) return null;

  return (
    <div className="w-full mt-10 mb-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0A] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-black fill-black" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Новинки</h2>
                <p className="text-xs text-gray-400">Свежие поступления этой недели</p>
              </div>
            </div>
            <Link href="/products">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors">
                Смотреть все
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {newest.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="group flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F59E0B]/40 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer">
                  <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                    <span className="absolute top-2 left-2 z-10 bg-[#F59E0B] text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                      NEW
                    </span>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-100 line-clamp-2 min-h-[2rem] mb-1.5">
                      {product.name}
                    </h3>
                    <span className="text-sm font-black text-[#F59E0B]">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Discount Products Carousel ────────────────────────────────────────────
function DiscountCarousel({ products }: { products: Product[] }) {
  const discounted = products.filter((p) => p.price > 100).slice(0, 10);
  const [start, setStart] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visibleCount = 5;
  const maxStart = Math.max(0, discounted.length - visibleCount);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStart((prev) => (prev >= maxStart ? 0 : prev + 1));
    }, 3000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [discounted.length]);

  const prev = () => { setStart((p) => Math.max(0, p - 1)); resetTimer(); };
  const next = () => { setStart((p) => Math.min(maxStart, p + 1)); resetTimer(); };

  if (discounted.length < 3) return null;

  return (
    <div className="w-full my-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Товары со скидкой</h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={start === 0}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#F59E0B] hover:text-[#F59E0B] disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              disabled={start >= maxStart}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#F59E0B] hover:text-[#F59E0B] disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-3 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(calc(-${start} * (100% / ${visibleCount}) - ${start} * 0.75rem))` }}
          >
            {discounted.map((product) => (
              <div
                key={product.id}
                className="group flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 0.75 / visibleCount}rem)` }}
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-20%</span>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 min-h-[2.5rem] mb-1">{product.name}</h3>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price * 1.25)}</span>
                      <span className="text-base font-black text-[#F59E0B]">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxStart + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setStart(i); resetTimer(); }}
              className={`h-1.5 rounded-full transition-all ${i === start ? "bg-[#F59E0B] w-5" : "bg-gray-300 w-1.5 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Promo Ad Banner (after first 20 products) ─────────────────────────────
const adSlides = [
  {
    bg: "from-[#0A0A0A] to-[#1a1a2e]",
    accent: "#F59E0B",
    badge: "НОВИНКА",
    title: "Новые поступления",
    subtitle: "Успейте купить первыми — эксклюзивные товары этой недели",
    cta: "Смотреть новинки",
    href: "/products",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
  },
  {
    bg: "from-[#1e3a5f] to-[#0f2342]",
    accent: "#60A5FA",
    badge: "ТРЕНД",
    title: "Популярная электроника",
    subtitle: "Топ продаж этого месяца — выбор тысяч покупателей",
    cta: "Перейти в каталог",
    href: "/products?category=Электроника",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80",
  },
  {
    bg: "from-[#3d1a1a] to-[#1a0a0a]",
    accent: "#F87171",
    badge: "РАСПРОДАЖА",
    title: "Скидки до 50%",
    subtitle: "Ограниченное время — не упустите выгодные предложения",
    cta: "Все акции",
    href: "/products",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  },
];

function PromoAdBanner() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % adSlides.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slide = adSlides[current];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bg} h-48 sm:h-56 transition-all duration-700`}>
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10 max-w-xl">
          <span
            className="inline-block text-xs font-black tracking-widest px-2.5 py-0.5 rounded-full mb-3 w-fit"
            style={{ background: slide.accent, color: "#0A0A0A" }}
          >
            {slide.badge}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">{slide.title}</h3>
          <p className="text-sm text-white/70 mb-4 max-w-xs">{slide.subtitle}</p>
          <Link href={slide.href}>
            <button
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 w-fit"
              style={{ background: slide.accent, color: "#0A0A0A" }}
            >
              {slide.cta}
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="absolute bottom-4 left-6 sm:left-10 flex gap-1.5">
          {adSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === current ? "20px" : "6px",
                background: i === current ? slide.accent : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2">
          <button
            onClick={() => setCurrent((p) => (p - 1 + adSlides.length) % adSlides.length)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % adSlides.length)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────
function ProductCard({
  product,
  isFav,
  onFav,
  onShare,
  onCart,
  isAdding,
}: {
  product: Product;
  isFav: boolean;
  onFav: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onCart: (e: React.MouseEvent) => void;
  isAdding: boolean;
}) {
  const hasDiscount = product.price > 100;
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <Link href={`/product/${product.id}`}>
        <div className="block cursor-pointer">
          <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
            {hasDiscount && (
              <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">-20%</span>
            )}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
              <button
                className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:border-[#F59E0B] transition-colors ${isFav ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                onClick={onFav}
              >
                <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
              </button>
              <button
                className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:border-[#F59E0B] text-gray-400 hover:text-[#F59E0B] transition-colors"
                onClick={onShare}
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
          onClick={onCart}
          disabled={isAdding || product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? "Нет в наличии" : "В корзину"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export function ProductsPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || undefined;

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addToCartMutation = useAddToCart();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const { data: favoritesData } = useGetFavorites({
    query: { queryKey: getGetFavoritesQueryKey(), enabled: isAuthenticated },
  });
  const favorites = new Set((favoritesData ?? []).map((p) => p.id));

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
    if (!isAuthenticated) { setLocation("/login"); return; }
    if (favorites.has(id)) {
      removeFavoriteMutation.mutate({ productId: id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
      });
    } else {
      addFavoriteMutation.mutate({ data: { productId: id } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() }),
      });
    }
  };

  const handleShare = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/product/${id}`);
    toast({ title: "Ссылка скопирована" });
  };

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { setLocation("/login"); return; }
    addToCartMutation.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Товар добавлен в корзину" });
      },
      onError: () => toast({ title: "Ошибка", description: "Не удалось добавить.", variant: "destructive" }),
    });
  };

  const hasFilters = Boolean(category || searchQuery);
  const first20 = products?.slice(0, 20) ?? [];
  const rest = products?.slice(20) ?? [];

  const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5";

  return (
    <div className="animate-in fade-in duration-500 pb-16 bg-gray-50/50 min-h-screen">
      {!hasFilters && <HeroSlider />}

      {!hasFilters && rawProducts && rawProducts.length > 0 && (
        <NewArrivalsSection products={rawProducts} />
      )}

      {!hasFilters && rawProducts && rawProducts.length > 0 && (
        <DiscountCarousel products={rawProducts} />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 capitalize">
                {category ? category : searchQuery ? `Результаты для "${searchQuery}"` : "Все товары"}
              </h1>
            </div>
            {products && <p className="text-gray-500 text-sm">{products.length} товаров</p>}
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
          <div className={GRID}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className={GRID}>
              {first20.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFav={favorites.has(product.id)}
                  onFav={(e) => toggleFavorite(e, product.id)}
                  onShare={(e) => handleShare(e, product.id)}
                  onCart={(e) => handleAddToCart(e, product.id)}
                  isAdding={addToCartMutation.isPending}
                />
              ))}
            </div>

            {!hasFilters && first20.length >= 20 && <PromoAdBanner />}

            {rest.length > 0 && (
              <div className={`${GRID} mt-0`}>
                {rest.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFav={favorites.has(product.id)}
                    onFav={(e) => toggleFavorite(e, product.id)}
                    onShare={(e) => handleShare(e, product.id)}
                    onCart={(e) => handleAddToCart(e, product.id)}
                    isAdding={addToCartMutation.isPending}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Товары не найдены</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              По вашему запросу ничего не найдено.{" "}
              {hasFilters && "Попробуйте изменить параметры фильтрации."}
            </p>
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
