import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowLeft,
  Calendar, DollarSign, Users, Clock, FileUp
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const REPORT_LABELS = {
  customer_invoices: 'Customer Invoices',
  sales_by_customer: 'Sales by Customer'
};

export default function SageImport({ onBack }) {
  const { getAuthHeader } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('import');
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/sage/import-history`, { headers: getAuthHeader() });
      setHistory(res.data);
    } catch {}
  }, [getAuthHeader]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file from Sage');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API}/sage/import`, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchReports = async (type) => {
    setLoadingReports(true);
    try {
      const url = type ? `${API}/sage/reports?report_type=${type}` : `${API}/sage/reports`;
      const res = await axios.get(url, { headers: getAuthHeader() });
      setReports(res.data);
    } catch {}
    setLoadingReports(false);
  };

  return (
    <div className="page-content" data-testid="sage-import-page">
      <div className="px-4 pt-2 mb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-text-secondary text-sm" data-testid="import-back">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-title">Sage Reports</div>
        <div className="page-header-sub">Import and view Sage accounting data</div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {['import', 'invoices', 'sales'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'invoices') fetchReports('customer_invoices');
                if (tab === 'sales') fetchReports('sales_by_customer');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize ${
                activeTab === tab 
                  ? 'bg-accent-orange text-black' 
                  : 'bg-bg-card text-text-muted border border-border'
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === 'invoices' ? 'Invoices' : tab === 'sales' ? 'Sales' : 'Import'}
            </button>
          ))}
        </div>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="px-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4" data-testid="import-result">
              <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-2">
                <CheckCircle size={18} /> Import Successful
              </div>
              <div className="text-xs text-text-muted space-y-1">
                <div>File: {result.filename}</div>
                <div>Report: {REPORT_LABELS[result.report_type]}</div>
                <div>New records: {result.new_imported}</div>
                <div>Updated records: {result.updated}</div>
                <div>Total: {result.total_records}</div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="hidden"
            data-testid="sage-file-input"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-10 border-2 border-dashed border-accent-orange/50 rounded-xl flex flex-col items-center justify-center gap-3 text-accent-orange hover:bg-accent-orange/5 transition-colors disabled:opacity-50"
            data-testid="upload-sage-btn"
          >
            {uploading ? (
              <>
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm font-semibold">Importing...</span>
              </>
            ) : (
              <>
                <FileUp size={32} />
                <span className="text-sm font-semibold">Upload Sage CSV Report</span>
                <span className="text-xs text-text-muted">Customer Invoices or Sales by Customer</span>
              </>
            )}
          </button>

          {/* Import History */}
          {history.length > 0 && (
            <div>
              <div className="text-xs font-semibold tracking-[2px] text-text-muted uppercase mb-3">Import History</div>
              {history.map((h, i) => (
                <div key={i} className="bg-bg-card rounded-lg p-3 mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-text-primary font-medium">{REPORT_LABELS[h.report_type]}</div>
                    <div className="text-xs text-text-muted flex items-center gap-2">
                      <Clock size={11} /> {new Date(h.imported_at).toLocaleString('en-GB')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-text-primary">{h.record_count} records</div>
                    <div className="text-xs text-text-muted">R{h.total_selling.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="px-4">
          {loadingReports ? (
            <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-accent-orange" /></div>
          ) : reports ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-bg-card rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">R{reports.summary.total_selling.toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted uppercase">Total Selling</div>
                </div>
                <div className="bg-bg-card rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-400">R{reports.summary.total_outstanding.toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted uppercase">Outstanding</div>
                </div>
              </div>
              {reports.records.map((r, i) => (
                <div key={i} className="bg-bg-card rounded-lg p-3 mb-2" data-testid={`invoice-row-${i}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm font-semibold text-accent-orange">{r.document_no}</div>
                    <div className="text-sm font-bold text-text-primary">R{r.total_selling?.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-text-primary truncate">{r.customer}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-[11px] text-text-muted flex items-center gap-1">
                      <Calendar size={11} /> {r.date}
                    </div>
                    {r.total_outstanding > 0 && (
                      <div className="text-[11px] text-red-400 font-semibold">
                        R{r.total_outstanding?.toLocaleString()} outstanding
                      </div>
                    )}
                  </div>
                  {r.customer_ref && (
                    <div className="text-[11px] text-text-muted mt-1">{r.customer_ref}</div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-center text-text-muted py-10 text-sm">No invoice data imported yet</div>
          )}
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="px-4">
          {loadingReports ? (
            <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-accent-orange" /></div>
          ) : reports ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-bg-card rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">R{reports.summary.total_selling.toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted uppercase">Total Sales</div>
                </div>
                <div className="bg-bg-card rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">{reports.summary.unique_customers}</div>
                  <div className="text-[10px] text-text-muted uppercase">Customers</div>
                </div>
              </div>
              {reports.records.map((r, i) => (
                <div key={i} className="bg-bg-card rounded-lg p-3 mb-2" data-testid={`sales-row-${i}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm font-semibold text-accent-orange">{r.document_no}</div>
                    <div className="text-sm font-bold text-text-primary">R{r.total_selling?.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-text-primary truncate">{r.customer}</div>
                  <div className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                    <Calendar size={11} /> {r.date}
                  </div>
                  {r.line_items && r.line_items.length > 0 && (
                    <div className="mt-2 border-t border-border pt-2 space-y-0.5">
                      {r.line_items.map((item, j) => (
                        <div key={j} className="flex justify-between text-[11px]">
                          <span className="text-text-muted truncate flex-1 mr-2">{item.description}</span>
                          <span className="text-text-primary flex-shrink-0">R{item.total?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-center text-text-muted py-10 text-sm">No sales data imported yet</div>
          )}
        </div>
      )}
    </div>
  );
}
