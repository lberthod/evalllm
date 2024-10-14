<template>
  <div class="category-navigator">
    <h1 class="heading-primary">Explore Categories</h1>
    <div v-if="loading" class="loading">Loading categories...</div>
    <div v-else>
      <div class="category-list">
        <ul>
          <li
            v-for="(category, index) in categories"
            :key="index"
            class="category-item"
            @click="toggleCategory(index)"
          >
            <div class="category-header">
              <h2>{{ category.main_category }}</h2>
              <i :class="expandedCategory === index ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </div>

            <div v-show="expandedCategory === index" class="subcategory-container">
              <ul class="subcategory-list">
                <li
                  v-for="(subCategory, subIndex) in category.sub_categories"
                  :key="subIndex"
                  class="subcategory-item"
                  @click="toggleSubCategory(subIndex, $event)"
                >
                  <div class="subcategory-header">
                    <strong>{{ subCategory.name }}</strong>
                    <i :class="expandedSubCategory === subIndex ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  </div>

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
import { getDatabase, ref, onValue } from "firebase/database";

export default {
  data() {
    return {
      categories: [], // Holds the categories data
      loading: true, // Flag for loading state
      expandedCategory: null, // Track which category is expanded
      expandedSubCategory: null // Track which subcategory is expanded
    };
  },
  methods: {
    // Fetch categories from Firebase Realtime Database
    fetchCategories() {
      const db = getDatabase();  // Initialize the Firebase Realtime Database
      const categoriesRef = ref(db, 'category/categories');  // Reference to the 'category/categories' node

      onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();  // Get the snapshot of the data
        if (data) {
          this.categories = data;  // Set the categories to the data from Firebase
          this.loading = false;  // Stop the loading state
        }
      }, (error) => {
        console.error("Error fetching categories from Firebase:", error);
        this.loading = false;
      });
    },
    // Toggle the visibility of subcategories for a category
    toggleCategory(index) {
      this.expandedCategory = this.expandedCategory === index ? null : index;
      this.expandedSubCategory = null; // Reset subcategory expansion when switching categories
    },
    // Toggle the visibility of precise categories for a subcategory
    toggleSubCategory(index, event) {
      event.stopPropagation(); // Prevent category collapse on subcategory click
      this.expandedSubCategory = this.expandedSubCategory === index ? null : index;
    }
  },
  mounted() {
    this.fetchCategories(); // Fetch categories when component is mounted
  }
};
</script>
<style>
.category-navigator {
  margin: 40px;
  margin : 20px    auto;
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
  max-height: 20px;;
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
  max-height: 300px;  /* Limit height to handle long lists */
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