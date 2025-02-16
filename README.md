# PrimitiveThemeDesigner

A sophisticated web-based color design system that leverages the OKLHC color space for advanced, precise color manipulation with enhanced accessibility features.

## Features

- **Advanced Color Space**: Built on OKLHC color space for perceptually uniform color manipulation
- **Interactive Curve Editor**: Precise control over color transitions using Catmull-Rom spline interpolation
- **Accessibility First**: Built-in WCAG contrast analysis for accessible color combinations
- **Dynamic Controls**: 
  - Real-time curve smoothness adjustment
  - Local control point manipulation
  - Interactive tension controls
- **Responsive Design**: Fully mobile-friendly interface
- **Modern Stack**: Built with React + TypeScript for type-safe development

## Technical Stack

- **Frontend**: React with TypeScript
- **Color Processing**: OKLHC color space conversion
- **Mathematics**: Advanced Catmull-Rom spline curve interpolation
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: Wouter

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
4. Open your browser to the local development URL

## Usage

1. **Color Input**: Enter your desired color values in any supported format (HEX, RGB, HSL, OKLCH)
2. **Curve Manipulation**: 
   - Add control points by clicking on the curve
   - Drag points to adjust the color transition
   - Use tension controls to fine-tune the curve behavior
3. **Accessibility Checking**: 
   - View real-time WCAG contrast ratios
   - Toggle color blindness simulation modes

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [Replit](https://replit.com)
