<template>
    <div class="historique-container">
        <h1>Historique des Questions Réussies</h1>
        <div v-if="loading" class="loading-message">Chargement...</div>
        <div v-else>
            <div v-if="successfulQuestions.length === 0">
                <p>Vous n'avez encore réussi aucune question.</p>
            </div>
            <div v-else>
                <div v-for="(question, index) in successfulQuestions" :key="index" class="question-block">
                    <h3>{{ question.quizTitle }}</h3>
                    <p><strong>Question:</strong> {{ question.title }}</p>
                    <p><strong>Réussie le:</strong> {{ formatDate(question.date) }}</p>
                    <button
                        @click="redirectToQuiz(question.quizId, question.mainCategory, question.subCategory, question.preciseCategory)">
                        Voir le Quiz
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onValue, getDatabase } from 'firebase/database';
import { getCurrentUser } from '@/firebase'; // Remplacez par votre fichier Firebase d'authentification

export default {
    data() {
        return {
            successfulQuestions: [],
            loading: true,
        };
    },
    created() {
        this.fetchSuccessfulQuestions();
    },
    methods: {
        async fetchSuccessfulQuestions() {
            const user = getCurrentUser();
            const db = getDatabase();

            if (user) {
                const resultsRef = ref(db, `results/${user.uid}`);
                onValue(resultsRef, (snapshot) => {
                    const data = snapshot.val();
                    this.loading = false;
                    if (data) {
                        // Parcourir les données pour récupérer les questions réussies
                        for (const mainCategory in data) {
                            for (const subCategory in data[mainCategory]) {
                                for (const preciseCategory in data[mainCategory][subCategory]) {
                                    for (const quizTheme in data[mainCategory][subCategory][preciseCategory]) {
                                        for (const questionTitle in data[mainCategory][subCategory][preciseCategory][quizTheme]) {
                                            const questionData = data[mainCategory][subCategory][preciseCategory][quizTheme][questionTitle];
                                            if (questionData.correct) {
                                                this.successfulQuestions.push({
                                                    title: questionTitle,
                                                    date: questionData.date,
                                                    mainCategory: questionData.mainCategory,
                                                    preciseCategory: questionData.preciseCategory,
                                                    subCategory: questionData.subCategory,
                                                    quizId: questionData.quizId,  // Assurez-vous que quizId est stocké dans Firebase
                                                    quizTitle: quizTheme
                                                                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                this.loading = false;
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const date = new Date(dateString);
            return date.toLocaleString('fr-FR', options);
        },
        redirectToQuiz(quizId, mainCategory, subCategory, preciseCategory) {
            if (quizId && mainCategory && subCategory && preciseCategory) {
                this.$router.push({
                    name: "QuizView",
                    params: {
                        mainCategory: mainCategory,
                        subCategory: subCategory,
                        preciseCategory: preciseCategory,
                        quizId: quizId,
                    }
                });
            } else {
                console.error("Missing parameters for quiz route.");
            }
        }



    },
};
</script>

<style scoped>
.historique-container {
    max-width: 1200px;
    margin: 50px auto;
    padding: 40px;
    background-color: #f9f9f9;
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.question-block {
    background-color: #ffffff;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-block:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

button {
    background-color: #FF7043;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #FF5722;
}
</style>