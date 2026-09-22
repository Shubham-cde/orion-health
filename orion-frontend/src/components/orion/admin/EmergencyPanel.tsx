"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { fetchEmergencyPatients } from "@/lib/orion-api";
import wsService from "@/lib/orion-ws";
import { useDismissedPatients } from "@/lib/orion-hooks";
import LoadingSpinner from "../LoadingSpinner";
import UrgencyBadge from "../UrgencyBadge";
import PatientDetailModal from "./PatientDetailModal";

type PatientData = {
  patient_name?: string;
  urgency_score: number;
  urgency_level?: string;
  clinical_summary?: string;
  explanation?: string;
  patient?: {
    id?: number;
    name?: string;
    age?: number;
    pain_score?: number;
    spo2?: number;
    temperature?: number;
    duration_hours?: number;
    chronic_disease?: number;
    red_flag?: number;
    verbal_problem?: string;
  };
  emergency?: boolean;
};

export default function EmergencyPanel() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [hasNextBatch, setHasNextBatch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { dismiss, filterPatients } = useDismissedPatients(true);

  useEffect(() => {
    loadPatients(currentBatch);
    const unsubscribe = wsService.subscribe((data) => {
      if (data.patient?.emergency) {
        loadPatients(currentBatch);
      }
    });
    return () => unsubscribe();
  }, [currentBatch]);

  const loadPatients = async (batch: number) => {
    setLoading(true);
    try {
      const response = (await fetchEmergencyPatients(batch)) as {
        patients?: PatientData[];
      };
      const batchPatients = filterPatients(response.patients || []);
      setPatients(batchPatients);
      try {
        const nextResponse = (await fetchEmergencyPatients(batch + 1)) as {
          patients?: PatientData[];
        };
        setHasNextBatch(filterPatients(nextResponse.patients || []).length > 0);
      } catch {
        setHasNextBatch(false);
      }
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromList = (idx: number, patient: PatientData) => {
    dismiss(patient);
    setPatients((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) {
    return <LoadingSpinner text="Loading emergency patients..." className="h-64" />;
  }

  const criticalCount = patients.filter((p) => p.urgency_score >= 9).length;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-red-400">
              Emergency Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Critical cases requiring immediate attention
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="orion-card p-4 sm:p-5 border-red-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Emergency Patients
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tabular-nums text-red-400">
            {patients.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Batch {currentBatch}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="orion-card p-4 sm:p-5 border-red-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Critical Score (≥9)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tabular-nums text-red-400">
            {criticalCount}
          </div>
        </motion.div>
      </div>

      {/* Patient Grid */}
      {patients.length === 0 ? (
        <div className="orion-card p-12 text-center border-emerald-500/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-emerald-400 font-semibold mb-1">
            No emergency cases
          </p>
          <p className="text-sm text-muted-foreground">
            All clear — no critical patients in queue
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {patients.map((patient, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              className="relative orion-card p-5 cursor-pointer group orion-emergency-glow"
              onClick={() => {
                setSelectedPatient(patient);
                setSelectedIndex(index);
              }}
            >
              {/* Emergency badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Emergency
                </span>
              </div>

              <div className="mb-3 mt-4">
                <h3 className="text-base font-bold text-red-400 truncate pr-20">
                  {patient.patient_name ||
                    patient.patient?.name ||
                    "Patient"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Age: {patient.patient?.age || "N/A"} &middot;{" "}
                  <span className="tabular-nums">
                    Score: {patient.urgency_score}
                  </span>
                </p>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {patient.clinical_summary}
              </p>

              <UrgencyBadge
                score={patient.urgency_score}
                className="text-xs mb-4"
                showScore={false}
              />

              <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/30 group-hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                View Emergency Details
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Batch Navigation */}
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={() => setCurrentBatch(Math.max(1, currentBatch - 1))}
          disabled={currentBatch === 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground border border-border hover:border-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="px-4 py-2 rounded-lg text-sm font-bold tabular-nums orion-glass-elevated text-red-400">
          Batch {currentBatch}
        </span>
        <button
          onClick={() => setCurrentBatch(currentBatch + 1)}
          disabled={!hasNextBatch}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground border border-border hover:border-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selectedPatient && selectedIndex !== null && (
          <PatientDetailModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onDone={() => {
              removeFromList(selectedIndex, selectedPatient);
              setSelectedPatient(null);
            }}
            onRemove={() => {
              removeFromList(selectedIndex, selectedPatient);
              setSelectedPatient(null);
            }}
            isEmergency
          />
        )}
      </AnimatePresence>
    </div>
  );
}
