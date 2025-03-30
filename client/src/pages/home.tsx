import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColorRamp } from "@/hooks/useColorRamp";
import { PrimitiveEditor } from "@/components/PrimitiveEditor";
import { SemanticTokensPanel } from "@/components/SemanticTokensPanel";
import { PromotionalPreview } from "@/components/PromotionalPreview";

export default function Home() {
  // Switch between "primitive" tab and "theme" tab
  const [activeTab, setActiveTab] = useState<"primitive" | "theme">("primitive");

  // Hook that manages color ramp logic, curve data, semantic tokens, etc.
  const rampState = useColorRamp();

  return (
    <div className="container max-w-9xl mx-auto py-8 px-4">
      {/* Header with title and tab toggles inline */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold">
          {activeTab === "primitive" ? "Primitive color creation" : "Accessible pairing"}
        </h1>
        
        <div className="inline-flex">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "primitive" | "theme")}>
            <TabsList className="flex">
              <TabsTrigger value="primitive">Primitive</TabsTrigger>
              <TabsTrigger value="theme">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Content tabs - these are controlled by activeTab state */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "primitive" | "theme")}>
        {/* TabsList is hidden as we're using the custom one above */}
        <TabsList className="hidden">
          <TabsTrigger value="primitive">Primitive</TabsTrigger>
          <TabsTrigger value="theme">Preview</TabsTrigger>
        </TabsList>

        {/* PRIMITIVE TAB */}
        <TabsContent value="primitive">
          {/* Examples Section - Moved to the top */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Examples</h2>
            <PromotionalPreview ramp={rampState.ramp} semanticIndices={rampState.semanticIndices} />
          </div>
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