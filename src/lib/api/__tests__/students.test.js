/**
 * @jest-environment node
 */

import { fetchStudentComments, fetchStudentCourses, addStudentComment, deleteStudentComment } from '../students';
import fetchMock from 'jest-fetch-mock';

// Mock fetch
global.fetch = fetchMock;

describe('Student API Functions', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('fetchStudentComments', () => {
    it('should fetch comments for a student', async () => {
      const mockComments = [
        { 
          id: '123', 
          content: 'Test comment',
          created_at: '2025-07-18T10:00:00Z',
          course: { id: 'course1', title: 'Math' },
          instructor: { id: 'instructor1', full_name: 'John Doe' }
        }
      ];
      
      fetchMock.mockResponseOnce(JSON.stringify({ comments: mockComments }));
      
      const result = await fetchStudentComments('student1');
      
      expect(result).toEqual(mockComments);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/students/comments?studentId=student1',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
    
    it('should throw an error if studentId is not provided', async () => {
      await expect(fetchStudentComments()).rejects.toThrow('Student ID is required');
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'API Error' }), { status: 500 });
      
      await expect(fetchStudentComments('student1')).rejects.toThrow('API Error');
    });
  });
  
  describe('fetchStudentCourses', () => {
    it('should fetch courses for a student', async () => {
      const mockCourses = [
        { 
          id: 'course1', 
          title: 'Math',
          instructor_id: 'instructor1',
          instructor_name: 'John Doe'
        }
      ];
      
      fetchMock.mockResponseOnce(JSON.stringify({ courses: mockCourses }));
      
      const result = await fetchStudentCourses('student1');
      
      expect(result).toEqual(mockCourses);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/students/courses?studentId=student1',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
    
    it('should throw an error if studentId is not provided', async () => {
      await expect(fetchStudentCourses()).rejects.toThrow('Student ID is required');
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'API Error' }), { status: 500 });
      
      await expect(fetchStudentCourses('student1')).rejects.toThrow('API Error');
    });
  });
  
  describe('addStudentComment', () => {
    it('should add a comment for a student', async () => {
      const mockComment = { 
        id: '123', 
        content: 'New comment',
        student_id: 'student1',
        course_id: 'course1',
        instructor_id: 'instructor1',
        created_at: '2025-07-18T10:00:00Z'
      };
      
      fetchMock.mockResponseOnce(JSON.stringify({ comment: mockComment }));
      
      const result = await addStudentComment('student1', 'New comment', 'course1', 'instructor1');
      
      expect(result).toEqual(mockComment);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/students/comments',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: 'student1',
            content: 'New comment',
            courseId: 'course1',
            instructorId: 'instructor1'
          })
        })
      );
    });
    
    it('should throw an error if studentId is not provided', async () => {
      await expect(addStudentComment(null, 'Comment')).rejects.toThrow('Student ID is required');
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should throw an error if content is not provided', async () => {
      await expect(addStudentComment('student1', '')).rejects.toThrow('Comment content is required');
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should throw an error if content exceeds 1000 characters', async () => {
      const longContent = 'a'.repeat(1001);
      await expect(addStudentComment('student1', longContent)).rejects.toThrow('Comment content cannot exceed 1000 characters');
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'API Error' }), { status: 500 });
      
      await expect(addStudentComment('student1', 'Comment')).rejects.toThrow('API Error');
    });
  });
  
  describe('deleteStudentComment', () => {
    it('should delete a comment', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
      
      const result = await deleteStudentComment('comment1');
      
      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/students/comments/comment1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
    
    it('should throw an error if commentId is not provided', async () => {
      await expect(deleteStudentComment()).rejects.toThrow('Comment ID is required');
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'API Error' }), { status: 500 });
      
      await expect(deleteStudentComment('comment1')).rejects.toThrow('API Error');
    });
  });
});