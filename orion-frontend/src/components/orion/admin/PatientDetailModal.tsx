"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Thermometer,
  Wind,
  Clock,
  User,
  AlertTriangle,
  FileText,
  BrainCircuit,
  Pencil,
  Trash2,
} from "lucide-react";
import { submitOverride } from "@/lib/orion-api";
import UrgencyBadge from "../UrgencyBadge";
import { cn } from "@/lib/utils";

interface PatientData {
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
}

interface PatientDetailModalProps {
  patient: PatientData;
  onClose: () => void;
  onDone: () => void;
  onRemove: () => void;
  isEmergency?: boolean;
}

export default function PatientDetailModal({
  patient,
  onClose,
  onDone,
  onRemove,
  isEmergency = false,
}: PatientDetailModalProps) {
  const [overrideScore, setOverrideScore] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [overrideSuccess, setOverrideSuccess] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  const vitals = [
    { icon: User, label: "Age", value: patient.patient?.age ?? "N/A" },
    {
      icon: AlertTriangle,
      label: "Pain Score",
      value: `${patient.patient?.pain_score ?? "N/A"}/10`,
    },
    {
      icon: Wind,
      label: "SpO2",
      value: `${patient.patient?.spo2 ?? "N/A"}%`,
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${patient.patient?.temperature ?? "N/A"}°C`,
    },
    {
      icon: Clock,
      label: "Duration",
      value: `${patient.patient?.duration_hours ?? "N/A"}h`,
    },
  ];

  const handleOverride = async () => {
    if (!overrideScore || !patient) return;
    setOverrideLoading(true);
    try {
      await submitOverride({
        patient_id: patient.patient?.id || 1,
        new_score: parseFloat(overrideScore),
        ai_score: patient.urgency_score,
        features: {
          pain_score: patient.patient?.pain_score || 0,
          duration_hours: patient.patient?.duration_hours || 0,
          age: patient.patient?.age || 0,
          spo2: patient.patient?.spo2 || 98,
          temperature: patient.patient?.temperature || 37,
          chronic_disease: patient.patient?.chronic_disease || 0,
          red_flag: patient.patient?.red_flag || 0,
        },
        doctor_notes: doctorNotes,
      });
      setOverrideSuccess(true);
      setTimeout(() => {
        onDone();
      }, 1200);
    } catch {
      alert("Failed to submit override");
    } finally {
      setOverrideLoading(false);
    }
  };

  const sectionColor = isEmergency ? "text-red-400" : "text-primary";
  const sectionBg = isEmergency
    ? "bg-red-500/5 border-red-500/20"
    : "bg-primary/5 border-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-3xl max-h-[90vh] overflow-y-auto orion-scroll rounded-2xl orion-card p-6 sm:p-8",
          isEmergency && "border-red-500/30"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          {isEmergency && (
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Emergency
              </span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {patient.patient_name || "Patient Details"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEmergency
              ? "Immediate medical attention required"
              : "Complete medical assessment"}
          </p>
        </div>

        {/* Urgency Badge */}
        <div className="mb-6">
          <UrgencyBadge
            score={patient.urgency_score}
            label={patient.urgency_level}
          />
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {vitals.map((v) => (
            <div
              key={v.label}
              className="orion-glass-elevated rounded-xl p-3 text-center"
            >
              <v.icon className={cn("w-4 h-4 mx-auto mb-1.5", sectionColor)} />
              <div className="text-[11px] text-muted-foreground mb-1">
                {v.label}
              </div>
              <div className="text-lg font-bold tabular-nums">{v.value}</div>
            </div>
          ))}
        </div>

        {/* Patient Complaint */}
        {patient.patient?.verbal_problem && (
          <SectionBlock
            icon={FileText}
            title="Patient Complaint"
            color={sectionColor}
            bgClass={sectionBg}
          >
            <p className="text-sm text-foreground/90 leading-relaxed">
              {patient.patient.verbal_problem}
            </p>
          </SectionBlock>
        )}

        {/* Clinical Summary */}
        <SectionBlock
          icon={BrainCircuit}
          title="Clinical Summary"
          color={sectionColor}
          bgClass={sectionBg}
        >
          <p className="text-sm text-foreground/90 leading-relaxed">
            {patient.clinical_summary}
          </p>
        </SectionBlock>

        {/* AI Explanation */}
        <SectionBlock
          icon={BrainCircuit}
          title="AI Medical Reasoning"
          color={sectionColor}
          bgClass={sectionBg}
        >
          <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
            {patient.explanation}
          </div>
        </SectionBlock>

        {/* Doctor Override */}
        <div className="rounded-xl p-5 mb-6 bg-amber-500/5 border border-amber-500/20">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Doctor Override
          </h3>

          {overrideSuccess ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-semibold text-sm">
                Override submitted successfully!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Urgency Score (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.1}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  placeholder={`Current: ${patient.urgency_score}`}
                  className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Doctor Notes
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={3}
                  placeholder="Add clinical notes..."
                  className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm resize-none"
                />
              </div>
              <button
                onClick={handleOverride}
                disabled={!overrideScore || overrideLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-muted disabled:to-muted disabled:text-muted-foreground transition-all flex items-center justify-center gap-2"
              >
                {overrideLoading ? (
                  <div className="orion-spinner w-4 h-4" />
                ) : (
                  <Pencil className="w-4 h-4" />
                )}
                Submit Override
              </button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDone}
            className="orion-btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Done — Next Patient
          </button>
          <button
            onClick={onRemove}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Section Block ----
function SectionBlock({
  icon: Icon,
  title,
  color,
  bgClass,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 mb-5 border",
        bgClass
      )}
    >
      <h3
        className={cn(
          "text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2",
          color
        )}
      >
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      {children}
    </div>
  );
}
