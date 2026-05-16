import { getServerUrl } from "./storage";

async function base(): Promise<string> {
  const url = await getServerUrl();
  if (!url) throw new Error("NO_SERVER");
  return url;
}

async function get<T>(path: string): Promise<T> {
  const url = await base();
  const res = await fetch(`${url}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = await base();
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Types ---

export interface ServerInfo {
  company_name: string;
  logo: string | null;
  version: string;
}

export interface AuthEmployee {
  id: number;
  employee_number: string;
  name: string;
  last_name: string | null;
  photo: string | null;
  department: string | null;
  area: string | null;
  job_title_name: string | null;
  schedule_name: string | null;
  email: string | null;
  phone: string | null;
  rfc: string | null;
  curp: string | null;
  nss: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  last_checkin: { type: "in" | "out"; timestamp: string } | null;
}

export interface Checkin {
  id: number;
  employee_id: number;
  type: "in" | "out";
  timestamp: string;
  lat: number | null;
  lng: number | null;
  note: string | null;
}

export interface CheckinResult {
  id: number;
  type: "in" | "out";
  timestamp: string;
  geofence_name: string | null;
}

// --- API calls ---

export async function fetchInfo(): Promise<ServerInfo> {
  return get<ServerInfo>("/api/info");
}

export async function authEmployee(
  employee_number: string,
  pin: string
): Promise<AuthEmployee> {
  const res = await post<{
    ok: boolean;
    employee: {
      id: number;
      employee_number: string;
      name: string;
      last_name: string | null;
      photo: string | null;
      department_name: string | null;
      area_name: string | null;
      job_title_name: string | null;
      schedule_name: string | null;
      email: string | null;
      phone: string | null;
      rfc: string | null;
      curp: string | null;
      nss: string | null;
      birth_date: string | null;
      gender: string | null;
      address: string | null;
    };
    last_checkin: { type: "in" | "out"; timestamp: string } | null;
  }>("/api/mobile/auth", { employee_number, pin });

  const e = res.employee;
  return {
    id: e.id,
    employee_number: e.employee_number,
    name: e.name,
    last_name: e.last_name,
    photo: e.photo,
    department: e.department_name,
    area: e.area_name,
    job_title_name: e.job_title_name,
    schedule_name: e.schedule_name,
    email: e.email,
    phone: e.phone,
    rfc: e.rfc,
    curp: e.curp,
    nss: e.nss,
    birth_date: e.birth_date,
    gender: e.gender,
    address: e.address,
    last_checkin: res.last_checkin,
  };
}

export async function fetchTodayCheckins(employee_id: number): Promise<Checkin[]> {
  return get<Checkin[]>(`/api/mobile/checkins/today?employee_id=${employee_id}`);
}

export async function registerCheckin(
  employee_id: number,
  type: "in" | "out",
  lat: number | null,
  lng: number | null,
  photo: string | null
): Promise<CheckinResult> {
  return post<CheckinResult>("/api/mobile/checkin", { employee_id, type, lat, lng, photo });
}

export async function testConnection(): Promise<boolean> {
  try {
    await fetchInfo();
    return true;
  } catch {
    return false;
  }
}
