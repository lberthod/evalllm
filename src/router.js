// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import MainView from "@/views/MainView.vue";
import AboutView from "@/views/AboutView.vue";
import ContactView from "@/views/ContactView.vue";
import UserProfile from "@/views/UserProfile.vue";
import GmailLogin from "@/views/GmailLogin.vue";
import QuizManageView from "./views/QuizManageView.vue";
import StudyView from "./views/StudyView.vue";
import QuizDetails from "./components/QuizDetails.vue"; // Créez cette vue pour afficher les questions
import CategoryNavigator from "./components/CategoryNavigator.vue"; // Créez cette vue pour afficher les questions
import HistoriqueView from "@/views/HistoriqueView.vue";
import ClassementView from "@/views/ClassementView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: MainView,
  },

  {
    path: "/classement",
    name: "Classement",
    component: ClassementView,
  },
  
  {
    path: "/historique",
    name: "Historique",
    component: HistoriqueView,
  },
  {
    path: "/quiz/:mainCategory/:subCategory/:preciseCategory/:quizId",
    name: "QuizView",
    component: QuizDetails, // Ou QuizView si c'est un autre composant
  },
  {
    path: "/about",
    name: "About",
    component: AboutView,
  },
  {
    path: "/navigator",
    name: "Navigator",
    component: CategoryNavigator,
  },
  {
    path: "/contact",
    name: "Contact",
    component: ContactView,
  },
  {
    path: "/login",
    name: "Login",
    component: GmailLogin,
  },
  {
    path: "/profile",
    name: "Profile",
    component: UserProfile,
  },
  {
    path: "/quiz-manage",
    component: QuizManageView,
    meta: { requiresAuth: true }, // Protéger l'accès si nécessaire
  },
  { path: "/study", component: StudyView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
