import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
import { toast } from "sonner";
import { ClipboardList, Plus } from "lucide-react";

interface Exam { _id: string; title: string; maxMarks: number; subject_id: string; }
interface Subject { _id: string; name: string; code: string; }

const examTypes = ["internal", "midterm", "final"];

const Exams = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [examType, setExamType] = useState<string>("internal");
  const [maxMarks, setMaxMarks] = useState("100");
  const [examDate, setExamDate] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/teacher/subjects");
      setSubjects(data ?? []);
      // MERN backend doesn't have a separate exams endpoint, but we can treat subjects as exam contexts
      setItems(data.map((s: any) => ({ _id: s._id, title: s.name, maxMarks: 100, subject_id: s._id })));
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    toast.info("In MERN architecture, subject assessments are handled via Marks entry.");
    setOpen(false);
  };

  const typeColor = (t: string) => {
    switch (t) {
      case "final": return "bg-destructive/10 text-destructive border-destructive/20";
      case "midterm": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div>
      <PageHeader title="Exams" description="Manage examinations">
        {(hasRole("admin") || hasRole("teacher")) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Create Exam</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Create Exam</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Midterm Exam 2024" /></div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{examTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Max Marks</Label><Input value={maxMarks} onChange={e => setMaxMarks(e.target.value)} type="number" /></div>
                </div>
                <div className="space-y-2"><Label>Date</Label><Input value={examDate} onChange={e => setExamDate(e.target.value)} type="date" /></div>
                <Button onClick={save} className="w-full">Create Exam</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No exams" description="Create your first exam" actionLabel={(hasRole("admin") || hasRole("teacher")) ? "Create Exam" : undefined} onAction={(hasRole("admin") || hasRole("teacher")) ? () => setOpen(true) : undefined} />
      ) : (
        <div className="space-y-2">
          {items.map(e => (
            <Card key={e._id} className="border-border/50 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{subjects.find(s => s._id === e.subject_id)?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Max Marks: {e.maxMarks}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exams;
