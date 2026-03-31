import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePayment } from '@/hooks/usePayment';
import { JAPANESE_LEVELS, formatPrice, type Plan, type ApplicationData } from '@/lib/index';

const formSchema = z.object({
  parentName: z.string().min(2, 'Please enter parent/guardian name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter phone number'),
  childName: z.string().min(2, 'Please enter child\'s name'),
  childAge: z.number().min(3, 'Age must be 3 or older').max(18, 'Age must be 18 or younger'),
  japaneseLevel: z.string().min(1, 'Please select Japanese level')
});

type FormData = z.infer<typeof formSchema>;

interface ApplicationFormProps {
  selectedPlan?: Plan;
  onSuccess?: () => void;
}

export function ApplicationForm({ selectedPlan, onSuccess }: ApplicationFormProps) {
  const [isCardReady, setIsCardReady] = useState(false);
  const { processPayment, isProcessing, error, success, resetPayment } = usePayment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      japaneseLevel: ''
    }
  });

  const japaneseLevel = watch('japaneseLevel');

  useEffect(() => {
    const loadSquareSDK = async () => {
      if ((window as any).Square) {
        setIsCardReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = () => setIsCardReady(true);
      document.body.appendChild(script);
    };

    loadSquareSDK();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!selectedPlan) {
      return;
    }

    const applicationData: ApplicationData = {
      parentName: data.parentName,
      email: data.email,
      phone: data.phone,
      childName: data.childName,
      childAge: data.childAge,
      japaneseLevel: data.japaneseLevel,
      planId: selectedPlan.id
    };

    try {
      await processPayment(applicationData, selectedPlan);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      >
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.2 }}
            >
              <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-primary" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">Thank you for your application!</h3>
            <p className="text-muted-foreground mb-6">
              Payment has been completed successfully. Please check your email for confirmation.
            </p>
            <Button
              onClick={() => {
                resetPayment();
                window.location.href = '/';
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Application Form</CardTitle>
          {selectedPlan && (
            <CardDescription className="text-base">
              {selectedPlan.name} - {formatPrice(selectedPlan.price, selectedPlan.currency)} / {selectedPlan.duration}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  placeholder="John Smith"
                  {...register('parentName')}
                  className={errors.parentName ? 'border-destructive' : ''}
                />
                {errors.parentName && (
                  <p className="text-sm text-destructive">{errors.parentName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+61 400 000 000"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName">Child's Name *</Label>
                <Input
                  id="childName"
                  placeholder="Emma Smith"
                  {...register('childName')}
                  className={errors.childName ? 'border-destructive' : ''}
                />
                {errors.childName && (
                  <p className="text-sm text-destructive">{errors.childName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="childAge">Child's Age *</Label>
                <Input
                  id="childAge"
                  type="number"
                  min="3"
                  max="18"
                  placeholder="8"
                  {...register('childAge', { valueAsNumber: true })}
                  className={errors.childAge ? 'border-destructive' : ''}
                />
                {errors.childAge && (
                  <p className="text-sm text-destructive">{errors.childAge.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="japaneseLevel">Current Japanese Level *</Label>
                <Select
                  value={japaneseLevel}
                  onValueChange={(value) => setValue('japaneseLevel', value)}
                >
                  <SelectTrigger className={errors.japaneseLevel ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Please select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {JAPANESE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.japaneseLevel && (
                  <p className="text-sm text-destructive">{errors.japaneseLevel.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="space-y-2">
                <Label>Payment Information</Label>
                <div
                  id="card-container"
                  className="min-h-[120px] p-4 border rounded-lg bg-card"
                >
                  {!isCardReady && (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Secure payment using Square payment system
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isProcessing || !isCardReady || !selectedPlan}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
`Apply for ${selectedPlan ? formatPrice(selectedPlan.price, selectedPlan.currency) : ''}`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By applying, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
