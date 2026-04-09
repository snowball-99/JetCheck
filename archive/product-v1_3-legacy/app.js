const state = {
  currentWorkspace: "platform",
  clientQuota: 4,
  clients: [
    {
      id: "c1",
      name: "上海产线主机A",
      uniqueCode: "jc-4c39fd77-a001",
      hardwareCode: "8C-4B-14-72-1E-10",
      activationStatus: "已激活",
      onlineStatus: "在线",
      activatedAt: "2026-03-18 10:21:08",
      offlineAt: "-",
    },
    {
      id: "c2",
      name: "宁波备线工位",
      uniqueCode: "jc-75a0ec18-b221",
      hardwareCode: "30-A5-3A-41-9F-C2",
      activationStatus: "已激活",
      onlineStatus: "离线",
      activatedAt: "2026-03-12 15:09:43",
      offlineAt: "2026-03-19 09:42:11",
    },
    {
      id: "c3",
      name: "苏州客户端03",
      uniqueCode: "jc-0fcb9182-c982",
      hardwareCode: "",
      activationStatus: "未激活",
      onlineStatus: "-",
      activatedAt: "-",
      offlineAt: "-",
    },
  ],
  editingClientId: null,
  platformFilters: {
    status: "all",
    keyword: "",
  },
  runtimeClient: {
    name: "苏州客户端03",
    uniqueCode: "",
    hardwareCode: "98-FF-21-AB-49-10",
    boundRecordId: null,
    enterprise: "雪球所在企业",
    networkOnline: true,
    activated: false,
    token: "",
  },
  toolBindings: [
    {
      toolName: "安全卡扣分类工具",
      modelVersionId: "mdl_local_001",
      detectionItems: ["外观判定", "卡扣位置校验"],
    },
    {
      toolName: "压壳缺陷检测工具",
      modelVersionId: "mdl_local_002",
      detectionItems: ["划痕检测", "气泡检测", "脏污检测"],
    },
  ],
  localModels: [
    {
      id: "mdl_local_001",
      modelName: "安全卡扣分类",
      source: "云端同步",
    },
    {
      id: "mdl_local_002",
      modelName: "压壳缺陷检测",
      source: "离线导入",
    },
  ],
  cloudModels: [
    {
      id: "cloud_model_a",
      modelName: "安全卡扣分类",
      sceneType: "分类",
      versions: [
        { id: "mdl_local_001", label: "20260318001" },
        { id: "mdl_cloud_004", label: "20260319002" },
      ],
    },
    {
      id: "cloud_model_b",
      modelName: "压壳缺陷检测",
      sceneType: "缺陷检测",
      versions: [
        { id: "mdl_local_002", label: "20260228008" },
        { id: "mdl_cloud_011", label: "20260316003" },
      ],
    },
  ],
};

const els = {
  workspacePills: document.querySelectorAll(".workspace-pill"),
  workspacePanels: document.querySelectorAll("[data-workspace-panel]"),
  navItems: document.querySelectorAll(".nav-item"),
  pagePanels: document.querySelectorAll("[data-page-panel]"),
  quotaText: document.getElementById("quotaText"),
  quotaTotal: document.getElementById("quotaTotal"),
  quotaUsed: document.getElementById("quotaUsed"),
  quotaRemaining: document.getElementById("quotaRemaining"),
  clientStatusFilter: document.getElementById("clientStatusFilter"),
  clientKeywordFilter: document.getElementById("clientKeywordFilter"),
  clientTableBody: document.getElementById("clientTableBody"),
  clientEmptyState: document.getElementById("clientEmptyState"),
  openAddClient: document.getElementById("openAddClient"),
  clientFormModal: document.getElementById("clientFormModal"),
  clientFormTitle: document.getElementById("clientFormTitle"),
  clientNameInput: document.getElementById("clientNameInput"),
  clientFormHint: document.getElementById("clientFormHint"),
  submitClientForm: document.getElementById("submitClientForm"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  activationModal: document.getElementById("activationModal"),
  activationCodeInput: document.getElementById("activationCodeInput"),
  activationError: document.getElementById("activationError"),
  confirmActivation: document.getElementById("confirmActivation"),
  enterJetCheck: document.getElementById("enterJetCheck"),
  toggleNetwork: document.getElementById("toggleNetwork"),
  triggerUnbind: document.getElementById("triggerUnbind"),
  clientInfoPanel: document.getElementById("clientInfoPanel"),
  clientNetworkChip: document.getElementById("clientNetworkChip"),
  clientActivationChip: document.getElementById("clientActivationChip"),
  toolBindings: document.getElementById("toolBindings"),
  localModelTableBody: document.getElementById("localModelTableBody"),
  localModelCount: document.getElementById("localModelCount"),
  openCloudDrawer: document.getElementById("openCloudDrawer"),
  closeCloudDrawer: document.getElementById("closeCloudDrawer"),
  cloudDrawer: document.getElementById("cloudDrawer"),
  cloudModelList: document.getElementById("cloudModelList"),
  openImportModal: document.getElementById("openImportModal"),
  importModal: document.getElementById("importModal"),
  importModelName: document.getElementById("importModelName"),
  importModelVersion: document.getElementById("importModelVersion"),
  importError: document.getElementById("importError"),
  confirmImport: document.getElementById("confirmImport"),
  toastStack: document.getElementById("toastStack"),
};

function init() {
  bindWorkspaceSwitch();
  bindPageNav();
  bindPlatformEvents();
  bindClientEvents();
  renderAll();
}

function bindWorkspaceSwitch() {
  els.workspacePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      state.currentWorkspace = pill.dataset.workspace;
      els.workspacePills.forEach((item) => item.classList.toggle("is-active", item === pill));
      els.workspacePanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.workspacePanel === state.currentWorkspace);
      });
    });
  });
}

function bindPageNav() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;
      const workspace = item.closest(".workspace").dataset.workspacePanel;
      const workspaceNav = item.closest(".sidebar").querySelectorAll(".nav-item");
      workspaceNav.forEach((navItem) => navItem.classList.toggle("is-active", navItem === item));
      document.querySelectorAll(`.workspace-${workspace} [data-page-panel]`).forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.pagePanel === page);
      });
    });
  });
}

function bindPlatformEvents() {
  els.clientStatusFilter.addEventListener("change", (event) => {
    state.platformFilters.status = event.target.value;
    renderClientTable();
  });
  els.clientKeywordFilter.addEventListener("input", (event) => {
    state.platformFilters.keyword = event.target.value.trim();
    renderClientTable();
  });
  els.openAddClient.addEventListener("click", () => openClientForm());
  els.submitClientForm.addEventListener("click", submitClientForm);
  document.querySelectorAll("[data-close='clientFormModal']").forEach((button) => {
    button.addEventListener("click", closeClientForm);
  });
}

function bindClientEvents() {
  els.enterJetCheck.addEventListener("click", handleEnterJetCheck);
  els.confirmActivation.addEventListener("click", submitActivation);
  els.toggleNetwork.addEventListener("click", () => {
    state.runtimeClient.networkOnline = !state.runtimeClient.networkOnline;
    if (!state.runtimeClient.networkOnline && state.runtimeClient.activated) {
      syncRuntimeOnlineStatus("离线");
    } else if (state.runtimeClient.networkOnline && state.runtimeClient.activated) {
      syncRuntimeOnlineStatus("在线");
    }
    renderRuntimeClient();
    showToast(state.runtimeClient.networkOnline ? "已切换为平台在线状态" : "已切换为平台离线状态");
  });
  els.triggerUnbind.addEventListener("click", unbindRuntimeClient);
  els.openCloudDrawer.addEventListener("click", openCloudDrawer);
  els.closeCloudDrawer.addEventListener("click", closeCloudDrawer);
  els.openImportModal.addEventListener("click", () => {
    openModal(els.importModal);
    els.importError.hidden = true;
    els.importModelName.value = "";
    els.importModelVersion.value = "";
  });
  document.querySelectorAll("[data-close='importModal']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.importModal));
  });
  els.confirmImport.addEventListener("click", importLocalModel);
}

function renderAll() {
  renderQuota();
  renderClientTable();
  renderRuntimeClient();
  renderBindings();
  renderLocalModels();
  renderCloudModels();
}

function renderQuota() {
  const used = state.clients.length;
  const remaining = Math.max(state.clientQuota - used, 0);
  els.quotaText.textContent = `${used} / ${state.clientQuota}`;
  els.quotaTotal.textContent = String(state.clientQuota);
  els.quotaUsed.textContent = String(used);
  els.quotaRemaining.textContent = String(remaining);
  els.openAddClient.disabled = used >= state.clientQuota;
}

function renderClientTable() {
  const rows = state.clients.filter((client) => {
    const statusMatch =
      state.platformFilters.status === "all" ||
      client.activationStatus === state.platformFilters.status ||
      client.onlineStatus === state.platformFilters.status;
    const keyword = state.platformFilters.keyword.toLowerCase();
    const keywordMatch =
      keyword === "" ||
      client.name.toLowerCase().includes(keyword) ||
      client.hardwareCode.toLowerCase().includes(keyword);
    return statusMatch && keywordMatch;
  });

  els.clientTableBody.innerHTML = rows
    .map((client) => {
      const canDelete = client.activationStatus === "未激活";
      return `
        <tr>
          <td>${client.name}</td>
          <td>${client.uniqueCode}</td>
          <td>${client.hardwareCode || "-"}</td>
          <td>${renderStatusBadge(client.activationStatus === "已激活" ? "active" : "pending", client.activationStatus)}</td>
          <td>${client.onlineStatus === "-" ? "-" : renderStatusBadge(client.onlineStatus === "在线" ? "online" : "offline", client.onlineStatus)}</td>
          <td>${client.activatedAt}</td>
          <td>${client.offlineAt}</td>
          <td>
            <div class="cta-row">
              <button class="table-btn primary" data-action="edit-client" data-id="${client.id}">编辑</button>
              <button class="table-btn ${canDelete ? "danger" : "neutral"}" data-action="delete-client" data-id="${client.id}" ${canDelete ? "" : "disabled"}>删除</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  els.clientEmptyState.hidden = rows.length > 0;

  els.clientTableBody.querySelectorAll("[data-action='edit-client']").forEach((button) => {
    button.addEventListener("click", () => openClientForm(button.dataset.id));
  });

  els.clientTableBody.querySelectorAll("[data-action='delete-client']").forEach((button) => {
    button.addEventListener("click", () => deleteClient(button.dataset.id));
  });
}

function openClientForm(clientId = null) {
  state.editingClientId = clientId;
  const used = state.clients.length;
  if (!clientId && used >= state.clientQuota) {
    showToast("客户端数量已达上限，请先解绑或删除未激活客户端");
    return;
  }
  const client = state.clients.find((item) => item.id === clientId);
  els.clientFormTitle.textContent = client ? "编辑客户端" : "新增客户端";
  els.clientNameInput.value = client ? client.name : "";
  els.clientFormHint.textContent = client
    ? `唯一编号 ${client.uniqueCode} 已生成，编辑仅支持修改客户端名称。`
    : `当前剩余可用名额 ${Math.max(state.clientQuota - used, 0)} 个。`;
  openModal(els.clientFormModal);
}

function closeClientForm() {
  state.editingClientId = null;
  closeModal(els.clientFormModal);
}

function submitClientForm() {
  const name = els.clientNameInput.value.trim();
  if (!name) {
    els.clientFormHint.textContent = "客户端名称不能为空";
    return;
  }
  if (name.length > 20) {
    els.clientFormHint.textContent = "客户端名称最大长度不能超过20个字符";
    return;
  }

  if (state.editingClientId) {
    const client = state.clients.find((item) => item.id === state.editingClientId);
    client.name = name;
    if (state.runtimeClient.boundRecordId === client.id) {
      state.runtimeClient.name = name;
    }
    showToast("客户端名称已更新");
  } else {
    const uniqueCode = `jc-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 6)}`;
    const newClient = {
      id: `c${Date.now()}`,
      name,
      uniqueCode,
      hardwareCode: "",
      activationStatus: "未激活",
      onlineStatus: "-",
      activatedAt: "-",
      offlineAt: "-",
    };
    state.clients.push(newClient);
    showToast(`已新增客户端，唯一编号 ${uniqueCode}`);
  }

  closeClientForm();
  renderQuota();
  renderClientTable();
  renderRuntimeClient();
}

function deleteClient(id) {
  const client = state.clients.find((item) => item.id === id);
  if (!client || client.activationStatus !== "未激活") {
    showToast("仅未激活客户端支持删除");
    return;
  }
  state.clients = state.clients.filter((item) => item.id !== id);
  showToast("客户端记录已删除");
  renderQuota();
  renderClientTable();
}

function handleEnterJetCheck() {
  if (!state.runtimeClient.networkOnline) {
    showToast("当前无法连接平台，请先恢复网络后再进行激活校验");
    return;
  }

  if (state.runtimeClient.activated) {
    showToast("客户端已激活，Token 校验通过，进入系统成功");
    return;
  }

  els.activationCodeInput.value = "";
  els.activationError.hidden = true;
  openModal(els.activationModal, true);
}

function submitActivation() {
  const inputCode = els.activationCodeInput.value.trim();
  const clientRecord = state.clients.find((client) => client.uniqueCode === inputCode);
  if (!state.runtimeClient.networkOnline) {
    return showActivationError("云端连接超时，请检查网络状态");
  }
  if (!clientRecord) {
    return showActivationError("客户端唯一编号不存在，请在平台端确认编码");
  }
  if (clientRecord.activationStatus === "已激活" && clientRecord.hardwareCode !== state.runtimeClient.hardwareCode) {
    return showActivationError("客户端唯一编号已被其他客户端激活");
  }

  clientRecord.activationStatus = "已激活";
  clientRecord.onlineStatus = "在线";
  clientRecord.hardwareCode = state.runtimeClient.hardwareCode;
  clientRecord.activatedAt = formatNow();
  clientRecord.offlineAt = "-";

  state.runtimeClient.activated = true;
  state.runtimeClient.token = `token_${Math.random().toString(36).slice(2, 10)}`;
  state.runtimeClient.uniqueCode = clientRecord.uniqueCode;
  state.runtimeClient.boundRecordId = clientRecord.id;
  state.runtimeClient.name = clientRecord.name;

  closeModal(els.activationModal);
  showToast("激活成功，客户端已绑定并获得访问 Token");
  renderClientTable();
  renderRuntimeClient();
}

function showActivationError(message) {
  els.activationError.hidden = false;
  els.activationError.textContent = message;
}

function renderRuntimeClient() {
  const client = state.runtimeClient;
  els.clientNetworkChip.textContent = client.networkOnline ? "平台在线" : "平台离线";
  els.clientActivationChip.textContent = client.activated ? "已激活" : "未激活";
  els.triggerUnbind.disabled = !(client.networkOnline && client.activated);

  els.clientInfoPanel.innerHTML = `
    <dt>客户端名称</dt><dd>${client.name || "-"}</dd>
    <dt>唯一编号</dt><dd>${client.uniqueCode || "-"}</dd>
    <dt>宿主机 MAC</dt><dd>${client.hardwareCode}</dd>
    <dt>平台企业</dt><dd>${client.enterprise}</dd>
    <dt>网络状态</dt><dd>${client.networkOnline ? "在线" : "离线"}</dd>
    <dt>激活状态</dt><dd>${client.activated ? "已激活" : "未激活"}</dd>
    <dt>Token</dt><dd>${client.token || "-"}</dd>
  `;
}

function syncRuntimeOnlineStatus(status) {
  const record = state.clients.find((item) => item.id === state.runtimeClient.boundRecordId);
  if (!record) return;
  record.onlineStatus = status;
  record.offlineAt = status === "离线" ? formatNow() : "-";
  renderClientTable();
}

function unbindRuntimeClient() {
  if (!state.runtimeClient.activated) {
    showToast("当前客户端尚未激活");
    return;
  }
  if (!state.runtimeClient.networkOnline) {
    showToast("解绑必须在联网且在线状态下发起");
    return;
  }

  const record = state.clients.find((item) => item.id === state.runtimeClient.boundRecordId);
  if (record) {
    record.activationStatus = "未激活";
    record.onlineStatus = "-";
    record.hardwareCode = "";
    record.activatedAt = "-";
    record.offlineAt = "-";
  }

  state.runtimeClient.activated = false;
  state.runtimeClient.token = "";
  state.runtimeClient.uniqueCode = "";
  state.runtimeClient.boundRecordId = null;
  showToast("解绑成功，客户端已失效，需要重新激活才能继续使用");
  renderClientTable();
  renderRuntimeClient();
}

function renderBindings() {
  els.toolBindings.innerHTML = state.toolBindings
    .map((binding) => {
      return `
        <article class="binding-item">
          <h4>${binding.toolName}</h4>
          <div class="binding-meta">
            <span class="chip">模型版本ID：${binding.modelVersionId}</span>
            ${binding.detectionItems.map((item) => `<span class="chip">${item}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLocalModels() {
  els.localModelCount.textContent = `${state.localModels.length} 个版本`;
  els.localModelTableBody.innerHTML = state.localModels
    .map((model) => {
      const inUse = isModelInUse(model.id);
      return `
        <tr>
          <td>${model.modelName}</td>
          <td>${model.id}</td>
          <td>${model.source}</td>
          <td>${renderStatusBadge(inUse ? "active" : "offline", inUse ? "使用中" : "可删除")}</td>
          <td>
            <div class="cta-row">
              <button class="table-btn danger" data-action="delete-model" data-id="${model.id}" ${inUse ? "disabled" : ""}>
                删除
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  els.localModelTableBody.querySelectorAll("[data-action='delete-model']").forEach((button) => {
    button.addEventListener("click", () => deleteLocalModel(button.dataset.id));
  });
}

function isModelInUse(modelId) {
  return state.toolBindings.some((binding) => binding.modelVersionId === modelId);
}

function deleteLocalModel(modelId) {
  if (isModelInUse(modelId)) {
    showToast("当前模型版本已被检测工具使用，无法删除");
    return;
  }
  state.localModels = state.localModels.filter((model) => model.id !== modelId);
  renderLocalModels();
  renderCloudModels();
  showToast("本地模型版本已删除");
}

function openCloudDrawer() {
  if (!state.runtimeClient.networkOnline) {
    showToast("当前为离线状态，仅可查看本地模型");
    return;
  }
  els.modalBackdrop.hidden = false;
  els.cloudDrawer.hidden = false;
}

function closeCloudDrawer() {
  els.cloudDrawer.hidden = true;
  cleanupBackdrop();
}

function renderCloudModels() {
  els.cloudModelList.innerHTML = state.cloudModels
    .map((model) => {
      const versionRows = model.versions
        .map((version) => {
          const exists = state.localModels.some((item) => item.id === version.id);
          return `
            <div class="cloud-version-row">
              <div>
                <strong>${version.label}</strong>
                <p class="muted">版本ID：${version.id}</p>
              </div>
              <button class="table-btn ${exists ? "neutral" : "primary"}" data-action="download-version" data-model="${model.modelName}" data-id="${version.id}" ${exists ? "disabled" : ""}>
                ${exists ? "已下载" : "下载到本地"}
              </button>
            </div>
          `;
        })
        .join("");

      return `
        <article class="cloud-model-card">
          <div class="section-title-row">
            <div>
              <h3>${model.modelName}</h3>
              <p class="muted">场景类型：${model.sceneType}</p>
            </div>
          </div>
          ${versionRows}
        </article>
      `;
    })
    .join("");

  els.cloudModelList.querySelectorAll("[data-action='download-version']").forEach((button) => {
    button.addEventListener("click", () => downloadCloudVersion(button.dataset.model, button.dataset.id));
  });
}

function downloadCloudVersion(modelName, versionId) {
  if (!state.runtimeClient.networkOnline) {
    showToast("当前离线，无法从云端下载模型");
    return;
  }
  state.localModels.push({
    id: versionId,
    modelName,
    source: "云端同步",
  });
  renderLocalModels();
  renderCloudModels();
  showToast(`模型版本 ${versionId} 已同步到本地`);
}

function importLocalModel() {
  const modelName = els.importModelName.value.trim();
  const versionId = els.importModelVersion.value.trim();
  if (!modelName || !versionId) {
    els.importError.hidden = false;
    els.importError.textContent = "模型名称和模型版本 ID 均不能为空";
    return;
  }
  if (state.localModels.some((model) => model.id === versionId)) {
    els.importError.hidden = false;
    els.importError.textContent = "模型版本 ID 已存在，不允许重复导入";
    return;
  }
  state.localModels.push({
    id: versionId,
    modelName,
    source: "离线导入",
  });
  closeModal(els.importModal);
  renderLocalModels();
  renderCloudModels();
  showToast(`模型包导入成功，版本 ${versionId} 已进入本地模型列表`);
}

function openModal(element, persistent = false) {
  els.modalBackdrop.hidden = false;
  element.hidden = false;
  if (!persistent) {
    els.modalBackdrop.onclick = () => {
      if (!document.querySelector(".activation-modal:not([hidden])")) {
        closeModal(element);
      }
    };
  } else {
    els.modalBackdrop.onclick = null;
  }
}

function closeModal(element) {
  element.hidden = true;
  cleanupBackdrop();
}

function cleanupBackdrop() {
  const activeLayer = document.querySelector(".modal:not([hidden]), .drawer:not([hidden])");
  els.modalBackdrop.hidden = !!activeLayer;
  if (els.modalBackdrop.hidden) {
    els.modalBackdrop.onclick = null;
  }
}

function renderStatusBadge(type, text) {
  return `<span class="status-badge ${type}">${text}</span>`;
}

function formatNow() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes()
  )}:${pad(now.getSeconds())}`;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2600);
}

init();
