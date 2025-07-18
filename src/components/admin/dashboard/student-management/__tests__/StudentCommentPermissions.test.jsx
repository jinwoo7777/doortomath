import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentCommentModal from '../StudentCommentModal';
import * as studentApi from '@/lib/api/students';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock the API functions
jest.mock('@/lib/api/students', () => ({
  fetchStudentComments: jest.fn(),
  fetchStudentCourses: jest.fn(),
  addStudentComment: jest.fn(),
  deleteStudentComment: jest.fn()
}));

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('Student Comment Permissions Tests', () => {
  const mockStudent = {
    id: 'student1',
    full_name: '홍길동',
    email: 'hong@example.com'
  };
  
  const mockComments = [
    {
      id: 'comment1',
      content: '수학 성적이 향상되고 있습니다.',
      created_at: '2025-07-18T10:00:00Z',
      course: { id: 'course1', title: '수학 기초' },
      instructor: { id: 'instructor1', full_name: '김선생' },
      created_by: 'admin_user'
    },
    {
      id: 'comment2',
      content: '영어 단어 암기에 어려움을 겪고 있습니다.',
      created_at: '2025-07-15T09:00:00Z',
      course: { id: 'course2', title: '영어 회화' },
      instructor: { id: 'instructor2', full_name: '이선생' },
      created_by: 'instructor_user'
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
    
    // Mock Supabase auth
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'admin_user' }
            }
          }
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { role: 'admin' }
      })
    };
    
    createClientComponentClient.mockReturnValue(mockSupabase);
  });
  
  it('allows admin to see all comments', async () => {
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
      expect(screen.getByText('영어 단어 암기에 어려움을 겪고 있습니다.')).toBeInTheDocument();
    });
    
    // Admin should see delete buttons for all comments
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
  });
  
  it('allows instructor to see only their own comments and comments for their courses', async () => {
    // Mock instructor session
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'instructor_user' }
            }
          }
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { role: 'instructor' }
      })
    };
    
    createClientComponentClient.mockReturnValue(mockSupabase);
    
    // Filter comments to only show instructor's own comments
    studentApi.fetchStudentComments.mockResolvedValue([mockComments[1]]);
    
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
      // Should see their own comment
      expect(screen.getByText('영어 단어 암기에 어려움을 겪고 있습니다.')).toBeInTheDocument();
      
      // Should not see admin's comment
      expect(screen.queryByText('수학 성적이 향상되고 있습니다.')).not.toBeInTheDocument();
    });
  });
  
  it('handles permission denied error when adding a comment', async () => {
    // Mock permission denied error
    studentApi.addStudentComment.mockRejectedValue(new Error('Permission denied'));
    
    render(
      <StudentCommentModal
        isOpen={true}
        onClose={jest.fn()}
        student={mockStudent}
        onUpdate={jest.fn()}
      />
    );
    
    // Wait for the modal to load
    await waitFor(() => {
      expect(screen.getByText(`학생 코멘트 - ${mockStudent.full_name}`)).toBeInTheDocument();
    });
    
    // Enter a comment
    const commentInput = screen.getByPlaceholderText('학생에 대한 코멘트를 입력하세요');
    fireEvent.change(commentInput, { target: { value: 'New comment' } });
    
    // Submit the form
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(studentApi.addStudentComment).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('코멘트 저장 중 오류가 발생했습니다.');
    });
  });
  
  it('handles permission denied error when deleting a comment', async () => {
    // Mock permission denied error
    studentApi.deleteStudentComment.mockRejectedValue(new Error('Permission denied'));
    
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
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(studentApi.deleteStudentComment).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('코멘트 삭제 중 오류가 발생했습니다.');
    });
  });
});