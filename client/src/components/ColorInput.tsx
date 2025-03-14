import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Slider } from '@/components/ui/slider';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  label: string;
}

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Convert HSL to hex
function HSLToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c/2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function ColorInput({ value, onChange, onGenerate, label }: ColorInputProps) {
  const [hsl, setHSL] = useState(() => hexToHSL(value));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update HSL when hex value changes externally
    setHSL(hexToHSL(value));
  }, [value]);

  const handleHSLInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'h' | 's' | 'l') => {
    const newValue = parseInt(e.target.value) || 0;
    const newHSL = { ...hsl, [type]: newValue };
    setHSL(newHSL);
    onChange(HSLToHex(newHSL.h, newHSL.s, newHSL.l));
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^#[0-9A-Fa-f]*$/.test(newValue)) {
      onChange(newValue);
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        setHSL(hexToHSL(newValue));
      }
    }
  };

  const handleHSLChange = (type: 'h' | 's' | 'l', newValue: number) => {
    const newHSL = { ...hsl, [type]: newValue };
    setHSL(newHSL);
    onChange(HSLToHex(newHSL.h, newHSL.s, newHSL.l));
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <Input
          type="text"
          value={value}
          onChange={handleHexChange}
          placeholder="#000000"
          className="w-32 font-mono"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-[60px] h-[35px] p-1",
                !value && "text-muted-foreground"
              )}
              style={{ 
                background: value,
                border: '1px solid var(--border)',
              }}
            >
              <span className="sr-only">Open color picker</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px]">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="h">H</Label>
                    <Input
                      id="h"
                      type="number"
                      value={hsl.h}
                      onChange={(e) => handleHSLInputChange(e, 'h')}
                      className="h-8"
                    />
                  </div>
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="s">S</Label>
                    <Input
                      id="s"
                      type="number"
                      value={hsl.s}
                      onChange={(e) => handleHSLInputChange(e, 's')}
                      className="h-8"
                    />
                  </div>
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="l">L</Label>
                    <Input
                      id="l"
                      type="number"
                      value={hsl.l}
                      onChange={(e) => handleHSLInputChange(e, 'l')}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Hue</Label>
                      <span className="text-xs text-muted-foreground">{hsl.h}°</span>
                    </div>
                    <Slider
                      value={[hsl.h]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={(value) => handleHSLChange('h', value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Saturation</Label>
                      <span className="text-xs text-muted-foreground">{hsl.s}%</span>
                    </div>
                    <Slider
                      value={[hsl.s]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleHSLChange('s', value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Lightness</Label>
                      <span className="text-xs text-muted-foreground">{hsl.l}%</span>
                    </div>
                    <Slider
                      value={[hsl.l]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleHSLChange('l', value[0])}
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button 
          onClick={onGenerate}
          disabled={!/^#[0-9A-Fa-f]{6}$/.test(value)}
        >
          Generate Ramp
        </Button>
      </div>
    </div>
  );
}