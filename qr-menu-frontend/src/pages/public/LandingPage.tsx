import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import {
  QrCode,
  Utensils,
  Store,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Building2,
  Palette,
  Layers,
  ChevronDown,
  DollarSign,
  Search,
  Flame,
  Check,
  RefreshCw,
  Sun,
  Moon,
  MapPin,
  Wallet,
  Printer,
  Info,
  Share2,
  Sliders,
  Award,
  Menu,
  X,
  Eye,
  BarChart3,
  TrendingUp,
  GitBranch,
  ScanLine,
  Activity,
  Globe,
  Clock,
  CheckCircle,
  Download,
  FileCode2,
  Copy,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../hooks/useToast';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoLoginLoading, setDemoLoginLoading] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Theme Converter State: default is 'light', optionally restoring from localStorage
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('qr_dine_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    localStorage.setItem('qr_dine_theme', nextTheme);
  };

  const { showToast } = useToast();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Live QR Code Generator Playground State
  const landingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrText, setQrText] = useState('https://habeshaheritage.com/menu/bole/table-04');
  const [qrFgColor, setQrFgColor] = useState('#d97706');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [tableLabel, setTableLabel] = useState('Table #04 - Bole Terrace');
  const [landingEcc, setLandingEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!landingCanvasRef.current) return;
    QRCode.toCanvas(landingCanvasRef.current, qrText, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: landingEcc,
      color: {
        dark: qrFgColor,
        light: qrBgColor,
      },
    }).catch((err) => console.error('Landing QR draw error:', err));
  }, [qrText, qrFgColor, qrBgColor, landingEcc]);

  const handleDownloadLandingPng = async () => {
    try {
      const highRes = await QRCode.toDataURL(qrText, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: landingEcc,
        color: { dark: qrFgColor, light: qrBgColor },
      });
      const link = document.createElement('a');
      link.download = `HabeshaHeritage-${tableLabel.replace(/[^a-zA-Z0-9]/g, '-')}-QR.png`;
      link.href = highRes;
      link.click();
      showToast('Downloaded High-Res PNG (800x800)', 'success');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const handleDownloadLandingSvg = async () => {
    try {
      const svg = await QRCode.toString(qrText, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: landingEcc,
        color: { dark: qrFgColor, light: qrBgColor },
      });
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `HabeshaHeritage-${tableLabel.replace(/[^a-zA-Z0-9]/g, '-')}-QR.svg`;
      link.href = blobUrl;
      link.click();
      URL.revokeObjectURL(blobUrl);
      showToast('Downloaded Vector SVG file', 'success');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const handleCopyLandingUrl = () => {
    navigator.clipboard.writeText(qrText);
    setCopiedLink(true);
    showToast('Menu URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Mobile Menu Mockup State
  const [selectedMockCategory, setSelectedMockCategory] = useState<'all' | 'starters' | 'mains' | 'drinks'>('mains');

  // Twin Phone Active View Mode (for mobile screens)
  const [activeHeroPhone, setActiveHeroPhone] = useState<'menu' | 'qr'>('menu');

  const handleQuickDemoLogin = async (role: 'admin' | 'owner') => {
    setDemoLoginLoading(role);
    try {
      if (role === 'admin') {
        await authApi.login('admin@qrmenu.com', 'admin');
        navigate('/admin/dashboard');
      } else {
        await authApi.login('owner@habeshaheritage.com', 'owner');
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoginLoading(null);
    }
  };

  const mockMenuItems = [
    {
      id: 1,
      name: 'Doro Wat Heritage Feast',
      price: 'ETB 480.00',
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      badge: "Chef's Special",
    },
    {
      id: 2,
      name: 'Special Gursha Kitfo',
      price: 'ETB 520.00',
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      badge: 'Popular',
    },
    {
      id: 3,
      name: 'Sizzling Shekla Tibs',
      price: 'ETB 460.00',
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
      badge: 'Sizzling',
    },
    {
      id: 4,
      name: 'Royal Beyaynetu Platter',
      price: 'ETB 360.00',
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
      badge: 'Vegan Feast',
    },
    {
      id: 5,
      name: 'Traditional Ethiopian Buna',
      price: 'ETB 140.00',
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
      badge: 'Ceremonial',
    },
  ];

  const filteredMockItems = selectedMockCategory === 'all'
    ? mockMenuItems
    : mockMenuItems.filter((item) => item.category === selectedMockCategory);

  const faqs = [
    {
      q: 'Do guests need to download an app to view the menu?',
      a: 'No app download required! Guests simply scan the table QR code using their camera to open your responsive digital menu directly in their browser.',
    },
    {
      q: 'Can I manage multiple restaurant branches under one account?',
      a: 'Yes. QR DineMenu is a multi-tenant platform. You can manage unlimited branches, set location managers, and customize branch-specific pricing or menu items.',
    },
    {
      q: 'How does real-time kitchen availability work?',
      a: 'If a dish runs out in the kitchen, staff can toggle the item to "Sold Out" in one click. The guest menu updates instantly across all active table scanners.',
    },
    {
      q: 'Can I print high-quality PDF table stands for my restaurant?',
      a: 'Yes! Our built-in Printable Studio generates vector PDF table stands (A6 Table Tents, 10x10cm Stickers, and Batch A4 Sheets) with custom branding and WiFi info.',
    },
    {
      q: 'Can I test the platform for free?',
      a: 'Yes, we offer instant sandbox demo portals and a 14-day free trial with zero credit card required.',
    },
  ];

  const isLight = themeMode === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isLight
          ? 'bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white'
          : 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white'
      } overflow-x-hidden`}
    >
      {/* Top Ambient Highlight Glow Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0 z-50 sticky top-0" />

      {/* Sleek, Darker-than-body Top Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`border-b sticky top-[2.5px] z-50 px-4 sm:px-8 py-3.5 backdrop-blur-xl transition-all duration-300 ${
          isLight
            ? 'border-slate-800/80 bg-slate-900/95 text-white shadow-xl shadow-slate-950/10'
            : 'border-slate-800/90 bg-slate-950/95 text-white shadow-2xl shadow-amber-500/5'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Platform Badge */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-400/50 transition-all"
            >
              <QrCode className="h-5 w-5 stroke-[2.5]" />
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  QR DineMenu
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SaaS Live
                </span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links with Pill Hover */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-800/80 transition-all"
            >
              Features
            </a>
            <a
              href="#interactive-demo"
              className="px-3.5 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-800/80 transition-all"
            >
              Live Menu Demo
            </a>
            <a
              href="#qr-generator"
              className="px-3.5 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-800/80 transition-all"
            >
              QR Studio
            </a>
            <a
              href="#pricing"
              className="px-3.5 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-800/80 transition-all"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-800/80 transition-all"
            >
              FAQ
            </a>
          </div>

          {/* Action Controls & Dark/Light Toggle Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Modern Interactive Theme Switcher */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all shadow-inner hover:border-amber-400/50 group"
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            >
              {isLight ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-45" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-300 group-hover:text-white">
                    Light
                  </span>
                  <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wide bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Switch to Dark
                  </span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-purple-400 transition-transform group-hover:-rotate-12" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-300 group-hover:text-white">
                    Dark
                  </span>
                  <span className="text-[9px] text-purple-300 font-extrabold uppercase tracking-wide bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">
                    Switch to Light
                  </span>
                </>
              )}
            </motion.button>

            <Link to="/public/branches" className="hidden sm:block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/80"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                  Guest Menu
                </Button>
              </motion.div>
            </Link>

            <Link to="/login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-sm"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>

            <Link to="/register">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 shadow-lg shadow-amber-500/25 border border-amber-400/50"
                >
                  Free Trial
                </Button>
              </motion.div>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 overflow-hidden"
            >
              <div className="flex flex-col gap-1 pb-2">
                <a
                  href="#features"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
                >
                  Features
                </a>
                <a
                  href="#interactive-demo"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
                >
                  Live Menu Demo
                </a>
                <a
                  href="#qr-generator"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
                >
                  QR Studio
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
                >
                  Pricing
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
                >
                  FAQ
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  to="/public/branches"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200"
                >
                  <Eye className="h-4 w-4 text-amber-400" /> View Live Guest Menu
                </Link>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-700 bg-slate-800 text-slate-200">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full text-xs font-black bg-amber-500 text-slate-950">
                      Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Split Hero Section with Darker Left / Brighter Right Gradient Contrast */}
      <section className="relative pt-10 sm:pt-16 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex-1 overflow-hidden">
        {/* Dual Ambient Lighting FX (Darker Left Depth, Brighter Glowing Right) */}
        <div
          className={`absolute top-0 -left-20 w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none -z-10 ${
            isLight ? 'bg-slate-300/40' : 'bg-slate-950/90'
          }`}
        />
        <div
          className={`absolute top-0 -right-20 w-[600px] h-[600px] blur-[140px] rounded-full pointer-events-none -z-10 ${
            isLight ? 'bg-amber-300/35' : 'bg-amber-500/25'
          }`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Content & Instant Sandbox Links */}
          <div className="lg:col-span-6 space-y-6 text-left relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                isLight
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Multi-Branch Digital Menu & QR Code Engine</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Smart Digital Menus &{' '}
              <span className="text-amber-500 underline decoration-amber-500/40 decoration-wavy">
                Table QR Scans
              </span>{' '}
              for Hospitality
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`text-sm sm:text-base leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Streamline customer dining with instant camera menu scans, multi-branch kitchen stock sync, printable PDF table cards, and contactless table ordering.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
            >
              <Link to="/register">
                <Button
                  size="md"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 text-sm shadow-lg shadow-amber-500/20 w-full sm:w-auto"
                >
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link to="/public/branches/branch-1/menu/tables/table-1">
                <Button
                  variant="outline"
                  size="md"
                  className={`px-6 py-3 text-sm font-semibold w-full sm:w-auto ${
                    isLight
                      ? 'border-slate-300 text-slate-800 hover:bg-slate-100'
                      : 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Utensils className="mr-2 h-4 w-4 text-amber-500" />
                  Explore Guest Menu Demo
                </Button>
              </Link>
            </motion.div>

            {/* Key Value Points */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`pt-4 border-t grid grid-cols-2 gap-3 text-xs font-semibold ${
                isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>0s App Download (Camera Scan)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Multi-Branch Central Control</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Printable PDF Table Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Real-Time Kitchen Stock Sync</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Brighter Illuminated Showcase with Twin Phones (Reflecting QR DineMenu Branding) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Mobile View Switcher for Small Screens */}
            <div className="flex sm:hidden gap-1 p-1 bg-slate-800/80 rounded-xl mb-4 text-xs font-bold text-white">
              <button
                onClick={() => setActiveHeroPhone('menu')}
                className={`px-3 py-1.5 rounded-lg ${
                  activeHeroPhone === 'menu' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                1. Menu View
              </button>
              <button
                onClick={() => setActiveHeroPhone('qr')}
                className={`px-3 py-1.5 rounded-lg ${
                  activeHeroPhone === 'qr' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                2. QR & Bonuses
              </button>
            </div>

            <div className="relative w-full max-w-[540px] flex items-center justify-center gap-4 sm:gap-6 py-2">
              {/* Phone 1: Artisan Bistro Digital Menu (QR DineMenu) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className={`w-[260px] sm:w-[270px] rounded-[38px] p-3 border-[5px] border-slate-800 shadow-2xl relative ${
                  activeHeroPhone === 'menu' ? 'block' : 'hidden sm:block'
                } bg-slate-900 text-white`}
              >
                {/* Phone Island Notch */}
                <div className="w-20 h-3.5 bg-slate-950 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
                  <div className="w-6 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen */}
                <div className="bg-[#121214] rounded-[28px] overflow-hidden p-3 space-y-3 border border-slate-800/80 text-left">
                  {/* Brand Venue Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
                        HH
                      </div>
                      <span className="text-xs font-black tracking-tight text-white">Habesha Heritage</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Open
                    </span>
                  </div>

                  {/* Location & Table Card */}
                  <div className="p-2.5 rounded-xl bg-[#1e1e22] border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-none">Bole Medhanialem Flagship</p>
                        <p className="text-[9px] text-amber-400 font-semibold mt-0.5">Table #04 • Bole Terrace</p>
                      </div>
                    </div>
                    <Sliders className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  {/* Service Order Mode Pills */}
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#1a1a1e] rounded-lg text-[9px] font-bold text-center">
                    <span className="py-1 rounded bg-[#2a2a30] text-amber-400 shadow-xs">Dine-In</span>
                    <span className="py-1 text-slate-400">Gursha Bar</span>
                    <span className="py-1 text-slate-400">Coffee Service</span>
                  </div>

                  {/* Real Food Items from Project */}
                  <div className="space-y-2 pt-0.5">
                    <div className="p-2 rounded-xl bg-[#1e1e22] border border-slate-800/60 flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80"
                        alt="Special Gursha Kitfo"
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-100 truncate">Special Gursha Kitfo</p>
                        <p className="text-[10px] font-extrabold text-amber-400">ETB 520.00</p>
                      </div>
                      <button className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors">
                        +
                      </button>
                    </div>

                    <div className="p-2 rounded-xl bg-[#1e1e22] border border-slate-800/60 flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80"
                        alt="Sizzling Shekla Tibs"
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-100 truncate">Sizzling Shekla Tibs</p>
                        <p className="text-[10px] font-extrabold text-amber-400">ETB 460.00</p>
                      </div>
                      <button className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors">
                        +
                      </button>
                    </div>

                    <div className="p-2 rounded-xl bg-[#1e1e22] border border-slate-800/60 flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=120&q=80"
                        alt="Traditional Ethiopian Buna"
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-100 truncate">Traditional Buna</p>
                        <p className="text-[10px] font-extrabold text-amber-400">ETB 140.00</p>
                      </div>
                      <button className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors">
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bottom Mobile Navigation */}
                  <div className="pt-1 border-t border-slate-800 flex items-center justify-around text-[8px] text-slate-400 font-bold">
                    <span className="text-amber-400 flex flex-col items-center">
                      <Utensils className="h-3 w-3" /> Menu
                    </span>
                    <span className="flex flex-col items-center">
                      <Layers className="h-3 w-3" /> Categories
                    </span>
                    <span className="p-1 rounded-lg bg-amber-500 text-slate-950">
                      <QrCode className="h-3 w-3" />
                    </span>
                    <span className="flex flex-col items-center">
                      <Wallet className="h-3 w-3" /> Table #04
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Phone 2: QR Code Table Scan Screen */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`w-[260px] sm:w-[270px] rounded-[38px] p-3 border-[5px] border-slate-800 shadow-2xl relative ${
                  activeHeroPhone === 'qr' ? 'block' : 'hidden sm:block'
                } bg-slate-900 text-white sm:-mt-6`}
              >
                {/* Phone Island Notch */}
                <div className="w-20 h-3.5 bg-slate-950 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
                  <div className="w-6 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen */}
                <div className="bg-[#121214] rounded-[28px] overflow-hidden p-3.5 space-y-3 border border-slate-800/80 text-center">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                    <Info className="h-3.5 w-3.5 text-amber-400" />
                    <span>Table #04 • Bole Terrace</span>
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  {/* Prominent White QR Block */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl mx-auto w-44 flex flex-col items-center">
                    <QrCode className="h-32 w-32 text-slate-900" />
                  </div>

                  {/* Scan Instruction & Number Code */}
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Scan Table QR Code
                    </p>
                    <p className="text-xl font-black text-amber-400 tracking-wider">TABLE-04-BOLE</p>
                  </div>

                  {/* Table & Rewards Info */}
                  <div className="p-2.5 rounded-2xl bg-[#1e1e22] border border-slate-800 flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Location</p>
                      <p className="text-xs font-black text-white">Bole #04</p>
                    </div>
                    <div className="p-1.5 rounded-full bg-amber-500 text-slate-950 font-black">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Rewards</p>
                      <p className="text-xs font-black text-amber-400">889 pts</p>
                    </div>
                  </div>

                  {/* Bottom Navigation with Active QR Button */}
                  <div className="pt-1 border-t border-slate-800 flex items-center justify-around text-[8px] text-slate-400 font-bold">
                    <span className="flex flex-col items-center">
                      <Utensils className="h-3 w-3" /> Menu
                    </span>
                    <span className="flex flex-col items-center">
                      <Layers className="h-3 w-3" /> Categories
                    </span>
                    <span className="p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30">
                      <QrCode className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex flex-col items-center">
                      <Wallet className="h-3 w-3" /> Table #04
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid Section */}
      <section
        id="key-benefits-grid"
        className={`py-14 sm:py-18 px-4 sm:px-6 relative z-20 border-b ${
          isLight
            ? 'bg-white border-slate-200/80'
            : 'bg-slate-900/60 border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Core Platform Advantages
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`text-2xl sm:text-4xl font-black tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Engineered for Modern Food & Beverage Growth
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={`text-xs sm:text-sm leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Everything you need to eliminate paper printing costs, speed up table turnover, and scale multi-branch hospitality operations.
            </motion.p>
          </div>

          {/* 3-Column Key Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. Dynamic QR Codes */}
            <motion.div
              id="card-dynamic-qr"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-7 border transition-all relative overflow-hidden flex flex-col justify-between group shadow-lg ${
                isLight
                  ? 'bg-slate-50 border-slate-200/90 shadow-slate-200/50 hover:shadow-xl hover:border-amber-400/80 hover:bg-white'
                  : 'bg-slate-950/80 border-slate-800 shadow-slate-950/50 hover:shadow-2xl hover:border-amber-500/40 hover:bg-slate-900/90'
              }`}
            >
              {/* Subtle top ambient gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <ScanLine className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Live Sync
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-amber-500 transition-colors`}>
                    Dynamic QR Codes
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Update dishes, seasonal chef specials, stock availability, and prices in real time. Never reprint physical table cards or acrylic stands again.
                  </p>
                </div>

                {/* Feature checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Instant cloud menu updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Custom brand colors & logos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>High-res vector PDF table tents</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>0s Reprinting Overhead</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* 2. Unlimited Branches */}
            <motion.div
              id="card-unlimited-branches"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-7 border transition-all relative overflow-hidden flex flex-col justify-between group shadow-lg ${
                isLight
                  ? 'bg-slate-50 border-slate-200/90 shadow-slate-200/50 hover:shadow-xl hover:border-amber-400/80 hover:bg-white'
                  : 'bg-slate-950/80 border-slate-800 shadow-slate-950/50 hover:shadow-2xl hover:border-amber-500/40 hover:bg-slate-900/90'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-600/25 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <GitBranch className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Enterprise Scale
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-blue-500 transition-colors`}>
                    Unlimited Branches
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Manage single cafes or multi-city dining franchises from one central command center with branch-isolated menus, staff roles, and tables.
                  </p>
                </div>

                {/* Feature checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Per-location menu pricing & tax</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Role-based branch manager access</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Individual table numbering & zones</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Multi-Venue Ready</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* 3. Real-time Analytics */}
            <motion.div
              id="card-real-time-analytics"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-7 border transition-all relative overflow-hidden flex flex-col justify-between group shadow-lg ${
                isLight
                  ? 'bg-slate-50 border-slate-200/90 shadow-slate-200/50 hover:shadow-xl hover:border-amber-400/80 hover:bg-white'
                  : 'bg-slate-950/80 border-slate-800 shadow-slate-950/50 hover:shadow-2xl hover:border-amber-500/40 hover:bg-slate-900/90'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/25 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <BarChart3 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-emerald-500 transition-colors`}>
                    Real-time Analytics
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Gain deep insight into guest browsing behaviors, peak table scan hours, top-converting dishes, and category engagement metrics.
                  </p>
                </div>

                {/* Feature checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Live table scan frequency metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Most-viewed & high-margin dish rank</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Peak dining traffic by hour & day</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Actionable Dining Data</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Mobile Menu Preview Showcase */}
      <motion.section
        id="interactive-demo"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className={`py-20 px-4 sm:px-6 border-y ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-amber-500" />
              Live Interactive Guest Menu
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              What Your Guests Experience
            </h2>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Try the interactive phone simulator below. Test category switching, dish cards, and real-time availability badges.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Key Features */}
            <div className="lg:col-span-6 space-y-6">
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex gap-4 p-5 rounded-2xl border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:border-amber-500'
                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl h-fit">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Instant Camera QR Scan
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    No App Store or Google Play download required. Scanning opens a fast-loading, web-native mobile menu optimized for any browser.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 4 }}
                className={`flex gap-4 p-5 rounded-2xl border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-500'
                    : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="p-3 bg-emerald-600/20 text-emerald-500 rounded-xl h-fit">
                  <Flame className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Real-Time Kitchen Availability
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    When kitchen staff mark an item as sold out in their dashboard, it immediately updates on all active customer phone screens.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 4 }}
                className={`flex gap-4 p-5 rounded-2xl border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:border-purple-500'
                    : 'bg-slate-900 border-slate-800 hover:border-purple-500/50'
                }`}
              >
                <div className="p-3 bg-purple-600/20 text-purple-500 rounded-xl h-fit">
                  <Utensils className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Table-Specific Context
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Each QR code embeds the branch name, section, and table number (e.g., Table #04 - Patio) so guests know they are viewing the right venue.
                  </p>
                </div>
              </motion.div>

              <div className="pt-2">
                <Link to="/public/branches/branch-1/menu/tables/table-1">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
                  >
                    Launch Full Screen Mobile Menu Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Phone Simulator */}
            <div className="lg:col-span-6 flex justify-center">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-[360px] rounded-[44px] p-4 border-4 shadow-2xl relative ${
                  isLight
                    ? 'bg-white border-slate-300 shadow-slate-300'
                    : 'bg-slate-900 border-slate-700 shadow-amber-500/20'
                }`}
              >
                {/* Phone Notch */}
                <div
                  className={`w-32 h-4 mx-auto rounded-b-xl mb-3 flex items-center justify-center ${
                    isLight ? 'bg-slate-200' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-10 h-1 rounded-full ${isLight ? 'bg-slate-400' : 'bg-slate-700'}`} />
                </div>

                {/* Inside Phone Screen */}
                <div
                  className={`rounded-[32px] overflow-hidden border p-4 space-y-4 text-left ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* Restaurant Header */}
                  <div className={`flex items-center gap-3 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                    <img
                      src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=100&q=80"
                      alt="Habesha Heritage Cuisine & Lounge"
                      className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Habesha Heritage Cuisine
                      </h4>
                      <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Table #04 • Bole Medhanialem
                      </p>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search doro wat, kitfo, tibs, buna..."
                      readOnly
                      className={`w-full border text-xs pl-8 pr-3 py-2 rounded-xl pointer-events-none ${
                        isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    />
                  </div>

                  {/* Categories Pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold no-scrollbar">
                    <button
                      onClick={() => setSelectedMockCategory('all')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        selectedMockCategory === 'all'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-600'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      All Items
                    </button>
                    <button
                      onClick={() => setSelectedMockCategory('mains')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        selectedMockCategory === 'mains'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-600'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Mains
                    </button>
                    <button
                      onClick={() => setSelectedMockCategory('starters')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        selectedMockCategory === 'starters'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-600'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Starters
                    </button>
                    <button
                      onClick={() => setSelectedMockCategory('drinks')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        selectedMockCategory === 'drinks'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-600'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Drinks
                    </button>
                  </div>

                  {/* Dishes List */}
                  <div className="space-y-2.5">
                    {filteredMockItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {item.name}
                            </h5>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-extrabold">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs font-black text-amber-500 mt-0.5">{item.price}</p>
                        </div>
                        <button className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors">
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Core Platform Capabilities Grid */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-16"
      >
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
            <Layers className="h-3.5 w-3.5" />
            Hospitality Platform Features
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Built for Modern Dining Excellence
          </h2>
          <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Everything venue managers need to customize digital menus, generate printable vector QR code stands, and monitor live table operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl w-fit">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Multi-Branch Management</h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Manage unlimited restaurant branches under one dashboard. Assign localized pricing, branch managers, and custom table layouts.
            </p>
          </div>

          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl w-fit">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Printable PDF Table Cards</h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Generate vector PDF table stands (A6 Table Tent, 10x10cm Stickers, or Batch A4 Sheets) with custom branding, table numbers, and guest WiFi info.
            </p>
          </div>

          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-2xl w-fit">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Kitchen Availability Sync</h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Toggle dishes to "Sold Out" or "Limited Portion" in one tap. Instant updates broadcast across all active customer phone browsers.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Live QR Code Customizer Playground */}
      <motion.section
        id="qr-generator"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`py-20 px-4 sm:px-6 border-y ${
          isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/30">
              <Palette className="h-3.5 w-3.5" />
              Live QR Studio Customizer
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Interactive Brand QR Code Generator
            </h2>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Customize colors, presets, and error correction right now. Download high-resolution PNGs or crisp vector SVGs instantly.
            </p>

            {/* Quick Demo Presets */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Quick Dining Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🇪🇹 Table #04 (Bole)', url: 'https://habeshaheritage.com/menu/bole/table-04', name: 'Table #04 - Bole Flagship' },
                  { label: '🇪🇹 Table #02 (Kazanchis)', url: 'https://habeshaheritage.com/menu/kazanchis/table-02', name: 'Table #02 - Kazanchis Lounge' },
                  { label: '🍽️ Master Digital Menu', url: 'https://habeshaheritage.com/menu/master', name: 'Master Heritage Cuisine Menu' },
                  { label: '📶 Guest Wi-Fi QR', url: 'WIFI:S:HabeshaHeritage_Guest;T:WPA;P:Heritage2026;;', name: 'Habesha High-Speed Guest Wi-Fi' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setQrText(preset.url);
                      setTableLabel(preset.name);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      qrText === preset.url
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : isLight
                        ? 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Target URL or Content Data
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className={`w-full text-xs p-3 rounded-xl border ${
                      isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                    } focus:outline-hidden focus:ring-2 focus:ring-amber-500`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={copiedLink ? Check : Copy}
                    onClick={handleCopyLandingUrl}
                    className={`shrink-0 ${copiedLink ? 'text-emerald-500 border-emerald-500' : 'text-slate-600'}`}
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Brand Color Swatches
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Habesha Gold', fg: '#d97706', bg: '#ffffff' },
                    { name: 'Midnight Slate', fg: '#0f172a', bg: '#ffffff' },
                    { name: 'Royal Habesha', fg: '#7c3aed', bg: '#ffffff' },
                    { name: 'Emerald Clean', fg: '#059669', bg: '#ffffff' },
                    { name: 'Crimson Velvet', fg: '#dc2626', bg: '#ffffff' },
                    { name: 'Dark Luxury', fg: '#f59e0b', bg: '#0f172a' },
                  ].map((swatch) => (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => {
                        setQrFgColor(swatch.fg);
                        setQrBgColor(swatch.bg);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        qrFgColor === swatch.fg && qrBgColor === swatch.bg
                          ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/10'
                          : 'border-slate-300/60 bg-transparent'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: swatch.fg }} />
                      <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    QR Code Foreground
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono font-bold uppercase">{qrFgColor}</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Background Fill
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono font-bold uppercase">{qrBgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Render Box */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              className={`p-8 rounded-3xl border shadow-2xl text-center space-y-4 max-w-sm w-full ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div
                className="p-5 rounded-2xl inline-flex flex-col items-center justify-center border border-slate-100 shadow-inner"
                style={{ backgroundColor: qrBgColor }}
              >
                <canvas ref={landingCanvasRef} className="rounded-lg max-w-full" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-extrabold text-amber-500">{tableLabel}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate px-2">{qrText}</p>
              </div>

              {/* Action Buttons: PNG & SVG Downloads */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadLandingPng}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs"
                >
                  PNG (800px)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileCode2}
                  onClick={handleDownloadLandingSvg}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
                >
                  Vector SVG
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={qrText.startsWith('http') ? qrText : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                  <span>Test Link</span>
                </a>
                <Link to="/qr-codes">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    className="w-full border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-xs"
                  >
                    PDF Studio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12"
      >
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
            <DollarSign className="h-3.5 w-3.5" />
            Transparent Pricing Plans
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Simple, Scalable Plans
          </h2>
          <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            14-day free trial. Zero credit card required. Upgrade as your restaurant network grows.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-slate-800 rounded-2xl text-xs font-bold text-white">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl transition-all ${
                billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl transition-all ${
                billingCycle === 'yearly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300'
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div
            className={`p-8 rounded-3xl border space-y-6 text-left ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div>
              <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Single Bistro</h3>
              <p className="text-xs text-slate-400 mt-1">Perfect for standalone cafes & single dining spots</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {billingCycle === 'yearly' ? '$29' : '$35'}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>
            <ul className="space-y-3 text-xs font-semibold">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" /> 1 Branch Location
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" /> Up to 25 Dining Tables
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" /> Vector QR Generator
              </li>
            </ul>
            <Link to="/register">
              <Button variant="outline" size="md" fullWidth className="font-bold">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Multi-Branch Pro Plan */}
          <div className="p-8 rounded-3xl border-2 border-amber-500 bg-slate-900 text-white space-y-6 text-left relative shadow-2xl shadow-amber-500/20">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Multi-Branch Pro</h3>
              <p className="text-xs text-slate-300 mt-1">Designed for growing restaurant chains & multi-venue operators</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-amber-400">
                {billingCycle === 'yearly' ? '$79' : '$95'}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>
            <ul className="space-y-3 text-xs font-semibold text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Up to 5 Branch Locations
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Unlimited Dining Tables
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Printable PDF Table Card Studio
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Real-Time Kitchen Sold-Out Sync
              </li>
            </ul>
            <Link to="/register">
              <Button variant="primary" size="md" fullWidth className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div
            className={`p-8 rounded-3xl border space-y-6 text-left ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div>
              <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Enterprise Franchise</h3>
              <p className="text-xs text-slate-400 mt-1">For national restaurant groups & hotel chains</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {billingCycle === 'yearly' ? '$199' : '$235'}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>
            <ul className="space-y-3 text-xs font-semibold">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" /> Unlimited Branches
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" /> Custom Domain & Branding
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" /> Priority 24/7 Support
              </li>
            </ul>
            <Link to="/register">
              <Button variant="outline" size="md" fullWidth className="font-bold">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* FAQ Accordion Section */}
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`py-20 px-4 sm:px-6 border-t ${
          isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Everything you need to know about setting up digital QR menus for your venue.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-4"
                >
                  <span className={isLight ? 'text-slate-900' : 'text-white'}>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 text-amber-500 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />

      {/* Floating 'Back to Top' Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="btn-back-to-top"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={scrollToTop}
            aria-label="Back to Top"
            title="Scroll back to top"
            className={`fixed bottom-6 right-6 z-50 px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 group transition-all duration-300 cursor-pointer ${
              isLight
                ? 'bg-slate-900/90 text-amber-400 border border-slate-700/80 shadow-slate-900/30 hover:bg-slate-900 hover:border-amber-400 hover:shadow-amber-500/25'
                : 'bg-amber-500 text-slate-950 border border-amber-400 shadow-amber-500/30 hover:bg-amber-400 hover:shadow-amber-400/50'
            }`}
          >
            <div className={`p-1 rounded-lg ${isLight ? 'bg-amber-400/10 text-amber-400' : 'bg-slate-950/20 text-slate-950'}`}>
              <ArrowUp className="h-4 w-4 stroke-[2.5] transition-transform duration-300 group-hover:-translate-y-0.5" />
            </div>
            <span className={`text-xs font-black tracking-wide pr-1 ${
              isLight ? 'text-slate-100 group-hover:text-amber-400' : 'text-slate-950'
            }`}>
              Back to Top
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
