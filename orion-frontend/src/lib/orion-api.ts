// ====== ORION-Health API Service ======
// Direct connection to FastAPI backend at localhost:8000

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  return res.json();
}

// Pre-registration
export const preRegisterPatient = (data: {
  hospital_name?: string;
  patient_name: string;
  age: number;
  problem: string;
  email?: string;
}) => apiFetch("/preregister", { method: "POST", body: JSON.stringify(data) });

export const searchPreRegistered = (query: string) =>
  apiFetch(`/preregister/search/${encodeURIComponent(query)}`);

export const fetchPreRegistered = (name: string) =>
  apiFetch(`/preregister/${encodeURIComponent(name)}`);

// Patient submission
export const submitPatient = (data: Record<string, unknown>) =>
  apiFetch("/patient/submit", { method: "POST", body: JSON.stringify(data) });

export const fetchPatientHistory = (name: string) =>
  apiFetch(`/patient/history/${encodeURIComponent(name)}`);

// Doctor endpoints
export const fetchPatients = (batch: number = 1) =>
  apiFetch(`/doctor/patients?batch=${batch}`);

export const fetchEmergencyPatients = (batch: number = 1) =>
  apiFetch(`/doctor/emergency?batch=${batch}`);

export const submitOverride = (payload: Record<string, unknown>) =>
  apiFetch("/doctor/override", { method: "POST", body: JSON.stringify(payload) });

export const fetchDoctorHistory = () => apiFetch("/doctor/history");

// Admin endpoints
export const fetchSystemLogs = () => apiFetch("/admin/logs");
export const fetchSystemHealth = () => apiFetch("/admin/health");
