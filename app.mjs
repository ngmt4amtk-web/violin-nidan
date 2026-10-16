import {STRINGS,LESSONS,PATTERNS,CHAPTERS,CHAPTER_SUB,FORM_LABELS,MAJORS,MINORS,QUIZZES,quizFor,quizDeck,chapterItems,commonSteps,lessonPage,normalizeOptions,makeExercise,noteTitle,instructionFor,beatAt,tempoUnit} from './content.mjs';
import {AudioEngine,Microphone,MicJudge,AUDIO_CUES,transportStart,MIC_LEVELS} from './engine.mjs';
import {DIFFICULTIES,targetForNote,pitchFeedback} from './intonation.mjs';
import {normalizeStored} from './settings.mjs';
import {escapeHTML,musicText,typesetText,renderScore,renderSystems,renderNext} from './score.mjs';
import {BRAVURA_LICENSE} from './glyphs.mjs';

const ICONS={home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',book:'<path d="M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15"/>',chart:'<path d="M4 20V10m8 10V4m8 16v-7M2 22h20"/>',settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="m14 5-7 7 7 7"/>',play:'<path d="m8 4 12 8-12 8z"/>',pause:'<path d="M8 4v16M16 4v16"/>',sound:'<path d="M3 9h4l5-5v16l-5-5H3zM16 8q5 4 0 8m3-11q8 7 0 14"/>',check:'<path d="m5 12 4 4L20 5"/>',spark:'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8z"/>',mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>'};
const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.book}</svg>`;
const $=sel=>document.querySelector(sel);
const KEY='violin-nidan-v1';
let storageAvailable=true;
function readStored(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{storageAvailable=false;return {};}}
const initialStored=readStored(),stored=normalizeStored(initialStored);
let preferences=stored.preferences;
if(!initialStored.preferences?.difficulty)preferences.difficulty='easy';
let view='home',lesson=null,options={},notes=[],practice=null,raf=0,sessionToken=0,previewTimer=0,toastTimer=0,wakeLock=null;
const audio=new AudioEngine(),mic=new Microphone(audio),judge=new MicJudge();
function save(){try{localStorage.setItem(KEY,JSON.stringify({preferences,lessonId:lesson?.id||stored.lessonId,options:lesson?options:stored.options}));storageAvailable=true;}catch{storageAvailable=false;toast('このブラウザでは設定を保存できません。');}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
let chapter=null,sourceMenu='',settingsReturn='home',quizSession=null;
function shell(body,performance=false){
 document.body.dataset.view=view;
 $('#app').innerHTML=typesetText(`${performance?'':`<header class="app-header"><button class="brand" data-nav="home" aria-label="バイオリン二段 教材一覧"><span class="brand-mark" aria-hidden="true">二</span><span>バイオリン二段<small>調号と指の形</small></span></button><button class="quiet" data-action="settings" aria-label="設定">${icon('settings')}<span>設定</span></button></header>`}<main id="main" class="${performance?'performance-main':'workspace'}">${body}</main><div class="offline-note" ${navigator.onLine?'hidden':''}>オフライン · 保存済みの教材を使用</div>`);
}
function focusHeading(){requestAnimationFrame(()=>{const h=$('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}});}
function navigate(next){cleanup();view=next;render();window.scrollTo(0,0);focusHeading();}
function render(){if(view==='home')renderHome();else if(view==='sourceList')renderSubList(sourceMenu);else if(['addList','varietyList'].includes(view))renderSubList(view==='addList'?'add':'variety');else if(view==='intro')renderIntro();else if(view==='settings')renderSettings();else if(view==='setup')renderSetup();else if(view==='quiz')renderQuiz();else if(view==='quizSummary')renderQuizSummary();}
function lessonListAction(){return 'chapters';}
function lessonListLabel(){return '練習の一覧';}
function lessonHeader(stage){return `<div class="lesson-toolbar"><button class="quiet" data-action="${stage===1?'chapters':'intro'}">${icon('back')}${stage===1?'練習の一覧':'やり方'}</button><span class="stage-label">${stage===1?'やり方':'準備'}</span></div><div class="lesson-heading"><p class="eyebrow">${String(lesson.unit+1).padStart(2,'0')} · ${CHAPTERS[lesson.unit]}</p><h1>${escapeHTML(lesson.title)}</h1></div>`;}
function renderHome(){
 const list=chapter===null?CHAPTERS.map((name,i)=>`<button class="chapter-row" data-chapter="${i}"><span class="index">${String(i+1).padStart(2,'0')}</span><span><strong>${name}</strong><small>${CHAPTER_SUB[i]}</small></span><span class="chevron" aria-hidden="true">›</span></button>`).join(''):chapterItems(chapter).map(l=>`<button class="lesson-row" ${l.children?`data-menu="${l.menu}"`:`data-lesson="${l.id}"`}><span><strong>${escapeHTML(l.title)}</strong><small>${escapeHTML(l.sub)}</small></span><span class="chevron" aria-hidden="true">›</span></button>`).join('');
 const last=LESSONS.find(l=>l.id===readStored().lessonId);
 shell(`<section class="library"><div class="library-heading">${chapter===null?`<p class="eyebrow">バイオリンを習って1〜2年の人へ</p><h1>調号を見て、<br>指の形を決める。</h1><p class="muted">形を覚え、楽譜で答え、曲で使います。</p><button class="primary" data-lesson="quizAll">調号の問題を解く ${icon('arrow')}</button>${last?`<button class="quiet resume-link" data-lesson="${last.id}">前の練習：${escapeHTML(last.title)}</button>`:''}`:`<button class="quiet" data-action="allChapters">${icon('back')}すべての章</button><p class="eyebrow">第${chapter+1}章</p><h1>${CHAPTERS[chapter]}</h1><p class="muted">${CHAPTER_SUB[chapter]}</p>`}</div><div class="${chapter===null?'chapter-list':'lesson-list'}">${list}</div><footer class="library-foot">音程はマイクで。指の使い方は、自分でも確かめましょう。</footer></section>`);
}
function renderSubList(menu){const group=chapterItems(chapter).find(l=>l.children&&l.menu===menu);if(!group){view='home';renderHome();return;}shell(`<section class="library"><div class="library-heading"><button class="quiet" data-action="chapters">${icon('back')}章の一覧</button><p class="eyebrow">${CHAPTERS[chapter]}</p><h1>${group.title}</h1></div><div class="lesson-list">${group.children.map(l=>`<button class="lesson-row" ${l.children?`data-menu="${l.menu}"`:`data-lesson="${l.id}"`}><span><strong>${l.title}</strong><small>${l.sub}</small></span><span class="chevron">›</span></button>`).join('')}</div></section>`);}
function enterLesson(id){cleanup();lesson=LESSONS.find(l=>l.id===id)||LESSONS[0];chapter=lesson.unit;view='intro';quizSession=null;const last=normalizeStored(readStored());options=normalizeOptions(lesson,last.lessonId===lesson.id?last.options:{},preferences.bpm);options.answer='';options.answerChecked=false;notes=makeExercise(lesson.id,options);save();renderIntro();window.scrollTo(0,0);focusHeading();}
function patternDiagram(pattern,compact=false,caption=true){
 const spec=PATTERNS[pattern]||PATTERNS.individual;
 if(!spec.intervals)return '<p class="individual-pattern">音ごとに指の場所を確かめます。</p>';
 const xs=spec.intervals.map(n=>20+n*22);
 return `<div class="pattern-diagram ${compact?'compact':''}" data-pattern="${pattern}"><svg viewBox="0 0 198 82" role="img" aria-label="${spec.label}。0は開放弦"><path d="M20 30H174" stroke="#aab1bd"/>${xs.map((x,i)=>`<circle cx="${x}" cy="30" r="${i?11:9}" fill="${i?'#293f68':'white'}" stroke="#293f68"/><text x="${x}" y="34" font-size="12" text-anchor="middle" fill="${i?'white':'#293f68'}">${i}</text>${i<4?`<text x="${(x+xs[i+1])/2}" y="61" font-size="10" text-anchor="middle" fill="#485466">${spec.intervals[i+1]-spec.intervals[i]===1?'半音':'全音'}</text>`:''}`).join('')}</svg>${caption?`<p>${spec.label}</p>`:''}</div>`;
}
function practicePattern(n){
 if(lesson.type!=='major')return patternDiagram(n.pattern,true);
 const used=notes.filter(x=>!x.rest&&x.string===n.string),fingers=new Set(used.map(x=>x.finger));
 if([1,2,3,4].every(f=>fingers.has(f)))return patternDiagram(n.pattern,true);
 const labels=[...new Map(used.map(x=>[x.finger,x.finger+'：'+x.name])).values()];
 return `<div class="used-fingers"><strong>この練習で使う${n.string}線の指</strong><span>${labels.join('　')}</span></div>`;
}
function displaySettings(){return options.help==='read'?{...preferences,names:false,fingers:false,colors:false}:options.help==='finger'?{...preferences,names:false,fingers:true,colors:true}:preferences;}
function readingExercise(){return ['keyQuiz','sight'].includes(lesson?.type);}
function canStart(){return lesson?.type!=='keyQuiz'||Boolean(quizSession?.checked&&options.answerChecked&&quizSession.order[quizSession.index]===options.problem);}
function setupSteps(){return lesson.exercise?commonSteps(lesson.exercise,notes.find(n=>!n.rest).pattern):lesson.steps;}
function renderIntro(){
 const isQuiz=lesson.type==='keyQuiz',steps=setupSteps().filter(step=>step!==lesson.sub);
 const visual=isQuiz?'':lesson.exercise?patternDiagram('none',false,false):lesson.type==='lower4'?patternDiagram('34low'):`<div class="compact-score">${renderSystems(notes.filter(n=>n.bar<2),displaySettings(),2,{compact:true})}</div>`;
 shell(`<section class="lesson-page intro-page">${lessonHeader(1)}<p class="lesson-outcome">${escapeHTML(lesson.sub)}</p>${visual}<ol class="instruction-list">${steps.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>${isQuiz?field('問題の順番',choices('quizOrder',[['ordered','順番どおり'],['random','ランダム']])):''}<div class="page-action"><button class="primary" data-action="${isQuiz?'beginQuiz':'setup'}">${isQuiz?'問題をはじめる':'楽譜を見て準備する'} ${icon('arrow')}</button></div></section>`);
}
function choices(field,values){return `<div class="segmented">${values.map(([v,label,ariaLabel])=>`<button class="choice ${String(options[field])===String(v)?'selected':''}" data-option="${field}" data-value="${v}" aria-pressed="${String(options[field])===String(v)}"${ariaLabel?` aria-label="${escapeHTML(ariaLabel)}"`:''}>${label}</button>`).join('')}</div>`;}
function selectOption(field,label,values){return `<label class="select-field"><span>${label}</span><select data-select-option="${field}" aria-label="${label}">${values.map(([v,l])=>`<option value="${v}" ${String(options[field])===String(v)?'selected':''}>${l}</option>`).join('')}</select></label>`;}
function stringChoices(random=false){return `<div class="segmented strings">${Object.entries(STRINGS).map(([s,d])=>`<button class="choice string-choice ${options.string===s?'selected':''}" style="--string-color:${preferences.colors?d.color:'#202839'};--string-soft:${preferences.colors?d.soft:'#eef0f5'}" data-option="string" data-value="${s}" aria-pressed="${options.string===s}"><b>${s}</b><span>${d.name}</span></button>`).join('')}${random?`<button class="choice ${options.string==='random'?'selected':''}" data-option="string" data-value="random" aria-pressed="${options.string==='random'}">ランダム</button>`:''}</div>`;}
function field(label,body){return `<div class="field" role="group" aria-label="${escapeHTML(label)}"><span class="field-title">${label}</span>${body}</div>`;}
function pickRow(another=false){const count=lesson.exercise==='keep'?7:8;options.resolvedRow=another?(Number(options.resolvedRow||1)+Math.floor(Math.random()*(count-1)))%count+1:Math.floor(Math.random()*count)+1;}
function exerciseControls(){
 const t=lesson.type;let fields='';
 if(lesson.exercise||t==='lower4')fields=field('弦',stringChoices());
 if(t==='major')fields=selectOption('scale','調',lesson.scales.map(v=>[v,MAJORS[v].label]));
 if(t==='minor')fields=selectOption('minor','調',Object.entries(MINORS).map(([v,d])=>[v,d.label]));
 if(t==='song')fields=field('調',choices('songKey',[['F','ヘ長調'],['Bb','変ロ長調'],['C','ハ長調']]));
 if(lesson.exercise==='keep')fields+=selectOption('row','音の順番',FORM_LABELS.map((f,i)=>[i+1,f]));
 return fields;
}
function helpControl(){return selectOption('help','ヒント',[['full','形・指番号・音名'],['finger','指番号と弦の色'],['read','ヒントなし']]);}
function playingControls(){return `${field('進め方',choices('mode',[['wait','1音ずつ'],['continuous','テンポで通す']]))}<div class="audio-options"><div class="tempo-field"><label for="tempoValue">テンポ（${tempoUnit(notes[0])}＝1拍）</label><div><button class="quiet tempo-step" data-action="slower" aria-label="テンポを5下げる">−</button><output id="tempoValue" aria-live="polite">${options.bpm}</output><span>BPM</span><button class="quiet tempo-step" data-action="faster" aria-label="テンポを5上げる">＋</button></div></div><label class="mic-toggle"><span>マイク</span><input type="checkbox" role="switch" aria-label="マイク" data-mic ${options.mic?'checked':''}><span aria-hidden="true">${options.mic?'オン':'オフ'}</span></label></div>`;}
function startButton(){return `<div id="startError" role="alert"></div><button class="primary start-button" data-action="start" ${canStart()?'':'disabled'}>${icon('play')}${isWaiting()?'この楽譜を弾く':`${notes[0].meter}拍数えて弾く`}</button><p class="start-hint">${isWaiting()?(options.mic?'音が合うと、次の音へ進みます。':'弾いたら「次の音へ」を押します。'):'お手本と拍に合わせて進みます。'}</p>`;}
function renderSetup(){
 if(lesson.type==='keyQuiz'){view=quizSession?'quiz':'intro';render();return;}
 options=normalizeOptions(lesson,options,preferences.bpm);notes=makeExercise(lesson.id,options);save();const bars=notes.at(-1).bar+1,preview=notes.filter(n=>n.bar<4);
 shell(`<section class="lesson-page setup-page">${lessonHeader(2)}<div class="exercise-controls">${exerciseControls()}</div><section class="score-preview" aria-label="練習の楽譜"><div class="section-line"><h2>${bars>4?'はじめの4小節':'弾く楽譜'}</h2></div><div class="compact-score">${renderSystems(preview,displaySettings(),2,{compact:true})}</div>${bars>4?'<button class="quiet full-score-link" data-action="fullScore">全体の楽譜を見る</button>':''}</section><div class="start-column">${helpControl()}${playingControls()}${startButton()}</div></section>`);
}
function beginQuiz(){
 const order=quizDeck(lesson);
 if(options.quizOrder==='random')for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 quizSession={order,index:0,checked:false,results:[]};loadQuestion();
}
function loadQuestion(){
 options.problem=quizSession.order[quizSession.index];options.answer='';options.answerChecked=false;options.help='read';quizSession.checked=false;
 notes=makeExercise(lesson.id,options);view='quiz';save();renderQuiz();window.scrollTo(0,0);focusHeading();
}
function checkAnswer(){
 if(!quizSession||quizSession.checked||!options.answer)return;
 quizSession.checked=true;options.answerChecked=true;quizSession.results.push(options.answer===quizFor(options).answer);save();renderQuiz();$('#quizFeedback')?.focus({preventScroll:true});
}
function renderQuiz(){
 if(!quizSession){view='intro';renderIntro();return;}
 const q=quizFor(options),checked=quizSession.checked,correct=options.answer===q.answer;
 const names=notes.slice(0,4).map(n=>n.name).join('・');
 const reason=q.answer==='none'?'1〜4の指の間は、どこも全音です。':`${q.answer[0]}と${q.answer[1]}の間が半音です。`;
 const answers=['none','23','12','34'].map(p=>`<button class="answer-choice ${options.answer===p?'selected':''}" data-option="answer" data-value="${p}" aria-pressed="${options.answer===p}" ${checked?'disabled':''}>${PATTERNS[p].label}</button>`).join('');
 shell(`<section class="lesson-page quiz-page"><div class="lesson-toolbar"><button class="quiet" data-action="chapters">${icon('back')}練習の一覧</button><span class="question-count">${quizSession.index+1} / ${quizSession.order.length}問</span></div><p class="eyebrow">${lesson.title}</p><h1>${q.string}線の指の形は？</h1><section class="question-score" aria-label="問題の楽譜">${renderSystems(notes,{names:false,fingers:false,colors:false},2,{compact:true})}</section>${checked?`<section id="quizFeedback" class="quiz-feedback ${correct?'correct':'incorrect'}" role="status" tabindex="-1"><h2>${correct?'正解です':'違います'}</h2><p class="answer-label">正しい形：${PATTERNS[q.answer].label}</p><p>選んだ答え：${PATTERNS[options.answer].label}</p><p>${q.string}線は${names}。${reason}</p></section><div class="start-column">${helpControl()}${playingControls()}${startButton()}</div>`:`<div class="answer-grid" role="group" aria-label="指の形を答える">${answers}</div><button class="primary" data-action="checkAnswer" ${options.answer?'':'disabled'}>答えを確かめる</button>`}</section>`);
}
function nextQuestion(){
 if(!quizSession||view!=='finish')return;
 if(quizSession.index+1===quizSession.order.length){view='quizSummary';renderQuizSummary();focusHeading();return;}
 quizSession.index++;loadQuestion();
}
function renderQuizSummary(){
 shell(`<section class="finish-page"><p class="eyebrow">${lesson.title}</p><h1>問題を終えました。</h1><p>最初に形を選べた問題<br><strong>${quizSession.results.filter(Boolean).length} / ${quizSession.order.length}問</strong></p><p>次は曲の調号を見て、指の形を決めてみましょう。</p><button class="primary" data-lesson="song1">きらきら星を弾く</button><button class="secondary" data-action="beginQuiz">もう一度問題を解く</button><button class="quiet" data-action="allChapters">すべての章へ</button></section>`);window.scrollTo(0,0);
}
function renderPractice(){
 const p=practice;
 shell(`<section class="performance-viewport ${options.mic?'with-mic':''}" id="performanceViewport"><header class="practice-top"><button class="icon-button" data-action="exitPractice" aria-label="準備へ戻る">${icon('back')}</button><div class="practice-title"><h1>${lesson.title}</h1><p>${options.bpm} BPM（${tempoUnit(notes[0])}） · ${isWaiting()?'1音ずつ':'テンポで通す'}</p></div><span id="sessionProgress"></span></header><div class="progress"><span id="sessionBar"></span></div><div class="performance-body"><section class="music-panel" id="currentNote"><div class="playing-head"><span id="phaseLabel">準備中</span><span id="barLabel"></span></div><div class="current-and-next"><div class="now-label"><strong id="noteHeading"></strong><span id="stringLabel"></span></div><div class="next-label"><small>次は</small><strong id="nextNote"></strong><span id="nextHint"></span><div id="nextScore"></div></div></div><div class="score-stage"><div id="noteScore"></div><div id="countdownArea" class="countdown-area" hidden><span>準備</span><strong id="countNumber">1</strong><span>／ ${notes[0].meter}</span></div></div><div class="timing-row"><div id="durationCopy" class="duration-copy"></div><div class="beat-track" id="beatTrack">${Array.from({length:notes[0].meter},(_,i)=>i+1).map(b=>`<span class="beat" data-beat="${b}">${b}</span>`).join('')}</div></div><div class="note-progress"><span id="noteProgress"></span></div></section><section class="guidance-panel">${options.mic?renderMeter():'<p class="listening-label">お手本と、自分の音を聴き比べよう。</p>'}</section></div><footer class="performance-footer"><div class="practice-controls"><button class="secondary" data-action="pause" id="pauseBtn">${icon('pause')}一時停止</button><button class="secondary" data-action="reference" id="referenceBtn">${icon('sound')}お手本</button><button class="primary" data-action="next" id="nextBtn" ${isWaiting()?'':'hidden'}>${options.mic?'手送り':'次の音へ'}${icon('arrow')}</button></div><div class="below-hint"><span>${options.mic?'A='+preferences.a4+' · ±'+DIFFICULTIES[preferences.difficulty]+'¢':'マイクなし・手送りかテンポ'}</span><a href="#fullScore">全体の楽譜 ↓</a></div></footer></section><section class="practice-help"><details><summary>今の指を確かめる</summary><div id="livePattern"></div><p id="coachText"></p></details></section><section class="full-score-section" id="fullScore"><div class="section-line"><h2>楽譜を見ながら</h2><span id="scorePageLabel"></span></div><div id="practiceScore"></div><a class="quiet" href="#performanceViewport">演奏画面へ ↑</a></section>`,true);
 updateNote(true);if(p.phase==='starting'){$('#phaseLabel').textContent=options.mic?'マイクを準備しています':'音を準備しています';for(const id of ['pauseBtn','referenceBtn','nextBtn'])$('#'+id).disabled=true;}
}
function finishPractice(){
 const completed=options.mic&&notes.filter(n=>!n.rest).every(n=>practice.passed.has(n.index)),manual=notes.filter(n=>!n.rest).length-(practice.passed?.size||0);
 cleanup();if(completed)audio.complete();view='finish';
 const q=lesson.type==='keyQuiz',next=LESSONS[LESSONS.findIndex(l=>l.id===lesson.id)+1];
 shell(`<section class="finish-page"><div class="finish-mark">${icon('check')}</div><p class="eyebrow">${lesson.title}</p><h1>${completed?'音程を確かめました。':'最後まで進みました。'}</h1><p>${options.mic?(manual?`手送りした音は${manual}音。気になる所をもう一度。`:'次はヒントを減らして、同じ楽譜を読みましょう。'):'弾きにくかった小節を、1音ずつ確かめてみましょう。'}</p><p class="helper">音程の確認です。指や弓の使い方は判定していません。</p>${q?`<button class="primary" data-action="nextQuestion">${quizSession.index+1<quizSession.order.length?'次の問題':'結果を見る'} ${icon('arrow')}</button>`:`<button class="primary" data-action="lessHelp">ヒントを減らして弾く</button>`}<button class="secondary" data-action="repeat">もう一度弾く</button>${!q&&next?`<button class="secondary" data-lesson="${next.id}">次の練習：${next.title}</button>`:''}<button class="quiet" data-action="setup">準備に戻る</button><button class="quiet" data-action="chapters">練習の一覧へ</button></section>`);window.scrollTo(0,0);focusHeading();
}
function settingToggle(key,title,description){return `<label class="toggle-row"><span><strong>${title}</strong><small>${description}</small></span><input type="checkbox" data-pref="${key}" ${preferences[key]?'checked':''}></label>`;}
function renderSettings(){shell(`<section class="settings-page"><button class="quiet" data-action="closeSettings">${icon('back')}戻る</button><h1>設定</h1><section><h2>楽譜のヒント</h2>${settingToggle('colors','弦の色','G 青 · D オレンジ · A 赤 · E 緑')}${settingToggle('fingers','指番号','0は開放弦、1〜4は左手の指')}${settingToggle('names','音名・弦名','五線の下のヒントと現在の音名')}</section><section><h2>音とマイク</h2>${settingToggle('reference','お手本の自動再生','マイク使用中は止まります')}${settingToggle('click','拍のクリック','テンポで通すときだけ鳴ります')}${settingToggle('correctTone','合ったときの音','合ったら、その音の高さを短く鳴らします')}${settingToggle('correctionTone','外れたときの正しい音','外れた音が続くと、正しい高さを1秒鳴らします')}<label class="select-field"><span>マイク感度</span><select id="sensitivity">${[['normal','ふつう'],['high','高め'],['ultra','とても高め']].map(([v,l])=>`<option value="${v}" ${preferences.sensitivity===v?'selected':''}>${l}</option>`).join('')}</select></label><label class="select-field"><span>合格範囲</span><select id="difficulty">${[['easy','緩め · ±15¢'],['normal','普通 · ±8¢'],['strict','厳しめ · ±5¢']].map(([v,l])=>`<option value="${v}" ${preferences.difficulty===v?'selected':''}>${l}</option>`).join('')}</select></label><label class="select-field"><span>基準のラ</span><select id="a4">${[442,440].map(v=>`<option value="${v}" ${preferences.a4===v?'selected':''}>A=${v} Hz</option>`).join('')}</select></label><p class="helper">セントは半音を100に分けた単位です。中央の目標に合わせます。目標音程は弦楽器の旋律向けで、平均律のチューナーとは少し異なります。最初は「緩め」を使えます。</p></section><details><summary>このアプリについて</summary><p>調号から指の形を決め、曲で確かめる7章です。形の練習、音階、調号の問題、臨時記号、短音階、歌、読譜へ進みます。</p><p>練習履歴は保存しません。音声は端末内で処理し、録音・送信しません。最後に選んだ練習と、表示・音の設定だけを保存します。</p><p>マイクは単音の音程を判定します。合うとその音の高さを短く、範囲外で音が落ち着くと正しい高さを1秒鳴らします。どちらも設定で止められます。音が鳴ったあとは、いったん弓を止めてから弾き直します。実際の指・弦・姿勢・音色・リズム・和音は判定しません。お手本を使っても合格表示は同じなので、独力で読めたという評価には使いません。お手本は合成音です。</p><details><summary>楽譜の字形・ライセンス</summary><p>Bravuraの字形を使用しています。</p><pre>${escapeHTML(BRAVURA_LICENSE)}</pre></details></details>${!storageAvailable?'<p class="error">この環境では設定を保存できません。</p>':''}</section>`);}
function showFullScore(){const dialog=document.createElement('dialog');dialog.className='score-dialog';dialog.innerHTML=`<header><h2>全${notes.at(-1).bar+1}小節の楽譜</h2><button class="quiet" data-action="closeDialog">閉じる ${icon('close')}</button></header><div>${renderSystems(notes,displaySettings(),2)}</div>`;document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();}
async function requestWake(){try{wakeLock=await navigator.wakeLock?.request('screen');}catch{}}
function cleanup(){sessionToken++;cancelAnimationFrame(raf);clearInterval(previewTimer);audio.stop();mic.stop();wakeLock?.release().catch(()=>{});wakeLock=null;practice=null;}
function isWaiting(){return options.mic||options.mode==='wait';}
async function startPractice(){
 clearInterval(previewTimer);if(!canStart())return;const token=++sessionToken;audio.stop();mic.stop();view='practice';
 judge.reset();if(options.mic&&audio.silentUntil>audio.time)judge.block('success',audio.time*1000,0);practice={passed:new Set(),phase:'starting',index:0,group:-1,baseTime:0,startIndex:0,queue:[],cue:0,acceptedAt:null,hold:null,lastMicAt:0,feedback:'',count:null};
 preferences.bpm=options.bpm;save();renderPractice();window.scrollTo(0,0);
 try{await audio.init();if(token!==sessionToken)return;if(options.mic){const active=await mic.start();if(token!==sessionToken)return;if(!active)throw new Error('マイクを開始できませんでした。');}if(token!==sessionToken)return;await requestWake();if(token!==sessionToken)return;beginTransport(0);}catch(e){if(token!==sessionToken)return;cleanup();view='setup';renderSetup();$('#startError').innerHTML=`<p class="error">${escapeHTML(e.name==='NotAllowedError'?'マイクの許可が得られませんでした。ブラウザの設定で許可するか、マイクなしで進めてください。':e.message)}</p><button class="secondary" data-action="startNoMic">マイクなしで始める</button>`;$('#startError').scrollIntoView({block:'center'});}
}
function beginTransport(index){
 const p=practice;if(!p)return;const plan=transportStart(options.mode,options.mic);if(plan.counts)plan.counts=notes[index].meter;p.phase=plan.phase;p.index=index;p.startIndex=index;p.baseTime=audio.time+(plan.counts ? .12 : 0);p.queue=[];p.cue=0;p.count=null;p.acceptedAt=null;judge.nextNote();
 const spb=60/options.bpm;for(let i=0;i<plan.counts;i++)p.queue.push({at:p.baseTime+i*spb,type:'click',accent:i===0});
 p.musicTime=p.baseTime+plan.counts*spb;p.hold=p.musicTime;
 if(!isWaiting()){
  const events=notes.slice(index),offset=notes[index].start;
  if(preferences.click&&!options.mic){
   const starts=events.filter((n,i)=>i===0||n.bar!==events[i-1].bar);
   for(const n of starts){const phase=n.beatInBar%1,first=n.start+(phase?1-phase:0);for(let b=first;b<n.barStart+n.barDuration-1e-8;b++)p.queue.push({at:p.musicTime+(b-offset)*spb,type:'click',accent:beatAt(n,b)===1});}
  }
  if(preferences.reference&&!options.mic)for(const n of events)if(!n.rest&&(!n.tieFromPrevious||n.index===index)){let end=n.index;while(notes[end].tieToNext&&notes[end+1])end++;p.queue.push({at:p.musicTime+(n.start-offset)*spb,type:'note',n,duration:(notes[end].end-n.start)*spb*.94});}
 }
 p.queue.sort((a,b)=>a.at-b.at);$('#performanceViewport').dataset.phase=p.phase;$('#pauseBtn').disabled=false;$('#referenceBtn').disabled=false;$('#nextBtn').disabled=false;$('#pauseBtn').innerHTML=icon('pause')+'一時停止';$('#nextBtn').hidden=!isWaiting();updateNote(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function tick(){
 const p=practice;if(!p||!['countdown','playing'].includes(p.phase))return;
 const now=audio.time,spb=60/options.bpm;
 while(p.cue<p.queue.length&&p.queue[p.cue].at<now+.12){const cue=p.queue[p.cue++];if(cue.at<now-.15)continue;if(cue.type==='click')audio.click(Math.max(now,cue.at),cue.accent);else playNote(cue.n,Math.max(now,cue.at),cue.duration??cue.n.beats*spb*.94);}
 if(now<p.musicTime){
  const count=Math.min(notes[0].meter,Math.max(1,Math.floor((now-p.baseTime)/spb)+1));if(count!==p.count){p.count=count;$('#countNumber').textContent=count;$('#phaseLabel').textContent=`${notes[0].meter}つ数えたら、はじめよう`;$('#countdownArea').hidden=false;$('#noteScore').classList.add('counting');$('#durationCopy').hidden=true;$('#referenceBtn').disabled=true;$('#nextBtn').disabled=true;setBeat(count);}
 }else{
  if(p.phase==='countdown'){p.phase='playing';$('#performanceViewport').dataset.phase='playing';$('#countdownArea').hidden=true;$('#noteScore').classList.remove('counting');$('#durationCopy').hidden=false;$('#referenceBtn').disabled=false;$('#nextBtn').disabled=false;judge.nextNote();p.hold=now;updateNote(true);}
  if(p.phase==='playing'){
   let elapsed=isWaiting()?now-p.hold:(now-p.musicTime)/spb;
   if(!isWaiting()){
    const position=elapsed+notes[p.startIndex].start,end=notes.at(-1).end;
    if(position>=end){finishPractice();return;}
    else{const index=notes.findIndex(n=>position>=n.start&&position<n.end);if(index>=0&&index!==p.index){p.index=index;p.acceptedAt=null;judge.nextNote();updateNote(true);}const n=notes[p.index],progress=Math.min(1,(position-n.start)/n.beats);$('#noteProgress').style.width=`${progress*100}%`;setBeat(beatAt(n,position));$('#durationCopy').innerHTML=`<strong>${Math.max(0,Math.ceil((n.end-position)*2)/2)}</strong>拍 ${n.rest?'休もう':'音を続けよう'}`;}
   }else{
    const n=notes[p.index];if(n.rest){$('#noteProgress').style.width=`${Math.min(1,elapsed/(n.beats*spb))*100}%`;if(elapsed>=n.beats*spb){advanceNote();return;}}
    else if(p.acceptedAt!==null&&now-p.acceptedAt>.5){advanceNote();return;}
   }
   if(options.mic&&now-p.lastMicAt>.06){p.lastMicAt=now;observeMic(now);}
  }
 }
 if(practice===p)raf=requestAnimationFrame(tick);
}
function setBeat(beat){document.querySelectorAll('[data-beat]').forEach(el=>{el.classList.toggle('on',Number(el.dataset.beat)===beat);el.hidden=practice?.phase==='playing'&&Number(el.dataset.beat)>(notes[0].meter||4);});}
function playNote(n,at=audio.time,duration=AUDIO_CUES.reference.duration){if(n.rest)return;const voices=n.chord||[n];voices.forEach(x=>audio.toneHz(targetForNote(x,preferences).targetHz,duration,at,AUDIO_CUES.reference.volume/Math.sqrt(voices.length)));}
function updateNote(force=false){
 const prefs=displaySettings(),full=options.help==='full',read=options.help==='read';const p=practice;if(!p)return;const n=notes[p.index],next=notes[p.index+1],color=n.rest?'#7c8977':prefs.colors?STRINGS[n.string].color:'#263d38',soft=n.rest?'#edf0e5':prefs.colors?STRINGS[n.string].soft:'#edf0e5';
 $('#currentNote').style.setProperty('--note-color',color);$('#currentNote').style.setProperty('--note-soft',soft);
 $('#noteHeading').innerHTML=musicText(n.rest?'休符':n.chord?.length>1?n.chord.map(x=>x.string).join('＋')+'線':n.string+'線'+(prefs.names?'・'+n.name:''));
 $('#stringLabel').textContent=n.rest?'休符':n.finger===0?(n.chord?.length>1?'2本の開放弦を一緒に':'開放弦'):(prefs.fingers?n.finger+' の指':'押さえて弾く');
 $('#noteScore').className='current-score';$('#noteScore').innerHTML=renderScore(notes.filter(z=>z.bar===n.bar),prefs,Math.floor(n.bar/4));$('#durationCopy').innerHTML=isWaiting()&&!n.rest?(options.mic?'音が合うまで、自分のペースで':'弾けたら「次の音へ」'):`<strong>${n.beats===.5?'½':n.beats}</strong>拍 ${n.rest?'休もう':'音を続けよう'}`;
 $('#coachText').innerHTML=musicText(full?instructionFor(n,notes[p.index-1],lesson.type):'調号と臨時記号を見て、音を確かめよう。');$('#livePattern').innerHTML=full&&!n.rest?practicePattern(n):'';$('#nextNote').innerHTML=musicText(next?(next.rest?'休み':next.chord?.length>1?next.chord.map(z=>z.string).join('＋'):(prefs.names?next.name:next.string+'線')):'おしまい');$('#nextHint').textContent=next?(next.rest?'弓を止めて、次の準備。':next.string+'線 · '+(prefs.fingers?next.finger+'の指 · ':'')+next.beats+'拍'):'最後の音を、ていねいに。';
 if(read){$('#noteHeading').innerHTML=musicText(n.rest?'休符':'楽譜の音');$('#stringLabel').textContent='';$('#nextNote').innerHTML=musicText(next?(next.rest?'休符':'次の音'):'おしまい');$('#nextHint').textContent=next?next.beats+'拍':'';}
 $('#sessionProgress').textContent=`${p.index+1} / ${notes.length}`;$('#sessionBar').style.width=`${p.index/notes.length*100}%`;$('#phaseLabel').textContent=n.rest?'音を止めよう':isWaiting()?'この音を、弾いてみよう':'いま弾く音';$('#barLabel').textContent=`${n.bar+1} 小節目`;$('#noteProgress').style.width='0%';
 $('#nextScore').innerHTML=renderNext(next,prefs);setBeat(beatAt(n));
 const group=Math.floor(n.bar/4);if(!p.scoreRendered){$('#practiceScore').innerHTML=renderSystems(notes,displaySettings(),2);p.scoreRendered=true;}p.group=group;$('#scorePageLabel').textContent=`全${notes.at(-1).bar+1}小節 · 今 ${n.bar+1}小節目`;
 document.querySelectorAll('[data-score-index]').forEach(el=>{el.classList.toggle('active',Number(el.dataset.scoreIndex)===p.index);el.classList.toggle('passed',Number(el.dataset.scoreIndex)<p.index);});
 if($('#micFeedback')){$('#micFeedback').textContent=n.rest?'休符では、音を止めよう。':'音を待っています';$('#micFeedback').classList.remove('ok');p.feedback='';}
 if(isWaiting())setBeat(beatAt(n));if(options.mic)updateMeter(null,n);
}
function renderMeter(){return `<section class="pitch-meter" aria-label="音程"><div class="meter-labels"><span>低い</span><span>正解</span><span>高い</span></div><div class="meter-track" id="pitchMeter" role="meter" aria-label="目標からの音程差" aria-valuemin="-50" aria-valuemax="50" aria-valuenow="0" aria-valuetext="音を待っています"><span id="pitchBand" class="pitch-band"></span><span class="meter-center"></span><span id="pitchNeedle" class="pitch-needle" hidden></span></div><div class="meter-reading"><strong id="pitchDirection">音を待っています</strong><output id="pitchCents">— ¢</output></div><div class="mic-status"><div class="mic-bar" role="meter" aria-label="マイクの音量" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="micLevel"></span></div><p id="micFeedback" role="status">音を待っています</p></div></section>`;}
function updateMeter(reading,n,muted=false){
 const range=targetForNote(n,preferences),meter=$('#pitchMeter');if(!meter)return;
 const low=range?.lowCents??-DIFFICULTIES[preferences.difficulty],high=range?.highCents??DIFFICULTIES[preferences.difficulty];$('#pitchBand').style.left=(50+low)+'%';$('#pitchBand').style.width=(high-low)+'%';meter.dataset.low=low;meter.dataset.high=high;
 const valid=range&&reading?.frequency&&!muted;
 $('#pitchNeedle').hidden=!valid;
 if(!valid){$('#pitchDirection').textContent=muted?'判定停止':n.rest?'休符':'音を待っています';$('#pitchCents').textContent='— ¢';meter.setAttribute('aria-valuetext',$('#pitchDirection').textContent);meter.dataset.direction='';return;}
 const value=pitchFeedback(reading.frequency,n,range,preferences.a4);
 if((n.signature<0||n.alteration<0)&&value.text.includes('に聞こえる')){const heard=Math.round(69+12*Math.log2(reading.frequency/preferences.a4));value.text=['ド','レ♭','レ','ミ♭','ミ','ファ','ソ♭','ソ','ラ♭','ラ','シ♭','シ'][((heard%12)+12)%12]+'に聞こえる・'+(value.cents>0?'低くして':'高くして');}
 $('#pitchNeedle').style.left=(50+value.position)+'%';$('#pitchDirection').textContent=value.centsText?value.direction:'';$('#pitchCents').textContent=value.centsText;meter.setAttribute('aria-valuenow',value.position.toFixed(1));meter.setAttribute('aria-valuetext',value.text+(value.centsText?' '+value.centsText:''));meter.dataset.direction=value.direction;feedback(value.text);return value;
}
function observeMic(now){
 const p=practice,n=notes[p.index];if(n.tieFromPrevious&&p.acceptedAt!==null)return;const r=mic.read(preferences.sensitivity),level=Math.min(100,r.rms*3000);
 $('#micLevel').style.width=`${level}%`;$('.mic-bar').setAttribute('aria-valuenow',Math.round(level));
 if(n.rest){judge.nextNote();updateMeter(null,n);feedback('休符では音を止めます');return;}
 const before=judge.state,range=targetForNote(n,preferences),result=judge.observe(r,range,now*1000,preferences.sensitivity,{correct:preferences.correctTone,correction:preferences.correctionTone}),muted=judge.state!=='listening';
 $('#performanceViewport').dataset.micState=judge.state;$('#nextBtn').disabled=muted;$('#referenceBtn').disabled=muted;
 if(result==='correct'){updateMeter(r,n);p.passed.add(n.index);p.acceptedAt=now;if(preferences.correctTone)audio.success(range.targetHz);feedback('ちょうど。次の音へ進みます',true);$('#noteProgress').style.width='100%';return;}
 if(result==='wrong'){updateMeter(r,n);audio.correction(range.targetHz);feedback('正しい音を1秒鳴らします');return;}
 if(p.acceptedAt!==null)return;
 updateMeter(r.frequency&&r.confidence>=MIC_LEVELS[preferences.sensitivity].confidence?r:null,n,muted);
 if(muted)feedback(judge.state==='correction'?'正しい音を聴きます':judge.state==='reference'?'お手本を聴きます':judge.state==='awaitSilence'?'弓を止めてから、弾き直します':'音が止まるのを待っています');
 else if(before!=='listening'||!r.frequency)feedback('音を待っています');
}
function feedback(message,ok=false){if(practice?.feedback===message)return;practice.feedback=message;$('#micFeedback').innerHTML=musicText(message);$('#micFeedback').classList.toggle('ok',ok);}
function advanceNote(){
 const p=practice;if(!p||p.phase!=='playing'||!isWaiting())return;
 if(p.index>=notes.length-1){finishPractice();return;}const tied=notes[p.index+1]?.tieFromPrevious&&p.passed.has(p.index);p.index++;p.hold=audio.time;p.acceptedAt=tied?audio.time:null;if(tied)p.passed.add(p.index);judge.nextNote();updateNote(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function pausePractice(){
 const p=practice;if(!p||p.phase==='paused'||p.phase==='starting')return;p.phase='paused';$('#performanceViewport').dataset.phase='paused';audio.stop();mic.stop();cancelAnimationFrame(raf);judge.nextNote();wakeLock?.release().catch(()=>{});wakeLock=null;$('#countdownArea').hidden=true;$('#noteScore').classList.remove('counting');$('#durationCopy').hidden=false;$('#phaseLabel').textContent='一時停止';$('#coachText').textContent=isWaiting()?'再開すると、すぐ今の音から始めます。':`再開すると、${notes[0].meter}拍数えて今の音から始めます。`;$('#pauseBtn').innerHTML=icon('play')+'再開する';$('#nextBtn').disabled=true;$('#referenceBtn').disabled=true;
}
async function resumePractice(){const p=practice;if(!p||p.phase!=='paused')return;const token=++sessionToken;$('#pauseBtn').disabled=true;try{await audio.init();if(token!==sessionToken)return;if(options.mic){const ok=await mic.start();if(!ok||token!==sessionToken)return;}await requestWake();if(token!==sessionToken)return;beginTransport(p.index);}catch(e){if(token!==sessionToken)return;$('#pauseBtn').disabled=false;toast('再開できませんでした。マイクの許可を確認してください。');}}
function previewCount(){clearInterval(previewTimer);let seconds=30;const update=()=>{const el=$('#previewClock');if(!el){clearInterval(previewTimer);return;}el.textContent=seconds>0?`楽譜を見る時間：あと ${seconds} 秒`:'準備できたら「練習をはじめる」を押そう。';if(seconds<=0)clearInterval(previewTimer);seconds--;};update();previewTimer=setInterval(update,1000);}

function rerenderKeepingFocus(el){const selector=el.dataset.option?`[data-option="${el.dataset.option}"][data-value="${el.dataset.value}"]`:el.dataset.selectOption?`[data-select-option="${el.dataset.selectOption}"]`:el.hasAttribute('data-mic')?'[data-mic]':null;if(view==='quiz')renderQuiz();else if(view==='intro')renderIntro();else renderSetup();if(selector)$(selector)?.focus({preventScroll:true});}
document.addEventListener('click',async event=>{
 const el=event.target.closest('button');if(!el||el.disabled)return;
 if(el.dataset.nav){if(el.dataset.nav==='home')chapter=null;navigate(el.dataset.nav);return;}
 if(el.hasAttribute('data-chapter')){chapter=Number(el.dataset.chapter);renderHome();window.scrollTo(0,0);focusHeading();return;}
 if(el.dataset.menu){sourceMenu=el.dataset.menu;navigate('sourceList');return;}
 if(el.dataset.lesson){enterLesson(el.dataset.lesson);return;}
 if(el.dataset.option){clearInterval(previewTimer);options[el.dataset.option]=el.dataset.value;if(el.dataset.option==='answer'){if(quizSession?.checked)return;options.answerChecked=false;}if(el.dataset.option==='mode'&&el.dataset.value==='continuous')options.mic=false;rerenderKeepingFocus(el);return;}
 switch(el.dataset.action){
  case 'allChapters':chapter=null;navigate('home');break;
  case 'chapters':navigate('home');break;
  case 'addList':case 'varietyList':navigate(el.dataset.action);break;
  case 'intro':navigate('intro');break;
  case 'setup':navigate('setup');break;
  case 'settings':settingsReturn=view==='practice'?'setup':view; navigate('settings');break;
  case 'closeSettings':navigate(['home','sourceList','addList','varietyList','intro','setup','quiz','quizSummary'].includes(settingsReturn)?settingsReturn:'home');break;
  case 'checkAnswer':checkAnswer();break;
  case 'beginQuiz':beginQuiz();break;
  case 'nextQuestion':nextQuestion();break;
  case 'lessHelp':options.help=options.help==='full'?'finger':'read';navigate('setup');break;
  case 'start':await startPractice();break;
  case 'startNoMic':options.mic=false;await startPractice();break;
  case 'pause':if(practice?.phase==='paused')await resumePractice();else pausePractice();break;
  case 'next':advanceNote();break;
  case 'reference':if(practice?.phase==='playing'&&!notes[practice.index].rest){if(options.mic)judge.block('reference',audio.time*1000);else judge.nextNote();playNote(notes[practice.index]);if($('#micFeedback'))feedback('お手本を聴いてから、弾いてみよう。');}break;
  case 'exitPractice':navigate('setup');break;
  case 'repeat':await startPractice();break;
  case 'previewTimer':previewCount();break;
  case 'anotherRow':pickRow(true);renderSetup();break;
  case 'slower':case 'faster':options.bpm=Math.min(180,Math.max(40,options.bpm+(el.dataset.action==='faster'?5:-5)));$('#tempoValue').textContent=options.bpm;save();break;
  case 'fullScore':showFullScore();break;
  case 'closeDialog':el.closest('dialog')?.close();break;
 }
});
document.addEventListener('change',event=>{const el=event.target;
 if(el.dataset.selectOption){clearInterval(previewTimer);options[el.dataset.selectOption]=el.value;if(el.dataset.selectOption==='problem'){options.answer='';options.answerChecked=false;}if(el.dataset.selectOption==='row'&&el.value==='random')pickRow();if(el.dataset.selectOption==='mode'&&el.value==='continuous')options.mic=false;rerenderKeepingFocus(el);}
 else if(el.dataset.pref){preferences[el.dataset.pref]=el.checked;save();}
 else if(el.id==='sensitivity'){preferences.sensitivity=el.value;save();}
 else if(el.id==='difficulty'){preferences.difficulty=el.value;save();}
 else if(el.id==='a4'){preferences.a4=Number(el.value);save();}
 else if(el.hasAttribute('data-mic')){options.mic=el.checked;if(options.mic)options.mode='wait';rerenderKeepingFocus(el);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&practice&&['playing','countdown'].includes(practice.phase))pausePractice();});
window.addEventListener('pagehide',cleanup);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&practice)pausePractice();});
for(const event of ['online','offline'])window.addEventListener(event,()=>{const el=$('.offline-note');if(el)el.hidden=navigator.onLine;});
renderHome();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
