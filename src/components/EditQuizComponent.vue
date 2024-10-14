<template>
  <div class="edit-container">
    <h1>Modifier le Quiz</h1>

    <div class="form-group">
      <label for="quizName">Nom du quiz</label>
      <input v-model="quizName" type="text" id="quizName" placeholder="Nom du quiz" />
    </div>

    <div class="form-group">
      <h3>Questions</h3>
      <div v-for="(question, index) in questions" :key="index" class="question-item">
        <label for="question-{{ index }}">Question {{ index + 1 }}</label>
        <input v-model="questions[index].title" :id="'question-' + index" type="text" placeholder="Titre de la question" />
      </div>
    </div>

    <div class="button-group">
      <button @click="saveQuiz" class="cta-button">Enregistrer les modifications</button>
      <button class="cancel-button" @click="cancelEdit">Annuler</button>
    </div>
  </div>
</template>

<script>
import { ref, update } from 'firebase/database';
import { getCurrentUser, database } from '../firebase';

export default {
  data() {
    return {
      quizId: '',        // ID du quiz en cours de modification
      quizName: '',      // Nom du quiz
      questions: [],     // Liste des questions
    };
  },
  props: {
    selectedQuiz: Object,  // Le quiz sélectionné à modifier
  },
  created() {
    this.loadQuizData();
  },
  methods: {
    loadQuizData() {
      this.quizId = this.selectedQuiz.id;
      this.quizName = this.selectedQuiz.name;
      this.questions = this.selectedQuiz.questions;
    },
    async saveQuiz() {
      const user = getCurrentUser();
      const db = database;
      const quizRef = ref(db, `quizzes/${user.uid}/${this.quizId}`);
      
      const updatedQuiz = {
        name: this.quizName,
        questions: this.questions
      };
      
      try {
        await update(quizRef, updatedQuiz);
        alert('Quiz modifié avec succès');
        this.$emit('cancel-edit');  // Emit event to parent component to return to quiz view
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du quiz:", error.message);
      }
    },
    cancelEdit() {
      this.$emit('cancel-edit');  // Emit event to parent component to return to quiz view
    }
  }
};
</script>

<style scoped>
/* Main Container */
.edit-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #e0e0e0;
}

/* Title */
h1 {
  font-size: 32px;
  margin-bottom: 30px;
  color: #333;
}

/* Form Group */
.form-group {
  margin-bottom: 25px;
  text-align: left;
}

label {
  font-size: 18px;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  margin-top: 10px;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* Button Group */
.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

/* CTA Button */
.cta-button {
  padding: 12px 30px;
  font-size: 16px;
  background-color: #FF7043;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.cta-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 8px 16px rgba(255, 112, 67, 0.3);
  transform: translateY(-2px);
}

/* Cancel Button */
.cancel-button {
  padding: 12px 30px;
  font-size: 16px;
  background-color: #e74c3c;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #c0392b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .edit-container {
    padding: 20px;
  }

  h1 {
    font-size: 28px;
  }

  input {
    font-size: 14px;
  }

  .cta-button, .cancel-button {
    font-size: 14px;
    padding: 10px 25px;
  }
}
</style>
