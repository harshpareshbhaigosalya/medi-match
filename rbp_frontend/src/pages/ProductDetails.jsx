import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ShieldCheck, Truck, ChevronLeft, Star, Info, Package, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [variant, setVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await http.get(`/products/${id}`);
                const data = res.data;
                setProduct(data);
                if (data.product_variants?.length) {
                    setVariant(data.product_variants[0]);
                }
            } catch (e) {
                console.error("Load failed", e);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="space-y-4 text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Specifications</p>
                </div>
            </div>
        );
    }

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
            <div className="text-slate-300"><Info size={64} /></div>
            <h2 className="text-2xl font-black text-slate-900">Product not found</h2>
            <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Back to Catalog</Link>
        </div>
    );

    const mainImage =
        variant?.product_images?.[0]?.image_url ||
        product.product_images?.[0]?.image_url ||
        "/no-image.png";

    const addToCart = async () => {
        if (!variant || variant.stock < 1) return;
        setAdding(true);
        try {
            await http.post("/cart/add", {
                variant_id: variant.id,
                quantity: 1
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            alert(e.response?.data?.error || "Failed to add to cart");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-[#fcfdff] min-h-screen pb-32">
            {/* Premium Desktop Navigation Context */}
            <div className="max-w-7xl mx-auto px-6 pt-32 mb-8">
                <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest transition-colors mb-8 group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-start">

                {/* Left Aspect: High Fidelity Showcase */}
                <div className="lg:col-span-7 space-y-8 sticky top-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-[4/3] bg-white rounded-[60px] p-12 flex items-center justify-center relative overflow-hidden shadow-[0_40px_80px_-24px_rgba(0,0,0,0.05)] border border-slate-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 to-transparent" />
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="max-h-full w-auto object-contain relative z-10 mix-blend-multiply"
                        />

                        {/* Trust Tags */}
                        <div className="absolute bottom-10 left-10 flex gap-4">
                            <div className="bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-green-600" />
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">ISO Certified</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-6">
                        {(variant?.product_images || product.product_images || []).slice(0, 3).map((img, idx) => (
                            <div key={idx} className="aspect-square bg-white rounded-[32px] p-6 border border-slate-100 flex items-center justify-center hover:border-blue-300 transition-colors cursor-pointer group">
                                <img src={img.image_url} className="max-h-full w-auto mix-blend-multiply group-hover:scale-110 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Aspect: Configuration & Purchase */}
                <div className="lg:col-span-5 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Verified</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            {product.name}
                        </h1>

                        {variant && (
                            <div className="space-y-2 pt-2">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-black text-blue-600">₹{variant.price.toLocaleString()}</span>
                                    <span className="text-xl text-slate-300 line-through font-bold">₹{Math.round(variant.price * 1.15).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                                    <Package size={14} /> Ready for Dispatch
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Configuration Space */}
                    <div className="space-y-8 bg-white rounded-[48px] p-8 border border-slate-100 shadow-sm">
                        {product.product_variants?.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                    <span>Selection</span>
                                    <span>{product.product_variants.length} Options Available</span>
                                </div>
                                <div className="space-y-3">
                                    {product.product_variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setVariant(v)}
                                            className={`w-full group relative flex items-center justify-between p-5 rounded-[24px] border-2 transition-all duration-300 ${v.id === variant?.id
                                                ? "border-blue-600 bg-blue-50/50 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.4)]"
                                                : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                                                }`}
                                        >
                                            <div className="flex flex-col items-start px-2">
                                                <span className={`text-sm font-bold transition-colors ${v.id === variant?.id ? 'text-blue-700' : 'text-slate-700'}`}>{v.variant_name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Build SKU</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className={`font-black transition-colors ${v.id === variant?.id ? 'text-blue-700' : 'text-slate-900'}`}>₹{v.price.toLocaleString()}</div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${v.id === variant?.id ? 'border-blue-600 bg-blue-600 scale-110' : 'border-slate-200 bg-white'}`}>
                                                    {v.id === variant?.id && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Engine */}
                        <div className="space-y-4">
                            <button
                                disabled={!variant || variant.stock <= 0 || adding}
                                onClick={addToCart}
                                className={`relative w-full group overflow-hidden py-6 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl ${variant?.stock > 0
                                    ? success ? 'bg-green-600 text-white' : 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {adding && <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                {!adding && (
                                    <>
                                        {variant?.stock > 0
                                            ? success ? <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Added to Cart</span> : <span className="flex items-center gap-2"><ShoppingCart size={18} /> Add to Workspace</span>
                                            : "Sold Out"}
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>

                            {variant && variant.stock > 0 && (
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Low stock alert: Only <span className="text-red-500 font-black">{variant.stock} units</span> remaining in inventory
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Value Propositions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-3">
                            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="font-bold text-xs text-slate-900 uppercase tracking-tighter">Certified Warranty</div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Full coverage on manufacturing defects.</p>
                        </div>
                        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-3">
                            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                                <Truck size={20} />
                            </div>
                            <div className="font-bold text-xs text-slate-900 uppercase tracking-tighter">Safe Logistics</div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Secure pharmaceutical-grade shipping.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deep Technical Overview Section */}
            <div className="max-w-7xl mx-auto px-6 mt-32">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Left: Detailed Narratives */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 w-12 bg-blue-600"></div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Product Engineering</h2>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <div
                                    className="text-sm md:text-base leading-snug text-slate-600 font-medium space-y-2"
                                    dangerouslySetInnerHTML={{
                                        __html: (variant?.description || product.description || "")
                                            .split('\n')
                                            .filter(line => line.trim() !== '')
                                            .map(line => `<p class="mb-1">${line.trim()}</p>`)
                                            .join('')
                                    }}
                                />
                            </div>
                        </div>

                        {/* Feature Highlights Grid */}
                        <div className="grid sm:grid-cols-2 gap-8 pt-6">
                            <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Precision Hygiene</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Engineered with seamless welding and specialized finishes to prevent microbial growth and ensure easy sterilization.</p>
                            </div>
                            <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Package size={24} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Structural Integrity</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">High-load bearing capacity designed for heavy-duty hospital and laboratory environments using prime SS 304 grade materials.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Technical Spec Sheet */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 bg-slate-900 p-10 md:p-14 rounded-[60px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 blur-[100px] group-hover:bg-blue-600/30 transition-colors" />

                            <div className="relative z-10 space-y-10">
                                <div className="space-y-3">
                                    <div className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em]">Data Sheet</div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Specifications</h3>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { label: "Material Grade", value: "Premium SS 304 / 316" },
                                        { label: "Fabrication", value: "Precision Laser Cut" },
                                        { label: "Finish", value: "Matte / Hairline Polished" },
                                        { label: "Compliance", value: "ISO 9001:2015" },
                                        { label: "Application", value: "Clinical / Lab Grade" }
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                                            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">{spec.label}</span>
                                            <span className="font-black text-sm uppercase tracking-tight text-blue-100">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Quality Assurance</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                            Every RB PANCHAL product undergoes a 12-point inspection protocol prior to heavy-duty industrial crating and shipment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Corner Element */}
                            <div className="absolute bottom-0 right-0 p-8 opacity-10 pointer-events-none">
                                <ShieldCheck size={120} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
