import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow # followed by valid hex characters, and ensure it's a complete color
    if (/^#([0-9A-Fa-f]{0,6})$/.test(newValue)) {
      onChange(newValue);
      // If we have a complete 6-digit hex, pad with zeros
      if (newValue.length < 7) {
        const paddedValue = newValue.padEnd(7, '0');
        onChange(paddedValue);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div>
        <Label htmlFor="color-input">Base Color</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="color-input"
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="#000000"
            className="w-32 font-mono"
          />
          <Input
            type="color"
            value={value.length === 7 ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 p-1 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}