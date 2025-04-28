function startSorting() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <h2>🧹 Sorting Challenge</h2>
    <p>Help sort these magical numbers using Bubble Sort!</p>
    <div id="array"></div>
    <button onclick="bubbleSort()">Start Sorting</button>
  `;

  generateArray();
}

let arr = [];

function generateArray() {
  arr = Array.from({length: 6}, () => Math.floor(Math.random() * 100));
  displayArray();
}

function displayArray() {
  const arrayDiv = document.getElementById('array');
  arrayDiv.innerHTML = arr.map(num => `<span class="array-item">${num}</span>`).join(' ');
}

function bubbleSort() {
  let n = arr.length;
  let i = 0, j = 0;
  const interval = setInterval(() => {
    if (i < n) {
      if (j < n - i - 1) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          displayArray();
        }
        j++;
      } else {
        j = 0;
        i++;
      }
    } else {
      clearInterval(interval);
      alert("Well done! The array is sorted!");
    }
  }, 500);
}

// ----- TREE CHALLENGE -----
function startTree() {
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = `
    <h2>🌳 Tree Challenge</h2>
    <p>Insert numbers into a Binary Search Tree (BST).</p>
    <button onclick="insertNode()">Insert Random Number</button>
    <pre id="treeDisplay"></pre>
  `;

  bstRoot = null;
}

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

let bstRoot = null;

function insertBST(root, value) {
  if (root == null) {
    return new TreeNode(value);
  }
  if (value < root.value) {
    root.left = insertBST(root.left, value);
  } else {
    root.right = insertBST(root.right, value);
  }
  return root;
}

function insertNode() {
  const value = Math.floor(Math.random() * 100);
  alert(`Inserting: ${value}`);
  bstRoot = insertBST(bstRoot, value);
  displayTree(bstRoot, "");
}

function displayTree(node, indent) {
  const display = document.getElementById('treeDisplay');
  if (node == null) return;

  let output = `${indent}${node.value}\n`;
  if (node.left || node.right) {
    output += displayTreeText(node.left, indent + "  L-");
    output += displayTreeText(node.right, indent + "  R-");
  }
  display.textContent = output;
}

function displayTreeText(node, indent) {
  if (node == null) return `${indent}null\n`;
  let str = `${indent}${node.value}\n`;
  str += displayTreeText(node.left, indent + "  L-");
  str += displayTreeText(node.right, indent + "  R-");
  return str;
}
