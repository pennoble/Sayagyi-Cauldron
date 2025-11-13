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

const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const team1El = document.getElementById('team1');
const team2El = document.getElementById('team2');

document.getElementById('winnerName').innerText = "Team Werewolves";

onValue(ref(database, 'gameData'), snap => {
  if (snap.exists()) {
    const g = snap.val();
    score1El.innerText = g.score1 || 0;
    score2El.innerText = g.score2 || 0;
  }
});

const adminPanel = document.getElementById('adminPanel');
document.getElementById('adminBtn').addEventListener('click', () => {
  const p = prompt("Admin password:");
  get(ref(database, 'secureData')).then(snap=>{
    if(snap.exists() && p === snap.val().adminPassword){
      adminPanel.style.display = 'block';
    } else alert("Wrong password.");
  });
});

window.adjustScore = function(team, delta){
  const scoreRef = ref(database, 'gameData');
  get(scoreRef).then(snap=>{
    if(snap.exists()){
      let g = snap.val();
      if(team===1) g.score1 += delta;
      else g.score2 += delta;
      set(scoreRef, g);
    }
  });
}

window.setScoresFromInputs = function() {
  const n1 = parseInt(document.getElementById("setScore1").value);
  const n2 = parseInt(document.getElementById("setScore2").value);
  set(ref(database, "gameData"), {
    score1: n1,
    score2: n2,
    usedCombinations: []
  });
};

window.resetScores = function() {
  if(confirm("Reset scores to 0?"))
    set(ref(database, "gameData"), {score1:0, score2:0, usedCombinations:[]});
}

window.resetUsedCombinations = function(){
  get(ref(database,'gameData')).then(snap=>{
    if(snap.exists()){
      let g = snap.val();
      g.usedCombinations = [];
      set(ref(database,'gameData'), g);
    }
  });
}

document.addEventListener("keydown", e=>{
  if(e.key === "Escape"){
    adminPanel.style.display = "none";
  }
});
