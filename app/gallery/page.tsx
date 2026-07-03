"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GalleryImage = {
  id: string;
  imageUrl: string;
  fileName: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  uploadedBy: { id: string; name: string; email: string };
};

type OrgUser = {
  id: string;
  name: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchImages = async (tag: string) => {
    setLoading(true);
    setError("");
    try {
      const url =
        tag && tag !== "all"
          ? `/api/gallery?tag=${tag}`
          : "/api/gallery";
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setImages(data.images);
        setOrgUsers(data.orgUsers);
      } else {
        setError(data.message || "Failed to load gallery");
      }
    } catch {
      setError("Something went wrong while loading the gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(tagFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilter]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Organisation Gallery
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              All images uploaded by users in your organisation.
            </p>
          </div>

          <div className="w-full md:w-64">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tagged user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All images</SelectItem>
                {orgUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    Tagged: {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && <p className="text-slate-500">Loading gallery...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {images.length === 0 && (
              <p className="text-slate-500 col-span-full text-center py-10">
                No images found.
              </p>
            )}

            {images.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <img
                  src={img.imageUrl}
                  alt={img.fileName}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <CardHeader>
                  <CardTitle className="text-base truncate">{img.fileName}</CardTitle>
                  <CardDescription>
                    By {img.uploadedBy.name} · {new Date(img.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                {img.description && (
                  <CardContent className="text-sm text-slate-600 pt-0">
                    {img.description}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
