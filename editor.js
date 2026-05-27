const editorEl = document.getElementById("editor");
const preview = document.getElementById("preview");
const restartBtn = document.getElementById("restartBtn");

let iframe;
let timeout;
let isDirty = false;
let canvasCaptured = false;

const CAPTURE_OPTIONS = { capture: true, passive: false };

function blockInput(e) {
  if (!canvasCaptured) return;
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
}

function setCanvasCaptured(state) {
  canvasCaptured = state;
  preview.classList.toggle('captured', state);

  if (state) {
    document.addEventListener('keydown', blockInput, true);
    document.addEventListener('keypress', blockInput, true);
    document.addEventListener('keyup', blockInput, true);
    window.addEventListener('wheel', blockInput, CAPTURE_OPTIONS);
    window.addEventListener('touchmove', blockInput, CAPTURE_OPTIONS);

    try {
      if (iframe && iframe.contentWindow) iframe.contentWindow.focus();
    } catch (err) {}
  } else {
    document.removeEventListener('keydown', blockInput, true);
    document.removeEventListener('keypress', blockInput, true);
    document.removeEventListener('keyup', blockInput, true);
    window.removeEventListener('wheel', blockInput, CAPTURE_OPTIONS);
    window.removeEventListener('touchmove', blockInput, CAPTURE_OPTIONS);
  }
}

function onPointerDown(e) {
  if (preview.contains(e.target) || e.target === preview) {
    setCanvasCaptured(true);
  } else {
    setCanvasCaptured(false);
  }
}

document.addEventListener('pointerdown', onPointerDown, true);

const editor = CodeMirror(editorEl, {
  lineNumbers: true,
  mode: "javascript",
  lineWrapping: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  matchBrackets: true,
  autoCloseBrackets: true,
  indentUnit: 4,
  tabSize: 4,
  indentWithTabs: false,
});

editor.setSize("100%", "100%");


function parseCanvasSize(code) {
  const match = code.match(/createCanvas\s*\(\s*([0-9]+)\s*,\s*([0-9]+)/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

function makeCompatibilityShims(code) {
  return `
window.createFont = window.createFont || function(name, size) {
  return name;
};

window.pushMatrix = window.pushMatrix || function() {
  push();
};

window.popMatrix = window.popMatrix || function() {
  pop();
};
` + code;
}

function injectDefaultCanvas(code) {
  if (/\bcreateCanvas\s*\(/.test(code)) return code;

  return `${code}
(function() {
  const originalSetup = window.setup;
  const originalCreateCanvas = window.createCanvas;
  let canvasCreated = false;

  window.createCanvas = function(...args) {
    canvasCreated = true;
    return originalCreateCanvas.apply(this, args);
  };

  window.setup = function() {
    if (typeof originalSetup === 'function') originalSetup();
    if (!canvasCreated) {
      createCanvas(300, 300);
    }
  };
})();`;
}
function createFrame(code) {
  if (iframe) iframe.remove();

  const sanitizedCode = code
    .replace(/\bpushMatrix\s*\(\s*\)/g, 'push()')
    .replace(/\bpopMatrix\s*\(\s*\)/g, 'pop()');

  const compatibilityCode = makeCompatibilityShims(sanitizedCode);
  const codeToRun = injectDefaultCanvas(compatibilityCode);

  const canvasSize = parseCanvasSize(sanitizedCode) || { width: 300, height: 300 };

  preview.style.width = `${canvasSize.width}px`;
  preview.style.height = `${canvasSize.height}px`;
  editor.setSize("100%", `${canvasSize.height}px`);
  editorEl.style.height = `${canvasSize.height}px`;

  iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  preview.appendChild(iframe);

  iframe.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<style>
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  canvas {
    display: block;
  }
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
</head>

<body>

<script>
window.onerror = function(msg, src, line) {
  document.body.innerHTML =
    "<pre style='color:red; padding:10px;'>" +
    msg + "\\nLine: " + line +
    "</pre>";
};

${codeToRun}
<\/script>

</body>
</html>
`;

  iframe.addEventListener('load', () => {
    try {
      const idoc = iframe.contentDocument || iframe.contentWindow.document;

      idoc.addEventListener('pointerdown', () => setCanvasCaptured(true), true);

      idoc.addEventListener('wheel', (e) => {
        if (canvasCaptured) {
          e.stopPropagation && e.stopPropagation();
        }
      }, { capture: true });

    } catch (err) {}
  });
}

restartBtn.addEventListener("click", () => {
  const code = editor.getValue();
  createFrame(code);
});


fetch("sketch.js")
  .then(r => r.text())
  .then(code => {
    editor.setValue(code);
    currentCode = code;
    lastSavedCode = code;
    createFrame(code);
  });

editor.on("change", () => {
  isDirty = true;

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    createFrame(editor.getValue());
  }, 150);
});

window.addEventListener("beforeunload", function (e) {
  if (!isDirty) return;

  e.preventDefault();
  e.returnValue = "";
});