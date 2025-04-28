document.addEventListener('DOMContentLoaded', () => {
    const challenges = [
        {
            id: 1,
            title: "Lumos Spell (Printing)",
            instructions: "To light up your wand, you need to cast the Lumos spell. Use the `print()` spell to output the word 'Lumos'.",
            goal: "Print the exact text 'Lumos' to the output.",
            spells: ["print('your text here')"],
            expectedOutput: "Lumos",
            setupCode: "", // No setup needed
            validation: (output) => output.trim() === 'Lumos'
        },
        {
            id: 2,
            title: "Ingredient Count (Arithmetic)",
            instructions: "Professor Snape requires exactly 5 Lacewing Flies and 3 Boomslang Skins for the Polyjuice Potion. Calculate the total number of these ingredients and `print()` the result.",
            goal: "Calculate 5 + 3 and print the sum.",
            spells: ["print(number)", "Use + for addition"],
            expectedOutput: "8",
            setupCode: "",
            validation: (output) => output.trim() === '8'
        },
        {
            id: 3,
            title: "Sharing Flobberworms (Modulo)",
            instructions: "You found 17 Flobberworms! You need to divide them into groups of 5 for your classmates. How many worms will be left over? Use the modulo operator (`%`) and `print()` the remainder.",
            goal: "Calculate 17 % 5 and print the remainder.",
            spells: ["print(number)", "Use % for modulo"],
            expectedOutput: "2",
            setupCode: "",
            validation: (output) => output.trim() === '2'
        },
        {
            id: 4,
            title: "Potion Temperature (Conditionals)",
            instructions: "The Shrinking Solution must be exactly 45 degrees. We've measured the temperature and stored it in a variable called `currentTemp`. Check if `currentTemp` is equal to 45. If it is, `print('Perfect!')`. Otherwise, `print('Wrong temperature!')`. Use an `if/else` statement.",
            goal: "Check if currentTemp equals 45 and print the correct message.",
            spells: ["print('message')", "if (condition) { ... } else { ... }", "Use === for equality check"],
            expectedOutput: "Perfect!",
            setupCode: "let currentTemp = 45;", // This code runs before user code
            validation: (output) => output.trim() === 'Perfect!'
        },
        {
            id: 5,
            title: "Checking for Even Leeches (Booleans & Conditionals)",
            instructions: "A potion requires an even number of leeches. We have `numberOfLeeches`. Check if `numberOfLeeches` is even. If true, `print('Even number')`. If false, `print('Odd number')`. Remember, an even number has a remainder of 0 when divided by 2.",
            goal: "Determine if numberOfLeeches (12) is even and print the correct message.",
            spells: ["print('message')", "if (condition) { ... } else { ... }", "Use % 2 === 0 to check for even"],
            expectedOutput: "Even number",
            setupCode: "let numberOfLeeches = 12;",
            validation: (output) => output.trim() === 'Even number'
        },
        {
            id: 6,
            title: "Stirring the Cauldron (Loops)",
            instructions: "This potion needs precise stirring: exactly 3 times clockwise. Use a `for` loop to `print('Stir clockwise')` three times.",
            goal: "Print 'Stir clockwise' on three separate lines.",
            spells: ["print('message')", "for (let i = 0; i < count; i = i + 1) { ... }"],
            expectedOutput: "Stir clockwise\nStir clockwise\nStir clockwise",
            setupCode: "",
            validation: (output) => output.trim() === 'Stir clockwise\nStir clockwise\nStir clockwise'
        },
    ];

    let currentChallenge = null;
    let completedChallenges = new Set(JSON.parse(localStorage.getItem('completedChallenges')) || []);

    const challengeTitle = document.getElementById('challenge-title');
    const challengeInstructions = document.getElementById('challenge-instructions');
    const challengeGoal = document.getElementById('challenge-goal');
    const challengeExpectedOutput = document.getElementById('challenge-expected-output');
    const challengeSpellsList = document.getElementById('challenge-spells');
    const userCodeInput = document.getElementById('user-code');
    const castSpellBtn = document.getElementById('cast-spell-btn');
    const outputArea = document.getElementById('output');
    const feedbackArea = document.getElementById('feedback');
    const levelButtonsContainer = document.getElementById('level-buttons');
    const completedCountSpan = document.getElementById('completed-count');
    const totalCountSpan = document.getElementById('total-count');
    const resetProgressBtn = document.getElementById('reset-progress-btn');

    function loadChallenge(challenge) {
        currentChallenge = challenge;
        challengeTitle.textContent = challenge.title;
        challengeInstructions.textContent = challenge.instructions;
        challengeGoal.textContent = challenge.goal;
        challengeExpectedOutput.textContent = challenge.expectedOutput;
        challengeSpellsList.innerHTML = challenge.spells.map(spell => `<li>${spell}</li>`).join('');
        userCodeInput.value = ''; // Clear previous code
        outputArea.textContent = '';
        feedbackArea.textContent = '';
        feedbackArea.className = ''; // Clear feedback styling

        // Highlight the current level button
        document.querySelectorAll('#level-buttons button').forEach(btn => {
            btn.style.fontWeight = (parseInt(btn.dataset.id) === challenge.id) ? 'bold' : 'normal';
            btn.style.border = (parseInt(btn.dataset.id) === challenge.id) ? '2px solid var(--header-bg)' : 'none';
        });

        console.log(`Loading Challenge ${challenge.id}: ${challenge.title}`);
        console.log("Setup Code:", challenge.setupCode);
    }

    function displayLevels() {
        levelButtonsContainer.innerHTML = ''; // Clear existing buttons
        challenges.forEach(challenge => {
            const button = document.createElement('button');
            button.textContent = `${challenge.id}. ${challenge.title.split('(')[0].trim()}`;
            button.dataset.id = challenge.id;
            if (completedChallenges.has(challenge.id)) {
                button.classList.add('completed');
            }
            button.addEventListener('click', () => loadChallenge(challenge));
            levelButtonsContainer.appendChild(button);
        });
        updateProgress();
    }

    function updateProgress() {
        completedCountSpan.textContent = completedChallenges.size;
        totalCountSpan.textContent = challenges.length;
        localStorage.setItem('completedChallenges', JSON.stringify(Array.from(completedChallenges)));
    }

    function resetProgress() {
        if (confirm("Are you sure you want to reset all your progress? This cannot be undone!")) {
            completedChallenges.clear();
            localStorage.removeItem('completedChallenges');
            displayLevels(); // Update UI
            if (challenges.length > 0) {
                loadChallenge(challenges[0]); // Load the first challenge
            }
            console.log("Progress reset.");
        }
    }

    function executeCode() {
        const userCode = userCodeInput.value;
        outputArea.textContent = ''; // Clear previous output
        feedbackArea.textContent = '';
        feedbackArea.className = '';

        if (!currentChallenge) {
            feedbackArea.textContent = "Please select a challenge first.";
            feedbackArea.className = 'error';
            return;
        }

        const capturedOutput = [];
        const print = (...args) => {
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            capturedOutput.push(message);
            // Display visually line by line
            outputArea.textContent += `> ${message}\n`;
        };

        try {
            // Combine setup code and user code safely using Function constructor
            // 'use strict' helps catch common coding errors and prevents some unsafe actions
            const fullCode = `'use strict';\n${currentChallenge.setupCode || ''}\n${userCode}`;
            console.log("Executing code:", fullCode); // Log the code being executed

            // Create the function with specific arguments it can accept (only print)
            const spellFunction = new Function('print', fullCode);

            // Execute the function, passing our custom print
            spellFunction(print);

            const finalOutput = capturedOutput.join('\n');
            console.log("Captured Output:", finalOutput);
            console.log("Expected Output:", currentChallenge.expectedOutput);

            // Validation
            if (currentChallenge.validation(finalOutput)) {
                feedbackArea.textContent = `Success! Potion brewed correctly! You completed '${currentChallenge.title}'.`;
                feedbackArea.className = 'success';
                if (!completedChallenges.has(currentChallenge.id)) {
                    completedChallenges.add(currentChallenge.id);
                    displayLevels(); // Update button appearance and progress
                }
                // Maybe automatically load next challenge?
                const nextChallengeIndex = challenges.findIndex(c => c.id === currentChallenge.id) + 1;
                if (nextChallengeIndex < challenges.length) {
                    // Optional: Add a small delay before loading next
                    // setTimeout(() => loadChallenge(challenges[nextChallengeIndex]), 1500);
                }
            } else {
                feedbackArea.textContent = `Almost! The potion isn't quite right. Check your spell code and the expected output.`;
                feedbackArea.className = 'error';
            }

        } catch (error) {
            console.error("Execution Error:", error);
            outputArea.textContent += `\n--- ERROR ---`;
            feedbackArea.innerHTML = `<i class="fas fa-bolt"></i> Spell Error: <span class="error-message">${error.message}</span>`;
            feedbackArea.className = 'error';
        }
    }

    castSpellBtn.addEventListener('click', executeCode);
    resetProgressBtn.addEventListener('click', resetProgress);

    // Initial setup
    displayLevels();
    // Load the first incomplete challenge or the very first one
    const firstIncomplete = challenges.find(c => !completedChallenges.has(c.id));
    if (firstIncomplete) {
        loadChallenge(firstIncomplete);
    } else if (challenges.length > 0) {
        loadChallenge(challenges[0]); // Load first challenge if all complete or none started
    }
});