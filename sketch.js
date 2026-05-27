var setup = function(){
    rectMode(CENTER);
    createCanvas(600,600);
    g = createGraphics(600,600);
    g.noStroke();
    g.rectMode(CENTER);
    g.fill(70,70,70);
    g.rect(300,300,300,300);
    fill(0,0,0);
	rect(300,300,200,200);
	ground = get(0,0,600,600);
}
var verts = [];
draw = function(){
    strokeJoin(ROUND);
    imageMode(CENTER);
    background(0);
    noStroke();
    fill(255,0,0);
    beginShape();
    	for(var i = 0; i < verts.length; i++){
            var v = verts[i];
        	vertex(v.x,v.y);
        }
        if(mouseIsPressed){
            verts.push({x:mouseX,y:mouseY});
        }
    endShape(CLOSE);
    if(keyIsPressed && keyCode === 32 && verts.length > 0){
        verts.splice(verts.length-1,1);
    }
    background(255,0,0);
    pushMatrix();
    	translate(300,300);
    	rotate(frameCount/100);
    	fill(30,30,30);
		rect(0,0,400,400);
    	image(g,0,0);
    	image(ground,0,0);
    popMatrix();
};