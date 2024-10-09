<template>
  <div class="container">
    <h1>Vos Quizzes</h1>
    <div v-if="Object.keys(quizzes).length > 0" class="quiz-list">
      <div v-for="(quiz, id) in quizzes" :key="id" class="quiz-item">
        <div class="quiz-header">
          <h3>{{ quiz.name }}</h3>
          <div class="quiz-actions">
            <a :href="`/quiz/${id}`" class="view-link">Voir le Quiz</a>
            <button @click="editQuiz(id)" class="edit-button">Modifier le Quiz</button>
          </div>
        </div>
        <ul class="question-list">
          <li v-for="(question, index) in quiz.questions" :key="index" class="question-item">
            Question {{ index + 1 }}: {{ question.title }}
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <p>Vous n'avez pas encore de quizzes.</p>
    </div>
  </div>
</template>

<script>
import { getDatabase, ref, onValue } from 'firebase/database';
import { getCurrentUser } from '../firebase';  // Import the getCurrentUser function from firebase.js

export default {
  data() {
    return {
      quizzes: {}  // Liste des quizzes de l'utilisateur
    };
  },
  created() {
    const user = getCurrentUser();  // Use the getCurrentUser function
    if (user) {
      const db = getDatabase();
      const quizzesRef = ref(db, `quizzes/${user.uid}`);
      onValue(quizzesRef, (snapshot) => {
        this.quizzes = snapshot.val() || {};
      });
    }
  },
  methods: {
    editQuiz(quizId) {
      const quizToEdit = { ...this.quizzes[quizId], id: quizId };
      this.$emit('edit-quiz', quizToEdit);  // Emit the selected quiz to parent component
    }
  }
};
</script>

<style scoped>
/* Styling similar to the previous versions */

.quiz-item {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.quiz-item:hover {
  transform: translateY(-5px);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-header h3 {
  font-size: 24px;
  color: #444;
}

.quiz-actions {
  display: flex;
  gap: 10px;
}

/* View and edit buttons */
.view-link {
  color: #007bff;
  text-decoration: none;
  font-size: 16px;
}

.edit-button {
  padding: 10px 20px;
  background-color: #f0ad4e;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: #ec971f;
}
</style>
