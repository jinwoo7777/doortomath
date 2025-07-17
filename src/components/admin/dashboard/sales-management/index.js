// Main export file for sales management components
import SalesManagementContent from './SalesManagementContent';
import SalesByClassContent from './SalesByClassContent';
import SalesByInstructorContent from './SalesByInstructorContent';
import SalesByClassView from './views/by-class/SalesByClassView';
import SalesByInstructorView from './views/by-instructor/SalesByInstructorView';
import OverduePaymentsView from './views/overdue/OverduePaymentsView';
import PaidPaymentsView from './views/paid/PaidPaymentsView';
import SalesOverviewView from './views/overview/SalesOverviewView';

export {
  // Main container
  SalesManagementContent,
  
  // Legacy exports (for backward compatibility)
  SalesByClassContent,
  SalesByInstructorContent,
  
  // New view components
  SalesByClassView,
  SalesByInstructorView,
  OverduePaymentsView,
  PaidPaymentsView,
  SalesOverviewView
};