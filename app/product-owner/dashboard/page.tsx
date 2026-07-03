"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Org = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  users: { id: string; name: string; email: string }[];
  _count: { users: number; images: number };
};

export default function ProductOwnerDashboard() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [createOpen, setCreateOpen] = useState(false);
  const [organisationName, setOrganisationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Org | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState("");

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organisation");
      const data = await res.json();
      if (data.success) {
        setOrgs(data.organisations);
      } else {
        setError(data.message || "Failed to load organisations");
      }
    } catch {
      setError("Something went wrong while loading organisations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreate = async () => {
    setCreateError("");

    if (!organisationName) {
      setCreateError("Organisation name is required");
      return;
    }
    if (!adminName) {
      setCreateError("Admin name is required");
      return;
    }
    if (!adminEmail || !adminEmail.includes("@")) {
      setCreateError("Valid admin email is required");
      return;
    }
    if (!password || password.length < 6) {
      setCreateError("Password must be at least 6 characters");
      return;
    }

    const res = await fetch("/api/organisation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organisationName, adminName, adminEmail, password }),
    });
    const data = await res.json();

    if (!data.success) {
      setCreateError(data.message || "Failed to create organisation");
      return;
    }

    setCreateOpen(false);
    setOrganisationName("");
    setAdminName("");
    setAdminEmail("");
    setPassword("");
    fetchOrgs();
  };

  const openEditDialog = (org: Org) => {
    setEditOrg(org);
    setEditName(org.name);
    setEditAddress(org.address || "");
    setEditPhone(org.phone || "");
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editOrg) return;
    setEditError("");

    const res = await fetch("/api/organisation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editOrg.id,
        name: editName,
        address: editAddress,
        phone: editPhone,
      }),
    });
    const data = await res.json();

    if (!data.success) {
      setEditError(data.message || "Failed to update organisation");
      return;
    }

    setEditOpen(false);
    fetchOrgs();
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "This will delete the organisation, all its users, images, payments and notifications. Continue?"
    );
    if (!confirmed) return;

    const res = await fetch(`/api/organisation?id=${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to delete organisation");
      return;
    }

    fetchOrgs();
  };

  return (
    <main className="min-h-screen bg-slate-50">
  <div className="max-w-7xl mx-auto p-8 space-y-8">

  
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Product Owner Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Manage organisations, admins and monitor uploads.
        </p>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Create Organisation
          </Button>
        </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organisation</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organisation Name</Label>
                <Input id="org-name" value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-name">Admin Name</Label>
                <Input id="admin-name" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {createError && <p className="text-red-500 text-sm">{createError}</p>}
            </div>

            <DialogFooter>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>



    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-500 text-sm">
          Total Organisations
        </p>

        <h2 className="text-4xl font-bold mt-2 text-slate-800">
          {orgs.length}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-500 text-sm">
          Total Users
        </p>

        <h2 className="text-4xl font-bold mt-2 text-green-600">
          {orgs.reduce((sum, org) => sum + org._count.users, 0)}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-500 text-sm">
          Total Images
        </p>

        <h2 className="text-4xl font-bold mt-2 text-blue-600">
          {orgs.reduce((sum, org) => sum + org._count.images, 0)}
        </h2>
      </div>

    </div>
      {loading && (
  <div className="bg-white rounded-xl shadow border p-10 text-center">
    <p className="text-gray-500">
      Loading organisations...
    </p>
  </div>
)}
      {error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-600">
      {error}
    </p>
  </div>
)}

      {!loading && !error && (
        <Card>
          <CardContent>
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.name}</TableCell>
                <TableCell>
                  {org.users[0] ? `${org.users[0].name} (${org.users[0].email})` : "—"}
                </TableCell>
                <TableCell>{org._count.users}</TableCell>
                <TableCell>{org._count.images}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(org)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(org.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No organisations yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organisation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-org-name">Name</Label>
              <Input id="edit-org-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-org-address">Address</Label>
              <Input id="edit-org-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-org-phone">Phone</Label>
              <Input id="edit-org-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            {editError && <p className="text-red-500 text-sm">{editError}</p>}
          </div>

          <DialogFooter>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </main>
  );
}