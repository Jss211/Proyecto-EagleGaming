import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  items: DropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Combos PC",
    items: [
      { label: "Combo Básico", href: "#" },
      { label: "Combo Gamer", href: "#" },
      { label: "Combo Profesional", href: "#" },
    ],
  },
  {
    label: "Arma tu PC",
    items: [
      { label: "Procesadores", href: "#" },
      { label: "Tarjetas Madre", href: "#" },
      { label: "Memorias RAM", href: "#" },
      { label: "Almacenamiento", href: "#" },
      { label: "Tarjetas de Video", href: "#" },
      { label: "Gabinetes", href: "#" },
      { label: "Fuentes de poder", href: "#" },
      { label: "Refrigeración", href: "#" },
    ],
  },
  {
    label: "Ofertas",
    items: [
      { label: "Ofertas del día", href: "#" },
      { label: "Liquidación", href: "#" },
      { label: "Descuentos especiales", href: "#" },
    ],
  },
];

function DropdownMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="secondary-nav__item" ref={ref}>
      <button
        className="secondary-nav__btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {item.label}
        <ChevronDown
          className="secondary-nav__chevron"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="secondary-nav__dropdown" role="menu">
          {item.items.map((sub) => (
            <a
              key={sub.label}
              href={sub.href}
              className="secondary-nav__dropdown-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function SecondaryNav() {
  return (
    <nav className="secondary-nav" aria-label="Navegación secundaria">
      {NAV_ITEMS.map((item) => (
        <DropdownMenu key={item.label} item={item} />
      ))}
    </nav>
  );
}
