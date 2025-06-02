
import React from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProcessedFile } from '@/types/crypto';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: ProcessedFile[];
  onRemoveFile: (id: string) => void;
  onDownloadFile: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onDownloadFile,
}) => {
  const getStatusIcon = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Files</h3>
      
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'p-4 border rounded-lg transition-colors',
              file.status === 'error' ? 'border-red-200 bg-red-50' :
              file.status === 'completed' ? 'border-green-200 bg-green-50' :
              'border-gray-200'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(file.status)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.originalFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.originalFile.size)}
                  </p>
                  
                  {file.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(file.progress)}% complete
                      </p>
                    </div>
                  )}
                  
                  {file.error && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                {file.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadFile(file.id)}
                  >
                    Download
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveFile(file.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
