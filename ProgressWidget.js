// === CONFIGURAÇÕES ===
// Para mudar o nome ou cor de cada item, edite o campo `nome` e `cor` abaixo
let widgets = [
  { cor: "#00FA9A", nome: "Item 1", arquivo: "dadosItem1.json" },
  { cor: "#FFA500", nome: "Item 2", arquivo: "dadosItem2.json" },
  { cor: "#800080", nome: "Item 3", arquivo: "dadosItem3.json" },
  { cor: "#0000FF", nome: "Item 4", arquivo: "dadosItem4.json" },
  { cor: "#FF69B4", nome: "Item 5", arquivo: "dadosItem5.json" },
  { cor: "#DC143C", nome: "Item 6", arquivo: "dadosItem6.json" },
  { cor: "#008B8B", nome: "Item 7", arquivo: "dadosItem7.json" },
  { cor: "#FFD700", nome: "Item 8", arquivo: "dadosItem8.json" },
  { cor: "#ADFF2F", nome: "Item 9", arquivo: "dadosItem9.json" },
  { cor: "#1E90FF", nome: "Item 10", arquivo: "dadosItem10.json" },
];

let configAtual = widgets[0]; // Altere o índice de 0 a 9 conforme o item desejado

const filePath = FileManager.local().joinPath(
  FileManager.local().documentsDirectory(),
  configAtual.arquivo
);
const daysToShow = 15;
const spaceBetweenDays = 44.5;

const widgetWidth = 720;
const widgetHeight = 338;
const graphLow = 280;
const graphHeight = 160;

const lineWeight = 2;
const vertLineWeight = 0.5;

let accentColor = new Color(configAtual.cor);
const verticalLineColor = new Color("#808080");
const backgroundColor = new Color("#000000");
const textColor = Color.white();

const titleFont = Font.semiboldSystemFont(36);
const casesFont = Font.systemFont(22);
const dayFont = Font.systemFont(22);

let pesos = [];

// === LER DADOS ===
if (FileManager.local().fileExists(filePath)) {
  try {
    pesos = JSON.parse(FileManager.local().readString(filePath));
  } catch (e) {
    pesos = [];
  }
}

// === MODO APP: INTERAÇÃO ===
if (!config.runsInWidget) {
  let menu = new Alert();
  menu.title = `${configAtual.nome}`;
  menu.addAction("Adicionar valor");
  menu.addDestructiveAction("Zerar gráfico");
  menu.addCancelAction("Cancelar");

  let escolha = await menu.present();

  if (escolha === 0) {
    let input = new Alert();
    input.title = "Digite o valor usado hoje:";
    input.addTextField("Ex: 22");
    input.addAction("OK");
    input.addCancelAction("Cancelar");
    let r = await input.presentAlert();

    if (r === 0) {
      let valor = parseInt(input.textFieldValue(0));
      if (!isNaN(valor)) {
        pesos.push(valor);
        if (pesos.length > daysToShow) pesos.shift();
        FileManager.local().writeString(filePath, JSON.stringify(pesos));
      }
    }
    Script.complete();
    return;
  } else if (escolha === 1) {
    pesos = [];
    FileManager.local().writeString(filePath, JSON.stringify(pesos));
    Script.complete();
    return;
  } else {
    Script.complete();
    return;
  }
}

// === WIDGET ===
let ctx = new DrawContext();
ctx.size = new Size(widgetWidth, widgetHeight);
ctx.opaque = false;

let min = Math.min(...pesos, 0);
let max = Math.max(...pesos, 1);
let diff = max - min || 1;

ctx.setTextAlignedCenter();

for (let i = 0; i < pesos.length; i++) {
  let peso = pesos[i];
  let delta = (peso - min) / diff;

  if (i < pesos.length - 1) {
    let nextDelta = (pesos[i + 1] - min) / diff;
    let p1 = new Point(
      spaceBetweenDays * i + 50,
      graphLow - graphHeight * delta
    );
    let p2 = new Point(
      spaceBetweenDays * (i + 1) + 50,
      graphLow - graphHeight * nextDelta
    );
    drawLine(ctx, p1, p2, lineWeight, accentColor);
  }

  let v1 = new Point(spaceBetweenDays * i + 50, graphLow - graphHeight * delta);
  let v2 = new Point(spaceBetweenDays * i + 50, graphLow);
  drawLine(ctx, v1, v2, vertLineWeight, verticalLineColor);

  let pesoRect = new Rect(
    spaceBetweenDays * i + 20,
    graphLow - 40 - graphHeight * delta,
    60,
    24
  );
  drawText(ctx, peso.toString(), pesoRect, textColor, casesFont);

  let diaRect = new Rect(spaceBetweenDays * i + 27, graphLow + 10, 50, 24);
  drawText(ctx, (i + 1).toString(), diaRect, textColor, dayFont);
}

drawText(
  ctx,
  configAtual.nome,
  new Rect(25, 20, 300, 40),
  textColor,
  titleFont
);

let widget = new ListWidget();
widget.backgroundColor = backgroundColor;
widget.backgroundImage = ctx.getImage();
widget.setPadding(0, 0, 0, 0);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();

// === FUNÇÕES ===
function drawText(ctx, text, rect, color, font) {
  ctx.setFont(font);
  ctx.setTextColor(color);
  ctx.drawTextInRect(text.toString(), rect);
}

function drawLine(ctx, p1, p2, width, color) {
  const path = new Path();
  path.move(p1);
  path.addLine(p2);
  ctx.addPath(path);
  ctx.setStrokeColor(color);
  ctx.setLineWidth(width);
  ctx.strokePath();
}
