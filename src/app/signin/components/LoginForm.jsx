"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm({
  formData,
  error,
  loading,
  isLocked,
  showPassword,
  emailConfirmationSent,
  email,
  handleChange,
  togglePasswordVisibility,
  handleSubmit,
  getLoginButtonText
}) {
  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white w-full flex flex-col justify-center p-8 sm:p-12 lg:rounded-r-2xl"
      aria-label="로그인 폼"
      noValidate
    >
      <div className="w-full">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">로그인</h1>
          <p className="text-gray-500">대치 수학의문 계정으로 로그인하세요</p>
        </div>
      
      {emailConfirmationSent && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
          인증 이메일을 {email}로 전송했습니다. 이메일을 확인해주세요.
        </div>
      )}

      {error?.message && !error.field && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error.message}
        </div>
      )}



      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          아이디
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-500 transition-colors ${
              error?.field === 'email' ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="아이디를 입력하세요"
            disabled={loading || isLocked}
            required
            aria-required="true"
            aria-invalid={error?.field === 'email' ? 'true' : 'false'}
            aria-describedby={error?.field === 'email' ? 'email-error' : undefined}
            autoComplete="username"
          />
        </div>
        {error?.field === 'email' && (
          <p id="email-error" className="mt-1 text-sm text-red-600">{error.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
              error?.field === 'password' ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="비밀번호를 입력하세요"
            disabled={loading || isLocked}
            required
            aria-required="true"
            aria-invalid={error?.field === 'password' ? 'true' : 'false'}
            aria-describedby={error?.field === 'password' ? 'password-error' : undefined}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 px-4 flex items-center focus:outline-none text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
          >
            {showPassword ? '숨기기' : '표시'}
          </button>
        </div>
        {error?.field === 'password' && (
          <p id="password-error" className="mt-1 text-sm text-red-600">{error.message}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-[#6440FB] focus:ring-[#6440FB] border-gray-300 rounded"
            disabled={loading || isLocked}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            아이디 저장
          </label>
        </div>
        <div className="text-sm space-x-4">
          <Link href="/find-id" className="text-gray-600 hover:text-[#6440FB]">
            아이디 찾기
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/find-password" className="text-gray-600 hover:text-[#6440FB]">
            비밀번호 찾기
          </Link>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading || isLocked}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
          loading || isLocked
            ? 'bg-[#6440FB]/70 cursor-not-allowed'
            : 'bg-[#6440FB] hover:bg-[#5635d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6440FB] transition-colors'
        }`}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            로그인 중...
          </>
        ) : isLocked ? (
          '잠시 후 다시 시도해주세요'
        ) : (
          '로그인'
        )}
      </button>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          아직 회원이 아니신가요?{' '}
          <Link href="/signup" className="font-medium text-[#6440FB] hover:text-[#5635d9]">
            회원가입
          </Link>
        </p>
      </div>
      
      </div>
    </form>
  );
}
