const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your football-data.org key
const BASE_URL = "https://api.football-data.org/v4";

async function fetchAPI(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "X-Auth-Token": API_KEY },
  });
  if (!response.ok) {
    console.error("API Error:", response.status, response.statusText);
    return null;
  }
  return response.json();
}

async function loadLeagues() {
  const data = await fetchAPI("/competitions");
  if (!data) return;

  const list = document.getElementById("league-list");
  list.innerHTML = "";

  data.competitions.forEach((comp) => {
    if (!comp.plan || comp.plan !== "TIER_ONE") return;
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
}

async function loadStandings(leagueId) {
  const data = await fetchAPI(`/competitions/${leagueId}/standings`);
  const body = document.getElementById("standings-body");
  body.innerHTML = "";

  if (!data || !data.standings.length) return;

  data.standings[0].table.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.position}</td>
      <td>${row.team.name}</td>
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
  const data = await fetchAPI(
    `/competitions/${leagueId}/matches?status=SCHEDULED`
  );
  const list = document.getElementById("fixtures-list");
  list.innerHTML = "";

  if (!data || !data.matches.length) return;

  data.matches.slice(0, 10).forEach((match) => {
    const li = document.createElement("li");
    li.textContent = `${match.utcDate.slice(0, 10)}: ${match.homeTeam.name} vs ${match.awayTeam.name}`;
    list.appendChild(li);
  });
}

// Init
loadLeagues();
