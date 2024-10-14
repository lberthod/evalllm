<template>
  <div class="hero-container">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1>Explorez votre sentier de connaissances</h1>
        <p>
          Partez à la découverte de nouveaux horizons avec des quiz thématiques
          stimulants. Progressez à chaque étape et débloquez des badges de
          savoir.
        </p>
        <button @click="startQuiz" class="cta-button with-rope">
          Commencez votre aventure
        </button>
        <div class="rope"></div>
      </div>
    </header>

    <!-- Feature Section -->
    <section class="features">
      <div class="feature">
        <h2>Suivez votre propre chemin</h2>
        <p>
          Choisissez des quiz adaptés à vos centres d'intérêt et progressez sur
          des pistes variées, de la science à la culture générale.
        </p>
      </div>
      <div class="feature">
        <h2>Badges et progression</h2>
        <p>
          Gagnez des badges en franchissant des étapes et visualisez votre
          progression sur un sentier personnalisé.
        </p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
      <div class="feature">
        <h2>Accessible partout</h2>
        <p>
          Progressez sur QuizTrail depuis votre ordinateur, tablette ou
          smartphone, peu importe où vous êtes.
        </p>
      </div>
    </section>

    <!-- Example Question Section -->
    <section class="example-quiz">
      <h2>Essayez une question exemple</h2>
      <p class="question-text">{{ question }}</p>

      <form @submit.prevent="submitAnswer">
        <input v-model="userAnswer" type="text" placeholder="Entrez votre réponse..." required />
        <button type="submit" class="cta-button with-rope">Envoyer la réponse</button>
        <br />
        <br />
        <div class="rope"></div>
      </form>

      <!-- Button to show another random question -->
      <button @click="getRandomQuestion" class="cta-button with-rope">
        Afficher une autre question
      </button>

      <p v-if="submitted && successMessage" class="success">{{ successMessage }}</p>
      <p v-if="submitted && feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
    </section>
  </div>
</template>

<script>
import { signInAnonymously } from "firebase/auth";
import { ref, onValue, push } from 'firebase/database';
import { auth, database } from '../firebase';

export default {
  data() {
    return {
      question: "", // Question starts empty to avoid auto-setting
      userAnswer: "",
      successMessage: "",
      feedbackMessage: "",
      submitted: false, // Track if the user has submitted the answer
      progressPercentage: 50, // Example progress percentage for the progress bar
      questionsList: [] // Will store all fetched questions from the database
    };
  },
  mounted() {
    this.checkAuthStatus();
    this.fetchQuestions(); // Fetch questions when the component is mounted
  },
  methods: {
    checkAuthStatus() {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        signInAnonymously(auth)
          .then((result) => {
            console.log("Utilisateur connecté anonymement:", result.user);
          })
          .catch((error) => {
            console.error("Erreur lors de la connexion anonyme:", error.message);
          });
      } else {
        console.log("Utilisateur déjà connecté :", currentUser);
      }
    },
    startQuiz() {
      this.$router.push("/study"); // Navigate to the study/quiz page
    },
    async submitAnswer() {
      const answerData = {
        question: this.question,
        answer: this.userAnswer,
        timestamp: new Date().toISOString(),
      };

      try {
        const newRef = await push(ref(database, "/answers"), answerData);
        if (newRef && newRef.key) {
          this.successMessage = "Votre réponse a été envoyée avec succès !";
          this.userAnswer = ""; // Clear the input after submission
          this.listenForFeedback(newRef.key);
          this.submitted = true; // Set submitted to true to show feedback
        } else {
          console.error("Aucune clé générée pour la nouvelle réponse.");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de la réponse:", error.message);
      }
    },
    listenForFeedback(answerKey) {
      const feedbackPath = `/answers/${answerKey}/feedback`;
      const feedbackRef = ref(database, feedbackPath);

      // Update to properly listen for feedback
      onValue(feedbackRef, (snapshot) => {
        const feedback = snapshot.val();
        if (feedback) {
          this.feedbackMessage = feedback;
          console.log("Feedback mis à jour :", feedback);
        } else {
          this.feedbackMessage = "Aucun feedback disponible pour le moment.";
        }
      });
    },
    fetchQuestions() {
      const quizzesRef = ref(database, '/quizzs2'); // Root path for quizzes
      onValue(quizzesRef, (snapshot) => {
        const quizzesData = snapshot.val();
        this.questionsList = [];

        // Loop over main categories, subcategories, precise categories, and quiz IDs to get the questions
        for (const mainCategory in quizzesData) {
          for (const subCategory in quizzesData[mainCategory]) {
            for (const preciseCategory in quizzesData[mainCategory][subCategory]) {
              for (const quizID in quizzesData[mainCategory][subCategory][preciseCategory]) {
                const quiz = quizzesData[mainCategory][subCategory][preciseCategory][quizID];
                if (quiz.questions) {
                  // Push all questions from this quiz into the questionsList array
                  this.questionsList.push(...quiz.questions.map(question => ({
                    ...question, 
                    mainCategory, 
                    subCategory, 
                    preciseCategory, 
                    quizID, 
                    quizTheme: quiz.theme // Add additional details for each question
                  })));
                }
              }
            }
          }
        }

        // After fetching all questions, get a random one
        this.getRandomQuestion();
      });
    },
    getRandomQuestion() {
      if (this.questionsList.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.questionsList.length);
        const randomQuestion = this.questionsList[randomIndex];
        this.question = randomQuestion.title; // Display the random question
        this.quizMetadata = {
          mainCategory: randomQuestion.mainCategory,
          subCategory: randomQuestion.subCategory,
          preciseCategory: randomQuestion.preciseCategory,
          quizID: randomQuestion.quizID,
          quizTheme: randomQuestion.quizTheme,
        }; // Store the metadata for future use if needed
      } else {
        this.question = "Aucune question disponible pour le moment.";
      }
    },
  }
};

</script>

<style>
/* Main Container */
.hero-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  background-image: url('@/assets/back.png'); /* Custom background image */
  background-size: cover;
  background-position: center;
  padding: 100px 20px;
  color: white;
  text-align: center;
  position: relative;
  z-index: 1;
  border-radius: 12px;
  margin-bottom: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
}

/* CTA Button */
.cta-button {
  padding: 15px 35px;
  font-size: 18px;
  background-color: #FF7043;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 8px 16px rgba(255, 112, 67, 0.3);
}

/* Features Section */
.features {
  display: flex;
  justify-content: space-around;
  margin-bottom: 50px;
}

.feature {
  flex: 1;
  margin: 0 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature h2 {
  font-size: 24px;
  color: #4CAF50;
  margin-bottom: 15px;
}

.feature p {
  font-size: 16px;
  color: #666;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  background-color: #F5F5F5;
  border-radius: 8px;
  margin-top: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.progress {
  height: 10px;
  background-color: #4CAF50;
  width: 50%; /* Dynamic width based on progress */
}

/* Example Quiz Section */
.example-quiz {
  padding: 40px;
  background-color: #F5F5F5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.example-quiz h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #FF7043; /* Orange chaleureux pour attirer l'attention */
}

.question-text {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

input[type="text"] {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  background-color: #fafafa;
}

button {
  padding: 12px 30px;
  background-color: #4CAF50;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #388E3C;
}

.success {
  color: green;
  margin-top: 10px;
  font-size: 16px;
}

.feedback {
  color: #1a73e8;
  font-size: 16px;
  margin-top: 10px;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .features {
    flex-direction: column;
  }

  .feature {
    margin-bottom: 20px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero p {
    font-size: 18px;
  }

  .cta-button {
    font-size: 16px;
    padding: 12px 30px;
  }

  .example-quiz h2 {
    font-size: 24px;
  }
}
</style>
