import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getContrastRatio, type ColorStop } from "@/lib/color";
import {
  SPECIAL_BLACK_INDEX,
  SPECIAL_WHITE_INDEX,
} from "@/lib/semanticTokens";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromotionalPreview } from "@/components/PromotionalPreview";

interface SemanticTokensPanelProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
}

/**
 * We'll interpret negative indexes as special black/white.
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

function ColorToken({
  color,
  name,
  rampIndex,
  contrastWith,
}: {
  color: string;
  name: string;
  rampIndex: number;
  contrastWith?: string;
}) {
  const { toast } = useToast();
  const ratio = contrastWith ? getContrastRatio(color, contrastWith) : null;

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
    <div className="flex items-center gap-3 mb-2">
      <div
        className="w-6 h-6 rounded border border-border"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <span className="font-mono text-sm">{name}</span>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
          {displayValue} <span className="text-muted-foreground">({color})</span>
          <button
            className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
      {ratio && (
        <span className="text-xs text-muted-foreground">
          {ratio.toFixed(2)}:1
        </span>
      )}
    </div>
  );
}

function ColorPairing({
  background,
  foreground,
  secondaryForeground,
  tertiaryForeground,
  border,
  alternativeBackground,
  semanticMapping,
}: {
  background: string;
  foreground: string;
  secondaryForeground?: string;
  tertiaryForeground?: string;
  border?: string;
  alternativeBackground?: string;
  semanticMapping: {
    background: string;
    foreground: string;
    border?: string;
  };
}) {
  const mainRatio = getContrastRatio(foreground, background);
  const altRatio = alternativeBackground ? getContrastRatio(foreground, alternativeBackground) : null;
  const secRatio = secondaryForeground ? getContrastRatio(secondaryForeground, background) : null;
  const terRatio = tertiaryForeground ? getContrastRatio(tertiaryForeground, background) : null;

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{
        backgroundColor: background,
        border: border ? `1px solid ${border}` : undefined,
      }}
    >
      <div className="text-xs space-y-1" style={{ color: foreground }}>
        <div>background: {semanticMapping.background}</div>
        <div>foreground: {semanticMapping.foreground}</div>
        {semanticMapping.border && <div>border: {semanticMapping.border}</div>}

        <div className="mt-2">
          {mainRatio.toFixed(2)}:1
          {alternativeBackground && (
            <span className="ml-2">
              (alternative: {altRatio?.toFixed(2)}:1)
            </span>
          )}
        </div>

        {secondaryForeground && (
          <div style={{ color: secondaryForeground }} className="mt-1">
            secondary: {secondaryForeground} ({secRatio?.toFixed(2)}:1)
          </div>
        )}
        {tertiaryForeground && (
          <div style={{ color: tertiaryForeground }} className="mt-1">
            tertiary: {tertiaryForeground} ({terRatio?.toFixed(2)}:1)
          </div>
        )}
      </div>
    </div>
  );
}

export const SemanticTokensPanel: React.FC<SemanticTokensPanelProps> = ({
  ramp,
  semanticIndices,
}) => {
  // We'll consistently fetch colors from the ramp (or special indexes)
  const getColor = (tokenName: string) => {
    const idx = semanticIndices[tokenName] ?? -1;
    return getColorFromIndex(ramp, idx);
  };

  const [activeTab, setActiveTab] = useState<string>("tokens");

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tokens">Semantic Tokens & Pairings</TabsTrigger>
          <TabsTrigger value="promotional">Promotional Preview</TabsTrigger>
        </TabsList>

        {/* TOKENS TAB */}
        <TabsContent value="tokens" className="mt-6">
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Semantic Color System</h2>
            
            {/* Combined Semantic Tokens and Accessibility Table */}
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left p-3 w-48 font-mono text-sm">Token Name</th>
                  <th className="text-left p-3 w-28 font-mono text-sm">Color Value</th>
                  <th className="text-left p-3 font-mono text-sm">Accessible Pairing</th>
                </tr>
              </thead>
              <tbody>
                {/* Background Tokens */}
                <tr className="border-b">
                  <td colSpan={3} className="px-3 py-2 bg-muted/40 font-mono text-sm">Background Tokens</td>
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
                <TokenTableRow 
                  name="brandBackgroundDisabled" 
                  color={tokenColors.brandBackgroundDisabled}
                  rampIndex={semanticIndices.brandBackgroundDisabled ?? -1}
                  sampleText="Disabled Background" 
                  sampleStyle={{ 
                    backgroundColor: tokenColors.brandBackgroundDisabled,
                    color: tokenColors.brandContentDisabled,
                    padding: '8px 12px',
                    borderRadius: '6px'
                  }}
                  accessiblePairing={
                    <PairingExample 
                      background={tokenColors.brandBackgroundDisabled}
                      foreground={tokenColors.brandContentDisabled}
                      label="with brandContentDisabled"
                    />
                  }
                />

                {/* Content Tokens */}
                <tr className="border-b">
                  <td colSpan={3} className="px-3 py-2 bg-muted/40 font-mono text-sm">Content Tokens</td>
                </tr>
                <TokenTableRow 
                  name="brandContentPrimary" 
                  color={tokenColors.brandContentPrimary}
                  rampIndex={semanticIndices.brandContentPrimary ?? -1}
                  contrastWith="#FFFFFF"
                  sampleText="Primary Content" 
                  sampleStyle={{ 
                    backgroundColor: "#FFFFFF",
                    color: tokenColors.brandContentPrimary,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${tokenColors.brandBorderAccessible}`
                  }}
                  accessiblePairing={
                    <PairingExample 
                      background="#FFFFFF"
                      foreground={tokenColors.brandContentPrimary}
                      border={tokenColors.brandBorderAccessible}
                      label="on White Background"
                    />
                  }
                />
                <TokenTableRow 
                  name="brandContentOnPrimary" 
                  color={tokenColors.brandContentOnPrimary}
                  rampIndex={semanticIndices.brandContentOnPrimary ?? -1}
                  contrastWith={tokenColors.brandBackgroundPrimary}
                  sampleText="Content On Primary" 
                  sampleStyle={{ 
                    backgroundColor: tokenColors.brandBackgroundPrimary,
                    color: tokenColors.brandContentOnPrimary,
                    padding: '8px 12px',
                    borderRadius: '6px'
                  }}
                  accessiblePairing={
                    <PairingExample 
                      background={tokenColors.brandBackgroundPrimary}
                      foreground={tokenColors.brandContentOnPrimary}
                      label="on Primary Background"
                    />
                  }
                />
                <TokenTableRow 
                  name="brandContentOnSecondary" 
                  color={tokenColors.brandContentOnSecondary}
                  rampIndex={semanticIndices.brandContentOnSecondary ?? -1}
                  contrastWith={tokenColors.brandBackgroundSecondary}
                  sampleText="Content On Secondary" 
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
                      label="on Secondary Background"
                    />
                  }
                />
                <TokenTableRow 
                  name="brandContentDisabled" 
                  color={tokenColors.brandContentDisabled}
                  rampIndex={semanticIndices.brandContentDisabled ?? -1}
                  sampleText="Disabled Content" 
                  sampleStyle={{ 
                    backgroundColor: tokenColors.brandBackgroundDisabled,
                    color: tokenColors.brandContentDisabled,
                    padding: '8px 12px',
                    borderRadius: '6px'
                  }}
                  accessiblePairing={
                    <PairingExample 
                      background={tokenColors.brandBackgroundDisabled}
                      foreground={tokenColors.brandContentDisabled}
                      label="on Disabled Background"
                    />
                  }
                />

                {/* Border Tokens */}
                <tr className="border-b">
                  <td colSpan={3} className="px-3 py-2 bg-muted/40 font-mono text-sm">Border Tokens</td>
                </tr>
                <TokenTableRow 
                  name="brandBorderAccessible" 
                  color={tokenColors.brandBorderAccessible}
                  rampIndex={semanticIndices.brandBorderAccessible ?? -1}
                  contrastWith="#E8E8E8"
                  sampleText="Accessible Border" 
                  sampleStyle={{ 
                    backgroundColor: "#FFFFFF",
                    color: tokenColors.brandContentPrimary,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `3px solid ${tokenColors.brandBorderAccessible}`
                  }}
                  accessiblePairing={
                    <div 
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        border: `2px solid ${tokenColors.brandBorderAccessible}`
                      }}
                    >
                      <div className="text-xs" style={{ color: tokenColors.brandContentPrimary }}>
                        Border example
                      </div>
                    </div>
                  }
                />
                <TokenTableRow 
                  name="brandBorderSubtle" 
                  color={tokenColors.brandBorderSubtle}
                  rampIndex={semanticIndices.brandBorderSubtle ?? -1}
                  sampleText="Subtle Border" 
                  sampleStyle={{ 
                    backgroundColor: "#FFFFFF",
                    color: tokenColors.brandContentPrimary,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `3px solid ${tokenColors.brandBorderSubtle}`
                  }}
                  accessiblePairing={
                    <div 
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: tokenColors.brandBackgroundSecondary,
                        border: `2px solid ${tokenColors.brandBorderSubtle}`,
                        color: "#000000"
                      }}
                    >
                      <div className="text-xs">
                        Subtle border example
                      </div>
                    </div>
                  }
                />
              </tbody>
            </table>

            {/* Common UI Element Pairings */}
            <h3 className="text-md font-semibold mt-8 mb-4">Common UI Element Examples</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Button example */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-mono mb-2">Primary Button</h4>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 rounded-md font-medium"
                    style={{ 
                      backgroundColor: tokenColors.brandBackgroundPrimary,
                      color: tokenColors.brandContentOnPrimary
                    }}
                  >
                    Primary
                  </button>
                  <button 
                    className="px-4 py-2 rounded-md font-medium"
                    style={{ 
                      backgroundColor: tokenColors.brandBackgroundSecondary,
                      color: tokenColors.brandContentOnSecondary
                    }}
                  >
                    Secondary
                  </button>
                  <button 
                    className="px-4 py-2 rounded-md font-medium opacity-60 cursor-not-allowed"
                    style={{ 
                      backgroundColor: tokenColors.brandBackgroundDisabled,
                      color: tokenColors.brandContentDisabled
                    }}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              {/* Card example */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-mono mb-2">Card Component</h4>
                <div
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: tokenColors.brandBackgroundSecondary,
                    border: `1px solid ${tokenColors.brandBorderSubtle}`
                  }}
                >
                  <div className="font-medium mb-1" style={{ color: tokenColors.brandContentOnSecondary }}>
                    Card Title
                  </div>
                  <div className="text-xs mb-3" style={{ color: tokenColors.brandContentOnSecondary }}>
                    Card description text with semantic tokens
                  </div>
                  <div 
                    className="text-xs px-2 py-1 rounded-md inline-block"
                    style={{ 
                      backgroundColor: tokenColors.brandBackgroundPrimary,
                      color: tokenColors.brandContentOnPrimary
                    }}
                  >
                    Tag Example
                  </div>
                </div>
              </div>

              {/* Progress bar example */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-mono mb-2">Progress Bar</h4>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full animate-progress"
                    style={{
                      width: "60%",
                      background: tokenColors.brandBackgroundPrimary,
                    }}
                  />
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full animate-progress"
                    style={{
                      width: "40%",
                      background: tokenColors.brandBorderAccessible,
                    }}
                  />
                </div>
              </div>

              {/* Form elements */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-mono mb-2">Form Elements</h4>
                <div>
                  <div className="mb-2">
                    <input 
                      type="text" 
                      className="w-full px-3 py-1.5 text-sm rounded-md mb-2" 
                      placeholder="Input field"
                      style={{ 
                        border: `1px solid ${tokenColors.brandBorderSubtle}`,
                        color: tokenColors.brandContentPrimary
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-4 h-4 flex items-center justify-center rounded-sm"
                      style={{ 
                        backgroundColor: tokenColors.brandBackgroundPrimary,
                        border: `1px solid ${tokenColors.brandBorderAccessible}`
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5L4 8L9 2" stroke={tokenColors.brandContentOnPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-xs">Checkbox example</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* PROMOTIONAL PREVIEW TAB */}
        <TabsContent value="promotional" className="mt-6">
          <PromotionalPreview 
            ramp={ramp} 
            semanticIndices={semanticIndices}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for token rows in the table
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
  sampleText: string;
  sampleStyle: React.CSSProperties;
  accessiblePairing: React.ReactNode;
}) => {
  const { toast } = useToast();
  const ratio = contrastWith ? getContrastRatio(color, contrastWith) : null;

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
    <tr className="border-b hover:bg-muted/20">
      <td className="p-3 font-mono text-xs">{name}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border" style={{ backgroundColor: color }} />
          <div>
            <div className="text-xs font-mono">{color}</div>
            <div className="text-xs text-muted-foreground">{displayValue}</div>
          </div>
          <button
            className="p-1 opacity-50 hover:opacity-100"
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

// Helper component for showing pairings
const PairingExample = ({
  background,
  foreground,
  border,
  label,
}: {
  background: string;
  foreground: string;
  border?: string;
  label: string;
}) => {
  const ratio = getContrastRatio(foreground, background);
  
  // Determine if the contrast meets WCAG requirements
  const isAALarge = ratio >= 3;
  const isAA = ratio >= 4.5;
  const isAAA = ratio >= 7;
  
  return (
    <div 
      className="p-3 rounded-lg"
      style={{
        backgroundColor: background,
        border: border ? `1px solid ${border}` : undefined,
      }}
    >
      <div className="text-xs font-mono mb-1" style={{ color: foreground }}>
        Sample text {label}
      </div>
      <div 
        className="text-xs font-mono py-1 px-2 rounded-sm mt-1 inline-block"
        style={{
          backgroundColor: "#000000", 
          color: "#FFFFFF",
        }}
      >
        {ratio.toFixed(2)}:1 contrast
        {isAAA && " (AAA)"}
        {!isAAA && isAA && " (AA)"}
        {!isAA && isAALarge && " (AA Large)"}
      </div>
    </div>
  );
};
