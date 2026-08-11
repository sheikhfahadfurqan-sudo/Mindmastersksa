import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { MOCK_DOCUMENTS } from '../../data/mockData';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  Lock, 
  ShieldCheck, 
  Download, 
  EyeOff, 
  AlertTriangle, 
  Plus, 
  Check,
  Search,
  Shield
} from 'lucide-react';

export const DocumentVault = () => {
  const { activeRole, canDownloadRestrictedDocs } = useAuthRole();
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [selectedClearanceFilter, setSelectedClearanceFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Document Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General Corporate');
  const [newClearance, setNewClearance] = useState('INTERNAL');

  const filteredDocs = documents.filter(doc => {
    return selectedClearanceFilter === 'ALL' || doc.clearance === selectedClearanceFilter;
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const newDoc = {
      id: `d${Date.now()}`,
      title: newTitle,
      category: newCategory,
      fileUrl: '#',
      fileSize: '2.5 MB',
      clearance: newClearance,
      uploadedByName: 'Active User',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Clearance Summary Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-outfit">Restricted Document Vault</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-950 text-violet-400 border border-violet-800 rounded-md">
              Granular Clearance Rule Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted file repository with RBAC permission locks for KSA enterprise records
          </p>
        </div>

        {/* Upload Action Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:brightness-110 transition-all"
        >
          <Upload className="w-4 h-4" /> Upload Vault Document
        </button>
      </div>

      {/* Role Clearance Alert Indicator */}
      {!canDownloadRestrictedDocs && (
        <div className="flex items-center gap-3 p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs shadow-inner">
          <EyeOff className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300">Standard Employee Role Clearance Policy Active: </span>
            <span>Restricted documents (Financial audits, Legal contracts, Executive strategy) are visually blurred and download buttons are disabled. Toggle to Executive or Lead role to grant access.</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
        {['ALL', 'PUBLIC', 'INTERNAL', 'RESTRICTED'].map((clearance) => (
          <button
            key={clearance}
            onClick={() => setSelectedClearanceFilter(clearance)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedClearanceFilter === clearance
                ? 'bg-indigo-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {clearance === 'ALL' ? 'All Files' : clearance}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isRestrictedForUser = doc.clearance === 'RESTRICTED' && !canDownloadRestrictedDocs;

          return (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                isRestrictedForUser
                  ? 'bg-slate-950/80 border-amber-900/40'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Clearance Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    doc.clearance === 'RESTRICTED'
                      ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      : doc.clearance === 'INTERNAL'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  }`}
                >
                  {doc.clearance === 'RESTRICTED' && <Lock className="w-3 h-3" />}
                  {doc.clearance}
                </span>
              </div>

              {/* Title & Category (Obscured if Restricted for Standard User) */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                  {doc.category}
                </span>
                
                <h3 className={`font-semibold text-sm leading-snug font-outfit ${
                  isRestrictedForUser ? 'text-slate-400 blur-[3px] select-none' : 'text-slate-100'
                }`}>
                  {doc.title}
                </h3>
              </div>

              {/* Footer Meta & Download Action */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <div className="text-[10px] space-y-0.5">
                  <span className="block text-slate-500">Size: {doc.fileSize}</span>
                  <span className="block text-slate-500">By: {doc.uploadedByName}</span>
                </div>

                {isRestrictedForUser ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 text-xs font-medium cursor-not-allowed flex items-center gap-1"
                    title="Executive or Lead role required to download"
                  >
                    <Lock className="w-3 h-3 text-amber-400" /> Locked
                  </button>
                ) : (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>

              {/* Confidential Obscured Overlay for Restricted Docs */}
              {isRestrictedForUser && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] p-4 flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-amber-300 font-outfit">CONFIDENTIAL EXECUTIVE FILE</span>
                  <span className="text-[10px] text-slate-400 max-w-[180px]">
                    Standard Clearance Role cannot view or download this document.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-outfit">Upload Document with Clearance</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Regional Growth Plan.pdf"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="Finance & Strategy">Finance & Strategy</option>
                  <option value="Legal Contracts">Legal Contracts</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Technical Specs">Technical Specs</option>
                  <option value="General Corporate">General Corporate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Granular Clearance Level</label>
                <select
                  value={newClearance}
                  onChange={(e) => setNewClearance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="PUBLIC">🟢 Public (All Employees & External)</option>
                  <option value="INTERNAL">🟡 Internal-Only (All Team Members)</option>
                  <option value="RESTRICTED">🔴 Restricted (Executive & Lead Roles Only)</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
                >
                  Confirm Upload & Apply Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
