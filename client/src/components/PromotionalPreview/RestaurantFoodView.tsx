import React from "react";
import { X, Utensils, ThumbsUp, ArrowRight } from "lucide-react";

/**
 * Props for the "RestaurantFoodView" screen.
 * We added 'brandBackgroundSecondary' so you can use it inside.
 */
interface Props {
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
  brandBackgroundSecondary: string; // NEW
}

/**
 * Renders a screen with a medieval-feast style overlay,
 * showing brand color layering over background images.
 */
export const RestaurantFoodView: React.FC<Props> = ({
  brandBackgroundPrimary,
  brandContentOnPrimary,
  brandBackgroundSecondary, // now available
}) => {
  return (
    <div 
      className="rounded-[24px] overflow-hidden shadow-lg"
      style={{ 
        width: "375px", 
        height: "700px", 
        border: "6px solid rgba(0,0,0,.3)",
      }}
    >
      <div
        className="w-full h-full flex flex-col relative"
        style={{ backgroundColor: "transparent" }}
      >
        {/* Background medieval tavern image */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url('/images/med1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>

        {/* Brand color gradient layer */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            backgroundImage: `linear-gradient(135deg, 
              ${brandBackgroundPrimary}70 0%, 
              ${brandBackgroundPrimary}50 35%, 
              transparent 90%)`,
            mixBlendMode: "color"
          }}
        ></div>

        {/* Dark gradient overlay */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            backgroundImage: `linear-gradient(to top, 
              rgba(0,0,0,0.9) 0%, 
              rgba(0,0,0,0.7) 25%, 
              rgba(0,0,0,0.5) 50%, 
              rgba(0,0,0,0.3) 75%, 
              rgba(0,0,0,0.1) 90%,
              rgba(0,0,0,0) 100%)`
          }}
        ></div>

        {/* Title text */}
        <div className="absolute top-1/4 left-0 right-0 text-center">
          <h1 
            className="text-4xl font-extrabold px-6 leading-tight tracking-tight"
            style={{ 
              color: "#FFFFFF",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)"
            }}
          >
            Medieval Feast Awaits
          </h1>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 flex justify-between items-center z-10 relative">
          <span style={{ color: "#FFFFFF", fontWeight: "500" }}>9:41</span>
          <div className="flex gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#FFFFFF" }}>
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#FFFFFF" }}>
              <path d="M2 8L12 16L22 8" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Dismiss X Button in top-right */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-black bg-opacity-60 p-2 rounded-full">
              <X size={20} className="text-white" />
            </div>
          </div>

          {/* Bottom overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 pb-5"
            style={{
              background: `linear-gradient(to top, 
                rgba(0,0,0,0.95) 0%, 
                rgba(0,0,0,0.8) 50%, 
                rgba(0,0,0,0.6) 75%, 
                rgba(0,0,0,0) 100%)`
            }}
          >
            {/* Restaurant Info */}
            <div className="px-4 pt-8 pb-3">
              <div className="flex items-center">
                <div 
                  className="font-bold text-xl mr-1"
                  style={{ 
                    color: "#FFFFFF",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)"
                  }}
                >
                  The Golden Dragon Tavern
                </div>
                <ArrowRight size={18} style={{ color: "#FFFFFF", opacity: 0.9 }} />
              </div>

              <div className="flex items-center text-sm gap-1" style={{ color: "#FFFFFF" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 18l-6.062 3.18 1.156-6.74L2 9.82l6.781-.98L12 3l3.219 5.84 6.781.98-4.094 4.62 1.156 6.74z" />
                </svg>
                <span className="font-semibold">4.9</span>
                <span style={{ opacity: 0.9 }}>(1,240+)</span>
                <span className="mx-1">•</span>
                <span>Medieval Cuisine</span>
              </div>
            </div>

            {/* Menu Item Card - example usage of brandBackgroundSecondary */}
            <div className="px-4 py-2">
              <div
                className="w-full rounded-xl p-3 flex items-center"
                style={{ 
                  // If you want brandBackgroundSecondary, just swap below:
                  backgroundColor: brandBackgroundPrimary,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                <div 
                  className="w-16 h-16 rounded-lg bg-black bg-opacity-20 flex-shrink-0 flex items-center justify-center"
                  style={{ color: brandContentOnPrimary }}
                >
                  <Utensils size={24} />
                </div>
                <div className="ml-3 flex-grow">
                  <div
                    className="font-semibold text-sm"
                    style={{ color: brandContentOnPrimary }}
                  >
                    Roast Pheasant
                  </div>
                  <div className="flex justify-between items-center">
                    <div
                      className="text-xs opacity-90"
                      style={{ color: brandContentOnPrimary }}
                    >
                      5 Gold
                    </div>
                    <div
                      className="flex items-center text-xs opacity-90"
                      style={{ color: brandContentOnPrimary }}
                    >
                      <ThumbsUp size={12} className="mr-1" />
                      <span>98% (237)</span>
                    </div>
                  </div>
                </div>
                <button
                  className="ml-2 px-3 py-1.5 rounded-lg bg-white bg-opacity-20 text-xs font-medium"
                  style={{
                    backgroundColor: brandContentOnPrimary,
                    color: brandBackgroundPrimary
                  }}
                >
                  Order now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
