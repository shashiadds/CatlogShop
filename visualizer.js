// Room Visualizer Module

export class RoomVisualizer {
  constructor(canvasElement, controlsContainer) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.controls = controlsContainer;
    
    this.bgImage = new Image();
    this.bgImage.onload = () => this.draw();
    
    this.items = []; // Items placed on the canvas: { product, x, y, width, height, img, isFlipped }
    this.selectedItemIndex = -1;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    
    this.initEvents();
  }

  loadBackground(imageSrc) {
    this.bgImage.src = imageSrc;
    // Clear items when room changes to match aesthetic, or keep them?
    // Let's keep them but make sure they're scaled correctly.
  }

  addItem(product, colorImageSrc) {
    const img = new Image();
    img.src = colorImageSrc;
    img.onload = () => {
      // Calculate initial size (e.g., width = 200px, height proportional)
      const aspect = img.height / img.width;
      const width = 160;
      const height = 160 * aspect;
      
      // Place in center of canvas
      const x = (this.canvas.width - width) / 2;
      const y = (this.canvas.height - height) / 2;

      this.items.push({
        product: product,
        colorImageSrc: colorImageSrc,
        img: img,
        x: x,
        y: y,
        width: width,
        height: height,
        isFlipped: false
      });
      
      this.selectedItemIndex = this.items.length - 1;
      this.draw();
      this.updateControls();
    };
  }

  deleteSelected() {
    if (this.selectedItemIndex > -1) {
      this.items.splice(this.selectedItemIndex, 1);
      this.selectedItemIndex = -1;
      this.draw();
      this.updateControls();
    }
  }

  flipSelected() {
    if (this.selectedItemIndex > -1) {
      const item = this.items[this.selectedItemIndex];
      item.isFlipped = !item.isFlipped;
      this.draw();
    }
  }

  resizeSelected(scaleValue) {
    // scaleValue is between 0.2 and 2.0
    if (this.selectedItemIndex > -1) {
      const item = this.items[this.selectedItemIndex];
      const aspect = item.img.height / item.img.width;
      const baseWidth = 160;
      
      const newWidth = baseWidth * scaleValue;
      const newHeight = baseWidth * scaleValue * aspect;
      
      // Keep centered at current position
      item.x = item.x + (item.width - newWidth) / 2;
      item.y = item.y + (item.height - newHeight) / 2;
      item.width = newWidth;
      item.height = newHeight;
      
      this.draw();
    }
  }

  moveLayer(direction) {
    // direction: 'up' or 'down'
    if (this.selectedItemIndex === -1) return;
    
    const idx = this.selectedItemIndex;
    if (direction === "up" && idx < this.items.length - 1) {
      // Swap with next
      const temp = this.items[idx];
      this.items[idx] = this.items[idx + 1];
      this.items[idx + 1] = temp;
      this.selectedItemIndex = idx + 1;
    } else if (direction === "down" && idx > 0) {
      // Swap with previous
      const temp = this.items[idx];
      this.items[idx] = this.items[idx - 1];
      this.items[idx - 1] = temp;
      this.selectedItemIndex = idx - 1;
    }
    
    this.draw();
    this.updateControls();
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background (cover option)
    if (this.bgImage.src) {
      // Calculate coordinates to cover canvas
      const canvasRatio = this.canvas.width / this.canvas.height;
      const imgRatio = this.bgImage.width / this.bgImage.height;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = this.canvas.height;
        drawW = this.canvas.height * imgRatio;
        drawX = (this.canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = this.canvas.width;
        drawH = this.canvas.width / imgRatio;
        drawX = 0;
        drawY = (this.canvas.height - drawH) / 2;
      }

      this.ctx.drawImage(this.bgImage, drawX, drawY, drawW, drawH);
    } else {
      // solid fallback
      this.ctx.fillStyle = "#EAE6DF";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw all items
    this.items.forEach((item, index) => {
      this.ctx.save();
      
      // Draw shadow for placed furniture
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetY = 8;
      
      if (item.isFlipped) {
        // Translate and scale to flip horizontally
        this.ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(item.img, -item.width / 2, -item.height / 2, item.width, item.height);
      } else {
        this.ctx.drawImage(item.img, item.x, item.y, item.width, item.height);
      }
      
      this.ctx.restore();

      // Selection outline for active item
      if (index === this.selectedItemIndex) {
        this.ctx.save();
        this.ctx.strokeStyle = "#4F46E5";
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
        this.ctx.strokeRect(item.x - 2, item.y - 2, item.width + 4, item.height + 4);
        
        // Render resizing handle
        this.ctx.fillStyle = "#4F46E5";
        this.ctx.fillRect(item.x - 5, item.y - 5, 10, 10);
        this.ctx.fillRect(item.x + item.width - 5, item.y - 5, 10, 10);
        this.ctx.fillRect(item.x - 5, item.y + item.height - 5, 10, 10);
        this.ctx.fillRect(item.x + item.width - 5, item.y + item.height - 5, 10, 10);
        this.ctx.restore();
      }
    });
  }

  initEvents() {
    const getMousePos = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      
      // Account for canvas CSS scaling
      return {
        x: ((clientX - rect.left) / rect.width) * this.canvas.width,
        y: ((clientY - rect.top) / rect.height) * this.canvas.height
      };
    };

    const handleStart = (evt) => {
      const pos = getMousePos(evt);
      
      // Find if clicked on any item (reverse loop to get top layers first)
      let foundIndex = -1;
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        if (
          pos.x >= item.x &&
          pos.x <= item.x + item.width &&
          pos.y >= item.y &&
          pos.y <= item.y + item.height
        ) {
          foundIndex = i;
          break;
        }
      }

      this.selectedItemIndex = foundIndex;
      
      if (foundIndex > -1) {
        this.isDragging = true;
        const item = this.items[foundIndex];
        this.dragOffsetX = pos.x - item.x;
        this.dragOffsetY = pos.y - item.y;
        
        // Prevent scroll on touch devices when editing room
        if (evt.cancelable) evt.preventDefault();
      }
      
      this.draw();
      this.updateControls();
    };

    const handleMove = (evt) => {
      if (!this.isDragging || this.selectedItemIndex === -1) return;
      
      const pos = getMousePos(evt);
      const item = this.items[this.selectedItemIndex];
      
      // Bound checking to stay within visualizer border slightly
      item.x = pos.x - this.dragOffsetX;
      item.y = pos.y - this.dragOffsetY;
      
      this.draw();
    };

    const handleEnd = () => {
      this.isDragging = false;
    };

    // Mouse Listeners
    this.canvas.addEventListener("mousedown", handleStart);
    this.canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    // Touch Listeners (Mobile compatibility)
    this.canvas.addEventListener("touchstart", handleStart, { passive: false });
    this.canvas.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  }

  updateControls() {
    if (!this.controls) return;
    
    if (this.selectedItemIndex === -1) {
      this.controls.classList.add("hidden");
      return;
    }

    this.controls.classList.remove("hidden");
    const item = this.items[this.selectedItemIndex];
    
    // Set slider value based on item size compared to standard base width (160)
    const sizeSlider = this.controls.querySelector(".size-slider");
    if (sizeSlider) {
      sizeSlider.value = (item.width / 160).toFixed(2);
    }
  }

  exportImage() {
    // Hide selection outline before exporting
    const prevSelection = this.selectedItemIndex;
    this.selectedItemIndex = -1;
    this.draw();
    
    const dataUrl = this.canvas.toDataURL("image/jpeg", 0.95);
    
    // Restore selection
    this.selectedItemIndex = prevSelection;
    this.draw();
    
    return dataUrl;
  }

  clearAll() {
    this.items = [];
    this.selectedItemIndex = -1;
    this.draw();
    this.updateControls();
  }
}
