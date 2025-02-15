import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import type { ColorStop } from '@/lib/color';
import { useToast } from '@/hooks/use-toast';

interface ColorRampProps {
  colors: ColorStop[];
}

export function ColorRamp({ colors }: ColorRampProps) {
  const { toast } = useToast();

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

      <div className="flex">
        {colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 h-20"
            style={{ backgroundColor: color.hex }}
            title={`Step ${i + 1}: ${color.hex}`}
          />
        ))}
      </div>
    </Card>
  );
}