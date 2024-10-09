<template>
    <div v-if="currentQuestion">
      <h2>Question 1</h2>
      <p>{{ currentQuestion.title }}</p>
      <input v-model="answer" placeholder="Votre réponse" />
      <button @click="submitAnswer">Soumettre</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      quiz: Object
    },
    data() {
      return {
        currentQuestion: null,
        answer: ''
      };
    },
    created() {
      // Charger la première question du quiz
      if (this.quiz && this.quiz.questions && this.quiz.questions.length > 0) {
        this.currentQuestion = this.quiz.questions[0];
      }
    },
    methods: {
      submitAnswer() {
        console.log(`Réponse soumise : ${this.answer}`);
        alert('Votre réponse a été soumise');
      }
    }
  };
  </script>
  
  <style scoped>
  input {
    padding: 10px;
    width: 100%;
    margin-bottom: 15px;
  }
  button {
    padding: 10px 20px;
    font-size: 16px;
  }
  </style>
  