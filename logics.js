const FPS = 40; // кадров в секунду
const FRICTION = 0.7; // коэффициент трения пространства
const SHIP_SIZE = 30; // высота корабля в пикселях 
const SHIP_THRUST = 5; // ускорение корабля пикселей в секунду
const TURN_SPEED = 360; // скорость поворота градусов в секунду

var canvas = document.getElementById("gameCanvas"); // ссылка на элемент по его ID
var context = canvas.getContext("2d"); // контекст рисования на холсте

var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // конвертируем в радианы
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// установка событий
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// установка игрового цикла
setInterval(update, 1000 / FPS);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // левая стрелка (поворот корабля влево)
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // стрелка вверх (движение вперед)
            ship.thrusting = true;
            break;
        case 39: // правая стрелка (поворот корабля вправо)
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // левая стрелка (остановка поворота корабля влево)
            ship.rot = 0;
            break;
        case 38: // стрелка вверх (остановка движения вперед)
            ship.thrusting = false;
            break;
        case 39: // правая стрелка (остановка поворота корабля вправо)
            ship.rot = 0;
            break;
    }
}

function update() {
    // рисуем космос
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    //тяга корабля
    if(ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // рисуем треугольный корабль
    context.strokeStyle = "yellow";
    context.lineWidth = SHIP_SIZE / 20;
    context.beginPath();
    context.moveTo( // кончик корабля
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    context.lineTo( // корма слева
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    context.lineTo( // корма справа
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    context.closePath();
    context.stroke();

    // поворот корабля
    ship.a += ship.rot

    // движение корабля
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    //центральная точка
    context.fillStyle = "red";
    context.fillRect(ship.x - 1, ship.y - 1, 2, 2);

}