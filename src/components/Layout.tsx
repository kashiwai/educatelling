import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SiFacebook, SiInstagram, SiLinkedin } from 'react-icons/si';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/index';
import { springPresets } from '@/lib/motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground">Opal Japanese Kids</span>
                <span className="text-xs text-muted-foreground">Japanese Learning for Kids</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('hero');
                }}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('services');
                }}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Services
              </a>
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('products');
                }}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Products
              </a>
              <a
                href="#plans"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('plans');
                }}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Plans
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Contact
              </a>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springPresets.gentle}
              className="md:hidden border-t border-border bg-background"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('hero');
                  }}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  Home
                </a>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('services');
                  }}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  Services
                </a>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('products');
                  }}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  Products
                </a>
                <a
                  href="#plans"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('plans');
                  }}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  Plans
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('contact');
                  }}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  Contact
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="bg-card border-t border-border mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-xl">O</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-foreground">Opal Japanese Kids</span>
                  <span className="text-xs text-muted-foreground">Japanese Learning for Kids</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Providing fun and effective Japanese language learning for Australian children.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Email: yuna@metisbel.com</p>
                <p>Phone: +61 466 021 505</p>
                <p>Address: 28 Longboat Place, Biggera Waters QLD 4216, Australia</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                  aria-label="Facebook"
                >
                  <SiFacebook size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <SiInstagram size={20} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Opal Japanese Kids. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
