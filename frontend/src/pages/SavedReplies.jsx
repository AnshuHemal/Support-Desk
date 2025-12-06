import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, TrendingUp, Filter } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SavedReplies = () => {
  const [savedReplies, setSavedReplies] = useState([]);
  const [filteredReplies, setFilteredReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    shortcut: '',
    category: 'general',
    visibility: 'private',
    department: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'greeting', label: 'Greeting' },
    { value: 'closing', label: 'Closing' },
    { value: 'escalation', label: 'Escalation' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchSavedReplies();
    fetchDepartments();
  }, [selectedCategory, searchTerm]);

  const fetchSavedReplies = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/saved-replies?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedReplies(response.data);
      setFilteredReplies(response.data);
    } catch (error) {
      console.error('Error fetching saved replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
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
        shortcut: formData.shortcut || undefined,
        department: formData.visibility === 'department' ? formData.department : undefined
      };

      if (editingReply) {
        await axios.put(`${API_URL}/saved-replies/${editingReply._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/saved-replies`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      resetForm();
      fetchSavedReplies();
    } catch (error) {
      console.error('Error saving reply:', error);
      alert(error.response?.data?.message || 'Error saving reply');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this saved reply?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/saved-replies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSavedReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Error deleting reply');
    }
  };

  const handleCopy = async (reply) => {
    try {
      await navigator.clipboard.writeText(reply.content);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/saved-replies/${reply._id}/usage`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Reply copied to clipboard!');
      fetchSavedReplies(); // Refresh to update usage count
    } catch (error) {
      console.error('Error copying reply:', error);
    }
  };

  const handleEdit = (reply) => {
    setEditingReply(reply);
    setFormData({
      title: reply.title,
      content: reply.content,
      shortcut: reply.shortcut || '',
      category: reply.category,
      visibility: reply.visibility,
      department: reply.department?._id || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      shortcut: '',
      category: 'general',
      visibility: 'private',
      department: ''
    });
    setEditingReply(null);
  };

  const getVisibilityBadge = (visibility) => {
    const badges = {
      private: 'bg-gray-100 text-gray-800',
      department: 'bg-blue-100 text-blue-800',
      global: 'bg-green-100 text-green-800'
    };
    return badges[visibility] || badges.private;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Replies</h1>
          <p className="text-gray-600 mt-1">Manage your quick response templates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Reply
        </button>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search replies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReplies.map((reply) => (
          <div key={reply._id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{reply.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getVisibilityBadge(reply.visibility)}`}>
                    {reply.visibility}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    {reply.category}
                  </span>
                  {reply.shortcut && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-mono">
                      /{reply.shortcut}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{reply.content}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <TrendingUp size={14} />
                <span>Used {reply.usageCount} times</span>
              </div>
              {reply.department && (
                <span className="text-blue-600">{reply.department.name}</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(reply)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                onClick={() => handleEdit(reply)}
                className="px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(reply._id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReplies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No saved replies found. Create your first one!</p>
        </div>
      )}

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingReply ? 'Edit Saved Reply' : 'Create Saved Reply'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Welcome Message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your reply template..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use variables like {'{customer_name}'}, {'{ticket_id}'}, {'{agent_name}'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shortcut (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.shortcut}
                        onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., welcome"
                      />
                      <p className="text-xs text-gray-500 mt-1">Type /shortcut to use</p>
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
                        {categories.filter(c => c.value !== 'all').map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
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
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={formData.visibility === 'department'}
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingReply ? 'Update' : 'Create'}
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

export default SavedReplies;
