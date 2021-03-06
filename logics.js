const FPS = 60; // кадров в секунду
const FRICTION = 0.7; // коэффициент трения пространства
const ASTEROIDS_NUM = 3; // стартовое количество астероидов
const ASTEROIDS_JAG = 0.4; // острота астероидов
const ASTEROIDS_SPEED = 50; //максимальная стартовая скорость астероидов пикселей в секунду
const ASTEROIDS_SIZE = 100; // стартовый размер астероидов в пикселях
const ASTEROIDS_VERTEX = 10; // среднее количество вершин астероидов
const SHIP_SIZE = 30; // высота корабля в пикселях 
const SHIP_THRUST = 5; // ускорение корабля пикселей в секунду
const TURN_SPEED = 360; // скорость поворота градусов в секунду
const SHOW_CENTER_DOT = false; // показать центральную точку
const SHOW_BOUNDING = false; // показать ограничение столкновения
const SHIP_EXPLODE_DURATION = 0.3; //длительность взрыва корабля в секундах
const SHIP_INV_DURATION = 3; //длительность невидимости корабля в секундах
const SHIP_BLINK_DURATION = 0.1; //длительность мигания невидимости корабля в секундах
const LASER_MAX = 10; //максимальное количество лазеров на экране
const LASER_SPEED = 500; //скорость лазеров в пикселях на секунду
const LASER_DIST = 0.6; //максимальное растояние прохождение лазеров
const LASER_EXPLODE_DURATION = 0.1; //длительность взрыва лазера в секундах


var canvas = document.getElementById("gameCanvas"); // ссылка на элемент по его ID
var context = canvas.getContext("2d"); // контекст рисования на холсте

var ship = newShip();

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
    // создание массива из астероидов
    for (var i = 0; i < ASTEROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
            // буфферная зона
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 2)));
    }
}

function destroyAsteroid(index) {
    var x = asteroids[index].x;
    var y = asteroids[index].y;
    var r = asteroids[index].r;

    //разделение астероида на 2 если необходимо
    if (r == Math.ceil(ASTEROIDS_SIZE / 2)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
    } else if (r == Math.ceil(ASTEROIDS_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
    }

    //уничтожение астероида
    asteroids.splice(index, 1);

}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    ship.explodeTime = Math.ceil(FPS * SHIP_EXPLODE_DURATION);
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch (ev.keyCode) {
        case 32: // пробел (выстрел корабля)
            shootLaser();
            break;
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
        case 32: // пробел (ещё один выстрел корабля)
            ship.canShoot = true;
            break;
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

// создание одного астероида
function newAsteroid(x, y, r) {
    var asteroid = {
        x: x,
        y: y,
        xV: Math.random() * ASTEROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        yV: Math.random() * ASTEROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        explodeTime: 0,
        a: Math.random() * Math.PI * 2, // в радианах
        vertex: Math.floor(Math.random() * (ASTEROIDS_VERTEX + 1) + ASTEROIDS_VERTEX / 2),
        offset: []
    };

    // смещение вершин
    for (var i = 0; i < asteroid.vertex; i++) {
        asteroid.offset.push(Math.random() * ASTEROIDS_JAG * 2 + 1 - ASTEROIDS_JAG);
    }
    return asteroid;
}

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // конвертируем в радианы
        blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
        blinkNum: Math.ceil(SHIP_INV_DURATION / SHIP_BLINK_DURATION),
        canShoot: true,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    //создание лазера
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ //выстрел из коничка корабля
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPEED * Math.cos(ship.a) / FPS,
            yv: -LASER_SPEED * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    //предотвращение стрельбы
    ship.canShoot = false;
}

function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0; //ноль означает,что корабль взрывается
    //рисуем космос
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    //тяга корабля
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        //рисуем след от двигателя
        if (!exploding && blinkOn) {
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
        }
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // рисуем треугольный корабль
    if (!exploding) {
        if (blinkOn) {
            context.strokeStyle = "lime";
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
        }
        //моргание корабля
        if (ship.blinkNum > 0) {
            //уменьшение времени миганий
            ship.blinkTime--;
            //уменьшение количества миганий
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DURATION * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        //рисуем взрыв
        context.fillStyle = "darkred";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "red";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "orange";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "yellow";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "white";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        context.fill();
    }

    if (SHOW_BOUNDING) {
        context.strokeStyle = "white";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        context.stroke();
    }

    // рисуем астероиды
    var x, y, r, a, vertex, offset;
    for (var i = 0; i < asteroids.length; i++) {
        context.strokeStyle = "slategrey";
        context.lineWidth = SHIP_SIZE / 20;
        // свойства астероида
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vertex = asteroids[i].vertex;
        offset = asteroids[i].offset;

        // рисуем путь
        context.beginPath();
        context.moveTo(
            x + r * offset[0] * Math.cos(a),
            y + r * offset[0] * Math.sin(a)
        );

        // рисуем многоугольник
        for (var j = 1; j < vertex; j++) {
            context.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / vertex),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / vertex)
            )
        }
        context.closePath();
        context.stroke();

        if (SHOW_BOUNDING) {
            context.strokeStyle = "white";
            context.beginPath();
            context.arc(x, y, r, 0, Math.PI * 2, false);
            context.stroke();
        }
    }

    //центральная точка
    if (SHOW_CENTER_DOT) {
        context.fillStyle = "red";
        context.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    //рисуем лазеры
    for (var i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            context.fillStyle = "salmon";
            context.beginPath();
            context.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            context.fill();
        } else {
            //рисуем взрыв
            context.fillStyle = "orangered";
            context.beginPath();
            context.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            context.fill();
            context.fillStyle = "salmon";
            context.beginPath();
            context.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            context.fill();
            context.fillStyle = "pink";
            context.beginPath();
            context.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            context.fill();
        }
    }

    //обнаружение столкновения лазеров с астероидами
    var ax, ay, ar, lx, ly;
    for (var i = asteroids.length - 1; i >= 0; i--) {
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;

        for (var j = ship.lasers.length - 1; j >= 0; j--) {
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            //обнаружение столкновения
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                //разрушение астероида и активация взрыва лазера
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DURATION * FPS);
                break;
            }
        }
    }

    if (!exploding) {
        if (ship.blinkNum == 0) {
            // проверка на столкновения
            for (var i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        // поворот корабля
        ship.a += ship.rot;

        // движение корабля
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;

        if (ship.explodeTime == 0) {
            ship = newShip()
        }

    }
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

    //движение лазера
    for (var i = ship.lasers.length - 1; i >= 0; i--) {
        //проверка расстояния
        if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;
            //уничтожение лазера
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers[i].splice(i, 1);
                continue;
            }
        } else {
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            //вычисление расстояния
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        // соприкосновение с краем экрана
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        } else if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
    }

    // вынес движени астероидов для дальнейшего развития столкновения
    for (var i = 0; i < asteroids.length; i++) {
        // движение астероида
        asteroids[i].x += asteroids[i].xV;
        asteroids[i].y += asteroids[i].yV;

        // соприкосновение с краем экрана
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if (asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r
        }

        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        } else if (asteroids[i].y > canvas.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r
        }
    }
}