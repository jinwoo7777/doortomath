// src/components/admin/dashboard/instructor-management/utils/formatUtils.js
export const getDayName = (dayOfWeek) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일'];
    return days[dayOfWeek] || '';
  };
  
  export const getBranchName = (branch) => {
    switch(branch) {
      case 'bukwirye': return '북위례';
      case 'namwirye': return '남위례';
      case 'daechi': return '대치';
      default: return '대치';
    }
  };
  