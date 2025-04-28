// Global p5 variables
let tree; // Can be BST or AVL Tree
let treeType = 'bst'; // Default tree type
let nodeSize = 40;
let levelHeight = 80;
let isAnimating = false;
let animationQueue = []; // To handle sequential animations
let statusMessageEl;
let creatureInputEl;

// Node class for BST
class Node {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1; // Height for AVL balancing
        this.x = x; // Position for drawing
        this.y = y;
        this.color = color(128, 0, 128); // Default color (Purple)
        this.highlightColor = color(255, 165, 0, 150); // Semi-transparent orange for highlight
        this.isHighlighting = false;
    }

    // Draw the node
    show() {
        // 1. Read CSS variable
        const darkBrown = getComputedStyle(document.documentElement).getPropertyValue('--dark-brown').trim();
        // 2. Use it in your stroke
        stroke(darkBrown);
        strokeWeight(1);
        fill(this.color);
        ellipse(this.x, this.y, nodeSize, nodeSize);
        
        if (this.isHighlighting) {
             noStroke();
            fill(this.highlightColor);
            ellipse(this.x, this.y, nodeSize * 1.2, nodeSize * 1.2);
            this.isHighlighting = false; // Reset after drawing highlight once
        }
        // 1. Read CSS variable
        const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
        fill(gold);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text(this.value, this.x, this.y);

        // Display height for AVL
        if (treeType === 'avl') {
             fill(200, 200, 200); // Lighter text color for height
             textSize(10);
             textAlign(RIGHT, TOP);
             text(`h:${this.height}`, this.x + nodeSize / 2 - 2, this.y - nodeSize / 2 + 2);
        }
    }

    // Highlight the node temporarily
    highlight() {
        this.isHighlighting = true;
    }
}

// --- Base Tree Class (Common Methods) ---
class BaseTree {
     constructor() {
         this.root = null;
     }

     // Helper to compare values (handles numbers and strings)
     compare(val1, val2) {
         const num1 = parseFloat(val1);
         const num2 = parseFloat(val2);
         if (!isNaN(num1) && !isNaN(num2)) {
             return num1 < num2 ? -1 : (num1 > num2 ? 1 : 0);
         }
         return String(val1).localeCompare(String(val2));
     }
      // Reset node colors recursively
     resetColors(node = this.root) {
         if (node !== null) {
             node.color = color(128, 0, 128); // Reset to default purple
             this.resetColors(node.left);
             this.resetColors(node.right);
         }
     }

     // Draw the tree (recursive) - Common for BST and AVL visual structure
     drawTree(node = this.root) {
         if (node !== null) {
             // Draw lines to children first
             if (node.left !== null) {
                // 1. Read CSS variable
                const darkBrown = getComputedStyle(document.documentElement).getPropertyValue('--dark-brown').trim();
                // 2. Use it in your stroke
                 stroke(darkBrown);
                 strokeWeight(1.5);
                 line(node.x, node.y, node.left.x, node.left.y);
                 this.drawTree(node.left);
             }
             if (node.right !== null) {
                // 1. Read CSS variable
                const darkBrown = getComputedStyle(document.documentElement).getPropertyValue('--dark-brown').trim();
                // 2. Use it in your stroke
                 stroke(darkBrown);
                 strokeWeight(1.5);
                 line(node.x, node.y, node.right.x, node.right.y);
                 this.drawTree(node.right);
             }
             // Draw the node itself
             node.show();
         }
     }
     // Update node positions (simple horizontal spacing) - Common logic
     updatePositions() {
         if (!this.root) return;

         const nodesByLevel = [];
         const computeLevels = (node, level) => {
              if (!node) return;
              if (!nodesByLevel[level]) nodesByLevel[level] = [];
              nodesByLevel[level].push(node);
              node.y = levelHeight / 2 + 20 + level * levelHeight;
              computeLevels(node.left, level + 1);
              computeLevels(node.right, level + 1);
         };
         computeLevels(this.root, 0);

         // Basic horizontal spacing - can be improved
         const totalWidth = width - nodeSize; // Available width
         const computeX = (node, level, minX, maxX) => {
             if (!node) return;
             const nodesOnLevel = nodesByLevel[level].length;
             // Simple even spacing - less overlap prone for balanced trees
             // More sophisticated layout algorithms exist (e.g., Reingold-Tilford)
              const levelSpacing = totalWidth / (nodesOnLevel + 1);
              const indexOnLevel = nodesByLevel[level].indexOf(node);
              node.x = constrain(levelSpacing * (indexOnLevel + 1) + nodeSize/4 , nodeSize / 2, width - nodeSize / 2);


             // Recursive calls using calculated x for tighter bounds (though less effective with simple spacing)
              computeX(node.left, level + 1, minX, node.x);
              computeX(node.right, level + 1, node.x, maxX);
         };

        // Improved layout attempt - start with wider bounds
         const adjustLayout = (node, minX, maxX) => {
             if (!node) return;
             node.x = constrain((minX + maxX) / 2, nodeSize/2, width - nodeSize/2);
             node.y = levelHeight / 2 + 20 + this.getNodeLevel(node) * levelHeight; // Ensure Y is correct

             if (node.left) {
                 adjustLayout(node.left, minX, node.x - nodeSize); // Provide more space
             }
             if (node.right) {
                 adjustLayout(node.right, node.x + nodeSize, maxX); // Provide more space
             }
         };
        // Find the level of a specific node
         this.getNodeLevel = (targetNode, node = this.root, level = 0) => {
            if (!node) return -1;
            if (node === targetNode) return level;
            let downlevel = this.getNodeLevel(targetNode, node.left, level + 1);
            if (downlevel !== -1) return downlevel;
            downlevel = this.getNodeLevel(targetNode, node.right, level + 1);
            return downlevel;
         };

         adjustLayout(this.root, 0, width); // Use the adjusting layout
     }

     // Search for a value (iterative) - Common logic
     *search(value) {
         let current = this.root;
         if (!current) {
             yield { node: null, message: `Tree is empty, cannot find '${value}'.` };
             return;
         }

         while (current !== null) {
              yield { node: current, message: `Comparing '${value}' with '${current.value}'.` };
             const comparisonResult = this.compare(value, current.value);

             if (comparisonResult === 0) {
                 yield { node: current, message: `Found '${value}'!` };
                 current.color = color(0, 255, 0); // Turn green when found
                 yield { node: current, message: `Found '${value}'!` }; // Hold green state
                 return current;
             } else if (comparisonResult < 0) {
                  yield { node: current, message: `'${value}' < '${current.value}', going left.` };
                 current = current.left;
             } else {
                  yield { node: current, message: `'${value}' > '${current.value}', going right.` };
                 current = current.right;
             }
         }

         yield { node: null, message: `'${value}' not found in the tree.` };
         return null;
     }
 }

// --- Binary Search Tree (BST) Class ---
class BST extends BaseTree {
     constructor() {
         super();
     }

    // Add a value (iterative approach for easier animation stepping)
    *add(value) {
        const newNode = new Node(value);
        if (this.root === null) {
            this.root = newNode;
            this.root.x = width / 2;
            this.root.y = levelHeight / 2 + 20;
             yield { node: this.root, message: `Adding '${value}' as root.` };
            return;
        }
         let current = this.root;
         while (true) {
              yield { node: current, message: `Comparing '${value}' with '${current.value}'.` };
             const comparisonResult = this.compare(value, current.value);

             if (comparisonResult < 0) { // Go left
                yield { node: current, message: `'${value}' < '${current.value}', going left.` };
                if (current.left === null) {
                    current.left = newNode;
                    this.updatePositions(); // Recalculate positions
                    yield { node: newNode, message: `Added '${value}' to the left of '${current.value}'.` };
                    return;
                 current = current.left;
             } else if (comparisonResult > 0) { // Go right
                 yield { node: current, message: `'${value}' > '${current.value}', going right.` };
                 if (current.right === null) {
                     current.right = newNode;
                     this.updatePositions(); // Recalculate positions
                     yield { node: newNode, message: `Added '${value}' to the right of '${current.value}'.` };
                     return;
                 }
                 current = current.right;
                }else {
                // Value already exists
                yield { node: current, message: `'${value}' already exists in the tree.` };
                return;
                }
                 current = current.right;
                } else {
                 // Value already exists
                 yield { node: current, message: `'${value}' already exists in the tree.` };
                 return;
                }
            }
    }
}


 // --- AVL Tree Class ---
 class AVLTree extends BaseTree {
     constructor() {
         super();
     }

     // Get height of a node (null safe)
     height(node) {
         return node ? node.height : 0;
     }

     // Update height of a node
     updateHeight(node) {
         if (node) {
             node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
         }
     }

     // Get balance factor of a node
     getBalance(node) {
         return node ? this.height(node.left) - this.height(node.right) : 0;
     }

     // --- Rotations ---
     *rightRotate(y) {
         yield { node: y, message: `Performing Right Rotation on '${y.value}'` };
         let x = y.left;
         let T2 = x.right;

         // Perform rotation
         x.right = y;
         y.left = T2;

         // Update heights
         this.updateHeight(y);
         this.updateHeight(x);

         // Return new root of subtree
         yield { node: x, message: `Rotation complete. New subtree root: '${x.value}'` };
         return x;
     }

     *leftRotate(x) {
          yield { node: x, message: `Performing Left Rotation on '${x.value}'` };
         let y = x.right;
         let T2 = y.left;

         // Perform rotation
         y.left = x;
         x.right = T2;

         // Update heights
         this.updateHeight(x);
         this.updateHeight(y);

         // Return new root of subtree
          yield { node: y, message: `Rotation complete. New subtree root: '${y.value}'` };
         return y;
     }

     // --- Add with Balancing (Recursive Generator) ---
     *add(value) {
         // Need a wrapper for the recursive generator structure
         this.root = yield* this.addRecursive(this.root, value);
         this.updatePositions(); // Update all positions after potential rotations
         yield { node: this.root, message: `Finished adding '${value}'. Tree potentially balanced.`};
     }

     *addRecursive(node, value) {
         if (node === null) {
              const newNode = new Node(value);
              yield { node: newNode, message: `Adding '${value}' here.` };
             return newNode; // Base case: insert new node
         }
        
          yield { node: node, message: `Comparing '${value}' with '${node.value}'.` };
         const comparisonResult = this.compare(value, node.value);

         if (comparisonResult < 0) {
             yield { node: node, message: `'${value}' < '${node.value}', going left.` };
             node.left = yield* this.addRecursive(node.left, value);
         } else if (comparisonResult > 0) {
              yield { node: node, message: `'${value}' > '${node.value}', going right.` };
             node.right = yield* this.addRecursive(node.right, value);
         } else {
             // Duplicate value - do nothing
              yield { node: node, message: `'${value}' already exists.` };
             return node;
         }

         // 1. Update height of the current node
         this.updateHeight(node);
          yield { node: node, message: `Updating height of '${node.value}' to ${node.height}.` };


         // 2. Get balance factor
         let balance = this.getBalance(node);
         yield { node: node, message: `Balance factor of '${node.value}' is ${balance}.` };


         // 3. Check for imbalance and perform rotations if needed

         // Left Left Case (LL)
         if (balance > 1 && this.compare(value, node.left.value) < 0) {
              yield { node: node, message: `LL imbalance at '${node.value}'. Initiating Right Rotation.` };
             node = yield* this.rightRotate(node);
         }
         // Right Right Case (RR)
         else if (balance < -1 && this.compare(value, node.right.value) > 0) {
              yield { node: node, message: `RR imbalance at '${node.value}'. Initiating Left Rotation.` };
             node = yield* this.leftRotate(node);
         }
         // Left Right Case (LR)
         else if (balance > 1 && this.compare(value, node.left.value) > 0) {
              yield { node: node, message: `LR imbalance at '${node.value}'. Initiating Left Rotation on left child.` };
             node.left = yield* this.leftRotate(node.left);
              yield { node: node, message: `Now initiating Right Rotation on '${node.value}'.` };
             node = yield* this.rightRotate(node);
         }
         // Right Left Case (RL)
         else if (balance < -1 && this.compare(value, node.right.value) < 0) {
               yield { node: node, message: `RL imbalance at '${node.value}'. Initiating Right Rotation on right child.` };
             node.right = yield* this.rightRotate(node.right);
              yield { node: node, message: `Now initiating Left Rotation on '${node.value}'.` };
             node = yield* this.leftRotate(node);
         }

         return node; // Return the (potentially new) root of the subtree
     }
 }


// --- p5.js Sketch ---
function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let canvas = createCanvas(canvasContainer.offsetWidth * 0.95, canvasContainer.offsetHeight * 0.9);
    canvas.parent('canvas-container');

    tree = new BST(); // Start with BST
    statusMessageEl = document.getElementById('status-message');
    creatureInputEl = document.getElementById('creature-value');

    // Add event listeners
     document.getElementById('tree-type-select').addEventListener('change', handleTreeTypeChange);
    document.getElementById('add-btn').addEventListener('click', handleAdd);
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('reset-btn').addEventListener('click', handleReset);
    creatureInputEl.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleAdd(); 
        }
    });

    noLoop(); // Only redraw when needed
    redrawTree();
}

function draw() {
    background('#f9f9f9'); // Match visualization area background
    if (tree) {
        tree.drawTree(); // Draw the currently selected tree
    }
}

function redrawTree() {
    if (tree) {
        tree.resetColors(); // Reset colors before potential animation steps
        tree.updatePositions();
    }
    redraw();
}

function setStatus(message, isError = false) {
    statusMessageEl.innerText = message;
    statusMessageEl.style.color = isError ? 'red' : 'var(--dark-brown)';
}

function handleAdd() {
    if (isAnimating) return;
    const value = creatureInputEl.value.trim();
    if (value === '') {
        setStatus('Please enter a creature identifier.', true);
        return;
    }
     // Use the correct tree type's add method
     treeType = document.getElementById('tree-type-select').value;

    isAnimating = true;
    setControlsEnabled(false);
    setStatus(`Attempting to add '${value}' to ${treeType.toUpperCase()}...`);
    tree.resetColors(); // Reset colors from previous searches

    const addGenerator = tree.add(value); // Polymorphism in action!
    runAnimationStep(addGenerator);
    creatureInputEl.value = ''; // Clear input field
}

function handleTreeTypeChange(event) {
     if (isAnimating) {
          // Prevent changing tree type during animation
          event.target.value = treeType; // Revert selection
          setStatus("Cannot change tree type during animation.", true);
          return;
     }
     treeType = event.target.value;
     handleReset(); // Reset the tree when type changes
     updateExplanationVisibility();
}

function updateExplanationVisibility() {
    const bstExp = document.getElementById('bst-explanation');
    const avlExp = document.getElementById('avl-explanation');
    const title = document.getElementById('explanation-title');

    if (treeType === 'avl') {
        bstExp.style.display = 'none';
        avlExp.style.display = 'block';
        title.textContent = 'AVL Tree (Balanced Arbor Cognitus)';
    } else { // Default to BST
        bstExp.style.display = 'block';
        avlExp.style.display = 'none';
         title.textContent = 'Binary Search Tree (Arbor Cognitus)';
    }
}

function handleSearch() {
    if (isAnimating) return;
    const value = creatureInputEl.value.trim();
    if (value === '') {
        setStatus('Please enter a creature identifier to search.', true);
        return;
    }
    if (!tree.root) {
        setStatus('The tree is empty!', true);
        return;
    }

    isAnimating = true;
    setControlsEnabled(false);
    setStatus(`Searching for '${value}' in ${treeType.toUpperCase()}...`);
    tree.resetColors(); // Reset colors before search

    const searchGenerator = tree.search(value); // Search is the same for BST/AVL
    runAnimationStep(searchGenerator);
    // Don't clear input on search, user might want to see the value they searched for
}

function handleReset() {
     if (isAnimating) return; // Don't reset during animation
     // Create a new tree of the currently selected type
     if (treeType === 'avl') {
         tree = new AVLTree();
     } else {
         tree = new BST();
     }
     setStatus(`${treeType.toUpperCase()} tree has been reset.`);
     redrawTree();
}

function runAnimationStep(generator) {
    const result = generator.next();
    
    if (result.value && result.value.node) {
        result.value.node.highlight(); // Highlight the current node
    }
     if (result.value && result.value.message) {
        setStatus(result.value.message);
    }
    
    redrawTree(); // Redraw the tree with highlight/color changes

    if (!result.done) {
        setTimeout(() => runAnimationStep(generator), 800); // Delay for animation
    } else {
        isAnimating = false;
        setControlsEnabled(true);
        // Optionally keep the final status message or clear it
         // redrawTree(); // Final redraw without highlight but with final colors (e.g., green for found)
    }
}

function setControlsEnabled(enabled) {
     document.getElementById('tree-type-select').disabled = !enabled; // Disable type change during animation
     document.getElementById('add-btn').disabled = !enabled;
     document.getElementById('search-btn').disabled = !enabled;
     document.getElementById('reset-btn').disabled = !enabled;
     creatureInputEl.disabled = !enabled;
}

// Optional: Recalculate canvas size on window resize
function windowResized() {
    let canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) { 
        resizeCanvas(canvasContainer.offsetWidth * 0.95, canvasContainer.offsetHeight * 0.9);
        redrawTree();
    }
}