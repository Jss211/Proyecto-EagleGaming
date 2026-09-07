import React, { useRef, useState } from "react";

// RTL detection for Hebrew/Arabic
function isRTL(text: string) {
  return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
}

export interface InfoCardProps {
  image: string;
  title: string;
  description: string;
  width?: number | string;
  height?: number | string;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  borderPadding?: number;
  cardBgColor?: string;
  shadowColor?: string;
  patternColor1?: string;
  patternColor2?: string;
  textColor?: string;
  hoverTextColor?: string;
  fontFamily?: string;
  rtlFontFamily?: string;
  effectBgColor?: string;
  contentPadding?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  description,
  width = 388,
  height = 378,
  borderColor = "var(--border-color-1, #FF5613)",
  borderBgColor = "var(--border-bg-color, #242424)",
  borderWidth = 3,
  borderPadding = 14,
  cardBgColor = "var(--card-bg-color, #000)",
  shadowColor = "var(--shadow-color, #242424)",
  patternColor1 = "var(--pattern-color1, rgba(230,230,230,0.15))",
  patternColor2 = "var(--pattern-color2, rgba(240,240,240,0.15))",
  textColor = "var(--text-color, #f5f5f5)",
  hoverTextColor = "var(--hover-text-color-1, #242424)",
  fontFamily = "var(--font-family, 'Roboto Mono', monospace)",
  rtlFontFamily = "var(--rtl-font-family, 'Montserrat', sans-serif)",
  effectBgColor = "var(--border-color-1, #FF5613)",
  contentPadding = "10px 16px",
}) => {
  const [hovered, setHovered] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calculate angle in degrees
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    
    // We now use transform: rotate() which is 100% GPU accelerated and lag-free!
    border.style.setProperty("--rotation", `${angle}deg`);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    const border = borderRef.current;
    if (border) {
      border.style.setProperty("--rotation", "0deg");
    }
  };

  // RTL logic
  const rtl = isRTL(title) || isRTL(description);
  const effectiveFont = rtl ? rtlFontFamily : fontFamily;
  const titleDirection = isRTL(title) ? "rtl" : "ltr";
  const descDirection = isRTL(description) ? "rtl" : "ltr";

  // Sizes for inner card
  const innerWidth = "100%";
  const innerHeight = "100%";

  // Pattern background (unchanged, just colors are props)
  const pattern =
    `linear-gradient(45deg, ${patternColor1} 25%, transparent 25%, transparent 75%, ${patternColor2} 75%),` +
    `linear-gradient(-45deg, ${patternColor2} 25%, transparent 25%, transparent 75%, ${patternColor1} 75%)`;

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        width,
        height,
        position: "relative",
        borderRadius: "1em",
        overflow: "hidden", // Clips the spinning border to the rounded corners
        padding: (borderPadding || 14) + (borderWidth || 3), // Maintains original spacing
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        fontFamily: effectiveFont,
        background: borderBgColor, // Fallback base
      } as React.CSSProperties}
    >
      {/* GPU Accelerated Spinning Border */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "150%",
          height: "150%",
          backgroundImage: `conic-gradient(${borderColor} 0deg, ${borderColor} 90deg, ${borderBgColor} 90deg, ${borderBgColor} 360deg)`,
          transform: "translate(-50%, -50%) rotate(var(--rotation, 0deg))",
          transformOrigin: "center",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Card Background Mask (hides the center of the spinning border) */}
      <div
        style={{
          position: "absolute",
          top: borderWidth,
          left: borderWidth,
          right: borderWidth,
          bottom: borderWidth,
          background: cardBgColor,
          borderRadius: `calc(1em - ${borderWidth}px)`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Inner Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: innerWidth,
          height: innerHeight,
          borderRadius: "0.5em",
          background: cardBgColor,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundImage: pattern,
          backgroundSize: "20.84px 20.84px",
          padding: "0 0 8px 0",
        }}
      >
        <div style={{ width: "100%", height: "200px", position: "relative", overflow: "hidden" }}>
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: contentPadding,
            minHeight: 0,
          }}
        >
          <h1
            style={{
              fontSize: 21,
              fontWeight: "bold",
              letterSpacing: "-.01em",
              lineHeight: "normal",
              marginBottom: 5,
              color: hovered ? hoverTextColor : textColor,
              transition: "color 0.3s ease",
              position: "relative",
              overflow: "hidden",
              direction: titleDirection,
              width: "auto",
            }}
          >
            <span
              style={{
                position: "relative",
                zIndex: 10,
                padding: "2px 4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {title}
            </span>
            <span
              style={{
                clipPath: hovered
                  ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                  : "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
                transformOrigin: "center",
                transition: "all cubic-bezier(.1,.5,.5,1) 0.4s",
                position: "absolute",
                left: -4,
                right: -4,
                top: -4,
                bottom: -4,
                zIndex: 0,
                backgroundColor: effectBgColor,
              }}
            />
          </h1>
          <p
            style={{
              fontSize: 14,
              color: textColor,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              direction: descDirection,
              marginBottom: 0,
              paddingBottom: 0,
              minHeight: 0,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
