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
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { getCurrentUser, saveQuizToFirebase } from '../firebase';

export default {
  data() {
    return {
      quizName: '',
      numQuestions: 1,
      questions: [],
      quizzes: [],
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
        this.saveCategoryToFirebase(); // Save categories to Firebase
      } else {
        alert('Vous devez être connecté et remplir tous les champs requis.');
      }
    },
    saveCategoryToFirebase() {
      const db = getDatabase();
      const categoryRef = ref(db, `category/${this.selectedMainCategory}`);

      // Prepare the data to save in Firebase
      const categoryData = {
        main_category: this.selectedMainCategory,
        sub_categories: this.subCategories.map(subCat => ({
          name: subCat.name,
          precise_categories: this.preciseCategories
        }))
      };

      set(categoryRef, categoryData).then(() => {
        console.log("Catégorie sauvegardée avec succès !");
      }).catch((error) => {
        console.error("Erreur lors de la sauvegarde de la catégorie:", error);
      });
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
    }
  },
  created() {
    // Charger les quizzes depuis Firebase
    const db = getDatabase();
    const quizzesRef = ref(db, 'quizzes');

    onValue(quizzesRef, (snapshot) => {
      const quizzesData = snapshot.val();
      this.quizzes = quizzesData ? Object.values(quizzesData).flat() : [];
    });

    // Charger les catégories depuis Firebase
    const categoriesRef = ref(db, 'category');

    onValue(categoriesRef, (snapshot) => {
      const categoriesData = snapshot.val();
      this.categories = categoriesData ? categoriesData.categories : [];
    });

    this.generateQuestions();
  }
};
</script>

<style scoped>
.question {
  margin-bottom: 15px;
}
input, select {
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
