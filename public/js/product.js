document.addEventListener('DOMContentLoaded', async () => {
    const productId = getProductIdFromUrl();

    if (!productId) {
        console.error('No se encontró el product_id en la URL');
        return;
    }

    try {
        const response = await fetch(`/products/${productId}`);
        if (!response.ok) {
            throw new Error('Error al obtener el producto');
        }
        const product = await response.json();
        renderProduct(product);
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.product-container').innerHTML = '<p>Error al cargar el producto</p>';
    }
});

function renderProduct(product) {
    document.querySelector('.marca').textContent = product.brand;
    document.querySelector('h1').textContent = product.name;
    document.querySelector('.sku').textContent = `SKU: ${product.sku}`;
    document.querySelector('h2').textContent = `$${product.price}`;
    document.querySelector('p').textContent = `Vendido por: ${product.vendor_name}`;
    document.querySelector('.descripcion p').textContent = product.description;
    document.querySelector('.product-img img').src = product.image_url;

    document.querySelector('#add-to-cart').addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === product.product_id);

        if (existingProduct) {
            existingProduct.amount += 1;
        } else {
            cart.push({ 
                id: product.product_id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || './img/naruto.jpg',
                amount: 1 
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.querySelector('#cart-count').textContent = cart.reduce((acc, item) => acc + item.amount, 0);
}

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('product_id');
}