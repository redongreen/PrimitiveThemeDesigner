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

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">Semantic Tokens</TabsTrigger>
          <TabsTrigger value="pairings">Accessible Pairings</TabsTrigger>
          <TabsTrigger value="promotional">Promotional Preview</TabsTrigger>
        </TabsList>

        {/* TOKENS TAB */}
        <TabsContent value="tokens" className="mt-6">
          <div className="flex gap-8">
            <div className="w-96">
              <h2 className="text-lg font-semibold mb-6">Semantic Tokens</h2>

              <Card className="p-4 mb-6">
                <h3 className="text-sm font-medium mb-4">Background</h3>
                <ColorToken
                  color={getColor("brandBackgroundPrimary")}
                  name="brandBackgroundPrimary"
                  rampIndex={semanticIndices.brandBackgroundPrimary ?? -1}
                  contrastWith="#000000"
                />
                <ColorToken
                  color={getColor("brandBackgroundSecondary")}
                  name="brandBackgroundSecondary"
                  rampIndex={semanticIndices.brandBackgroundSecondary ?? -1}
                  contrastWith="#5E5E5E"
                />
                <ColorToken
                  color={getColor("brandBackgroundDisabled")}
                  name="brandBackgroundDisabled"
                  rampIndex={semanticIndices.brandBackgroundDisabled ?? -1}
                />
              </Card>

              <Card className="p-4 mb-6">
                <h3 className="text-sm font-medium mb-4">Foreground</h3>
                <ColorToken
                  color={getColor("brandContentPrimary")}
                  name="brandContentPrimary"
                  rampIndex={semanticIndices.brandContentPrimary ?? -1}
                  contrastWith="#FFFFFF"
                />
                <ColorToken
                  color={getColor("brandContentOnPrimary")}
                  name="brandContentOnPrimary"
                  rampIndex={semanticIndices.brandContentOnPrimary ?? -1}
                  contrastWith={getColor("brandBackgroundPrimary")}
                />
                <ColorToken
                  color={getColor("brandContentOnSecondary")}
                  name="brandContentOnSecondary"
                  rampIndex={semanticIndices.brandContentOnSecondary ?? -1}
                  contrastWith={getColor("brandBackgroundSecondary")}
                />
                <ColorToken
                  color={getColor("brandContentDisabled")}
                  name="brandContentDisabled"
                  rampIndex={semanticIndices.brandContentDisabled ?? -1}
                />
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-medium mb-4">Border</h3>
                <ColorToken
                  color={getColor("brandBorderAccessible")}
                  name="brandBorderAccessible"
                  rampIndex={semanticIndices.brandBorderAccessible ?? -1}
                  contrastWith="#E8E8E8"
                />
                <ColorToken
                  color={getColor("brandBorderSubtle")}
                  name="brandBorderSubtle"
                  rampIndex={semanticIndices.brandBorderSubtle ?? -1}
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ACCESSIBLE PAIRINGS TAB */}
        <TabsContent value="pairings" className="mt-6">
          <div className="flex-1">
            <div className="flex flex-col mx-auto" style={{ width: "390px" }}>
              <div
                className="rounded-[48px] flex flex-col p-4"
                style={{
                  border: "6px solid rgba(0, 0, 0, 0.4)",
                }}
              >
                <div className="w-full rounded-[42px] bg-background p-4">
                  <h4 className="text-sm font-medium mb-4">Accessible Pairings</h4>

                  <div className="mt-6">
                    <h5 className="text-xs font-medium mb-2">Primary</h5>
                    <div className="text-xs text-muted-foreground mb-2">
                      Primary Background with On Primary Content
                    </div>
                    <ColorPairing
                      background={getColor("brandBackgroundPrimary")}
                      foreground={getColor("brandContentOnPrimary")}
                      semanticMapping={{
                        background: "brandBackgroundPrimary",
                        foreground: "brandContentOnPrimary",
                      }}
                    />

                    <h5 className="text-xs font-medium mb-2 mt-6">Secondary</h5>
                    <div className="text-xs text-muted-foreground mb-2">
                      Secondary Background with On Secondary Content
                    </div>
                    <ColorPairing
                      background={getColor("brandBackgroundSecondary")}
                      foreground={getColor("brandContentOnSecondary")}
                      semanticMapping={{
                        background: "brandBackgroundSecondary",
                        foreground: "brandContentOnSecondary",
                      }}
                    />

                    <div className="text-xs text-muted-foreground mb-2 mt-4">
                      Secondary Background with Neutral Foregrounds
                    </div>
                    <ColorPairing
                      background={getColor("brandBackgroundSecondary")}
                      foreground="#000000"
                      secondaryForeground="#4B4B4B"
                      tertiaryForeground="#5E5E5E"
                      border={getColor("brandBorderSubtle")}
                      semanticMapping={{
                        background: "brandBackgroundSecondary",
                        foreground: "#000000",
                        border: "brandBorderSubtle",
                      }}
                    />

                    <h5 className="text-xs font-medium mb-2 mt-6">Primary on Neutral</h5>
                    <div className="text-xs text-muted-foreground mb-2">
                      Primary Content on Neutral Background
                    </div>
                    <ColorPairing
                      background="#FFFFFF"
                      foreground={getColor("brandContentPrimary")}
                      border={getColor("brandBorderAccessible")}
                      alternativeBackground="#F3F3F3"
                      semanticMapping={{
                        background: "#FFFFFF",
                        foreground: "brandContentPrimary",
                        border: "brandBorderAccessible",
                      }}
                    />

                    {/* Example progress bar */}
                    <div className="mt-4 w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full w-full animate-progress"
                        style={{
                          background: `linear-gradient(90deg, ${getColor(
                            "brandBorderAccessible"
                          )} 0%, ${getColor(
                            "brandBorderAccessible"
                          )} 100%)`,
                          animation: "progress 2s linear infinite",
                        }}
                      />
                    </div>

                    <h5 className="text-xs font-medium mb-2 mt-6">Disabled</h5>
                    <div className="text-xs text-muted-foreground mb-2">
                      Disabled State Example
                    </div>
                    <ColorPairing
                      background={getColor("brandBackgroundDisabled")}
                      foreground={getColor("brandContentDisabled")}
                      semanticMapping={{
                        background: "brandBackgroundDisabled",
                        foreground: "brandContentDisabled",
                      }}
                    />
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
