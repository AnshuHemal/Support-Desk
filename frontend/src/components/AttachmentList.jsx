import { useState } from 'react';
import { Download, Eye, Trash2, File, Image, FileText, Archive, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AttachmentList = ({ attachments, onDelete, canDelete = false }) => {
  const [deleting, setDeleting] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const getFileIcon = (category) => {
    switch (category) {
      case 'image':
        return <Image size={20} className="text-blue-500" />;
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      case 'archive':
        return <Archive size={20} className="text-yellow-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await api.get(`/attachments/${attachment._id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
  };

  const handleView = (attachment) => {
    if (attachment.category === 'image') {
      setPreviewImage(attachment);
    } else {
      window.open(`${api.defaults.baseURL}/attachments/${attachment._id}/view`, '_blank');
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setDeleting(attachmentId);
    try {
      await api.delete(`/attachments/${attachmentId}`);
      toast.success('File deleted');
      if (onDelete) {
        onDelete(attachmentId);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attachments
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment._id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(attachment.category)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {attachment.originalName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>•</span>
                  <span>{attachment.uploadedBy?.name}</span>
                  <span>•</span>
                  <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {attachment.category === 'image' && (
                <button
                  onClick={() => handleView(attachment)}
                  className="p-2 hover:bg-accent rounded"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
              )}
              <button
                onClick={() => handleDownload(attachment)}
                className="p-2 hover:bg-accent rounded"
                title="Download"
              >
                <Download size={16} />
              </button>
              {canDelete && (
                <button
                  onClick={() => handleDelete(attachment._id)}
                  disabled={deleting === attachment._id}
                  className="p-2 hover:bg-destructive/20 rounded disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-destructive" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
            <img
              src={`${api.defaults.baseURL}/attachments/${previewImage._id}/view`}
              alt={previewImage.originalName}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg">
              <p className="font-medium">{previewImage.originalName}</p>
              <p className="text-sm opacity-80">{formatFileSize(previewImage.size)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttachmentList;
