"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, Pencil, Clock } from "lucide-react";
import { fetchDoctorHistory } from "@/lib/orion-api";
import LoadingSpinner from "../LoadingSpinner";

type HistoryData = {
  total_patients: number;
  emergency_cases: number;
  total_overrides: number;
  timeline?: {
    patient_name: string;
    date: string;
    time: string;
    emergency: boolean;
  }[];
};

export default function DoctorHistory() {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = (await fetchDoctorHistory()) as HistoryData;
      setHistory(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading doctor history..." className="h-64" />;
  }

  if (error || !history) {
    return (
      <div className="orion-card p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-foreground font-semibold mb-1">
          Failed to load history
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to connect to the server
        </p>
        <button
          onClick={loadHistory}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          <span className="orion-gradient-text">Doctor History & Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Performance metrics and patient timeline
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="orion-card p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                Total Patients
              </div>
              <div className="text-2xl font-bold tabular-nums text-primary">
                {history.total_patients}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="orion-card p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                Emergency Cases
              </div>
              <div className="text-2xl font-bold tabular-nums text-red-400">
                {history.emergency_cases}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="orion-card p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Pencil className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                Total Overrides
              </div>
              <div className="text-2xl font-bold tabular-nums text-amber-400">
                {history.total_overrides}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="orion-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Patient Timeline</h2>
        </div>

        {history.timeline && history.timeline.length > 0 ? (
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto orion-scroll pr-1">
            {history.timeline.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.015 }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  entry.emergency
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-primary/5 border-primary/10"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {entry.emergency && (
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {entry.patient_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {entry.date} at {entry.time}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {entry.emergency ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
                      Emergency
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
                      Regular
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No patient history available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              History will appear here as patients are processed
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
