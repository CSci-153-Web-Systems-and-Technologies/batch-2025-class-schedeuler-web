// app/(authenticated)/instructor/profile/page.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/Avatar";
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/app/context/ToastContext';
import { User, Mail, BadgeCheck, Loader2, Save, Camera, Trash2 } from 'lucide-react';
import { useUser } from '@/app/context/UserContext'; 

export default function InstructorProfilePage() {
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  
  // Use global context for instant updates
  const { profile, loading, refreshProfile } = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { showToast } = useToast();

  // Sync local state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

  // --- HANDLE AVATAR UPLOAD ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const bucketName = 'avatars'; // Assuming your bucket is named 'avatars'

      // 1. Upload new image
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // 3. Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      showToast("Success", "Profile picture updated!", "success");
      
      // 4. Update global state
      await refreshProfile(); 

    } catch (error: any) {
      showToast("Error", error.message || "Error uploading avatar", "error");
    } finally {
      setUploading(false);
    }
  };

  // --- HANDLE REMOVE AVATAR ---
  const handleRemoveAvatar = async () => {
    if (!profile) return;
    try {
        setUploading(true);

        // 1. Update profile to remove avatar URL
        const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', profile.id);

        if (error) throw error;

        showToast("Removed", "Profile photo removed.", "success");
        
        // 2. Update global state
        await refreshProfile();

    } catch (error: any) {
        showToast("Error", "Failed to remove photo.", "error");
    } finally {
        setUploading(false);
    }
  };

  // --- HANDLE NAME UPDATE ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile.id);

    setUpdating(false);

    if (error) {
      showToast("Error", "Failed to update profile.", "error");
    } else {
      showToast("Success", "Profile updated successfully.", "success");
      await refreshProfile();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-main-bg)]">
        <Loader2 className="animate-spin text-[var(--color-text-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-12" style={{ backgroundColor: "var(--color-main-bg)" }}>
      <AppBreadcrumb />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>My Profile</h1>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card className="h-fit bg-[var(--color-components-bg)] border-[var(--color-border)]">
            <CardContent className="flex flex-col items-center pt-6 text-center">
              
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-32 w-32 mb-4 border-4 border-[var(--color-components-bg)] shadow-lg transition-opacity group-hover:opacity-80">
                  <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                  <Camera className="text-white h-8 w-8" />
                </div>
                
                {uploading && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full mb-4">
                     <Loader2 className="animate-spin text-white h-8 w-8" />
                   </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>{name}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] capitalize mb-4">{profile?.account_type || 'Instructor'}</p>
              
              <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                >
                    Change Photo
                </Button>

                {/* [NEW] Remove Photo Button - Only shows if avatar exists */}
                {profile?.avatar_url && (
                    <Button 
                        variant="outline"
                        size="icon"
                        onClick={handleRemoveAvatar}
                        disabled={uploading}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:border-red-900/50 dark:hover:bg-red-900/20"
                        title="Remove Photo"
                    >
                        <Trash2 size={18} />
                    </Button>
                )}
              </div>

            </CardContent>
          </Card>

          <Card className="bg-[var(--color-components-bg)] border-[var(--color-border)]">
            <CardHeader>
              <CardTitle style={{ color: "var(--color-text-primary)" }}>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label style={{ color: "var(--color-text-primary)" }}>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 bg-[var(--color-bar-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label style={{ color: "var(--color-text-primary)" }}>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={profile?.email || ''} 
                      disabled 
                      className="pl-9 bg-muted/50 border-[var(--color-border)] text-[var(--color-muted-fg)] cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label style={{ color: "var(--color-text-primary)" }}>Account Role</Label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={profile?.account_type?.toUpperCase() || ''} 
                      disabled 
                      className="pl-9 bg-muted/50 border-[var(--color-border)] text-[var(--color-muted-fg)] cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="bg-[var(--color-primary)] text-white hover:opacity-90"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}