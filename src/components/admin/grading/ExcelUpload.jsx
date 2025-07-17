'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineSpinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExcelUpload({ onDataParsed, onBack }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = async (file) => {
    setLoading(true);
    setErrors([]);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // 첫 번째 시트 선택
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // JSON으로 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        setErrors(['엑셀 파일에 데이터가 없습니다.']);
        return;
      }
      
      // 데이터 검증 및 변환
      const validatedData = validateAndTransformData(jsonData);
      setParsedData(validatedData);
      
    } catch (error) {
      console.error('엑셀 파일 파싱 오류:', error);
      setErrors(['엑셀 파일을 읽는 중 오류가 발생했습니다.']);
    } finally {
      setLoading(false);
    }
  };

  const validateAndTransformData = (rawData) => {
    const errors = [];
    const validRows = [];
    
    // 헤더 행 확인 (첫 번째 행)
    const headers = rawData[0];
    const expectedHeaders = ['문제번호', '정답', '점수', '설명'];
    
    if (!headers || headers.length < 3) {
      errors.push('엑셀 파일에 필수 헤더가 없습니다. (문제번호, 정답, 점수)');
      setErrors(errors);
      return null;
    }
    
    // 데이터 행 처리 (두 번째 행부터)
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      if (!row || row.length === 0) continue; // 빈 행 건너뛰기
      
      const questionNumber = row[0];
      const answer = row[1];
      const score = row[2];
      const description = row[3] || '';
      
      // 필수 필드 검증
      if (!questionNumber) {
        errors.push(`${i + 1}행: 문제번호가 필요합니다.`);
        continue;
      }
      
      if (!answer) {
        errors.push(`${i + 1}행: 정답이 필요합니다.`);
        continue;
      }
      
      if (!score || isNaN(score) || score <= 0) {
        errors.push(`${i + 1}행: 유효한 점수가 필요합니다.`);
        continue;
      }
      
      validRows.push({
        question: parseInt(questionNumber),
        answer: String(answer).trim(),
        score: parseInt(score),
        description: String(description).trim(),
        rowNumber: i + 1
      });
    }
    
    setErrors(errors);
    return validRows;
  };

  const downloadTemplate = () => {
    const templateData = [
      ['문제번호', '정답', '점수', '설명'],
      [1, '1', 5, '첫 번째 문제의 정답'],
      [2, '2', 5, '두 번째 문제의 정답'],
      [3, '3', 10, '세 번째 문제의 정답'],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '답안 템플릿');
    
    // 파일 다운로드
    XLSX.writeFile(wb, '답안_템플릿.xlsx');
  };

  const handleConfirm = () => {
    if (parsedData && parsedData.length > 0) {
      onDataParsed(parsedData);
    }
  };

  const getTotalScore = () => {
    if (!parsedData) return 0;
    return parsedData.reduce((sum, item) => sum + item.score, 0);
  };

  return (
    <div className="space-y-6">

      {/* 템플릿 다운로드 */}
      <Card>
        <CardHeader>
          <CardTitle>1단계: 템플릿 다운로드</CardTitle>
          <CardDescription>
            아래 버튼을 클릭하여 답안 입력 템플릿을 다운로드하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            답안 템플릿 다운로드
          </Button>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">템플릿 사용 방법:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 문제번호: 1, 2, 3... 순서대로 입력</li>
              <li>• 정답: 문제의 정답을 입력</li>
              <li>• 점수: 각 문제의 점수를 입력</li>
              <li>• 설명: 답에 대한 설명 (선택사항)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 파일 업로드 */}
      <Card>
        <CardHeader>
          <CardTitle>2단계: 엑셀 파일 업로드</CardTitle>
          <CardDescription>
            작성한 답안 파일을 업로드하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="excel-file">엑셀 파일 선택</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={loading}
              />
            </div>
            
            {file && (
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  선택된 파일: {file.name}
                </span>
                <Badge variant="outline">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}
            
            {loading && (
              <div className="flex items-center space-x-2">
                <InlineSpinner />
                <span className="text-sm">파일을 처리 중입니다...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 오류 메시지 */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-red-800">다음 오류를 수정해주세요:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 데이터 미리보기 */}
      {parsedData && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>3단계: 데이터 미리보기</span>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  총 {parsedData.length}문제 / {getTotalScore()}점
                </Badge>
                <div className="flex space-x-2">
                  <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    답안 등록하기
                  </Button>
                  <Button variant="outline" onClick={onBack}>
                    취소
                  </Button>
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              업로드된 답안 데이터를 확인하고 등록하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>문제번호</TableHead>
                  <TableHead>정답</TableHead>
                  <TableHead>점수</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{item.question}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">{item.answer}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.score}점</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {item.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}