"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
          headers: {
             Authorization: `Bearer ${session?.access_token}`
          }
        });
        const data = await res.json();
        setUser(data);
        setFullName(data.full_name || data.username || "");
        setBio(data.bio || "");
        setAvatar(data.avatar || session.user.user_metadata?.avatar_url || null);
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpdate = async (updates: any = {}) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          bio: bio,
          ...updates
        })
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
        return true;
      } else {
        toast.error("Failed to update profile.");
        return false;
      }
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("An error occurred while saving.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update DB
      const success = await handleUpdate({ avatar: publicUrl });
      if (success) {
        setAvatar(publicUrl);
        toast.success("Avatar updated!");
      }

    } catch (error: any) {
      toast.error(error.message || "Error uploading avatar");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

  const initials = (fullName || user?.username || "?")
    .split(/[\s-]+/)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <Card className="border-white/8 bg-white/4">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Profile Information</CardTitle>
          <CardDescription>
            Update your public profile details and how people see you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4">
            <div className="size-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-indigo-500/20 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={fullName} className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                  asChild
                >
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    {uploading ? "Uploading..." : "Change Avatar"}
                  </label>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
               className="rounded-xl bg-white/5 border-white/10 focus-visible:ring-indigo-500/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input 
               defaultValue={user?.email || user?.username}
               disabled
               className="rounded-xl bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea 
               value={bio}
               onChange={(e) => setBio(e.target.value)}
               placeholder="Tell us about yourself..." 
               className="rounded-xl bg-white/5 border-white/10 focus-visible:ring-indigo-500/50 min-h-[100px]"
            />
          </div>

          <Button 
            onClick={() => handleUpdate()}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 border-0 shadow-lg shadow-indigo-500/20"
          >
            {saving ? "Saving..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
