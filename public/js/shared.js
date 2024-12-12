document.addEventListener('DOMContentLoaded', () => {
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalCount = cart.reduce((sum, product) => sum + product.amount, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalCount;
        }
    };

    // Actualizar el contador del carrito al cargar la página
    updateCartCount();
    
    // Exportar la función si se necesita en otros scripts
    window.updateCartCount = updateCartCount;
});