"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <span className="text-accent font-medium tracking-wider uppercase text-sm">Get in Touch</span>
        <h1 className="font-display text-5xl font-bold text-primary mt-2">Contact Us</h1>
        <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-8">
          <p className="text-muted text-lg leading-relaxed">
            Have questions about our products or need help with your order? 
            We&apos;re here to assist you.
          </p>

          <div className="space-y-6">
            {[
              { icon: MapPin, label: "Address", value: "123 Fashion Street, Karachi, Pakistan" },
              { icon: Phone, label: "Phone", value: "+92 300 1234567" },
              { icon: Mail, label: "Email", value: "hello@zaritaanka.com" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="p-3 bg-bg border border-border text-accent">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-primary">{item.label}</h4>
                  <p className="text-muted text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 border border-border">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Message</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors resize-none"
              placeholder="How can we help?"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
          >
            Send Message <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}