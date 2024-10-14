<template>
  <div class="quiz-management-container">
    <!-- Hero Section for Quiz Management -->
    <header class="hero">
      <div class="hero-content">
        <h1>Dashboard</h1>
        <p>Créez et gérez vos quizzes avec facilité, et suivez votre progression pédagogique.</p>
        <div class="rope"></div> <!-- Corde pour l'effet -->
      </div>
    </header>

    <!-- Button Group for switching views -->
    <section class="button-group">
      <button 
        :class="{'active': currentView === 'QuizPage'}" 
        @click="currentView = 'QuizPage'"
        class="cta-button with-rope"
      >
        Créer un Quiz
      </button>
      <button 
        :class="{'active': currentView === 'QuizView'}" 
        @click="currentView = 'QuizView'"
        class="cta-button with-rope"
      >
        Voir vos Quizzes
      </button>
      <div class="rope"></div> <!-- Corde pour l'effet -->
    </section>

    <!-- Display different views -->
    <section class="view-section">
      <component :is="currentView" :selected-quiz="selectedQuiz" @edit-quiz="handleEditQuiz"></component>
    </section>
  </div>
</template>

<script>
// Import components
import QuizPage from '../components/QuizPage.vue';
import QuizView from '../components/QuizView.vue';
import EditQuizComponent from '../components/EditQuizComponent.vue';

export default {
  data() {
    return {
      currentView: 'QuizPage',  // Default view
      selectedQuiz: null        // The quiz selected for editing
    };
  },
  components: {
    QuizPage,
    QuizView,
    EditQuizComponent
  },
  methods: {
    handleEditQuiz(quiz) {
      this.selectedQuiz = quiz;
      this.currentView = 'EditQuizComponent'; // Switch to edit mode
    }
  }
};
</script>

<style scoped>
/* Main Container */
.quiz-management-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  background-image: url('@/assets/back.png'); /* Image de fond */
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

/* Button Group */
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.cta-button {
  padding: 15px 35px;
  font-size: 18px;
  background-color: #FF7043; /* Orange chaleureux */
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.cta-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 8px 16px rgba(255, 112, 67, 0.3);
  transform: translateY(-2px);
}

.with-rope {
  position: relative;
}

/* Rope animation */
.rope {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 4px;
  background-color: #FF7043; /* Same as button color */
  width: 0;
  transition: width 0.4s ease-in-out, transform 0.2s ease;
  transform-origin: left;
}

.cta-button:active ~ .rope {
  width: 100%;
  transform: translateX(-50%) rotate(10deg);
  animation: wiggle 0.5s ease infinite;
}

/* Wiggle animation for the rope */
@keyframes wiggle {
  0%, 100% {
    transform: translateX(-50%) rotate(10deg);
  }
  50% {
    transform: translateX(-50%) rotate(-10deg);
  }
}

/* View Section */
.view-section {
  margin-top: 40px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
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

  .button-group {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
