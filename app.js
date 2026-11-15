/* --- Pradeshiya Sabha Master Portal - app.js (Slider Navigation Fixed) --- */

const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbwF0rOsd0MqZ9kZ3xm2eQsPfTn_8tBx5xj_L9rrMXPL88x4Pz1_vTuUa4G1WSEun_t-/exec", 
    REFRESH_INTERVAL: 60000,
    IDLE_TIMEOUT: 1800000 
};

let state = {
    token: sessionStorage.getItem("ps_token") || null,
    role: sessionStorage.getItem("ps_role") || null,
    userName: sessionStorage.getItem("ps_name") || null,
    isOnline: navigator.onLine,
    lastUpdated: "--:--:--",
    divisions: [],
    currentDivision: null
};

const MOCK_DATA = {
    divisions: [
        { id: "street_lights", title_si: "වීදි ලාම්පු", icon: "💡", total: 45, resolved: 38, delayed: 7, officer: "පෙරේරා මයා", phone: "0771234567", webapp_url: "https://example.com/street-lights" },
        { id: "water_bills", title_si: "ජල බිල්පත්", icon: "💧", total: 120, balance: "Rs. 45,000", delayed: 12, officer: "සිල්වා මයා", phone: "0712345678", webapp_url: "https://example.com/water-bills" },
        { id: "cashier", title_si: "කැෂියර් එකතුව", icon: "💰", today: "Rs. 125,000", monthly: "Rs. 3,450,000", balance: "Rs. 15,000", officer: "සෝමරත්න මයා", phone: "0701234567", webapp_url: "https://example.com/cashier" },
        { id: "projects", title_si: "සංවර්ධන ව්‍යාපෘති", icon: "🏗️", total: 10, completed: 7, delayed: 1, officer: "ප්‍රනාන්දු මයා", phone: "0751234567", webapp_url: "https://example.com/projects" },
        { id: "utilities", title_si: "උපයෝගිතා බිල්", icon: "📞", total: 6, paid: 5, pending: 1, officer: "ජයසිංහ මයා", phone: "0781234567", webapp_url: "https://example.com/utilities" },
        { id: "vehicles", title_si: "වාහන කුලී", icon: "🚗", total: "Rs. 250,000", balance: "Rs. 50,000", delayed: 0, officer: "බණ්ඩාර මයා", phone: "0761234567", webapp_url: "https://example.com/vehicles" },
        { id: "waste", title_si: "කසළ කළමනාකරණය", icon: "🗑️", collected: "42 Tons", vehicles: 5, delayed: 2, officer: "රත්නායක මයා", phone: "0721234567", webapp_url: "https://example.com/waste" },
        { id: "attendance", title_si: "සේවක පැමිණීම (ZKTeco)", icon: "👥", total: 85, present: 78, late: 7, officer: "පාලක අංශය", phone: "0741234567", webapp_url: "https://example.com/attendance" }
    ]
};

const DIVISION_COLORS = {
    street_lights: "#F59E0B", water_bills: "#0EA5E9", cashier: "#059669", projects: "#F97316",
    utilities: "#9333EA", vehicles: "#DB2777", waste: "#65A30D", attendance: "#4F46E5"
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupEventListeners();
    checkAuth();
    handleRouting();
    window.addEventListener("hashchange", handleRouting);
}

function setupEventListeners() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => fetchDashboardData(true));
    }

    const backBtn = document.getElementById("back-to-home");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.hash = "";
        });
    }

    const exportCsvBtn = document.getElementById("export-csv-btn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", exportDivisionCSV);
    }

    // Carousel Slider Navigation Buttons Setup
    const prevBtn = document.getElementById("slider-prev");
    const nextBtn = document.getElementById("slider-next");
    const track = document.getElementById("hero-carousel");

    if (prevBtn && track) {
        prevBtn.addEventListener("click", () => {
            track.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }

    if (nextBtn && track) {
        nextBtn.addEventListener("click", () => {
            track.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }

    window.addEventListener("online", () => updateConnectionStatus(true));
    window.addEventListener("offline", () => updateConnectionStatus(false));
}

function checkAuth() {
    if (state.token) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard-main").style.display = "block";
        document.getElementById("logout-btn").style.display = "inline-block";
        fetchDashboardData(false);
    } else {
        document.getElementById("login-container").style.display = "flex";
        document.getElementById("dashboard-main").style.display = "none";
        document.getElementById("logout-btn").style.display = "none";
    }
}

function handleLogin() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("login-error");

    if ((user === "chairman" || user === "admin") && pass === "1234") {
        state.token = "mock_token_" + Date.now();
        state.role = user;
        state.userName = user === "chairman" ? "සභාපතිතුමා" : "පරිපාලක";
        
        sessionStorage.setItem("ps_token", state.token);
        sessionStorage.setItem("ps_role", state.role);
        sessionStorage.setItem("ps_name", state.userName);

        errorEl.textContent = "";
        checkAuth();
    } else {
        errorEl.textContent = "වැරදි පරිශීලක නාමයකි හෝ මුරපදයකි!";
    }
}

function handleLogout() {
    sessionStorage.clear();
    state.token = null;
    state.role = null;
    state.userName = null;
    checkAuth();
}

function updateConnectionStatus(online) {
    state.isOnline = online;
    const badge = document.getElementById("sync-status");
    if (online) {
        badge.textContent = "🟢 Online";
        badge.className = "status-badge online";
    } else {
        badge.textContent = "🔴 Offline";
        badge.className = "status-badge offline";
    }
}

function fetchDashboardData(isManual) {
    setTimeout(() => {
        state.divisions = MOCK_DATA.divisions;
        state.lastUpdated = new Date().toLocaleTimeString();
        document.getElementById("last-updated").textContent = `අවසන් යාවත්කාලීනය: ${state.lastUpdated}`;
        
        renderDashboard();
        if (isManual) alert("දත්ත සාර්ථකව යාවත්කාලීන විය!");
    }, 300);
}

function renderDashboard() {
    document.getElementById("perf-value").textContent = "84.5%";

    // Render Hero Carousel
    const carousel = document.getElementById("hero-carousel");
    carousel.innerHTML = "";

    state.divisions.forEach(div => {
        const card = document.createElement("div");
        card.className = "summary-card";
        card.style.setProperty("--c", DIVISION_COLORS[div.id] || "#4F46E5");
        card.onclick = () => { window.location.hash = `division/${div.id}`; };
        
        card.innerHTML = `
            <h3>${div.icon} ${div.title_si}</h3>
            <div class="metric-row"><span>මුළු සංඛ්‍යාව:</span> <strong>${div.total || div.collected || div.today || '-'}</strong></div>
            <div class="metric-row"><span>විසඳූ / පැමිණි:</span> <strong>${div.resolved || div.completed || div.paid || div.present || '-'}</strong></div>
            <div class="metric-row"><span>ප්‍රමාද / හිඟ:</span> <strong class="warn">${div.delayed || div.pending || div.late || 0}</strong></div>
        `;
        carousel.appendChild(card);
    });

    // Render Quick Grid
    const grid = document.getElementById("quick-grid");
    grid.innerHTML = "";

    state.divisions.forEach(div => {
        const gCard = document.createElement("div");
        gCard.className = "grid-card";
        gCard.style.setProperty("--c", DIVISION_COLORS[div.id] || "#4F46E5");
        gCard.onclick = () => { window.location.hash = `division/${div.id}`; };
        
        gCard.innerHTML = `
            <div class="card-icon">${div.icon}</div>
            <h3>${div.title_si}</h3>
        `;
        grid.appendChild(gCard);
    });
}

function handleRouting() {
    const hash = window.location.hash;
    if (hash.startsWith("#division/")) {
        const divId = hash.replace("#division/", "");
        openDivisionDetail(divId);
    } else {
        document.getElementById("detail-view").style.display = "none";
        if (state.token) {
            document.getElementById("dashboard-main").style.display = "block";
        }
        state.currentDivision = null;
    }
}

function openDivisionDetail(id) {
    if (state.divisions.length === 0) {
        state.divisions = MOCK_DATA.divisions;
    }
    const div = state.divisions.find(d => d.id === id);
    if (!div) {
        window.location.hash = "";
        return;
    }

    state.currentDivision = div;

    document.getElementById("dashboard-main").style.display = "none";
    document.getElementById("detail-view").style.display = "block";
    
    document.getElementById("detail-title").textContent = `${div.icon} ${div.title_si}`;
    document.getElementById("detail-officer-name").textContent = div.officer;
    document.getElementById("detail-officer-phone").textContent = div.phone;
    
    const iframe = document.getElementById("division-iframe");
    const openNewTabBtn = document.getElementById("open-new-tab-btn");
    
    const targetUrl = div.webapp_url.includes("example.com") ? "https://example.com" : div.webapp_url;
    iframe.src = targetUrl;
    openNewTabBtn.href = targetUrl;

    const waBtn = document.getElementById("send-whatsapp-btn");
    waBtn.onclick = () => {
        const msgInput = document.getElementById("directive-input").value.trim();
        if (!msgInput) {
            alert("කරුණාකර අදාළ නිලධාරියාට යැවිය යුතු පණිවිඩය ලියන්න!");
            return;
        }
        
        let phone = div.phone.replace(/[^0-9]/g, "");
        if (phone.startsWith("0")) {
            phone = "94" + phone.substring(1);
        }
        
        const timestamp = new Date().toLocaleString("si-LK");
        const fullMsg = `*ප්‍රාදේශීය සභාව - සභාපතිතුමාගේ උපදෙස්*\n\n*අංශය:* ${div.title_si}\n*පණිවිඩය:* ${msgInput}\n*වේලාව:* ${timestamp}`;
        
        logActivityAction(div.title_si, msgInput);

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMsg)}`;
        window.open(waUrl, '_blank');
        
        document.getElementById("directive-input").value = "";
    };
}

function exportDivisionCSV() {
    if (!state.currentDivision) return;
    const div = state.currentDivision;

    let csvContent = "\uFEFF"; 
    csvContent += "අංශය,වගකිවයුතු නිලධාරියා,දුරකථන අංකය,මුළු අගය,විසඳූ/පැමිණි,ප්‍රමාද\n";
    csvContent += `"${div.title_si}","${div.officer}","${div.phone}","${div.total || div.collected || '-'}","${div.resolved || div.completed || div.paid || div.present || '-'}","${div.delayed || div.pending || div.late || 0}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${div.id}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function logActivityAction(divisionTitle, note) {
    const logs = JSON.parse(localStorage.getItem("ps_activity_logs") || "[]");
    logs.unshift({
        time: new Date().toLocaleString(),
        user: state.userName,
        division: divisionTitle,
        note: note
    });
    localStorage.setItem("ps_activity_logs", JSON.stringify(logs));
}