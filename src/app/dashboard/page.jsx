

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { loading, roleLoaded, getDashboardPath } = useAuth();
  const router = useRouter();



  return null;
}
