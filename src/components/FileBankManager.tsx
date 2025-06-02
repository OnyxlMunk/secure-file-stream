
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Folder, FileText, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileBank {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  file_count?: number;
}

interface EncryptedFile {
  id: string;
  original_filename: string;
  encrypted_filename: string;
  file_size: number;
  encryption_date: string;
  points_cost: number;
}

const FileBankManager = () => {
  const [fileBanks, setFileBanks] = useState<FileBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<FileBank | null>(null);
  const [bankFiles, setBankFiles] = useState<EncryptedFile[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankDescription, setNewBankDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFileBanks();
  }, []);

  const fetchFileBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('file_banks')
        .select(`
          *,
          file_bank_files(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const banksWithCount = data.map(bank => ({
        ...bank,
        file_count: bank.file_bank_files?.[0]?.count || 0
      }));

      setFileBanks(banksWithCount);
    } catch (error) {
      console.error('Error fetching file banks:', error);
      toast({
        title: "Error",
        description: "Failed to load file banks",
        variant: "destructive",
      });
    }
  };

  const createFileBank = async () => {
    if (!newBankName.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_banks')
        .insert({
          user_id: profile?.id,
          name: newBankName.trim(),
          description: newBankDescription.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      setFileBanks(prev => [{ ...data, file_count: 0 }, ...prev]);
      setNewBankName('');
      setNewBankDescription('');
      setIsCreateDialogOpen(false);

      toast({
        title: "File bank created",
        description: `Created "${data.name}" successfully`,
      });
    } catch (error) {
      console.error('Error creating file bank:', error);
      toast({
        title: "Error",
        description: "Failed to create file bank",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFileBank = async (bankId: string) => {
    try {
      const { error } = await supabase
        .from('file_banks')
        .delete()
        .eq('id', bankId);

      if (error) throw error;

      setFileBanks(prev => prev.filter(bank => bank.id !== bankId));
      if (selectedBank?.id === bankId) {
        setSelectedBank(null);
        setBankFiles([]);
      }

      toast({
        title: "File bank deleted",
        description: "File bank and its contents have been removed",
      });
    } catch (error) {
      console.error('Error deleting file bank:', error);
      toast({
        title: "Error",
        description: "Failed to delete file bank",
        variant: "destructive",
      });
    }
  };

  const fetchBankFiles = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('file_bank_files')
        .select(`
          encrypted_files (
            id,
            original_filename,
            encrypted_filename,
            file_size,
            encryption_date,
            points_cost
          )
        `)
        .eq('file_bank_id', bankId);

      if (error) throw error;

      const files = data.map(item => item.encrypted_files).filter(Boolean);
      setBankFiles(files as EncryptedFile[]);
    } catch (error) {
      console.error('Error fetching bank files:', error);
      toast({
        title: "Error",
        description: "Failed to load files from bank",
        variant: "destructive",
      });
    }
  };

  const selectBank = (bank: FileBank) => {
    setSelectedBank(bank);
    fetchBankFiles(bank.id);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">File Banks</h2>
          <p className="text-muted-foreground">Organize your encrypted files into collections</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Create Bank
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New File Bank</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your encrypted files
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <Label htmlFor="bank-description">Description (Optional)</Label>
                <Textarea
                  id="bank-description"
                  value={newBankDescription}
                  onChange={(e) => setNewBankDescription(e.target.value)}
                  placeholder="Describe this file bank"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createFileBank} disabled={isLoading || !newBankName.trim()}>
                  {isLoading ? 'Creating...' : 'Create Bank'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* File Banks List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your File Banks</h3>
          {fileBanks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No file banks yet</p>
                <p className="text-sm text-muted-foreground">Create your first file bank to get started</p>
              </CardContent>
            </Card>
          ) : (
            fileBanks.map((bank) => (
              <Card 
                key={bank.id} 
                className={`cursor-pointer transition-colors ${
                  selectedBank?.id === bank.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => selectBank(bank)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{bank.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{bank.file_count} files</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFileBank(bank.id);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {bank.description && (
                    <CardDescription>{bank.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Selected Bank Files */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedBank ? `Files in "${selectedBank.name}"` : 'Select a Bank'}
          </h3>
          
          {!selectedBank ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a file bank to view its contents</p>
              </CardContent>
            </Card>
          ) : bankFiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No files in this bank yet</p>
                <p className="text-sm text-muted-foreground">Files will appear here after encryption</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bankFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{file.original_filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)} • {file.points_cost} points
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(file.encryption_date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileBankManager;
