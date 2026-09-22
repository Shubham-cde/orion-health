"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Route } from "@/lib/orion-config";
import LoadingSpinner from "./LoadingSpinner";
import LandingPage from "./LandingPage";
import PreRegister from "./PreRegister";
import PatientRegister from "./PatientRegister";
import AdminLayout from "./admin/AdminLayout";

// ---- Navigation Context ----
interface NavContextValue {
  route: Route;
  navigate: (r: Route) => void;
}

const NavContext = createContext<NavContextValue>({
  route: "landing",
  navigate: () => {},
});

export const useNav = () => useContext(NavContext);

// ---- Transition variants ----
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function OrionApp() {
  const [route, setRoute] = useState<Route>("landing");

  const navigate = useCallback((r: Route) => setRoute(r), []);

  // Check if the route is an admin route
  const isAdminRoute = route.startsWith("admin-");

  return (
    <NavContext.Provider value={{ route, navigate }}>
      {isAdminRoute ? (
        <AdminLayout />
      ) : (
        <div className="min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" as const }}
            >
              <PageRenderer route={route} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </NavContext.Provider>
  );
}

// Renders the correct page for non-admin routes
function PageRenderer({ route }: { route: Route }) {
  switch (route) {
    case "landing":
      return <LandingPage />;
    case "pre-register":
      return <PreRegister />;
    case "patient-register":
      return <PatientRegister />;
    default:
      return <LandingPage />;
  }
}

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>);
}
