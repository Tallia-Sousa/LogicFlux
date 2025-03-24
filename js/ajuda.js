
 const helpBtn = document.getElementById('help-btn');
 const helpCard = document.getElementById('help-card');
 const closeHelpBtn = document.getElementById('close-help-btn');

 helpBtn.addEventListener('click', () => {
   helpCard.style.display = 'block';
 });

 closeHelpBtn.addEventListener('click', () => {
   helpCard.style.display = 'none';
 });