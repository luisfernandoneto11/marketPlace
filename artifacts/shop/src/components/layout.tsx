import { ReactNode } from "react";
import { Navbar } from "./navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t bg-[#0A0A0A] py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">МаркетПлаза</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Лучший интернет-магазин для шопинга. Электроника, одежда, книги и многое другое.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Навигация</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/products" className="hover:text-[#F59E0B] transition-colors">Каталог товаров</a></li>
                <li><a href="/cart" className="hover:text-[#F59E0B] transition-colors">Корзина</a></li>
                <li><a href="/login" className="hover:text-[#F59E0B] transition-colors">Войти</a></li>
                <li><a href="/register" className="hover:text-[#F59E0B] transition-colors">Регистрация</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Контакты</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@marketplaza.ru</li>
                <li>+7 (800) 555-35-35</li>
                <li>Москва, Россия</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} МаркетПлаза. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
