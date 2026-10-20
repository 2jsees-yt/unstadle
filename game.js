// UnstableDle v3. Edit CHARACTERS to correct or expand the character database.
// Unknown values are intentionally left unconfirmed. Subscriber counts need a shared snapshot date.
const CHARACTERS=[
{name:"ParrotX2",display:"Parrot",nationality:"Unknown",subscribers:null,status:"Alive",dimension:"Unknown",debutArc:"Button Arc",pronouns:"He/Him",role:"Protagonist"},
{name:"Wemmbu",display:"Wemmbu",nationality:"Unknown",subscribers:null,status:"Alive",dimension:"Unknown",debutArc:"Exploit Arc",pronouns:"He/Him",role:"Protagonist"},
{name:"SpokeIsHere",display:"Spoke",nationality:"Unknown",subscribers:null,status:"Alive",dimension:"Unknown",debutArc:"Exploit Arc",pronouns:"He/Him",role:"Protagonist"},
{name:"FlameFrags",display:"FlameFrags",nationality:"Unknown",subscribers:null,status:"Alive",dimension:"Unknown",debutArc:"Toxic Players Arc",pronouns:"He/Him",role:"Protagonist"},
{name:"Mapicc",display:"Mapicc",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"},
{name:"Wifies",display:"Wifies",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"},
{name:"ClownPierce",display:"ClownPierce",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"ClownPierce Arc",pronouns:"Unknown",role:"Supporting"},
{name:"PrinceZam",display:"PrinceZam",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Zam Arc",pronouns:"Unknown",role:"Antagonist"},
{name:"JumperWho",display:"JumperWho",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"},
{name:"Rekrap2",display:"Rekrap2",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"},
{name:"Kenadian",display:"Kenadian",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"},
{name:"Squiddo",display:"Squiddo",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Exploit Arc",pronouns:"Unknown",role:"Supporting"},
{name:"Ashswagg",display:"Ashswagg",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"},
{name:"Boosfer",display:"Boosfer",nationality:"Unknown",subscribers:null,status:"Unknown",dimension:"Unknown",debutArc:"Unknown",pronouns:"Unknown",role:"Supporting"}
];
const FIELDS=[["nationality","Nationality"],["subscribers","Subscribers"],["status","Status"],["dimension","Dimension"],["debutArc","Debut Arc"],["pronouns","Pronouns"],["role","Role"]];
const $=id=>document.getElementById(id),now=new Date(),dateKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`,day=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000),target=CHARACTERS[((day%CHARACTERS.length)+CHARACTERS.length)%CHARACTERS.length];
let guesses=[],selected=null,solved=false,active=-1,stats=loadStats();const sk="unstabledle-v3-stats",dk="unstabledle-v3-day";
// Subscriber counts are refreshed daily by the GitHub Actions workflow.
// The static JSON keeps the YouTube API key out of the browser.
async function loadSubscriberCounts(){
  try {
    const response = await fetch("./subscribers.json?cacheBust=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Subscriber data unavailable");
    const data = await response.json();
    for (const character of CHARACTERS) {
      const count = data.subscribers?.[character.name];
      if (Number.isFinite(count)) character.subscribers = count;
    }
    const stamp = data.updatedAt ? new Date(data.updatedAt).toLocaleDateString("en-US") : null;
    if (stamp) $("subscriber-update").textContent = "Subscriber data updated: " + stamp;
    if (guesses.length) draw();
  } catch (error) {
    const note = $("subscriber-update");
    if (note) note.textContent = "Subscriber data unavailable; subscriber tiles may show Unknown.";
    console.warn("Could not load subscriber counts:", error);
  }
}

$("date").textContent="Daily puzzle · "+dateKey;
function loadStats(){try{return JSON.parse(localStorage.getItem(sk))||{played:0,wins:0,current:0,best:0,lastDate:null}}catch{return{played:0,wins:0,current:0,best:0,lastDate:null}}}
function saveDay(){localStorage.setItem(dk,JSON.stringify({date:dateKey,guesses:guesses.map(c=>c.name),solved}))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function skin(c,size=80){return `https://minotar.net/helm/${encodeURIComponent(c.name)}/${size}.png`}
function val(c,k){return k==="subscribers"?(c[k]==null?"Unknown":Number(c[k]).toLocaleString("en-US")):(c[k]||"Unknown")}
const prior=JSON.parse(localStorage.getItem(dk)||"null");if(prior&&prior.date===dateKey){guesses=(prior.guesses||[]).map(n=>CHARACTERS.find(c=>c.name===n)).filter(Boolean);solved=!!prior.solved;draw();if(solved)finishView()}renderStats();
$("search").addEventListener("input",suggest);$("search").addEventListener("keydown",keys);$("guess").addEventListener("click",submit);$("clear").onclick=()=>{$("search").value="";selected=null;suggest();$("search").focus()};$("share").onclick=share;$("reset").onclick=reset;$("help").onclick=()=>$("helpbox").showModal();$("close").onclick=()=>$("helpbox").close();
document.addEventListener("click",e=>{if(!e.target.closest(".search"))hide()});
loadSubscriberCounts();
function suggest(){const q=$("search").value.trim().toLowerCase();selected=null;$("guess").disabled=true;$("clear").hidden=!q;active=-1;if(!q){hide();return}const list=CHARACTERS.filter(c=>(c.display+" "+c.name).toLowerCase().includes(q)&&!guesses.includes(c)).slice(0,10),box=$("suggestions");if(!list.length){box.innerHTML='<div class="option">No characters found.</div>';box.hidden=false;return}box.innerHTML=list.map((c,i)=>`<button class="option" data-name="${esc(c.name)}" data-i="${i}"><img class="avatar" src="${skin(c)}" onerror="this.style.visibility='hidden'"><span><span class="name">${esc(c.display)}</span><span class="meta">${esc(c.role)} · ${esc(c.name)}</span></span></button>`).join("");box.hidden=false;box.querySelectorAll("[data-name]").forEach(b=>b.onclick=()=>choose(b.dataset.name))}
function keys(e){const opts=[...$("suggestions").querySelectorAll("[data-name]")];if(["ArrowDown","ArrowUp"].includes(e.key)&&opts.length){e.preventDefault();active=(active+(e.key==="ArrowDown"?1:-1)+opts.length)%opts.length;opts.forEach((b,i)=>b.classList.toggle("active",i===active))}else if(e.key==="Enter"){e.preventDefault();if(active>=0&&opts[active])choose(opts[active].dataset.name);else if(selected)submit();else if(opts.length===1)choose(opts[0].dataset.name)}else if(e.key==="Escape")hide()}
function choose(n){selected=CHARACTERS.find(c=>c.name===n);$("search").value=selected.display;$("guess").disabled=false;hide();$("message").textContent=`${selected.display} selected. Click Guess character.`}
function hide(){$("suggestions").hidden=true;active=-1}
function cmp(g,a,k){let x=g[k],y=a[k];if(x==null||y==null||x==="Unknown"||y==="Unknown")return"unknown";if(x===y)return"green";if(k==="subscribers"){let ratio=Math.max(x,y)/Math.max(1,Math.min(x,y));return ratio<=1.25?"yellow":"red"}return"red"}
function submit(){if(solved||!selected)return;if(guesses.includes(selected))return;guesses.push(selected);const g=selected;selected=null;$("search").value="";$("guess").disabled=true;$("clear").hidden=true;draw();if(g.name===target.name){solved=true;finishGame();finishView();$("message").textContent="Correct! You found today's character."}else $("message").textContent="Not quite. Use the colour feedback to narrow it down.";saveDay()}
function draw(){$("results").hidden=!guesses.length;$("rows").innerHTML=[...guesses].reverse().map((g,i)=>`<article class="row"><div class="person"><img src="${skin(g,64)}" onerror="this.style.visibility='hidden'"><span>${esc(g.display)}</span><span class="meta">Guess ${guesses.length-i}</span></div><div class="tiles">${FIELDS.map(([k,label])=>`<div class="tile ${cmp(g,target,k)}"><b>${esc(val(g,k))}</b><small>${label}</small></div>`).join("")}</div></article>`).join("")}
function finishGame(){if(localStorage.getItem("unstabledle-v3-finished-"+dateKey))return;stats.played++;stats.wins++;stats.current=stats.lastDate===previous(dateKey)?stats.current+1:1;stats.best=Math.max(stats.best,stats.current);stats.lastDate=dateKey;localStorage.setItem("unstabledle-v3-finished-"+dateKey,"1");localStorage.setItem(sk,JSON.stringify(stats));renderStats()}
function previous(k){let d=new Date(k+"T12:00:00");d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function finishView(){$("banner").textContent=`Solved in ${guesses.length} guesses! Today's answer is ${target.display}.`;$("share").hidden=false;$("search").disabled=true;$("guess").disabled=true}
function renderStats(){$("played").textContent=stats.played;$("winrate").textContent=stats.played?Math.round(stats.wins/stats.played*100)+"%":"0%";$("streak").textContent=stats.current;$("best").textContent=stats.best}
async function share(){const grid=guesses.map(g=>FIELDS.map(([k])=>({green:"🟩",yellow:"🟨",red:"🟥",unknown:"⬜"}[cmp(g,target,k)])).join("")).join("\n"),text=`UnstableDle ${dateKey}\n${solved?"Solved in "+guesses.length+" guesses":"Not solved yet"}\n\n${grid}`;try{if(navigator.share)await navigator.share({title:"UnstableDle",text});else{await navigator.clipboard.writeText(text);$("message").textContent="Result copied to clipboard."}}catch(e){if(e.name!=="AbortError")alert(text)}}
function reset(){if(!confirm("Reset your local stats and today's progress?"))return;localStorage.removeItem(sk);localStorage.removeItem(dk);localStorage.removeItem("unstabledle-v3-finished-"+dateKey);stats={played:0,wins:0,current:0,best:0,lastDate:null};guesses=[];selected=null;solved=false;$("results").hidden=true;$("rows").innerHTML="";$("search").disabled=false;$("guess").disabled=true;$("search").value="";$("share").hidden=true;renderStats()}
