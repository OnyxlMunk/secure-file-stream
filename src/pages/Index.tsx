import React, { useState } from 'react';
import { RetroButton } from '@/components/ui/retro-button';
import { NeomorphicCard, NeomorphicCardContent, NeomorphicCardHeader, NeomorphicCardTitle } from '@/components/ui/neomorphic-card';
import { useToast } from '@/hooks/use-toast';
import { FileDropZone } from '@/components/FileDropZone';
import { PasswordInput } from '@/components/PasswordInput';
import { FileList } from '@/components/FileList';
import { CryptoService } from '@/utils/crypto';
import { PasswordValidator } from '@/utils/passwordValidator';
import { ProcessedFile, OperationType } from '@/types/crypto';
import { Shield, Download, Zap, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import FileBankSelector from '@/components/FileBankSelector';
import { FloatingGraphics, RetroGraphicOverlay, OrganicDivider } from '@/components/ui/organic-graphics';

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

  const handleDownloadFile = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file || !file.result) return;

    try {
      let blob: Blob;
      let filename: string;

      if ('storagePath' in file.result) {
        // Download from storage and decrypt
        const decryptionResult = await CryptoService.downloadAndDecryptFile(
          file.result.storagePath,
          password
        );
        blob = new Blob([decryptionResult.decryptedData]);
        filename = decryptionResult.originalFilename;
      } else if ('encryptedData' in file.result) {
        // Legacy: create encrypted blob for download
        blob = CryptoService.createEncryptedBlob(
          file.result.encryptedData,
          file.result.iv,
          file.result.salt,
          file.result.filename
        );
        filename = `${file.originalFile.name}.encrypted`;
      } else {
        // Decrypted data
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
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download and decrypt file",
        variant: "destructive",
      });
    }
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
          // Encrypt and upload to storage
          const storageResult = await CryptoService.encryptAndUploadFile(
            file.originalFile,
            password,
            profile?.id!,
            selectedBankId || undefined,
            (progress) => {
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, progress } : f
              ));
            }
          );
          
          result = {
            ...storageResult,
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
                points_cost: 1,
                storage_path: storageResult.storagePath
              })
              .select()
              .single();

            if (dbError) {
              console.error('Error saving file record:', dbError);
            } else if (fileRecord) {
              processedFileIds.push(fileRecord.id);
              
              // Update file with encrypted file ID
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { 
                  ...f, 
                  encryptedFileId: fileRecord.id,
                  storagePath: storageResult.storagePath
                } : f
              ));

              // If a file bank is selected, add the file to it
              if (selectedBankId) {
                await supabase
                  .from('file_bank_files')
                  .insert({
                    file_bank_id: selectedBankId,
                    encrypted_file_id: fileRecord.id
                  });
              }
            }
          } catch (dbError) {
            console.error('Database error:', dbError);
          }
        } else {
          // Decrypt from uploaded file
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

  const completedFiles = files.filter(f => f.status === 'completed' && 'storagePath' in (f.result || {}));
  const encryptedFileIds = completedFiles.map(f => f.encryptedFileId).filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingGraphics />
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 space-y-8 relative z-10">
        {/* Welcome Section with Retro Graphics */}
        <RetroGraphicOverlay>
          <div className="text-center space-y-4 pt-8">
            <NeomorphicCard className="inline-block p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Lock className="h-12 w-12 text-retro-purple animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-retro-cyan to-retro-green rounded-full animate-float" />
                </div>
                <div>
                  <h2 className="text-2xl font-retro font-bold text-retro-purple">
                    WELCOME_BACK
                  </h2>
                  <p className="font-pixel text-retro-cyan">
                    {'>'} {profile?.full_name || 'USER'}
                  </p>
                </div>
              </div>
            </NeomorphicCard>
            
            <NeomorphicCard variant="inset" className="inline-block p-4">
              <div className="flex items-center justify-center gap-6 text-sm font-pixel">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-retro-cyan animate-pulse" />
                  <span className="text-retro-purple">POINTS: {profile?.points || 0}</span>
                </div>
                <span className="text-retro-pink">•</span>
                <span className="text-retro-green">PLAN: {profile?.subscription_tier || 'FREE'}</span>
              </div>
            </NeomorphicCard>
          </div>
        </RetroGraphicOverlay>

        <OrganicDivider />

        {/* Main Encryption Interface */}
        <NeomorphicCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-retro-pink/5 via-transparent to-retro-cyan/5 pointer-events-none" />
          
          <NeomorphicCardHeader>
            <NeomorphicCardTitle className="text-center flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-retro-purple animate-pulse" />
              SECURE_FILE_PROCESSOR
            </NeomorphicCardTitle>
          </NeomorphicCardHeader>
          
          <NeomorphicCardContent className="space-y-6 relative">
            {/* Enhanced File Drop Zone */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-retro-pink via-retro-purple to-retro-cyan rounded-lg opacity-20 animate-blob blur-xl" />
              <div className="relative">
                <FileDropZone 
                  onFilesSelected={handleFilesSelected} 
                  className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-neomorphic-inset border-0 hover:shadow-neomorphic-pressed transition-all duration-300"
                />
              </div>
            </div>

            {/* Enhanced Password Input */}
            <div className="relative">
              <label className="block text-sm font-pixel text-retro-purple mb-2">
                {'>'} ENCRYPTION_KEY
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Enter secure passphrase (12+ chars)..."
                className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-neomorphic-inset border-0 focus:shadow-neomorphic-pressed font-pixel"
              />
            </div>

            {/* Retro Action Buttons */}
            <div className="flex gap-4 justify-center">
              <RetroButton
                onClick={() => processFiles('encrypt')}
                disabled={isProcessing || !password || files.filter(f => f.status === 'pending').length === 0}
                variant="default"
                size="lg"
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-retro-pink to-retro-purple opacity-20 animate-pulse" />
                <Shield className="h-5 w-5" />
                ENCRYPT_FILES
                <span className="text-xs opacity-75">(1pt each)</span>
              </RetroButton>
              
              <RetroButton
                variant="cyber"
                onClick={() => processFiles('decrypt')}
                disabled={isProcessing || !password || files.filter(f => f.status === 'pending').length === 0}
                size="lg"
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-retro-cyan to-retro-green opacity-20 animate-pulse" />
                <Download className="h-5 w-5" />
                DECRYPT_FILES
                <span className="text-xs opacity-75">(1pt each)</span>
              </RetroButton>
            </div>

            {/* File Organization Section */}
            {completedFiles.length > 0 && (
              <>
                <OrganicDivider />
                <NeomorphicCard variant="inset" className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-pixel font-medium text-retro-purple">
                      {'>'} ORGANIZE_FILES
                    </h3>
                    <FileBankSelector
                      selectedBankId={selectedBankId}
                      onBankSelect={setSelectedBankId}
                      fileIds={encryptedFileIds}
                    />
                  </div>
                </NeomorphicCard>
              </>
            )}

            {/* Enhanced File List */}
            <FileList
              files={files}
              onRemoveFile={handleRemoveFile}
              onDownloadFile={handleDownloadFile}
            />
          </NeomorphicCardContent>
        </NeomorphicCard>

        {/* Enhanced Security Notice */}
        <NeomorphicCard variant="inset" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50" />
          <NeomorphicCardContent className="relative">
            <RetroGraphicOverlay>
              <div className="text-center mb-4">
                <h3 className="font-retro font-bold text-retro-purple text-lg mb-2">
                  SECURITY_PROTOCOL
                </h3>
                <div className="flex justify-center">
                  <div className="h-px w-24 bg-gradient-to-r from-retro-cyan via-retro-purple to-retro-pink" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-pixel text-sm">
                <div className="space-y-2">
                  <p className="text-retro-cyan">{'>'} Local browser encryption</p>
                  <p className="text-retro-green">{'>'} Secure Supabase storage</p>
                </div>
                <div className="space-y-2">
                  <p className="text-retro-pink">{'>'} Zero password transmission</p>
                  <p className="text-retro-purple">{'>'} AES-256-GCM + PBKDF2</p>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-xs font-pixel text-retro-cyan opacity-75">
                  {'>'} Each operation costs 1 point from your account
                </p>
              </div>
            </RetroGraphicOverlay>
          </NeomorphicCardContent>
        </NeomorphicCard>
      </div>
    </div>
  );
};

export default Index;
