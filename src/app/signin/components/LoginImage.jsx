"use client";

export default function LoginImage() {
  return (
    <div className="relative hidden lg:flex flex-col justify-center items-start p-16 lg:w-1/2 text-white rounded-l-2xl overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-[url('/login_Image03.jpg')] bg-cover bg-center">       
      </div>
      <div className="max-w-md relative z-10">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-md">대치 수학의문</h1>
        <h2 className="text-2xl font-semibold mb-4 text-white/90 drop-shadow-md">지금 로그인하고 최적의 학습 환경을 경험하세요.</h2>
        <p className="text-white/80 drop-shadow">수학의 문에서 합격의 문을 열어드립니다.</p>        
      </div>
    </div>
  );
}
