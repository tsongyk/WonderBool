// Game State
const initialPosition = { x: 0, y: 0 };
let goalPosition = { x: 4, y: 4 };
let obstacles = [];
let GRID_SIZE = 5; // will increase over levels
const STEP_DELAY = 350;
const MAX_BLOCKS = 15;

let position = { ...initialPosition };
let workspace; // Declared here, but will be assigned the Blockly instance

let currentLevel = 1;
let isRunning = false;
let executionTimeoutId = null;
const statusDisplay = document.getElementById('status');


// --- Initial Setup ---
window.onload = () => {
  const gameGridEl = document.getElementById('gameGrid');
  if (gameGridEl) {
     gameGridEl.style.setProperty('--grid-size', GRID_SIZE);
  }

  // Inject Blockly and assign to the 'workspace' variable
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    maxBlocks: MAX_BLOCKS,
    scrollbars: true,
    horizontalLayout: false,
     zoom: {
         controls: true,
         wheel: true,
         startScale: 1.0,
         maxScale: 3,
         minScale: 0.3,
         scaleSpeed: 1.2
     },
    trashcan: true
  });

  // *** POTENTIAL FIX B: Expose workspace globally for access from generated code ***
  window.workspace = workspace;

  document.querySelector('.run').addEventListener('click', runCode);
  document.querySelector('.reset').addEventListener('click', resetGame);

  initLevel();
  updateGrid();
  statusMessage("Ready", 'info');
};

// --- Block Definitions (These should be correct from previous steps) ---
Blockly.Blocks['move_up'] = { init: function() { this.appendDummyInput().appendField("Move up"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230); this.setTooltip("Moves up."); } };
Blockly.Blocks['move_down'] = { init: function() { this.appendDummyInput().appendField("Move down"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230); this.setTooltip("Moves down."); } };
Blockly.Blocks['move_left'] = { init: function() { this.appendDummyInput().appendField("Move left"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230); this.setTooltip("Moves left."); } };
Blockly.Blocks['move_right'] = { init: function() { this.appendDummyInput().appendField("Move right"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230); this.setTooltip("Moves right."); } };

// REPEAT BLOCK DEFINITION
Blockly.Blocks['controls_repeat_ext'] = {
  init: function() {
    this.appendValueInput('TIMES').setCheck('Number').appendField('repeat');
    this.appendStatementInput('DO').setCheck(null).appendField('do'); // Added .setCheck(null) for clarity
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Repeat some statements several times.');
  }
};


// --- Code Generators (These should be correct and standard) ---
const Order = {
  ATOMIC: 0, UNARY_NEGATION: 2, ADDITION: 6, FUNCTION_CALL: 8, NONE: 99
};

Blockly.JavaScript.forBlock['move_up'] = function(block, generator) { return `await window.stepMove(0, -1, '${block.id}');\n`; };
Blockly.JavaScript.forBlock['move_down'] = function(block, generator) { return `await window.stepMove(0, 1, '${block.id}');\n`; };
Blockly.JavaScript.forBlock['move_left'] = function(block, generator) { return `await window.stepMove(-1, 0, '${block.id}');\n`; };
Blockly.JavaScript.forBlock['move_right'] = function(block, generator) { return `await window.stepMove(1, 0, '${block.id}');\n`; };

Blockly.JavaScript.forBlock['controls_repeat_ext'] = function (block) {
  // Repeats a number of times specified by `TIMES`.
  var times = Blockly.JavaScript.valueToCode(block, 'TIMES', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  // Get code to repeat.
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');

  // Add the code for a repeat loop.
  return 'for (var count = 0; count < ' + times + '; count++) {\n' + branch + '}\n';
};


// --- Game Logic ---
function isObstacle(x, y) {
  return obstacles.some(ob => ob.x === x && ob.y === y);
}

function initLevel() {

  // Set goal at bottom-right
  goalPosition = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };

  // Generate obstacles
  generateObstacles();

  // Reset player position
  position = { ...initialPosition };

  // Update Grid CSS
  const gameGridEl = document.getElementById('gameGrid');
  if (gameGridEl) {
    gameGridEl.style.setProperty('--grid-size', GRID_SIZE);
  }

  updateGrid();
  statusMessage(`Level ${currentLevel}: Reach the spellbook!`, 'info');
}

// --- Obstacle Generation ---
function generateObstacles() {
  const totalObstacles = 5;
  obstacles = [];

  let attempts = 0;
  do {
    obstacles = [];
    const occupied = new Set();
    occupied.add('0,0'); // starting position
    occupied.add(`${goalPosition.x},${goalPosition.y}`); // goal

    while (obstacles.length < totalObstacles) {
      const ox = Math.floor(Math.random() * GRID_SIZE);
      const oy = Math.floor(Math.random() * GRID_SIZE);
      const key = `${ox},${oy}`;
      if (!occupied.has(key)) {
        obstacles.push({ x: ox, y: oy });
        occupied.add(key);
      }
    }
    attempts++;
    if (attempts > 50) break; // prevent infinite loops
  } while (!pathExists());
}

// --- Path Checking (BFS) ---
function pathExists() {
  const queue = [{ x: position.x, y: position.y }];
  const visited = new Set();
  visited.add(`${position.x},${position.y}`);

  while (queue.length > 0) {
    const { x, y } = queue.shift();

    if (x === goalPosition.x && y === goalPosition.y) {
      return true;
    }

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (
        nx >= 0 && nx < GRID_SIZE &&
        ny >= 0 && ny < GRID_SIZE &&
        !visited.has(key) &&
        !obstacles.some(ob => ob.x === nx && ob.y === ny)
      ) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return false;
}

function updateGrid() {
  const gridEl = document.getElementById('gameGrid');
  if (!gridEl) return;
  gridEl.innerHTML = '';

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (x === position.x && y === position.y) {
        cell.classList.add('player');
        cell.textContent = '🧙';
      } else if (x === goalPosition.x && y === goalPosition.y) {
        cell.classList.add('goal');
        cell.textContent = '📕';
      } else if (isObstacle(x, y)) {
        cell.classList.add('obstacle');
        cell.textContent = '📚';
      }
      gridEl.appendChild(cell);
    }
  }

  const positionText = document.getElementById('positionText');
  if (positionText) {
    positionText.textContent = `Position: (${position.x}, ${position.y})`;
  }
}

function calculateAndSetMove(dx, dy) {
  const newX = position.x + dx;
  const newY = position.y + dy;

  if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
    console.warn('Move blocked: Out of bounds.');
    return false;
  }

  if (isObstacle(newX, newY)) {
    console.warn('Move blocked: Obstacle at', newX, newY);
    return false;
  }

  position.x = newX;
  position.y = newY;
  console.log(`Moved to (${position.x}, ${position.y})`);
  return true;
}

// This is the function called by the *generated code* for each step
async function stepMove(dx, dy, blockId) {
  if (!isRunning) {
       throw new Error('Execution stopped.');
  }

  // *** FIX B APPLIED HERE: Access workspace via window ***
  // Check if window.workspace exists before calling highlightBlock
  if (window.workspace) {
      window.workspace.highlightBlock(blockId);
  } else {
      console.warn("Blockly workspace not available for highlighting.");
  }


  const moveSuccessful = calculateAndSetMove(dx, dy);
  updateGrid();

  await new Promise((resolve, reject) => {
    executionTimeoutId = setTimeout(() => {
       executionTimeoutId = null;
       resolve();
    }, STEP_DELAY);
  });

   if (!moveSuccessful) {
      statusMessage("Failed! Hit wall or obstacle.", 'error');
       throw new Error('Wizard hit obstacle or wall.');
   }

   if (position.x === goalPosition.x && position.y === goalPosition.y) {
        statusMessage("Success! Wizard reached the goal!", 'success');

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          if (confirm('Congratulations! 🎉 You reached the Spellbook! Play again?')) {
            resetGame();
          }
        }, 500);
   }

   // *** FIX B APPLIED HERE: Access workspace via window ***
   if (window.workspace) {
       window.workspace.highlightBlock(null); // Remove highlight after successful step
   }
}
function statusMessage(msg, type = 'info') {
    if (statusDisplay) {
        statusDisplay.textContent = msg;
        // statusDisplay.className = 'status ' + type;
    } else {
        console.log("Status:", msg);
    }
}


// --- Code Execution ---
async function runCode() {
  if (isRunning) {
      console.log("Already running...");
      return;
  }

  const runButton = document.querySelector('.run');
  const resetButton = document.querySelector('.reset');

  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) {
       statusMessage('Add some blocks first!', 'info');
       return;
  }

  // Although maxBlocks limits creation, you could add a check here too if needed
  // const blockCount = workspace.getAllBlocks(false).length;
  // if (blockCount > MAX_BLOCKS) { ... }


  isRunning = true;
  runButton.disabled = true;
  resetButton.disabled = false;
  workspace.highlightBlock(null);
  statusMessage("Running...", 'info');

  position = { ...initialPosition };
  updateGrid();
  await new Promise(resolve => setTimeout(resolve, 100));


  window.stepMove = stepMove; // Expose stepMove
  window.position = position; // Expose position for potential final check in generated code
  window.goalPosition = goalPosition; // Expose goalPosition
  window.statusMessage = statusMessage; // Expose statusMessage
  window.cleanupRun = cleanupRun; // Expose cleanupRun
   // Note: obstacles, GRID_SIZE are used in calculateAndSetMove, which is called by stepMove.
   // If stepMove were defined INSIDE the runner function, it would have access.
   // Since stepMove is global, it needs access to these state variables.
   // Exposing them globally is one way, or pass them as arguments if state were more complex.
   window.obstacles = obstacles;
   window.GRID_SIZE = GRID_SIZE;


  // Set up the infinite loop trap.
  // *** FIX A: Increase Loop Trap limit ***
  Blockly.JavaScript.INFINITE_LOOP_TRAP = 'if (!window.isRunning || --window.LoopTrap <= 0) throw "Infinite loop or execution stopped.";\n';
  window.LoopTrap = 20000; // Significantly increased

  let code = '';
  try {
    code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log('Generated code:\n', code);
  } catch (e) {
    console.error('Error generating code:', e);
    statusMessage('Error generating code.', 'error');
    cleanupRun();
    return;
  }

  try {
    const runner = new Function(`
      return async () => {
        try {
          ${code}
          // Check win condition again after code finishes normally
          if (window.isRunning && window.position.x === window.goalPosition.x && window.position.y === window.goalPosition.y) {
               window.statusMessage("Success! Robot reached the goal!", 'success');
          } else if (window.isRunning) {
               window.statusMessage("Finished running code, but did not reach the goal.", 'info');
          }
        } catch (e) {
           // Handle intentional stops vs unexpected errors
           if (e.message === 'Execution stopped.' || e.message.includes('Infinite loop')) {
               console.log(e.message); // Log intentional stops quietly
               window.statusMessage("Execution stopped.", 'warning'); // User feedback
           } else if (e.message === 'Goal reached.') {
                console.log("Goal reached, stopping execution.");
                // statusMessage is already set by stepMove
           } else if (e.message === 'Robot hit obstacle or wall.') {
                console.log("Robot hit obstacle or wall, stopping execution.");
                 // statusMessage is already set by stepMove
           }
           else {
                console.error('Error during execution:', e);
                window.statusMessage('Error during execution: ' + e.message, 'error');
           }
        } finally {
           window.cleanupRun(); // Ensure cleanup happens regardless of how execution ends
        }
      };
    `)(); // Immediately call the outer function

    await runner(); // Await the execution

  } catch (e) {
    console.error('Critical error running code setup:', e);
    statusMessage('A critical error occurred during execution setup.', 'error');
    cleanupRun();
  }
}

function resetGame() {
  console.log('Resetting game and clearing workspace...');

  isRunning = false;
  if (executionTimeoutId) {
    clearTimeout(executionTimeoutId);
    executionTimeoutId = null;
  }

  position = { ...initialPosition };
  updateGrid();

  // Use the workspace variable directly, accessible in this scope
  if (workspace) {
      workspace.clear();
      workspace.highlightBlock(null);
  }


  document.querySelector('.run').disabled = false;
  document.querySelector('.reset').disabled = false;
  statusMessage("Game reset. Workspace cleared.", 'info');

  cleanupRun();
}

// Cleans up global state after run completes or is reset
function cleanupRun() {
  isRunning = false;

  if (executionTimeoutId) {
    clearTimeout(executionTimeoutId);
    executionTimeoutId = null;
  }

  // Clean up global properties set for the generated code's scope
  if (window.stepMove) delete window.stepMove;
  if (window.LoopTrap) delete window.LoopTrap;
  if (window.position) delete window.position;
  if (window.goalPosition) delete window.goalPosition;
  if (window.statusMessage) delete window.statusMessage;
  if (window.cleanupRun) delete window.cleanupRun;
  if (window.obstacles) delete window.obstacles;
  if (window.GRID_SIZE) delete window.GRID_SIZE;
   // IMPORTANT: Do NOT delete window.workspace here if you exposed it globally!
   // It's needed by the main script's resetGame and the highlighting within stepMove.


  document.querySelector('.run').disabled = false;
  document.querySelector('.reset').disabled = false;
}