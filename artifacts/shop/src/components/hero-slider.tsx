import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=90",
    title: "Мода без границ",
    subtitle: "Откройте новую коллекцию сезона",
    buttonText: "Смотреть коллекцию",
    accent: "Одежда",
  },
  {
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&q=90",
    title: "Электроника будущего",
    subtitle: "Лучшие технологии для вас",
    buttonText: "Выбрать технику",
    accent: "Электроника",
  },
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=90",
    title: "Дом вашей мечты",
    subtitle: "Стильные товары для уюта",
    buttonText: "В каталог",
    accent: "Дом",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] overflow-hidden bg-black group">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
            <span className="inline-block bg-[#F59E0B] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 w-fit">
              {slide.accent}
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
              {slide.title}
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-md">{slide.subtitle}</p>
            <Link href="/products">
              <button className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 w-fit">
                {slide.buttonText}
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Предыдущий"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Следующий"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-[#F59E0B] w-8" : "bg-white/40 w-3 hover:bg-white/70"}`}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
