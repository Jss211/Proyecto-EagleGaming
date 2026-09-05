import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "../../data/mockData";

const AUTO_PLAY_MS = 5000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="hero-carousel" aria-label="Carrusel de promociones">
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`hero-carousel__slide ${i === current ? "hero-carousel__slide--active" : ""}`}
          aria-hidden={i !== current}
          style={{ background: s.bg }}
        >
          <div className="hero-carousel__content">
            <span className="hero-carousel__tag" style={{ background: slide.accent }}>
              EAGLE GAMING
            </span>
            <h2 className="hero-carousel__title">{s.title}</h2>
            <p className="hero-carousel__subtitle">{s.subtitle}</p>
            <a
              href={s.href}
              className="hero-carousel__cta"
              style={{ background: s.accent }}
            >
              {s.cta}
            </a>
          </div>
        </div>
      ))}

      <button
        className="hero-carousel__arrow hero-carousel__arrow--prev"
        onClick={prev}
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className="hero-carousel__arrow hero-carousel__arrow--next"
        onClick={next}
        aria-label="Slide siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="hero-carousel__dots" role="tablist" aria-label="Navegación de slides">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Ir a slide ${i + 1}`}
            className={`hero-carousel__dot ${i === current ? "hero-carousel__dot--active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </section>
  );
}
