var SERVER = "https://anwar.tail6ab506.ts.net";   // আপনার টানেল ঠিকানা

var $ = function(id){ return document.getElementById(id); };
var reg = $('reg'), idn = $('idn'), go = $('go'), st = $('status'), res = $('results'), pill = $('pill');
var online = false;

function empty(icon, text){
  res.innerHTML = '';
  var d = document.createElement('div'); d.className = 'empty';
  var b = document.createElement('div'); b.className = 'big'; b.textContent = icon;
  var p = document.createElement('p'); p.textContent = text;
  d.appendChild(b); d.appendChild(p); res.appendChild(d);
}

function setState(on, text){
  online = on;
  pill.textContent = text;
  pill.className = 'pill ' + (on ? 'on' : 'off');
  $('hours').hidden = on;
  if (!on) empty('🔒', 'সেবা এই মুহূর্তে বন্ধ আছে। নির্ধারিত সময়ে আবার চেষ্টা করুন।');
}

function ping(){
  var ctl = new AbortController(), t = setTimeout(function(){ ctl.abort(); }, 7000);
  return fetch(SERVER + '/ping', {cache: 'no-store', signal: ctl.signal})
    .then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(function(j){ clearTimeout(t); j.open ? setState(true, '● সেবা চালু আছে') : setState(false, '● সেবা বন্ধ'); })
    .catch(function(){ clearTimeout(t); setState(false, '● সার্ভার বন্ধ'); });
}

function show(name, token){
  var u = SERVER + '/files/?t=' + encodeURIComponent(token);
  res.innerHTML = '';
  var row = document.createElement('div'); row.className = 'row';
  var top = document.createElement('div'); top.className = 'rowtop';
  var nm = document.createElement('div'); nm.className = 'name'; nm.textContent = '📄 ' + name;
  var ac = document.createElement('div'); ac.className = 'actions';
  var v = document.createElement('a'); v.className = 'btn primary'; v.href = u; v.target = '_blank'; v.rel = 'noopener noreferrer'; v.textContent = 'দেখুন';
  var d = document.createElement('a'); d.className = 'btn'; d.href = u + '&download=1'; d.textContent = 'ডাউনলোড';
  ac.appendChild(v); ac.appendChild(d); top.appendChild(nm); top.appendChild(ac); row.appendChild(top);
  res.appendChild(row);
}

function run(){
  var r = reg.value.trim(), i = idn.value.trim();
  if (!r || !i){ st.textContent = 'দুটি ঘরই পূরণ করুন'; return; }
  go.disabled = true; st.textContent = 'যাচাই করা হচ্ছে...'; res.innerHTML = '';
  fetch(SERVER + '/verify', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, cache: 'no-store',
    body: JSON.stringify({reg: r, id: i})
  })
    .then(function(x){ if (x.status === 429) throw 429; if (!x.ok) throw 0; return x.json(); })
    .then(function(j){ st.textContent = ''; j.ok ? show(j.name, j.token) : empty('😕', j.msg); })
    .catch(function(e){
      st.textContent = '';
      if (e === 429) empty('⚠️', 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
      else { empty('⚠️', 'সার্ভারে সংযোগ হচ্ছে না। পরে আবার চেষ্টা করুন।'); ping(); }
    })
    .finally(function(){ go.disabled = false; });
}

go.addEventListener('click', run);
[reg, idn].forEach(function(el){ el.addEventListener('keydown', function(e){ if (e.key === 'Enter') run(); }); });
document.addEventListener('visibilitychange', function(){ if (!document.hidden) ping(); });
empty('🔎', 'তথ্য দিলে এখানে Certificate দেখা যাবে');
ping().then(function(){ if (online) empty('🔎', 'তথ্য দিলে এখানে Certificate দেখা যাবে'); });
