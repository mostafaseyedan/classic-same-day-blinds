import { useState } from 'react';
import type { Company } from '../../types';

interface Props {
  company: Company;
  orders: any[];
}

const TIER_THRESHOLDS = {
  Bronze: { min: 0, max: 49999, discount: '0-3%', creditLimit: '$25K–$50K' },
  Silver: { min: 50000, max: 149999, discount: '4-6%', creditLimit: '$50K–$150K' },
  Gold: { min: 150000, max: 499999, discount: '7-10%', creditLimit: '$150K–$300K' },
  Diamond: { min: 500000, max: Infinity, discount: '11-15%', creditLimit: '$300K+' },
};

const CONTRACT_HISTORY = [
  { version: 'v3.0', date: '2024-01-15', type: 'Annual Renewal', signer: 'Sarah Johnson', status: 'Active' },
  { version: 'v2.0', date: '2023-01-10', type: 'Annual Renewal', signer: 'Sarah Johnson', status: 'Expired' },
  { version: 'v1.0', date: '2022-03-05', type: 'Initial Agreement', signer: 'Sarah Johnson', status: 'Expired' },
];

export default function CompanyContractsTab({ company, orders }: Props) {
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [specialTerms, setSpecialTerms] = useState(
    `• ${company.discount}% discount on all standard products\n• ${company.creditTerms} payment terms\n• Priority fulfillment for orders over $10,000\n• Dedicated account manager: ${company.accountManager}\n${company.taxExempt ? `• Tax-exempt status (ID: ${company.taxExemptId})\n` : ''}• White-glove delivery available on request`
  );
  const [tempTerms, setTempTerms] = useState(specialTerms);

  const creditUtil = company.creditLimit > 0 ? (company.outstandingBalance / company.creditLimit) * 100 : 0;
  const annualSpend = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const tierThresh = TIER_THRESHOLDS[company.tier];

  const volumeDiscounts = [
    { threshold: '$0–$10K', discount: `${Math.max(0, company.discount - 2)}%`, active: annualSpend < 10000 },
    { threshold: '$10K–$50K', discount: `${company.discount}%`, active: annualSpend >= 10000 && annualSpend < 50000 },
    { threshold: '$50K–$100K', discount: `${company.discount + 2}%`, active: annualSpend >= 50000 && annualSpend < 100000 },
    { threshold: '$100K+', discount: `${company.discount + 4}%`, active: annualSpend >= 100000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Credit terms card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <i className="ri-bank-card-line text-slate-700 text-base"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Credit Terms</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Payment Terms</span>
              <span className="text-sm font-bold text-slate-900 px-2.5 py-1 bg-white rounded-lg border border-slate-200">{company.creditTerms}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Credit Limit</span>
              <span className="text-sm font-bold text-slate-900">${company.creditLimit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Outstanding</span>
              <span className={`text-sm font-bold ${creditUtil > 75 ? 'text-red-600' : 'text-slate-900'}`}>${company.outstandingBalance.toLocaleString()}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Utilization</span>
                <span className={`font-semibold ${creditUtil > 75 ? 'text-red-600' : 'text-slate-700'}`}>{creditUtil.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full">
                <div className={`h-2.5 rounded-full ${creditUtil > 75 ? 'bg-red-400' : creditUtil > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, creditUtil)}%` }}></div>
              </div>
            </div>
            {company.taxExempt && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl">
                <i className="ri-shield-check-line text-emerald-600 text-sm mt-0.5"></i>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Tax Exempt</p>
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">{company.taxExemptId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tier & Discount */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="ri-vip-crown-line text-amber-700 text-base"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pricing Tier</h3>
          </div>
          <div className="text-center mb-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-black text-slate-900">{company.tier}</p>
            <p className="text-sm text-slate-500 mt-1">{tierThresh.discount} discount range</p>
            <p className="text-xs text-slate-400">{tierThresh.creditLimit} credit range</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Volume Discounts</p>
            {volumeDiscounts.map((vd) => (
              <div key={vd.threshold} className={`flex justify-between items-center px-3 py-2 rounded-lg ${vd.active ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
                <span className={`text-xs font-semibold ${vd.active ? 'text-slate-300' : 'text-slate-500'}`}>{vd.threshold}</span>
                <span className={`text-sm font-bold ${vd.active ? 'text-white' : 'text-slate-900'}`}>{vd.discount}</span>
                {vd.active && <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">ACTIVE</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Annual spend summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <i className="ri-line-chart-line text-teal-700 text-base"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Account Value</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Annual Revenue', value: `$${company.annualRevenue.toLocaleString()}` },
              { label: 'Order History', value: `$${annualSpend.toLocaleString()}` },
              { label: 'Discount Saved', value: `$${Math.round(annualSpend * company.discount / 100).toLocaleString()}` },
              { label: 'Orders Placed', value: orders.length.toString() },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Terms */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <i className="ri-file-text-line text-violet-700 text-base"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Special Terms & Conditions</h3>
          </div>
          <button onClick={() => { setShowEditNotes(!showEditNotes); setTempTerms(specialTerms); }}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            <i className={`ri-${showEditNotes ? 'close' : 'edit'}-line`}></i> {showEditNotes ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {showEditNotes ? (
          <div>
            <textarea value={tempTerms} onChange={(e) => setTempTerms(e.target.value)} rows={6}
              className="w-full text-sm border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 outline-none text-slate-700 resize-none" />
            <div className="flex justify-end mt-2">
              <button onClick={() => { setSpecialTerms(tempTerms); setShowEditNotes(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                <i className="ri-save-line"></i> Save Terms
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-4">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{specialTerms}</pre>
          </div>
        )}
      </div>

      {/* Contract History */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Contract History</h3>
        <div className="space-y-2">
          {CONTRACT_HISTORY.map((contract) => (
            <div key={contract.version} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${contract.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                <i className="ri-file-text-line text-base"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">Contract {contract.version}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${contract.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {contract.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{contract.type} &bull; Signed by {contract.signer}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{new Date(contract.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer whitespace-nowrap">
                <i className="ri-download-2-line"></i> PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
