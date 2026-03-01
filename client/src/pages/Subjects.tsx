import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Subject { _id: string; name: string; code: string; }

const Subjects = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/teacher/subjects");
      setItems(data ?? []);
    } catch (error) {
      console.error("Load subjects error:", error);
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
        toast.success("Subject updated");
      } else {
        await api.post("/teacher/subjects", payload);
        toast.success("Subject added");
      }
      setOpen(false); reset(); load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving subject");
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/teacher/subjects/${id}`);
      toast.success("Subject removed"); load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting subject");
    }
  };

  return (
    <div>
      <PageHeader title="Subjects" description="Manage course subjects">
        {hasRole("admin") && (
          <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) reset(); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Subject</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">{editing ? "Edit" : "Add"} Subject</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Data Structures" /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="CS201" /></div>
                <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects" description="Add subjects to your courses" actionLabel={hasRole("admin") ? "Add Subject" : undefined} onAction={hasRole("admin") ? () => setOpen(true) : undefined} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(s => (
            <Card key={s._id} className="border-border/50 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  {hasRole("admin") && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(s); setName(s.name); setCode(s.code); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete {s.name}?</AlertDialogTitle><AlertDialogDescription>This will remove the subject and all related data.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del(s._id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
