// ========== DEBOUNCE ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ========== STATE MANAGEMENT ==========
let wishlist = [];
let cart = [];

function loadData() {
  try {
    const cartData = localStorage.getItem('cart');
    const wishlistData = localStorage.getItem('wishlist');

    cart = cartData ? JSON.parse(cartData) : [];
    wishlist = wishlistData ? JSON.parse(wishlistData) : [];
  } catch (error) {
    console.error('Failed to load data:', error);
    cart = [];
    wishlist = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
}

function saveWishlist() {
  try {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
}

// ========== TRANSLATION ==========
let currentLang = localStorage.getItem('lang') || 'en';

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem('lang', currentLang);
  applyTranslations();
}

// Helper function to translate brand names
function translateBrandName(brandName) {
  const brandKey = `nav-brand-${brandName.toLowerCase().replace(/\s+/g, '')}`;
  if (translations[currentLang] && translations[currentLang][brandKey]) {
    return translations[currentLang][brandKey];
  }
  return brandName;
}

// ========== COLORS ==========
let currentDetailSelectedColor = null;

function getColorStyle(colorName) {
  if (!colorName) return '#ccc';
  const lowerColor = colorName.toLowerCase();

  if (lowerColor.includes('black') || lowerColor.includes('dark')) return '#000';
  if (lowerColor.includes('white') || lowerColor.includes('light')) return '#f5f5f5'; // Light gray for white
  if (lowerColor.includes('blue') || lowerColor.includes('navy')) return '#3b82f6';
  if (lowerColor.includes('red') || lowerColor.includes('crimson')) return '#ef4444';
  if (lowerColor.includes('green') || lowerColor.includes('emerald')) return '#10b981';
  if (lowerColor.includes('yellow') || lowerColor.includes('gold') || lowerColor.includes('amber')) return '#eab308';
  if (lowerColor.includes('purple') || lowerColor.includes('violet') || lowerColor.includes('lavender')) return '#8b5cf6';
  if (lowerColor.includes('pink') || lowerColor.includes('rose')) return '#ec4899';
  if (lowerColor.includes('orange')) return '#f97316';
  if (lowerColor.includes('gray') || lowerColor.includes('grey') || lowerColor.includes('silver') || lowerColor.includes('titanium')) return '#9ca3af';
  if (lowerColor.includes('cream') || lowerColor.includes('beige')) return '#fdf5e6';

  return '#ccc'; // Default
}

function selectDetailColor(color, element) {
  currentDetailSelectedColor = color;

  // إعادة ضبط جميع الألوان للحالة المحايدة وإزالة علامة الصح
  document.querySelectorAll('.color-option').forEach(el => {
    el.classList.remove('selected');
    el.style.backgroundColor = '#f9fafb';
    el.style.color = '#111827';
    const check = el.querySelector('.color-check');
    if (check) check.remove();
  });

  if (element) {
    element.classList.add('selected');

    // اجعل المستطيل المختار بلونه الحقيقي مع علامة صح داخل المستطيل
    const bg = element.getAttribute('data-color-bg') || '#2563eb';
    element.style.backgroundColor = bg;
    element.style.color = '#ffffff';

    if (!element.querySelector('.color-check')) {
      const checkEl = document.createElement('span');
      checkEl.className = 'color-check';
      checkEl.textContent = '✓';
      element.appendChild(checkEl);
    }
  }
}


function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key]) {
      if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
        element.placeholder = translations[currentLang][key];
      } else if (element.tagName === 'OPTION') {
        // Handle option elements
        element.textContent = translations[currentLang][key];
      } else {
        element.textContent = translations[currentLang][key];
      }
    }
  });

  // Handle elements with data-i18n-placeholder
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[currentLang] && translations[currentLang][key]) {
      element.placeholder = translations[currentLang][key];
    }
  });

  // Update document attributes
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

  // Update fonts based on language
  if (currentLang === 'ar') {
    document.body.style.fontFamily = "'Cairo', sans-serif";
  } else {
    document.body.style.fontFamily = "'Roboto', sans-serif";
  }

  // Translate brand names in filter popup
  const brandLabels = document.querySelectorAll('#brandFilters .filter-option label');
  brandLabels.forEach(label => {
    const brandName = label.textContent.trim();
    const translatedName = translateBrandName(brandName);
    if (translatedName !== brandName) {
      label.textContent = translatedName;
    }
  });

  // Translate status labels in filter popup
  const statusLabels = document.querySelectorAll('#statusFilters .filter-option label');
  statusLabels.forEach(label => {
    const statusText = label.textContent.trim();
    if (statusText === 'New Arrivals' || statusText === 'وصل حديثاً') {
      label.textContent = translations[currentLang]['status-new'] || statusText;
    } else if (statusText === 'On Sale' || statusText === 'تخفيضات') {
      label.textContent = translations[currentLang]['status-sale'] || statusText;
    }
  });

  // Translate battery labels in filter popup
  const batteryLabels = document.querySelectorAll('#batteryFilters .filter-option label');
  batteryLabels.forEach(label => {
    let text = label.textContent.trim();

    // Translate "Less than" / "أقل من"
    if (text.includes('Less than') || text.includes('أقل من')) {
      const lessText = translations[currentLang]['battery-less'] || 'Less than';
      text = text.replace(/Less than|أقل من/, lessText);
      label.textContent = text;
    }
    // Translate "Above" / "أكثر من"
    else if (text.includes('Above') || text.includes('أكثر من')) {
      const aboveText = translations[currentLang]['battery-above'] || 'Above';
      text = text.replace(/Above|أكثر من/, aboveText);
      label.textContent = text;
    }
  });

  // Re-apply current category filter to update header
  const activeLink = document.querySelector('.nav-link.active') || document.querySelector('.nav-dropdown-link.active');
  if (activeLink) {
    const category = activeLink.getAttribute('data-category');
    // We don't want to re-render products, just update header, but filterProducts does both.
    // Ideally we separate them, but for now calling filterProducts(category) is the easiest way to ensure header matches.
    // However, if we are on 'home', it toggles sections.
    if (category !== 'home') {
      // Re-fetching title/desc based on current lang
      const config = categoryConfig[category];
      if (config) {
        const title = translations[currentLang][config.titleKey] || config.titleKey;
        const desc = translations[currentLang][config.descKey] || config.descKey;
        updateSectionHeader(title, desc);
      }
      // Re-render products with updated names based on language
      const filtered = config.filter();
      displayProducts(filtered);
    }
  }
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', function () {
  loadData();

  // Check if returning from details page to restore state
  const returningFromDetails = sessionStorage.getItem('returningFromDetails') === 'true';
  const lastCategory = sessionStorage.getItem('lastCategory') || 'home';

  if (returningFromDetails) {
    filterProducts(lastCategory);
    // Restoration of scroll happens in displayProducts after rendering
  } else {
    filterProducts('home');
    sessionStorage.removeItem('lastCategory'); // Clear if fresh start
  }

  setupNavigation();
  setupSearchListener();
  updateCartCount();
  updateWishlistCount();
  applyTranslations(); // Apply translations on load
});

// ========== HELPER FUNCTION TO GET PRODUCT NAME ==========
function getProductName(product) {
  if (currentLang === 'ar' && product.nameAr) {
    return product.nameAr;
  }
  return product.name;
}

// ========== PRODUCT DISPLAY ==========
function displayProducts(productsToShow) {
  const heroSection = document.querySelector('.hero-section');
  const brandsSection = document.querySelector('.brands-section');
  const promoBanners = document.querySelector('.promo-banners');
  const productsListContainer = document.getElementById('products-list-container');
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  productsToShow.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = function (e) {
      // Don't open if clicking wishlist or add to cart buttons
      if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-wishlist-primary-btn')) {
        return;
      }
      openProductDetails(product.id);
    };
    card.style.cursor = 'pointer';

    const isInWishlist = wishlist.some(item => item.id === product.id);
    const badgeText = translations[currentLang][`badge-${product.badgeType}`] || product.badge;
    const productName = getProductName(product);

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${productName}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'">
        <span class="product-badge ${product.badgeType}">${badgeText}</span>
        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlistItem(${product.id})" aria-label="Add to wishlist">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <h3 class="product-name">${productName}</h3>
          <div class="product-specs">
            ${product.specs.slice(0, 3).map(spec => `<span class="spec-item">${spec}</span>`).join('')}
          </div>
        <div class="product-price">
          <span class="current-price">${product.price} EGP</span>
          ${product.oldPrice ? `<span class="old-price">${product.oldPrice} EGP</span>` : ''}
        </div>
        ${product.inStock !== false ? `
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
          <svg viewBox="0 0 24 24">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          ${translations[currentLang]['btn-add-to-cart']}
        </button>
        ` : `
        <button class="add-to-wishlist-primary-btn ${isInWishlist ? 'added' : ''}" onclick="event.stopPropagation(); toggleWishlistItem(${product.id})">
          ${isInWishlist ? `
          <svg viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 2;">
             <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ${translations[currentLang]['btn-added-to-wishlist']}
          ` : `
          <svg viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 2;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${translations[currentLang]['btn-add-to-wishlist']}
          `}
        </button>
        `}
      </div>
    `;

    grid.appendChild(card);
    grid.appendChild(card);
  });

  // Check if we need to restore scroll position
  if (sessionStorage.getItem('returningFromDetails') === 'true') {
    // Only restore if we are actually coming from the product details page
    // This prevents restoration if the user went Details -> Other -> Home
    if (document.referrer && document.referrer.includes('product-details')) {
      const scrollPos = parseInt(sessionStorage.getItem('homeScrollPosition'));
      if (!isNaN(scrollPos) && scrollPos > 0) {
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          window.scrollTo(0, scrollPos);
          sessionStorage.removeItem('returningFromDetails');
          sessionStorage.removeItem('homeScrollPosition');
        }, 50);
      }
    } else {
      // If we aren't coming from details, clear the stale flags
      sessionStorage.removeItem('returningFromDetails');
      sessionStorage.removeItem('homeScrollPosition');
    }
  }
}

// ========== NAVIGATION ==========
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-more-btn)');
  const dropdownLinks = document.querySelectorAll('.nav-dropdown-link');

  // Handle main nav links
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      dropdownLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      if (window.innerWidth <= 768) {
        toggleMenu();
      }

      const category = this.getAttribute('data-category');
      filterProducts(category);
    });
  });

  // Handle dropdown links
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      dropdownLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      if (window.innerWidth <= 768) {
        toggleMenu();
      }

      const category = this.getAttribute('data-category');
      filterProducts(category);

      // Close dropdown
      const moreMenu = document.getElementById('moreMenu');
      const moreBtn = document.querySelector('.nav-more-btn');
      if (moreMenu) moreMenu.classList.remove('active');
      if (moreBtn) moreBtn.classList.remove('active');
    });
  });
}

// ========== SECTIONS VISIBILITY ==========
function toggleSections(showHome = false) {
  const sections = {
    hero: document.querySelector('.hero-section'),
    brands: document.querySelector('.brands-section'),
    promo: document.querySelector('.promo-banners'),
    products: document.getElementById('products-list-container'),
    features: document.querySelector('.features-section'),
    categories: document.querySelector('.categories-section'),
    testimonials: document.querySelector('.testimonials-section'),
    newsletter: document.querySelector('.newsletter-section')
  };

  if (showHome) {
    if (sections.hero) sections.hero.style.display = 'block';
    if (sections.brands) sections.brands.style.display = 'grid';
    if (sections.features) sections.features.style.display = 'grid';
    if (sections.categories) sections.categories.style.display = 'block';
    if (sections.testimonials) sections.testimonials.style.display = 'block';
    if (sections.newsletter) sections.newsletter.style.display = 'block';
    if (sections.products) sections.products.style.display = 'none';
  } else {
    if (sections.hero) sections.hero.style.display = 'none';
    if (sections.brands) sections.brands.style.display = 'none';
    if (sections.features) sections.features.style.display = 'none';
    if (sections.categories) sections.categories.style.display = 'none';
    if (sections.testimonials) sections.testimonials.style.display = 'none';
    if (sections.newsletter) sections.newsletter.style.display = 'none';
    if (sections.products) sections.products.style.display = 'block';
  }
}

// Toggle More Dropdown
function toggleMoreMenu(event) {
  event.stopPropagation();
  const moreMenu = document.getElementById('moreMenu');
  const moreBtn = event.currentTarget;

  if (moreMenu && moreBtn) {
    moreMenu.classList.toggle('active');
    moreBtn.classList.toggle('active');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
  const moreMenu = document.getElementById('moreMenu');
  const moreBtn = document.querySelector('.nav-more-btn');

  if (moreMenu && moreBtn && !event.target.closest('.nav-dropdown')) {
    moreMenu.classList.remove('active');
    moreBtn.classList.remove('active');
  }
});

// ========== CATEGORY CONFIGURATION ==========
const categoryConfig = {
  all: {
    titleKey: 'cat-header-all',
    descKey: 'cat-desc-all',
    filter: () => products
  },
  apple: {
    titleKey: 'cat-header-apple',
    descKey: 'cat-desc-apple',
    filter: () => products.filter(p => p.category === 'apple')
  },
  samsung: {
    titleKey: 'cat-header-samsung',
    descKey: 'cat-desc-samsung',
    filter: () => products.filter(p => p.category === 'samsung')
  },
  xiaomi: {
    titleKey: 'cat-header-xiaomi',
    descKey: 'cat-desc-xiaomi',
    filter: () => products.filter(p => p.category === 'xiaomi')
  },
  OPPO: {
    titleKey: 'cat-header-oppo',
    descKey: 'cat-desc-oppo',
    filter: () => products.filter(p => p.category === 'OPPO')
  },
  Realme: {
    titleKey: 'cat-header-realme',
    descKey: 'cat-desc-realme',
    filter: () => products.filter(p => p.category === 'Realme')
  },
  ONEPLUS: {
    titleKey: 'cat-header-oneplus',
    descKey: 'cat-desc-oneplus',
    filter: () => products.filter(p => p.category === 'ONEPLUS')
  },
  HONOR: {
    titleKey: 'cat-header-honor',
    descKey: 'cat-desc-honor',
    filter: () => products.filter(p => p.category === 'HONOR')
  },
  Vivo: {
    titleKey: 'cat-header-vivo',
    descKey: 'cat-desc-vivo',
    filter: () => products.filter(p => p.category === 'Vivo')
  },
  'GOOGLE PIXEL': {
    titleKey: 'cat-header-google',
    descKey: 'cat-desc-google',
    filter: () => products.filter(p => p.category === 'GOOGLE PIXEL')
  },
  NOTHING: {
    titleKey: 'cat-header-nothing',
    descKey: 'cat-desc-nothing',
    filter: () => products.filter(p => p.category === 'NOTHING')
  },
  deals: {
    titleKey: 'cat-header-deals',
    descKey: 'cat-desc-deals',
    filter: () => products.filter(p => p.badgeType === 'sale')
  }
};

function filterProducts(category) {
  // Save category state
  sessionStorage.setItem('lastCategory', category);

  // Handle home page
  if (category === 'home') {
    toggleSections(true);
    return;
  }

  // Show products section, hide home sections
  toggleSections(false);

  // Get category configuration or use default
  const config = categoryConfig[category] || {
    titleKey: 'cat-header-featured',
    descKey: 'cat-desc-featured',
    filter: () => products
  };

  // Apply category filter
  const filtered = config.filter();

  // Update section header
  const title = translations[currentLang][config.titleKey] || config.titleKey;
  const desc = translations[currentLang][config.descKey] || config.descKey;
  updateSectionHeader(title, desc);

  // Initialize filters for the products page
  initializeFilters();

  // Reset filter state (not UI) for new category
  filterState = {
    brands: [],
    minPrice: 0,
    maxPrice: 100000,
    ram: [],
    storage: [],
    network: [],
    camera: [],
    battery: [],
    status: [],
    sortBy: 'default'
  };

  // Display the category filtered products
  displayProducts(filtered);

  // Update result count
  const resultCount = document.getElementById('resultCount');
  const totalCount = document.getElementById('totalCount');
  if (resultCount) resultCount.textContent = filtered.length;
  if (totalCount) totalCount.textContent = products.length;
}

// ========== FILTER MULTIPLE BRANDS ==========
function filterMultipleBrands(brandsList) {
  // Show products section, hide home sections
  toggleSections(false);

  let filtered = products.filter(p => brandsList.includes(p.category.toLowerCase()));

  const title = translations[currentLang]['cat-header-premium'] || 'Premium Phones';
  const desc = translations[currentLang]['cat-desc-premium'] || 'Apple & Samsung flagship devices';
  updateSectionHeader(title, desc);

  initializeFilters();

  // Reset filter state for new category
  filterState = {
    brands: [],
    minPrice: 0,
    maxPrice: 100000,
    ram: [],
    storage: [],
    network: [],
    camera: [],
    battery: [],
    status: [],
    sortBy: 'default'
  };

  displayProducts(filtered);

  const resultCount = document.getElementById('resultCount');
  const totalCount = document.getElementById('totalCount');
  if (resultCount) resultCount.textContent = filtered.length;
  if (totalCount) totalCount.textContent = products.length;
}

// ========== FILTER BY PRICE RANGE ==========
function filterByPriceRange(minPrice, maxPrice, title, description) {
  // Show products section, hide home sections
  toggleSections(false);

  let filtered = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

  filtered.sort((a, b) => a.price - b.price);

  updateSectionHeader(title, description);

  initializeFilters();

  // Reset filter state for new category
  filterState = {
    brands: [],
    minPrice: 0,
    maxPrice: 100000,
    ram: [],
    storage: [],
    network: [],
    camera: [],
    battery: [],
    status: [],
    sortBy: 'default'
  };

  displayProducts(filtered);

  const resultCount = document.getElementById('resultCount');
  const totalCount = document.getElementById('totalCount');
  if (resultCount) resultCount.textContent = filtered.length;
  if (totalCount) totalCount.textContent = products.length;
}

function updateSectionHeader(title, desc) {
  const titleEl = document.getElementById('sectionTitle');
  const descEl = document.getElementById('sectionDesc');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
}

// ========== SEARCH ==========
const debouncedSearch = debounce(searchProducts, 300);

function setupSearchListener() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', debouncedSearch);
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchProducts();
    }
  });
}

function searchProducts() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === '') {
    displayProducts(products);
    const title = translations[currentLang]['cat-header-featured'] || 'Featured Phones';
    const desc = translations[currentLang]['cat-desc-featured'] || 'Discover the latest smartphones with amazing features and competitive prices';
    updateSectionHeader(title, desc);
    return;
  }

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm) ||
    product.specs.some(spec => spec.toLowerCase().includes(searchTerm))
  );

  const searchTitlePrefix = translations[currentLang]['cat-header-search'] || 'Search Results for';
  const foundText = translations[currentLang]['cat-desc-search'] || 'Found';
  const suffix = translations[currentLang]['cat-desc-search-suffix'] || 'product(s)';

  updateSectionHeader(`${searchTitlePrefix} "${searchTerm}"`, `${foundText} ${filtered.length} ${suffix}`);
  displayProducts(filtered);
}

// ========== WISHLIST ==========
function toggleWishlistItem(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = wishlist.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
  } else {
    wishlist.push(product);
  }

  saveWishlist();
  displayProducts(products);

  const detailsPopup = document.getElementById('productDetailsPopup');
  if (detailsPopup && detailsPopup.classList.contains('active')) {
    openProductDetails(productId);
  }
}

function toggleWishlist() {
  const popup = document.getElementById('wishlistPopup');
  if (!popup) return;

  popup.classList.add('active');
  displayWishlistItems();
}

function displayWishlistItems() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-message">
        <svg viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <p>${translations[currentLang]['wishlist-empty']}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist.map(item => {
    const itemName = getProductName(item);
    return `
    <div class="popup-item">
      <div class="popup-item-image">
        <img src="${window.location.pathname.includes('/pages/') ? '../' + item.image : item.image}" alt="${itemName}">
      </div>
      <div class="popup-item-info">
        <div class="popup-item-name">${itemName}</div>
        <div class="popup-item-price">${item.price} EGP</div>
        <div class="wishlist-actions">
          ${item.inStock !== false ? `
          <button class="add-to-cart-btn-mini" onclick="moveToCart(${item.id})">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            ${translations[currentLang]['btn-add-to-cart']}
          </button>
          ` : `
          <span class="stock-unavailable" style="font-size: 0.8rem; padding: 5px 10px;">${translations[currentLang]['detail-out-of-stock']}</span>
          `}
          <button class="remove-btn" onclick="removeFromWishlist(${item.id})">${translations[currentLang]['btn-remove']}</button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function removeFromWishlist(productId) {
  wishlist = wishlist.filter(item => item.id !== productId);
  saveWishlist();
  displayWishlistItems();
  displayProducts(products);
}

// Wishlist to Cart
function moveToCart(productId) {
  const product = wishlist.find(item => item.id === productId);
  if (!product) return;

  // Add to cart
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  // Delete from wishlist
  wishlist = wishlist.filter(item => item.id !== productId);

  // Save
  saveCart();
  saveWishlist();

  displayWishlistItems();
  displayProducts(products);

  // Notification
  showMoveToCartNotification(product.name);
}

function showMoveToCartNotification(productName) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; stroke: white; fill: none; stroke-width: 2;">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${translations[currentLang]['notif-added-to-cart']}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2500);
}

function updateWishlistCount() {
  const countEl = document.getElementById('wishlistCount');
  if (countEl) countEl.textContent = wishlist.length;
}

// ========== CART ==========
function addToCart(productId, color = null) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // If product has colors but none selected, try to select default
  if (!color && product.colors && product.colors.length > 0) {
    // Logic to pick first color if available or passed one
    // If called from list, no color is passed.
    // If called from detail, color should be passed.
    color = product.colors[0];
  }

  // Unique item defined by ID AND Color
  const existingItem = cart.find(item => item.id === productId && item.color === color);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    // نحفظ أيضاً اسم اللون المترجم (إن وجد) ليظهر في الـ checkout
    const lang = currentLang || localStorage.getItem('lang') || 'en';
    let colorNameAr = null;
    if (lang === 'ar' && product.colorsAr && product.colors && color) {
      const idx = product.colors.indexOf(color);
      if (idx !== -1) {
        colorNameAr = product.colorsAr[idx];
      }
    }

    cart.push({ ...product, quantity: 1, color: color, colorNameAr });
  }

  saveCart();
  showAddToCartFeedback();

  const detailsPopup = document.getElementById('productDetailsPopup');
  if (detailsPopup && detailsPopup.classList.contains('active')) {
    setTimeout(() => {
      // Pass the selected color to persist state if needed, or just refresh
      // openProductDetails(productId); // This might reset selection, caution.
      // Better not to re-render everything just for UI feedback if avoiding reset.
      // But standard existing logic did re-render.
      // We will skip re-render here to keep selection state or handle it better.
    }, 2100);
  }
}

function showAddToCartFeedback() {
  const btn = event.target.closest('.add-to-cart-btn, .detail-add-cart-btn');
  if (!btn) return;

  const originalContent = btn.innerHTML;
  btn.innerHTML = translations[currentLang]['btn-added'];
  btn.style.background = '#10b981';
  btn.style.transform = 'scale(0.95)';

  setTimeout(() => {
    btn.innerHTML = originalContent;
    btn.style.background = '';
    btn.style.transform = '';
  }, 2000);
}

function toggleCart() {
  const popup = document.getElementById('cartPopup');
  if (!popup) return;

  popup.classList.add('active');
  displayCartItems();
}

function displayCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-message">
        <svg viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>${translations[currentLang]['cart-empty']}</p>
      </div>
    `;
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  container.innerHTML = `
    ${cart.map(item => {
    const itemName = getProductName(item);
    return `
      <div class="popup-item">
        <div class="popup-item-image">
          <img src="${window.location.pathname.includes('/pages/') ? '../' + item.image : item.image}" alt="${itemName}">
        </div>
        <div class="popup-item-info">
          <div class="popup-item-name">${itemName} x${item.quantity}</div>
          <div class="popup-item-price">${item.price * item.quantity} EGP</div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">${translations[currentLang]['btn-remove']}</button>
        </div>
      </div>
    `;
  }).join('')}
    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 18px; font-weight: 600; color: #1f2937;">${translations[currentLang]['cart-total']}:</span>
        <span style="font-size: 24px; font-weight: 700; color: #2563eb;">${total} EGP</span>
      </div>
      <button class="checkout-btn" onclick="proceedToCheckout()">${translations[currentLang]['btn-checkout']}</button>
    </div>
  `;
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  displayCartItems();
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = totalItems;
}

function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty!', 'warning');
    return;
  }

  const cartData = encodeURIComponent(JSON.stringify(cart));
  window.location.href = `pages/checkout.html?cart=${cartData}`;
}

// ========== UI CONTROLS ==========
function closePopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) popup.classList.remove('active');
}

function closePopupOutside(event, popupId) {
  if (event.target.id === popupId) {
    closePopup(popupId);
  }
}

function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const btn = document.querySelector('.mobile-menu-btn');

  if (menu) menu.classList.toggle('active');
  if (btn) btn.classList.toggle('active');
}

function goToHome() {
  filterProducts('home');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-dropdown-link').forEach(l => l.classList.remove('active'));

  const homeLink = document.querySelector('.nav-link[data-category="home"]');
  if (homeLink) homeLink.classList.add('active');
}

function goToAccount() {
  const user = window.localDB?.getCurrentUser();

  if (user) {
    window.location.href = 'pages/account.html';
  } else {
    toggleAccount();
  }
}

function toggleAccount() {
  const popup = document.getElementById('accountPopup');
  if (popup) popup.classList.add('active');
}

// ========== AUTHENTICATION ==========
function switchAuthTab(tab) {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.remove('active'));

  if (tab === 'signin') {
    tabs[0]?.classList.add('active');
    document.getElementById('signinForm')?.classList.add('active');
  } else {
    tabs[1]?.classList.add('active');
    document.getElementById('signupForm')?.classList.add('active');
  }
}

async function handleSignIn(event) {
  event.preventDefault();

  const email = event.target[0].value;
  const password = event.target[1].value;

  try {
    const result = await window.localDB.signInUser(email, password);
    const user = result.user;

    showNotification(`Signed in as ${user.email}`, 'success', 'Welcome back!');
    closePopup('accountPopup');
    event.target.reset();
  } catch (error) {
    console.error('Sign in error:', error);

    const errorMessages = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/invalid-credential': 'Invalid email or password.'
    };

    const message = errorMessages[error.message] || error.message;
    showNotification(message, 'error', 'Failed to sign in');
  }
}

async function handleSignUp(event) {
  event.preventDefault();

  const name = event.target[0].value;
  const email = event.target[1].value;
  const password = event.target[2].value;
  const confirmPassword = event.target[3].value;

  if (password !== confirmPassword) {
    showNotification('Passwords do not match!', 'error');
    return;
  }

  if (password.length < 5) {
    showNotification('Password must be at least 5 characters long!', 'warning');
    return;
  }

  try {
    await window.localDB.registerUser(email, password, name);

    showNotification(`Welcome ${name}!`, 'success', 'Account created successfully!');
    closePopup('accountPopup');
    event.target.reset();
  } catch (error) {
    console.error('Sign up error:', error);

    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password is too weak.'
    };

    const message = errorMessages[error.message] || error.message;
    showNotification(message, 'error', 'Failed to create account');
  }
}

async function socialLogin(provider) {
  // Social login is not available in offline mode
  showNotification(
    'Social login is not available in offline mode. Please use email and password.',
    'info',
    'Feature Not Available'
  );
}

function updateUIForLoggedInUser(user) {
  console.log('Logged in as:', user.email);
}

function updateUIForLoggedOutUser() {
  console.log('User logged out');
}

async function handleSignOut() {
  try {
    await window.localDB.signOut();
    showNotification('Signed out successfully!', 'success');
    // Reload page to update UI
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Failed to sign out.', 'error');
  }
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info', title = '') {
  // Create container if it doesn't exist
  let container = document.querySelector('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Set title and icon based on type
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };

  const titles = {
    success: title || 'Success!',
    error: title || 'Error!',
    warning: title || 'Warning!',
    info: title || 'Info'
  };

  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      <svg viewBox="0 0 24 24">${icons[type]}</svg>
    </div>
    <div class="notification-content">
      <div class="notification-title">${titles[type]}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 400);
  }, 4000);
}
// Add text truncation styles dynamically
const style = document.createElement('style');
style.textContent = `
  .product-name {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
document.head.appendChild(style);

// ========== NEWSLETTER SUBSCRIPTION ==========
function handleNewsletterSubmit(event) {
  event.preventDefault();
  const email = event.target[0].value;

  showNotification(`Thank you! We'll send updates to ${email}`, 'success', 'Subscribed!');
  event.target.reset();
}

// ========== AUTO SLIDER WITH VIDEO ==========
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const videos = document.querySelectorAll('.hero-video');
let autoSlideInterval = null;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    const video = slide.querySelector('.hero-video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  });

  slides[index].classList.add('active');
  const activeVideo = slides[index].querySelector('.hero-video');
  if (activeVideo) {
    activeVideo.play();
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function setupAutoSlide() {
  videos.forEach((video, index) => {
    video.addEventListener('ended', function () {
      if (slides[index].classList.contains('active')) {
        nextSlide();
      }
    });

    video.addEventListener('error', function () {
      console.log('Video error, using fallback timing');
      if (slides[index].classList.contains('active')) {
        setTimeout(nextSlide, 8000);
      }
    });
  });
}

if (videos.length > 0) {
  videos[0].play();
  setupAutoSlide();
}

// ========== PRODUCT DETAILS POPUP ==========
// Open Product Details Page
function openProductDetails(productId) {
  // Save scroll position and flag
  sessionStorage.setItem('homeScrollPosition', window.scrollY);
  sessionStorage.setItem('returningFromDetails', 'true');

  // Navigate to new page
  window.location.href = `pages/product-details.html?id=${productId}`;
  const popup = document.getElementById('productDetailsPopup');
  const body = document.getElementById('productDetailsBody');

  if (!popup || !body) return;

  // Calculate discount
  let discount = '';
  if (product.oldPrice) {
    const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    discount = `<span class="detail-discount">-${discountPercent}%</span>`;
  }

  // Rating
  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;
  const stars = '⭐'.repeat(Math.floor(rating));

  // Check wishlist
  const isInWishlist = wishlist.some(item => item.id === productId);

  // Check for detailed specs
  const hasDetailedSpecs = product.detailedSpecs;
  // Get localized colors and original English colors for mapping
  const productColorsLocalized = (currentLang === 'ar' && product.colorsAr) ? product.colorsAr : product.colors;
  const productColorsEnglish = product.colors || [];

  const hasColors = productColorsLocalized && productColorsLocalized.length > 0;
  // استخدم الوصف العربي إذا كانت اللغة الحالية عربية ويوجد حقل descriptionAr
  const description =
    (currentLang === 'ar' && product.descriptionAr)
      ? product.descriptionAr
      : (product.description || translations[currentLang]['detail-no-description']);
  const productName = getProductName(product);

  // Initialize selection
  if (hasColors && !currentDetailSelectedColor) {
    // Default to first color (English value which acts as ID)
    currentDetailSelectedColor = productColorsEnglish[0];
  } else if (!hasColors) {
    currentDetailSelectedColor = null;
  }

  // Reset if switching products ? 
  // Ideally openProductDetails is called fresh, but we need to reset explicitly if variable is global
  // Actually, we should reset it at start of function if product ID changes or always?
  // Let's initialize it always to first color when opening fresh.
  // HOWEVER, openProductDetails might be called dynamically. 
  // Let's assume for now we reset on open unless we want persistence.
  // Based on current structure, better to just set it to first color of CURRENT product here.
  if (hasColors && (!currentDetailSelectedColor || !productColorsEnglish.includes(currentDetailSelectedColor))) {
    currentDetailSelectedColor = productColorsEnglish[0];
  }

  body.innerHTML = `
    <div class="product-detail-hero">
      <div class="product-detail-image">
        <span class="product-detail-badge ${product.badgeType}">${product.badge}</span>
        <img src="${product.image}" alt="${productName}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'">
      </div>
      
      <div class="product-detail-info">
        <div class="product-detail-brand">${product.brand}</div>
        <h3 class="product-detail-name">${productName}</h3>
        
        <div class="product-detail-rating">
          <span class="rating-stars">${stars}</span>
          <span class="rating-text">${rating}/5 (${reviews} ${translations[currentLang]['detail-reviews']})</span>
        </div>
        
        <div class="product-detail-price">
          <span class="detail-current-price">${product.price.toLocaleString()} EGP</span>
          ${product.oldPrice ? `<span class="detail-old-price">${product.oldPrice.toLocaleString()} EGP</span>` : ''}
          ${discount}
        </div>
        
        <p class="product-detail-description">${description}</p>
        
        <div class="product-detail-stock">
          <svg style="width: 20px; height: 20px; stroke: ${product.inStock !== false ? '#10b981' : '#ef4444'}; fill: none; stroke-width: 2;" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span class="${product.inStock !== false ? 'stock-available' : 'stock-unavailable'}">
            ${product.inStock !== false ? translations[currentLang]['detail-in-stock'] : translations[currentLang]['detail-out-of-stock']}
          </span>
        </div>

        <div class="product-detail-actions">
          <button class="detail-add-cart-btn" onclick="addToCart(${product.id}, '${currentDetailSelectedColor}'); event.stopPropagation();">
            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; stroke: white; fill: none; stroke-width: 2;">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            ${translations[currentLang]['btn-add-to-cart']}
          </button>
          <button class="detail-wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlistItem(${product.id}); event.stopPropagation();">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="product-detail-tabs">
      <div class="detail-tabs-nav">
        <button class="detail-tab-btn active" onclick="switchDetailTab(event, 'specs')">${translations[currentLang]['detail-specifications']}</button>
        ${hasColors ? `<button class="detail-tab-btn" onclick="switchDetailTab(event, 'colors')">${translations[currentLang]['detail-colors']}</button>` : ''}
        <button class="detail-tab-btn" onclick="switchDetailTab(event, 'shipping')">${translations[currentLang]['detail-shipping']}</button>
      </div>
      
      <div class="detail-tab-content active" id="detail-tab-specs">
        ${hasDetailedSpecs ? `
          <div class="specs-grid">
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-processor']}</div>
              <div class="spec-value">${product.detailedSpecs.processor}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-ram']}</div>
              <div class="spec-value">${product.detailedSpecs.ram}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-storage']}</div>
              <div class="spec-value">${product.detailedSpecs.storage}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-network']}</div>
              <div class="spec-value">${product.detailedSpecs.network}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-display']}</div>
              <div class="spec-value">${product.detailedSpecs.screen}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-battery']}</div>
              <div class="spec-value">${product.detailedSpecs.battery}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-rear-camera']}</div>
              <div class="spec-value">${product.detailedSpecs.camera}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-front-camera']}</div>
              <div class="spec-value">${product.detailedSpecs.frontCamera}</div>
            </div>
            <div class="spec-item-detail">
              <div class="spec-label">${translations[currentLang]['detail-os']}</div>
              <div class="spec-value">${product.detailedSpecs.os}</div>
            </div>
          </div>
        ` : `
          <div class="specs-grid">
            ${product.specs.map(spec => `
              <div class="spec-item-detail">
                <div class="spec-value">${spec}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
      
      ${hasColors ? `
        <div class="detail-tab-content" id="detail-tab-colors">
          <div class="colors-list">
            ${productColorsLocalized.map((colorName, index) => {
    // Use corresponding English color name for logic/styling
    const originalColorName = productColorsEnglish[index] || colorName;
    const isSelected = originalColorName === currentDetailSelectedColor;
    const bgStyle = getColorStyle(originalColorName);

    return `
              <div class="color-option ${isSelected ? 'selected' : ''}" 
                   data-color-bg="${bgStyle}"
                   onclick="selectDetailColor('${originalColorName}', this)"
                   title="${colorName}"
                   style="${isSelected ? `background-color: ${bgStyle}; color: #ffffff;` : ''}">
                   <span class="color-text">${colorName}</span>
                   ${isSelected ? '<span class="color-check">✓</span>' : ''}
              </div>
              `;
  }).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="detail-tab-content" id="detail-tab-shipping">
        <div class="shipping-info">
          <h4>
            <svg style="width: 24px; height: 24px; stroke: #2563eb; fill: none; stroke-width: 2;" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            ${translations[currentLang]['detail-shipping-info']}
          </h4>
          <p><strong>${translations[currentLang]['detail-delivery-time']}</strong> ${product.delivery || translations[currentLang]['detail-business-days']}</p>
          <p><strong>${translations[currentLang]['detail-shipping-label']}</strong> ${product.freeShipping !== false ? translations[currentLang]['detail-free-shipping'] : translations[currentLang]['detail-shipping-fee']}</p>
          <p><strong>${translations[currentLang]['detail-delivery-label']}</strong> ${translations[currentLang]['detail-delivery-info']}</p>
          <p><strong>${translations[currentLang]['detail-warranty-label']}</strong> ${translations[currentLang]['detail-warranty-info']}</p>
        </div>
      </div>
    </div>
  `;

  popup.classList.add('active');

  // تأكد أن حالة الألوان متزامنة بعد فتح النافذة
  if (hasColors) {
    const selectedEl = document.querySelector('.color-option.selected') || document.querySelector('.color-option');
    if (selectedEl) {
      const colorForInit = selectedEl.getAttribute('data-color-bg') ? currentDetailSelectedColor : (productColorsEnglish[0] || null);
      selectDetailColor(colorForInit, selectedEl);
    }
  }
}

// Switch between tabs
function switchDetailTab(event, tabName) {
  // Remove active from all buttons
  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Remove active from all contents
  document.querySelectorAll('.detail-tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Add active to clicked button
  event.target.classList.add('active');

  // Show selected content
  const contentId = `detail-tab-${tabName}`;
  const content = document.getElementById(contentId);
  if (content) {
    content.classList.add('active');
  }
}
// ========== FILTER POPUP SYSTEM ==========
let filterState = {
  brands: [],
  minPrice: 0,
  maxPrice: 100000,
  ram: [],
  storage: [],
  network: [],
  camera: [],
  battery: [],
  status: [],
  sortBy: 'default'
};

let tempFilterState = { ...filterState };

// Open Filter Popup
function openFilterPopup() {
  const popup = document.getElementById('filterPopup');
  if (popup) {
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Copy current filters to temp
    tempFilterState = JSON.parse(JSON.stringify(filterState));

    // Update UI to reflect current filters
    updateFilterUI();

    // Apply translations to filter popup
    applyTranslations();
  }
}

// Close Filter Popup
function closeFilterPopup() {
  const popup = document.getElementById('filterPopup');
  if (popup) {
    popup.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close popup when clicking outside
function closeFilterPopupOutside(event) {
  if (event.target.id === 'filterPopup') {
    closeFilterPopup();
  }
}

// Initialize Filters
function initializeFilters() {
  setupPriceRange();
  generateFilterOptions();
  updateFilterCounts();
}

// Generate Filter Options
// Generate Filter Options
function generateFilterOptions() {
  const brands = [...new Set(products.map(p => p.brand))];
  const rams = [...new Set(products.flatMap(p => {
    const ramSpec = p.specs.find(s => s.includes('RAM'));
    return ramSpec ? [ramSpec] : [];
  }))].sort();

  const storages = [...new Set(products.flatMap(p => {
    const storageSpec = p.specs.find(s => s.match(/\d+GB/) && !s.includes('RAM'));
    return storageSpec ? [storageSpec] : [];
  }))].sort();

  // Network
  const networks = ['5G', '4G'];

  // Camera detailedSpecs
  const cameras = [...new Set(products.flatMap(p => {
    if (p.detailedSpecs && p.detailedSpecs.camera) {
      return [p.detailedSpecs.camera];
    }
    return [];
  }))].sort();

  // Battery 
  const batteryRanges = [
    { label: 'Less than 4000mAh', min: 0, max: 3999 },
    { label: '4000-4500mAh', min: 4000, max: 4500 },
    { label: '4500-5000mAh', min: 4500, max: 5000 },
    { label: '5000mAh and above', min: 5000, max: 10000 }
  ];

  const statuses = [...new Set(products.map(p => p.badgeType))];

  // Brand Filters
  const brandFilters = document.getElementById('brandFilters');
  if (brandFilters) {
    brandFilters.innerHTML = brands.map(brand => {
      const count = products.filter(p => p.brand === brand).length;
      return `
        <div class="filter-option">
          <input type="checkbox" id="brand-${brand}" value="${brand}" onchange="updateTempFilter('brands', '${brand}')">
          <label for="brand-${brand}">${brand}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // RAM Filters
  const ramFilters = document.getElementById('ramFilters');
  if (ramFilters) {
    ramFilters.innerHTML = rams.map(ram => {
      const count = products.filter(p => p.specs.includes(ram)).length;
      const displayRam = ram.replace(' RAM', '');
      return `
        <div class="filter-option">
          <input type="checkbox" id="ram-${ram}" value="${ram}" onchange="updateTempFilter('ram', '${ram}')">
          <label for="ram-${ram}">${displayRam}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // Storage Filters
  const storageFilters = document.getElementById('storageFilters');
  if (storageFilters) {
    storageFilters.innerHTML = storages.map(storage => {
      const count = products.filter(p => p.specs.includes(storage)).length;
      return `
        <div class="filter-option">
          <input type="checkbox" id="storage-${storage}" value="${storage}" onchange="updateTempFilter('storage', '${storage}')">
          <label for="storage-${storage}">${storage}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // Network Filters (5G & 4G only)
  const networkFilters = document.getElementById('networkFilters');
  if (networkFilters) {
    networkFilters.innerHTML = networks.map(network => {
      const count = products.filter(p => p.specs.includes(network)).length;
      return `
        <div class="filter-option">
          <input type="checkbox" id="network-${network}" value="${network}" onchange="updateTempFilter('network', '${network}')">
          <label for="network-${network}">${network}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // Camera Filters (Rear Camera)
  const cameraFilters = document.getElementById('cameraFilters');
  if (cameraFilters) {
    cameraFilters.innerHTML = cameras.map(camera => {
      const count = products.filter(p => p.detailedSpecs && p.detailedSpecs.camera === camera).length;
      return `
        <div class="filter-option">
          <input type="checkbox" id="camera-${camera.replace(/\s+/g, '-')}" value="${camera}" onchange="updateTempFilter('camera', \`${camera}\`)">
          <label for="camera-${camera.replace(/\s+/g, '-')}">${camera}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // Battery Filters
  const batteryFilters = document.getElementById('batteryFilters');
  if (batteryFilters) {
    batteryFilters.innerHTML = batteryRanges.map((range, index) => {
      const count = products.filter(p => {
        if (p.detailedSpecs && p.detailedSpecs.battery) {
          const batteryValue = parseInt(p.detailedSpecs.battery.match(/\d+/));
          return batteryValue >= range.min && batteryValue <= range.max;
        }
        return false;
      }).length;
      return `
        <div class="filter-option">
          <input type="checkbox" id="battery-${index}" value="${range.label}" onchange="updateTempFilter('battery', '${range.label}')">
          <label for="battery-${index}">${range.label}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  // Status Filters
  const statusFilters = document.getElementById('statusFilters');
  if (statusFilters) {
    statusFilters.innerHTML = statuses.map(status => {
      const count = products.filter(p => p.badgeType === status).length;
      const displayName = status === 'new' ? 'New Arrivals' : 'On Sale';
      return `
        <div class="filter-option">
          <input type="checkbox" id="status-${status}" value="${status}" onchange="updateTempFilter('status', '${status}')">
          <label for="status-${status}">${displayName}</label>
          <span class="filter-count">${count}</span>
        </div>
      `;
    }).join('');
  }
}

// Setup Price Range
function setupPriceRange() {
  const minRange = document.getElementById('minRange');
  const maxRange = document.getElementById('maxRange');
  const minInput = document.getElementById('minInput');
  const maxInput = document.getElementById('maxInput');
  const rangeSelected = document.getElementById('rangeSelected');

  if (!minRange || !maxRange) return;

  function updateRangeSlider(e) {
    const minVal = parseInt(minRange.value);
    const maxVal = parseInt(maxRange.value);
    const target = e ? e.target : null;

    if (maxVal - minVal < 1000) {
      if (target === minRange) {
        minRange.value = maxVal - 1000;
      } else if (target === maxRange) {
        maxRange.value = minVal + 1000;
      }
    }

    const minPercent = (minRange.value / minRange.max) * 100;
    const maxPercent = (maxRange.value / maxRange.max) * 100;

    if (rangeSelected) {
      if (currentLang === 'ar') {
        rangeSelected.style.left = 'auto';
        rangeSelected.style.right = minPercent + '%';
        rangeSelected.style.width = (maxPercent - minPercent) + '%';
      } else {
        rangeSelected.style.right = 'auto';
        rangeSelected.style.left = minPercent + '%';
        rangeSelected.style.width = (maxPercent - minPercent) + '%';
      }
    }

    if (minInput) minInput.value = minRange.value;
    if (maxInput) maxInput.value = maxRange.value;

    tempFilterState.minPrice = parseInt(minRange.value);
    tempFilterState.maxPrice = parseInt(maxRange.value);
    updateFilterCounts();
  }

  minRange.addEventListener('input', updateRangeSlider);
  maxRange.addEventListener('input', updateRangeSlider);

  if (minInput) {
    minInput.addEventListener('change', function () {
      minRange.value = this.value;
      updateRangeSlider();
    });
  }

  if (maxInput) {
    maxInput.addEventListener('change', function () {
      maxRange.value = this.value;
      updateRangeSlider();
    });
  }

  updateRangeSlider();
}

// Update Temporary Filter State
function updateTempFilter(filterType, value) {
  const index = tempFilterState[filterType].indexOf(value);

  if (index > -1) {
    tempFilterState[filterType].splice(index, 1);
  } else {
    tempFilterState[filterType].push(value);
  }

  updateFilterCounts();
}

// Update Filter UI to reflect current state
function updateFilterUI() {
  // Update checkboxes
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    const filterType = cb.id.split('-')[0];
    const value = cb.value;

    let isChecked = false;

    if (filterType === 'brand') {
      isChecked = tempFilterState.brands.includes(value);
    } else if (filterType === 'ram') {
      isChecked = tempFilterState.ram.includes(value);
    } else if (filterType === 'storage') {
      isChecked = tempFilterState.storage.includes(value);
    } else if (filterType === 'network') {
      isChecked = tempFilterState.network.includes(value);
    } else if (filterType === 'camera') {
      isChecked = tempFilterState.camera.includes(value);
    } else if (filterType === 'battery') {
      isChecked = tempFilterState.battery.includes(value);
    } else if (filterType === 'status') {
      isChecked = tempFilterState.status.includes(value);
    }

    cb.checked = isChecked;
  });

  // Update price range
  const minRange = document.getElementById('minRange');
  const maxRange = document.getElementById('maxRange');
  const minInput = document.getElementById('minInput');
  const maxInput = document.getElementById('maxInput');
  const rangeSelected = document.getElementById('rangeSelected');

  if (minRange) minRange.value = tempFilterState.minPrice;
  if (maxRange) maxRange.value = tempFilterState.maxPrice;
  if (minInput) minInput.value = tempFilterState.minPrice;
  if (maxInput) maxInput.value = tempFilterState.maxPrice;

  if (rangeSelected) {
    const minPercent = (tempFilterState.minPrice / 100000) * 100;
    const maxPercent = (tempFilterState.maxPrice / 100000) * 100;

    if (currentLang === 'ar') {
      rangeSelected.style.left = 'auto';
      rangeSelected.style.right = minPercent + '%';
      rangeSelected.style.width = (maxPercent - minPercent) + '%';
    } else {
      rangeSelected.style.right = 'auto';
      rangeSelected.style.left = minPercent + '%';
      rangeSelected.style.width = (maxPercent - minPercent) + '%';
    }
  }

  // Update sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = tempFilterState.sortBy;
}

// Update Filter Counts
function updateFilterCounts() {
  const resultCount = document.getElementById('resultCount');
  const totalCount = document.getElementById('totalCount');
  const applyBtn = document.querySelector('.filter-apply-btn span');

  // Calculate temp filtered results
  const tempFiltered = applyFiltersInternal(tempFilterState);

  if (resultCount) resultCount.textContent = tempFiltered.length;
  if (totalCount) totalCount.textContent = products.length;

  // Update Apply button text
  if (applyBtn) {
    const applyText = translations[currentLang]['filter-apply'] || 'Apply Filters';
    applyBtn.textContent = `${applyText} (${tempFiltered.length})`;
  }
}

// Internal helper to get filtered results without side effects
function applyFiltersInternal(state) {
  let filtered = [...products];

  if (state.brands.length > 0) {
    filtered = filtered.filter(p => state.brands.includes(p.brand));
  }

  filtered = filtered.filter(p => p.price >= state.minPrice && p.price <= state.maxPrice);

  if (state.ram.length > 0) {
    filtered = filtered.filter(p => state.ram.some(ram => p.specs.includes(ram)));
  }

  if (state.storage.length > 0) {
    filtered = filtered.filter(p => state.storage.some(storage => p.specs.includes(storage)));
  }

  if (state.network.length > 0) {
    filtered = filtered.filter(p => state.network.some(network => p.specs.includes(network)));
  }

  if (state.camera.length > 0) {
    filtered = filtered.filter(p =>
      p.detailedSpecs && state.camera.includes(p.detailedSpecs.camera)
    );
  }

  if (state.battery.length > 0) {
    filtered = filtered.filter(p => {
      if (!p.detailedSpecs || !p.detailedSpecs.battery) return false;
      const batteryValue = parseInt(p.detailedSpecs.battery.match(/\d+/));
      return state.battery.some(range => {
        if (range === 'Less than 4000mAh') return batteryValue < 4000;
        if (range === '4000-4500mAh') return batteryValue >= 4000 && batteryValue <= 4500;
        if (range === '4500-5000mAh') return batteryValue > 4500 && batteryValue <= 5000;
        if (range === '5000mAh and above') return batteryValue > 5000;
        return false;
      });
    });
  }

  if (state.status.length > 0) {
    filtered = filtered.filter(p => state.status.includes(p.badgeType));
  }

  return filtered;
}

// Apply Filters and Close Popup
function applyFiltersAndClose() {
  // Update sort from select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    tempFilterState.sortBy = sortSelect.value;
  }

  // Copy temp state to actual filter state
  filterState = JSON.parse(JSON.stringify(tempFilterState));

  // Apply filters
  applyFilters();

  // Close popup
  closeFilterPopup();

  // Show notification
  showNotification('Filters applied successfully!', 'success');
}

// Apply Filters (without closing popup)
// Apply Filters (without closing popup)
function applyFilters() {
  let filtered = [...products];

  // Brand Filter
  if (filterState.brands.length > 0) {
    filtered = filtered.filter(p => filterState.brands.includes(p.brand));
  }

  // Price Filter
  filtered = filtered.filter(p => p.price >= filterState.minPrice && p.price <= filterState.maxPrice);

  // RAM Filter
  if (filterState.ram.length > 0) {
    filtered = filtered.filter(p => filterState.ram.some(ram => p.specs.includes(ram)));
  }

  // Storage Filter
  if (filterState.storage.length > 0) {
    filtered = filtered.filter(p => filterState.storage.some(storage => p.specs.includes(storage)));
  }

  // Network Filter
  if (filterState.network.length > 0) {
    filtered = filtered.filter(p => filterState.network.some(network => p.specs.includes(network)));
  }

  // Camera Filter
  if (filterState.camera.length > 0) {
    filtered = filtered.filter(p =>
      p.detailedSpecs && filterState.camera.includes(p.detailedSpecs.camera)
    );
  }

  // Battery Filter
  if (filterState.battery.length > 0) {
    filtered = filtered.filter(p => {
      if (!p.detailedSpecs || !p.detailedSpecs.battery) return false;

      const batteryValue = parseInt(p.detailedSpecs.battery.match(/\d+/));

      return filterState.battery.some(range => {
        if (range === 'Less than 4000mAh') return batteryValue < 4000;
        if (range === '4000-4500mAh') return batteryValue >= 4000 && batteryValue <= 4500;
        if (range === '4500-5000mAh') return batteryValue > 4500 && batteryValue <= 5000;
        if (range === '5000mAh and above') return batteryValue > 5000;
        return false;
      });
    });
  }

  // Status Filter
  if (filterState.status.length > 0) {
    filtered = filtered.filter(p => filterState.status.includes(p.badgeType));
  }

  // Sort
  switch (filterState.sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  // Update counts
  const resultCount = document.getElementById('resultCount');
  const totalCount = document.getElementById('totalCount');

  if (resultCount) resultCount.textContent = filtered.length;
  if (totalCount) totalCount.textContent = products.length;

  // Display filtered products
  displayProducts(filtered);
}

// Reset Filters
function resetFilters() {
  filterState = {
    brands: [],
    minPrice: 0,
    maxPrice: 100000,
    ram: [],
    storage: [],
    network: [],
    camera: [],
    battery: [],
    status: [],
    sortBy: 'default'
  };

  tempFilterState = { ...filterState };

  // Reset all checkboxes
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);

  // Reset price inputs
  const minRange = document.getElementById('minRange');
  const maxRange = document.getElementById('maxRange');
  const minInput = document.getElementById('minInput');
  const maxInput = document.getElementById('maxInput');

  if (minRange) minRange.value = 0;
  if (maxRange) maxRange.value = 100000;
  if (minInput) minInput.value = 0;
  if (maxInput) maxInput.value = 100000;

  // Reset sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'default';

  // Update slider visuals
  const rangeSelected = document.getElementById('rangeSelected');
  if (rangeSelected) {
    rangeSelected.style.left = '0%';
    rangeSelected.style.width = '100%';
  }

  updateFilterCounts();
}

// ========== SMART STICKY HEADER ==========
let lastScrollY = window.scrollY;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  if (!header) return;

  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 400) {
    // Scrolling down & past threshold -> Hide header
    header.classList.add('header-hidden');
  } else {
    // Scrolling up or at top -> Show header
    header.classList.remove('header-hidden');
  }

  lastScrollY = currentScrollY;
});

