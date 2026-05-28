export let products = [
  {
    id: "lounge-chair",
    name: "Aero Lounge Chair",
    price: 51900,
    category: "furniture",
    subcategory: "Seating",
    description: "An iconic, sculptured lounge chair that combines ergonomic comfort with organic mid-century design. Crafted with sustainably sourced hardwoods and upholstered in premium wool-bouclé.",
    rating: 4.9,
    reviews: 142,
    badge: "Best Seller",
    highlight: true,
    finishes: [
      { id: "oak", name: "Natural Oak", hex: "#E4C59E" },
      { id: "walnut", name: "American Walnut", hex: "#7E593C" }
    ],
    colors: [
      { id: "cream", name: "Bouclé Cream", hex: "#F3EFE9", image: "images/products/lounge-chair-cream.jpg" },
      { id: "sage", name: "Sage Green", hex: "#8A9A86", image: "images/products/lounge-chair-sage.jpg" },
      { id: "rust", name: "Rust Velvet", hex: "#C06C4C", image: "images/products/lounge-chair-rust.jpg" }
    ],
    specs: {
      "Dimensions": "32\" W x 34\" D x 31\" H",
      "Material": "Solid Hardwood Frame, High-Resiliency Foam",
      "Assembly": "Fully assembled",
      "Weight Capacity": "300 lbs"
    }
  },
  {
    id: "standing-desk",
    name: "Apex Standing Desk",
    price: 71900,
    category: "furniture",
    subcategory: "Tables",
    description: "Elevate your work with our dual-motor smart standing desk. Features programmable memory presets, a gyro-based anti-collision system, and a premium solid wood desktop.",
    rating: 4.8,
    reviews: 98,
    badge: "New",
    highlight: true,
    finishes: [
      { id: "walnut", name: "Solid Walnut", hex: "#634731" },
      { id: "bamboo", name: "Sustain Bamboo", hex: "#EAD09D" },
      { id: "charcoal", name: "Charcoal Ash", hex: "#3E3E3E" }
    ],
    colors: [
      { id: "black-frame", name: "Stealth Black Frame", hex: "#1A1A1A", image: "images/products/standing-desk-black.jpg" },
      { id: "white-frame", name: "Arctic White Frame", hex: "#F5F5F5", image: "images/products/standing-desk-white.jpg" }
    ],
    specs: {
      "Dimensions": "60\" W x 30\" D x 25\"-50.5\" H",
      "Motors": "Dual-Motor, Whisper Quiet (<45dB)",
      "Lift Capacity": "350 lbs",
      "Warranty": "10-Year Frame & Motor Warranty"
    }
  },
  {
    id: "sectional-sofa",
    name: "Sonder Modular Sofa",
    price: 199900,
    category: "furniture",
    subcategory: "Seating",
    description: "A deeply comfortable modular sectional that adapts to your space. Change the layout easily with smart hidden connectors. Features stain-resistant performance linen.",
    rating: 4.7,
    reviews: 73,
    badge: "Premium",
    highlight: false,
    finishes: [
      { id: "legs-black", name: "Matte Black Steel", hex: "#222222" },
      { id: "legs-oak", name: "Solid Oak Pegs", hex: "#D2B48C" }
    ],
    colors: [
      { id: "oat", name: "Oat Linen", hex: "#EAE6DF", image: "images/products/sectional-sofa-oat.jpg" },
      { id: "charcoal", name: "Slate Charcoal", hex: "#555A60", image: "images/products/sectional-sofa-charcoal.jpg" },
      { id: "emerald", name: "Emerald Velvet", hex: "#1F4E3E", image: "images/products/sectional-sofa-emerald.jpg" }
    ],
    specs: {
      "Dimensions": "115\" W x 76\" D x 33\" H",
      "Fabric": "Stain-resistant performance fiber",
      "Frame": "Kiln-dried hardwood",
      "Cushions": "Down-alternative wrap with pocket coil core"
    }
  },
  {
    id: "dining-table",
    name: "Modus Dining Table",
    price: 103000,
    category: "furniture",
    subcategory: "Tables",
    description: "An elegant centerpiece showcasing a sculptural pedestal base and soft-beveled tabletop. Made of solid hardwoods to last generations. Comfortably seats six.",
    rating: 4.9,
    reviews: 55,
    badge: "Limited Edition",
    highlight: false,
    finishes: [
      { id: "ash", name: "Natural White Ash", hex: "#E8D8C8" },
      { id: "smoked-oak", name: "Smoked Oak", hex: "#4A3B32" }
    ],
    colors: [
      { id: "natural", name: "Natural Finish", hex: "#DFCEB8", image: "images/products/dining-table-natural.jpg" }
    ],
    specs: {
      "Dimensions": "78\" W x 38\" D x 30\" H",
      "Material": "Solid Ash Wood or White Oak",
      "Seats": "6-8 adults",
      "Weight": "145 lbs"
    }
  },
  {
    id: "curved-monitor",
    name: "AeroView 34\" Curved Monitor",
    price: 63900,
    category: "electronics",
    subcategory: "Displays",
    description: "Immerse yourself in work or gaming with this ultra-wide 1500R curved monitor. Features Nano-IPS color accuracy, 165Hz refresh rate, and Thunderbolt 4 single-cable connectivity.",
    rating: 4.8,
    reviews: 215,
    badge: "Best Seller",
    highlight: true,
    colors: [
      { id: "slate", name: "Slate Grey", hex: "#3A3D40", image: "images/products/curved-monitor-slate.jpg" },
      { id: "white", name: "Arctic White", hex: "#EAEAEA", image: "images/products/curved-monitor-white.jpg" }
    ],
    specs: {
      "Screen Size / Panel": "34\" UWQHD (3440 x 1440) Nano-IPS",
      "Refresh Rate / Response": "165Hz / 1ms GtG",
      "Brightness / Contrast": "400 nits / HDR 400 / 1000:1",
      "Ports": "1x Thunderbolt 4 (90W PD), 2x HDMI 2.1, 1x DP 1.4, USB Hub"
    }
  },
  {
    id: "mechanical-keyboard",
    name: "Keeb Craft Mechanical Keyboard",
    price: 14900,
    category: "electronics",
    subcategory: "Peripherals",
    description: "A compact 75% mechanical keyboard engineered for typing enthusiasts. Features hot-swappable custom tactile switches, pre-lubed stabilizers, and a CNC-milled aluminum chassis.",
    rating: 4.9,
    reviews: 310,
    badge: "Trending",
    highlight: true,
    colors: [
      { id: "stealth", name: "Stealth Black", hex: "#232323", image: "images/products/keyboard-stealth.jpg" },
      { id: "retro", name: "Retro Grey", hex: "#C7C8CA", image: "images/products/keyboard-retro.jpg" },
      { id: "cyber", name: "Cyberpunk Green", hex: "#00FF7F", image: "images/products/keyboard-cyber.jpg" }
    ],
    specs: {
      "Layout": "75% Layout (84 keys)",
      "Switches": "Hot-swappable KeebCraft Linear/Tactile Switches",
      "Connectivity": "Bluetooth 5.1, 2.4Ghz Wireless, USB-C",
      "Battery Life": "Up to 150 hours (RGB off)"
    }
  },
  {
    id: "studio-headphones",
    name: "Aura Studio Headphones",
    price: 27900,
    category: "electronics",
    subcategory: "Audio",
    description: "Studio-grade wireless audio with hybrid Active Noise Cancellation. Features custom-engineered 40mm beryllium drivers for pristine highs and deep, textured bass response.",
    rating: 4.6,
    reviews: 184,
    badge: "Premium",
    highlight: false,
    colors: [
      { id: "obsidian", name: "Obsidian Black", hex: "#1C1C1E", image: "images/products/headphones-obsidian.jpg" },
      { id: "sandstone", name: "Sandstone Beige", hex: "#D6CFC7", image: "images/products/headphones-sandstone.jpg" },
      { id: "cobalt", name: "Cobalt Blue", hex: "#2A4B7C", image: "images/products/headphones-cobalt.jpg" }
    ],
    specs: {
      "Drivers": "40mm Custom Beryllium Dynamic Drivers",
      "ANC": "Hybrid ANC (up to 40dB suppression)",
      "Battery Life": "45 Hours (ANC On) / Quick Charge (10m = 5h)",
      "Codecs": "LDAC, aptX Adaptive, AAC, SBC"
    }
  },
  {
    id: "smart-projector",
    name: "Lumina 4K Smart Projector",
    price: 95900,
    category: "electronics",
    subcategory: "Displays",
    description: "Transform any wall into a 150-inch cinema. Features native 4K laser projection, built-in soundbar tuned by Harmon/Kardon, and automated instant screen calibration.",
    rating: 4.7,
    reviews: 64,
    badge: "Must Have",
    highlight: false,
    colors: [
      { id: "space-grey", name: "Space Grey", hex: "#4E4F51", image: "images/products/projector-grey.jpg" },
      { id: "alpine", name: "Alpine White", hex: "#F2F2F2", image: "images/products/projector-white.jpg" }
    ],
    specs: {
      "Brightness": "2200 ANSI Lumens",
      "Resolution": "True 4K UHD (3840 x 2116)",
      "Audio": "Built-in Dual 15W Harman/Kardon Speakers",
      "OS / Smart Features": "Android TV / Autofocus & Obstacle Avoidance"
    }
  }
];

export const rooms = [
  {
    id: "office",
    name: "Minimalist Home Office",
    image: "images/rooms/office-bg.jpg"
  },
  {
    id: "living-room",
    name: "Contemporary Living Room",
    image: "images/rooms/living-bg.jpg"
  }
];

// Helper function to generate the products.js file content dynamically for download
export function generateProductsJsString(productsList) {
  return `// Offline catalog products database
export let products = ${JSON.stringify(productsList, null, 2)};

// Room presets for room designer visualizer
export const rooms = ${JSON.stringify(rooms, null, 2)};
`;
}
