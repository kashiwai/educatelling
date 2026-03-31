import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, FileText, Award, Mail, Phone, MapPin, Loader2, Check, Star } from 'lucide-react';
import { usePlans } from '@/hooks/usePlans';
import { useProducts } from '@/hooks/useProducts';
import { InquiryForm } from '@/components/InquiryForm';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const spring = { type: 'spring' as const, stiffness: 300, damping: 35 };
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

interface UnifiedItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  priceLabel: string;
  description: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
}

export default function Home() {
  const [selected, setSelected] = useState<UnifiedItem | null>(null);
  const { plans, loading: plansLoading } = usePlans();
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  useEffect(() => { fetchProducts(); }, []);

  // プランとプロダクトを統合
  const planItems: UnifiedItem[] = plans.map(p => ({
    id: `plan-${p.id}`,
    title: p.name,
    subtitle: p.nameEn,
    price: p.price,
    currency: p.currency,
    priceLabel: `${p.currency} $${p.price.toLocaleString()} / ${p.duration}`,
    description: p.description,
    features: p.features,
    badge: p.recommended ? 'Recommended' : undefined,
    highlighted: p.recommended,
  }));

  const productItems: UnifiedItem[] = products.map(p => ({
    id: `product-${p.id}`,
    title: p.name_en,
    subtitle: p.name,
    price: p.price_aud,
    currency: p.currency,
    priceLabel: `${p.currency} $${p.price_aud.toLocaleString()}`,
    description: p.description,
    features: [p.category],
    badge: p.is_featured ? 'Featured' : undefined,
    highlighted: p.is_featured,
  }));

  const allItems = [...planItems, ...productItems];
  const loading = plansLoading || productsLoading;

  const services = [
    { icon: Video, title: 'Online Lessons', description: 'Fun online lessons with native Japanese teachers. Personalized instruction tailored to your child\'s pace.', image: IMAGES.ONLINE_LESSONS_20260311_203707_30 },
    { icon: FileText, title: 'Digital Materials (PDF)', description: 'Colorful and easy-to-understand digital materials from Hiragana to daily conversation.', image: IMAGES.LEARNING_MATERIALS_20260311_203707_31 },
    { icon: Award, title: 'JLPT Exam Preparation', description: 'Specialized courses for JLPT from N5 to N1. Comprehensive exam preparation for all levels.', image: IMAGES.ONLINE_STUDY_1 },
    { icon: BookOpen, title: 'Homework Support', description: 'Responses within 24 hours. Quickly resolve your child\'s questions and maintain learning motivation.', image: IMAGES.FAMILY_LEARNING_1 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.HERO_JAPANESE_LEARNING_20260311_203707_29} alt="Japanese Learning" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="max-w-4xl mx-auto text-center" initial="initial" animate="animate">
            <motion.h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" variants={fadeUp} transition={spring}>
              Bringing the Joy of Japanese<br />to Australian Children
            </motion.h1>
            <motion.p className="text-xl md:text-2xl text-muted-foreground mb-8" variants={fadeUp} transition={spring}>
              Opal Japanese Kids - Authentic Japanese Education Online
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeUp} transition={spring}>
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all" onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}>
                View Plans & Products
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Contact Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={spring}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">Diverse programs tailored to your child's growth</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.1 }}>
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]">
                    <div className="relative h-48 overflow-hidden">
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10"><Icon className="w-6 h-6 text-primary" /></div>
                        <h3 className="text-2xl font-semibold">{s.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 統合ショップ（12枚） */}
      <section id="shop" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={spring}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Learning Materials & Products & Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the perfect plan or materials for your child</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {allItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.05 }}>
                  <Card className={`h-full flex flex-col hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer border-2 ${item.highlighted ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setSelected(item)}>
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base leading-tight mb-1">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                        {item.badge && (
                          <Badge variant="default" className="ml-2 text-xs flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-current" />{item.badge}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xl font-bold text-primary mb-2">{item.priceLabel}</p>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                      <ul className="space-y-1 flex-1 mb-4">
                        {item.features.slice(0, 4).map((f, fi) => (
                          <li key={fi} className="flex items-start gap-1.5 text-xs">
                            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                        {item.features.length > 4 && (
                          <li className="text-xs text-muted-foreground pl-5">+{item.features.length - 4} more</li>
                        )}
                      </ul>

                      <Button size="sm" className="w-full" variant={item.highlighted ? 'default' : 'outline'}>
                        お問い合わせ・購入
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={spring}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h2>
              <p className="text-xl text-muted-foreground">Feel free to ask any questions or inquiries</p>
            </div>
            <Card className="shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 mt-1"><Mail className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Email</h3>
                    <a href="mailto:yuna@metisbel.com" className="text-muted-foreground hover:text-primary transition-colors">yuna@metisbel.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 mt-1"><Phone className="w-6 h-6 text-accent" /></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Phone</h3>
                    <a href="tel:+61466021505" className="text-muted-foreground hover:text-accent transition-colors">+61 466 021 505</a>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Fri 9:00-17:00 (AEST)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 mt-1"><MapPin className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Address</h3>
                    <p className="text-muted-foreground">28 Longboat Place, Biggera Waters QLD 4216, Australia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 問い合わせModal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>お問い合わせ</DialogTitle>
          </DialogHeader>
          {selected && (
            <InquiryForm
              itemName={selected.title}
              itemPrice={selected.priceLabel}
              onClose={() => setSelected(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
