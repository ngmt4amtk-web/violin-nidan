import {tonalKey} from './intonation.mjs';
// 二段用の短いオリジナル課題。音名の綴り・弦・指は別々に保持する。
export const STRINGS={
 G:{name:'ソ',midi:55,color:'#347ab4',soft:'#e7f0f9',steps:[-5,-4,-3,-2,-1]},
 D:{name:'レ',midi:62,color:'#c57624',soft:'#fff0dd',steps:[-1,0,1,2,3]},
 A:{name:'ラ',midi:69,color:'#c45454',soft:'#fcebea',steps:[3,4,5,6,7]},
 E:{name:'ミ',midi:76,color:'#318260',soft:'#e6f3eb',steps:[7,8,9,10,11]}
};
export const PATTERNS={
 none:{label:'どの指もくっつかない形',intervals:[0,1,3,5,7]},
 '23':{label:'2と3がくっつく形',intervals:[0,2,4,5,7]},
 '12':{label:'1と2がくっつく形',intervals:[0,2,3,5,7]},
 '34':{label:'3と4がくっつく形',intervals:[0,2,4,6,7]},
 '34low':{label:'低い1・低い4の形',intervals:[0,1,3,5,6]},
 individual:{label:'音ごとに指の場所を確かめる',intervals:null}
};
const NOTE_KANA=['ド','レ','ミ','ファ','ソ','ラ','シ'],PCS=[0,2,4,5,7,9,11];
export const CHAPTERS=['どの指もくっつかない形','長音階','調号から形を読む','臨時記号と指の変化','短音階・半音階','楽譜を読んで弾く'];
export const CHAPTER_SUB=['シ♭もファも、最初から4本の弦で','弦ごとに半音の場所を確かめる','形を選んでから、音で確かめる','小節の中で変わる音を読む','4つの形に収まらない動きへ','ヒントを減らして短い曲に挑戦'];
export const FORM_LABELS=['①','②','③','④','⑤','⑥','⑦'];
export const COMMON_MENU=[['fingers','この形をつかむ','A線のシ♭・E線のファ。4本の弦から選ぶ'],['add','指を1本ずつ確認する','1・2・3・4の指を選んで確かめる'],['variety','色々な練習','指を離す・往復する動きを練習する']];
const VARIETY=[['place','4本の指を置いて、離していく'],['pairs','全パターンの動きを練習する'],['keep','形を保って続ける'],['pivot','開放弦を軸に往復する'],['triples','3音ずつ上り下り']];
export function commonSteps(exercise){
 const intro='1〜4の指は、どの隣同士も全音です。開放弦と1の指の間だけは半音です。';
 const copies={fingers:['まずA線のラ・シ♭・ド・レ・ミを弾きます。次の画面でG・D・E線も選べます。','1の指をナット寄りに置きます。手全体をずらさず、2・3・4の場所を確かめます。',intro],add1:['まず1・2・3・4を弾き、次に1だけを半音下げます。A線ではシからシ♭、E線ではファ♯からファです。','2・3・4は同じ場所です。そのあと開放弦と、低い1を往復します。',intro],add2:['0・1・2を弾き、1と2を往復します。','低い1を保ち、2との間を全音あけます。',intro],add3:['1・2・3を弾き、2と3を往復します。','2と3も全音です。近づけすぎないように聴きます。',intro],add4:['2・3・4を弾き、4から1へ下ります。','3と4も全音です。A線の4はミで、ミ♭ではありません。',intro],place:['1・2・3・4を弾いて場所を確かめます。','休符で4本を用意し、4・3・2・1と離していきます。',intro],pairs:['1〜4の指を、2本ずつ組み合わせて往復します。','飛び越す指があっても、同じ音へ戻ります。',intro],keep:['①〜⑦から、繰り返す型を選びます。','型が変わっても、指の場所は同じです。',intro],pivot:['開放弦と、1・2・3・4の指を交互に弾きます。','指を離したあとも、同じ場所に戻ります。',intro],triples:['隣り合う3音で、上ったり下りたりします。','1〜4の指同士の間は、どこも全音です。',intro]};return copies[exercise]||[intro];
}
const shapeLessons=['fingers','add1','add2','add3','add4',...VARIETY.map(x=>x[0])].map(exercise=>({id:exercise,type:exercise,exercise,unit:0,pattern:'none',menu:exercise.startsWith('add')?'add':exercise==='fingers'?'fingers':'variety',title:exercise==='fingers'?'この形をつかむ':exercise.startsWith('add')?exercise.at(-1)+'の指を確かめる':VARIETY.find(x=>x[0]===exercise)[1],sub:exercise==='add1'?'開放弦と低い1を往復する':PATTERNS.none.label,steps:commonSteps(exercise)}));
const lessonSpec=(id,unit,title,sub,steps)=>({id,type:id,unit,title,sub,steps});
export const LESSONS=[...shapeLessons,
 lessonSpec('lower4',1,'4だけを低くする','ミとミ♭を区別してから、音階へ',['全部くっつかない形から、4だけを半音下げます。A線ならミからミ♭です。','1・2・3の場所は同じです。4を下げると、3と4が半音になります。','A線の低い1（シ♭）と、低い4（ミ♭）を別々に確かめてから音階へ進みます。']),
 lessonSpec('major',1,'長調の音階','ヘ長調・変ロ長調から、8つの長調へ',['まずヘ長調で、A線のシ♭とE線のファをつなぎます。','始める指は手がかりです。弦が変わったら、その弦の半音の場所を確かめます。','上って下る1オクターヴです。変ロ長調は低い音域と高い音域を選べます。']),
 lessonSpec('keyQuiz',2,'調号から、指の形を選ぶ','12問 · 答えを選んでも楽譜は変わらない',['調号が、どの音を半音上げ下げするか読みます。','表示された弦の1〜4の音から、指の形を選びます。答えを確かめてから弾きます。','最初は形の図・指番号・音名・弦の色を隠しています。必要ならヒントを増やせます。']),
 lessonSpec('accidentals',3,'同じ指で、音を変える','シ♭とシ・ミ♭とミ・ファとファ♯',['同じ小節では、臨時記号は同じ高さの音に続けて効きます。','♮は、その音の♯や♭を取り消します。次の小節では調号の状態に戻ります。','変わる指だけを半音動かします。ほかの指を一緒にずらさないようにします。']),
 lessonSpec('minor',4,'短調の音階','イ・ホ・ニ・ト短調の3種類',['自然的短音階を弾いてから、和声的・旋律的へ進みます。','和声的は第7音を上げます。旋律的は上りで第6・第7音を上げ、下りは自然的に戻します。','指の間が半音3つ分になる場所もあります。4つの形に無理に当てはめず、音ごとに確かめます。']),
 lessonSpec('chromatic',4,'ニからの半音階','同じ指を半音ずつ動かす',['レから1オクターヴ上のレまで、半音ずつ上って下ります。','同じ指で場所を変える音があります。音名と指番号は別々に確かめます。','この課題の上りも下りも♯で書いています。♮で戻る音にも注意します。']),
 lessonSpec('sight',5,'短い曲を、読んで弾く','6問 · 4〜8小節',['先に楽譜をながめ、調号・臨時記号・移弦を確認します。','まずヒントなしで読み、難しいときだけ指番号や音名を表示します。','お手本も使えます。マイクで確かめられるのは音程で、弾いた指や弦・弓の動きではありません。'])
];
export function chapterItems(unit){const ls=LESSONS.filter(l=>l.unit===unit);return unit===0?COMMON_MENU.map(([menu,title,sub])=>menu==='fingers'?ls[0]:{menu,title,sub,children:ls.filter(l=>l.menu===menu)}):ls;}
export function lessonPage(){return null;}
const choose=(v,a,f)=>a.includes(String(v))?String(v):f;
export function normalizeOptions(l,raw={},bpm=60){raw=raw&&typeof raw==='object'?raw:{};const o={string:choose(raw.string,Object.keys(STRINGS),'A'),mode:choose(raw.mode,['wait','continuous'],'wait'),mic:typeof raw.mic==='boolean'?raw.mic:true,bpm:Number.isFinite(+raw.bpm)&&+raw.bpm>=40&&+raw.bpm<=180?Math.round(+raw.bpm):bpm,row:choose(raw.row,['1','2','3','4','5','6','7','random'],'1'),resolvedRow:Number(choose(raw.resolvedRow,['1','2','3','4','5','6','7'],'1')),scale:choose(raw.scale,Object.keys(MAJORS),'F'),minor:choose(raw.minor,Object.keys(MINORS),'A'),form:choose(raw.form,['naturalMinor','harmonicMinor','melodicMinor'],'naturalMinor'),problem:choose(raw.problem,Array.from({length:l.type==='keyQuiz'?QUIZZES.length:6},(_,i)=>String(i+1)),'1'),variant:choose(raw.variant,['Bb','Eb','F'],'Bb'),help:choose(raw.help,['full','finger','read'],['keyQuiz','sight'].includes(l.type)?'read':'full'),answer:choose(raw.answer,['none','12','23','34'],''),answerChecked:raw.answerChecked===true};if(o.mic)o.mode='wait';return o;}
export const MAJORS={
 F:{label:'ヘ長調 · ファから',pc:5,sig:-1,seq:'D2:F4 D3:G4 A0:A4 A1:Bb4 A2:C5 A3:D5 A4:E5 E1:F5'},
 Bb:{label:'変ロ長調 · 低いシ♭から',pc:10,sig:-2,seq:'G2:Bb3 G3:C4 D0:D4 D1:Eb4 D2:F4 D3:G4 A0:A4 A1:Bb4'},
 BbHigh:{label:'変ロ長調 · 高いシ♭から',pc:10,sig:-2,seq:'A1:Bb4 A2:C5 A3:D5 A4:Eb5 E1:F5 E2:G5 E3:A5 E4:Bb5'},
 C:{label:'ハ長調',pc:0,sig:0,seq:'G3:C4 D0:D4 D1:E4 D2:F4 D3:G4 A0:A4 A1:B4 A2:C5'},
 G:{label:'ト長調',pc:7,sig:1,seq:'G0:G3 G1:A3 G2:B3 G3:C4 D0:D4 D1:E4 D2:F#4 D3:G4'},
 D:{label:'ニ長調',pc:2,sig:2,seq:'D0:D4 D1:E4 D2:F#4 D3:G4 A0:A4 A1:B4 A2:C#5 A3:D5'},
 A:{label:'イ長調',pc:9,sig:3,seq:'A0:A4 A1:B4 A2:C#5 A3:D5 E0:E5 E1:F#5 E2:G#5 E3:A5'},
 E:{label:'ホ長調',pc:4,sig:4,seq:'D1:E4 D2:F#4 D3:G#4 D4:A4 A1:B4 A2:C#5 A3:D#5 A4:E5'},
 Eb:{label:'変ホ長調 · 低い4も使う',pc:3,sig:-3,seq:'D1:Eb4 D2:F4 D3:G4 D4:Ab4 A1:Bb4 A2:C5 A3:D5 A4:Eb5'}
};
export const MINORS={
 A:{label:'イ短調',pc:9,sig:0,seq:'G1:A3 G2:B3 G3:C4 D0:D4 D1:E4 D2:F4 D3:G4 D4:A4'},
 E:{label:'ホ短調',pc:4,sig:1,seq:'D1:E4 D2:F#4 D3:G4 A0:A4 A1:B4 A2:C5 A3:D5 A4:E5'},
 D:{label:'ニ短調',pc:2,sig:-1,seq:'D0:D4 D1:E4 D2:F4 D3:G4 A0:A4 A1:Bb4 A2:C5 A3:D5'},
 G:{label:'ト短調',pc:7,sig:-2,seq:'G0:G3 G1:A3 G2:Bb3 G3:C4 D0:D4 D1:Eb4 D2:F4 D3:G4'}
};
export const QUIZZES=[
 ['A',-1,'none'],['E',0,'none'],['D',-2,'none'],['G',-3,'none'],['A',0,'12'],['D',0,'12'],['G',1,'23'],['A',2,'23'],['G',3,'34'],['D',4,'34'],['A',4,'34'],['E',3,'23']
].map(([string,sig,answer],i)=>({string,sig,answer,label:`その${i+1} · ${string}線`}));
export function signatureAlteration(letter,sig=0){const order=sig>0?[3,0,4,1,5,2,6]:[6,2,5,1,4,0,3];return order.slice(0,Math.abs(sig)).includes(letter)?Math.sign(sig):0;}
function signaturePattern(string,sig){const intervals=[0,...STRINGS[string].steps.slice(1).map(step=>{const d=30+step,l=(d%7+7)%7;return (Math.floor(d/7)+1)*12+PCS[l]+signatureAlteration(l,sig)-STRINGS[string].midi;})];return Object.keys(PATTERNS).find(p=>JSON.stringify(PATTERNS[p].intervals)===JSON.stringify(intervals))||'individual';}
export function spelledNote(string,finger,spelling,beats=1,extra={}){const m=/^([A-G])([#b]?)(\d)$/.exec(spelling);if(!m)throw new Error('Bad spelling '+spelling);const letter='CDEFGAB'.indexOf(m[1]),octave=+m[3],alteration=m[2]==='#'?1:m[2]==='b'?-1:0,midi=(octave+1)*12+PCS[letter]+alteration;return {string,finger,beats,letter,alteration,midi,step:octave*7+letter-30,name:NOTE_KANA[letter]+(alteration===1?'♯':alteration===-1?'♭':''),pattern:'individual',...extra};}
export function makeNote(string,finger,beats=1,extra={}){const step=STRINGS[string].steps[finger],d=30+step,letter=(d%7+7)%7,pattern=extra.pattern||'none',midi=STRINGS[string].midi+PATTERNS[pattern].intervals[finger],alteration=midi-((Math.floor(d/7)+1)*12+PCS[letter]);return {string,finger,beats,step,letter,alteration,midi,name:NOTE_KANA[letter]+(alteration===1?'♯':alteration===-1?'♭':''),pattern,...extra};}
export const makeRest=beats=>({rest:true,beats,name:'休み'});
function decode(seq,spec,form='major'){return seq.split(' ').map(token=>{const [sf,pitch]=token.split(':');return spelledNote(sf[0],+sf[1],pitch,1,{signature:spec.sig,key:tonalKey(spec.pc,form),pattern:signaturePattern(sf[0],spec.sig)});});}
function scaleExercise(spec,form='major'){const natural=decode(spec.seq,spec,form),up=natural.map((n,i)=>{if((form==='harmonicMinor'&&i===6)||(form==='melodicMinor'&&(i===5||i===6))){return {...n,midi:n.midi+1,alteration:n.alteration+1,name:NOTE_KANA[n.letter]+(n.alteration+1===1?'♯':''),pattern:'individual'};}return n;});const down=(form==='melodicMinor'?natural:up).slice().reverse();return [...up,...down].map(n=>form==='major'?n:{...n,pattern:'individual'});}
const KEEP=[[0,1,2,3,4,3,2,1],[0,1,0,2,0,3,0,4],[1,2,3,4,3,2,1,0],[1,3,2,4,4,2,3,1],[4,3,2,1,1,2,3,4],[1,2,1,3,1,4,3,2],[0,1,2,3,1,2,3,4,0,1,2,1,1,2,3,2]];
export function quizFor(options){return QUIZZES[+options.problem-1]||QUIZZES[0];}
export function makeExercise(type,raw={}){const l=LESSONS.find(l=>l.id===type)||LESSONS[0],o=normalizeOptions(l,raw),n=(f,b=1)=>makeNote(o.string,f,b),shapeSeq=seq=>seq.map(f=>n(f));let notes=[];
 if(type==='fingers')notes=[0,1,2,3,4,3,2,1,0].map(f=>n(f,4));
 else if(type==='add1')notes=[...[1,2,3,4].map(f=>makeNote(o.string,f,1,{pattern:'12'})),...shapeSeq([1,2,3,4,0,1,0,1,2,1,0,1])];
 else if(type==='add2')notes=shapeSeq([0,1,2,1,2,1,2,1,2,1,0,1]);
 else if(type==='add3')notes=shapeSeq([1,2,3,2,3,2,3,2,3,2,1,2]);
 else if(type==='add4')notes=shapeSeq([2,3,4,3,4,3,2,1,4,3,2,1]);
 else if(type==='place')notes=[...shapeSeq([1,2,3,4]),n(1),makeRest(1),n(4,2),...shapeSeq([4,3,2,1])];
 else if(type==='pairs')notes=shapeSeq([1,2,1,3,1,4,2,3,2,4,3,4,4,3,4,2,4,1,3,2,3,1,2,1]);
 else if(type==='keep'){const row=+(o.row==='random'?o.resolvedRow:o.row)-1;notes=shapeSeq(KEEP[row]);if(row!==6)notes=[...notes,...notes,n(0,4)];}
 else if(type==='pivot')notes=[...shapeSeq([0,1,0,2,0,3,0,4,0,4,0,3,0,2,0,1]),n(0,4)];
 else if(type==='triples')notes=[...shapeSeq([0,1,2,1,1,2,3,2,2,3,4,3,4,3,2,3,3,2,1,2,2,1,0,1]),n(0,4)];
 else if(type==='major')notes=scaleExercise(MAJORS[o.scale]);
 else if(type==='lower4')notes=['none','34low','none','34low'].flatMap(pattern=>[1,2,3,4].map(f=>makeNote(o.string,f,1,{pattern})));
 else if(type==='minor')notes=scaleExercise(MINORS[o.minor],o.form);
 else if(type==='keyQuiz'){const q=quizFor(o);notes=[1,2,3,4,4,3,2,1].map(f=>makeNote(q.string,f,1,{pattern:q.answer,signature:q.sig}));}
 else if(type==='accidentals'){
  const s=o.variant==='Bb'?'A':o.variant==='Eb'?'A':'E',f=o.variant==='Eb'?4:1,a=o.variant==='Bb'?'Bb4':o.variant==='Eb'?'Eb5':'F5',b=o.variant==='Bb'?'B4':o.variant==='Eb'?'E5':'F#5',sig=o.variant==='F'?1:-2;
  notes=[a,a,b,b,a,a,a,a,b,b,a,a,a,b,b,a].map(p=>spelledNote(s,f,p,1,{signature:sig}));
 }
 else if(type==='chromatic'){
  const up=decode('D0:D4 D1:D#4 D1:E4 D2:F4 D2:F#4 D3:G4 D3:G#4 A0:A4 A1:A#4 A1:B4 A2:C5 A2:C#5 A3:D5',{pc:2,sig:0});
  // 13音＋折返し12音。末尾を4拍にして7小節に収める。
  notes=[...up,...up.slice(0,-1).reverse()].map(n=>({...n,pattern:'individual'}));notes.at(-1).beats=4;
 }
 else if(type==='sight'){
  const specs=[
   [MAJORS.F,'A0:A4 A1:Bb4 A2:C5 A1:Bb4 A3:D5 A2:C5 A1:Bb4 A0:A4 D2:F4 D3:G4 A0:A4 A1:Bb4 A2:C5 A1:Bb4 A0:A4 D2:F4'],
   [MAJORS.Bb,'D0:D4 D1:Eb4 D2:F4 D3:G4 A0:A4 A1:Bb4 A0:A4 D3:G4 D2:F4 D1:Eb4 D2:F4 D0:D4 G2:Bb3 G3:C4 D0:D4 G2:Bb3'],
   [MAJORS.C,'G3:C4 D0:D4 D1:E4 D2:F4 D3:G4 D2:F4 D1:E4 D0:D4 A2:C5 A1:B4 A0:A4 D3:G4 D2:F4 D1:E4 D0:D4 G3:C4'],
   [MAJORS.E,'D1:E4 D2:F#4 D3:G#4 D4:A4 A1:B4 A2:C#5 A3:D#5 A4:E5 A3:D#5 A2:C#5 A1:B4 D4:A4 D3:G#4 D2:F#4 D1:E4 D1:E4'],
   [{sig:-1,pc:5},'A1:Bb4 A2:C5 A3:D5 A4:E5 A1:B4 A2:C#5 A3:D5 A4:E5 A1:B4 A2:C#5 A3:D#5 A4:E5 A1:B4 A2:C5 A3:D5 A4:E5 A1:Bb4 A2:C5 A3:D5 A4:E5 A4:E5 A3:D5 A2:C5 A1:Bb4 A0:A4 A1:Bb4 A2:C5 A3:D5 A2:C5 A1:Bb4 A0:A4 A0:A4'],
   [MINORS.D,'D0:D4 D1:E4 D2:F4 D3:G4 A0:A4 A1:Bb4 A2:C#5 A3:D5 A2:C5 A1:Bb4 A0:A4 D3:G4 D2:F4 D1:E4 D0:D4 D0:D4']
  ];const [spec,seq]=specs[+o.problem-1];notes=decode(seq,spec,+o.problem===6?'melodicMinor':'major');
  if(+o.problem===5)notes=notes.map((n,i)=>({...n,pattern:['none','23','34','12','none','none','none','none'][Math.floor(i/4)]}));
  if(+o.problem===6)notes=notes.map(n=>({...n,pattern:'individual'}));
 }
 if(!notes.length)throw new Error('Unknown lesson '+type);
 return withTimeline(notes.map(n=>n.rest?n:{...n,key:n.key||tonalKey((STRINGS[n.string].midi+(n.pattern==='none'?8:n.pattern==='34low'?1:n.pattern==='12'?3:n.pattern==='34'?7:0))%12)}));
}
export function withTimeline(notes){let at=0;return notes.map((n,index)=>{const v={...n,index,start:at,end:at+n.beats,bar:Math.floor(at/4),meter:4};at+=n.beats;return v;});}
export function noteTitle(n){return n.rest?'休み':n.string+'線・'+n.name;}
export function instructionFor(n,previous){if(n.rest)return '音を止めて、次の指を用意しよう。';if(previous&&previous.string===n.string&&previous.finger===n.finger&&previous.midi!==n.midi)return `${n.finger}の指を半音${n.midi>previous.midi?'上げて':'下げて'}、${n.name}へ。`;if(n.finger===0)return '指を離して、開放弦を弾こう。';if(n.pattern==='none')return n.finger===1?`開放弦から半音上の${n.name}。1の指を低く置こう。`:`${n.finger-1}から全音あけて、${n.finger}の指を置こう。`;if(n.pattern==='individual')return `${n.string}線の${n.finger}の指で、${n.name}を確かめよう。`;return PATTERNS[n.pattern].label+'。'+n.name+'を聴こう。';}
