import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PlayCircle, ChevronRight, Clock, User, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const ClassList = () => {
  // 샘플 데이터 - 실제로는 API에서 가져올 예정
  const classes = [
    {
      id: 1,
      title: '수학의 정석 - 기초편',
      instructor: '김수학',
      progress: 65,
      nextLesson: '2-3. 방정식의 활용',
      image: '/images/class-math.jpg',
      category: '수학',
      totalLessons: 24,
      completedLessons: 16,
    },
    {
      id: 2,
      title: '영어 독해의 기술',
      instructor: '이영어',
      progress: 30,
      nextLesson: 'Chapter 5. 주제문 찾기',
      image: '/images/class-english.jpg',
      category: '영어',
      totalLessons: 30,
      completedLessons: 9,
    },
    {
      id: 3,
      title: '과학 탐구 실험',
      instructor: '박과학',
      progress: 45,
      nextLesson: '3-1. 물질의 상태 변화',
      image: '/images/class-science.jpg',
      category: '과학',
      totalLessons: 18,
      completedLessons: 8,
    },
  ];

  // 빈 클래스 목록 표시 컴포넌트
  const EmptyClassList = () => (
    <Card>
      <CardHeader>
        <CardTitle>수강 중인 클래스</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-10">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-lg font-medium mb-2">수강 중인 클래스가 없습니다</h3>
        <p className="text-muted-foreground mb-6">새로운 클래스를 찾아보고 학습을 시작해보세요!</p>
        <Button asChild>
          <Link href="/classes">클래스 탐색하기</Link>
        </Button>
      </CardContent>
    </Card>
  );

  // 그리드 뷰 카드 컴포넌트
  const GridCard = ({ course }) => (
    <Card key={course.id} className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-40 bg-muted">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder-course.jpg';
          }}
        />
        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
          {course.category}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">{course.instructor} 강사</span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">북마크</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">진도율</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>다음 강의: {course.nextLesson}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <span>완료한 강의: </span>
            <span className="font-medium text-foreground">
              {course.completedLessons}/{course.totalLessons}개
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full" size="sm">
          <Link href={`/dashboard/courses/${course.id}`}>
            <PlayCircle className="h-4 w-4 mr-2" />
            이어서 학습하기
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  // 리스트 뷰 카드 컴포넌트
  const ListCard = ({ course }) => (
    <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="grid md:grid-cols-4">
        <div className="relative group">
          <div 
            className="bg-cover bg-center pt-[56.25%] relative"
            style={{
              backgroundImage: `url(${course.image})`,
            }}
          >
            <div className="absolute top-2 left-2">
              <Badge variant="secondary">{course.category}</Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PlayCircle className="h-8 w-8 text-primary" />
            </Button>
          </div>
        </div>
        <div className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-3">
              <h3 className="text-lg font-medium">{course.title}</h3>
              <Badge variant="outline" className="whitespace-nowrap">
                {course.completedLessons} / {course.totalLessons} 강의
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <PlayCircle className="h-4 w-4 text-primary mr-1" />
              <span>다음 수업: {course.nextLesson}</span>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );

  // 메인 렌더링 로직
  if (classes.length === 0) {
    return <EmptyClassList />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">내 노트</h2>
        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
          <Link href="/dashboard/courses">
            전체 보기 <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((course) => (
          <GridCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default ClassList;
