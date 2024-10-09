<template>
  <div class="container">
    <h1>Gestion des Quizzes</h1>
    
    <div class="button-group">
      <button 
        :class="{'active': currentView === 'QuizPage'}" 
        @click="currentView = 'QuizPage'"
      >
        Créer un Quiz
      </button>
      <button 
        :class="{'active': currentView === 'QuizView'}" 
        @click="currentView = 'QuizView'"
      >
        Voir vos Quizzes
      </button>
    </div>

    <!-- Switch between different views (QuizPage, QuizView, EditQuizComponent) -->
    <component :is="currentView" :selected-quiz="selectedQuiz" @edit-quiz="handleEditQuiz"></component>
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
/* Container for the quiz management page */
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Page title */
h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 30px;
  font-weight: bold;
}

/* Form input fields */
input, select {
  width: 70%; /* Increase width to make inputs wider */
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
}

/* Button styles */
button {
  padding: 12px 30px;
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  font-weight: 600;
}

/* Active button styles */
button.active {
  background-color: #0056b3;
  box-shadow: 0px 6px 12px rgba(0, 123, 255, 0.3);
}

/* Hover effect for buttons */
button:hover {
  background-color: #0056b3;
  box-shadow: 0px 8px 16px rgba(0, 123, 255, 0.2);
  transform: translateY(-2px);
}

/* Form group and responsive tweaks */
.form-group {
  margin-bottom: 25px;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  h1 {
    font-size: 30px;
  }

  input, select {
    width: 100%; /* Full width on mobile devices */
  }

  button {
    font-size: 16px;
    padding: 10px 25px;
  }

  .button-group {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
