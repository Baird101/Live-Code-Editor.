var setup = function(){
    createCanvas(600,600);
}
var verts = [];
draw = function(){
    strokeJoin(ROUND);
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
};