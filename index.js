var start_stopBtn = document.getElementById("start_stopBtn");
var resetBtn = document.getElementById("resetBtn");
var randomBtn = document.getElementById("randomBtn");

function Param() {
  // セルの数
  this.divSizeX = 120;
  this.divSizeY = 120;

  this.cellData = Array();
  for (var x = 0; x < this.divSizeX; x++) {
    this.cellData[x] = new Array();
    for (var y = 0; y < this.divSizeY; y++) {
      this.cellData[x][y] = 0;
    }
  }
  this.posX = new Array();
  this.posY = new Array();
  this.startFlag = false;
}

var p = new Param();
var max_time = 1000;
var default_time = 300;
var time = max_time - default_time;

// シーケンス用音処理
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var destinationNode = context.destination;
var gainNode = context.createGain();
var type = "sine";
gainNode.connect(destinationNode);
gainNode.gain.value = 0.05;

function soundPlay(freq) {
  var oscillatorNode = context.createOscillator();
  oscillatorNode.frequency.value = freq;
  oscillatorNode.type = type;
  oscillatorNode.connect(gainNode);
  oscillatorNode.start(0);
  setTimeout(() => {
    oscillatorNode.stop(0);
  }, time);
}

start_stopBtn.addEventListener("click", async function () {
  if (!p.startFlag) {
    p.startFlag = true;
    this.innerText = "Stop";
    resetBtn.disabled = true;
    randomBtn.disabled = true;
    while (p.startFlag) {
      updateData();
      draw();
      console.log(time);
      await new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, time);
      });
    }
  } else {
    p.startFlag = false;
    this.innerText = "Start";
    resetBtn.disabled = false;
    randomBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", function () {
  for (var i = 0; i < p.divSizeX; i++) {
    for (var j = 0; j < p.divSizeY; j++) {
      p.cellData[i][j] = 0;
    }
  }
  draw();
});

randomBtn.addEventListener("click", function () {
  for (var i = 0; i < p.divSizeX; i++) {
    for (var j = 0; j < p.divSizeY; j++) {
      var preData = Math.floor(Math.random() * 2);
      p.cellData[i][j] = preData;
    }
  }
  draw();
});

// 音量スライダー
document.getElementById("volSlider").addEventListener("change", function () {
  gainNode.gain.value = this.value;
});

// 波形セレクター
document.getElementById("typeSel").addEventListener("change", function () {
  type = this.value;
});

document.getElementById("tempoSlider").addEventListener("change", function () {
  time = max_time - this.value;
});

var playFlag = false;
var pos = -1;
document.getElementById("playBtn").addEventListener("click", function () {
  console.log(this.textContent);
  if (this.textContent === "Play") {
    this.textContent = "Stop";
    playFlag = true;
    loop();
  } else {
    this.textContent = "Play";
    playFlag = false;
    pos = -1;
    draw();
  }
});

function loop() {
  if (playFlag) {
    pos++;
    if (pos === p.divSizeX) {
      pos = 0;
    }
    draw();
    setTimeout(() => {
      loop();
    }, time);
  }
}

drawInitial();

function updateData() {
  var newData = new Array();
  // 初期化
  for (var x = 0; x < p.divSizeX; x++) {
    newData[x] = new Array();
    for (var y = 0; y < p.divSizeY; y++) {
      newData[x][y] = 0;
    }
  }

  // チェック
  for (var x = 0; x < p.divSizeX; x++) {
    for (var y = 0; y < p.divSizeY; y++) {
      // 値を作成
      var leftX = x - 1;
      var centerX = x;
      var rightX = x + 1;

      var upY = y - 1;
      var centerY = y;
      var downY = y + 1;
      if (x === 0) {
        leftX = p.divSizeX - 1;
      }
      if (x === p.divSizeX - 1) {
        rightX = 0;
      }
      if (y === 0) {
        upY = p.divSizeY - 1;
      }
      if (y === p.divSizeY - 1) {
        downY = 0;
      }

      var ch = new Array();
      ch[0] = p.cellData[leftX][upY];
      ch[1] = p.cellData[centerX][upY];
      ch[2] = p.cellData[rightX][upY];

      ch[3] = p.cellData[leftX][centerY];
      ch[4] = p.cellData[rightX][centerY];

      ch[5] = p.cellData[leftX][downY];
      ch[6] = p.cellData[centerX][downY];
      ch[7] = p.cellData[rightX][downY];

      var sum = 0;
      for (var i = 0; i < ch.length; i++) {
        if (ch[i] === 1) {
          sum++;
        }
      }

      // 誕生
      if (p.cellData[x][y] === 0) {
        if (sum === 3) {
          newData[x][y] = 1;
        }
      }

      if (p.cellData[x][y] === 1) {
        // 生存
        if (sum === 2 || sum === 3) {
          newData[x][y] = 1;
        }
        // 過疎
        if (sum < 2) {
          newData[x][y] = 0;
        }
        // 過密
        if (sum > 3) {
          newData[x][y] = 0;
        }
      }
    }
  }

  // 更新
  p.cellData = newData;
}

function drawInitial() {
  var canvas = document.getElementById("cellsCanvas");
  var context = canvas.getContext("2d");

  // キャンバスサイズ
  var cW = canvas.width;
  var cH = canvas.height;

  // 枠のサイズ
  var offset = 5;

  // セルのサイズ
  var w = (cW - offset * 2) / p.divSizeX;
  var h = (cH - offset * 2) / p.divSizeY;

  (p.posX = new Array()), (p.posY = new Array());

  // セルの座標を作成
  for (var x = 0; x < p.divSizeX; x++) {
    p.posX[x] = offset + x * w;
  }
  for (var y = 0; y < p.divSizeY; y++) {
    p.posY[y] = offset + y * h;
  }

  context.clearRect(0, 0, cW, cH);
  context.fillRect(20, 40, 50, 100);

  context.beginPath();
  for (var xx = 0; xx < p.divSizeX; xx++) {
    for (var yy = 0; yy < p.divSizeY; yy++) {
      context.strokeRect(p.posX[xx], p.posY[yy], w, h); //輪郭

      var col = "rgba(250, 250, 250, 1.0)"; //灰色

      if (p.cellData[xx][yy] === 1) {
        var col = "rgba(0, 0, 0, 1.0)"; //黒
      }

      context.fillStyle = col;
      context.fillRect(p.posX[xx], p.posY[yy], w, h);
    }
  }
  canvas.onmousedown = mouseDownListner;
  canvas.onmouseup = mouseUpListner;
}

function mouseDownListner(e) {
  if (!p.startFlag) {
    var rect = e.target.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;

    // セルチェック・表示
    var sx = p.divSizeX - 1;
    var sy = p.divSizeY - 1;
    for (var xx = 0; xx < p.divSizeX; xx++) {
      if (mouseX < p.posX[p.divSizeX - xx]) {
        sx = p.divSizeX - (xx + 1);
      }
    }
    for (var yy = 0; yy < p.divSizeY; yy++) {
      if (mouseY < p.posY[p.divSizeY - yy]) {
        sy = p.divSizeY - (yy + 1);
      }
    }

    if (p.cellData[sx][sy] === 0) {
      p.cellData[sx][sy] = 1;
    } else {
      p.cellData[sx][sy] = 0;
    }
  }
}

function mouseUpListner(e) {
  if (!p.startFlag) {
    drawInitial();
  }
}

// xy位置補正
function adjustXY(e) {
  var rect = e.target.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}

function draw() {
  var canvas = document.getElementById("cellsCanvas");
  var context = canvas.getContext("2d");

  var cW = canvas.width;
  var cH = canvas.height;

  // 枠サイズ
  var offset = 5;

  // セルのサイズ
  var w = (cW - offset * 2) / p.divSizeX;
  var h = (cH - offset * 2) / p.divSizeY;

  var posX = new Array();
  var posY = new Array();

  // セルの座標を作成
  for (var x = 0; x < p.divSizeX; x++) {
    posX[x] = offset + x * w;
  }
  for (var y = 0; y < p.divSizeY; y++) {
    posY[y] = offset + y * h;
  }

  context.clearRect(0, 0, cW, cH);
  context.fillRect(20, 40, 50, 100);

  context.beginPath();
  for (var xx = 0; xx < p.divSizeX; xx++) {
    for (var yy = 0; yy < p.divSizeY; yy++) {
      context.strokeRect(posX[xx], posY[yy], w, h);

      var col = "rgba(250, 250, 250, 1.0)";

      if (xx === pos) {
        col = "rgba(200, 200, 200, 1.0)";
      }

      if (p.cellData[xx][yy] === 1) {
        col = "rgba(0, 0, 0, 1.0)"; //黒
      }

      if (xx === pos && p.cellData[xx][yy] === 1) {
        col = "rgba(250, 0, 0, 1.0)"; //赤
        var pitch = 440 * Math.pow(2, (12 - yy) / 12);
        soundPlay(pitch);
        console.log(gainNode.gain.value);
      }

      context.fillStyle = col;
      context.fillRect(posX[xx], posY[yy], w, h);
    }
  }
}
