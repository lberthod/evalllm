// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'; // Importer l'icône spécifique
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Ajouter l'icône à la bibliothèque
library.add(faLightbulb);


const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router).mount('#app');
