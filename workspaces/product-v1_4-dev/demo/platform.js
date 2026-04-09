const Demo = window.JetCheckDemo;

let state = Demo.loadState();

const ui = {
  status: "all",
  keyword: "",
  accountCenterOpen: false,
};

const els = {
  openAccountCenterBtn: document.getElementById("openAccountCenterBtn"),
  refreshPlatformBtn: document.getElementById("refreshPlatformBtn"),
  resetPlatformDemo: document.getElementById("resetPlatformDemo"),
  platformQuotaText: document.getElementById("platformQuotaText"),
  platformStatusBanner: document.getElementById("platformStatusBanner"),
  platformStatusFilter: document.getElementById("platformStatusFilter"),
  platformKeywordInput: document.getElementById("platformKeywordInput"),
  resetPlatformFilters: document.getElementById("resetPlatformFilters"),
  runPlatformFilters: document.getElementById("runPlatformFilters"),
  platformClientTableBody: document.getElementById("platformClientTableBody"),
  platformClientEmpty: document.getElementById("platformClientEmpty"),
  platformPaginationText: document.getElementById("platformPaginationText"),
  platformModalBackdrop: document.getElementById("platformModalBackdrop"),
  accountCenterModal: document.getElementById("accountCenterModal"),
  closeAccountCenterModal: document.getElementById("closeAccountCenterModal"),
  cancelAccountCenterBtn: document.getElementById("cancelAccountCenterBtn"),
  saveAccountCenterBtn: document.getElementById("saveAccountCenterBtn"),
  accountMobileInput: document.getElementById("accountMobileInput"),
  accountContactNameInput: document.getElementById("accountContactNameInput"),
  accountPasswordInput: document.getElementById("accountPasswordInput"),
  accountCompanyNameInput: document.getElementById("accountCompanyNameInput"),
  toastStack: document.getElementById("toastStack"),
};

function init() {
  bindEvents();
  render();
  window.addEventListener("storage", handleStorageSync);
}

function bindEvents() {
  els.openAccountCenterBtn.addEventListener("click", openAccountCenter);
  els.refreshPlatformBtn.addEventListener("click", refreshStatus);
  els.resetPlatformDemo.addEventListener("click", resetDemoState);
  els.resetPlatformFilters.addEventListener("click", resetFilters);
  els.runPlatformFilters.addEventListener("click", applyFilters);
  els.closeAccountCenterModal.addEventListener("click", closeAccountCenter);
  els.cancelAccountCenterBtn.addEventListener("click", closeAccountCenter);
  els.saveAccountCenterBtn.addEventListener("click", saveAccountCenter);
  els.platformModalBackdrop.addEventListener("click", closeAccountCenter);
}

function handleStorageSync(event) {
  if (event.key !== Demo.STORAGE_KEY) return;
  state = Demo.loadState();
  render();
  if (ui.accountCenterOpen) renderAccountCenterForm();
}

function resetDemoState() {
  state = Demo.resetState();
  ui.status = "all";
  ui.keyword = "";
  render();
  showToast("数据已重置");
}

function refreshStatus() {
  Demo.advanceDemoClock(state, 1);
  Demo.syncOfflineAt(state);
  Demo.saveState(state);
  render();
  showToast("客户端状态已刷新");
}

function resetFilters() {
  ui.status = "all";
  ui.keyword = "";
  render();
}

function applyFilters() {
  ui.status = els.platformStatusFilter.value;
  ui.keyword = els.platformKeywordInput.value.trim();
  render();
}

function render() {
  Demo.syncOfflineAt(state);
  renderSummary();
  renderBanner();
  renderFilters();
  renderTable();
  updateModalState();
}

function renderSummary() {
  const quotaUsage = Demo.getQuotaUsage(state);
  els.platformQuotaText.textContent = `客户端配额：${quotaUsage}/${state.enterprise.quota}`;
}

function renderBanner() {
  const quotaUsage = Demo.getQuotaUsage(state);
  const remaining = state.enterprise.quota - quotaUsage;
  if (remaining <= 0) {
    els.platformStatusBanner.innerHTML = `<p class="banner banner-warning">当前账号下的客户端额度已满，新设备暂无法登录。</p>`;
    return;
  }
  els.platformStatusBanner.innerHTML = "";
}

function renderFilters() {
  els.platformStatusFilter.value = ui.status;
  els.platformKeywordInput.value = ui.keyword;
}

function renderTable() {
  const rows = state.clients.filter((client) => client.bound).filter((client) => {
    const status = Demo.getClientStatus(client, state.meta.now);
    const statusMatch = ui.status === "all" || status === ui.status;
    const keyword = ui.keyword.toLowerCase();
    const keywordMatch =
      !keyword ||
      (client.name || "").toLowerCase().includes(keyword) ||
      client.hardwareCode.toLowerCase().includes(keyword);
    return statusMatch && keywordMatch;
  });

  els.platformClientTableBody.innerHTML = rows
    .map((client) => {
      const status = Demo.getClientStatus(client, state.meta.now);
      return `
        <tr>
          <td>${escapeHtml(client.name || client.hardwareCode)}</td>
          <td>${escapeHtml(client.hardwareCode)}</td>
          <td>${Demo.formatDateTime(client.boundAt)}</td>
          <td>${renderStatusBadge(status)}</td>
          <td>${Demo.formatDateTime(client.offlineAt)}</td>
        </tr>
      `;
    })
    .join("");

  els.platformClientEmpty.hidden = rows.length > 0;
  els.platformPaginationText.textContent = `共 ${rows.length} 条`;
}

function renderStatusBadge(text) {
  const cls = text === "在线" ? "status-online" : text === "离线" ? "status-offline" : "status-pending";
  return `<span class="status-badge ${cls}">${escapeHtml(text)}</span>`;
}

function openAccountCenter() {
  ui.accountCenterOpen = true;
  renderAccountCenterForm();
  updateModalState();
}

function closeAccountCenter() {
  ui.accountCenterOpen = false;
  updateModalState();
}

function renderAccountCenterForm() {
  els.accountMobileInput.value = state.enterprise.account;
  els.accountContactNameInput.value = state.enterprise.contactName || "";
  els.accountPasswordInput.value = state.enterprise.password;
  els.accountCompanyNameInput.value = state.enterprise.companyName;
}

function updateModalState() {
  const visible = ui.accountCenterOpen;
  els.platformModalBackdrop.hidden = !visible;
  els.accountCenterModal.hidden = !visible;
}

function saveAccountCenter() {
  const mobile = els.accountMobileInput.value.trim();
  const contactName = els.accountContactNameInput.value.trim();
  const password = els.accountPasswordInput.value.trim();
  const companyName = els.accountCompanyNameInput.value.trim();

  if (!/^1\d{10}$/.test(mobile)) {
    showToast("请输入 11 位手机号");
    return;
  }
  if (!contactName) {
    showToast("请输入联系人姓名");
    return;
  }
  if (!password) {
    showToast("请输入登录密码");
    return;
  }
  if (!companyName) {
    showToast("请输入企业名称");
    return;
  }

  Demo.advanceDemoClock(state, 1);
  state.enterprise.account = mobile;
  state.enterprise.contactName = contactName;
  state.enterprise.password = password;
  state.enterprise.companyName = companyName;
  state.clients.forEach((client) => {
    if (Object.prototype.hasOwnProperty.call(client, "enterpriseAccount")) {
      client.enterpriseAccount = mobile;
    }
  });
  if (state.session.loggedIn) state.session.account = mobile;
  Demo.saveState(state);
  render();
  closeAccountCenter();
  showToast("账号中心信息已保存");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

init();
