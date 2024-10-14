// server.js

// Importation des modules nécessaires
import fs from 'fs';
import OpenAI from "openai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";

// Configuration Firebase (remplacez par vos propres informations)
const firebaseConfig = {
  apiKey: "AIzaSyA80Gp1J30gD2cTOMfVe0BD7j9xaxJxZ0M",
  authDomain: "vrgptt.firebaseapp.com",
  databaseURL: "https://vrgptt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vrgptt",
  storageBucket: "vrgptt.appspot.com",
  messagingSenderId: "747866018411",
  appId: "1:747866018411:web:b8bf59759eb9abdd24572e",
  measurementId: "G-LMC0P3ZQQ0"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialisation de l'API OpenAI avec votre clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Remplacez par votre clé API OpenAI
});

// Charger le fichier JSON contenant les catégories
let categoriesData = JSON.parse(fs.readFileSync('./category.json', 'utf8'));

// Fonction pour sauvegarder le JSON modifié
function saveCategoriesToFile() {
    fs.writeFileSync('./category.json', JSON.stringify(categoriesData, null, 2), 'utf8');
}

// Fonction pour ajouter une nouvelle catégorie principale
function addMainCategory(mainCategoryName) {
    const newCategory = {
        main_category: mainCategoryName,
        sub_categories: []
    };
    categoriesData.categories.push(newCategory);
    saveCategoriesToFile();
    console.log(`Nouvelle catégorie principale ajoutée: ${mainCategoryName}`);
}

// Fonction pour ajouter une sous-catégorie à une catégorie principale existante
function addSubCategory(mainCategoryName, subCategoryName) {
    const mainCategory = categoriesData.categories.find(cat => cat.main_category === mainCategoryName);
    if (mainCategory) {
        mainCategory.sub_categories.push({
            name: subCategoryName,
            precise_categories: []
        });
        saveCategoriesToFile();
        console.log(`Nouvelle sous-catégorie ajoutée: ${subCategoryName}`);
    } else {
        console.error(`La catégorie principale ${mainCategoryName} n'existe pas.`);
    }
}

// Fonction pour ajouter une catégorie précise à une sous-catégorie
function addPreciseCategory(mainCategoryName, subCategoryName, preciseCategoryName) {
    const mainCategory = categoriesData.categories.find(cat => cat.main_category === mainCategoryName);
    if (mainCategory) {
        const subCategory = mainCategory.sub_categories.find(sub => sub.name === subCategoryName);
        if (subCategory) {
            subCategory.precise_categories.push(preciseCategoryName);
            saveCategoriesToFile();
            console.log(`Nouvelle catégorie précise ajoutée: ${preciseCategoryName}`);
        } else {
            console.error(`La sous-catégorie ${subCategoryName} n'existe pas.`);
        }
    } else {
        console.error(`La catégorie principale ${mainCategoryName} n'existe pas.`);
    }
}

// Fonction pour éditer une catégorie principale
function editMainCategory(oldMainCategoryName, newMainCategoryName) {
    const mainCategory = categoriesData.categories.find(cat => cat.main_category === oldMainCategoryName);
    if (mainCategory) {
        mainCategory.main_category = newMainCategoryName;
        saveCategoriesToFile();
        console.log(`Catégorie principale modifiée: ${oldMainCategoryName} -> ${newMainCategoryName}`);
    } else {
        console.error(`La catégorie principale ${oldMainCategoryName} n'existe pas.`);
    }
}

// Fonction pour éditer une sous-catégorie
function editSubCategory(mainCategoryName, oldSubCategoryName, newSubCategoryName) {
    const mainCategory = categoriesData.categories.find(cat => cat.main_category === mainCategoryName);
    if (mainCategory) {
        const subCategory = mainCategory.sub_categories.find(sub => sub.name === oldSubCategoryName);
        if (subCategory) {
            subCategory.name = newSubCategoryName;
            saveCategoriesToFile();
            console.log(`Sous-catégorie modifiée: ${oldSubCategoryName} -> ${newSubCategoryName}`);
        } else {
            console.error(`La sous-catégorie ${oldSubCategoryName} n'existe pas.`);
        }
    } else {
        console.error(`La catégorie principale ${mainCategoryName} n'existe pas.`);
    }
}

// Fonction pour éditer une catégorie précise
function editPreciseCategory(mainCategoryName, subCategoryName, oldPreciseCategoryName, newPreciseCategoryName) {
    const mainCategory = categoriesData.categories.find(cat => cat.main_category === mainCategoryName);
    if (mainCategory) {
        const subCategory = mainCategory.sub_categories.find(sub => sub.name === subCategoryName);
        if (subCategory) {
            const preciseCategoryIndex = subCategory.precise_categories.indexOf(oldPreciseCategoryName);
            if (preciseCategoryIndex > -1) {
                subCategory.precise_categories[preciseCategoryIndex] = newPreciseCategoryName;
                saveCategoriesToFile();
                console.log(`Catégorie précise modifiée: ${oldPreciseCategoryName} -> ${newPreciseCategoryName}`);
            } else {
                console.error(`La catégorie précise ${oldPreciseCategoryName} n'existe pas.`);
            }
        } else {
            console.error(`La sous-catégorie ${subCategoryName} n'existe pas.`);
        }
    } else {
        console.error(`La catégorie principale ${mainCategoryName} n'existe pas.`);
    }
}

// Exemple d'utilisation
addMainCategory("Nouvelles Technologies");
addSubCategory("Nouvelles Technologies", "Intelligence Artificielle");
addPreciseCategory("Nouvelles Technologies", "Intelligence Artificielle", "Apprentissage Supervisé");
editMainCategory("Nouvelles Technologies", "Technologies de l'Avenir");

createQuizzesForCategories(); // Fonction principale déjà implémentée pour générer des quiz

