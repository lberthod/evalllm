// server.js

// Importation des modules nécessaires avec require()
const fs = require("fs");
const OpenAI = require("openai");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, update } = require("firebase/database");

// Configuration Firebase (remplacez par vos propres informations)
const firebaseConfig = {
  apiKey: process.env.FIR_KEY,
  authDomain: "vrgptt.firebaseapp.com",
  databaseURL: "https://vrgptt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vrgptt",
  storageBucket: "vrgptt.appspot.com",
  messagingSenderId: "747866018411",
  appId: "1:747866018411:web:b8bf59759eb9abdd24572e",
  measurementId: "G-LMC0P3ZQQ0",
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialisation de l'API OpenAI avec votre clé API
const openai = new OpenAI({
  apiKey:
});

// Charger le fichier JSON contenant les catégories
let categoriesData = JSON.parse(fs.readFileSync("./category.json", "utf8"));

// Fonction pour sauvegarder le JSON modifié
// Fonction pour sauvegarder les données dans le fichier JSON avec l'encodage UTF-8 pour supporter les accents français
function saveCategoriesToFile() {
    try {
        fs.writeFileSync('./category.json', JSON.stringify(categoriesData, null, 2), 'utf8'); // Explicitement utiliser l'encodage 'utf8'
        console.log('Le fichier JSON a été mis à jour en UTF-8.');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du fichier JSON:', error);
    }
}


// Fonction pour extraire toutes les catégories principales, sous-catégories et précises catégories
function fetchAllCategories() {
  let mainCategories = [];
  let subCategoriesByMain = {};
  let preciseCategoriesBySub = {};

  categoriesData.categories.forEach((mainCategory) => {
    mainCategories.push(mainCategory.main_category);

    mainCategory.sub_categories.forEach((subCategory) => {
      if (!subCategoriesByMain[mainCategory.main_category]) {
        subCategoriesByMain[mainCategory.main_category] = [];
      }
      subCategoriesByMain[mainCategory.main_category].push(subCategory.name);

      if (!preciseCategoriesBySub[subCategory.name]) {
        preciseCategoriesBySub[subCategory.name] = [];
      }
      preciseCategoriesBySub[subCategory.name].push(
        ...subCategory.precise_categories
      );
    });
  });

  return { mainCategories, subCategoriesByMain, preciseCategoriesBySub };
}

// Fonction pour vérifier l'unicité d'une catégorie principale avant de la créer
async function proposeNewMainCategory(existingCategories) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant intelligent qui génère des catégories uniques. Assure-toi que les nouvelles catégories ne sont pas similaires aux existantes. Utilise uniquement des mots-clés. Pas de phrases complètes, pas de nombres ni de symboles.",
      },
      {
        role: "user",
        content: `Voici les catégories existantes : ${existingCategories.join(
          ", "
        )}. Propose des catégories totalement nouvelles et pertinentes en utilisant uniquement des mots-clés.`,
      },
    ],
    max_tokens: 250,
    temperature: 0.8,
  });

  return completion.choices[0].message.content
    .trim()
    .split("\n")
    .map((cat) => cat.trim());
}

// Fonction pour générer de nouvelles sous-catégories pour une catégorie principale donnée
async function generateNewSubCategory(mainCategory, existingSubCategories) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant qui génère des sous-catégories pour une catégorie existante. Ne donne que des mots-clés. Pas de phrases complètes, pas de nombres ni de symboles.",
      },
      {
        role: "user",
        content: `Voici les sous-catégories existantes pour la catégorie "${mainCategory}": ${existingSubCategories.join(
          ", "
        )}. Propose de nouvelles sous-catégories en utilisant uniquement des mots-clés.`,
      },
    ],
    max_tokens: 250,
    temperature: 0.8,
  });

  return completion.choices[0].message.content
    .trim()
    .split("\n")
    .map((sub) => sub.trim());
}


// Fonction pour vérifier et corriger l'orthographe d'une sous-catégorie avec GPT-4o-mini
async function checkAndCorrectSubCategorySpelling(subCategory) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant qui vérifie et corrige l'orthographe des sous-catégories. Réponds en donnant la version correcte sans phrase supplémentaire.",
        },
        {
          role: "user",
          content: `Vérifie et corrige l'orthographe de cette sous-catégorie: "${subCategory}". Si elle est correcte, réponds-la simplement.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.2, // Lower temperature for more consistent results
    });

    const correctedSubCategory = completion.choices[0].message.content.trim();
    return correctedSubCategory;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'orthographe:", error);
    return subCategory; // Return the original subcategory if there's an error
  }
}

// Fonction pour vérifier et corriger l'orthographe de toutes les sous-catégories et éditer directement le fichier JSON
async function checkAllSubCategories() {
  console.log(
    "Début de la vérification des orthographes des sous-catégories..."
  );

  // Itérer sur toutes les catégories principales
  for (let i = 0; i < categoriesData.categories.length; i++) {
    let mainCategory = categoriesData.categories[i].main_category;
    let subCategories = categoriesData.categories[i].sub_categories;

    // Itérer sur toutes les sous-catégories de cette catégorie principale
    for (let j = 0; j < subCategories.length; j++) {
      let subCategory = subCategories[j].name;

      console.log(
        `Vérification de la sous-catégorie: "${subCategory}" dans la catégorie principale "${mainCategory}"...`
      );

      // Vérifier et corriger l'orthographe de la sous-catégorie
      const correctedSubCategory = await checkAndCorrectSubCategorySpelling(
        subCategory
      );

      // Si la sous-catégorie a été corrigée, mettre à jour les données et sauvegarder immédiatement le fichier JSON
      if (subCategory !== correctedSubCategory) {
        console.log(
          `Sous-catégorie corrigée: "${subCategory}" -> "${correctedSubCategory}" dans la catégorie principale "${mainCategory}"`
        );
        categoriesData.categories[i].sub_categories[j].name =
          correctedSubCategory;

        // Sauvegarder immédiatement dans le fichier JSON après chaque correction
        saveCategoriesToFile(); // Met à jour directement le fichier JSON
      } else {
        console.log(
          `Sous-catégorie correcte: "${subCategory}" dans la catégorie principale "${mainCategory}"`
        );
      }
    }
  }

  console.log("Vérification et correction des sous-catégories terminées.");
}

// Fonction pour ajouter une nouvelle catégorie principale après analyse
async function addNewMainCategory() {
  const { mainCategories } = fetchAllCategories(); // Obtenir les catégories existantes

  // Proposer de nouvelles catégories principales uniques
  const newMainCategories = await proposeNewMainCategory(mainCategories);

  newMainCategories.forEach((newMainCategory) => {
    const newCategory = {
      main_category: newMainCategory,
      sub_categories: [],
    };

    // Ajouter la nouvelle catégorie principale dans le JSON
    categoriesData.categories.push(newCategory);
  });

  // Sauvegarder les nouvelles catégories dans le fichier JSON
  saveCategoriesToFile();
  console.log(
    `Nouvelles catégories principales ajoutées : ${newMainCategories.join(
      ", "
    )}`
  );
}

// Fonction pour vérifier si le nom de la catégorie, sous-catégorie ou catégorie précise est valide
async function validateCategoryName(name, type) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant qui vérifie si les noms de catégories sont valides pour un système de quiz. Répond simplement 'valide' ou 'invalide' selon la pertinence du nom donné.",
        },
        {
          role: "user",
          content: `Vérifie si le nom suivant est valide pour une ${type}: "${name}". Répond simplement 'valide' ou 'invalide'.`,
        },
      ],
      max_tokens: 10,
      temperature: 0.5,
    });

    const response = completion.choices[0].message.content.trim().toLowerCase();
    return response === "valide";
  } catch (error) {
    console.error("Erreur lors de la validation du nom:", error);
    return false; // Assume invalid if there's an error
  }
}

// Helper function to count words in a string
function countWords(name) {
  // Split the name by spaces and filter out any empty strings
  return name.trim().split(/\s+/).length;
}

// Function to clean up categories if they have more than 6 words (applies to main, sub, and precise categories)
function cleanLongCategories() {
  console.log("Début du nettoyage des catégories longues...");

  // Itérer sur les catégories principales
  for (let i = categoriesData.categories.length - 1; i >= 0; i--) {
    let mainCategory = categoriesData.categories[i].main_category;

    // Si la catégorie principale a plus de 6 mots, la supprimer
    if (countWords(mainCategory) > 6) {
      console.log(
        `Catégorie principale supprimée (trop de mots): "${mainCategory}"`
      );
      categoriesData.categories.splice(i, 1); // Supprimer la catégorie principale
      continue; // Aller à la prochaine catégorie principale
    }

    // Itérer sur les sous-catégories
    let subCategories = categoriesData.categories[i].sub_categories;
    for (let j = subCategories.length - 1; j >= 0; j--) {
      let subCategory = subCategories[j].name;

      // Si la sous-catégorie a plus de 6 mots, la supprimer
      if (countWords(subCategory) > 6) {
        console.log(
          `Sous-catégorie supprimée (trop de mots): "${subCategory}"`
        );
        subCategories.splice(j, 1); // Supprimer la sous-catégorie
        continue; // Aller à la prochaine sous-catégorie
      }

      // Itérer sur les catégories précises
      let preciseCategories = subCategories[j].precise_categories;
      for (let k = preciseCategories.length - 1; k >= 0; k--) {
        let preciseCategory = preciseCategories[k];

        // Si la catégorie précise a plus de 6 mots, la supprimer
        if (countWords(preciseCategory) > 6) {
          console.log(
            `Catégorie précise supprimée (trop de mots): "${preciseCategory}"`
          );
          preciseCategories.splice(k, 1); // Supprimer la catégorie précise
        }
      }
    }
  }

  // Sauvegarder les données nettoyées dans le fichier JSON
  saveCategoriesToFile();
  console.log(
    "Nettoyage des catégories longues terminé et données sauvegardées avec succès."
  );
}

// Fonction pour vérifier et corriger l'orthographe d'une catégorie principale avec GPT-4o-mini
// Fonction pour vérifier et corriger l'orthographe d'une catégorie principale avec GPT-4o-mini
async function checkAndCorrectMainCategorySpelling(mainCategory) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant qui vérifie et corrige l'orthographe des catégories principales. Réponds en donnant la version correcte sans phrase supplémentaire.",
        },
        {
          role: "user",
          content: `Vérifie et corrige l'orthographe de cette catégorie: "${mainCategory}". Si elle est correcte, réponds-la simplement.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.2, // Lower temperature for more consistent results
    });

    const correctedCategory = completion.choices[0].message.content.trim();
    return correctedCategory;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'orthographe:", error);
    return mainCategory; // Return the original category if there's an error
  }
}

// Fonction pour corriger toutes les catégories principales
// Fonction pour vérifier et corriger l'orthographe de toutes les catégories principales et éditer directement le fichier JSON
async function checkAllMainCategories() {
  console.log(
    "Début de la vérification des orthographes des catégories principales..."
  );

  // Itérer sur toutes les catégories principales
  for (let i = 0; i < categoriesData.categories.length; i++) {
    let mainCategory = categoriesData.categories[i].main_category;

    console.log(
      `Vérification de la catégorie principale: "${mainCategory}"...`
    );

    // Vérifier et corriger l'orthographe
    const correctedCategory = await checkAndCorrectMainCategorySpelling(
      mainCategory
    );

    // Si la catégorie a été corrigée, mettre à jour les données et sauvegarder immédiatement le fichier JSON
    if (mainCategory !== correctedCategory) {
      console.log(
        `Catégorie principale corrigée: "${mainCategory}" -> "${correctedCategory}"`
      );
      categoriesData.categories[i].main_category = correctedCategory;

      // Sauvegarder immédiatement dans le fichier JSON après chaque correction
      saveCategoriesToFile(); // Met à jour directement le fichier JSON
    } else {
      console.log(`Catégorie principale correcte: "${mainCategory}"`);
    }
  }

  console.log(
    "Vérification et correction des catégories principales terminées."
  );
}

// Fonction pour nettoyer les données en supprimant les éléments invalides et en nettoyant les noms
async function cleanData() {
  console.log("Début du nettoyage des données...");

  const { mainCategories, subCategoriesByMain, preciseCategoriesBySub } =
    fetchAllCategories();

  let startTime = Date.now(); // Start timing

  // Nettoyage des catégories principales
  for (let i = categoriesData.categories.length - 1; i >= 0; i--) {
    const mainCategory = categoriesData.categories[i].main_category;
    const isValidMain = await validateCategoryName(
      mainCategory,
      "catégorie principale"
    );

    if (!isValidMain) {
      console.log(`Catégorie principale invalide supprimée: "${mainCategory}"`);
      categoriesData.categories.splice(i, 1); // Supprimer la catégorie principale si elle est invalide
      continue; // Aller à la prochaine catégorie principale
    }

    // Time for main category processing
    let mainCategoryTime = Date.now() - startTime;
    console.log(
      `Temps écoulé pour la catégorie principale "${mainCategory}": ${mainCategoryTime}ms`
    );

    // Reset start time for subcategories
    startTime = Date.now();

    // Nettoyage des sous-catégories
    const subCategories = categoriesData.categories[i].sub_categories;
    for (let j = subCategories.length - 1; j >= 0; j--) {
      const subCategory = subCategories[j].name;
      const isValidSub = await validateCategoryName(
        subCategory,
        "sous-catégorie"
      );

      if (!isValidSub) {
        console.log(`Sous-catégorie invalide supprimée: "${subCategory}"`);
        subCategories.splice(j, 1); // Supprimer la sous-catégorie si elle est invalide
        continue; // Aller à la prochaine sous-catégorie
      }

      // Time for subcategory processing
      let subCategoryTime = Date.now() - startTime;
      console.log(
        `Temps écoulé pour la sous-catégorie "${subCategory}": ${subCategoryTime}ms`
      );

      // Reset start time for precise categories
      startTime = Date.now();

      // Nettoyage des catégories précises
      const preciseCategories = subCategories[j].precise_categories;
      for (let k = preciseCategories.length - 1; k >= 0; k--) {
        const preciseCategory = preciseCategories[k];
        const isValidPrecise = await validateCategoryName(
          preciseCategory,
          "catégorie précise"
        );

        if (!isValidPrecise) {
          console.log(
            `Catégorie précise invalide supprimée: "${preciseCategory}"`
          );
          preciseCategories.splice(k, 1); // Supprimer la catégorie précise si elle est invalide
        }

        // Time for precise category processing
        let preciseCategoryTime = Date.now() - startTime;
        console.log(
          `Temps écoulé pour la catégorie précise "${preciseCategory}": ${preciseCategoryTime}ms`
        );
      }

      // Reset start time for the next subcategory
      startTime = Date.now();
    }

    // Reset start time for the next main category
    startTime = Date.now();
  }

  // Sauvegarder les données nettoyées dans le fichier JSON
  saveCategoriesToFile();
  console.log("Données nettoyées et sauvegardées avec succès.");
}

// Fonction pour analyser et ajouter des sous-catégories à une catégorie principale existante
async function analyzeAndAddSubCategories() {
  const { mainCategories, subCategoriesByMain } = fetchAllCategories();

  // Parcourir chaque catégorie principale pour vérifier si des sous-catégories sont nécessaires
  let subcategoryIndex = 0;
  let startTime = Date.now(); // Timer start

  for (const mainCategory of mainCategories) {
    subcategoryIndex++;
    const existingSubCategories = subCategoriesByMain[mainCategory] || [];
    const newSubCategories = await generateNewSubCategory(
      mainCategory,
      existingSubCategories
    );

    // Ajouter de nouvelles sous-catégories
    const mainCategoryObject = categoriesData.categories.find(
      (cat) => cat.main_category === mainCategory
    );
    newSubCategories.forEach((newSubCategory) => {
      mainCategoryObject.sub_categories.push({
        name: newSubCategory,
        precise_categories: [],
      });
    });

    // Affichage du temps écoulé et progression
    let elapsedTime = Date.now() - startTime;
    console.log(
      `Analyse des sous-catégories pour "${mainCategory}" complétée. Temps écoulé: ${elapsedTime}ms (${subcategoryIndex}/${mainCategories.length})`
    );
  }

  // Sauvegarder les sous-catégories mises à jour
  saveCategoriesToFile();
  console.log(
    `Sous-catégories ajoutées pour chaque catégorie principale analysée.`
  );
}

// Fonction pour nettoyer les noms en supprimant les numéros, traits d'union et autres caractères spéciaux
function cleanName(name) {
  // Remove numbers followed by a period or other punctuation (e.g., "1.", "2."), hyphens, or other special characters
  let cleanedName = name
    .replace(/\d+\./g, "") // Remove numbers followed by a period, e.g., "1." or "2."
    .replace(/-/g, "") // Remove hyphens, e.g., "-"
    .replace(/[^a-zA-Z\s]/g, "") // Remove any character that is not a letter or space
    .trim(); // Trim leading or trailing whitespace

  // Replace multiple spaces with a single space
  cleanedName = cleanedName.replace(/\s+/g, " ");

  return cleanedName;
}

// Fonction pour vérifier et corriger l'orthographe d'une catégorie précise avec GPT-4o-mini
async function checkAndCorrectPreciseCategorySpelling(preciseCategory) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant qui vérifie et corrige l'orthographe des catégories précises. Réponds en donnant la version correcte sans phrase supplémentaire.",
        },
        {
          role: "user",
          content: `Vérifie et corrige l'orthographe de cette catégorie précise: "${preciseCategory}". Si elle est correcte, réponds-la simplement.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.2, // Lower temperature for more consistent results
    });

    const correctedPreciseCategory =
      completion.choices[0].message.content.trim();
    return correctedPreciseCategory;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'orthographe:", error);
    return preciseCategory; // Return the original precise category if there's an error
  }
}

// Fonction pour vérifier et corriger l'orthographe de toutes les catégories précises et éditer directement le fichier JSON
async function checkAllPreciseCategories() {
  console.log(
    "Début de la vérification des orthographes des catégories précises..."
  );

  // Itérer sur toutes les catégories principales
  for (let i = 0; i < categoriesData.categories.length; i++) {
    let mainCategory = categoriesData.categories[i].main_category;
    let subCategories = categoriesData.categories[i].sub_categories;

    // Itérer sur toutes les sous-catégories de cette catégorie principale
    for (let j = 0; j < subCategories.length; j++) {
      let subCategory = subCategories[j].name;
      let preciseCategories = subCategories[j].precise_categories;

      // Itérer sur toutes les catégories précises de cette sous-catégorie
      for (let k = 0; k < preciseCategories.length; k++) {
        let preciseCategory = preciseCategories[k];

        console.log(
          `Vérification de la catégorie précise: "${preciseCategory}" dans la sous-catégorie "${subCategory}" et catégorie principale "${mainCategory}"...`
        );

        // Vérifier et corriger l'orthographe de la catégorie précise
        const correctedPreciseCategory =
          await checkAndCorrectPreciseCategorySpelling(preciseCategory);

        // Si la catégorie précise a été corrigée, mettre à jour les données et sauvegarder immédiatement le fichier JSON
        if (preciseCategory !== correctedPreciseCategory) {
          console.log(
            `Catégorie précise corrigée: "${preciseCategory}" -> "${correctedPreciseCategory}" dans la sous-catégorie "${subCategory}" et catégorie principale "${mainCategory}"`
          );
          categoriesData.categories[i].sub_categories[j].precise_categories[k] =
            correctedPreciseCategory;

          // Sauvegarder immédiatement dans le fichier JSON après chaque correction
          saveCategoriesToFile(); // Met à jour directement le fichier JSON
        } else {
          console.log(
            `Catégorie précise correcte: "${preciseCategory}" dans la sous-catégorie "${subCategory}" et catégorie principale "${mainCategory}"`
          );
        }
      }
    }
  }

  console.log("Vérification et correction   des catégories précises terminées.");
}

// Fonction pour nettoyer les données en supprimant les éléments invalides et en nettoyant les noms
async function cleanDataWithoutGPT() {
  // Itérer sur chaque catégorie principale
  for (let i = 0; i < categoriesData.categories.length; i++) {
    let mainCategory = categoriesData.categories[i].main_category;

    // Nettoyer le nom de la catégorie principale
    const cleanedMainCategory = cleandot(mainCategory);
    if (mainCategory !== cleanedMainCategory) {
      console.log(
        `Catégorie principale nettoyée: "${mainCategory}" -> "${cleanedMainCategory}"`
      );
      categoriesData.categories[i].main_category = cleanedMainCategory;
    }

    // Nettoyer les sous-catégories
    let subCategories = categoriesData.categories[i].sub_categories;
    for (let j = 0; j < subCategories.length; j++) {
      let subCategory = subCategories[j].name;

      const cleanedSubCategory = cleandot(subCategory);
      if (subCategory !== cleanedSubCategory) {
        console.log(
          `Sous-catégorie nettoyée: "${subCategory}" -> "${cleanedSubCategory}"`
        );
        subCategories[j].name = cleanedSubCategory;
      }

      // Nettoyer les catégories précises
      let preciseCategories = subCategories[j].precise_categories;
      for (let k = 0; k < preciseCategories.length; k++) {
        let preciseCategory = preciseCategories[k];

        const cleanedPreciseCategory = cleandot(preciseCategory);
        if (preciseCategory !== cleanedPreciseCategory) {
          console.log(
            `Catégorie précise nettoyée: "${preciseCategory}" -> "${cleanedPreciseCategory}"`
          );
          preciseCategories[k] = cleanedPreciseCategory;
        }
      }
    }
  }

  // Sauvegarder les données nettoyées dans le fichier JSON
  saveCategoriesToFile();
  console.log("Données nettoyées et sauvegardées avec succès.");
}




// Fonction pour générer de nouvelles précises catégories pour une sous-catégorie donnée
async function generateNewPreciseCategory(
    mainCategory,
    subCategory,
    existingPreciseCategories
  ) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant qui génère des catégories précises pour une sous-catégorie existante. Ne donne que des mots-clés. Pas de phrases complètes, pas de nombres ni de symboles.",
        },
        {
          role: "user",
          content: `Voici les catégories précises existantes pour la sous-catégorie "${subCategory}" dans "${mainCategory}": ${existingPreciseCategories.join(
            ", "
          )}. Propose de nouvelles catégories précises en utilisant uniquement des mots-clés.`,
        },
      ],
      max_tokens: 250,
      temperature: 0.8,
    });
  
    return completion.choices[0].message.content
      .trim()
      .split("\n")
      .map((category) => category.trim());
  }

  
// Fonction pour analyser et ajouter des précises catégories à des sous-catégories existantes
async function analyzeAndAddPreciseCategories() {
  const { subCategoriesByMain, preciseCategoriesBySub } = fetchAllCategories();

  // Parcourir chaque sous-catégorie pour vérifier si des précises catégories sont nécessaires
  let preciseCategoryIndex = 0;
  let startTime = Date.now(); // Timer start

  for (const subCategory in preciseCategoriesBySub) {
    preciseCategoryIndex++;
    const existingPreciseCategories = preciseCategoriesBySub[subCategory] || [];
    const mainCategory = Object.keys(subCategoriesByMain).find((mainCat) =>
      subCategoriesByMain[mainCat].includes(subCategory)
    );

    // Générer de nouvelles précises catégories pour chaque sous-catégorie
    const newPreciseCategories = await generateNewPreciseCategory(
      mainCategory,
      subCategory,
      existingPreciseCategories
    );

    // Ajouter les nouvelles précises catégories
    const mainCategoryObject = categoriesData.categories.find(
      (cat) => cat.main_category === mainCategory
    );
    const subCategoryObject = mainCategoryObject.sub_categories.find(
      (sub) => sub.name === subCategory
    );
    newPreciseCategories.forEach((newPreciseCategory) => {
      subCategoryObject.precise_categories.push(newPreciseCategory);
    });

    // Affichage du temps écoulé et progression
    let elapsedTime = Date.now() - startTime;
    console.log(
      `Analyse des précises catégories pour "${subCategory}" complétée. Temps écoulé: ${elapsedTime}ms (${preciseCategoryIndex}/${
        Object.keys(preciseCategoriesBySub).length
      })`
    );
  }

  // Sauvegarder les précises catégories mises à jour
  saveCategoriesToFile();
  console.log(
    `Précises catégories ajoutées pour chaque sous-catégorie analysée.`
  );
}


// Fonction pour générer de nouvelles catégories précises avec GPT-4o-mini
async function generateNewPreciseCategories(mainCategory, subCategory, existingPreciseCategories, countNeeded) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Tu es un assistant qui génère des catégories précises pour des sous-catégories. Ne donne que des mots-clés. Pas de phrases complètes." },
                { role: "user", content: `Voici les catégories précises existantes pour la sous-catégorie "${subCategory}" dans la catégorie "${mainCategory}": ${existingPreciseCategories.join(', ')}. Propose de nouvelles catégories précises pour atteindre un total de 15.` }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const newCategories = completion.choices[0].message.content.trim().split("\n").map(cat => cat.trim());

        // Vérifier si nous avons généré suffisamment de nouvelles catégories
        return newCategories.slice(0, countNeeded); // Limiter les nouvelles catégories au nombre nécessaire
    } catch (error) {
        console.error("Erreur lors de la génération des nouvelles catégories précises:", error);
        return [];
    }
}

// Existing utility functions
function cleanName(name) {
  // Your existing cleaning logic
}

function cleandot(name) {
  if (typeof name !== 'string') {
    console.error('Le nom fourni n\'est pas une chaîne de caractères :', name);
    return '';
  }
  if (name.endsWith('.')) {
    return name.slice(0, -1);
  }
  return name;
}


// Fonction pour vérifier si chaque sous-catégorie a au moins 15 catégories précises, sinon générer de nouvelles catégories
async function checkPreciseIsMinimum() {
    console.log("Début de la vérification des sous-catégories pour un minimum de 15 catégories précises...");

    // Itérer sur toutes les catégories principales
    for (let i = 0; i < categoriesData.categories.length; i++) {
        let mainCategory = categoriesData.categories[i].main_category;
        let subCategories = categoriesData.categories[i].sub_categories;

        // Itérer sur toutes les sous-catégories
        for (let j = 0; j < subCategories.length; j++) {
            let subCategory = subCategories[j].name;
            let preciseCategories = subCategories[j].precise_categories;

            // Vérifier si cette sous-catégorie a moins de 15 catégories précises
            if (preciseCategories.length < 15) {
                const countNeeded = 15 - preciseCategories.length;
                console.log(`La sous-catégorie "${subCategory}" dans "${mainCategory}" a moins de 15 catégories précises (${preciseCategories.length}). Génération de ${countNeeded} nouvelles catégories précises...`);

                // Générer de nouvelles catégories précises pour atteindre un total de 15
                const newPreciseCategories = await generateNewPreciseCategories(mainCategory, subCategory, preciseCategories, countNeeded);

                // Ajouter les nouvelles catégories précises à la sous-catégorie
                categoriesData.categories[i].sub_categories[j].precise_categories.push(...newPreciseCategories);

                // Sauvegarder immédiatement dans le fichier JSON après chaque correction
                saveCategoriesToFile();
                console.log(`Nouvelles catégories précises ajoutées à la sous-catégorie "${subCategory}" dans "${mainCategory}".`);
            }
        }
    }

    console.log("Vérification et génération des catégories précises terminées.");
}



// Fonction principale pour automatiser l'analyse et les ajouts à tous les niveaux
async function automateEditsAndAdditions(maxIterations) {
  let iteration = 0;

  while (iteration < maxIterations) {
    console.log(`Cycle d'itération: ${iteration + 1} / ${maxIterations}`);
    //  await checkAllSubCategories();
    // await checkPreciseIsMinimum();

   // await checkAllPreciseCategories();
    // 1. Analyser et créer de nouvelles catégories principales
    //  await checkAllMainCategories();
    //cleanLongCategories();

    //      await cleanData();
      await cleanDataWithoutGPT();

    //      await addNewMainCategory();

    // 2. Analyser chaque catégorie principale et ajouter des sous-catégories si nécessaire
    //  await analyzeAndAddSubCategories();

    // 3. Analyser chaque sous-catégorie et ajouter des précises catégories si nécessaire
    //   await analyzeAndAddPreciseCategories();

    iteration++;
    console.log(`Cycle ${iteration} terminé.`);
  }

  console.log(
    "Toutes les analyses et améliorations sont terminées après le nombre d'itérations spécifié."
  );
}

// Exécution du script avec un nombre d'itérations spécifié pour automatiser les améliorations et ajouts des catégories
const MAX_ITERATIONS = 1; // Vous pouvez changer cette valeur pour ajuster le nombre d'itérations
automateEditsAndAdditions(MAX_ITERATIONS);
