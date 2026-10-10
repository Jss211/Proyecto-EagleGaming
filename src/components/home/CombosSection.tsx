import { Link } from "react-router-dom";
import "./CombosSection.css";

export function CombosSection() {
  const combos = [
    {
      id: "estudiante-oficina",
      title: "COMBO OFICINA",
      image: "/combos/PC OFICINA - ESTUDIO.png",
      link: "/categoria/pc-oficina"
    },
    {
      id: "ingenieria",
      title: "COMBO INGENIERÍA",
      image: "/combos/INGENIERÍAS.png",
      link: "/categoria/pc-ingenieria"
    },
    {
      id: "gamer",
      title: "COMBO GAMER",
      image: "/combos/PC GAMER INTEL CORE I5 14400F 32GB DDR4 1TB  RTX3060 12GB.png",
      link: "/categoria/pc-gamer"
    }
  ];

  return (
    <section className="combos-section">
      <h2 className="combos-main-title product-grid-section__title">NUESTROS COMBOS</h2>
      <div className="combos-container">
        {combos.map((combo) => (
          <div key={combo.id} className="combo-card">
            <Link to={combo.link} className="combo-image-wrapper">
              <img src={combo.image} alt={combo.title} className="combo-image" />
            </Link>
            <div className="combo-content">
              <h3 className="combo-title">{combo.title}</h3>
              <Link to={combo.link} className="combo-button-link" style={{ marginTop: "auto" }}>
                <button className="combo-button">Explorar Modelos</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
