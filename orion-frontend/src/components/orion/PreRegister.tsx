"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Hospital, User, Mail, FileText, CalendarDays } from "lucide-react";
import { useNav } from "./OrionApp";
import { Route } from "@/lib/orion-config";
import { preRegisterPatient } from "@/lib/orion-api";
import LoadingSpinner from "./LoadingSpinner";

const initialForm = {
  hospital_name: "",
  patient_name: "",
  age: "",
  problem: "",
  email: "",
};

export default function PreRegister() {
  const { navigate } = useNav();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_name.trim() || !formData.age || !formData.problem.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await preRegisterPatient({
        ...formData,
        age: parseInt(formData.age),
      });
      setSuccess(true);
      setTimeout(() => navigate("patient-register" as Route), 2500);
    } catch {
      setError("Failed to pre-register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Success State ----
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070D1A] via-[#0A1628] to-[#070D1A]" />
        <div className="absolute inset-0 orion-bg-grid" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 orion-card p-10 sm:p-12 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 orion-gradient-text">
            Pre-Registration Successful
          </h2>
          <p className="text-muted-foreground mb-2">
            Your information has been securely saved.
          </p>
          <p className="text-sm text-primary">
            Redirecting to patient registration...
          </p>
          <div className="mt-6">
            <LoadingSpinner size="sm" />
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Form State ----
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070D1A] via-[#0A1628] to-[#070D1A]" />
      <div className="absolute inset-0 orion-bg-grid" />
      <div className="orion-bg-orb w-[400px] h-[400px] bg-teal-600 top-[-100px] right-[-100px]" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => navigate("landing" as Route)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            <span className="orion-gradient-text">Pre-Registration</span>
          </h1>
          <p className="text-muted-foreground">
            Save your basic information for faster hospital check-in
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="orion-card p-6 sm:p-8 space-y-6"
        >
          {/* Hospital Name */}
          <FormField
            label="Hospital Name"
            optional
            icon={Hospital}
            name="hospital_name"
            value={formData.hospital_name}
            onChange={handleChange}
            placeholder="Enter hospital name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Patient Name */}
            <FormField
              label="Patient Name"
              required
              icon={User}
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              placeholder="Enter full name"
            />

            {/* Age */}
            <FormField
              label="Age"
              required
              icon={CalendarDays}
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
              min={0}
              max={120}
            />
          </div>

          {/* Problem */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="w-4 h-4 text-primary" />
              Problem Description <span className="text-destructive">*</span>
            </label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your medical complaint..."
              className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm resize-none"
            />
          </div>

          {/* Email */}
          <FormField
            label="Email Address"
            optional
            hint="For status notifications"
            icon={Mail}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
          />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="orion-btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="p-0" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Pre-Register Patient
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already pre-registered?{" "}
            <button
              type="button"
              onClick={() => navigate("patient-register" as Route)}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              Go to Patient Registration
            </button>
          </p>
        </motion.form>
      </div>
    </div>
  );
}

// ---- Reusable Form Field ----
interface FormFieldProps {
  label: string;
  optional?: boolean;
  hint?: string;
  required?: boolean;
  icon: React.ElementType;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  min?: number;
  max?: number;
}

function FormField({
  label,
  optional,
  hint,
  required,
  icon: Icon,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
}: FormFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
        <Icon className="w-4 h-4 text-primary" />
        {label}{" "}
        {required && <span className="text-destructive">*</span>}
        {optional && (
          <span className="text-muted-foreground font-normal">(Optional)</span>
        )}
      </label>
      {hint && (
        <p className="text-xs text-muted-foreground mb-1.5 ml-6">{hint}</p>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all orion-input text-sm"
      />
    </div>
  );
}
