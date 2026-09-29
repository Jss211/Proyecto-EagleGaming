import {
  liquidMetalFragmentShader,
  ShaderMount,
} from "@paper-design/shaders";
import { Check, ShoppingCart, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  width?: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function LiquidMetalButton({
  label = "Añadir al carrito",
  onClick,
  viewMode = "text",
  width = 142,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [added, setAdded] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);

  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const rippleTimers = useRef<
    Set<ReturnType<typeof setTimeout>>
  >(new Set());

  const rippleId = useRef(0);
  const buttonWidth = viewMode === "icon" ? 46 : width;

  // Velocidad actual del shader (se guarda en un ref para poder
  // reaplicarla cada vez que el shader se vuelve a crear).
  const speedRef = useRef(0.6);
  speedRef.current = added ? 2.4 : isHovered ? 1 : 0.6;

  /**
   * Montaje del shader basado en visibilidad real.
   *
   * CAUSA DEL ERROR: cada botón crea un contexto WebGL. Los navegadores
   * permiten ~16 contextos activos; al superarlos, el navegador "mata" los
   * más antiguos (los primeros botones de la página) y esos quedan
   * congelados hasta que se vuelven a montar (cambiar de vista / recargar).
   *
   * SOLUCIÓN:
   *  1. El shader solo existe mientras el botón está visible en pantalla
   *     (se destruye al salir y se crea al entrar), así nunca se acumulan
   *     contextos WebGL.
   *  2. Si aun así el contexto se pierde, se detecta y se recrea solo.
   */
  useEffect(() => {
    const container = shaderRef.current;
    if (!container) return;

    let instance: ShaderMount | null = null;
    let visible = false;
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let detachContextListener: (() => void) | null = null;

    const destroyShader = () => {
      detachContextListener?.();
      detachContextListener = null;

      if (instance) {
        try {
          instance.dispose();
        } catch {
          /* ignorar errores al liberar */
        }

        if (shaderMount.current === instance) {
          shaderMount.current = null;
        }

        instance = null;
      }
    };

    const createShader = () => {
      if (disposed || instance || !visible) return;

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      try {
        instance = new ShaderMount(
          container,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 0,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          speedRef.current,
        );

        shaderMount.current = instance;

        // Si el navegador pierde el contexto WebGL, lo recreamos.
        const canvas = container.querySelector("canvas");

        if (canvas) {
          const onContextLost = (event: Event) => {
            event.preventDefault();
            destroyShader();

            if (retryTimer) clearTimeout(retryTimer);

            retryTimer = setTimeout(() => {
              retryTimer = null;
              createShader();
            }, 250);
          };

          canvas.addEventListener(
            "webglcontextlost",
            onContextLost,
          );

          detachContextListener = () =>
            canvas.removeEventListener(
              "webglcontextlost",
              onContextLost,
            );
        }
      } catch (error) {
        instance = null;
        console.error(
          "Error al inicializar el shader metálico:",
          error,
        );
      }
    };

    // Crear al entrar en pantalla y destruir al salir.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;

          if (visible) {
            createShader();
          } else {
            destroyShader();
          }
        });
      },
      { threshold: 0.01, rootMargin: "120px" },
    );

    // Por si el contenedor pasa de display:none a visible (pestañas).
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.contentRect.width > 0 &&
          entry.contentRect.height > 0
        ) {
          createShader();
        }
      });
    });

    intersectionObserver.observe(container);
    resizeObserver.observe(container);

    return () => {
      disposed = true;

      if (retryTimer) clearTimeout(retryTimer);

      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      destroyShader();
    };
  }, []);

  // Ajustar la velocidad del efecto metálico.
  useEffect(() => {
    shaderMount.current?.setSpeed(speedRef.current);
  }, [added, isHovered]);

  // Limpiar temporizadores al salir del componente.
  useEffect(() => {
    const timers = rippleTimers.current;

    return () => {
      if (addedTimer.current) {
        clearTimeout(addedTimer.current);
      }

      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!onClick) return;

    onClick();

    setAdded(true);
    setAnimationKey((previous) => previous + 1);

    if (addedTimer.current) {
      clearTimeout(addedTimer.current);
    }

    addedTimer.current = setTimeout(() => {
      setAdded(false);
      addedTimer.current = null;
    }, 1500);

    const rect = event.currentTarget.getBoundingClientRect();
    const id = rippleId.current++;

    const x =
      event.detail === 0
        ? rect.width / 2
        : event.clientX - rect.left;

    const y =
      event.detail === 0
        ? rect.height / 2
        : event.clientY - rect.top;

    setRipples((previous) => [...previous, { id, x, y }]);

    const timer = setTimeout(() => {
      setRipples((previous) =>
        previous.filter((ripple) => ripple.id !== id),
      );

      rippleTimers.current.delete(timer);
    }, 650);

    rippleTimers.current.add(timer);
  }

  return (
    <div className="eg-cart-button-wrapper">
      <style>{`
        .eg-cart-button-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .eg-cart-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 46px;
          max-width: 100%;
          padding: 0;
          border: none;
          border-radius: 100px;
          background: linear-gradient(
            135deg,
            #b6b6b6,
            #525252,
            #e3e3e3
          );
          cursor: pointer;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 150ms ease,
            box-shadow 250ms ease;
          box-shadow: 0 4px 12px rgb(0 0 0 / 18%);
        }

        .eg-cart-button:hover {
          box-shadow: 0 7px 18px rgb(0 0 0 / 24%);
        }

        .eg-cart-button:focus-visible {
          outline: 3px solid #e11d48;
          outline-offset: 4px;
        }

        .eg-cart-button--pressed {
          transform: scale(0.97);
        }

        .eg-cart-button--added {
          box-shadow:
            0 0 0 3px rgb(34 197 94 / 18%),
            0 6px 20px rgb(34 197 94 / 24%);
        }

        .eg-cart-button__shader {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
          pointer-events: none;
          z-index: 0;
        }

        .eg-cart-button__shader canvas {
          display: block !important;
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: inherit;
        }

        .eg-cart-button__surface {
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          background: linear-gradient(180deg, #202020, #000);
          transition:
            background 250ms ease,
            box-shadow 250ms ease;
          pointer-events: none;
          z-index: 1;
        }

        .eg-cart-button--added .eg-cart-button__surface {
          background: linear-gradient(
            180deg,
            #166534,
            #052e16
          );
        }

        .eg-cart-button__content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 100%;
          padding: 0 12px;
          border-radius: inherit;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          z-index: 3;
        }

        .eg-cart-button__content--added {
          animation: eg-cart-pop 450ms ease;
        }

        .eg-cart-button__icon {
          flex-shrink: 0;
          color: #e11d48;
          transition: color 200ms ease;
        }

        .eg-cart-button--added .eg-cart-button__icon {
          color: #86efac;
          animation: eg-cart-check 350ms ease;
        }

        .eg-cart-button__ripples {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
          pointer-events: none;
          z-index: 2;
        }

        .eg-cart-button__ripple {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgb(134 239 172 / 45%);
          animation: eg-cart-ripple 650ms ease-out forwards;
        }

        .eg-cart-button__status {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
          border: 0;
        }

        @keyframes eg-cart-pop {
          0%, 100% {
            transform: translateY(0) scale(1);
          }

          40% {
            transform: translateY(-4px) scale(1.06);
          }

          70% {
            transform: translateY(1px) scale(0.98);
          }
        }

        @keyframes eg-cart-check {
          from {
            opacity: 0;
            transform: rotate(-25deg) scale(0.5);
          }

          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes eg-cart-ripple {
          from {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0);
          }

          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(25);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .eg-cart-button,
          .eg-cart-button__surface,
          .eg-cart-button__icon {
            transition: none;
          }

          .eg-cart-button__content--added,
          .eg-cart-button--added .eg-cart-button__icon {
            animation: none;
          }

          .eg-cart-button__ripple {
            display: none;
          }
        }
      `}</style>

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerCancel={() => setIsPressed(false)}
        onBlur={() => setIsPressed(false)}
        className={[
          "eg-cart-button",
          added ? "eg-cart-button--added" : "",
          isPressed ? "eg-cart-button--pressed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: buttonWidth }}
        aria-label={label}
      >
        <div
          ref={shaderRef}
          className="eg-cart-button__shader"
          aria-hidden="true"
        />

        <span
          className="eg-cart-button__surface"
          aria-hidden="true"
        />

        <span
          className="eg-cart-button__ripples"
          aria-hidden="true"
        >
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="eg-cart-button__ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
            />
          ))}
        </span>

        <span
          key={animationKey}
          className={[
            "eg-cart-button__content",
            added ? "eg-cart-button__content--added" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          {added ? (
            <Check
              size={18}
              className="eg-cart-button__icon"
            />
          ) : viewMode === "icon" ? (
            <Sparkles
              size={18}
              className="eg-cart-button__icon"
            />
          ) : (
            <ShoppingCart
              size={18}
              className="eg-cart-button__icon"
            />
          )}

          {viewMode === "text" && (
            <span>{added ? "¡Añadido!" : label}</span>
          )}
        </span>
      </button>

      <span className="eg-cart-button__status" role="status">
        {added ? "Producto añadido al carrito" : ""}
      </span>
    </div>
  );
}