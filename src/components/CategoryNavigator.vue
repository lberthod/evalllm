<template>
  <div class="category-navigator">
    <h1 class="heading-primary">Explore Categories</h1>
    
    <!-- Affichage du message de chargement -->
    <div v-if="loading" class="loading">Loading categories...</div>
    
    <!-- Si les catégories sont chargées -->
    <div v-else>
      <div class="category-list">
        <ul>
          <!-- Boucle sur les catégories principales -->
          <li
            v-for="(category, index) in categories"
            :key="index"
            class="category-item"
            @click="toggleCategory(index)"
          >
            <!-- Affichage de la catégorie principale -->
            <div class="category-header">
              <h2>{{ category.main_category }}</h2>
              <i :class="expandedCategory === index ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </div>

            <!-- Si la catégorie est étendue, on affiche les sous-catégories -->
            <div v-show="expandedCategory === index" class="subcategory-container">
              <ul class="subcategory-list">
                <!-- Boucle sur les sous-catégories -->
                <li
                  v-for="(subCategory, subIndex) in category.sub_categories"
                  :key="subIndex"
                  class="subcategory-item"
                  @click="toggleSubCategory(subIndex, $event)"
                >
                  <!-- Affichage du nom de la sous-catégorie -->
                  <div class="subcategory-header">
                    <strong>{{ subCategory.name }}</strong>
                    <i :class="expandedSubCategory === subIndex ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  </div>

                  <!-- Si la sous-catégorie est étendue, on affiche les catégories précises -->
                  <ul v-show="expandedSubCategory === subIndex" class="precise-category-list">
                    <li v-for="(precise, preciseIndex) in subCategory.precise_categories" :key="preciseIndex" class="precise-item">
                      - {{ precise }}
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// Import the JSON file
import categoryData from "@/assets/category.json";

export default {
  data() {
    return {
      categories: [], // Stocke les catégories
      loading: true, // Indicateur de chargement
      expandedCategory: null, // Catégorie actuellement étendue
      expandedSubCategory: null // Sous-catégorie actuellement étendue
    };
  },
  methods: {
    // Chargement des catégories à partir du fichier JSON
    fetchCategories() {
      this.categories = categoryData.categories;  // Accède à la clé 'categories' du JSON
      this.loading = false;  // Arrête l'état de chargement
    },
    // Toggle pour étendre ou réduire une catégorie
    toggleCategory(index) {
      this.expandedCategory = this.expandedCategory === index ? null : index;
      this.expandedSubCategory = null; // Réinitialise les sous-catégories lorsqu'on change de catégorie
    },
    // Toggle pour étendre ou réduire une sous-catégorie
    toggleSubCategory(index, event) {
      event.stopPropagation(); // Empêche l'effondrement de la catégorie principale lors du clic
      this.expandedSubCategory = this.expandedSubCategory === index ? null : index;
    }
  },
  mounted() {
    // Charge les catégories au montage du composant
    this.fetchCategories();
  }
};
</script>


<style>
.category-navigator {
  margin: 40px;
  margin: 20px auto;
  padding: 20px 40px auto;
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
}

/* Centered Title with Spacing */
.heading-primary {
  text-align: center;
  font-size: 32px;
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 30px;
}

/* Category List */
.category-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Category Item Design */
.category-item {
  background-color: #ffffff;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.category-item:hover {
  transform: translateY(-3px);
}

/* Header for Each Category */
.category-header {
  max-height: 20px;
  ;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #333;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

/* Subcategory Container */
.subcategory-container {
  max-height: 300px;
  /* Limit height to handle long lists */
  overflow-y: auto;
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 8px;
}

/* Subcategory List */
.subcategory-list {
  list-style: none;
  padding: 0;
}

/* Subcategory Items */
.subcategory-item {
  background-color: #f9f9f9;
  margin: 5px 0;
  padding: 10px 10px 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.subcategory-item:hover {
  background-color: #ececec;
}

/* Subcategory Header */
.subcategory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  color: #555;
}

/* Precise Category List */
.precise-category-list {
  margin-top: 8px;
  padding-left: 30px;
  border-left: 2px solid #ddd;
}

.precise-item {
  color: #777;
  font-size: 16px;
  padding: 3px 0;
  transition: color 0.3s ease;
}

.precise-item:hover {
  color: #333;
}

/* Icons */
.fas {
  font-size: 18px;
  color: #777;
  transition: transform 0.3s ease;
}

.fas.fa-chevron-up {
  transform: rotate(180deg);
}

/* Loading */
.loading {
  font-size: 18px;
  text-align: center;
  color: #999;
}

/* Scrollbar Styling */
.subcategory-container::-webkit-scrollbar {
  width: 8px;
}

.subcategory-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.subcategory-container::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 5px;
}

.subcategory-container::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>