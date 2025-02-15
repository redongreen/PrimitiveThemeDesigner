import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import type { ColorBlindnessType } from "@/lib/color";

interface ColorBlindnessToggleProps {
  value: ColorBlindnessType;
  onValueChange: (value: ColorBlindnessType) => void;
}

export function ColorBlindnessToggle({ value, onValueChange }: ColorBlindnessToggleProps) {
  return (
    <div className="space-y-2">
      <Label>Color Blindness Simulation</Label>
      <ToggleGroup
        type="single"
        value={value || ""}
        onValueChange={(val) => onValueChange(val as ColorBlindnessType || null)}
        className="justify-start"
      >
        <ToggleGroupItem value="deuteranopia" aria-label="Toggle deuteranopia simulation">
          Deuteranopia
        </ToggleGroupItem>
        <ToggleGroupItem value="protanopia" aria-label="Toggle protanopia simulation">
          Protanopia
        </ToggleGroupItem>
        <ToggleGroupItem value="tritanopia" aria-label="Toggle tritanopia simulation">
          Tritanopia
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
