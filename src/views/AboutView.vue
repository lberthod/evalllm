<template>
  <div class="about-container">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1>À propos de Eval LLM</h1>
        <p>
          Eval LLM est une plateforme interactive qui transforme l'apprentissage en une expérience engageante et
          personnalisée. Découvrez comment nos technologies et nos approches pédagogiques peuvent améliorer votre
          apprentissage !
        </p>
        <button @click="startQuiz" class="cta-button with-rope">Commencez votre aventure</button>
        <div class="rope"></div> <!-- Corde pour l'effet -->
      </div>
    </header>

    <!-- Features Section -->
    <section class="features">
      <div class="feature">
        <h2>Notre approche pédagogique</h2>
        <p>
          Chez Eval LLM, nous plaçons l'apprenant au cœur de l'expérience grâce à des quiz interactifs. Notre approche
          repose sur l’apprentissage actif avec un feedback immédiat, généré par des modèles de langage tels que GPT,
          pour améliorer la compréhension de chaque utilisateur.
        </p>
      </div>
      <div class="feature">
        <h2>Pour qui est fait Eval LLM ?</h2>
        <p>
          Eval LLM s'adresse aux enseignants, étudiants et curieux qui souhaitent enrichir leurs connaissances de manière
          interactive et personnalisée.
        </p>
      </div>
      <div class="feature">
        <h2>Technologies et approche utilisateur</h2>
        <p>
          Au cœur de Eval LLM se trouve une intelligence artificielle avancée basée sur un modèle de langage (LLM).
          Actuellement, nous utilisons GPT-4.0 Mini, qui permet d'analyser les réponses et d'offrir un feedback
          personnalisé en temps réel.
        </p>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="call-to-action">
      <h2>Prêt à explorer ?</h2>
      <p>
        Rejoignez Eval LLM dès aujourd'hui et plongez dans une expérience d'apprentissage enrichissante et interactive !
      </p>
      <button @click="startQuiz" class="cta-button with-rope">Commencez maintenant</button>
      <div class="rope"></div> <!-- Corde pour l'effet -->
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutView",
  methods: {
    startQuiz() {
      this.$router.push('/study');
    },
  },
};
</script>

<style scoped>
/* Main Container */
.about-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  background-image: url('@/assets/back.png'); /* Image de fond personnalisée */
  background-size: cover;
  background-position: center;
  padding: 100px 20px;
  color: white;
  text-align: center;
  position: relative;
  z-index: 1;
  border-radius: 12px;
  margin-bottom: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
}

/* CTA Button */
.cta-button {
  padding: 15px 35px;
  font-size: 18px;
  background-color: #FF7043;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 8px 16px rgba(255, 112, 67, 0.3);
}

.with-rope {
  position: relative;
}

/* Rope animation */
.rope {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 4px;
  background-color: #FF7043; /* Même couleur que le bouton */
  width: 0;
  transition: width 0.4s ease-in-out, transform 0.2s ease;
  transform-origin: left;
}

.cta-button:active ~ .rope {
  width: 100%;
  transform: translateX(-50%) rotate(10deg);
  animation: wiggle 0.5s ease infinite;
}

/* Wiggle animation for the rope */
@keyframes wiggle {
  0%, 100% {
    transform: translateX(-50%) rotate(10deg);
  }
  50% {
    transform: translateX(-50%) rotate(-10deg);
  }
}

/* Features Section */
.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-bottom: 50px;
}

.feature {
  flex: 1 1 300px;
  margin: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature h2 {
  font-size: 24px;
  color: #4CAF50;
  margin-bottom: 15px;
}

.feature p {
  font-size: 16px;
  color: #666;
}

/* Call to Action Section */
.call-to-action {
  background-color: #00bcd4;
  color: white;
  padding: 60px 30px;
  text-align: center;
  border-radius: 15px;
  margin-bottom: 40px;
}

.call-to-action h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.call-to-action p {
  font-size: 20px;
  max-width: 800px;
  margin: 0 auto 30px auto;
}

.call-to-action .cta-button {
  background-color: #FF7043;
}

.call-to-action .cta-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 8px 16px rgba(255, 112, 67, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .features {
    flex-direction: column;
  }

  .feature {
    margin-bottom: 20px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero p {
    font-size: 18px;
  }

  .cta-button {
    font-size: 16px;
    padding: 12px 30px;
  }

  .call-to-action h2 {
    font-size: 28px;
  }
}
</style>
