import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import type { ColorStop } from '@/lib/color';
import { getBestContrastColor } from '@/lib/color';
import { useToast } from '@/hooks/use-toast';

interface ColorRampProps {
  colors: ColorStop[];
}

export function ColorRamp({ colors }: ColorRampProps) {
  const { toast } = useToast();
  const brightnessValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100];

  const copyToClipboard = () => {
    const text = colors
      .map((color, i) => `${brightnessValues[i] || brightnessValues[brightnessValues.length - 1]}: ${color.hex}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Color values have been copied to your clipboard"
      });
    });
  };

  const getAccessibilityLevel = (ratio: number): string => {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    return "";
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Color Ramp</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Values
        </Button>
      </div>

      <div className="flex">
        {colors.map((color, i) => {
          const contrast = getBestContrastColor(color.hex);
          const brightnessValue = brightnessValues[i] || brightnessValues[brightnessValues.length - 1];
          return (
            <div
              key={i}
              className="flex-1 h-20 relative"
              style={{ backgroundColor: color.hex }}
            >
              <div 
                className="absolute inset-0 p-2 flex flex-col justify-between text-[10px] font-mono"
                style={{ color: contrast.color }}
              >
                <div>{brightnessValue}</div>
                <div>{contrast.ratio.toFixed(2)}:1 {getAccessibilityLevel(contrast.ratio)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}