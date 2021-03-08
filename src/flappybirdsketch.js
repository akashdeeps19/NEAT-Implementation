var bird;
var birdSprite;
var bg;
var bgX = 0;
var pipeTop;
var pipeBottom;
var scoreW = 30;
var scoreH = 40;
var pipes = [];

let innv = new InnovNum();
let totalPopulation = 500;
// All active birds (not yet collided with pipe)
let activeBirds = [];
// All birds for any given population
let allBirds = [];
// Pipes
// let pipes = [];
// A frame counter to determine when to add a pipe
let counter = 0;
let dead = false;

let population;

// Interface elements
let speedSlider;
let speedSpan;
let highScoreSpan;
let allTimeHighScoreSpan, statsSpan,tipSpan;

// All time high score
let highScore = 0;

// Training or just showing the current best
let runBest = false;
let playing = false;
let showNN = false;
let runBestButton,playButton, showNNButton;
let player;
let bestBird;
let gen,stats;
let backgroundImg, birdImg;
let playerGravity = 0.5
// let dead = false;

function preload() {
    birdSprite = loadImage('Images/bird.png');
    bg = loadImage('Images/bg2.png');
    pipeTop = loadImage('Images/pipeNorth.png');
    pipeBottom = loadImage('Images/pipeSouth.png');
    pipeTopHasHit = loadImage('Images/pipeHitNorth.png');
    pipeBottomHasHit = loadImage('Images/pipeHitSouth.png');

    digitsImage = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
        number => loadImage(`Images/${number}.png`)
    )

}

function setup() {
    let canvas = createCanvas(800, 550);
    canvas.parent('canvascontainer');
  // Access the interface elements
    speedSlider = select('#speedSlider');
    speedSpan = select('#speed');
    tipSpan = select('#tip')
    highScoreSpan = select('#hs');
    allTimeHighScoreSpan = select('#ahs');
    statsSpan = select('#stats');
    runBestButton = select('#best');
    runBestButton.mousePressed(toggleState);
    playButton = select('#play');
    playButton.mousePressed(togglePlay);
    showNNButton = select('#showNN');
    showNNButton.mousePressed(toggleShowNN);
    // Create a population
    for (let i = 0; i < totalPopulation; i++) {
        let bird = new Bird();
        activeBirds[i] = bird;
    }
    population = new Population(5,2,activeBirds.slice(),innv);
    population.initialPop();
    currentScore = 0;
}

// Toggle the state of the simulation
function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    resetGame();
    runBestButton.html('continue training');
    if(playing)togglePlay()
    // Go train some more
  } else {
    nextGeneration();
    runBestButton.html('run pre-trained bird');
  }
}

function togglePlay(){
  playing = !playing;
  if (playing) {
    resetGame();
    speedSlider.value(1)
    playButton.html('train');
    tipSpan.html('Press space to jump')
    // Go train some more
  } else {
    nextGeneration();
    playButton.html('play');
    tipSpan.html('')
    if(dead){
      dead = false;
      loop()
    }
  }
}

function toggleShowNN(){
  showNN = !showNN;
  if(showNN){
    showNNButton.html('Back to Game');
  }
  else{
    showNNButton.html('Show Neural Network');
  }
}

function draw() {
    background(0);
    if(showNN){
        background(0);
        let g;
        if(runBest){
            g = bestBird.genome
        }
        else{
            g = activeBirds.length == 0?bestBird.genome:activeBirds[0].genome
        }
        drawGenome(g,50,50,height-50,width-50);
        return;
    }
    image(bg, bgX, 0, bg.width, height);

    // Should we speed up cycles per frame
    let cycles = speedSlider.value();
    speedSpan.html(cycles);

    // How many times to advance the game
    for (let n = 0; n < cycles; n++) {
        // Show all the pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
            if(activeBirds.length > 0 && pipes[i].score(activeBirds[0])){
                currentScore++;
            }
        }
        
        for (let i = activeBirds.length - 1; i >= 0; i--) {
            let bird = activeBirds[i];
            // Bird uses its brain!
            bird.think(pipes);
            bird.update();

            // Check all the pipes
            for (let j = 0; j < pipes.length; j++) {
                // It's hit a pipe
                if (pipes[j].hit(activeBirds[i])) {
                    // Remove this bird
                    activeBirds.splice(i, 1);
                    break;
                }
            }

            if (bird.bottomTop()) {
                activeBirds.splice(i, 1);
            }
        }

        // Add a new pipe every so often
        if (counter % 100 == 0) {
            pipes.push(new Pipe());
        }
        counter++;
        
    }

    
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].show();
    }
    for (let i = 0; i < activeBirds.length; i++) {
        activeBirds[i].show();
    }
      // If we're out of birds go to the next generation
    if (activeBirds.length == 0) {
        currentScore = 0;
        nextGeneration();
    }
    displayScore(currentScore);
}
function keyPressed() {
    if (key == ' ') {
        bird.up();
    }
    return false;
}

function resetGame() {
    counter = 0;
    // Resetting best bird score to 0
    if (bestBird && runBest) {
      bestBird.score = 0;
    }
    if(playing){
      player = new Bird()
      player.gravity = playerGravity;
    }
    pipes = [];
  }
  function printStats(){
    statsSpan.html(`
    </br><==== GENERATION : ${stats.gen} ====></br>
      No of Species : ${stats.species}</br>
      Avg Fitness : ${stats.avg_fitness}</br>
      Max score : ${stats.max_score}</br>
    ` + statsSpan.html());
  }

  function normalizeFitness(birds) {
    // Make score exponentially better?
    for (let i = 0; i < birds.length; i++) {
      birds[i].fitness = pow(birds[i].score, 2);
    }
  }

// Create the next generation
function nextGeneration() {
    resetGame();
    // Normalize the fitness values 0-1
    normalizeFitness(population.members);
    // Generate a new set of birds
    stats = population.evolve();
    printStats()
    activeBirds = population.members.slice();
    // Copy those birds to another array
  }
  
  

function displayScore(currentScore){
    output = [],
    numberInStr = currentScore.toString();

  for (var i = 0, len = numberInStr.length; i < len; i += 1) {
    output.push(+numberInStr.charAt(i));
  }

  output.forEach((digit, index) => {
    image(digitsImage[digit], width / 2 - (scoreW * (output.length - index * 2)) / 2, 100, scoreW, scoreH);
  });
}
