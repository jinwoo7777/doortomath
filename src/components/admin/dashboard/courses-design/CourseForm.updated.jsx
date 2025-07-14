'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, HelpCircle, Loader2, Trash2, XCircle, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { supabase } from '@/lib/supabase';


// ... (previous code remains the same until the certificate_available field)

// In the form schema, update the certificate_available field to use the new toggle
// Replace the Switch component with a Button-based toggle in the form render

// In the form render, replace the Switch component with:
<FormField
  control={form.control}
  name="details.certificate_available"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">수료증 발급</FormLabel>
        <p className="text-sm text-muted-foreground">
          이 강의를 수료한 학습자에게 수료증을 발급합니다.
        </p>
      </div>
      <FormControl>
        <Button
          type="button"
          variant={field.value ? "default" : "outline"}
          className={`flex items-center space-x-2 ${field.value ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => field.onChange(!field.value)}
        >
          {field.value ? (
            <>
              <Check className="h-4 w-4" />
              <span>활성화됨</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>비활성화됨</span>
            </>
          )}
        </Button>
      </FormControl>
    </FormItem>
  )}
/>
