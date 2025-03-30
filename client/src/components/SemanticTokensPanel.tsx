import React from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getContrastRatio, type ColorStop } from "@/lib/color";
import {
  SPECIAL_BLACK_INDEX,
  SPECIAL_WHITE_INDEX,
} from "@/lib/semanticTokens";
import { PromotionalPreview } from "@/components/PromotionalPreview";

interface SemanticTokensPanelProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
}

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

function PairingExample({
  background,
  foreground,
  border,
  label
}: {
  background: string;
  foreground: string;
  border?: string;
  label: string;
}) {
  const contrastRatio = getContrastRatio(foreground, background);
  
  return (
    <div 
      className="p-3 rounded-lg"
      style={{ 
        backgroundColor: background,
        border: border ? `1px solid ${border}` : undefined,
      }}
    >
      <div className="text-xs mb-1" style={{ color: foreground }}>
        {label}
      </div>
      <div className="text-xs text-muted-foreground" style={{ color: foreground }}>
        {contrastRatio.toFixed(2)}:1
      </div>
    </div>
  );
}

const TokenTableRow = ({ 
  name,
  color,
  rampIndex,
  contrastWith,
  sampleText,
  sampleStyle,
  accessiblePairing
}: { 
  name: string;
  color: string;
  rampIndex: number;
  contrastWith?: string;
  sampleText?: string;
  sampleStyle?: React.CSSProperties;
  accessiblePairing?: React.ReactNode;
}) => {
  const { toast } = useToast();
  let displayValue = "auto";
  if (rampIndex >= 0) {
    displayValue = `${(rampIndex + 1) * 100}`;
  } else if (rampIndex === SPECIAL_BLACK_INDEX) {
    displayValue = "Black";
  } else if (rampIndex === SPECIAL_WHITE_INDEX) {
    displayValue = "White";
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color).then(() => {
      toast({
        title: "Copied!",
        description: `${color} has been copied to your clipboard`,
      });
    });
  };

  return (
    <tr className="border-b">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded border border-border"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm">{name}</span>
        </div>
      </td>
      <td className="p-3">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="text-muted-foreground">{displayValue}</span>
          <button
            className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </td>
      <td className="p-3">
        {accessiblePairing}
      </td>
    </tr>
  );
};

export const SemanticTokensPanel: React.FC<SemanticTokensPanelProps> = ({
  ramp,
  semanticIndices,
}) => {
  // We'll consistently fetch colors from the ramp (or special indexes)
  const getColor = (tokenName: string) => {
    const idx = semanticIndices[tokenName] ?? -1;
    return getColorFromIndex(ramp, idx);
  };

  // Get all semantic colors for use in the table
  const tokenColors = {
    brandBackgroundPrimary: getColor("brandBackgroundPrimary"),
    brandBackgroundSecondary: getColor("brandBackgroundSecondary"),
    brandBackgroundDisabled: getColor("brandBackgroundDisabled"),
    brandContentPrimary: getColor("brandContentPrimary"),
    brandContentOnPrimary: getColor("brandContentOnPrimary"),
    brandContentOnSecondary: getColor("brandContentOnSecondary"),
    brandContentDisabled: getColor("brandContentDisabled"),
    brandBorderAccessible: getColor("brandBorderAccessible"),
    brandBorderSubtle: getColor("brandBorderSubtle"),
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEMANTIC TOKENS SECTION */}
        <div>
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Semantic Color System</h2>
            
            {/* Combined Semantic Tokens and Accessibility Table */}
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left p-3 w-48 text-sm">Token Name</th>
                  <th className="text-left p-3 w-28 text-sm">Color Value</th>
                  <th className="text-left p-3 text-sm">Accessible Pairing</th>
                </tr>
              </thead>
              <tbody>
                {/* Background Tokens */}
                <tr className="border-b">
                  <td colSpan={3} className="px-3 py-2 bg-muted/40 text-sm">Background Tokens</td>
                </tr>
                <TokenTableRow 
                  name="brandBackgroundPrimary" 
                  color={tokenColors.brandBackgroundPrimary}
                  rampIndex={semanticIndices.brandBackgroundPrimary ?? -1}
                  contrastWith="#000000"
                  sampleText="Primary Background"
                  sampleStyle={{ 
                    backgroundColor: tokenColors.brandBackgroundPrimary,
                    color: tokenColors.brandContentOnPrimary,
                    padding: '8px 12px',
                    borderRadius: '6px',
                  }}
                  accessiblePairing={
                    <PairingExample 
                      background={tokenColors.brandBackgroundPrimary}
                      foreground={tokenColors.brandContentOnPrimary}
                      label="with brandContentOnPrimary"
                    />
                  }
                />
                <TokenTableRow 
                  name="brandBackgroundSecondary" 
                  color={tokenColors.brandBackgroundSecondary}
                  rampIndex={semanticIndices.brandBackgroundSecondary ?? -1}
                  contrastWith="#5E5E5E"
                  sampleText="Secondary Background" 
                  sampleStyle={{ 
                    backgroundColor: tokenColors.brandBackgroundSecondary,
                    color: tokenColors.brandContentOnSecondary,
                    padding: '8px 12px',
                    borderRadius: '6px'
                  }}
                  accessiblePairing={
                    <PairingExample 
                      background={tokenColors.brandBackgroundSecondary}
                      foreground={tokenColors.brandContentOnSecondary}
                      label="with brandContentOnSecondary"
                    />
                  }
                />
                {/* Add the rest of your token rows here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* PROMOTIONAL PREVIEW SECTION */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Promotional Preview</h2>
          <PromotionalPreview ramp={ramp} semanticIndices={semanticIndices} />
        </div>
      </div>
    </div>
  );
};