import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { User, ShoppingBag, Heart, Settings, LogOut, Mail, Shield, Package } from "lucide-react";

export function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: cart } = useGetCart({
    query: { enabled: isAuthenticated, queryKey: getGetCartQueryKey() },
  });

  useEffect(() => {
    if (!isAuthenticated) setLocation("/login");
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/products");
  };

  if (!isAuthenticated || !user) return null;

  const cartCount = cart?.items?.reduce((a, i) => a + i.quantity, 0) || 0;
  const cartTotal = cart?.total || 0;
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center text-black font-black text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{user.username}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm mb-4">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Shield className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs text-gray-300 bg-white/10 px-2.5 py-0.5 rounded-full">Покупатель</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm px-4 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/cart">
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-[#F59E0B] transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="font-semibold text-gray-700">Корзина</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{cartCount}</p>
              <p className="text-sm text-gray-400">
                {cartCount === 0 ? "Пусто" : `На сумму ${formatCurrency(cartTotal)}`}
              </p>
            </div>
          </Link>

          <Link href="/favorites">
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-[#F59E0B] transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
                <span className="font-semibold text-gray-700">Избранное</span>
              </div>
              <p className="text-2xl font-black text-gray-900">0</p>
              <p className="text-sm text-gray-400">товаров сохранено</p>
            </div>
          </Link>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <span className="font-semibold text-gray-700">Заказы</span>
            </div>
            <p className="text-2xl font-black text-gray-900">0</p>
            <p className="text-sm text-gray-400">заказов оформлено</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-800">Настройки аккаунта</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="p-5 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">Имя пользователя</p>
                <p className="text-sm text-gray-400">{user.username}</p>
              </div>
            </div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">Пароль</p>
                <p className="text-sm text-gray-400">••••••••</p>
              </div>
              <button className="text-sm text-[#F59E0B] hover:underline font-medium">Изменить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
