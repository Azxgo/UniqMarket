document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.categories button');
    const filterButton = document.querySelector('#filter_button_brands');
    const filterList = document.querySelector('#filter_list_brands');
    const filterButtonPrices = document.querySelector('#filter_button_prices');
    const filterListPrices = document.querySelector('#filter_list_prices');
    const applyFiltersButton = document.querySelector('.apply-filters-button');
    const orderSelect = document.querySelector('#order-by');
    const limit = 8;
    let currentPage = 1;
    let selectedBrands = '';
    let minPrice = '';
    let maxPrice = '';
    let selectedOrder = '';
    let currentCategoryId = '';
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';  // Obtener el parámetro 'search' de la URL

    // Si hay búsqueda, cargamos los productos de búsqueda
    fetchProducts(currentPage, searchQuery);

    // Mostrar los filtros cuando se haga clic en "Marca"
    filterButton.addEventListener('click', () => {
        filterList.classList.toggle('active');
    });

    filterButtonPrices.addEventListener('click', () => {
        filterListPrices.classList.toggle('active');
    });

    // Evento para el cambio de orden
    orderSelect.addEventListener('change', (event) => {
        selectedOrder = event.target.value; // Leer el orden seleccionado
        fetchProducts(currentPage, searchQuery); // Llamar a fetchProducts con los filtros aplicados
    });

    // Evento para el botón de aplicar filtros
    applyFiltersButton.addEventListener('click', () => {
        selectedBrands = getSelectedBrand(); // Obtener marcas seleccionadas
        minPrice = document.getElementById('min-price').value || ''; // Obtener precio mínimo
        maxPrice = document.getElementById('max-price').value || ''; // Obtener precio máximo
        fetchProducts(currentPage, searchQuery); // Llamar a fetchProducts con los filtros aplicados
    });

    // Agregar evento de clic a cada botón de categoría
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const categoryId = button.getAttribute('data-category-id');
            currentCategoryId = categoryId; // Almacenar el category_id
            fetchProducts(currentPage, searchQuery); // Llamar a la función con el category_id y otros filtros activos
        });
    });

    // Obtiene las marcas seleccionadas
    function getSelectedBrand() {
        const checkedBrands = [...document.querySelectorAll('.filter_list input[type="checkbox"]:checked')];
        return checkedBrands.map(checkbox => checkbox.id.split('-')[1]).join(','); // Crear lista de marcas seleccionadas
    }

    // Función para cargar los productos desde la API
    function fetchProducts(page, search) {
        const order = selectedOrder;
        const brand = selectedBrands;
        const minPriceValue = minPrice;
        const maxPriceValue = maxPrice;

        let url = `http://localhost:3000/products?page=${page}&limit=${limit}&order=${order}`;
        
        if (search) {
            url += `&search=${search}`;  // Solo incluir el parámetro search si existe
        }
        
        if (brand) url += `&brand=${brand}`;
        if (minPriceValue) url += `&minPrice=${minPriceValue}`;
        if (maxPriceValue) url += `&maxPrice=${maxPriceValue}`;
        if (currentCategoryId) url += `&category_id=${currentCategoryId}`; // Añadir category_id si está presente

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const { products, totalPages, currentPage, brands } = data;

                // Renderiza los productos
                if (products.length === 0) {
                    document.querySelector('.articles').innerHTML = '<p>No se encontraron productos.</p>';
                } else {
                    const html = products.map(product => ` 
                        <a href="product.html?product_id=${product.product_id}">
                            <div class="prod-card">
                                <img src="${product.image_url || 'https://i.ibb.co/ZL0PmGn/Lampara-Proyector-De-Mesa-Estrellas-Ovni-Cgnione.png'}" alt="${product.name}">
                                <h5 id="black">${product.brand}</h5>
                                <h4>${product.name}</h4>
                                <span id="black">$${product.price}</span>
                                <h3>🌟🌟🌟</h3>  
                            </div>
                        </a>
                    `).join('');
                    document.querySelector('.articles').innerHTML = html;
                }

                // Renderiza la paginación
                renderPagination(currentPage, totalPages);

                // Si hay búsqueda, actualizamos el filtro de marcas
                if (search) {
                    updateBrandFilter(products);  // Solo actualizar el filtro de marcas si hay búsqueda
                } else {
                    renderBrandsFilter(brands);  // Si no hay búsqueda, mostramos todas las marcas
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Función para manejar la paginación
    function renderPagination(currentPage, totalPages) {
        const paginationContainer = document.querySelector('.pagination');
        const maxTabs = 3;
        let startPage = Math.max(1, currentPage - Math.floor(maxTabs / 2));
        let endPage = Math.min(totalPages, startPage + maxTabs - 1);

        if (endPage - startPage < maxTabs - 1) {
            startPage = Math.max(1, endPage - maxTabs + 1);
        }

        const paginationHtml = [];

        if (currentPage > 1) {
            paginationHtml.push(`<a href="#" data-page="${currentPage - 1}">&lt;</a>`);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml.push(`<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`);
        }

        if (currentPage < totalPages) {
            paginationHtml.push(`<a href="#" data-page="${currentPage + 1}">&gt;</a>`);
        }

        paginationContainer.innerHTML = paginationHtml.join('');
        document.querySelectorAll('.pagination a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                fetchProducts(page, searchQuery); // Fetch products with the correct page
            });
        });
    }

    // Función para actualizar el filtro de marcas según los productos mostrados
    function updateBrandFilter(products) {
        const brandSet = new Set(products.map(product => product.brand)); // Obtener marcas únicas de los productos
        const selectedBrandsSet = new Set(selectedBrands.split(','));

        filterList.innerHTML = Array.from(brandSet).map(brand => `
            <li class="filter_list_item">
                <input type="checkbox" id="brand-${brand}" ${selectedBrandsSet.has(brand) ? 'checked' : ''} />
                <label for="brand-${brand}">
                    ${brand}
                </label>
            </li>
        `).join('');
    }

    // Función para renderizar todas las marcas (cuando no hay búsqueda)
    function renderBrandsFilter(brands) {
        const selectedBrandsSet = new Set(selectedBrands.split(','));

        if (brands && brands.length > 0) {
            filterList.innerHTML = brands.map(brand => `
                <li class="filter_list_item">
                    <input type="checkbox" id="brand-${brand.brand}" ${selectedBrandsSet.has(brand.brand) ? 'checked' : ''} />
                    <label for="brand-${brand.brand}">
                        ${brand.brand} <span>(${brand.total})</span>
                    </label>
                </li>
            `).join('');
        }
    }
});

