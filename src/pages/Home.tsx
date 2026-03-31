import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, FileText, Award, Mail, Phone, MapPin, Loader2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/index';
import { usePlans } from '@/hooks/usePlans';
import { useProducts } from '@/hooks/useProducts';
import { PlanCard } from '@/components/PlanCard';
import { ApplicationForm } from '@/components/ApplicationForm';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Plan } from '@/lib/index';

const springPresets = {
  gentle: { type: 'spring' as const, stiffness: 300, damping: 35 },
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 }
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { plans, loading: plansLoading, error: plansError } = usePlans();
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPlan(undefined);
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const services = [
    {
      icon: Video,
      title: 'Online Lessons',
      description: 'Fun online lessons with native Japanese teachers. Personalized instruction tailored to your child\'s pace to steadily improve Japanese language skills.',
      image: IMAGES.ONLINE_LESSONS_20260311_203707_30
    },
    {
      icon: FileText,
      title: 'Digital Materials (PDF)',
      description: 'Colorful and easy-to-understand digital materials. Rich content for progressive learning from Hiragana and Katakana to daily conversation.',
      image: IMAGES.LEARNING_MATERIALS_20260311_203707_31
    },
    {
      icon: Award,
      title: 'JLPT Exam Preparation',
      description: 'Specialized courses aimed at passing the Japanese Language Proficiency Test (JLPT). Comprehensive exam preparation for all levels from N5 to N1.',
      image: IMAGES.ONLINE_STUDY_1
    },
    {
      icon: BookOpen,
      title: 'Homework Support',
      description: 'Homework support with responses within 24 hours. Quickly resolve your child\'s questions and maintain learning motivation.',
      image: IMAGES.FAMILY_LEARNING_1
    }
  ];

  return (
    <div className="min-h-screen">
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.HERO_JAPANESE_LEARNING_20260311_203707_29}
            alt="Japanese Learning"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              variants={fadeInUp}
              transition={springPresets.gentle}
            >
              Bringing the Joy of Japanese
              <br />
              to Australian Children
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              variants={fadeInUp}
              transition={springPresets.gentle}
            >
              Opal Japanese Kids - Authentic Japanese Education Online
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
              transition={springPresets.gentle}
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Plans
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">Diverse programs tailored to your child's growth</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...springPresets.gentle, delay: index * 0.1 }}
                >
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-semibold">{service.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Learning Materials & Products</h2>
            <p className="text-xl text-muted-foreground">High-quality Japanese learning materials and resources</p>
          </motion.div>

          {productsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {products.filter(product => product.is_active).map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  transition={springPresets.gentle}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      {product.image_url && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name_en}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold">{product.name_en}</h3>
                        {product.is_featured && (
                          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4 text-sm">{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            {product.currency} ${product.price_aud.toLocaleString()}
                          </span>
                          <div className="text-sm text-muted-foreground">
                            Category: {product.category}
                          </div>
                        </div>
                        {product.stock_quantity > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Stock: {product.stock_quantity}
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full"
                        disabled={product.stock_quantity === 0}
                        onClick={() => {
                          // Handle purchase - you can implement this later
                          alert(`Purchase ${product.name_en} - This will be connected to payment system`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {products.filter(product => product.is_active).length === 0 && !productsLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section id="plans" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-xl text-muted-foreground">Choose the perfect plan for your child</p>
          </motion.div>

          {plansError && (
            <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
              <AlertDescription>
                Failed to load plans. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plansLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading plans...</span>
              </div>
            ) : (
              plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...springPresets.gentle, delay: index * 0.1 }}
                >
                  <PlanCard plan={plan} onSelect={handlePlanSelect} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h2>
              <p className="text-xl text-muted-foreground">Feel free to ask any questions or inquiries</p>
            </div>

            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 mt-1">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Email Address</h3>
                      <a
                        href="mailto:yuna@metisbel.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        yuna@metisbel.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-accent/10 mt-1">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Phone Number</h3>
                      <a
                        href="tel:+61466021505"
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        +61 466 021 505
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Business Hours: Mon-Fri 9:00-17:00 (AEST)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 mt-1">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        28 Longboat Place<br />
                        Biggera Waters QLD 4216<br />
                        Australia
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-center text-muted-foreground mb-4">
                      To apply for a plan, please use the "Apply" button on each plan card.
                    </p>
                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Back to Plans
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedPlan ? `${selectedPlan.name} - Application` : 'Application'}
            </DialogTitle>
          </DialogHeader>
          <ApplicationForm selectedPlan={selectedPlan} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}