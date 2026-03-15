import { Search, Scan, Grid3X3, List, Loader2, Package } from "lucide-preact";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useState, useRef } from "preact/hooks";
import ProductItem from "./pos-product-item";
import { useCustomerDefaults } from "@/presentation/providers";
import type { Product } from "../entities/Product";
import type { Category } from "../entities/Category";

interface POSProductsProps {
  products: Product[];
  loading: boolean;
  categories: Category[];
  selectedCategoryId: number | undefined;
  onCategoryChange: (categoryId: number | undefined) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBarcodeScanned: (barcode: string) => Promise<Product | null>;
}

/// Left panel - Products
function POSProducts({
  products,
  loading,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onAddToCart,
  onBarcodeScanned,
}: POSProductsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const customerDefaults = useCustomerDefaults();

  // Use settings-based customer data
  const selectedCustomer = {
    type: customerDefaults?.defaultCustomerType || "regular",
    name: customerDefaults?.defaultCustomerName || "Cliente General",
  };

  // Build categories array with "All" option
  const categoryOptions = [
    { id: undefined, name: "Todas" }, // "All" option shows all products
    ...categories.filter((c) => c.isActive),
  ];

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  // Filter products based on search term (category filtering happens at DB level)
  const filteredProducts = products.filter((product) => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleBarcodeSubmit = async (e: any) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      const product = await onBarcodeScanned(barcodeInput.trim());
      if (product) {
        onAddToCart(product);
      }
      setBarcodeInput("");
    }
  };

  const getPrice = (product: Product) => {
    // Apply customer-specific pricing
    switch (selectedCustomer.type) {
      case "partner":
        return product.partnerPrice || product.price;
      case "vip":
        return product.vipPrice || product.price;
      default:
        return product.price;
    }
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
                placeholder="Buscar productos..."
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
                  placeholder="Código de barras"
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
                Agregar
              </Button>
            </form>
          </div>

          {/* Category Filter and View Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {categoryOptions.map((category) => (
                <Button
                  key={category.id ?? "all"}
                  variant={
                    selectedCategoryId === category.id ? "default" : "outline"
                  }
                  onClick={() => onCategoryChange(category.id)}
                  className={`h-10 ${
                    selectedCategoryId === category.id
                      ? "bg-primary hover:bg-primary-hover text-primary-foreground"
                      : "border-primary/20 text-primary hover:bg-primary-light"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-border rounded-lg p-1 bg-card">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-3 ${
                  viewMode === "grid"
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
                className={`h-8 px-3 ${
                  viewMode === "list"
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
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          // Database is empty - need to run seeder
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              No hay productos
            </h3>
            <p className="text-sm text-muted-foreground">
              La base de datos está vacía
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          // Products exist but search/filter returned nothing
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              No se encontraron productos
            </h3>
            <p className="text-sm text-muted-foreground">
              Intenta con otro término de búsqueda o categoría
            </p>
          </div>
        ) : (
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
                onAddToCart={() => onAddToCart(product)}
                displayPrice={getPrice(product)}
                showOriginalPrice={selectedCustomer.type !== "regular"}
                originalPrice={product.price}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default POSProducts;
