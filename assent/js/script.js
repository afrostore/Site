/* =========================================
   CONFIGURAÇÕES GERAIS E SEGURANÇA
   ========================================= */
const CONFIG = {
    FRETE_GRATIS_MIN: 200.00, // Valor para ganhar frete grátis
    VALOR_FRETE: 10.00,       // Valor do frete fixo
    PASTA_RECURSOS: 'assent'  // Nome da sua pasta (mantenha 'assent' conforme seu projeto)
};

let products = {}; // Armazena os produtos carregados

// Mapeamento de Cores para o Seletor Visual
const colorMap = {
    "Preto": "#1a1a1a",
    "Branco": "#ffffff",
    "Cinza": "#888888",
    "Azul": "#0000ff",
    "Única": "#7b2cbf"
};

/* =========================================
   INICIALIZAÇÃO DO SITE
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

    // 1. CARREGAMENTO DOS DADOS (COM PROTEÇÃO)
    async function loadProducts() {
        try {
            // Descobre se está na raiz ou numa subpasta para achar o JSON
            const isSubFolder = window.location.pathname.includes('/html/');
            const jsonPath = isSubFolder ? '../json/produtos.json' : `${CONFIG.PASTA_RECURSOS}/json/produtos.json`;

            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`Erro ao buscar produtos: ${response.status}`);
            
            const data = await response.json();

            // Converte Array para Objeto (Facilita busca por ID)
            products = data.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {});

            initApp(); // Inicia o site apenas após carregar os dados

        } catch (error) {
            console.error("Erro Crítico:", error);
            // Mostra aviso discreto no rodapé em caso de erro, mas não trava o site
            const footer = document.querySelector('footer');
            if(footer) footer.insertAdjacentHTML('beforebegin', '<p style="color:red; text-align:center;">Erro ao carregar catálogo.</p>');
        } finally {
            // [SEGURANÇA] Garante que o loading suma e o site apareça sempre
            document.body.classList.add('loaded');
        }
    }

    // 2. FUNÇÃO MESTRA (Inicia tudo)
    function initApp() {
        renderShop();
        renderFeatured();
        renderProductPage();
        renderCart(); 
        renderCheckoutSummary();
        updateCartIcon();
        updatePromoBar();
    }

    // --- EFEITOS VISUAIS (Menu e Scroll) ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            menuToggle.textContent = navbar.classList.contains('active') ? '✕' : '☰';
        });
    }

    /* =========================================
       LÓGICA DE CARRINHO E CÁLCULOS
       ========================================= */
    
    // Ajuda a achar imagens dependendo de onde o usuário está
    function getImagePath(filename) {
        if (!filename) return '';
        const isSubFolder = window.location.pathname.includes('/html/');
        return isSubFolder ? `../img/${filename}` : `${CONFIG.PASTA_RECURSOS}/img/${filename}`;
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('frShopCart')) || [];
        } catch {
            return []; // Recuperação de erro se o localStorage corromper
        }
    }

    function saveCart(cart) {
        localStorage.setItem('frShopCart', JSON.stringify(cart));
        updateCartIcon();
        updatePromoBar();
    }

    // Adicionar item com Validação
    function addItemToCart(id, quantity, size, color, specificImage) {
        const productData = products[id];
        if (!productData) return;

        let cart = getCart();
        // Verifica se já existe item igual (mesmo id, tamanho e cor)
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
        showToast(`Adicionado: ${productData.name} (${size})`);
    }

    // Renderiza a Tabela do Carrinho
    function renderCart() {
        const cartTableBody = document.getElementById('cart-table-body');
        if (!cartTableBody) return;

        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartTableBody.innerHTML = '';

        if (cart.length === 0) {
            cartTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px;">Seu carrinho está vazio.</td></tr>`;
            const summary = document.querySelector('.cart-summary');
            if (summary) summary.style.display = 'none';
        } else {
            const summary = document.querySelector('.cart-summary');
            if (summary) summary.style.display = 'block';

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div style="display:flex; align-items:center;">
                            <img src="${getImagePath(item.imageName)}" style="width:40px; height:40px; object-fit:cover; margin-right:10px; border-radius:4px;">
                            <div>${item.name}<br><small>${item.color} | ${item.size}</small></div>
                        </div>
                    </td>
                    <td>R$ ${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" value="${item.quantity}" min="1" class="cart-quantity" data-index="${index}" style="width: 50px; padding: 5px;">
                        <div class="cart-remove" data-index="${index}" style="color:red; cursor:pointer; font-size:0.8em; margin-top:5px;">Remover</div>
                    </td>
                    <td>R$ ${itemTotal.toFixed(2)}</td>
                `;
                cartTableBody.appendChild(row);
            });
        }

        // Cálculos Finais de Frete
        const frete = (subtotal >= CONFIG.FRETE_GRATIS_MIN || subtotal === 0) ? 0 : CONFIG.VALOR_FRETE;
        const total = subtotal + frete;

        // Atualiza UI
        if(document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        if(document.getElementById('cart-total')) document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2)}`;
        
        const freteEl = document.getElementById('cart-frete');
        if (freteEl) {
            freteEl.textContent = frete === 0 ? "GRÁTIS" : `R$ ${frete.toFixed(2)}`;
            freteEl.style.color = frete === 0 ? "#25D366" : "inherit";
            freteEl.style.fontWeight = frete === 0 ? "bold" : "normal";
        }

        // Listeners (Quantidade e Remover)
        document.querySelectorAll('.cart-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = e.target.dataset.index;
                const qty = parseInt(e.target.value);
                let c = getCart();
                if (qty > 0) c[idx].quantity = qty; else c.splice(idx, 1);
                saveCart(c); renderCart();
            });
        });

        document.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let c = getCart();
                c.splice(e.target.dataset.index, 1);
                saveCart(c); renderCart();
            });
        });
    }

    /* =========================================
       PÁGINA DO PRODUTO (COM FUNCIONALIDADE GIRAR)
       ========================================= */
    function renderProductPage() {
        const container = document.querySelector('.product-container');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products[productId];

        if (!product) return; // Se produto não existir, para aqui

        // Preenche textos
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `R$ ${product.price.toFixed(2)}`;
        document.getElementById('product-description').textContent = product.description;
        container.dataset.id = productId;

        // Lógica de Cores e Imagens
        const firstColor = Object.keys(product.colors)[0];
        let currentImages = product.colors[firstColor]; // Array [Frente, Costas]
        let isShowingBack = false; // Estado: está mostrando as costas?

        // Define estado inicial
        container.dataset.selectedColor = firstColor;
        container.dataset.selectedImg = currentImages[0];

        // --- FUNÇÃO DE ATUALIZAÇÃO DA IMAGEM PRINCIPAL ---
        const updateMainVisual = () => {
            const imgSrc = isShowingBack && currentImages[1] ? currentImages[1] : currentImages[0];
            const path = getImagePath(imgSrc);
            const imgContainer = document.getElementById('product-image');
            
            imgContainer.innerHTML = ''; // Limpa container

            // Cria imagem
            const imgElement = document.createElement('img');
            imgElement.src = path;
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.objectFit = 'cover';
            imgElement.style.borderRadius = '8px';
            imgContainer.appendChild(imgElement);

            // [NOVIDADE] Cria botão de girar se houver costas
            if (currentImages.length > 1) {
                const flipBtn = document.createElement('button');
                flipBtn.className = 'flip-btn-floating'; // Classe definida no CSS novo
                flipBtn.innerHTML = '↻';
                flipBtn.title = "Ver Costas";
                
                // Estilo inline para garantir funcionamento imediato
                flipBtn.style.cssText = "position:absolute; top:15px; right:15px; width:40px; height:40px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); font-size:20px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2); transition:transform 0.3s;";
                
                flipBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    isShowingBack = !isShowingBack; // Inverte
                    updateMainVisual(); // Redesenha
                });

                // Se estiver vendo as costas, gira o ícone
                if (isShowingBack) flipBtn.style.transform = "rotate(180deg)";
                
                imgContainer.appendChild(flipBtn);
            }
        };

        updateMainVisual(); // Chama a primeira vez

        // Renderiza bolinhas de cores
        const swatchContainer = document.getElementById('color-swatches');
        if (swatchContainer) {
            swatchContainer.innerHTML = '';
            Object.keys(product.colors).forEach((color, index) => {
                const swatch = document.createElement('div');
                swatch.className = `swatch ${index === 0 ? 'active' : ''}`;
                swatch.style.backgroundColor = colorMap[color] || '#ccc';
                
                swatch.addEventListener('click', () => {
                    // Reseta seleção visual
                    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                    swatch.classList.add('active');
                    
                    // Atualiza dados
                    container.dataset.selectedColor = color;
                    currentImages = product.colors[color];
                    container.dataset.selectedImg = currentImages[0];
                    isShowingBack = false; // Volta para frente ao mudar cor
                    
                    updateMainVisual();
                });
                swatchContainer.appendChild(swatch);
            });
        }

        // Botão Adicionar ao Carrinho (Com Segurança)
        const addBtn = document.getElementById('add-to-cart-btn');
        if (addBtn) {
            const newBtn = addBtn.cloneNode(true); // Remove listeners antigos
            addBtn.parentNode.replaceChild(newBtn, addBtn);
            
            newBtn.addEventListener('click', () => {
                const qty = parseInt(document.getElementById('quantidade').value);
                const size = document.getElementById('tamanho').value;
                const color = container.dataset.selectedColor;
                const img = container.dataset.selectedImg;

                if (color && img) {
                    addItemToCart(productId, qty, size, color, img);
                } else {
                    showToast("Por favor, selecione uma cor!");
                }
            });
        }
    }

    /* =========================================
       LOJA E GRID (COM FLIP NO CARD)
       ========================================= */
    function renderShop(searchTerm = '') {
        const grid = document.getElementById('product-grid-container');
        if (grid) renderGrid(grid, Object.keys(products), searchTerm);
        
        const featuredGrid = document.getElementById('featured-grid-container');
        if (featuredGrid) renderGrid(featuredGrid, ['p1', 'p2'], searchTerm);
    }

    function renderFeatured() { /* Integrado no renderShop acima */ }

    function renderGrid(container, items, filter) {
        container.innerHTML = '';
        items.forEach(id => {
            const product = products[id];
            if (!product) return;
            if (filter && !product.name.toLowerCase().includes(filter.toLowerCase())) return;

            const linkPath = window.location.pathname.includes('/html/') ? `produto.html?id=${id}` : `${CONFIG.PASTA_RECURSOS}/html/produto.html?id=${id}`;
            const frontImg = getImagePath(product.imageName[0]);
            const backImg = getImagePath(product.imageName[1] || product.imageName[0]);

            const card = document.createElement('div');
            card.className = 'product-card';
            
            // O botão 'mobile-flip-btn' permite girar o card na própria lista
            card.innerHTML = `
                <a href="${linkPath}">
                    <div class="product-image-placeholder">
                        <img src="${frontImg}" class="img-front">
                        <img src="${backImg}" class="img-back">
                        <div class="mobile-flip-btn" 
                             style="position:absolute; top:10px; right:10px; z-index:10; background:rgba(255,255,255,0.9); width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer;"
                             onclick="event.preventDefault(); this.closest('.product-card').classList.toggle('flipped');">
                             ↻
                        </div>
                    </div>
                    <h3>${product.name}</h3>
                    <p class="price">R$ ${product.price.toFixed(2)}</p>
                </a>`;
            container.appendChild(card);
        });
    }

    // Busca
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderShop(e.target.value));
    }

    /* =========================================
       CHECKOUT, WHATSAPP E UTILITÁRIOS
       ========================================= */
    
    function renderCheckoutSummary() {
        const container = document.getElementById('checkout-summary-items');
        if (!container) return;

        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        container.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'summary-row';
            div.innerHTML = `<span>${item.quantity}x ${item.name} <small>(${item.color})</small></span> <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>`;
            container.appendChild(div);
        });

        const frete = (subtotal >= CONFIG.FRETE_GRATIS_MIN) ? 0 : CONFIG.VALOR_FRETE;
        
        if(document.getElementById('checkout-subtotal')) document.getElementById('checkout-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
        if(document.getElementById('checkout-total')) document.getElementById('checkout-total').textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
        
        const freteEl = document.getElementById('checkout-frete');
        if (freteEl) {
            freteEl.textContent = frete === 0 ? "GRÁTIS" : `R$ ${frete.toFixed(2)}`;
            freteEl.style.color = frete === 0 ? "#25D366" : "inherit";
        }
    }

    // Botão Finalizar no WhatsApp
    const finishBtn = document.getElementById('finalize-whatsapp-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            // Coleta dados
            const dados = {
                nome: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                endereco: document.getElementById('endereco').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                pagamento: document.getElementById('pagamento').value
            };

            // Validação Simples
            if (Object.values(dados).some(val => !val)) {
                showToast("Preencha todos os campos!"); return;
            }

            const cart = getCart();
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const frete = (subtotal >= CONFIG.FRETE_GRATIS_MIN) ? 0 : CONFIG.VALOR_FRETE;
            
            let msg = `*NOVO PEDIDO - SITE AFRO* 🛍️\n\n👤 *Cliente:* ${dados.nome}\n📱 *Contato:* ${dados.telefone}\n\n🛒 *Pedido:*\n`;
            cart.forEach(i => msg += `▪ ${i.quantity}x ${i.name} (${i.color} | ${i.size})\n`);
            
            msg += `\n📦 *Subtotal:* R$ ${subtotal.toFixed(2)}`;
            msg += `\n🚚 *Frete:* ${frete === 0 ? 'GRÁTIS' : 'R$ '+frete.toFixed(2)}`;
            msg += `\n💰 *TOTAL:* R$ ${(subtotal + frete).toFixed(2)}`;
            msg += `\n\n📍 *Entrega:* ${dados.endereco} - ${dados.bairro}, ${dados.cidade}`;
            msg += `\n💳 *Pagamento:* ${dados.pagamento}`;

            window.open(`https://wa.me/558592093436?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }

    // Atualiza Barra de Promoção (Frete Grátis)
    function updatePromoBar() {
        const bar = document.getElementById('promo-bar');
        if (!bar) return;
        
        const subtotal = getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (subtotal === 0) {
            bar.innerHTML = `FRETE GRÁTIS acima de R$ ${CONFIG.FRETE_GRATIS_MIN.toFixed(2)}! 🚚`;
            bar.style.backgroundColor = "var(--cor-acento)";
        } else if (subtotal < CONFIG.FRETE_GRATIS_MIN) {
            bar.innerHTML = `Faltam <strong>R$ ${(CONFIG.FRETE_GRATIS_MIN - subtotal).toFixed(2)}</strong> para Frete Grátis!`;
            bar.style.backgroundColor = "#d32f2f";
        } else {
            bar.innerHTML = "🎉 FRETE GRÁTIS CONQUISTADO! 🎉";
            bar.style.backgroundColor = "#25D366";
        }
    }

    // Notificação Toast
    function showToast(msg) {
        const toast = document.getElementById("toast") || document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
        toast.textContent = msg;
        toast.className = "show";
        setTimeout(() => toast.className = "", 3000);
    }

    function updateCartIcon() {
        const count = getCart().reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('nav a[href*="carrinho.html"]').forEach(link => {
            link.innerHTML = `Carrinho 🛒 ${count > 0 ? `<span class="cart-badge">${count}</span>` : ''}`;
        });
    }

    // Inicializa carregamento
    loadProducts();
});