'use client';

import React, { useState, useEffect } from 'react';
import {
  EmployeeRecord,
  EmployeeKpis,
  UserType,
  AccountStatus,
} from '../../../../lib/employee-models';
import { EmployeeService } from '../../../../lib/employee-service';
import { DepartmentItem } from '../../../../lib/department-models';
import { DepartmentService } from '../../../../lib/department-service';
import { CreateEmployeeModal } from './CreateEmployeeModal';

import {
  Users,
  UserPlus,
  Search,
  UserCheck,
  Building2,
  Trash2,
  Crown,
  Activity,
  Circle,
} from 'lucide-react';

export function TmsEmployeesView() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  const [kpis, setKpis] = useState<EmployeeKpis>({
    totalWorkforce: 0,
    activeWorkforce: 0,
    departmentHeads: 0,
    onlineMembers: 0,
    inactiveMembers: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserType, setSelectedUserType] =
    useState<UserType | 'ALL'>('ALL');

  const [selectedDepartment, setSelectedDepartment] =
    useState<string>('ALL');

  const [selectedAccountStatus, setSelectedAccountStatus] =
    useState<AccountStatus | 'ALL'>('ALL');

  // Selected KPI
  const [selectedKpi, setSelectedKpi] = useState<
    'TOTAL' | 'ACTIVE' | 'HEADS' | 'ONLINE' | 'INACTIVE' | null
  >(null);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  /**
   * Load employees, departments and KPI data.
   */
  const loadData = async () => {
    try {
      setIsLoading(true);

      const [
        empList,
        deptList,
        kpiSummary,
      ] = await Promise.all([
        EmployeeService.getAll().catch(() => []),
        DepartmentService.getAll().catch(() => []),
        EmployeeService.getKpis().catch(() => null),
      ]);

      setEmployees(empList);
      setDepartments(deptList);

      if (kpiSummary) {
        setKpis(kpiSummary);
      }
    } catch (e) {
      console.error(
        'Error loading employee directory:',
        e
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initial load and live employee updates.
   */
  useEffect(() => {
    loadData();

    const unsubscribe =
      EmployeeService.onEmployeesUpdated(() => {
        loadData();
      });

    return () => unsubscribe();
  }, []);

  /**
   * Delete employee.
   */
  const handleDeleteEmployee = async (
    id: string,
    name: string
  ) => {
    if (
      confirm(
        `Are you sure you want to delete employee "${name}"? This action persists across sessions.`
      )
    ) {
      await EmployeeService.delete(id);
      loadData();
    }
  };

  /**
   * KPI click handler.
   *
   * Clicking a KPI filters the employee table.
   * Clicking the same KPI again removes the filter.
   */
  const handleKpiClick = (
    kpi:
      | 'TOTAL'
      | 'ACTIVE'
      | 'HEADS'
      | 'ONLINE'
      | 'INACTIVE'
  ) => {
    setSelectedKpi((prev) =>
      prev === kpi ? null : kpi
    );

    // Clear dropdown filters when selecting KPI
    setSelectedUserType('ALL');
    setSelectedDepartment('ALL');
    setSelectedAccountStatus('ALL');
  };

  /**
   * Filter employees.
   */
  const filteredEmployees =
    employees.filter((emp) => {
      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        emp.fullName
          .toLowerCase()
          .includes(query) ||
        emp.email
          .toLowerCase()
          .includes(query) ||
        emp.designation
          .toLowerCase()
          .includes(query) ||
        emp.employeeId
          .toLowerCase()
          .includes(query);

      const matchesUserType =
        selectedUserType === 'ALL'
          ? true
          : emp.userType === selectedUserType;

      const matchesDepartment =
        selectedDepartment === 'ALL'
          ? true
          : emp.departmentName ===
            selectedDepartment;

      const matchesStatus =
        selectedAccountStatus === 'ALL'
          ? true
          : emp.accountStatus ===
            selectedAccountStatus;

      const matchesKpi =
        selectedKpi === null ||
        selectedKpi === 'TOTAL'
          ? true
          : selectedKpi === 'ACTIVE'
            ? emp.isActive
            : selectedKpi === 'HEADS'
              ? emp.userType === 'CEO' ||
                emp.userType ===
                  'DEPARTMENT_HEAD'
              : selectedKpi === 'ONLINE'
                ? emp.accountStatus ===
                  'ONLINE'
                : selectedKpi === 'INACTIVE'
                  ? emp.accountStatus ===
                      'OFFLINE' ||
                    emp.accountStatus ===
                      'INACTIVE'
                  : true;

      return (
        matchesSearch &&
        matchesUserType &&
        matchesDepartment &&
        matchesStatus &&
        matchesKpi
      );
    });

  /**
   * User type badge styles.
   */
  const getUserTypeBadgeStyle = (
    userType: UserType
  ) => {
    switch (userType) {
      case 'CEO':
        return 'bg-amber-50 text-amber-800 border-amber-200';

      case 'DEPARTMENT_HEAD':
        return 'bg-purple-50 text-purple-800 border-purple-200';

      case 'HR':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';

      case 'ADMIN':
        return 'bg-rose-50 text-rose-800 border-rose-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  /**
   * Account status badge styles.
   */
  const getAccountStatusBadgeStyle = (
    status: AccountStatus
  ) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'OFFLINE':
        return 'bg-slate-100 text-slate-600 border-slate-200';

      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-300">

      {/* =========================================================
          1. HEADER
      ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">

        <div className="space-y-1">

          <div className="flex items-center gap-2">

            <div className="p-2 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-2xs">
              <Users className="h-5 w-5" />
            </div>

            <h1 className="font-gotham text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
              Workforce Directory
            </h1>

            <span className="font-apfel text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
              Personnel Engine
            </span>

          </div>

          <p className="font-sans text-xs text-slate-500 font-medium">
            Monitor and manage all corporate workforce employees and department heads in one unified directory.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              setIsCreateModalOpen(true)
            }
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#78350f] text-white font-apfel font-extrabold text-xs shadow-md shadow-amber-900/10 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />

            <span>
              + Add Employee
            </span>
          </button>

        </div>
      </div>


      {/* =========================================================
          2. KPI SUMMARY CARDS
          Centered like the reference screenshot
      ========================================================= */}
      <div className="flex flex-wrap justify-center gap-4">

        {/* TOTAL WORKFORCE */}
        <div
          onClick={() =>
            handleKpiClick('TOTAL')
          }
          className={`w-full sm:w-[47%] lg:w-[18.5%] min-h-[145px] cursor-pointer bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center text-center ${
            selectedKpi === 'TOTAL'
              ? 'border-amber-400 ring-2 ring-amber-200'
              : 'border-slate-100'
          }`}
        >

          <div className="h-10 w-10 rounded-full bg-[#fef3c7] text-[#d97706] border border-[#fde68a] flex items-center justify-center mb-3">
            <Users className="h-5 w-5" />
          </div>

          <span className="font-montserrat text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            TOTAL WORKFORCE
          </span>

          <p className="font-apfel text-3xl font-black text-slate-900 tracking-tight leading-none mt-2">
            {kpis.totalWorkforce}
          </p>

        </div>


        {/* ACTIVE WORKFORCE */}
        <div
          onClick={() =>
            handleKpiClick('ACTIVE')
          }
          className={`w-full sm:w-[47%] lg:w-[18.5%] min-h-[145px] cursor-pointer bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center text-center ${
            selectedKpi === 'ACTIVE'
              ? 'border-emerald-400 ring-2 ring-emerald-200'
              : 'border-slate-100'
          }`}
        >

          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
            <UserCheck className="h-5 w-5" />
          </div>

          <span className="font-montserrat text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            ACTIVE WORKFORCE
          </span>

          <p className="font-apfel text-3xl font-black text-emerald-600 tracking-tight leading-none mt-2">
            {kpis.activeWorkforce}
          </p>

        </div>


        {/* DEPARTMENT HEADS */}
        <div
          onClick={() =>
            handleKpiClick('HEADS')
          }
          className={`w-full sm:w-[47%] lg:w-[18.5%] min-h-[145px] cursor-pointer bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center text-center ${
            selectedKpi === 'HEADS'
              ? 'border-purple-400 ring-2 ring-purple-200'
              : 'border-slate-100'
          }`}
        >

          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-3">
            <Crown className="h-5 w-5" />
          </div>

          <span className="font-montserrat text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            DEPARTMENT HEADS
          </span>

          <p className="font-apfel text-3xl font-black text-purple-700 tracking-tight leading-none mt-2">
            {kpis.departmentHeads}
          </p>

        </div>


        {/* ONLINE MEMBERS */}
        <div
          onClick={() =>
            handleKpiClick('ONLINE')
          }
          className={`w-full sm:w-[47%] lg:w-[18.5%] min-h-[145px] cursor-pointer bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center text-center ${
            selectedKpi === 'ONLINE'
              ? 'border-emerald-400 ring-2 ring-emerald-200'
              : 'border-slate-100'
          }`}
        >

          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
            <Activity className="h-5 w-5" />
          </div>

          <span className="font-montserrat text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            ONLINE MEMBERS
          </span>

          <p className="font-apfel text-3xl font-black text-emerald-600 tracking-tight leading-none mt-2">
            {kpis.onlineMembers}
          </p>

        </div>


        {/* INACTIVE MEMBERS */}
        <div
          onClick={() =>
            handleKpiClick('INACTIVE')
          }
          className={`w-full sm:w-[47%] lg:w-[18.5%] min-h-[145px] cursor-pointer bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center text-center ${
            selectedKpi === 'INACTIVE'
              ? 'border-slate-400 ring-2 ring-slate-200'
              : 'border-slate-100'
          }`}
        >

          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mb-3">
            <Circle className="h-5 w-5" />
          </div>

          <span className="font-montserrat text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            INACTIVE MEMBERS
          </span>

          <p className="font-apfel text-3xl font-black text-slate-500 tracking-tight leading-none mt-2">
            {kpis.inactiveMembers}
          </p>

        </div>

      </div>


      {/* =========================================================
          3. ACTIVE KPI FILTER
      ========================================================= */}
      {selectedKpi && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs font-semibold text-amber-800">

          <span>
            Showing only:{' '}

            {selectedKpi === 'TOTAL'
              ? 'Total Workforce'
              : selectedKpi === 'ACTIVE'
                ? 'Active Workforce'
                : selectedKpi === 'HEADS'
                  ? 'Department Heads'
                  : selectedKpi === 'ONLINE'
                    ? 'Online Members'
                    : 'Inactive Members'}
          </span>

          <button
            onClick={() =>
              setSelectedKpi(null)
            }
            className="underline hover:text-amber-900"
          >
            Clear filter
          </button>

        </div>
      )}


      {/* =========================================================
          4. SEARCH & FILTER BAR
      ========================================================= */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-4">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 w-full lg:w-96 shadow-2xs">

            <Search className="h-4 w-4 text-slate-400 shrink-0" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              placeholder="Search employee name, ID, email, designation..."
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full font-sans"
            />

          </div>


          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto font-apfel text-xs">

            {/* User Type */}
            <select
              value={selectedUserType}
              onChange={(e) => {
                setSelectedKpi(null);

                setSelectedUserType(
                  e.target.value as
                    | UserType
                    | 'ALL'
                );
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 outline-none"
            >
              <option value="ALL">
                All User Types
              </option>

              <option value="DEPARTMENT_HEAD">
                Department Head
              </option>

              <option value="EMPLOYEE">
                Employee
              </option>

              <option value="HR">
                HR Specialist
              </option>

              <option value="CEO">
                CEO
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>


            {/* Department */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedKpi(null);

                setSelectedDepartment(
                  e.target.value
                );
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 outline-none"
            >
              <option value="ALL">
                All Departments
              </option>

              {departments.map((d) => (
                <option
                  key={d.id}
                  value={d.departmentName}
                >
                  {d.departmentName}
                </option>
              ))}
            </select>


            {/* Account Status */}
            <select
              value={selectedAccountStatus}
              onChange={(e) => {
                setSelectedKpi(null);

                setSelectedAccountStatus(
                  e.target.value as
                    | AccountStatus
                    | 'ALL'
                );
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 outline-none"
            >
              <option value="ALL">
                All Account Statuses
              </option>

              <option value="ONLINE">
                Online
              </option>

              <option value="OFFLINE">
                Offline
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>
            </select>

          </div>

        </div>


        {/* =======================================================
            5. EMPLOYEE DATA TABLE
        ======================================================= */}
        <div className="overflow-x-auto pt-1">

          <table className="w-full text-left text-xs font-sans">

            <thead>

              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-montserrat tracking-wider font-extrabold">

                <th className="pb-3 px-2">
                  EMPLOYEE
                </th>

                <th className="pb-3 px-2">
                  USER TYPE
                </th>

                <th className="pb-3 px-2">
                  DEPARTMENT
                </th>

                <th className="pb-3 px-2">
                  ROLE / DESIGNATION
                </th>

                <th className="pb-3 px-2">
                  ACCOUNT STATUS
                </th>

                <th className="pb-3 px-2">
                  PRODUCTIVITY
                </th>

                <th className="pb-3 px-2">
                  ATTENDANCE
                </th>

                <th className="pb-3 px-2 text-right">
                  ACTIONS
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-50">

              {isLoading ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-8 text-center text-slate-400 font-apfel text-xs"
                  >
                    Loading Employee Repository...
                  </td>

                </tr>

              ) : filteredEmployees.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-8 text-center text-slate-400 font-sans text-xs"
                  >
                    No employee records match active filters.
                  </td>

                </tr>

              ) : (

                filteredEmployees.map(
                  (emp) => (

                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >

                      {/* Employee */}
                      <td className="py-3.5 px-2">

                        <div className="flex items-center gap-3">

                          <img
                            src={emp.avatar}
                            alt={emp.fullName}
                            onError={(e) => {
                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  emp.fullName
                                )}&background=fef3c7&color=92400e`;
                            }}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />

                          <div>

                            <p className="font-gotham text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                              {emp.fullName}
                            </p>

                            <span className="font-apfel text-[10px] text-slate-400 font-medium">
                              {emp.email || '-'} •{' '}
                              {emp.employeeId}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* User Type */}
                      <td className="py-3.5 px-2 font-apfel">

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getUserTypeBadgeStyle(
                            emp.userType
                          )}`}
                        >
                          {emp.userType.replace(
                            '_',
                            ' '
                          )}
                        </span>

                      </td>


                      {/* Department */}
                      <td className="py-3.5 px-2">

                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px] font-apfel">
                          {emp.departmentName}
                        </span>

                      </td>


                      {/* Designation */}
                      <td className="py-3.5 px-2 font-medium text-slate-800">
                        {emp.designation}
                      </td>


                      {/* Account Status */}
                      <td className="py-3.5 px-2 font-apfel">

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getAccountStatusBadgeStyle(
                            emp.accountStatus
                          )}`}
                        >
                          {emp.accountStatus}
                        </span>

                      </td>


                      {/* Productivity */}
                      <td className="py-3.5 px-2 font-apfel">

                        <div className="flex items-center gap-1.5">

                          <span className="font-black text-slate-900">
                            {emp.productivityScore}
                          </span>

                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                            {emp.productivityStatus}
                          </span>

                        </div>

                      </td>


                      {/* Attendance */}
                      <td className="py-3.5 px-2 font-apfel">

                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 text-[10px]">
                          {emp.attendance}% Attended
                        </span>

                      </td>


                      {/* Actions */}
                      <td className="py-3.5 px-2 text-right">

                        <button
                          onClick={() =>
                            handleDeleteEmployee(
                              emp.id,
                              emp.fullName
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Employee Record"
                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================================================
          6. CREATE EMPLOYEE MODAL
      ========================================================= */}
      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        onEmployeeCreated={loadData}
      />

    </div>
  );
}