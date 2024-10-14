<template>
  <div id="app">
    <NavBar />
    <router-view />
    <FooterComponent /> <!-- Ajout du composant Footer -->
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import FooterComponent from "@/components/FooterComponent.vue";

export default {
  components: {
    NavBar,
    FooterComponent
  }
};
</script>

<style>
/* Global styles for best responsive layout */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f0f0f0;
  line-height: 1.6;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ensure the app container takes full screen height and handles smaller screens effectively */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
}

/* Footer is always fixed at the bottom when content is short */
footer {
  margin-top: auto;
  background-color: #222;
  color: white;
  padding: 20px;
  text-align: center;
}

/* Responsive improvements */
@media (max-width: 768px) {
  body {
    font-size: 14px;
    padding: 0 10px;
  }
}

@media (min-width: 769px) {
  body {
    font-size: 16px;
    padding: 0 20px;
  }
}
</style>
