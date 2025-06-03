
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, HardDrive, Cloud } from 'lucide-react';

const FileManagement = () => {
  const { data: files, isLoading } = useQuery({
    queryKey: ['admin-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('encrypted_files')
        .select(`
          *,
          file_bank_files (
            file_banks (
              name,
              user_id,
              profiles!file_banks_user_id_fkey (
                email,
                full_name
              )
            )
          )
        `)
        .order('encryption_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: fileBanks, isLoading: isLoadingBanks } = useQuery({
    queryKey: ['admin-file-banks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_banks')
        .select(`
          *,
          profiles!file_banks_user_id_fkey (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: storageStats } = useQuery({
    queryKey: ['admin-storage-stats'],
    queryFn: async () => {
      const { data: storageFiles, error } = await supabase.storage
        .from('encrypted-files')
        .list('', { limit: 1000 });

      if (error) {
        console.error('Error fetching storage stats:', error);
        return { totalFiles: 0, totalSize: 0 };
      }

      // Calculate storage statistics
      const totalFiles = storageFiles?.length || 0;
      const totalSize = storageFiles?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

      return { totalFiles, totalSize };
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || isLoadingBanks) {
    return <div className="animate-pulse">Loading files...</div>;
  }

  const storageFiles = files?.filter(file => file.storage_path) || [];
  const legacyFiles = files?.filter(file => !file.storage_path) || [];

  return (
    <div className="space-y-6">
      {/* Storage Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Storage Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageFiles.length}</div>
            <p className="text-xs text-muted-foreground">Files in Supabase Storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Legacy Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{legacyFiles.length}</div>
            <p className="text-xs text-muted-foreground">Files in database metadata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(storageStats?.totalSize || 0)}</div>
            <p className="text-xs text-muted-foreground">Used storage space</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            File Management
          </CardTitle>
          <CardDescription>
            Monitor and manage encrypted files and file banks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">File Banks</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileBanks?.map((bank) => (
                    <TableRow key={bank.id}>
                      <TableCell className="font-medium">{bank.name}</TableCell>
                      <TableCell>{bank.profiles?.email || 'Unknown'}</TableCell>
                      <TableCell>
                        {new Date(bank.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Encrypted Files</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Storage Type</TableHead>
                    <TableHead>File Bank</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files?.map((file) => {
                    const fileBank = file.file_bank_files?.[0]?.file_banks;
                    return (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">{file.original_filename}</TableCell>
                        <TableCell>
                          <Badge variant={file.storage_path ? "default" : "secondary"}>
                            {file.storage_path ? "Storage" : "Legacy"}
                          </Badge>
                        </TableCell>
                        <TableCell>{fileBank?.name || 'Direct Upload'}</TableCell>
                        <TableCell>{fileBank?.profiles?.email || 'Unknown'}</TableCell>
                        <TableCell>{formatFileSize(file.file_size || 0)}</TableCell>
                        <TableCell>
                          {new Date(file.encryption_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileManagement;
