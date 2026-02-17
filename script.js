const API = "https://economically-pseudoetymological-serenity.ngrok-free.dev";
let ADMIN_CODE = "";
let currentDossierId = "";

async function loadPublic() {
    const r = await fetch(`${API}/public_list`, { headers: {"ngrok-skip-browser-warning":"1"} });
    const ids = await r.json();
    document.getElementById('main-grid').innerHTML = ids.map(id => `
        <div class="public-card" onclick="openProfile('${id}')">
            <strong>${id}</strong>
        </div>`).join('');
}

async function openProfile(id) {
    currentDossierId = id;
    let pass = ADMIN_CODE ? "" : prompt("Pass dossier :");
    if(!ADMIN_CODE && !pass) return;

    const r = await fetch(`${API}/get_details`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', "ngrok-skip-browser-warning":"1"},
        body: JSON.stringify({id: id, password: pass, admin_code: ADMIN_CODE})
    });

    if(r.ok) renderProfile(await r.json());
    else alert("Accès refusé.");
}

function renderProfile(d) {
    document.getElementById('profile-page').style.display = "block";
    const fmt = (t) => t ? t.replace(/██████████/g, '<span class="redacted">CENSURÉ</span>') : "";
    
    document.getElementById('v-avatar').src = d.avatar || "https://via.placeholder.com/150";
    document.getElementById('v-name').innerHTML = `${fmt(d.prenom)} ${fmt(d.nom)}`;
    document.getElementById('v-job').innerHTML = fmt(d.profession);
    document.getElementById('v-bio').innerHTML = fmt(d.bio);

    document.getElementById('v-badges').innerHTML = d.badges.split(',').map(b => b.trim() ? `<span class="badge">${b.trim()}</span>` : '').join('');
    document.getElementById('v-rapports').innerHTML = d.rapports.map(r => `<div class="rapport-item"><b>[${r.date}]</b><br>${r.texte}</div>`).join('') || "RAS.";

    if(ADMIN_CODE) {
        document.getElementById('admin-editor').classList.remove('hidden');
        document.getElementById('ed-id').value = d.id;
        document.getElementById('ed-id').disabled = (d.id !== "");
        document.getElementById('ed-prenom').value = d.prenom || "";
        document.getElementById('ed-nom').value = d.nom || "";
        document.getElementById('ed-pass').value = (d.password !== "****") ? d.password : "";
        document.getElementById('ed-job').value = d.profession || "";
        document.getElementById('ed-loc').value = d.localisation || "";
        document.getElementById('ed-bio').value = d.bio || "";
        document.getElementById('ed-badges').value = d.badges || "";
    } else {
        document.getElementById('admin-editor').classList.add('hidden');
    }
}

async function save() {
    const p = {
        id: document.getElementById('ed-id').value,
        prenom: document.getElementById('ed-prenom').value,
        nom: document.getElementById('ed-nom').value,
        categories: ["User"], status: "Actif", bio: document.getElementById('ed-bio').value,
        avatar: "", stats: {}, 
        profile_pass: document.getElementById('ed-pass').value || "1234",
        profession: document.getElementById('ed-job').value,
        localisation: document.getElementById('ed-loc').value,
        niveau: "Alpha", admin_code: ADMIN_CODE, censored: [],
        badges: document.getElementById('ed-badges').value
    };
    await fetch(`${API}/update`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(p)});
    alert("Dossier mis à jour.");
    closeProfile(); loadPublic();
}

async function remove() {
    if(!confirm("Supprimer définitivement ?")) return;
    await fetch(`${API}/delete`, { method: 'POST', headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({id: document.getElementById('ed-id').value, code: ADMIN_CODE})});
    closeProfile(); loadPublic();
}

async function addReport() {
    const data = { id: document.getElementById('ed-id').value, texte: document.getElementById('rep-texte').value, 
                   importance: parseInt(document.getElementById('rep-imp').value), admin_code: ADMIN_CODE };
    await fetch(`${API}/add_rapport`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    openProfile(data.id);
}

function askAdmin() {
    const p = prompt("CODE ADMIN :");
    if(p === "ExpA22") {
        ADMIN_CODE = p;
        document.getElementById('btn-new').classList.remove('hidden');
        document.getElementById('admin-btn').innerText = "ADMIN OK";
        if(currentDossierId) openProfile(currentDossierId);
    }
}

function openNew() {
    renderProfile({id:"", prenom:"", nom:"", bio:"", avatar:"", profession:"", localisation:"", badges:"", rapports:[], password:""});
}

function closeProfile() { document.getElementById('profile-page').style.display = "none"; currentDossierId = ""; }

loadPublic();
