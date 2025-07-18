import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import StudentManagementContent from '../StudentManagementContent';
import StudentCoursesModal from '../StudentCoursesModal';
import * as studentApi from '@/lib/api/students';
import { useAuth } from '@/hooks/useAuth';

// Mock the API functions
jest.mock('@/lib/api/students', () => ({
  fetchStudentComments: jest.fn(),
  fetchStudentCourses: jest.fn(),
  addStudentComment: jest.fn(),
  deleteStudentComment: jest.fn()
}));

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue('all')
  })
}));

// Mock the custom hooks
jest.mock('../hooks/useStudentData', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    students: [],
    setStudents: jest.fn(),
    schedules: [],
    teachers: [],
    studentSchedules: [],
    studentGrades: [],
    loading: false,
    fetchData: jest.fn(),
    fetchStudentSchedules: jest.fn()
  })
}));

jest.mock('../hooks/useStudentForm', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    currentStudent: null,
    isDialogOpen: false,
    setIsDialogOpen: jest.fn(),
    studentForm: {},
    handleInputChange: jest.fn(),
    handleSelectChange: jest.fn(),
    openAddDialog: jest.fn(),
    openEditDialog: jest.fn(),
    handleSaveStudent: jest.fn(),
    handleDeleteStudent: jest.fn(),
    handleTogglePriority: jest.fn()
  })
}));

jest.mock('../hooks/useStudentStats', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    stats: {},
    getStudentSchedules: jest.fn().mockReturnValue([]),
    getStudentGradeAverage: jest.fn().mockReturnValue(null),
    getStudentsByTeacher: jest.fn().mockReturnValue([]),
    getStudentsByGrade: jest.fn().mockReturnValue([])
  })
}));

jest.mock('../hooks/useSortableTable', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    sortColumn: '',
    sortDirection: 'asc',
    handleSort: jest.fn(),
    sortData: jest.fn(data => data)
  })
}));

jest.mock('../hooks/useCourseManagement', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    studentCourses: [],
    setStudentCourses: jest.fn(),
    loading: false,
    editingCourse: null,
    setEditingCourse: jest.fn(),
    isAddingCourse: false,
    setIsAddingCourse: jest.fn(),
    selectedSchedule: '',
    setSelectedSchedule: jest.fn(),
    enrollmentNotes: '',
    setEnrollmentNotes: jest.fn(),
    selectedBranch: '',
    handleBranchChange: jest.fn(),
    handleAddCourse: jest.fn(),
    handleRemoveCourse: jest.fn(),
    handleUpdateCourseStatus: jest.fn(),
    handleUpdateCourseNotes: jest.fn(),
    filteredAvailableSchedules: []
  })
}));

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('Student Comment UI/UX Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    studentApi.fetchStudentComments.mockResolvedValue([]);
    studentApi.fetchStudentCourses.mockResolvedValue([]);
    
    // Mock auth
    useAuth.mockReturnValue({
      session: { user: { id: 'user1' } },
      userRole: 'admin'
    });
  });
  
  describe('StudentCoursesModal UI/UX', () => {
    const mockStudent = {
      id: 'student1',
      full_name: '홍길동',
      email: 'hong@example.com'
    };
    
    it('renders the comment section in the courses modal', async () => {
      render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Check if comment section is rendered
      expect(screen.getByText('학생 코멘트')).toBeInTheDocument();
      
      // Initially should show loading state for comments
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // After loading, should show "no comments" message
      await waitFor(() => {
        expect(screen.getByText('코멘트가 없습니다.')).toBeInTheDocument();
      });
    });
    
    it('opens comment modal when edit button is clicked', async () => {
      render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Wait for comments to load
      await waitFor(() => {
        expect(screen.getByText('코멘트 추가')).toBeInTheDocument();
      });
      
      // Click the edit button
      fireEvent.click(screen.getByText('코멘트 추가'));
      
      // Check if comment modal is opened
      await waitFor(() => {
        expect(screen.getByText(`학생 코멘트 - ${mockStudent.full_name}`)).toBeInTheDocument();
      });
    });
    
    it('displays comments when they exist', async () => {
      // Mock comments
      studentApi.fetchStudentComments.mockResolvedValue([
        {
          id: 'comment1',
          content: '수학 성적이 향상되고 있습니다.',
          created_at: '2025-07-18T10:00:00Z',
          course: { id: 'course1', title: '수학 기초' },
          instructor: { id: 'instructor1', full_name: '김선생' }
        }
      ]);
      
      render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Wait for comments to load
      await waitFor(() => {
        expect(screen.getByText('수학 성적이 향상되고 있습니다.')).toBeInTheDocument();
        expect(screen.getByText('총 1개의 코멘트')).toBeInTheDocument();
      });
      
      // Check if "코멘트 관리" button is shown instead of "코멘트 추가"
      expect(screen.getByText('코멘트 관리')).toBeInTheDocument();
    });
  });
  
  describe('Modal Responsiveness', () => {
    const mockStudent = {
      id: 'student1',
      full_name: '홍길동',
      email: 'hong@example.com'
    };
    
    it('renders properly on different screen sizes', async () => {
      // Mock window.matchMedia for testing responsiveness
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      const { container } = render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Check if the modal has appropriate max-width and max-height
      const modalContent = container.querySelector('[class*="max-w-"]');
      expect(modalContent).toHaveClass('max-w-6xl');
      expect(modalContent).toHaveClass('max-h-[90vh]');
      
      // Check if the modal has overflow handling
      expect(modalContent).toHaveClass('overflow-y-auto');
    });
  });
  
  describe('Form Validation', () => {
    const mockStudent = {
      id: 'student1',
      full_name: '홍길동',
      email: 'hong@example.com'
    };
    
    it('validates comment length in the modal', async () => {
      render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Wait for comments to load and click edit button
      await waitFor(() => {
        expect(screen.getByText('코멘트 추가')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('코멘트 추가'));
      
      // Wait for comment modal to open
      await waitFor(() => {
        expect(screen.getByText(`학생 코멘트 - ${mockStudent.full_name}`)).toBeInTheDocument();
      });
      
      // Enter a very long comment
      const commentInput = screen.getByPlaceholderText('학생에 대한 코멘트를 입력하세요');
      fireEvent.change(commentInput, { target: { value: 'a'.repeat(1001) } });
      fireEvent.blur(commentInput);
      
      // Check if validation error is shown
      expect(screen.getByText('코멘트는 1000자를 초과할 수 없습니다.')).toBeInTheDocument();
      
      // Check if character count is shown
      expect(screen.getByText('1001/1000')).toBeInTheDocument();
    });
  });
  
  describe('User Experience', () => {
    const mockStudent = {
      id: 'student1',
      full_name: '홍길동',
      email: 'hong@example.com'
    };
    
    it('shows loading indicators during API calls', async () => {
      // Delay API response to test loading state
      studentApi.fetchStudentComments.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([]), 100);
        });
      });
      
      render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Check if loading spinner is shown
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Wait for comments to load
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
    
    it('disables save button when form is invalid', async () => {
      render(
        <StudentCoursesModal
          isOpen={true}
          onClose={jest.fn()}
          student={mockStudent}
          onUpdate={jest.fn()}
        />
      );
      
      // Wait for comments to load and click edit button
      await waitFor(() => {
        expect(screen.getByText('코멘트 추가')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('코멘트 추가'));
      
      // Wait for comment modal to open
      await waitFor(() => {
        expect(screen.getByText(`학생 코멘트 - ${mockStudent.full_name}`)).toBeInTheDocument();
      });
      
      // Save button should be disabled initially (no comment entered)
      const saveButton = screen.getByText('저장');
      expect(saveButton).toBeDisabled();
      
      // Enter a comment
      const commentInput = screen.getByPlaceholderText('학생에 대한 코멘트를 입력하세요');
      fireEvent.change(commentInput, { target: { value: 'Valid comment' } });
      
      // Save button should be enabled
      expect(saveButton).not.toBeDisabled();
    });
  });
});