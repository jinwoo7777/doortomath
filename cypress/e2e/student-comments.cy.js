/**
 * Cypress E2E tests for student comment feature
 */

describe('Student Comment Feature', () => {
  beforeEach(() => {
    // Login as admin
    cy.login('admin@example.com', 'password');
    
    // Visit student management page
    cy.visit('/dashboard/admin/students');
    
    // Wait for page to load
    cy.contains('학원생 관리').should('be.visible');
  });
  
  it('should open comment modal from student list', () => {
    // Find first student row
    cy.get('table tbody tr').first().within(() => {
      // Click comment button (message square icon)
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Verify modal is open
    cy.contains('학생 코멘트 -').should('be.visible');
    cy.contains('학생 정보').should('be.visible');
    cy.contains('기존 코멘트').should('be.visible');
    cy.contains('새 코멘트 작성').should('be.visible');
  });
  
  it('should add a new comment', () => {
    // Open comment modal
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Select a course
    cy.get('button[id="course"]').click();
    cy.get('[role="option"]').first().click();
    
    // Enter comment text
    const commentText = '테스트 코멘트 ' + new Date().toISOString();
    cy.get('textarea[id="content"]').type(commentText);
    
    // Save comment
    cy.contains('button', '저장').click();
    
    // Verify success message
    cy.contains('코멘트가 저장되었습니다.').should('be.visible');
    
    // Reopen modal to verify comment was added
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Verify new comment is visible
    cy.contains(commentText).should('be.visible');
  });
  
  it('should delete a comment', () => {
    // Open comment modal
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Add a comment if none exists
    cy.get('body').then(($body) => {
      if ($body.text().includes('코멘트가 없습니다')) {
        // Select a course
        cy.get('button[id="course"]').click();
        cy.get('[role="option"]').first().click();
        
        // Enter comment text
        const commentText = '삭제할 테스트 코멘트 ' + new Date().toISOString();
        cy.get('textarea[id="content"]').type(commentText);
        
        // Save comment
        cy.contains('button', '저장').click();
        
        // Reopen modal
        cy.get('table tbody tr').first().within(() => {
          cy.get('button[aria-label="학생 코멘트"]').click();
        });
      }
    });
    
    // Get first comment delete button
    cy.get('.border-b').first().within(() => {
      cy.get('button').click();
    });
    
    // Confirm deletion
    cy.contains('button', '삭제').click();
    
    // Verify success message
    cy.contains('코멘트가 삭제되었습니다.').should('be.visible');
  });
  
  it('should validate comment form', () => {
    // Open comment modal
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Try to save empty comment
    cy.get('textarea[id="content"]').focus().blur();
    
    // Verify validation message
    cy.contains('코멘트 내용을 입력해주세요.').should('be.visible');
    
    // Verify save button is disabled
    cy.contains('button', '저장').should('be.disabled');
    
    // Enter valid comment
    cy.get('textarea[id="content"]').type('유효한 코멘트');
    
    // Verify validation message is gone
    cy.contains('코멘트 내용을 입력해주세요.').should('not.exist');
    
    // Verify save button is enabled
    cy.contains('button', '저장').should('not.be.disabled');
  });
  
  it('should show comments in student courses modal', () => {
    // Open student courses modal
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 강의"]').click();
    });
    
    // Verify comment section exists
    cy.contains('학생 코멘트').should('be.visible');
    
    // Check if comments are loaded
    cy.get('body').then(($body) => {
      if ($body.text().includes('코멘트가 없습니다')) {
        cy.contains('코멘트 추가').should('be.visible');
      } else {
        cy.contains('코멘트 관리').should('be.visible');
      }
    });
  });
  
  it('should be responsive on different screen sizes', () => {
    // Test on mobile viewport
    cy.viewport('iphone-6');
    
    // Open comment modal
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Verify modal is properly displayed
    cy.contains('학생 코멘트 -').should('be.visible');
    cy.contains('기존 코멘트').should('be.visible');
    
    // Close modal
    cy.contains('button', '취소').click();
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    
    // Open comment modal again
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Verify modal is properly displayed
    cy.contains('학생 코멘트 -').should('be.visible');
    cy.contains('기존 코멘트').should('be.visible');
    
    // Close modal
    cy.contains('button', '취소').click();
    
    // Reset viewport
    cy.viewport(1280, 720);
  });
  
  it('should handle keyboard navigation', () => {
    // Open comment modal
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[aria-label="학생 코멘트"]').click();
    });
    
    // Tab to course dropdown
    cy.focused().tab();
    cy.focused().should('have.attr', 'id', 'course');
    
    // Tab to comment textarea
    cy.focused().tab();
    cy.focused().should('have.attr', 'id', 'content');
    
    // Tab to cancel button
    cy.focused().tab();
    cy.focused().should('contain', '취소');
    
    // Tab to save button
    cy.focused().tab();
    cy.focused().should('contain', '저장');
    
    // Press Escape to close modal
    cy.get('body').type('{esc}');
    cy.contains('학생 코멘트 -').should('not.exist');
  });
});

// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/signin');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.contains('button', '로그인').click();
    cy.url().should('include', '/dashboard');
  });
});