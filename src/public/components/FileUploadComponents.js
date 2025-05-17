// File upload related components
import { formatFileSize } from './constants.js';
import { uploadFile } from './SocketService.js';

// Single attached file component
export const AttachedFile = ({ file, onRemove }) => {
  return (
    <div
      className={`flex items-center px-3 py-1 text-sm rounded-full ${
        file.error ? 'bg-red-50 border border-red-200' :
        file.uploading ? 'bg-yellow-50 border border-yellow-200' :
        'bg-white'
      }`}
    >
      {file.uploading ? (
        <span className="animate-pulse mr-1">⏳</span>
      ) : file.error ? (
        <span className="mr-1">⚠️</span>
      ) : (
        <span className="mr-1">📄</span>
      )}

      <span className="truncate max-w-[120px]">{file.name}</span>
      <span className="ml-1 text-gray-500 text-xs">({formatFileSize(file.size)})</span>

      {file.uploading ? (
        <span className="ml-2 text-yellow-600 text-xs">Uploading...</span>
      ) : file.error ? (
        <span className="ml-2 text-red-600 text-xs" title={file.error}>Error</span>
      ) : null}

      <button
        className="ml-2 text-gray-500 hover:text-red-500"
        onClick={() => onRemove(file.id)}
        title="Remove file"
      >
        ✕
      </button>
    </div>
  );
};

// Attached files area component
export const AttachedFilesArea = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;
  
  return (
    <div className="p-2 border-t border-b bg-blue-50">
      <div className="text-xs font-semibold text-gray-600 mb-1">Attached Files:</div>
      <div className="flex flex-wrap gap-2">
        {files.map(file => (
          <AttachedFile 
            key={file.id} 
            file={file} 
            onRemove={onRemoveFile} 
          />
        ))}
      </div>
    </div>
  );
};

// File upload handler
export const useFileUpload = (addMessage) => {
  const [attachedFiles, setAttachedFiles] = React.useState([]);
  
  const handleFileUpload = async (e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    // Add temporary files to the UI while uploading
    const tempFiles = filesArray.map(file => ({
      id: `temp-${Math.random().toString(36).substring(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploading: true
    }));

    setAttachedFiles(prev => [...prev, ...tempFiles]);

    // Upload each file to the server
    for (const [index, file] of filesArray.entries()) {
      try {
        // Upload the file using the service
        const fileData = await uploadFile(file);

        // Replace the temporary file with the actual file metadata
        setAttachedFiles(prev => {
          const newFiles = [...prev];
          const tempIndex = newFiles.findIndex(f => f.id === tempFiles[index].id);

          if (tempIndex !== -1) {
            newFiles[tempIndex] = {
              id: fileData.fileId,
              name: fileData.fileName,
              size: fileData.fileSize,
              type: fileData.mimeType,
              originalName: fileData.originalName || fileData.fileName,
              uploading: false
            };
          }

          return newFiles;
        });

        console.log(`File uploaded successfully: ${fileData.fileName} (ID: ${fileData.fileId}, Size: ${formatFileSize(fileData.fileSize)})`);
      } catch (error) {
        // Update the file status to show the error
        setAttachedFiles(prev => {
          const newFiles = [...prev];
          const tempIndex = newFiles.findIndex(f => f.id === tempFiles[index].id);

          if (tempIndex !== -1) {
            newFiles[tempIndex] = {
              ...newFiles[tempIndex],
              uploading: false,
              error: error.message
            };
          }

          return newFiles;
        });

        if (addMessage) {
          addMessage('system', `Error uploading file ${file.name}: ${error.message}`);
        }
      }
    }
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const clearAttachedFiles = () => {
    setAttachedFiles([]);
  };

  return {
    attachedFiles,
    handleFileUpload,
    removeAttachedFile,
    clearAttachedFiles
  };
};