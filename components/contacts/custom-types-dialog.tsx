"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Save, X, Settings } from "lucide-react";
import { 
  getCustomContactTypes, 
  createCustomContactType, 
  updateCustomContactType, 
  deleteCustomContactType,
  CustomContactType
} from "@/lib/custom-contact-types-actions";

interface CustomTypesDialogProps {
  onTypesChanged?: () => void;
}

export function CustomTypesDialog({ onTypesChanged }: CustomTypesDialogProps) {
  const [open, setOpen] = useState(false);
  const [customTypes, setCustomTypes] = useState<CustomContactType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomContactType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form states
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [editTypeLabel, setEditTypeLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCustomTypes = async () => {
    try {
      setLoading(true);
      const types = await getCustomContactTypes();
      setCustomTypes(types);
    } catch (error) {
      console.error("Failed to load custom types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load types when dialog opens
  useEffect(() => {
    if (open) {
      loadCustomTypes();
    }
  }, [open]);

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeLabel.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("label", newTypeLabel.trim());
      
      const result = await createCustomContactType(formData);
      if (result.success) {
        setNewTypeLabel("");
        setIsAddDialogOpen(false);
        await loadCustomTypes();
        onTypesChanged?.();
      } else {
        console.error("Failed to create type:", result.error);
      }
    } catch (error) {
      console.error("Error creating type:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !editTypeLabel.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("id", editingType.id);
      formData.append("label", editTypeLabel.trim());
      
      const result = await updateCustomContactType(editingType.id, formData);
      if (result.success) {
        setEditingType(null);
        setEditTypeLabel("");
        setIsEditDialogOpen(false);
        await loadCustomTypes();
        onTypesChanged?.();
      } else {
        console.error("Failed to update type:", result.error);
      }
    } catch (error) {
      console.error("Error updating type:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom contact type?")) {
      return;
    }

    try {
      const result = await deleteCustomContactType(id);
      if (result.success) {
        await loadCustomTypes();
        onTypesChanged?.();
      } else {
        console.error("Failed to delete type:", result.error);
      }
    } catch (error) {
      console.error("Error deleting type:", error);
    }
  };

  const openEditDialog = (type: CustomContactType) => {
    setEditingType(type);
    setEditTypeLabel(type.label);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Manage custom contact types"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Custom Contact Types</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Create and manage custom contact types for your organization
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Type
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading custom contact types...</div>
            ) : customTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No custom contact types created yet. Click "Add New Type" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.label}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {type.value}
                      </TableCell>
                      <TableCell>
                        {new Date(type.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={type.is_active ? "default" : "secondary"}>
                          {type.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(type)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteType(type.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddType} className="space-y-4">
            <div>
              <Label htmlFor="new-type-label">Type Label</Label>
              <Input
                id="new-type-label"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="e.g., Angel Investor, Board Member"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setNewTypeLabel("");
                  setIsAddDialogOpen(false);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Creating..." : "Create Type"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditType} className="space-y-4">
            <div>
              <Label htmlFor="edit-type-label">Type Label</Label>
              <Input
                id="edit-type-label"
                value={editTypeLabel}
                onChange={(e) => setEditTypeLabel(e.target.value)}
                placeholder="e.g., Angel Investor, Board Member"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditingType(null);
                  setEditTypeLabel("");
                  setIsEditDialogOpen(false);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Updating..." : "Update Type"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 