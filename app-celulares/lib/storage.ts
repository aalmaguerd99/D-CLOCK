import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  SERVER_URL: "server_url",
  EMPLOYEE_ID: "employee_id",
  EMPLOYEE_NUMBER: "employee_number",
  EMPLOYEE_DATA: "employee_data",
  COMPANY_NAME: "company_name",
  COMPANY_LOGO: "company_logo",
} as const;

export async function getServerUrl(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.SERVER_URL);
}
export async function setServerUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SERVER_URL, url.replace(/\/$/, ""));
}
export async function clearServerUrl(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SERVER_URL);
}

export interface EmployeeSession {
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
}

export async function saveSession(emp: EmployeeSession): Promise<void> {
  await SecureStore.setItemAsync(KEYS.EMPLOYEE_ID, String(emp.id));
  await SecureStore.setItemAsync(KEYS.EMPLOYEE_NUMBER, emp.employee_number);
  await AsyncStorage.setItem(KEYS.EMPLOYEE_DATA, JSON.stringify(emp));
}

export async function getSession(): Promise<EmployeeSession | null> {
  const id = await SecureStore.getItemAsync(KEYS.EMPLOYEE_ID);
  if (!id) return null;
  const employee_number = await SecureStore.getItemAsync(KEYS.EMPLOYEE_NUMBER);
  const raw = await AsyncStorage.getItem(KEYS.EMPLOYEE_DATA);
  const d = raw ? JSON.parse(raw) : {};
  return {
    id: Number(id),
    employee_number: employee_number ?? "",
    name: d.name ?? "",
    last_name: d.last_name || null,
    photo: d.photo || null,
    department: d.department || null,
    area: d.area || null,
    job_title_name: d.job_title_name || null,
    schedule_name: d.schedule_name || null,
    email: d.email || null,
    phone: d.phone || null,
    rfc: d.rfc || null,
    curp: d.curp || null,
    nss: d.nss || null,
    birth_date: d.birth_date || null,
    gender: d.gender || null,
    address: d.address || null,
  };
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.EMPLOYEE_ID);
  await SecureStore.deleteItemAsync(KEYS.EMPLOYEE_NUMBER);
  await AsyncStorage.removeItem(KEYS.EMPLOYEE_DATA);
}

export async function saveCompanyInfo(info: { company_name: string; logo: string | null }): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPANY_NAME, info.company_name);
  await AsyncStorage.setItem(KEYS.COMPANY_LOGO, info.logo ?? "");
}

export async function getCompanyInfo(): Promise<{ company_name: string; logo: string | null }> {
  const company_name = await AsyncStorage.getItem(KEYS.COMPANY_NAME);
  const logo = await AsyncStorage.getItem(KEYS.COMPANY_LOGO);
  return { company_name: company_name ?? "D-CLOCK", logo: logo || null };
}
