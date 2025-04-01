import React from "react";
import { Search, ShoppingBag, Home, User, Gift, Store, Utensils } from "lucide-react";
import { CategoryPill, NavButton } from "./sharedUI";

interface Props {
  brandContentPrimary: string;
  brandBackgroundSecondary: string;
  brandContentOnSecondary: string;
  brandBorderAccessible: string;
  brandBorderSubtle: string;

  /* Renamed from neutralBackground => backgroundPrimary */
  backgroundPrimary: string;

  /* Renamed from fgPrimary => contentPrimary */
  contentPrimary: string;

  /* Renamed from fgSecondary => contentSecondary */
  contentSecondary: string;
}

/**
 * Renders the "White background" screen example, 
 * with brand tokens for banners and content coloring, plus neutral tokens.
 */
export const WhiteBackgroundScreen: React.FC<Props> = ({
  brandContentPrimary,
  brandBackgroundSecondary,
  brandContentOnSecondary,
  brandBorderAccessible,
  brandBorderSubtle,

  // newly renamed
  backgroundPrimary,
  contentPrimary,
  contentSecondary,
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
        className="w-full h-full flex flex-col"
        style={{ backgroundColor: backgroundPrimary }}
      >
        {/* Status Bar */}
        <div className="px-4 py-2 flex justify-between items-center">
          <span style={{ color: brandContentPrimary, fontWeight: "500" }}>
            9:41
          </span>
          <div className="flex gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: brandContentPrimary }}>
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: brandContentPrimary }}>
              <path d="M2 8L12 16L22 8" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="p-4 mb-2 flex justify-between items-center">
          <div className="font-semibold" style={{ color: contentPrimary }}>
            Discover
          </div>
          <User size={16} style={{ color: brandContentPrimary }} />
        </div>

        {/* Category Row */}
        <div className="px-4 mb-4">
          <div className="flex gap-2">
            <CategoryPill
              icon={<Utensils size={16} />}
              label="Food"
              bgColor={backgroundPrimary}
              textColor={brandContentPrimary}
            />
            <CategoryPill
              icon={<ShoppingBag size={16} />}
              label="Market"
              bgColor={backgroundPrimary}
              textColor={contentPrimary}
            />
            <CategoryPill
              icon={<Gift size={16} />}
              label="Deals"
              bgColor={backgroundPrimary}
              textColor={contentPrimary}
            />
            <CategoryPill
              icon={<Store size={16} />}
              label="Shop"
              bgColor={backgroundPrimary}
              textColor={contentPrimary}
            />
          </div>
        </div>

        {/* Featured Restaurants */}
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-sm" style={{ color: contentPrimary }}>
              Featured Restaurants <span>→</span>
            </div>
          </div>
          {/* Quick row of 3 images */}
          <div className="grid grid-cols-3 gap-2">
            <div className="mb-2">
              <div className="h-20 relative rounded-lg overflow-hidden mb-1">
                <img 
                  src="/images/asian_bistro_new.png" 
                  alt="Person eating noodles with chopsticks" 
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: brandBackgroundSecondary,
                    color: brandContentOnSecondary
                  }}
                >
                  Save $3
                </div>
              </div>
              <div className="text-xs font-semibold truncate">Asian Bistro</div>
              <div className="text-xs text-gray-500">25 min</div>
            </div>

            <div className="mb-2">
              <div className="h-20 relative rounded-lg overflow-hidden mb-1">
                <img 
                  src="/images/grill_house.png" 
                  alt="BBQ grill with steak" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-semibold truncate">Grill House</div>
              <div className="text-xs text-gray-500">30 min</div>
            </div>

            <div className="mb-2">
              <div className="h-20 relative rounded-lg overflow-hidden mb-1">
                <img 
                  src="/images/deli_corner.png" 
                  alt="Historic deli scene" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-semibold truncate">Deli Corner</div>
              <div className="text-xs text-gray-500">25 min</div>
            </div>
          </div>
        </div>

        {/* BOGO Banner */}
        <div className="px-4 mb-4">
          <div 
            className="py-2 px-4 flex justify-between items-center rounded-xl"
            style={{ backgroundColor: brandBackgroundSecondary }}
          >
            <div>
              <div className="font-semibold text-sm" style={{ color: brandContentOnSecondary }}>
                BOGO Week
              </div>
              <div className="text-xs" style={{ color: brandContentOnSecondary }}>
                Save on your favorite items
              </div>
            </div>
            <div 
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ 
                backgroundColor: backgroundPrimary, 
                color: brandContentPrimary 
              }}
            >
              View
            </div>
          </div>
        </div>

        {/* Local Favorites Card */}
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-sm" style={{ color: contentPrimary }}>
              Local Favorites <span>→</span>
            </div>
          </div>

          <div 
            className="rounded-lg overflow-hidden mb-3"
            style={{ border: `1px solid ${brandBorderAccessible}` }}
          >
            <div
              className="h-32 w-full relative overflow-hidden"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#234142"
              }}
            >
              <img 
                src="/images/med1.png" 
                alt="Medieval market scene" 
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium"
                style={{ 
                  backgroundColor: brandBackgroundSecondary,
                  color: brandContentOnSecondary
                }}
              >
                Save $5
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div
                  className="font-semibold"
                  style={{ color: brandContentPrimary }}
                >
                  Market Express
                </div>
                <div className="text-xs">
                  <span>★ 4.7</span> (350+) · 20 min
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div
          className="mt-auto p-4 border-t flex justify-between items-center"
          style={{ borderColor: brandBorderSubtle }}
        >
          <NavButton icon={<Home size={20} />} active color={brandContentPrimary} />
          <NavButton icon={<Search size={20} />} color={brandContentPrimary} />
          <NavButton icon={<ShoppingBag size={20} />} badge="2" color={brandContentPrimary} />
          <NavButton icon={<User size={20} />} color={brandContentPrimary} />
        </div>
      </div>
    </div>
  );
};