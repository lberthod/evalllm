<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/">QuizTrailo</router-link>
      <!-- Hamburger icon for mobile -->
      <div class="hamburger" @click="toggleMobileMenu">
        <span :class="{ 'open': isMobileMenuOpen }"></span>
        <span :class="{ 'open': isMobileMenuOpen }"></span>
        <span :class="{ 'open': isMobileMenuOpen }"></span>
      </div>
    </div>

    <!-- Desktop Menu -->
    <ul class="nav-menu" v-if="!isMobile">
      <li><router-link to="/">QuizTrailo</router-link></li>
      <li><router-link to="/about">À propos</router-link></li>
      <li v-if="isAuthenticated"><router-link to="/study">Quizs</router-link></li>
      <li v-if="isAuthenticated && isGmailUser">
        <router-link to="/quiz-manage">Dashboard</router-link>
      </li>
      <li v-if="isAuthenticated"><router-link to="/navigator">Listing</router-link></li>
      <li v-if="isAuthenticated && isGmailUser"><router-link to="/historique">Historique</router-link></li>

      <li v-if="isAuthenticated && isGmailUser"><router-link to="/profile">Profile</router-link></li>
      <li><router-link to="/contact">Contact</router-link></li>
      <li v-if="isAuthenticated && isGmailUser">
        <a @click.prevent="logout">Logout</a>
      </li>
      <li v-else><router-link to="/login">Login</router-link></li>

    </ul>

    <!-- Mobile Menu -->
    <transition name="slide">
      <ul class="nav-menu-mobile" v-if="isMobileMenuOpen && isMobile">
        <li><router-link to="/" @click="closeMobileMenu">QuizTrailo</router-link></li>
        <li><router-link to="/about" @click="closeMobileMenu">À propos</router-link></li>
        <li v-if="isAuthenticated">
          <router-link to="/study" @click="closeMobileMenu">Quizs</router-link>
        </li>
        <li v-if="isAuthenticated && isGmailUser">
          <router-link to="/quiz-manage" @click="closeMobileMenu">Dashboard</router-link>
        </li>
        <li v-if="isAuthenticated && isGmailUser">
          <router-link to="/profile" @click="closeMobileMenu">Profile</router-link>
        </li>
        <li><router-link to="/contact" @click="closeMobileMenu">Contact</router-link></li>
        <li v-if="isAuthenticated && isGmailUser">
          <a @click.prevent="logout">Logout</a>
        </li>
        <li v-else><router-link to="/login" @click="closeMobileMenu">Login</router-link></li>
      </ul>
    </transition>
  </nav>
</template>
<script>
import { ref, onMounted, computed } from 'vue';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase';

export default {
  name: 'NavBar',
  setup() {
    const isAuthenticated = ref(false);
    const isGmailUser = ref(false);
    const isMobileMenuOpen = ref(false);
    const router = useRouter();

    const isMobile = computed(() => window.innerWidth <= 768);

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };

    const logout = () => {
      signOut(auth)
        .then(() => {
          isAuthenticated.value = false;
          isGmailUser.value = false;
          router.push('/');
        })
        .catch((error) => {
          console.error('Logout error:', error);
        });
    };

    onMounted(() => {
      // Handle window resize
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          isMobileMenuOpen.value = false;
        }
      });

      // Check Firebase authentication state
      onAuthStateChanged(auth, (user) => {
        if (user) {
          isAuthenticated.value = true;
          isGmailUser.value = user.providerData.some(
            (provider) => provider.providerId === 'google.com'
          );
        } else {
          isAuthenticated.value = false;
          isGmailUser.value = false;
        }
      });
    });

    return {
      isAuthenticated,
      isGmailUser,
      isMobileMenuOpen,
      isMobile,
      toggleMobileMenu,
      closeMobileMenu,
      logout,
    };
  },
};
</script>
<style scoped>
/* Navbar Styles */
.navbar {
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  position: relative;
  z-index: 1000;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
}

/* Desktop Menu */
.nav-menu {
  list-style-type: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.nav-menu li a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s ease;
}

.nav-menu li a:hover {
  color: #00bcd4;
}

.nav-menu li a.active {
  color: #00bcd4;
  font-weight: bold;
}

/* Hamburger Menu */
.hamburger {
  display: none;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
}

.hamburger span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: white;
  transition: all 0.3s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Mobile Menu */
.nav-menu-mobile {
  position: absolute;
  top: 60px;
  right: 0;
  background-color: #333;
  width: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.nav-menu-mobile li {
  text-align: center;
  padding: 15px 0;
  border-bottom: 1px solid #444;
}

.nav-menu-mobile li a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  display: block;
}

.nav-menu-mobile li a:hover {
  color: #00bcd4;
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}
</style>
