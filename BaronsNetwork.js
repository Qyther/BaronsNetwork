class BaronsMatrix {
  constructor(a,b) {
    this.r=a;
    this.c=b;
    this.d=Array(a).fill().map(()=>Array(b).fill(0));
  }
  static array(a) {
    return new BaronsMatrix(a.length,1).map((e,i)=>a[i]);
  }
  static sub(a,b) {
    if(a.r!==b.r||a.c!==b.c) return console.log("A's size doesn't match B's");
    return new BaronsMatrix(a.r,a.c).map((_,i,j)=>a.d[i][j]-b.d[i][j]);
  }
  array() {
    var arr=[];
    for(var i=0;i<this.r;i++) {
      for(var j=0;j<this.c;j++) {
        arr.push(this.d[i][j]);
      }
    }
    return arr;
  }
  randomize() {
    return this.map(e=>Math.random()*2-1);
  }
  copy() {
    var m=new BaronsMatrix(this.r,this.c);
    for(var i=0;i<this.r;i++) {
      for(var j=0;j<this.c;j++) {
        m.d[i][j]=this.d[i][j];
      }
    }
    return m;
  }
  add(a) {
    if(a instanceof BaronsMatrix) {
      if(this.r!==a.r||this.c!==a.c) return console.log("A's size doesn't match B's");
      return this.map((e,i,j)=>e+a.d[i][j]);
    }
    return this.map(e=>e+n);
  }
  static transpose(a) {
    return new BaronsMatrix(a.c,a.r).map((_,i,j)=>a.d[j][i]);
  }
  static mult(a,b,c) {
    if(a.c!==b.r) return console.log("A's size doesn't match B's"+c);
    return new BaronsMatrix(a.r,b.c).map((e,i,j)=>{
      var sum=0;
      for(var k=0;k<a.c;k++) {
        sum+=a.d[i][k]*b.d[k][j];
      }
      return sum;
    });
  }
  mult(a) {
    if(a instanceof BaronsMatrix) {
      if(this.r!==a.r||this.c!==a.c) return console.log("A's size doesn't match B's");
      return this.map((e,i,j)=>e*a.d[i][j]);
    }
    return this.map(e=>e*a);
  }
  static load(a) {
    if(typeof a==="string") a=JSON.parse(a);
    var m=new BaronsMatrix(a.r,a.c);
    m.d=a.d;
    return m;
  }
  string() {
    return JSON.stringify(this);
  }
  //-... .- .-. --- -.
  map(a) {
    for(var i=0;i<this.r;i++) {
      for(var j=0;j<this.c;j++) {
        var v=this.d[i][j];
        this.d[i][j]=a(v,i,j);
      }
    }
    return this;
  }
  static map(a,b) {
    return new BaronsMatrix(a.r,a.c).map((e,i,j)=>b(a.d[i][j],i,j));
  }
}
class acf {
  constructor(f,d) {
    this.f=f;
    this.d=d;
  }
}
var sigmoid=new acf(x=>1/(1+Math.exp(-x)),y=>y*(1-y));
var tanh=new acf(x=>Math.tanh(x),y=>1-(y*y));
class BaronsNetwork {
  constructor(a) {
    this.arch=a;
    this.lay=[];
    for(var i=0;i<this.arch.length-1;i++) {
      this.lay.push(new BaronsNetworkLayer(this,this.arch[i],this.arch[i+1]));  
    }
    this.lr=.1;
    this.ac=sigmoid;
  }
  think(a) {
    var inp=BaronsMatrix.array(a);
    var tho=inp;
    for(var i=0;i<this.lay.length;i++) {
      tho=this.lay[i].think(tho); 
    }
    return tho.array();
  }
  train(a,b) {
    var inp=BaronsMatrix.array(a);
    var tar=BaronsMatrix.array(b);
    var thos=[];
    var tho=inp;
    for(var i=0;i<this.lay.length;i++) {
      tho=this.lay[i].think(tho);
      thos.push(tho);
    }
    var out=thos[thos.length-1];
    var curerr=BaronsMatrix.sub(tar,out);
    for(var i=this.lay.length-1;i>=0;i--) {
      if(i===0) curerr=this.lay[i].moldValues(thos[i],inp,curerr);
      else curerr=this.lay[i].moldValues(thos[i],thos[i-1],curerr);
    }
  }
  distortValues(a,b) {
      for(var i=0;i<this.lay.length;i++) {
          var dis=this.lay[i];
          dis.distortWeights(a,b);
      }
  }
  string() {
    var cac=[];
    var res=JSON.stringify(this,(key,val)=>{
       if(typeof val==="object"&&val!==null) {
          if(cac.indexOf(val)!==-1) return;
          cac.push(val);
       }
       return val;
    });
    return res;
  }
  static load(a) {
    if(typeof a==="string") a=JSON.parse(a);
    var n=new BaronsNetwork(a.arch);
    var laycac=[];
    a.lay.map(e=>{
        var nlay=new BaronsNetworkLayer(n,e.w.c,e.w.r);
        nlay.w=BaronsMatrix.load(JSON.parse(JSON.stringify(e.w)));
        nlay.b=BaronsMatrix.load(JSON.parse(JSON.stringify(e.b)));
        laycac.push(nlay);
    });
    n.lay=laycac;
    return n;
  }
}
class BaronsNetworkLayer {
  constructor(a,b,c) {
    this.p=a;
    this.w=new BaronsMatrix(c,b);
    this.w.randomize();
    this.b=new BaronsMatrix(c,1);
    this.b.randomize();
  }
  think(a) {
    var tho=BaronsMatrix.mult(this.w,a);
    tho.add(this.b);
    tho.map(this.p.ac.f);
    return tho;
  }
  distortWeights(a,b) {
      this.w.map(x=>{
            if (Math.random() < a) {
                var offset = (Math.random()*2-1)*b;
                var newx = x + offset;
                return newx;
            } else return x;
      });
  }
  moldValues(a,b,c) {
    var gra=BaronsMatrix.map(a,this.p.ac.d);
    gra.mult(c);
    gra.mult(this.p.lr);
    var prethot=BaronsMatrix.transpose(b);
    var weid=BaronsMatrix.mult(gra,prethot);
    this.w.add(weid);
    this.b.add(gra);
    var weit=BaronsMatrix.transpose(this.w);
    c=BaronsMatrix.mult(weit,c);
    return c;
  }
}
