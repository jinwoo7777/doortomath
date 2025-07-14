"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const UserProfileCard = () => {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">사용자 정보를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자';
  const email = user.email || '이메일 없음';

  return (
    <Card className="w-full">
      <CardContent className="p-6 text-center">
        <div className="relative inline-block mb-6">
          <div className="rounded-full bg-muted flex items-center justify-center w-24 h-24 mx-auto">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt={displayName}
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl text-muted-foreground">
                {getInitials(displayName)}
              </span>
            )}
          </div>
          <Badge 
            className="absolute -bottom-1 -right-1 translate-x-1/2 translate-y-1/2 h-6 w-6 p-0 rounded-full border-2 border-background bg-success flex items-center justify-center"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </Badge>
        </div>
        
        <h3 className="text-lg font-medium mb-1">
          {displayName}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {email}
        </p>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            학생
          </Badge>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            프리미엄
          </Badge>
        </div>
        
        <Button variant="outline" className="w-full">
          프로필 수정
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
