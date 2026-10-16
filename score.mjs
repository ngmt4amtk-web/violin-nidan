import {STRINGS,signatureAlteration} from './content.mjs';
import {TIME_DIGITS} from './time-glyphs.mjs';
import {CLEF_PATH,SHARP_PATH,FLAT_PATH,NATURAL_PATH,NOTEHEAD_PATH,WHOLE_PATH,HALF_PATH,FLAG_UP_PATH,FLAG_DOWN_PATH,REST_WHOLE_PATH,REST_HALF_PATH,REST_QUARTER_PATH,REST_EIGHTH_PATH} from './glyphs.mjs';

export function escapeHTML(value){return String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
// 本文の音楽記号にも共有Bravuraの輪郭を使う。OSの代替フォントに依存しない。
export function musicText(value){
 return replaceMusicText(escapeHTML(value));
}
function replaceMusicText(value){
 return value.replace(/(ファ|[ドレミソラシ])?([♭♯♮])/g,(_,name='',c)=>{
  const paths={'♭':FLAT_PATH,'♯':SHARP_PATH,'♮':NATURAL_PATH};
  const bounds={'♭':'-0.02 -1.776 0.944 2.496','♯':'-0.02 -1.42 1.036 2.832','♮':'-0.02 -1.384 0.712 2.744'};
  return `<span class="accidental-word">${name}<span class="sr-only">${c}</span><svg class="text-accidental" data-symbol="${c}" viewBox="${bounds[c]}" aria-hidden="true"><path d="${paths[c]}" fill="currentColor"/></svg></span>`;
 });
}
export function typesetText(html){
 let skip=0;
 return html.split(/(<[^>]+>)/g).map(part=>{
  if(part.startsWith('<')){
   if(/^<(svg|select|textarea|script|style|pre)\b/.test(part))skip++;
   if(/^<\/(svg|select|textarea|script|style|pre)>/.test(part))skip--;
   return part;
  }
  return skip?part:replaceMusicText(part);
 }).join('');
}
const STAFF_SPACE=11;
const svgNumber=value=>String(Math.round(value*1000)/1000);
const pitchY=(bottom,step)=>bottom-step*STAFF_SPACE/2;
function glyph(path,x,y,color,role){return `<path data-role="${role}" d="${path}" transform="translate(${svgNumber(x)} ${svgNumber(y)}) scale(${STAFF_SPACE})" fill="${color}"/>`;}
// ふよみと同じ基準。ト音記号のGの中心を、下から2本目のG4の線に置く。
function clef(x,bottom){return glyph(CLEF_PATH,x,pitchY(bottom,2),'#263d38','clef');}
function keySignature(sig,x,bottom){const steps=sig>0?[8,5,9,6,3,7,4]:[4,7,3,6,2,5,1];return `<g data-role="key-signature" data-fifths="${sig}" aria-label="${sig===0?'調号なし':(sig>0?'シャープ':'フラット')+Math.abs(sig)+'つ'}">${steps.slice(0,Math.abs(sig)).map((step,i)=>glyph(sig>0?SHARP_PATH:FLAT_PATH,x+i*11,pitchY(bottom,step),'#263d38','key-accidental')).join('')}</g>`;}
function decorateAccidental(t,accidentals,sig){const a=t.alteration??0,previous=accidentals.has(t.step)?accidentals.get(t.step):signatureAlteration(t.letter,sig);accidentals.set(t.step,a);return {...t,accidental:a===previous?'':a===1?'sharp':a===-1?'flat':'natural'};}
export function noteGlyph(note,x,bottom,settings={}){
 const duration=note.durationQuarters??note.beats;
 if(note.rest){
  const rests={4:[REST_WHOLE_PATH,1.128,6],2:[REST_HALF_PATH,1.128,4],1:[REST_QUARTER_PATH,1.08,4],.5:[REST_EIGHTH_PATH,.988,4]};
  const [path,width,step]=rests[duration]||rests[1];
  return glyph(path,x-width*STAFF_SPACE/2,pitchY(bottom,step),'#263d38','rest');
 }
 const tones=note.chord||[note],head=duration>=4?WHOLE_PATH:duration>=2?HALF_PATH:NOTEHEAD_PATH;
 const headWidth=duration>=4?1.688:1.18,left=x-headWidth*STAFF_SPACE/2;
 const colorFor=n=>settings.colors===false?'#263d38':STRINGS[n.string].color;
 let out='';const ledgers=new Set();
 for(const n of tones){for(let step=-2;step>=n.step;step-=2)ledgers.add(step);for(let step=10;step<=n.step;step+=2)ledgers.add(step);}
 for(const step of ledgers){const y=pitchY(bottom,step),halfWidth=Math.max(.96,headWidth/2+.35)*STAFF_SPACE;out+=`<path data-role="ledger-line" data-step="${step}" d="M${svgNumber(x-halfWidth)} ${y}H${svgNumber(x+halfWidth)}" fill="none" stroke="#5a6660" stroke-width="${STAFF_SPACE/8}" stroke-linecap="round"/>`;}
 for(const n of tones){
  const y=pitchY(bottom,n.step),color=colorFor(n);
  const accidental=Object.hasOwn(n,'accidental')?n.accidental:(n.name.includes('♯')?'sharp':n.name.includes('♭')?'flat':null);
  if(accidental)out+=`<g data-accidental="${accidental}">${glyph({sharp:SHARP_PATH,flat:FLAT_PATH,natural:NATURAL_PATH}[accidental],x-1.72*STAFF_SPACE,y,color,'accidental')}</g>`;
  out+=glyph(head,left,y,color,'notehead');
  if([.75,1.5,3,6].includes(duration))out+=`<circle data-role="augmentation-dot" cx="${x+12}" cy="${y-(n.step%2===0?STAFF_SPACE/2:0)}" r="1.9" fill="${color}"/>`;
 }
 if(duration<4){
  const up=(Math.min(...tones.map(n=>n.step))+Math.max(...tones.map(n=>n.step)))/2<4;
  const ys=tones.map(n=>pitchY(bottom,n.step)),anchor=up?Math.max(...ys):Math.min(...ys);
  const stemX=left+(up?1.18:0)*STAFF_SPACE,start=anchor+(up?-.168:.168)*STAFF_SPACE;
  const end=(up?Math.min(...ys):Math.max(...ys))+(up?-3.5:3.5)*STAFF_SPACE,color=colorFor(tones[0]);
  out+=`<path data-role="stem" d="M${svgNumber(stemX)} ${svgNumber(start)}V${svgNumber(end)}" fill="none" stroke="${color}" stroke-width="${.13*STAFF_SPACE}"/>`;
  if(duration<=.75)out+=glyph(up?FLAG_UP_PATH:FLAG_DOWN_PATH,stemX-.065*STAFF_SPACE,end+(up?-.04:.132)*STAFF_SPACE,color,'flag');
 }
 const printFinger=Object.hasOwn(note,'printedFinger')?note.printedFinger:note.finger;
 if(settings.fingers!==false&&printFinger!==null){
  const top=Math.min(bottom-4*STAFF_SPACE,...tones.map(n=>pitchY(bottom,n.step)-STAFF_SPACE*.5));
  const up=tones.every(n=>n.step<4)&&duration<4;
  const y=Math.min(top-.52*STAFF_SPACE,up?Math.min(...tones.map(n=>pitchY(bottom,n.step)))-4.1*STAFF_SPACE:Infinity,note.slurs?.length?pitchY(bottom,note.step)-30:Infinity);
  out+=`<text data-role="finger" x="${x}" y="${svgNumber(y)}" text-anchor="middle" font-size="${.95*STAFF_SPACE}" font-weight="700" fill="${colorFor(note)}">${printFinger}</text>`;
 }
 if(settings.fingers!==false&&note.fingerAnnotation)out+=`<text data-role="finger-annotation" x="${x}" y="24" text-anchor="middle" font-size="10" fill="${colorFor(note)}">${escapeHTML(note.fingerAnnotation)}</text>`;
 return out;
}
export function renderNext(note,settings={}){
 if(!note)return '';
 return `<svg class="next-score" viewBox="0 0 100 150" role="img" aria-label="次の音の譜面">${staffLines(100,93)}${noteGlyph(note,54,93,{...settings,fingers:false})}</svg>`;
}
export function staffLines(width,bottom=96){return Array.from({length:5},(_,i)=>`<path data-role="staff-line" d="M12 ${bottom-i*STAFF_SPACE}H${width-12}" stroke="#a1aaa3" stroke-width="${STAFF_SPACE/8}"/>`).join('');}
export function renderSingle(note,settings={}){
 return `<svg class="single-score" viewBox="0 0 310 170" role="img" aria-label="${escapeHTML(note.rest?'休符':note.chord?.map(n=>n.name).join('と')||note.name)}、${note.beats}拍">${staffLines(310,114)}${clef(23,114)}${noteGlyph(note,177,114,settings)}${(settings.names!==false||settings.colors!==false)?`<text x="177" y="160" text-anchor="middle" font-size="13" fill="#65746d">${escapeHTML(note.rest?'休み':note.chord?.map(n=>n.name).join(' ＋ ')||note.name)}</text>`:''}</svg>`;
}
export function renderScore(notes,settings={},group=0){
 const visible=group===null?notes:notes.filter(n=>n.bar>=group*4&&n.bar<group*4+4);
 return renderSystems(visible,settings,1,{minWidth:340}).replaceAll('class="score-system"','class="score-bar"');
}

function slurPaths(notes,positions,bottom){
 const phrases=new Map();let out='';
 for(const n of notes)for(const p of n.phrases||[])phrases.set(`${p.kind}:${p.start}:${p.end}`,p);
 for(const p of phrases.values()){
  const x1=positions.get(p.start)??positions.get(notes[0].index)-14,x2=positions.get(p.end)??positions.get(notes.at(-1).index)+14;
  const y=Math.max(26,Math.min(pitchY(bottom,p.startStep),pitchY(bottom,p.endStep))-12);
  out+=`<path data-role="${p.kind==='ties'?'tie':'slur'}" d="M${x1} ${y} Q${(x1+x2)/2} ${y-16} ${x2} ${y}" fill="none" stroke="#263d38" stroke-width="1.3"/>`;
 }
 return out;
}
export function renderSystems(notes,settings={},barsPerSystem=2,layout={}){
 const bars=[...new Set(notes.map(n=>n.bar))],groups=[];
 for(let i=0;i<bars.length;){let group=[bars[i++]];
  while(i<bars.length&&group.length<barsPerSystem&&notes.filter(n=>group.includes(n.bar)||n.bar===bars[i]).length<=10)group.push(bars[i++]);
  groups.push(group);
 }
 return groups.map(group=>{
  const ns=notes.filter(n=>group.includes(n.bar)),bottom=102,sig=ns[0]?.signature||0,kw=Math.abs(sig)*11;
  const prefix=76+kw,plans=group.map(bar=>({bar,ns:ns.filter(n=>n.bar===bar)}));
  const widths=plans.map(p=>Math.max(72,p.ns.reduce((a,n)=>a+((n.durationQuarters??n.beats)===.5?29:36),0)+18));
  const extra=Math.max(0,(layout.minWidth||340)-prefix-14-widths.reduce((a,b)=>a+b,0))/plans.length;
  let cursor=prefix;plans.forEach((p,i)=>{p.x=cursor;p.width=widths[i]+extra;cursor+=p.width;});
  const width=cursor+14,positions=new Map();let background='',music='';
  for(const p of plans){const acc=new Map();let at=p.x+20;
   const weight=p.ns.reduce((a,n)=>a+((n.durationQuarters??n.beats)===.5?29:36),0);
   for(const n of p.ns){const x=at;positions.set(n.index,x);at+=(p.width-20)*((n.durationQuarters??n.beats)===.5?29:36)/weight;
    background+=`<rect data-score-index="${n.index}" class="note-highlight" x="${x-16}" y="18" width="32" height="123" rx="4" fill="transparent"/>`;
    const printed=n.rest?n:decorateAccidental(n,acc,sig);
    music+=`<g data-score-index="${n.index}">${noteGlyph(printed,x,bottom,settings)}${settings.names!==false||settings.colors!==false?`<text data-role="string-name" x="${x}" y="153" text-anchor="middle" font-size="11" fill="#485466">${n.rest?'休':n.string}</text>`:''}</g>`;
   }
   music+=`<path data-role="barline" d="M${p.x+p.width} 58V102" stroke="#657083" stroke-width="1.2"/>`;
   for(const [enabled,x,direction] of [[p.ns[0]?.repeatStart,p.x,1],[p.ns.at(-1)?.repeatEnd,p.x+p.width,-1]])if(enabled){
    music+=`<g data-role="repeat-${direction===1?'start':'end'}"><path d="M${x} 58V102 M${x+direction*4} 58V102" stroke="#263d38" stroke-width="2"/>${[74.5,85.5].map(y=>`<circle cx="${x+direction*10}" cy="${y}" r="1.7" fill="#263d38"/>`).join('')}</g>`;
   }
  }
  music+=slurPaths(ns,positions,bottom);
  const meter=ns[0]?.meter||4,unit=ns[0]?.beatUnit||4;
  const time=group[0]===0?`<g data-role="time-signature" aria-label="${unit}分の${meter}拍子">${[[meter,3],[unit,1]].map(([digit,step])=>glyph(TIME_DIGITS[digit],62+kw-.94*STAFF_SPACE,bottom-step*STAFF_SPACE,'#263d38','time-digit')).join('')}</g>`:'';
  return `<svg class="score-system" viewBox="0 0 ${width} 167" role="img" aria-label="${group[0]+1}から${group.at(-1)+1}小節">${background}${staffLines(width,bottom)}${clef(16,bottom)}${keySignature(sig,46,bottom)}${time}${music}</svg>`;
 }).join('');
}
