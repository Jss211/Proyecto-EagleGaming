import React from "react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  as?: "button" | "a";
  href?: string;
  onClick?: (e: any) => void;
}

export function AnimatedButton({ children, className, as = "button", ...props }: AnimatedButtonProps & any) {
  const Component = as as any;
  return (
    <>
      <style>{`
        @keyframes rotate-glow {
            100% {
                transform: rotate(1turn);
            }
        }
    
        .btn-glow-wrapper::before {
            content: '';
            position: absolute;
            z-index: -2;
            left: -50%;
            top: -50%;
            width: 200%;
            height: 200%;
            background-position: 100% 50%;
            background-repeat: no-repeat;
            background-size: 50% 30%;
            filter: blur(6px);
            background-image: linear-gradient(#e81950, #e81950);
            animation: rotate-glow 4s linear infinite;
        }

        .btn-glow-wrapper::after {
            content: '';
            position: absolute;
            z-index: -1;
            inset: 2px;
            border-radius: 9999px;
            background: #111;
        }
      `}</style>
      <div className="btn-glow-wrapper relative z-0 inline-flex overflow-hidden p-[2px] rounded-full hover:scale-105 transition duration-300 active:scale-100 w-fit">
        <Component 
          {...props}
          className={`relative z-10 text-white rounded-full px-8 py-3 font-semibold text-[0.95rem] flex items-center justify-center transition-colors no-underline border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent ${className || ''}`}
        >
          {children}
        </Component>
      </div>
    </>
  );
}
