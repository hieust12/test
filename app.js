const TONE_LABELS = {
  'pastel-pink': 'Hồng Pastel',
  'cream-white': 'Trắng Kem',
  'red-burgundy': 'Đỏ Quyến Rũ',
  'yellow-orange': 'Vàng Cam',
  'blue-mint': 'Xanh Tươi Mát',
  'crochet': 'Hoa Len Móc'
};

const BUDGET_LABELS = {
  'mini': 'Mini Collection (150.000đ)',
  'daily': 'Daily Collection (250k - 350k)',
  'signature': 'Signature Collection (400k - 700k)'
};

const STORAGE_KEY = 'meo_flowers_products_handover_v1';
const ACCOUNT_KEY = 'meo_flowers_account_v1';
const SAVED_KEY = 'meo_flowers_saved_ids_v1';
const SESSION_KEY = 'meo_flowers_logged_in_v1';

const DEFAULT_PRODUCTS = [
  {
    id: 'MF-01',
    name: 'Tulip Hồng Phấn Seoul',
    tone: 'pastel-pink',
    budget: 'daily',
    price: '280.000đ',
    desc: 'Hoa tulip lụa cao cấp phối giấy gói Hàn Quốc tone hồng phấn nhẹ nhàng, giữ dáng bền đẹp.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'MF-02',
    name: 'Bó Cẩm Tú Cầu Trắng Kem',
    tone: 'cream-white',
    budget: 'signature',
    price: '450.000đ',
    desc: 'Tone trắng kem thanh lịch kiểu Hàn Quốc, phù hợp tặng sinh nhật, kỷ niệm hoặc chụp ảnh.',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'MF-03',
    name: 'Hồng Sáp Đỏ Nhung Cổ Điển',
    tone: 'red-burgundy',
    budget: 'daily',
    price: '320.000đ',
    desc: 'Hoa hồng sáp thơm quyến rũ gói giấy đen/kem sang trọng, lưu hương lâu.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'MF-04',
    name: 'Mini Bouquet Nắng Mai',
    tone: 'yellow-orange',
    budget: 'mini',
    price: '150.000đ',
    desc: 'Bó hoa mini tone vàng cam rực rỡ, nhỏ xinh cho các dịp chúc mừng nhẹ nhàng.',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'MF-05',
    name: 'Bó Xanh Bạc Hà Tươi Mát',
    tone: 'blue-mint',
    budget: 'daily',
    price: '290.000đ',
    desc: 'Phối sắc xanh dịu mắt phong cách Seoul Florist, thanh thoát và hiện đại.',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'MF-06',
    name: 'Bó Hoa Len Móc Thủ Công',
    tone: 'crochet',
    budget: 'mini',
    price: '150.000đ',
    desc: 'Hoa len móc tay tỉ mỉ từng cánh hoa, món quà lưu niệm bền mãi theo thời gian.',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=700&q=80'
  }
];

function getDefaultAccount() {
  const defaultPin = (typeof SHOP_CONFIG !== 'undefined' && SHOP_CONFIG.adminPin) ? SHOP_CONFIG.adminPin : '2026';
  const defaultPhone = (typeof SHOP_CONFIG !== 'undefined' && SHOP_CONFIG.hotline) ? SHOP_CONFIG.hotline : '0900000000';
  return {
    displayName: 'Chủ Shop Meo Flowers',
    username: 'meoflowers',
    phone: defaultPhone,
    password: defaultPin,
    pin: defaultPin
  };
}

let accountData = loadAccount();
let savedProductIds = loadSavedIds();
let products = [];
let activeTone = 'all';
let activeBudget = 'all';
let searchKeyword = '';
let isLoggedIn = sessionStorage.getItem(SESSION_KEY) === 'true';
let db = null;
let selectedProduct = null;

function loadAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (raw) return { ...getDefaultAccount(), ...JSON.parse(raw) };
  } catch (e) {}
  return getDefaultAccount();
}

function saveAccount() {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountData));
}

function loadSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveSavedIds() {
  localStorage.setItem(SAVED_KEY, JSON.stringify(savedProductIds));
}

function getInitials(name) {
  const parts = (name || 'MK').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function applyShopConfig() {
  if (typeof SHOP_CONFIG === 'undefined') return;
  document.getElementById('linkFanpage').href = SHOP_CONFIG.fanpageLink;
  document.getElementById('linkInstagram').href = SHOP_CONFIG.instagramLink;
  document.getElementById('linkTiktok').href = SHOP_CONFIG.tiktokLink;
  document.getElementById('popCall').href = 'tel:' + SHOP_CONFIG.hotline;
  document.getElementById('popZalo').href = SHOP_CONFIG.zaloLink;
  document.getElementById('popFb').href = SHOP_CONFIG.fanpageLink;
  document.getElementById('modalOrderBtn').href = SHOP_CONFIG.fanpageLink;

  if (SHOP_CONFIG.firebaseConfig && SHOP_CONFIG.firebaseConfig.apiKey && window.firebase) {
    try {
      firebase.initializeApp(SHOP_CONFIG.firebaseConfig);
      db = firebase.firestore();
      const indicator = document.getElementById('syncModeIndicator');
      indicator.textContent = 'Đang đồng bộ Cloud (Firebase)';
      indicator.classList.add('online');
    } catch (err) {
      console.error('Firebase init error:', err);
    }
  }
}

function updateCounts() {
  const allEl = document.getElementById('count-all');
  if (allEl) allEl.textContent = products.length;
  Object.keys(TONE_LABELS).forEach(toneKey => {
    const el = document.getElementById('count-' + toneKey);
    if (el) {
      el.textContent = products.filter(p => p.tone === toneKey).length;
    }
  });
}

function updateAccountUI() {
  const initials = getInitials(accountData.displayName);
  document.getElementById('headerAccountAvatar').textContent = initials;
  document.getElementById('accountAvatarCircle').textContent = initials;
  document.getElementById('headerAccountLabel').textContent = isLoggedIn ? accountData.username : 'Đăng nhập';

  const adminBadge = document.getElementById('adminModeBadge');
  const logoutDrawerBtn = document.getElementById('logoutAdminBtn');
  const accountLogoutBtn = document.getElementById('accountLogoutBtn');
  const rolePill = document.getElementById('accountRolePill');
  const displayNameEl = document.getElementById('accountDisplayName');
  const statusTextEl = document.getElementById('accountStatusText');
  const sessionInput = document.getElementById('accSessionInput');

  if (isLoggedIn) {
    adminBadge.classList.remove('hidden');
    logoutDrawerBtn.classList.remove('hidden');
    accountLogoutBtn.classList.remove('hidden');
    rolePill.textContent = 'Đã đăng nhập • Chủ Shop';
    rolePill.classList.add('logged-in');
    displayNameEl.textContent = accountData.displayName;
    statusTextEl.textContent = `Tài khoản: @${accountData.username} • Đã mở khóa quản lý sản phẩm và đổi mật khẩu.`;
    sessionInput.value = `Đang hoạt động (@${accountData.username})`;
  } else {
    adminBadge.classList.add('hidden');
    logoutDrawerBtn.classList.add('hidden');
    accountLogoutBtn.classList.add('hidden');
    rolePill.textContent = 'Chế độ Khách';
    rolePill.classList.remove('logged-in');
    displayNameEl.textContent = 'Khách tham quan Meo Flowers';
    statusTextEl.textContent = 'Đăng nhập bằng tài khoản/mật khẩu để quản lý mẫu hoa và đổi mật khẩu.';
    sessionInput.value = 'Chưa đăng nhập';
  }

  document.getElementById('accNameInput').value = accountData.displayName;
  document.getElementById('accUsernameInput').value = accountData.username;
  document.getElementById('accPhoneInput').value = accountData.phone;
  document.getElementById('newPinInput').value = accountData.pin;

  renderSavedProducts();
  updateCustomerUI();
  renderProducts();
}

function renderSavedProducts() {
  const container = document.getElementById('savedProductsList');
  const countSpan = document.getElementById('savedCountSpan');
  const savedItems = products.filter(p => savedProductIds.includes(p.id));
  countSpan.textContent = savedItems.length;

  if (savedItems.length === 0) {
    container.innerHTML = `<div class="empty-state">Chưa có mẫu hoa nào được lưu. Bấm vào một bó hoa rồi chọn <strong>"Lưu mẫu"</strong> để lưu lại.</div>`;
    return;
  }

  container.innerHTML = savedItems.map(item => `
    <div class="saved-mini-card">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <div class="saved-mini-title">${item.name}</div>
        <div class="saved-mini-price">${item.price}</div>
      </div>
      <button type="button" class="remove-saved-btn" data-remove-saved="${item.id}" title="Bỏ lưu">&times;</button>
    </div>
  `).join('');

  container.querySelectorAll('.remove-saved-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-remove-saved');
      savedProductIds = savedProductIds.filter(x => x !== id);
      saveSavedIds();
      renderSavedProducts();
      showToast('Đã bỏ lưu mẫu hoa');
    });
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

async function initProducts() {
  applyShopConfig();

  if (db) {
    db.collection('meo_flowers').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      if (snapshot.empty) {
        products = [...DEFAULT_PRODUCTS];
      } else {
        products = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      }
      updateCounts();
      updateAccountUI();
    });
    return;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      products = JSON.parse(saved);
      updateCounts();
      updateAccountUI();
      return;
    } catch (e) {}
  }

  try {
    const res = await fetch('data/products.json');
    if (res.ok) {
      products = await res.json();
      saveProductsLocal();
      updateCounts();
      updateAccountUI();
      return;
    }
  } catch (e) {}

  products = [...DEFAULT_PRODUCTS];
  saveProductsLocal();
  updateCounts();
  updateAccountUI();
}

function saveProductsLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  const filterSummary = document.getElementById('filterSummary');
  const resetFilterBtn = document.getElementById('resetFilterBtn');

  const filtered = products.filter(item => {
    const matchTone = activeTone === 'all' || item.tone === activeTone;
    const matchBudget = activeBudget === 'all' || item.budget === activeBudget;
    const matchSearch = !searchKeyword ||
      item.name.toLowerCase().includes(searchKeyword) ||
      item.id.toLowerCase().includes(searchKeyword);
    return matchTone && matchBudget && matchSearch;
  });

  const parts = [];
  if (activeTone !== 'all') parts.push(`Tone: ${TONE_LABELS[activeTone]}`);
  if (activeBudget !== 'all') parts.push(`Gói: ${BUDGET_LABELS[activeBudget]}`);

  if (parts.length > 0 || searchKeyword) {
    filterSummary.textContent = `Đang lọc (${parts.join(' • ') || 'Tìm kiếm'}) — ${filtered.length} mẫu`;
    resetFilterBtn.classList.remove('hidden');
  } else {
    filterSummary.textContent = `Đang hiển thị tất cả ${filtered.length} mẫu hoa`;
    resetFilterBtn.classList.add('hidden');
  }

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        Chưa có mẫu hoa nào trong nhóm lọc này.<br />
        Bạn có thể bấm <strong>"Xóa lọc"</strong> để xem toàn bộ bộ sưu tập.
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(item => `
    <article class="product-card" data-id="${item.id}">
      <div class="product-thumb-wrap">
        <img src="${item.image}" alt="${item.name}" class="product-thumb" loading="lazy" />
        <span class="product-tone-pill">${TONE_LABELS[item.tone] || item.tone}</span>
        ${isLoggedIn ? `<button type="button" class="delete-item-btn" data-delete-id="${item.id}" title="Xóa mẫu này">&times;</button>` : ''}
      </div>
      <div class="product-info">
        <h3 class="product-title">${item.name}</h3>
        <span class="product-price">${item.price}</span>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.delete-item-btn')) return;
      const id = card.getAttribute('data-id');
      const item = products.find(p => p.id === id);
      if (item) openProductDetail(item);
    });
  });

  document.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-delete-id');
      if (!confirm(`Xóa mẫu hoa ${id} khỏi danh sách?`)) return;

      const target = products.find(p => p.id === id);
      if (db && target && target.docId) {
        await db.collection('meo_flowers').doc(target.docId).delete();
      } else {
        products = products.filter(p => p.id !== id);
        saveProductsLocal();
        updateCounts();
        updateAccountUI();
      }
      showToast('Đã xóa mẫu hoa!');
    });
  });
}

function openProductDetail(item) {
  selectedProduct = item;
  document.getElementById('modalImg').src = item.image;
  document.getElementById('modalToneBadge').textContent =
    `${item.id} • ${TONE_LABELS[item.tone] || ''} • ${BUDGET_LABELS[item.budget] || ''}`;
  document.getElementById('modalTitle').textContent = item.name;
  document.getElementById('modalPrice').textContent = item.price;
  document.getElementById('modalDesc').textContent = item.desc || 'Hoa thủ công thiết kế theo yêu cầu tại Meo Flowers.';

  const isSaved = savedProductIds.includes(item.id);
  const saveBtn = document.getElementById('saveFavoriteBtn');
  saveBtn.textContent = isSaved ? '♥ ĐÃ LƯU' : '♡ LƯU MẪU';

  document.getElementById('productModal').classList.add('open');
}

document.getElementById('saveFavoriteBtn').addEventListener('click', () => {
  if (!selectedProduct) return;
  const idx = savedProductIds.indexOf(selectedProduct.id);
  if (idx >= 0) {
    savedProductIds.splice(idx, 1);
    document.getElementById('saveFavoriteBtn').textContent = '♡ LƯU MẪU';
    showToast('Đã bỏ lưu mẫu hoa');
  } else {
    savedProductIds.push(selectedProduct.id);
    document.getElementById('saveFavoriteBtn').textContent = '♥ ĐÃ LƯU';
    showToast('Đã lưu mẫu hoa vào Tài khoản!');
  }
  saveSavedIds();
  syncCustomerSavedIds();
  renderSavedProducts();
  renderModalCustomerSaved();
});

document.getElementById('copyOrderBtn').addEventListener('click', () => {
  if (!selectedProduct) return;
  const text = `Chào Meo Flowers, mình muốn đặt mẫu:
- Mã: ${selectedProduct.id}
- Tên: ${selectedProduct.name}
- Tone: ${TONE_LABELS[selectedProduct.tone]}
- Giá: ${selectedProduct.price}`;
  navigator.clipboard?.writeText(text);
  showToast('Đã sao chép thông tin mẫu hoa! Hãy dán vào Zalo/Fanpage của shop.');
});

// Floating contact popover
document.getElementById('floatingContactBtn').addEventListener('click', () => {
  document.getElementById('contactPopover').classList.toggle('hidden');
});

// Tone & Budget Filters
document.getElementById('toneTabs').addEventListener('click', e => {
  const btn = e.target.closest('.tone-tab');
  if (!btn) return;
  document.querySelectorAll('.tone-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  activeTone = btn.getAttribute('data-tone');
  renderProducts();
});

document.querySelectorAll('.budget-card').forEach(card => {
  card.addEventListener('click', () => {
    const selected = card.getAttribute('data-budget');
    if (activeBudget === selected) {
      activeBudget = 'all';
      card.classList.remove('active');
    } else {
      document.querySelectorAll('.budget-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeBudget = selected;
    }
    renderProducts();
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
  });
});

document.getElementById('searchInput').addEventListener('input', e => {
  searchKeyword = e.target.value.trim().toLowerCase();
  renderProducts();
});

document.getElementById('resetFilterBtn').addEventListener('click', () => {
  activeTone = 'all';
  activeBudget = 'all';
  searchKeyword = '';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.tone-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tone-tab[data-tone="all"]').classList.add('active');
  document.querySelectorAll('.budget-card').forEach(c => c.classList.remove('active'));
  renderProducts();
});

// Drawer & Modals
const menuDrawer = document.getElementById('menuDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
function openDrawer() {
  menuDrawer.classList.add('open');
  drawerOverlay.classList.add('open');
}
function closeDrawer() {
  menuDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
}
document.getElementById('menuToggle').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));

document.getElementById('closeProductModal').addEventListener('click', () => {
  document.getElementById('productModal').classList.remove('open');
});
document.getElementById('productModal').addEventListener('click', e => {
  if (e.target.id === 'productModal') e.target.classList.remove('open');
});

// Show/Hide password buttons
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// Login Modal triggers
function openAuthModal() {
  document.getElementById('loginUsername').value = accountData.username;
  document.getElementById('loginPassword').value = '';
  document.getElementById('authModal').classList.add('open');
}

document.getElementById('headerAccountBtn').addEventListener('click', () => {
  if (isLoggedIn) {
    document.getElementById('account').scrollIntoView({ behavior: 'smooth' });
  } else {
    openAuthModal();
  }
});

document.getElementById('openAccountModalBtn').addEventListener('click', openAuthModal);
document.getElementById('drawerAccountBtn').addEventListener('click', () => {
  closeDrawer();
  if (isLoggedIn) {
    document.getElementById('account').scrollIntoView({ behavior: 'smooth' });
  } else {
    openAuthModal();
  }
});

document.getElementById('closeAuthModal').addEventListener('click', () => {
  document.getElementById('authModal').classList.remove('open');
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const userInput = document.getElementById('loginUsername').value.trim();
  const passInput = document.getElementById('loginPassword').value.trim();

  const matchPass = await verifySecret(passInput, accountData.password);
  const matchPin = await verifySecret(passInput, accountData.pin);
  const validPass = matchPass || matchPin;
  const validUser = !userInput || userInput.toLowerCase() === accountData.username.toLowerCase() || userInput.toLowerCase() === 'admin';

  if (!validPass || !validUser) {
    alert('Sai tên đăng nhập hoặc mật khẩu!');
    return;
  }

  isLoggedIn = true;
  sessionStorage.setItem(SESSION_KEY, 'true');
  document.getElementById('authModal').classList.remove('open');
  updateAccountUI();
  showToast(`Chào mừng ${accountData.displayName} đã đăng nhập!`);
});

function logoutAccount() {
  isLoggedIn = false;
  sessionStorage.removeItem(SESSION_KEY);
  closeDrawer();
  updateAccountUI();
  showToast('Đã đăng xuất tài khoản');
}

document.getElementById('logoutAdminBtn').addEventListener('click', logoutAccount);
document.getElementById('accountLogoutBtn').addEventListener('click', logoutAccount);

// Account Sub-tabs
document.getElementById('accountSubTabs').addEventListener('click', e => {
  const tabBtn = e.target.closest('.acc-tab');
  if (!tabBtn) return;
  const targetTab = tabBtn.getAttribute('data-acctab');
  document.querySelectorAll('.acc-tab').forEach(t => t.classList.remove('active'));
  tabBtn.classList.add('active');
  document.querySelectorAll('.acc-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('acctab-' + targetTab).classList.add('active');
});

// Save Profile Info
document.getElementById('profileForm').addEventListener('submit', e => {
  e.preventDefault();
  accountData.displayName = document.getElementById('accNameInput').value.trim() || 'Chủ Shop Meo Flowers';
  accountData.username = document.getElementById('accUsernameInput').value.trim() || 'meoflowers';
  accountData.phone = document.getElementById('accPhoneInput').value.trim();
  saveAccount();
  updateAccountUI();
  showToast('Đã lưu thông tin tài khoản!');
});

// Change Password & PIN (Chủ Shop / Admin)
document.getElementById('changePasswordForm').addEventListener('submit', async e => {
  e.preventDefault();
  const currentPass = document.getElementById('currentPasswordInput').value.trim();
  const newPass = document.getElementById('newPasswordInput').value.trim();
  const confirmPass = document.getElementById('confirmPasswordInput').value.trim();
  const newPin = document.getElementById('newPinInput').value.trim();

  const okPass = await verifySecret(currentPass, accountData.password);
  const okPin = await verifySecret(currentPass, accountData.pin);
  const matchesCurrent = okPass || okPin || (isLoggedIn && !currentPass);

  if (!matchesCurrent) {
    alert('Mật khẩu hoặc mã PIN hiện tại không chính xác! (Mặc định: 2026)');
    return;
  }

  const isDifferentPin = newPin.length > 0 && !(await verifySecret(newPin, accountData.pin));
  const hasNewPassword = newPass.length > 0 || confirmPass.length > 0;
  const hasNewPin = isDifferentPin;

  if (!hasNewPassword && !hasNewPin) {
    alert('Vui lòng nhập mật khẩu mới hoặc thay đổi mã PIN trước khi cập nhật!');
    return;
  }

  if (hasNewPassword) {
    if (newPass.length < 4) {
      alert('Mật khẩu mới cần ít nhất 4 ký tự!');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Xác nhận mật khẩu mới không khớp!');
      return;
    }
    accountData.password = await sha256Hex(newPass);
  }

  if (newPin) {
    accountData.pin = await sha256Hex(newPin);
  }

  saveAccount();
  document.getElementById('changePasswordForm').reset();
  document.getElementById('newPinInput').value = newPin || '';
  showToast('Đã cập nhật & băm SHA-256 mật khẩu / mã PIN Chủ Shop thành công!');
});

document.getElementById('resetSecurityDefaultBtn').addEventListener('click', () => {
  if (!confirm('Khôi phục mật khẩu và mã PIN về mặc định ban đầu?')) return;
  const fresh = getDefaultAccount();
  accountData.password = fresh.password;
  accountData.pin = fresh.pin;
  saveAccount();
  document.getElementById('newPinInput').value = accountData.pin;
  showToast('Đã khôi phục mật khẩu mặc định!');
});

// Admin Upload Modal
document.getElementById('openAdminBtn').addEventListener('click', () => {
  closeDrawer();
  if (!isLoggedIn) {
    openAuthModal();
    return;
  }
  document.getElementById('adminModal').classList.add('open');
});

document.getElementById('closeAdminModal').addEventListener('click', () => {
  document.getElementById('adminModal').classList.remove('open');
});

function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const submitBtn = document.getElementById('submitUploadBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'ĐANG LƯU...';

  try {
    const name = document.getElementById('prodName').value.trim();
    const tone = document.getElementById('prodTone').value;
    const budget = document.getElementById('prodBudget').value;
    const price = document.getElementById('prodPrice').value.trim();
    const desc = document.getElementById('prodDesc').value.trim();
    const fileInput = document.getElementById('prodFile');
    const urlInput = document.getElementById('prodUrl').value.trim();

    let imageSrc = urlInput;
    if (fileInput.files && fileInput.files[0]) {
      imageSrc = await compressImage(fileInput.files[0]);
    }

    if (!imageSrc) {
      alert('Vui lòng chọn ảnh từ máy hoặc nhập link ảnh!');
      return;
    }

    const newProduct = {
      id: 'MF-' + String(products.length + 1).padStart(2, '0'),
      name,
      tone,
      budget,
      price,
      desc,
      image: imageSrc,
      createdAt: Date.now()
    };

    if (db) {
      await db.collection('meo_flowers').add(newProduct);
    } else {
      products.unshift(newProduct);
      saveProductsLocal();
      updateCounts();
      updateAccountUI();
    }

    document.getElementById('uploadForm').reset();
    document.getElementById('adminModal').classList.remove('open');
    showToast('Đã đăng mẫu hoa mới thành công!');
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'THÊM MẪU LÊN WEB';
  }
});

document.getElementById('exportJsonBtn').addEventListener('click', () => {
  const cleanData = products.map(({ docId, ...rest }) => rest);
  const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('resetDefaultBtn').addEventListener('click', () => {
  if (confirm('Khôi phục lại danh sách mẫu hoa mặc định ban đầu?')) {
    products = [...DEFAULT_PRODUCTS];
    saveProductsLocal();
    updateCounts();
    updateAccountUI();
    document.getElementById('adminModal').classList.remove('open');
  }
});


const CUSTOMER_USERS_KEY = 'meo_flowers_customers_v1';
const CUSTOMER_SESSION_KEY = 'meo_flowers_current_customer_v1';

function loadCustomerUsers() {
  try {
    const raw = localStorage.getItem(CUSTOMER_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveCustomerUsers(users) {
  localStorage.setItem(CUSTOMER_USERS_KEY, JSON.stringify(users));
}

function loadCurrentCustomer() {
  try {
    const rawSession = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
    if (rawSession) return JSON.parse(rawSession);
    const rawLocal = localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (rawLocal) return JSON.parse(rawLocal);
  } catch (e) {}
  return null;
}

function persistCurrentCustomer(cust, remember = true) {
  sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  if (!cust) return;
  const serialized = JSON.stringify(cust);
  if (remember) {
    localStorage.setItem(CUSTOMER_SESSION_KEY, serialized);
  } else {
    sessionStorage.setItem(CUSTOMER_SESSION_KEY, serialized);
  }
}

let customerUsers = loadCustomerUsers();
let currentCustomer = loadCurrentCustomer();

function updateCustomerUI() {
  const chipBtn = document.getElementById('headerCustomerBtn');
  const avatarEl = document.getElementById('headerCustomerAvatar');
  const labelEl = document.getElementById('headerCustomerLabel');
  const bannerBadge = document.getElementById('customerBannerBadge');
  const bannerTitle = document.getElementById('customerBannerTitle');
  const bannerDesc = document.getElementById('customerBannerDesc');
  const loginTabBtn = document.getElementById('openCustomerLoginTabBtn');
  const regTabBtn = document.getElementById('openCustomerRegisterTabBtn');
  const profileModalBtn = document.getElementById('customerProfileModalBtn');
  const custLogoutBtn = document.getElementById('customerLogoutBtn');

  if (!chipBtn) return;

  if (currentCustomer) {
    const initials = getInitials(currentCustomer.name || currentCustomer.phone);
    avatarEl.textContent = initials;
    labelEl.textContent = currentCustomer.name || currentCustomer.phone;
    chipBtn.classList.add('logged-in');

    bannerBadge.textContent = 'Thành viên';
    bannerBadge.classList.add('active');
    bannerTitle.textContent = `Xin chào, ${currentCustomer.name || 'Khách hàng'}!`;
    bannerDesc.textContent = `${currentCustomer.phone}${currentCustomer.email ? ' • ' + currentCustomer.email : ''} — Tài khoản khách hàng đã sẵn sàng lưu mẫu và đặt hoa.`;

    loginTabBtn.classList.add('hidden');
    regTabBtn.classList.add('hidden');
    profileModalBtn.classList.remove('hidden');
    custLogoutBtn.classList.remove('hidden');

    if (Array.isArray(currentCustomer.savedIds)) {
      savedProductIds = [...new Set([...savedProductIds, ...currentCustomer.savedIds])];
      saveSavedIds();
    }
  } else {
    avatarEl.textContent = 'KH';
    labelEl.textContent = 'Đăng nhập / Đăng ký';
    chipBtn.classList.remove('logged-in');

    bannerBadge.textContent = 'Khách hàng';
    bannerBadge.classList.remove('active');
    bannerTitle.textContent = 'Đăng nhập hoặc Đăng ký tài khoản Khách hàng';
    bannerDesc.textContent = 'Lưu mẫu hoa yêu thích, lưu thông tin nhận hoa và đặt hoa nhanh chóng tại Meo Flowers.';

    loginTabBtn.classList.remove('hidden');
    regTabBtn.classList.remove('hidden');
    profileModalBtn.classList.add('hidden');
    custLogoutBtn.classList.add('hidden');
  }

  renderSavedProducts();
}

function setCustomerAuthMode(mode = 'login') {
  const isLogin = mode === 'login';
  document.getElementById('tabCustomerLogin').classList.toggle('active', isLogin);
  document.getElementById('tabCustomerRegister').classList.toggle('active', !isLogin);
  document.getElementById('customerLoginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('customerRegisterForm').classList.toggle('hidden', isLogin);
  document.getElementById('customerAuthTitle').textContent = isLogin
    ? 'Đăng nhập Khách hàng'
    : 'Đăng ký Khách hàng mới';
  document.getElementById('customerAuthSub').textContent = isLogin
    ? 'Đăng nhập bằng số điện thoại hoặc email để truy cập tài khoản của bạn.'
    : 'Tạo tài khoản khách hàng Meo Flowers để lưu mẫu hoa yêu thích và đặt hàng thuận tiện.';
}

function openCustomerAuthModal(mode = 'login') {
  setCustomerAuthMode(mode);
  document.getElementById('customerAuthModal').classList.add('open');
}

function openCustomerProfileModal() {
  if (!currentCustomer) {
    openCustomerAuthModal('login');
    return;
  }
  document.getElementById('custProfileAvatar').textContent = getInitials(currentCustomer.name || currentCustomer.phone);
  document.getElementById('custProfileName').textContent = currentCustomer.name || 'Khách hàng';
  document.getElementById('custProfileContact').textContent =
    `${currentCustomer.phone || ''}${currentCustomer.email ? ' • ' + currentCustomer.email : ''}`;

  document.getElementById('custEditName').value = currentCustomer.name || '';
  document.getElementById('custEditPhone').value = currentCustomer.phone || '';
  document.getElementById('custEditEmail').value = currentCustomer.email || '';
  document.getElementById('custEditAddress').value = currentCustomer.address || '';

  setCustomerProfileTab('info');
  renderModalCustomerSaved();
  document.getElementById('customerProfileModal').classList.add('open');
}

function renderModalCustomerSaved() {
  const listEl = document.getElementById('modalCustSavedList');
  const countEl = document.getElementById('modalCustSavedCount');
  if (!listEl || !countEl) return;

  const savedItems = products.filter(p => savedProductIds.includes(p.id));
  countEl.textContent = savedItems.length;

  if (savedItems.length === 0) {
    listEl.innerHTML = '<div class="empty-state">Bạn chưa lưu mẫu hoa nào.</div>';
    return;
  }

  listEl.innerHTML = savedItems.map(item => `
    <div class="saved-mini-card">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <div class="saved-mini-title">${item.name}</div>
        <div class="saved-mini-price">${item.price}</div>
      </div>
    </div>
  `).join('');
}

function syncCustomerSavedIds() {
  if (!currentCustomer) return;
  currentCustomer.savedIds = [...savedProductIds];
  persistCurrentCustomer(currentCustomer, true);
  const idx = customerUsers.findIndex(u => u.id === currentCustomer.id);
  if (idx >= 0) {
    customerUsers[idx] = { ...customerUsers[idx], savedIds: [...savedProductIds] };
    saveCustomerUsers(customerUsers); if (currentCustomer) { window.MeoFlowersFirebaseAuth?.syncCustomerToFirestore(currentCustomer).catch(() => {}); }
  }
}

function logoutCustomer() {
  currentCustomer = null;
  persistCurrentCustomer(null, false);
  updateCustomerUI();
  document.getElementById('customerProfileModal').classList.remove('open');
  showToast('Đã đăng xuất tài khoản khách hàng');
}

// Bind Customer UI events
document.getElementById('headerCustomerBtn').addEventListener('click', () => {
  if (currentCustomer) {
    openCustomerProfileModal();
  } else {
    openCustomerAuthModal('login');
  }
});

document.getElementById('drawerCustomerBtn').addEventListener('click', () => {
  closeDrawer();
  if (currentCustomer) {
    openCustomerProfileModal();
  } else {
    openCustomerAuthModal('login');
  }
});

document.getElementById('openCustomerLoginTabBtn').addEventListener('click', () => openCustomerAuthModal('login'));
document.getElementById('openCustomerRegisterTabBtn').addEventListener('click', () => openCustomerAuthModal('register'));
document.getElementById('customerProfileModalBtn').addEventListener('click', openCustomerProfileModal);
document.getElementById('customerLogoutBtn').addEventListener('click', logoutCustomer);
document.getElementById('modalCustLogoutBtn').addEventListener('click', logoutCustomer);

document.getElementById('tabCustomerLogin').addEventListener('click', () => setCustomerAuthMode('login'));
document.getElementById('tabCustomerRegister').addEventListener('click', () => setCustomerAuthMode('register'));
document.getElementById('switchToRegisterBtn').addEventListener('click', () => setCustomerAuthMode('register'));
document.getElementById('switchToLoginBtn').addEventListener('click', () => setCustomerAuthMode('login'));

document.getElementById('closeCustomerAuthModal').addEventListener('click', () => {
  document.getElementById('customerAuthModal').classList.remove('open');
});
document.getElementById('customerAuthModal').addEventListener('click', e => {
  if (e.target.id === 'customerAuthModal') e.target.classList.remove('open');
});

document.getElementById('closeCustomerProfileModal').addEventListener('click', () => {
  document.getElementById('customerProfileModal').classList.remove('open');
});
document.getElementById('customerProfileModal').addEventListener('click', e => {
  if (e.target.id === 'customerProfileModal') e.target.classList.remove('open');
});

document.getElementById('customerRegisterForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('custRegName').value.trim();
  const phone = document.getElementById('custRegPhone').value.trim();
  const email = document.getElementById('custRegEmail').value.trim().toLowerCase();
  const password = document.getElementById('custRegPassword').value;
  const confirmPassword = document.getElementById('custRegConfirmPassword').value;

  if (password.length < 6) {
    alert('Mật khẩu cần tối thiểu 6 ký tự!');
    return;
  }
  if (password !== confirmPassword) {
    alert('Xác nhận mật khẩu không khớp!');
    return;
  }

  const duplicate = customerUsers.find(
    u => u.phone === phone || (email && u.email && u.email.toLowerCase() === email)
  );
  if (duplicate) {
    alert('Số điện thoại hoặc email này đã được đăng ký. Vui lòng đăng nhập!');
    setCustomerAuthMode('login');
    document.getElementById('custLoginIdentifier').value = phone || email;
    return;
  }

  const hashedPassword = await sha256Hex(password);
  const newCustomer = {
    id: 'CUST-' + Date.now(),
    name,
    phone,
    email,
    password: hashedPassword,
    address: '',
    savedIds: [...savedProductIds],
    createdAt: new Date().toISOString()
  };

  customerUsers.push(newCustomer);
  saveCustomerUsers(customerUsers);

  currentCustomer = { ...newCustomer };
  persistCurrentCustomer(currentCustomer, true);

  document.getElementById('customerRegisterForm').reset();
  document.getElementById('customerAuthModal').classList.remove('open');
  updateCustomerUI();
  showToast(`Đăng ký thành công! Chào mừng ${name}`);
});

document.getElementById('customerLoginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const identifier = document.getElementById('custLoginIdentifier').value.trim().toLowerCase();
  const password = document.getElementById('custLoginPassword').value;
  const remember = document.getElementById('custRememberMe').checked;

  const matched = customerUsers.find(
    u =>
      (u.phone && u.phone.toLowerCase() === identifier) ||
      (u.email && u.email.toLowerCase() === identifier)
  );

  const validCustPass = matched ? await verifySecret(password, matched.password) : false;
  if (!matched || !validCustPass) {
    alert('Thông tin đăng nhập hoặc mật khẩu khách hàng chưa đúng!');
    return;
  }

  currentCustomer = { ...matched };
  persistCurrentCustomer(currentCustomer, remember);

  document.getElementById('customerLoginForm').reset();
  document.getElementById('customerAuthModal').classList.remove('open');
  updateCustomerUI();
  showToast(`Chào mừng trở lại, ${currentCustomer.name}!`);
});

document.getElementById('customerProfileForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!currentCustomer) return;

  currentCustomer.name = document.getElementById('custEditName').value.trim() || currentCustomer.name;
  currentCustomer.phone = document.getElementById('custEditPhone').value.trim() || currentCustomer.phone;
  currentCustomer.email = document.getElementById('custEditEmail').value.trim().toLowerCase();
  currentCustomer.address = document.getElementById('custEditAddress').value.trim();

  persistCurrentCustomer(currentCustomer, true);
  const idx = customerUsers.findIndex(u => u.id === currentCustomer.id);
  if (idx >= 0) {
    customerUsers[idx] = { ...customerUsers[idx], ...currentCustomer };
    saveCustomerUsers(customerUsers);
  }

  updateCustomerUI();
  document.getElementById('customerProfileModal').classList.remove('open');
  showToast('Đã cập nhật hồ sơ khách hàng!');
});

function setCustomerProfileTab(tab = 'info') {
  const isInfo = tab === 'info';
  document.getElementById('tabCustInfo').classList.toggle('active', isInfo);
  document.getElementById('tabCustPassword').classList.toggle('active', !isInfo);
  document.getElementById('custTabContentInfo').classList.toggle('hidden', !isInfo);
  document.getElementById('custTabContentPassword').classList.toggle('hidden', isInfo);
}

document.getElementById('tabCustInfo').addEventListener('click', () => setCustomerProfileTab('info'));
document.getElementById('tabCustPassword').addEventListener('click', () => {
  setCustomerProfileTab('password');
  document.getElementById('customerChangePasswordForm').reset();
});

document.getElementById('customerChangePasswordForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentCustomer) {
    alert('Vui lòng đăng nhập tài khoản khách hàng trước khi đổi mật khẩu!');
    return;
  }

  const currentPass = document.getElementById('custCurrentPassInput').value;
  const newPass = document.getElementById('custNewPassInput').value;
  const confirmPass = document.getElementById('custConfirmPassInput').value;

  const userIdx = customerUsers.findIndex(u => u.id === currentCustomer.id);
  const storedPass = userIdx >= 0 ? customerUsers[userIdx].password : currentCustomer.password;

  const okCurrent = await verifySecret(currentPass, storedPass);
  if (!okCurrent) {
    alert('Mật khẩu hiện tại của khách hàng không chính xác!');
    return;
  }
  if (newPass.length < 6) {
    alert('Mật khẩu mới cần tối thiểu 6 ký tự!');
    return;
  }
  if (newPass !== confirmPass) {
    alert('Xác nhận mật khẩu mới không khớp!');
    return;
  }

  currentCustomer.password = await sha256Hex(newPass);
  const hasLocal = !!localStorage.getItem(CUSTOMER_SESSION_KEY);
  persistCurrentCustomer(currentCustomer, hasLocal);

  if (userIdx >= 0) {
    customerUsers[userIdx] = { ...customerUsers[userIdx], password: newPass };
    saveCustomerUsers(customerUsers);
  } else {
    customerUsers.push({ ...currentCustomer });
    saveCustomerUsers(customerUsers);
  }

  document.getElementById('customerChangePasswordForm').reset();
  setCustomerProfileTab('info');
  showToast('Đã đổi mật khẩu tài khoản khách hàng thành công!');
});



// Helper hỗ trợ kiểm tra Local/Session Storage và đặt lại mật khẩu khi cần
document.getElementById('resetCustomerPassBtn')?.addEventListener('click', () => {
  const idVal = (document.getElementById('custLoginIdentifier').value || '').trim().toLowerCase();
  if (!idVal) {
    alert('Hãy nhập Số điện thoại hoặc Email của tài khoản khách hàng trước rồi bấm đặt lại mật khẩu!');
    return;
  }
  const idx = customerUsers.findIndex(
    u => (u.phone && u.phone.toLowerCase() === idVal) || (u.email && u.email.toLowerCase() === idVal)
  );
  if (idx < 0) {
    alert('Không tìm thấy tài khoản khách hàng khớp với SĐT hoặc Email này.');
    return;
  }
  sha256Hex('123456').then(hashed => {
    customerUsers[idx].password = hashed;
    saveCustomerUsers(customerUsers);
    document.getElementById('custLoginPassword').value = '123456';
    showToast(`Đã đặt lại mật khẩu tài khoản ${customerUsers[idx].name} thành 123456 (đã băm SHA-256)`);
  });
});

window.MeoFlowersStorage = {
  inspectAuthKeys() {
    return {
      localStorage: {
        adminAccount: JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null'),
        customers: JSON.parse(localStorage.getItem(CUSTOMER_USERS_KEY) || '[]'),
        customerSession: JSON.parse(localStorage.getItem(CUSTOMER_SESSION_KEY) || 'null'),
        savedIds: JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
      },
      sessionStorage: {
        adminLoggedIn: sessionStorage.getItem(SESSION_KEY),
        customerSession: JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null')
      }
    };
  },
  clearAllAuthKeys() {
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(CUSTOMER_USERS_KEY);
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    localStorage.removeItem(SAVED_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    location.reload();
  }
};


// --- Bảo mật mật khẩu (SHA-256 + tương thích mật khẩu cũ) & Firebase Auth ---
async function sha256Hex(text) {
  const str = String(text ?? '');
  if (window.crypto && window.crypto.subtle && window.isSecureContext) {
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return 'sha256:' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback deterministic hash for non-HTTPS/file environments if SubtleCrypto unavailable
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'fnv256:' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16) + str.length.toString(16);
}

async function verifySecret(plainInput, storedValue) {
  if (!plainInput || !storedValue) return false;
  if (storedValue.startsWith('sha256:') || storedValue.startsWith('fnv256:')) {
    const hashed = await sha256Hex(plainInput);
    return hashed === storedValue;
  }
  return plainInput === storedValue;
}

let firebaseAuthInstance = null;

function initFirebaseAuthIfReady() {
  if (typeof SHOP_CONFIG === 'undefined' || !SHOP_CONFIG.firebaseConfig || !SHOP_CONFIG.firebaseConfig.apiKey) {
    return null;
  }
  if (!window.firebase || !window.firebase.auth) {
    return null;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(SHOP_CONFIG.firebaseConfig);
    }
    firebaseAuthInstance = firebase.auth();
    if (!db && firebase.firestore) {
      db = firebase.firestore();
    }
    return firebaseAuthInstance;
  } catch (err) {
    console.warn('Firebase Auth init skipped/error:', err);
    return null;
  }
}

window.MeoFlowersFirebaseAuth = {
  isConfigured() {
    return !!(typeof SHOP_CONFIG !== 'undefined' && SHOP_CONFIG.firebaseConfig && SHOP_CONFIG.firebaseConfig.apiKey);
  },
  async signInEmail(email, password) {
    const auth = initFirebaseAuthIfReady();
    if (!auth) throw new Error('Chưa cấu hình firebaseConfig trong config.js');
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  },
  async registerEmail(email, password, displayName = '') {
    const auth = initFirebaseAuthIfReady();
    if (!auth) throw new Error('Chưa cấu hình firebaseConfig trong config.js');
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    if (displayName && cred.user) {
      await cred.user.updateProfile({ displayName });
    }
    return cred.user;
  },
  async sendResetEmail(email) {
    const auth = initFirebaseAuthIfReady();
    if (!auth) throw new Error('Chưa cấu hình firebaseConfig trong config.js');
    await auth.sendPasswordResetEmail(email);
  },
  async signOut() {
    const auth = initFirebaseAuthIfReady();
    if (auth && auth.currentUser) {
      await auth.signOut();
    }
  },
  async syncCustomerToFirestore(customerObj) {
    if (!db || !customerObj || !customerObj.id) return;
    const safeDoc = {
      id: customerObj.id,
      name: customerObj.name || '',
      phone: customerObj.phone || '',
      email: customerObj.email || '',
      address: customerObj.address || '',
      savedIds: Array.isArray(customerObj.savedIds) ? customerObj.savedIds : [],
      updatedAt: Date.now()
    };
    await db.collection('meo_customers').doc(customerObj.id).set(safeDoc, { merge: true });
  }
};

initProducts();
