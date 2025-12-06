import { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Search,
  TrendingUp,
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
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TicketTemplatePicker = ({ onSelect, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

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

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'account', label: 'Account' },
    { value: 'feature_request', label: 'Feature' },
    { value: 'bug_report', label: 'Bug' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchTerm, selectedCategory, templates]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ticket-templates`, {
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

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/ticket-templates/${template._id}/usage`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Error recording usage:', error);
    }
    onSelect(template);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority] || colors.medium;
  };
  const renderIcon = (iconName, size = 24) => {
    const iconOption = iconOptions.find((opt) => opt.name === iconName);
    if (iconOption) {
      const IconComponent = iconOption.component;
      return <IconComponent size={size} />;
    }
    return <FileText size={size} />;
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-sm text-gray-600">Start with a pre-defined template</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No templates found</p>
              <button
                onClick={onClose}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
              >
                Create ticket from scratch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template._id}
                  onClick={() => handleSelectTemplate(template)}
                  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      {renderIcon(template.icon, 24)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      {template.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                          {template.category}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(template.priority)}`}>
                          {template.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} />
                        <span>Used {template.usageCount} times</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Or create ticket from scratch
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketTemplatePicker;
