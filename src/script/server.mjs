// Importation des modules nécessaires
import OpenAI from "openai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, onChildAdded } from "firebase/database";
import dotenv from 'dotenv';
dotenv.config();
const FIR_KEY = process.env.FIR_KEY;

// Configuration Firebase (remplacez par vos propres informations)
const firebaseConfig = {
  apiKey: FIR_KEY,
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

const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialisation de l'API OpenAI avec votre clé API
const openai = new OpenAI({
  apiKey: openaiApiKey, // Remplacez par votre clé API OpenAI
});

// Fonction pour obtenir un feedback de l'API OpenAI
async function getFeedback(question, answer) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Utilisez "gpt-4" si vous y avez accès
      messages: [
        { role: "system", content: "Tu es un assistant qui fournit des feedbacks constructifs sur toutes les thématiques de vie sans avoir de tabou pour des étudiants a l'université. Tu es obligé de répondre et transmettre un feedbackl de maniere bienvaillant et directement sur le contenu de la question sans formalité. En disant C'est correct,c'est incorrect et expliquant quîmporte le sujet" },
        {
          role: "user",
          content: `Voici la question : "${question}"\nEt la réponse fournie : "${answer}"\nDonne un feedback de manière non rabaissant et fort , direct et constructif sur cette réponse, avec des infos complémentaires pertinentes, dans un 
          retour pertinent  Tu joues le rôle d'un prof qui parle direct à ces étudiants, comme un entraineur coach de sport`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Erreur lors de la requête à OpenAI :", error);
    return "Erreur lors de la génération du feedback.";
  }
}

// Fonction pour modifier le message avec le feedback obtenu
async function modifyMessage(messageKey, question, answer) {
  const feedback = await getFeedback(question, answer);

  const messageRef = ref(database, `/answers/${messageKey}`);
  update(messageRef, { feedback: feedback })
    .then(() => {
      console.log(`Message ${messageKey} modifié avec succès avec feedback : ${feedback}`);
    })
    .catch((error) => {
      console.error("Erreur lors de la modification du message :", error);
    });
}

// Surveiller l'ajout de nouveaux messages
const messagesRef = ref(database, "/answers");

onChildAdded(messagesRef, (snapshot) => {
  const messageKey = snapshot.key;
  const messageData = snapshot.val();

  console.log(`Nouveau message ajouté : ${messageKey}`, messageData);

  // Vérifier si le feedback existe déjà
  if (messageData && messageData.question && messageData.answer && !messageData.feedback) {
    modifyMessage(messageKey, messageData.question, messageData.answer);
  } else {
    console.log(`Message ${messageKey} déjà traité avec un feedback.`);
  }
});
