"use client";

import { motion, type Variants } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  Wifi,
  ArrowRight,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { useNav } from "./OrionApp";
import { Route } from "@/lib/orion-config";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Triage",
    desc: "A machine learning model scores patient urgency from 0 to 10 using vital signs and symptoms.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: Wifi,
    title: "Real-Time Updates",
    desc: "Live WebSocket feeds push new patients instantly to doctor dashboards.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Target,
    title: "Doctor Validation",
    desc: "Physicians can override AI scores, creating a continuous learning loop.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const stats = [
  { label: "Urgency Scale", value: "0–10", icon: Target },
  { label: "Care Levels", value: "5", icon: Activity },
  { label: "Dashboard Updates", value: "Live", icon: Zap },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LandingPage() {
  const { navigate } = useNav();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070D1A] via-[#0A1628] to-[#070D1A]" />
      <div className="absolute inset-0 orion-bg-grid" />
      <div className="orion-bg-orb w-[500px] h-[500px] bg-teal-500 top-[-100px] left-[-100px]" />
      <div className="orion-bg-orb w-[400px] h-[400px] bg-cyan-600 bottom-[-80px] right-[-80px]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              ORION-Health
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              AI Emergency Triage
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </motion.header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BrainCircuit className="w-3.5 h-3.5" />
              AI-Powered Medical Triage
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
          >
            <span className="text-foreground">Intelligent </span>
            <span className="orion-gradient-text">Emergency Triage</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Rapid patient assessment and prioritization powered by machine
            learning. Real-time decision support for clinical teams.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto mb-16"
          >
            <button
              onClick={() => navigate("pre-register" as Route)}
              className="orion-btn-primary flex items-center justify-center gap-3 py-4 px-8 text-base w-full sm:w-auto"
            >
              <Activity className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold">Patient Register</div>
                <div className="text-xs opacity-80 font-normal">
                  Start with pre-registration
                </div>
              </div>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={() => navigate("admin-doctor" as Route)}
              className="flex items-center justify-center gap-3 py-4 px-8 text-base w-full sm:w-auto rounded-xl font-semibold bg-secondary text-foreground border border-border hover:border-primary/30 hover:bg-secondary/80 transition-all"
            >
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-bold">Admin Dashboard</div>
                <div className="text-xs text-muted-foreground font-normal">
                  Doctor & emergency control
                </div>
              </div>
            </button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-8 sm:gap-12 mb-16"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className={`orion-card p-6 text-left group cursor-default ${f.bg} ${f.border}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${f.bg} ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className={`text-base font-bold mb-2 ${f.color}`}>
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 text-center py-6 text-xs text-muted-foreground border-t border-border/50"
      >
        <p>&copy; 2026 Shubham Indulkar &middot; ORION-Health AI Triage System</p>
      </motion.footer>
    </div>
  );
}
