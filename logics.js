const FPS = 40; // кадров в секунду
const FRICTION = 0.7; // коэффициент трения пространства
const ASTEROIDS_NUM = 3; // стартовое количество астероидов
const ASTEROIDS_SPEED = 50; //максимальная стартовая скорость астероидов пикселей в секунду
const ASTEROIDS_SIZE = 100; // стартовый размер астероидов в пикселях
const ASTEROIDS_VERTEX = 10; // среднее количество вершин астероидов
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

//Астероиды
var asteroids = [];
createAsteroids();

// установка событий
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// установка игрового цикла
setInterval(update, 1000 / FPS);

// заполнение массива с астероидами
function createAsteroids() {
    asteroids = [];
    var x, y;
    for (var i = 0; i < ASTEROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y))
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// создание одного астероида
function newAsteroid(x, y) {
    var asteroid = {
        x: x,
        y: y,
        xV: Math.random() * ASTEROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        yV: Math.random() * ASTEROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: ASTEROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2, // в радианах
        vertex: Math.floor(Math.random() * (ASTEROIDS_VERTEX + 1) + ASTEROIDS_VERTEX / 2)
    };
    return asteroid;
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch (ev.keyCode) {
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
    switch (ev.keyCode) {
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
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        //рисуем след от двигателя
        context.fillStyle = "aqua";
        context.strokeStyle = "blue";
        context.lineWidth = SHIP_SIZE / 10;
        context.beginPath();
        context.moveTo( // левый край
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        context.lineTo( // центр
            ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
        );
        context.lineTo( // правый край
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        context.closePath();
        context.fill();
        context.stroke();

    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // рисуем треугольный корабль
    context.strokeStyle = "white";
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

    // рисуем астероиды
    context.strokeStyle = "slategrey";
    context.lineWidth = SHIP_SIZE / 20;
    var x, y, r, a, vertex;
    for (var i = 0; i < asteroids.length; i++) {
        // свойства астероида
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vertex = asteroids[i].vertex;

        // рисуем путь
        context.beginPath();
        context.moveTo(
            x + r * Math.cos(a),
            y + r * Math.sin(a)
        );

        // рисуем многоугольник
        for (var j = 0; j < vertex; j++) {
            context.lineTo(
                x + r * Math.cos(a + j * Math.PI * 2 / vertex),
                y + r * Math.sin(a + j * Math.PI * 2 / vertex)
            )
        }
        context.closePath();
        context.stroke();

        // движение астероида

        // соприкосновение с краем экрана

    }
    // поворот корабля
    ship.a += ship.rot

    // движение корабля
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // соприкосновение с краем экрана
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 + ship.r;
    }

    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 + ship.r;
    }

    //центральная точка
    context.fillStyle = "red";
    //context.fillRect(ship.x - 1, ship.y - 1, 2, 2);

}