/**
 * @jest-environment node
 */

import { DELETE } from '../route';
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

describe('Student Comment Delete API Route', () => {
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
      delete: jest.fn().mockReturnThis(),
      single: jest.fn()
    };
    
    createRouteHandlerClient.mockReturnValue(mockSupabase);
  });
  
  it('should return 400 if commentId is missing', async () => {
    const request = {};
    const params = { id: null };
    
    await DELETE(request, { params });
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Comment ID is required' },
      { status: 400 }
    );
  });
  
  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
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
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  });
  
  it('should return 403 if user is not admin or instructor', async () => {
    // Mock successful profile fetch with student role
    mockSupabase.single.mockResolvedValue({
      data: { role: 'student' },
      error: null
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Permission denied' },
      { status: 403 }
    );
  });
  
  it('should check instructor permissions for comment deletion', async () => {
    // Mock successful profile fetch with instructor role
    mockSupabase.single.mockImplementation((table) => {
      if (!table) {
        return {
          data: { role: 'instructor' },
          error: null
        };
      }
      return {
        data: {
          created_by: 'other_user',
          instructor_id: 'other_instructor'
        },
        error: null
      };
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Permission denied: You can only delete your own comments or comments for your courses' },
      { status: 403 }
    );
  });
  
  it('should allow instructor to delete their own comment', async () => {
    // Mock successful profile fetch with instructor role
    mockSupabase.single.mockImplementation((table) => {
      if (!table) {
        return {
          data: { role: 'instructor' },
          error: null
        };
      }
      return {
        data: {
          created_by: 'user1', // Same as authenticated user
          instructor_id: 'other_instructor'
        },
        error: null
      };
    });
    
    // Mock successful comment delete
    mockSupabase.delete.mockResolvedValue({
      error: null
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('student_comments');
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'comment1');
    
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });
  
  it('should allow instructor to delete comment for their course', async () => {
    // Mock successful profile fetch with instructor role
    mockSupabase.single.mockImplementation((table) => {
      if (!table) {
        return {
          data: { role: 'instructor' },
          error: null
        };
      }
      return {
        data: {
          created_by: 'other_user',
          instructor_id: 'user1' // Same as authenticated user
        },
        error: null
      };
    });
    
    // Mock successful comment delete
    mockSupabase.delete.mockResolvedValue({
      error: null
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('student_comments');
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'comment1');
    
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });
  
  it('should allow admin to delete any comment', async () => {
    // Mock successful profile fetch with admin role
    mockSupabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null
    });
    
    // Mock successful comment delete
    mockSupabase.delete.mockResolvedValue({
      error: null
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('student_comments');
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'comment1');
    
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });
  
  it('should return 500 if comment delete fails', async () => {
    // Mock successful profile fetch with admin role
    mockSupabase.single.mockResolvedValue({
      data: { role: 'admin' },
      error: null
    });
    
    // Mock failed comment delete
    mockSupabase.delete.mockResolvedValue({
      error: { message: 'Database error' }
    });
    
    const request = {};
    const params = { id: 'comment1' };
    
    await DELETE(request, { params });
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to delete student comment' },
      { status: 500 }
    );
  });
});