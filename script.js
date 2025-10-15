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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ---------- ADMIN PASSWORD ----------
const ADMIN_PASS = 'HelloworlD@123';

// ---------- SCORES ----------
let score1 = 0;
let score2 = 0;

// ---------- USED COMBINATIONS ----------
let usedCombinations = [];

// ---------- COMBINATIONS ----------
const combinations = {
  "6+6":"6 🎃",
  "pumpkin+ghost":"Ma Phae Wah Pie 🥧",
  "bat+witch":"Hulk Potion 🧪",
  "candy+skull":"Sweet Cruse 🍬💀",
  "vampire+blood":"Nay Htoo Naing Strength 🩸"
};

// ---------- HTML ELEMENTS ----------
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const usedListEl = document.getElementById('usedList');
const resultBox = document.getElementById('result');
const combiner = document.getElementById('combinerBox');

// ---------- HELPER FUNCTIONS ----------
function updateUsedList(){
  usedListEl.innerText = usedCombinations.length === 0 ? "Used combinations: None" : "Used combinations: " + usedCombinations.join(", ");
}

function updateScoresUI(){
  score1El.innerText = score1;
  score2El.innerText = score2;
}

function saveToFirebase(){
  set(ref(database, 'gameData'), {
    score1: score1,
    score2: score2,
    usedCombinations: usedCombinations
  });
}

// ---------- LOAD FROM FIREBASE ----------
get(ref(database, 'gameData')).then(snapshot=>{
  if(snapshot.exists()){
    const data = snapshot.val();
    score1 = data.score1 || 0;
    score2 = data.score2 || 0;
    usedCombinations = data.usedCombinations || [];
    updateScoresUI();
    updateUsedList();
  }
});

// Real-time updates
onValue(ref(database, 'gameData'), snapshot=>{
  if(snapshot.exists()){
    const data = snapshot.val();
    score1 = data.score1 || 0;
    score2 = data.score2 || 0;
    usedCombinations = data.usedCombinations || [];
    updateScoresUI();
    updateUsedList();
  }
});

// ---------- COMBINE ITEMS ----------
function combineItems(){
  const teamSelect = document.getElementById('teamSelect').value;
  let i1 = document.getElementById('item1').value.trim().toLowerCase();
  let i2 = document.getElementById('item2').value.trim().toLowerCase();

  if(!i1 || !i2){ alert("Enter both items."); return; }

  let key = [i1,i2].sort().join("+");

  if(usedCombinations.includes(key)){
    alert('This combination has already been used!');
    return;
  }

  const result = combinations[`${i1}+${i2}`] || combinations[`${i2}+${i1}`];
  const sfxOk = document.getElementById('successSound');
  const sfxErr = document.getElementById('errorSound');

  if(result){
    resultBox.innerText = `${i1} + ${i2} = ${result}`;
    sfxOk.currentTime = 0; sfxOk.play();

    usedCombinations.push(key);

    // Update score
    if(teamSelect === '1'){ 
      score1++; 
    }
    else { 
      score2++; 
    }

    // Update Firebase and UI
    saveToFirebase();
    updateScoresUI();
    updateUsedList();

  } else {
    resultBox.innerText = `${i1} + ${i2} = ❌ Invalid combo!`;
    sfxErr.currentTime = 0; sfxErr.play();
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
  if(p===null) return;
  if(p===ADMIN_PASS){ 
    adminPanel.style.display='block'; 
    adminPanel.setAttribute('aria-hidden','false'); 
  } else alert('Wrong password.');
});

function adjustScore(team, delta){
  if(team===1){ 
    score1 += delta;
  } else { 
    score2 += delta;
  }
  saveToFirebase();
}

function setScoresFromInputs(){
  const s1=parseInt(document.getElementById('setScore1').value);
  const s2=parseInt(document.getElementById('setScore2').value);
  if(Number.isInteger(s1)){ score1 = s1; }
  if(Number.isInteger(s2)){ score2 = s2; }
  saveToFirebase();
  alert('Scores updated.');
}

function resetScores(){
  if(!confirm('Reset BOTH team scores to 0?')) return;
  score1=0; score2=0;
  saveToFirebase();
}

function resetUsedCombinations(){
  usedCombinations = [];
  saveToFirebase();
  alert('Used combinations reset!');
}

// ---------- CLOSE ADMIN PANEL ----------
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ 
    adminPanel.style.display='none'; 
    adminPanel.setAttribute('aria-hidden','true'); 
  }
});

// ---------- EXPORT FUNCTION FOR HTML ----------
window.combineItems = combineItems;
window.adjustScore = adjustScore;
window.setScoresFromInputs = setScoresFromInputs;
window.resetScores = resetScores;
window.resetUsedCombinations = resetUsedCombinations;
