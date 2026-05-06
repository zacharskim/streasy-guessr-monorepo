"use client";

import { Apartment } from "@/stores/gameStore";

interface ApartmentDetailsPanelProps {
  apartment: Apartment;
}

export default function ApartmentDetailsPanel({ apartment }: ApartmentDetailsPanelProps) {
  return (
    <div className="space-y-5 text-sm">
      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Bed</p>
          <p className="font-semibold text-base">{apartment.bedrooms}</p>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Bath</p>
          <p className="font-semibold text-base">{Math.floor(apartment.bathrooms)}</p>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Sq ft</p>
          <p className="font-semibold text-base">{apartment.sqft ? apartment.sqft.toLocaleString() : '—'}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2 text-foreground/80">
        <p>{apartment.neighborhood.replace(/\b\w/g, c => c.toUpperCase())}, {apartment.borough.replace(/\b\w/g, c => c.toUpperCase())}</p>
        {apartment.address && <p className="text-muted-foreground text-xs">{apartment.address}</p>}
        {apartment.year_built && <p className="text-muted-foreground text-xs">Built {apartment.year_built}</p>}
      </div>

      {apartment.listing_url && (
        <a
          href={apartment.listing_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs tracking-widest uppercase underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          View on StreetEasy →
        </a>
      )}

      {apartment.amenities && apartment.amenities.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {apartment.amenities.map((amenity, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs border border-border text-foreground/70">
                {amenity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {apartment.home_features && apartment.home_features.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Features</p>
          <div className="flex flex-wrap gap-1.5">
            {apartment.home_features.map((feature, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs border border-border text-foreground/70">
                {feature.replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
