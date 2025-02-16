# OKLHC Color Design System

A sophisticated web-based color design system that leverages the OKLHC color space for advanced, precise color manipulation with enhanced accessibility and design capabilities.

## Features

- **OKLHC Color Space**: Utilizes the perceptually uniform OKLHC color space for more accurate color manipulation
- **Advanced Curve Control**: Interactive Catmull-Rom spline interpolation for smooth color ramp generation
- **Accessibility Analysis**: Built-in WCAG contrast ratio calculations and accessibility checks
- **Dynamic Color Ramps**: Generate color variations with precise control over:
  - Lightness
  - Chroma (saturation)
  - Hue
- **Interactive Interface**: Real-time visualization and manipulation of color curves
- **Color Blindness Simulation**: Test color schemes for various types of color vision deficiency

## Technical Stack

- React + TypeScript for the frontend
- Culori for color space conversions
- Custom Catmull-Rom spline implementation for smooth curve interpolation
- Tailwind CSS + shadcn/ui for styling

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

## Usage

1. **Base Color Selection**: Choose your primary color using the color picker
2. **Curve Adjustment**: Use the interactive curve editors to modify:
   - Lightness distribution
   - Chroma (saturation) variation
   - Hue shifts
3. **Preview**: See real-time updates of your color ramp
4. **Accessibility**: Check contrast ratios and color blindness simulations
5. **Export**: Copy the generated color values in various formats

## Color Math

The system uses several advanced color space operations:

- OKLHC color space conversions for perceptually uniform color manipulation
- Catmull-Rom spline interpolation for smooth curve generation
- Relative luminance calculations for WCAG contrast ratios
- Local control point influence for natural curve adjustments

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this color system in your projects!
