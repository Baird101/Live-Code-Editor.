var setup = function(){
    createCanvas(600,600);
}
var verts = [];
mouseReleased = function(){
   	verts.push({x:mouseX,y:mouseY});
};
draw = function(){
    strokeJoin(ROUND);b
    background(0);
    stroke(255,0,0);
    noFill();
    beginShape();
    	for(var i = 0; i < verts.length; i++){
            var v = verts[i];
        	vertex(v.x,v.y);
        }
    endShape();
    if(keyIsPressed && keyCode === 32 && verts.length > 0){
        verts.splice(verts.length,1);
    }
};
