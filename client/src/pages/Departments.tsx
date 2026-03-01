import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

interface Department { _id: string; name: string; code: string; }

const Departments = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const fetch = async () => {
    try {
      // Mapping departments to classes for this MERN stack
      const { data } = await api.get("/teacher/analytics");
      const classes = data.classwiseData?.map((c: any) => ({ _id: c.class, name: `Class ${c.class}`, code: `CL${c.class}` })) || [];
      setItems(classes);
    } catch (error) {
      console.error("Fetch departments error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const reset = () => { setName(""); setCode(""); setEditing(null); };

  const save = async () => {
    toast.info("Department management is handled at the administrative level.");
    setOpen(false);
  };

  const del = async (id: string) => {
    toast.error("Cannot delete departments in this version.");
  };

  return (
    <div>
      <PageHeader title="Departments" description="Manage college departments">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit" : "Add"} Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={code} onChange={e => setCode(e.target.value)} placeholder="CS" />
              </div>
              <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Building2} title="No departments" description="Add your first department" actionLabel="Add Department" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(d => (
            <Card key={d._id} className="border-border/50 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{d.name}</p>
                  <p className="text-sm text-muted-foreground">{d.code}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Departments;
