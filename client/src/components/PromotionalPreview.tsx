import React from "react";
import { 
  Search, 
  ShoppingBag, 
  Home, 
  User, 
  Coffee, 
  Utensils, 
  Pizza, 
  Cookie, 
  ShoppingCart, 
  Gift, 
  Store,
  LucideIcon,
  Star,
  Clock,
  ThumbsUp,
  Plus,
  Bookmark,
  ArrowRight,
  MapPin
} from "lucide-react";
import { type ColorStop } from "@/lib/color";
import { SPECIAL_BLACK_INDEX, SPECIAL_WHITE_INDEX } from "@/lib/semanticTokens";

interface PromotionalPreviewProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
}

/**
 * Get the color from the ramp based on the semantic token index
 */
function getColorFromIndex(ramp: ColorStop[], idx: number): string {
  if (idx === SPECIAL_BLACK_INDEX) {
    return "#000000";
  } else if (idx === SPECIAL_WHITE_INDEX) {
    return "#FFFFFF";
  } else if (idx >= 0 && idx < ramp.length) {
    return ramp[idx].hex;
  }
  return "#000000"; // fallback
}

export const PromotionalPreview: React.FC<PromotionalPreviewProps> = ({
  ramp,
  semanticIndices,
}) => {
  // Consistent function to get colors from tokens
  const getColor = (tokenName: string) => {
    const idx = semanticIndices[tokenName] ?? -1;
    return getColorFromIndex(ramp, idx);
  };

  // Main colors for our design
  const brandBackgroundPrimary = getColor("brandBackgroundPrimary");
  const brandBackgroundSecondary = getColor("brandBackgroundSecondary");
  const brandContentPrimary = getColor("brandContentPrimary");
  const brandContentOnPrimary = getColor("brandContentOnPrimary");
  const brandContentOnSecondary = getColor("brandContentOnSecondary");
  const brandBorderAccessible = getColor("brandBorderAccessible");
  const neutralBackground = "#FFFFFF"; // Neutral surface
  const fgPrimary = "#000000"; // FG Primary
  const fgSecondary = "#4B4B4B"; // FG Secondary

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-wrap justify-center gap-8">
        {/* SCREEN 1: Restaurant Food View with Brand Overlay */}
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
            style={{ backgroundColor: "#000000" }}
          >
            {/* Status Bar */}
            <div className="px-4 py-2 flex justify-between items-center">
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

            {/* Full-screen Content */}
            <div className="flex-1 relative">
              {/* Background Food Image */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black">
                {/* This would be a placeholder for the actual food image you provided */}
                <div 
                  className="h-full w-full bg-gray-900 flex items-center justify-center relative"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  {/* We're using emoji to simulate elements in your image */}
                  <div className="absolute left-1/4 top-1/4 transform -translate-x-1/4 -translate-y-1/4">
                    <div className="text-6xl">🥃</div>
                  </div>
                  <div className="absolute left-1/3 bottom-1/3 transform -translate-x-1/3 translate-y-1/3">
                    <div className="text-5xl">🥬</div>
                  </div>
                  
                  <div className="relative">
                    <div className="text-9xl">🍜</div>
                    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-6xl rotate-45">🥢</div>
                  </div>
                  
                  <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/4 translate-y-1/4">
                    <div className="text-5xl">🍚</div>
                  </div>
                </div>
              </div>
              
              {/* Bookmark Button in Top Right */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-black bg-opacity-60 p-2 rounded-full">
                  <Bookmark size={24} className="text-white" />
                </div>
              </div>
              
              {/* Bottom Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0">
                {/* Restaurant Info Bar */}
                <div className="px-4 py-2">
                  <div className="flex items-center">
                    <div 
                      className="font-bold text-xl text-white mr-1"
                      style={{ 
                        color: brandContentOnPrimary 
                      }}
                    >
                      Bodega
                    </div>
                    <ArrowRight size={18} className="text-white opacity-80" />
                  </div>
                  
                  <div className="flex items-center text-white text-sm gap-1">
                    <Star size={14} fill="white" className="text-white" />
                    <span className="font-semibold">4.7</span>
                    <span className="text-gray-300">(2,350+)</span>
                    <span className="mx-1">•</span>
                    <span>20 min</span>
                  </div>
                </div>
                
                {/* Menu Item Card */}
                <div className="flex px-2 py-2 mb-2 gap-2 overflow-x-auto">
                  <div
                    className="flex-shrink-0 w-5/6 bg-black bg-opacity-80 rounded-xl p-2 flex items-center"
                    style={{ 
                      border: `1px solid ${brandBorderAccessible}`,
                    }}
                  >
                    <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">🍜</span>
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="font-semibold text-white">Bun Cha</div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-300">$12.30</div>
                        <div className="flex items-center text-gray-300 text-xs">
                          <ThumbsUp size={12} className="mr-1" />
                          <span>90% (152)</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="ml-2 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
                      style={{ 
                        backgroundColor: brandBackgroundPrimary
                      }}
                    >
                      <Plus size={14} className="text-white" />
                    </button>
                  </div>
                  
                  {/* Partial visible second item */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    <span className="text-2xl">🍲</span>
                  </div>
                </div>
                
                {/* Home Indicator Line */}
                <div className="flex justify-center py-2 pb-4">
                  <div className="w-32 h-1 bg-white rounded-full"></div>
                </div>
                
                {/* Bottom Navigation */}
                <div className="p-3 flex justify-between items-center bg-black bg-opacity-90">
                  <NavButton icon={<User size={24} />} color="#FFFFFF" />
                  <div className="flex items-center bg-gray-800 rounded-full px-3 py-1.5">
                    <Search size={20} className="text-gray-300 mr-2" />
                    <span className="text-gray-300">Search anything</span>
                  </div>
                  <NavButton icon={<ShoppingBag size={24} />} badge="2" color="#FFFFFF" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SCREEN 2: Primary Background */}
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
            style={{ backgroundColor: brandBackgroundPrimary }}
          >
            {/* Status Bar */}
            <div className="px-4 py-2 flex justify-between items-center">
              <span style={{ color: brandContentOnPrimary, fontWeight: "500" }}>9:41</span>
              <div className="flex gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: brandContentOnPrimary }}>
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: brandContentOnPrimary }}>
                  <path d="M2 8L12 16L22 8" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="px-4 pt-2 pb-3">
              <div className="font-semibold text-sm mb-3" style={{ color: brandContentOnPrimary }}>
                This week
              </div>

              {/* Categories */}
              <div className="flex gap-2 mb-4">
                <CategoryPill
                  icon={<Utensils size={16} />}
                  label="Food"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
                <CategoryPill
                  icon={<ShoppingCart size={16} />}
                  label="Market"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
                <CategoryPill
                  icon={<Gift size={16} />}
                  label="Deals"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
                <CategoryPill
                  icon={<Store size={16} />}
                  label="Shop"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4">
              <div className="text-xl font-bold mb-2" style={{ color: brandContentOnPrimary }}>
                BOGO Week Special <span>→</span>
              </div>
              <div className="mb-5 text-sm" style={{ color: brandContentOnPrimary }}>
                Buy 1, get 1 free on featured items
              </div>

              {/* Food Grid */}
              <div className="grid grid-cols-2 gap-4">
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Coffee Shop"
                  subtitle="Hot & Cold Drinks"
                  imgEmoji="☕"
                />
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Fresh Greens"
                  subtitle="Salads & Bowls"
                  imgEmoji="🥗"
                />
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Grill House"
                  subtitle="Burgers & Sandwiches"
                  imgEmoji="🍔"
                />
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Breakfast Bar"
                  subtitle="Morning Essentials"
                  imgEmoji="🥯"
                />
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="p-4 bg-black bg-opacity-5 flex justify-between items-center">
              <NavButton icon={<Home size={20} />} active color={brandContentOnPrimary} />
              <NavButton icon={<Search size={20} />} color={brandContentOnPrimary} />
              <NavButton icon={<ShoppingBag size={20} />} badge="2" color={brandContentOnPrimary} />
              <NavButton icon={<User size={20} />} color={brandContentOnPrimary} />
            </div>
          </div>
        </div>

        {/* SCREEN 2: White Background with Brand Elements */}
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
            style={{ backgroundColor: neutralBackground }}
          >
            {/* Status Bar */}
            <div className="px-4 py-2 flex justify-between items-center">
              <span style={{ color: brandContentPrimary, fontWeight: "500" }}>9:41</span>
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
              <div className="font-semibold" style={{ color: fgPrimary }}>
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
                  bgColor={neutralBackground}
                  textColor={brandContentPrimary}
                />
                <CategoryPill
                  icon={<ShoppingCart size={16} />}
                  label="Market"
                  bgColor={neutralBackground}
                  textColor={fgPrimary}
                />
                <CategoryPill
                  icon={<Gift size={16} />}
                  label="Deals"
                  bgColor={neutralBackground}
                  textColor={fgPrimary}
                />
                <CategoryPill
                  icon={<Store size={16} />}
                  label="Shop"
                  bgColor={neutralBackground}
                  textColor={fgPrimary}
                />
              </div>
            </div>

            {/* Top Picks Section */}
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-sm" style={{ color: fgPrimary }}>
                  Featured Restaurants <span>→</span>
                </div>
              </div>

              {/* Restaurants Row - Fixed Width Items (No Scroll) */}
              <div className="grid grid-cols-3 gap-2">
                <RestaurantItem 
                  name="Asian Bistro"
                  time="25 min"
                  promo="Save $3"
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                />
                <RestaurantItem 
                  name="Grill House"
                  time="30 min"
                  brandBackgroundPrimary={brandBackgroundSecondary}
                  brandContentOnPrimary={brandContentOnSecondary}
                />
                <RestaurantItem 
                  name="Deli Corner"
                  time="25 min"
                  brandBackgroundPrimary={brandBackgroundSecondary}
                  brandContentOnPrimary={brandContentOnSecondary}
                />
              </div>
            </div>

            {/* BOGO Banner */}
            <div className="px-4 mb-4">
              <div 
                className="py-2 px-4 flex justify-between items-center rounded-xl"
                style={{ backgroundColor: brandBackgroundSecondary }}
              >
                <div>
                  <div className="font-semibold text-sm" style={{ color: brandContentOnSecondary }}>BOGO Week</div>
                  <div className="text-xs" style={{ color: brandContentOnSecondary }}>Save on your favorite items</div>
                </div>
                <div 
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ 
                    backgroundColor: neutralBackground, 
                    color: brandContentPrimary 
                  }}
                >
                  View
                </div>
              </div>
            </div>

            {/* Featured Section */}
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-sm" style={{ color: fgPrimary }}>
                  Local Favorites <span>→</span>
                </div>
              </div>

              {/* Restaurant Card */}
              <div 
                className="rounded-lg overflow-hidden mb-3"
                style={{ 
                  border: `1px solid ${brandBorderAccessible}`,
                }}
              >
                <div 
                  className="h-32 w-full bg-gray-200 relative"
                >
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium"
                    style={{ 
                      backgroundColor: brandBackgroundPrimary,
                      color: brandContentOnPrimary
                    }}
                  >
                    Save $5
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold" style={{ color: brandContentPrimary }}>
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
            <div className="mt-auto p-4 border-t flex justify-between items-center">
              <NavButton icon={<Home size={20} />} active color={brandContentPrimary} />
              <NavButton icon={<Search size={20} />} color={brandContentPrimary} />
              <NavButton icon={<ShoppingBag size={20} />} badge="2" color={brandContentPrimary} />
              <NavButton icon={<User size={20} />} color={brandContentPrimary} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
//   ↓↓↓ HELPER COMPONENTS
// ────────────────────────────────────────────────────────────────────────────────

// 1) Updated CategoryPill to receive bgColor / textColor as props and use actual icon components:
interface CategoryPillProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  bgColor: string;
  textColor: string;
}

const CategoryPill: React.FC<CategoryPillProps> = ({
  icon,
  label,
  active = false,
  bgColor,
  textColor,
}) => {
  return (
    <div
      className="flex items-center gap-1 px-3 py-1.5 rounded-full"
      style={{
        // If it's active, we use the bgColor prop, else fallback to a translucent gray
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

// 2) Navigation Button
const NavButton = ({ 
  icon, 
  badge,
  active = false,
  color
}: { 
  icon: React.ReactNode; 
  badge?: string;
  active?: boolean;
  color: string;
}) => {
  return (
    <div className="relative p-2 flex flex-col items-center" style={{ opacity: active ? 1 : 0.7 }}>
      <div style={{ color }}>
        {icon}
      </div>
      {active && (
        <div 
          className="h-1 w-5 rounded-full mt-1"
          style={{ backgroundColor: color }}
        />
      )}
      {badge && (
        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
          <span className="text-[10px]">{badge}</span>
        </div>
      )}
    </div>
  );
};

// 3) Food Item
const FoodItem = ({ 
  brandBackgroundPrimary,
  brandContentOnPrimary,
  title,
  subtitle,
  imgEmoji
}: { 
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
  title: string;
  subtitle: string;
  imgEmoji: string;
}) => {
  // Map food items to appropriate icons
  const getIconForItem = (type: string) => {
    switch (type) {
      case "☕": return <Coffee size={32} />;
      case "🥗": return <Utensils size={32} />;
      case "🍔": return <Pizza size={32} />;
      case "🥯": return <Cookie size={32} />;
      default: return <Utensils size={32} />;
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-3">
      <div 
        className="w-16 h-16 rounded-full bg-white bg-opacity-20 mb-3 flex items-center justify-center"
        style={{ color: brandContentOnPrimary }}
      >
        {getIconForItem(imgEmoji)}
      </div>
      <div className="font-semibold text-sm" style={{ color: brandContentOnPrimary }}>{title}</div>
      <div className="text-xs opacity-90" style={{ color: brandContentOnPrimary }}>{subtitle}</div>
    </div>
  );
};

// 4) Restaurant Item
const RestaurantItem = ({ 
  name,
  time,
  promo,
  brandBackgroundPrimary,
  brandContentOnPrimary
}: { 
  name: string;
  time: string;
  promo?: string;
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
}) => {
  return (
    <div>
      <div className="h-20 bg-gray-200 rounded-lg mb-1 relative">
        {promo && (
          <div 
            className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded-lg font-medium"
            style={{ 
              backgroundColor: brandBackgroundPrimary,
              color: brandContentOnPrimary
            }}
          >
            {promo}
          </div>
        )}
      </div>
      <div className="text-xs font-semibold truncate">{name}</div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
};
