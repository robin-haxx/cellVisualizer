// another one of those snippets I figured is less computationally expensive to just run wherever it's safe to
function setupVolumes(){
  vol1 = [];
  vol2 = [];
  vol3 = [];
  vol4 = [];
  volumes = [vol1, vol2, vol3, vol4];
  volume_table_length = table.getRowCount();
  for(let i=0; i< volume_table_length;i++) {
    let roww = table["rows"][i].arr;
    vol1.push(float(roww[1]));
    vol2.push(float(roww[2]));
    vol3.push(float(roww[3]));
    vol4.push(float(roww[4]));
  }
}

var canvasWidth = 1920;
var canvasHeight = 1080;
var canvasSize = [canvasWidth,canvasHeight];

let mainCanvas;
let songCount = 15 // UPDATE THIS AND THIS ONLY AS YOU ADD MORE SONGS. 
let textInput;
let slider1, slider2, slider3, slider4;
let songButton;

let editorMode = true;          // false when in song mode
//let songLoadStatus = "loading"; // "error", "loaded"
let song;
let songIsPlaying = false;
let songEpoch = 0;   // millis when song starts
let songID = 0;      // ID to fetch song files
let table;
let words;

let songs = [];   // stores all loaded song .mp3s
let tables = [];  // stores volumes for all songs


// function songLoadedError() {
//   songButton.elt.innerHTML = "Song: Load Error";
//   print(songButton.elt.innerHTML);
//   songLoadStatus = "error";
// }

// function songLoaded() {
//   print("Song loaded");
//   songLoadStatus = "loaded";
//   songButton.elt.innerHTML = "run song";
//   songButton.elt.disabled = false;
//   //  let now = millis();
//   //  songEpoch = now + 5000;
//   if(debugFastRefresh && getAudioContext().state != "suspended"){

//     switchRunMode();
//   }
//}

// function songLoadedSoFar(soFar) {
//   let loaded = int(100 * soFar);
//   songButton.elt.innerHTML = "Song: " + loaded + "% loaded";
//   print(songButton.elt.innerHTML);
// }


//  use songID to set current
//  make loop scalable later

function preload() {

  for (let i = 0; i < songCount; i++){
    console.log("loading song " + i);
    songs.push(loadSound(`sound_assets/song_${i}.mp3`));
    tables.push(loadTable(`sound_assets/volumes_${i}.csv`, 'csv'));
    
  }
  console.log("preloadID:" + songID);
  table = tables [songID];
  song = songs[songID];  
  
  words = loadStrings('words.txt'); //anything containing "words" is deprecated, just empty variables, will remove when I can be bothered
}

let volumes = [];
let volume_length = 0;

function setup() {
  main_canvas = createCanvas(canvasSize[0], canvasSize[1]);
  main_canvas.parent('canvasContainer');
  
  frameRate(60);
  angleMode(DEGREES);

  // create sliders
  slider1 = createSlider(0, 100, 50);
  slider2 = createSlider(0, 100, 50);
  slider3 = createSlider(0, 100, 50);
  slider4 = createSlider(0, 100, 50);

  slider1.parent('slider1Container');
  slider2.parent('slider2Container');
  slider3.parent('slider3Container');
  slider4.parent('slider4Container');

  songButton = createButton('let\'s go!');
  songButton.mousePressed(switchRunMode);
  songButton.parent('button1Container');
  songButton.elt.disabled = false;

  resMenu = createSelect('resolution..');
  resMenu.parent('button1Container')
  resMenu.option('landscape 800 x 600',               [800,600]);
  resMenu.option('landscape 1280 x 720',              [1280,720]);
  resMenu.option('landscape 1366 x 768',              [1366,768]);
  resMenu.option('landscape 1920 x 1080',             [1920,1080]);
  resMenu.option('landscape 2560 x 1440',             [2560,1440]);
  resMenu.option('landscape 3840 x 2160 (UNSTABLE)',  [3840,2160]);
  resMenu.option('portrait 600 x 800',                [600,800]);
  resMenu.option('portrait 720 x 1280',               [720,1280]);
  resMenu.option('portrait 1080 x 1920',              [1080,1920]);
  resMenu.option('portrait 1080 x 2160',              [1080,2160]);
  resMenu.option('portrait 1080 x 2280',              [1080,2280]);
  resMenu.option('portrait 1440 x 3040 (UNSTABLE)',   [1440,3040]);
  resMenu.option('instagram 1080 x 1350',             [1080,1350]);
  resMenu.option('instagram 1440 x 1800',             [1440,1800]);
  resMenu.option('square 360 x 360',                  [360,360]);
  resMenu.option('square 720 x 720',                  [720,720]);
  resMenu.option('square 1080 x 1080',                [1080,1080]);
  resMenu.option('square 1440 x 1440',                [1440,1440]);
  resMenu.option('square 2160 x 2160 (UNSTABLE)',     [2160,2160]);
  //resMenu.selected('landscape 1920 x 1080')

  resButton = createButton ('refresh')
  resButton.parent('button1Container');
  resButton.mousePressed(refreshCanvas);
  

  styleSelect = createSelect('style');
  styleSelect.parent('button2Container');
  styleSelect.option('PATHS live',    0);
  styleSelect.option('A.G. made it',  1);
  styleSelect.option('Teen Dream',    2);
  styleSelect.selected('PATHS live'    );

  songSelect = createSelect('song');
  songSelect.parent('button2Container');
  songSelect.option('Dancing on the Edge - G Jones',              0);//track id # switches out file name
  songSelect.option('Apple - Charli Xcx',                         1);
  songSelect.option('Myth (Beach House) - The Casket Lottery',    2);
  songSelect.option('Beach House - Lazuli',                       3);
  songSelect.option('ODESZA - Kusanagi',                          4);
  songSelect.option('ODESZA & Naomi Wild - Higher Ground',        5);
  songSelect.option('ODESZA - Sun Models',                        6);
  songSelect.option('Beird...',                                   7);
  songSelect.option('Gorillaz - Feel Good Inc.',                  8);
  songSelect.option('CHVRCHES - Gun',                             9);
  songSelect.option('Tame Impala - Nangs',                        10);
  songSelect.option('Fever Ray - Keep The Streets Empty For Me',  11);
  songSelect.option('Porter Robinson - Hollowheart',              12);
  songSelect.option('Porter Robinson - Goodbye to a World',       13);
  songSelect.option('GLADoS - Want You Gone',                     14);
  //songSelect.selected(0);

  setupVolumes();

  /*
  for(let i=0; i<4; i++) {
    let radius = map(i, 0, 3, 0, 3);
    volumes[i] = Taira.smoothen(vol1, Taira.ALGORITHMS.GAUSSIAN, 10, radius, true)
  }
  volumes[0] = vol1;
  */
  if(smoothing != 0) {
    let radius = map(smoothing, 0, 100, 0, 3);
    for(let i=0; i<4; i++) {
      volumes[i] = Taira.smoothen(volumes[i], Taira.ALGORITHMS.GAUSSIAN, 10, radius, true)
    }
  }
}

function switchRunMode() {
  songID = songSelect.selected()//cheeky get ahead of user reload
  song.stop();
  songIsPlaying = false;
  setupVolumes();

  table = tables[songID];
  song = songs[songID];
  
  if(editorMode) {
    // deprecated code retained in case I want to build back in load status for multiple songs...
    // if(songLoadStatus == "loading") {
    //   alert("Song still loading...");
    //   return;
    // }
    // else if (songLoadStatus == "error") {
    //   alert("Cannot switch mode, there was a problem loading the audio")
    //   return;
    // }
    // textInput.elt.disabled = true;
    slider1.elt.disabled = true;
    slider2.elt.disabled = true;
    slider3.elt.disabled = true;
    slider4.elt.disabled = true;

    editorMode = false;
    let now = millis();
    songEpoch = now + (debugFastRefresh ? 0 : 5000);
    songButton.elt.innerHTML = "stop music";
  }
  else {
    if(songIsPlaying) {
      song.stop();
      songIsPlaying = false;

    }
    // textInput.elt.disabled = false;
    slider1.elt.disabled = false;
    slider2.elt.disabled = false;
    slider3.elt.disabled = false;
    slider4.elt.disabled = false;

    editorMode = true;
//think this is causing a weird reload lag. could relegate fix to manual refresh on song change for now
      song = songs  [songID];
      table = tables [songID];

    songButton.elt.innerHTML = "start music";
  }
}

function draw() {

  if (songSelect.selected() != songID){
    song.stop();
    songIsPlaying = false;
    
    switchRunMode();
    song.stop();
    songIsPlaying = false;
    table = tables [songID];
  }

  canvasSize = resMenu.selected();
  songID = songSelect.selected();


  if (editorMode) {
    //let w = textInput.value();
    let s1 = slider1.value();
    let s2 = slider2.value();
    let s3 = slider3.value();
    let s4 = slider4.value();

    draw_one_frame(s1, s2, s3, s4, 0);
  }
  else {
    if(songEpoch > 0) {
      let now = millis();
      let songOffset = now - songEpoch;
      if(songOffset < 0) {
        background(0);
        let secondsRemaining = songOffset / -1000.0;
        let intSecs = int(secondsRemaining);
        if(intSecs > 0) {
          let remainder = secondsRemaining - intSecs;
          let curAngle = map(remainder, 0, 1, 630, 270);
          // print(secondsRemaining, intSecs, remainder, curAngle);
          noStroke();
          fill(200);
          arc(width/2, height/2, 400, 400, curAngle, curAngle+10);
          stroke(255);
          fill(255);
          textSize(200);
          textAlign(CENTER, CENTER);
          text(intSecs, width/2, height/2);
        }
        // text("Song starting in: " + secondsRemaining, width/2, height/2)      
      }
      else if (!songIsPlaying) {
        song.play();
        songIsPlaying = true;
        songEpoch = millis();
        if (typeof reset_music === "function") {
          reset_music();
        }
      }
    }
    if(songIsPlaying) {
      let curMillis = millis();
      let timeOffset = curMillis - songEpoch;
      let curSlice = int(60 * timeOffset / 1000.0);
      if (curSlice < volume_table_length) {
        // print("Processing " + curSlice + " of " + table.getRowCount())
        // let row = table["rows"][curSlice].arr
        // draw_one_frame(row);
        // print(row);
        let roww = [volumes[0][curSlice], volumes[1][curSlice], volumes[2][curSlice], volumes[3][curSlice]]
        cur_words = "";
        if (curSlice < words.length) {
          cur_words = words[curSlice];
        }
        // textInput.value(cur_words);
        slider1.value(roww[0]);
        slider2.value(roww[1]);
        slider3.value(roww[2]);
        slider4.value(roww[3]);
       draw_one_frame(cur_words, roww[0], roww[1], roww[2], roww[3], curSlice);//currentTime()
       //draw_one_frame(cur_words, roww[0], roww[1], roww[2], roww[3], song.currentTime());
      }
    }
  }
}

function keyTyped() {
  if (key == '1') {
    song.setVolume(0.1);
  }
  if (key == '2') {
    song.setVolume(0.2);
  }
  if (key == '3') {
    song.setVolume(0.3);
  }
  if (key == '4') {
    song.setVolume(0.4);
  }
  if (key == '5') {
    song.setVolume(0.5);
  }
  if (key == '6') {
    song.setVolume(0.6);
  }
  if (key == '7') {
    song.setVolume(0.7);
  }
  if (key == '8') {
    song.setVolume(0.8);
  }
  if (key == '9') {
    song.setVolume(0.9);
  }
  if (key == '0') {
    song.setVolume(1.0);
  }
}