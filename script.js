// Sélection des éléments du DOM
const menuButton = document.querySelector('.menu-button');
const themeToggle = document.getElementById('theme-toggle');
const tipCards = document.querySelectorAll('.tip-card');
const categoryCards = document.querySelectorAll('.category-card');

// Gestion du menu mobile
menuButton.addEventListener('click', () => {
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.innerHTML = `
    <div class="mobile-menu-content">
      <div class="mobile-menu-header">
        <button class="close-menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <nav class="nav-links">
        <a href="#explorer">Explorer</a>
        <a href="#categories">Catégories</a>
      </nav>
      <div class="auth-links">
        <a href="/connexion" class="button">Connexion</a>
        <a href="/inscription" class="button button-primary">S'inscrire</a>
        <a href="/nouveau" class="button button-primary">Nouveau conseil</a>
      </div>
    </div>
  `;

  document.body.appendChild(mobileMenu);
  document.body.style.overflow = 'hidden';

  // Gestion de la fermeture du menu
  const closeButton = mobileMenu.querySelector('.close-menu');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(mobileMenu);
    document.body.style.overflow = '';
  });
});

// Gestion du thème
let isDark = localStorage.getItem('theme') === 'dark';
updateTheme();

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateTheme();
});

function updateTheme() {
  document.body.classList.toggle('dark-theme', isDark);
  document.querySelector('.sun-icon').style.display = isDark ? 'block' : 'none';
  document.querySelector('.moon-icon').style.display = isDark ? 'none' : 'block';
}

// Gestion des clics sur les conseils
tipCards.forEach(card => {
  card.addEventListener('click', () => {
    window.location.href = '/conseil.html';
  });
});

// Gestion des clics sur les catégories
categoryCards.forEach(card => {
  card.addEventListener('click', () => {
    window.location.href = '/categorie.html';
  });
});