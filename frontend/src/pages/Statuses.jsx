import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Statuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    color: '#3B82F6',
    includeInActive: true,
    autoClose: false,
    autoCloseAfterDays: 7,
    order: 0,
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/statuses');
      setStatuses(data.data);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      toast.error('Failed to load statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStatus) {
        await api.put(`/statuses/${editingStatus._id}`, formData);
        toast.success('Status updated successfully');
      } else {
        await api.post('/statuses', formData);
        toast.success('Status created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchStatuses();
    } catch (error) {
      console.error('Failed to save status:', error);
      toast.error(error.response?.data?.message || 'Failed to save status');
    }
  };

  const handleEdit = (status) => {
    if (status.isSystem) {
      toast.error('Cannot edit system status');
      return;
    }
    setEditingStatus(status);
    setFormData({
      title: status.title,
      color: status.color,
      includeInActive: status.includeInActive,
      autoClose: status.autoClose,
      autoCloseAfterDays: status.autoCloseAfterDays || 7,
      order: status.order,
    });
    setShowModal(true);
  };

  const handleDelete = async (status) => {
    if (status.isSystem) {
      toast.error('Cannot delete system status');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this status?')) return;

    try {
      await api.delete(`/statuses/${status._id}`);
      toast.success('Status deleted successfully');
      fetchStatuses();
    } catch (error) {
      console.error('Failed to delete status:', error);
      toast.error('Failed to delete status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      color: '#3B82F6',
      includeInActive: true,
      autoClose: false,
      autoCloseAfterDays: 7,
      order: 0,
    });
    setEditingStatus(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Statuses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm"
        >
          <Plus size={20} />
          Add Status
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] text-lg text-muted-foreground">
          Loading statuses...
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b-2 border-border">
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Order</th>
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Title</th>
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Color</th>
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Active</th>
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Auto Close</th>
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Type</th>
                  <th className="px-4 py-4 text-left font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((status) => (
                  <tr key={status._id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="px-4 py-4 text-muted-foreground">{status.order}</td>
                    <td className="px-4 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white inline-block"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.title}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm text-muted-foreground">{status.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                        status.includeInActive
                          ? 'bg-chart-1/20 text-chart-1'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {status.includeInActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {status.autoClose ? `${status.autoCloseAfterDays} days` : 'No'}
                    </td>
                    <td className="px-4 py-4">
                      {status.isSystem && (
                        <span className="flex items-center gap-1 w-fit px-2 py-1 bg-muted text-muted-foreground rounded-sm text-xs font-semibold">
                          <Lock size={12} />
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(status)}
                          disabled={status.isSystem}
                          className={`p-2 rounded-md transition-colors ${
                            status.isSystem
                              ? 'text-muted-foreground cursor-not-allowed'
                              : 'text-primary hover:bg-primary/10'
                          }`}
                          title={status.isSystem ? 'Cannot edit system status' : 'Edit'}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(status)}
                          disabled={status.isSystem}
                          className={`p-2 rounded-md transition-colors ${
                            status.isSystem
                              ? 'text-muted-foreground cursor-not-allowed'
                              : 'text-destructive hover:bg-destructive/10'
                          }`}
                          title={status.isSystem ? 'Cannot delete system status' : 'Delete'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">
                {editingStatus ? 'Edit Status' : 'Add Status'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Color *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 border-2 border-border rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#3B82F6"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeInActive"
                  checked={formData.includeInActive}
                  onChange={(e) => setFormData({ ...formData, includeInActive: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="includeInActive" className="text-sm text-foreground">
                  Include in active tickets
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoClose"
                  checked={formData.autoClose}
                  onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="autoClose" className="text-sm text-foreground">
                  Auto-close tickets
                </label>
              </div>

              {formData.autoClose && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Auto-close after (days)
                  </label>
                  <input
                    type="number"
                    value={formData.autoCloseAfterDays}
                    onChange={(e) => setFormData({ ...formData, autoCloseAfterDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    min="1"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-all"
                >
                  {editingStatus ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md font-semibold hover:bg-muted/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statuses;
