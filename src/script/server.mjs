// server.js

// Importation des modules nécessaires
import OpenAI from "openai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, onChildAdded } from "firebase/database";

const FIR_KEY = process.env.FIR_KEY;

// Configuration Firebase (remplacez par vos propres informations)

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey, // Remplacez par votre clé API OpenAI
});

// Fonction pour obtenir un feedback de l'API OpenAI
async function getFeedback(question, answer) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Utilisez "gpt-4" si vous y avez accès
      messages: [
        { role: "system", content: "Tu es un assistant qui fournit des feedbacks constructifs." },
        {
          role: "user",
          content: `Voici la question : "${question}"\nEt la réponse fournie : "${answer}"\nDonne un feedback de maniere vulgaire et impoli, direct etconstructif sur cette réponse. avec des infos complemetnaire pertinentes, dans un retour pertinetn a la lecture pur un homme de la rue illegal. tu joues le role d'u n prof de balnlieu qui veut traumatiser l etudiant en lui parlant de maniere tres emcnahte et hypocrites et insoulttnte.`,
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

  if (messageData && messageData.question && messageData.answer) {
    modifyMessage(messageKey, messageData.question, messageData.answer);
  }
});
