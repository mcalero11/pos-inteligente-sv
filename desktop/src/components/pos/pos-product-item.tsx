import { Package } from "lucide-preact";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface ProductItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  displayPrice: number;
  showOriginalPrice?: boolean;
  originalPrice?: number;
  viewMode: "grid" | "list";
}

function ProductItem({
  product,
  onAddToCart,
  displayPrice,
  showOriginalPrice,
  originalPrice,
  viewMode,
}: ProductItemProps) {
  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30 bg-card border-border"
        onClick={() => onAddToCart(product)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Product Image/Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary/10 rounded-lg flex items-center justify-center border border-primary/10 shrink-0">
              <Package className="w-8 h-8 text-primary" />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-card-foreground truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                      {product.category}
                    </span>
                    <span
                      className={`text-xs font-medium ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-500" : "text-red-500"}`}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-primary">
                    ${displayPrice.toFixed(2)}
                  </p>
                  {showOriginalPrice && originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      ${originalPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (original layout)
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30 hover:scale-[1.02] bg-card border-border"
      onClick={() => onAddToCart(product)}
    >
      <CardContent className="p-4">
        {/* Product Image/Icon */}
        <div className="aspect-square bg-gradient-to-br from-primary-light to-primary/10 rounded-xl mb-4 flex items-center justify-center border border-primary/10">
          <Package className="w-12 h-12 text-primary" />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem] text-card-foreground">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="space-y-1">
            <p className="text-xl font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </p>
            {showOriginalPrice && originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-sm">
            <span
              className={`font-medium ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-500" : "text-red-500"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
            <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductItem;
