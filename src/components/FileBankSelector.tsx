
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus, Folder } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileBank {
  id: string;
  name: string;
  description: string | null;
}

interface FileBankSelectorProps {
  selectedBankId: string | null;
  onBankSelect: (bankId: string | null) => void;
  fileIds: string[];
}

const FileBankSelector: React.FC<FileBankSelectorProps> = ({
  selectedBankId,
  onBankSelect,
  fileIds
}) => {
  const [fileBanks, setFileBanks] = useState<FileBank[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
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
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      setFileBanks(data || []);
    } catch (error) {
      console.error('Error fetching file banks:', error);
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
          name: newBankName.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setFileBanks(prev => [...prev, data]);
      setNewBankName('');
      setIsCreateDialogOpen(false);
      onBankSelect(data.id);

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

  const addFilesToBank = async () => {
    if (!selectedBankId || fileIds.length === 0) return;

    try {
      const insertData = fileIds.map(fileId => ({
        file_bank_id: selectedBankId,
        encrypted_file_id: fileId
      }));

      const { error } = await supabase
        .from('file_bank_files')
        .insert(insertData);

      if (error) throw error;

      const selectedBank = fileBanks.find(bank => bank.id === selectedBankId);
      toast({
        title: "Files added to bank",
        description: `Added ${fileIds.length} file(s) to "${selectedBank?.name}"`,
      });
    } catch (error) {
      console.error('Error adding files to bank:', error);
      toast({
        title: "Error",
        description: "Failed to add files to bank",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedBankId || ""} onValueChange={onBankSelect}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select file bank" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No bank selected</SelectItem>
          {fileBanks.map((bank) => (
            <SelectItem key={bank.id} value={bank.id}>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                {bank.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File Bank</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your files
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-bank-name">Bank Name</Label>
              <Input
                id="new-bank-name"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="Enter bank name"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createFileBank} disabled={isLoading || !newBankName.trim()}>
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedBankId && fileIds.length > 0 && (
        <Button onClick={addFilesToBank} size="sm" variant="secondary">
          Add to Bank
        </Button>
      )}
    </div>
  );
};

export default FileBankSelector;
