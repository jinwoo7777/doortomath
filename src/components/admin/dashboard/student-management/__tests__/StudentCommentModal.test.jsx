import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentCommentModal from '../StudentCommentModal';
import * as studentApi from '@/lib/api/students';
import { toast } from 'sonner';

// Mock the API functions
jest.mock('@/lib/api/students', () => ({
  fetchStudentComments: jest.fn(),
  fetchStudentCourses: jest.fn(),
  addStudentComment: jest.fn(),
  deleteStudentComment: jest.fn()
}));

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('StudentCommentModal', () => {
  const mockStudent = {
    id: 'student1',
    full_name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    grade: '고등학교 1학년'
  };
  
  const mockComments = [
    {
      id: 'comment1',
      content: '수학 성적이 향상되고 있습니다.',
      created_at: '2025-07-18T10:00:00Z',
      course: { id: 'course1', title: '수학 기초' },
      instructor: { id: 'instructor1', full_name: '김선생' }
    },
    {
      id: 'comment2',
      content: '영어 단어 암기에 어려움을 겪고 있습니다.',
      created_at: '2025-07-15T09:00:00Z',
      course: { id: 'course2', title: '영어 회화' },
      instructor: { id: 'instructor2', full_name: '이선생' }
    }
  ];
  
  const mockCourses = [
    {
      id: 'course1',
      title: '수학 기초',
      instructor_id: 'instructor1',
      instructor_name: '김선생'
    },
    {
      id: 'course2',
      title: '영어 회화',
      instructor_id: 'instructor2',
      instructor_name: '이선생'
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    studentApi.fetchStudentComments.mockResolvedValue(mockComments);
    studentApi.fetchStudentCourses.mockResolvedValue(mockCourses);
    studentApi.addStudentComment.mockResolvedValue(mockComments[0]);
    studentApi.deleteStudentComment.mockResolvedValue(true);
  });
  
  it('renders the modal with student information', () => {
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    expect(screen.getByText(`학생 코멘트 - ${mockStudent.full_name}`)).toBeInTheDocument();
    expect(screen.getByText('이름:')).toBeInTheDocument();
    expect(screen.getByText(mockStudent.full_name)).toBeInTheDocument();
    expect(screen.getByText('이메일:')).toBeInTheDocument();
    expect(screen.getByText(mockStudent.email)).toBeInTheDocument();
  });
  
  it('loads and displays comments when opened', async () => {
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Check if API was called
    expect(studentApi.fetchStudentComments).toHaveBeenCalledWith(mockStudent.id);
    expect(studentApi.fetchStudentCourses).toHaveBeenCalledWith(mockStudent.id);
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('수학 성적이 향상되고 있습니다.')).toBeInTheDocument();
      expect(screen.getByText('영어 단어 암기에 어려움을 겪고 있습니다.')).toBeInTheDocument();
    });
  });
  
  it('allows adding a new comment', async () => {
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Wait for courses to load
    await waitFor(() => {
      expect(studentApi.fetchStudentCourses).toHaveBeenCalled();
    });
    
    // Select a course
    fireEvent.click(screen.getByText('강의를 선택하세요'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('수학 기초 (김선생)'));
    });
    
    // Enter comment text
    const commentInput = screen.getByPlaceholderText('학생에 대한 코멘트를 입력하세요');
    fireEvent.change(commentInput, { target: { value: '새로운 코멘트입니다.' } });
    
    // Submit the form
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);
    
    // Check if API was called with correct parameters
    await waitFor(() => {
      expect(studentApi.addStudentComment).toHaveBeenCalledWith(
        mockStudent.id,
        '새로운 코멘트입니다.',
        'course1',
        'instructor1'
      );
      expect(toast.success).toHaveBeenCalledWith('코멘트가 저장되었습니다.');
    });
  });
  
  it('validates comment content', async () => {
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Try to submit empty comment
    const commentInput = screen.getByPlaceholderText('학생에 대한 코멘트를 입력하세요');
    fireEvent.change(commentInput, { target: { value: '' } });
    fireEvent.blur(commentInput);
    
    // Check validation message
    expect(screen.getByText('코멘트 내용을 입력해주세요.')).toBeInTheDocument();
    
    // Try with too long comment
    const longComment = 'a'.repeat(1001);
    fireEvent.change(commentInput, { target: { value: longComment } });
    fireEvent.blur(commentInput);
    
    // Check validation message
    expect(screen.getByText('코멘트는 1000자를 초과할 수 없습니다.')).toBeInTheDocument();
  });
  
  it('allows deleting a comment', async () => {
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('수학 성적이 향상되고 있습니다.')).toBeInTheDocument();
    });
    
    // Click delete button on first comment
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(deleteButtons[0]); // First delete button
    
    // Confirm deletion in the alert dialog
    await waitFor(() => {
      expect(screen.getByText('코멘트 삭제')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('삭제'));
    
    // Check if API was called
    await waitFor(() => {
      expect(studentApi.deleteStudentComment).toHaveBeenCalledWith('comment1');
      expect(toast.success).toHaveBeenCalledWith('코멘트가 삭제되었습니다.');
    });
  });
  
  it('handles API errors when loading comments', async () => {
    // Mock API error
    studentApi.fetchStudentComments.mockRejectedValue(new Error('Failed to load comments'));
    
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('코멘트를 불러오는 중 오류가 발생했습니다.');
    });
  });
  
  it('handles API errors when adding a comment', async () => {
    // Mock API error
    studentApi.addStudentComment.mockRejectedValue(new Error('Failed to add comment'));
    
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Enter comment text
    const commentInput = screen.getByPlaceholderText('학생에 대한 코멘트를 입력하세요');
    fireEvent.change(commentInput, { target: { value: '새로운 코멘트입니다.' } });
    
    // Submit the form
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('코멘트 저장 중 오류가 발생했습니다.');
    });
  });
});