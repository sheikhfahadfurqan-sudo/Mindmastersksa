import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { MOCK_CLIENTS } from '../../data/mockData';
import { 
  Building2, 
  Search, 
  Filter, 
  Lock, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  ExternalLink, 
  Plus, 
  CheckCircle,
  EyeOff
} from 'lucide-react';

export const ClientManagement = () => {
  const { activeRole, canViewFinancials } = useAuthRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedClientModal, setSelectedClientModal] = useState(null);

  const filteredClients = MOCK_CLIENTS.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'ALL' || client.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header & CRM Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-outfit">CRM & Client Accounts</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-md">
              KSA Enterprise Portfolio
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Client relationship management, deal stage tracking, and contract vault
          </p>
        </div>

        {/* Dynamic RBAC Notice */}
        {!canViewFinancials && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-300 text-xs">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Contract values masked for Standard Employee role</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search company or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {['ALL', 'LEAD', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedStage === stage
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {stage === 'ALL' ? 'All Stages' : stage.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* CRM Client Database Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Company Name</th>
                <th className="py-3.5 px-4">Key Contact</th>
                <th className="py-3.5 px-4">Region / Location</th>
                <th className="py-3.5 px-4">Deal Stage</th>
                <th className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Contract Value (SAR)</span>
                    {!canViewFinancials && <Lock className="w-3 h-3 text-amber-400" />}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Account Lead</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Company Name */}
                  <td className="py-4 px-4 font-semibold text-slate-100 font-outfit">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold">
                        {client.companyName.substring(0, 2)}
                      </div>
                      <div>
                        <span>{client.companyName}</span>
                        <span className="text-[10px] text-slate-500 block font-normal">{client.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact Person */}
                  <td className="py-4 px-4 font-medium text-slate-300">
                    <div>
                      <span>{client.contactPerson}</span>
                      <span className="text-[10px] text-slate-500 block">{client.phone}</span>
                    </div>
                  </td>

                  {/* Region */}
                  <td className="py-4 px-4 text-slate-400">
                    {client.region}
                  </td>

                  {/* Stage Badge */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide inline-block ${
                      client.stage === 'CLOSED_WON' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' :
                      client.stage === 'PROPOSAL' ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60' :
                      client.stage === 'LEAD' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {client.stage.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Contract Value SAR (Masked for Standard Employee) */}
                  <td className="py-4 px-4 text-right">
                    {canViewFinancials ? (
                      <span className="font-extrabold text-slate-100 font-outfit text-sm">
                        SAR {(client.contractValueSAR).toLocaleString()}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/50 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> 🔒 Masked (Lead+)
                      </span>
                    )}
                  </td>

                  {/* Account Lead */}
                  <td className="py-4 px-4 text-center font-medium text-slate-300">
                    {client.ownerName}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedClientModal(client)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-800/60 text-xs font-medium inline-flex items-center gap-1 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" /> Client Vault
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail & Document Vault Modal */}
      {selectedClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-outfit">{selectedClientModal.companyName}</h3>
                <p className="text-xs text-slate-400">Account Details & Confidential Document Vault</p>
              </div>
              <button
                onClick={() => setSelectedClientModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm bg-slate-800 px-3 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Client Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Contact Person</span>
                <span className="font-semibold text-slate-200">{selectedClientModal.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Region</span>
                <span className="font-semibold text-slate-200">{selectedClientModal.region}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Contract Value</span>
                {canViewFinancials ? (
                  <span className="font-bold text-emerald-400">SAR {selectedClientModal.contractValueSAR.toLocaleString()}</span>
                ) : (
                  <span className="text-amber-400 font-medium">🔒 Restricted</span>
                )}
              </div>
            </div>

            {/* Vault Files List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 font-outfit uppercase tracking-wider">
                  Client Attached Vault Documents
                </h4>
                <span className="text-[10px] text-slate-400">{selectedClientModal.documentsCount} Documents</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-medium text-slate-200 block">Master Service Agreement (MSA)_Signed.pdf</span>
                      <span className="text-[10px] text-slate-500">Legal Contract • Clearance: RESTRICTED</span>
                    </div>
                  </div>
                  {canViewFinancials ? (
                    <button className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold hover:bg-indigo-500">
                      Download
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/50 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Restricted
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-medium text-slate-200 block">Project Scope & Technical Specifications.pdf</span>
                      <span className="text-[10px] text-slate-500">Technical Spec • Clearance: INTERNAL</span>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded text-[11px] font-semibold hover:bg-slate-700">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
