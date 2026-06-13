import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout";

import NotFound from "@/pages/not-found";
import { ProductsPage } from "@/pages/products";
import { ProductDetailPage } from "@/pages/product-detail";
import { CartPage } from "@/pages/cart";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { ProfilePage } from "@/pages/profile";
import { FavoritesPage } from "@/pages/favorites";

const queryClient = new QueryClient();

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/products" />
      </Route>
      <Route path="/products" component={ProductsPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/login">
        <AuthLayout><LoginPage /></AuthLayout>
      </Route>
      <Route path="/register">
        <AuthLayout><RegisterPage /></AuthLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/login">
              <AuthLayout><LoginPage /></AuthLayout>
            </Route>
            <Route path="/register">
              <AuthLayout><RegisterPage /></AuthLayout>
            </Route>
            <Route>
              <Layout>
                <Switch>
                  <Route path="/">
                    <Redirect to="/products" />
                  </Route>
                  <Route path="/products" component={ProductsPage} />
                  <Route path="/product/:id" component={ProductDetailPage} />
                  <Route path="/cart" component={CartPage} />
                  <Route path="/profile" component={ProfilePage} />
                  <Route path="/favorites" component={FavoritesPage} />
                  <Route component={NotFound} />
                </Switch>
              </Layout>
            </Route>
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
