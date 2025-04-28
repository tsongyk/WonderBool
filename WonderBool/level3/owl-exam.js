document.addEventListener('DOMContentLoaded', () => {
  const questions = [
      {
          question: "Which sorting spell has a worst-case time complexity of O(n^2) but is efficient for nearly sorted lists?",
          answers: ["Bubble Sort (Simplificus Sortitus)", "Insertion Sort (Insertio Ordino)", "Merge Sort (Conjunctio Divisio)", "Selection Sort (Selecto Minimus)"],
          correctAnswer: "Insertion Sort (Insertio Ordino)",
          topic: "Sorting"
      },
      {
          question: "Professor Flitwick needs to sort a large number of student records guaranteeing O(n log n) performance. Which spell is most suitable?",
          answers: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort"],
          correctAnswer: "Merge Sort",
          topic: "Sorting"
      },
      {
          question: "What is the primary characteristic of a Binary Search Tree (Arbor Cognitus)?",
          answers: ["Nodes can have any number of children", "All nodes at the same level must have the same value", "Left child is smaller, Right child is larger", "The tree must always be perfectly balanced"],
          correctAnswer: "Left child is smaller, Right child is larger",
          topic: "Trees"
      },
       {
          question: "Which data structure performs magical rotations to maintain balance and guarantee O(log n) search/insert time?",
          answers: ["Standard BST", "Array", "Linked List", "AVL Tree"],
          correctAnswer: "AVL Tree",
          topic: "Trees"
      },
      {
           question: "Which sorting spell repeatedly finds the minimum element from the unsorted part and puts it at the beginning?",
           answers: ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort"],
           correctAnswer: "Selection Sort",
           topic: "Sorting"
      },
      {
          question: "An AVL Tree's balance factor for any node must be within what range?",
          answers: ["0 only", "-1, 0, or 1", "-2, -1, 0, 1, or 2", "Any integer value"],
          correctAnswer: "-1, 0, or 1",
          topic: "Trees"
      },
       {
          question: "What is the main disadvantage of a basic Binary Search Tree compared to an AVL Tree?",
          answers: ["BSTs are harder to implement", "BSTs can become unbalanced (skewed), leading to O(n) operations", "BSTs cannot store duplicate values", "BSTs require more memory"],
          correctAnswer: "BSTs can become unbalanced (skewed), leading to O(n) operations",
          topic: "Trees"
      },
      {
           question: "Merge Sort uses which powerful magical technique?",
           answers: ["Transfiguration", "Divide and Conquer", "Memory Charm", "Apparition"],
           correctAnswer: "Divide and Conquer",
           topic: "Sorting"
      }
      // Add more questions as needed
  ];

  let currentQuestionIndex = 0;
  let score = 0;
  let questionsAnswered = false; // Flag to prevent multiple answers per question

  const questionAreaEl = document.getElementById('question-area');
  const answersAreaEl = document.getElementById('answers-area');
  const navigationAreaEl = document.getElementById('navigation-area');
  const questionNumberEl = document.getElementById('question-number');
  const questionTextEl = document.getElementById('question-text');
  const answerListEl = document.getElementById('answer-list');
  const feedbackAreaEl = document.getElementById('feedback-area');
  const nextBtn = document.getElementById('next-btn');
  const resultsBtn = document.getElementById('results-btn');
  const restartBtn = document.getElementById('restart-btn');
  const resultsAreaEl = document.getElementById('results-area');
  const scoreTextEl = document.getElementById('score-text');
  const resultMessageEl = document.getElementById('result-message');


  function loadQuestion() {
      questionsAnswered = false; // Reset answered flag
      feedbackAreaEl.innerHTML = ''; // Clear feedback
      feedbackAreaEl.className = 'feedback-area'; // Reset feedback class
      resultsAreaEl.style.display = 'none'; // Hide results area
      answerListEl.innerHTML = ''; // Clear previous answers

      if (currentQuestionIndex < questions.length) {
          const currentQuestion = questions[currentQuestionIndex];
          questionNumberEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
          questionTextEl.textContent = currentQuestion.question;

          currentQuestion.answers.forEach(answer => {
              const li = document.createElement('li');
              const button = document.createElement('button');
              button.textContent = answer;
              button.onclick = () => selectAnswer(button, answer, currentQuestion.correctAnswer);
              li.appendChild(button);
              answerListEl.appendChild(li);
          });

          nextBtn.style.display = 'none'; // Hide next button until answer selected
          resultsBtn.style.display = 'none';
          restartBtn.style.display = 'none';

      } else {
          // End of quiz
          showResults();
      }
  }

  function selectAnswer(button, selectedAnswer, correctAnswer) {
      if (questionsAnswered) return; // Prevent answering again
      questionsAnswered = true;

      // Disable all answer buttons
      const buttons = answerListEl.querySelectorAll('button');
      buttons.forEach(btn => btn.disabled = true);

      // Check if correct
      if (selectedAnswer === correctAnswer) {
          score++;
          button.classList.add('correct');
          feedbackAreaEl.textContent = "Correct! Well done, young wizard!";
          feedbackAreaEl.className = 'feedback-area correct';
      } else {
          button.classList.add('incorrect');
          feedbackAreaEl.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
          feedbackAreaEl.className = 'feedback-area incorrect';
          // Highlight the correct answer button as well
           buttons.forEach(btn => {
               if (btn.textContent === correctAnswer) {
                   btn.classList.add('correct'); // Show the correct one
               }
           });
      }

      // Show Next or Results button
      if (currentQuestionIndex < questions.length - 1) {
          nextBtn.style.display = 'inline-block';
      } else {
          resultsBtn.style.display = 'inline-block';
      }
  }

  function showResults() {
      questionAreaEl.style.display = 'none';
      answersAreaEl.style.display = 'none';
      feedbackAreaEl.style.display = 'none';
      navigationAreaEl.style.display = 'block'; // Keep navigation for restart
      nextBtn.style.display = 'none';
      resultsBtn.style.display = 'none';
      restartBtn.style.display = 'inline-block';


      resultsAreaEl.style.display = 'block';
      scoreTextEl.textContent = `Your Score: ${score} out of ${questions.length}`;

      let message = "";
      const percentage = (score / questions.length) * 100;
      if (percentage >= 90) {
          message = "Outstanding! A true master of computational magic!";
      } else if (percentage >= 70) {
          message = "Exceeds Expectations! Very well done.";
      } else if (percentage >= 50) {
          message = "Acceptable. More practice needed, but a good effort.";
      } else {
          message = "Poor. Return to your studies immediately!";
      }
      resultMessageEl.textContent = message;
  }

  function restartQuiz() {
      currentQuestionIndex = 0;
      score = 0;
      questionAreaEl.style.display = 'block';
      answersAreaEl.style.display = 'block';
      feedbackAreaEl.style.display = 'block'; // Show feedback area again
      loadQuestion();
  }

  // Event Listeners for buttons
  nextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      loadQuestion();
  });

  resultsBtn.addEventListener('click', showResults);
  restartBtn.addEventListener('click', restartQuiz);


  // Initial load
  loadQuestion();
});