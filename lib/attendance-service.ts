/**
 * Task Management System (TMS) - Attendance Service Layer
 * Enterprise service & repository abstraction layer for biometric time-tracking data.
 */

import {
  AttendanceRecord,
  AttendanceKpis,
  AttendanceFilterParams,
  AttendanceProfileDetails,
  ExportJob,
} from './attendance-models';

import { LogoutRepository } from './logout-repository';
import { WorkSession } from './logout-models';
import { EmployeeRepository } from './employee-repository';


/**
 * Initial attendance records.
 *
 * No dummy employees are stored here.
 * Employee information comes from EmployeeRepository.
 */
const mockAttendanceRecords: AttendanceRecord[] = [];


/**
 * Browser storage key.
 */
const STORAGE_KEY =
  'icc_tms_attendance_records_v3';


/**
 * Attendance update event.
 */
export const EVENT_ATTENDANCE_UPDATED =
  'innovibe:attendance_updated';


/**
 * Get stored attendance records.
 */
function getStoredAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') {
    return mockAttendanceRecords;
  }

  try {
    const data =
      localStorage.getItem(STORAGE_KEY);

    if (data) {
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(mockAttendanceRecords)
    );

    return mockAttendanceRecords;

  } catch (error) {
    console.error(
      'Failed to read attendance records:',
      error
    );

    return mockAttendanceRecords;
  }
}


/**
 * Save attendance records.
 */
function saveStoredAttendanceRecords(
  records: AttendanceRecord[]
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records)
    );

    window.dispatchEvent(
      new CustomEvent(
        EVENT_ATTENDANCE_UPDATED,
        {
          detail: records,
        }
      )
    );

  } catch (error) {
    console.error(
      'Failed to save attendance records:',
      error
    );
  }
}


/**
 * Create attendance record using
 * actual employee information.
 */
function createAttendanceRecord(
  employee: {
    id: string;
    employeeId: string;
    fullName: string;
    avatar: string;
    designation: string;
    departmentName: string;
  },
  record: Partial<AttendanceRecord>
): AttendanceRecord {

  return {
    id:
      record.id ||
      `ATT-${Date.now()}`,

    employeeId:
      employee.employeeId,

    employeeName:
      employee.fullName,

    avatar:
      record.avatar ||
      employee.avatar,

    role:
      record.role ||
      employee.designation,

    department:
      record.department ||
      employee.departmentName,

    status:
      record.status ||
      'PRESENT',

    firstCheckIn:
      record.firstCheckIn ||
      '10:00 AM',

    lastCheckOut:
      record.lastCheckOut ||
      '06:00 PM',

    totalWorkingHours:
      record.totalWorkingHours ??
      8,

    attendancePercentage:
      record.attendancePercentage ??
      0,

    date:
      record.date ||
      new Date().toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }
      ),

    sessions:
      record.sessions ||
      [],

    shiftName:
      record.shiftName ||
      'General Shift (10:00 AM - 06:00 PM)',
  };
}


export class AttendanceService {

  /**
   * Subscribe to attendance changes.
   */
  static onAttendanceUpdated(
    callback: (
      records: AttendanceRecord[]
    ) => void
  ): () => void {

    if (typeof window === 'undefined') {
      return () => {};
    }

    const handler = () => {
      AttendanceService
        .getAttendanceRecords()
        .then(callback);
    };

    window.addEventListener(
      EVENT_ATTENDANCE_UPDATED,
      handler
    );

    window.addEventListener(
      'storage',
      handler
    );

    return () => {
      window.removeEventListener(
        EVENT_ATTENDANCE_UPDATED,
        handler
      );

      window.removeEventListener(
        'storage',
        handler
      );
    };
  }


  /**
   * Record employee punch in/out.
   *
   * Only employees that exist in the
   * Workforce Directory are accepted.
   */
  static async recordPunch(
    record: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {

    const list =
      getStoredAttendanceRecords();


    const employee =
      record.employeeId
        ? EmployeeRepository.getEmployee(
            record.employeeId
          )
        : null;


    if (!employee) {
      throw new Error(
        'Employee not found in Workforce Directory.'
      );
    }


    const idx =
      list.findIndex(
        (item) =>
          item.employeeId ===
          employee.employeeId
      );


    /**
     * Update existing attendance.
     */
    if (idx !== -1) {

      list[idx] = {
        ...list[idx],
        ...record,

        employeeId:
          employee.employeeId,

        employeeName:
          employee.fullName,

        avatar:
          employee.avatar,

        role:
          employee.designation,

        department:
          employee.departmentName,

        status:
          record.status ||
          'PRESENT',

        firstCheckIn:
          record.firstCheckIn ||
          list[idx].firstCheckIn ||
          '10:00 AM',

        lastCheckOut:
          record.lastCheckOut ||
          list[idx].lastCheckOut ||
          '06:00 PM',

        totalWorkingHours:
          record.totalWorkingHours ??
          list[idx].totalWorkingHours ??
          8,
      };


      saveStoredAttendanceRecords(
        list
      );

      return list[idx];
    }


    /**
     * Create new attendance record.
     */
    const newRecord =
      createAttendanceRecord(
        employee,
        {
          ...record,

          status:
            record.status ||
            'PRESENT',

          firstCheckIn:
            record.firstCheckIn ||
            '10:00 AM',

          lastCheckOut:
            record.lastCheckOut ||
            '06:00 PM',

          totalWorkingHours:
            record.totalWorkingHours ??
            8,
        }
      );


    list.unshift(newRecord);

    saveStoredAttendanceRecords(
      list
    );

    return newRecord;
  }


  /**
   * Get Attendance Roll Call.
   *
   * Every active employee from Workforce Directory
   * is displayed.
   *
   * Default attendance:
   * PRESENT
   * 10:00 AM - 06:00 PM
   * 8 hours
   */
  static async getAttendanceRecords(
    filters?: AttendanceFilterParams
  ): Promise<AttendanceRecord[]> {

    /**
     * Get actual active employees.
     */
    const employees =
      EmployeeRepository
        .getEmployees()
        .filter(
          (employee) =>
            employee.isActive
        );


    /**
     * Get stored attendance.
     */
    let attendanceRecords =
      getStoredAttendanceRecords();


    /**
     * Keep only attendance records
     * belonging to actual employees.
     */
    const employeeIds =
      new Set(
        employees.map(
          (employee) =>
            employee.employeeId
        )
      );


    attendanceRecords =
      attendanceRecords.filter(
        (record) =>
          employeeIds.has(
            record.employeeId
          )
      );


    /**
     * Sync employee information.
     */
    attendanceRecords =
      attendanceRecords.map(
        (record) => {

          const employee =
            EmployeeRepository.getEmployee(
              record.employeeId
            );


          if (!employee) {
            return record;
          }


          return {
            ...record,

            employeeId:
              employee.employeeId,

            employeeName:
              employee.fullName,

            avatar:
              employee.avatar,

            role:
              employee.designation,

            department:
              employee.departmentName,
          };
        }
      );


    /**
     * Check live sessions.
     *
     * Only sessions belonging to
     * actual employees are accepted.
     */
    try {

      const liveSessions =
        await LogoutRepository
          .getWorkSessions();


      liveSessions.forEach(
        (session: WorkSession) => {

          const employee =
            EmployeeRepository.getEmployee(
              session.employeeId
            );


          /**
           * Ignore unknown employees.
           *
           * This prevents old dummy users
           * such as Varun from appearing.
           */
          if (!employee) {
            return;
          }


          const idx =
            attendanceRecords.findIndex(
              (record) =>
                record.employeeId ===
                employee.employeeId
            );


          if (idx !== -1) {

            attendanceRecords[idx] = {
              ...attendanceRecords[idx],

              employeeId:
                employee.employeeId,

              employeeName:
                employee.fullName,

              avatar:
                employee.avatar,

              role:
                employee.designation,

              department:
                employee.departmentName,

              status:
                session.status === 'ACTIVE' ||
                session.status === 'COMPLETED'
                  ? 'PRESENT'
                  : attendanceRecords[
                      idx
                    ].status,

              firstCheckIn:
                session.loginTime ||
                attendanceRecords[
                  idx
                ].firstCheckIn ||
                '10:00 AM',

              lastCheckOut:
                session.logoutTime &&
                session.logoutTime !== '--'
                  ? session.logoutTime
                  : attendanceRecords[
                      idx
                    ].lastCheckOut ||
                    '06:00 PM',

              totalWorkingHours:
                attendanceRecords[
                  idx
                ].totalWorkingHours ||
                8,
            };

          } else {

            /**
             * Create attendance only for
             * a real employee.
             */
            const newRecord =
              createAttendanceRecord(
                employee,
                {
                  id:
                    `ATT-${session.id}`,

                  employeeId:
                    employee.employeeId,

                  employeeName:
                    employee.fullName,

                  avatar:
                    employee.avatar,

                  role:
                    employee.designation,

                  department:
                    employee.departmentName,

                  status:
                    'PRESENT',

                  firstCheckIn:
                    session.loginTime ||
                    '10:00 AM',

                  lastCheckOut:
                    session.logoutTime ||
                    '06:00 PM',

                  totalWorkingHours:
                    8,

                  attendancePercentage:
                    0,

                  date:
                    session.date,
                }
              );


            attendanceRecords.unshift(
              newRecord
            );
          }
        }
      );

    } catch (error) {

      console.error(
        'Failed to load live attendance sessions:',
        error
      );
    }


    /**
     * Build the final roll call from
     * the active employee roster.
     */
    let result: AttendanceRecord[] =
      employees.map(
        (employee) => {

          const existing =
            attendanceRecords.find(
              (record) =>
                record.employeeId ===
                employee.employeeId
            );


          /**
           * If attendance exists,
           * use the attendance data.
           */
          if (existing) {

            return {
              ...existing,

              employeeId:
                employee.employeeId,

              employeeName:
                employee.fullName,

              avatar:
                employee.avatar,

              role:
                employee.designation,

              department:
                employee.departmentName,

              status:
                existing.status ||
                'PRESENT',

              firstCheckIn:
                existing.firstCheckIn ||
                '10:00 AM',

              lastCheckOut:
                existing.lastCheckOut ||
                '06:00 PM',

              totalWorkingHours:
                existing.totalWorkingHours ||
                8,
            };
          }


          /**
           * No attendance record yet.
           *
           * Still display the actual employee
           * with the standard office schedule.
           */
          return {

            id:
              `ROSTER-${employee.employeeId}`,

            employeeId:
              employee.employeeId,

            employeeName:
              employee.fullName,

            avatar:
              employee.avatar,

            role:
              employee.designation,

            department:
              employee.departmentName,

            status:
              'PRESENT',

            firstCheckIn:
              '10:00 AM',

            lastCheckOut:
              '06:00 PM',

            totalWorkingHours:
              8,

            attendancePercentage:
              0,

            date:
              new Date().toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                }
              ),

            sessions:
              [],

            shiftName:
              'General Shift (10:00 AM - 06:00 PM)',
          };
        }
      );


    /**
     * Search filter.
     */
    if (
      filters?.searchQuery &&
      filters.searchQuery.trim() !== ''
    ) {

      const query =
        filters.searchQuery
          .toLowerCase();


      result =
        result.filter(
          (record) =>

            record.employeeName
              .toLowerCase()
              .includes(query) ||

            record.role
              .toLowerCase()
              .includes(query) ||

            record.department
              .toLowerCase()
              .includes(query) ||

            record.employeeId
              .toLowerCase()
              .includes(query)
        );
    }


    /**
     * Department filter.
     */
    if (
      filters?.department &&
      filters.department !== 'ALL'
    ) {

      result =
        result.filter(
          (record) =>
            record.department ===
            filters.department
        );
    }


    /**
     * Role filter.
     */
    if (
      filters?.role &&
      filters.role !== 'ALL'
    ) {

      result =
        result.filter(
          (record) =>
            record.role ===
            filters.role
        );
    }


    /**
     * Status filter.
     */
    if (
      filters?.status &&
      filters.status !== 'ALL'
    ) {

      result =
        result.filter(
          (record) =>
            record.status ===
            filters.status
        );
    }


    return result;
  }


  /**
   * Get attendance KPIs.
   *
   * No dummy numbers.
   */
  static async getAttendanceKpis():
    Promise<AttendanceKpis> {

    const list =
      getStoredAttendanceRecords();


    const present =
      list.filter(
        (record) =>
          record.status === 'PRESENT' ||
          record.status === 'LATE'
      ).length;


    const late =
      list.filter(
        (record) =>
          record.status === 'LATE'
      ).length;


    const absent =
      list.filter(
        (record) =>
          record.status === 'ABSENT'
      ).length;


    const leave =
      list.filter(
        (record) =>
          record.status === 'LEAVE'
      ).length;


    const wfh =
      list.filter(
        (record) =>
          record.status ===
          'WORK_FROM_HOME'
      ).length;


    return {

      totalStrength:
        0,

      presentToday:
        present,

      includesLateCount:
        late,

      lateCheckIns:
        late,

      absentToday:
        absent,

      leaveToday:
        leave,

      wfhToday:
        wfh,
    };
  }


  /**
   * Get attendance profile.
   */
  static async getAttendanceProfile(
    employeeId: string
  ): Promise<
    AttendanceProfileDetails | null
  > {

    const employee =
      EmployeeRepository.getEmployee(
        employeeId
      );


    if (!employee) {
      return null;
    }


    const list =
      getStoredAttendanceRecords();


    const existing =
      list.find(
        (record) =>
          record.employeeId ===
          employeeId
      );


    /**
     * Use existing attendance if available.
     * Otherwise use standard office schedule.
     */
    const record: AttendanceRecord =
      existing || {

        id:
          `ROSTER-${employee.employeeId}`,

        employeeId:
          employee.employeeId,

        employeeName:
          employee.fullName,

        avatar:
          employee.avatar,

        role:
          employee.designation,

        department:
          employee.departmentName,

        status:
          'PRESENT',

        firstCheckIn:
          '10:00 AM',

        lastCheckOut:
          '06:00 PM',

        totalWorkingHours:
          8,

        attendancePercentage:
          0,

        date:
          new Date().toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }
          ),

        sessions:
          [],

        shiftName:
          'General Shift (10:00 AM - 06:00 PM)',
      };


    return {

      record,

      monthlyCalendar: [],

      lateReports: [],

      leaveHistory: [],

      gpsCheckIns: [],

      auditLogs: [],
    };
  }


  /**
   * Export Attendance Report.
   */
  static async exportAttendanceReport(
    format:
      | 'PDF'
      | 'EXCEL'
      | 'CSV',

    params:
      AttendanceFilterParams
  ): Promise<ExportJob> {

    return {

      format,

      department:
        params.department ||
        'ALL',

      dateRange:
        params.dateRangeSelection ||
        'TODAY',

      status:
        params.status ||
        'ALL',

      downloadUrl:
        '#export-download',
    };
  }
}