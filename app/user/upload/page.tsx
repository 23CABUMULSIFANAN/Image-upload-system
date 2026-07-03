"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type OrgUser = {
  id: string;
  name: string;
  email: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (data.success) setOrgUsers(data.users);
      } catch {
        // ignore
      }
    };
    fetchUsers();
  }, []);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select an image to upload");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: get presigned URL from backend
      const presignRes = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const presignData = await presignRes.json();

      if (!presignData.success) {
        setError(presignData.message || "Failed to get upload URL");
        setSubmitting(false);
        return;
      }

      // Step 2: upload directly to S3 using the signed URL
      const s3Res = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!s3Res.ok) {
        setError("Failed to upload image to storage");
        setSubmitting(false);
        return;
      }

      // Step 3: save metadata + trigger notifications
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: presignData.publicUrl,
          fileName: file.name,
          description,
          tags: selectedTags,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Upload failed");
        if (data.quotaExceeded) {
          setTimeout(() => router.push("/user/dashboard"), 1500);
        }
        return;
      }

      setSuccess(`Uploaded! Remaining quota: ${data.remainingQuota}`);
      setFile(null);
      setDescription("");
      setSelectedTags([]);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Quota is checked automatically — if you're out of free slots, you'll be asked to purchase more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select Image</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tag Users (optional — leave empty to broadcast to everyone)</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {orgUsers.length === 0 && (
                <p className="text-sm text-gray-500">No other users found</p>
              )}
              {orgUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(u.id)}
                    onChange={() => toggleTag(u.id)}
                  />
                  {u.name} ({u.email})
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <Button className="w-full" onClick={handleUpload} disabled={submitting}>
            {submitting ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}