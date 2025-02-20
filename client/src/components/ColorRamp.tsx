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

  const getBrightnessValue = (index: number): number => {
    return (index + 1) * 100;
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      toast({
        title: "Copied!",
        description: `${hex} has been copied to your clipboard`
      });
    });
  };

  // Calculate the midpoint to split colors into two rows on small screens
  const midPoint = Math.ceil(colors.length / 2);
  const firstRow = colors.slice(0, midPoint);
  const secondRow = colors.slice(midPoint);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Color Ramp</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(colors.map(c => c.hex).join('\n'))}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Values
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-0">
        {/* First row */}
        <div className="flex flex-1">
          {firstRow.map((color, i) => {
            const contrast = getBestContrastColor(color.hex);
            const brightnessValue = getBrightnessValue(i);

            return (
              <div
                key={i}
                className="flex-1 h-20 relative group"
                style={{ backgroundColor: color.hex }}
              >
                <div 
                  className="absolute inset-0 p-2 flex flex-col justify-between text-[10px] font-mono"
                  style={{ color: contrast.color }}
                >
                  <div>{brightnessValue}</div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <span>{color.hex}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                      onClick={() => copyToClipboard(color.hex)}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy hex code</span>
                    </Button>
                  </div>
                  <div>{contrast.ratio.toFixed(2)}:1</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Second row */}
        <div className="flex flex-1">
          {secondRow.map((color, i) => {
            const actualIndex = i + midPoint;
            const contrast = getBestContrastColor(color.hex);
            const brightnessValue = getBrightnessValue(actualIndex);

            return (
              <div
                key={actualIndex}
                className="flex-1 h-20 relative group"
                style={{ backgroundColor: color.hex }}
              >
                <div 
                  className="absolute inset-0 p-2 flex flex-col justify-between text-[10px] font-mono"
                  style={{ color: contrast.color }}
                >
                  <div>{brightnessValue}</div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <span>{color.hex}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                      onClick={() => copyToClipboard(color.hex)}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy hex code</span>
                    </Button>
                  </div>
                  <div>{contrast.ratio.toFixed(2)}:1</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}