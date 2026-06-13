"use client";

import { useState } from "react";
import { SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";

const categories = ["All", "Lawn", "Chiffon", "Silk", "Cotton", "Formal"];
const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low", "Popular"];

export function FilterBar() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-muted">
          <SlidersHorizontal size={18} />
          <span className="text-sm font-medium">Filter By:</span>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-border text-sm px-4 py-2 focus:outline-none focus:border-accent"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          
          <div className="flex gap-1">
            <button className="p-2 text-accent bg-bg border border-accent">
              <Grid3X3 size={18} />
            </button>
            <button className="p-2 text-muted hover:text-primary border border-border">
              <LayoutList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 text-sm font-medium transition-all duration-300 border ${
              activeCategory === cat
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-primary border-border hover:border-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}