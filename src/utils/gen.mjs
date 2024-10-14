// Importation des modules nécessaires
import fs from 'fs';
import { OpenAI } from "openai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, get } from "firebase/database";

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
});

// Charger le fichier JSON contenant les catégories
const categoriesData = JSON.parse(fs.readFileSync('./category.json', 'utf8'));

// Fonction pour générer des thèmes pour les quiz sans introduction ni conclusion
async function generateQuizThemes(preciseCategory) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant qui génère uniquement 10 titres de thèmes en mots-clés pour un quiz. Ne donne aucune introduction ni conclusion, uniquement 10 mots-clés comme titres."
          },
          {
            role: "user",
            content: `Génère 10 thèmes pour un quiz dans la catégorie précise : "${preciseCategory}".`
          }
        ],
        max_tokens: 350,
        temperature: 0.7
      });

      // Assurez-vous que vous accédez à message.content
      if (completion && completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content
          .trim()
          .split("\n")
          .map((theme) => theme.replace(/^\d+[\.\s]*/, '').trim()); // Supprimer les numéros et espaces en début de ligne
      } else {
        console.error("Réponse invalide de l'API : ", completion);
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la génération des thèmes : ", error);
      return [];
    }
}

// Fonction pour générer des questions basées sur un thème sans réponses
async function generateQuizQuestions(theme) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant qui génère uniquement des questions de quiz basées sur un thème donné. Ne donne aucune proposition de réponse."
          },
          {
            role: "user",
            content: `Génère 10 questions pour le thème suivant : "${theme}". Ne donne aucune réponse ni proposition de réponse.`
          }
        ],
        max_tokens: 350,
        temperature: 0.7
      });

      // Assurez-vous que vous accédez à message.content
      if (completion && completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content
          .trim()
          .split("\n")  
          .map((question) => question.replace(/^\d+[\.\s]*/, '').trim()) // Supprimer les numéros et espaces en début de ligne
          .filter((question) => question.length > 0); // Ignorer les lignes vides
      } else {
        console.error("Réponse invalide de l'API : ", completion);
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la génération des questions : ", error);
      return [];
    }
}

// Fonction pour stocker les questions générées dans Firebase dans la structure demandée
async function storeQuestions(mainCategory, subCategory, preciseCategory, theme, questions) {
    // Vérification des champs
    if (!mainCategory || !subCategory || !preciseCategory || !theme || questions.length === 0) {
        console.error("Des champs requis sont vides ou aucune question n'a été générée.");
        return;
    }

    const date = Date.now();
    const quizID = `quiz_${date}`; // Utilisation de la date comme identifiant unique du quiz

    const quizRef = ref(database, `/quizzs2/${mainCategory}/${subCategory}/${preciseCategory}/${quizID}`);
    const data = {
        theme: theme, // Enregistrer le thème uniquement
        questions: questions.map((q) => ({ title: q })), // Sauvegarder les questions sans réponses
    };

    update(quizRef, data)
        .then(() => {
            console.log(`Questions ajoutées pour la catégorie précise : ${preciseCategory} avec le thème : ${theme}`);
        })
        .catch((error) => {
            console.error("Erreur lors de l'ajout des questions :", error);
        });
}

// Fonction principale pour parcourir toutes les catégories et générer des quiz
async function createQuizzesForCategories() {
    for (const category of categoriesData.categories) {
        const mainCategory = category.main_category;
        for (const subCategory of category.sub_categories) {
            for (const preciseCategory of subCategory.precise_categories) {
                if (!preciseCategory || preciseCategory.trim() === "") {
                    console.error("La catégorie précise est vide, elle est ignorée.");
                    continue; // Ignorer les catégories vides
                }

                console.log(`Vérification des quiz existants pour la catégorie précise : ${preciseCategory}`);

                // Obtenir le nombre de quiz existants pour cette catégorie précise
                const existingQuizzesCount = await getExistingQuizzesCount(mainCategory, subCategory.name, preciseCategory);

                if (existingQuizzesCount >= 10) {
                    console.log(`La catégorie précise "${preciseCategory}" a déjà ${existingQuizzesCount} quiz.`);
                    continue; // Passer à la prochaine catégorie
                }

                const quizzesToCreate = 10 - existingQuizzesCount;

                console.log(`Génération de ${quizzesToCreate} quiz pour la catégorie précise : ${preciseCategory}`);

                // Obtenir les thèmes des quiz
                const quizThemes = await generateQuizThemes(preciseCategory);

                if (quizThemes.length === 0) {
                    console.error("Échec de l'obtention des thèmes.");
                    continue;
                }

                // Pour chaque thème, générer les questions et stocker le quiz
                for (const theme of quizThemes.slice(0, quizzesToCreate)) {
                    // Générer les questions basées sur le thème
                    const questions = await generateQuizQuestions(theme);

                    // Stocker les questions avec la structure demandée
                    await storeQuestions(mainCategory, subCategory.name, preciseCategory, theme, questions);
                }
            }
        }
    }
}

// Fonction pour obtenir le nombre de quiz existants pour une catégorie précise dans Firebase
async function getExistingQuizzesCount(mainCategory, subCategory, preciseCategory) {
    try {
        const quizzesRef = ref(database, `/quizzs2/${mainCategory}/${subCategory}/${preciseCategory}`);
        const snapshot = await get(quizzesRef);
        if (snapshot.exists()) {
            const quizzes = snapshot.val();
            return Object.keys(quizzes).length; // Nombre de quiz existants
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des quiz existants :", error);
        return 0;
    }
}

// Exécuter la fonction pour générer les quiz pour toutes les catégories
createQuizzesForCategories();
