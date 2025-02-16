declare module 'culori' {
  export type Color = {
    mode: string;
    r?: number;
    g?: number;
    b?: number;
    l?: number;
    c?: number;
    h?: number;
    [key: string]: any;
  };

  export function oklch(color: Color | string): Color;
  export function parse(color: string): Color | null;
  export function formatHex(color: Color | string): string;
}
