const api = "https://api.datamuse.com/words?"; // Wörter

const count = 6;
const textColor = 0x777777;
const activeColor = 0xffffff;

const startingWord = "Kaffee";

//pixi initialisierung
const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, backgroundColor: 0x000000, antialias: true });
app.renderer.autoResize = true;

//in html einbetten
document.body.appendChild(app.view);

//graphics ist zum zeichnen von Linien
const graphics = new PIXI.Graphics();

//Startwort 
var word = new PIXI.Text(startingWord, { fontFamily: 'Raleway', fontSize: 32, fill: activeColor, align: 'center' });
word.anchor.y = 0.5;
word.x = 50;
word.y = app.renderer.height / 2;

//word und graphics in die stage packen
app.stage.addChild(word);
app.stage.addChild(graphics);

getRelated(word);

function getRelated(element) {

    let request = api + "rel_bga=" + element.text + "&max=" + count;

    fetch(request)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {

            //Loop läuft einmal für jedes vorgeschlagene Wort
            for (let i = 0; i < myJson.length; i++) {

                //neues Wort erstellen:
                let word = new PIXI.Text(myJson[i].word, { fontFamily: 'Raleway', fontSize: 32, fill: textColor, align: 'left' });

                let width = element.getBounds().width;
                let height = element.getBounds().height
                let y = element.y - height * count / 2;

                word.x = element.x + width + 100;
                word.y = y + height * i;
                word.anchor.y = 0.5;
                word.interactive = true;
                word.buttonMode = true;


                //Interaktions funktionen definieren
                word.on('mouseover', function () {
                    word.style.fill = activeColor;
                });
                word.on('mouseout', function () {
                    if (!word.chosen) {
                        word.style.fill = textColor;
                    }
                });
                word.on('pointerdown', function () {
                    if (!word.chosen) {
                        word.style.fill = activeColor;
                        graphics.lineStyle(4, activeColor);
                        graphics.moveTo(element.x + width + 10, element.y);
                        graphics.lineTo(word.x - 10, word.y);
                        getRelated(word)
                        word.chosen = true;
                    }
                });

                //Wort in stage
                app.stage.addChild(word);
            }


        });
}