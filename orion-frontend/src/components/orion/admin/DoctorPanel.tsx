"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertTriangle, Flame, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { fetchPatients } from "@/lib/orion-api";
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

export default function DoctorPanel() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [hasNextBatch, setHasNextBatch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { dismiss, filterPatients } = useDismissedPatients(false);

  useEffect(() => {
    loadPatients(currentBatch);
    const unsubscribe = wsService.subscribe((data) => {
      if (data.patient && !data.patient.emergency) {
        loadPatients(currentBatch);
      }
    });
    return () => unsubscribe();
  }, [currentBatch]);

  const loadPatients = async (batch: number) => {
    setLoading(true);
    try {
      const response = (await fetchPatients(batch)) as { patients?: PatientData[] };
      const batchPatients = filterPatients(response.patients || []);
      setPatients(batchPatients);
      try {
        const nextResponse = (await fetchPatients(batch + 1)) as {
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
    return <LoadingSpinner text="Loading patients..." className="h-64" />;
  }

  const highCount = patients.filter(
    (p) => p.urgency_score >= 7 && p.urgency_score < 9
  ).length;
  const criticalCount = patients.filter((p) => p.urgency_score >= 9).length;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          <span className="orion-gradient-text">Doctor Panel</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Patients sorted by urgency score, highest to lowest
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={Users}
          label="In This Batch"
          value={patients.length}
          sub={`Batch ${currentBatch}`}
          color="text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Priority (≥7)"
          value={highCount}
          color="text-amber-400"
        />
        <StatCard
          icon={Flame}
          label="Critical (≥9)"
          value={criticalCount}
          color="text-red-400"
        />
      </div>

      {/* Patient Grid */}
      {patients.length === 0 ? (
        <div className="orion-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-foreground font-semibold mb-1">
            No patients in this batch
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            All patients have been reviewed
          </p>
          {currentBatch > 1 && (
            <button
              onClick={() => setCurrentBatch((b) => b - 1)}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mx-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Go to previous batch
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {patients.map((patient, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="orion-card p-5 cursor-pointer group"
              onClick={() => {
                setSelectedPatient(patient);
                setSelectedIndex(index);
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="text-base font-bold text-foreground truncate">
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
                <UrgencyBadge
                  score={patient.urgency_score}
                  className="text-xs"
                  showScore={false}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {patient.clinical_summary}
              </p>
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                View Details
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
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground border border-border hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="px-4 py-2 rounded-lg text-sm font-bold tabular-nums orion-glass-elevated text-primary">
          Batch {currentBatch}
        </span>
        <button
          onClick={() => setCurrentBatch(currentBatch + 1)}
          disabled={!hasNextBatch}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground border border-border hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Helper Components ----

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="orion-card p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold tabular-nums ${color}`}>
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
      )}
    </motion.div>
  );
}
