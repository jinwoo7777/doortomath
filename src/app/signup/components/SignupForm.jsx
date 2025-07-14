"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SignupForm({
  formData,
  error,
  loading,
  handleChange,
  handleSubmit,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-4xl mx-auto flex flex-col justify-center p-8 sm:p-12 lg:rounded-2xl"
      aria-label="회원가입 폼"
      noValidate
    >
      <div className="w-full max-w-full">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-500">대치 수학의문에 오신 것을 환영합니다</p>
        </div>

        {error?.message && !error.field && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* 왼쪽 열: 이름, 이메일, 전화번호, 비밀번호 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                  error?.field === 'name' ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="이름을 입력하세요"
                required
                aria-required="true"
                aria-invalid={error?.field === 'name' ? 'true' : 'false'}
                aria-describedby={error?.field === 'name' ? 'name-error' : undefined}
              />
              {error?.field === 'name' && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                  error?.field === 'email' ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="이메일을 입력하세요"
                required
                aria-required="true"
                aria-invalid={error?.field === 'email' ? 'true' : 'false'}
                aria-describedby={error?.field === 'email' ? 'email-error' : undefined}
              />
              {error?.field === 'email' && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
            </div>


          </div>

          {/* 오른쪽 열: 학교, 학년, 보호자 연락처 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors pr-12 ${
                    error?.field === 'password' ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호 입력 (6자 이상)"
                  required
                  minLength={6}
                  aria-required="true"
                  aria-invalid={error?.field === 'password' ? 'true' : 'false'}
                  aria-describedby={error?.field === 'password' ? 'password-error' : 'password-help'}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 px-4 flex items-center focus:outline-none text-gray-500 hover:text-[#6440FB]"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  {showPassword ? '숨기기' : '표시'}
                </button>
              </div>
              <p id="password-help" className="mt-1 text-xs text-gray-500">
                영문, 숫자 조합 6자 이상 입력해주세요
              </p>
              {error?.field === 'password' && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                  error?.field === 'confirmPassword' ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 다시 입력하세요"
                required
                aria-required="true"
                aria-invalid={error?.field === 'confirmPassword' ? 'true' : 'false'}
                aria-describedby={
                  error?.field === 'confirmPassword' ? 'confirmPassword-error' : undefined
                }
              />
              {error?.field === 'confirmPassword' && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                학교 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                  error?.field === 'school' ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="학교명을 입력하세요"
                required
                aria-required="true"
                aria-invalid={error?.field === 'school' ? 'true' : 'false'}
                aria-describedby={error?.field === 'school' ? 'school-error' : undefined}
              />
              {error?.field === 'school' && (
                <p id="school-error" className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                학년 <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                  error?.field === 'grade' ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-required="true"
                aria-invalid={error?.field === 'grade' ? 'true' : 'false'}
                aria-describedby={error?.field === 'grade' ? 'grade-error' : undefined}
              >
                <option value="">학년을 선택하세요</option>
                <option value="중1">중학교 1학년</option>
                <option value="중2">중학교 2학년</option>
                <option value="중3">중학교 3학년</option>
                <option value="">-----------------</option>
                <option value="고1">고등학교 1학년</option>
                <option value="고2">고등학교 2학년</option>
                <option value="고3">고등학교 3학년</option>
              </select>
              {error?.field === 'grade' && (
                <p id="grade-error" className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                error?.field === 'phone' ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="010-0000-0000"
              required
              aria-required="true"
              pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
              aria-invalid={error?.field === 'phone' ? 'true' : 'false'}
              aria-describedby={error?.field === 'phone' ? 'phone-error' : undefined}
            />
            {error?.field === 'phone' && (
              <p id="phone-error" className="mt-1 text-sm text-red-600">
                {error.message}
              </p>
            )}
          </div>

          {/* 보호자 연락처 */}
          <div>
            <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
              보호자 연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="parentPhone"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              className={`w-full px-3 py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-[#6440FB] focus:border-[#6440FB] transition-colors ${
                error?.field === 'parentPhone' ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="010-0000-0000"
              required
              aria-required="true"
              pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
              aria-invalid={error?.field === 'parentPhone' ? 'true' : 'false'}
              aria-describedby={error?.field === 'parentPhone' ? 'parent-phone-error' : undefined}
            />
            {error?.field === 'parentPhone' && (
              <p id="parent-phone-error" className="mt-1 text-sm text-red-600">
                {error.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              비상연락처로 사용됩니다.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
              loading
                ? 'bg-[#6440FB]/70 cursor-not-allowed'
                : 'bg-[#6440FB] hover:bg-[#5635d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6440FB] transition-colors'
            }`}
            aria-busy={loading}
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            이미 회원이신가요?{' '}
            <Link href="/signin" className="font-medium text-[#6440FB] hover:text-[#5635d9]">
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
