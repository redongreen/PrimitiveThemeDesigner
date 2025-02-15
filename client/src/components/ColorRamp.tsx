import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Copy } from 'lucide-react';
import type { ColorStop } from '@/lib/color';
import { useToast } from '@/hooks/use-toast';

interface ColorRampProps {
  colors: ColorStop[];
  onAdjustColor: (index: number, property: 'l' | 'c' | 'h', value: number) => void;
}

export function ColorRamp({ colors, onAdjustColor }: ColorRampProps) {
  const { toast } = useToast();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const copyToClipboard = () => {
    const text = colors
      .map((color, i) => `Step ${i + 1}: ${color.hex}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Color values have been copied to your clipboard"
      });
    });
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

      <div className="flex mb-4">
        {colors.map((color, i) => (
          <Button
            key={i}
            variant="ghost"
            className={`flex-1 h-20 rounded-none ${
              selectedStep === i ? 'ring-2 ring-primary ring-inset' : ''
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => setSelectedStep(i)}
          />
        ))}
      </div>

      {selectedStep !== null && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">Step {selectedStep + 1}</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {colors[selectedStep].hex}
            </code>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Lightness</label>
              <Slider
                value={[colors[selectedStep].oklch.l * 100]}
                min={15}
                max={95}
                step={1}
                onValueChange={([v]) => onAdjustColor(selectedStep, 'l', v / 100)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Chroma</label>
              <Slider
                value={[colors[selectedStep].oklch.c * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => onAdjustColor(selectedStep, 'c', v / 100)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Hue</label>
              <Slider
                value={[colors[selectedStep].oklch.h]}
                min={0}
                max={360}
                step={1}
                onValueChange={([v]) => onAdjustColor(selectedStep, 'h', v)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedStep === null && (
        <div className="text-center text-muted-foreground py-4">
          Select a color step to adjust its values
        </div>
      )}
    </Card>
  );
}