import React from "react";
import {
  Search,
  ShoppingBag,
  Home,
  User,
  Gift,
  Store,
  Utensils,
  Coffee,
  Leaf,
  Flame,
  Cookie,
  ShoppingCart
} from "lucide-react";
import { CategoryPill, NavButton, FoodItem } from "./sharedUI";

/** Props for the "PrimaryBackgroundScreen" mock. */
interface Props {
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
}

export const PrimaryBackgroundScreen: React.FC<Props> = ({
  brandBackgroundPrimary,
  brandContentOnPrimary,
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
        style={{ backgroundColor: brandBackgroundPrimary }}
      >
        {/* Status Bar */}
        <div className="px-4 py-2 flex justify-between items-center">
          <span style={{ color: brandContentOnPrimary, fontWeight: "500" }}>9:41</span>
          <div className="flex gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: brandContentOnPrimary }}
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: brandContentOnPrimary }}
            >
              <path d="M2 8L12 16L22 8" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="px-4 pt-2 pb-3">
          <div
            className="font-semibold text-sm mb-3"
            style={{ color: brandContentOnPrimary }}
          >
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
          <div
            className="text-xl font-bold mb-2"
            style={{ color: brandContentOnPrimary }}
          >
            BOGO Week Special <span>→</span>
          </div>
          <div className="mb-5 text-sm" style={{ color: brandContentOnPrimary }}>
            Buy 1, get 1 free on featured items
          </div>

          {/* Food Grid - now passing Lucide icons instead of emojis */}
          <div className="grid grid-cols-2 gap-4">
            <FoodItem 
              brandBackgroundPrimary={brandBackgroundPrimary}
              brandContentOnPrimary={brandContentOnPrimary}
              title="Coffee Shop"
              subtitle="Hot & Cold Drinks"
              icon={<Coffee size={32} />} // replaced emoji with lucide icon
            />
            <FoodItem 
              brandBackgroundPrimary={brandBackgroundPrimary}
              brandContentOnPrimary={brandContentOnPrimary}
              title="Fresh Greens"
              subtitle="Salads & Bowls"
              icon={<Leaf size={32} />} // example for salad/greens
            />
            <FoodItem 
              brandBackgroundPrimary={brandBackgroundPrimary}
              brandContentOnPrimary={brandContentOnPrimary}
              title="Grill House"
              subtitle="Burgers & Sandwiches"
              icon={<Flame size={32} />} // example flame for a grill house
            />
            <FoodItem 
              brandBackgroundPrimary={brandBackgroundPrimary}
              brandContentOnPrimary={brandContentOnPrimary}
              title="Breakfast Bar"
              subtitle="Morning Essentials"
              icon={<Cookie size={32} />} // e.g. cookie for breakfast pastries
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
  );
};
