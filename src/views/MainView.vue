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
import { ref, push, onValue } from 'firebase/database';
import { database } from '../firebase';

export default {
  data() {
    return {
      question: "", // Start empty
      userAnswer: "",
      successMessage: "",
      feedbackMessage: "",
      submitted: false, // Track if the user has submitted the answer
      progressPercentage: 50, // Example progress percentage for the progress bar
      questionsList: [
        {
          title: "Quelle est la capitale de la France?",
          mainCategory: "Geography",
          subCategory: "Europe",
          preciseCategory: "France",
          quizID: "quiz1",
          quizTheme: "Geography Quiz"
        },
        {
          title: "Quelle est la formule chimique de l'eau?",
          mainCategory: "Science",
          subCategory: "Chemistry",
          preciseCategory: "Basic Compounds",
          quizID: "quiz2",
          quizTheme: "Science Quiz"
        },
        {
          title: "Quelle est la capitale de la France?",
          mainCategory: "Geography",
          subCategory: "Europe",
          preciseCategory: "France",
          quizID: "quiz1",
          quizTheme: "Geography Quiz"
        },
        {
          title: "Quelle est la formule chimique de l'eau?",
          mainCategory: "Science",
          subCategory: "Chemistry",
          preciseCategory: "Basic Compounds",
          quizID: "quiz2",
          quizTheme: "Science Quiz"
        },
        {
          title: "Qui a écrit 'Les Misérables'?",
          mainCategory: "Literature",
          subCategory: "French Literature",
          preciseCategory: "Classics",
          quizID: "quiz3",
          quizTheme: "Literature Quiz"
        },
        {
          title: "En quelle année a eu lieu la révolution française?",
          mainCategory: "History",
          subCategory: "France",
          preciseCategory: "Revolutions",
          quizID: "quiz4",
          quizTheme: "History Quiz"
        },
        {
          title: "Quelle est la plus grande planète du système solaire?",
          mainCategory: "Science",
          subCategory: "Astronomy",
          preciseCategory: "Planets",
          quizID: "quiz5",
          quizTheme: "Astronomy Quiz"
        },
        {
          title: "Qui est le fondateur de Microsoft?",
          mainCategory: "Technology",
          subCategory: "Tech Companies",
          preciseCategory: "Founders",
          quizID: "quiz6",
          quizTheme: "Tech Quiz"
        },
        {
          title: "Dans quel pays se trouve la ville de Tokyo?",
          mainCategory: "Geography",
          subCategory: "Asia",
          preciseCategory: "Japan",
          quizID: "quiz7",
          quizTheme: "Geography Quiz"
        },
        {
          title: "Quelle est la monnaie officielle des États-Unis?",
          mainCategory: "Economy",
          subCategory: "Currencies",
          preciseCategory: "North America",
          quizID: "quiz8",
          quizTheme: "Economy Quiz"
        },
        {
          title: "Quelle est la langue officielle du Brésil?",
          mainCategory: "Languages",
          subCategory: "South America",
          preciseCategory: "Brazil",
          quizID: "quiz9",
          quizTheme: "Language Quiz"
        },
        {
          title: "Quel est le plus haut sommet du monde?",
          mainCategory: "Geography",
          subCategory: "Mountains",
          preciseCategory: "World",
          quizID: "quiz10",
          quizTheme: "Geography Quiz"
        },
        {
          title: "Qui a peint la 'Joconde'?",
          mainCategory: "Art",
          subCategory: "Renaissance",
          preciseCategory: "Italy",
          quizID: "quiz11",
          quizTheme: "Art Quiz"
        },
        {
          title: "Quel est le symbole chimique du fer?",
          mainCategory: "Science",
          subCategory: "Chemistry",
          preciseCategory: "Elements",
          quizID: "quiz12",
          quizTheme: "Chemistry Quiz"
        },
        {
          title: "En quelle année a eu lieu le premier vol sur la lune?",
          mainCategory: "History",
          subCategory: "Space",
          preciseCategory: "Moon Landing",
          quizID: "quiz13",
          quizTheme: "History Quiz"
        },
        {
          title: "Combien de côtés a un hexagone?",
          mainCategory: "Mathematics",
          subCategory: "Geometry",
          preciseCategory: "Shapes",
          quizID: "quiz14",
          quizTheme: "Math Quiz"
        },
        {
          title: "Quel est le plus grand océan du monde?",
          mainCategory: "Geography",
          subCategory: "Oceans",
          preciseCategory: "World",
          quizID: "quiz15",
          quizTheme: "Geography Quiz"
        },
        {
          title: "Quelle est la capitale de l'Italie?",
          mainCategory: "Geography",
          subCategory: "Europe",
          preciseCategory: "Italy",
          quizID: "quiz16",
          quizTheme: "Geography Quiz"
        },
        {
          title: "Quelle est l'œuvre la plus célèbre de Shakespeare?",
          mainCategory: "Literature",
          subCategory: "English Literature",
          preciseCategory: "Classics",
          quizID: "quiz17",
          quizTheme: "Literature Quiz"
        },
        {
          title: "Quel est le sport national du Brésil?",
          mainCategory: "Sports",
          subCategory: "Team Sports",
          preciseCategory: "Brazil",
          quizID: "quiz18",
          quizTheme: "Sports Quiz"
        },
        {
          title: "Quel est le symbole chimique du sodium?",
          mainCategory: "Science",
          subCategory: "Chemistry",
          preciseCategory: "Elements",
          quizID: "quiz19",
          quizTheme: "Chemistry Quiz"
        },
        {
          title: "Quel est le plus petit pays du monde?",
          mainCategory: "Geography",
          subCategory: "World",
          preciseCategory: "Microstates",
          quizID: "quiz20",
          quizTheme: "Geography Quiz"
        }
        // More questions...
      ], // Liste statique de questions
      firstLoad: true, // Track if it's the first time loading questions
    };
  },
  mounted() {
    this.getRandomQuestion(); // Get a random question when the component is mounted
  },
  methods: {
    async submitAnswer() {
      const answerData = {
        question: this.question, // Keep the current question
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
    getRandomQuestion() {
      if (this.questionsList.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.questionsList.length);
        const randomQuestion = this.questionsList[randomIndex];
        this.question = randomQuestion.title; // Display the random question
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
