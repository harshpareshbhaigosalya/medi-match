import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    // Here you can call your backend API to send the message
    console.log("Form submitted:", form);
    setSubmitted(true);

    // Reset form after submission
    setForm({ name: "", email: "", subject: "", message: "" });

    // Hide success message after 4 seconds
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Contact Us
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          Have a question, order issue, or need support? We’re here to help!
        </p>
      </motion.div>

      {/* Support Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Order Issues</h3>
          <p>Track your order, report missing items, or request changes.</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-2xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Product Queries</h3>
          <p>Ask questions about product features, availability, or variants.</p>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Returns & Refunds</h3>
          <p>Resolve return, refund, or warranty issues easily with us.</p>
        </div>
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-3xl shadow p-8 md:p-12"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Send us a message</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <input
            type="text"
            placeholder="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="border rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />

          <textarea
            placeholder="Your Message"
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="border rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl w-full font-semibold transition transform hover:scale-105"
          >
            Send Message
          </button>
        </form>

        {/* Success Message */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-xl text-center font-semibold"
            >
              ✅ Your message has been sent successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Optional Map / Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="rounded-3xl overflow-hidden shadow"
      >
        <div className="w-full h-64 rounded-xl overflow-hidden shadow">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24135.22429227733!2d72.55720882480405!3d23.02250581347396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84d9af2ae7a9%3A0xf0a521e8c7ba7c13!2sAhmedabad%2C%20Gujarat%2C%20India!5e0!3m2!1sen!2sin!4v1704038000000!5m2!1sen!2sin"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

      </motion.div>
    </div>
  );
}
