<template>
  <div class="container">
    <header class="hero">
      <div class="hero-content">
        <h1 class="heading-primary">Parcours de Quiz</h1>
        <p>Choisissez un quiz parmi les catégories disponibles et commencez votre parcours d'étude.</p>
      </div>
    </header>

    <!-- Category Filter Section -->
    <div class="filters">
      <div class="filter-group">
        <p>Filtrer par catégorie principale :</p>
        <select v-model="selectedMainCategory" @change="fetchQuizzesForMainCategory">
          <option disabled value="">Sélectionnez une catégorie</option>
          <option v-for="(category, index) in categories" :key="index">{{ category.main_category }}</option>
        </select>
      </div>

      <div v-if="subCategories && subCategories.length > 0" class="filter-group">
        <p>Filtrer par sous-catégorie :</p>
        <select v-model="selectedSubCategory" @change="fetchQuizzesForSubCategory">
          <option disabled value="">Sélectionnez une sous-catégorie</option>
          <option v-for="(subCat, index) in subCategories" :key="index">{{ subCat.name }}</option>
        </select>
      </div>

      <div v-if="preciseCategories && preciseCategories.length > 0" class="filter-group">
        <p>Filtrer par catégorie précise :</p>
        <select v-model="selectedPreciseCategory" @change="fetchQuizzesForPreciseCategory">
          <option disabled value="">Sélectionnez une catégorie précise</option>
          <option v-for="(preciseCat, index) in preciseCategories" :key="index">{{ preciseCat }}</option>
        </select>
      </div>
    </div>

    <!-- Quiz List -->
    <div v-if="paginatedQuizzes && paginatedQuizzes.length > 0" class="quiz-list">
      <h2>Quizzes disponibles</h2>
      <ul>
        <li v-for="(quiz, index) in paginatedQuizzes" :key="index" class="quiz-item">
          <router-link v-if="quiz.category && quiz.category.main && quiz.category.sub && quiz.category.precise" :to="{
            name: 'QuizView',
            params: {
              mainCategory: quiz.category.main,
              subCategory: quiz.category.sub,
              preciseCategory: quiz.category.precise,
              quizId: quiz.id
            }
          }" class="quiz-button">
            <i class="fas fa-mountain"></i> <!-- Icon representing quiz as a journey -->
            {{ quiz.theme }}
          </router-link>
          <p v-else>Aucune catégorie valide pour ce quiz.</p>
        </li>
      </ul>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button v-if="currentPage > 1" @click="changePage(1)">« Première</button>
        <button v-if="currentPage > 5" @click="changePage(currentPage - 5)">« -5</button>
        <button v-if="currentPage > 10" @click="changePage(currentPage - 10)">« -10</button>
        <button v-if="currentPage > 25" @click="changePage(currentPage - 25)">« -25</button>

        <button v-for="page in visiblePages" :key="page" @click="changePage(page)" :class="{ 'active': page === currentPage }">
          {{ page }}
        </button>

        <button v-if="currentPage + 5 <= totalPages" @click="changePage(currentPage + 5)">+5 »</button>
        <button v-if="currentPage + 10 <= totalPages" @click="changePage(currentPage + 10)">+10 »</button>
        <button v-if="currentPage + 25 <= totalPages" @click="changePage(currentPage + 25)">+25 »</button>

        <button v-if="currentPage < totalPages" @click="changePage(totalPages)">Dernière »</button>
      </div>
    </div>

    <div v-else>
      <p>Aucun quiz disponible pour cette catégorie.</p>
    </div>
  </div>
</template>

<script>
import { getData } from "@/firebase"; // Import Firebase data fetching method
import categoryData from "@/assets/category.json"; // Import categories from local JSON
import { ref } from "vue"; // Import ref from Vue

export default {
  data() {
    return {
      quizzes: [], // List of all quizzes fetched from Firebase
      filteredQuizzes: [], // Quizzes filtered by selected categories
      categories: [], // Main categories
      subCategories: [], // Subcategories
      preciseCategories: [], // Precise categories
      selectedMainCategory: '', // Selected main category
      selectedSubCategory: '', // Selected subcategory
      selectedPreciseCategory: '', // Selected precise category
      quizzesPerPage: 10, // Quizzes per page
      currentPage: 1, // Current page
      visiblePageCount: 5, // Number of pages visible in pagination
      quizRefs: [] // Array to store quiz references
    };
  },
  computed: {
    paginatedQuizzes() {
      if (this.filteredQuizzes && this.filteredQuizzes.length > 0) {
        const start = (this.currentPage - 1) * this.quizzesPerPage;
        const end = start + this.quizzesPerPage;
        return this.filteredQuizzes.slice(start, end);
      }
      return [];
    },
    totalPages() {
      return Math.ceil((this.filteredQuizzes ? this.filteredQuizzes.length : 0) / this.quizzesPerPage);
    },
    visiblePages() {
      const startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePageCount / 2));
      const endPage = Math.min(this.totalPages, startPage + this.visiblePageCount - 1);
      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    fetchQuizzesForMainCategory() {
      this.subCategories = [];
      this.preciseCategories = [];
      this.filteredQuizzes = [];

      const mainCategory = this.selectedMainCategory;

      if (mainCategory) {
        const selectedCategory = this.categories.find(cat => cat.main_category === mainCategory);
        if (selectedCategory) {
          this.subCategories = selectedCategory.sub_categories || [];
        }
      }
    },
    fetchQuizzesForSubCategory() {
      this.preciseCategories = [];
      this.filteredQuizzes = [];

      const subCategory = this.selectedSubCategory;

      if (subCategory) {
        const selectedSubCat = this.subCategories.find(subCat => subCat.name === subCategory);
        if (selectedSubCat) {
          this.preciseCategories = selectedSubCat.precise_categories || [];
        }
      }
    },
    fetchQuizzesForPreciseCategory() {
      this.filteredQuizzes = [];

      const mainCategory = this.selectedMainCategory;
      const subCategory = this.selectedSubCategory;
      const preciseCategory = this.selectedPreciseCategory;

      if (!mainCategory || !subCategory || !preciseCategory) {
        console.error("Catégories incomplètes, impossible de récupérer les quiz.");
        return;
      }

      console.log(`Fetching quizzes for: ${mainCategory}, ${subCategory}, ${preciseCategory}`);
      this.loadQuizzesFromFirebase(mainCategory, subCategory, preciseCategory);
    },
    loadQuizzesFromFirebase(mainCategory, subCategory, preciseCategory) {
      const path = `quizzs2/${mainCategory}/${subCategory}/${preciseCategory}`;

      getData(path).then((snapshot) => {
        const quizzes = [];
        this.quizRefs = [];

        snapshot.forEach(childSnapshot => {
          const quiz = childSnapshot.val();
          quiz.category = {
            main: mainCategory,
            sub: subCategory,
            precise: preciseCategory
          };

          quiz.id = childSnapshot.key;

          const quizRef = ref(null);
          this.quizRefs.push(quizRef);

          quizzes.push({ ...quiz, ref: quizRef });
        });

        this.quizzes = quizzes;
        this.filteredQuizzes = quizzes;
      }).catch((error) => {
        console.error("Erreur lors du chargement des quizzes depuis Firebase : ", error);
      });
    }
  },
  created() {
    if (categoryData.categories) {
      this.categories = categoryData.categories;
    }
  }
};
</script>

<style scoped>
/* Your existing styles */
</style>


<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  /* Center the container */
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  /* Center all text inside the container */
}

/* Hero Section */
.hero {
  margin-bottom: 30px;
  background-color: #0288D1;
  padding: 40px;
  border-radius: 12px;
  color: white;
  text-align: center;
}

.hero h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
}

.hero p {
  font-size: 18px;
  margin-bottom: 0;
  /* Ensure the spacing is consistent */
}

/* Filters */
.filters {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  /* Make the filter groups stacked */
  align-items: center;
  gap: 20px;
}

.filter-group {
  width: 80%;
  /* Center-align filter dropdowns */
  max-width: 600px;
  /* Limit the max width for better alignment */
}

.filter-group p {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  text-align: left;
  /* Align text inside filter group */
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
  border-color: #4CAF50;
  box-shadow: inset 0 2px 8px rgba(76, 175, 80, 0.2);
}

/* Quiz list styles */
.quiz-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  /* Align quiz list text */
}

.quiz-item {
  margin-bottom: 20px;
}

.quiz-button {
  padding: 12px 30px;
  background-color: #FF7043;
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

.quiz-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 6px 12px rgba(255, 112, 67, 0.2);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 5px;
  /* Add some spacing between buttons */
}

.pagination button {
  padding: 8px 12px;
  margin: 5px;
  background-color: #81D4FA;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.pagination button:hover {
  background-color: #0288D1;
  box-shadow: 0px 4px 8px rgba(0, 123, 255, 0.2);
}

.pagination button.active {
  background-color: #0288D1;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  .hero h1 {
    font-size: 28px;
  }

  .filter-group {
    width: 90%;
  }

  .pagination button {
    padding: 6px 10px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .pagination {
    gap: 3px;
  }

  .pagination button {
    padding: 5px 8px;
    font-size: 12px;
  }
}
</style>
