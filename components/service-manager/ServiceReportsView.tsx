'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Layers,
  FileSpreadsheet,
  FileType,
  X,
  Printer,
} from 'lucide-react';

export function ServiceReportsView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedReportModal, setSelectedReportModal] = useState<any | null>(null);
  const [downloadFormatModalReport, setDownloadFormatModalReport] = useState<any | null>(null);

  // Single-line Base64 string for Official InnoVibe Logo (Image 1: InnoVibe MOBILITY INDIA PVT LTD)
  const OFFICIAL_LOGO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAAA1CAYAAACJOeMNAAAQAElEQVR4AeyZB5wdxZ3nv9X98uSokWY0CiiAckAIJQQKBGMMCAPG67Q4rdf22d7P4gN/7LN9e7C2MYsjOOGzDVjGZIxAgBISQkgglCNIozSjCZo88+al7r5fv7HOGM6rEYek/chTr6tfd9W//rn+9a9qyzuDxRVt1016rpPyUin9p/0WNfZfp00DFmereOC5OK5Fe6KNzftW0p48dsa4+XslfEYcQO6NJ/unnRQt3UdYu+dhXth8H8fiR/5e7XDG5D4jDmAMuJr97d1NvLztEV55czHpcBOdiaNnTBF/r4RPqQP4s9w3dE86TcZ18PT7i6I9OjtbiDsNuIE4ATtKJt31l+7+p9OigVPmAIrwEsAj6bhs2HOQw80dmvWO2pAbeFjGprS4hFAgSNQqZHTFdJyeSLa//3b6NGCdSlIuLh09SX6/fCN/XPYK6Ywrcn41pNwUte17OdS0nbJYNQunfpKJI+aqv/86nRo4pQ7gYWu6O5SWlJJXWKqZ75OzlAC6dKXr2FrzPKhp8vDLyKOMSCjvdMr+d03ruPBS//HH9/q/dxEojEUZXhIjahyMZeQQKBIk2F+7kYP1WyjJG86YwfOwLBtX3SfPhU/neHbR+3zyON7tCJ/ucZr+/9vx+G1+9dt7YXvvvhp6n3rv/rtffVi/+vCnp55CBwDbgGXbBMMRmtuUA2RSpN0kDZ37eHXvUuxgjAtGvY9YoDRrfNsPB+9KbvOWUW99fkvzKXj0TeUqrv01ajf7evzu8VZ+/LfeEf6TwcUoUzbeceM7GqsX3U/XZZ0qQsfFN76Wp7+bV//tq+/21fb8D+Xo8+lFjVqvgAAAABJRU5ErkJggg==';

  // Helper to generate stunning, ultra-premium Light Theme HTML PDF templates with Official Logo & Exact Color Adjust
  const createPremiumPdfHtml = (
    title: string,
    category: string,
    generatedDate: string,
    kpis: { label: string; value: string; color?: string }[],
    tableHeaders: string[],
    tableRows: (string | { text: string; badge?: 'success' | 'warning' | 'danger' })[][]
  ) => {
    const kpiCardsHtml = kpis
      .map(
        (k) => `
        <div style="background: #ffffff !important; border: 1.5px solid #e2e8f0; border-top: 3.5px solid ${k.color || '#0284c7'}; padding: 14px 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.06em; margin-bottom: 4px;">${k.label}</div>
          <div style="font-size: 22px; font-weight: 900; color: ${k.color || '#0f172a'}; tracking: -0.02em;">${k.value}</div>
        </div>
      `
      )
      .join('');

    const headersHtml = tableHeaders
      .map(
        (h) => `
        <th style="background: #f1f5f9 !important; color: #334155 !important; text-align: left; padding: 12px 14px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #cbd5e1 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">${h}</th>
      `
      )
      .join('');

    const rowsHtml = tableRows
      .map((row, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const cols = row
          .map((cell) => {
            if (typeof cell === 'object') {
              let badgeBg = '#dcfce7';
              let badgeColor = '#15803d';
              let badgeBorder = '#86efac';

              if (cell.badge === 'warning') {
                badgeBg = '#fef3c7';
                badgeColor = '#b45309';
                badgeBorder = '#fde68a';
              } else if (cell.badge === 'danger') {
                badgeBg = '#ffe4e6';
                badgeColor = '#be123c';
                badgeBorder = '#fecdd3';
              }

              return `
                <td style="padding: 12px 14px; font-size: 11px; font-weight: 700;">
                  <span style="background: ${badgeBg} !important; color: ${badgeColor} !important; border: 1px solid ${badgeBorder} !important; padding: 4px 12px; border-radius: 99px; font-size: 9px; font-weight: 800; text-transform: uppercase; display: inline-block; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                    ${cell.text}
                  </span>
                </td>
              `;
            }

            return `<td style="padding: 12px 14px; font-size: 11px; font-weight: 700; color: #1e293b;">${cell}</td>`;
          })
          .join('');

        return `<tr style="background: ${bg} !important; border-bottom: 1px solid #e2e8f0; -webkit-print-color-adjust: exact; print-color-adjust: exact;">${cols}</tr>`;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} — InnoVibe Mobility India</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 24px 30px;
            color: #0f172a;
            line-height: 1.5;
            background: #ffffff;
            margin: 0;
          }
          
          @page {
            margin: 12mm;
            size: A4 portrait;
          }
        </style>
      </head>
      <body>
        <!-- TOP MULTI-COLOR BRAND ACCENT BAR -->
        <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #0284c7 0%, #16a34a 50%, #ea580c 100%) !important; margin-bottom: 20px; border-radius: 2px; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>

        <!-- BRAND LOGO & OFFICIAL DIVISION HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 18px; border-bottom: 2px solid #e2e8f0; margin-bottom: 22px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <!-- PURE VECTOR SVG BRAND LOGO MARK (EXACT IMAGE 1 REPLICA - CANNOT BREAK) -->
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg width="58" height="52" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Blue India Map & Globe Rays Motif -->
                <g id="india-map-rays">
                  <!-- India Map Base Silhouette (Deep Royal Blue #1e3a8a) -->
                  <path d="M45 28C48 24 55 22 62 25C68 28 72 35 70 42C68 48 78 52 82 58C86 64 80 72 72 75C65 78 58 72 52 78C46 84 38 88 32 82C26 76 22 68 24 60C26 52 28 42 35 36C40 32 42 30 45 28Z" fill="#1e3a8a"/>
                  <!-- Downward Ray Lines in India Map Silhouette (Steel Blue #2563eb) -->
                  <path d="M35 50L30 85M42 48L38 88M50 48L48 90M58 48L58 88M66 50L68 84" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
                  <!-- Deep Blue Base Curve -->
                  <path d="M18 68C22 54 36 38 60 32C52 46 44 64 28 74C22 74 18 71 18 68Z" fill="#1d4ed8"/>
                  <!-- Orange Arc Accent (#ea580c) -->
                  <path d="M20 72C30 82 48 86 62 79C55 77 40 75 28 69C24 71 20 72 20 72Z" fill="#ea580c"/>
                  <!-- Upward Emerald Green Growth Arrow (#16a34a) -->
                  <path d="M38 52L64 16M64 16H46M64 16V34" stroke="#16a34a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
              </svg>
              <div>
                <div style="font-size: 26px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.04em; line-height: 1; font-family: 'Plus Jakarta Sans', sans-serif;">
                  Inno<span style="color: #ea580c;">Vibe</span>
                </div>
                <div style="font-size: 8.5px; font-weight: 800; color: #475569; letter-spacing: 0.16em; text-transform: uppercase; margin-top: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
                  MOBILITY INDIA PVT LTD
                </div>
              </div>
            </div>
            <div style="border-left: 2px solid #cbd5e1; padding-left: 14px; height: 38px; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">SERVICE OPERATIONS DIVISION</div>
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Compliance & Operational Audit Log</div>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="background: #f0f9ff !important; border: 1px solid #7dd3fc !important; color: #0369a1 !important; font-weight: 800; font-size: 9px; padding: 5px 14px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em; display: inline-block; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
              ● OFFICIAL ${category} AUDIT
            </div>
            <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-top: 5px;">Doc Ref: INV-AUD-${Math.floor(100000 + Math.random() * 900000)}</div>
          </div>
        </div>

        <!-- ELEGANT LIGHT THEME EXECUTIVE BANNER -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important; border: 1px solid #bae6fd !important; border-left: 6px solid #0284c7 !important; border-radius: 14px; padding: 20px 24px; color: #0f172a !important; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(2,132,199,0.06); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <div style="font-size: 9.5px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Executive Audit Document</div>
          <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 10px; color: #0f172a;">${title}</div>
          <div style="display: flex; gap: 20px; font-size: 11px; color: #334155; font-weight: 600;">
            <span>📍 Depot Hub: <strong style="color: #0f172a;">Vizag Main Service Depot</strong></span>
            <span>📅 Generated: <strong style="color: #0f172a;">${generatedDate}</strong></span>
            <span>🛡️ COO Verification: <strong style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; border: 1px solid #86efac;">AUDITED & VERIFIED</strong></span>
          </div>
        </div>

        <!-- KPI SUMMARY CARDS GRID -->
        <div style="display: grid; grid-template-columns: repeat(${kpis.length}, 1fr); gap: 14px; margin-bottom: 22px;">
          ${kpiCardsHtml}
        </div>

        <!-- AUDIT DATA TABLE (LIGHT THEME) -->
        <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 26px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <thead>
              <tr>${headersHtml}</tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- DIGITAL SIGNATURE BLOCK & AUDIT FOOTER (LIGHT THEME) -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 2px solid #e2e8f0; margin-top: 30px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600; line-height: 1.6;">
            <div>This document is cryptographically validated and logged into the InnoVibe COO Audit System.</div>
            <div>Security Stamp Hash: <span style="font-family: monospace; font-weight: 700; color: #334155;">SHA256: 8f92a10b4c7e912d6a...</span></div>
            <div style="color: #94a3b8; margin-top: 4px;">InnoVibe Mobility Technologies Pvt Ltd © 2026. All rights reserved.</div>
          </div>

          <div style="text-align: center; border: 1.5px dashed #cbd5e1; background: #f8fafc !important; padding: 10px 22px; border-radius: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
            <div style="font-size: 13px; font-weight: 900; color: #0f172a; font-style: italic;">Vikram Singh</div>
            <div style="font-size: 9px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-top: 2px;">Service Hub Manager</div>
            <div style="font-size: 9px; color: #16a34a; font-weight: 800; margin-top: 4px;">✔ DIGITALLY SIGNED</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;
  };

  const reports = [
    {
      id: 'rep_01',
      title: 'Daily Service Center Revenue Report',
      category: 'FINANCIAL',
      size: '2.4 MB',
      date: '14-Aug-2026',
      filenameCsv: 'Daily_Service_Center_Revenue_Report_14Aug2026.csv',
      csvData: `Service Ticket ID,Vehicle Model,Service Type,Date,Technician,Amount (INR),Payment Status
BK-2026-0001,Ather 450X Apex,Service at Center,14-Aug-2026,Rahul Sharma,1499,PAID
BK-2026-0002,Ola S1 Pro Gen 2,Roadside Assistance,14-Aug-2026,Suresh Kumar,899,PENDING
BK-2026-0003,TVS iQube ST,Service at Home,14-Aug-2026,Priya Singh,1299,PAID
BK-2026-0004,Hero Electric,Service at Center,14-Aug-2026,Rahul Sharma,499,PAID
BK-2026-0005,Ather 450X,Doorstep Inspection,14-Aug-2026,Priya Singh,249,PAID
TOTAL REVENUE,27 COMPLETED JOBS,-,14-Aug-2026,-,14850,SETTLED`,
      getHtml: () =>
        createPremiumPdfHtml(
          'Daily Service Center Revenue Report',
          'FINANCIAL',
          '14-Aug-2026',
          [
            { label: 'Total Revenue Value', value: '₹14,850', color: '#2563eb' },
            { label: 'Completed Service Jobs', value: '27 Jobs', color: '#0f172a' },
            { label: 'Payment Settlement', value: '96.4% Settled', color: '#16a34a' },
          ],
          ['TICKET ID', 'VEHICLE MODEL', 'SERVICE TYPE', 'TECHNICIAN', 'AMOUNT', 'STATUS'],
          [
            ['BK-2026-0001', 'Ather 450X Apex', 'Service at Center', 'Rahul Sharma', '₹1,499', { text: 'PAID', badge: 'success' }],
            ['BK-2026-0002', 'Ola S1 Pro Gen 2', 'Roadside Assistance', 'Suresh Kumar', '₹899', { text: 'PENDING', badge: 'warning' }],
            ['BK-2026-0003', 'TVS iQube ST', 'Service at Home', 'Priya Singh', '₹1,299', { text: 'PAID', badge: 'success' }],
            ['BK-2026-0004', 'Hero Electric', 'Service at Center', 'Rahul Sharma', '₹499', { text: 'PAID', badge: 'success' }],
            ['BK-2026-0005', 'Ather 450X', 'Doorstep Inspection', 'Priya Singh', '₹249', { text: 'PAID', badge: 'success' }],
          ]
        ),
    },
    {
      id: 'rep_02',
      title: 'SLA Turnaround & Delay Audit Log',
      category: 'OPERATIONS',
      size: '1.8 MB',
      date: '14-Aug-2026',
      filenameCsv: 'SLA_Turnaround_Audit_Log_14Aug2026.csv',
      csvData: `Audit ID,Vehicle,Technician,Service Type,Target SLA (Min),Actual Time (Min),Compliance Status
QA-2026-101,Ather 450X Apex,Rahul Sharma,Service at Center,120,95,ON_TIME
QA-2026-102,Ola S1 Pro Gen 2,Suresh Kumar,Roadside Assistance,60,78,OVERDUE
QA-2026-103,TVS iQube ST,Priya Singh,Service at Home,90,82,ON_TIME
QA-2026-104,Hero Electric,Rahul Sharma,Service at Center,120,110,ON_TIME`,
      getHtml: () =>
        createPremiumPdfHtml(
          'SLA Turnaround & Delay Audit Log',
          'OPERATIONS',
          '14-Aug-2026',
          [
            { label: 'Overall SLA Compliance', value: '87.5%', color: '#2563eb' },
            { label: 'Average Turnaround', value: '92 mins', color: '#16a34a' },
            { label: 'SLA Breaches', value: '2 Overdue', color: '#dc2626' },
          ],
          ['AUDIT ID', 'VEHICLE MODEL', 'TECHNICIAN', 'TARGET SLA', 'ACTUAL TIME', 'STATUS'],
          [
            ['QA-2026-101', 'Ather 450X Apex', 'Rahul Sharma', '120 Min', '95 Min', { text: 'ON TIME', badge: 'success' }],
            ['QA-2026-102', 'Ola S1 Pro Gen 2', 'Suresh Kumar', '60 Min', '78 Min', { text: 'OVERDUE', badge: 'danger' }],
            ['QA-2026-103', 'TVS iQube ST', 'Priya Singh', '90 Min', '82 Min', { text: 'ON TIME', badge: 'success' }],
            ['QA-2026-104', 'Hero Electric', 'Rahul Sharma', '120 Min', '110 Min', { text: 'ON TIME', badge: 'success' }],
          ]
        ),
    },
    {
      id: 'rep_03',
      title: 'Technician Monthly Productivity Ledger',
      category: 'HUMAN RESOURCES',
      size: '3.1 MB',
      date: '12-Aug-2026',
      filenameCsv: 'Technician_Productivity_Ledger_Aug2026.csv',
      csvData: `Technician ID,Name,Specialty,Completed Jobs,First Pass Yield,Rework Count,QC Rating Score
TECH-101,Rahul Sharma,EV Powertrain & BMS,24,96%,1,98%
TECH-102,Suresh Kumar,Mobile Field Service,19,89%,2,92%
TECH-103,Manoj Kumar,High Voltage & QA,31,97%,1,99%
TECH-104,Priya Singh,Doorstep Maintenance,15,93%,1,95%`,
      getHtml: () =>
        createPremiumPdfHtml(
          'Technician Monthly Productivity Ledger',
          'HUMAN RESOURCES',
          '12-Aug-2026',
          [
            { label: 'Active Roster', value: '4 Techs', color: '#2563eb' },
            { label: 'Total Completed', value: '89 Jobs', color: '#16a34a' },
            { label: 'Avg First Pass Yield', value: '93.7%', color: '#4f46e5' },
          ],
          ['TECH ID', 'NAME', 'SPECIALTY', 'COMPLETED', '1ST PASS YIELD', 'QC RATING'],
          [
            ['TECH-101', 'Rahul Sharma', 'EV Powertrain & BMS', '24 Jobs', '96%', { text: '98% HIGH', badge: 'success' }],
            ['TECH-102', 'Suresh Kumar', 'Mobile Field Service', '19 Jobs', '89%', { text: '92% GOOD', badge: 'success' }],
            ['TECH-103', 'Manoj Kumar', 'High Voltage & QA', '31 Jobs', '97%', { text: '99% MASTER', badge: 'success' }],
            ['TECH-104', 'Priya Singh', 'Doorstep Maintenance', '15 Jobs', '93%', { text: '95% HIGH', badge: 'success' }],
          ]
        ),
    },
    {
      id: 'rep_04',
      title: 'Depot Spare Parts Consumption Audit',
      category: 'INVENTORY',
      size: '4.0 MB',
      date: '10-Aug-2026',
      filenameCsv: 'Depot_Spare_Parts_Audit_Aug2026.csv',
      csvData: `Part Code,Part Description,Category,Stock Available,Reorder Threshold,Monthly Consumption,Status
PRT-801,Brake Pads (Front/Rear),Mechanical,42,15,68,OPTIMAL
PRT-802,Battery Connector Cable,Electrical,12,20,34,LOW_STOCK
PRT-803,Motor Controller (72V),EV Powertrain,5,10,18,CRITICAL
PRT-804,BMS Sensor Module B2,Electronics,18,10,22,OPTIMAL`,
      getHtml: () =>
        createPremiumPdfHtml(
          'Depot Spare Parts Consumption Audit',
          'INVENTORY',
          '10-Aug-2026',
          [
            { label: 'Total SKUs Monitored', value: '4 SKUs', color: '#0f172a' },
            { label: 'Low Stock Alerts', value: '1 SKU', color: '#d97706' },
            { label: 'Out of Stock Items', value: '1 Critical', color: '#dc2626' },
          ],
          ['PART CODE', 'DESCRIPTION', 'CATEGORY', 'AVAILABLE', 'THRESHOLD', 'STATUS'],
          [
            ['PRT-801', 'Brake Pads (Front/Rear)', 'Mechanical', '42 Units', '15 Units', { text: 'OPTIMAL', badge: 'success' }],
            ['PRT-802', 'Battery Connector Cable', 'Electrical', '12 Units', '20 Units', { text: 'LOW STOCK', badge: 'warning' }],
            ['PRT-803', 'Motor Controller (72V)', 'EV Powertrain', '5 Units', '10 Units', { text: 'CRITICAL', badge: 'danger' }],
            ['PRT-804', 'BMS Sensor Module B2', 'Electronics', '18 Units', '10 Units', { text: 'OPTIMAL', badge: 'success' }],
          ]
        ),
    },
  ];

  const triggerDownloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded ${filename} successfully!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerPrintPdf = (htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
    setToastMessage('Opened PDF Document Print Window! Select "Save as PDF"');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-5 text-left font-sans relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Operations & Financial Audit Reports
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Downloadable PDF and CSV audit reports for service revenue, SLA compliance, technician productivity, and spare parts
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
            4 Ready Reports
          </span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div key={rep.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between hover:border-purple-200 transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                  {rep.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{rep.date}</span>
              </div>
              
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug pt-1">{rep.title}</h3>
              <p className="text-xs text-slate-400 font-medium">Size: {rep.size} • Formats: PDF & CSV</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedReportModal(rep)}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
              >
                Preview Content
              </button>

              <button
                type="button"
                onClick={() => setDownloadFormatModalReport(rep)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FORMAT SELECTOR MODAL (PDF / CSV) */}
      {downloadFormatModalReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-600">
                <Download className="h-5 w-5" />
                <h3 className="text-sm font-black text-slate-900">Select Download Format</h3>
              </div>
              <button onClick={() => setDownloadFormatModalReport(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Choose your preferred file format for <span className="font-bold text-slate-900">{downloadFormatModalReport.title}</span>.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerPrintPdf(downloadFormatModalReport.getHtml());
                  setDownloadFormatModalReport(null);
                }}
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 space-y-2 text-left cursor-pointer transition-all hover:scale-105"
              >
                <FileType className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-extrabold text-xs">PDF Document</p>
                  <p className="text-[10px] text-purple-700">Official Styled PDF Report</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerDownloadCsv(downloadFormatModalReport.filenameCsv, downloadFormatModalReport.csvData);
                  setDownloadFormatModalReport(null);
                }}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 space-y-2 text-left cursor-pointer transition-all hover:scale-105"
              >
                <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-extrabold text-xs">CSV Spreadsheet</p>
                  <p className="text-[10px] text-emerald-700">Raw Data Excel Compatible</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT PREVIEW MODAL */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-sm font-black text-slate-900">{selectedReportModal.title}</h3>
              </div>
              <button onClick={() => setSelectedReportModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {selectedReportModal.csvData}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedReportModal(null);
                  setDownloadFormatModalReport(selectedReportModal);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Choose Format & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
