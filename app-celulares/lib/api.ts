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
  is_admin: boolean;
  is_team_admin: boolean;
  has_face: boolean;
  last_checkin: { type: "in" | "out"; timestamp: string } | null;
}

export interface TeamMember {
  id: number;
  name: string;
  last_name: string | null;
  employee_number: string;
  photo: string | null;
  job_title: string | null;
  last_type: "entrada" | "salida" | null;
  last_time: string | null;
}

export interface MyTeam {
  id: number;
  name: string;
  description: string | null;
  members: TeamMember[];
  date?: string;
}

export interface AdminCheckin {
  id: number;
  employee_id: number;
  name: string;
  last_name: string | null;
  employee_number: string;
  photo: string | null;
  department_name: string | null;
  job_title_name: string | null;
  type: "in" | "out";
  timestamp: string;
  geofence_name: string | null;
}

export interface Checkin {
  id: number;
  employee_id: number;
  type: "in" | "out";
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  photo: string | null;
  geofence_name: string | null;
  face_verified: number | null;
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
      is_admin: boolean;
      is_team_admin: boolean;
      has_face: boolean;
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
    is_admin: !!e.is_admin,
    is_team_admin: !!e.is_team_admin,
    has_face: !!e.has_face,
  };
}

export async function fetchTodayCheckins(employee_id: number, date?: string): Promise<Checkin[]> {
  const params = new URLSearchParams({ employee_id: String(employee_id) });
  if (date) params.append("date", date);
  return get<Checkin[]>(`/api/mobile/checkins/today?${params}`);
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

export async function registerFace(
  employee_id: number,
  photo: string
): Promise<{ ok: boolean; error?: string }> {
  return post<{ ok: boolean; error?: string }>("/api/mobile/register-face", { employee_id, photo });
}

export async function fetchAdminCheckins(
  employee_id: number,
  date?: string
): Promise<AdminCheckin[]> {
  const url = await base();
  const params = new URLSearchParams({ employee_id: String(employee_id) });
  if (date) params.append("date", date);
  const res = await fetch(`${url}/api/mobile/admin/checkins?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchMyTeam(employeeId: number, date?: string): Promise<MyTeam[]> {
  try {
    const url = await base();
    const params = new URLSearchParams({ employee_id: String(employeeId) });
    if (date) params.append("date", date);
    const endpoint = date ? "/api/mobile/my-team/history" : "/api/mobile/my-team";
    const res = await fetch(`${url}${endpoint}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await fetchInfo();
    return true;
  } catch {
    return false;
  }
}

// ── Vacation types ────────────────────────────────────

export interface VacationBalance {
  id: number | null;
  employee_id: number;
  year: number;
  days_granted: number;
  days_used: number;
  days_available: number;
}

export interface VacationRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  days_count: number;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}

export interface VacationData {
  balance: VacationBalance;
  requests: VacationRequest[];
}

// ── Vacation API calls ────────────────────────────────

export async function fetchVacation(employee_id: number): Promise<VacationData> {
  return get<VacationData>(`/api/mobile/vacation?employee_id=${employee_id}`);
}

export async function submitVacationRequest(
  employee_id: number,
  start_date: string,
  end_date: string,
  days_count: number,
  notes?: string
): Promise<{ id: number; ok: boolean }> {
  return post<{ id: number; ok: boolean }>("/api/mobile/vacation/request", {
    employee_id,
    start_date,
    end_date,
    days_count,
    notes: notes ?? null,
  });
}

// ── Team leader: absence notes ────────────────────────

export interface AbsenceNote {
  id: number;
  employee_id: number;
  emp_name: string;
  emp_last: string | null;
  date: string;
  note: string;
  added_by: number;
  created_at: string;
}

export async function fetchAbsenceNotes(employee_id: number, date: string): Promise<AbsenceNote[]> {
  return get<AbsenceNote[]>(`/api/mobile/absence-notes?employee_id=${employee_id}&date=${date}`);
}

export async function postAbsenceNote(
  employee_id: number,
  member_id: number,
  date: string,
  note: string
): Promise<{ ok: boolean; id: number }> {
  return post<{ ok: boolean; id: number }>("/api/mobile/absence-note", { employee_id, member_id, date, note });
}

// ── Team leader: transfers ────────────────────────────

export interface TeamOption {
  id: number;
  name: string;
}

export interface TransferRequest {
  id: number;
  employee_id: number;
  emp_name: string;
  emp_last: string | null;
  from_team_name: string | null;
  to_team_name: string;
  status: "pending" | "confirmed" | "rejected" | "forced";
  notes: string | null;
  requested_at: string;
  resolved_at: string | null;
}

export async function fetchTeams(): Promise<TeamOption[]> {
  return get<TeamOption[]>("/api/mobile/teams");
}

export async function fetchTransfers(employee_id: number): Promise<TransferRequest[]> {
  return get<TransferRequest[]>(`/api/mobile/transfers?employee_id=${employee_id}`);
}

export async function submitTransferRequest(
  employee_id: number,
  member_id: number,
  to_team_id: number,
  notes?: string
): Promise<{ ok: boolean; id: number }> {
  return post<{ ok: boolean; id: number }>("/api/mobile/transfer-request", {
    employee_id, member_id, to_team_id, notes: notes ?? null,
  });
}

export async function confirmTransfer(
  employee_id: number,
  transfer_id: number
): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>(`/api/mobile/transfers/${transfer_id}/confirm`, { employee_id });
}

// ── HR Documents ─────────────────────────────────────────────────────────────

export interface HrDocument {
  id: number;
  title: string;
  description: string | null;
  file_name: string | null;
  file_type: string | null;
  expires_at: string | null;
  created_at: string;
  sent_at: string;
  viewed_at: string | null;
  signed_at: string | null;
}

export interface HrSignResult {
  ok: boolean;
  already?: boolean;
  signature_hash?: string;
  signed_at?: string;
}

export async function fetchHrDocuments(employee_id: number): Promise<HrDocument[]> {
  return get<HrDocument[]>(`/api/mobile/hr/documents?employee_id=${employee_id}`);
}

export async function getHrDocumentFileUrl(
  serverUrl: string,
  docId: number,
  employee_id: number
): Promise<string> {
  return `${serverUrl}/api/mobile/hr/documents/${docId}/file?employee_id=${employee_id}`;
}

export async function signHrDocument(
  docId: number,
  employee_id: number,
  device_info: Record<string, string>
): Promise<HrSignResult> {
  return post<HrSignResult>(`/api/mobile/hr/documents/${docId}/sign`, { employee_id, device_info });
}
