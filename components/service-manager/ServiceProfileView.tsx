'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Clock,
  Settings,
  X,
  CheckCircle2,
  Save,
  Sliders,
  Users,
  Smartphone,
  Building,
  Check,
  Edit3,
  Award,
  FileText,
  Upload,
  Eye,
  Download,
  FileCheck,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export function ServiceProfileView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSettingsTab, setShowSettingsTab] = useState(false);
  
  // Interactive Modal States
  const [activeEditModalSection, setActiveEditModalSection] = useState<'personal' | 'contact' | 'kyc' | 'skills' | 'general' | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<any | null>(null);
  
  // Profile Picture (DP) Modals
  const [isViewDpModalOpen, setIsViewDpModalOpen] = useState(false);
  const [isEditDpModalOpen, setIsEditDpModalOpen] = useState(false);
  
  // Custom Avatar State
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [tempAvatarInput, setTempAvatarInput] = useState<string>('');

  // Profile Form Master State for Vikram Singh (Service Hub Manager)
  const [profileData, setProfileData] = useState({
    name: 'Vikram Singh',
    roleTitle: 'Service Hub Manager',
    department: 'EV Service Operations & Maintenance',
    employeeId: 'INV-SM-2024-018',
    location: 'Kakinada Service Hub (Main Depot)',
    joinedDate: 'March 10, 2023',
    shiftSchedule: 'Morning Shift (08:00 - 17:00)',
    workMode: 'On-Site Operations',
    employmentType: 'Full-Time Regular',
    reportingManager: 'Rajesh Varma (Chief Operating Officer)',
    dob: '1990-05-18',
    gender: 'Male',
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    fatherName: 'Harjit Singh',
    officialEmail: 'vikram.singh@innovibemobility.com',
    primaryPhone: '+91 98765 43210',
    alternatePhone: '+91 98123 45678',
    residentialAddress: '14-2-8, Main Road, Kakinada Service Depot District, AP',
    aadhaarNumber: 'XXXX-XXXX-4829',
    panNumber: 'ABCDE1234F',
    qualification: 'B.Tech / B.E. in Electrical & Electronics',
    priorExperience: '5.5 Years in EV Fleet Maintenance',
    languagesKnown: 'English, Hindi, Telugu',
    coreSkills: 'EV Diagnostics, High Voltage BMS, Fleet Dispatch, SLA Compliance, Depot Safety',
    professionalBio: 'Service Hub Manager focused on EV powertrain diagnostics, battery cell analytics, technician dispatch, and depot SLA management.',
  });

  // Document Vault Items
  const [documents, setDocuments] = useState([
    {
      id: 'doc_01',
      title: 'Aadhaar Card Attachment',
      filename: 'aadhaar_card_verified.pdf',
      size: '1.2 MB',
      date: 'Jan 15, 2024',
      status: 'Verified',
      content: 'GOVERNMENT OF INDIA - UNIQUE IDENTIFICATION AUTHORITY OF INDIA\nAadhaar No: XXXX-XXXX-4829\nName: Vikram Singh\nDOB: 18/05/1990\nGender: Male\nStatus: VERIFIED BY UIDAI BIOMETRIC GATEWAY',
    },
    {
      id: 'doc_02',
      title: 'PAN Card Attachment',
      filename: 'pan_card_verified.pdf',
      size: '840 KB',
      date: 'Jan 15, 2024',
      status: 'Verified',
      content: 'INCOME TAX DEPARTMENT - GOVT OF INDIA\nPAN: ABCDE1234F\nName: VIKRAM SINGH\nFather\'s Name: HARJIT SINGH\nDate of Issue: 12/03/2012\nStatus: ACTIVE & LINKED TO AADHAAR',
    },
    {
      id: 'doc_03',
      title: 'Resume PDF Copy',
      filename: 'vikram_singh_service_manager_resume.pdf',
      size: '2.1 MB',
      date: 'Jan 15, 2024',
      status: 'Verified',
      content: 'VIKRAM SINGH — SENIOR EV OPERATIONS MANAGER\nSummary: 5.5+ Years experience leading high-throughput EV Service Depots.\nCertifications: Master EV Battery Specialist, HV Safety Protocols Level 3.\nEducation: B.Tech EEE, Andhra University.',
    },
    {
      id: 'doc_04',
      title: 'Degree Certificate',
      filename: 'degree_certificate_btech.pdf',
      size: '3.4 MB',
      date: 'Jan 15, 2024',
      status: 'Verified',
      content: 'ANDHRA UNIVERSITY — DEGREE OF BACHELOR OF TECHNOLOGY\nThis is to certify that VIKRAM SINGH has successfully completed the Degree of Bachelor of Technology in Electrical & Electronics Engineering with First Class Honors.',
    },
  ]);

  // Settings State with LocalStorage Persistence
  const [slaTargetMinutes, setSlaTargetMinutes] = useState(150);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [maxJobsPerTech, setMaxJobsPerTech] = useState(5);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [weekendOps, setWeekendOps] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem('innovibe_service_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.slaTargetMinutes) setSlaTargetMinutes(parsed.slaTargetMinutes);
        if (parsed.autoDispatchEnabled !== undefined) setAutoDispatchEnabled(parsed.autoDispatchEnabled);
        if (parsed.maxJobsPerTech) setMaxJobsPerTech(parsed.maxJobsPerTech);
        if (parsed.smsAlertsEnabled !== undefined) setSmsAlertsEnabled(parsed.smsAlertsEnabled);
        if (parsed.whatsappAlertsEnabled !== undefined) setWhatsappAlertsEnabled(parsed.whatsappAlertsEnabled);
        if (parsed.workingHoursStart) setWorkingHoursStart(parsed.workingHoursStart);
        if (parsed.workingHoursEnd) setWorkingHoursEnd(parsed.workingHoursEnd);
        if (parsed.weekendOps !== undefined) setWeekendOps(parsed.weekendOps);
      } catch (e) {}
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = () => {
    const settingsObj = {
      slaTargetMinutes,
      autoDispatchEnabled,
      maxJobsPerTech,
      smsAlertsEnabled,
      whatsappAlertsEnabled,
      workingHoursStart,
      workingHoursEnd,
      weekendOps,
    };
    localStorage.setItem('innovibe_service_settings', JSON.stringify(settingsObj));
    showToast('Service Operations Settings saved successfully!');
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveEditModalSection(null);
    showToast('Profile details updated successfully!');
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
        setIsEditDpModalOpen(false);
        showToast('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatarUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAvatarInput) {
      setAvatarImage(tempAvatarInput);
      setTempAvatarInput('');
      setIsEditDpModalOpen(false);
      showToast('Profile picture URL updated!');
    }
  };

  const triggerDownloadDoc = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename} successfully!`);
  };

  return (
    <div className="space-y-6 text-left font-sans relative bg-[#F8FAFC] min-h-screen p-2 sm:p-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP TITLE & HEADER ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-xs text-slate-500 font-medium">
            View and manage your personal, organizational, and background details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* GLASSMORPHIC SETTINGS SYMBOL BUTTON */}
          <button
            type="button"
            onClick={() => setShowSettingsTab(!showSettingsTab)}
            className="px-3.5 py-2.5 rounded-xl backdrop-blur-md bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:border-blue-300"
          >
            <Settings className={`h-4 w-4 text-blue-600 transition-transform duration-300 ${showSettingsTab ? 'rotate-90 text-amber-500' : ''}`} />
            <span>{showSettingsTab ? 'Close Settings' : 'Settings'}</span>
          </button>

          {/* EDIT PROFILE DETAILS BUTTON */}
          <button
            type="button"
            onClick={() => setActiveEditModalSection('general')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            <span>Edit Profile Details</span>
          </button>
        </div>
      </div>

      {/* GLASSMORPHIC SETTINGS CHILD TAB / DRAWER */}
      {showSettingsTab && (
        <div className="relative rounded-3xl p-6 backdrop-blur-xl bg-white/90 border border-blue-100 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5 text-blue-600">
              <Settings className="h-5 w-5" />
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Service Operations Settings & SLA Rules</h2>
                <p className="text-xs text-slate-500 font-medium">Configured for {profileData.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Configurations</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsTab(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Child Tab Settings Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SLA & Turnaround Targets */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Clock className="h-4 w-4" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">SLA Turnaround Thresholds</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Default Target Turnaround Time (Minutes)</label>
                  <input
                    type="number"
                    value={slaTargetMinutes}
                    onChange={(e) => setSlaTargetMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-hidden focus:border-indigo-400"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">Currently set to {Math.floor(slaTargetMinutes / 60)}h {slaTargetMinutes % 60}m</span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 font-medium">
                  Overdue warning flags automatically trigger when remaining turnaround drops under 30 minutes.
                </div>
              </div>
            </div>

            {/* Technician Workload & Auto-Dispatch */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Users className="h-4 w-4" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Technician Dispatch Rules</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Automated AI Technician Dispatch</span>
                    <span className="text-[10px] text-slate-500 font-medium">Auto-assign tickets based on tech proximity & skills</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={autoDispatchEnabled}
                    onChange={(e) => setAutoDispatchEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Max Concurrent Active Jobs per Technician</label>
                  <input
                    type="number"
                    value={maxJobsPerTech}
                    onChange={(e) => setMaxJobsPerTech(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-hidden focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Customer Notification Channels */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-sky-600">
                <Smartphone className="h-4 w-4" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Customer Communication Channels</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Automated SMS Status Updates</span>
                    <span className="text-[10px] text-slate-500 font-medium">Send SMS to customer when job status changes</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={smsAlertsEnabled}
                    onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-sky-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-extrabold text-slate-900 block">WhatsApp Invoice & Service Certs</span>
                    <span className="text-[10px] text-slate-500 font-medium">Send QA certificates directly via WhatsApp</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={whatsappAlertsEnabled}
                    onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-sky-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours & Shifts */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-purple-600">
                <Building className="h-4 w-4" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Operating Hours & Emergency Shifts</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Shift Opening Time</label>
                    <input
                      type="time"
                      value={workingHoursStart}
                      onChange={(e) => setWorkingHoursStart(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Shift Closing Time</label>
                    <input
                      type="time"
                      value={workingHoursEnd}
                      onChange={(e) => setWorkingHoursEnd(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-extrabold text-slate-900 block">24/7 Weekend Emergency Operations</span>
                    <span className="text-[10px] text-slate-500 font-medium">Enable roadside assistance dispatch on weekends</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={weekendOps}
                    onChange={(e) => setWeekendOps(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN HERO PROFILE CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
        {/* Top Hero Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            
            {/* INTERACTIVE PROFILE PICTURE (DP) CONTAINER WITH HOVER OVERLAY */}
            <div className="relative shrink-0 group">
              <div className="h-20 w-20 rounded-full p-1 border-2 border-blue-600 bg-white shadow-sm overflow-hidden flex items-center justify-center relative cursor-pointer">
                {avatarImage ? (
                  <img src={avatarImage} alt="Profile DP" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center">
                    VS
                  </div>
                )}

                {/* HOVER GLASSMORPHIC OVERLAY WITH 2 ICON BUTTONS: EYE SYMBOL (VIEW) & PENCIL SYMBOL (EDIT) */}
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 p-1 z-20">
                  <button
                    type="button"
                    title="View DP"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsViewDpModalOpen(true);
                    }}
                    className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Edit DP"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditDpModalOpen(true);
                    }}
                    className="h-7 w-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white z-10" />
            </div>

            {/* Name & Metadata */}
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profileData.name}</h2>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{profileData.roleTitle}</span>
                </span>
              </div>

              <p className="text-xs font-bold text-slate-500">{profileData.department}</p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-400">ID: <span className="font-bold text-slate-800">{profileData.employeeId}</span></span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-400">Location: <span className="font-bold text-slate-800">{profileData.location}</span></span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-400">Joined: <span className="font-bold text-slate-800">{profileData.joinedDate}</span></span>
              </div>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="space-y-1 text-right shrink-0">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">PROFILE STATUS</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>100% Verified</span>
            </div>
          </div>
        </div>

        {/* Bottom Hero Metrics Bar (4 Gray Interactive Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveEditModalSection('general')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SHIFT SCHEDULE</span>
              <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{profileData.shiftSchedule}</p>
          </div>

          <div
            onClick={() => setActiveEditModalSection('general')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">WORK MODE</span>
              <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{profileData.workMode}</p>
          </div>

          <div
            onClick={() => setActiveEditModalSection('general')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">EMPLOYMENT TYPE</span>
              <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{profileData.employmentType}</p>
          </div>

          <div
            onClick={() => setActiveEditModalSection('general')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">REPORTING MANAGER</span>
              <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 truncate">{profileData.reportingManager}</p>
          </div>
        </div>
      </div>

      {/* ROW 1: PERSONAL INFO + CONTACT LOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CARD: Personal Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-blue-600">
              <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Personal Information</h3>
            </div>

            <button
              type="button"
              onClick={() => setActiveEditModalSection('personal')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { label: 'FULL LEGAL NAME', value: profileData.name },
              { label: 'DATE OF BIRTH', value: profileData.dob },
              { label: 'GENDER', value: profileData.gender },
              { label: 'MARITAL STATUS', value: profileData.maritalStatus },
              { label: 'BLOOD GROUP', value: profileData.bloodGroup },
              { label: "FATHER'S NAME", value: profileData.fatherName },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveEditModalSection('personal')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{item.label}</span>
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD: Contact & Location */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-blue-600">
              <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Contact & Location</h3>
            </div>

            <button
              type="button"
              onClick={() => setActiveEditModalSection('contact')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={() => setActiveEditModalSection('contact')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">OFFICIAL EMAIL</span>
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 truncate">{profileData.officialEmail}</p>
              </div>

              <div
                onClick={() => setActiveEditModalSection('contact')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PRIMARY PHONE</span>
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">{profileData.primaryPhone}</p>
              </div>
            </div>

            <div
              onClick={() => setActiveEditModalSection('contact')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ALTERNATE PHONE</span>
                <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-xs font-extrabold text-slate-900">{profileData.alternatePhone}</p>
            </div>

            <div
              onClick={() => setActiveEditModalSection('contact')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">RESIDENTIAL ADDRESS</span>
                <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-xs font-extrabold text-slate-900">{profileData.residentialAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: KYC & IDENTIFICATION + SKILLS & BACKGROUND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CARD: KYC & Identification */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-purple-600">
              <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">KYC & Identification</h3>
            </div>

            <button
              type="button"
              onClick={() => setActiveEditModalSection('kyc')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { label: 'AADHAAR CARD NUMBER', value: profileData.aadhaarNumber },
              { label: 'PAN CARD NUMBER', value: profileData.panNumber },
              { label: 'EMPLOYEE ID', value: profileData.employeeId },
              { label: 'DESIGNATION', value: profileData.roleTitle },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveEditModalSection('kyc')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{item.label}</span>
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD: Skills & Background */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-600">
              <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Skills & Background</h3>
            </div>

            <button
              type="button"
              onClick={() => setActiveEditModalSection('skills')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3.5">
            <div
              onClick={() => setActiveEditModalSection('skills')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">HIGHEST QUALIFICATION</span>
                <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-amber-600 transition-colors" />
              </div>
              <p className="text-xs font-extrabold text-slate-900">{profileData.qualification}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={() => setActiveEditModalSection('skills')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PRIOR EXPERIENCE</span>
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-amber-600 transition-colors" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">{profileData.priorExperience}</p>
              </div>

              <div
                onClick={() => setActiveEditModalSection('skills')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">LANGUAGES KNOWN</span>
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-amber-600 transition-colors" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">{profileData.languagesKnown}</p>
              </div>
            </div>

            <div
              onClick={() => setActiveEditModalSection('skills')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CORE SKILLS</span>
                <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-amber-600 transition-colors" />
              </div>
              <p className="text-xs font-extrabold text-slate-900">{profileData.coreSkills}</p>
            </div>

            <div
              onClick={() => setActiveEditModalSection('skills')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-2xs transition-all cursor-pointer space-y-1 text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PROFESSIONAL BIO</span>
                <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-amber-600 transition-colors" />
              </div>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">{profileData.professionalBio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: DOCUMENT VAULT & COMPLIANCE RECORDS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Document Vault & Compliance Records</h3>
              <p className="text-xs text-slate-500 font-medium">Upload, view, and update your verified identity and qualification records</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>4 / 4 Documents Active</span>
            </span>

            <button
              type="button"
              onClick={() => showToast('Document upload manager ready!')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Manage All</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Document Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 flex flex-col justify-between hover:border-blue-300 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" />
                    <span>{doc.status}</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">{doc.title}</h4>
                  <p className="text-[10px] font-mono text-slate-500 truncate pt-0.5">{doc.filename}</p>
                  <p className="text-[10px] font-semibold text-slate-400 pt-0.5">{doc.size} • {doc.date}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => showToast(`Upload prompt opened for ${doc.title}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDocModal(doc)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Preview Document"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerDownloadDoc(doc.filename, doc.content)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Download Document"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW DP MODAL — TRANSPARENT GLASSMORPHIC OVERLAY (CLICK ANYWHERE TO CLOSE) */}
      {isViewDpModalOpen && (
        <div
          onClick={() => setIsViewDpModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          {/* Transparent Centered DP Display */}
          <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div className="h-64 w-64 md:h-80 md:w-80 mx-auto rounded-full overflow-hidden border-4 border-white/40 shadow-2xl bg-slate-900/50 relative group">
              {avatarImage ? (
                <img src={avatarImage} alt="Profile DP Full" className="h-full w-full object-cover rounded-full" />
              ) : (
                <div className="h-full w-full rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-6xl flex items-center justify-center shadow-inner">
                  VS
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="font-black text-white text-2xl tracking-tight drop-shadow-sm">{profileData.name}</p>
              <p className="text-sm text-indigo-200 font-semibold">{profileData.roleTitle}</p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsViewDpModalOpen(false);
                  setIsEditDpModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Camera className="h-4 w-4" />
                <span>Change Picture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DP MODAL */}
      {isEditDpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Camera className="h-5 w-5" />
                <h3 className="text-sm font-black text-slate-900">Edit Profile Picture</h3>
              </div>
              <button onClick={() => setIsEditDpModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option 1: File Upload */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Upload className="h-6 w-6 text-blue-600 mx-auto" />
                <div>
                  <p className="font-extrabold text-slate-900">Upload Image File</p>
                  <p className="text-[10px] text-slate-500 font-medium">PNG, JPG, or WEBP up to 5MB</p>
                </div>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs cursor-pointer shadow-xs transition-colors">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Choose Photo File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase">OR ENTER IMAGE URL</span>
              </div>

              {/* Option 2: Image URL */}
              <form onSubmit={handleSaveAvatarUrl} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Image URL Link</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={tempAvatarInput}
                    onChange={(e) => setTempAvatarInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditDpModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-md"
                  >
                    Update URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-sm font-black text-slate-900">{previewDocModal.title}</h3>
              </div>
              <button onClick={() => setPreviewDocModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {previewDocModal.content}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerDownloadDoc(previewDocModal.filename, previewDocModal.content);
                  setPreviewDocModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED FIELD EDITORS MODAL */}
      {activeEditModalSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveModal} className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Edit3 className="h-5 w-5" />
                <h3 className="text-sm font-black text-slate-900 capitalize">
                  Edit {activeEditModalSection} Details
                </h3>
              </div>
              <button type="button" onClick={() => setActiveEditModalSection(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {(activeEditModalSection === 'personal' || activeEditModalSection === 'general') && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Full Legal Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Date of Birth</label>
                    <input
                      type="text"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Gender</label>
                    <input
                      type="text"
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Marital Status</label>
                    <input
                      type="text"
                      value={profileData.maritalStatus}
                      onChange={(e) => setProfileData({ ...profileData, maritalStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Blood Group</label>
                    <input
                      type="text"
                      value={profileData.bloodGroup}
                      onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Father's Name</label>
                    <input
                      type="text"
                      value={profileData.fatherName}
                      onChange={(e) => setProfileData({ ...profileData, fatherName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                </>
              )}

              {(activeEditModalSection === 'contact' || activeEditModalSection === 'general') && (
                <>
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Official Email</label>
                    <input
                      type="email"
                      value={profileData.officialEmail}
                      onChange={(e) => setProfileData({ ...profileData, officialEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Primary Phone</label>
                    <input
                      type="text"
                      value={profileData.primaryPhone}
                      onChange={(e) => setProfileData({ ...profileData, primaryPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Alternate Phone</label>
                    <input
                      type="text"
                      value={profileData.alternatePhone}
                      onChange={(e) => setProfileData({ ...profileData, alternatePhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Residential Address</label>
                    <input
                      type="text"
                      value={profileData.residentialAddress}
                      onChange={(e) => setProfileData({ ...profileData, residentialAddress: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                </>
              )}

              {(activeEditModalSection === 'kyc' || activeEditModalSection === 'general') && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Aadhaar Card Number</label>
                    <input
                      type="text"
                      value={profileData.aadhaarNumber}
                      onChange={(e) => setProfileData({ ...profileData, aadhaarNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">PAN Card Number</label>
                    <input
                      type="text"
                      value={profileData.panNumber}
                      onChange={(e) => setProfileData({ ...profileData, panNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Employee ID</label>
                    <input
                      type="text"
                      value={profileData.employeeId}
                      onChange={(e) => setProfileData({ ...profileData, employeeId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Designation</label>
                    <input
                      type="text"
                      value={profileData.roleTitle}
                      onChange={(e) => setProfileData({ ...profileData, roleTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                </>
              )}

              {(activeEditModalSection === 'skills' || activeEditModalSection === 'general') && (
                <>
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Highest Qualification</label>
                    <input
                      type="text"
                      value={profileData.qualification}
                      onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Prior Experience</label>
                    <input
                      type="text"
                      value={profileData.priorExperience}
                      onChange={(e) => setProfileData({ ...profileData, priorExperience: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Languages Known</label>
                    <input
                      type="text"
                      value={profileData.languagesKnown}
                      onChange={(e) => setProfileData({ ...profileData, languagesKnown: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Core Skills</label>
                    <input
                      type="text"
                      value={profileData.coreSkills}
                      onChange={(e) => setProfileData({ ...profileData, coreSkills: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Professional Bio</label>
                    <textarea
                      rows={2}
                      value={profileData.professionalBio}
                      onChange={(e) => setProfileData({ ...profileData, professionalBio: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveEditModalSection(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
