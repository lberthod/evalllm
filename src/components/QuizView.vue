<template>
  <div class="quiz-list-container">
    <header>
      <div class="hero-content">
        <h1>Vos Quizzes</h1>
        <p>Gérez et visualisez vos quizzes pour suivre votre progression.</p>
        <div class="rope"></div> <!-- Effet de corde pour l'engagement visuel -->
      </div>
    </header>

    <section v-if="Object.keys(quizzes).length > 0" class="quiz-list">
      <div v-for="(quiz, id) in quizzes" :key="id" class="quiz-item">
        <div class="quiz-header">
          <h3>{{ quiz.name }}</h3>
          <div class="quiz-actions">
            <a :href="`/quiz/${id}`" class="cta-button with-rope view-button">Voir le Quiz</a>
            <button @click="editQuiz(id)" class="cta-button with-rope">Modifier le Quiz</button>
          </div>
        </div>
        <ul class="question-list">
          <li v-for="(question, index) in quiz.questions" :key="index" class="question-item">
            Question {{ index + 1 }}: {{ question.title }}
          </li>
        </ul>
      </div>
    </section>

    <div v-else class="no-quizzes">
      <p>Vous n'avez pas encore de quizzes.</p>
    </div>
  </div>
</template>

<script>
import { ref, onValue } from 'firebase/database';
import { getCurrentUser, database } from '../firebase';

export default {
  data() {
    return {
      quizzes: {}
    };
  },
  created() {
    const user = getCurrentUser();
    if (user) {
      const quizzesRef = ref(database, `quizzes/${user.uid}`);
      onValue(quizzesRef, (snapshot) => {
        this.quizzes = snapshot.val() || {};
      });
    }
  },
  methods: {
    editQuiz(quizId) {
      const quizToEdit = { ...this.quizzes[quizId], id: quizId };
      this.$emit('edit-quiz', quizToEdit);
    }
  }
};
</script>

<style scoped>
/* Container and Hero Section */
.quiz-list-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  background-image: url('@/assets/back.png');
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

/* Quiz Item Styling */
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
  gap: 15px;
}

/* View and edit buttons */
.view-link {
  color: #007bff;
  text-decoration: none;
  font-size: 16px;
}

.cta-button {
  padding: 12px 30px;
  font-size: 16px;
  background-color: #FF7043; /* Orange chaleureux */
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

.with-rope {
  position: relative;
}

/* Rope animation */
.rope {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 4px;
  background-color: #FF7043;
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

/* No quizzes message */
.no-quizzes {
  font-size: 18px;
  color: #555;
  margin-top: 40px;
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
    font-size: 14px;
    padding: 10px 25px;
  }

  .quiz-header h3 {
    font-size: 20px;
  }

  .quiz-actions {
    flex-direction: column;
  }
}
</style>
