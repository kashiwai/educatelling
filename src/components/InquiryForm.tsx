import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface InquiryFormProps {
  itemName: string;
  itemPrice: string;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function InquiryForm({ itemName, itemPrice, onClose }: InquiryFormProps) {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // Supabaseに保存（失敗しても続行）
      await supabase.from('applications_2026_03_11_21_20').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        child_age: 0,
        current_level: 'inquiry',
        selected_plan: itemName,
        message: data.message,
        status: 'pending'
      }]);
    } catch (_) {}

    // メール送信（mailto: でメールアプリを開く）
    const body = encodeURIComponent(
      `【お問い合わせ】\n\nお名前: ${data.name}\nメール: ${data.email}\n電話: ${data.phone}\n\n選択プラン/商品: ${itemName} (${itemPrice})\n\nメッセージ:\n${data.message}`
    );
    window.open(`mailto:yuna@metisbel.com?subject=${encodeURIComponent(`【お問い合わせ】${itemName}`)}&body=${body}`);

    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">お問い合わせありがとうございます！</h3>
        <p className="text-muted-foreground mb-6">
          メールアプリが開きましたので、そのまま送信してください。<br />
          担当者より2営業日以内にご連絡いたします。
        </p>
        <Button onClick={onClose}>閉じる</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <span className="font-semibold">{itemName}</span>
        <span className="text-muted-foreground ml-2">{itemPrice}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">お名前 *</Label>
        <Input
          id="name"
          placeholder="山田 太郎"
          {...register('name', { required: '必須項目です' })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          {...register('email', { required: '必須項目です' })}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+61 400 000 000"
          {...register('phone')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">メッセージ・ご質問</Label>
        <Textarea
          id="message"
          placeholder="ご質問・ご要望などをご記入ください"
          rows={3}
          {...register('message')}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />送信中...</>
        ) : (
          'お問い合わせを送信する'
        )}
      </Button>
    </form>
  );
}
