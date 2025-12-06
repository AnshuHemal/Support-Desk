import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  TrendingUp,
  Filter,
  FileText,
  Bug,
  Lightbulb,
  CreditCard,
  Key,
  Lock,
  Wrench,
  Download,
  Plug,
  Gauge,
  Shield,
  UserX,
  HelpCircle,
  Settings,
  Zap,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TicketTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    tags: '',
    visibility: 'private',
    department: '',
    isPublic: false,
    icon: '📋',
    color: '#3B82F6',
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'account', label: 'Account' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'general', label: 'General' },
    { value: 'other', label: 'Other' },
  ];

  const iconOptions = [
    { name: 'FileText', component: FileText },
    { name: 'Bug', component: Bug },
    { name: 'Lightbulb', component: Lightbulb },
    { name: 'CreditCard', component: CreditCard },
    { name: 'Key', component: Key },
    { name: 'Lock', component: Lock },
    { name: 'Wrench', component: Wrench },
    { name: 'Download', component: Download },
    { name: 'Plug', component: Plug },
    { name: 'Gauge', component: Gauge },
    { name: 'Shield', component: Shield },
    { name: 'UserX', component: UserX },
    { name: 'HelpCircle', component: HelpCircle },
    { name: 'Settings', component: Settings },
    { name: 'Zap', component: Zap },
    { name: 'Target', component: Target },
  ];
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#6366F1',
  ];
  const renderIcon = (iconName, size = 24, className = '') => {
    const iconOption = iconOptions.find((opt) => opt.name === iconName);
    if (iconOption) {
      const IconComponent = iconOption.component;
      return <IconComponent size={size} className={className} />;
    }
    return <FileText size={size} className={className} />;
  };

  useEffect(() => {
    fetchTemplates();
    fetchDepartments();
  }, [selectedCategory, searchTerm]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/ticket-templates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data);
      setFilteredTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        department: formData.visibility === 'department' ? formData.department : undefined,
      };

      if (editingTemplate) {
        await axios.put(`${API_URL}/ticket-templates/${editingTemplate._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/ticket-templates`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.message || 'Error saving template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/ticket-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/ticket-templates/${id}/duplicate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Error duplicating template');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/ticket-templates/${template._id}/usage`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate('/tickets/create', { state: { template } });
    } catch (error) {
      console.error('Error recording usage:', error);
      navigate('/tickets/create', { state: { template } });
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      title: template.title,
      content: template.content,
      category: template.category,
      priority: template.priority,
      tags: template.tags?.join(', ') || '',
      visibility: template.visibility,
      department: template.department?._id || '',
      isPublic: template.isPublic || false,
      icon: template.icon || '📋',
      color: template.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      tags: '',
      visibility: 'private',
      department: '',
      isPublic: false,
      icon: 'FileText',
      color: '#3B82F6',
    });
    setEditingTemplate(null);
  };

  const getVisibilityBadge = (visibility) => {
    const badges = {
      private: 'bg-gray-100 text-gray-800',
      department: 'bg-blue-100 text-blue-800',
      global: 'bg-green-100 text-green-800',
      public: 'bg-purple-100 text-purple-800',
    };
    return badges[visibility] || badges.private;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return badges[priority] || badges.medium;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Templates</h1>
          <p className="text-gray-600 mt-1">Create tickets faster with pre-defined templates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Template
        </button>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template._id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div
              className="h-2"
              style={{ backgroundColor: template.color || '#3B82F6' }}
            ></div>
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${template.color}20` }}
                >
                  {renderIcon(template.icon, 28, `text-[${template.color}]`)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getVisibilityBadge(
                        template.visibility
                      )}`}
                    >
                      {template.visibility}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(
                        template.priority
                      )}`}
                    >
                      {template.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Ticket Title:</p>
                <p className="text-sm text-gray-700 line-clamp-1">{template.title}</p>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>Used {template.usageCount} times</span>
                </div>
                {template.department && (
                  <span className="text-blue-600">{template.department.name}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  <FileText size={16} />
                  Use Template
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDuplicate(template._id)}
                  className="px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found. Create your first one!</p>
        </div>
      )}

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Password Reset Request"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.filter((c) => c.value !== 'all').map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of this template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Default title for tickets created from this template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Content *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Default content for tickets..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="password, reset, account"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <div className="flex gap-2 flex-wrap">
                        {iconOptions.map((iconOption) => (
                          <button
                            key={iconOption.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                            className={`p-2 rounded border-2 ${
                              formData.icon === iconOption.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {renderIcon(iconOption.name, 24)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-10 h-10 rounded border-2 ${
                              formData.color === color
                                ? 'border-gray-800 scale-110'
                                : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visibility
                      </label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="private">Private (Only Me)</option>
                        <option value="department">Department</option>
                        <option value="global">Global (All Users)</option>
                      </select>
                    </div>

                    {formData.visibility === 'department' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({ ...formData, department: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={formData.visibility === 'department'}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Make this template public (visible to non-authenticated users)
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingTemplate ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTemplates;
