import React from "react";
import { 
  FiHome, 
  FiHeadphones, 
  FiShoppingBag, 
  FiWatch, 
  FiCoffee, 
  FiGift, 
  FiCamera, 
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiArrowRight
} from "react-icons/fi";
import { FaBicycle, FaGamepad } from "react-icons/fa";

export default function Test() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Popular Categories */}
      <div className="mb-10">
        <h2 className="text-xl font-medium mb-6">Explore Popular Categories</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.bgColor}`}>
                {category.icon}
              </div>
              <span className="text-xs mt-2">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">New Arrivals</h2>
          <a href="#" className="text-sm text-gray-500 hover:underline flex items-center">
            See All Products <FiArrowRight className="ml-1" />
          </a>
        </div>
        <div className="relative">
          <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
            <FiChevronLeft className="text-gray-500" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-hidden">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
            <FiChevronRight className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Popular Products Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div>
          <h3 className="text-lg font-medium mb-4">Popular Products</h3>
          <div className="space-y-4">
            {popularProducts.slice(0, 3).map((product) => (
              <SmallProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Most-viewed Items</h3>
          <div className="space-y-4">
            {popularProducts.slice(3, 6).map((product) => (
              <SmallProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">We Think You'll Love</h3>
          <div className="space-y-4">
            {popularProducts.slice(6, 9).map((product) => (
              <SmallProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Daily Deals */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Daily Deals</h2>
          <a href="#" className="text-sm text-gray-500 hover:underline flex items-center">
            See All <FiArrowRight className="ml-1" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dailyDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>

      {/* More to Discover */}
      <div>
        <h2 className="text-xl font-medium mb-6">More to Discover</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {discoverItems.map((item) => (
            <DiscoverCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="relative">
        {product.discount && (
          <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {product.discount}
          </span>
        )}
        {product.new && (
          <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            New
          </span>
        )}
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-contain" />
      </div>
      <div className="p-4">
        <div className="flex items-center mb-1">
          <span className={`w-3 h-3 rounded-full ${product.brandColor}`}></span>
          <span className="text-xs text-gray-500 ml-2">{product.brand}</span>
        </div>
        <h3 className="text-sm font-medium mb-1 line-clamp-2 h-10">{product.name}</h3>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FiStar 
              key={i} 
              className={`w-3 h-3 ${i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-500 line-through ml-2">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
          <div className="flex space-x-1">
            <button className="text-pink-500 p-1">
              <FiHeart className="w-4 h-4" />
            </button>
            <button className="text-blue-500 p-1">
              <FiShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small Product Card Component
function SmallProductCard({ product }) {
  return (
    <div className="flex space-x-3">
      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-medium line-clamp-2">{product.name}</h4>
        <div className="flex items-center my-1">
          {[...Array(5)].map((_, i) => (
            <FiStar 
              key={i} 
              className={`w-3 h-3 ${i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
            />
          ))}
        </div>
        <div className="flex items-center">
          <span className="font-bold text-xs">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-500 line-through ml-2">${product.oldPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Deal Card Component
function DealCard({ deal }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="p-3 bg-red-100 text-red-800 text-xs font-medium">
        Only Available For {deal.hours} Hours
      </div>
      <div className="p-4">
        <img src={deal.image || "/placeholder.svg"} alt={deal.name} className="w-full h-48 object-contain mb-4" />
        {deal.colors && (
          <div className="flex space-x-2 mb-3">
            {deal.colors.map((color, index) => (
              <div key={index} className={`w-6 h-6 rounded-full ${color}`}></div>
            ))}
          </div>
        )}
        <h3 className="text-sm font-medium mb-1 line-clamp-2">{deal.name}</h3>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FiStar 
              key={i} 
              className={`w-3 h-3 ${i < deal.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({deal.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-sm">${deal.price.toFixed(2)}</span>
            {deal.oldPrice && (
              <span className="text-xs text-gray-500 line-through ml-2">${deal.oldPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
      <button className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 text-sm font-medium">
        Add to Cart
      </button>
    </div>
  );
}

// Discover Card Component
function DiscoverCard({ item }) {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex">
      <div className="p-4 flex-1">
        <h3 className="text-lg font-medium mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
        <button className="text-sm font-medium text-blue-600 hover:underline">
          Shop Now
        </button>
      </div>
      <div className="w-1/3">
        <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

// Sample Data
const categories = [
  { name: "Home", icon: <FiHome className="text-red-500" />, bgColor: "bg-red-100" },
  { name: "Electronics", icon: <FiHeadphones className="text-gray-500" />, bgColor: "bg-gray-100" },
  { name: "Food & Drinks", icon: <FiCoffee className="text-amber-500" />, bgColor: "bg-amber-100" },
  { name: "Fashion", icon: <FiBriefcase className="text-gray-500" />, bgColor: "bg-gray-100" },
  { name: "Jewelry", icon: <FiWatch className="text-amber-500" />, bgColor: "bg-amber-100" },
  { name: "Beauty & Makeup", icon: <FiGift className="text-pink-500" />, bgColor: "bg-pink-100" },
  { name: "Toys & Games", icon: <FaGamepad className="text-red-500" />, bgColor: "bg-red-100" },
  { name: "Photography", icon: <FiCamera className="text-gray-500" />, bgColor: "bg-gray-100" },
  { name: "Mobility & Cars", icon: <FaBicycle className="text-black" />, bgColor: "bg-gray-100" },
  { name: "Sports", icon: <FiShoppingBag className="text-gray-500" />, bgColor: "bg-gray-100" },
];

const newArrivals = [
  {
    id: 1,
    name: "KitchenAid Stand Mixer Professional 5 Quart",
    brand: "KitchenAid",
    brandColor: "bg-pink-500",
    image: "/placeholder.svg?height=200&width=200",
    price: 349.99,
    oldPrice: 499.99,
    rating: 5,
    reviews: 128,
    discount: "-30%",
    new: false
  },
  {
    id: 2,
    name: "Modern Glass Vase Decorative Flower Holder",
    brand: "HomeDecor",
    brandColor: "bg-blue-500",
    image: "/placeholder.svg?height=200&width=200",
    price: 39.99,
    rating: 4,
    reviews: 42,
    discount: "-15%",
    new: true
  },
  {
    id: 3,
    name: "Wireless Noise Cancelling Headphones",
    brand: "AudioTech",
    brandColor: "bg-purple-500",
    image: "/placeholder.svg?height=200&width=200",
    price: 199.99,
    oldPrice: 249.99,
    rating: 4,
    reviews: 86,
    new: true
  },
  {
    id: 4,
    name: "Modern Accent Chair with Fabric Upholstery",
    brand: "FurniCraft",
    brandColor: "bg-red-500",
    image: "/placeholder.svg?height=200&width=200",
    price: 149.99,
    rating: 5,
    reviews: 37,
    new: false
  },
  {
    id: 5,
    name: "Premium Leather Card Holder Wallet",
    brand: "LeatherCo",
    brandColor: "bg-amber-500",
    image: "/placeholder.svg?height=200&width=200",
    price: 59.99,
    rating: 5,
    reviews: 24,
    new: false
  }
];

const popularProducts = [
  {
    id: 1,
    name: "Vintage Vinyl Record Player with Bluetooth",
    image: "/placeholder.svg?height=80&width=80",
    price: 129.99,
    rating: 4,
  },
  {
    id: 2,
    name: "Professional Barista Coffee Maker",
    image: "/placeholder.svg?height=80&width=80",
    price: 299.99,
    oldPrice: 349.99,
    rating: 5,
  },
  {
    id: 3,
    name: "Eco-Friendly Bamboo Utensil Set",
    image: "/placeholder.svg?height=80&width=80",
    price: 24.99,
    rating: 4,
  },
  {
    id: 4,
    name: "Wireless Gaming Controller for PlayStation",
    image: "/placeholder.svg?height=80&width=80",
    price: 69.99,
    rating: 4,
  },
  {
    id: 5,
    name: "Minimalist Desk Lamp with USB Charging",
    image: "/placeholder.svg?height=80&width=80",
    price: 49.99,
    rating: 5,
  },
  {
    id: 6,
    name: "Smart Baby Monitor with Night Vision",
    image: "/placeholder.svg?height=80&width=80",
    price: 159.99,
    oldPrice: 199.99,
    rating: 4,
  },
  {
    id: 7,
    name: "Slip-On Canvas Sneakers",
    image: "/placeholder.svg?height=80&width=80",
    price: 39.99,
    rating: 4,
  },
  {
    id: 8,
    name: "Infant Car Seat with Safety Shield",
    image: "/placeholder.svg?height=80&width=80",
    price: 199.99,
    rating: 5,
  },
  {
    id: 9,
    name: "iPhone 14 Pro Max Silicone Case",
    image: "/placeholder.svg?height=80&width=80",
    price: 49.99,
    oldPrice: 59.99,
    rating: 4,
  },
];

const dailyDeals = [
  {
    id: 1,
    name: "Side-by-Side Large Capacity Refrigerator with Ice Maker",
    image: "/placeholder.svg?height=200&width=200",
    price: 1299.99,
    oldPrice: 1599.99,
    rating: 4,
    reviews: 42,
    hours: 24,
    colors: ["bg-emerald-700", "bg-teal-500", "bg-gray-800"]
  },
  {
    id: 2,
    name: "Modern Wooden Lounge Chair with Cushion",
    image: "/placeholder.svg?height=200&width=200",
    price: 249.99,
    oldPrice: 349.99,
    rating: 5,
    reviews: 18,
    hours: 24
  },
  {
    id: 3,
    name: "Electric Kettle with Temperature Control",
    image: "/placeholder.svg?height=200&width=200",
    price: 59.99,
    oldPrice: 79.99,
    rating: 4,
    reviews: 36,
    hours: 24
  },
  {
    id: 4,
    name: "Apple iPhone 12 (128GB) Black",
    image: "/placeholder.svg?height=200&width=200",
    price: 699.99,
    oldPrice: 799.99,
    rating: 5,
    reviews: 124,
    hours: 24
  }
];

const discoverItems = [
  {
    id: 1,
    title: "Clearout Deals",
    description: "Save on discontinued products while supplies last",
    image: "/placeholder.svg?height=150&width=150"
  },
  {
    id: 2,
    title: "20% Off Coffee Makers",
    description: "Start your mornings right with a fresh brew",
    image: "/placeholder.svg?height=150&width=150"
  },
  {
    id: 3,
    title: "Video game Top Deals",
    description: "Check out the latest video game discounts",
    image: "/placeholder.svg?height=150&width=150"
  }
];