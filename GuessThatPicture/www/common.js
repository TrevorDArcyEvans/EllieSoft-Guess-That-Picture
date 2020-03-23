
var CommonHasInitialised = false;

function PreventTouchMove()
{
  document.addEventListener("touchmove", preventBehavior, false);
}

function preventBehavior(e)
{
  e.preventDefault();
}

function EnableTouchMove()
{
  document.removeEventListener("touchmove", preventBehavior, false);
}

function CommonInit()
{
  if (CommonHasInitialised)
  {
    return;
  }

  CommonHasInitialised = true;
}

function PlaySound(url)
{
  OutputDebugString(BrowserDetect.OS + " / " + BrowserDetect.browser);
  OutputDebugString("Playing " + url);
  OutputDebugString("  using HTML5");
  var ThisSound = new Audio(url);
  ThisSound.play()
}

function pause(milliseconds)
{
  var dt = new Date();
  while ((new Date()) - dt <= milliseconds)
  {
    /* Do nothing */
  }
}

function sign(x)
{
  if (x == 0)
  {
    return 0;
  }

  return x/Math.abs(x);
}

function OutputDebugString(str)
{
  console.log(str);
}

function HideElementById(elemId)
{
  var style = document.getElementById(elemId).style;

  style.visibility = "hidden";
  style.height = 0;
  style.width = 0;
  style.margin = 0;
  style.padding = 0;
  style.border = 0;
}

function GetParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
  {
    return "";
  }
  else
  {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}

function GetPlaySound()
{
  var value = localStorage.getItem("PlaySound");
  if (null == value)
  {
    return true;
  }
  return (value == "true");
}

function SetPlaySound(value)
{
  localStorage.setItem("PlaySound", value);
}


