"use client";

import { Apartment } from "@/stores/gameStore";

interface ApartmentDetailsPanelProps {
  apartment: Apartment;
}

export default function ApartmentDetailsPanel({ apartment }: ApartmentDetailsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Bedrooms</p>
          <p className="text-lg font-semibold">{apartment.bedrooms}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Bathrooms</p>
          <p className="text-lg font-semibold">{Math.floor(apartment.bathrooms)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Sq Ft</p>
          <p className="text-lg font-semibold">{apartment.sqft ? apartment.sqft.toLocaleString() : 'N/A'}</p>
        </div>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <p><span className="font-semibold">Location:</span> {apartment.neighborhood.replace(/\b\w/g, (c) => c.toUpperCase())}, {apartment.borough.replace(/\b\w/g, (c) => c.toUpperCase())}</p>
        {apartment.address && <p><span className="font-semibold">Zip:</span> {apartment.address}</p>}
        {apartment.year_built && <p><span className="font-semibold">Built:</span> {apartment.year_built}</p>}

        {apartment.listing_url && (
          <a href={apartment.listing_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            View on StreetEasy →
          </a>
        )}

        {(apartment.amenities && apartment.amenities.length > 0) && (
          <div>
            <p className="font-semibold mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {apartment.amenities.map((amenity, idx) => (
                <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {amenity.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}

        {(apartment.home_features && apartment.home_features.length > 0) && (
          <div>
            <p className="font-semibold mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {apartment.home_features.map((feature, idx) => (
                <span key={idx} className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  {feature.replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
