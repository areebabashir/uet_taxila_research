// UET Taxila Official Faculties and Departments
export const UET_FACULTIES = {
  'Faculty of Civil and Environmental Engineering': [
    'Civil Engineering',
    'Environmental Engineering'
  ],
  'Faculty of Electronics and Electrical Engineering': [
    'Electrical Engineering',
    'Electronics Engineering',
    'Biomedical Engineering Technology'
  ],
  'Faculty of Mechanical and Aeronautical Engineering': [
    'Mechanical Engineering',
    'Metallurgy & Material Engineering',
    'Energy Engineering',
    'Mechatronics Engineering'
  ],
  'Faculty of Telecommunication and Information Engineering': [
    'Computer Science',
    'Computer Engineering',
    'Software Engineering',
    'Telecommunication Engineering'
  ],
  'Faculty of Industrial Engineering': [
    'Industrial Engineering'
  ],
  'Faculty of Basic Sciences and Humanities': [
    'Humanities & Social Sciences',
    'Mathematical Sciences',
    'Physical Sciences'
  ]
} as const;

export type FacultyName = keyof typeof UET_FACULTIES;
export type DepartmentName = typeof UET_FACULTIES[FacultyName][number];

// Get all departments as a flat array
export const ALL_DEPARTMENTS: DepartmentName[] = Object.values(UET_FACULTIES).flat() as DepartmentName[];

// Get faculty name by department
export const getFacultyByDepartment = (department: string): FacultyName | null => {
  for (const [faculty, departments] of Object.entries(UET_FACULTIES)) {
    if ((departments as readonly string[]).includes(department)) {
      return faculty as FacultyName;
    }
  }
  return null;
};

// Get departments by faculty
export const getDepartmentsByFaculty = (faculty: FacultyName): readonly DepartmentName[] => {
  return UET_FACULTIES[faculty] || [];
};
