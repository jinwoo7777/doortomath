// AdvancedCourseEditor.jsx (메인 컨테이너)
"use client"

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourseForm } from './hooks/useCourseForm';
import { useCourseCategories } from './hooks/useCourseCategories';
import { useCourseSubmission } from './hooks/useCourseSubmission';

// 컴포넌트 임포트 - 디테일 페이지 구조에 맞춰 재구성
import { ActionButtons } from './components/ActionButtons';
import { StatusBanner } from './components/StatusBanner';

// 디테일 페이지의 6개 탭에 맞춘 섹션들
import { AcademyOverviewSection } from './components/AcademyOverviewSection';  // 탭1: 학원 소개
import { ProgramCurriculumSection } from './components/ProgramCurriculumSection';  // 탭2: 수업 프로그램  
import { InstructorTeamSection } from './components/InstructorTeamSection';  // 탭3: 강사진
import { AcademyBenefitsSection } from './components/AcademyBenefitsSection';  // 탭4: 학원 특징
import { AchievementsReviewsSection } from './components/AchievementsReviewsSection';  // 탭5: 성과 및 후기
import { ManagementSystemSection } from './components/ManagementSystemSection';  // 탭6: 관리 시스템

// 사이드바 섹션들
import { PublishSettings } from './components/PublishSettings';
import { CategoryTagsSection } from './components/CategoryTagsSection';
import { CourseInfoSection } from './components/CourseInfoSection';
import { MediaSection } from './components/MediaSection';
import { ScheduleSection } from './components/ScheduleSection';

export function AdvancedCourseEditor({ onSaveSuccess, editingCourse = null }) {
  const { session, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // 커스텀 훅 사용
  const {
    formData,
    tagInput,
    setTagInput,
    handleChange,
    addTag,
    removeTag,
    handleTagKeyPress,
    addListItem,
    removeListItem
  } = useCourseForm(editingCourse);
  
  const categories = useCourseCategories(session, userRole);
  
  const {
    isSaving,
    primaryAction,
    handleSave,
    handlePreview
  } = useCourseSubmission(formData, onSaveSuccess, editingCourse, session, userRole);

  // 디테일 페이지의 탭 구조에 맞춘 탭 정의
  const tabs = [
    { id: 'overview', label: '학원 소개', icon: 'info-circle' },
    { id: 'curriculum', label: '수업 프로그램', icon: 'book' },
    { id: 'instructor', label: '강사진', icon: 'user-tie' },
    { id: 'benefits', label: '학원 특징', icon: 'gift' },
    { id: 'reviews', label: '성과 및 후기', icon: 'star' },
    { id: 'methods', label: '관리 시스템', icon: 'chart-line' }
  ];

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <ActionButtons 
        isSaving={isSaving}
        primaryAction={primaryAction}
        handleSave={handleSave}
        handlePreview={handlePreview}
        formData={formData}
        editingCourse={editingCourse}
      />

      {/* 현재 상태 및 다음 액션 안내 */}
      <StatusBanner 
        formData={formData}
        primaryAction={primaryAction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 메인 콘텐츠 - 탭 기반 편집 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`fas fa-${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <AcademyOverviewSection 
                formData={formData} 
                handleChange={handleChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}
            
            {activeTab === 'curriculum' && (
              <ProgramCurriculumSection 
                formData={formData}
                handleChange={handleChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}
            
            {activeTab === 'instructor' && (
              <InstructorTeamSection 
                formData={formData}
                handleChange={handleChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}
            
            {activeTab === 'benefits' && (
              <AcademyBenefitsSection 
                formData={formData}
                handleChange={handleChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}
            
            {activeTab === 'reviews' && (
              <AchievementsReviewsSection 
                formData={formData}
                handleChange={handleChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}
            
            {activeTab === 'methods' && (
              <ManagementSystemSection 
                formData={formData}
                handleChange={handleChange}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}
          </div>
        </div>
        
        {/* 사이드바 - 설정 및 메타데이터 */}
        <div className="space-y-6">
          <PublishSettings 
            formData={formData}
            handleChange={handleChange}
            primaryAction={primaryAction}
          />
          
          <CategoryTagsSection 
            formData={formData}
            categories={categories}
            tagInput={tagInput}
            setTagInput={setTagInput}
            handleChange={handleChange}
            addTag={addTag}
            removeTag={removeTag}
            handleTagKeyPress={handleTagKeyPress}
          />
          
          <CourseInfoSection 
            formData={formData}
            handleChange={handleChange}
          />
          
          <MediaSection 
            formData={formData}
            handleChange={handleChange}
          />
          
          <ScheduleSection 
            formData={formData}
            handleChange={handleChange}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        </div>
      </div>
    </div>
  );
}

export default AdvancedCourseEditor;
