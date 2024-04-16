let questionList = [
    "questions-geral.json",
    "questions-digital-circus.json",
    "questions-ingles.json"];
let chosenQuestion = questionList[Math.floor(Math.random() * questionList.length)];

document.addEventListener('DOMContentLoaded', function() {
    fetch(chosenQuestion)
        .then(response => response.json())
        .then(data => {
            let currentQuestionIndex = 0;

            function displayQuestion(questionData) {
                const questionElement = document.getElementById('question');
                const answersElement = document.getElementById('answers');

                questionElement.textContent = (currentQuestionIndex + 1) + " - " + questionData.question;
                answersElement.innerHTML = '';

                const answers = questionData.answers;
                const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

                shuffledAnswers.forEach(answer => {
                    const answerElement = document.createElement('li');
                    answerElement.textContent = answer;
                    answerElement.addEventListener('click', () => {
                        if (answer === questionData.correctAnswer) {
                            currentQuestionIndex++;
                            if (currentQuestionIndex < data.length) {
                                displayQuestion(data[currentQuestionIndex]);
                            } else {
                                alert('Parabéns! Você completou o quiz!');
                                currentQuestionIndex = 0;
                                displayQuestion(data[currentQuestionIndex]);
                            }
                        } else {
                            currentQuestionIndex = currentQuestionIndex -5;
                            if (currentQuestionIndex < 0) currentQuestionIndex = 0;
                            alert(`Resposta errada! Retorne a pergunta ${currentQuestionIndex + 1}.`);
                            displayQuestion(data[currentQuestionIndex]);
                        }
                    });
                    answersElement.appendChild(answerElement);
                });
            }

            if (data.length > 0) {
                displayQuestion(data[currentQuestionIndex]);
            }
        })
        .catch(error => console.error('Erro ao carregar as perguntas:', error));
});
