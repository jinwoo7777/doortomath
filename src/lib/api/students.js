/**
 * API functions for student-related operations
 */

/**
 * Fetches comments for a specific student
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Array>} - Array of student comments with instructor and course information
 */
export async function fetchStudentComments(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required');
  }

  try {
    const response = await fetch(`/api/admin/students/comments?studentId=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch student comments');
    }

    const data = await response.json();
    return data.comments;
  } catch (error) {
    console.error('Error fetching student comments:', error);
    throw error;
  }
}

/**
 * Fetches courses a student is enrolled in, along with instructor information
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Array>} - Array of courses with instructor information
 */
export async function fetchStudentCourses(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required');
  }

  try {
    const response = await fetch(`/api/admin/students/courses?studentId=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch student courses');
    }

    const data = await response.json();
    return data.courses;
  } catch (error) {
    console.error('Error fetching student courses:', error);
    throw error;
  }
}

/**
 * Adds a new comment for a student
 * @param {string} studentId - The ID of the student
 * @param {string} content - The comment content
 * @param {string} scheduleId - The ID of the schedule (optional)
 * @param {string} instructorId - The ID of the instructor (optional)
 * @returns {Promise<Object>} - The newly created comment
 */
export async function addStudentComment(studentId, content, scheduleId = null, instructorId = null) {
  if (!studentId) {
    throw new Error('Student ID is required');
  }
  
  if (!content) {
    throw new Error('Comment content is required');
  }
  
  if (content.length > 1000) {
    throw new Error('Comment content cannot exceed 1000 characters');
  }

  try {
    const response = await fetch('/api/admin/students/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        content,
        scheduleId,
        instructorId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add student comment');
    }

    const data = await response.json();
    return data.comment;
  } catch (error) {
    console.error('Error adding student comment:', error);
    throw error;
  }
}

/**
 * Deletes a student comment
 * @param {string} commentId - The ID of the comment to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteStudentComment(commentId) {
  if (!commentId) {
    throw new Error('Comment ID is required');
  }

  try {
    const response = await fetch(`/api/admin/students/comments?id=${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete student comment');
    }

    return true;
  } catch (error) {
    console.error('Error deleting student comment:', error);
    throw error;
  }
}

/**
 * Fetches all student comment data including comments, courses, and teachers in a single API call
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Object>} - Object containing comments, courses, and teachers
 */
export async function fetchStudentCommentData(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required');
  }

  try {
    const response = await fetch(`/api/admin/students/comments?studentId=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch student comment data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching student comment data:', error);
    throw error;
  }
}