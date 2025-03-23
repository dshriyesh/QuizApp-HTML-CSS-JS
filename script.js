
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const timerElement = document.getElementById("countdown");
const timerProgressElement = document.getElementById("timer-progress");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const categoryElement = document.getElementById("category");
const loadingElement = document.getElementById("loading");

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedDifficulty = "easy";
let timerInterval;
let timeLeft = 15;


function init() {
    
    difficultyButtons.forEach(button => {
        button.addEventListener("click", () => {
            
            difficultyButtons.forEach(btn => btn.classList.remove("active"));
            
            button.classList.add("active");
            
            selectedDifficulty = button.dataset.difficulty;
           
            fetchQuestions();
        });
    });

   
    fetchQuestions();
}


async function fetchQuestions() {
    
    loadingElement.style.display = "block";
    questionElement.style.display = "none";
    categoryElement.style.display = "none";
    answerButtonsElement.innerHTML = "";
    
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${selectedDifficulty}&type=multiple`);
        const data = await response.json();
        
        if (data.response_code === 0) {
            
            questions = data.results.map(q => {
                
                const answers = [...q.incorrect_answers, q.correct_answer];
                
                shuffleArray(answers);
                
                
                return {
                    question: decodeHTML(q.question),
                    category: q.category,
                    answers: answers.map(answer => ({
                        text: decodeHTML(answer),
                        correct: answer === q.correct_answer
                    }))
                };
            });
            
            
            startQuiz();
        } else {
            throw new Error("Failed to fetch questions");
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
        questionElement.textContent = "Error loading questions. Please try again.";
        questionElement.style.display = "block";
    }
    
    
    loadingElement.style.display = "none";
}


function decodeHTML(html) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}


function showQuestion() {
    resetState();
    
    if (questions.length === 0) {
        questionElement.textContent = "No questions available. Try again.";
        return;
    }
    
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    
    
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;
    questionElement.style.display = "block";
    categoryElement.textContent = currentQuestion.category;
    categoryElement.style.display = "inline-block";
    
    
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtonsElement.appendChild(button);
        
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        
        button.addEventListener("click", selectAnswer);
    });
    
   
    startTimer();
}


function resetState() {
    
    clearInterval(timerInterval);
    timeLeft = 15;
    timerElement.textContent = timeLeft;
    timerProgressElement.style.width = "100%";
    
    
    nextButton.style.display = "none";
    
    
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}


function startTimer() {
    timeLeft = 15;
    timerElement.textContent = timeLeft;
    timerProgressElement.style.width = "100%";
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        
        const percentage = (timeLeft / 15) * 100;
        timerProgressElement.style.width = `${percentage}%`;
        
        if (timeLeft <= 5) {
            timerElement.style.color = "#ff5e62";
        } else {
            timerElement.style.color = "#333";
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOut();
        }
    }, 1000);
}


function timeOut() {
   
    Array.from(answerButtonsElement.children).forEach(button => {
        button.disabled = true;
        
        
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
    });
    
    
    nextButton.style.display = "block";
}


function selectAnswer(e) {
    
    clearInterval(timerInterval);
    
    const selectedButton = e.target;
    const isCorrect = selectedButton.dataset.correct === "true";
    
    if (isCorrect) {
        selectedButton.classList.add("correct");
        score++;
    } else {
        selectedButton.classList.add("incorrect");
    }
    
    
    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    
    
    nextButton.style.display = "block";
}


function showScore() {
    resetState();
    
   
    const scoreContainer = document.createElement("div");
    scoreContainer.classList.add("score-container");
    
    
    const heading = document.createElement("h2");
    heading.textContent = `You scored ${score} out of ${questions.length}!`;
    
    
    const scoreDetails = document.createElement("div");
    scoreDetails.classList.add("score-details");
    
   
    const percentage = Math.round((score / questions.length) * 100);
    
   
    let performanceMessage;
    if (percentage >= 80) {
        performanceMessage = "Excellent! You're a quiz master!";
    } else if (percentage >= 60) {
        performanceMessage = "Good job! You know your stuff!";
    } else if (percentage >= 40) {
        performanceMessage = "Not bad! Keep learning!";
    } else {
        performanceMessage = "Keep practicing! You'll get better!";
    }
    
    scoreDetails.innerHTML = `
        <p><strong>Difficulty:</strong> ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</p>
        <p><strong>Correct Answers:</strong> ${score}</p>
        <p><strong>Incorrect Answers:</strong> ${questions.length - score}</p>
        <p><strong>Score Percentage:</strong> ${percentage}%</p>
        <p>${performanceMessage}</p>
    `;
    
    
    scoreContainer.appendChild(heading);
    scoreContainer.appendChild(scoreDetails);
    
    
    questionElement.innerHTML = "";
    questionElement.appendChild(scoreContainer);
    
   
    categoryElement.style.display = "none";
    
    
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
}


function handleNextButton() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}


nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        fetchQuestions();
    }
});


init();