'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import AnswerKeyBasicInfo from './AnswerKeyBasicInfo';
import AnswersList from './AnswersList';
import ExcelUpload from '../excel/ExcelUpload';
import { useAnswerKeyForm } from '../hooks/useAnswerKeyForm';

/**
 * 답안 키 폼 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.initialData - 초기 데이터 (수정 시)
 * @param {Function} props.onSave - 저장 완료 후 콜백 함수
 * @param {Function} props.onBack - 뒤로 가기 콜백 함수
 * @returns {JSX.Element} 답안 키 폼 컴포넌트
 */
const AnswerKeyForm = ({ initialData = null, onSave, onBack }) => {
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  
  const {
    formData,
    teachers,
    filteredSchedules,
    loading,
    errors,
    handleInputChange,
    handleAnswerChange,
    addAnswer,
    removeAnswer,
    handleSubmit,
    handleExcelDataParsed
  } = useAnswerKeyForm(initialData, onSave, onBack);

  // 엑셀 업로드 토글
  const toggleExcelUpload = () => {
    setShowExcelUpload(!showExcelUpload);
  };

  // 엑셀 데이터 확인 처리
  const handleExcelConfirm = (excelData) => {
    handleExcelDataParsed(excelData);
    setShowExcelUpload(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{initialData ? '답안 키 수정' : '새 답안 키 생성'}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={toggleExcelUpload}>
              {showExcelUpload ? '직접 입력' : '엑셀 업로드'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showExcelUpload ? (
        <ExcelUpload onConfirm={handleExcelConfirm} onCancel={() => setShowExcelUpload(false)} />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <AnswerKeyBasicInfo
              formData={formData}
              teachers={teachers}
              filteredSchedules={filteredSchedules}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            <AnswersList
              answers={formData.answers}
              errors={errors}
              handleAnswerChange={handleAnswerChange}
              addAnswer={addAnswer}
              removeAnswer={removeAnswer}
            />

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  폼에 오류가 있습니다. 모든 필수 항목을 올바르게 입력해주세요.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  뒤로
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
};

export default AnswerKeyForm;
