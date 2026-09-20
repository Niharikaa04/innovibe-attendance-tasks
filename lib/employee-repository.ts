/**
 * Task Management System (TMS) - Employee Repository & Browser Storage Persistence Layer
 * Implements local persistence using browser localStorage with workforce seed data.
 */

import { EmployeeRecord, CreateEmployeePayload, UpdateEmployeePayload, EmployeeKpis } from './employee-models';

const STORAGE_KEY = 'ICC_TMS_EMPLOYEES_PERSISTENCE_V1';

const seedEmployees: EmployeeRecord[] = [
  {
    id: 'EMP-101',
    employeeId: 'EMP-101',
    fullName: 'Sri Hari Kolusu',
    email: 'ceo@innovibe.in',
    phone: '+91 98765 43210',
    designation: 'Founder & CEO',
    departmentId: 'DEP-100',
    departmentName: 'Executive Office',
    role: 'Founder & CEO',
    userType: 'CEO',
    joiningDate: 'Jan 01, 2024',
    attendance: 0,
    productivityScore: 0,
    productivityStatus: 'GOOD',
    accountStatus: 'ONLINE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: 'Sep 01, 2026',
    updatedAt: 'Sep 01, 2026',
    isActive: true,
  },
  {
    id: 'EMP-102',
    employeeId: 'EMP-102',
    fullName: 'Niharika Kadali',
    email: '',
    phone: '',
    designation: 'IT Team',
    departmentId: 'DEP-104',
    departmentName: 'Technology',
    role: 'IT Team',
    userType: 'EMPLOYEE',
    joiningDate: 'Sep 01, 2026',
    attendance: 0,
    productivityScore: 0,
    productivityStatus: 'GOOD',
    accountStatus: 'ONLINE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: 'Sep 01, 2026',
    updatedAt: 'Sep 01, 2026',
    isActive: true,
  },
  {
    id: 'EMP-103',
    employeeId: 'EMP-103',
    fullName: 'Greeshma Satya Sri Dasari',
    email: '',
    phone: '',
    designation: 'IT Team',
    departmentId: 'DEP-104',
    departmentName: 'Technology',
    role: 'IT Team',
    userType: 'EMPLOYEE',
    joiningDate: 'Sep 01, 2026',
    attendance: 0,
    productivityScore: 0,
    productivityStatus: 'GOOD',
    accountStatus: 'ONLINE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: 'Sep 01, 2026',
    updatedAt: 'Sep 01, 2026',
    isActive: true,
  },
];

export const EVENT_EMPLOYEES_UPDATED = 'innovibe:employees_updated';

export class EmployeeRepository {
  private static loadFromStorage(): EmployeeRecord[] {
    if (typeof window === 'undefined') return seedEmployees;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || raw.trim() === '' || raw === 'undefined' || raw === 'null') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
        return seedEmployees;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
        return seedEmployees;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to read employees from localStorage, re-seeding:', e);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
      } catch (err) {}
      return seedEmployees;
    }
  }

  private static saveToStorage(data: EmployeeRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(EVENT_EMPLOYEES_UPDATED, { detail: data }));
    } catch (e) {
      console.error('Failed to save employees to localStorage:', e);
    }
  }

  static onEmployeesUpdated(callback: (records: EmployeeRecord[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => {
      callback(EmployeeRepository.getEmployees());
    };
    window.addEventListener(EVENT_EMPLOYEES_UPDATED, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_EMPLOYEES_UPDATED, handler);
      window.removeEventListener('storage', handler);
    };
  }

  static getEmployees(): EmployeeRecord[] {
    return this.loadFromStorage();
  }

  static getEmployee(id: string): EmployeeRecord | null {
    const list = this.loadFromStorage();
    return list.find((e) => e.id === id || e.employeeId === id) || null;
  }

  static createEmployee(payload: CreateEmployeePayload): EmployeeRecord {
    const list = this.loadFromStorage();
    const generatedEmpId = payload.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`;

    const newEmp: EmployeeRecord = {
      id: generatedEmpId,
      employeeId: generatedEmpId,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || '+91 98765 00000',
      password: payload.password || 'Emp@2026Secure',
      designation: payload.designation,
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      role: payload.designation,
      userType: payload.userType,
      joiningDate: payload.joiningDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      attendance: 95,
      productivityScore: 92,
      productivityStatus: 'EXCELLENT',
      accountStatus: 'ONLINE',
      avatar: payload.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      isActive: true,
    };

    list.unshift(newEmp);
    this.saveToStorage(list);
    return newEmp;
  }

  static updateEmployee(id: string, patch: UpdateEmployeePayload): EmployeeRecord | null {
    const list = this.loadFromStorage();
    const idx = list.findIndex((e) => e.id === id || e.employeeId === id);
    if (idx === -1) return null;

    const updated: EmployeeRecord = {
      ...list[idx],
      ...patch,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    list[idx] = updated;
    this.saveToStorage(list);
    return updated;
  }

  static deleteEmployee(id: string): boolean {
    const list = this.loadFromStorage();
    const filtered = list.filter((e) => e.id !== id && e.employeeId !== id);
    if (filtered.length === list.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  static getKpis(): EmployeeKpis {
    const list = this.loadFromStorage();
    return {
      totalWorkforce: list.length,
      activeWorkforce: list.filter((e) => e.isActive).length,
      departmentHeads: list.filter((e) => e.userType === 'DEPARTMENT_HEAD' || e.userType === 'CEO').length,
      onlineMembers: list.filter((e) => e.accountStatus === 'ONLINE').length,
      inactiveMembers: list.filter((e) => e.accountStatus === 'OFFLINE' || e.accountStatus === 'INACTIVE').length,
    };
  }
}
