import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "../../data/mockData";

const AUTO_PLAY_MS = 5000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    // Pause inactive videos
    HERO_SLIDES.forEach((s, i) => {
      if (s.video) {
        const video = document.getElementById(`video-${i}`) as HTMLVideoElement;
        if (video && i !== current) {
          video.pause();
        }
      }
    });

    // If current slide has a video, play it and let its onEnded event trigger 'next'
    if (HERO_SLIDES[current].video) {
      const video = document.getElementById(`video-${current}`) as HTMLVideoElement;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {}); // catch to prevent uncaught promise errors if play is interrupted
      }
      return;
    }

    // Otherwise, use the standard timer
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [current, next]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="hero-carousel" aria-label="Carrusel de promociones">
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`hero-carousel__slide ${i === current ? "hero-carousel__slide--active" : ""}`}
          aria-hidden={i !== current}
          style={!s.video ? { background: s.bg } : undefined}
        >
          {s.video && (
            <video
              id={`video-${i}`}
              className="hero-carousel__video"
              muted
              playsInline
              onEnded={next}
              src={s.video}
            />
          )}
          {s.video && (
            <div 
              className="hero-carousel__overlay" 
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)" }} 
            />
          )}
          <div className="hero-carousel__content">
            <h2 className="hero-carousel__title page-title">{s.title}</h2>
            <p className="hero-carousel__subtitle">{s.subtitle}</p>
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
      
      {/* Dynamic scroll gradient */}
      <div 
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "250px",
          background: "linear-gradient(to bottom, transparent, #ffffff)",
          pointerEvents: "none",
          zIndex: 5,
          opacity: Math.min(scrollY / 300, 1),
          transition: "opacity 0.1s ease-out"
        }}
      />
    </section>
  );
}
