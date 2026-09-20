/**
 * Task Management System (TMS) - Department Models & TypeScript Interfaces
 * Centralized schema definitions for organizational hierarchy & department credentials.
 */

export interface DepartmentItem {
  id: string;
  departmentName: string;
  departmentCode: string;
  departmentHead: string;
  departmentHeadId?: string;
  departmentHeadAvatar?: string;
  description?: string;
  loginEmail: string;
  loginPassword?: string;
  contactEmail?: string;
  checkInCutoffTime: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  employeeCount: number;
  activeEmployeeCount?: number;
  inactiveEmployeeCount?: number;
  departmentColor: string;
}

export interface CreateDepartmentPayload {
  departmentName: string;
  departmentCode: string;
  departmentHead: string;
  departmentHeadId?: string;
  description?: string;
  loginEmail: string;
  loginPassword?: string;
  contactEmail?: string;
  checkInCutoffTime?: string;
  employeeCount?: number;
  departmentColor?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDepartmentPayload {
  departmentName?: string;
  departmentCode?: string;
  departmentHead?: string;
  departmentHeadId?: string;
  description?: string;
  loginEmail?: string;
  loginPassword?: string;
  contactEmail?: string;
  checkInCutoffTime?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  employeeCount?: number;
  departmentColor?: string;
  isActive?: boolean;
}
