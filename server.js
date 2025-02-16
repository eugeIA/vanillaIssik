import express from 'express';
import sqlite3 from 'sqlite3';
import serveStatic from 'serve-static';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database(':memory:');

// Promisify database methods
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database
const initDb = async () => {
  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      tip_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // Check if categories exist
  const categoryCount = await get('SELECT COUNT(*) as count FROM categories');
  if (categoryCount.count === 0) {
    const categories = [
      ['Cuisine', 'cuisine', 'Astuces culinaires et recettes pour devenir un véritable chef', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', 150],
      ['Technologie', 'technologie', 'Conseils tech et astuces pour maîtriser vos appareils', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', 200],
      ['Fitness', 'fitness', 'Exercices et conseils pour rester en forme', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 180],
      ['Jardinage', 'jardinage', 'Projets de jardinage pour tous les niveaux', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b', 120],
      ['Photographie', 'photographie', 'Techniques et astuces pour de meilleures photos', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d', 90],
      ['Bricolage', 'bricolage', 'Projets DIY et réparations maison', 'https://images.unsplash.com/photo-1513467655676-561b7d489a88', 110],
      ['Voyage', 'voyage', 'Conseils pour voyager malin', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828', 85],
      ['Finance', 'finance', 'Gestion d\'argent et investissements', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 95]
    ];

    for (const [name, slug, description, image_url, tip_count] of categories) {
      await run(
        'INSERT INTO categories (name, slug, description, image_url, tip_count) VALUES (?, ?, ?, ?, ?)',
        [name, slug, description, image_url, tip_count]
      );
    }
  }

  // Check if tips exist
  const tipCount = await get('SELECT COUNT(*) as count FROM tips');
  if (tipCount.count === 0) {
    const tips = [
      [
        'Recette de pâtes à la carbonara',
        `La véritable recette italienne des pâtes à la carbonara, simple et délicieuse.

## Ingrédients
- 400g de spaghetti
- 150g de guanciale
- 4 jaunes d'œufs
- 100g de pecorino romano
- Poivre noir

## Instructions
1. Faire cuire les pâtes dans l'eau bouillante salée
2. Faire revenir le guanciale
3. Mélanger les jaunes d'œufs avec le fromage
4. Assembler le tout en évitant que les œufs ne cuisent

Le secret réside dans la qualité des ingrédients et la technique d'assemblage !`,
        1,
        'https://images.unsplash.com/photo-1546549032-9571cd6b27df'
      ],
      [
        'Astuces pour des légumes croquants',
        `Comment garder vos légumes croquants lors de la cuisson.

## Les secrets d'une cuisson parfaite
1. Ne pas trop cuire les légumes
2. Utiliser un bain d'eau glacée
3. Respecter la saisonnalité

## Temps de cuisson recommandés
- Brocolis : 3-4 minutes
- Haricots verts : 4-5 minutes
- Carottes : 5-6 minutes

N'oubliez pas de tester la cuisson régulièrement !`,
        1,
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352'
      ],
      [
        'Optimiser son temps sur ordinateur',
        `Les meilleurs raccourcis clavier pour être plus productif.

## Raccourcis essentiels
- Ctrl + C : Copier
- Ctrl + V : Coller
- Ctrl + Z : Annuler
- Alt + Tab : Changer de fenêtre

## Astuces d'organisation
1. Utiliser plusieurs bureaux virtuels
2. Automatiser les tâches répétitives
3. Organiser ses dossiers efficacement`,
        2,
        'https://images.unsplash.com/photo-1483058712412-4245e9b90334'
      ],
      [
        'Programme de musculation débutant',
        `Un programme complet pour débuter la musculation.

## Programme hebdomadaire
### Jour 1 : Haut du corps
- Pompes : 3x10
- Tractions : 3x5
- Développé épaules : 3x12

### Jour 2 : Bas du corps
- Squats : 3x15
- Fentes : 3x12
- Mollets : 3x20

N'oubliez pas l'échauffement !`,
        3,
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd'
      ],
      [
        'Créer un potager urbain',
        `Guide étape par étape pour créer votre potager en ville.

## Matériel nécessaire
- Bacs ou jardinières
- Terreau de qualité
- Graines ou plants
- Outils de jardinage

## Étapes
1. Choisir l'emplacement idéal
2. Préparer les contenants
3. Planter selon la saison
4. Entretenir régulièrement

Le secret d'un beau potager est la régularité !`,
        4,
        'https://images.unsplash.com/photo-1513467655676-561b7d489a88'
      ],
      [
        'Maîtriser le mode manuel',
        `Comprendre les bases de la photographie manuelle.

## Les fondamentaux
- Ouverture (f-stop)
- Vitesse d'obturation
- ISO
- Balance des blancs

## Conseils pratiques
1. Commencer par l'ouverture
2. Ajuster la vitesse selon le sujet
3. Garder l'ISO au minimum possible

La pratique est la clé du succès !`,
        5,
        'https://images.unsplash.com/photo-1452587925148-ce544e77e70d'
      ],
      [
        'Réparer une chasse d\'eau',
        `Guide complet pour réparer une chasse d'eau qui fuit.

## Outils nécessaires
- Tournevis
- Clé à molette
- Joint neuf
- Mécanisme de chasse

## Étapes
1. Couper l'eau
2. Démonter le mécanisme
3. Identifier la fuite
4. Remplacer les pièces défectueuses

Prenez votre temps et travaillez méthodiquement.`,
        6,
        'https://images.unsplash.com/photo-1521207418485-99c705420785'
      ],
      [
        'Voyager à petit budget',
        `Astuces pour voyager moins cher sans compromis.

## Planification
- Réserver en basse saison
- Utiliser les comparateurs
- Être flexible sur les dates
- Privilégier les auberges

## Pendant le voyage
1. Cuisiner soi-même
2. Utiliser les transports locaux
3. Visiter les sites gratuits

L'aventure n'a pas de prix !`,
        7,
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828'
      ],
      [
        'Débuter en investissement',
        `Guide du débutant pour investir intelligemment.

## Bases essentielles
- Définir ses objectifs
- Diversifier ses placements
- Comprendre les risques
- Investir régulièrement

## Premiers pas
1. Créer un fonds d'urgence
2. Choisir ses supports
3. Commencer petit
4. Suivre ses investissements

La patience est la clé du succès financier.`,
        8,
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'
      ]
    ];

    for (const [title, content, category_id, image_url] of tips) {
      await run(
        'INSERT INTO tips (title, content, category_id, image_url) VALUES (?, ?, ?, ?)',
        [title, content, category_id, image_url]
      );
    }
  }
};

// Middleware
app.use(express.json());
app.use(serveStatic(__dirname));

// Routes API
app.get('/api/tips', async (req, res) => {
  try {
    const tips = await all(`
      SELECT tips.*, categories.name as category_name, categories.slug as category_slug
      FROM tips 
      JOIN categories ON tips.category_id = categories.id
      ORDER BY tips.created_at DESC
      LIMIT 6
    `);
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await all('SELECT * FROM categories ORDER BY tip_count DESC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tips/:id', async (req, res) => {
  try {
    const tip = await get(`
      SELECT tips.*, categories.name as category_name, categories.slug as category_slug
      FROM tips 
      JOIN categories ON tips.category_id = categories.id
      WHERE tips.id = ?
    `, [req.params.id]);
    
    if (!tip) {
      return res.status(404).json({ error: 'Conseil non trouvé' });
    }

    // Increment view count
    await run('UPDATE tips SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);

    // Get related tips from the same category
    const relatedTips = await all(`
      SELECT tips.*, categories.name as category_name, categories.slug as category_slug
      FROM tips 
      JOIN categories ON tips.category_id = categories.id
      WHERE tips.category_id = ? AND tips.id != ?
      ORDER BY RANDOM()
      LIMIT 2
    `, [tip.category_id, tip.id]);

    res.json({ tip, relatedTips });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories/:slug/tips', async (req, res) => {
  try {
    const category = await get('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
    
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    const tips = await all(`
      SELECT tips.*, categories.name as category_name, categories.slug as category_slug
      FROM tips 
      JOIN categories ON tips.category_id = categories.id
      WHERE categories.slug = ?
      ORDER BY tips.created_at DESC
    `, [req.params.slug]);

    res.json({ category, tips });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
const port = 3000;
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Erreur lors de l\'initialisation de la base de données:', err);
});