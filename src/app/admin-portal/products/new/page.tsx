"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/Client";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([""]);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('products').insert({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: images.filter(img => img.trim() !== ""),
        sizes: sizes,
      });

      if (error) throw error;
      
      router.push('/admin-portal');
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin-portal" className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold text-primary mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 border border-border">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">Product Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
            placeholder="e.g., Embroidered Lawn Suit - Mint Green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none resize-none"
            placeholder="Product description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Price (Rs.) *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
              placeholder="4500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Stock *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">Sizes</label>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <span key={size} className="px-3 py-1 bg-bg border border-border text-sm">{size}</span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">Images</label>
          <div className="space-y-3">
            {images.map((img, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-3 text-muted hover:text-error border border-border"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors"
            >
              <Plus size={16} /> Add another image
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
          <Link
            href="/admin-portal"
            className="px-8 py-4 border border-border text-primary hover:border-primary transition-all text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}