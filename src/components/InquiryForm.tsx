import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface InquiryFormProps {
  itemNames: string;
  itemPrice: string;
  paymentId?: string;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function InquiryForm({ itemNames, itemPrice, paymentId, onClose }: InquiryFormProps) {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      await supabase.from('applications_2026_03_11_21_20').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        child_age: 0,
        current_level: 'inquiry',
        selected_plan: itemNames,
        message: `[Payment ID: ${paymentId || 'N/A'}] ${data.message}`,
        status: paymentId ? 'approved' : 'pending',
      }]);
    } catch (_) {}

    const body = encodeURIComponent(
      `[Application Received]\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\n` +
      `Selected: ${itemNames} (${itemPrice})\n` +
      (paymentId ? `Payment ID: ${paymentId}\n` : '') +
      `\nMessage:\n${data.message}`
    );
    window.open(
      `mailto:yuna@metisbel.com?subject=${encodeURIComponent(`[Application] ${itemNames}`)}&body=${body}`
    );

    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Thank you for your application!</h3>
        <p className="text-muted-foreground mb-6">
          Your email app has opened — please send the pre-filled email.<br />
          We will get back to you within 2 business days.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {paymentId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          ✓ Payment complete. Please fill in your details below.
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <span className="font-semibold">{itemNames}</span>
        <span className="text-muted-foreground ml-2">{itemPrice}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input id="name" placeholder="Jane Smith" {...register('name', { required: 'Required' })} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input id="email" type="email" placeholder="example@email.com" {...register('email', { required: 'Required' })} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+61 400 000 000" {...register('phone')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message / Questions</Label>
        <Textarea id="message" placeholder="Any questions or requests..." rows={3} {...register('message')} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
          : 'Submit Application'}
      </Button>
    </form>
  );
}
