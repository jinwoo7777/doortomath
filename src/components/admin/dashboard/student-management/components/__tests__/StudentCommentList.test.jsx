import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentCommentList from '../StudentCommentList';
import * as studentApi from '@/lib/api/students';
import { toast } from 'sonner';

// Mock the API functions
jest.mock('@/lib/api/students', () => ({
  fetchStudentComments: jest.fn()
}));

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

describe('StudentCommentList', () => {
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
  
  beforeEach(() => {
    jest.clearAllMocks();
    studentApi.fetchStudentComments.mockResolvedValue(mockComments);
  });
  
  it('renders loading state initially', () => {
    render(<StudentCommentList studentId="student1" />);
    
    // Check if loading spinner is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('displays comments when loaded', async () => {
    render(<StudentCommentList studentId="student1" />);
    
    // Check if API was called
    expect(studentApi.fetchStudentComments).toHaveBeenCalledWith('student1');
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('수학 성적이 향상되고 있습니다.')).toBeInTheDocument();
      expect(screen.getByText('영어 단어 암기에 어려움을 겪고 있습니다.')).toBeInTheDocument();
    });
    
    // Check if comment count is displayed
    expect(screen.getByText('총 2개의 코멘트')).toBeInTheDocument();
  });
  
  it('displays "no comments" message when there are no comments', async () => {
    // Mock empty comments array
    studentApi.fetchStudentComments.mockResolvedValue([]);
    
    render(<StudentCommentList studentId="student1" />);
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('코멘트가 없습니다.')).toBeInTheDocument();
    });
  });
  
  it('shows edit button when showEditButton is true', async () => {
    const mockOnEdit = jest.fn();
    
    render(
      <StudentCommentList 
        studentId="student1" 
        onEdit={mockOnEdit} 
        showEditButton={true} 
      />
    );
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('코멘트 관리')).toBeInTheDocument();
    });
  });
  
  it('does not show edit button when showEditButton is false', async () => {
    render(
      <StudentCommentList 
        studentId="student1" 
        onEdit={jest.fn()} 
        showEditButton={false} 
      />
    );
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.queryByText('코멘트 관리')).not.toBeInTheDocument();
    });
  });
  
  it('shows "add comment" button when there are no comments', async () => {
    // Mock empty comments array
    studentApi.fetchStudentComments.mockResolvedValue([]);
    
    const mockOnEdit = jest.fn();
    
    render(
      <StudentCommentList 
        studentId="student1" 
        onEdit={mockOnEdit} 
        showEditButton={true} 
      />
    );
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('코멘트 추가')).toBeInTheDocument();
    });
  });
  
  it('handles API errors', async () => {
    // Mock API error
    studentApi.fetchStudentComments.mockRejectedValue(new Error('Failed to load comments'));
    
    render(<StudentCommentList studentId="student1" />);
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('코멘트를 불러오는 중 오류가 발생했습니다.');
    });
  });
});