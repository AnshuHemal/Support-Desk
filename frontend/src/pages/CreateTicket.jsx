import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Paperclip, FileText } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import TicketTemplatePicker from '../components/TicketTemplatePicker';

const CreateTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    department: '',
    tags: '',
  });

  useEffect(() => {
    fetchDepartments();
    if (location.state?.template) {
      handleTemplateSelect(location.state.template);
    }
  }, [location]);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.content,
      priority: template.priority.charAt(0).toUpperCase() + template.priority.slice(1),
      department: template.department?._id || '',
      tags: template.tags?.join(', ') || '',
    });
    setShowTemplatePicker(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }

    setLoading(true);
    try {
      const ticketData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      const response = await ticketService.createTicket(ticketData);
      setCreatedTicketId(response.data._id);
      toast.success('Ticket created successfully!');
      setShowFileUpload(true);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
      setLoading(false);
    }
  };

  const handleSkipFiles = () => {
    navigate(`/tickets/${createdTicketId}`);
  };

  const handleFilesUploaded = () => {
    navigate(`/tickets/${createdTicketId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Ticket</h1>
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground mt-1">
              Using template: <span className="font-medium">{selectedTemplate.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={20} />
            Use Template
          </button>
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Tickets
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        {!showFileUpload ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border-2 border-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground resize-none"
                placeholder="Detailed description of the issue..."
                required
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-foreground mb-2">
                Priority <span className="text-destructive">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground cursor-pointer"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-foreground mb-2">
                Department <span className="text-destructive">*</span>
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground cursor-pointer"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="tags" className="block text-sm font-semibold text-foreground mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                placeholder="Separate tags with commas (e.g., bug, urgent, login)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-6 py-3 bg-muted text-foreground rounded-md font-semibold hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-border">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Paperclip size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Add Attachments (Optional)
              </h2>
              <p className="text-muted-foreground">
                Upload screenshots, logs, or documents to help us resolve your issue faster
              </p>
            </div>

            <FileUpload
              ticketId={createdTicketId}
              onUploadComplete={handleFilesUploaded}
            />

            <div className="flex gap-4 pt-4 border-t border-border">
              <button
                onClick={handleFilesUploaded}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-all"
              >
                Continue to Ticket
              </button>
              <button
                onClick={handleSkipFiles}
                className="px-6 py-3 bg-muted text-foreground rounded-md font-semibold hover:bg-muted/80 transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      {showTemplatePicker && (
        <TicketTemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
};

export default CreateTicket;

