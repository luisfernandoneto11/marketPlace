import { useState } from "react";
import { Link } from "wouter";
import { useGetProducts, useGetCategories, getGetProductsQueryKey, getGetCategoriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Package } from "lucide-react";

export function ProductsPage() {
  const [category, setCategory] = useState<string | undefined>();

  const { data: categories, isLoading: isLoadingCategories } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  const { data: products, isLoading: isLoadingProducts } = useGetProducts(
    category ? { category } : undefined,
    { query: { queryKey: getGetProductsQueryKey(category ? { category } : undefined) } }
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Каталог товаров</h1>
        
        <div className="w-full sm:w-64">
          <Select
            value={category || "all"}
            onValueChange={(val) => setCategory(val === "all" ? undefined : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/50">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group hover-elevate">
              <Card className="h-full overflow-hidden border-border/50 transition-colors group-hover:border-primary/20 flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-muted/30">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                    {product.category}
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    В наличии: {product.stock}
                  </span>
                </CardFooter>
              </Card>
            </Link>
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
  );
}
