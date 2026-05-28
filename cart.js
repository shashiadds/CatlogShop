// Cart State and Management Module

class CartManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("catalog_cart")) || [];
    this.promoCode = localStorage.getItem("catalog_promo") || null;
    this.discounts = {
      "WELCOME10": 0.10,
      "SUPERDEAL": 0.20,
      "ECOFRIENDLY": 0.15
    };
  }

  save() {
    localStorage.setItem("catalog_cart", JSON.stringify(this.items));
    if (this.promoCode) {
      localStorage.setItem("catalog_promo", this.promoCode);
    } else {
      localStorage.removeItem("catalog_promo");
    }
    // Dispatch event to notify UI
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: this.items }));
  }

  getItems() {
    return this.items;
  }

  addItem(product, color, finish = null) {
    const existingIndex = this.items.findIndex(item => 
      item.product.id === product.id && 
      item.color.id === color.id && 
      (!finish || (item.finish && item.finish.id === finish.id))
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        product: {
          id: product.id,
          name: product.name,
          marathiName: product.marathiName || product.name,
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          marathiSubcategory: product.marathiSubcategory || product.subcategory
        },
        color: {
          id: color.id,
          name: color.name,
          hex: color.hex,
          image: color.image
        },
        finish: finish ? {
          id: finish.id,
          name: finish.name,
          hex: finish.hex
        } : null,
        quantity: 1
      });
    }
    this.save();
  }

  removeItem(productId, colorId, finishId = null) {
    this.items = this.items.filter(item => !(
      item.product.id === productId && 
      item.color.id === colorId && 
      (!finishId || (item.finish && item.finish.id === finishId))
    ));
    this.save();
  }

  updateQuantity(productId, colorId, finishId = null, qty) {
    const index = this.items.findIndex(item => 
      item.product.id === productId && 
      item.color.id === colorId && 
      (!finishId || (item.finish && item.finish.id === finishId))
    );

    if (index > -1) {
      if (qty <= 0) {
        this.items.splice(index, 1);
      } else {
        this.items[index].quantity = qty;
      }
      this.save();
    }
  }

  clear() {
    this.items = [];
    this.promoCode = null;
    this.save();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  applyPromoCode(code) {
    const cleanCode = code.toUpperCase().trim();
    if (this.discounts[cleanCode] !== undefined) {
      this.promoCode = cleanCode;
      this.save();
      return { success: true, discount: this.discounts[cleanCode] };
    }
    return { success: false, message: "Invalid promo code" };
  }

  removePromoCode() {
    this.promoCode = null;
    this.save();
  }

  getPromoCode() {
    return this.promoCode;
  }

  getDiscountAmount() {
    if (!this.promoCode || !this.discounts[this.promoCode]) return 0;
    return this.getSubtotal() * this.discounts[this.promoCode];
  }

  getTax() {
    // 8% mock sales tax
    return (this.getSubtotal() - this.getDiscountAmount()) * 0.08;
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const tax = this.getTax();
    return subtotal - discount + tax;
  }

  checkout(orderInfo) {
    // Returns a mock invoice report
    const invoice = {
      orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      customer: orderInfo,
      items: [...this.items],
      subtotal: this.getSubtotal(),
      promoCode: this.promoCode,
      discount: this.getDiscountAmount(),
      tax: this.getTax(),
      total: this.getTotal()
    };
    
    this.clear();
    return invoice;
  }
}

export const cart = new CartManager();
