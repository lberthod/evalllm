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
        <button @click="saveQuiz">Enregistrer les modifications</button>
        <button class="cancel" @click="cancelEdit">Annuler</button>
      </div>
    </div>
  </template>
  
  <script>
  import {  ref, update } from 'firebase/database';
  import { getCurrentUser , database} from '../firebase';
  
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
  /* Same styling as before */
  .edit-container {
    max-width: 800px;
    margin: 50px auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
  }
  
  h1 {
    font-size: 32px;
    margin-bottom: 30px;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 25px;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    margin-top: 10px;
    font-size: 16px;
  }
  
  .button-group {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
  
  button {
    padding: 12px 30px;
    font-size: 16px;
    background-color: #3498db;
    color: white;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #1e72a3;
  }
  
  button.cancel {
    background-color: #e74c3c;
  }
  
  button.cancel:hover {
    background-color: #c0392b;
  }
  </style>
  