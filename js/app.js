const API_KEY = "8a19b8745c254680a387e705faa6d5f3"; // replace with your football-data.org key
const BASE_URL = "https://api.football-data.org/v4";

async function fetchAPI(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "X-Auth-Token": API_KEY }
  });
  if(!response.ok) { console.error("API Error:", response.status, response.statusText); return null; }
  return response.json();
}

async function loadLeagues() {
  const data = await fetchAPI("/competitions");
  if(!data) return;
  const list = document.getElementById("league-list");
  list.innerHTML = "";
  data.competitions.forEach((comp) => {
    if(!comp.plan || comp.plan !== "TIER_ONE") return;
    const li = document.createElement("li");
    li.textContent = comp.name;
    li.onclick = () => selectLeague(comp.id, comp.name);
    list.appendChild(li);
  });
}

async function selectLeague(id, name) {
  document.getElementById("league-title").textContent = name;
  await loadStandings(id);
  await loadFixtures(id);
  await loadResults(id);
}

async function loadStandings(leagueId) {
  const data = await fetchAPI(`/competitions/${leagueId}/standings`);
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

async function loadFixtures(leagueId) {
  const data = await fetchAPI(`/competitions/${leagueId}/matches?status=SCHEDULED`);
  const list = document.getElementById("fixtures-list");
  list.innerHTML = "";
  if(!data || !data.matches.length) return;
  data.matches.slice(0,10).forEach((match) => {
    const li = document.createElement("li");
    li.textContent = `${match.utcDate.slice(0,10)}: ${match.homeTeam.name} vs ${match.awayTeam.name}`;
    list.appendChild(li);
  });
}

async function loadResults(leagueId) {
  const data = await fetchAPI(`/competitions/${leagueId}/matches?status=FINISHED`);
  const list = document.getElementById("results-list");
  list.innerHTML = "";
  if(!data || !data.matches.length) return;
  const recent = data.matches.slice(-10);
  recent.forEach((match) => {
    let homeScore = match.score.fullTime.home;
    let awayScore = match.score.fullTime.away;
    if(homeScore > awayScore) homeScore = `<span style="color:#28a745;font-weight:600">${homeScore}</span>`;
    else if(awayScore > homeScore) awayScore = `<span style="color:#28a745;font-weight:600">${awayScore}</span>`;
    const li = document.createElement("li");
    li.innerHTML = `${match.utcDate.slice(0,10)}: ${match.homeTeam.name} ${homeScore} - ${awayScore} ${match.awayTeam.name}`;
    list.appendChild(li);
  });
}

loadLeagues();
