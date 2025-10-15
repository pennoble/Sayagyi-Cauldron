const ADMIN_PASS = 'HelloworlD@123'; // my password

// Load scores from localStorage 
let score1 = parseInt(localStorage.getItem('score1')) || 0;
let score2 = parseInt(localStorage.getItem('score2')) || 0;
document.getElementById('score1').innerText = score1;
document.getElementById('score2').innerText = score2;

// Item combinations not very sure
const combinations = {
  "6+6":"6 🎃",
  "pumpkin+ghost":"Ma Phae Wah Pie 🥧",
  "bat+witch":"Hulk Potion 🧪",
  "candy+skull":"Sweet Cruse 🍬💀",
  "vampire+blood":"Nay Htoo Naing Strength 🩸"
};

// Used combinations
let usedCombinations = JSON.parse(localStorage.getItem('usedCombinations')) || [];

function updateUsedList(){
  const listDiv = document.getElementById('usedList');
  listDiv.innerText = usedCombinations.length === 0 ? "Used combinations: None" : "Used combinations: " + usedCombinations.join(", ");
}
updateUsedList();

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
  const resultBox = document.getElementById('result');
  const combiner = document.getElementById('combinerBox');
  const sfxOk = document.getElementById('successSound');
  const sfxErr = document.getElementById('errorSound');

  if(result){
    resultBox.innerText = `${i1} + ${i2} = ${result}`;
    sfxOk.currentTime = 0; sfxOk.play();

    usedCombinations.push(key);
    localStorage.setItem('usedCombinations', JSON.stringify(usedCombinations));
    updateUsedList();

    if(teamSelect === '1'){ 
      score1++; 
      localStorage.setItem('score1',score1); 
      document.getElementById('score1').innerText = score1; 
    }
    else { 
      score2++; 
      localStorage.setItem('score2',score2); 
      document.getElementById('score2').innerText = score2; 
    }
  } else {
    resultBox.innerText = `${i1} + ${i2} = ❌ Invalid combo!`;
    sfxErr.currentTime = 0; sfxErr.play();
  }

  combiner.classList.remove('pulse'); 
  void combiner.offsetWidth; 
  combiner.classList.add('pulse');
}

// Admin panel
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
    score1 = score1 + delta;  // removed Math.max(0,...)
    localStorage.setItem('score1',score1); 
    document.getElementById('score1').innerText=score1; 
  }
  else { 
    score2 = score2 + delta;  // removed Math.max(0,...)
    localStorage.setItem('score2',score2); 
    document.getElementById('score2').innerText=score2; 
  }
}

function setScoresFromInputs(){
  const s1=parseInt(document.getElementById('setScore1').value);
  const s2=parseInt(document.getElementById('setScore2').value);
  if(Number.isInteger(s1)){ 
    score1 = s1;  // removed Math.max(0,...)
    localStorage.setItem('score1',score1); 
    document.getElementById('score1').innerText=score1; 
  }
  if(Number.isInteger(s2)){ 
    score2 = s2;  // removed Math.max(0,...)
    localStorage.setItem('score2',score2); 
    document.getElementById('score2').innerText=score2; 
  }
  alert('Scores updated.');
}

function resetScores(){
  if(!confirm('Reset BOTH team scores to 0?')) return;
  score1=0; score2=0;
  localStorage.setItem('score1',score1);
  localStorage.setItem('score2',score2);
  document.getElementById('score1').innerText=0;
  document.getElementById('score2').innerText=0;
}

function resetUsedCombinations(){
  usedCombinations = [];
  localStorage.removeItem('usedCombinations');
  updateUsedList();
  alert('Used combinations reset!');
}

// Close admin panel with Escape
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ 
    adminPanel.style.display='none'; 
    adminPanel.setAttribute('aria-hidden','true'); 
  }
});
