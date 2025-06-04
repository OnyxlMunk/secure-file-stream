import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RetroButton } from '@/components/ui/retro-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { RetroGraphicOverlay, OrganicDivider } from '@/components/ui/organic-graphics';

interface ProfileFormData {
  full_name: string;
  bio: string;
  phone: string;
  timezone: string;
}

const ProfileInfo = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      timezone: profile?.timezone || 'UTC'
    }
  });

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          bio: data.bio,
          phone: data.phone,
          timezone: data.timezone,
          profile_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <RetroGraphicOverlay>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 shadow-neomorphic-outset border-4 border-gradient-to-r from-retro-pink to-retro-purple">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
              <AvatarFallback className="text-lg font-retro bg-gradient-to-br from-retro-cyan to-retro-green text-black">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {/* Floating graphics around avatar */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-retro-pink to-retro-purple rounded-full animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-retro-cyan to-retro-green transform rotate-45 animate-float" />
          </div>
          
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <RetroButton type="button" variant="cyber" disabled={uploading} asChild>
                <span>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'UPLOADING...' : 'UPLOAD_AVATAR'}
                </span>
              </RetroButton>
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-sm text-retro-cyan mt-2 font-pixel">
              {'>'} JPG, PNG, or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </RetroGraphicOverlay>

      <OrganicDivider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-pixel text-retro-purple">EMAIL_ADDRESS</Label>
          <Input 
            id="email" 
            value={user?.email || ''} 
            disabled 
            className="bg-gradient-to-r from-gray-100 to-gray-200 shadow-neomorphic-inset font-pixel border-0 focus:shadow-neomorphic-pressed"
          />
          <p className="text-xs text-retro-cyan font-pixel">
            {'>'} Email cannot be changed here. Use Security settings to update.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name" className="font-pixel text-retro-purple">FULL_NAME</Label>
          <Input
            id="full_name"
            className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-neomorphic-inset font-pixel border-0 focus:shadow-neomorphic-pressed"
            {...register('full_name', { required: 'Full name is required' })}
          />
          {errors.full_name && (
            <p className="text-sm text-retro-pink font-pixel">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="font-pixel text-retro-purple">PHONE_NUMBER</Label>
          <Input
            id="phone"
            type="tel"
            className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-neomorphic-inset font-pixel border-0 focus:shadow-neomorphic-pressed"
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="font-pixel text-retro-purple">TIMEZONE</Label>
          <Input
            id="timezone"
            className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-neomorphic-inset font-pixel border-0 focus:shadow-neomorphic-pressed"
            {...register('timezone')}
            placeholder="UTC"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="font-pixel text-retro-purple">BIO_DATA</Label>
        <Textarea
          id="bio"
          className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-neomorphic-inset font-pixel border-0 focus:shadow-neomorphic-pressed resize-none"
          {...register('bio')}
          placeholder="{'>'} Tell us about yourself..."
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <RetroButton type="submit" disabled={saving} variant="default" size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              SAVING...
            </>
          ) : (
            'SAVE_CHANGES'
          )}
        </RetroButton>
      </div>
    </form>
  );
};

export default ProfileInfo;
