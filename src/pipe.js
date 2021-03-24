class Pipe {
    constructor() {
        this.spacing=143;
        this.top = random((height - this.spacing));
        this.bottom = this.top+this.spacing;
        this.pos= random
        this.x = width;
        this.w = 60;
        this.speed = 2;
        this.hasHit = false;
        this.flag=0;
    }

    show() {
        fill(255);
        if (this.hasHit) {
            image(pipeTopHasHit, this.x, 0, this.w, this.top);
            image(pipeBottomHasHit, this.x, this.bottom, this.w, height);
        } else {
            image(pipeTop, this.x, 0, this.w, this.top);
            image(pipeBottom, this.x, this.bottom, this.w, height);
        }
        
    }

    update() {
        this.x -= this.speed;
        
    }

    offscreen() {

        if (this.x < -this.w)
            return true;
        else
            return false;
    }
    score(bird){
        if(this.flag==0){
            if(this.x<bird.x){
                this.flag=1;
                return true;    
            }
            
        }
        return false;
    }
    stop(){
        this.speed=0;
    }
    hit(bird, height) {

        if (bird.y - bird.r/2 < this.top || bird.y + bird.r/2 > (this.bottom))
            if (bird.x > this.x && bird.x < this.x + this.w) {
                // console.log(bird.y);
                // console.log(height);
                // console.log(this.bottom);
                this.hasHit = true;
                return true;
            }
        this.hasHit = false;
        return false;
    }

}