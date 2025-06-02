
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import FileBankSelector from '@/components/FileBankSelector';

const Index = () => {
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();

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
      blob = CryptoService.createEncryptedBlob(
        file.result.encryptedData,
        file.result.iv,
        file.result.salt,
        file.result.filename
      );
      filename = `${file.originalFile.name}.encrypted`;
    } else {
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

  const checkPoints = (operation: OperationType, fileCount: number) => {
    const pointsNeeded = fileCount;
    const currentPoints = profile?.points || 0;
    
    if (currentPoints < pointsNeeded) {
      toast({
        title: "Insufficient points",
        description: `You need ${pointsNeeded} points but only have ${currentPoints}. Upgrade your plan for more points.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const deductPoints = async (operation: OperationType, fileCount: number) => {
    try {
      const pointsUsed = fileCount;
      
      // Update user points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: (profile?.points || 0) - pointsUsed })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile?.id,
          type: operation,
          points_change: -pointsUsed,
          description: `${operation} ${fileCount} file(s)`
        });

      if (transactionError) throw transactionError;

      // Refresh profile to update points display
      await refreshProfile();

      toast({
        title: "Points deducted",
        description: `Used ${pointsUsed} points for ${operation}`,
      });

    } catch (error) {
      console.error('Error deducting points:', error);
      toast({
        title: "Error",
        description: "Failed to deduct points",
        variant: "destructive",
      });
    }
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

    // Check if user has enough points
    if (!checkPoints(operation, pendingFiles.length)) {
      return;
    }

    setIsProcessing(true);

    // Deduct points before processing
    await deductPoints(operation, pendingFiles.length);

    // Store file IDs for potential bank assignment
    const processedFileIds: string[] = [];

    for (const file of pendingFiles) {
      try {
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

          // Save encrypted file record to database
          try {
            const { data: fileRecord, error: dbError } = await supabase
              .from('encrypted_files')
              .insert({
                user_id: profile?.id,
                original_filename: file.originalFile.name,
                encrypted_filename: `${file.originalFile.name}.encrypted`,
                file_size: file.originalFile.size,
                points_cost: 1
              })
              .select()
              .single();

            if (dbError) {
              console.error('Error saving file record:', dbError);
            } else if (fileRecord) {
              processedFileIds.push(fileRecord.id);
            }
          } catch (dbError) {
            console.error('Database error:', dbError);
          }
        } else {
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

  const completedFiles = files.filter(f => f.status === 'completed' && 'encryptedData' in (f.result || {}));
  const encryptedFileIds = completedFiles.map(f => f.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-4 pt-8">
          <h2 className="text-2xl font-bold">
            Welcome back, {profile?.full_name || 'User'}!
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Points: {profile?.points || 0}</span>
            <span>•</span>
            <span>Plan: {profile?.subscription_tier || 'Free'}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <FileDropZone onFilesSelected={handleFilesSelected} />

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter a strong password (12+ characters)"
          />

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => processFiles('encrypt')}
              disabled={isProcessing || !password || files.filter(f => f.status === 'pending').length === 0}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Encrypt Files (1 point each)
            </Button>
            
            <Button
              variant="outline"
              onClick={() => processFiles('decrypt')}
              disabled={isProcessing || !password || files.filter(f => f.status === 'pending').length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Decrypt Files (1 point each)
            </Button>
          </div>

          {/* File Bank Selector */}
          {completedFiles.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Organize Files</h3>
                <FileBankSelector
                  selectedBankId={selectedBankId}
                  onBankSelect={setSelectedBankId}
                  fileIds={encryptedFileIds}
                />
              </div>
            </div>
          )}

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
            <li>• Each operation costs 1 point from your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
