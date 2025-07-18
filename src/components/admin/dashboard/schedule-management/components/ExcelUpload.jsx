"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

/**
 * 지점별 엑셀 업로드 컴포넌트
 */
const ExcelUpload = ({ 
  isOpen, 
  onClose, 
  branch,
  onUploadSuccess,
  getBranchName 
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 엑셀 템플릿 다운로드
  const downloadTemplate = () => {
    const templateData = [
      {
        '학년': '초등부',
        '요일': '월요일',
        '시간': '16:00-17:00',
        '과목': '수학',
        '강사명': '김선생',
        '교실': 'A101',
        '설명': '초등 수학 기초반',
        '최대인원': 15,
        '수업료': 120000,
        '수업료주기': '월별'
      },
      {
        '학년': '중등부',
        '요일': '화요일',
        '시간': '19:00-20:30',
        '과목': '수학',
        '강사명': '이선생',
        '교실': 'B201',
        '설명': '중등 수학 심화반',
        '최대인원': 12,
        '수업료': 150000,
        '수업료주기': '월별'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '시간표템플릿');
    
    // 컬럼 너비 설정
    ws['!cols'] = [
      { wch: 10 }, // 학년
      { wch: 10 }, // 요일
      { wch: 15 }, // 시간
      { wch: 10 }, // 과목
      { wch: 12 }, // 강사명
      { wch: 10 }, // 교실
      { wch: 20 }, // 설명
      { wch: 10 }, // 최대인원
      { wch: 12 }, // 수업료
      { wch: 12 }  // 수업료주기
    ];

    XLSX.writeFile(wb, `${getBranchName(branch)}_시간표_템플릿.xlsx`);
    toast.success('템플릿 다운로드가 완료되었습니다.');
  };

  // 파일 선택 처리
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        return;
      }
      setFile(selectedFile);
      setPreviewData([]);
      setValidationErrors([]);
      setIsPreviewMode(false);
    }
  };

  // 요일 변환 함수
  const getDayOfWeekNumber = (dayString) => {
    const dayMap = {
      '월요일': 1, '월': 1,
      '화요일': 2, '화': 2,
      '수요일': 3, '수': 3,
      '목요일': 4, '목': 4,
      '금요일': 5, '금': 5,
      '토요일': 6, '토': 6,
      '일요일': 0, '일': 0
    };
    return dayMap[dayString] !== undefined ? dayMap[dayString] : null;
  };

  // 데이터 유효성 검사
  const validateRowData = (row, index) => {
    const errors = [];
    const rowNum = index + 2; // 엑셀 행 번호 (헤더 포함)

    // 필수 필드 검사
    if (!row['학년']) errors.push(`${rowNum}행: 학년이 필요합니다.`);
    if (!row['요일']) errors.push(`${rowNum}행: 요일이 필요합니다.`);
    if (!row['시간']) errors.push(`${rowNum}행: 시간이 필요합니다.`);
    if (!row['과목']) errors.push(`${rowNum}행: 과목이 필요합니다.`);

    // 학년 검사
    if (row['학년'] && !['초등부', '중등부', '고등부'].includes(row['학년'])) {
      errors.push(`${rowNum}행: 학년은 '초등부', '중등부', '고등부' 중 하나여야 합니다.`);
    }

    // 요일 검사
    if (row['요일'] && getDayOfWeekNumber(row['요일']) === null) {
      errors.push(`${rowNum}행: 요일 형식이 올바르지 않습니다. (예: 월요일, 월)`);
    }

    // 시간 형식 검사 (예: 16:00-17:00)
    if (row['시간'] && !row['시간'].match(/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/)) {
      errors.push(`${rowNum}행: 시간 형식이 올바르지 않습니다. (예: 16:00-17:00)`);
    }

    // 최대인원 검사
    if (row['최대인원'] && (isNaN(row['최대인원']) || row['최대인원'] <= 0)) {
      errors.push(`${rowNum}행: 최대인원은 양수여야 합니다.`);
    }

    // 수업료 검사
    if (row['수업료'] && (isNaN(row['수업료']) || row['수업료'] < 0)) {
      errors.push(`${rowNum}행: 수업료는 0 이상의 숫자여야 합니다.`);
    }

    // 수업료주기 검사
    if (row['수업료주기'] && !['월별', '주별', '일별'].includes(row['수업료주기'])) {
      errors.push(`${rowNum}행: 수업료주기는 '월별', '주별', '일별' 중 하나여야 합니다.`);
    }

    return errors;
  };

  // 엑셀 파일 미리보기
  const previewFile = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            toast.error('엑셀 파일에 데이터가 없습니다.');
            return;
          }

          // 데이터 유효성 검사
          const allErrors = [];
          jsonData.forEach((row, index) => {
            const rowErrors = validateRowData(row, index);
            allErrors.push(...rowErrors);
          });

          setPreviewData(jsonData);
          setValidationErrors(allErrors);
          setIsPreviewMode(true);

          if (allErrors.length === 0) {
            toast.success(`${jsonData.length}개의 시간표 데이터를 확인했습니다.`);
          } else {
            toast.warning(`${allErrors.length}개의 오류가 발견되었습니다.`);
          }
        } catch (error) {
          console.error('파일 파싱 오류:', error);
          toast.error('엑셀 파일을 읽는 중 오류가 발생했습니다.');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('파일 읽기 오류:', error);
      toast.error('파일을 읽는 중 오류가 발생했습니다.');
      setUploading(false);
    }
  };

  // 시간표 데이터 변환
  const transformScheduleData = (excelRow) => {
    return {
      grade: excelRow['학년'],
      day_of_week: getDayOfWeekNumber(excelRow['요일']),
      time_slot: excelRow['시간'],
      subject: excelRow['과목'],
      teacher_name: excelRow['강사명'] || null,
      classroom: excelRow['교실'] || null,
      description: excelRow['설명'] || null,
      max_students: excelRow['최대인원'] ? parseInt(excelRow['최대인원']) : null,
      current_students: 0,
      price: excelRow['수업료'] ? parseFloat(excelRow['수업료']) : null,
      price_period: excelRow['수업료주기'] || '월별',
      branch: branch,
      is_active: true
    };
  };

  // 실제 업로드 실행
  const executeUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error('유효성 검사 오류를 먼저 수정해주세요.');
      return;
    }

    try {
      setUploading(true);
      
      // 데이터 변환
      const scheduleData = previewData.map(transformScheduleData);
      
      // 업로드 성공 콜백 호출
      const result = await onUploadSuccess(scheduleData);
      
      if (result.success) {
        toast.success(`${scheduleData.length}개의 시간표가 성공적으로 업로드되었습니다.`);
        handleClose();
      } else {
        throw new Error(result.error || '업로드 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      toast.error(error.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setIsPreviewMode(false);
    setUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {getBranchName(branch)} 시간표 엑셀 업로드
          </DialogTitle>
          <DialogDescription>
            엑셀 파일을 업로드하여 시간표를 일괄 등록할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 템플릿 다운로드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                엑셀 템플릿
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                올바른 형식으로 데이터를 입력하려면 템플릿을 다운로드하여 사용하세요.
              </p>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                템플릿 다운로드
              </Button>
            </CardContent>
          </Card>

          {/* 파일 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">파일 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {file && !isPreviewMode && (
                  <Button 
                    onClick={previewFile}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {uploading ? '파일 분석 중...' : '파일 미리보기'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 미리보기 및 유효성 검사 결과 */}
          {isPreviewMode && (
            <>
              {/* 유효성 검사 오류 */}
              {validationErrors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      유효성 검사 오류 ({validationErrors.length}개)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {validationErrors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 데이터 미리보기 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    데이터 미리보기 ({previewData.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-xs border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-2">학년</th>
                          <th className="border border-gray-200 p-2">요일</th>
                          <th className="border border-gray-200 p-2">시간</th>
                          <th className="border border-gray-200 p-2">과목</th>
                          <th className="border border-gray-200 p-2">강사명</th>
                          <th className="border border-gray-200 p-2">교실</th>
                          <th className="border border-gray-200 p-2">최대인원</th>
                          <th className="border border-gray-200 p-2">수업료</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            <td className="border border-gray-200 p-2">{row['학년']}</td>
                            <td className="border border-gray-200 p-2">{row['요일']}</td>
                            <td className="border border-gray-200 p-2">{row['시간']}</td>
                            <td className="border border-gray-200 p-2">{row['과목']}</td>
                            <td className="border border-gray-200 p-2">{row['강사명']}</td>
                            <td className="border border-gray-200 p-2">{row['교실']}</td>
                            <td className="border border-gray-200 p-2">{row['최대인원']}</td>
                            <td className="border border-gray-200 p-2">{row['수업료']?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ... 외 {previewData.length - 10}개 항목
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 업로드 실행 */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  취소
                </Button>
                <Button 
                  onClick={executeUpload}
                  disabled={uploading || validationErrors.length > 0}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? '업로드 중...' : '시간표 업로드'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelUpload;