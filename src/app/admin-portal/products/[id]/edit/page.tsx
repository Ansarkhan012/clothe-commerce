"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/Client";
import { ArrowLeft, X, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

const MAX_IMAGES = 5;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]); 
  const [sizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
  });

  // Existing product fetch karo
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Product not found");

        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          stock: data.stock?.toString() || "",
        });
        setProductImages(data.images || []);
        setSelectedSizes(data.sizes || []);
      } catch (err: any) {
        alert("Error loading product: " + err.message);
        router.push("/admin-portal");
      } finally {
        setFetching(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  // Nai image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const remaining = MAX_IMAGES - productImages.length;
    if (remaining <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = "";
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      alert(`Only ${remaining} more image(s) can be added. Extra images will be ignored.`);
    }

    setUploadingImages(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          alert(`"${file.name}" is not an image.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`"${file.name}" is too large. Max 5MB allowed.`);
          continue;
        }

        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }

      setProductImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  // Image remove — storage se baad mein delete hogi submit par
  const removeImage = (index: number) => {
    const url = productImages[index];
    setRemovedImages((prev) => [...prev, url]); // track karo
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Form submit — update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Product title is required.");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) <= 0) {
      alert("Please enter a valid stock value.");
      return;
    }
    if (selectedSizes.length === 0) {
      alert("Please select at least one size.");
      return;
    }
    if (productImages.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);

    try {
      // 1. Removed images storage se delete karo
      if (removedImages.length > 0) {
        const filenames = removedImages.map((url) => {
          const parts = url.split("/");
          return parts[parts.length - 1];
        });
        await supabase.storage.from("products").remove(filenames);
      }

      // 2. Database update karo
      const { error } = await supabase
        .from("products")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          sizes: selectedSizes,
          images: productImages,
        })
        .eq("id", productId);

      if (error) throw error;

      alert("Product updated successfully!");
      router.push("/admin-portal");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  const imagesLeft = MAX_IMAGES - productImages.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin-portal"
        className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold text-primary mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 border border-border">

        {/* Title */}
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

        {/* Description */}
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

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Price (Rs.) *</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
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
              min="1"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
              placeholder="10"
            />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">Sizes *</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 border text-sm font-medium transition-all ${
                  selectedSizes.includes(size)
                    ? "bg-accent text-white border-accent"
                    : "bg-bg border-border text-muted hover:text-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-primary">Product Images *</label>
            <span className={`text-xs font-medium ${imagesLeft === 0 ? "text-error" : "text-muted"}`}>
              {productImages.length}/{MAX_IMAGES} uploaded
            </span>
          </div>

          {/* Upload Button */}
          {imagesLeft > 0 && (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-border bg-bg cursor-pointer hover:border-accent transition-all ${
                  uploadingImages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploadingImages ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-sm">
                      Click to upload images — {imagesLeft} slot{imagesLeft !== 1 ? "s" : ""} left (Max 5MB each)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}

          {imagesLeft === 0 && (
            <p className="text-xs text-error mt-1">
              Maximum {MAX_IMAGES} images uploaded. Remove one to add another.
            </p>
          )}

          {/* Image Previews */}
          {productImages.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-3">
                {productImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-24 h-24 object-cover border border-border rounded"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="flex-1 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all"
          >
            {loading ? "Saving..." : "Update Product"}
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