import { PROMO_BANNERS } from "../../data/mockData";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";

const ICONS = [CreditCard, Truck, ShieldCheck];

export function PromoBanners() {
  return (
    <section className="promo-banners" aria-label="Banners promocionales">
      {PROMO_BANNERS.map((banner, i) => {
        const Icon = ICONS[i];
        return (
          <div
            key={banner.id}
            className="promo-banner"
            style={{ background: banner.bg, color: banner.color }}
          >
            <Icon className="promo-banner__icon" aria-hidden="true" />
            <div className="promo-banner__text">
              <span className="promo-banner__title">{banner.text}</span>
              <span className="promo-banner__sub">{banner.sub}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
