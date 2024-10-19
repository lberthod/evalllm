<template>
  <div>
    <h1>Créer un Quiz</h1>
    <p>Nom du quiz:</p>
    <input v-model="quizName" placeholder="Entrez le nom du quiz" />

    <p>Choisissez une catégorie principale:</p>
    <select v-model="selectedMainCategory" @change="onMainCategoryChange">
      <option disabled value="">Sélectionnez une catégorie</option>
      <option v-for="(category, index) in categories" :key="index">
        {{ category.main_category }}
      </option>
    </select>

    <div v-if="subCategories.length > 0">
      <p>Choisissez une sous-catégorie:</p>
      <select v-model="selectedSubCategory" @change="onSubCategoryChange">
        <option disabled value="">Sélectionnez une sous-catégorie</option>
        <option v-for="(subCat, index) in subCategories" :key="index">
          {{ subCat.name }}
        </option>
      </select>
    </div>

    <div v-if="preciseCategories.length > 0">
      <p>Choisissez une catégorie précise:</p>
      <select v-model="selectedPreciseCategory">
        <option disabled value="">Sélectionnez une catégorie précise</option>
        <option v-for="(preciseCat, index) in preciseCategories" :key="index">
          {{ preciseCat }}
        </option>
      </select>
    </div>

    <p>Choisissez le nombre de questions (1-5):</p>
    <input type="number" v-model="numQuestions" min="1" max="5" @input="generateQuestions" />

    <div v-for="(question, index) in questions" :key="index" class="question">
      <label>Question {{ index + 1 }} Title:</label>
      <input v-model="question.title" placeholder="Entrez l'énoncé de la question" />
    </div>

    <button @click="submitQuiz">Soumettre le Quiz</button>
  </div>
</template>

<script>
import { getCurrentUser, saveQuizToFirebase } from '../firebase';
import categoryData from "@/assets/category.json"; // Import categories from local JSON

export default {
  data() {
    return {
      quizName: '',
      numQuestions: 1,
      questions: [],
      categories: [],             // Liste des catégories principales
      subCategories: [],          // Liste des sous-catégories
      preciseCategories: [],      // Liste des catégories précises
      selectedMainCategory: '',   // Catégorie principale sélectionnée
      selectedSubCategory: '',    // Sous-catégorie sélectionnée
      selectedPreciseCategory: '' // Catégorie précise sélectionnée
    };
  },
  methods: {
    generateQuestions() {
      this.questions = [];
      for (let i = 0; i < this.numQuestions; i++) {
        this.questions.push({ title: '' });
      }
    },
    async submitQuiz() {
      const user = getCurrentUser();
      if (user && this.quizName && this.selectedPreciseCategory) {
        const quizData = {
          name: this.quizName,
          category: {
            main: this.selectedMainCategory,
            sub: this.selectedSubCategory,
            precise: this.selectedPreciseCategory
          },
          questions: this.questions
        };
        saveQuizToFirebase(user.uid, quizData);
        alert('Quiz soumis avec succès !');
      } else {
        alert('Vous devez être connecté et remplir tous les champs requis.');
      }
    },
    onMainCategoryChange() {
      const selectedCategory = this.categories.find(
        (cat) => cat.main_category === this.selectedMainCategory
      );
      this.subCategories = selectedCategory ? selectedCategory.sub_categories : [];
      this.selectedSubCategory = '';
      this.preciseCategories = [];
      this.selectedPreciseCategory = '';
    },
    onSubCategoryChange() {
      const selectedSubCat = this.subCategories.find(
        (subCat) => subCat.name === this.selectedSubCategory
      );
      this.preciseCategories = selectedSubCat ? selectedSubCat.precise_categories : [];
      this.selectedPreciseCategory = '';
    },
    // Fetch categories from category.json
    async fetchCategories() {
      try {
        if (categoryData.categories) {
          this.categories = categoryData.categories;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    }
  },
  created() {
    this.fetchCategories(); // Load categories from the JSON file
    this.generateQuestions(); // Generate empty question fields
  }
};
</script>

<style scoped>
.question {
  margin-bottom: 15px;
}

input,
select {
  padding: 10px;
  width: 100%;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
