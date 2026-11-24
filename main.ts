import{mkdirSync as M,readdirSync as R,readFileSync as F,writeFileSync as W}from"node:fs";
import{join as j}from"node:path";
const I=process.env.MAKEFUN_INPUT_DIR??"/input",O=process.env.MAKEFUN_OUTPUT_DIR??"/output";
function run(p,q){
const n=p.length,D=new Int32Array(256);let sp=0;const C=new Int32Array(64);let cp=0;const M=new Int32Array(256),out=new Uint8Array(65536);let ol=0,ip=0,pc=0,st=0;
const K=c=>[out.subarray(0,ol),c];
for(;;){
if(st===1e6)return K(10);
if(pc<0||pc>=n)return K(9);
const o=p[pc],im=o===1?1:o===2?4:o>=48&&o<=51?2:0;
if(pc+im>=n)return K(9);
st++;
const nx=pc+1+im;
pc=nx;
switch(o){
case 0:return K(0);
case 1:if(sp>255)return K(3);D[sp++]=(p[nx-1]<<24)>>24;break;
case 2:if(sp>255)return K(3);D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
case 3:if(sp<1)return K(2);sp--;break;
case 4:if(sp<1)return K(2);if(sp>255)return K(3);D[sp]=D[sp-1];sp++;break;
case 5:{if(sp<2)return K(2);const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;break;}
case 6:if(sp<2)return K(2);if(sp>255)return K(3);D[sp]=D[sp-2];sp++;break;
case 7:{if(sp<3)return K(2);const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break;}
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{if(sp<2)return K(2);const b=D[sp-1],a=D[sp-2];if(o>=19&&o<=22&&b===0)return K(4);const r=o===16?(a+b)|0:o===17?(a-b)|0:o===18?Math.imul(a,b):o===19?a===-2147483648&&b===-1?a:(a/b)|0:o===20?b===-1?0:a%b|0:o===21?Math.floor((a>>>0)/(b>>>0))|0:o===22?(a>>>0)%(b>>>0)|0:o===24?a&b:o===25?a|b:o===26?a^b:o===28?a<<(b&31):o===29?a>>(b&31):o===30?(a>>>(b&31))|0:o===32?a===b?1:0:o===33?a<b?1:0:(a>>>0)<(b>>>0)?1:0;sp-=2;D[sp++]=r;break;}
case 23:if(sp<1)return K(2);D[sp-1]=-D[sp-1]|0;break;
case 27:if(sp<1)return K(2);D[sp-1]=~D[sp-1];break;
case 48:pc=nx+(((p[nx-2]|p[nx-1]<<8)<<16)>>16);break;
case 49:case 50:{if(sp<1)return K(2);const v=D[--sp];if((o===49)===(v===0))pc=nx+(((p[nx-2]|p[nx-1]<<8)<<16)>>16);break;}
case 51:if(cp===64)return K(7);C[cp++]=nx;pc=p[nx-2]|p[nx-1]<<8;break;
case 52:if(cp===0)return K(8);pc=C[--cp];break;
case 64:{if(sp<1)return K(2);const a=D[sp-1];if(a<0||a>255)return K(6);D[sp-1]=M[a];break;}
case 65:{if(sp<2)return K(2);const a=D[sp-1],v=D[sp-2];if(a<0||a>255)return K(6);sp-=2;M[a]=v;break;}
case 80:{if(sp<1)return K(2);const s=String(D[sp-1]);if(ol+s.length>65536)return K(11);sp--;for(let i=0;i<s.length;i++)out[ol++]=s.charCodeAt(i);break;}
case 81:if(sp<1)return K(2);if(ol+1>65536)return K(11);out[ol++]=D[--sp]&255;break;
case 82:if(sp>255)return K(3);D[sp++]=ip<q.length?q[ip++]:-1;break;
case 83:if(sp<1)return K(2);return K(D[--sp]&255);
default:return K(5);
}
}
}
for(const d of R(I).sort()){let p;try{p=F(j(I,d,"program.bin"))}catch{continue}let q;try{q=F(j(I,d,"input.bin"))}catch{q=Buffer.alloc(0)}const[o,x]=run(p,q);M(j(O,d),{recursive:!0});W(j(O,d,"stdout.bin"),o);W(j(O,d,"exit.txt"),""+x)}
