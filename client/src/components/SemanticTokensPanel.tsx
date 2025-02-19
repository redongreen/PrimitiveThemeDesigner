import React from "react";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getContrastRatio, getBestContrastColor } from "@/lib/color";

interface ColorStop {
  hex: string;
}

interface Point {
  step: number;
  value: number;
}

interface SemanticTokensPanelProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
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
  const ratio = contrastWith ? getContrastRatio(color || "#000", contrastWith) : null;

  let displayValue = "auto";
  if (rampIndex >= 0) {
    displayValue = `${(rampIndex + 1) * 100}`;
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
      style={{ backgroundColor: background, border: border ? `1px solid ${border}` : undefined }}
    >
      <div className="text-xs space-y-1" style={{ color: foreground }}>
        <div>background: {semanticMapping.background}</div>
        <div>foreground: {semanticMapping.foreground}</div>
        {semanticMapping.border && <div>border: {semanticMapping.border}</div>}

        <div className="mt-2">
          {mainRatio.toFixed(2)}:1
          {alternativeBackground && (
            <span className="ml-2">(alternative: {altRatio?.toFixed(2)}:1)</span>
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
  return (
    <div className="flex gap-8">
      {/* LEFT COLUMN: The tokens list */}
      <div className="w-96">
        <h2 className="text-lg font-semibold mb-6">Semantic Tokens</h2>

        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium mb-4">Background</h3>
          <ColorToken
            color={ramp[semanticIndices.brandBackgroundPrimary]?.hex || "#000"}
            name="brandBackgroundPrimary"
            rampIndex={semanticIndices.brandBackgroundPrimary ?? -1}
            contrastWith="#000000"
          />
          <ColorToken
            color={ramp[semanticIndices.brandBackgroundSecondary]?.hex || "#000"}
            name="brandBackgroundSecondary"
            rampIndex={semanticIndices.brandBackgroundSecondary ?? -1}
            contrastWith="#5E5E5E"
          />
          <ColorToken
            color={ramp[semanticIndices.brandBackgroundDisabled]?.hex || "#000"}
            name="brandBackgroundDisabled"
            rampIndex={semanticIndices.brandBackgroundDisabled ?? -1}
          />
        </Card>

        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium mb-4">Foreground</h3>
          <ColorToken
            color={ramp[semanticIndices.brandContentPrimary]?.hex || "#FFF"}
            name="brandContentPrimary"
            rampIndex={semanticIndices.brandContentPrimary ?? -1}
            contrastWith="#FFFFFF"
          />
          <ColorToken
            color={
              getBestContrastColor(ramp[semanticIndices.brandBackgroundPrimary]?.hex)?.color ||
              "#FFFFFF"
            }
            name="brandContentOnPrimary"
            rampIndex={-1}
            contrastWith={ramp[semanticIndices.brandBackgroundPrimary]?.hex}
          />
          <ColorToken
            color={ramp[semanticIndices.brandContentOnSecondary]?.hex || "#FFF"}
            name="brandContentOnSecondary"
            rampIndex={semanticIndices.brandContentOnSecondary ?? -1}
            contrastWith={ramp[semanticIndices.brandBackgroundSecondary]?.hex}
          />
          <ColorToken
            color={ramp[semanticIndices.brandContentDisabled]?.hex || "#AAA"}
            name="brandContentDisabled"
            rampIndex={semanticIndices.brandContentDisabled ?? -1}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-4">Border</h3>
          <ColorToken
            color={ramp[semanticIndices.brandBorderAccessible]?.hex || "#FFF"}
            name="brandBorderAccessible"
            rampIndex={semanticIndices.brandBorderAccessible ?? -1}
            contrastWith="#FFFFFF"
          />
          <ColorToken
            color={ramp[semanticIndices.brandBorderSubtle]?.hex || "#CCC"}
            name="brandBorderSubtle"
            rampIndex={semanticIndices.brandBorderSubtle ?? -1}
          />
        </Card>
      </div>

      {/* RIGHT COLUMN: The "phone" or pairing demos */}
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
                  background={ramp[semanticIndices.brandBackgroundPrimary]?.hex || "#6366f1"}
                  foreground={
                    getBestContrastColor(ramp[semanticIndices.brandBackgroundPrimary]?.hex)?.color ||
                    "#FFFFFF"
                  }
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
                  background={ramp[semanticIndices.brandBackgroundSecondary]?.hex || "#E5E5E5"}
                  foreground={ramp[semanticIndices.brandContentOnSecondary]?.hex || "#000000"}
                  semanticMapping={{
                    background: "brandBackgroundSecondary",
                    foreground: "brandContentOnSecondary",
                  }}
                />

                <div className="text-xs text-muted-foreground mb-2 mt-4">
                  Secondary Background with Neutral Foregrounds
                </div>
                <ColorPairing
                  background={ramp[semanticIndices.brandBackgroundSecondary]?.hex || "#E5E5E5"}
                  foreground="#000000"
                  secondaryForeground="#4B4B4B"
                  tertiaryForeground="#5E5E5E"
                  border={ramp[semanticIndices.brandBorderSubtle]?.hex}
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
                  foreground={ramp[semanticIndices.brandContentPrimary]?.hex || "#000000"}
                  border={ramp[semanticIndices.brandBorderAccessible]?.hex}
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
                      background: `linear-gradient(90deg, ${
                        ramp[semanticIndices.brandBorderAccessible]?.hex || "#6366f1"
                      } 0%, ${
                        ramp[semanticIndices.brandBorderAccessible]?.hex || "#6366f1"
                      } 100%)`,
                      animation: "progress 2s linear infinite",
                    }}
                  />
                </div>

                <h5 className="text-xs font-medium mb-2 mt-6">Disabled</h5>
                <div className="text-xs text-muted-foreground mb-2">
                  Disabled State Example
                </div>
                <ColorPairing
                  background={ramp[semanticIndices.brandBackgroundDisabled]?.hex || "#EFEFEF"}
                  foreground={ramp[semanticIndices.brandContentDisabled]?.hex || "#B2B2B2"}
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
    </div>
  );
};