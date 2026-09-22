"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY_REGULAR = "orion_dismissed_patients";
const STORAGE_KEY_EMERGENCY = "orion_dismissed_emergency";

interface PatientLike {
  patient_name?: string;
  patient?: { name?: string; id?: number };
  urgency_score?: number;
}

const getKey = (patient: PatientLike): string => {
  const name = patient?.patient_name || patient?.patient?.name || "unknown";
  const score = patient?.urgency_score ?? "";
  const id = patient?.patient?.id ?? "";
  return `${id}_${name}_${score}`;
};

const loadDismissed = (storageKey: string): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));
  } catch {
    return new Set();
  }
};

const saveDismissed = (storageKey: string, set: Set<string>) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...set]));
  } catch {
    /* quota exceeded */
  }
};

export function useDismissedPatients(isEmergency = false) {
  const storageKey = isEmergency ? STORAGE_KEY_EMERGENCY : STORAGE_KEY_REGULAR;
  const [dismissed, setDismissed] = useState<Set<string>>(() =>
    loadDismissed(storageKey)
  );

  const dismiss = useCallback(
    (patient: PatientLike) => {
      const key = getKey(patient);
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(key);
        saveDismissed(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  // Accept any array of objects that have the required shape
  const filterPatients = useCallback(
    <T extends PatientLike>(patients: T[]): T[] =>
      patients.filter((p) => !dismissed.has(getKey(p))) as T[],
    [dismissed]
  );

  const clearAll = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDismissed(new Set());
  }, [storageKey]);

  return { dismiss, filterPatients, clearAll };
}
