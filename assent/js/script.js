/* =========================================
   CATÁLOGO DE PRODUTOS
   ========================================= */
const products = {
    "p1": {
        id: "p1",
        name: "Blusa Punk Rock Art",
        price: 79.90,
        description: "Nossa camiseta clássica, feita com o melhor algodão e estampada com a arte exclusiva FR. Conforto e estilo definem esta peça.",
        // Formato: [Imagem Frente, Imagem Costas]
        imageName: ["punk-frente-preto.jpeg", "punk-costa-preto.jpeg"], 
        colors: {
            "Preto": ["punk-frente-preto.jpeg", "punk-costa-preto.jpeg"],
            "Branco": ["punk-frente-branco.jpg", "punk-costa-branco.jpg"]
        }
    },
    "p2": {
        id: "p2",
        name: "Blusa Smile Art",
        price: 79.90,
        description: "Perfeita para dias mais frios, com estampa única em alta definição.",
        imageName: ["smile-frente-preto.jpg", "smile-costa-preto.jpg"],
        colors: {
            "Preto": ["smile-frente-preto.jpg", "smile-costa-preto.jpeg"],
            "Branco": ["smile-costa-branco.jpeg", "smile-costa-branco.jpeg"]
        }
    },
    "p3": {
        id: "p3",
        name: "Cropped Design Urbano",
        price: 69.90,
        description: "Um corte moderno para quem tem atitude. O cropped FR traz frescor e estilo.",
        imageName: ["blusa3.jpg", "blusa3.jpg"],
        colors: {
            "Única": ["blusa3.jpg", "blusa3.jpg"]
        }
    },
    "p4": {
        id: "p4",
        name: "Regata FR Basic",
        price: 59.90,
        description: "A peça essencial para o dia a dia. Leve, confortável e com o logo discreto.",
        imageName: ["blusa4.jpg", "blusa4.jpg"],
        colors: {
            "Preto": ["blusa4.jpg", "blusa4.jpg"],
            "Branco": ["blusa4-branca.jpg", "blusa4-branca.jpg"]
        }
    }
};

// Mapeamento de Cores para o Seletor Visual
const colorMap = {
    "Preto": "#1a1a1a",
    "Branco": "#ffffff",
    "Cinza": "#888888",
    "Azul": "#0000ff",
    "Única": "#7b2cbf"
};

/* =========================================
   SCRIPT PRINCIPAL
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

    // --- FUNÇÕES AUXILIARES ---
    
    function getImagePath(filename) {
        if (!filename) return '';
        const isSubFolder = window.location.pathname.includes('/html/');
        return isSubFolder ? `../img/${filename}` : `assent/img/${filename}`;
    }

    function getCart() {
        return JSON.parse(localStorage.getItem('frShopCart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('frShopCart', JSON.stringify(cart));
        updateCartIcon();
    }

    // --- NOTIFICAÇÃO TOAST ---
    
    if (!document.getElementById('toast')) {
        const toastDiv = document.createElement('div');
        toastDiv.id = 'toast';
        document.body.appendChild(toastDiv);
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = "show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    // --- INTERFACE E MENU ---

    document.body.classList.add('loaded');

    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            menuToggle.textContent = navbar.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Badge do Carrinho no Menu
    function updateCartIcon() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartLinks = document.querySelectorAll('nav a[href*="carrinho.html"]');
        
        cartLinks.forEach(link => {
            link.innerHTML = 'Carrinho 🛒';
            if (totalItems > 0) {
                const badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.textContent = totalItems;
                link.appendChild(badge);
            }
        });
    }

    // --- LÓGICA DO CARRINHO ---

    function addItemToCart(id, quantity, size, color, specificImage) {
        const productData = products[id];
        if (!productData) return;

        let cart = getCart();
        const existingItem = cart.find(item => item.id === id && item.size === size && item.color === color);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: id,
                name: productData.name,
                price: productData.price,
                quantity: quantity,
                imageName: specificImage || productData.imageName[0],
                size: size,
                color: color
            });
        }
        
        saveCart(cart);
        showToast(`Adicionado ao carrinho! (${color} - ${size})`);
    }

    function renderCart() {
        const cartTableBody = document.getElementById('cart-table-body');
        if (!cartTableBody) return;

        const cart = getCart();
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const cartTotalEl = document.getElementById('cart-total');
        const checkoutSummary = document.querySelector('.cart-summary');

        cartTableBody.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding: 40px;">
                        <p style="font-size: 1.2em; margin-bottom: 20px;">Seu carrinho está vazio.</p>
                        <a href="loja.html" class="cta-button" style="padding: 10px 20px; display:inline-block;">Voltar para a Loja</a>
                    </td>
                </tr>`;
            if (checkoutSummary) checkoutSummary.style.display = 'none';
        } else {
            if (checkoutSummary) checkoutSummary.style.display = 'block';
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                const imagePath = getImagePath(item.imageName);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="cart-product-cell">
                        <img src="${imagePath}" alt="${item.name}" class="cart-thumb-img" style="width:50px; height:50px; object-fit:cover; border-radius:4px; margin-right:10px;">
                        <div>
                            <span>${item.name}</span><br>
                            <small style="color:#666;">Cor: <strong>${item.color}</strong> | Tam: <strong>${item.size}</strong></small>
                        </div>
                    </td>
                    <td>R$ ${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" value="${item.quantity}" min="0" class="cart-quantity" data-index="${index}" style="width: 50px; padding: 5px;">
                        <br>
                        <a href="#" class="cart-remove" data-index="${index}" style="color: red; font-size: 0.8em; text-decoration: underline;">Remover</a>
                    </td>
                    <td>R$ ${itemTotal.toFixed(2)}</td>
                `;
                cartTableBody.appendChild(row);
            });
        }

        const frete = (subtotal > 0) ? 10.00 : 0;
        const total = subtotal + frete;

        if (cartSubtotalEl) cartSubtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        if (cartTotalEl) cartTotalEl.textContent = `R$ ${total.toFixed(2)}`;
        
        // Listeners para quantidade e remoção
        document.querySelectorAll('.cart-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = e.target.dataset.index;
                const qty = parseInt(e.target.value);
                let currentCart = getCart();
                if (qty > 0) { currentCart[idx].quantity = qty; } else { currentCart.splice(idx, 1); }
                saveCart(currentCart);
                renderCart();
            });
        });

        document.querySelectorAll('.cart-remove').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                let currentCart = getCart();
                currentCart.splice(e.target.dataset.index, 1);
                saveCart(currentCart);
                renderCart();
            });
        });
    }

    // --- RENDERIZAÇÃO DE PRODUTOS ---

    // Loja (Com suporte a animação Frente/Verso)
    function renderShop(searchTerm = '') {
        const grid = document.getElementById('product-grid-container');
        if (!grid) return;

        grid.innerHTML = '';
        
        for (const key in products) {
            const product = products[key];

            if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                continue;
            }

            const frontPath = getImagePath(product.imageName[0]);
            const backPath = getImagePath(product.imageName[1] || product.imageName[0]);

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="produto.html?id=${product.id}">
                    <div class="product-image-placeholder">
                        <img src="${frontPath}" alt="${product.name}" class="img-front">
                        <img src="${backPath}" alt="${product.name} - Costas" class="img-back">
                    </div>
                    <h3>${product.name}</h3>
                    <p class="price">R$ ${product.price.toFixed(2)}</p>
                </a>
            `;
            grid.appendChild(card);
        }
    }

    // Home (Destaques com suporte a animação Frente/Verso)
    function renderFeatured() {
        const grid = document.getElementById('featured-grid-container');
        if (!grid) return;

        grid.innerHTML = '';
        const featuredIds = ['p1', 'p2']; 

        featuredIds.forEach(id => {
            const product = products[id];
            if(!product) return;

            const frontPath = getImagePath(product.imageName[0]);
            const backPath = getImagePath(product.imageName[1] || product.imageName[0]);

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="assent/html/produto.html?id=${product.id}">
                    <div class="product-image-placeholder">
                        <img src="${frontPath}" alt="${product.name}" class="img-front">
                        <img src="${backPath}" alt="${product.name} - Costas" class="img-back">
                    </div>
                    <h3>${product.name}</h3>
                    <p class="price">R$ ${product.price.toFixed(2)}</p>
                </a>
            `;
            grid.appendChild(card);
        });
    }

    // Página de Detalhes do Produto (Com Seletor Visual)
    function renderProductPage() {
        const container = document.querySelector('.product-container');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (!productId || !products[productId]) return;

        const product = products[productId];
        
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `R$ ${product.price.toFixed(2)}`;
        document.getElementById('product-description').textContent = product.description;
        container.dataset.id = productId;

        const swatchContainer = document.getElementById('color-swatches');
        const updateMainImage = (imgArray) => {
            const mainImg = Array.isArray(imgArray) ? imgArray[0] : imgArray;
            const path = getImagePath(mainImg);
            const imgContainer = document.getElementById('product-image');
            imgContainer.innerHTML = `<img src="${path}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius:5px;">`;
        };

        if (swatchContainer && product.colors) {
            swatchContainer.innerHTML = '';
            const colors = Object.keys(product.colors);
            
            colors.forEach((colorName, index) => {
                const swatch = document.createElement('div');
                swatch.className = `swatch ${index === 0 ? 'active' : ''}`;
                swatch.style.backgroundColor = colorMap[colorName] || '#ccc';
                swatch.title = colorName;

                if (index === 0) {
                    updateMainImage(product.colors[colorName]);
                    container.dataset.selectedColor = colorName;
                    container.dataset.selectedImg = product.colors[colorName][0];
                }

                swatch.addEventListener('click', () => {
                    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                    swatch.classList.add('active');
                    container.dataset.selectedColor = colorName;
                    container.dataset.selectedImg = product.colors[colorName][0];
                    updateMainImage(product.colors[colorName]);
                });

                swatchContainer.appendChild(swatch);
            });
        }
    }

    // --- BUSCA ---

    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderShop(e.target.value);
        });
    }

    // --- FINALIZAÇÃO E BOTÕES ---

    function renderCheckoutSummary() {
        const container = document.getElementById('checkout-summary-items');
        if (!container) return;

        const cart = getCart();
        const subtotalEl = document.getElementById('checkout-subtotal');
        const freteEl = document.getElementById('checkout-frete');
        const totalEl = document.getElementById('checkout-total');

        container.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const div = document.createElement('div');
            div.className = 'summary-item';
            div.innerHTML = `
                <span class="item-name">${item.name}<br><small>(${item.color}, ${item.size}) x${item.quantity}</small></span>
                <span class="item-price">R$ ${itemTotal.toFixed(2)}</span>
            `;
            container.appendChild(div);
        });

        const total = subtotal + 10;
        if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        if (freteEl) freteEl.textContent = `R$ 10.00`;
        if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;
    }

    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const container = document.querySelector('.product-container');
            const id = container.dataset.id;
            const qty = parseInt(document.getElementById('quantidade').value);
            const size = document.getElementById('tamanho').value;
            const color = container.dataset.selectedColor;
            const img = container.dataset.selectedImg;

            if (id && qty > 0 && color) {
                addItemToCart(id, qty, size, color, img);
            } else {
                showToast("Selecione a cor e o tamanho!");
            }
        });
    }

    const finishBtn = document.getElementById('finalize-whatsapp-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            const endereco = document.getElementById('endereco').value;
            const bairro = document.getElementById('bairro').value;
            const cidade = document.getElementById('cidade').value;
            const pagamento = document.getElementById('pagamento').value;

            if (!nome || !telefone || !endereco || !bairro || !cidade) {
                showToast("Preencha todos os campos obrigatórios!"); return;
            }

            const cart = getCart();
            if (cart.length === 0) return;

            let subtotal = 0;
            let msg = "";
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                msg += `▪️ ${item.quantity}x ${item.name}\n   Cor: ${item.color} | Tam: ${item.size}\n`;
            });

            const total = subtotal + 10;
            const fullMsg = `*NOVO PEDIDO PELO SITE* 🛍️\n\n*Cliente:* ${nome}\n*Contato:* ${telefone}\n\n*📦 Produtos:*\n${msg}\n*💰 Total:* R$ ${total.toFixed(2)}\n\n*📍 Entrega:* ${endereco} - ${bairro}, ${cidade}\n*💳 Pagamento:* ${pagamento}`;

            window.open(`https://wa.me/558592093436?text=${encodeURIComponent(fullMsg)}`, '_blank');
        });
    }

    // INICIALIZAÇÃO
    renderShop();
    renderFeatured();
    renderProductPage();
    renderCart();
    renderCheckoutSummary();
    updateCartIcon();
});