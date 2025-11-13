import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

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

let ADMIN_PASS = "";
let score1 = 0;
let score2 = 0;
let usedCombinations = [];

const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');

const winnerNameEl = document.getElementById('winnerName');
if (winnerNameEl) {
  winnerNameEl.innerText = "Team Werewolves";
}

Promise.all([
  get(ref(database, 'secureData')),
  get(ref(database, 'gameData'))
]).then(([secureSnap, gameSnap]) => {
  // Load admin password
  if (secureSnap.exists()) {
    const data = secureSnap.val();
    ADMIN_PASS = data.adminPassword || "";
  } else {
    console.warn("⚠️ No secureData found in Firebase");
  }

  if (gameSnap.exists()) {
    const g = gameSnap.val();
    score1 = g.score1 || 0;
    score2 = g.score2 || 0;
    usedCombinations = g.usedCombinations || [];
  } else {
    console.warn("⚠️ No gameData found in Firebase");
  }

  updateScoresUI();
}).catch(err => {
  console.error("Error loading initial data:", err);
});

onValue(ref(database, 'gameData'), snap => {
  if (snap.exists()) {
    const g = snap.val();
    score1 = g.score1 || 0;
    score2 = g.score2 || 0;
    usedCombinations = g.usedCombinations || [];
    updateScoresUI();
  }
});

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

adminBtn.addEventListener('click', () => {
  const p = prompt('Enter admin password:');
  if (p === null) return;
  if (p === ADMIN_PASS){
    adminPanel.style.display='block';
    adminPanel.setAttribute('aria-hidden','false');
  } else {
    alert('Wrong password.');
  }
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

document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    adminPanel.style.display='none';
    adminPanel.setAttribute('aria-hidden','true');
  }
});

window.adjustScore = adjustScore;
window.setScoresFromInputs = setScoresFromInputs;
window.resetScores = resetScores;
window.resetUsedCombinations = resetUsedCombinations;
