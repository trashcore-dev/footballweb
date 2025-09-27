const API_KEY = "8a19b8745c254680a387e705faa6d5f3"; // Your API key
const BASE_URL = "https://api.football-data.org/v4";
const PREMIER_LEAGUE_ID = 2021;

// Fetch helper
async function fetchAPI(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "X-Auth-Token": API_KEY }
  });
  if(!response.ok) { 
    console.error("API Error:", response.status, response.statusText); 
    return null; 
  }
  return response.json();
}

// Load Premier League standings
async function loadStandings() {
  const data = await fetchAPI(`/competitions/${PREMIER_LEAGUE_ID}/standings`);
  const body = document.getElementById("standings-body");
  body.innerHTML = "";
  if(!data || !data.standings.length) return;

  const table = data.standings[0].table;

  table.forEach((row) => {
    let color = '';
    if(row.position <= 4) color = 'color:#28a745;font-weight:600;'; 
    else if(row.position >= table.length - 2) color = 'color:#dc3545;font-weight:600;';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="${color}">${row.position}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${row.team.crest}" alt="${row.team.name}" width="24" height="24"/>
          ${row.team.name}
        </div>
      </td>
      <td>${row.playedGames}</td>
      <td>${row.won}</td>
      <td>${row.draw}</td>
      <td>${row.lost}</td>
      <td>${row.points}</td>
    `;
    body.appendChild(tr);
  });
}

// Load upcoming matches
async function loadFixtures() {
  const data = await fetchAPI(`/competitions/${PREMIER_LEAGUE_ID}/matches?status=SCHEDULED`);
  const list = document.getElementById("fixtures-list");
  list.innerHTML = "";
  if(!data || !data.matches.length) return;

  data.matches.slice(0,10).forEach((match) => {
    const li = document.createElement("li");
    li.textContent = `${match.utcDate.slice(0,10)}: ${match.homeTeam.name} vs ${match.awayTeam.name}`;
    list.appendChild(li);
  });
}

// Load recent results into table
async function loadResults() {
  const data = await fetchAPI(`/competitions/${PREMIER_LEAGUE_ID}/matches?status=FINISHED`);
  const body = document.getElementById("results-body");
  body.innerHTML = "";
  if(!data || !data.matches.length) return;

  const recent = data.matches.slice(-10).reverse(); // last 10 matches, most recent first

  recent.forEach((match) => {
    let homeScore = match.score.fullTime.home;
    let awayScore = match.score.fullTime.away;

    if(homeScore > awayScore) homeScore = `<span style="color:#28a745;font-weight:600">${homeScore}</span>`;
    else if(awayScore > homeScore) awayScore = `<span style="color:#28a745;font-weight:600">${awayScore}</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${match.utcDate.slice(0,10)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${match.homeTeam.crest}" width="24" height="24"/> ${match.homeTeam.name}
        </div>
      </td>
      <td>${homeScore} - ${awayScore}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${match.awayTeam.crest}" width="24" height="24"/> ${match.awayTeam.name}
        </div>
      </td>
    `;
    body.appendChild(tr);
  });
}

// Initialize
loadStandings();
loadFixtures();
loadResults();
