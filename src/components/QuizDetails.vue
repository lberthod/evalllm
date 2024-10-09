<template>
    <div class="container">
      <div v-if="quiz">
        <h1>{{ quiz.name }}</h1>
        <div v-for="(question, index) in quiz.questions" :key="index" class="question-block">
          <h3>Question {{ index + 1 }}: {{ question.title }}</h3>
    
          <form @submit.prevent="submitAnswer(index)" class="answer-form">
            <input v-model="answers[index]" type="text" placeholder="Votre réponse..." required />
            <button type="submit">Envoyer</button>
          </form>
    
          <p v-if="successMessages[index]" class="success">{{ successMessages[index] }}</p>
          <p v-if="feedbackMessages[index]" class="feedback">{{ feedbackMessages[index] }}</p>
        </div>
      </div>
      <div v-else>
        <p>Chargement du quiz...</p>
      </div>
    </div>
  </template>
  
  <script>
  import { getDatabase, ref, onValue, push } from 'firebase/database';
  import { getCurrentUser } from '@/firebase';
  
  export default {
    data() {
      return {
        quiz: null,  // Stocker les détails du quiz ici
        answers: [],  // Stocker les réponses des utilisateurs
        successMessages: [],  // Messages de succès après la soumission
        feedbackMessages: []  // Messages de feedback après avoir reçu des commentaires de Firebase
      };
    },
    created() {
      const quizId = this.$route.params.id;
      const db = getDatabase();
      
      // Rechercher le quiz par son ID dans Firebase
      const quizzesRef = ref(db, `quizzes`);
      onValue(quizzesRef, (snapshot) => {
        const quizzesData = snapshot.val();
        let foundQuiz = null;
  
        if (quizzesData) {
          // Rechercher dans tous les quizzes l'ID correspondant
          Object.values(quizzesData).forEach(userQuizzes => {
            if (userQuizzes[quizId]) {
              foundQuiz = userQuizzes[quizId];
            }
          });
        }
  
        this.quiz = foundQuiz;
      });
    },
    methods: {
      async submitAnswer(questionIndex) {
        const user = getCurrentUser();
        const db = getDatabase();
        const question = this.quiz.questions[questionIndex];
        const userAnswer = this.answers[questionIndex];
        
        // Créer les données de réponse
        const answerData = {
          question: question.title,
          answer: userAnswer,
          userId: user.uid,
          timestamp: new Date().toISOString()
        };
  
        try {
          // Envoyer la réponse à Firebase
          const newRef = await push(ref(db, '/answers'), answerData);
  
          // Enregistrer le message de succès
          this.successMessages[questionIndex] = "Votre réponse a été envoyée avec succès !";
          this.answers[questionIndex] = "";  // Réinitialiser la réponse après l'envoi
  
          // Écouter le feedback pour cette réponse
          this.listenForFeedback(newRef.key, questionIndex);
        } catch (error) {
          console.error("Erreur lors de l'envoi de la réponse:", error.message);
        }
      },
      listenForFeedback(answerKey, questionIndex) {
        const db = getDatabase();
        const feedbackPath = `/answers/${answerKey}/feedback`;
  
        // Écouter les mises à jour du feedback dans Firebase
        onValue(ref(db, feedbackPath), (snapshot) => {
          const feedback = snapshot.val();
          if (feedback) {
            this.feedbackMessages[questionIndex] = feedback;
          } else {
            this.feedbackMessages[questionIndex] = "Aucun feedback disponible pour le moment.";
          }
        });
      }
    }
  };
  </script>
  
  <style scoped>
  /* Container for the quiz */
  .container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 30px;
    background-color: #f0f4f8;
    border-radius: 12px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
  }
  
  /* Header styles */
  h1 {
    text-align: center;
    font-size: 36px;
    color: #333;
    margin-bottom: 40px;
    font-weight: bold;
  }
  
  /* Question blocks */
  .question-block {
    background-color: #ffffff;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 25px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
  }
  
  .question-block:hover {
    transform: translateY(-5px);
  }
  
  /* Question titles */
  h3 {
    font-size: 22px;
    color: #444;
    margin-bottom: 20px;
    font-weight: 500;
  }
  
  /* Form styles */
  .answer-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  /* Input field styles */
  input[type="text"] {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  input[type="text"]:focus {
    border-color: #007bff;
    box-shadow: inset 0 2px 8px rgba(0, 123, 255, 0.2);
  }
  
  /* Button styles */
  button {
    padding: 12px 30px;
    background-color: #007bff;
    color: white;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
    box-shadow: 0px 6px 12px rgba(0, 123, 255, 0.2);
  }
  
  /* Success and feedback messages */
  .success {
    color: green;
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .feedback {
    color: #1a73e8;
    font-size: 16px;
    margin-top: 10px;
    line-height: 1.5;
    font-weight: 400;
  }
  
  /* Responsive design for smaller screens */
  @media (max-width: 768px) {
    .container {
      padding: 20px;
    }
  
    h1 {
      font-size: 30px;
    }
  
    h3 {
      font-size: 18px;
    }
  
    input[type="text"] {
      font-size: 14px;
    }
  
    button {
      padding: 10px 20px;
      font-size: 14px;
    }
  
    .success, .feedback {
      font-size: 14px;
    }
  }
  </style>
  