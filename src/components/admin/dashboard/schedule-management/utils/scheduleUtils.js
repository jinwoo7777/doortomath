// src/components/admin/dashboard/schedule-management/utils/scheduleUtils.js
export const getBranchName = (branch) => {
    switch(branch) {
      case 'bukwirye': return '북위례';
      case 'namwirye': return '남위례';
      case 'daechi': return '대치';
      default: return '대치';
    }
  };
  
  export const getStats = (schedules) => {
    return {
      total: schedules.length,
      active: schedules.filter(s => s.is_active).length,
      totalStudents: schedules.reduce((sum, s) => sum + (s.current_students || 0), 0),
      maxCapacity: schedules.reduce((sum, s) => sum + (s.max_students || 0), 0)
    };
  };
  