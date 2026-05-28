import { products, rooms, loadProductsFromSheet, generateProductsJsString } from "./products.js";
import { cart } from "./cart.js";
import { compare } from "./compare.js";
import { quizQuestions, calculateRecommendations } from "./quiz.js";
import { RoomVisualizer } from "./visualizer.js";
import { CONFIG } from "./config.js";
import { translations } from "./translations.js";

// === APP STATE ===
let currentLanguage = CONFIG.defaultLanguage || "mr";
let currentPavilion = "furniture"; // 'furniture' or 'electronics'
let themeMode = "light"; // 'light' or 'dark'
let activeView = "catalog"; // 'catalog' or 'visualizer'
let currentSort = "featured";
let selectedFilters = {
  subcategories: [],
  maxPrice: 250000,
  search: ""
};

// Quiz State
let quizState = {
  currentStep: 0,
  answers: {}
};

// Quick View State
let quickViewState = {
  product: null,
  color: null,
  finish: null
};

// Visualizer Instance
let visualizer = null;

// === DOM ELEMENTS ===
const splashScreen = document.getElementById("splash-screen");
const enterFurnitureBtn = document.getElementById("enter-furniture-btn");
const enterElectronicsBtn = document.getElementById("enter-electronics-btn");
const appContainer = document.getElementById("app-container");
const brandIcon = document.getElementById("brand-icon");
const brandLogoText = document.getElementById("brand-logo-text");
const tabFurniture = document.getElementById("tab-furniture");
const tabElectronics = document.getElementById("tab-electronics");
const btnThemeLight = document.getElementById("btn-theme-light");
const btnThemeDark = document.getElementById("btn-theme-dark");
const btnLangEn = document.getElementById("btn-lang-en");
const btnLangMr = document.getElementById("btn-lang-mr");

// Catalog DOM
const shopMainView = document.getElementById("shop-main-view");
const subcategoryFilterList = document.getElementById("subcategory-filter-list");
const priceRangeSlider = document.getElementById("price-range-slider");
const priceRangeMaxLabel = document.getElementById("price-range-max-label");
const searchInput = document.getElementById("search-input");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const catalogResultsCount = document.getElementById("catalog-results-count");
const sortDropdown = document.getElementById("sort-dropdown");
const productGrid = document.getElementById("product-grid");

// Visualizer DOM
const visualizerPanel = document.getElementById("visualizer-panel");
const visualizerCanvas = document.getElementById("visualizer-canvas");
const activeItemControls = document.getElementById("active-item-controls");
const itemScaleSlider = document.getElementById("item-scale-slider");
const btnItemFlip = document.getElementById("btn-item-flip");
const btnItemDelete = document.getElementById("btn-item-delete");
const btnItemLayerUp = document.getElementById("btn-item-layer-up");
const btnItemLayerDown = document.getElementById("btn-item-layer-down");
const visualizerPaletteList = document.getElementById("visualizer-palette-list");
const roomPresetOffice = document.getElementById("room-preset-office");
const roomPresetLiving = document.getElementById("room-preset-living");
const exportCanvasBtn = document.getElementById("export-canvas-btn");
const clearCanvasBtn = document.getElementById("clear-canvas-btn");

// Floating buttons DOM
const floatViewCatalog = document.getElementById("float-view-catalog");
const floatViewVisualizer = document.getElementById("float-view-visualizer");
const floatLaunchQuiz = document.getElementById("float-launch-quiz");

// Cart DOM
const headerCartTrigger = document.getElementById("header-cart-trigger");
const cartBadge = document.getElementById("cart-badge");
const cartDrawer = document.getElementById("cart-drawer");
const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items-container");
const promoCodeInput = document.getElementById("promo-code-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoStatusMessage = document.getElementById("promo-status-message");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartDiscountRow = document.getElementById("cart-discount-row");
const cartDiscountLabel = document.getElementById("cart-discount-label");
const cartDiscountValue = document.getElementById("cart-discount-value");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");
const cartCheckoutBtn = document.getElementById("cart-checkout-btn");

// Compare DOM
const compareDock = document.getElementById("compare-dock");
const compareCount = document.getElementById("compare-count");
const compareDockItems = document.getElementById("compare-dock-items");
const compareClearBtn = document.getElementById("compare-clear-btn");
const compareSubmitBtn = document.getElementById("compare-submit-btn");
const compareOverlay = document.getElementById("compare-overlay");
const closeCompareOverlayBtn = document.getElementById("close-compare-overlay-btn");
const compareTableHeaders = document.getElementById("compare-table-headers");
const compareTableBody = document.getElementById("compare-table-body");

// Quiz DOM
const quizOverlay = document.getElementById("quiz-overlay");
const quizSection = document.getElementById("quiz-section");
const quizCloseBtn = document.getElementById("quiz-close-btn");
const quizProgressFill = document.getElementById("quiz-progress-fill");
const quizBody = document.getElementById("quiz-body");
const quizBackBtn = document.getElementById("quiz-back-btn");
const quizNextBtn = document.getElementById("quiz-next-btn");

// Dialog DOM
const quickViewDialog = document.getElementById("quick-view-dialog");
const closeQuickViewBtn = document.getElementById("close-quick-view-btn");
const dialogImage = document.getElementById("dialog-image");
const dialogSubcategory = document.getElementById("dialog-subcategory");
const dialogTitle = document.getElementById("dialog-title");
const dialogStars = document.getElementById("dialog-stars");
const dialogReviews = document.getElementById("dialog-reviews");
const dialogDesc = document.getElementById("dialog-desc");
const dialogCustomizationArea = document.getElementById("dialog-customization-area");
const dialogPrice = document.getElementById("dialog-price");
const dialogAddToCartBtn = document.getElementById("dialog-add-to-cart-btn");


// === INITIALIZATION ===
document.addEventListener("DOMContentLoaded", async () => {
  loadLocalStorageData();
  initSplashEvents();
  initMainEvents();
  initFilterEvents();
  initCartEvents();
  initCompareEvents();
  initQuizEvents();
  initQuickViewEvents();
  initLanguageEvents();
  initAdminEvents();
  
  // Set up Visualizer
  visualizer = new RoomVisualizer(visualizerCanvas, activeItemControls);
  visualizer.loadBackground("images/rooms/office-bg.jpg"); // default room
  initVisualizerEvents();
  
  // Apply brand name from config
  applyConfigBranding();

  // Try Google Sheet dynamic load
  if (CONFIG.useGoogleSheets && CONFIG.spreadsheetId) {
    const success = await loadProductsFromSheet(CONFIG.spreadsheetId);
    if (success) {
      // Re-init filters for new product categories
      renderFilters();
    }
  }

  // Initial language setup
  setLanguage(currentLanguage);
});

// === SPLASH GATE LOGIC ===
function initSplashEvents() {
  const enterPavilion = (pavilion) => {
    currentPavilion = pavilion;
    // Set theme and tab visual
    document.body.className = `theme-${pavilion}`;
    if (pavilion === "furniture") {
      tabFurniture.classList.add("active");
      tabElectronics.classList.remove("active");
      brandIcon.textContent = "🛋️";
    } else {
      tabElectronics.classList.add("active");
      tabFurniture.classList.remove("active");
      brandIcon.textContent = "💻";
    }

    // Refresh subcategories filter mapping
    renderFilters();
    renderProducts();

    // Slide up splash
    splashScreen.classList.add("slide-up");
    appContainer.classList.add("fade-in");
  };

  enterFurnitureBtn.addEventListener("click", () => enterPavilion("furniture"));
  enterElectronicsBtn.addEventListener("click", () => enterPavilion("electronics"));
  
  // Support hitting Enter key on splash splits
  document.getElementById("splash-split-furniture").addEventListener("keydown", (e) => {
    if (e.key === "Enter") enterPavilion("furniture");
  });
  document.getElementById("splash-split-electronics").addEventListener("keydown", (e) => {
    if (e.key === "Enter") enterPavilion("electronics");
  });
}

// === HEADER & DOCK SWITCHERS ===
function initMainEvents() {
  // Switch Pavilions via Navigation bar
  const switchPavilion = (pavilion) => {
    if (currentPavilion === pavilion) return;
    currentPavilion = pavilion;
    
    // View transitions support
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.body.className = `theme-${pavilion} theme-mode-${themeMode}`;
        updatePavilionUI();
      });
    } else {
      document.body.className = `theme-${pavilion} theme-mode-${themeMode}`;
      updatePavilionUI();
    }
  };

  const updatePavilionUI = () => {
    if (currentPavilion === "furniture") {
      tabFurniture.classList.add("active");
      tabFurniture.setAttribute("aria-selected", "true");
      tabElectronics.classList.remove("active");
      tabElectronics.setAttribute("aria-selected", "false");
      brandIcon.textContent = "🛋️";
    } else {
      tabElectronics.classList.add("active");
      tabElectronics.setAttribute("aria-selected", "true");
      tabFurniture.classList.remove("active");
      tabFurniture.setAttribute("aria-selected", "false");
      brandIcon.textContent = "💻";
    }

    // Reset filters
    selectedFilters.subcategories = [];
    selectedFilters.search = "";
    searchInput.value = "";
    priceRangeSlider.value = 250000;
    priceRangeMaxLabel.textContent = "कमाल: ₹२,५०,०००";
    
    renderFilters();
    renderProducts();
  };

  tabFurniture.addEventListener("click", () => switchPavilion("furniture"));
  tabElectronics.addEventListener("click", () => switchPavilion("electronics"));

  // Light/Dark Theme Switch
  const toggleTheme = (mode) => {
    themeMode = mode;
    if (mode === "dark") {
      document.body.classList.add("theme-mode-dark");
      // Add custom class override to force darker layouts
      document.body.style.setProperty("--bg-primary", currentPavilion === "furniture" ? "#1E1A17" : "#080B11");
      document.body.style.setProperty("--bg-secondary", currentPavilion === "furniture" ? "#28231F" : "#101622");
      document.body.style.setProperty("--bg-card", currentPavilion === "furniture" ? "#322A25" : "#151D2F");
      document.body.style.setProperty("--text-primary", currentPavilion === "furniture" ? "#FAF6F0" : "#F3F4F6");
      document.body.style.setProperty("--text-secondary", currentPavilion === "furniture" ? "#BCAFA8" : "#9CA3AF");
      document.body.style.setProperty("--border-color", currentPavilion === "furniture" ? "#4A3F37" : "#243049");
      
      btnThemeDark.classList.add("active");
      btnThemeLight.classList.remove("active");
    } else {
      document.body.classList.remove("theme-mode-dark");
      // Restore standard CSS colors
      document.body.style.removeProperty("--bg-primary");
      document.body.style.removeProperty("--bg-secondary");
      document.body.style.removeProperty("--bg-card");
      document.body.style.removeProperty("--text-primary");
      document.body.style.removeProperty("--text-secondary");
      document.body.style.removeProperty("--border-color");
      
      btnThemeLight.classList.add("active");
      btnThemeDark.classList.remove("active");
    }
  };

  btnThemeLight.addEventListener("click", () => toggleTheme("light"));
  btnThemeDark.addEventListener("click", () => toggleTheme("dark"));

  // View Switching (Catalog Shop vs Room visualizer)
  const setView = (view) => {
    if (activeView === view) return;
    activeView = view;
    
    if (view === "catalog") {
      shopMainView.style.display = "flex";
      visualizerPanel.classList.remove("active");
      floatViewCatalog.classList.add("active");
      floatViewVisualizer.classList.remove("active");
    } else {
      shopMainView.style.display = "none";
      visualizerPanel.classList.add("active");
      floatViewCatalog.classList.remove("active");
      floatViewVisualizer.classList.add("active");
      
      // Force canvas refresh on display
      visualizer.draw();
      renderVisualizerPalette();
    }
  };

  floatViewCatalog.addEventListener("click", () => setView("catalog"));
  floatViewVisualizer.addEventListener("click", () => setView("visualizer"));
}

// === FILTER SYSTEM ===
function renderFilters() {
  // Get all unique subcategories for the current pavilion
  const subcats = [...new Set(products
    .filter(p => p.category === currentPavilion)
    .map(p => p.subcategory)
  )];

  subcategoryFilterList.innerHTML = subcats.map(subcat => {
    // Find a product that has this subcategory to get its Marathi name
    const prod = products.find(p => p.subcategory === subcat);
    const displayLabel = currentLanguage === "mr" && prod && prod.marathiSubcategory 
      ? prod.marathiSubcategory 
      : subcat;

    return `
      <li>
        <label class="filter-label">
          <input type="checkbox" name="subcategory" value="${subcat}" ${selectedFilters.subcategories.includes(subcat) ? 'checked' : ''}>
          ${displayLabel}
        </label>
      </li>
    `;
  }).join("");

  // Re-bind click handlers for subcategory checkboxes
  const checkboxes = subcategoryFilterList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        selectedFilters.subcategories.push(cb.value);
      } else {
        selectedFilters.subcategories = selectedFilters.subcategories.filter(s => s !== cb.value);
      }
      renderProducts();
    });
  });
}

// Format numbers in Indian Lakh grouping formatting (₹2,50,000)
function formatINR(number) {
  return number.toLocaleString('en-IN');
}

function initFilterEvents() {
  // Price Range
  priceRangeSlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    selectedFilters.maxPrice = val;
    priceRangeMaxLabel.textContent = `कमाल: ₹${formatINR(val)}`;
    renderProducts();
  });

  // Search Query
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      selectedFilters.search = e.target.value.toLowerCase().trim();
      renderProducts();
    }, 200); // debounce search query
  });

  // Sort dropdown
  sortDropdown.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Reset Filters
  resetFiltersBtn.addEventListener("click", () => {
    selectedFilters.subcategories = [];
    selectedFilters.maxPrice = 250000;
    selectedFilters.search = "";
    
    priceRangeSlider.value = 250000;
    priceRangeMaxLabel.textContent = "कमाल: ₹२,५०,०००";
    searchInput.value = "";
    
    // Refresh checkboxes
    const checkboxes = subcategoryFilterList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    renderProducts();
  });
}

// === RENDER PRODUCT SHOWCASE CARDS ===
function renderProducts() {
  // Filter products
  let filtered = products.filter(p => {
    // Pavilion match
    if (p.category !== currentPavilion) return false;
    
    // Subcategory match
    if (selectedFilters.subcategories.length > 0 && !selectedFilters.subcategories.includes(p.subcategory)) {
      return false;
    }

    // Price match
    if (p.price > selectedFilters.maxPrice) return false;

    // Search query match
    if (selectedFilters.search) {
      const matchName = p.name.toLowerCase().includes(selectedFilters.search) || 
                        (p.marathiName && p.marathiName.toLowerCase().includes(selectedFilters.search));
      const matchDesc = p.description.toLowerCase().includes(selectedFilters.search) || 
                        (p.marathiDescription && p.marathiDescription.toLowerCase().includes(selectedFilters.search));
      const matchSub = p.subcategory.toLowerCase().includes(selectedFilters.search) || 
                       (p.marathiSubcategory && p.marathiSubcategory.toLowerCase().includes(selectedFilters.search));
      if (!matchName && !matchDesc && !matchSub) return false;
    }

    return true;
  });

  // Sort products
  if (currentSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    // Featured (highlight first, then high ratings)
    filtered.sort((a, b) => {
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      return b.rating - a.rating;
    });
  }

  // Set result counter in Marathi / English
  if (currentLanguage === "mr") {
    catalogResultsCount.textContent = `एकूण ${filtered.length} उत्पादने उपलब्ध`;
  } else {
    catalogResultsCount.textContent = `Found ${filtered.length} products`;
  }

  // Draw Grid Cards
  if (filtered.length === 0) {
    const noProdsText = translations[currentLanguage].noProducts;
    const noProdsSubText = translations[currentLanguage].noProductsSub;
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <span style="font-size: 3rem;">🔍</span>
        <p style="margin-top: 1rem; font-weight: 500;">${noProdsText}</p>
        <p style="font-size: 0.85rem; opacity: 0.7;">${noProdsSubText}</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(p => {
    const isCompared = compare.has(p.id);
    const starString = "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating));
    
    const displayName = currentLanguage === "mr" ? p.marathiName : p.name;
    const displayDesc = currentLanguage === "mr" ? p.marathiDescription : p.description;
    const displaySub = currentLanguage === "mr" && p.marathiSubcategory ? p.marathiSubcategory : p.subcategory;
    const displayBadge = translateBadge(p.badge);
    const reviewText = currentLanguage === "mr" ? `${p.reviews}` : `${p.reviews} reviews`;
    const quickViewTitle = currentLanguage === "mr" ? "सविस्तर माहिती" : "Quick View Specs";
    const quickViewLabel = currentLanguage === "mr" ? `${displayName} चे सविस्तर तपशील पहा` : `Open detailed specifications for ${displayName}`;
    const compareTitleText = currentLanguage === "mr" ? "तुलना करा" : "Compare Product";
    const compareLabel = currentLanguage === "mr" ? `${displayName} ची तुलना करा` : `Compare ${displayName}`;
    const addCartTitle = currentLanguage === "mr" ? "कार्टमध्ये जोडा" : "Add to Cart";
    const addCartLabel = currentLanguage === "mr" ? `${displayName} कार्टमध्ये जोडा` : `Quick add ${displayName} to cart`;
    
    return `
      <div class="card-container">
        <div class="product-card" id="card-${p.id}">
          ${displayBadge ? `<span class="card-badge">${displayBadge}</span>` : ""}
          
          <div class="card-image-wrap">
            <img class="card-image custom-hue-filtered" id="img-card-${p.id}" src="${p.colors[0].image}" alt="${displayName}">
          </div>

          <div class="card-info">
            <span class="card-subcategory">${displaySub}</span>
            <h3 class="card-title">${displayName}</h3>
            
            <div class="card-rating-wrap">
              <span class="star-rating">${starString}</span>
              <span>(${reviewText})</span>
            </div>
            
            <p class="card-desc">${displayDesc}</p>
            
            <div class="card-bottom">
              <span class="card-price">₹${formatINR(p.price)}</span>
              <div class="card-actions">
                <!-- Quick View Details -->
                <button class="card-btn btn-quickview" data-product-id="${p.id}" title="${quickViewTitle}" aria-label="${quickViewLabel}">
                  👁️
                </button>
                <!-- Add to Compare -->
                <button class="card-btn btn-compare ${isCompared ? 'btn-primary' : ''}" data-product-id="${p.id}" title="${compareTitleText}" aria-label="${compareLabel}">
                  ⚖️
                </button>
                <!-- Quick Add to Cart -->
                <button class="card-btn btn-add-cart" data-product-id="${p.id}" title="${addCartTitle}" aria-label="${addCartLabel}">
                  ＋
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Bind Actions for generated cards
  productGrid.querySelectorAll(".btn-quickview").forEach(btn => {
    btn.addEventListener("click", () => openQuickView(btn.dataset.productId));
  });

  productGrid.querySelectorAll(".btn-compare").forEach(btn => {
    btn.addEventListener("click", () => {
      const pId = btn.dataset.productId;
      const product = products.find(p => p.id === pId);
      if (compare.has(pId)) {
        compare.removeItem(pId);
        btn.classList.remove("btn-primary");
      } else {
        const res = compare.addItem(product);
        if (res.success) {
          btn.classList.add("btn-primary");
        } else {
          const alertMsg = currentLanguage === "mr" 
            ? "तुलनेसाठी जास्तीत जास्त ३ उत्पादने जोडता येतील." 
            : "You can compare up to 3 products maximum.";
          alert(alertMsg);
        }
      }
    });
  });

  productGrid.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const pId = btn.dataset.productId;
      const product = products.find(p => p.id === pId);
      // Add standard first color/finish config
      cart.addItem(product, product.colors[0], product.finishes ? product.finishes[0] : null);
      
      // Pulse animation on the shopping cart badge
      headerCartTrigger.style.transform = "scale(1.2)";
      setTimeout(() => headerCartTrigger.style.transform = "none", 150);
    });
  });
}

// === QUICK VIEW DETAILS MODAL ===
function initQuickViewEvents() {
  closeQuickViewBtn.addEventListener("click", () => quickViewDialog.close());
  
  // Close when clicking outside content area
  quickViewDialog.addEventListener("click", (e) => {
    if (e.target === quickViewDialog) {
      quickViewDialog.close();
    }
  });

  // Add to cart configuration selection
  dialogAddToCartBtn.addEventListener("click", () => {
    if (!quickViewState.product) return;
    cart.addItem(quickViewState.product, quickViewState.color, quickViewState.finish);
    quickViewDialog.close();
    
    // Open drawer to show item
    cartDrawer.classList.add("open");
    cartDrawerOverlay.style.display = "block";
  });
}

function openQuickView(productId) {
  const p = products.find(prod => prod.id === productId);
  if (!p) return;

  quickViewState.product = p;
  quickViewState.color = p.colors[0];
  quickViewState.finish = p.finishes ? p.finishes[0] : null;

  // Set text contents
  dialogSubcategory.textContent = currentLanguage === "mr" && p.marathiSubcategory ? p.marathiSubcategory : p.subcategory;
  dialogTitle.textContent = currentLanguage === "mr" ? p.marathiName : p.name;
  dialogDesc.textContent = currentLanguage === "mr" ? p.marathiDescription : p.description;
  dialogPrice.textContent = `₹${formatINR(p.price)}`;
  
  const ratingRound = Math.round(p.rating);
  dialogStars.textContent = "★".repeat(ratingRound) + "☆".repeat(5 - ratingRound);
  dialogReviews.textContent = currentLanguage === "mr" ? `(${p.reviews} परीक्षणे)` : `(${p.reviews} reviews)`;

  // Draw main gallery image
  dialogImage.src = quickViewState.color.image;
  dialogImage.style.filter = "none"; // clear filters on new load

  // Render specifications table
  let specsHtml = '<table class="specs-table">';
  const specsSource = currentLanguage === "mr" && p.marathiSpecs ? p.marathiSpecs : p.specs;
  for (const [key, value] of Object.entries(specsSource)) {
    specsHtml += `
      <tr>
        <td>${key}</td>
        <td>${value}</td>
      </tr>
    `;
  }
  specsHtml += '</table>';

  // Render Customizer Swatches & Finishes
  let customizerHtml = '';

  // Colors section
  const colorLabel = currentLanguage === "mr" ? "रंग" : "Color";
  customizerHtml += `
    <div>
      <span class="dialog-section-title">${colorLabel}: <strong id="customizer-color-name">${quickViewState.color.name}</strong></span>
      <div class="swatch-group">
  `;
  p.colors.forEach((c, idx) => {
    customizerHtml += `
      <div class="swatch-circle color-swatch ${idx === 0 ? 'active' : ''}" data-color-id="${c.id}" title="${c.name}">
        <span style="background-color: ${c.hex}"></span>
      </div>
    `;
  });
  customizerHtml += '</div></div>';

  // Finishes wood/metal section (if available)
  if (p.finishes) {
    const finishLabel = currentLanguage === "mr" ? "फिनिश मटेरियल" : "Finish Material";
    customizerHtml += `
      <div style="margin-top:0.75rem;">
        <span class="dialog-section-title">${finishLabel}: <strong id="customizer-finish-name">${quickViewState.finish.name}</strong></span>
        <div class="swatch-group">
    `;
    p.finishes.forEach((f, idx) => {
      customizerHtml += `
        <div class="swatch-circle finish-swatch ${idx === 0 ? 'active' : ''}" data-finish-id="${f.id}" title="${f.name}">
          <span style="background-color: ${f.hex}; border-radius:4px;"></span>
        </div>
      `;
    });
    customizerHtml += '</div></div>';
  }

  // Inject Customizer content & specs table
  dialogCustomizationArea.innerHTML = customizerHtml + specsHtml;

  // Add click listeners to swatches
  const colorSwatches = dialogCustomizationArea.querySelectorAll(".color-swatch");
  colorSwatches.forEach(sw => {
    sw.addEventListener("click", () => {
      colorSwatches.forEach(s => s.classList.remove("active"));
      sw.classList.add("active");
      
      const cObj = p.colors.find(col => col.id === sw.dataset.colorId);
      quickViewState.color = cObj;
      document.getElementById("customizer-color-name").textContent = cObj.name;
      dialogImage.src = cObj.image;
    });
  });

  if (p.finishes) {
    const finishSwatches = dialogCustomizationArea.querySelectorAll(".finish-swatch");
    finishSwatches.forEach(fSw => {
      fSw.addEventListener("click", () => {
        finishSwatches.forEach(s => s.classList.remove("active"));
        fSw.classList.add("active");
        
        const fObj = p.finishes.find(fin => fin.id === fSw.dataset.finishId);
        quickViewState.finish = fObj;
        document.getElementById("customizer-finish-name").textContent = fObj.name;
        
        // INTERACTIVE DYNAMIC COLOR TINT PREVIEW!
        // To showcase custom materials in real-time, adjust image CSS filters dynamically!
        if (fObj.id === "walnut" || fObj.id === "smoked-oak") {
          dialogImage.style.filter = "sepia(0.3) saturate(0.85) contrast(1.1) brightness(0.9)";
        } else if (fObj.id === "bamboo" || fObj.id === "ash") {
          dialogImage.style.filter = "sepia(0.2) saturate(1.1) brightness(1.05)";
        } else if (fObj.id === "charcoal" || fObj.id === "legs-black") {
          dialogImage.style.filter = "grayscale(0.6) contrast(1.05) brightness(0.85)";
        } else {
          dialogImage.style.filter = "none";
        }
      });
    });
  }

  quickViewDialog.showModal();
}

// === SHOPPING CART DRAWER LOGIC ===
function initCartEvents() {
  // Listeners to open and close drawer
  headerCartTrigger.addEventListener("click", () => {
    cartDrawer.classList.add("open");
    cartDrawerOverlay.style.display = "block";
  });

  const closeCart = () => {
    cartDrawer.classList.remove("open");
    cartDrawerOverlay.style.display = "none";
  };
  closeCartBtn.addEventListener("click", closeCart);
  cartDrawerOverlay.addEventListener("click", closeCart);

  // Apply Coupon promo code
  applyPromoBtn.addEventListener("click", () => {
    const inputVal = promoCodeInput.value;
    if (!inputVal) return;
    
    const res = cart.applyPromoCode(inputVal);
    if (res.success) {
      promoStatusMessage.textContent = currentLanguage === "mr" 
        ? "कूपन कोड यशस्वीरित्या लागू केला!" 
        : "Promo coupon code applied successfully!";
      promoStatusMessage.style.color = "#16A34A";
    } else {
      promoStatusMessage.textContent = currentLanguage === "mr" 
        ? "अवैध कूपन कोड!" 
        : "Invalid promo coupon code!";
      promoStatusMessage.style.color = "#DC2626";
    }
  });

  // Submit Mock Checkout Order
  cartCheckoutBtn.addEventListener("click", () => {
    if (cart.getItems().length === 0) {
      alert(translations[currentLanguage].cartEmpty);
      return;
    }

    const customerName = prompt(translations[currentLanguage].promptName, "Jane Doe");
    if (!customerName) return;

    // Checkout creates dynamic invoice summary report
    const invoice = cart.checkout({ name: customerName, email: `${customerName.toLowerCase().replace(/ /g, "")}@example.com` });
    
    // Render purchase confirmation success UI inside drawer scroll area!
    const successTitle = translations[currentLanguage].orderSuccess;
    const successDesc = translations[currentLanguage].orderSuccessDesc;
    const orderIdLabel = translations[currentLanguage].orderRef;
    const customerLabel = translations[currentLanguage].orderCustomer;
    const timeLabel = translations[currentLanguage].orderTime;
    const subtotalLabel = translations[currentLanguage].cartSubtotal;
    const discountLabel = translations[currentLanguage].cartDiscount;
    const taxLabel = translations[currentLanguage].cartTax;
    const totalLabel = translations[currentLanguage].cartTotal;
    const dismissText = translations[currentLanguage].orderDismiss;

    cartItemsContainer.innerHTML = `
      <div class="success-screen">
        <span class="success-icon">🎉</span>
        <h3 class="success-title">${successTitle}</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary);">${successDesc}</p>
        
        <div class="success-invoice-box">
          <div class="success-invoice-row">
            <strong>${orderIdLabel}:</strong>
            <span>${invoice.orderId}</span>
          </div>
          <div class="success-invoice-row">
            <strong>${customerLabel}:</strong>
            <span>${invoice.customer.name}</span>
          </div>
          <div class="success-invoice-row">
            <strong>${timeLabel}:</strong>
            <span>${new Date(invoice.timestamp).toLocaleTimeString()}</span>
          </div>
          
          <div class="success-invoice-row divider"></div>
          
          ${invoice.items.map(item => {
            const itemDisplayName = currentLanguage === "mr" ? item.product.marathiName : item.product.name;
            return `
              <div class="success-invoice-row">
                <span>${itemDisplayName} (x${item.quantity})</span>
                <span>₹${formatINR(item.product.price * item.quantity)}</span>
              </div>
            `;
          }).join("")}
          
          <div class="success-invoice-row divider"></div>
          
          <div class="success-invoice-row">
            <span>${subtotalLabel}:</span>
            <span>₹${formatINR(invoice.subtotal)}</span>
          </div>
          ${invoice.discount > 0 ? `
            <div class="success-invoice-row" style="color:#16A34A;">
              <span>${discountLabel} (${invoice.promoCode}):</span>
              <span>-₹${formatINR(invoice.discount)}</span>
            </div>
          ` : ""}
          <div class="success-invoice-row">
            <span>${taxLabel}:</span>
            <span>₹${formatINR(invoice.tax)}</span>
          </div>
          <div class="success-invoice-row" style="font-weight:bold; font-size:0.95rem; margin-top:0.25rem;">
            <span>${totalLabel}:</span>
            <span>₹${formatINR(invoice.total)}</span>
          </div>
        </div>
        
        <button id="success-dismiss-btn" class="checkout-btn" style="width:100%;">${dismissText}</button>
      </div>
    `;

    document.getElementById("success-dismiss-btn").addEventListener("click", () => {
      closeCart();
    });
  });

  // Listen to Global Custom Event for state updates
  window.addEventListener("cart-updated", () => {
    updateCartUI();
  });
}

function updateCartUI() {
  const items = cart.getItems();
  
  // Update badges
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalQty;

  // Render items lists
  if (items.length === 0) {
    const emptyTitle = translations[currentLanguage].cartEmpty;
    const emptySub = translations[currentLanguage].cartEmptySub;
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <span style="font-size:2.5rem;">🛒</span>
        <p style="margin-top:0.75rem; font-weight:500;">${emptyTitle}</p>
        <p style="font-size:0.75rem; opacity:0.7;">${emptySub}</p>
      </div>
    `;
    
    cartSubtotal.textContent = "₹०.००";
    cartDiscountRow.style.display = "none";
    cartTax.textContent = "₹०.००";
    cartTotal.textContent = "₹०.००";
    return;
  }

  // Build items rows
  cartItemsContainer.innerHTML = items.map(item => {
    const customText = item.finish ? `${item.color.name} / ${item.finish.name}` : item.color.name;
    const itemTotal = item.product.price * item.quantity;
    const finishIdParam = item.finish ? `"${item.finish.id}"` : "null";
    const displayName = currentLanguage === "mr" ? item.product.marathiName : item.product.name;

    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.color.image}" alt="${displayName}">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${displayName}</h4>
          <span class="cart-item-customization">${customText}</span>
          <div class="cart-item-price">₹${formatINR(itemTotal)}</div>
        </div>
        
        <!-- Qty selector actions -->
        <div class="cart-item-qty-actions">
          <button class="cart-qty-btn btn-qty-dec" data-id="${item.product.id}" data-color="${item.color.id}" data-finish=${finishIdParam}>−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="cart-qty-btn btn-qty-inc" data-id="${item.product.id}" data-color="${item.color.id}" data-finish=${finishIdParam}>＋</button>
        </div>

        <button class="cart-item-remove-btn" data-id="${item.product.id}" data-color="${item.color.id}" data-finish=${finishIdParam} aria-label="Remove item">🗑️</button>
      </div>
    `;
  }).join("");

  // Bind cart item actions
  cartItemsContainer.querySelectorAll(".btn-qty-dec").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = parseInt(btn.nextElementSibling.textContent);
      cart.updateQuantity(btn.dataset.id, btn.dataset.color, btn.dataset.finish || null, q - 1);
    });
  });

  cartItemsContainer.querySelectorAll(".btn-qty-inc").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = parseInt(btn.previousElementSibling.textContent);
      cart.updateQuantity(btn.dataset.id, btn.dataset.color, btn.dataset.finish || null, q + 1);
    });
  });

  cartItemsContainer.querySelectorAll(".cart-item-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      cart.removeItem(btn.dataset.id, btn.dataset.color, btn.dataset.finish || null);
    });
  });

  // Calculate costs UI values
  cartSubtotal.textContent = `₹${formatINR(cart.getSubtotal())}`;
  
  const promo = cart.getPromoCode();
  if (promo) {
    cartDiscountRow.style.display = "flex";
    const discountLabelText = currentLanguage === "mr" ? "सवलत" : "Discount";
    cartDiscountLabel.textContent = `${discountLabelText} (${promo})`;
    cartDiscountValue.textContent = `-₹${formatINR(cart.getDiscountAmount())}`;
    promoCodeInput.value = promo;
  } else {
    cartDiscountRow.style.display = "none";
    promoCodeInput.value = "";
  }
  
  cartTax.textContent = `₹${formatINR(cart.getTax())}`;
  cartTotal.textContent = `₹${formatINR(cart.getTotal())}`;
}

// === COMPARISON SYSTEM LOGIC ===
function initCompareEvents() {
  compareClearBtn.addEventListener("click", () => {
    compare.clear();
    // Refresh catalog button states
    renderProducts();
  });

  // Submit triggers compare modal overlay opening
  compareSubmitBtn.addEventListener("click", () => {
    openCompareOverlay();
  });

  closeCompareOverlayBtn.addEventListener("click", () => {
    compareOverlay.classList.remove("open");
  });

  window.addEventListener("compare-updated", () => {
    updateCompareDockUI();
  });
}

function updateCompareDockUI() {
  const items = compare.getItems();
  compareCount.textContent = items.length;

  if (items.length > 0) {
    compareDock.classList.add("open");
  } else {
    compareDock.classList.remove("open");
  }

  // Render comparative slot list
  compareDockItems.innerHTML = Array.from({ length: 3 }).map((_, idx) => {
    const item = items[idx];
    if (item) {
      return `
        <div class="compare-dock-item">
          <img src="${item.colors[0].image}" alt="${item.name}">
          <span class="compare-dock-item-name">${item.name}</span>
          <button class="compare-dock-remove" data-id="${item.id}" aria-label="Remove from comparison">×</button>
        </div>
      `;
    } else {
      return `
        <div class="compare-dock-item" style="border-style: dashed; justify-content: center; background: none;">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">रिकामी जागा</span>
        </div>
      `;
    }
  }).join("");

  compareDockItems.querySelectorAll(".compare-dock-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      compare.removeItem(btn.dataset.id);
      renderProducts(); // update card button class highlights
    });
  });

  // Enable/disable submit action based on count (require at least 2)
  if (items.length >= 2) {
    compareSubmitBtn.disabled = false;
    compareSubmitBtn.style.opacity = "1";
    compareSubmitBtn.style.cursor = "pointer";
  } else {
    compareSubmitBtn.disabled = true;
    compareSubmitBtn.style.opacity = "0.5";
    compareSubmitBtn.style.cursor = "not-allowed";
  }
}

function openCompareOverlay() {
  const items = compare.getItems();
  if (items.length < 2) return;

  // Build headers column
  let headersHtml = `<th>${currentLanguage === "mr" ? "तपशील (Specs)" : "Specifications"}</th>`;
  items.forEach(item => {
    const displayName = currentLanguage === "mr" ? item.marathiName : item.name;
    headersHtml += `
      <th class="compare-column">
        <div class="compare-col-header">
          <img src="${item.colors[0].image}" alt="${displayName}">
          <span class="compare-col-title">${displayName}</span>
          <span class="compare-col-price">₹${formatINR(item.price)}</span>
        </div>
      </th>
    `;
  });
  compareTableHeaders.innerHTML = headersHtml;

  // Find all unique keys across all product specifications
  let specKeys = [];
  items.forEach(item => {
    const specsSource = currentLanguage === "mr" && item.marathiSpecs ? item.marathiSpecs : item.specs;
    specKeys = specKeys.concat(Object.keys(specsSource));
  });
  specKeys = [...new Set(specKeys)];

  // Draw spec rows
  let rowsHtml = '';
  
  // 1. Price row
  rowsHtml += `
    <tr>
      <td><strong>${currentLanguage === "mr" ? "किंमत" : "Price"}</strong></td>
      ${items.map(item => `
        <td class="compare-column" style="font-weight: 700; color: var(--accent-primary); font-family: var(--font-accent);">
          ₹${formatINR(item.price)}
        </td>
      `).join("")}
    </tr>
  `;

  // 2. Rating row
  rowsHtml += `
    <tr>
      <td><strong>${currentLanguage === "mr" ? "ग्राहक रेटिंग" : "Rating"}</strong></td>
      ${items.map(item => {
        const starString = "★".repeat(Math.round(item.rating)) + "☆".repeat(5 - Math.round(item.rating));
        const reviewText = currentLanguage === "mr" ? `${item.reviews} परीक्षणे` : `${item.reviews} reviews`;
        return `
          <td class="compare-column">
            <span class="compare-rating-star">${starString}</span>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${item.rating} / 5 (${reviewText})</div>
          </td>
        `;
      }).join("")}
    </tr>
  `;

  // 3. Spec specifications details comparison with difference highlighting!
  specKeys.forEach(key => {
    // Determine if values differ between products to highlight them
    const values = items.map(item => {
      const specsSource = currentLanguage === "mr" && item.marathiSpecs ? item.marathiSpecs : item.specs;
      return specsSource[key] || "N/A";
    });
    const isDifferent = !values.every(v => v === values[0]);

    rowsHtml += `
      <tr class="${isDifferent ? 'diff-highlight' : ''}">
        <td><strong>${key}</strong></td>
        ${items.map(item => {
          const specsSource = currentLanguage === "mr" && item.marathiSpecs ? item.marathiSpecs : item.specs;
          return `
            <td class="compare-column" style="font-size:0.85rem;">
              ${specsSource[key] || '<span style="color:var(--text-secondary);">—</span>'}
            </td>
          `;
        }).join("")}
      </tr>
    `;
  });

  compareTableBody.innerHTML = rowsHtml;
  compareOverlay.classList.add("open");
}

// === MATCHMAKER SETUP QUIZ LOGIC ===
function initQuizEvents() {
  const launchQuiz = () => {
    quizState.currentStep = 0;
    quizState.answers = {};
    quizOverlay.style.display = "block";
    quizSection.style.display = "block";
    renderQuizStep();
  };

  const closeQuiz = () => {
    quizOverlay.style.display = "none";
    quizSection.style.display = "none";
  };

  floatLaunchQuiz.addEventListener("click", launchQuiz);
  quizCloseBtn.addEventListener("click", closeQuiz);
  quizOverlay.addEventListener("click", closeQuiz);

  quizBackBtn.addEventListener("click", () => {
    if (quizState.currentStep > 0) {
      quizState.currentStep--;
      renderQuizStep();
    }
  });

  quizNextBtn.addEventListener("click", () => {
    // If on results, next button acts as "Add recommendation setup to cart"
    if (quizState.currentStep === quizQuestions.length) {
      // Fetch recommendations package
      const rec = calculateRecommendations(quizState.answers);
      rec.items.forEach(item => {
        cart.addItem(item, item.colors[0], item.finishes ? item.finishes[0] : null);
      });
      closeQuiz();
      
      // Open cart drawer
      cartDrawer.classList.add("open");
      cartDrawerOverlay.style.display = "block";
      return;
    }

    const currentQ = quizQuestions[quizState.currentStep];
    const selectedVal = quizState.answers[currentQ.id];

    if (!selectedVal) {
      alert("कृपया पुढे जाण्यासाठी एक पर्याय निवडा.");
      return;
    }

    quizState.currentStep++;
    renderQuizStep();
  });
}

function renderQuizStep() {
  const totalSteps = quizQuestions.length;
  
  // Progress calculations
  const progressPercent = Math.min(((quizState.currentStep) / totalSteps) * 100, 100);
  quizProgressFill.style.width = `${progressPercent}%`;

  // Back button display
  if (quizState.currentStep === 0) {
    quizBackBtn.style.display = "none";
  } else {
    quizBackBtn.style.display = "block";
  }

  // Next / Action Button Text
  if (quizState.currentStep === totalSteps - 1) {
    quizNextBtn.textContent = "चाचणी पूर्ण करा (Finish)";
  } else if (quizState.currentStep === totalSteps) {
    quizNextBtn.textContent = "हा संपूर्ण सेटअप कार्टमध्ये जोडा 🛍️";
  } else {
    quizNextBtn.textContent = "पुढे (Next)";
  }

  // Show Results or Show Question Card
  if (quizState.currentStep === totalSteps) {
    showQuizResults();
  } else {
    const q = quizQuestions[quizState.currentStep];
    const selectedAnswer = quizState.answers[q.id];

    quizBody.innerHTML = `
      <div class="quiz-question-wrap">
        <h3 class="quiz-question">${q.text}</h3>
        <div class="quiz-options-grid">
          ${q.options.map(opt => `
            <div class="quiz-option-card ${selectedAnswer === opt.value ? 'selected' : ''}" data-val="${opt.value}">
              <span class="quiz-option-icon">${opt.icon}</span>
              <div class="quiz-option-info">
                <span class="quiz-option-label">${opt.label}</span>
                <span class="quiz-option-desc">${opt.desc}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Bind Option Clicks
    quizBody.querySelectorAll(".quiz-option-card").forEach(card => {
      card.addEventListener("click", () => {
        quizBody.querySelectorAll(".quiz-option-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        
        quizState.answers[q.id] = card.dataset.val;
        
        // Auto advance after short delay for snappy UX
        setTimeout(() => {
          if (quizState.currentStep < totalSteps) {
            quizState.currentStep++;
            renderQuizStep();
          }
        }, 350);
      });
    });
  }
}

function showQuizResults() {
  const rec = calculateRecommendations(quizState.answers);

  let displayTitle = rec.packageTitle;
  let displayDesc = rec.description;
  
  if (currentLanguage === "mr") {
    if (rec.packageTitle === "The Artisan Workspace") {
      displayTitle = "आर्टिसन वर्कस्पेस (कलात्मक कार्यक्षेत्र)";
      displayDesc = "नैसर्गिक लाकडी फर्निचर आणि सुंदर रेट्रो ॲक्सेसरीजचे आरामदायक संयोजन. हे काम करताना एकाग्रता वाढवण्यास मदत करते.";
    } else if (rec.packageTitle === "The Cyberpunk Command Center") {
      displayTitle = "सायबरपंक कमांड सेंटर";
      displayDesc = "अल्ट्रा-वाईड डिस्प्ले, मेकॅनिकल कीबोर्ड आणि आधुनिक लूक असलेला हाय-परफॉर्मन्स सेटअप. डार्क डिझाईन आवडणाऱ्यांसाठी सर्वोत्तम.";
    } else if (rec.packageTitle === "The Scandinavian Lounge") {
      displayTitle = "स्कँडिनेव्हियन लाउंज";
      displayDesc = "मऊ कापड, आकर्षक फर्निचर आणि शांत लायटिंगचे आरामदायक संयोजन. वाचनासाठी आणि निवांत गप्पा मारण्यासाठी एक शांत जागा.";
    } else if (rec.packageTitle === "The Smart Home Cinema Haven") {
      displayTitle = "स्मार्ट होम सिनेमा हेवन";
      displayDesc = "घरच्या घरी थिएटरचा अनुभव देणारा सेटअप. प्रोजेक्टर सिनेमा, उत्कृष्ट ध्वनी आणि आरामदायी सोफा यांचा मिलाफ.";
    }
  }

  const recHeader = currentLanguage === "mr" ? "तुमचा खास शिफारस केलेला सेटअप" : "Your Recommended Setup Package";
  const recTotalText = currentLanguage === "mr" ? "सेटअप एकूण किंमत (Total Price):" : "Total Package Price:";

  quizBody.innerHTML = `
    <div class="recommendation-package">
      <div class="package-header">
        <span style="font-size: 0.8rem; text-transform: uppercase; font-weight:700; letter-spacing:0.05em;">${recHeader}</span>
        <h3 class="package-title">${displayTitle}</h3>
        <p class="package-desc">${displayDesc}</p>
      </div>

      <div class="package-items-list">
        ${rec.items.map(item => {
          const itemDisplayName = currentLanguage === "mr" ? item.marathiName : item.name;
          const itemDisplaySub = currentLanguage === "mr" && item.marathiSubcategory ? item.marathiSubcategory : item.subcategory;
          return `
            <div class="package-item-row">
              <div class="package-item-info">
                <img class="package-item-img" src="${item.colors[0].image}" alt="${itemDisplayName}">
                <div>
                  <span class="package-item-name">${itemDisplayName}</span>
                  <div style="font-size:0.7rem; color:var(--text-secondary);">${itemDisplaySub}</div>
                </div>
              </div>
              <span class="package-item-price">₹${formatINR(item.price)}</span>
            </div>
          `;
        }).join("")}
      </div>

      <div class="package-total-bar">
        <span>${recTotalText}</span>
        <span>₹${formatINR(rec.totalPrice)}</span>
      </div>
    </div>
  `;
}

// === INTERACTIVE ROOM VISUALIZER ACTIONS ===
function initVisualizerEvents() {
  // Preset Room Selectors
  roomPresetOffice.addEventListener("click", () => {
    roomPresetOffice.classList.add("active");
    roomPresetLiving.classList.remove("active");
    visualizer.loadBackground("images/rooms/office-bg.jpg");
  });

  roomPresetLiving.addEventListener("click", () => {
    roomPresetLiving.classList.add("active");
    roomPresetOffice.classList.remove("active");
    visualizer.loadBackground("images/rooms/living-bg.jpg");
  });

  // Slider scaling change
  itemScaleSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    visualizer.resizeSelected(val);
  });

  // Flip selected
  btnItemFlip.addEventListener("click", () => {
    visualizer.flipSelected();
  });

  // Delete selected
  btnItemDelete.addEventListener("click", () => {
    visualizer.deleteSelected();
  });

  // Layering
  btnItemLayerUp.addEventListener("click", () => {
    visualizer.moveLayer("up");
  });

  btnItemLayerDown.addEventListener("click", () => {
    visualizer.moveLayer("down");
  });

  // Clear Canvas
  clearCanvasBtn.addEventListener("click", () => {
    if (confirm("मांडणी रीसेट करायची का? यामुळे खोलीतील सर्व वस्तू काढून टाकल्या जातील.")) {
      visualizer.clearAll();
    }
  });

  // Export Canvas Image Download
  exportCanvasBtn.addEventListener("click", () => {
    const dataUrl = visualizer.exportImage();
    
    // Create temporary link element to trigger browser download
    const link = document.createElement("a");
    link.download = `my_room_design_${Date.now()}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function renderVisualizerPalette() {
  // List all products from the catalog database so users can add them to the canvas room workspace
  visualizerPaletteList.innerHTML = products.map(p => {
    const displayName = currentLanguage === "mr" ? p.marathiName : p.name;
    return `
      <div class="draggable-item-row" data-product-id="${p.id}">
        <img src="${p.colors[0].image}" alt="${displayName}">
        <div style="flex:1;">
          <div style="font-weight:600;">${displayName}</div>
          <div style="font-size:0.7rem; color:var(--text-secondary);">₹${formatINR(p.price)}</div>
        </div>
        <button class="card-btn" style="width:28px; height:28px; font-size:0.75rem;" title="Add to Room">＋</button>
      </div>
    `;
  }).join("");

  // Bind clicks to add item directly
  visualizerPaletteList.querySelectorAll(".draggable-item-row").forEach(row => {
    row.addEventListener("click", () => {
      const p = products.find(prod => prod.id === row.dataset.productId);
      visualizer.addItem(p, p.colors[0].image);
    });
  });
}

// === LANGUAGE SWITCHER IMPLEMENTATION ===
function initLanguageEvents() {
  if (btnLangEn && btnLangMr) {
    btnLangEn.addEventListener("click", () => setLanguage("en"));
    btnLangMr.addEventListener("click", () => setLanguage("mr"));
  }
}

function setLanguage(lang) {
  currentLanguage = lang;
  
  if (btnLangEn && btnLangMr) {
    if (lang === "en") {
      btnLangEn.classList.add("active");
      btnLangMr.classList.remove("active");
    } else {
      btnLangMr.classList.add("active");
      btnLangEn.classList.remove("active");
    }
  }

  // Update layout branding
  applyConfigBranding();

  // Apply static HTML translations
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    if (translations[lang] && translations[lang][key]) {
      if (el.tagName === "INPUT" && el.type === "text") {
        el.placeholder = translations[lang][key];
      } else {
        const iconSpan = el.querySelector("span");
        if (iconSpan) {
          el.innerHTML = "";
          el.appendChild(iconSpan);
          el.appendChild(document.createTextNode(" " + translations[lang][key]));
        } else {
          el.textContent = translations[lang][key];
        }
      }
    }
  });

  // Re-run dynamic renderings
  renderFilters();
  renderProducts();
  updateCartUI();
  updateCompareDockUI();
  renderVisualizerPalette();
}

function applyConfigBranding() {
  if (brandLogoText) {
    brandLogoText.textContent = currentLanguage === "mr" ? CONFIG.storeNameMarathi : CONFIG.storeNameEnglish;
  }
  
  const splashTitleF = document.querySelector("#splash-split-furniture .splash-title");
  const splashTitleE = document.querySelector("#splash-split-electronics .splash-title");
  
  if (splashTitleF && currentLanguage === "mr") {
    splashTitleF.innerHTML = `फर्निचर दालन <br><span style="font-size: 1.5rem; font-weight:300;">(Furniture Pavilion)</span>`;
  } else if (splashTitleF) {
    splashTitleF.innerHTML = `Furniture Pavilion <br><span style="font-size: 1.5rem; font-weight:300;">(फर्निचर दालन)</span>`;
  }
  
  if (splashTitleE && currentLanguage === "mr") {
    splashTitleE.innerHTML = `इलेक्ट्रॉनिक्स विभाग <br><span style="font-size: 1.5rem; font-weight:300;">(Tech Lab)</span>`;
  } else if (splashTitleE) {
    splashTitleE.innerHTML = `Tech Lab <br><span style="font-size: 1.5rem; font-weight:300;">(इलेक्ट्रॉनिक्स विभाग)</span>`;
  }
}

function translateBadge(badge) {
  if (!badge) return "";
  const lowerBadge = badge.toLowerCase().trim();
  if (currentLanguage === "mr") {
    if (lowerBadge === "best seller") return "लोकप्रिय";
    if (lowerBadge === "new") return "नवीन";
    if (lowerBadge === "premium") return "खास";
    if (lowerBadge === "trending") return "ट्रेंडिंग";
    if (lowerBadge === "limited edition") return "मर्यादित आवृत्ती";
    if (lowerBadge === "must have") return "आवश्यक";
  }
  return badge;
}

// === LOCAL STORAGE PERSISTENCE RESTORATION ===
function loadLocalStorageData() {
  const localProducts = localStorage.getItem("admin_products");
  if (localProducts) {
    try {
      const parsed = JSON.parse(localProducts);
      if (Array.isArray(parsed)) {
        products.splice(0, products.length, ...parsed);
      }
    } catch (e) {
      console.error("Failed to parse custom products from localStorage", e);
    }
  }

  const localStoreNameEn = localStorage.getItem("admin_store_name_en");
  if (localStoreNameEn) CONFIG.storeNameEnglish = localStoreNameEn;

  const localStoreNameMr = localStorage.getItem("admin_store_name_mr");
  if (localStoreNameMr) CONFIG.storeNameMarathi = localStoreNameMr;

  const localDefaultLang = localStorage.getItem("admin_default_lang");
  if (localDefaultLang) {
    CONFIG.defaultLanguage = localDefaultLang;
    currentLanguage = localDefaultLang;
  }
}

// === ADMIN CONTROL PANEL HANDLERS ===
let currentUploadedImageBase64 = "";

function initAdminEvents() {
  const settingsTrigger = document.getElementById("header-settings-trigger");
  const passcodeDialog = document.getElementById("admin-passcode-dialog");
  const passcodeForm = document.getElementById("admin-passcode-form");
  const passcodeInput = document.getElementById("admin-passcode-input");
  const passcodeError = document.getElementById("admin-passcode-error");
  const passcodeCancel = document.getElementById("admin-passcode-cancel");
  
  const adminDialog = document.getElementById("admin-settings-dialog");
  const closeAdminBtn = document.getElementById("admin-btn-close");
  const savePreviewBtn = document.getElementById("admin-btn-save-preview");
  const exportBtn = document.getElementById("admin-btn-export");
  const resetBtn = document.getElementById("admin-btn-reset");
  
  // Tab buttons
  const tabGeneral = document.getElementById("admin-tab-general");
  const tabManage = document.getElementById("admin-tab-manage");
  const tabAdd = document.getElementById("admin-tab-add");
  
  // Panels
  const panelGeneral = document.getElementById("admin-panel-general");
  const panelManage = document.getElementById("admin-panel-manage");
  const panelAdd = document.getElementById("admin-panel-add");
  
  // General inputs
  const storeNameEnInput = document.getElementById("admin-store-name-en");
  const storeNameMrInput = document.getElementById("admin-store-name-mr");
  const storeLangSelect = document.getElementById("admin-store-lang");
  
  // Product Form elements
  const productForm = document.getElementById("admin-product-form");
  const productEditIdInput = document.getElementById("admin-product-edit-id");
  const prodNameInput = document.getElementById("admin-prod-name");
  const prodPriceInput = document.getElementById("admin-prod-price");
  const prodCategorySelect = document.getElementById("admin-prod-category");
  const prodSubcategoryInput = document.getElementById("admin-prod-subcategory");
  const prodBadgeInput = document.getElementById("admin-prod-badge");
  const prodHighlightCheckbox = document.getElementById("admin-prod-highlight");
  const prodDescEnTextarea = document.getElementById("admin-prod-desc-en");
  const prodDescMrTextarea = document.getElementById("admin-prod-desc-mr");
  const prodImageFile = document.getElementById("admin-prod-image-file");
  const prodImagePreview = document.getElementById("admin-prod-image-preview");
  const prodImagePlaceholder = document.getElementById("admin-prod-image-placeholder");
  const specAddBtn = document.getElementById("admin-spec-add-btn");
  const specsContainer = document.getElementById("admin-specs-container");
  const cancelProductBtn = document.getElementById("admin-product-cancel-btn");
  const addPanelTitle = document.getElementById("admin-add-panel-title");

  if (!settingsTrigger) return;

  // Open passcode dialog
  settingsTrigger.addEventListener("click", () => {
    passcodeInput.value = "";
    if (passcodeError) passcodeError.style.display = "none";
    passcodeDialog.showModal();
  });

  // Cancel passcode
  passcodeCancel.addEventListener("click", () => {
    passcodeDialog.close();
  });

  // Verify passcode
  passcodeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (passcodeInput.value === CONFIG.adminPasscode) {
      passcodeDialog.close();
      openAdminDashboard();
    } else {
      if (passcodeError) passcodeError.style.display = "block";
    }
  });

  function openAdminDashboard() {
    // Populate store settings
    storeNameEnInput.value = CONFIG.storeNameEnglish || "";
    storeNameMrInput.value = CONFIG.storeNameMarathi || "";
    storeLangSelect.value = CONFIG.defaultLanguage || "mr";

    // Show General settings tab by default
    switchTab("general");

    adminDialog.showModal();
  }

  // Tabs logic
  const tabs = [
    { btn: tabGeneral, panel: panelGeneral, name: "general" },
    { btn: tabManage, panel: panelManage, name: "manage" },
    { btn: tabAdd, panel: panelAdd, name: "add" }
  ];

  function switchTab(targetTabName) {
    tabs.forEach(t => {
      if (t.name === targetTabName) {
        t.btn.classList.add("active");
        t.panel.style.display = "block";
      } else {
        t.btn.classList.remove("active");
        t.panel.style.display = "none";
      }
    });

    if (targetTabName === "manage") {
      renderAdminProductsList();
    } else if (targetTabName === "add") {
      // If NOT currently editing a product, reset the form
      if (!productEditIdInput.value) {
        resetProductForm();
      }
    }
  }

  tabGeneral.addEventListener("click", () => switchTab("general"));
  tabManage.addEventListener("click", () => switchTab("manage"));
  tabAdd.addEventListener("click", () => {
    // Force reset edit ID so clicking the Add tab directly means create brand new product
    productEditIdInput.value = "";
    addPanelTitle.textContent = "Create New Product";
    resetProductForm();
    switchTab("add");
  });

  // Close Admin dialog
  closeAdminBtn.addEventListener("click", () => {
    adminDialog.close();
  });

  // Reset product form
  function resetProductForm() {
    productForm.reset();
    productEditIdInput.value = "";
    currentUploadedImageBase64 = "";
    prodImagePreview.src = "";
    prodImagePreview.style.display = "none";
    prodImagePlaceholder.style.display = "block";
    specsContainer.innerHTML = "";
  }

  // Cancel Product Edit / Add
  cancelProductBtn.addEventListener("click", () => {
    resetProductForm();
    switchTab("manage");
  });

  // Specifications dynamic rows
  function createSpecRow(key = "", val = "") {
    const row = document.createElement("div");
    row.className = "admin-spec-row";
    row.innerHTML = `
      <input type="text" class="admin-input spec-key" placeholder="Key (e.g. Dimensions)" value="${escapeHtml(key)}" required>
      <input type="text" class="admin-input spec-value" placeholder="Value (e.g. 30 W x 32 H)" value="${escapeHtml(val)}" required>
      <button type="button" class="canvas-ctrl-btn danger-btn remove-spec-btn" style="padding: 0.5rem 0.75rem;">✕</button>
    `;
    
    row.querySelector(".remove-spec-btn").addEventListener("click", () => {
      row.remove();
    });
    
    specsContainer.appendChild(row);
  }

  specAddBtn.addEventListener("click", () => createSpecRow());

  // Image upload compression
  prodImageFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas compression
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        currentUploadedImageBase64 = compressedBase64;
        prodImagePreview.src = compressedBase64;
        prodImagePreview.style.display = "block";
        prodImagePlaceholder.style.display = "none";
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Submit product (Add/Edit)
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editId = productEditIdInput.value;
    const name = prodNameInput.value.trim();
    const price = parseInt(prodPriceInput.value);
    const category = prodCategorySelect.value;
    const subcategory = prodSubcategoryInput.value.trim();
    const badge = prodBadgeInput.value.trim();
    const highlight = prodHighlightCheckbox.checked;
    const descEn = prodDescEnTextarea.value.trim();
    const descMr = prodDescMrTextarea.value.trim();

    // Parse specifications
    const specs = {};
    specsContainer.querySelectorAll(".admin-spec-row").forEach(row => {
      const key = row.querySelector(".spec-key").value.trim();
      const val = row.querySelector(".spec-value").value.trim();
      if (key && val) {
        specs[key] = val;
      }
    });

    // Resolve Image: if no image uploaded but it's a new product, use SVG placeholder
    let imageSrc = currentUploadedImageBase64;
    if (!imageSrc) {
      if (editId) {
        // Retain existing image
        const existing = products.find(p => p.id === editId);
        if (existing && existing.colors && existing.colors[0]) {
          imageSrc = existing.colors[0].image;
        }
      }
      
      // Fallback if still empty
      if (!imageSrc) {
        imageSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23888">No Image</text></svg>`;
      }
    }

    const colors = [
      { id: "default", name: "Standard", hex: "#888888", image: imageSrc }
    ];

    if (editId) {
      // Edit existing product in-place
      const idx = products.findIndex(p => p.id === editId);
      if (idx !== -1) {
        // Preserve ratings/reviews or other details if present
        const original = products[idx];
        products[idx] = {
          ...original,
          name,
          price,
          category,
          subcategory,
          badge,
          highlight,
          description: descEn,
          marathiName: name, // Marathi name defaults to same name
          marathiDescription: descMr,
          marathiSubcategory: subcategory, // Marathi subcat defaults to same subcat
          colors,
          specs,
          marathiSpecs: specs // Copy specs for simple marathi view
        };
      }
    } else {
      // Create new product
      const newId = "prod-" + Date.now();
      const newProduct = {
        id: newId,
        name,
        price,
        category,
        subcategory,
        badge,
        highlight,
        description: descEn,
        marathiName: name,
        marathiDescription: descMr,
        marathiSubcategory: subcategory,
        rating: 5.0,
        reviews: 1,
        colors,
        specs,
        marathiSpecs: specs
      };
      products.push(newProduct);
    }

    // Refresh UI
    renderFilters();
    renderProducts();
    renderVisualizerPalette();

    // Alert user and go back to inventory list
    alert(editId ? "Product updated successfully!" : "New product created successfully!");
    resetProductForm();
    switchTab("manage");
  });

  // Render Admin products list
  function renderAdminProductsList() {
    const listContainer = document.getElementById("admin-products-list");
    if (!listContainer) return;

    if (products.length === 0) {
      listContainer.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No products in catalog.</p>`;
      return;
    }

    listContainer.innerHTML = products.map(p => {
      const img = (p.colors && p.colors[0] && p.colors[0].image) || "";
      const priceFmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p.price);
      return `
        <div class="admin-product-row" data-product-id="${p.id}">
          <img class="admin-product-thumb" src="${img}" alt="${escapeHtml(p.name)}">
          <div class="admin-product-info">
            <div class="admin-product-name">${escapeHtml(p.name)}</div>
            <div class="admin-product-price">${priceFmt} • <span style="text-transform: capitalize; font-size: 0.75rem;">${p.category}</span></div>
          </div>
          <div class="admin-actions-row">
            <button class="canvas-ctrl-btn edit-product-btn" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">Edit</button>
            <button class="canvas-ctrl-btn danger-btn delete-product-btn" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">Delete</button>
          </div>
        </div>
      `;
    }).join("");

    // Bind Edit/Delete buttons
    listContainer.querySelectorAll(".admin-product-row").forEach(row => {
      const pId = row.dataset.productId;
      const p = products.find(prod => prod.id === pId);
      if (!p) return;

      row.querySelector(".edit-product-btn").addEventListener("click", () => {
        // Switch to add tab in edit mode
        productEditIdInput.value = p.id;
        addPanelTitle.textContent = `Edit Product: ${p.name}`;
        
        prodNameInput.value = p.name || "";
        prodPriceInput.value = p.price || 0;
        prodCategorySelect.value = p.category || "furniture";
        prodSubcategoryInput.value = p.subcategory || "";
        prodBadgeInput.value = p.badge || "";
        prodHighlightCheckbox.checked = !!p.highlight;
        prodDescEnTextarea.value = p.description || "";
        prodDescMrTextarea.value = p.marathiDescription || p.description || "";
        
        // Image preview
        if (p.colors && p.colors[0] && p.colors[0].image) {
          prodImagePreview.src = p.colors[0].image;
          prodImagePreview.style.display = "block";
          prodImagePlaceholder.style.display = "none";
          currentUploadedImageBase64 = p.colors[0].image;
        } else {
          prodImagePreview.src = "";
          prodImagePreview.style.display = "none";
          prodImagePlaceholder.style.display = "block";
          currentUploadedImageBase64 = "";
        }

        // Specs load
        specsContainer.innerHTML = "";
        const specsToLoad = p.specs || {};
        Object.entries(specsToLoad).forEach(([k, v]) => {
          createSpecRow(k, v);
        });

        switchTab("add");
      });

      row.querySelector(".delete-product-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
          const idx = products.findIndex(prod => prod.id === pId);
          if (idx !== -1) {
            products.splice(idx, 1);
            renderAdminProductsList();
            renderFilters();
            renderProducts();
            renderVisualizerPalette();
          }
        }
      });
    });
  }

  // Save Settings & Preview
  savePreviewBtn.addEventListener("click", () => {
    const storeNameEn = storeNameEnInput.value.trim();
    const storeNameMr = storeNameMrInput.value.trim();
    const storeLang = storeLangSelect.value;

    if (!storeNameEn || !storeNameMr) {
      alert("Please fill in both English and Marathi store names.");
      return;
    }

    // Save configurations
    CONFIG.storeNameEnglish = storeNameEn;
    CONFIG.storeNameMarathi = storeNameMr;
    CONFIG.defaultLanguage = storeLang;

    localStorage.setItem("admin_products", JSON.stringify(products));
    localStorage.setItem("admin_store_name_en", storeNameEn);
    localStorage.setItem("admin_store_name_mr", storeNameMr);
    localStorage.setItem("admin_default_lang", storeLang);

    // Apply branding and language
    applyConfigBranding();
    setLanguage(storeLang);

    alert("Settings saved! Your custom catalog has been loaded on your screen.");
    adminDialog.close();
  });

  // Export products.js
  exportBtn.addEventListener("click", () => {
    const fileContent = generateProductsJsString(products);
    const blob = new Blob([fileContent], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Reset settings
  resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all products and store settings to defaults? This will erase all your custom changes.")) {
      localStorage.removeItem("admin_products");
      localStorage.removeItem("admin_store_name_en");
      localStorage.removeItem("admin_store_name_mr");
      localStorage.removeItem("admin_default_lang");
      window.location.reload();
    }
  });

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
