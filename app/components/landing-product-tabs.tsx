"use client";

import { useCallback, useState } from "react";
import {
  MERCURY_PRODUCTS,
  type MercuryProductId,
} from "../lib/mercury-landing-content";
import { LandingDashboardPreview } from "./landing-dashboard-previews";

export function LandingProductTabs() {
  const [activeId, setActiveId] = useState<MercuryProductId>("clients");

  const handleSelect = useCallback((id: MercuryProductId) => {
    setActiveId(id);
  }, []);

  return (
    <div className="m-products m-reveal">
      <div className="m-products__list" role="tablist" aria-label="Studio modules">
        {MERCURY_PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            role="tab"
            aria-selected={activeId === product.id}
            className={`m-products__item${activeId === product.id ? " is-active" : ""}`}
            onClick={() => handleSelect(product.id)}
            onMouseEnter={() => handleSelect(product.id)}
          >
            <h3>{product.title}</h3>
            <p>{product.description}</p>
          </button>
        ))}
      </div>
      <div className="m-products__visual">
        <LandingDashboardPreview moduleId={activeId} active />
      </div>
    </div>
  );
}
