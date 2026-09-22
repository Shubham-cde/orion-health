"use client";

import dynamic from "next/dynamic";

const OrionApp = dynamic(() => import("@/components/orion/OrionApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#070D1A]">
      <div className="flex flex-col items-center gap-4">
        <div className="orion-spinner w-10 h-10" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading ORION-Health...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <OrionApp />;
}
