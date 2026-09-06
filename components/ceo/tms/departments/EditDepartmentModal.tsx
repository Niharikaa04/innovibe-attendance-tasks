'use client';

import React, { useState, useEffect } from 'react';
import { DepartmentItem, UpdateDepartmentPayload } from '../../../../lib/department-models';
import { DepartmentService } from '../../../../lib/department-service';
import { EmployeeService } from '../../../../lib/employee-service';
import { EmployeeRecord } from '../../../../lib/employee-models';
import { X, Building2, Shield, Mail, Clock, Check, UserCheck } from 'lucide-react';

interface EditDepartmentModalProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDepartmentUpdated: () => void;
}

export function EditDepartmentModal({ department, isOpen, onClose, onDepartmentUpdated }: EditDepartmentModalProps) {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);

  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [description, setDescription] = useState('');
  const [departmentHeadId, setDepartmentHeadId] = useState('');
  const [departmentHead, setDepartmentHead] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [checkInCutoffTime, setCheckInCutoffTime] = useState('09:15 AM');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [departmentColor, setDepartmentColor] = useState('bg-amber-500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!department || !isOpen) return;

    setDepartmentName(department.departmentName);
    setDepartmentCode(department.departmentCode);
    setDescription(department.description || '');
    setDepartmentHead(department.departmentHead);
    setDepartmentHeadId(department.departmentHeadId || '');
    setLoginEmail(department.loginEmail);
    setCheckInCutoffTime(department.checkInCutoffTime || '09:15 AM');
    setStatus(department.status);
    setDepartmentColor(department.departmentColor || 'bg-amber-500');

    // Fetch employee roster for head selector
    EmployeeService.getAll().then((list) => {
      setEmployees(list);
    });
  }, [department, isOpen]);

  if (!isOpen || !department) return null;

  const handleHeadChange = (headId: string) => {
    setDepartmentHeadId(headId);
    if (!headId) {
      setDepartmentHead('Unassigned');
    } else {
      const selected = employees.find((e) => e.id === headId || e.employeeId === headId);
      if (selected) {
        setDepartmentHead(selected.fullName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim() || !departmentCode.trim()) {
      alert('Department Name and Code are required.');
      return;
    }

    setIsSubmitting(true);

    const patch: UpdateDepartmentPayload = {
      departmentName: departmentName.trim(),
      departmentCode: departmentCode.trim().toUpperCase(),
      description: description.trim(),
      departmentHead: departmentHead.trim() || 'Unassigned',
      departmentHeadId: departmentHeadId || undefined,
      loginEmail: loginEmail.trim(),
      checkInCutoffTime: checkInCutoffTime.trim(),
      status,
      isActive: status === 'ACTIVE',
      departmentColor,
    };

    await DepartmentService.update(department.id, patch);
    setIsSubmitting(false);
    onDepartmentUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 max-w-xl w-full shadow-2xl text-left space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-gotham text-lg font-extrabold text-white">Edit Department</h2>
              <p className="font-sans text-xs text-slate-400">Modify organizational settings, head assignment, and cutoff rules</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Department Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                required
                style={{ backgroundColor: '#090d16', color: '#ffffff' }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                Code *
              </label>
              <input
                type="text"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                required
                style={{ backgroundColor: '#090d16', color: '#ffffff' }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white outline-none focus:border-amber-500 font-apfel font-bold uppercase"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Department Scope & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Primary responsibilities, technical domain, or operational scope..."
              style={{ backgroundColor: '#090d16', color: '#ffffff' }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white placeholder-slate-500 outline-none focus:border-amber-500 font-normal resize-none"
            />
          </div>

          {/* Department Head Selector */}
          <div>
            <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Assigned Department Head
            </label>
            <select
              value={departmentHeadId}
              onChange={(e) => handleHeadChange(e.target.value)}
              style={{ backgroundColor: '#090d16', color: '#ffffff' }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white outline-none focus:border-amber-500 font-semibold cursor-pointer"
            >
              <option value="">-- Select Department Head --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.designation} • {emp.departmentName})
                </option>
              ))}
            </select>
          </div>

          {/* Email & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                Official Department Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ backgroundColor: '#090d16', color: '#ffffff' }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div>
              <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                Department Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                style={{ backgroundColor: '#090d16', color: '#ffffff' }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white outline-none focus:border-amber-500 font-bold cursor-pointer"
              >
                <option value="ACTIVE">🟢 Active & Operational</option>
                <option value="INACTIVE">🔴 Inactive / Archived</option>
              </select>
            </div>
          </div>

          {/* Cutoff Time */}
          <div>
            <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Check-in Cutoff Time
            </label>
            <input
              type="text"
              value={checkInCutoffTime}
              onChange={(e) => setCheckInCutoffTime(e.target.value)}
              style={{ backgroundColor: '#090d16', color: '#ffffff' }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 !text-white outline-none focus:border-amber-500 font-apfel font-medium"
            />
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="font-montserrat block text-[10px] font-extrabold uppercase text-slate-400 mb-2">
              Color Theme Accent
            </label>
            <div className="flex items-center gap-3">
              {[
                { class: 'bg-amber-500', name: 'Amber Gold' },
                { class: 'bg-emerald-500', name: 'Emerald' },
                { class: 'bg-sky-500', name: 'Sky Blue' },
                { class: 'bg-purple-500', name: 'Purple' },
                { class: 'bg-rose-500', name: 'Rose' },
              ].map((c) => (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setDepartmentColor(c.class)}
                  className={`h-7 w-7 rounded-full ${c.class} flex items-center justify-center transition-transform ${
                    departmentColor === c.class ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {departmentColor === c.class && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 font-apfel">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#78350f] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Updating...' : 'Save Department Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
