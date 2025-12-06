import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';

const EscalationRules = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 0,
    conditions: {
      timeInStatus: '',
      statusId: '',
      priority: '',
      departmentId: '',
    },
    actions: [],
  });
  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchRules();
    fetchStatuses();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/escalations');
      setRules(data.data || []);
    } catch (error) {
      console.error('Failed to fetch escalation rules:', error);
      toast.error('Failed to load escalation rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const { data } = await api.get('/statuses');
      setStatuses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data.filter(u => u.role === 'admin' || u.role === 'agent') || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        priority: rule.priority || 0,
        conditions: rule.conditions,
        actions: rule.actions,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        priority: 0,
        conditions: {
          timeInStatus: '',
          statusId: '',
          priority: '',
          departmentId: '',
        },
        actions: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (formData.actions.length === 0) {
      toast.error('At least one action is required');
      return;
    }

    try {
      if (editingRule) {
        await api.put(`/escalations/${editingRule._id}`, formData);
        toast.success('Escalation rule updated successfully');
      } else {
        await api.post('/escalations', formData);
        toast.success('Escalation rule created successfully');
      }
      fetchRules();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save escalation rule:', error);
      toast.error(error.response?.data?.message || 'Failed to save escalation rule');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/escalations/${id}/toggle`);
      toast.success('Rule status updated');
      fetchRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      toast.error('Failed to update rule status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this escalation rule?')) {
      return;
    }

    try {
      await api.delete(`/escalations/${id}`);
      toast.success('Escalation rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Failed to delete escalation rule:', error);
      toast.error('Failed to delete escalation rule');
    }
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: 'changeStatus', value: '' }],
    });
  };

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index),
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Escalation Rules</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          <Plus size={20} />
          Create Rule
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] text-lg text-muted-foreground">
          Loading escalation rules...
        </div>
      ) : (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="bg-card p-12 rounded-lg shadow-sm border border-border text-center">
              <p className="text-muted-foreground mb-4">No escalation rules configured yet.</p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90"
              >
                Create Your First Rule
              </button>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule._id}
                className="bg-card p-6 rounded-lg shadow-sm border border-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{rule.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-muted-foreground mb-3">{rule.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(rule._id)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(rule)}
                      className="p-2 text-primary hover:text-primary/80 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      className="p-2 text-destructive hover:text-destructive/80 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Conditions:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {rule.conditions.timeInStatus && (
                        <li>• Time in status: {rule.conditions.timeInStatus} hours</li>
                      )}
                      {rule.conditions.statusId && (
                        <li>
                          • Status:{' '}
                          {statuses.find((s) => s._id === rule.conditions.statusId)?.title ||
                            'Unknown'}
                        </li>
                      )}
                      {rule.conditions.priority && (
                        <li>• Priority: {rule.conditions.priority}</li>
                      )}
                      {rule.conditions.departmentId && (
                        <li>
                          • Department:{' '}
                          {departments.find((d) => d._id === rule.conditions.departmentId)?.name ||
                            'Unknown'}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Actions:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {rule.actions.map((action, index) => (
                        <li key={index}>
                          • {action.type === 'changeStatus' && 'Change status to: '}
                          {action.type === 'assignTo' && 'Assign to: '}
                          {action.type === 'sendEmail' && 'Send email to: '}
                          {action.type === 'sendNotification' && 'Send notification to: '}
                          {action.type === 'changeStatus' &&
                            (statuses.find((s) => s._id === action.value)?.title || 'Unknown')}
                          {action.type === 'assignTo' &&
                            (users.find((u) => u._id === action.value)?.name || 'Unknown')}
                          {(action.type === 'sendEmail' || action.type === 'sendNotification') &&
                            action.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">
                {editingRule ? 'Edit Escalation Rule' : 'Create Escalation Rule'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Priority (higher runs first)
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Conditions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time in Status (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.conditions.timeInStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, timeInStatus: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={formData.conditions.statusId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, statusId: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                    >
                      <option value="">Any Status</option>
                      {statuses.map((status) => (
                        <option key={status._id} value={status._id}>
                          {status.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.conditions.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, priority: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                    >
                      <option value="">Any Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department
                    </label>
                    <select
                      value={formData.conditions.departmentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: { ...formData.conditions, departmentId: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-border rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                    >
                      <option value="">Any Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Actions <span className="text-destructive">*</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addAction}
                    className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90"
                  >
                    Add Action
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.actions.map((action, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(index, 'type', e.target.value)}
                        className="px-3 py-2 border-2 border-border rounded-md bg-background text-foreground"
                      >
                        <option value="changeStatus">Change Status</option>
                        <option value="assignTo">Assign To</option>
                        <option value="sendEmail">Send Email</option>
                        <option value="sendNotification">Send Notification</option>
                      </select>

                      {action.type === 'changeStatus' && (
                        <select
                          value={action.value}
                          onChange={(e) => updateAction(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-border rounded-md bg-background text-foreground"
                        >
                          <option value="">Select Status</option>
                          {statuses.map((status) => (
                            <option key={status._id} value={status._id}>
                              {status.title}
                            </option>
                          ))}
                        </select>
                      )}

                      {action.type === 'assignTo' && (
                        <select
                          value={action.value}
                          onChange={(e) => updateAction(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-border rounded-md bg-background text-foreground"
                        >
                          <option value="">Select User</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                      )}

                      {(action.type === 'sendEmail' || action.type === 'sendNotification') && (
                        <input
                          type="text"
                          value={action.value}
                          onChange={(e) => updateAction(index, 'value', e.target.value)}
                          placeholder="Enter recipient"
                          className="flex-1 px-3 py-2 border-2 border-border rounded-md bg-background text-foreground"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="p-2 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-muted text-foreground rounded-md font-semibold hover:bg-muted/80"
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

export default EscalationRules;
