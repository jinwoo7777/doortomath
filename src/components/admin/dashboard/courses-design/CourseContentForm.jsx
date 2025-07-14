import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const CourseContentForm = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>강의 설명</FormLabel>
            <FormControl>
              <Textarea
                placeholder="강의에 대한 상세 설명을 입력하세요."
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="what_you_will_learn"
        render={({ field }) => (
          <FormItem>
            <FormLabel>학습 목표 (각 줄에 하나씩 입력)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="이 강의를 통해 무엇을 배울지 구체적으로 작성하세요.\n예: React의 기본 개념 이해\n상태 관리 라이브러리 사용법 숙지"
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>필요한 사전 지식 (각 줄에 하나씩 입력)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="이 강의를 수강하기 위해 필요한 사전 지식이나 준비물을 작성하세요.\n예: JavaScript 기본 문법 이해\nHTML/CSS 기초 지식"
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="includes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>강의 포함 내용 (선택 사항)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="이 강의에 포함된 추가 자료나 특별한 내용을 작성하세요.\n예: 프로젝트 소스 코드 제공\nQ&A 세션 포함"
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CourseContentForm;
