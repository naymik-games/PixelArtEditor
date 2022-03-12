var startState, baseControls, baseTools,colorInput, coor, app
var gridShown = true;
var Picture = class Picture {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
  }
  static empty(width, height, color) {
    let pixels = new Array(width * height).fill(color);
    return new Picture(width, height, pixels);
  }
  pixel(x, y) {
    return this.pixels[x + y * this.width];
  }
  draw(pixels) {
    let copy = this.pixels.slice();
    for (let {x, y, color} of pixels) {
      //console.log(color)
      copy[x + y * this.width] = color;
	  console.log(color)
    }
    return new Picture(this.width, this.height, copy);
  }
}

function updateState(state, action) {
  return Object.assign({}, state, action);
}

function elt(cl,type, props, ...children) {
  let dom = document.createElement(type);
  if(cl){
	   dom.classList.add(cl)
  }

  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

var scale = 15;

var PictureCanvas = class PictureCanvas {
  constructor(picture, pointerDown) {
    this.dom = elt("can-main","canvas", {
      onmousedown: event => this.mouse(event, pointerDown),
      ontouchstart: event => this.touch(event, pointerDown)
    });
	this.dom.setAttribute("id", "can-main");
    this.syncState(picture);
  }
  syncState(picture) {
    if (this.picture == picture) return;
    this.picture = picture;
    drawPicture(this.picture, this.dom, scale);
  }
}

function drawPicture(picture, canvas, scale) {
  canvas.width = picture.width * scale;
  canvas.height = picture.height * scale;
  
  let cx = canvas.getContext("2d");

  for (let y = 0; y < picture.height; y++) {
    for (let x = 0; x < picture.width; x++) {
      
      cx.fillStyle = picture.pixel(x, y);
      cx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

PictureCanvas.prototype.mouse = function(downEvent, onDown) {
  if (downEvent.button != 0) return;
  let pos = pointerPosition(downEvent, this.dom);
  let onMove = onDown(pos);
  if (!onMove) return;
  let move = moveEvent => {
    if (moveEvent.buttons == 0) {
      this.dom.removeEventListener("mousemove", move);
    } else {
      let newPos = pointerPosition(moveEvent, this.dom);
      if (newPos.x == pos.x && newPos.y == pos.y) return;
      pos = newPos;
      onMove(newPos);
	  //coor = document.getElementById('coo')
	  //coor.value = JSON.stringify(newPos)
	  
    }
  };
  this.dom.addEventListener("mousemove", move);
};
function updateCoo(e){
	var can = document.getElementById('can-main');
	var newCoo = pointerPosition(e, can)
	var x = newCoo.x + 1;
	var y = newCoo.y + 1;
	var text = x + ', ' + y
	coor = document.getElementById('coo')
	coor.value = text
}
function pointerPosition(pos, domNode) {
  let rect = domNode.getBoundingClientRect();
  return {x: Math.floor((pos.clientX - rect.left) / scale),
          y: Math.floor((pos.clientY - rect.top) / scale)};
}

PictureCanvas.prototype.touch = function(startEvent,
                                         onDown) {
  let pos = pointerPosition(startEvent.touches[0], this.dom);
  let onMove = onDown(pos);
  startEvent.preventDefault();
  if (!onMove) return;
  let move = moveEvent => {
    let newPos = pointerPosition(moveEvent.touches[0],
                                 this.dom);
    if (newPos.x == pos.x && newPos.y == pos.y) return;
    pos = newPos;
    onMove(newPos);
  };
  let end = () => {
    this.dom.removeEventListener("touchmove", move);
    this.dom.removeEventListener("touchend", end);
  };
  this.dom.addEventListener("touchmove", move);
  this.dom.addEventListener("touchend", end);
};

var PixelEditor = class PixelEditor {
  constructor(state, config) {
    let {tools, controls, dispatch} = config;
    this.state = state;

    this.canvas = new PictureCanvas(state.picture, pos => {
      let tool = tools[this.state.tool];
      let onMove = tool(pos, this.state, dispatch);
      if (onMove) return pos => onMove(pos, this.state);
    });
	//console.log(state.picture)
    this.controls = controls.map(
      Control => new Control(state, config));
	  
	 /*  var temp = elt("controls","div", {},...this.controls.reduce(
                     (a, c) => a.concat(" ", c.dom), [])) */
    
    this.dom = elt("main","div", {}, this.canvas.dom);
	//overlayGrid(state);
  }
  syncState(state) {
    this.state = state;
    this.canvas.syncState(state.picture);
	
    for (let ctrl of this.controls) ctrl.syncState(state);
	
  }
}

var ToolSelect = class ToolSelect {
  constructor(state, {tools, dispatch}) {
    this.select = document.getElementById('tools')
    this.select.onchange = function(){
      dispatch({tool: this.value})
    }
    
   
  }
  syncState(state) { this.value = state.tool; }
}
function setTool(tool){
  var btnContainer = document.getElementById("tool-icons");
  var btns = btnContainer.getElementsByClassName("btn-flat");
  for (var i = 0; i < btns.length; i++) {  
    if(btns[i].classList.contains('selected')){
      btns[i].classList.remove("selected")
    }
  }


  if(tool == 'd'){
    app.state.tool = "draw"
    document.getElementById('tools').value = 'draw'
    document.getElementById('d').classList.add("selected");
  } else if(tool == 'l'){
    app.state.tool = "line"
    document.getElementById('tools').value = 'line'
    document.getElementById('l').classList.add("selected");
  } else if(tool == 'f'){
    app.state.tool = "fill"
    document.getElementById('tools').value = 'fill'
    document.getElementById('f').classList.add("selected");
  } else if(tool == 'r'){
    app.state.tool = "rectangle"
    document.getElementById('tools').value = 'rectangle'
    document.getElementById('r').classList.add("selected");
  } else if(tool == 'o'){
    app.state.tool = "rectangleOutline"
    document.getElementById('tools').value = 'rectangleOutline'
    document.getElementById('o').classList.add("selected");
  } else if(tool == 'c'){
    app.state.tool = "circle"
    document.getElementById('tools').value = 'circle'
    document.getElementById('c').classList.add("selected");
  } else if(tool == 'p'){
    app.state.tool = "pick"
    document.getElementById('tools').value = 'pick'
    document.getElementById('p').classList.add("selected");
  } else if(tool == 'e'){
    app.state.tool = "erase"
    document.getElementById('tools').value = 'erase'
    document.getElementById('e').classList.add("selected");
  }
  

}
var ColorSelect = class ColorSelect {
  constructor(state, {dispatch}) {
    this.input = document.getElementById('colorpick')
    this.input.onchange = function(){
      console.log('changed')
      dispatch({color: this.value})
    }
  }
  syncState(state) { this.value = state.color; }
   
}

function draw(pos, state, dispatch) {
    function connect(newPos, state) {
      //console.log(state.color)
      let line = drawLine(pos, newPos, state.color);
      pos = newPos;
      
      dispatch({picture: state.picture.draw(line)});
    }
    connect(pos, state);
    return connect;
  }
function erase(pos, state, dispatch) {
    function connect(newPos, state) {
      let line = drawLine(pos, newPos, "rgba(255, 255, 255, 0)");
      pos = newPos;
      dispatch({picture: state.picture.draw(line)});
    }
    connect(pos, state);
    return connect;
  }
/* function draw(pos, state, dispatch) {
  function drawPixel({x, y}, state) {
    let drawn = {x, y, color: state.color};
    dispatch({picture: state.picture.draw([drawn])});
  }
  drawPixel(pos, state);
  return drawPixel;
} */

function line(pos, state, dispatch) {
    return end => {
      let line = drawLine(pos, end, state.color);
      dispatch({picture: state.picture.draw(line)});
    };
}

function drawLine(from, to, color) {
  
    let points = [];
    if (Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
      if (from.x > to.x) [from, to] = [to, from];
      let slope = (to.y - from.y) / (to.x - from.x);
      for (let {x, y} = from; x <= to.x; x++) {
        points.push({x, y: Math.round(y), color});
        y += slope;
      }
    } else {
      if (from.y > to.y) [from, to] = [to, from];
      let slope = (to.x - from.x) / (to.y - from.y);
      for (let {x, y} = from; y <= to.y; y++) {
        points.push({x: Math.round(x), y, color});
        x += slope;
      }
    }
    return points;
 }

function rectangle(start, state, dispatch) {
  function drawRectangle(pos) {
    let xStart = Math.min(start.x, pos.x);
    let yStart = Math.min(start.y, pos.y);
    let xEnd = Math.max(start.x, pos.x);
    let yEnd = Math.max(start.y, pos.y);
    let drawn = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
		  
			 drawn.push({x, y, color: state.color}); 
		 
        
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  
  drawRectangle(start);
  return drawRectangle;
}
function rectangleOutline(start, state, dispatch) {
  function drawRectangle(pos) {
    let xStart = Math.min(start.x, pos.x);
    let yStart = Math.min(start.y, pos.y);
    let xEnd = Math.max(start.x, pos.x);
    let yEnd = Math.max(start.y, pos.y);
    let drawn = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
		  if(y == yStart || y == yEnd || x == xStart || x == xEnd){
			 drawn.push({x, y, color: state.color}); 
		  }
        
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawRectangle(start);
  return drawRectangle;
}
function select(start, state, dispatch) {
  function drawRectangle(pos) {
    let xStart = Math.min(start.x, pos.x);
    let yStart = Math.min(start.y, pos.y);
    let xEnd = Math.max(start.x, pos.x);
    let yEnd = Math.max(start.y, pos.y);
    let drawn = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
		  if(y == yStart || y == yEnd || x == xStart || x == xEnd){
			 drawn.push({x, y, color: state.color}); 
		  }
        
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawRectangle(start);
  return drawRectangle;
}
function circle(pos, state, dispatch) {
    function drawCircle(to) {
      let radius = Math.sqrt(Math.pow(to.x - pos.x, 2) +
                             Math.pow(to.y - pos.y, 2));
      let radiusC = Math.ceil(radius);
      let drawn = [];
	  
	  var color = state.color
	  for (var r = 0; r <= Math.floor(radius * Math.sqrt(0.5)); r++) {
		var d = Math.floor(Math.sqrt(radius*radius - r*r));
	
		 drawn.push({x: pos.x - d, y: pos.y + r, color: color })
		 drawn.push({x: pos.x + d, y: pos.y + r, color: color })
		 drawn.push({x: pos.x - d, y: pos.y - r, color: color })
		 drawn.push({x: pos.x + d, y: pos.y - r, color: color })
		 drawn.push({x: pos.x + r, y: pos.y - d, color: color })
		 drawn.push({x: pos.x + r, y: pos.y + d, color: color })
		 drawn.push({x: pos.x - r, y: pos.y - d, color: color })
		 drawn.push({x: pos.x - r, y: pos.y - d, color: color })
		 drawn.push({x: pos.x - r, y: pos.y + d, color: color })

	  }
	  
      dispatch({picture: state.picture.draw(drawn)});
    }
    drawCircle(pos);
    return drawCircle;
}


var around = [{dx: -1, dy: 0}, {dx: 1, dy: 0},
                {dx: 0, dy: -1}, {dx: 0, dy: 1}];

function fill({x, y}, state, dispatch) {
  let targetColor = state.picture.pixel(x, y);
  let drawn = [{x, y, color: state.color}];
  for (let done = 0; done < drawn.length; done++) {
    for (let {dx, dy} of around) {
      let x = drawn[done].x + dx, y = drawn[done].y + dy;
      if (x >= 0 && x < state.picture.width &&
          y >= 0 && y < state.picture.height &&
          state.picture.pixel(x, y) == targetColor &&
          !drawn.some(p => p.x == x && p.y == y)) {
        drawn.push({x, y, color: state.color});
      }
    }
  }
  dispatch({picture: state.picture.draw(drawn)});
}

function pick(pos, state, dispatch) {
  dispatch({color: state.picture.pixel(pos.x, pos.y),tool: "draw"},);
  document.getElementById('tools').value = 'draw'
  //document.getElementById('colorpick').value = state.picture.pixel(pos.x, pos.y)
 document.querySelector('#colorpick').jscolor.fromString(state.picture.pixel(pos.x, pos.y)) 
 document.getElementById('p').classList.remove("selected");
 document.getElementById('d').classList.add("selected");
  dispatch({})
}

var SaveButton = class SaveButton {
  constructor(state) {
    
    
    this.dom = document.getElementById('save')
    this.dom.onclick = function(){
     
      save()
    }
  }
  
  syncState(state) { this.picture = state.picture; }
}
function save() {
  var picture = app.state.picture;
  //console.log(picture)
  let canvas = elt("can2","canvas");
  drawPicture(picture, canvas, 1);
 
  let link = elt("","a", {
    href: canvas.toDataURL(),
    download: "pixelart.png"
  });
  document.body.appendChild(link);
  link.click();
  link.remove();
}

var LoadButton = class LoadButton {
  constructor(_, {dispatch}) {
    this.dom = document.getElementById('load')
    this.dom.onclick = function(){
      console.log('load')
      startLoad(dispatch)
    }
  }
  syncState() {}
}
/* var LoadButton = class LoadButton {
  constructor(_, {dispatch}) {
    this.dom = elt("but","button", {
      onclick: () => startLoad(dispatch)
    }, "📁 Load");
  }
  syncState() {}
} */
function startLoad(dispatch) {
  let input = elt("but","input", {
    type: "file",
    onchange: () => finishLoad(input.files[0], dispatch)
  });
  document.body.appendChild(input);
  input.click();
  input.remove();
}

function finishLoad(file, dispatch) {
  if (file == null) return;
  let reader = new FileReader();
  reader.addEventListener("load", () => {
    let image = elt("","img", {
      onload: () => dispatch({
        picture: pictureFromImage(image)
      }),
      src: reader.result
    });
  });
  reader.readAsDataURL(file);
}

function pictureFromImage(image) {
  let width = Math.min(100, image.width);
  let height = Math.min(100, image.height);
  let canvas = elt("can2","canvas", {width, height});
  let cx = canvas.getContext("2d");
  cx.drawImage(image, 0, 0);
  let pixels = [];
  let pixelsRGBA = []
  let {data} = cx.getImageData(0, 0, width, height);

  function hex(n) {
    return n.toString(16).padStart(2, "0");
  }
  for (let i = 0; i < data.length; i += 4) {
    let [r, g, b, a] = data.slice(i, i + 4);
	
    pixels.push("#" + hex(r) + hex(g) + hex(b));
	pixelsRGBA.push("rgba(" + r + "," + g + ","+ b + "," + a +")")
  }
  console.log(JSON.stringify(listToMatrix(pixels, width)))
  console.log(JSON.stringify(listToMatrix(pixelsRGBA, width)))
  return new Picture(width, height, pixelsRGBA);
}
function listToMatrix(list, elementsPerSubArray) {
    var matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}
function historyUpdateState(state, action) {
  if (action.undo == true) {
    if (state.done.length == 0) return state;
    return Object.assign({}, state, {
      picture: state.done[0],
      done: state.done.slice(1),
      doneAt: 0
    });
  } else if (action.picture &&
             state.doneAt < Date.now() - 1000) {
    return Object.assign({}, state, action, {
      done: [state.picture, ...state.done],
      doneAt: Date.now()
    });
  } else {
    return Object.assign({}, state, action);
  }
}

var UndoButton = class UndoButton {
  constructor(state, {dispatch}) {
    this.dom = document.getElementById('undo')
    this.dom.onclick = function(){
      console.log('undo')
      dispatch({undo: true});
      //console.log(app.state.done.length)
      if(app.state.done.length == 0){
        this.disabled
      }
    }
  }
  syncState(state) {
    this.dom.disabled = state.done.length == 0;
  }
}
/* var UndoButton = class UndoButton {
  constructor(state, {dispatch}) {
    this.dom = elt("but","button", {
      onclick: () => dispatch({undo: true}),
      disabled: state.done.length == 0
    }, "\u00AE Undo");
  }
  syncState(state) {
    this.dom.disabled = state.done.length == 0;
  }
} */
function startPixelEditor({state = startState,
                           tools = baseTools,
                           controls = baseControls}) {
  app = new PixelEditor(state, {
    tools,
    controls,
    dispatch(action) {
      state = historyUpdateState(state, action);
      app.syncState(state);
    }
  });
//console.log(state)
  return app.dom;
}

function changeBackground(){
	
	var backcolor = colorInput.value
  
	document.getElementById('can-main').style.backgroundColor = backcolor;
  document.getElementById('bgcolor-display').value = backcolor;
}
function newEditor(){
  if(app != null){
    deleteApp();
  }
	var widthInput = document.getElementById('picW');
	var width = widthInput.value
	var heightInput = document.getElementById('picH');
	var height = heightInput.value
	
	startState = {
	  tool: "draw",
	  color: "rgba(0, 0, 0, 1)",
	  picture: Picture.empty(width, height, "rgba(255, 255, 255, 0)"),
	  done: [],
	  doneAt: 0
	};

	baseTools = {draw, line, fill, rectangle, rectangleOutline, circle, pick, erase, select};

	baseControls = [
	  ToolSelect, ColorSelect, SaveButton, LoadButton, UndoButton
	];
	document.getElementById('editor')
    .appendChild(startPixelEditor({}));
	// var myPicker = new JSColor("#colorpick")
	colorInput = document.getElementById('bgcolor');
	colorInput.addEventListener("change", changeBackground, false);
	var can = document.getElementById('can-main');
	can.addEventListener("mousemove", function(event) {
	  updateCoo(event);
	});
 document.getElementById('delete').addEventListener("click", deleteApp,false);
 document.getElementById("can-main").style.cursor = "crosshair";
}
function deleteApp(){
	app = null;
	document.getElementById("can-main").remove();
  /* var widthInput = document.getElementById('picW');
	var width = widthInput.value
	var heightInput = document.getElementById('picH');
	var height = heightInput.value
  app.state.picture = Picture.empty(width, height, "rgba(255, 255, 255, 0)")
  app.state.picture.draw(app.state.picture.pixels) */
}
function toggleGrid(){
	 if(gridShown){
		document.getElementById("can-main").style.backgroundImage = 'none';
		//background-image: url('grid15.png');
	  //background-position: 105px 105px;
	 // background-repeat: repeat;
	 gridShown = false
	} else {
		document.getElementById("can-main").style.backgroundImage = "url('./css/grid15.png')";
	 /*  background-position: 105px 105px;
	  background-repeat: repeat; */
	  gridShown = true
	} 
}

