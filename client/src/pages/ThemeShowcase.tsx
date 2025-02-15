import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface ColorTokenProps {
  color: string;
  name: string;
}

const ColorToken: React.FC<ColorTokenProps> = ({ color, name }) => (
  <div className="flex items-center gap-3 mb-2">
    <div 
      className="w-6 h-6 rounded border border-border"
      style={{ backgroundColor: color }}
    />
    <span className="font-mono text-sm">{name}</span>
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
            <ColorToken color="var(--brand-background-primary)" name="--brand-background-primary" />
            <ColorToken color="var(--brand-background-secondary)" name="--brand-background-secondary" />
            <ColorToken color="var(--brand-background-disabled)" name="--brand-background-disabled" />

            <h3 className="font-medium mb-4 mt-6">Foreground</h3>
            <ColorToken color="var(--brand-content-primary)" name="--brand-content-primary" />
            <ColorToken color="var(--brand-content-on-primary)" name="--brand-content-on-primary" />
            <ColorToken color="var(--brand-content-on-secondary)" name="--brand-content-on-secondary" />
            <ColorToken color="var(--brand-content-disabled)" name="--brand-content-disabled" />

            <h3 className="font-medium mb-4 mt-6">Border</h3>
            <ColorToken color="var(--brand-border-accessible)" name="--brand-border-accessible" />
            <ColorToken color="var(--brand-border-subtle)" name="--brand-border-subtle" />
          </div>

          {/* Theme Preview */}
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
                    <Card className="mb-4 p-4" style={{ backgroundColor: 'var(--brand-background-primary)' }}>
                      <h4 style={{ color: 'var(--brand-content-on-primary)' }}>Primary Background</h4>
                      <p className="text-sm mt-2" style={{ color: 'var(--brand-content-on-primary)' }}>
                        This card demonstrates the primary background color with its corresponding contrasting text.
                      </p>
                    </Card>

                    <Card className="mb-4 p-4" style={{ backgroundColor: 'var(--brand-background-secondary)' }}>
                      <h4 style={{ color: 'var(--brand-content-on-secondary)' }}>Secondary Background</h4>
                      <p className="text-sm mt-2" style={{ color: 'var(--brand-content-on-secondary)' }}>
                        This card shows the secondary background color with proper contrast text.
                      </p>
                    </Card>

                    <div className="mb-4 p-4 rounded-lg" style={{ 
                      border: '1px solid var(--brand-border-accessible)',
                      backgroundColor: 'var(--background)'
                    }}>
                      <h4 style={{ color: 'var(--brand-content-primary)' }}>Accessible Border</h4>
                      <p className="text-sm mt-2" style={{ color: 'var(--brand-content-primary)' }}>
                        An example of content with an accessible border that meets contrast requirements.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg" style={{ 
                      border: '1px solid var(--brand-border-subtle)',
                      backgroundColor: 'var(--brand-background-disabled)'
                    }}>
                      <h4 style={{ color: 'var(--brand-content-disabled)' }}>Disabled State</h4>
                      <p className="text-sm mt-2" style={{ color: 'var(--brand-content-disabled)' }}>
                        This shows how disabled content appears with subtle borders and proper contrast.
                      </p>
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