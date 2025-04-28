// Global variables for p5 sketch
let values = []; // Array to hold student 'aptitudes' (heights)
let states = []; // Array to color-code bars during sorting (0: default, 1: comparing, 2: swapping, 3: sorted)
let barWidth;
let numBars = 20;
let sortAlgorithm = 'bubble';
let isSorting = false;
let sortGenerator; // To control the step-by-step sorting
let animationSpeed = 50; // Delay between steps (ms)

// Algorithm explanations
const explanations = {
    bubble: {
        title: "Bubble Sort (Simplificus Sortitus)",
        text: "Compares adjacent students and swaps them if they are in the wrong order. The 'heaviest' (highest aptitude) students 'bubble' up to the end. Repeats until sorted.",
        complexity: "O(n^2)"
    },
    insertion: {
        title: "Insertion Sort (Insertio Ordino)",
        text: "Builds the final sorted list one student at a time. It takes each student from the unsorted input and 'inserts' them into their correct position within the already sorted part.",
        complexity: "O(n^2)"
    },
    selection: {
        title: "Selection Sort (Selecto Minimus)",
        text: "Repeatedly finds the student with the minimum aptitude from the unsorted part and swaps them with the first unsorted student. Grows the sorted portion from left to right.",
        complexity: "O(n^2)"
    },
    merge: {
        title: "Merge Sort (Conjunctio Divisio)",
        text: "Divides the student list into two halves, sorts each half recursively using the same spell, and then magically merges the two sorted halves back together.",
        complexity: "O(n log n)"
    }
};

// p5.js setup function
function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let canvas = createCanvas(canvasContainer.offsetWidth * 0.95, canvasContainer.offsetHeight * 0.9);
    canvas.parent('canvas-container'); // Attach canvas to the container div
    
    // Calculate bar width based on canvas size and number of bars
    barWidth = width / numBars;
    
    generateNewData(); // Initial data generation
    updateExplanation(); // Show initial explanation

    // Event Listeners
    document.getElementById('generate-btn').addEventListener('click', () => {
        if (!isSorting) generateNewData();
    });
    document.getElementById('sort-btn').addEventListener('click', () => {
        if (!isSorting && values.length > 0) {
            startSort();
        }
    });
    document.getElementById('algorithm-select').addEventListener('change', (e) => {
        if (!isSorting) {
            sortAlgorithm = e.target.value;
            updateExplanation();
        }
    });
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        // Map slider value (1-100) to a delay (e.g., 500ms to 5ms)
        // Higher slider value = faster animation = lower delay
        animationSpeed = map(parseInt(e.target.value), 1, 100, 500, 5); 
    });

    // Initialize speed
    animationSpeed = map(parseInt(document.getElementById('speed-slider').value), 1, 100, 500, 5); 
    noLoop(); // Don't loop automatically, only when drawing needed
    redraw(); // Draw initial state
}

// p5.js draw function
function draw() {
    background('#f9f9f9'); // Match visualization area background

    for (let i = 0; i < values.length; i++) {
        let barHeight = map(values[i], 0, height, 0, height * 0.95); // Scale value to canvas height
        let x = i * barWidth;
        let y = height - barHeight; // Bars grow from the bottom

        // Set bar color based on state
        switch (states[i]) {
            case 1: fill(255, 165, 0); break; // Orange: Comparing
            case 2: fill(255, 0, 0); break;   // Red: Swapping/Moving
            case 3: fill(0, 128, 0); break;   // Green: Sorted
            default: fill(128, 0, 128);       // Purple: Default
        }
        // 1. Read CSS variable
        const darkBrown = getComputedStyle(document.documentElement).getPropertyValue('--dark-brown').trim();
        // 2. Use it in your stroke
        stroke(darkBrown);
        rect(x, y, barWidth, barHeight);

        // Optional: Add value text on top for small number of bars
        if (numBars <= 30) {
            fill(0);
            textAlign(CENTER, BOTTOM);
            textSize(10);
            text(floor(values[i]), x + barWidth / 2, y - 2);
        }
    }
}

// Function to generate new random data
function generateNewData() {
    values = [];
    states = [];
    for (let i = 0; i < numBars; i++) {
        values.push(random(5, height)); // Use canvas height as max value
        states.push(0); // Default state
    }
    isSorting = false;
    sortGenerator = null; // Reset generator
    document.getElementById('sort-btn').disabled = false;
    document.getElementById('generate-btn').disabled = false;
    document.getElementById('algorithm-select').disabled = false;
    resetStates(); // Ensure all bars are default color
    redraw(); // Update the display
}

// Function to reset bar states (colors)
function resetStates(finalState = 0) {
    for (let i = 0; i < states.length; i++) {
        states[i] = finalState; // Set to default or sorted state
    }
}

// Function to update the explanation text
function updateExplanation() {
    const explanation = explanations[sortAlgorithm];
    document.getElementById('explanation-title').innerText = explanation.title;
    document.getElementById('explanation-text').innerText = explanation.text;
    document.getElementById('explanation-complexity').innerText = explanation.complexity;
}

// Function to start the sorting process
function startSort() {
    isSorting = true;
    document.getElementById('sort-btn').disabled = true;
    document.getElementById('generate-btn').disabled = true;
    document.getElementById('algorithm-select').disabled = true;
    resetStates();

    // Get the appropriate generator function
    switch (sortAlgorithm) {
        case 'bubble':
            sortGenerator = bubbleSort(values);
            break;
        case 'insertion':
            sortGenerator = insertionSort(values);
            break;
        case 'selection':
            sortGenerator = selectionSort(values);
            break;
        case 'merge':
             // Clone arrays for merge sort as it often works better with copies
             // The generator will update the original 'values' array visually
            sortGenerator = mergeSort(values, 0, values.length - 1);
            break;
    }

    // Start the step-by-step execution
    runSortStep();
}

// Function to run a single step of the sort and schedule the next
function runSortStep() {
    if (!isSorting || !sortGenerator) return;

    const result = sortGenerator.next();

    redraw(); // Update the visualization

    if (result.done) {
        isSorting = false;
        document.getElementById('sort-btn').disabled = false;
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('algorithm-select').disabled = false;
        resetStates(3); // Mark all as sorted (green)
        redraw(); // Final redraw
    } else {
        // Schedule the next step after a delay
        setTimeout(runSortStep, animationSpeed);
    }
}

// --- Sorting Algorithm Generators ---
// These functions use 'yield' to pause execution after each comparison/swap

async function swap(arr, i, j) {
    // Visual cue for swapping
    states[i] = 2;
    states[j] = 2;
    await sleep(animationSpeed); // Pause briefly to show swap state
    redraw();

    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;

    // Reset state after swap
    states[i] = 0;
    states[j] = 0;
    await sleep(animationSpeed); 
    redraw();
}

// Simple sleep function using Promises
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Bubble Sort Generator
function* bubbleSort(arr) {
    let n = arr.length;
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            states[i] = 1; // Comparing
            states[i + 1] = 1;
            yield; // Pause to show comparison

            if (arr[i] > arr[i + 1]) {
                states[i] = 2; // Swapping
                states[i + 1] = 2;
                yield; // Pause to show intent to swap
                
                let temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
                swapped = true;
                
                states[i] = 2; // Still swapping state
                states[i + 1] = 2;
                yield; // Pause after swap is complete
            }
            states[i] = 0; // Reset state
            states[i + 1] = 0;
        }
        // Mark the last element as sorted after each pass
        states[n - 1] = 3; 
        n--; // Optimization: largest element is now at the end
    } while (swapped);
    // Mark remaining elements as sorted
    for(let k=0; k<arr.length; k++) {
        if(states[k] !== 3) states[k] = 3;
    }
}

// Insertion Sort Generator
function* insertionSort(arr) {
    let n = arr.length;
    states[0] = 3; // First element is trivially sorted
    yield;

    for (let i = 1; i < n; i++) {
        let current = arr[i];
        let j = i - 1;
        states[i] = 2; // Element being inserted
        yield; // Show element being picked

        while (j >= 0 && arr[j] > current) {
            states[j] = 1; // Comparing with element to the left
            yield;
            
            arr[j + 1] = arr[j]; // Shift element to the right
            states[j + 1] = 2; // Show shift
            states[j] = 0; // Old position reset
            if (j > 0) states[j - 1] = 3; // Mark previous as sorted boundary if applicable
            else states[0] = 3; // Ensure first element stays marked sorted

            yield;
            states[j + 1] = 3; // Mark shifted element as part of sorted section temporarily
            j = j - 1;
        }
        arr[j + 1] = current; // Place the current element in its correct spot
        states[j + 1] = 3; // Mark as sorted
        states[i] = (i === j + 1) ? 3 : 0; // If it didn't move, mark sorted, else reset original pos

        // Ensure all elements up to i are marked sorted
        for(let k=0; k<=i; k++) states[k] = 3;
        yield;
    }
     // Mark all as sorted finally
     for(let k=0; k<n; k++) states[k] = 3;
}

// Selection Sort Generator
function* selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        states[minIndex] = 1; // Assume current is min, mark for comparison
        yield;

        for (let j = i + 1; j < n; j++) {
            states[j] = 1; // Mark element being compared
            yield;

            if (arr[j] < arr[minIndex]) {
                states[minIndex] = 0; // Unmark old min index (unless it's i)
                minIndex = j;
                states[minIndex] = 1; // Mark new min index
                yield;
            } else {
                 states[j] = 0; // Reset non-minimum element's state
                 yield; 
            }
        }

        // Swap the found minimum element with the first element
        if (minIndex !== i) {
            states[i] = 2;
            states[minIndex] = 2;
            yield; // Show swap intent

            let temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;

            states[i] = 2;
            states[minIndex] = 2;
            yield; // Show swap complete
            states[minIndex] = 0; // Reset state of the element that was swapped from minIndex
        }
        
        states[i] = 3; // Mark the element at index i as sorted
        if(states[minIndex] !== 3) states[minIndex] = 0; // Reset state if it wasn't the one swapped into sorted position
        yield;
    }
    states[n - 1] = 3; // Mark the last element as sorted
    yield;
}


// Merge Sort Generator
function* mergeSort(arr, left, right) {
    if (left >= right) {
        if (left >= 0 && left < arr.length) states[left] = 3; // Mark single element as sorted
        yield; // Allow redraw for single element state
        return;
    }

    const mid = Math.floor((left + right) / 2);

    // Visually mark the range being divided
    for (let k = left; k <= right; k++) states[k] = 1; // Mark subsection as 'considering' (orange)
    yield;

    // Recursively sort left and right halves
    yield* mergeSort(arr, left, mid);
    yield* mergeSort(arr, mid + 1, right);

    // Merge the sorted halves
    yield* merge(arr, left, mid, right);

     // Mark the merged section as sorted
    for (let k = left; k <= right; k++) states[k] = 3;
    yield; // Show final sorted state for this merge section
}

// Helper generator function for merging two subarrays
function* merge(arr, left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;

    // Create temporary arrays
    let L = new Array(n1);
    let R = new Array(n2);

    // Copy data to temporary arrays L[] and R[]
    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    // Indices for temp arrays and merged array
    let i = 0; // Initial index of first subarray
    let j = 0; // Initial index of second subarray
    let k = left; // Initial index of merged subarray

     // Highlight the sections being merged
    for (let m = left; m <= right; m++) states[m] = 2; // Mark as 'merging' (red)
    yield;

    // Merge the temp arrays back into arr[left..right]
    while (i < n1 && j < n2) {
        // Highlight elements being compared
        // Mapping indices from temp arrays back to original requires care
        if (left + i < arr.length) states[left + i] = 1; // Comparing from left side
        if (mid + 1 + j < arr.length) states[mid + 1 + j] = 1; // Comparing from right side
         yield;

        if (L[i] <= R[j]) {
            arr[k] = L[i];
             // Reset comparison highlight, keep merge highlight
             if (left + i < arr.length) states[left + i] = 2;
             if (mid + 1 + j < arr.length) states[mid + 1 + j] = 2;
            i++;
        } else {
            arr[k] = R[j];
             // Reset comparison highlight, keep merge highlight
             if (left + i < arr.length) states[left + i] = 2;
             if (mid + 1 + j < arr.length) states[mid + 1 + j] = 2;
            j++;
        }
         states[k] = 2; // Show the element being placed in the merged array
         yield; // Show the placement
        k++;
    }

    // Copy the remaining elements of L[], if there are any
    while (i < n1) {
         if (left + i < arr.length) states[left + i] = 1; // Highlight source
         yield;
        arr[k] = L[i];
         if (left + i < arr.length) states[left + i] = 2; // Reset source highlight
         states[k] = 2; // Highlight destination
         yield;
        i++;
        k++;
    }

    // Copy the remaining elements of R[], if there are any
    while (j < n2) {
         if (mid + 1 + j < arr.length) states[mid + 1 + j] = 1; // Highlight source
         yield;
        arr[k] = R[j];
         if (mid + 1 + j < arr.length) states[mid + 1 + j] = 2; // Reset source highlight
         states[k] = 2; // Highlight destination
         yield;
        j++;
        k++;
    }

    // Clear merging highlights for this section before marking sorted
    // for (let m = left; m <= right; m++) states[m] = 0;
    // yield; // Show cleared state briefly - might be too flickery
}


// Ensure p5 runs in instance mode if integrating with other libraries later, but global mode is fine for this standalone example.
