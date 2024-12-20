document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productsContainer = document.querySelector('#products-container');
    const unitsElement = document.querySelector('#units');
    const priceElement = document.querySelector('#price');
    const buyButton = document.querySelector('#buy');
    const restartButton = document.querySelector('#restart');

    // Función para renderizar el carrito
    const renderCart = () => {
        productsContainer.innerHTML = '';  // Limpiar los productos previos
        let totalUnits = 0;
        let totalPrice = 0;
    
        // Recorrer todos los productos del carrito
        cart.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('cart-prod-container');  // Contenedor con margen
            productDiv.innerHTML = `
                <div class="cart-prod" data-id="${product.id}">
                    <div class="cart-prod-details">
                        <img src="${product.image_url || './img/default.jpg'}" alt="${product.name}" class="cart-prod-img">
                        <div class="cart-prod-info">
                            <h3>${product.name}</h3>
                            <p class="price">Precio: $${product.price}</p>
                            <p class="subtotal">Subtotal: $${(product.price * product.amount).toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="cart-prod-quantity">
                        <span class="quantity">${product.amount}</span>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productDiv);
    
            totalUnits += product.amount;
            totalPrice += product.price * product.amount;
        });
    
        // Actualizar el total de unidades y el precio total
        unitsElement.textContent = totalUnits;
        priceElement.textContent = `$${totalPrice.toFixed(2)}`;
    };

    // Función de compra
    buyButton.addEventListener('click', async () => {
        if (cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }
    
        try {
            console.log('Enviando carrito al servidor:', cart); // Debugging
    
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart }), // Enviar el carrito directamente
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error en la compra: ${errorData.message || 'Error desconocido.'}`);
                return;
            }
    
            const data = await response.json();
            alert(data.message || 'Compra realizada con éxito.');
    
            // Vaciar el carrito después de una compra exitosa
            cart.length = 0;
            localStorage.removeItem('cart');
            renderCart();
            updateCartCount();
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            alert('Hubo un error al procesar tu compra. Por favor, intenta nuevamente.');
        }
    });

    // Función para reiniciar el carrito
    restartButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas reiniciar el carrito?')) {
            cart.length = 0;  // Limpiar el carrito
            localStorage.removeItem('cart');
            renderCart();
            updateCartCount();  // Actualizar el contador
        }
    });

    // Renderizar el carrito al cargar la página
    renderCart();
});