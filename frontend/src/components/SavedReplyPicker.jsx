import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SavedReplyPicker = ({ onSelect, ticketData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [savedReplies, setSavedReplies] = useState([]);
  const [filteredReplies, setFilteredReplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchSavedReplies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = savedReplies.filter(reply =>
        reply.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reply.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reply.shortcut && reply.shortcut.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredReplies(filtered);
    } else {
      setFilteredReplies(savedReplies);
    }
  }, [searchTerm, savedReplies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSavedReplies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/saved-replies`, {
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

  const replaceVariables = (content) => {
    if (!ticketData) return content;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const variables = {
      '{customer_name}': ticketData.createdBy?.name || 'Customer',
      '{ticket_id}': ticketData.ticketNumber || ticketData._id,
      '{agent_name}': user.name || 'Agent',
      '{ticket_title}': ticketData.title || '',
      '{department}': ticketData.department?.name || '',
      '{priority}': ticketData.priority || '',
      '{status}': ticketData.status?.name || ''
    };

    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });

    return result;
  };

  const handleSelectReply = async (reply) => {
    try {
      const processedContent = replaceVariables(reply.content);
      onSelect(processedContent);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/saved-replies/${reply._id}/usage`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      technical: 'bg-blue-100 text-blue-700',
      billing: 'bg-green-100 text-green-700',
      greeting: 'bg-yellow-100 text-yellow-700',
      closing: 'bg-purple-100 text-purple-700',
      escalation: 'bg-red-100 text-red-700',
      other: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Insert saved reply"
      >
        <MessageSquare size={16} />
        Saved Replies
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search saved replies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredReplies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No replies found' : 'No saved replies yet'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredReplies.map((reply) => (
                  <button
                    key={reply._id}
                    onClick={() => handleSelectReply(reply)}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{reply.title}</span>
                      <div className="flex gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(reply.category)}`}>
                          {reply.category}
                        </span>
                        {reply.shortcut && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-mono">
                            /{reply.shortcut}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{reply.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        Used {reply.usageCount} times
                      </span>
                      {reply.visibility !== 'private' && (
                        <span className="text-xs text-blue-500">
                          • {reply.visibility}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Tip: Variables like {'{customer_name}'} will be replaced automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedReplyPicker;
