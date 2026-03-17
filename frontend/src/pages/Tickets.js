import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/data';
import { 
  Plus, Search, X, Video, Upload, Clock, Wrench, CheckCircle, 
  FileText, AlertCircle, Loader2, Play, Camera, User, Calendar, Image
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const STATUS_COLORS = {
  open: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Open' },
  assessing: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Assessing' },
  scheduled: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Scheduled' },
  in_progress: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'In Progress' },
  completed: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Completed' },
  invoiced: { bg: 'bg-accent-orange/15', text: 'text-accent-orange', label: 'Invoiced' },
  closed: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Closed' }
};

const URGENCY_COLORS = {
  low: { bg: 'bg-gray-500/15', text: 'text-gray-400' },
  medium: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  critical: { bg: 'bg-red-500/15', text: 'text-red-400' }
};

// Video Upload Component
function VideoUploader({ onUpload, uploading }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }
    
    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be under 100MB');
      return;
    }
    
    onUpload(file);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="video-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-4 border-2 border-dashed border-accent-orange/50 rounded-xl flex flex-col items-center gap-2 text-accent-orange hover:bg-accent-orange/5 transition-colors disabled:opacity-50"
        data-testid="video-upload-btn"
      >
        {uploading ? (
          <>
            <Loader2 size={32} className="animate-spin" />
            <span className="text-sm font-medium">Uploading video...</span>
          </>
        ) : (
          <>
            <Video size={32} />
            <span className="text-sm font-medium">Tap to record or upload video</span>
            <span className="text-xs text-text-muted">Show the issue clearly (max 100MB)</span>
          </>
        )}
      </button>
    </div>
  );
}

// Job Card Upload Component (for technicians)
function JobCardUploader({ ticket, onUploaded, getAuthHeader }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (photo of signed job card)');
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const sigResponse = await axios.get(
        `${API}/cloudinary/signature?resource_type=image&folder=jobcards/${ticket.ticket_number}`,
        { headers: getAuthHeader() }
      );
      const sig = sigResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        formData
      );

      await axios.post(
        `${API}/tickets/${ticket.id}/jobcard`,
        {
          job_card_url: uploadRes.data.secure_url,
          job_card_public_id: uploadRes.data.public_id,
          completion_notes: notes || null
        },
        { headers: getAuthHeader() }
      );

      onUploaded();
    } catch (err) {
      console.error('Job card upload failed:', err);
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-bg-card rounded-lg p-4" data-testid="jobcard-uploader">
      <div className="text-xs text-text-muted uppercase mb-2 flex items-center gap-1.5">
        <Camera size={14} /> Upload Job Card
      </div>
      {error && (
        <div className="text-xs text-red-400 mb-2">{error}</div>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Completion notes (optional)..."
        rows={2}
        className="w-full bg-bg-primary border border-border rounded-lg py-2 px-3 text-text-primary text-sm resize-none mb-3"
        data-testid="jobcard-notes"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="jobcard-file-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 border-2 border-dashed border-green-500/50 rounded-lg flex items-center justify-center gap-2 text-green-400 hover:bg-green-500/5 transition-colors disabled:opacity-50 text-sm font-medium"
        data-testid="jobcard-upload-btn"
      >
        {uploading ? (
          <><Loader2 size={18} className="animate-spin" /> Uploading...</>
        ) : (
          <><Image size={18} /> Take Photo or Select Job Card</>
        )}
      </button>
    </div>
  );
}

// Invoice Upload Component (for accounting)
function InvoiceUploader({ ticket, onUploaded, getAuthHeader }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!invoiceNumber.trim()) {
      setError('Please enter an invoice number first');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Please select a PDF or image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB');
      return;
    }

    setUploading(true);
    setError('');

    const isPdf = file.type === 'application/pdf';
    const resourceType = isPdf ? 'raw' : 'image';

    try {
      const sigResponse = await axios.get(
        `${API}/cloudinary/signature?resource_type=${resourceType}&folder=invoices/${ticket.ticket_number}`,
        { headers: getAuthHeader() }
      );
      const sig = sigResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`,
        formData
      );

      await axios.post(
        `${API}/tickets/${ticket.id}/invoice`,
        {
          invoice_url: uploadRes.data.secure_url,
          invoice_number: invoiceNumber.trim()
        },
        { headers: getAuthHeader() }
      );

      onUploaded();
    } catch (err) {
      console.error('Invoice upload failed:', err);
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-bg-card rounded-lg p-4" data-testid="invoice-uploader">
      <div className="text-xs text-text-muted uppercase mb-2 flex items-center gap-1.5">
        <FileText size={14} /> Attach Invoice
      </div>
      {error && (
        <div className="text-xs text-red-400 mb-2">{error}</div>
      )}
      <input
        type="text"
        value={invoiceNumber}
        onChange={(e) => setInvoiceNumber(e.target.value)}
        placeholder="Invoice number (e.g., INV-2026-001)"
        className="w-full bg-bg-primary border border-border rounded-lg py-2 px-3 text-text-primary text-sm mb-3"
        data-testid="invoice-number-input"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="invoice-file-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 border-2 border-dashed border-blue-500/50 rounded-lg flex items-center justify-center gap-2 text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-50 text-sm font-medium"
        data-testid="invoice-upload-btn"
      >
        {uploading ? (
          <><Loader2 size={18} className="animate-spin" /> Uploading...</>
        ) : (
          <><Upload size={18} /> Upload Invoice (PDF or Image)</>
        )}
      </button>
    </div>
  );
}


// New Ticket Modal
function NewTicketModal({ onClose, onCreated }) {
  const { getAuthHeader, user } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: Video
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);
  
  const [formData, setFormData] = useState({
    store_id: '',
    store_name: '',
    issue_description: '',
    machine_type: '',
    urgency: 'medium'
  });

  const handleStoreSelect = (e) => {
    const store = ASSETS.find(a => a.id === e.target.value);
    if (store) {
      setFormData(prev => ({
        ...prev,
        store_id: store.id,
        store_name: store.name,
        machine_type: store.machine1 || ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.store_id || !formData.issue_description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/tickets`, formData, {
        headers: getAuthHeader()
      });
      setCreatedTicket(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file) => {
    if (!createdTicket) return;
    
    setUploading(true);
    
    try {
      // Get Cloudinary signature
      const sigResponse = await axios.get(`${API}/cloudinary/signature?resource_type=video&folder=tickets/${createdTicket.ticket_number}`, {
        headers: getAuthHeader()
      });
      const sig = sigResponse.data;
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);
      
      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`,
        formData
      );
      
      // Update ticket with video URL
      await axios.put(
        `${API}/tickets/${createdTicket.id}/video?video_url=${encodeURIComponent(uploadResponse.data.secure_url)}&video_public_id=${encodeURIComponent(uploadResponse.data.public_id)}`,
        {},
        { headers: getAuthHeader() }
      );
      
      onCreated();
      onClose();
    } catch (err) {
      console.error('Video upload failed:', err);
      // If Cloudinary not configured, still allow completing
      if (err.response?.status === 503) {
        alert('Video upload not available yet. Ticket created without video.');
        onCreated();
        onClose();
      } else {
        setError('Video upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const skipVideo = () => {
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-end" data-testid="new-ticket-modal">
      <div className="bg-bg-secondary w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display text-xl font-bold">
              {step === 1 ? 'Log Service Call' : 'Upload Video'}
            </div>
            <div className="text-xs text-text-muted">
              {step === 1 ? 'Step 1 of 2: Describe the issue' : 'Step 2 of 2: Show us the problem'}
            </div>
          </div>
          <button onClick={onClose} className="text-text-secondary" data-testid="close-modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Store *</label>
                <select
                  value={formData.store_id}
                  onChange={handleStoreSelect}
                  className="w-full bg-bg-primary border border-border rounded-lg py-3 px-4 text-text-primary"
                  data-testid="store-select"
                >
                  <option value="">Select store...</option>
                  {ASSETS.map(store => (
                    <option key={store.id} value={store.id}>{store.name} ({store.group})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Machine</label>
                <input
                  type="text"
                  value={formData.machine_type}
                  onChange={(e) => setFormData(p => ({ ...p, machine_type: e.target.value }))}
                  placeholder="e.g., Nuova Simonelli Aurelia"
                  className="w-full bg-bg-primary border border-border rounded-lg py-3 px-4 text-text-primary"
                  data-testid="machine-input"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Issue Description *</label>
                <textarea
                  value={formData.issue_description}
                  onChange={(e) => setFormData(p => ({ ...p, issue_description: e.target.value }))}
                  placeholder="Describe the problem in detail..."
                  rows={4}
                  className="w-full bg-bg-primary border border-border rounded-lg py-3 px-4 text-text-primary resize-none"
                  data-testid="issue-input"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Urgency</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map(level => (
                    <button
                      key={level}
                      onClick={() => setFormData(p => ({ ...p, urgency: level }))}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                        formData.urgency === level 
                          ? `border-accent-orange bg-accent-orange/15 text-accent-orange` 
                          : 'border-border bg-bg-card text-text-muted'
                      }`}
                      data-testid={`urgency-${level}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 bg-accent-orange text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="submit-ticket"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>Continue to Video</>
              )}
            </button>
          </>
        ) : (
          <>
            {createdTicket && (
              <div className="bg-accent-green/10 border border-accent-green/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-accent-green" />
                  <span className="font-semibold text-accent-green">Ticket Created!</span>
                </div>
                <div className="text-sm text-text-primary">
                  Ticket Number: <span className="font-mono text-accent-orange">{createdTicket.ticket_number}</span>
                </div>
              </div>
            )}

            <p className="text-sm text-text-muted mb-4">
              Please upload a video showing the issue. This helps our team prepare the right tools and parts.
            </p>

            <VideoUploader onUpload={handleVideoUpload} uploading={uploading} />

            <button
              onClick={skipVideo}
              className="w-full mt-4 py-3 border border-border rounded-lg text-text-secondary font-medium"
              data-testid="skip-video"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Ticket Detail Modal
function TicketDetailModal({ ticket, onClose, onUpdated }) {
  const { getAuthHeader, isAdmin, isTechnician, isAccounting } = useAuth();
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [updates, setUpdates] = useState({
    status: ticket.status,
    resolution_type: ticket.resolution_type || '',
    assigned_technician_id: ticket.assigned_technician_id || '',
    assigned_technician_name: ticket.assigned_technician_name || '',
    scheduled_date: ticket.scheduled_date || '',
    scheduled_time: ticket.scheduled_time || '',
    notes: ticket.notes || ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchTechnicians();
    }
    // eslint-disable-next-line
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await axios.get(`${API}/admin/technicians`, {
        headers: getAuthHeader()
      });
      setTechnicians(response.data);
    } catch (err) {
      console.error('Failed to fetch technicians');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/tickets/${ticket.id}`, updates, {
        headers: getAuthHeader()
      });
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicianSelect = (e) => {
    const tech = technicians.find(t => t.id === e.target.value);
    if (tech) {
      setUpdates(prev => ({
        ...prev,
        assigned_technician_id: tech.id,
        assigned_technician_name: tech.name
      }));
    }
  };

  const statusInfo = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;

  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-end" data-testid="ticket-detail-modal">
      <div className="bg-bg-secondary w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display text-xl font-bold">{ticket.ticket_number}</div>
            <div className="text-xs text-text-muted">{ticket.store_name}</div>
          </div>
          <button onClick={onClose} className="text-text-secondary" data-testid="close-detail">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${URGENCY_COLORS[ticket.urgency]?.bg} ${URGENCY_COLORS[ticket.urgency]?.text}`}>
              {ticket.urgency.toUpperCase()}
            </span>
          </div>

          {/* Issue */}
          <div className="bg-bg-card rounded-lg p-4">
            <div className="text-xs text-text-muted uppercase mb-1">Issue</div>
            <div className="text-sm text-text-primary">{ticket.issue_description}</div>
            {ticket.machine_type && (
              <div className="text-xs text-text-muted mt-2">Machine: {ticket.machine_type}</div>
            )}
          </div>

          {/* Video */}
          {ticket.video_url && (
            <div className="bg-bg-card rounded-lg p-4">
              <div className="text-xs text-text-muted uppercase mb-2">Video</div>
              <a 
                href={ticket.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-accent-orange text-sm"
              >
                <Play size={16} /> View Video
              </a>
            </div>
          )}

          {/* Admin/Tech Controls */}
          {(isAdmin || isTechnician || isAccounting) && (
            <>
              {isAdmin && (
                <>
                  <div>
                    <label className="text-xs text-text-muted uppercase mb-1 block">Status</label>
                    <select
                      value={updates.status}
                      onChange={(e) => setUpdates(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-bg-primary border border-border rounded-lg py-2.5 px-3 text-text-primary text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="assessing">Assessing</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="invoiced">Invoiced</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-text-muted uppercase mb-1 block">Resolution Type</label>
                    <div className="flex gap-2">
                      {['telephonic', 'onsite'].map(type => (
                        <button
                          key={type}
                          onClick={() => setUpdates(p => ({ ...p, resolution_type: type }))}
                          className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize ${
                            updates.resolution_type === type 
                              ? 'border-accent-orange bg-accent-orange/15 text-accent-orange' 
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-muted uppercase mb-1 block">Assign Technician</label>
                    <select
                      value={updates.assigned_technician_id}
                      onChange={handleTechnicianSelect}
                      className="w-full bg-bg-primary border border-border rounded-lg py-2.5 px-3 text-text-primary text-sm"
                    >
                      <option value="">Select technician...</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted uppercase mb-1 block">Scheduled Date</label>
                      <input
                        type="date"
                        value={updates.scheduled_date}
                        onChange={(e) => setUpdates(p => ({ ...p, scheduled_date: e.target.value }))}
                        className="w-full bg-bg-primary border border-border rounded-lg py-2.5 px-3 text-text-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted uppercase mb-1 block">Time</label>
                      <input
                        type="time"
                        value={updates.scheduled_time}
                        onChange={(e) => setUpdates(p => ({ ...p, scheduled_time: e.target.value }))}
                        className="w-full bg-bg-primary border border-border rounded-lg py-2.5 px-3 text-text-primary text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-text-muted uppercase mb-1 block">Notes</label>
                <textarea
                  value={updates.notes}
                  onChange={(e) => setUpdates(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-bg-primary border border-border rounded-lg py-2.5 px-3 text-text-primary text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-accent-orange text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
              </button>
            </>
          )}

          {/* Job Card - Upload or View */}
          {ticket.job_card_url ? (
            <div className="bg-bg-card rounded-lg p-4">
              <div className="text-xs text-text-muted uppercase mb-2">Job Card</div>
              <a 
                href={ticket.job_card_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 text-sm"
                data-testid="view-jobcard-link"
              >
                <CheckCircle size={16} /> View Signed Job Card
              </a>
            </div>
          ) : (isTechnician || isAdmin) && !['invoiced', 'closed'].includes(ticket.status) ? (
            <JobCardUploader
              ticket={ticket}
              onUploaded={() => { onUpdated(); onClose(); }}
              getAuthHeader={getAuthHeader}
            />
          ) : null}

          {/* Invoice - Upload or View */}
          {ticket.invoice_url ? (
            <div className="bg-bg-card rounded-lg p-4">
              <div className="text-xs text-text-muted uppercase mb-2">Invoice</div>
              <div className="text-sm text-text-primary mb-1">#{ticket.invoice_number}</div>
              <a 
                href={ticket.invoice_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 text-sm"
                data-testid="view-invoice-link"
              >
                <FileText size={16} /> View Invoice
              </a>
            </div>
          ) : (isAccounting || isAdmin) && ['completed', 'in_progress'].includes(ticket.status) ? (
            <InvoiceUploader
              ticket={ticket}
              onUploaded={() => { onUpdated(); onClose(); }}
              getAuthHeader={getAuthHeader}
            />
          ) : null}

          {/* Meta */}
          <div className="text-xs text-text-muted pt-2 border-t border-border">
            <div>Created by: {ticket.created_by_name}</div>
            <div>Created: {new Date(ticket.created_at).toLocaleString('en-GB')}</div>
            {ticket.assigned_technician_name && (
              <div>Assigned to: {ticket.assigned_technician_name}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Tickets Page
export default function Tickets() {
  const { getAuthHeader, isAdmin, isTechnician, isStoreStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API}/tickets`, {
        headers: getAuthHeader()
      });
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter;
    const matchSearch = !search || 
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.store_name.toLowerCase().includes(search.toLowerCase()) ||
      t.issue_description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    open: tickets.filter(t => t.status === 'open').length,
    scheduled: tickets.filter(t => t.status === 'scheduled').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="page-content" data-testid="tickets-page">
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={fetchTickets} />}
      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onUpdated={fetchTickets}
        />
      )}

      <div className="page-header">
        <div className="page-header-title">Service Tickets</div>
        <div className="page-header-sub">
          {statusCounts.open} open · {statusCounts.scheduled} scheduled · {statusCounts.in_progress} in progress
        </div>
      </div>

      <div className="search-bar" data-testid="ticket-search">
        <Search size={16} />
        <input 
          placeholder="Search tickets..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        {search && <X size={16} className="cursor-pointer" onClick={() => setSearch('')} />}
      </div>

      <div className="filter-tabs" data-testid="status-filters">
        {[
          ['all', 'All'],
          ['open', `Open (${statusCounts.open})`],
          ['scheduled', 'Scheduled'],
          ['in_progress', 'In Progress'],
          ['completed', 'Completed']
        ].map(([value, label]) => (
          <button
            key={value}
            className={`filter-tab ${filter === value ? 'active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" data-testid="empty-tickets">
          <Wrench size={48} className="text-text-muted mx-auto mb-3" />
          <div className="empty-title">No Tickets</div>
          <div className="empty-desc">
            {filter === 'all' 
              ? 'No service tickets logged yet.' 
              : `No ${filter.replace('_', ' ')} tickets.`}
          </div>
        </div>
      ) : (
        filtered.map(ticket => {
          const statusInfo = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;
          return (
            <div
              key={ticket.id}
              className="mx-4 mb-2 bg-bg-card rounded-lg p-4 cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
              data-testid={`ticket-${ticket.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-mono text-sm text-accent-orange font-semibold">
                    {ticket.ticket_number}
                  </div>
                  <div className="text-sm font-semibold text-text-primary mt-0.5">
                    {ticket.store_name}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="text-xs text-text-muted line-clamp-2 mb-2">
                {ticket.issue_description}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(ticket.created_at).toLocaleDateString('en-GB')}
                </span>
                {ticket.video_url && (
                  <span className="flex items-center gap-1 text-accent-orange">
                    <Video size={12} /> Video
                  </span>
                )}
                {ticket.assigned_technician_name && (
                  <span className="flex items-center gap-1">
                    <User size={12} /> {ticket.assigned_technician_name}
                  </span>
                )}
                {ticket.scheduled_date && (
                  <span className="flex items-center gap-1 text-accent-blue">
                    <Calendar size={12} /> {ticket.scheduled_date}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* FAB - Show only for store staff or admin */}
      {(isStoreStaff || isAdmin) && (
        <button 
          className="fab" 
          onClick={() => setShowNew(true)}
          data-testid="new-ticket-fab"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
