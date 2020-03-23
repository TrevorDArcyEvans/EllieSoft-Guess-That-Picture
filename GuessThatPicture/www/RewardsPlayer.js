var RewardsImagesDirectory = "./Resources/Rewards/Images/";
var RewardsSoundsDirectory = "./Resources/Rewards/Sounds/";

var PlayerCanvas = null;
var MouseDownPt = null;
var RewardSound = null;
var RewardImg = null;
var RewardPos = null;
var ShouldPlaySound = true;

var RewardImgWidth = 48;
var RewardImgHeight = 48;
var RewardSpeed = 5;

function sign(x)
{
  if (x == 0)
  {
    return 0;
  }

  return x / Math.abs(x);
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

function MouseDown_Handler(e)
{
  if (ShouldPlaySound)
  {
    RewardSound.play();
  }

  MouseDownPt = GetLocalCoords(PlayerCanvas, e);

  MoveRewardTowardsMouseDown();

  if (e.cancelable)
  {
    e.preventDefault();
  }
  return false;
};

function MoveRewardTowardsMouseDown()
{
  var PostionTolerance = 5;
  var TimeoutInterval = 20;

  var dx = MouseDownPt.x - RewardPos.x;
  var dy = MouseDownPt.y - RewardPos.y;

  if (Math.abs(dx) < PostionTolerance &&
      Math.abs(dy) < PostionTolerance)
  {
    DrawReward();

    return;
  }

  if (Math.abs(dx) < PostionTolerance)
  {
    RewardPos.y += sign(dy) * RewardSpeed;
    DrawReward();
    setTimeout("MoveRewardTowardsMouseDown();", TimeoutInterval);

   return;
  }

  if (Math.abs(dy) < PostionTolerance)
  {
    RewardPos.x += sign(dx) * RewardSpeed;
    DrawReward();
    setTimeout("MoveRewardTowardsMouseDown();", TimeoutInterval);

    return;
  }

  // vector motion to mouse point
  var length = Math.sqrt(dx*dx + dy*dy);
  var dirn = { 'x' : dx, 'y' : dy };

  RewardPos.x += dirn.x / length * RewardSpeed;
  RewardPos.y += dirn.y / length * RewardSpeed;

  DrawReward();
  setTimeout("MoveRewardTowardsMouseDown();", TimeoutInterval);
}

function DrawReward()
{
  // erase canvas
  PlayerCanvas.width = PlayerCanvas.width;

  var ctx = PlayerCanvas.getContext('2d');
  ctx.drawImage(RewardImg, RewardPos.x - RewardImgWidth / 2, RewardPos.y - RewardImgHeight / 2, RewardImgWidth, RewardImgHeight);
}

function InitReward()
{
  var sound = UrlParams["sound"];
  RewardSound = new Audio(RewardsSoundsDirectory + sound);
  ShouldPlaySound = GetPlaySound();

  function imageLoaded(e)
  {
    var menubar = document.getElementById('menubar');
    RewardPos = { 'x' : window.innerWidth / 2, 'y' : window.innerHeight - RewardImgHeight - menubar.clientHeight - 20};
    DrawReward();
  }

  var toy = UrlParams["toy"] + ".png";
  RewardImg = document.createElement('img');
  RewardImg.addEventListener('load', imageLoaded, false);
  RewardImg.src = RewardsImagesDirectory + toy;
}

function InitUI()
{
  // center menu bar horizontally
  var menubar = document.getElementById('menubar');
  menubar.style.left = (window.innerWidth - menubar.clientWidth) / 2 + "px";
}

function InitCanvas()
{
  PlayerCanvas = document.getElementById('PlayerCanvas');

  var HeightOffset = 15;
  PlayerCanvas.height = window.innerHeight - HeightOffset;

  var WidthOffset = 15;
  PlayerCanvas.width = window.innerWidth - WidthOffset;

  PlayerCanvas.addEventListener('mousedown', MouseDown_Handler, false);
  PlayerCanvas.addEventListener('touchstart', MouseDown_Handler, false);
}

function InitPlayer()
{
  InitCanvas();
  InitUI();
  InitReward();
}
