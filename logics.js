const FPS = 30;

var canvas = document.getElementById("gameCanvas"); //ссылка на элемент по его ID
var context = canvas.getContext("2d"); //контекст рисования на холсте

//установка игрового цикла
setInterval(update, 1000 / FPS);

function update() {
    //рисуем космос
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //рисуем корабль

    //поворот корабля

    //движение корабля

}