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
    // Allow typing any value that starts with # and contains valid hex characters
    if (/^#[0-9A-Fa-f]*$/.test(newValue)) {
      onChange(newValue);
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
            value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 p-1 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}