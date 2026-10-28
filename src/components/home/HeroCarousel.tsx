import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "../../data/mockData";

const SLIDE_DURATION_MS = 6000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    // 1. Pausar y reiniciar los videos que no están en el slide activo
    HERO_SLIDES.forEach((s, i) => {
      if (s.video) {
        const video = document.getElementById(`video-${i}`) as HTMLVideoElement | null;
        if (video && i !== current) {
          video.pause();
        }
      }
    });

    // 2. Reproducir el video del slide activo
    if (HERO_SLIDES[current].video) {
      const activeVideo = document.getElementById(`video-${current}`) as HTMLVideoElement | null;
      if (activeVideo) {
        activeVideo.muted = true; // Refuerzo para navegadores móviles / Safari
        activeVideo.currentTime = 0;
        const playPromise = activeVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Manejo silencioso si las políticas de ahorro de energía o datos del navegador restringen el autoplay
          });
        }
      }
    }

    // 3. Temporizador de avance automático constante para que nunca se congele
    const timer = setInterval(next, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [current, next]);

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
              ref={(el) => {
                if (el) el.muted = true;
              }}
              className="hero-carousel__video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={s.video} type="video/mp4" />
            </video>
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
      
      {/* Scroll gradient estático y suave sin recalcular en scroll */}
      <div 
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "140px",
          background: "linear-gradient(to bottom, transparent, #ffffff)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    </section>
  );
}
