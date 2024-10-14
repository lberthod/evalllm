<!-- src/components/FooterComponent.vue -->
<template>
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 QuizTrailo. Tous droits réservés.</p>
        <div class="footer-links">
          <a href="/contact">Contact</a>
          <a href="/about">À propos</a>
          <a href="/study">Study </a>
          <a href="/quiz-manage">Dashboard</a>
          <a href="/login"> Login</a>
          <a href="/profile"> Profile</a>
          <a href="https://twitter.com" target="_blank">Twitter</a>
          <a href="https://facebook.com" target="_blank">Facebook</a>

        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: "FooterComponent"
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #333;
    color: white;
    padding: 20px 0;
    text-align: center;
    margin-top: 50px;
    position: relative;
    width: 100%;
  }
  
  .footer-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-links {
    margin-top: 10px;
  }
  
  .footer-links a {
    color: #f9f9f9;
    margin: 0 10px;
    text-decoration: none;
    font-size: 14px;
  }
  
  .footer-links a:hover {
    text-decoration: underline;
  }
  </style>
  