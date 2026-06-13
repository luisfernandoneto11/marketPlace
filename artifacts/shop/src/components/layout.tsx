import { ReactNode } from "react";
import { Navbar } from "./navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t bg-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} МаркетПлаза. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
