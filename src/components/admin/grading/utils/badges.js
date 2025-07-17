import { Badge } from '@/components/ui/badge';

/**
 * 시험 유형에 따른 배지 컴포넌트를 반환합니다.
 * @param {string} type - 시험 유형 (regular, midterm, final, quiz)
 * @returns {JSX.Element} 배지 컴포넌트
 */
export const getExamTypeBadge = (type) => {
  const types = {
    regular: { label: '정기시험', color: 'bg-blue-500' },
    midterm: { label: '중간고사', color: 'bg-green-500' },
    final: { label: '기말고사', color: 'bg-red-500' },
    quiz: { label: '퀴즈', color: 'bg-yellow-500' }
  };
  
  const typeInfo = types[type] || { label: type, color: 'bg-gray-500' };
  return (
    <Badge className={`text-white ${typeInfo.color}`}>
      {typeInfo.label}
    </Badge>
  );
};

/**
 * 점수 백분율에 따른 등급 배지 컴포넌트를 반환합니다.
 * @param {number} percentage - 점수 백분율
 * @returns {JSX.Element} 배지 컴포넌트
 */
export const getScoreBadge = (percentage) => {
  if (percentage >= 90) return <Badge className="bg-green-500 text-white">우수</Badge>;
  if (percentage >= 80) return <Badge className="bg-blue-500 text-white">양호</Badge>;
  if (percentage >= 70) return <Badge className="bg-yellow-500 text-white">보통</Badge>;
  if (percentage >= 60) return <Badge className="bg-orange-500 text-white">미흡</Badge>;
  return <Badge className="bg-red-500 text-white">불량</Badge>;
};
