import React from "react";
import { Car, Package, ArrowRight, Home, Clock, User, MapPin } from "lucide-react";
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
  const brandPrimary = getColor("brandBackgroundPrimary");
  const brandSecondary = getColor("brandBackgroundSecondary");
  const brandContentPrimary = getColor("brandContentPrimary");
  const brandContentOnPrimary = getColor("brandContentOnPrimary");
  const brandContentOnSecondary = getColor("brandContentOnSecondary");
  const brandBorderAccessible = getColor("brandBorderAccessible");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold mb-2">Full-Screen Promotional Preview</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Showcasing semantic color tokens in a ride-sharing and food delivery app interface
      </p>

      {/* Mobile device frame */}
      <div 
        className="mx-auto rounded-[36px] overflow-hidden shadow-lg"
        style={{ 
          width: "340px", 
          height: "680px", 
          border: "12px solid #111", 
          position: "relative"
        }}
      >
        {/* Welcome Splash Screen */}
        <div
          className="w-full h-full flex flex-col"
          style={{ backgroundColor: brandPrimary }}
        >
          {/* Status Bar */}
          <div className="px-4 py-2 flex justify-between items-center">
            <span style={{ color: brandContentOnPrimary }}>9:41</span>
            <div className="flex gap-1">
              <div style={{ color: brandContentOnPrimary }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 10V14M6 10V14M14 7V17M10 7V17" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ color: brandContentOnPrimary }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 10C6 7.79086 7.79086 6 10 6H14C16.2091 6 18 7.79086 18 10V14C18 16.2091 16.2091 18 14 18H10C7.79086 18 6 16.2091 6 14V10Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ color: brandContentOnPrimary }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 10H24" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 14H24" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 gap-8">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: brandSecondary }}
            >
              <Car 
                size={40} 
                style={{ color: brandContentPrimary }}
              />
            </div>
            
            <div className="text-center">
              <h1 
                className="text-3xl font-bold mb-2 animate-fadeIn"
                style={{ 
                  color: brandContentOnPrimary,
                  animationDelay: "0.2s" 
                }}
              >
                Spring Rides
              </h1>
              <p 
                className="text-lg mb-6 animate-fadeIn"
                style={{ 
                  color: brandContentOnPrimary,
                  animationDelay: "0.4s"
                }}
              >
                Get 30% off your next trip!
              </p>
              <div 
                className="rounded-full py-3 px-6 font-medium flex items-center justify-center gap-2 mx-auto animate-fadeIn"
                style={{ 
                  backgroundColor: "#FFFFFF", 
                  color: brandContentPrimary,
                  maxWidth: "200px",
                  animationDelay: "0.6s"
                }}
              >
                <span>Claim Offer</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
          
          {/* Bottom Navigation */}
          <div 
            className="p-4 grid grid-cols-4 gap-2"
            style={{ 
              borderTop: `1px solid ${brandBorderAccessible}` 
            }}
          >
            <NavItem 
              icon={<Home size={20} />} 
              label="Home" 
              active 
              color={brandContentOnPrimary} 
            />
            <NavItem 
              icon={<Package size={20} />} 
              label="Orders" 
              color={brandContentOnPrimary} 
            />
            <NavItem 
              icon={<Clock size={20} />} 
              label="History" 
              color={brandContentOnPrimary} 
            />
            <NavItem 
              icon={<User size={20} />} 
              label="Profile" 
              color={brandContentOnPrimary} 
            />
          </div>
        </div>
        
        {/* Card overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5 animate-slideUp"
          style={{ 
            backgroundColor: brandSecondary,
            maxHeight: "45%",
            animationDelay: "0.8s"
          }}
        >
          <h2 
            className="font-bold text-lg mb-3 animate-fadeIn"
            style={{ 
              color: brandContentOnSecondary,
              animationDelay: "1.2s"
            }}
          >
            Recent Location
          </h2>
          
          <div 
            className="flex items-center p-3 rounded-xl mb-3 animate-fadeIn"
            style={{ 
              backgroundColor: "#FFFFFF",
              border: `1px solid ${brandBorderAccessible}`,
              animationDelay: "1.4s" 
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: brandPrimary }}
            >
              <MapPin size={16} style={{ color: brandContentOnPrimary }} />
            </div>
            <div>
              <div className="font-medium" style={{ color: brandContentPrimary }}>
                Downtown Office
              </div>
              <div className="text-xs" style={{ color: "#666" }}>
                123 Business Ave, Floor 12
              </div>
            </div>
          </div>
          
          <button 
            className="w-full rounded-xl py-3 font-medium animate-fadeIn"
            style={{ 
              backgroundColor: brandPrimary,
              color: brandContentOnPrimary,
              animationDelay: "1.6s"
            }}
          >
            Book a Ride
          </button>
        </div>
      </div>
      
      {/* Secondary promo screen */}
      <div 
        className="mx-auto rounded-[36px] overflow-hidden shadow-lg mt-10"
        style={{ 
          width: "340px", 
          height: "680px", 
          border: "12px solid #111", 
          position: "relative"
        }}
      >
        <div
          className="w-full h-full flex flex-col relative"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 flex justify-between items-center"
            style={{ 
              backgroundColor: brandSecondary,
              color: brandContentOnSecondary
            }}
          >
            <button className="font-medium">Back</button>
            <h2 className="font-bold">Seasonal Offers</h2>
            <div></div>
          </div>
          
          {/* Main Content */}
          <div className="p-6">
            <div 
              className="rounded-2xl overflow-hidden mb-6 animate-fadeIn"
              style={{ 
                border: `1px solid ${brandBorderAccessible}`,
                animationDelay: "0.2s"
              }}
            >
              <div 
                className="p-4 font-bold"
                style={{ 
                  backgroundColor: brandPrimary,
                  color: brandContentOnPrimary 
                }}
              >
                LIMITED TIME
              </div>
              <div className="p-4">
                <h3 
                  className="font-bold text-xl mb-2"
                  style={{ color: brandContentPrimary }}
                >
                  Spring Food Festival
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Order from participating restaurants and save up to 40% on your order.
                </p>
                <div className="flex justify-between items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: brandContentPrimary }}
                  >
                    Ends in 3 days
                  </span>
                  <button 
                    className="px-4 py-2 rounded-full text-sm font-medium animate-pulse"
                    style={{ 
                      backgroundColor: brandPrimary,
                      color: brandContentOnPrimary
                    }}
                  >
                    View Offers
                  </button>
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-2xl overflow-hidden animate-fadeIn"
              style={{ 
                border: `1px solid ${brandBorderAccessible}`,
                animationDelay: "0.4s"
              }}
            >
              <div 
                className="p-4 font-bold"
                style={{ 
                  backgroundColor: brandSecondary,
                  color: brandContentOnSecondary
                }}
              >
                RECOMMENDED
              </div>
              <div className="p-4">
                <h3 
                  className="font-bold text-xl mb-2"
                  style={{ color: brandContentPrimary }}
                >
                  Weekend Getaway
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use code WEEKEND25 for 25% off rides to popular destinations.
                </p>
                <div className="flex justify-between items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: brandContentPrimary }}
                  >
                    Valid on weekends
                  </span>
                  <button 
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: brandSecondary,
                      color: brandContentOnSecondary
                    }}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for navigation items
const NavItem = ({ 
  icon, 
  label, 
  active = false,
  color
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  color: string;
}) => {
  return (
    <div className="flex flex-col items-center" style={{ opacity: active ? 1 : 0.7 }}>
      <div style={{ color }}>
        {icon}
      </div>
      <span 
        className="text-xs mt-1"
        style={{ color }}
      >
        {label}
      </span>
      {active && (
        <div 
          className="h-1 w-6 rounded-full mt-1"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};