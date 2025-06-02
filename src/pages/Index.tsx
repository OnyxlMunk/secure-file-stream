
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDropZone } from '@/components/FileDropZone';
import { PasswordInput } from '@/components/PasswordInput';
import { FileList } from '@/components/FileList';
import { CryptoService } from '@/utils/crypto';
import { PasswordValidator } from '@/utils/passwordValidator';
import { ProcessedFile, OperationType } from '@/types/crypto';
import { Shield, Download } from 'lucide-react';

const Index = () => {
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles: ProcessedFile[] = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      originalFile: file,
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Files added",
      description: `${selectedFiles.length} file(s) ready for processing`,
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDownloadFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file || !file.result) return;

    let blob: Blob;
    let filename: string;

    if ('encryptedData' in file.result) {
      // Encrypted file
      blob = CryptoService.createEncryptedBlob(
        file.result.encryptedData,
        file.result.iv,
        file.result.salt,
        file.result.filename
      );
      filename = `${file.originalFile.name}.encrypted`;
    } else {
      // Decrypted file
      blob = new Blob([file.result.decryptedData]);
      filename = file.result.filename;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `Downloading ${filename}`,
    });
  };

  const processFiles = async (operation: OperationType) => {
    const validation = PasswordValidator.validate(password);
    if (!validation.isValid) {
      toast({
        title: "Invalid password",
        description: "Please fix password requirements",
        variant: "destructive",
      });
      return;
    }

    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast({
        title: "No files to process",
        description: "Please add files first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    for (const file of pendingFiles) {
      try {
        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'processing' as const, progress: 0 } : f
        ));

        let result;

        if (operation === 'encrypt') {
          const encryptionResult = await CryptoService.encryptFile(
            file.originalFile,
            password,
            (progress) => {
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, progress } : f
              ));
            }
          );
          
          result = {
            ...encryptionResult,
            filename: file.originalFile.name,
          };
        } else {
          // Decrypt
          const parsedFile = await CryptoService.parseEncryptedFile(file.originalFile);
          const decryptedData = await CryptoService.decryptFile(
            parsedFile.encryptedData,
            password,
            parsedFile.iv,
            parsedFile.salt,
            (progress) => {
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, progress } : f
              ));
            }
          );
          
          result = {
            decryptedData,
            filename: parsedFile.originalFilename,
          };
        }

        // Update status to completed
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'completed' as const, 
            progress: 100,
            result 
          } : f
        ));

      } catch (error) {
        console.error(`Error processing file ${file.originalFile.name}:`, error);
        
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Processing failed'
          } : f
        ));

        toast({
          title: "Processing failed",
          description: `Failed to ${operation} ${file.originalFile.name}`,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
    
    const completedCount = files.filter(f => f.status === 'completed').length;
    if (completedCount > 0) {
      toast({
        title: `${operation === 'encrypt' ? 'Encryption' : 'Decryption'} complete`,
        description: `${completedCount} file(s) processed successfully`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Secure File Encryption</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encrypt and decrypt your files securely using AES-256-GCM encryption. 
            All processing happens locally in your browser - your files never leave your device.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* File Drop Zone */}
          <FileDropZone onFilesSelected={handleFilesSelected} />

          {/* Password Input */}
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter a strong password (12+ characters)"
          />

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => processFiles('encrypt')}
              disabled={isProcessing || !password || files.filter(f => f.status === 'pending').length === 0}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Encrypt Files
            </Button>
            
            <Button
              variant="outline"
              onClick={() => processFiles('decrypt')}
              disabled={isProcessing || !password || files.filter(f => f.status === 'pending').length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Decrypt Files
            </Button>
          </div>

          {/* File List */}
          <FileList
            files={files}
            onRemoveFile={handleRemoveFile}
            onDownloadFile={handleDownloadFile}
          />
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Security Notice</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All encryption/decryption happens locally in your browser</li>
            <li>• Your files and passwords are never sent to any server</li>
            <li>• Uses AES-256-GCM encryption with PBKDF2 key derivation</li>
            <li>• Remember your password - it cannot be recovered if lost</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
