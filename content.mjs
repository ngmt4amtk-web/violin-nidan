import {tonalKey} from './intonation.mjs';
import {SONGS,SEVCIK} from './repertoire.mjs';
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
export const CHAPTERS=['どの指もくっつかない形','始める指と長音階','調号から形を読む','臨時記号を読む','短音階と半音階','曲で確かめる','ヒントなしで読む'];
export const CHAPTER_SUB=['低い1と、指の間の全音を確かめる','始める指から、使う形を見つける','楽譜を見て答え、同じ音を弾く','変わる音と、元に戻る音を読む','上りと下りで変わる音を聴く','知っている歌を、違う調で弾く','形の図を離れて、楽譜から弾く'];
export const FORM_LABELS=['①','②','③','④','⑤','⑥','⑦'];
export const COMMON_MENU=[['fingers','指の間隔を確かめる','A線のシ♭・E線のファ。4本の弦から選ぶ'],['add','指を1本ずつ確認する','1・2・3・4の指を選んで確かめる'],['variety','色々な練習','指を離す・往復する動きを練習する']];
const VARIETY=[['place','4本の指を置いて、離していく'],['pairs','2本の指を組み合わせる'],['keep','形を保って続ける'],['pivot','開放弦と交互に弾く'],['triples','3音ずつ上り下り']];
const SHAPE_OUTCOMES={fingers:'開放弦と1の指の半音を聴く',add1:'開放弦と低い1を往復する',add2:'1と2の間を全音にする',add3:'2と3の間を全音にする',add4:'3と4の間を全音にする',place:'4から1へ、順に指を離す',pairs:'離れた指へ移っても同じ音に戻る',keep:'音の順番を変えても、指の場所を保つ',pivot:'指を離したあとも、同じ場所に戻る',triples:'3つの音を続けて、音程をそろえる'};
export function commonSteps(exercise){
 const intro='1〜4の指は、どの隣同士も全音です。開放弦と1の指の間だけは半音です。';
 const copies={fingers:['まずA線のラ・シ♭・ド・レ・ミを弾きます。次の画面でG・D・E線も選べます。','1の指をナット寄りに置きます。手全体をずらさず、2・3・4の場所を確かめます。',intro],add1:['まず1・2・3・4を弾き、次に1だけを半音下げます。A線ではシからシ♭、E線ではファ♯からファです。','2・3・4は同じ場所です。そのあと開放弦と、低い1を往復します。',intro],add2:['0・1・2を弾き、1と2を往復します。','低い1を保ち、2との間を全音あけます。',intro],add3:['1・2・3を弾き、2と3を往復します。','2と3も全音です。近づけすぎないように聴きます。',intro],add4:['2・3・4を弾き、4から1へ下ります。','3と4も全音です。A線の4はミで、ミ♭ではありません。',intro],place:['1・2・3・4を弾いて場所を確かめます。','休符で4本を用意し、4・3・2・1と離していきます。',intro],pairs:['1〜4の指を、2本ずつ組み合わせて往復します。','飛び越す指があっても、同じ音へ戻ります。',intro],keep:['①〜⑦から、繰り返す型を選びます。','型が変わっても、指の場所は同じです。',intro],pivot:['開放弦と、1・2・3・4の指を交互に弾きます。','指を離したあとも、同じ場所に戻ります。',intro],triples:['隣り合う3音で、上ったり下りたりします。','1〜4の指同士の間は、どこも全音です。',intro]};return copies[exercise]||[intro];
}
const shapeLessons=['fingers','add1','add2','add3','add4',...VARIETY.map(x=>x[0])].map(exercise=>({id:exercise,type:exercise,exercise,unit:0,pattern:'none',menu:exercise.startsWith('add')?'add':exercise==='fingers'?'fingers':'variety',title:exercise==='fingers'?'指の間隔を確かめる':exercise.startsWith('add')?exercise.at(-1)+'の指を確かめる':VARIETY.find(x=>x[0]===exercise)[1],sub:SHAPE_OUTCOMES[exercise],steps:commonSteps(exercise)}));
const lessonSpec=(id,unit,title,sub,steps)=>({id,type:id,unit,title,sub,steps});
const majorLesson=(id,title,sub,scales)=>({...lessonSpec(id,1,title,sub,[sub,'弦が変わったら、その弦の指の間隔を確かめます。','音階を上って下り、始めの音へ戻ります。']),type:'major',scales});
const quizLesson=(id,title,sub,deck)=>({...lessonSpec(id,2,title,sub,['調号を見て、指定された弦の形を選びます。','答えと理由を確かめ、同じ楽譜を弾きます。','弾き終わったら、次の問題に進みます。']),type:'keyQuiz',deck});
const accidentalLesson=(id,title,variant,sub)=>({...lessonSpec(id,3,title,sub,['臨時記号は、同じ小節の同じ高さの音に続けて効きます。','♮は♯や♭を取り消します。小節が変わると調号の音に戻ります。','同じ指を半音動かし、ほかの指の場所を保ちます。']),type:'accidentals',variant});
const minorLesson=(id,title,form,sub)=>({...lessonSpec(id,4,title,sub,[sub,'イ短調から始め、ホ・ニ・ト短調でも確かめます。','4つの形に当てはめず、音ごとの半音を読みます。']),type:'minor',form});
const SONG_OUTCOMES={song1:'ヘ長調の出だしで、D線とA線の形を切り替える',song2:'3度下がる音と、順に上る音を読み分ける',song3:'ヘ長調のA線とE線で、低い1の指を使う',song4:'八分音符の上り下りと、休符を読み分ける',song5:'隣り合う音をたどり、付点のリズムを読む',song6:'ヘ長調のG・D・A線で、低音へ戻る形を決める'};
const SIGHT_OUTCOMES=['D線とA線を行き来し、シ♭を低い1で読む','G・D・A線を移り、シ♭とミ♭を読む','調号なしで、G線とD・A線の形を使い分ける','D線とA線で、3と4がくっつく形を使う','臨時記号から、動かす指を決める','上りのド♯と下りのドを、A線の2で読む'];
export const LESSONS=[...shapeLessons,

 majorLesson('majorOpen','開放弦から始める','2と3がくっつく形で、ト・ニ・イ長調を弾く',['G','D','A']),
 majorLesson('majorThird','3の指から始める','1と2がくっつく形で、ハ・ト長調を弾く',['C','GHigh']),
 majorLesson('majorFirst','1の指から始める','3と4がくっつく形で、イ・ホ・ロ長調を弾く',['AFrom1','E','B']),
 majorLesson('major','2の指から始める','上の弦は、どの指もくっつかない形になる',['F','Bb']),
 lessonSpec('lower4',1,'4だけを低くする','低い1を保ち、4を半音下げる',['どの指もくっつかない形から、4だけを半音下げます。A線ではミからミ♭です。','1・2・3の場所は同じ。低い4は3と半音になります。']),
 majorLesson('majorLow4','低い4を使う長音階','高い変ロ長調と変ホ長調で、低い4を使う',['BbHigh','Eb']),
 quizLesson('quizNatural','調号なしを読む','弦によって違う形を答える','natural'),
 quizLesson('keyQuiz','フラットの調号を読む','半音下がる音から形を決める','flat'),
 quizLesson('quizSharp','シャープの調号を読む','半音上がる音から形を決める','sharp'),
 quizLesson('quizAll','いろいろな調号を読む','調号と弦を見て、4つの形から答える','all'),
 accidentalLesson('accidentals','シ♭とシを読み分ける','Bb','A線の1を半音動かし、シ♭に戻る小節を読む'),
 accidentalLesson('accidentalFourth','ミ♭とミを読み分ける','Eb','A線の4を半音動かし、ミ♭とミを読む'),
 accidentalLesson('accidentalSharp','ファとファ♯を読み分ける','F','E線の1でファとファ♯を弾き、小節線で戻す'),
 minorLesson('minor','自然的短音階','naturalMinor','半音がどこにあるかを、上りと下りで確かめる'),
 minorLesson('minorHarmonic','和声的短音階','harmonicMinor','第7音だけを半音上げる'),
 minorLesson('minorMelodic','旋律的短音階','melodicMinor','上りは第6・第7音を上げ、下りで戻す'),
 lessonSpec('chromatic',4,'ニからの半音階','同じ指で、半音ずつ場所を変える',['レから上のレまで半音ずつ進み、戻ります。','同じ指でも、音ごとに場所が変わります。','♯と♮を読み、半音の幅を耳で確かめます。']),
 ...SONGS.map(s=>({...lessonSpec(s.id,5,s.title,SONG_OUTCOMES[s.id],['調号を読み、使う弦の指の形を思い浮かべます。','まず1音ずつ音程を確かめ、次はテンポで通します。','弾けたら、指番号を隠して同じ曲を読みます。']),type:'song',songId:s.id})),
 ...['ヘ長調で読む','変ロ長調で読む','ハ長調で読む','ホ長調で読む','4つの形を切り替える','ニ短調で読む'].map((title,i)=>({...lessonSpec(i?'sight'+(i+1):'sight',6,title,SIGHT_OUTCOMES[i],['調号・臨時記号・移弦する所を先に確かめます。','ヒントなしで読み、困ったときは指番号を表示します。','止まった小節を覚えて、もう一度確かめます。']),type:'sight',problem:String(i+1)})),
 ...SEVCIK.map(s=>({...lessonSpec(s.id,s.unit,s.title,s.sub,['調号と臨時記号を読み、使う指を確かめます。','1音ずつ弾いてから、テンポで通してみます。']),type:'source',sourceId:s.id,sourceSection:s.section}))
];
export const SOURCE_GROUPS={F:{title:'開放弦と1の半音を使う',sub:'低い1を使う移弦と旋律を練習する'},G:{title:'3つの半音の位置を組み合わせる',sub:'開放弦と1・1と2・2と3の間を読み替える'},H:{title:'3と4の半音を使う',sub:'高い3と4の間隔を、拍子の違う旋律で保つ'},I:{title:'4つの形を組み合わせる',sub:'4種類の半音の位置を、音の動きに合わせて選ぶ'}};
export function chapterItems(unit){
 const items=LESSONS.filter(l=>l.unit===unit),sections=[...new Set(items.filter(l=>l.type==='source').map(l=>l.sourceSection))];
 return [...items.filter(l=>l.type!=='source'),...sections.map(section=>({id:'sources'+section,menu:'sources'+section,...SOURCE_GROUPS[section],children:items.filter(l=>l.sourceSection===section)}))];
}
export function quizDeck(lesson){return QUIZZES.map((q,i)=>({q,id:String(i+1)})).filter(({q})=>lesson.deck==='natural'?q.sig===0:lesson.deck==='flat'?q.sig<0:lesson.deck==='sharp'?q.sig>0:true).map(x=>x.id);}
export function lessonPage(){return null;}
const choose=(v,a,f)=>a.includes(String(v))?String(v):f;
export function normalizeOptions(l,raw={},bpm=60){
 raw=raw&&typeof raw==='object'?raw:{};
 const scales=l.scales||Object.keys(MAJORS),deck=l.type==='keyQuiz'?quizDeck(l):[];
 const o={string:choose(raw.string,Object.keys(STRINGS),'A'),mode:choose(raw.mode,['wait','continuous'],'wait'),mic:typeof raw.mic==='boolean'?raw.mic:true,bpm:Number.isFinite(+raw.bpm)&&+raw.bpm>=40&&+raw.bpm<=180?Math.round(+raw.bpm):bpm,
 row:choose(raw.row,['1','2','3','4','5','6','7','random'],'1'),resolvedRow:Number(choose(raw.resolvedRow,['1','2','3','4','5','6','7'],'1')),
 scale:choose(raw.scale,scales,scales[0]),songKey:choose(raw.songKey,['F','Bb','C'],'F'),minor:choose(raw.minor,Object.keys(MINORS),'A'),form:l.form||choose(raw.form,['naturalMinor','harmonicMinor','melodicMinor'],'naturalMinor'),
 problem:l.problem||(deck.length?choose(raw.problem,deck,deck[0]):'1'),variant:l.variant||choose(raw.variant,['Bb','Eb','F'],'Bb'),help:choose(raw.help,['full','finger','read'],['keyQuiz','sight'].includes(l.type)||l.unit===6?'read':'full'),
 quizOrder:choose(raw.quizOrder,['ordered','random'],'ordered'),answer:choose(raw.answer,['none','12','23','34'],''),answerChecked:raw.answerChecked===true};
 if(o.mic)o.mode='wait';return o;
}
export const MAJORS={
 AFrom1:{label:'イ長調',pc:9,sig:3,seq:'G1:A3 G2:B3 G3:C#4 G4:D4 D1:E4 D2:F#4 D3:G#4 D4:A4'},
 GHigh:{label:'ト長調',pc:7,sig:1,seq:'D3:G4 D4:A4 A1:B4 A2:C5 A3:D5 E0:E5 E1:F#5 E2:G5'},
 B:{label:'ロ長調',pc:11,sig:5,seq:'A1:B4 A2:C#5 A3:D#5 A4:E5 E1:F#5 E2:G#5 E3:A#5 E4:B5'},
 F:{label:'ヘ長調',pc:5,sig:-1,seq:'D2:F4 D3:G4 A0:A4 A1:Bb4 A2:C5 A3:D5 A4:E5 E1:F5'},
 Bb:{label:'変ロ長調',pc:10,sig:-2,seq:'G2:Bb3 G3:C4 D0:D4 D1:Eb4 D2:F4 D3:G4 A0:A4 A1:Bb4'},
 BbHigh:{label:'変ロ長調・高い音域',pc:10,sig:-2,seq:'A1:Bb4 A2:C5 A3:D5 A4:Eb5 E1:F5 E2:G5 E3:A5 E4:Bb5'},
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
export const QUIZZES=[-1,-2,-3,0,1,2,3,4,5].flatMap(sig=>Object.keys(STRINGS).map(string=>({string,sig,answer:signaturePattern(string,sig)}))).filter(q=>['none','12','23','34'].includes(q.answer)).map((q,i)=>({...q,id:String(i+1)}));
export function signatureAlteration(letter,sig=0){const order=sig>0?[3,0,4,1,5,2,6]:[6,2,5,1,4,0,3];return order.slice(0,Math.abs(sig)).includes(letter)?Math.sign(sig):0;}
export function signaturePattern(string,sig){const intervals=[0,...STRINGS[string].steps.slice(1).map(step=>{const d=30+step,l=(d%7+7)%7;return (Math.floor(d/7)+1)*12+PCS[l]+signatureAlteration(l,sig)-STRINGS[string].midi;})];return Object.keys(PATTERNS).find(p=>JSON.stringify(PATTERNS[p].intervals)===JSON.stringify(intervals))||'individual';}
export function spelledNote(string,finger,spelling,beats=1,extra={}){const m=/^([A-G])([#b]?)(\d)$/.exec(spelling);if(!m)throw new Error('Bad spelling '+spelling);const letter='CDEFGAB'.indexOf(m[1]),octave=+m[3],alteration=m[2]==='#'?1:m[2]==='b'?-1:0,midi=(octave+1)*12+PCS[letter]+alteration;return {string,finger,beats,letter,alteration,midi,step:octave*7+letter-30,name:NOTE_KANA[letter]+(alteration===1?'♯':alteration===-1?'♭':''),pattern:'individual',...extra};}
export function makeNote(string,finger,beats=1,extra={}){const step=STRINGS[string].steps[finger],d=30+step,letter=(d%7+7)%7,pattern=extra.pattern||'none',midi=STRINGS[string].midi+PATTERNS[pattern].intervals[finger],alteration=midi-((Math.floor(d/7)+1)*12+PCS[letter]);return {string,finger,beats,step,letter,alteration,midi,name:NOTE_KANA[letter]+(alteration===1?'♯':alteration===-1?'♭':''),pattern,...extra};}
export const makeRest=beats=>({rest:true,beats,name:'休み'});
function decode(seq,spec,form='major'){return seq.split(' ').map(token=>{const [sf,pitch]=token.split(':');return spelledNote(sf[0],+sf[1],pitch,1,{signature:spec.sig,key:tonalKey(spec.pc,form),pattern:signaturePattern(sf[0],spec.sig)});});}
function scaleExercise(spec,form='major'){const natural=decode(spec.seq,spec,form),up=natural.map((n,i)=>{if((form==='harmonicMinor'&&i===6)||(form==='melodicMinor'&&(i===5||i===6))){return {...n,midi:n.midi+1,alteration:n.alteration+1,name:NOTE_KANA[n.letter]+(n.alteration+1===1?'♯':''),pattern:'individual'};}return n;});const down=(form==='melodicMinor'?natural:up).slice().reverse();return [...up,...down].map(n=>form==='major'?n:{...n,pattern:'individual'});}
const KEEP=[[0,1,2,3,4,3,2,1],[0,1,0,2,0,3,0,4],[1,2,3,4,3,2,1,0],[1,3,2,4,4,2,3,1],[4,3,2,1,1,2,3,4],[1,2,1,3,1,4,3,2],[0,1,2,3,1,2,3,4,0,1,2,1,1,2,3,2]];
export function quizFor(options){return QUIZZES[+options.problem-1]||QUIZZES[0];}
export function makeExercise(id,raw={}){const l=LESSONS.find(l=>l.id===id)||LESSONS[0],type=l.type,o=normalizeOptions(l,raw),n=(f,b=1)=>makeNote(o.string,f,b),shapeSeq=seq=>seq.map(f=>n(f));let notes=[];
 if(type==='fingers')notes=[...shapeSeq([0,1,2,3,4,3,2,1]),n(0,4)];
 else if(type==='add1')notes=[...[1,2,3,4].map(f=>makeNote(o.string,f,1,{pattern:'12'})),...shapeSeq([1,2,3,4,0,1,0,1,2,1,0,1])];
 else if(type==='add2')notes=shapeSeq([0,1,2,1,2,1,2,1,2,1,0,1]);
 else if(type==='add3')notes=shapeSeq([1,2,3,2,3,2,3,2,3,2,1,2]);
 else if(type==='add4')notes=shapeSeq([2,3,4,3,4,3,2,1,4,3,2,1]);
 else if(type==='place')notes=[...shapeSeq([1,2,3,4]),n(1),makeRest(1),n(4,2),...shapeSeq([4,3,2,1])];
 else if(type==='pairs')notes=shapeSeq([1,2,1,3,1,4,2,3,2,4,3,4,4,3,4,2,4,1,3,2,3,1,2,1]);
 else if(type==='keep'){const row=+(o.row==='random'?o.resolvedRow:o.row)-1;notes=shapeSeq(KEEP[row]);if(row!==6)notes=[...notes,...notes,n(0,4)];}
 else if(type==='pivot')notes=[...shapeSeq([0,1,0,2,0,3,0,4,0,4,0,3,0,2,0,1]),n(0,4)];
 else if(type==='triples')notes=[...shapeSeq([0,1,2,1,1,2,3,2,2,3,4,3,4,3,2,3,3,2,1,2,2,1,0,1]),n(0,4)];
 else if(type==='song'){const song=SONGS.find(s=>s.id===l.songId),v=song.variants[o.songKey];notes=v.notes.map(x=>x.rest?makeRest(x.beats):spelledNote(x.string,x.finger,x.spelling,x.beats,{signature:v.signature,key:tonalKey(v.tonic),pattern:signaturePattern(x.string,v.signature),slurs:x.slurs}));}
 else if(type==='source')return sourceExercise(SEVCIK.find(s=>s.id===l.sourceId));
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
// 原譜の音価は四分音符=1で保存。時間と拍表示だけを拍子の分母で換算する。
export function withTimeline(notes,time={beats:4,unit:4}){
 let at=0,previousBar=-1,barStart=0;
 const timed=notes.map((n,index)=>{
  const beats=n.beats/(4/time.unit),bar=n.playBar??Math.floor(at/time.beats);
  if(bar!==previousBar){barStart=n.playBar===undefined?bar*time.beats:at;previousBar=bar;}
  const barDuration=n.barQuarters===undefined?time.beats:n.barQuarters/(4/time.unit);
  const beatInBar=at-barStart+(n.pickup?time.beats-barDuration:0);
  const v={...n,index,durationQuarters:n.beats,beats,start:at,end:at+beats,bar,barStart,barDuration,beatInBar,meter:time.beats,beatUnit:time.unit};at+=beats;return v;
 });
 const open=new Map();
 for(const n of timed)for(const kind of ['slurs','ties'])for(const mark of n[kind]||[]){
  const key=kind+mark.number;
  if(mark.type==='start')open.set(key,n);
  else{const first=open.get(key);open.delete(key);if(!first)continue;
   const phrase={start:first.index,end:n.index,startStep:first.step,endStep:n.step,kind};
   for(let i=first.index;i<=n.index;i++)(timed[i].phrases??=[]).push(phrase);
   if(kind==='ties'){first.tieToNext=true;n.tieFromPrevious=true;}
  }
 }
 return timed;
}
export function sourceExercise(source,expand=true){
 const time=source.time||{beats:4,unit:4},order=expand?source.playOrder:source.bars.map((_,i)=>i);
 const raw=order.flatMap((bar,playBar)=>{
  const barQuarters=source.bars[bar].reduce((s,n)=>s+n.beats,0);
  return source.bars[bar].map((x,i)=>{
   const extra={signature:source.signature,key:tonalKey(source.tonic,source.form||'major'),pattern:'individual',sourceBar:bar+1,playBar,barQuarters,pickup:bar===0&&barQuarters<time.beats*4/time.unit,printedFinger:x.printedFinger,fingerAnnotation:x.fingerAnnotation,slurs:x.slurs,ties:x.ties};
   if(!expand){extra.repeatStart=i===0&&(source.repeats||[]).some(r=>r.start===bar);extra.repeatEnd=i===source.bars[bar].length-1&&(source.repeats||[]).some(r=>r.end===bar);}
   return x.rest?{...makeRest(x.beats),...extra}:spelledNote(x.string,x.finger,x.spelling,x.beats,extra);
  });
 });
 return withTimeline(raw,time);
}
export function beatAt(note,position=note.start){return Math.floor(note.beatInBar+position-note.start+1e-8)%note.meter+1;}
export function tempoUnit(note){return ({2:'二分音符',4:'四分音符',8:'八分音符'})[note?.beatUnit||4];}
export function noteTitle(n){return n.rest?'休み':n.string+'線・'+n.name;}
export function instructionFor(n,previous){if(n.rest)return '音を止めて、次の指を用意しよう。';if(previous&&previous.string===n.string&&previous.finger===n.finger&&previous.midi!==n.midi)return `${n.finger}の指を半音${n.midi>previous.midi?'上げて':'下げて'}、${n.name}へ。`;if(n.finger===0)return '指を離して、開放弦を弾こう。';if(n.pattern==='none')return n.finger===1?`開放弦から半音上の${n.name}。1の指を低く置こう。`:`${n.finger-1}から全音あけて、${n.finger}の指を置こう。`;if(n.pattern==='individual')return `${n.string}線の${n.finger}の指で、${n.name}を確かめよう。`;return PATTERNS[n.pattern].label+'。'+n.name+'を聴こう。';}
