<template>
  <div class="about-container">
    <!-- Hero section with parallax background color -->
    <section class="about-hero element" :style="{ backgroundPositionY: heroParallaxPosition + 'px' }">
      <h1>À propos de Eval LLM</h1>
      <p>
        Eval LLM est une plateforme interactive qui transforme l'apprentissage en une expérience engageante et personnalisée. Découvrez comment nos technologies et nos approches pédagogiques peuvent améliorer votre apprentissage !
      </p>
    </section>

    <!-- Pedagogical approach section with background color -->
    <section class="about-section about-pedagogy element" :style="{ backgroundPositionY: pedagogyParallaxPosition + 'px' }">
      <div class="content-container">
        <h2>Notre approche pédagogique</h2>
        <p>
          Chez Eval LLM, nous plaçons l'apprenant au cœur de l'expérience grâce à des quiz interactifs. Notre approche repose sur l’apprentissage actif avec un feedback immédiat, généré par des modèles de langage tels que GPT, pour améliorer la compréhension de chaque utilisateur.
        </p>
        <ul class="highlighted-points">
          <li>Apprentissage personnalisé grâce à des feedbacks intelligents.</li>
          <li>Rétention renforcée via des quiz interactifs et motivants.</li>
          <li>Adaptation continue des quiz selon votre progression.</li>
        </ul>
      </div>
    </section>

    <!-- User section with image parallax effect -->
    <section class="about-section user-section element" :style="{ backgroundPositionY: imageParallaxPosition + 'px' }">
      <h2>Pour qui est fait Eval LLM ?</h2>
      <div class="user-grid">
        <div class="user-item">
          <h3>Enseignants</h3>
          <p>Créez et partagez des quiz avec vos élèves et suivez leur progression en temps réel.</p>
        </div>
        <div class="user-item">
          <h3>Étudiants</h3>
          <p>Répondez aux questions à votre rythme et recevez des feedbacks instantanés pour améliorer vos compétences.</p>
        </div>
        <div class="user-item">
          <h3>Curieux</h3>
          <p>Accédez à des quiz publics pour découvrir et approfondir vos connaissances sur divers sujets.</p>
        </div>
      </div>
    </section>

    <!-- Technologies section with parallax background -->
    <section class="about-section about-tech element" :style="{ backgroundPositionY: techParallaxPosition + 'px' }">
      <h2 class="tech-title">Technologies et Approche Utilisateur</h2>
      <div class="tech-content">
        <p>
          Eval LLM est pensé pour offrir une expérience utilisateur ergonomique et réactive, aussi bien sur le web que sur mobile. L'interface fluide permet une navigation intuitive et un apprentissage efficace, s'adaptant aux besoins spécifiques de chaque utilisateur.
        </p>
        <p>
          Au cœur de Eval LLM se trouve une intelligence artificielle avancée basée sur un modèle de langage (LLM). Actuellement, nous utilisons **GPT-4.0 Mini**, qui permet d'analyser les réponses et d'offrir un feedback personnalisé en temps réel. Ce retour intelligent permet à chaque utilisateur de progresser à son propre rythme, avec des suggestions adaptées à son niveau de compréhension.
        </p>
        <p>
          Grâce à ces technologies, Eval LLM permet d'améliorer l'apprentissage de manière dynamique et engageante, tout en assurant un environnement intuitif et facile à utiliser pour tout type d'utilisateur.
        </p>
        <div class="tech-icons">
          <img src="@/assets/logo.png" alt="GPT-4.0 Mini">
        </div>
      </div>
    </section>

    <!-- Call to action section with a solid color background -->
    <section class="about-section call-to-action element">
      <h2>Prêt à explorer ?</h2>
      <p>Rejoignez Eval LLM dès aujourd'hui et plongez dans une expérience d'apprentissage enrichissante et interactive !</p>
      <button @click="startQuiz">Commencez maintenant</button>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutView",
  data() {
    return {
      heroParallaxPosition: 0,
      pedagogyParallaxPosition: 0,
      imageParallaxPosition: 0,
      techParallaxPosition: 0,
    };
  },
  methods: {
    startQuiz() {
      this.$router.push('/study');
    },
    handleScroll() {
      this.heroParallaxPosition = window.scrollY * 0.4;
      this.pedagogyParallaxPosition = window.scrollY * 0.3;
      this.imageParallaxPosition = window.scrollY * 0.5;
      this.techParallaxPosition = window.scrollY * 0.2;
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener('scroll', () => {
      document.querySelectorAll('.element').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
          el.classList.add('visible');
        }
      });
    });
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style scoped>
/* General container for the page */
.about-container {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
  color: #444;
  text-align: center;
}

/* Hero section with parallax background */
.about-hero {
  background: linear-gradient(135deg, #00bcd4, #007bff);
  color: white;
  padding: 80px 30px;
  border-radius: 20px;
  position: relative;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.about-hero h1 {
  font-size: 50px;
  margin-bottom: 20px;
  font-weight: 600;
}

.about-hero p {
  font-size: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* Pedagogical section with background color */
.about-pedagogy {
  background-color: #f0f4f8;
  padding: 60px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.about-pedagogy h2 {
  font-size: 36px;
  font-weight: 600;
}

.highlighted-points {
  list-style-type: none;
  padding: 0;
  margin-top: 20px;
}

.highlighted-points li {
  font-size: 18px;
  color: #007bff;
  margin: 10px 0;
}

/* Element animation */
.element {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.element.visible {
  opacity: 1;
  transform: translateY(0);
}

/* User section with parallax background image */
.user-section {
  background: url('@/assets/back.png') no-repeat center center fixed;
  background-size: cover;
  padding: 100px 30px;
  color: white;
  border-radius: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.user-section h2 {
  font-size: 36px;
  margin-bottom: 40px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  justify-content: center;
}

.user-item {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 20px;
  color: #333;
  transition: transform 0.3s ease;
}

.user-item:hover {
  transform: translateY(-10px);
}

.user-item h3 {
  font-size: 24px;
  font-weight: 500;
}

.user-item p {
  font-size: 16px;
}

/* Technology section */
.about-tech {
  background-color: #e1f5fe;
  padding: 70px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.tech-content {
  max-width: 800px;
  margin: 0 auto;
}

.tech-icons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 50px;
}

.tech-icons img {
  width: 80px;
  height: auto;
}

/* Call to action section */
.call-to-action {
  background-color: #007bff;
  color: white;
  padding: 70px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.call-to-action h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

button {
  background: linear-gradient(135deg, #1d3557, #457b9d);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  font-size: 18px;
  transition: all 0.3s ease;
}

button:hover {
  background: linear-gradient(135deg, #457b9d, #1d3557);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .about-hero h1 {
    font-size: 36px;
  }

  .about-hero p {
    font-size: 18px;
  }

  .user-grid {
    grid-template-columns: 1fr;
  }

  .call-to-action h2 {
    font-size: 28px;
  }
}
</style>
