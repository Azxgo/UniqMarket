function toggleMenu() {
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('show');
}

const navButtons = document.querySelectorAll('.nav-btn');
const slider = document.querySelector('.slider');
let currentIndex = 0;

const images = document.querySelectorAll('.slider img');

// Función para actualizar el slider
function updateSlider() {
    const newTranslateX = -(currentIndex * 100);
    slider.style.transform = `translateX(${newTranslateX}%)`;

    // Actualiza los botones de navegación
    navButtons.forEach(button => button.classList.remove('active'));
    navButtons[currentIndex].classList.add('active');
}

// Asignamos la funcionalidad de los botones de navegación
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        currentIndex = parseInt(e.target.getAttribute('data-index'));
        updateSlider();
    });
});

// Inicializa el slider
updateSlider();

// Obtener todos los botones de acordeón
var botones = document.querySelectorAll(".filter_button");

// Añadir un evento de clic a cada botón
botones.forEach(function(boton) {
    boton.addEventListener("click", function() {
        // Alternar la clase 'active' en la lista correspondiente
        var lista = this.nextElementSibling;  // Obtener el <ul> que está después del botón
        
        // Alternar la visibilidad de la lista
        lista.classList.toggle("active");
    });
});

