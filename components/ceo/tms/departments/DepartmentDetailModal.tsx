'use client';

import React, { useState, useEffect } from 'react';
import { DepartmentItem } from '../../../../lib/department-models';
import { EmployeeRecord } from '../../../../lib/employee-models';
import { EmployeeService } from '../../../../lib/employee-service';
import { DepartmentService } from '../../../../lib/department-service';
import { CreateEmployeeModal } from '../employees/CreateEmployeeModal';
import {
  X,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Mail,
  Shield,
  ArrowRightLeft,
  Crown,
  Search,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface DepartmentDetailModalProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDepartmentUpdated: () => void;
}

export function DepartmentDetailModal({ department, isOpen, onClose, onDepartmentUpdated }: DepartmentDetailModalProps) {
  const [departmentEmployees, setDepartmentEmployees] = useState<EmployeeRecord[]>([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [movingEmpId, setMovingEmpId] = useState<string | null>(null);
  const [targetDeptId, setTargetDeptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!department) return;
    setIsLoading(true);
    const allEmps = await EmployeeService.getAll();
    const depts = await DepartmentService.getAll();

    setAllDepartments(depts);

    // Filter employees belonging to this department
    const linked = allEmps.filter(
      (e) =>
        e.departmentId === department.id ||
        e.departmentName.toLowerCase() === department.departmentName.toLowerCase() ||
        e.departmentName.toLowerCase() === department.departmentCode.toLowerCase()
    );

    setDepartmentEmployees(linked);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && department) {
      loadData();
    }
  }, [isOpen, department]);

  if (!isOpen || !department) return null;

  const handleMoveEmployee = async (empId: string, newDeptId: string) => {
    if (!newDeptId) return;
    const target = allDepartments.find((d) => d.id === newDeptId);
    if (!target) return;

    if (confirm(`Move employee to "${target.departmentName}" department?`)) {
      await EmployeeService.update(empId, {
        departmentId: target.id,
        departmentName: target.departmentName,
      });
      setMovingEmpId(null);
      loadData();
      onDepartmentUpdated();
    }
  };

  const handleSetHead = async (emp: EmployeeRecord) => {
    if (confirm(`Assign "${emp.fullName}" as Department Head for ${department.departmentName}?`)) {
      await DepartmentService.update(department.id, {
        departmentHead: emp.fullName,
        departmentHeadId: emp.id,
      });
      loadData();
      onDepartmentUpdated();
    }
  };

  const filteredEmployees = departmentEmployees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 max-w-3xl w-full shadow-2xl text-left space-y-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${department.departmentColor || 'bg-amber-500'} text-white shadow-md`}>
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-apfel">
                  [{department.departmentCode}]
                </span>
                <h2 className="font-gotham text-xl font-extrabold text-white">{department.departmentName}</h2>
              </div>
              <p className="font-sans text-xs text-slate-400 mt-0.5">
                Official Email: <span className="text-slate-200">{department.loginEmail}</span> • Cutoff:{' '}
                <span className="text-amber-300 font-bold">{department.checkInCutoffTime}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 font-apfel">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Department Head</span>
              <p className="text-sm font-black text-amber-400 mt-0.5 truncate max-w-[160px]">{department.departmentHead}</p>
            </div>
            <Crown className="h-5 w-5 text-amber-400 shrink-0" />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Staff</span>
              <p className="text-lg font-black text-white mt-0.5">{departmentEmployees.length} Personnel</p>
            </div>
            <Users className="h-5 w-5 text-blue-400 shrink-0" />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Cutoff & Status</span>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">{department.status} • {department.checkInCutoffTime}</p>
            </div>
            <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
          </div>
        </div>

        {/* Personnel Search & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department staff..."
              style={{ backgroundColor: '#090d16', color: '#ffffff' }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 !text-white text-xs outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setIsAddEmpModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#78350f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee to {department.departmentCode}</span>
          </button>
        </div>

        {/* Employee Roster Table / List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {isLoading ? (
            <p className="py-8 text-center text-slate-400 text-xs">Loading department personnel...</p>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No employees assigned to this department yet.</p>
              <p className="text-[11px] text-slate-500">Click "+ Add Employee to {department.departmentCode}" above to onboard team members.</p>
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const isHead = emp.fullName.toLowerCase() === department.departmentHead.toLowerCase() || emp.id === department.departmentHeadId;
              const isMoving = movingEmpId === emp.id;

              return (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={emp.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{emp.fullName}</span>
                        {isHead && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[9px] font-black">
                            <Crown className="w-3 h-3" />
                            Head
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">({emp.employeeId})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{emp.designation} • {emp.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isHead && (
                      <button
                        onClick={() => handleSetHead(emp)}
                        title="Set as Department Head"
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Crown className="w-3 h-3" />
                        <span>Set Head</span>
                      </button>
                    )}

                    {isMoving ? (
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                        <select
                          value={targetDeptId}
                          onChange={(e) => setTargetDeptId(e.target.value)}
                          style={{ backgroundColor: '#090d16', color: '#ffffff' }}
                          className="px-2 py-1 rounded-lg text-[10px] !text-white border border-slate-700"
                        >
                          <option value="">Move to...</option>
                          {allDepartments.filter((d) => d.id !== department.id).map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.departmentName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleMoveEmployee(emp.id, targetDeptId)}
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setMovingEmpId(null)}
                          className="px-1.5 py-1 text-slate-400 hover:text-white text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMovingEmpId(emp.id)}
                        title="Move to another department"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Move</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded Create Employee Modal with Default Department */}
      <CreateEmployeeModal
        isOpen={isAddEmpModalOpen}
        onClose={() => setIsAddEmpModalOpen(false)}
        onEmployeeCreated={() => {
          loadData();
          onDepartmentUpdated();
        }}
      />
    </div>
  );
}
