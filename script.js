import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyCZepWAUL3t-wWe7mufLC6_OdlrnudOfyQ",
  authDomain: "halloween-game-ece0d.firebaseapp.com",
  databaseURL: "https://halloween-game-ece0d-default-rtdb.firebaseio.com/",
  projectId: "halloween-game-ece0d",
  storageBucket: "halloween-game-ece0d.appspot.com",
  messagingSenderId: "407260830945",
  appId: "1:407260830945:web:8b80b56080a4a9ac0a2ba0",
  measurementId: "G-RFZ4BB17NF"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ---------- VARIABLES ----------
let ADMIN_PASS = "";
let combinations = {};
let score1 = 0;
let score2 = 0;
let usedCombinations = [];
let rankPasswords = {}; // rank passwords from Firebase
let validatedRank = null; // keep track of validated rank for this session

// ---------- ELEMENTS ----------
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const usedListEl = document.getElementById('usedList');
const resultBox = document.getElementById('result');
const combiner = document.getElementById('combinerBox');
const rankSelect = document.getElementById('rankSelect'); // add this in HTML

// ---------- INITIAL LOAD ----------
Promise.all([
  get(ref(database, 'secureData')),
  get(ref(database, 'gameData'))
]).then(([secureSnap, gameSnap]) => {
  if (secureSnap.exists()) {
    const data = secureSnap.val();
    ADMIN_PASS = data.adminPassword;
    combinations = data.combinations || {};
    rankPasswords = data.rankPasswords || {};
    console.log("✅ Secure data loaded from Firebase");
  } else {
    console.warn("⚠️ No secure data found in Firebase");
  }

  if (gameSnap.exists()) {
    const g = gameSnap.val();
    score1 = g.score1 || 0;
    score2 = g.score2 || 0;
    usedCombinations = g.usedCombinations || [];
  }

  updateScoresUI();
  updateUsedList();
});

// Real-time updates for scores
onValue(ref(database, 'gameData'), snap => {
  if (snap.exists()) {
    const g = snap.val();
    score1 = g.score1 || 0;
    score2 = g.score2 || 0;
    usedCombinations = g.usedCombinations || [];
    updateScoresUI();
    updateUsedList();
  }
});

// ---------- FUNCTIONS ----------
function updateUsedList(){
  usedListEl.innerText = usedCombinations.length === 0 ? 
    "Used combinations: None" : 
    "Used combinations: " + usedCombinations.join(", ");
}

function updateScoresUI(){
  score1El.innerText = score1;
  score2El.innerText = score2;
}

function saveToFirebase(){
  set(ref(database, 'gameData'), {
    score1,
    score2,
    usedCombinations
  });
}

// ---------- COMBINATION LOGIC WITH RANK ----------
function combineItems(){
  const teamSelect = document.getElementById('teamSelect').value;
  let i1 = document.getElementById('item1').value.trim().toLowerCase();
  let i2 = document.getElementById('item2').value.trim().toLowerCase();
  const rank = rankSelect.value;

  if(!i1 || !i2){ alert("Enter both items."); return; }

  // ----- Rank password validation -----
  if(rank && validatedRank !== rank){
    const pw = prompt(`Enter password for ${rank} rank:`);
    if(!pw || pw !== rankPasswords[rank]){
      alert('Incorrect rank password. You remain normal rank.');
    } else {
      validatedRank = rank; // mark rank as validated for session
      alert(`✅ ${rank} rank activated!`);
    }
  }

  let key = [i1,i2].sort().join("+");
  if(usedCombinations.includes(key)){ alert('This combination has already been used!'); return; }

  const result = combinations[key] || combinations[`${i2}+${i1}`];
  const sfxOk = document.getElementById('successSound');
  const sfxErr = document.getElementById('errorSound');

  if(result){
    let points = 0;

    // Assign points based on rank
    if(validatedRank === 'Bronze'){
      points = Math.floor(Math.random() * 51) + 100; // 100–150
    } else if(validatedRank === 'Silver'){
      points = Math.floor(Math.random() * 51) + 150; // 150–200
    } else if(validatedRank === 'Gold'){
      points = Math.floor(Math.random() * 301) + 200; // 200–500
    } else {
      points = Math.floor(Math.random() * 100) + 1; // normal
    }

    resultBox.innerText = `${i1} + ${i2} = ${result} 🎁 (+${points} points!)`;
    sfxOk.currentTime = 0; 
    sfxOk.play();

    usedCombinations.push(key);
    if(teamSelect === '1') score1 += points; else score2 += points;

    saveToFirebase();
    updateScoresUI(); 
    updateUsedList();
  } else {
    resultBox.innerText = `${i1} + ${i2} = ❌ Invalid combo!`;
    sfxErr.currentTime = 0; 
    sfxErr.play();
  }

  combiner.classList.remove('pulse');
  void combiner.offsetWidth;
  combiner.classList.add('pulse');
}

// ---------- ADMIN PANEL ----------
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
adminBtn.addEventListener('click', () => {
  const p = prompt('Enter admin password:');
  if (p === null) return;
  if (p === ADMIN_PASS){
    adminPanel.style.display='block';
    adminPanel.setAttribute('aria-hidden','false');
  } else alert('Wrong password.');
});

function adjustScore(team, delta){
  if(team===1){ score1+=delta; } else { score2+=delta; }
  saveToFirebase();
}
function setScoresFromInputs(){
  const s1=parseInt(document.getElementById('setScore1').value);
  const s2=parseInt(document.getElementById('setScore2').value);
  if(Number.isInteger(s1)) score1=s1;
  if(Number.isInteger(s2)) score2=s2;
  saveToFirebase();
  alert('Scores updated.');
}
function resetScores(){
  if(!confirm('Reset BOTH team scores to 0?')) return;
  score1=0; score2=0;
  saveToFirebase();
}
function resetUsedCombinations(){
  usedCombinations=[];
  saveToFirebase();
  alert('Used combinations reset!');
}

// Close admin panel
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    adminPanel.style.display='none';
    adminPanel.setAttribute('aria-hidden','true');
  }
});

// ---------- EXPORT ----------
window.combineItems = combineItems;
window.adjustScore = adjustScore;
window.setScoresFromInputs = setScoresFromInputs;
window.resetScores = resetScores;
window.resetUsedCombinations = resetUsedCombinations;
