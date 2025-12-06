import { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Archive, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const FileUpload = ({ ticketId, replyId, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (type === 'application/pdf') return <FileText size={20} className="text-red-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive size={20} className="text-yellow-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file) => {

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is too large. Max size is 10MB`);
      return false;
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-zip-compressed',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`${file.name} type is not allowed`);
      return false;
    }

    return true;
  };

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(validateFile);

    if (files.length + validFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    setFiles([...files, ...validFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('ticketId', ticketId);
      if (replyId) {
        formData.append('replyId', replyId);
      }

      const { data } = await api.post('/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${files.length} file(s) uploaded successfully`);
      setFiles([]);
      if (onUploadComplete) {
        onUploadComplete(data.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        />
        <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Maximum {MAX_FILES} files, up to 10MB each
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
        >
          Select Files
        </button>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Selected Files ({files.length}/{MAX_FILES})
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-destructive/20 rounded"
                disabled={uploading}
              >
                <X size={16} className="text-destructive" />
              </button>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload {files.length} File{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
