// components/AcademyBenefitsSection.jsx - 탭4: 학원 특징
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListEditor } from './ListEditor';
import { Gift, FileText, Laptop, Award, Shield, Star } from 'lucide-react';

export const AcademyBenefitsSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6">
      {/* 포함 혜택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            포함 혜택
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원에서 제공하는 특별 혜택과 서비스를 나열하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="포함 혜택"
            items={formData.includes || []}
            onAdd={(value) => addListItem('includes', value)}
            onRemove={(index) => removeListItem('includes', index)}
            placeholder="예: 개별 맞춤 학습 진도 관리"
          />
        </CardContent>
      </Card>

      {/* 제공 자료 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            제공 자료
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원에서 제공하는 교재, 자료, 문제집 등을 입력하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="제공 자료"
            items={formData.materials_provided || []}
            onAdd={(value) => addListItem('materials_provided', value)}
            onRemove={(index) => removeListItem('materials_provided', index)}
            placeholder="예: 맞춤형 교재 및 문제집"
          />
        </CardContent>
      </Card>

      {/* 필요 소프트웨어 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            필요 소프트웨어/도구
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            수업에 필요한 소프트웨어나 도구가 있다면 입력하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="필요 소프트웨어"
            items={formData.software_required || []}
            onAdd={(value) => addListItem('software_required', value)}
            onRemove={(index) => removeListItem('software_required', index)}
            placeholder="예: 계산기, 컴퓨터 등"
          />
        </CardContent>
      </Card>

      {/* 수료증 및 인증 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            수료증 및 인증
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="certificate_available"
              checked={formData.certificate_available || false}
              onChange={(e) => handleChange('certificate_available', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="certificate_available">수료증 발급 가능</Label>
          </div>

          {formData.certificate_available && (
            <div className="space-y-2">
              <Label htmlFor="certificate_requirements">수료증 발급 조건</Label>
              <Textarea
                id="certificate_requirements"
                value={formData.certificate_requirements || ''}
                onChange={(e) => handleChange('certificate_requirements', e.target.value)}
                placeholder="수료증 발급을 위한 조건을 입력하세요 (예: 출석률 80% 이상, 과제 완료 등)"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 환불 정책 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            환불 정책
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="refund_policy">환불 정책</Label>
            <Textarea
              id="refund_policy"
              value={formData.refund_policy || ''}
              onChange={(e) => handleChange('refund_policy', e.target.value)}
              placeholder="학원의 환불 정책을 명확히 기술하세요"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* 특별 프로그램 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            특별 프로그램 및 옵션
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trial_available"
                checked={formData.trial_available || false}
                onChange={(e) => handleChange('trial_available', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="trial_available">무료 체험 수업 제공</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="discussion_enabled"
                checked={formData.discussion_enabled || false}
                onChange={(e) => handleChange('discussion_enabled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="discussion_enabled">토론 및 질의응답 가능</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="qa_enabled"
                checked={formData.qa_enabled || false}
                onChange={(e) => handleChange('qa_enabled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="qa_enabled">개별 Q&A 지원</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결제 옵션 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 옵션</CardTitle>
          <p className="text-sm text-muted-foreground">
            학원에서 지원하는 결제 방법을 설정하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="결제 방법"
            items={formData.payment_options || []}
            onAdd={(value) => addListItem('payment_options', value)}
            onRemove={(index) => removeListItem('payment_options', index)}
            placeholder="예: 일시불, 분할납부, 카드결제"
          />
        </CardContent>
      </Card>

      {/* 할인 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>할인 및 프로모션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_price">할인 가격</Label>
              <Input
                id="discount_price"
                type="number"
                value={formData.discount_price || ''}
                onChange={(e) => handleChange('discount_price', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">할인율 (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage || ''}
                onChange={(e) => handleChange('discount_percentage', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};