import { Link, useLocation } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { useAuth } from "../lib/auth";
import { ShoppingCart, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: cart } = useGetCart({
    query: {
      enabled: isAuthenticated,
      queryKey: ["cart", isAuthenticated],
    }
  });

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/products" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Package className="w-6 h-6" />
            <span>МаркетПлаза</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Каталог
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5 text-foreground" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Выйти">
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link href="/register">
                <Button>Регистрация</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
