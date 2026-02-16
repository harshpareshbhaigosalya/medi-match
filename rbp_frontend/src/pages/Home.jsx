import { Award, Users, TrendingUp, Star, ChevronRight, Shield, Truck, Clock, Headphones, CheckCircle, Building2, Factory, Zap, Bot, ArrowRight, Layout, HelpCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HomePage() {
  const stats = [
    { number: "500+", label: "Products Range", icon: Award },
    { number: "1000+", label: "Happy Clients", icon: Users },
    { number: "20+", label: "Years of Experience", icon: TrendingUp }
  ];

  const services = [
    { title: "Quality Assurance", desc: "ISO certified manufacturing with SS 304 grade materials.", icon: Shield },
    { title: "Custom Fabrication", desc: "Tailored solutions for your hospital & pharma equipment needs.", icon: Factory },
    { title: "Fast Delivery", desc: "Quick turnaround with efficient logistics across India.", icon: Truck },
    { title: "Expert Support", desc: "Dedicated technical team for installation and service.", icon: Headphones }
  ];

  return (
    <div className="bg-white scroll-smooth overflow-x-hidden">
      {/* Cinematic Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-12 md:pt-20 px-6 lg:px-24">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-50 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-10 text-center lg:text-left"
          >
            <div className="flex items-center gap-3 bg-blue-50 text-blue-600 px-5 py-2 rounded-full w-fit mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Engineering India's Healthcare since 2001</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-gray-900 leading-[0.95] font-heading">
              Precision <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Medical</span> <br className="hidden sm:block" />
              Furniture.
            </h1>

            <p className="text-base md:text-xl text-gray-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed px-4 md:px-0">
              Premium Stainless Steel equipment for Hospitals, Pharmaceutical units, and Commercial Kitchens. Built for durability, engineered for hygiene.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 px-4 md:px-0">
              <Link to="/products" className="w-full sm:w-auto bg-gray-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 flex justify-center items-center gap-3 group">
                Enter Catalog
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contactus" className="w-full sm:w-auto bg-white border-2 border-gray-100 text-gray-900 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-blue-600 transition-all flex justify-center items-center">
                Get Quote
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 pt-10 border-t border-gray-50">
              {stats.map(s => (
                <div key={s.label} className="flex flex-col items-center lg:items-start">
                  <div className="text-2xl md:text-3xl font-black text-gray-900 font-heading">{s.number}</div>
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative h-[350px] sm:h-[450px] lg:h-[600px] bg-gray-50 rounded-[40px] lg:rounded-[64px] border border-white shadow-2xl overflow-hidden p-4 group mx-4 lg:mx-0"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />

            {/* Floating Card */}
            <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8 bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                  <Shield size={20} className="md:w-7 md:h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Medical Grade</div>
                  <div className="text-sm md:text-lg font-black text-gray-900">SS 304 High-Carbon Steel</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI BOT PROMO: THE "WOW" ELEMENT */}
      <section className="py-16 md:py-24 px-6 lg:px-24">
        <div className="bg-blue-600 rounded-[40px] md:rounded-[56px] p-8 md:p-12 lg:p-24 relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                <Bot size={28} className="md:w-8 md:h-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight font-heading italic">
                Meet your personal AI Procurement Agent.
              </h2>
              <p className="text-blue-100 text-base md:text-lg font-medium leading-relaxed">
                Planning a new ICU or Clinic? Our Medi-Match AI understands medical standards and can suggest complete equipment bundles in seconds.
              </p>
              <button className="w-full sm:w-auto bg-white text-blue-600 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex justify-center items-center gap-3 shadow-xl">
                Launch Assistant
                <Sparkles className="animate-pulse" size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {[
                { title: "Smart Comparison", icon: TrendingUp },
                { title: "Specialist Bundles", icon: Layout },
                { title: "Support Priority", icon: Headphones },
                { title: "Smart Search", icon: Zap }
              ].map(f => (
                <div key={f.title} className="bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 group hover:bg-white transition-all cursor-default">
                  <f.icon className="text-white group-hover:text-blue-600 transition-colors mb-2 md:mb-4 w-6 h-6 md:w-8 md:h-8" />
                  <div className="text-white group-hover:text-gray-900 font-black text-[10px] md:text-sm uppercase tracking-wider transition-colors">{f.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 font-heading">Trusted Excellence.</h2>
            <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-[10px] md:text-xs">Uncompromising quality in every fabrication</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {services.map(s => (
              <div key={s.title} className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <s.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Preview */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12 md:mb-16 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 font-heading">Our Expertise.</h2>
              <p className="text-gray-500 mt-2 font-medium">Custom fabrication for diverse healthcare needs.</p>
            </div>
            <Link to="/products" className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 group">
              Browse All <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: "Hospital Equipment", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800", count: "200+ Items" },
              { title: "Pharma Furniture", img: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=800", count: "150+ Items" },
              { title: "SS Kitchen Solutions", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800", count: "80+ Items" }
            ].map((c, i) => (
              <div key={c.title} className={`group relative rounded-[32px] md:rounded-[48px] overflow-hidden h-[350px] md:h-[450px] shadow-lg ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <img src={c.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
                  <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-2">{c.count}</div>
                  <h3 className="text-2xl md:text-3xl font-black font-heading">{c.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 md:py-32 bg-gray-900 relative">
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight font-heading">Ready to scale?</h2>
          <p className="text-gray-400 mt-6 md:mt-8 text-lg md:text-xl font-medium max-w-2xl mx-auto italic px-4">
            Get an official proposal from India's most trusted SS equipment manufacturer.
          </p>
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-6 sm:px-0">
            <button className="bg-blue-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all">Download Catalog</button>
            <button className="bg-white/10 text-white border border-white/20 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all">Direct Sales</button>
          </div>
        </div>
      </section>
    </div>
  );
}