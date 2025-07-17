'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';

/**
 * 엑셀 파일 업로드 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Function} props.onConfirm - 확인 핸들러
 * @param {Function} props.onCancel - 취소 핸들러
 * @returns {JSX.Element} 엑셀 파일 업로드 컴포넌트
 */
const ExcelUpload = ({ onConfirm, onCancel }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // 엑셀 파일 처리
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  // 엑셀 파일 파싱
  const parseExcelFile = (file) => {
    setLoading(true);
    setErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 첫 번째 시트 사용
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // 데이터 유효성 검사
        validateExcelData(jsonData);
      } catch (error) {
        setErrors([`파일 처리 중 오류가 발생했습니다: ${error.message}`]);
        setParsedData([]);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setErrors(['파일을 읽는 중 오류가 발생했습니다.']);
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // 엑셀 데이터 유효성 검사
  const validateExcelData = (jsonData) => {
    const validationErrors = [];
    const validData = [];
    
    // 필수 열 확인
    const requiredColumns = ['question', 'answer', 'score'];
    
    if (jsonData.length === 0) {
      validationErrors.push('엑셀 파일에 데이터가 없습니다.');
      setParsedData([]);
      setErrors(validationErrors);
      return;
    }
    
    // 첫 번째 행의 열 확인
    const firstRow = jsonData[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      validationErrors.push(`필수 열이 누락되었습니다: ${missingColumns.join(', ')}`);
      setParsedData([]);
      setErrors(validationErrors);
      return;
    }
    
    // 각 행 검사
    jsonData.forEach((row, index) => {
      const rowErrors = [];
      
      // 문제 번호 검사
      if (row.question === undefined || row.question === null || isNaN(row.question)) {
        rowErrors.push(`문제 번호가 유효하지 않습니다.`);
      }
      
      // 정답 검사
      if (row.answer === undefined || row.answer === null || row.answer === '') {
        rowErrors.push(`정답이 비어 있습니다.`);
      }
      
      // 점수 검사
      if (row.score === undefined || row.score === null || isNaN(row.score) || row.score <= 0) {
        rowErrors.push(`점수가 유효하지 않습니다.`);
      }
      
      if (rowErrors.length > 0) {
        validationErrors.push(`${index + 1}번 행: ${rowErrors.join(' ')}`);
      } else {
        // 유효한 데이터 추가
        validData.push({
          question: parseInt(row.question),
          answer: row.answer.toString(),
          score: parseInt(row.score),
          description: row.description || ''
        });
      }
    });
    
    setParsedData(validData);
    setErrors(validationErrors);
  };

  // 템플릿 다운로드
  const downloadTemplate = () => {
    // 템플릿 데이터 생성
    const templateData = [
      { question: 1, answer: '정답1', score: 5, description: '설명1' },
      { question: 2, answer: '정답2', score: 10, description: '설명2' }
    ];
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '답안');
    
    // 파일 다운로드
    XLSX.writeFile(wb, '답안_템플릿.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>엑셀 파일로 답안 업로드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 파일 업로드 영역 */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium">
                {file ? file.name : '엑셀 파일을 선택하세요'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                .xlsx 또는 .xls 파일만 지원
              </span>
            </label>
          </div>
          
          {/* 템플릿 다운로드 버튼 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              템플릿 다운로드
            </Button>
          </div>
          
          {/* 오류 메시지 */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* 파싱된 데이터 미리보기 */}
          {parsedData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">파싱된 데이터 미리보기</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>문제 번호</TableHead>
                      <TableHead>정답</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>설명</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.question}</TableCell>
                        <TableCell>{row.answer}</TableCell>
                        <TableCell>{row.score}</TableCell>
                        <TableCell>{row.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center"
        >
          <X className="mr-2 h-4 w-4" />
          취소
        </Button>
        <Button
          onClick={() => onConfirm(parsedData)}
          disabled={parsedData.length === 0 || errors.length > 0 || loading}
          className="flex items-center"
        >
          <Check className="mr-2 h-4 w-4" />
          확인
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExcelUpload;
