import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";

interface Course { _id: string; name: string; code: string; }

const Courses = () => {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deptId, setDeptId] = useState("");
  const [duration, setDuration] = useState("4");

  const load = async () => {
    try {
      const { data } = await api.get("/teacher/subjects"); // Using subjects as courses for now
      setItems(data ?? []);
    } catch (error) {
      console.error("Load courses error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const reset = () => { setName(""); setCode(""); setEditing(null); };

  const save = async () => {
    try {
      const payload = { name, code };
      if (editing) {
        await api.put(`/teacher/subjects/${editing._id}`, payload);
        toast.success("Course updated");
      } else {
        await api.post("/teacher/subjects", payload);
        toast.success("Course added");
      }
      setOpen(false); reset(); load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving course");
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/teacher/subjects/${id}`);
      toast.success("Course removed"); load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting course");
    }
  };

  return (
    <div>
      <PageHeader title="Courses" description="Manage degree programs">
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editing ? "Edit" : "Add"} Course</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="B.Tech Computer Science" /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="BTCS" /></div>
              <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No courses" description="Add your first course program" actionLabel="Add Course" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(c => (
            <Card key={c._id} className="border-border/50 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(c); setName(c.name); setCode(c.code); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete {c.name}?</AlertDialogTitle><AlertDialogDescription>This will remove the course and all related data.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del(c._id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
