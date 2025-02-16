// Sélection des éléments du DOM
const menuButton = document.querySelector('.menu-button');
const themeToggle = document.getElementById('theme-toggle');

// Gestion du menu mobile
menuButton.addEventListener('click', () => {
  const existingMenu = document.querySelector('.mobile-menu');
  if (existingMenu) {
    document.body.removeChild(existingMenu);
    document.body.style.overflow = '';
    return;
  }

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
      <div class="social-links">
        <a href="https://twitter.com/conseilsastuces" class="social-link" title="Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
        </a>
        <a href="https://facebook.com/conseilsastuces" class="social-link" title="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        </a>
        <a href="https://instagram.com/conseilsastuces" class="social-link" title="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
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

  // Fermer le menu lors du clic sur un lien
  const links = mobileMenu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      document.body.removeChild(mobileMenu);
      document.body.style.overflow = '';
    });
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

// Fonction pour formater la date relative
function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Il y a 1 jour";
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  
  const diffMonths = Math.ceil(diffDays / 30);
  if (diffMonths === 1) return "Il y a 1 mois";
  if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
  
  const diffYears = Math.ceil(diffMonths / 12);
  if (diffYears === 1) return "Il y a 1 an";
  return `Il y a ${diffYears} ans`;
}

// Gestion des paramètres d'URL pour les pages de détail
if (window.location.pathname === '/conseil.html' || window.location.pathname === '/categorie.html') {
  const params = new URLSearchParams(window.location.search);
  const tipId = params.get('id');
  const categorySlug = params.get('slug');

  if (window.location.pathname === '/conseil.html' && tipId) {
    // Charger les détails du conseil depuis l'API
    fetch(`/api/tips/${tipId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Conseil non trouvé');
        }
        return response.json();
      })
      .then(data => {
        const { tip, relatedTips } = data;
        
        // Mettre à jour les détails du conseil
        document.querySelector('.tip-detail-image img').src = tip.image_url;
        document.querySelector('.tip-category').textContent = tip.category_name;
        document.querySelector('.tip-date').textContent = formatRelativeDate(tip.created_at);
        document.querySelector('.tip-detail-header h1').textContent = tip.title;
        document.querySelector('.tip-detail-content').innerHTML = `
          <div class="markdown-content">
            ${tip.content}
          </div>
        `;

        // Mettre à jour les conseils similaires
        const relatedTipsContainer = document.querySelector('.tips-grid');
        relatedTipsContainer.innerHTML = relatedTips.map(relatedTip => `
          <a href="/conseil.html?id=${relatedTip.id}" class="tip-card">
            <img src="${relatedTip.image_url}" alt="${relatedTip.title}" class="tip-image">
            <div class="tip-content">
              <h3>${relatedTip.title}</h3>
              <p>${relatedTip.content.split('\n')[0]}</p>
              <div class="tip-meta">
                <span class="tip-category">${relatedTip.category_name}</span>
                <span class="tip-date">${formatRelativeDate(relatedTip.created_at)}</span>
              </div>
            </div>
          </a>
        `).join('');
      })
      .catch(error => {
        console.error('Erreur lors du chargement du conseil:', error);
        document.querySelector('.tip-detail-content').innerHTML = `
          <div class="error-message">
            <h2>Conseil non trouvé</h2>
            <p>Désolé, le conseil que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <a href="/" class="button button-primary">Retour à l'accueil</a>
          </div>
        `;
      });
  } else if (window.location.pathname === '/categorie.html' && categorySlug) {
    // Charger les détails de la catégorie depuis l'API
    fetch(`/api/categories/${categorySlug}/tips`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Catégorie non trouvée');
        }
        return response.json();
      })
      .then(data => {
        const { category, tips } = data;
        
        // Mettre à jour les détails de la catégorie
        document.querySelector('.category-icon svg').outerHTML = getCategoryIcon(category.slug);
        document.querySelector('.category-header h1').textContent = category.name;
        document.querySelector('.category-header p').textContent = category.description;

        // Mettre à jour les statistiques
        const tipCount = tips.length;
        const viewCount = tips.reduce((sum, tip) => sum + (tip.view_count || 0), 0);
        const activeUsers = new Set(tips.map(tip => tip.user_id)).size;

        document.querySelector('.category-stats').innerHTML = `
          <div class="stat-item">
            <h3>${tipCount}+</h3>
            <p>Conseils</p>
          </div>
          <div class="stat-item">
            <h3>${viewCount}+</h3>
            <p>Vues</p>
          </div>
          <div class="stat-item">
            <h3>${activeUsers}+</h3>
            <p>Membres actifs</p>
          </div>
        `;

        // Mettre à jour la liste des conseils
        const tipsContainer = document.querySelector('.tips-grid');
        if (tips.length > 0) {
          tipsContainer.innerHTML = tips.map(tip => `
            <a href="/conseil.html?id=${tip.id}" class="tip-card">
              <img src="${tip.image_url}" alt="${tip.title}" class="tip-image">
              <div class="tip-content">
                <h3>${tip.title}</h3>
                <p>${tip.content.split('\n')[0]}</p>
                <div class="tip-meta">
                  <span class="tip-category">${category.name}</span>
                  <span class="tip-date">${formatRelativeDate(tip.created_at)}</span>
                </div>
              </div>
            </a>
          `).join('');
        } else {
          tipsContainer.innerHTML = `
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <h3>Aucun conseil trouvé</h3>
              <p>Soyez le premier à partager un conseil dans cette catégorie !</p>
              <a href="/nouveau" class="button button-primary">Créer un conseil</a>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement de la catégorie:', error);
        document.querySelector('.category-page').innerHTML = `
          <div class="error-message">
            <h2>Catégorie non trouvée</h2>
            <p>Désolé, la catégorie que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <a href="/" class="button button-primary">Retour à l'accueil</a>
          </div>
        `;
      });
  }
}

// Fonction pour obtenir l'icône de la catégorie
function getCategoryIcon(slug) {
  const icons = {
    'cuisine': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M12 22v-4"></path></svg>',
    'technologie': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
    'fitness': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2"></path><path d="M4 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4"></path><path d="M14 10h-4"></path><path d="M16 2h-8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path></svg>',
    'jardinage': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M2 12h3"></path><path d="M19 12h3"></path><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="m4.929 4.929 2.122 2.122"></path><path d="m16.95 16.95 2.122 2.122"></path><path d="m4.929 19.071 2.122-2.122"></path><path d="m16.95 7.05 2.122-2.122"></path></svg>',
    'default': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
  };
  
  return icons[slug] || icons.default;
}