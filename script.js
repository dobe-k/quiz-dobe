// Quiz Application State
let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let userScore = 0;
let isQuizStarted = false;

// DOM Elements
const loadingScreen = document.getElementById('loading');
const errorScreen = document.getElementById('error');
const quizContainer = document.getElementById('quiz-container');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');

// Initialize Quiz Application
document.addEventListener('DOMContentLoaded', function() {
    try {
        loadQuizFromURL();
    } catch (error) {
        console.error('Quiz initialization error:', error);
        showError();
    }
});

// UTF-8 safe Base64 decoding function
function base64ToUtf8(base64) {
    try {
        // Decode base64 to binary string
        const binaryString = atob(base64);
        
        // Convert binary string to bytes
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Use TextDecoder for proper UTF-8 decoding
        // This handles multi-byte UTF-8 sequences correctly
        if (typeof TextDecoder !== 'undefined') {
            const decoder = new TextDecoder('utf-8', { fatal: false });
            return decoder.decode(bytes);
        }
        
        // Fallback for older browsers: Manual UTF-8 decoding
        let result = '';
        let i = 0;
        while (i < bytes.length) {
            const byte1 = bytes[i++];
            
            if (byte1 < 0x80) {
                // 1-byte sequence (ASCII)
                result += String.fromCharCode(byte1);
            } else if ((byte1 & 0xe0) === 0xc0) {
                // 2-byte sequence
                if (i < bytes.length) {
                    const byte2 = bytes[i++];
                    const codePoint = ((byte1 & 0x1f) << 6) | (byte2 & 0x3f);
                    result += String.fromCharCode(codePoint);
                }
            } else if ((byte1 & 0xf0) === 0xe0) {
                // 3-byte sequence (most Korean characters)
                if (i + 1 < bytes.length) {
                    const byte2 = bytes[i++];
                    const byte3 = bytes[i++];
                    const codePoint = ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f);
                    result += String.fromCharCode(codePoint);
                }
            } else if ((byte1 & 0xf8) === 0xf0) {
                // 4-byte sequence (emoji, etc)
                if (i + 2 < bytes.length) {
                    const byte2 = bytes[i++];
                    const byte3 = bytes[i++];
                    const byte4 = bytes[i++];
                    let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
                    // Convert to surrogate pair for JavaScript
                    codePoint -= 0x10000;
                    result += String.fromCharCode(0xd800 + (codePoint >> 10));
                    result += String.fromCharCode(0xdc00 + (codePoint & 0x3ff));
                }
            }
        }
        
        return result;
    } catch (error) {
        console.error('Base64 decoding error:', error);
        throw error;
    }
}

// Load Quiz Data from URL Parameters
function loadQuizFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('quiz') || urlParams.get('data');
    
    if (!encodedData) {
        console.error('No quiz data found in URL');
        showError();
        return;
    }

    try {
        // Fix URL encoding issues with Base64 data
        // Replace URL-safe characters back to standard Base64
        let fixedEncodedData = encodedData
            .replace(/-/g, '+')     // URL-safe minus to plus
            .replace(/_/g, '/')     // URL-safe underscore to slash
            .replace(/ /g, '+');    // Space (from URL) back to plus
        
        // Add padding if necessary
        while (fixedEncodedData.length % 4 !== 0) {
            fixedEncodedData += '=';
        }
        
        // Decode Base64 data with proper UTF-8 support
        const jsonString = base64ToUtf8(fixedEncodedData);
        quizData = JSON.parse(jsonString);
        
        console.log('Loaded quiz data:', quizData);
        
        // Validate quiz data structure
        if (!isValidQuizData(quizData)) {
            throw new Error('Invalid quiz data structure');
        }
        
        // Initialize quiz
        initializeQuiz();
        
    } catch (error) {
        console.error('Failed to decode quiz data:', error);
        showError();
    }
}

// Validate Quiz Data Structure
function isValidQuizData(data) {
    return data && 
           data.title && 
           data.quizzes && 
           Array.isArray(data.quizzes) && 
           data.quizzes.length > 0 &&
           data.quizzes.every(quiz => 
               quiz.question && 
               quiz.options && 
               Array.isArray(quiz.options) &&
               typeof quiz.correctAnswer === 'number'
           );
}

// Initialize Quiz Interface
function initializeQuiz() {
    hideLoading();
    showQuizContainer();
    setupQuizHeader();
    setupStartScreen();
    setupEventListeners();
}

// Setup Quiz Header
function setupQuizHeader() {
    document.getElementById('quiz-title').textContent = quizData.title || '퀴즈';
    document.getElementById('quiz-description').textContent = quizData.description || '';
    
    // Set difficulty badge
    const difficultyElement = document.getElementById('quiz-difficulty');
    const difficulty = quizData.difficulty || 'medium';
    difficultyElement.textContent = getDifficultyText(difficulty);
    difficultyElement.className = `difficulty-badge ${difficulty.toLowerCase()}`;
    
    // Set quiz count
    document.getElementById('quiz-count').textContent = `${quizData.quizzes.length}개 문제`;
}

// Setup Start Screen
function setupStartScreen() {
    const totalQuestions = quizData.quizzes.length;
    const estimatedTime = Math.max(1, Math.ceil(totalQuestions * 1.5)); // 1.5 minutes per question
    
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('estimated-time').textContent = estimatedTime;
}

// Setup Event Listeners
function setupEventListeners() {
    // Start Quiz Button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Navigation Buttons
    document.getElementById('prev-btn').addEventListener('click', goToPreviousQuestion);
    document.getElementById('next-btn').addEventListener('click', goToNextQuestion);
    document.getElementById('finish-btn').addEventListener('click', finishQuiz);
    
    // Result Screen Buttons
    document.getElementById('restart-btn').addEventListener('click', restartQuiz);
    document.getElementById('review-btn').addEventListener('click', showReviewScreen);
    
    // Review Screen Buttons
    document.getElementById('back-to-result-btn').addEventListener('click', showResultScreen);
    document.getElementById('restart-from-review-btn').addEventListener('click', restartQuiz);
}

// Start Quiz
function startQuiz() {
    isQuizStarted = true;
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.quizzes.length).fill(null);
    userScore = 0;
    
    hideScreen(startScreen);
    showScreen(quizScreen);
    
    setupQuizScreen();
    displayCurrentQuestion();
}

// Setup Quiz Screen
function setupQuizScreen() {
    document.getElementById('total-questions-text').textContent = quizData.quizzes.length;
    updateProgress();
}

// Display Current Question
function displayCurrentQuestion() {
    const currentQuiz = quizData.quizzes[currentQuestionIndex];
    
    // Update question number and progress
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    updateProgress();
    
    // Display question text
    document.getElementById('current-question-text').textContent = currentQuiz.question;
    
    // Display options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    currentQuiz.options.forEach((option, index) => {
        const optionButton = createOptionButton(option, index);
        optionsContainer.appendChild(optionButton);
    });
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Create Option Button
function createOptionButton(option, index) {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.onclick = () => selectOption(index);
    
    // Check if this option was previously selected
    if (userAnswers[currentQuestionIndex] === index) {
        button.classList.add('selected');
    }
    
    button.innerHTML = `
        <div class="option-number">${String.fromCharCode(65 + index)}</div>
        <div class="option-text">${option}</div>
    `;
    
    return button;
}

// Select Option
function selectOption(optionIndex) {
    // Update user answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        btn.classList.toggle('selected', index === optionIndex);
    });
    
    // Enable next button
    updateNavigationButtons();
}

// Update Navigation Buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    
    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Next/Finish button
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;
    const isLastQuestion = currentQuestionIndex === quizData.quizzes.length - 1;
    
    if (isLastQuestion) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
        finishBtn.disabled = !hasAnswer;
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
        nextBtn.disabled = !hasAnswer;
    }
}

// Go to Previous Question
function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

// Go to Next Question
function goToNextQuestion() {
    if (currentQuestionIndex < quizData.quizzes.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
    }
}

// Update Progress Bar
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / quizData.quizzes.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

// Finish Quiz
function finishQuiz() {
    calculateScore();
    hideScreen(quizScreen);
    showScreen(resultScreen);
    displayResults();
}

// Calculate Score
function calculateScore() {
    userScore = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizData.quizzes[index].correctAnswer) {
            userScore++;
        }
    });
}

// Display Results
function displayResults() {
    const totalQuestions = quizData.quizzes.length;
    const percentage = Math.round((userScore / totalQuestions) * 100);
    
    document.getElementById('final-score').textContent = userScore;
    document.getElementById('final-total').textContent = totalQuestions;
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    
    // Update result stats
    document.getElementById('correct-answers').textContent = userScore;
    document.getElementById('wrong-answers').textContent = totalQuestions - userScore;
    
    // Add score-based styling
    const scoreDisplay = document.querySelector('.score-percentage');
    scoreDisplay.className = 'score-percentage';
    if (percentage >= 80) {
        scoreDisplay.style.color = '#48bb78'; // Green for excellent
    } else if (percentage >= 60) {
        scoreDisplay.style.color = '#ed8936'; // Orange for good
    } else {
        scoreDisplay.style.color = '#e53e3e'; // Red for needs improvement
    }
}

// Show Review Screen
function showReviewScreen() {
    hideScreen(resultScreen);
    showScreen(reviewScreen);
    displayReview();
}

// Display Review
function displayReview() {
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';
    
    quizData.quizzes.forEach((quiz, index) => {
        const reviewItem = createReviewItem(quiz, index);
        reviewContainer.appendChild(reviewItem);
    });
}

// Create Review Item
function createReviewItem(quiz, index) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const userAnswer = userAnswers[index];
    const correctAnswer = quiz.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;
    
    let optionsHTML = '';
    quiz.options.forEach((option, optionIndex) => {
        let optionClass = 'normal';
        if (optionIndex === correctAnswer) {
            optionClass = 'correct';
        } else if (optionIndex === userAnswer && !isCorrect) {
            optionClass = 'user-wrong';
        }
        
        optionsHTML += `
            <div class="review-option ${optionClass}">
                <div class="option-number">${String.fromCharCode(65 + optionIndex)}</div>
                <div class="option-text">${option}</div>
                ${optionIndex === correctAnswer ? '<span style="margin-left: auto; color: #48bb78; font-weight: bold;">✓ 정답</span>' : ''}
                ${optionIndex === userAnswer && !isCorrect ? '<span style="margin-left: auto; color: #e53e3e; font-weight: bold;">✗ 선택함</span>' : ''}
            </div>
        `;
    });
    
    div.innerHTML = `
        <div class="review-question">
            <strong>문제 ${index + 1}:</strong> ${quiz.question}
        </div>
        <div class="review-options">
            ${optionsHTML}
        </div>
        <div style="text-align: center; margin-top: 1rem;">
            <span style="padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; ${isCorrect ? 'background: #f0fff4; color: #48bb78;' : 'background: #fed7d7; color: #e53e3e;'}">
                ${isCorrect ? '정답' : '오답'}
            </span>
        </div>
    `;
    
    return div;
}

// Show Result Screen (from review)
function showResultScreen() {
    hideScreen(reviewScreen);
    showScreen(resultScreen);
}

// Restart Quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    userScore = 0;
    isQuizStarted = false;
    
    hideScreen(resultScreen);
    hideScreen(reviewScreen);
    showScreen(startScreen);
}

// Utility Functions
function hideLoading() {
    loadingScreen.style.display = 'none';
}

function showError() {
    hideLoading();
    errorScreen.style.display = 'flex';
}

function showQuizContainer() {
    quizContainer.style.display = 'block';
}

function hideScreen(screen) {
    screen.style.display = 'none';
}

function showScreen(screen) {
    screen.style.display = 'block';
}

function getDifficultyText(difficulty) {
    const difficultyMap = {
        'easy': '쉬움',
        'medium': '보통',
        'hard': '어려움',
        'beginner': '초급',
        'intermediate': '중급',
        'advanced': '고급'
    };
    return difficultyMap[difficulty.toLowerCase()] || '보통';
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    // You can add logic here to handle browser navigation if needed
});

// Add some fun easter eggs for engagement
const motivationalMessages = [
    "좋아요! 계속 진행해보세요! 💪",
    "훌륭해요! 집중하고 있네요! 🎯",
    "멋져요! 거의 다 왔어요! 🌟",
    "대단해요! 마지막 스퍼트! 🚀"
];

function showMotivationalMessage() {
    if (currentQuestionIndex > 0 && currentQuestionIndex % 3 === 0) {
        const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        // You can implement a toast notification here if needed
        console.log(message);
    }
}

// Performance monitoring
let quizStartTime = null;
let quizEndTime = null;

function startQuizTimer() {
    quizStartTime = new Date();
}

function endQuizTimer() {
    quizEndTime = new Date();
    const duration = (quizEndTime - quizStartTime) / 1000; // in seconds
    console.log(`Quiz completed in ${Math.round(duration)} seconds`);
}

// Add to start quiz function
const originalStartQuiz = startQuiz;
startQuiz = function() {
    startQuizTimer();
    originalStartQuiz.call(this);
};

// Add to finish quiz function
const originalFinishQuiz = finishQuiz;
finishQuiz = function() {
    endQuizTimer();
    originalFinishQuiz.call(this);
};

// Debug function for development
function debugQuizData() {
    console.log('Current Quiz Data:', quizData);
    console.log('User Answers:', userAnswers);
    console.log('Current Question Index:', currentQuestionIndex);
    console.log('User Score:', userScore);
}

// Make debug function available globally
window.debugQuiz = debugQuizData;

console.log('Quiz application initialized successfully! 🎉');