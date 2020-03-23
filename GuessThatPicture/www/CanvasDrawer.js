/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

  var canvas, context, canvaso, contexto;
  var tool;

  // This object holds the implementation of each drawing tool.
  var tools = {};

// Keep everything in anonymous function, called on window load.
function InitDrawing()
{
  // The active tool instance.
  var tool_default = 'eraser';

  function init()
  {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');

    canvas.id = 'imageTemp';
    canvas.width = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');

    tool = new tools[tool_default]();

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);

    canvas.ontouchstart = ontouchstart_ev_canvas;
    canvas.ontouchmove = ontouchmove_ev_canvas;
    canvas.ontouchend = ontouchend_ev_canvas;
  }

  // The general-purpose event handler. This function just determines the mouse
  // position relative to the canvas element.
  function ev_canvas(ev)
  {
    if (ev.pageX || ev.pageX == 0)
    {
      // Firefox
      ev._x = ev.pageX;
      ev._y = ev.pageY;
    }
    else if (ev.offsetX || ev.offsetX == 0)
    {
      // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func)
    {
      func(ev);
    }

    ev.preventDefault();
  }

  var xoffset = 0;
  var yoffset = 0;

  function CreateMouseEvent(thisEv, type)
  {
    var NewEv = document.createEvent('MouseEvents');
    NewEv.type = type;
    NewEv._x = thisEv.clientX - xoffset;
    NewEv._y = thisEv.clientY - yoffset;

    return NewEv;
  }

  function ontouchstart_ev_canvas(ev)
  {
    var thisEv = ev.touches[0];
    //debug.log("start = " + thisEv.clientX + "/" + thisEv.clientY);
    var NewEv = CreateMouseEvent(thisEv, "mousedown");

    tool.mousedown(NewEv);
  }

  function ontouchmove_ev_canvas(ev)
  {
    var thisEv = ev.changedTouches[0];
    //debug.log("move = " + thisEv.clientX + "/" + thisEv.clientY);
    var NewEv = CreateMouseEvent(thisEv, "mousemove");

    tool.mousemove(NewEv);
  }

  function ontouchend_ev_canvas(ev)
  {
    var thisEv = ev.changedTouches[0];
    //debug.log("end = " + thisEv.clientX + "/" + thisEv.clientY);
    var NewEv = CreateMouseEvent(thisEv, "mouseup");

    tool.mouseup(NewEv);
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change(ev)
  {
    if (tools[this.value])
    {
      tool = new tools[this.value]();
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which
  // #imageTemp is cleared. This function is called each time when the user
  // completes a drawing operation.
  function img_update()
  {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // The drawing pencil.
  tools.pencil = function()
  {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function(ev)
    {
        //debug.log("mousedown(" + ev._x + "," + ev._y + ")";
        context.beginPath();
        context.moveTo(ev._x, ev._y);

        // draw a dot where we started
        /*
        var oldLineWidth = context.lineWidth;
        context.lineWidth = 1;
        context.fillStyle = context.strokeStyle;
        context.beginPath();
        context.arc(ev._x, ev._y, 2, 0, Math.PI*2);
        context.closePath();
        context.stroke();
        context.fill();
        context.lineWidth = oldLineWidth;
        */
        context.fillRect(ev._x - context.lineWidth/2, ev._y - context.lineWidth/2, context.lineWidth/1, context.lineWidth/1);

        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only
    // draws if the tool.started state is set to true (when you are holding down
    // the mouse button).
    this.mousemove = function(ev)
    {
      if (tool.started)
      {
        //debug.log("mousemove(" + ev._x + "," + ev._y + ")";
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev)
    {
      if (tool.started)
      {
        //debug.log("mouseup(" + ev._x + "," + ev._y + ")";
        tool.mousemove(ev);
        img_update();
      }
      tool.started = false;
    };
  };

  // The rectangle tool.
  tools.rect = function()
  {
    var tool = this;
    this.started = false;

    this.mousedown = function(ev)
    {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function(ev)
    {
      if (!tool.started)
      {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h)
      {
        return;
      }

      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function(ev)
    {
      if (tool.started)
      {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function()
  {
    var tool = this;
    this.started = false;

    this.mousedown = function(ev)
    {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function(ev)
    {
      if (!tool.started)
      {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x, ev._y);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function(ev)
    {
      if (tool.started)
      {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The eraser tool.
  tools.eraser = function()
  {
    var tool = this;
    this.started = false;

    function DoErase(ev)
    {
      context.clearRect(ev._x - context.lineWidth/4, ev._y - context.lineWidth/2,
                  context.lineWidth/2, context.lineWidth);

      context.clearRect(ev._x - context.lineWidth/2, ev._y - context.lineWidth/4,
                  context.lineWidth, context.lineWidth/2);

      context.clearRect(ev._x - 3/8*context.lineWidth, ev._y - 3/8*context.lineWidth,
                  3/4*context.lineWidth, 3/4*context.lineWidth);
    }

    // This is called when you start holding down the mouse button.
    // This starts the eraser on the drawing.
    this.mousedown = function(ev)
    {
        //debug.log("mousedown(" + ev._x + "," + ev._y + ")";
        DoErase(ev);

        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only
    // draws if the tool.started state is set to true (when you are holding down
    // the mouse button).
    this.mousemove = function(ev)
    {
      if (tool.started)
      {
        //debug.log("mousemove(" + ev._x + "," + ev._y + ")";
        DoErase(ev);
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev)
    {
      if (tool.started)
      {
        //debug.log("mouseup(" + ev._x + "," + ev._y + ")";
        DoErase(ev);;
      }
      tool.started = false;
    };
  };

  // The null tool.
  tools.NOP = function()
  {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the eraser on the drawing.
    this.mousedown = function(ev)
    {
        //debug.log("mousedown(" + ev._x + "," + ev._y + ")";

        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only
    // draws if the tool.started state is set to true (when you are holding down
    // the mouse button).
    this.mousemove = function(ev)
    {
      if (tool.started)
      {
        //debug.log("mousemove(" + ev._x + "," + ev._y + ")";
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev)
    {
      if (tool.started)
      {
        //debug.log("mouseup(" + ev._x + "," + ev._y + ")";
      }
      tool.started = false;
    };
  };

  init();
}

