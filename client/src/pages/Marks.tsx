import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";

interface Exam { _id: string; title: string; maxMarks: number; subject?: { name: string } | null; }
interface Student { _id: string; rollNumber: string; user: { fullName: string } }
interface Mark { _id?: string; student: string; subject: string; marksObtained: number; totalMarks: number; examTitle: string; }

const Marks = () => {
  const { hasRole, user } = useAuth();
  const isEditor = hasRole("admin") || hasRole("teacher");

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [existingMarks, setExistingMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // For student/parent view
  const [myMarks, setMyMarks] = useState<any[]>([]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const { data } = await api.get("/teacher/subjects"); // MERN uses subjects for exams/marks
        setExams(data.map((s: any) => ({ _id: s._id, title: s.name, maxMarks: 100, subject: s })));
      } catch (error) {
        console.error("Load exams error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  useEffect(() => {
    if (!isEditor && user) {
      const fetchMyMarks = async () => {
        try {
          // In MERN, marks are associated with the student user
          const { data } = await api.get(`/student/marks`);
          setMyMarks(data ?? []);
        } catch (error) {
          console.error("Fetch marks error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyMarks();
    }
  }, [isEditor, user]);

  const loadExamData = async (subjectId: string) => {
    setSelectedExam(subjectId);
    try {
      const { data: studentData } = await api.get("/teacher/students");
      setStudents(studentData ?? []);

      // In MERN, marks are fetched per student or global. 
      // Let's assume teacher wants to see current marks for this subject.
      const marksMap: Record<string, number> = {};
      studentData.forEach((s: any) => {
        const mark = s.marks?.find((m: any) => m.subject === subjectId);
        if (mark) marksMap[s._id] = mark.marksObtained;
      });
      setMarks(marksMap);
    } catch (error) {
      console.error("Load exam data error:", error);
    }
  };

  const saveMarks = async () => {
    if (!selectedExam) return;
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(marks).map(([studentId, marksObtained]) =>
          api.post("/teacher/marks", {
            studentId,
            subject: selectedExam,
            marksObtained,
            totalMarks: 100,
            examTitle: "Internal Assessment"
          })
        )
      );
      toast.success("Marks saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  // Student/Parent view
  if (!isEditor) {
    return (
      <div>
        <PageHeader title="My Marks" description="View your academic performance" />
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : myMarks.length === 0 ? (
          <EmptyState icon={FileText} title="No marks yet" description="Your marks will appear here once entered by your teachers" />
        ) : (
          <div className="space-y-2">
            {myMarks.map((m: any) => (
              <Card key={m._id} className="border-border/50 shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-foreground">{m.examTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.subject?.name || m.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-foreground">
                      {m.marksObtained}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {m.totalMarks}</span>
                    <Badge variant="outline" className={
                      (m.marksObtained / m.totalMarks) >= 0.6
                        ? "bg-success/10 text-success border-success/20"
                        : (m.marksObtained / m.totalMarks) >= 0.4
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                    }>
                      {Math.round((m.marksObtained / m.totalMarks) * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin/Teacher view: marks entry
  return (
    <div>
      <PageHeader title="Marks Entry" description="Enter and manage student marks" />

      <Card className="mb-6 border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>Select Subject/Exam</Label>
            <Select value={selectedExam} onValueChange={loadExamData}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choose a subject to enter marks" />
              </SelectTrigger>
              <SelectContent>
                {exams.map(e => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.title} (Max: {e.maxMarks})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedExam && students.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-display text-lg">
              {exams.find(e => e._id === selectedExam)?.title} — Max: 100
            </CardTitle>
            <Button onClick={saveMarks} disabled={saving} size="sm">
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead className="w-40">Marks</TableHead>
                  <TableHead className="w-24">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s, i) => {
                  const val = marks[s._id] ?? 0;
                  const pct = Math.round((val / 100) * 100);
                  return (
                    <TableRow key={s._id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{s.rollNumber}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={val}
                          min={0}
                          max={100}
                          className="h-8 w-28"
                          onChange={(e) => setMarks(prev => ({
                            ...prev,
                            [s._id]: parseFloat(e.target.value) || 0,
                          }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          pct >= 60 ? "bg-success/10 text-success border-success/20"
                            : pct >= 40 ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                        }>
                          {pct}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedExam && students.length === 0 && (
        <EmptyState icon={FileText} title="No active students" description="Add students first before entering marks" />
      )}
    </div>
  );
};

export default Marks;
