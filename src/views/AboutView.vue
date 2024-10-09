<template>
  <div class="about-container">
    <!-- Header section with the main title -->
    <section class="about-hero">
      <h1>À propos de QuizApp</h1>
      <p>QuizApp est une plateforme interactive qui vous permet d’apprendre de manière engageante et efficace à travers des quizzes pédagogiques variés. Découvrez comment nous utilisons la technologie et des techniques pédagogiques avancées pour révolutionner l'apprentissage !</p>
    </section>

    <!-- Pedagogical experience section -->
    <section class="about-section">
      <h2>Notre approche pédagogique</h2>
      <p>
        QuizApp repose sur un modèle d'apprentissage actif où l'apprenant est constamment stimulé à travers des exercices pratiques. Le feedback immédiat, basé sur des modèles de langage (LLM) tels que GPT, joue un rôle clé dans cette approche, en offrant un retour personnalisé et détaillé après chaque réponse. 
      </p>
      <p>
        Cette méthode s'inspire des principes de la pédagogie active, où le renforcement immédiat permet une meilleure rétention des informations. Des recherches montrent que le feedback immédiat favorise l'apprentissage en profondeur en corrigeant rapidement les erreurs tout en consolidant les connaissances correctes.
      </p>
      <ul>
        <li>Amélioration de la rétention grâce à l'ajustement immédiat de la compréhension.</li>
        <li>Motivation accrue par des retours positifs ou constructifs en temps réel.</li>
        <li>Réponses basées sur les dernières techniques d'IA, offrant un feedback riche et varié.</li>
      </ul>
    </section>

    <!-- New section about users -->
    <section class="about-section">
      <h2>Pour qui est fait QuizApp ?</h2>
      <div class="user-grid">
        <div class="user-item">
          <h3>Enseignants</h3>
          <p>Les enseignants peuvent créer des quizzes facilement et les partager avec leurs élèves. Ils peuvent suivre leur progression en temps réel et offrir un soutien individualisé grâce aux données collectées.</p>
        </div>
        <div class="user-item">
          <h3>Étudiants</h3>
          <p>Les étudiants peuvent répondre aux questions à leur rythme, recevoir un feedback immédiat, et ainsi améliorer leurs compétences rapidement et efficacement.</p>
        </div>
        <div class="user-item">
          <h3>Tout le monde</h3>
  <p>Tout le monde peut utiliser QuizApp pour créer des quizzes, découvrir de nouveaux sujets et utiliser les quizzes publics partagés par la communauté pour approfondir ses connaissances.</p>
        </div>
      </div>
    </section>

    <!-- Technologies used section -->
    <section class="about-section">
      <h2>Technologies utilisées</h2>
      <p>
        QuizApp utilise des technologies modernes pour garantir une expérience fluide et performante. Nous combinons **Vue.js** pour créer une interface utilisateur réactive et intuitive, **Firebase** pour gérer les données en temps réel, et **ChatGPT (modèle LLM)** pour fournir un feedback intelligent et contextuel. Actuellement, nous utilisons **GPT-4.0 Mini** pour assurer des réponses rapides et pertinentes, tout en améliorant constamment l'expérience utilisateur.
      </p>
    </section>

    <!-- Opportunities and Benefits section -->
    <section class="about-section">
      <h2>Les opportunités avec QuizApp</h2>
      <p>
        QuizApp n'est pas qu'une simple plateforme de quiz. Elle offre de nombreuses opportunités pour les éducateurs, les apprenants et les développeurs :
      </p>
      <ul>
        <li>Éducateurs : Créez et partagez vos propres quiz pour vos élèves et suivez leur progression en temps réel.</li>
        <li>Apprenants : Apprenez à votre rythme, recevez un feedback personnalisé et accédez à des sujets variés.</li>
        <li>Tout le monde : Tout le monde peut utiliser QuizApp pour créer des quizzes, découvrir de nouveaux sujets et utiliser les quizzes publics partagés par la communauté pour approfondir ses connaissances.</li>
 <h3></h3>
  <p></p>
      </ul>
    </section>

    <!-- Call to action section -->
    <section class="about-section call-to-action">
      <h2>Prêt à explorer ?</h2>
      <p>Rejoignez QuizApp dès aujourd'hui et plongez dans une expérience d'apprentissage enrichissante et interactive !</p>
      <button @click="startQuiz">Commencez maintenant</button>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutView",
  methods: {
    startQuiz() {
      this.$router.push('/study'); // Navigate to the quiz page
    }
  }
};
</script>

<style scoped>
/* Main container for the About page */
.about-container {
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}

/* Hero section */
.about-hero {
  background-color: #f0f4f8;
  padding: 50px 20px;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.about-hero h1 {
  font-size: 36px;
  margin-bottom: 15px;
  color: #333;
}

.about-hero p {
  font-size: 18px;
  color: #555;
}

/* General section styling */
.about-section {
  margin-bottom: 40px;
}

.about-section h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

.about-section p, .about-section ul {
  font-size: 16px;
  color: #666;
}

.about-section ul {
  list-style: none;
  padding: 0;
}

.about-section ul li {
  margin-bottom: 10px;
}

/* User section grid */
.user-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.user-item {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  width: calc(33% - 40px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  transition: transform 0.2s ease;
}

.user-item:hover {
  transform: translateY(-5px);
}

.user-item h3 {
  font-size: 22px;
  color: #333;
  margin-bottom: 10px;
}

.user-item p {
  font-size: 16px;
  color: #666;
}

/* Call to action section */
.call-to-action {
  background-color: #00bcd4;
  padding: 50px 20px;
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.call-to-action h2 {
  font-size: 30px;
  margin-bottom: 20px;
}

.call-to-action p {
  font-size: 18px;
  margin-bottom: 30px;
}

.call-to-action button {
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.call-to-action button:hover {
  background-color: #0056b3;
  box-shadow: 0px 8px 16px rgba(0, 123, 255, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-grid {
    flex-direction: column;
  }

  .user-item {
    width: 100%;
  }

  .call-to-action h2 {
    font-size: 24px;
  }
}
</style>
