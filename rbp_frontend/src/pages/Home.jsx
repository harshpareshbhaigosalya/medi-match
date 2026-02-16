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
    { title: "Quality Assurance", desc: "ISO certified manufacturing with international quality standards using SS 304 grade materials.", icon: Shield },
    { title: "Custom Fabrication", desc: "Tailored solutions to meet your specific hospital and pharma equipment requirements.", icon: Factory },
    { title: "Fast Delivery", desc: "Quick turnaround time with efficient logistics across India for bulk orders.", icon: Truck },
    { title: "Expert Support", desc: "Dedicated technical team providing installation guidance and after-sales service.", icon: Headphones }
  ];

  return (
    <div className="bg-white scroll-smooth overflow-x-hidden">
      {/* Cinematic Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-20 px-8 lg:px-24">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-50 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-3 bg-blue-50 text-blue-600 px-5 py-2 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Engineering India's Healthcare since 2001</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-[0.95] font-heading">
              Precision <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Medical</span> <br />
              Furniture.
            </h1>

            <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
              Premium Stainless Steel equipment for Hospitals, Pharmaceutical units, and Commercial Kitchens. Built for durability, engineered for hygiene.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products" className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-3 group">
                Enter Catalog
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="bg-white border-2 border-gray-100 text-gray-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-blue-600 transition-all">
                Get Quote
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-gray-50">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-gray-900 font-heading">{s.number}</div>
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative aspect-square lg:aspect-auto h-[600px] bg-gray-50 rounded-[64px] border border-white shadow-2xl overflow-hidden p-4 group"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />

            {/* Floating Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <Shield size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Medical Grade</div>
                  <div className="text-lg font-black text-gray-900">SS 304 High-Carbon Steel</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI BOT PROMO: THE "WOW" ELEMENT */}
      <section className="py-24 px-8 lg:px-24">
        <div className="bg-blue-600 rounded-[56px] p-12 lg:p-24 relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                <Bot size={32} />
              </div>
              <h2 className="text-5xl font-black text-white leading-tight font-heading italic">
                Meet your personal AI Procurement Agent.
              </h2>
              <p className="text-blue-100 text-lg font-medium leading-relaxed">
                Planning a new ICU or Clinic? Our Medi-Match AI understands medical hospital standards and can suggest complete equipment bundles in seconds.
              </p>
              <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3 shadow-xl">
                Launch Smart Assistant
                <Sparkles className="animate-pulse" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "Smart Comparison", icon: TrendingUp },
                { title: "Specialist Bundles", icon: Layout },
                { title: "Support Priority", icon: Headphones },
                { title: "Smart Search", icon: Zap }
              ].map(f => (
                <div key={f.title} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 group hover:bg-white transition-all cursor-default">
                  <f.icon className="text-white group-hover:text-blue-600 transition-colors mb-4" size={24} />
                  <div className="text-white group-hover:text-gray-900 font-black text-sm uppercase tracking-wider transition-colors">{f.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 font-heading">Trusted Excellence.</h2>
            <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-xs">Uncompromising quality in every fabrication</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(s => (
              <div key={s.title} className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Preview */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div>
              <h2 className="text-5xl font-black text-gray-900 font-heading">Our Expertise.</h2>
              <p className="text-gray-500 mt-2 font-medium">Custom fabrication for diverse healthcare needs.</p>
            </div>
            <Link to="/products" className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 group">
              Browse Everything <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { title: "Hospital Equipment", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800", count: "200+ Items" },
              { title: "Pharma Furniture", img: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=800", count: "150+ Items" },
              { title: "SS Kitchen Solutions", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800", count: "80+ Items" }
            ].map(c => (
              <div key={c.title} className="group relative rounded-[48px] overflow-hidden h-[450px] shadow-lg">
                <img src={c.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-2">{c.count}</div>
                  <h3 className="text-3xl font-black font-heading">{c.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 bg-gray-900 relative">
        <div className="max-w-4xl mx-auto text-center px-8 relative z-10">
          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight font-heading">Ready to scale your facility?</h2>
          <p className="text-gray-400 mt-8 text-xl font-medium max-w-2xl mx-auto italic">
            Get an official proposal from India's most trusted SS equipment manufacturer.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <button className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all">Download Catalog</button>
            <button className="bg-white/10 text-white border border-white/20 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all">Direct Sales</button>
          </div>
        </div>
      </section>
    </div>
  );
}