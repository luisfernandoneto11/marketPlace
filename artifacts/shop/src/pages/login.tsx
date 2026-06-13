import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Store, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({
            title: "Успешный вход",
            description: `Добро пожаловать, ${data.user.username}!`,
          });
          setLocation("/products");
        },
        onError: (error) => {
          toast({
            title: "Ошибка авторизации",
            description: (error?.data?.message as string) || "Неверный email или пароль",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-10 bg-black/60" />
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" 
          alt="Shopping" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col p-12 justify-center h-full text-white">
          <div className="flex items-center gap-3 mb-8">
            <Store className="w-10 h-10 text-[#F59E0B]" />
            <span className="text-3xl font-bold tracking-tight text-[#F59E0B]">МаркетПлаза</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
            Откройте для себя мир лучших товаров
          </h1>
          <p className="text-lg text-gray-300 max-w-md">
            Присоединяйтесь к тысячам довольных покупателей и наслаждайтесь выгодными покупками каждый день.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 flex flex-col p-6 sm:p-12 lg:p-24 relative justify-center bg-white">
        <Link href="/products" className="absolute top-6 left-6 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Назад в каталог
        </Link>

        <div className="w-full max-w-md mx-auto mt-12 md:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">С возвращением!</h2>
            <p className="text-gray-500">Войдите в свой аккаунт для продолжения покупок</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                {...form.register("email")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Пароль</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                {...form.register("password")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full py-4 mt-6 bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? "Вход..." : "Войти"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Нет аккаунта?{" "}
            <Link href="/register" className="font-semibold text-black hover:text-[#F59E0B] transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
