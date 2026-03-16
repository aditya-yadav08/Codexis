"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
          headers: {
             Authorization: `Bearer ${session?.access_token}`
          }
        });
        const data = await res.json();
        setWorkspaceName(data.workspace_name || `${data.username}'s Workspace`);
        setDefaultBranch(data.default_branch || "main");
      } catch (err) {
        console.error("Fetch settings error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpdate = async () => {
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
          workspace_name: workspaceName,
          default_branch: defaultBranch
        })
      });
      if (res.ok) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to update settings.");
      }
    } catch (err) {
      console.error("Update settings error:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action is irreversible.")) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      if (res.ok) {
        toast.success("Account deleted.");
        await supabase.auth.signOut();
        router.push("/login");
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("An error occurred during deletion.");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-white/8 bg-white/4">
        <CardHeader>
          <CardTitle className="text-base font-semibold">General Settings</CardTitle>
          <CardDescription>
            Configure your application workspace and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name</label>
            <Input 
               value={workspaceName}
               onChange={(e) => setWorkspaceName(e.target.value)}
               placeholder="My Awesome Project" 
               className="rounded-xl bg-white/5 border-white/10 focus-visible:ring-indigo-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Branch</label>
            <Input 
               value={defaultBranch}
               onChange={(e) => setDefaultBranch(e.target.value)}
               placeholder="main" 
               className="rounded-xl bg-white/5 border-white/10 focus-visible:ring-indigo-500/50"
            />
          </div>
          <Button 
            onClick={handleUpdate}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 border-0 shadow-lg shadow-indigo-500/20"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-red-500/10 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-red-400/60">
            Irreversible actions that affect your entire account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDeleteAccount}
            variant="destructive" 
            className="rounded-xl bg-red-500 shadow-lg shadow-red-500/20"
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
