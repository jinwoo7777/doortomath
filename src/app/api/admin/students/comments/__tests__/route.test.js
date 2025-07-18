/**
 * @jest-environment node
 */

import { GET, POST } from '../route';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn()
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options }))
  }
}));

// Import the mocked modules
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

describe('Student Comments API Routes', () => {
  let mockSupabase;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user1' } }
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn()
    };
    
    createRouteHandlerClient.mockReturnValue(mockSupabase);
  });
  
  describe('GET handler', () => {
    it('should return 400 if studentId is missing', async () => {
      // Create mock request with no studentId
      const request = {
        url: 'http://localhost:3000/api/admin/students/comments'
      };
      
      await GET(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      });
      
      const request = {
        url: 'http://localhost:3000/api/admin/students/comments?studentId=student1'
      };
      
      await GET(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 500 if profile fetch fails', async () => {
      // Mock profile fetch error
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' }
      });
      
      const request = {
        url: 'http://localhost:3000/api/admin/students/comments?studentId=student1'
      };
      
      await GET(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    });
    
    it('should return comments for a student', async () => {
      // Mock successful profile fetch
      mockSupabase.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock successful comments fetch
      const mockComments = [
        { id: 'comment1', content: 'Test comment' }
      ];
      
      mockSupabase.order.mockResolvedValue({
        data: mockComments,
        error: null
      });
      
      const request = {
        url: 'http://localhost:3000/api/admin/students/comments?studentId=student1'
      };
      
      await GET(request);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('student_comments');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        instructor:instructor_id(id, full_name, email),
        course:course_id(id, title)
      `);
      expect(mockSupabase.eq).toHaveBeenCalledWith('student_id', 'student1');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      
      expect(NextResponse.json).toHaveBeenCalledWith({ comments: mockComments });
    });
    
    it('should return 500 if comments fetch fails', async () => {
      // Mock successful profile fetch
      mockSupabase.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock failed comments fetch
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      const request = {
        url: 'http://localhost:3000/api/admin/students/comments?studentId=student1'
      };
      
      await GET(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch student comments' },
        { status: 500 }
      );
    });
  });
  
  describe('POST handler', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      });
      
      const request = {
        json: jest.fn().mockResolvedValue({
          studentId: 'student1',
          content: 'Test comment'
        })
      };
      
      await POST(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 403 if user is not admin or instructor', async () => {
      // Mock successful profile fetch with student role
      mockSupabase.single.mockResolvedValue({
        data: { role: 'student' },
        error: null
      });
      
      const request = {
        json: jest.fn().mockResolvedValue({
          studentId: 'student1',
          content: 'Test comment'
        })
      };
      
      await POST(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Permission denied' },
        { status: 403 }
      );
    });
    
    it('should return 400 if required fields are missing', async () => {
      // Mock successful profile fetch with admin role
      mockSupabase.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      const request = {
        json: jest.fn().mockResolvedValue({
          // Missing studentId
          content: 'Test comment'
        })
      };
      
      await POST(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Student ID and content are required' },
        { status: 400 }
      );
    });
    
    it('should return 400 if content is too long', async () => {
      // Mock successful profile fetch with admin role
      mockSupabase.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      const request = {
        json: jest.fn().mockResolvedValue({
          studentId: 'student1',
          content: 'a'.repeat(1001) // Too long content
        })
      };
      
      await POST(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Comment content cannot exceed 1000 characters' },
        { status: 400 }
      );
    });
    
    it('should add a comment successfully', async () => {
      // Mock successful profile fetch with admin role
      mockSupabase.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock successful comment insert
      const mockComment = [
        { id: 'comment1', content: 'Test comment' }
      ];
      
      mockSupabase.select.mockResolvedValue({
        data: mockComment,
        error: null
      });
      
      const request = {
        json: jest.fn().mockResolvedValue({
          studentId: 'student1',
          content: 'Test comment',
          courseId: 'course1',
          instructorId: 'instructor1'
        })
      };
      
      await POST(request);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('student_comments');
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        {
          student_id: 'student1',
          content: 'Test comment',
          course_id: 'course1',
          instructor_id: 'instructor1',
          created_by: 'user1'
        }
      ]);
      
      expect(NextResponse.json).toHaveBeenCalledWith({ comment: mockComment[0] });
    });
    
    it('should return 500 if comment insert fails', async () => {
      // Mock successful profile fetch with admin role
      mockSupabase.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      });
      
      // Mock failed comment insert
      mockSupabase.select.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      const request = {
        json: jest.fn().mockResolvedValue({
          studentId: 'student1',
          content: 'Test comment'
        })
      };
      
      await POST(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to add student comment' },
        { status: 500 }
      );
    });
  });
});