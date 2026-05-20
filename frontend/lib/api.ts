import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const registerUser = (data: object) => API.post("/auth/register", data);
export const loginUser    = (data: object) => API.post("/auth/login", data);

// ── Test ──────────────────────────────────────────────────────────────────
export const getQuestions = ()            => API.get("/test/questions");
export const submitTest   = (answers: object[]) => API.post("/test/submit", { answers });

// ── Report ────────────────────────────────────────────────────────────────
export const getMyResult  = ()            => API.get("/report/my-result");
export const hasResult    = ()            => API.get("/report/has-result");
export const downloadPDF  = ()            => API.get("/report/download-pdf", { responseType: "blob" });

// Add these aliases at the bottom of lib/api.ts
export const login    = (data: object) => API.post("/auth/login", data);
export const register = (data: object) => API.post("/auth/register", data);

export const getAllStudents = () => API.get("/admin/students");
export const getAnalytics  = () => API.get("/admin/analytics");