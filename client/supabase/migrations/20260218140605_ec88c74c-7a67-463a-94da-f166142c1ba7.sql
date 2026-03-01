
-- ========================================
-- College Management System - Full Schema
-- ========================================

-- 1. Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users see their own roles, admins see all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Courses (e.g., B.Tech CSE, BBA, etc.)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  duration_years INT NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  semester INT NOT NULL DEFAULT 1,
  max_marks INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Students (links to profiles)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  roll_number TEXT NOT NULL UNIQUE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  semester INT NOT NULL DEFAULT 1,
  admission_year INT NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own record"
  ON public.students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view students"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7. Teacher assignments (which teacher teaches which subject)
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_user_id, subject_id)
);

ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own assignments"
  ON public.teacher_subjects FOR SELECT
  TO authenticated
  USING (teacher_user_id = auth.uid());

CREATE POLICY "Admins can manage teacher assignments"
  ON public.teacher_subjects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Exams
CREATE TYPE public.exam_type AS ENUM ('internal', 'midterm', 'final', 'assignment', 'practical');

CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  exam_type exam_type NOT NULL DEFAULT 'internal',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  max_marks INT NOT NULL DEFAULT 100,
  exam_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage exams"
  ON public.exams FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage exams for their subjects"
  ON public.exams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_subjects ts
      WHERE ts.teacher_user_id = auth.uid() AND ts.subject_id = exams.subject_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_subjects ts
      WHERE ts.teacher_user_id = auth.uid() AND ts.subject_id = exams.subject_id
    )
  );

-- 9. Marks
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  marks_obtained NUMERIC(5,2) NOT NULL DEFAULT 0,
  remarks TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_id)
);

ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own marks"
  ON public.marks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = marks.student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all marks"
  ON public.marks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage marks for their subjects"
  ON public.marks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.teacher_subjects ts ON ts.subject_id = e.subject_id
      WHERE e.id = marks.exam_id AND ts.teacher_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.teacher_subjects ts ON ts.subject_id = e.subject_id
      WHERE e.id = marks.exam_id AND ts.teacher_user_id = auth.uid()
    )
  );

CREATE TRIGGER update_marks_updated_at
  BEFORE UPDATE ON public.marks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 10. Parent-Student relationship
CREATE TABLE public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_user_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own links"
  ON public.parent_students FOR SELECT
  TO authenticated
  USING (parent_user_id = auth.uid());

CREATE POLICY "Admins can manage parent links"
  ON public.parent_students FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Parents can view their children's marks
CREATE POLICY "Parents can view children marks"
  ON public.marks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_user_id = auth.uid() AND ps.student_id = marks.student_id
    )
  );

-- Parents can view their children's student records
CREATE POLICY "Parents can view children records"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_user_id = auth.uid() AND ps.student_id = students.id
    )
  );

-- Indexes for performance
CREATE INDEX idx_students_course ON public.students(course_id);
CREATE INDEX idx_students_semester ON public.students(semester);
CREATE INDEX idx_marks_student ON public.marks(student_id);
CREATE INDEX idx_marks_exam ON public.marks(exam_id);
CREATE INDEX idx_exams_subject ON public.exams(subject_id);
CREATE INDEX idx_subjects_course ON public.subjects(course_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_parent_students_parent ON public.parent_students(parent_user_id);
CREATE INDEX idx_teacher_subjects_teacher ON public.teacher_subjects(teacher_user_id);
