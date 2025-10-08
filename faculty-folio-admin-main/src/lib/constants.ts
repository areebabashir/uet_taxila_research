// UET Taxila Official Departments
export const UET_DEPARTMENTS = [
  // Faculty of Civil and Environmental Engineering
  'Civil Engineering',
  'Environmental Engineering',
  
  // Faculty of Electronics and Electrical Engineering
  'Electrical Engineering',
  'Electronics Engineering',
  'Biomedical Engineering Technology',
  
  // Faculty of Mechanical and Aeronautical Engineering
  'Mechanical Engineering',
  'Metallurgy & Material Engineering',
  'Energy Engineering',
  'Mechatronics Engineering',
  
  // Faculty of Telecommunication and Information Engineering
  'Computer Science',
  'Computer Engineering',
  'Software Engineering',
  'Telecommunication Engineering',
  
  // Faculty of Industrial Engineering
  'Industrial Engineering',
  
  // Faculty of Basic Sciences and Humanities
  'Humanities & Social Sciences',
  'Mathematical Sciences',
  'Physical Sciences'
] as const;

export type Department = typeof UET_DEPARTMENTS[number];

// Department categories based on UET Taxila official faculties
export const DEPARTMENT_CATEGORIES = {
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
