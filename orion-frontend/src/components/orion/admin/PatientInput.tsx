"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Thermometer,
  Wind,
  Clock,
  FileText,
  User,
  CalendarDays,
  FlaskConical,
  Mail,
} from "lucide-react";
import { useNav } from "../OrionApp";
import { Route } from "@/lib/orion-config";
import { submitPatient, searchPreRegistered } from "@/lib/orion-api";
import LoadingSpinner from "../LoadingSpinner";
import UrgencyBadge from "../UrgencyBadge";
import { cn } from "@/lib/utils";

const initialForm = {
  hospital_name: "",
  name: "",
  age: "",
  pain_score: 5,
  duration_hours: "",
  spo2: 98,
  temperature: 37.0,
  chronic_disease: 0,
  red_flag: 0,
  verbal_problem: "",
  email: "",
  doctor_email: "",
  emergency: false,
};

export default function PatientInput() {
  const { navigate } = useNav();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await searchPreRegistered(query);
        setSearchResults(results as Record<string, unknown>[]);
        setShowSearch(true);
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleSelectPreReg = (patient: Record<string, unknown>) => {
    setFormData({
      ...formData,
      hospital_name: (patient.hospital_name as string) || "",
      name: patient.patient_name as string,
      age: patient.age as string,
      verbal_problem: patient.problem as string,
      email: (patient.email as string) || "",
    });
    setSearchQuery(patient.patient_name as string);
    setShowSearch(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value } = target;
    const isCheckbox = target instanceof HTMLInputElement && target.type === "checkbox";
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (target.checked ? 1 : 0) : value,
    }));
    if (error) setError("");
  };

  const handleEmergencyToggle = () =>
    setFormData((p) => ({ ...p, emergency: !p.emergency }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age as string),
        pain_score: parseInt(String(formData.pain_score)),
        duration_hours: parseInt(formData.duration_hours as string),
        spo2: parseInt(String(formData.spo2)),
        temperature: parseFloat(String(formData.temperature)),
      };
      const response = (await submitPatient(payload)) as Record<string, unknown>;
      setResult(response.triage_result as Record<string, unknown>);
    } catch {
      setError("Failed to submit patient data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setSearchQuery("");
    setFormData(initialForm);
    setError("");
  };

  // ---- Triage Result ----
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="orion-card p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2 orion-gradient-text">
              Triage Complete
            </h2>
            <p className="text-muted-foreground">
              AI assessment for{" "}
              <span className="text-primary font-medium">
                {result.patient_name as string}
              </span>
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <UrgencyBadge
              score={result.urgency_score as number}
              label={result.urgency_level as string}
            />
          </div>

          <div className="orion-glass-elevated rounded-xl p-5 mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Clinical Summary
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {result.clinical_summary as string}
            </p>
          </div>

          <div className="orion-glass-elevated rounded-xl p-5 mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              AI Medical Reasoning
            </h3>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {result.explanation as string}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetForm}
              className="orion-btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <RotateCcw className="w-4 h-4" />
              Submit Another Patient
            </button>
            <button
              onClick={() => navigate("admin-doctor" as Route)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold bg-secondary text-foreground border border-border hover:border-primary/30 transition-all"
            >
              View Doctor Panel
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- Form ----
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          <span className="orion-gradient-text">Patient Input</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Submit patient data for AI triage assessment
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="orion-card p-6 sm:p-8"
      >
        {/* Search */}
        <div className="mb-8 relative" ref={searchRef}>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Search className="w-4 h-4 text-primary" />
            Search Pre-registered Patient
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            placeholder="Start typing patient name to auto-fill..."
            className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
          />
          <AnimatePresence>
            {showSearch && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 w-full mt-2 orion-glass-elevated rounded-xl shadow-2xl max-h-48 overflow-y-auto orion-scroll"
              >
                {searchResults.map((patient, i) => (
                  <button
                    key={(patient.id as string) || i}
                    type="button"
                    onClick={() => handleSelectPreReg(patient)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="font-semibold text-sm text-primary">
                      {patient.patient_name as string}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Age: {patient.age as number} &middot;{" "}
                      {patient.problem as string}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Patient Details
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Name + Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 text-primary" />
              Patient Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name as string}
              onChange={handleChange}
              required
              placeholder="Enter full name"
              className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Age <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age as string}
              onChange={handleChange}
              required
              min={0}
              max={120}
              placeholder="Enter age"
              className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
            />
          </div>
        </div>

        {/* Pain Score */}
        <div className="mb-6">
          <label className="flex items-center justify-between text-sm font-medium text-foreground mb-3">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Pain Score
            </span>
            <span className="tabular-nums text-primary font-bold text-lg">
              {formData.pain_score as number}/10
            </span>
          </label>
          <input
            type="range"
            name="pain_score"
            value={formData.pain_score as number}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                pain_score: parseInt(e.target.value),
              }))
            }
            min={0}
            max={10}
            className="orion-range"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>No Pain</span>
            <span>Severe Pain</span>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <VitalField icon={Clock} label="Duration" unit="hours" name="duration_hours" value={formData.duration_hours as string} onChange={handleChange} required min={0} placeholder="Hours" />
          <VitalField icon={Wind} label="SpO2" unit="%" name="spo2" value={String(formData.spo2)} onChange={handleChange} required min={0} max={100} placeholder="98" />
          <VitalField icon={Thermometer} label="Temperature" unit="°C" name="temperature" value={String(formData.temperature)} onChange={handleChange} required step="0.1" placeholder="37.0" />
        </div>

        {/* Problem */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <FileText className="w-4 h-4 text-primary" />
            Problem Description
          </label>
          <textarea
            name="verbal_problem"
            value={formData.verbal_problem as string}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the medical problem..."
            className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm resize-none"
          />
        </div>

        {/* Patient Email */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Mail className="w-4 h-4 text-primary" />
            Patient Email{" "}
            <span className="text-muted-foreground font-normal text-xs">
              (Optional — status updates)
            </span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email as string}
            onChange={handleChange}
            placeholder="patient@example.com"
            className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
          />
        </div>

        {/* Doctor Email */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            Doctor Email{" "}
            <span className="text-muted-foreground font-normal text-xs">
              (Optional — critical alerts)
            </span>
          </label>
          <input
            type="email"
            name="doctor_email"
            value={formData.doctor_email as string}
            onChange={handleChange}
            placeholder="doctor@hospital.com"
            className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <AdminToggle label="Chronic Disease" checked={formData.chronic_disease === 1} onChange={() => setFormData((p) => ({ ...p, chronic_disease: p.chronic_disease ? 0 : 1 }))} />
          <AdminToggle label="Red Flag Symptoms" checked={formData.red_flag === 1} onChange={() => setFormData((p) => ({ ...p, red_flag: p.red_flag ? 0 : 1 }))} />
        </div>

        {/* Emergency */}
        <div className="mb-8">
          <div
            role="button"
            tabIndex={0}
            onClick={handleEmergencyToggle}
            onKeyDown={(e) => e.key === "Enter" && handleEmergencyToggle()}
            className={cn(
              "cursor-pointer rounded-xl border-2 p-5 transition-all",
              formData.emergency
                ? "orion-emergency-glow bg-red-500/5"
                : "border-border bg-secondary/30 hover:border-border hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5" />
                  EMERGENCY
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mark as critical emergency — patient goes to emergency queue
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-7 rounded-full p-1 transition-colors",
                  formData.emergency ? "bg-red-500" : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow transition-transform",
                    formData.emergency ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2",
            loading
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : formData.emergency
                ? "orion-btn-emergency"
                : "orion-btn-primary"
          )}
        >
          {loading ? (
            <LoadingSpinner size="sm" className="p-0" />
          ) : (
            <>
              <FlaskConical className="w-5 h-5" />
              Submit for AI Triage
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}

// ---- Helper Components ----

interface VitalFieldProps {
  icon: React.ElementType;
  label: string;
  unit: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  placeholder: string;
}

function VitalField({ icon: Icon, label, unit, name, value, onChange, required, min, max, step, placeholder }: VitalFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
        <Icon className="w-4 h-4 text-primary" />
        {label} <span className="text-muted-foreground font-normal text-xs">({unit})</span>
        {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
      />
    </div>
  );
}

function AdminToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between orion-glass-elevated rounded-xl px-4 py-3.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn("relative w-11 h-6 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-5")} />
      </button>
    </div>
  );
}
