/**
 * @file 새로운 useAuth 훅 사용 예시 컴포넌트
 * @description 최적화된 인증 훅의 사용법을 보여주는 예시 컴포넌트
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const {
    // 상태
    session,
    loading,
    error,
    userRole,
    isAuthenticated,
    
    // 메서드
    signIn,
    signOut,
    hasRole,
    refreshSession,
    
    // 상수
    ROLES
  } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const result = await signIn(email, password);
    if (result.success) {
      console.log('로그인 성공!', result);
      setEmail('');
      setPassword('');
    } else {
      console.error('로그인 실패:', result.error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    console.log('로그아웃 완료');
  };

  const handleRefresh = async () => {
    await refreshSession();
    console.log('세션 갱신 완료');
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">인증 정보를 확인하는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        🔐 새로운 인증 시스템 테스트
      </h2>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 인증 상태 정보 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">현재 상태:</h3>
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">인증 상태:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isAuthenticated 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isAuthenticated ? '로그인됨' : '로그아웃됨'}
            </span>
          </div>
          
          {session && (
            <>
              <div>
                <span className="font-medium">사용자 ID:</span> 
                <span className="ml-2 text-gray-600">{session.user.id}</span>
              </div>
              <div>
                <span className="font-medium">이메일:</span> 
                <span className="ml-2 text-gray-600">{session.user.email}</span>
              </div>
            </>
          )}
          
          <div>
            <span className="font-medium">역할:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              userRole === ROLES.ADMIN ? 'bg-purple-100 text-purple-800' :
              userRole === ROLES.INSTRUCTOR ? 'bg-blue-100 text-blue-800' :
              userRole === ROLES.STUDENT ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {userRole || '없음'}
            </span>
          </div>
        </div>
      </div>

      {/* 로그인 폼 */}
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      ) : (
        /* 로그인 후 화면 */
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              환영합니다! 🎉
            </h3>
            <p className="text-gray-600">
              {userRole === ROLES.ADMIN && '관리자로 로그인하셨습니다.'}
              {userRole === ROLES.INSTRUCTOR && '강사로 로그인하셨습니다.'}
              {userRole === ROLES.STUDENT && '학생으로 로그인하셨습니다.'}
            </p>
          </div>

          {/* 역할 기반 권한 확인 */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">권한 확인:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>관리자 권한:</span>
                <span className={hasRole(ROLES.ADMIN) ? 'text-green-600' : 'text-red-600'}>
                  {hasRole(ROLES.ADMIN) ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>강사 권한:</span>
                <span className={hasRole(ROLES.INSTRUCTOR) ? 'text-green-600' : 'text-red-600'}>
                  {hasRole(ROLES.INSTRUCTOR) ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>학생 권한:</span>
                <span className={hasRole(ROLES.STUDENT) ? 'text-green-600' : 'text-red-600'}>
                  {hasRole(ROLES.STUDENT) ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              세션 갱신
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 사용법:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>1. 이메일과 비밀번호로 로그인하세요</div>
          <div>2. 역할별 권한을 확인하세요</div>
          <div>3. 세션 갱신 기능을 테스트하세요</div>
          <div>4. 로그아웃 후 상태 변화를 확인하세요</div>
        </div>
      </div>
    </div>
  );
} 