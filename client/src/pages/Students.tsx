import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Plus, Search, Pencil, Trash2 } from "lucide-react";

interface Student {
  _id: string;
  rollNumber: string;
  class: string;
  section: string;
  status: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    isActive: boolean;
  };
  subjects: any[];
}

interface Course {
  _id: string;
  name: string;
  code: string;
}

const Students = () => {
  const { hasRole } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  // Form state
  const [rollNumber, setRollNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("10");
  const [section, setSection] = useState("A");
  const [status, setStatus] = useState("active");

  const fetchStudents = async () => {
    try {
      const { data } = await api.get("/teacher/students");
      setStudents(data ?? []);
    } catch (error) {
      console.error("Fetch students error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/teacher/subjects");
      setCourses(data ?? []);
    } catch (error) {
      console.error("Fetch subjects error:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const resetForm = () => {
    setRollNumber("");
    setFullName("");
    setEmail("");
    setPassword("");
    setClassName("10");
    setSection("A");
    setStatus("active");
    setEditing(null);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setRollNumber(s.rollNumber);
    setFullName(s.user.fullName);
    setEmail(s.user.email);
    setPassword(""); // Don't show password on edit
    setClassName(s.class);
    setSection(s.section);
    setStatus(s.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        rollNumber,
        fullName,
        email,
        password: password || undefined,
        class: className,
        section,
        status,
      };

      if (editing) {
        await api.put(`/teacher/students/${editing._id}`, payload);
        toast.success("Student updated");
      } else {
        await api.post("/teacher/students", payload);
        toast.success("Student added");
      }

      setDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save student");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/teacher/students/${id}`);
      toast.success("Student removed");
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    }
  };

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.rollNumber.toLowerCase().includes(q) ||
        s.user.fullName.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [students, search]);

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "graduated": return "bg-primary/10 text-primary border-primary/20";
      case "suspended": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <PageHeader title="Students" description="Manage student records">
        {hasRole("admin") && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editing ? "Edit Student" : "Add Student"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@college.edu" />
                </div>
                {!editing && (
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="CS2024001" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="A" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editing ? "Update" : "Add"} Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={search ? "Try adjusting your search" : "Add your first student to get started"}
          actionLabel={!search && hasRole("admin") ? "Add Student" : undefined}
          onAction={!search && hasRole("admin") ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Card key={s._id} className="border-border/50 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
                    {s.rollNumber.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{s.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.rollNumber} • Class {s.class} • Section {s.section}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor(s.status)}>
                    {s.status}
                  </Badge>
                  {hasRole("admin") && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete student?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove {s.user.fullName} and all their records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(s._id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
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

export default Students;
