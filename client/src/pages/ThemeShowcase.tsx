import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface ColorTokenProps {
  color: string;
  name: string;
  slot: string;
}

const ColorToken: React.FC<ColorTokenProps> = ({ color, name, slot }) => (
  <div className="flex items-center gap-3 mb-2">
    <div 
      className="w-6 h-6 rounded border border-border"
      style={{ backgroundColor: color }}
    />
    <span className="font-mono text-sm">{name} = {slot}</span>
  </div>
);

const ThemeShowcase: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="primitive">Primitive</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="primitive">
          <div>Primitive Content</div>
        </TabsContent>
        
        <TabsContent value="theme" className="flex gap-8">
          {/* Color Tokens List */}
          <div className="w-64">
            <h3 className="font-medium mb-4">Background</h3>
            <ColorToken color="var(--brand-background-primary)" name="brandBackgroundPrimary" slot="500" />
            <ColorToken color="var(--brand-background-secondary)" name="brandBackgroundSecondary" slot="100" />
            <ColorToken color="var(--brand-background-disabled)" name="brandBackgroundDisabled" slot="50" />
            
            <h3 className="font-medium mb-4 mt-6">Foreground</h3>
            <ColorToken color="var(--brand-content-primary)" name="brandContentPrimary" slot="700" />
            <ColorToken color="var(--brand-content-on-primary)" name="brandContentOnPrimary" slot="950" />
            <ColorToken color="var(--brand-content-on-secondary)" name="brandContentOnSecondary" slot="800" />
            <ColorToken color="var(--brand-content-disabled)" name="brandContentDisabled" slot="300" />
            
            <h3 className="font-medium mb-4 mt-6">Border</h3>
            <ColorToken color="var(--brand-border-accessible)" name="brandBorderAccessible" slot="600" />
            <ColorToken color="var(--brand-border-subtle)" name="brandBorderSubtle" slot="200" />
          </div>
          
          {/* iPhone Frame */}
          <div className="flex-1">
            <div className="relative mx-auto" style={{ width: '390px' }}>
              <div 
                className="absolute inset-0 rounded-[48px]"
                style={{ 
                  border: '6px solid rgba(0, 0, 0, 0.4)',
                  height: '844px',
                }}
              >
                <div className="w-full h-full rounded-[42px] overflow-hidden bg-background">
                  {/* Theme Preview Content */}
                  <div className="p-4">
                    <Card className="mb-4 p-4 bg-[var(--brand-background-primary)]">
                      <h4 className="text-[var(--brand-content-on-primary)]">Primary Background</h4>
                    </Card>
                    
                    <Card className="mb-4 p-4 bg-[var(--brand-background-secondary)]">
                      <h4 className="text-[var(--brand-content-on-secondary)]">Secondary Background</h4>
                    </Card>
                    
                    <div className="border border-[var(--brand-border-accessible)] rounded-lg p-4 mb-4">
                      <p className="text-[var(--brand-content-primary)]">Content with accessible border</p>
                    </div>
                    
                    <div className="border border-[var(--brand-border-subtle)] rounded-lg p-4">
                      <p className="text-[var(--brand-content-disabled)]">Disabled content with subtle border</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeShowcase;
