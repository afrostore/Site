/* =========================================
   CATÁLOGO DE PRODUTOS
   ========================================= */
const products = {
    "p1": {
        id: "p1",
        name: "T-Shirt Estampa FR Original",
        price: 79.90,
        description: "Nossa camiseta clássica, feita com o melhor algodão e estampada com a arte exclusiva FR.",
        imageName: "punk.jpg" 
    },
    "p2": {
        id: "p2",
        name: "Blusa Manga Longa Art",
        price: 99.90,
        description: "Perfeita para dias mais frios, com estampa única em alta definição.",
        imageName: "smile.jpg"
    },
    "p3": {
        id: "p3",
        name: "Cropped Design Urbano",
        price: 69.90,
        description: "Um corte moderno para quem tem atitude. O cropped FR traz frescor e estilo.",
        imageName: "blusa3.jpg"
    },
    "p4": {
        id: "p4",
        name: "Regata FR Basic",
        price: 59.90,
        description: "A peça essencial para o dia a dia. Leve, confortável e com o logo discreto.",
        imageName: "blusa4.jpg"
    }
};

/* =========================================
   SCRIPT PRINCIPAL
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

    // --- FUNÇÃO AJUDANTE DE IMAGENS ---
    function getImagePath(filename) {
        if (!filename) return '';
        const isSubFolder = window.location.pathname.includes('/html/');
        return isSubFolder ? `../img/${filename}` : `assent/img/${filename}`;
    }

    // --- EFEITOS VISUAIS ---
    document.body.classList.add('loaded');

    // Menu Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            menuToggle.textContent = navbar.classList.contains('active') ? '✕' : '☰';
        });
    }

    // --- LÓGICA DO CARRINHO ---

    function getCart() {
        return JSON.parse(localStorage.getItem('frShopCart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('frShopCart', JSON.stringify(cart));
        updateCartIcon();
    }

    // 1. Adicione esta função nova em algum lugar do script
    function showToast(message) {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = message;
            toast.className = "show";
            setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        } else {
            // Fallback caso esqueça de por a div no HTML
            alert(message); 
        }
    }

    // CORREÇÃO: Agora aceita o parâmetro 'size'
    function addItemToCart(id, quantity, size) {
        const productData = products[id];
        
        if (!productData) {
            console.error("Erro: Produto não encontrado.");
            return;
        }

        let cart = getCart();
        
        // Verifica se já existe o mesmo produto COM O MESMO TAMANHO
        const existingItem = cart.find(item => item.id === id && item.size === size);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: id,
                name: productData.name,
                price: productData.price,
                quantity: quantity,
                imageName: productData.imageName,
                size: size // Salvando o tamanho!
            });
        }
        
        saveCart(cart);
        showToast(`Produto adicionado ao carrinho! (Tam: ${size})`);
    }

    function updateCartIcon() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartLinks = document.querySelectorAll('nav a[href*="carrinho.html"]');
        cartLinks.forEach(link => {
            link.textContent = totalItems > 0 ? `Carrinho (${totalItems}) 🛒` : 'Carrinho 🛒';
        });
    }

    // Renderiza Carrinho
    function renderCart() {
        const cartTableBody = document.getElementById('cart-table-body');
        if (!cartTableBody) return;

        const cart = getCart();
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const cartTotalEl = document.getElementById('cart-total');

        cartTableBody.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Seu carrinho está vazio.</td></tr>';
        } else {
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
                            <small style="color:#777;">Tamanho: <strong>${item.size}</strong></small>
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
        
        addQuantityListeners();
        addRemoveListeners();
    }

    function addQuantityListeners() {
        const quantityInputs = document.querySelectorAll('.cart-quantity');
        quantityInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.dataset.index; // Usa Index agora
                const newQuantity = parseInt(e.target.value);
                updateCartQuantity(index, newQuantity);
            });
        });
    }

    function addRemoveListeners() {
        const removeLinks = document.querySelectorAll('.cart-remove');
        removeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = e.target.dataset.index;
                removeCartItem(index);
            });
        });
    }

    function updateCartQuantity(index, newQuantity) {
        let cart = getCart();
        if (newQuantity > 0) {
            cart[index].quantity = newQuantity;
        } else {
            cart.splice(index, 1); // Remove se for 0
        }
        saveCart(cart);
        renderCart();
        renderCheckoutSummary();
    }

    function removeCartItem(index) {
        let cart = getCart();
        cart.splice(index, 1); // Remove pelo index do array
        saveCart(cart);
        renderCart();
        renderCheckoutSummary();
    }

    // --- RENDERIZAÇÃO DA LOJA ---
    function renderShop() {
        const grid = document.getElementById('product-grid-container');
        if (!grid) return;

        grid.innerHTML = '';
        for (const key in products) {
            const product = products[key];
            const imagePath = getImagePath(product.imageName);

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="produto.html?id=${product.id}">
                    <div class="product-image-placeholder" style="background: white;">
                        <img src="${imagePath}" alt="${product.name}" style="width:100%; height:200px; object-fit:cover;">
                    </div>
                </a>
                <a href="produto.html?id=${product.id}">
                    <h3>${product.name}</h3>
                </a>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
                <a href="produto.html?id=${product.id}" class="details-button">Ver Detalhes</a>
            `;
            grid.appendChild(card);
        }
    }

    // --- RENDERIZAÇÃO DA PÁGINA DE PRODUTO ---
    function renderProductPage() {
        const container = document.querySelector('.product-container');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId || !products[productId]) {
            container.innerHTML = "<h1>Produto não encontrado. Volte para a loja.</h1>";
            return;
        }

        const product = products[productId];
        const imagePath = getImagePath(product.imageName);

        const nameEl = document.getElementById('product-name');
        const priceEl = document.getElementById('product-price');
        const descEl = document.getElementById('product-description');
        const imgContainer = document.getElementById('product-image');

        if(nameEl) nameEl.textContent = product.name;
        if(priceEl) priceEl.textContent = `R$ ${product.price.toFixed(2)}`;
        if(descEl) descEl.textContent = product.description;
        
        if(imgContainer) {
            imgContainer.innerHTML = `<img src="${imagePath}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius:5px;">`;
            imgContainer.style.backgroundColor = 'transparent';
        }

        container.dataset.id = productId;
    }

    // Botão "Adicionar ao Carrinho"
    const addToCartButton = document.getElementById('add-to-cart-btn');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            const container = document.querySelector('.product-container');
            const id = container.dataset.id;
            const quantityInput = document.getElementById('quantidade');
            const quantity = parseInt(quantityInput.value);
            
            // CAPTURA O TAMANHO AQUI
            const sizeInput = document.getElementById('tamanho');
            const size = sizeInput.value;

            if (id && quantity > 0) {
                addItemToCart(id, quantity, size);
            } else {
                alert("Erro ao adicionar.");
            }
        });
    }

    // --- CHECKOUT ---
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
            // Mostra o tamanho no checkout também
            div.innerHTML = `
                <span class="item-name">${item.name} (Tam: ${item.size}) x${item.quantity}</span>
                <span class="item-price">R$ ${itemTotal.toFixed(2)}</span>
            `;
            container.appendChild(div);
        });

        const frete = (subtotal > 0) ? 10.00 : 0;
        const total = subtotal + frete;

        if(subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        if(freteEl) freteEl.textContent = `R$ ${frete.toFixed(2)}`;
        if(totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;
    }


    // --- FINALIZAR WHATSAPP ---
    const finishBtn = document.getElementById('finalize-whatsapp-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            const endereco = document.getElementById('endereco').value;
            const bairro = document.getElementById('bairro').value;
            const cidade = document.getElementById('cidade').value;
            const pagamento = document.getElementById('pagamento').value;
            const referencia = document.getElementById('referencia').value;

            if (!nome || !telefone || !endereco || !bairro || !cidade) {
                alert("Por favor, preencha todos os campos de endereço e contato.");
                return;
            }

            const cart = getCart();
            if (cart.length === 0) {
                alert("Seu carrinho está vazio!");
                return;
            }

            let subtotal = 0;
            let mensagemProdutos = "";

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                // INCLUI O TAMANHO NA MENSAGEM DO WHATSAPP
                mensagemProdutos += `▪️ ${item.quantity}x ${item.name} | Tam: *${item.size}* (R$ ${itemTotal.toFixed(2)})\n`;
            });

            const frete = (subtotal > 0) ? 10.00 : 0;
            const total = subtotal + frete;

            const mensagem = 
`*NOVO PEDIDO PELO SITE* 🛍️

*Cliente:* ${nome}
*Contato:* ${telefone}

*📦 Produtos:*
${mensagemProdutos}

*💰 Resumo:*
Subtotal: R$ ${subtotal.toFixed(2)}
Frete: R$ ${frete.toFixed(2)}
*TOTAL: R$ ${total.toFixed(2)}*

*📍 Endereço:*
${endereco} - ${bairro}, ${cidade}
${referencia ? `Ref: ${referencia}` : ''}

*💳 Pagamento:* ${pagamento}

------------------------------`;

            const numeroLoja = "558592093436"; 
            const url = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;
            window.open(url, '_blank');
        });
    }

    // INICIALIZAÇÃO
    renderShop();
    renderProductPage();
    renderCart();
    renderCheckoutSummary();
    updateCartIcon();
});