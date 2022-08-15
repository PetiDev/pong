Object.prototype.sort = function bubbleSort(callback) {
    const obj = this

    let keys = Object.keys(obj)
    let values = Object.values(obj)

    let len = values.length;
    let checked;
    do {
        checked = false;
        for (let i = 0; i < len; i++) {
            if (callback(values[i], values[i + 1])) {
                let tmp = values[i];
                values[i] = values[i + 1];
                values[i + 1] = tmp;

                let tmpKeys = keys[i]
                keys[i] = keys[i + 1];
                keys[i + 1] = tmpKeys;

                checked = true;
            }
        }
    } while (checked);

    let newObj = {}

    for (let i = 0; i < keys.length; i++) {
        newObj[keys[i]]=values[i]
    }
    return newObj;
};// https://gist.github.com/PetiDev/c5ce84fc5269bb1bda32c4cbce9391f5

const canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")
canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight
const userName = document.getElementById("username")

let step = 2
let score = 0
let inGame = true
let keysActive = {}
let game;
let leftBar
let rightBar
let ball

const cssRoot = getComputedStyle(document.querySelector(":root"))
const light = cssRoot.getPropertyValue("--clr-light")
const dark = cssRoot.getPropertyValue("--clr-darker")
const red = cssRoot.getPropertyValue("--clr-secondary")
const blue = cssRoot.getPropertyValue("--clr-blue")


const scoreboard = document.getElementById("scoreboard")
let scores = localStorage.getItem("scoreboard")
scores = ( scores )? JSON.parse(scores) : {"--":0}
scores = scores.sort((a, b)=> a < b)

function die() {
    ctx.font = "3rem Gill Sans";
    ctx.fillText("you lost", 40, canvas.height / 1.5)
    ctx.font = "1.5rem Gill Sans";
    ctx.fillText("You’re never a loser until you quit trying.", 40, canvas.height / 1.5 + 45)
    clearInterval(game);


    let l = document.createElement("li")
    let n = document.createElement("p")
    let s = document.createElement("p")

    n.innerText = userName.value
    n.style.display = "inline-block"
    s.innerText = `[${score}]`
    s.style.display = "inline-block"
    
    l.appendChild(n)
    l.appendChild(s)
    scoreboard.appendChild(l)


    if(scores[userName.value]){
        if(scores[userName.value] < score) scores[userName.value] = score;
    } else {
        scores[userName.value] = score;
    } 


    localStorage.setItem("scoreboard",JSON.stringify(scores))
}

function restoreScoreboard() {


    Object.keys(scores).forEach((key)=>{
        let l = document.createElement("li")
        let n = document.createElement("p")
        let s = document.createElement("p")

        n.innerText = key
        s.innerText = `[${scores[key]}]`

        s.style.display = "inline-block"
        n.style.display = "inline-block"
        
        l.appendChild(n)
        l.appendChild(s)
        scoreboard.appendChild(l)
    })
}
restoreScoreboard()


function gainScore(){
    score++

    step = 12 * Math.sin(Math.min(100, score) / 100 * (Math.PI / 2)) + 2;
}


class Bar {
    width = 25
    height = 100

    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
    }


    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.closePath();

    }

    move(direction, amount) {
        switch (direction) {
            case "up":
                if (this.y >= 0) this.y = this.y - amount
                break;

            case "down":
                if (this.y <= canvas.height - this.height) this.y = this.y + amount
                break;

            default:
                break;
        }
    }
}
class Ball {
    radius = 10
    directionX = 1
    directionY = 1

    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
    }

    move() {
        this.x += this.directionX * step
        this.y += this.directionY * step

        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.bounce("x")
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.bounce("y")
        }

        if (this.x - this.radius <= leftBar.x + leftBar.width
            && this.y + this.radius >= leftBar.y
            && this.y - this.radius <= leftBar.y + leftBar.height) {

            this.bounce("x")
            this.x = leftBar.width + this.radius
            gainScore()

        }
        if (this.x + this.radius >= rightBar.x
            && this.y + this.radius >= rightBar.y
            && this.y - this.radius <= rightBar.y + rightBar.height) {
            this.bounce("x")
            this.x = this.x - this.radius / 2
            gainScore()

        }


        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            inGame = false
        }

    }

    bounce(wall) {
        if (wall == "x") {
            this.directionX = this.directionX * -1
        } else {
            this.directionY = this.directionY * -1
        }
    }
}





ctx.fillStyle = dark
ctx.font = "3rem Comic Sans MS";
ctx.fillText("Super", canvas.width / 3, canvas.height / 2 - 75)
ctx.fillText("Professional", canvas.width / 3, canvas.height / 2 - 30)
ctx.fillText("Pong", canvas.width / 3, canvas.height / 2 + 15)
ctx.fillText("Game", canvas.width / 3, canvas.height / 2 + 60)
    


function play() {
    if(game)return;
    score = 0
    step = 2
    inGame = true
    keysActive = {}
    leftBar = new Bar(0, 0, red)
    rightBar = new Bar(canvas.clientWidth - leftBar.width, 0, dark)
    ball = new Ball(100, 120, blue)

    game = setInterval(() => {
    ctx.fillStyle = dark
    ctx.font = "3rem Gill Sans";

    if (!inGame) {
        return die()
    }

    //clear scr
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //game
    ctx.fillText(score, canvas.width / 2, canvas.height / 2)
    leftBar.draw()
    rightBar.draw()
    ball.draw()
    ball.move()




    //movement
    if (keysActive.o) {
        rightBar.move("up", step)
    }
    if (keysActive.l) {
        rightBar.move("down", step)
    }
    if (keysActive.w) {
        leftBar.move("up", step)
    }
    if (keysActive.s) {
        leftBar.move("down", step)
    }
    ////////////////////



}, 1000 / 144)

}


document.addEventListener("keydown", ({ key }) => {
    keysActive[key] = true;
})
document.addEventListener("keyup", ({ key }) => {
    keysActive[key] = false
})



