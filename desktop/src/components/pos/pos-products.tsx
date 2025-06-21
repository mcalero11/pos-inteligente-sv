import { Search, Scan, Grid3X3, List } from "lucide-preact";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "preact/hooks";
import { usePOSTranslation } from "@/hooks/use-pos-translation";
import ProductItem from "./pos-product-item";
import { useCustomerDefaults } from "@/contexts/SettingsContext";

// Mock data - you can replace this with actual data later
const mockProducts = [
  {
    id: 1,
    name: "Coffee - Medium Roast",
    price: 12.99,
    stock: 50,
    category: "Beverages",
  },
  {
    id: 2,
    name: "Sandwich - Turkey Club",
    price: 8.5,
    stock: 25,
    category: "Food",
  },
  {
    id: 3,
    name: "Notebook - Spiral",
    price: 3.25,
    stock: 100,
    category: "Office",
  },
  {
    id: 4,
    name: "Energy Drink",
    price: 2.75,
    stock: 75,
    category: "Beverages",
  },
  { id: 5, name: "Protein Bar", price: 4.99, stock: 30, category: "Food" },
  { id: 6, name: "Pen Set", price: 7.5, stock: 40, category: "Office" },
  { id: 7, name: "Green Tea", price: 11.99, stock: 45, category: "Beverages" },
  { id: 8, name: "Caesar Salad", price: 9.75, stock: 15, category: "Food" },
  {
    id: 9,
    name: "Highlighter Pack",
    price: 4.25,
    stock: 60,
    category: "Office",
  },
  {
    id: 10,
    name: "Smoothie - Berry Blast",
    price: 6.5,
    stock: 0,
    category: "Beverages",
  },
];

/// Left panel - Products
function POSProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { t } = usePOSTranslation();
  const customerDefaults = useCustomerDefaults();

  // Use settings-based customer data
  const selectedCustomer = {
    type: customerDefaults?.defaultCustomerType || "regular",
    name: customerDefaults?.defaultCustomerName || "Cliente General"
  };

  // Categories with translations
  const categories = [
    { key: "all", label: t('pos:products.categories.all') },
    { key: "beverages", label: t('pos:products.categories.beverages') },
    { key: "food", label: t('pos:products.categories.food') },
    { key: "office", label: t('pos:products.categories.office') }
  ];

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  // Filter products based on search term and category
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleBarcodeSubmit = (e: any) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      // Placeholder for barcode scanning logic
      globalThis.console?.log("Scanning barcode:", barcodeInput);
      setBarcodeInput("");
    }
  };

  const addToCart = (product: any) => {
    // Placeholder for add to cart logic
    globalThis.console?.log("Adding to cart:", product);
  };

  const getPrice = (product: any) => {
    // Apply customer discounts if needed
    if (selectedCustomer.type === "regular") {
      return product.price;
    }
    // Apply discount for other customer types
    return product.price * 0.9; // 10% discount example
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Search and Barcode - Fixed at top */}
      <div className="p-6 pb-4 shrink-0">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder={t('pos:products.search_placeholder')}
                value={searchTerm}
                onInput={(e: any) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg focus:ring-primary focus:border-primary"
              />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative">
                <Scan className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  ref={barcodeInputRef}
                  placeholder={t('pos:products.barcode_placeholder')}
                  value={barcodeInput}
                  onInput={(e: any) => setBarcodeInput(e.target.value)}
                  className="pl-10 h-12 w-48 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                {t('pos:products.add_button')}
              </Button>
            </form>
          </div>

          {/* Category Filter and View Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={
                    selectedCategory === category.key ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.key)}
                  className={`h-10 ${selectedCategory === category.key
                    ? "bg-primary hover:bg-primary-hover text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary-light"
                    }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-border rounded-lg p-1 bg-card">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-3 ${viewMode === "grid"
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "hover:bg-muted text-muted-foreground"
                  }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 ${viewMode === "list"
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "hover:bg-muted text-muted-foreground"
                  }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid/List - Scrollable */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
              : "space-y-3"
          }
        >
          {filteredProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              displayPrice={getPrice(product)}
              showOriginalPrice={selectedCustomer.type !== "regular"}
              originalPrice={product.price}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default POSProducts;
