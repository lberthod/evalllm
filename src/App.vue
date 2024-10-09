<!-- src/App.vue -->
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
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
}

footer {
  margin-top: auto;
}
</style>
