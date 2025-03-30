import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColorRamp } from "@/hooks/useColorRamp";
import { PrimitiveEditor } from "@/components/PrimitiveEditor";
import { SemanticTokensPanel } from "@/components/SemanticTokensPanel";

export default function Home() {
  // Switch between "primitive" tab and "theme" tab
  const [activeTab, setActiveTab] = useState<"primitive" | "theme">("primitive");

  // Hook that manages color ramp logic, curve data, semantic tokens, etc.
  const rampState = useColorRamp();

  return (
    <div className="container max-w-9xl mx-auto py-8 px-4">
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {activeTab === "primitive" ? "Primitive color creation" : "Accessible pairing"}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "primitive" | "theme")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="primitive">Primitive</TabsTrigger>
          <TabsTrigger value="theme">Preview</TabsTrigger>
        </TabsList>

        {/* PRIMITIVE TAB */}
        <TabsContent value="primitive">
          <PrimitiveEditor {...rampState} />
        </TabsContent>

        {/* THEME TAB */}
        <TabsContent value="theme">
          <SemanticTokensPanel {...rampState} />
        </TabsContent>
      </Tabs>

      <div className="mt-16 pt-8 border-t text-xs text-muted-foreground text-center">
        Last updated on March 20, 2025, created by{" "}
        <a
          href="https://www.linkedin.com/in/iguisard/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Ian Guisard
        </a>
      </div>
    </div>
  );
}