# Sales Management Module

This folder contains components for the sales management dashboard section.

## Structure

```
/sales-management
  /components           # Shared components used across sales management
    /cards              # Card components for metrics and summaries
      MetricCard.jsx    # Reusable metric card component
    /dialogs            # Modal dialog components
      PaymentDialog.jsx # Payment form dialog component
    /tables             # Table components for data display
      DataTable.jsx     # Reusable data table component
  /hooks                # Custom hooks for sales management
    useSalesData.js     # Hook for fetching sales data
    useOverdueData.js   # Hook for fetching overdue payment data
    usePaidData.js      # Hook for fetching paid payment data
  /utils                # Utility functions
    formatters.js       # Formatting and display utility functions
  /views                # Main view components
    /overview           # Overview tab components
      SalesOverviewView.jsx # Sales overview dashboard
    /by-class           # Class-based sales view components
      SalesByClassView.jsx  # Class sales list view
      ClassDetailView.jsx   # Class detail component
    /by-instructor      # Instructor-based sales view components
      SalesByInstructorView.jsx # Instructor sales list view
      InstructorDetailView.jsx  # Instructor detail component
    /overdue            # Overdue payments view components
      OverduePaymentsView.jsx   # Overdue payments management
    /paid               # Paid payments view components
      PaidPaymentsView.jsx      # Paid payments management
  SalesManagementContent.jsx # Main container component
  index.js              # Main export file
```

## Component Responsibilities

- **SalesManagementContent**: Main container component that handles tab switching
- **SalesOverviewView**: Displays sales overview metrics and summary
- **SalesByClassView**: Displays sales data organized by class
- **SalesByInstructorView**: Displays sales data organized by instructor
- **OverduePaymentsView**: Displays overdue payment information
- **PaidPaymentsView**: Displays paid payment information

## Data Flow

1. Custom hooks handle data fetching and state management
2. Main container manages tab state and renders appropriate view
3. Each view component uses custom hooks to fetch its specific data
4. Shared components receive data via props and handle UI presentation

## Code Organization Principles

- **Single Responsibility**: Each component has a clear, focused purpose
- **Separation of Concerns**: UI components are separated from data fetching logic
- **Reusability**: Common UI patterns are extracted into reusable components
- **Maintainability**: Files are kept under 300 lines with focused functionality
- **Consistent Naming**: Components follow a consistent naming convention