<template>
    <div class="container">
      <h1>Liste des Quizzes</h1>
  
      <!-- Category Filter Section -->
      <div class="filters">
        <div class="filter-group">
          <p>Filtrer par catégorie principale:</p>
          <select v-model="selectedMainCategory" @change="onMainCategoryChange">
            <option disabled value="">Sélectionnez une catégorie</option>
            <option v-for="(category, index) in categories" :key="index">{{ category.main_category }}</option>
          </select>
        </div>
  
        <div v-if="subCategories.length > 0" class="filter-group">
          <p>Filtrer par sous-catégorie:</p>
          <select v-model="selectedSubCategory" @change="onSubCategoryChange">
            <option disabled value="">Sélectionnez une sous-catégorie</option>
            <option v-for="(subCat, index) in subCategories" :key="index">{{ subCat.name }}</option>
          </select>
        </div>
  
        <div v-if="preciseCategories.length > 0" class="filter-group">
          <p>Filtrer par catégorie précise:</p>
          <select v-model="selectedPreciseCategory">
            <option disabled value="">Sélectionnez une catégorie précise</option>
            <option v-for="(preciseCat, index) in preciseCategories" :key="index">{{ preciseCat }}</option>
          </select>
        </div>
      </div>
  
      <!-- Quiz List -->
      <div v-if="filteredQuizzes.length > 0" class="quiz-list">
        <h2>Your Quizzes</h2>
        <ul>
          <li v-for="(quiz, index) in filteredQuizzes" :key="index" class="quiz-item">
            <button @click="viewQuiz(quiz.id)">{{ quiz.name }}</button>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>Pas de quizzes disponibles.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { getDatabase, ref, onValue } from 'firebase/database';
  
  export default {
    data() {
      return {
        quizzes: [],             // Liste des quizzes depuis Firebase
        filteredQuizzes: [],     // Liste des quizzes filtrés
        categories: [],          // Liste des catégories principales
        subCategories: [],       // Liste des sous-catégories
        preciseCategories: [],   // Liste des catégories précises
        selectedMainCategory: '',// Catégorie principale sélectionnée
        selectedSubCategory: '', // Sous-catégorie sélectionnée
        selectedPreciseCategory: '' // Catégorie précise sélectionnée
      };
    },
    methods: {
      viewQuiz(quizId) {
        this.$router.push({ name: 'QuizDetails', params: { id: quizId } });
      },
      onMainCategoryChange() {
        // Filtrer les sous-catégories basées sur la catégorie principale
        const selectedCategory = this.categories.find(cat => cat.main_category === this.selectedMainCategory);
        this.subCategories = selectedCategory ? selectedCategory.sub_categories : [];
        this.selectedSubCategory = '';
        this.preciseCategories = [];
        this.selectedPreciseCategory = '';
        this.filterQuizzes(); // Apply filtering
      },
      onSubCategoryChange() {
        // Filtrer les catégories précises basées sur la sous-catégorie
        const selectedSubCat = this.subCategories.find(subCat => subCat.name === this.selectedSubCategory);
        this.preciseCategories = selectedSubCat ? selectedSubCat.precise_categories : [];
        this.selectedPreciseCategory = '';
        this.filterQuizzes(); // Apply filtering
      },
      filterQuizzes() {
        // Filtrer les quizzes en fonction des catégories sélectionnées
        this.filteredQuizzes = this.quizzes.filter(quiz => {
          // Vérification si le quiz a une catégorie définie avant de tenter d'y accéder
          const hasCategory = quiz.category && quiz.category.main;
          if (!hasCategory) {
            return false; // Si pas de catégorie, on ignore ce quiz
          }
          const matchMain = this.selectedMainCategory ? quiz.category.main === this.selectedMainCategory : true;
          const matchSub = this.selectedSubCategory ? quiz.category.sub === this.selectedSubCategory : true;
          const matchPrecise = this.selectedPreciseCategory ? quiz.category.precise === this.selectedPreciseCategory : true;
          return matchMain && matchSub && matchPrecise;
        });
      }
    },
    created() {
      const db = getDatabase();
      
      // Charger les quizzes depuis Firebase
      const quizzesRef = ref(db, 'quizzes');
      onValue(quizzesRef, (snapshot) => {
        const quizzesData = snapshot.val();
        this.quizzes = [];
        if (quizzesData) {
          Object.entries(quizzesData).forEach(([, userQuizzes]) => {
            Object.entries(userQuizzes).forEach(([quizId, quiz]) => {
              // Si un quiz n'a pas de catégorie définie, ignorer cette entrée
              if (quiz.category) {
                this.quizzes.push({ ...quiz, id: quizId });
              }
            });
          });
        }
        this.filteredQuizzes = this.quizzes; // Set filtered quizzes initially
      });
  
      // Charger les catégories depuis Firebase
      const categoriesRef = ref(db, 'category');
      onValue(categoriesRef, (snapshot) => {
        const categoriesData = snapshot.val();
        this.categories = categoriesData ? categoriesData.categories : [];
      });
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 30px;
    background-color: #f0f4f8;
    border-radius: 12px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    font-size: 36px;
    color: #333;
    margin-bottom: 30px;
    font-weight: bold;
  }
  
  .filters {
    margin-bottom: 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group p {
    font-size: 18px;
    color: #555;
    margin-bottom: 8px;
  }
  
  select {
    padding: 12px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
    background-color: #fff;
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  select:focus {
    border-color: #007bff;
    box-shadow: inset 0 2px 8px rgba(0, 123, 255, 0.2);
  }
  
  /* Quiz list styles */
  .quiz-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .quiz-item {
    margin-bottom: 20px;
  }
  
  .quiz-item button {
    padding: 12px 30px;
    background-color: #007bff;
    color: white;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    width: 100%;
    text-align: left;
  }
  
  .quiz-item button:hover {
    background-color: #0056b3;
    box-shadow: 0px 6px 12px rgba(0, 123, 255, 0.2);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      padding: 20px;
    }
  
    .filters {
      flex-direction: column;
      gap: 15px;
    }
  
    h1 {
      font-size: 30px;
    }
  
    .quiz-item button {
      font-size: 14px;
    }
  }
  </style>
  