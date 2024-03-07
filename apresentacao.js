document.addEventListener('DOMContentLoaded', function () {
    var menuHamburguer = document.getElementById('menu-hamburguer');
    var menu = document.querySelector('.menu-lista');

    menuHamburguer.addEventListener('click', function () {
        menu.classList.toggle('visivel');
    });
});