var CoverColour = "#333399";

var ImagesDirectory = "./Resources/Images/";
var CurrentImageIndex = 0;
var ShouldPlaySqueaker = true;
var Squeaker = new Audio("./Resources/Sounds/108486__robinhood76.mp3");
var ShouldPlaySound = true;
var MouseDown = false;

var Chooser = null;
var Choices = new Array();
var ShownImages = new Array();
//var ShowChooserSound = new Audio("./Sounds/Beep1.mp3");
//var HideChooserSound = new Audio("./Sounds/Beep5.mp3");

var Progress = null;
var LastX = 0;
var LastY = 0;
var TotalDistance = 0;
var InitialDistance = 2000;
var MaxDistance = InitialDistance;
var FinalDistance = 0.2 * InitialDistance;

var NumCards = 10;

var ScoreBoard = null;
var Score = 0;
var ScoreCtl = null;

var Remaining = 0;
var RemainingCtl = null;

var FeedbackCorrect = null;
var FeedbackIncorrect = null;

// TODO   Rotating Audio Channels
//      http://www.storiesinflight.com/html5/audio.html

// colour image to be revealed
var image =
{
  'url': null,
  'img': null
};

// temp and draw canvases
var canvas =
{
  'temp':null,
  'draw':null
};

var MainCanvas = null;

function ToggleSound()
{
  ShouldPlaySound = !ShouldPlaySound;
  SetPlaySound(ShouldPlaySound);
  var audioImg = document.getElementById('AudioController');
  audioImg.src = ShouldPlaySound ? "./Resources/Icons/DeveloperKit/music.png" : "./Resources/Icons/DeveloperKit/Music-Delete.png";
}

function GetScore()
{
  var score = localStorage.getItem("score");
  if (null == score)
  {
    score = 0;
  }
  return score;
}

function SetScore(value)
{
  localStorage.setItem("score", value);
}

function CreateMouseEvent(thisEv, type)
{
  var NewEv = document.createEvent('MouseEvents');
  NewEv.initMouseEvent(type, true, true, window, 1,
            thisEv.screenX, thisEv.screenY,
            thisEv.clientX, thisEv.clientY, false,
            false, false, false, 0/*left*/, null);

  return NewEv;
}

function StartSqueaker(ev)
{
  MouseDown = true;
  LastX = ev.clientX;
  LastY = ev.clientY;
}

function StopSqueaker(ev)
{
  Squeaker.pause();
  MouseDown = false;
}

function MoveSqueaker(ev)
{
  if (Math.abs(ev.clientX - LastX) < 1 || Math.abs(ev.clientY - LastY) < 1)
  {
    Squeaker.pause();
  }
  else
  {
    if (MouseDown && ShouldPlaySqueaker && ShouldPlaySound)
    {
      Squeaker.play();
    }
  }
}

function OnMouseDown(ev)
{
  StartSqueaker(ev);

  // mouse down reveals a spot, so count as movement
  var dummyMove = { 'clientX' : LastX + GetEraserWidth() / 2, 'clientY' : LastY + GetEraserWidth() / 2 };
  TrackMovement(dummyMove);
}

function OnMouseMove(ev)
{
  MoveSqueaker(ev);
  TrackMovement(ev);

  // update last pos after we've processed it
  LastX = ev.clientX;
  LastY = ev.clientY;
}

function OnMouseUp(ev)
{
  StopSqueaker(ev);
}

function OnTouchStart(ev)
{
  OnMouseDown(CreateMouseEvent(ev.touches[0], "mousedown"));
}

function OnTouchMove(ev)
{
  OnMouseMove(CreateMouseEvent(ev.changedTouches[0], "mousemove"));
}

function OnTouchEnd(ev)
{
  OnMouseUp(CreateMouseEvent(ev.changedTouches[0], "mouseup"));
}

function InitMouseListeners()
{
  MainCanvas.addEventListener('mousedown', OnMouseDown, false);
  MainCanvas.addEventListener('mousemove', OnMouseMove, false);
  MainCanvas.addEventListener('mouseup', OnMouseUp, false);

  MainCanvas.addEventListener('touchstart', OnTouchStart, false);
  MainCanvas.addEventListener('touchmove', OnTouchMove, false);
  MainCanvas.addEventListener('touchend', OnTouchEnd, false);

  Progress.addEventListener('mousedown', OnMouseDown, false);
  Progress.addEventListener('mousemove', OnMouseMove, false);
  Progress.addEventListener('mouseup', OnMouseUp, false);

  Progress.addEventListener('touchstart', OnTouchStart, false);
  Progress.addEventListener('touchmove', OnTouchMove, false);
  Progress.addEventListener('touchend', OnTouchEnd, false);
}

function InitSound()
{
  Squeaker.loop = true;
  Squeaker.load();

  ShouldPlaySound = GetPlaySound();

  //ShowChooserSound.load();
  //HideChooserSound.load();
}

function InitShownImages()
{
  ShownImages = new Array();
}

function TrackMovement(ev)
{
  if (!MouseDown)
  {
    return;
  }
  var dx = Math.abs(ev.clientX - LastX);
  var dy = Math.abs(ev.clientY - LastY);
  TotalDistance += Math.sqrt(dx*dx + dy*dy);

  if (TotalDistance < MaxDistance)
  {
    var progVal = (MaxDistance - TotalDistance) / MaxDistance * 100;
    UpdateProgress(progVal);
  }
  else
  {
    if (ShouldPlaySqueaker == true)
    {
      Squeaker.pause();
      ShouldPlaySqueaker = false;
      ShowChooser();
      ShowScoreBoard();
      PopulateChoices();
      UpdateProgress(0);
    }
  }
}

function CentreOnPage(el)
{
  el.style.left = (window.innerWidth - el.width) / 2 + "px";
  el.style.top = (window.innerHeight - el.height) / 2 + "px";
}

function InitFeedbackImages()
{
  FeedbackCorrect = document.getElementById("correct");
  FeedbackIncorrect = document.getElementById("incorrect");

  CentreOnPage(FeedbackCorrect);
  CentreOnPage(FeedbackIncorrect);
}

function InitTracker()
{
  MaxDistance = InitialDistance;
  TotalDistance = 0;
}

function InitChooser()
{
  Chooser = document.getElementById("chooser");
}

function InitChoices()
{
  Choices[0] = document.getElementById("choice0");
  Choices[1] = document.getElementById("choice1");
  Choices[2] = document.getElementById("choice2");
  Choices[3] = document.getElementById("choice3");
  Choices[4] = document.getElementById("choice4");
}

function InitProgress()
{
  Progress = document.getElementById("progress");
  $(Progress).css('width', window.innerWidth - 20);
  Progress.style.left = window.innerWidth - Progress.offsetWidth - 10 + "px";
  UpdateProgress(100);
}

function ShowProgress()
{
  Progress.style.visibility = "visible";
  Progress.style.display = "block";
}

function HideProgress()
{
  Progress.style.visibility = "hidden";
  Progress.style.display = "none";
}

function UpdateProgress(val)
{
  $(Progress).find('.meter-value').css('width', val + "%");
}

function UpdateScore()
{
  ScoreCtl.innerHTML = Score;
}

function UpdateRemaining()
{
  RemainingCtl.innerHTML = NumCards - Remaining - Score;
}

function InitScoreboard()
{
  ScoreBoard = document.getElementById("scoreboard");
  ScoreCtl = document.getElementById("score");
  RemainingCtl = document.getElementById("wrong");

  InitScores();
}

function InitScores()
{
  Score = 0;
  Remaining = NumCards;
  UpdateScore();
  UpdateRemaining();
}

function ShowScoreBoard()
{
  ScoreBoard.style.visibility = "visible";
  ScoreBoard.style.display = "block";
}

function HideScoreBoard()
{
  ScoreBoard.style.visibility = "hidden";
  ScoreBoard.style.display = "none";
}

function ShowChooser()
{
  //Squeaker.pause();
  //HideChooserSound.pause();
  //ShowChooserSound.play();

  Chooser.style.visibility = "visible";
  Chooser.style.display = "block";
  Chooser.style.left = "10px";
  Chooser.style.top = window.innerHeight - Chooser.clientHeight - 15 + "px";
}

function HideChooser()
{
  Chooser.style.visibility = "hidden";
  Chooser.style.display = "none";
}

function PopulateChoices()
{
  // populate with random but unique answers
  var NumChoices = 5;
  var nameArr = new Array();
  while (nameArr.length < NumChoices)
  {
    var num = Math.floor(Math.random()* ImageFiles.length);
    var name = ImageFiles[num].name;
    if (nameArr.indexOf(name) == -1)
    {
      nameArr[nameArr.length] = name;
    }
  }

  // see if we already have the answer
  var answer = ImageFiles[CurrentImageIndex].name;
  if (nameArr.indexOf(answer) == -1)
  {
    // answer no there, so put in
    var ansIdx = Math.floor(Math.random() * NumChoices);
    nameArr[ansIdx] = answer;
  }

  for (var i = 0; i < NumChoices; i++)
  {
    Choices[i].value = nameArr[i];
  }

  window.scrollTo(document.body.scrollWidth, 0);
}

function ToggleChoices()
{
  var choices = document.getElementById("choices");
  var toggleUp = document.getElementById("toggleUp");
  var toggleDown = document.getElementById("toggleDown");

  //Squeaker.pause();
  if (choices.style.visibility == "hidden")
  {
    //HideChooserSound.pause();
    //ShowChooserSound.play();

    choices.style.visibility = "visible";

    toggleUp.style.display = "none";
    toggleUp.style.visibility = "hidden";
    toggleDown.style.display = "block";
    toggleDown.style.visibility = "visible";

    ShowScoreBoard();
  }
  else
  {
    //ShowChooserSound.pause();
    //HideChooserSound.play();

    choices.style.visibility = "hidden";

    toggleUp.style.display = "block";
    toggleUp.style.visibility = "visible";
    toggleDown.style.display = "none";
    toggleDown.style.visibility = "hidden";

    HideScoreBoard();
  }
}

function ProcessChoice(ans)
{
  //Squeaker.pause();
  //ShowChooserSound.pause();
  //HideChooserSound.pause();

  var correct = (ans == ImageFiles[CurrentImageIndex].name);
  if (correct)
  {
    if (ShouldPlaySound)
    {
      PlaySound("./Resources/Sounds/69338__timtube__crowd-yay.mp3");
    }
    Score++;

    // decrement scratch dist but only if successful
    // ie it only gets harder if they're good!
    MaxDistance = InitialDistance - (InitialDistance - FinalDistance) * Score / NumCards;
  }
  else
  {
    if (ShouldPlaySound)
    {
      PlaySound("./Resources/Sounds/55001__stib__uh-oh.mp3");
    }
  }
  Remaining--;
  UpdateRemaining();
  UpdateScore();

  HideProgress();
  HideChooser();
  HideScoreBoard()

  var feedbackImg = correct ? FeedbackCorrect : FeedbackIncorrect;

  // fadeout overlay to reveal image
  var ctx = canvas.draw.getContext('2d');
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff'; // can be any opaque color

  var midPt = { x:window.innerWidth/2, y:window.innerHeight/2 };
  var diag = Math.sqrt(window.innerWidth*window.innerWidth + window.innerHeight*window.innerHeight);

  var dia = 0;
  var drawCircle = function()
  {
    ctx.lineWidth = 6*dia;

    ctx.beginPath();
    // this +0.01 hackishly causes Linux Chrome to draw a
    // "zero"-length line (a single point), otherwise it doesn't
    // draw when the mouse is clicked but not moved:
    ctx.moveTo(midPt.x + 0.01, midPt.y);
    ctx.lineTo(midPt.x, midPt.y);
    ctx.stroke();

    RecompositeCanvases();

    dia++;
    if (ctx.lineWidth < diag)
    {
      setTimeout(drawCircle, 0.1);
    }
    else
    {
      feedbackImg.style.visibility = "visible";

      setTimeout(function()
      {
        feedbackImg.style.visibility = "hidden";

        if (Remaining == 0)
        {
          // add score to cumulative total
          var totalScore = GetScore() + Score;
          SetScore(totalScore);

          // show score
          var overlay = document.getElementById("overlay");
          var scoreMsg = "You got " + Score + " out of " + NumCards + " correct.<p>Well done!";
          var overlayTxt = overlay.innerHTML;
          overlay.innerHTML = overlayTxt.replace("%SCORE_TOKEN%", scoreMsg);
          overlay.style.visibility = "visible";
        }
        else
        {
          ClearCanvas();
          RandomCanvas();
          ShouldPlaySqueaker = true;
          HideChooser();
          HideScoreBoard()
          ShowProgress();
          UpdateProgress(100);
        }
      }, 1000);
    }
  }
  drawCircle();
}

function Restart()
{
  //Squeaker.pause();
  //ShowChooserSound.pause();
  //HideChooserSound.play();

  InitScores();
  InitTracker();
  InitShownImages();
  ClearCanvas();
  RandomCanvas();
  ShouldPlaySqueaker = true;
  HideChooser();
  HideScoreBoard()
  ShowProgress();
  UpdateProgress(100);
}

function ClearCanvas()
{
  // clear the draw canvas
  canvas.draw.width = canvas.draw.width;
  RecompositeCanvases()
}

/**
 * Handle loading of needed image resources
 */
function LoadImage()
{
  var loadCount = 0;
  var loadTotal = 1;
  var loadingIndicator;

  function imageLoaded(e)
  {
    loadCount++;

    if (loadCount >= loadTotal)
    {
      RecompositeCanvases();
    }
  }

  image.img = document.createElement('img'); // image is global
  image.img.addEventListener('load', imageLoaded, false);
  image.img.src = image.url;
}

function LoadImageByName(rootName)
{
  image.url = ImagesDirectory + rootName;
  LoadImage();
}

function LoadCanvas(index)
{
  LoadImageByName(ImageFiles[index].src);

  TotalDistance = 0;
  UpdateProgress(100);
}

function NextCanvas()
{
  CurrentImageIndex++;
  if (CurrentImageIndex >= ImageFiles.length)
  {
    // cycle around to start
    CurrentImageIndex = 0;
  }
  LoadCanvas(CurrentImageIndex);
}

function PreviousCanvas()
{
  CurrentImageIndex--;
  if (CurrentImageIndex < 0)
  {
    // cycle around to end
    CurrentImageIndex = ImageFiles.length - 1;
  }
  LoadCanvas(CurrentImageIndex);
}

function ReloadCanvas()
{
  // reload current image
  LoadCanvas(CurrentImageIndex);
}

function RandomCanvas()
{
  // load a random image which hasn't been shown
  while (true)
  {
    CurrentImageIndex = Math.floor(Math.random() * ImageFiles.length);
    if (ShownImages.indexOf(CurrentImageIndex) == -1)
    {
      ShownImages[ShownImages.length] = CurrentImageIndex;
      break;
    }
  }

  LoadCanvas(CurrentImageIndex);
}

/**
 * Helper function to get the local coords of an event in an element,
 * since offsetX/offsetY are apparently not entirely supported, but
 * offsetLeft/offsetTop/pageX/pageY are!
 *
 * @param elem element in question
 * @param ev the event
 */
function GetLocalCoords(elem, ev)
{
  var ox = 0, oy = 0;
  var first;
  var pageX, pageY;

  // Walk back up the tree to calculate the total page offset of the
  // currentTarget element.  I can't tell you how happy this makes me.
  // Really.
  while (elem != null)
  {
    ox += elem.offsetLeft;
    oy += elem.offsetTop;
    elem = elem.offsetParent;
  }

  if (ev.hasOwnProperty('changedTouches'))
  {
    first = ev.changedTouches[0];
    pageX = first.pageX;
    pageY = first.pageY;
  }
  else
  {
    pageX = ev.pageX;
    pageY = ev.pageY;
  }

  return { 'x': pageX - ox, 'y': pageY - oy };
}

function GetEraserWidth()
{
  var area = window.innerWidth * window.innerHeight;
  var avgLength = Math.sqrt(area);

  return avgLength/20;
}

/**
 * Draw a scratch line
 *
 * @param can the canvas
 * @param x,y the coordinates
 * @param fresh start a new line if true
 */
function ScratchLine(can, x, y, fresh)
{
  if (ShouldPlaySqueaker == false)
  {
    return;
  }

  var ctx = can.getContext('2d');

  // set eraser width based on screen size
  ctx.lineWidth = GetEraserWidth();

  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff'; // can be any opaque color
  if (fresh)
  {
    ctx.beginPath();
    // this +0.01 hackishly causes Linux Chrome to draw a
    // "zero"-length line (a single point), otherwise it doesn't
    // draw when the mouse is clicked but not moved:
    ctx.moveTo(x + 0.01, y);
  }
  ctx.lineTo(x, y);
  ctx.stroke();
}

/**
 * On mouse down, draw a line starting fresh
 */
function MouseDown_Handler(e)
{
  var local = GetLocalCoords(MainCanvas, e);
  MouseDown = true;

  ScratchLine(canvas.draw, local.x, local.y, true);
  RecompositeCanvases();

  if (e.cancelable)
  {
    e.preventDefault();
  }
  return false;
};

/**
 * On mouse move, if mouse down, draw a line
 *
 * We do this on the window to smoothly handle mousing outside
 * the canvas
 */
function MouseMove_Handler(e)
{
  if (!MouseDown)
  {
    return true;
  }

  var local = GetLocalCoords(MainCanvas, e);

  ScratchLine(canvas.draw, local.x, local.y, false);
  RecompositeCanvases();

  if (e.cancelable)
  {
    e.preventDefault();
  }

  return false;
};

/**
 * On mouseup.  (Listens on window to catch out-of-canvas events.)
 */
function MouseUp_Handler(e)
{
  if (MouseDown)
  {
    MouseDown = false;

    if (e.cancelable)
    {
      e.preventDefault();
    }
    return false;
  }

  return true;
};

/**
 * Recomposites the canvases onto the screen
 *
 * Note that my preferred method (putting the background down, then the
 * masked foreground) doesn't seem to work in FF with "source-out"
 * compositing mode (it just leaves the destination canvas blank.)  I
 * like this method because mentally it makes sense to have the
 * foreground drawn on top of the background.
 *
 * Instead, to get the same effect, we draw the whole foreground image,
 * and then mask the background (with "source-atop", which FF seems
 * happy with) and stamp that on top.  The final result is the same, but
 * it's a little bit weird since we're stamping the background on the
 * foreground.
 *
 * OPTIMIZATION: This naively redraws the entire canvas, which involves
 * four full-size image blits.  An optimization would be to track the
 * dirty rectangle in scratchLine(), and only redraw that portion (i.e.
 * in each drawImage() call, pass the dirty rectangle as well--check out
 * the drawImage() documentation for details.)  This would scale to
 * arbitrary-sized images, whereas in its current form, it will dog out
 * if the images are large.
 */
function RecompositeCanvases()
{
  var tempctx = canvas.temp.getContext('2d');
  var mainctx = MainCanvas.getContext('2d');

  // Step 1: clear the temp
  canvas.temp.width = canvas.temp.width; // resizing clears

  // Step 2: stamp the draw on the temp (source-over)
  tempctx.drawImage(canvas.draw, 0, 0);

  /* !!!! this way doesn't work on FF:
    // Step 3: stamp the foreground on the temp (!! source-out mode !!)
    tempctx.globalCompositeOperation = 'source-out';
    tempctx.drawImage(image.front.img, 0, 0);

    // Step 4: stamp the background on the display canvas (source-over)
    //mainctx.drawImage(image.img, 0, 0);

    // Step 5: stamp the temp on the display canvas (source-over)
    mainctx.drawImage(canvas.temp, 0, 0);
  */

  // Step 3: stamp the background on the temp (!! source-atop mode !!)
  tempctx.globalCompositeOperation = 'source-atop';

  var imgHeight = MainCanvas.height;

  // maintain aspect ratio
  var imgWidth = imgHeight * image.img.width/image.img.height;

  // check we aren't too wide
  if (imgWidth > MainCanvas.width)
  {
    imgWidth = MainCanvas.width;
    imgHeight = imgWidth * image.img.height/image.img.width;
  }

  // center vertically
  var vMargin = (MainCanvas.height - imgHeight) / 2;

  // Five arguments:
  //  the element,
  //  destination (x,y) coordinates
  //  destination width and height (if you want to resize the source image).
  tempctx.drawImage(image.img,
    // center image horizontally
    (MainCanvas.width - imgWidth) / 2, vMargin,

    imgWidth, imgHeight);

  // Step 4: stamp the foreground on the display canvas (source-over)
  //mainctx.drawImage(image.front.img, 0, 0);
  mainctx.fillStyle = CoverColour;
  mainctx.fillRect(0, 0, MainCanvas.width, MainCanvas.height);

  // Step 5: stamp the temp on the display canvas (source-over)
  mainctx.drawImage(canvas.temp, 0, 0);
}

function InitCanvases()
{
  MainCanvas = document.getElementById('MainCanvas');

  // create the temp and draw canvases, and set their dimensions
  // to the same as the main canvas:
  canvas.temp = document.createElement('canvas');
  canvas.draw = document.createElement('canvas');

  MainCanvas.addEventListener('mousedown', MouseDown_Handler, false);
  MainCanvas.addEventListener('touchstart', MouseDown_Handler, false);

  window.addEventListener('mousemove', MouseMove_Handler, false);
  window.addEventListener('touchmove', MouseMove_Handler, false);

  window.addEventListener('mouseup', MouseUp_Handler, false);
  window.addEventListener('touchend', MouseUp_Handler, false);
}

function ResizeCanvas()
{
  var HeightOffset = 0;

  MainCanvas.height = window.innerHeight - HeightOffset;

  var WidthOffset = 0;

  MainCanvas.width = window.innerWidth - WidthOffset;

  canvas.temp.width = canvas.draw.width = MainCanvas.width;
  canvas.temp.height = canvas.draw.height = MainCanvas.height;
}

/* When this function is called, PhoneGap has been initialized and is ready to roll */
function OnDeviceReady()
{
  // do your thing!
  // except for Android as the accelerometer calibrations are not consistent across devices :-(
  // to support 'shake to erase', we'd have to calibrate the accelerometer which might be
  // beyond a parents' or child's ability
  if (BrowserDetect.OS != "Android")
  {
    WatchForShake(1.25);
  }
}

function WatchForShake(threshold)
{
  var axl = new Accelerometer();

  axl.watchAcceleration
  (
   function (Accel)
   {
    if (true === Accel.is_updating)
    {
      return;
    }

   if (Math.abs(Accel.x) >= threshold &&
      Math.abs(Accel.y) >= threshold )
    {
      //debug.log("acc(" + Accel.x + "," + Accel.y + "," + Accel.z + ")");
      ReloadCanvas();
    }
   }
   , function(){}
   , { frequency : 60 }
   );
}

function OnBodyLoad()
{
  MouseDown = false;

  CommonInit();
  InitCanvases();
  InitProgress();
  InitMouseListeners()
  InitSound();
  InitTracker();
  InitChooser();
  InitChoices();
  InitScoreboard();
  InitFeedbackImages();
  InitShownImages();
  document.addEventListener("deviceready", OnDeviceReady, false);

  PreventTouchMove();

  ResizeCanvas();
  RandomCanvas();
}
