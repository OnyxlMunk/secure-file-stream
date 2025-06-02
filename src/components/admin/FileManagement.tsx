
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, HardDrive } from 'lucide-react';

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

  return (
    <div className="space-y-6">
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
