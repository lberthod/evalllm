// server.js

// Importation des modules nécessaires
import fs from 'fs';
import OpenAI from "openai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import dotenv from 'dotenv';
dotenv.config();

// Configuration Firebase (remplacez par vos propres informations)
const firebaseConfig = {
  apiKey: process.env.FIR_KEY,
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
const categoriesData = JSON.parse(fs.readFileSync('category.json', 'utf8'));

// Fonction pour générer des questions basées sur une catégorie précise
async function generateQuizQuestions(preciseCategory) {
    if (!preciseCategory || preciseCategory.trim() === "") {
        console.error("La catégorie précise est vide.");
        return ["Erreur : catégorie précise vide."];
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Utilisez "gpt-4" si vous y avez accès
            messages: [
                { role: "system", content: "Tu es un assistant qui génère des questions de quiz sur des thèmes spécifiques." },
                {
                    role: "user",
                    content: `Génère 5 questions de quiz sur la catégorie : "${preciseCategory}". Les questions doivent être simples, sans numérotation ni réponses.`,
                },
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const questions = completion.choices[0].message.content
            .trim()
            .split("\n")
            .map(q => q.replace(/^\d+\.\s*/, "").trim()) // Supprimer les numéros et les espaces vides
            .filter(q => q !== ""); // Filtrer les questions vides

        if (questions.length === 0) {
            console.error("Aucune question valide générée.");
            return ["Erreur : aucune question valide générée."];
        }

        return questions;
    } catch (error) {
        console.error("Erreur lors de la génération des questions :", error);
        return ["Erreur lors de la génération des questions."];
    }
}

// Fonction pour stocker les questions générées dans Firebase
async function storeQuestions(mainCategory, subCategory, preciseCategory, questions) {
    // Vérification des champs
    if (!mainCategory || !subCategory || !preciseCategory || questions.length === 0) {
        console.error("Des champs requis sont vides ou aucune question n'a été générée.");
        return;
    }

    const date = Date.now();
    const dateS = preciseCategory + date;

    const quizRef = ref(database, `/quizzes/${subCategory}/${dateS}`);
    const data = {
        category: {
            main: mainCategory,
            sub: subCategory,
            precise: preciseCategory,
        },
        name: preciseCategory,
        questions: questions.map((q) => ({ title: q })),
    };

    update(quizRef, data)
        .then(() => {
            console.log(`Questions ajoutées pour la catégorie précise : ${preciseCategory}`);
        })
        .catch((error) => {
            console.error("Erreur lors de l'ajout des questions :", error);
        });
}

// Fonction principale pour parcourir toutes les catégories et générer des quiz
async function createQuizzesForCategories() {
    for (const category of categoriesData.categories) {  // Utilisation de categories
        const mainCategory = category.main_category;
        for (const subCategory of category.sub_categories) {
            for (const preciseCategory of subCategory.precise_categories) {
                if (!preciseCategory || preciseCategory.trim() === "") {
                    console.error("La catégorie précise est vide, elle est ignorée.");
                    continue; // Ignorer les catégories vides
                }

                console.log(`Génération de quiz pour la catégorie précise : ${preciseCategory}`);
                const questions = await generateQuizQuestions(preciseCategory);
                await storeQuestions(mainCategory, subCategory.name, preciseCategory, questions);
            }
        }
    }
}

// Exécuter la fonction pour générer les quiz pour toutes les catégories
createQuizzesForCategories();
