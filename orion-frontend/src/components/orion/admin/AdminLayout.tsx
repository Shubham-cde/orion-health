"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ClipboardPlus,
  Stethoscope,
  Siren,
  History,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNav } from "../OrionApp";
import { Route } from "@/lib/orion-config";
import wsService from "@/lib/orion-ws";
import { cn } from "@/lib/utils";

const menuItems: { path: Route; label: string; icon: React.ElementType }[] = [
  { path: "admin-input", label: "Patient Input", icon: ClipboardPlus },
  { path: "admin-doctor", label: "Doctor Panel", icon: Stethoscope },
  { path: "admin-emergency", label: "Emergency Panel", icon: Siren },
  { path: "admin-history", label: "Doctor History", icon: History },
];

export default function AdminLayout() {
  const { route, navigate } = useNav();
  const [wsConnected, setWsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    wsService.connect();
    const unsubscribe = wsService.subscribe((data) => {
      if (data.type === "CONNECTION") {
        setWsConnected(data.status === "connected");
      }
    });
    return () => unsubscribe();
  }, []);

  // When route changes, close mobile sidebar
  useEffect(() => {
    setSidebarOpen(false);
  }, [route]);

  const handleNavigate = (r: Route) => {
    navigate(r);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1A]">
      {/* Header */}
      <header className="sticky top-0 z-40 orion-glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold tracking-tight">
                  <span className="orion-gradient-text">ORION-Health</span>{" "}
                  <span className="text-muted-foreground font-medium">Admin</span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* WS Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs">
              {wsConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium hidden sm:inline">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400 font-medium hidden sm:inline">
                    Disconnected
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => navigate("landing" as Route)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 flex-shrink-0 orion-glass border-r border-border/50 transition-transform duration-300 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-3 space-y-1 mt-2">
            {menuItems.map((item) => {
              const isActive = route === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="orion-glass-elevated rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                System Status
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    wsConnected
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-red-500"
                  )}
                />
                <span className="text-xs font-medium text-foreground">
                  {wsConnected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPageRenderer route={route} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Lazy-loaded admin page renderer
const adminPages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "admin-input": React.lazy(() => import("./PatientInput")),
  "admin-doctor": React.lazy(() => import("./DoctorPanel")),
  "admin-emergency": React.lazy(() => import("./EmergencyPanel")),
  "admin-history": React.lazy(() => import("./DoctorHistory")),
};

function AdminPageRenderer({ route }: { route: string }) {
  const Page = adminPages[route];
  if (!Page) return null;
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="orion-spinner w-8 h-8" />
        </div>
      }
    >
      <Page />
    </React.Suspense>
  );
}
