import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const CourseDetailsForm = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="details.level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>난이도</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="난이도를 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="초급">초급</SelectItem>
                <SelectItem value="중급">중급</SelectItem>
                <SelectItem value="고급">고급</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>강의 시간</FormLabel>
            <FormControl>
              <Input placeholder="예: 2시간 30분 또는 2.5h" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.total_lectures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>총 강의 수</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="총 강의 수를 입력하세요"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="seats"
        render={({ field }) => (
          <FormItem>
            <FormLabel>좌석 수</FormLabel>
            <FormControl>
              <Input type="number" placeholder="예: 150" {...field} onChange={(e)=>field.onChange(parseInt(e.target.value,10))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="semesters"
        render={({ field }) => (
          <FormItem>
            <FormLabel>학기 수</FormLabel>
            <FormControl>
              <Input type="number" placeholder="예: 12" {...field} onChange={(e)=>field.onChange(parseInt(e.target.value,10))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="weeks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>기간 (주)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="예: 10" {...field} onChange={(e)=>field.onChange(parseInt(e.target.value,10))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="details.thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>썸네일 이미지 URL</FormLabel>
            <FormControl>
              <Input placeholder="썸네일 이미지 URL을 입력하세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.video_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>강의 소개 영상 URL</FormLabel>
            <FormControl>
              <Input placeholder="YouTube 또는 Vimeo 영상 URL을 입력하세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>강의 언어</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="강의 언어를 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="한국어">한국어</SelectItem>
                <SelectItem value="영어">영어</SelectItem>
                <SelectItem value="일본어">일본어</SelectItem>
                <SelectItem value="중국어">중국어</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.subtitle_languages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>자막 언어 (쉼표로 구분)</FormLabel>
            <FormControl>
              <Input placeholder="예: 한국어, 영어" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.certificate_available"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">수료증 발급 가능</FormLabel>
              <FormDescription>
                수강생에게 수료증 발급이 가능한 강의인지 설정합니다.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="수료증 발급 가능 여부"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default CourseDetailsForm;
