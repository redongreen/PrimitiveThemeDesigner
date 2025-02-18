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
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {activeTab === "primitive" ? "Primitive color creation" : "Semantic token accessible pairing"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tool created by{" "}
          <a
            href="https://www.linkedin.com/in/iguisard/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Ian Guisard
          </a>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "primitive" | "theme")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="primitive">Primitive</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
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
        Last updated on February 16, 2025,{" "}
        <a
          href="https://github.com/redongreen/PrimitiveThemeDesigner"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          8ea71d6
        </a>
      </div>
    </div>
  );
}