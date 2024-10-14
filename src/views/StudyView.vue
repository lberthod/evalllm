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

      <div v-if="subCategories.length > 0" class="filter-group">
        <p>Filtrer par sous-catégorie :</p>
        <select v-model="selectedSubCategory" @change="fetchQuizzesForSubCategory">
          <option disabled value="">Sélectionnez une sous-catégorie</option>
          <option v-for="(subCat, index) in subCategories" :key="index">{{ subCat.name }}</option>
        </select>
      </div>

      <div v-if="preciseCategories.length > 0" class="filter-group">
        <p>Filtrer par catégorie précise :</p>
        <select v-model="selectedPreciseCategory" @change="fetchQuizzesForPreciseCategory">
          <option disabled value="">Sélectionnez une catégorie précise</option>
          <option v-for="(preciseCat, index) in preciseCategories" :key="index">{{ preciseCat }}</option>
        </select>
      </div>
    </div>

    <!-- Quiz List -->
    <div v-if="paginatedQuizzes.length > 0" class="quiz-list">
      <h2>Quizzes disponibles</h2>
      <ul>
        <li v-for="(quiz, index) in paginatedQuizzes" :key="index" class="quiz-item">
          <button @click="viewQuiz(quiz.id)" class="quiz-button">
            <i class="fas fa-mountain"></i> <!-- Icon representing quiz as a journey -->
            {{ quiz.theme }}
          </button>
        </li>
      </ul>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button v-if="currentPage > 1" @click="changePage(1)">« Première</button>
        <button v-if="currentPage > 5" @click="changePage(currentPage - 5)">« -5</button>
        <button v-if="currentPage > 10" @click="changePage(currentPage - 10)">« -10</button>
        <button v-if="currentPage > 25" @click="changePage(currentPage - 25)">« -25</button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{ 'active': page === currentPage }"
        >
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
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

export default {
  data() {
    return {
      quizzes: [], // List of all quizzes from Firebase
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
    };
  },
  computed: {
    paginatedQuizzes() {
      const start = (this.currentPage - 1) * this.quizzesPerPage;
      const end = start + this.quizzesPerPage;
      return this.filteredQuizzes.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredQuizzes.length / this.quizzesPerPage);
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
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    viewQuiz(quizId) {
      this.$router.push({ name: 'QuizDetails', params: { id: quizId } });
    },
    fetchQuizzesForMainCategory() {
      this.filteredQuizzes = [];
      this.subCategories = [];
      this.preciseCategories = [];

      const mainCategory = this.selectedMainCategory;

      if (mainCategory) {
        // Fetch quizzes for the selected main category
        const quizzesRef = ref(database, `quizzs2/${mainCategory}`);
        onValue(quizzesRef, (snapshot) => {
          const quizzesData = snapshot.val();
          if (quizzesData) {
            this.filteredQuizzes = [];
            Object.entries(quizzesData).forEach(([subCategoryName, preciseCategoriesObj]) => {
              Object.entries(preciseCategoriesObj).forEach(([preciseCategoryName, quizObj]) => {
                Object.entries(quizObj).forEach(([quizId, quiz]) => {
                  this.filteredQuizzes.push({
                    ...quiz,
                    id: quizId,
                    category: { main: mainCategory, sub: subCategoryName, precise: preciseCategoryName }
                  });
                });
              });
            });
            this.currentPage = 1;
          }
        });

        // Set subcategories based on the selected main category
        const selectedCategory = this.categories.find(cat => cat.main_category === this.selectedMainCategory);
        this.subCategories = selectedCategory ? selectedCategory.sub_categories : [];
      }
    },
    fetchQuizzesForSubCategory() {
      this.filteredQuizzes = [];
      this.preciseCategories = [];

      const mainCategory = this.selectedMainCategory;
      const subCategory = this.selectedSubCategory;

      if (mainCategory && subCategory) {
        // Fetch quizzes for the selected subcategory
        const quizzesRef = ref(database, `quizzs2/${mainCategory}/${subCategory}`);
        onValue(quizzesRef, (snapshot) => {
          const quizzesData = snapshot.val();
          if (quizzesData) {
            this.filteredQuizzes = [];
            Object.entries(quizzesData).forEach(([preciseCategoryName, quizObj]) => {
              Object.entries(quizObj).forEach(([quizId, quiz]) => {
                this.filteredQuizzes.push({
                  ...quiz,
                  id: quizId,
                  category: { main: mainCategory, sub: subCategory, precise: preciseCategoryName }
                });
              });
            });
            this.currentPage = 1;
          }
        });

        // Set precise categories based on the selected subcategory
        const selectedSubCat = this.subCategories.find(subCat => subCat.name === this.selectedSubCategory);
        this.preciseCategories = selectedSubCat ? selectedSubCat.precise_categories : [];
      }
    },
    fetchQuizzesForPreciseCategory() {
      this.filteredQuizzes = [];

      const mainCategory = this.selectedMainCategory;
      const subCategory = this.selectedSubCategory;
      const preciseCategory = this.selectedPreciseCategory;

      if (mainCategory && subCategory && preciseCategory) {
        // Fetch quizzes for the selected precise category
        const quizzesRef = ref(database, `quizzs2/${mainCategory}/${subCategory}/${preciseCategory}`);
        onValue(quizzesRef, (snapshot) => {
          const quizzesData = snapshot.val();
          if (quizzesData) {
            this.filteredQuizzes = [];
            Object.entries(quizzesData).forEach(([quizId, quiz]) => {
              this.filteredQuizzes.push({
                ...quiz,
                id: quizId,
                category: { main: mainCategory, sub: subCategory, precise: preciseCategory }
              });
            });
            this.currentPage = 1;
          }
        });
      }
    }
  },
  created() {
    // Fetch categories once when the component is created
    const categoriesRef = ref(database, 'category');
    onValue(categoriesRef, (snapshot) => {
      const categoriesData = snapshot.val();
      this.categories = categoriesData ? categoriesData.categories : [];
    });
  }
};
</script>

<style scoped>.container {
  max-width: 900px;
  margin: 0 auto; /* Center the container */
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
  text-align: center; /* Center all text inside the container */
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
  margin-bottom: 0; /* Ensure the spacing is consistent */
}

/* Filters */
.filters {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column; /* Make the filter groups stacked */
  align-items: center;
  gap: 20px;
}

.filter-group {
  width: 80%; /* Center-align filter dropdowns */
  max-width: 600px; /* Limit the max width for better alignment */
}

.filter-group p {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  text-align: left; /* Align text inside filter group */
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
  text-align: left; /* Align quiz list text */
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
  gap: 5px; /* Add some spacing between buttons */
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
