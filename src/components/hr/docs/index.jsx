import React, { useState } from 'react';
import { 
  FileText, Download, Upload, Search, CheckCircle, 
  AlertTriangle, Eye, X, BookOpen, FileDown 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_DOCS = [
  { id: "DOC-101", name: "Contract_Agreement.pdf", employee: "Sarah Connor", category: "Contracts", uploadDate: "2024-03-10", expiryDate: "2027-03-10", status: "Approved", size: "1.2 MB" },
  { id: "DOC-102", name: "TaxID_Verification.pdf", employee: "Alice Smith", category: "ID Proofs", uploadDate: "2024-05-15", expiryDate: "2029-05-15", status: "Approved", size: "0.8 MB" },
  { id: "DOC-103", name: "Degree_Certificate.pdf", employee: "Bob Johnson", category: "Certificates", uploadDate: "2026-02-20", expiryDate: "N/A", status: "Approved", size: "2.4 MB" },
  { id: "DOC-104", name: "Laptop_Handover_Form.pdf", employee: "Charlie Brown", category: "Policies", uploadDate: "2025-01-10", expiryDate: "2026-01-10", status: "Expiring Soon", size: "1.1 MB" },
  { id: "DOC-105", name: "Aadhaar_Card.pdf", employee: "Frank Castle", category: "ID Proofs", uploadDate: "N/A", expiryDate: "N/A", status: "Missing", size: "0.0 MB" }
];

export default function Docs() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(INITIAL_DOCS[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const filtered = docs.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.employee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadDocument = () => {
    const name = prompt("Enter Document File Name:");
    const employee = prompt("Enter Employee Name:");
    const category = prompt("Enter Category (Contracts, ID Proofs, Certificates):");

    if (name && employee && category) {
      const newDoc = {
        id: `DOC-${100 + docs.length + 1}`,
        name,
        employee,
        category,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: "N/A",
        status: "Approved",
        size: "1.0 MB"
      };
      setDocs(prev => [...prev, newDoc]);
      alert("Document uploaded successfully!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">HR Documents Control</strong>
            <span className="text-[10px] text-slate-405 block font-bold">Securely store employee contracts, identification verification files, and credentials vaults</span>
          </div>
        </div>

        <button
          onClick={handleUploadDocument}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-stat-box p-4 text-center">
          <span className="text-[9px] font-bold text-slate-405 uppercase block">Total Files</span>
          <strong className="text-base font-black text-slate-800 block mt-0.5">18 Files</strong>
        </div>
        <div className="premium-stat-box p-4 text-center">
          <span className="text-[9px] font-bold text-slate-405 uppercase block">Expiring Soon</span>
          <strong className="text-base font-black text-amber-500 block mt-0.5">1 File</strong>
        </div>
        <div className="premium-stat-box p-4 text-center">
          <span className="text-[9px] font-bold text-slate-405 uppercase block">Missing Documents</span>
          <strong className="text-base font-black text-rose-500 block mt-0.5">1 Alert</strong>
        </div>
        <div className="premium-stat-box p-4 text-center">
          <span className="text-[9px] font-bold text-slate-405 uppercase block">Approved Files</span>
          <strong className="text-base font-black text-emerald-600 block mt-0.5">16 Files</strong>
        </div>
      </div>

      {/* 3. TABLE & DOCUMENT DETAILS DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Table Container */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'} space-y-4`}>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">File Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Date</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(d => (
                    <tr 
                      key={d.id} 
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedDoc?.id === d.id ? 'bg-slate-50' : ''}`}
                      onClick={() => {
                        setSelectedDoc(d);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <strong className="text-slate-805 block">{d.name}</strong>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{d.employee}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{d.category}</td>
                      <td className="px-4 py-3.5 text-slate-450 align-middle">{d.uploadDate}</td>
                      <td className="px-4 py-3.5 text-slate-450 align-middle">{d.expiryDate}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          d.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          d.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle" onClick={(e)=>e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedDoc(d);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-550" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right drawer - document preview & info */}
        {drawerOpen && selectedDoc && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document Vault</span>
                <strong className="text-slate-805 block text-xs mt-1">{selectedDoc.name}</strong>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-550 font-bold">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Associated Employee</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedDoc.employee}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Document Size</span>
                <span className="font-bold text-slate-705 block mt-0.5">{selectedDoc.size}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Expiry Date</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedDoc.expiryDate}</span>
              </div>

              {selectedDoc.status === 'Missing' ? (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-650 flex items-center gap-1.5 leading-normal">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Missing Verification File! Please upload to proceed.</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600 font-bold">Verification status:</span>
                  <span className="text-emerald-600 font-extrabold uppercase">Valid</span>
                </div>
              )}

              {selectedDoc.status !== 'Missing' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => alert(`Downloading file: ${selectedDoc.name}`)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
