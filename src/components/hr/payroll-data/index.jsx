import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllPayroll,
  generateAllPayroll,
  generateSingleUserPayroll,
  downloadEmployeePayslip,
  downloadAllPayslipsZip
} from '../../../service/hrm/payroll';
import { parseIndexedObjectToArray } from '../../../service/hrm/leave';

import PayrollHeader from './PayrollHeader';
import PayrollSummary from './PayrollSummary';
import PayrollToolbar from './PayrollToolbar';
import PayrollTable from './PayrollTable';
import PayrollDetailsDrawer from './PayrollDetailsDrawer';
import PayrollAnalytics from './PayrollAnalytics';
import PayrollEmptyState from './PayrollEmptyState';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Normalizes a payroll record from backend API
 */
export const mapPayrollRecord = (rec) => {
  const userObj = rec.userId || {};
  const isPopulatedUser = typeof userObj === 'object' && userObj !== null;

  return {
    id: rec._id,
    userId: isPopulatedUser ? userObj._id || rec.userId : rec.userId,
    name: isPopulatedUser ? userObj.name || 'Nirman Employee' : 'Nirman Employee',
    email: isPopulatedUser ? userObj.email || '' : '',
    department: isPopulatedUser ? userObj.department || '' : '',
    designation: isPopulatedUser ? userObj.designation || '' : '',
    month: rec.month,
    year: rec.year,
    baseSalary: Number(rec.baseSalary) || 0,
    daysInMonth: Number(rec.daysInMonth) || 0,
    presentDays: Number(rec.presentDays) || 0,
    paidLeaveDays: Number(rec.paidLeaveDays) || 0,
    unpaidLeaveDays: Number(rec.unpaidLeaveDays) || 0,
    absentDays: Number(rec.absentDays) || 0,
    perDaySalary: Number(rec.perDaySalary) || 0,
    totalDeduction: Number(rec.totalDeduction) || 0,
    netSalary: Number(rec.netSalary) || 0,
    generatedAt: rec.generatedAt || null,
    pdfPath: rec.pdfPath || null,
    status: rec.status || rec.releaseStatus || (rec.generatedAt ? 'GENERATED' : 'NOT_GENERATED'),
    payslipAvailable: rec.payslipAvailable !== undefined ? rec.payslipAvailable : true
  };
};

export default function HRPayroll() {
  const currentDate = new Date();
  const [selectedMonthNum, setSelectedMonthNum] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadingPayslipUserId, setDownloadingPayslipUserId] = useState(null);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);

  // Approval Release persistence per month/year cycle
  const [releasedCycles, setReleasedCycles] = useState(() => {
    try {
      const saved = localStorage.getItem('nirman_payroll_released_cycles');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const cycleKey = `${selectedMonthNum}_${selectedYear}`;
  const isReleased = Boolean(releasedCycles[cycleKey]);

  const handleApproveRelease = () => {
    const monthName = MONTH_NAMES[selectedMonthNum - 1];
    setReleasedCycles(prev => {
      const updated = { ...prev, [cycleKey]: true };
      try {
        localStorage.setItem('nirman_payroll_released_cycles', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`Payroll approved & released successfully for ${monthName} ${selectedYear}! Employee payslips are now available for download.`, 'success');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await getAllPayroll({ month: selectedMonthNum, year: selectedYear });
      const rawList = parseIndexedObjectToArray(res);
      const mapped = rawList.map(mapPayrollRecord);
      setRecords(mapped);

      // Check if any fetched record is already RELEASED or APPROVED in backend
      const hasBackendRelease = mapped.some(r => r.status === 'RELEASED' || r.status === 'APPROVED');
      if (hasBackendRelease && !releasedCycles[cycleKey]) {
        setReleasedCycles(prev => ({ ...prev, [cycleKey]: true }));
      }

      // Keep drawer record updated if opened
      if (selectedRecord) {
        const updated = mapped.find(r => r.userId === selectedRecord.userId || r.id === selectedRecord.id);
        if (updated) setSelectedRecord(updated);
      }
    } catch (err) {
      console.error("Failed to fetch payroll:", err);
      showToast(err.message || "Error loading payroll records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonthNum, selectedYear]);

  // Generate payroll for all active employees
  const handleGenerateAllPayroll = async () => {
    try {
      setIsGenerating(true);
      const res = await generateAllPayroll({ month: selectedMonthNum, year: selectedYear });
      const monthName = MONTH_NAMES[selectedMonthNum - 1];
      showToast(res.message || `Payroll generated successfully for ${monthName} ${selectedYear}.`);
      await fetchPayroll();
    } catch (err) {
      console.error("Error generating payroll:", err);
      showToast(err.response?.data?.message || err.message || "Failed to generate payroll.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate payroll for a single user
  const handleGenerateSingleUser = async (userId) => {
    try {
      setIsGeneratingSingle(true);
      const res = await generateSingleUserPayroll(userId, { month: selectedMonthNum, year: selectedYear });
      showToast(res.message || "Employee payroll generated successfully.");
      await fetchPayroll();
    } catch (err) {
      console.error("Error generating single payroll:", err);
      showToast(err.response?.data?.message || err.message || "Failed to generate single payroll.", "error");
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  // Download single payslip PDF
  const handleDownloadPayslip = async (rec) => {
    if (!rec || !rec.userId) return;
    try {
      setDownloadingPayslipUserId(rec.userId);
      showToast(`Preparing payslip download for ${rec.name}...`);
      await downloadEmployeePayslip(rec.userId, rec.name, selectedMonthNum, selectedYear);
      showToast("Payslip downloaded successfully!");
    } catch (err) {
      console.error("Payslip download error:", err);
      showToast(err.message || "Failed to download payslip PDF.", "error");
    } finally {
      setDownloadingPayslipUserId(null);
    }
  };

  // Download Bulk ZIP
  const handleDownloadZip = async () => {
    if (!records || records.length === 0) {
      showToast("No payroll records found for this period. Please generate payroll first!", "error");
      return;
    }
    try {
      setIsDownloadingZip(true);
      showToast("Preparing released payslips ZIP package...");
      await downloadAllPayslipsZip(selectedMonthNum, selectedYear);
      showToast("Payroll ZIP package downloaded successfully!");
    } catch (err) {
      const errMsg = err?.message || "Backend ZIP compilation failed.";
      console.warn("ZIP download error:", errMsg);
      showToast(`${errMsg} Falling back to individual payslips...`, "warning");

      // Sequential Fallback
      try {
        let count = 0;
        for (const rec of records) {
          if (rec.userId) {
            await downloadEmployeePayslip(rec.userId, rec.name, selectedMonthNum, selectedYear);
            count++;
          }
        }
        if (count > 0) {
          showToast("All individual employee payslips downloaded successfully!", "success");
        }
      } catch (fallbackErr) {
        console.error("Sequential download fallback error:", fallbackErr?.message || fallbackErr);
      }
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Unique departments for filter dropdown
  const departmentsList = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesEmail = r.email?.toLowerCase().includes(q);
        const matchesDept = r.department?.toLowerCase().includes(q);
        const matchesDesig = r.designation?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept && !matchesDesig) return false;
      }
      // Department
      if (selectedDepartment && r.department?.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return false;
      }
      // Status
      if (selectedStatus) {
        const normStatus = (isReleased ? 'RELEASED' : (r.status || (r.generatedAt ? 'GENERATED' : 'NOT_GENERATED'))).toUpperCase();
        if (normStatus !== selectedStatus.toUpperCase()) return false;
      }
      return true;
    });
  }, [records, searchQuery, selectedDepartment, selectedStatus, isReleased]);

  const monthName = MONTH_NAMES[selectedMonthNum - 1];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16 animate-in fade-in duration-200">
      
      {/* 1. Header with Period Selector & Primary Actions */}
      <PayrollHeader
        selectedMonthNum={selectedMonthNum}
        selectedYear={selectedYear}
        onPeriodChange={(m, y) => {
          setSelectedMonthNum(m);
          setSelectedYear(y);
        }}
        onGeneratePayroll={handleGenerateAllPayroll}
        onApproveRelease={handleApproveRelease}
        onDownloadZip={handleDownloadZip}
        isGenerating={isGenerating}
        isDownloadingZip={isDownloadingZip}
        isReleased={isReleased}
        hasRecords={records.length > 0}
        loading={loading}
      />

      {/* 2. Summary Metric Cards */}
      <PayrollSummary records={records} />

      {/* 3. Toolbar (Search & Filters) */}
      <PayrollToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departmentsList={departmentsList}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* 4. Table or Empty State */}
      {records.length === 0 && !loading ? (
        <PayrollEmptyState
          monthName={monthName}
          year={selectedYear}
          onGenerate={handleGenerateAllPayroll}
          isGenerating={isGenerating}
        />
      ) : (
        <PayrollTable
          records={filteredRecords}
          loading={loading}
          isReleased={isReleased}
          selectedRecordId={selectedRecord?.id}
          onSelectRecord={(rec) => {
            setSelectedRecord(rec);
            setDrawerOpen(true);
          }}
          onDownloadPayslip={handleDownloadPayslip}
          downloadingPayslipUserId={downloadingPayslipUserId}
        />
      )}

      {/* 5. Analytics & Insights */}
      <PayrollAnalytics records={records} />

      {/* 6. Details Drawer */}
      <PayrollDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
        monthNum={selectedMonthNum}
        year={selectedYear}
        isReleased={isReleased}
        onDownloadPayslip={handleDownloadPayslip}
        onGenerateSingle={handleGenerateSingleUser}
        isDownloadingPayslip={downloadingPayslipUserId === selectedRecord?.userId}
        isGeneratingSingle={isGeneratingSingle}
      />

      {/* Toast Banner */}
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold z-50 flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
          toast.type === 'success' ? 'bg-emerald-900 border-emerald-800 text-emerald-100' :
          toast.type === 'warning' ? 'bg-amber-900 border-amber-800 text-amber-100' :
          'bg-rose-900 border-rose-800 text-rose-100'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400 animate-pulse' :
            toast.type === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}

