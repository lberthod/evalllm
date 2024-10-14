<template>
  <div class="container">
    <div v-if="quiz">
      <header class="quiz-header">
        <h1>{{ quiz.theme }}</h1>
        <p class="quiz-description">Testez vos connaissances et voyez comment vous progressez à travers les questions suivantes.</p>
      </header>

      <!-- Afficher les catégories avec un design plus ergonomique -->
      <div class="categories">
        <p class="category"><span class="category-label">Main Category:</span> {{ mainCategory }}</p>
        <p class="category"><span class="category-label">Sub Category:</span> {{ subCategory }}</p>
        <p class="category"><span class="category-label">Precise Category:</span> {{ preciseCategory }}</p>
      </div>

      <div v-for="(question, index) in quiz.questions" :key="index" class="question-block">
        <h3>Question {{ index + 1 }}: {{ question.title }}
          <!-- Ajouter l'icône d'ampoule pour l'aide -->
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="help-icon" @click="sendHelpRequest(index)" title="Besoin d'aide ?" />
        </h3>

        <!-- Vérifier si la question a été réussie précédemment -->
        <p v-if="correctAnswers[index]" class="success-message">Réussi le {{ formatDate(correctAnswers[index]) }}</p>

        <form @submit.prevent="submitAnswer(index)" class="answer-form">
          <input v-model="answers[index]" type="text" placeholder="Votre réponse..." required />
          <div class="buttons">
            <!-- Bouton Envoyer -->
            <button type="submit">Envoyer</button>
          </div>
        </form>

        <!-- Message: Afficher la réponse soumise -->
        <p v-if="submittedAnswers[index]" class="submitted-answer">Vous avez transmis la réponse: "{{ submittedAnswers[index] }}"</p>

        <p v-if="successMessages[index]" class="success">{{ successMessages[index] }}</p>
        <p v-if="feedbackMessages[index]" class="feedback">{{ feedbackMessages[index] }}</p>
      </div>
    </div>
    <div v-else>
      <p>Chargement du quiz...</p>
    </div>

    <!-- Overlay for Help -->
    <div v-if="showHelpOverlay" class="overlay">
      <div class="overlay-content">
        <h2>Aide pour la question {{ currentQuestionIndex + 1 }}</h2>
        <p v-if="loadingHelp">Chargement de l'aide théorique...</p>

        <!-- Utiliser markdown-it pour rendre le contenu markdown -->
        <div v-html="theoryExplanation" v-else></div>

        <button @click="closeHelpOverlay">Fermer</button>
      </div>
    </div>
  </div>
</template>


<script>

import { ref, onValue, push, update, get } from 'firebase/database';
import { getCurrentUser, database } from '@/firebase';
import { marked } from 'marked';  // Utiliser l'import correct de marked
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      quiz: null,
      mainCategory: '',
      subCategory: '',
      preciseCategory: '',
      answers: [],  // For current user input
      submittedAnswers: [],  // To store and display the submitted answers
      successMessages: [],
      feedbackMessages: [],
      correctAnswers: [], // Pour stocker les dates de réussite
      currentQuestionIndex: null,
      showHelpOverlay: false,
      loadingHelp: false,
      theoryExplanation: null,
    };
  },
  created() {
    this.loadQuiz();
  },
  methods: {
    loadQuiz() {
      const quizId = this.$route.params.id;
      const db = database;

      const quizzesRef = ref(db, `quizzs2`);
      onValue(quizzesRef, (snapshot) => {
        const quizzesData = snapshot.val();
        let foundQuiz = null;

        if (quizzesData) {
          Object.entries(quizzesData).forEach(([mainCatKey, mainCategory]) => {
            Object.entries(mainCategory).forEach(([subCatKey, subCategory]) => {
              Object.entries(subCategory).forEach(([preciseCatKey, preciseCategory]) => {
                if (preciseCategory[quizId]) {
                  foundQuiz = preciseCategory[quizId];
                  // Stocker les catégories
                  this.mainCategory = mainCatKey;
                  this.subCategory = subCatKey;
                  this.preciseCategory = preciseCatKey;
                }
              });
            });
          });
        }

        if (foundQuiz) {
          this.quiz = foundQuiz;
          this.checkCorrectAnswers();
        } else {
          console.error('Quiz non trouvé avec ID:', quizId);
        }
      });
    },
    async checkCorrectAnswers() {
      const user = getCurrentUser();
      const db = database;

      // Vérifier les réponses correctes dans la base de données pour l'utilisateur
      for (const [index, question] of this.quiz.questions.entries()) {
        const resultPath = `results/${user.uid}/${this.mainCategory}/${this.subCategory}/${this.preciseCategory}/${this.quiz.theme}/${question.title}`;
        const resultRef = ref(db, resultPath);

        const snapshot = await get(resultRef);
        if (snapshot.exists()) {
          const resultData = snapshot.val();
          if (resultData && resultData.correct) {
            this.correctAnswers[index] = resultData.date;
          }
        }
      }
    },

    // Nouvelle fonction pour formater la date
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', options);
    },

    async submitAnswer(questionIndex) {
  const user = getCurrentUser();
  const db = database;
  const question = this.quiz.questions[questionIndex];
  const userAnswer = this.answers[questionIndex];

  // Préparer les données à envoyer à Firebase, y compris les catégories, le thème du quiz et le quizId
  const answerData = {
    question: question.title,
    answer: userAnswer,
    userId: user.uid,
    quizId: this.$route.params.id, // Ajouter l'ID du quiz ici
    timestamp: new Date().toISOString(),
    theme: this.quiz.theme,  // Ajouter le thème du quiz
    mainCategory: this.mainCategory,  // Ajouter la catégorie principale
    subCategory: this.subCategory,  // Ajouter la sous-catégorie
    preciseCategory: this.preciseCategory,  // Ajouter la catégorie précise
    successMessage: "Votre réponse a été envoyée avec succès !"  // Ajouter un suivi pour la soumission
  };

  try {
    const newRef = await push(ref(db, '/answers'), answerData);
    this.successMessages[questionIndex] = "Votre réponse a été envoyée avec succès !";
    this.answers[questionIndex] = "";

    // Store the submitted answer to display it
    this.submittedAnswers[questionIndex] = userAnswer;

    this.listenForFeedback(newRef.key, questionIndex);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse:", error.message);
  }
},

    listenForFeedback(answerKey, questionIndex) {
      const db = database;
      const feedbackPath = `/answers/${answerKey}/feedback`;

      onValue(ref(db, feedbackPath), (snapshot) => {
        const feedback = snapshot.val();
        if (feedback) {
          this.feedbackMessages[questionIndex] = feedback;
        } else {
          this.feedbackMessages[questionIndex] = "Aucun feedback disponible pour le moment.";
        }
      });
    },

    listenForTheory(helpKey) {
      const db = database;
      const feedbackPath = `/help/${helpKey}/theory`;

      onValue(ref(db, feedbackPath), (snapshot) => {
        const theory = snapshot.val();
        if (theory) {
          console.log("Théorie récupérée :", theory); // Vérifiez que la théorie est bien récupérée
          this.theoryExplanation = marked(theory);  // Utiliser 'marked' pour convertir le markdown en HTML
          this.loadingHelp = false;
        } else {
          this.theoryExplanation = "Aucun feedback disponible pour le moment.";
        }
      });
    },

    async sendHelpRequest(index) {
      const db = database;
      const user = getCurrentUser();
      const question = this.quiz.questions[index];

      const helpData = {
        question: question.title,
        userId: user.uid,
        topic: this.quiz.theme,
        timestamp: new Date().toISOString()
      };

      try {
        // Utiliser push() pour générer une clé unique pour chaque requête
        const newHelpRef = push(ref(db, '/help'));
        await update(newHelpRef, helpData);

        console.log("Demande d'aide envoyée pour la question :", question.title);

        // Afficher l'overlay pendant que la théorie est en cours de chargement
        this.currentQuestionIndex = index;
        this.showHelpOverlay = true;
        this.loadingHelp = true;
        this.theoryExplanation = null;

        // Écouter les mises à jour pour la théorie
        this.listenForTheory(newHelpRef.key);

      } catch (error) {
        console.error("Erreur lors de l'envoi de la demande d'aide :", error.message);
      }
    },

    closeHelpOverlay() {
      this.showHelpOverlay = false;
    }
  }
});
</script>

<style scoped>
/* Ergonomic and artistic styling for categories */
.categories {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.category {
  margin-bottom: 10px;
  font-size: 16px;
}

.category-label {
  font-weight: bold;
  color: #2C3E50;
}

/* Success message */
.success-message {
  color: #27ae60;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
}

.help-icon {
  margin-left: 10px;
  cursor: pointer;
  color: #FF7043; 
  font-size: 1.2em;
}

.help-icon:hover {
  color: #FF5722;
}

/* Ergonomic and artistic styling for categories */
.categories {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  background-color: #f2f2f2;
  padding: 15px;
  border-radius: 12px;
}

.category {
  font-size: 18px;
  font-weight: 500;
  margin: 5px 0;
  color: #2c3e50;
}

.category-label {
  font-weight: bold;
  color: #FF7043;
}

.help-icon {
  margin-left: 10px;
  cursor: pointer;
  color: #FF7043; 
  font-size: 1.2em;
}

.help-icon:hover {
  color: #FF5722;
}



.help-icon {
  margin-left: 10px;
  cursor: pointer;
  color: #FF7043; 
  font-size: 1.2em;
}

.help-icon:hover {
  color: #FF5722;
}

.container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Quiz Header */
.quiz-header {
  text-align: center;
  margin-bottom: 50px;
}

.quiz-header h1 {
  font-size: 40px;
  color: #2C3E50;
  font-weight: bold;
}

.quiz-header .quiz-description {
  font-size: 18px;
  color: #7f8c8d;
}

/* Question blocks */
.question-block {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

/* Question titles */
h3 {
  font-size: 24px;
  color: #34495e;
  margin-bottom: 20px;
  font-weight: 500;
}

/* Answer form */
.answer-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.answer-form input[type="text"] {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 18px;
  box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.answer-form input[type="text"]:focus {
  border-color: #FF7043;
  box-shadow: inset 0 2px 8px rgba(52, 152, 219, 0.3);
}

.answer-form button {
  padding: 12px 30px;
  background-color: #FF7043;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.answer-form button:hover {
  background-color: #FF7043;
  box-shadow: 0px 6px 12px rgba(52, 152, 219, 0.2);
}

.buttons {
  display: flex;
  justify-content: space-between;
}

/* Success and feedback messages */
.success {
  color: #27ae60;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
}

.feedback {
  color: #FF7043;
  font-size: 16px;
  margin-top: 10px;
  line-height: 1.5;
  font-weight: 400;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  /* Fond assombri pour l'effet de modal */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
  /* Effet de flou pour l'arrière-plan */
}

.overlay-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  /* Bordures arrondies pour un effet moderne */
  max-width: 800px;
  /* Limitation de la largeur pour éviter un texte trop étiré */
  width: 100%;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  /* Ombre pour donner de la profondeur */
  text-align: left;
  /* Alignement du texte à gauche pour une meilleure lecture */
}

.overlay-content h2 {
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #2c3e50;
  /* Couleur de titre plus douce */
  text-align: center;
  /* Centrage du titre */
}

.overlay-content p {
  font-size: 18px;
  line-height: 1.6;
  /* Meilleure lisibilité du texte */
  color: #34495e;
  /* Texte gris foncé pour une lecture confortable */
  margin-bottom: 20px;
}

.overlay-content button {
  background-color: #ff7043;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  /* Bordure arrondie pour le bouton */
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: block;
  margin: 0 auto;
  /* Centrer le bouton */
}

.overlay-content button:hover {
  background-color: #ff5722;
  transform: translateY(-2px);
  /* Légère animation sur hover */
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 25px;
  }

  .quiz-header h1 {
    font-size: 32px;
  }

  h3 {
    font-size: 20px;
  }

  .answer-form input[type="text"] {
    font-size: 16px;
  }

  .answer-form button {
    padding: 10px 20px;
    font-size: 16px;
  }

  .success,
  .feedback {
    font-size: 14px;
  }

  .overlay-content {
    padding: 30px;
    width: 100%;
  }

  .overlay-content h2 {
    font-size: 24px;
  }

  .overlay-content p {
    font-size: 16px;
  }

  .overlay-content button {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
