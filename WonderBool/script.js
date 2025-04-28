document.addEventListener('DOMContentLoaded', () => {
  const levelSelection = document.getElementById('level-selection');
  const gameArea = document.getElementById('game-area');
  const gameTitle = document.getElementById('game-title');
  const gameContent = document.getElementById('game-content');
  const messageArea = document.getElementById('message-area');
  const p5Container = document.getElementById('p5-canvas-container');
  const backButton = document.getElementById('back-to-levels');
  const levelButtons = document.querySelectorAll('.level-btn');

  let currentLevel = null;
  let p5Instance = null; // To hold the p5 sketch instance

  // --- Level Definitions ---
  const levels = {
      1: {
          title: 'Apprentice Alchemy: Potion Sequences',
          setup: setupLevel1
      },
      2: {
          title: 'Journeyman Spells: Introduction to Spellcasting',
          setup: setupLevel2
      },
      3: {
          title: 'Master Sorcery: Artifact Sorting & Arcane Structures',
          setup: setupLevel3
      }
  };

  // --- Event Listeners --- 
  levelButtons.forEach(button => {
      button.addEventListener('click', () => {
          currentLevel = parseInt(button.dataset.level);
          loadLevel(currentLevel);
      });
  });

  backButton.addEventListener('click', () => {
      showLevelSelection();
  });

  // --- Core Functions --- 
  function showLevelSelection() {
      levelSelection.classList.remove('hidden');
      gameArea.classList.add('hidden');
      gameTitle.textContent = '';
      gameContent.innerHTML = '';
      messageArea.innerHTML = '';
      messageArea.className = 'message-area'; // Reset message styling
      clearP5Instance(); // Clean up p5 sketch if exists
  }

  function loadLevel(levelNumber) {
      if (levels[levelNumber]) {
          levelSelection.classList.add('hidden');
          gameArea.classList.remove('hidden');
          gameTitle.textContent = levels[levelNumber].title;
          gameContent.innerHTML = ''; // Clear previous content
          messageArea.innerHTML = '';
          messageArea.className = 'message-area';
          clearP5Instance();

          // Call the specific setup function for the level
          levels[levelNumber].setup();
      } else {
          console.error('Invalid level number:', levelNumber);
      }
  }

  function showMessage(text, type = 'info') {
      messageArea.textContent = text;
      messageArea.className = `message-area message-${type}`; // type can be 'success' or 'error'
  }

  function clearP5Instance() {
      if (p5Instance) {
          p5Instance.remove(); // This removes the canvas and stops the draw loop
          p5Instance = null;
          p5Container.innerHTML = ''; // Clear the container just in case
      }
  }

  // --- Level 3 Setup: Master Sorcery ---
  function setupLevel3() {
      gameContent.innerHTML = `
          <p><strong>Challenge:</strong> Sort these magical artifacts by power level using the Bubble Sort incantation.</p>
          <p>Unsorted Artifacts (by power):</p>
          <div class="visualization-area" id="sort-area">
              <!-- Artifact representations (bars) will be generated here -->
          </div>
          <div style="margin-top: 1rem;">
              <button class="check-btn" id="start-sort-btn"><i class="fas fa-hand-sparkles"></i> Begin Sorting Incantation</button>
              <button class="check-btn" id="reset-sort-btn"><i class="fas fa-undo-alt"></i> Reset Artifacts</button>
          </div>
          <hr>
          <p><strong>Advanced Studies (Coming Soon):</strong></p>
          <div id="tree-graph-placeholder" style="text-align: center; margin-top: 1rem; color: var(--primary-color);">
             <i class="fas fa-tree"></i> Explore Ancient Runes (Trees) <br>
             <i class="fas fa-network-wired"></i> Map Ley Lines (Graphs)
          </div>
      `;

      const sortArea = document.getElementById('sort-area');
      const startSortBtn = document.getElementById('start-sort-btn');
      const resetSortBtn = document.getElementById('reset-sort-btn');
      let numbersToSort = [];
      let sortingInterval = null;

      function generateBars() {
          sortArea.innerHTML = '';
          numbersToSort = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 5);
          numbersToSort.forEach((num, index) => {
              const bar = document.createElement('div');
              bar.className = 'sort-bar';
              bar.style.height = `${num}%`; // Use percentage for relative height
              bar.style.order = index; // Maintain initial order visually
              bar.dataset.value = num;
              bar.title = num; // Show value on hover
              sortArea.appendChild(bar);
          });
           showMessage('Bars generated. Click Start Bubble Sort to visualize.', 'info');
           if(sortingInterval) clearInterval(sortingInterval);
           startSortBtn.disabled = false;
      }

      async function bubbleSort() {
          startSortBtn.disabled = true;
          showMessage('Bubble Sort Started...', 'info');
          let bars = Array.from(sortArea.children);
          let n = bars.length;
          let swapped;
          do {
              swapped = false;
              for (let i = 0; i < n - 1; i++) {
                  const bar1 = bars[i];
                  const bar2 = bars[i + 1];
                  if (parseInt(bar1.dataset.value) > parseInt(bar2.dataset.value)) {
                      const tempHeight = bar1.style.height;
                      bar1.style.height = bar2.style.height;
                      bar2.style.height = tempHeight;

                      const tempValue = bar1.dataset.value;
                      bar1.dataset.value = bar2.dataset.value;
                      bar2.dataset.value = tempValue;

                      swapped = true;
                  }
              }
              n--;
              await new Promise(resolve => setTimeout(resolve, 200)); // Wait for animation
              bars = Array.from(sortArea.children); // Re-fetch the bars after each pass
          } while (swapped);
          showMessage('Sorting completed!', 'success');
      }

      startSortBtn.addEventListener('click', bubbleSort);
      resetSortBtn.addEventListener('click', generateBars);
      generateBars();
  }

  // Default to level selection view on start
  showLevelSelection();
});
