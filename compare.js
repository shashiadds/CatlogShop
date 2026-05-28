// Comparison Manager Module

class CompareManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("catalog_compare")) || [];
  }

  save() {
    localStorage.setItem("catalog_compare", JSON.stringify(this.items));
    window.dispatchEvent(new CustomEvent("compare-updated", { detail: this.items }));
  }

  getItems() {
    return this.items;
  }

  addItem(product) {
    if (this.items.find(item => item.id === product.id)) {
      return { success: false, message: "Product already in comparison dock" };
    }
    
    if (this.items.length >= 3) {
      return { success: false, message: "Comparison is limited to a maximum of 3 products" };
    }

    this.items.push(product);
    this.save();
    return { success: true };
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  }

  has(productId) {
    return this.items.some(item => item.id === productId);
  }

  clear() {
    this.items = [];
    this.save();
  }

  isFull() {
    return this.items.length >= 3;
  }
}

export const compare = new CompareManager();
