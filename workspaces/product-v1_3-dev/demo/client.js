const Demo = window.JetCheckDemo;

let state = Demo.loadState();

const ui = {
  activePage: "detect-tools",
  toolView: "overview",
  builderStep: "acquire",
  settingsTab: "client",
  activeToolId: state.tools[0]?.id || null,
  activeRecordId: state.detectionRecords[0]?.id || null,
  activeRuntimeImageId: null,
  activeCameraId: state.cameras[0]?.id || null,
  activeParamGroupId: state.cameras[0]?.paramGroups?.[0]?.id || null,
  cameraFilters: {
    keyword: "",
    vendor: "all",
  },
  recordFilters: {
    toolId: "all",
    business: "all",
    startAt: "",
    endAt: "",
    keyword: "",
  },
  recordPagination: {
    page: 1,
    pageSize: 10,
  },
  discoveryKeyword: "",
  localFilters: {
    keyword: "",
    scene: "all",
  },
  cloudFilters: {
    keyword: "",
    scene: "all",
  },
  modelDrawerMode: "cloud-add",
  modelSelectorFilters: {
    keyword: "",
    scene: "all",
  },
  selectedModelId: null,
  modelTarget: null,
  modalConfig: null,
  recordImageViewer: null,
  pendingDownload: null,
  pendingDetectionToolId: null,
  pendingDetectionStartedAt: 0,
  runtimePlaybackRecordId: null,
  runtimeInitialToolId: null,
};

const timers = {
  download: null,
  detection: null,
  runtimeCarousel: null,
};

const CLEANUP_CUTOFF_OPTIONS = [
  { value: "1y", label: "一年前" },
  { value: "6m", label: "半年前" },
  { value: "3m", label: "三个月前" },
  { value: "1m", label: "一个月前" },
  { value: "custom", label: "自定义时间范围" },
];

const TOOL_ITEM_LIMITS = {
  acquire: 20,
  process: 20,
  detect: 20,
};

const RUN_MODE_OPTIONS = [
  { value: "acquire", label: "采图模式", hint: "仅采集原始图像。", requiredStep: "acquire" },
  { value: "process", label: "图像处理模式", hint: "采集图像并输出处理结果。", requiredStep: "process" },
  { value: "detect", label: "检测模式", hint: "完成检测并给出最终结果。", requiredStep: "detect" },
];

const els = {
  loginShell: document.getElementById("loginShell"),
  loginClientNameField: document.getElementById("loginClientNameField"),
  loginClientName: document.getElementById("loginClientName"),
  loginClientNameError: document.getElementById("loginClientNameError"),
  loginAccountField: document.getElementById("loginAccountField"),
  loginAccount: document.getElementById("loginAccount"),
  loginAccountError: document.getElementById("loginAccountError"),
  loginPasswordField: document.getElementById("loginPasswordField"),
  loginPassword: document.getElementById("loginPassword"),
  loginPasswordError: document.getElementById("loginPasswordError"),
  loginHint: document.getElementById("loginHint"),
  loginError: document.getElementById("loginError"),
  loginSubmit: document.getElementById("loginSubmit"),
  loginScenarioFirstBindBtn: document.getElementById("loginScenarioFirstBindBtn"),
  loginScenarioQuotaFullBtn: document.getElementById("loginScenarioQuotaFullBtn"),
  loginScenarioOfflineBtn: document.getElementById("loginScenarioOfflineBtn"),
  resetClientDemoFromLogin: document.getElementById("resetClientDemoFromLogin"),

  clientShell: document.getElementById("clientShell"),
  topbarCompanyName: document.getElementById("topbarCompanyName"),
  clientNetworkStatusPill: document.getElementById("clientNetworkStatusPill"),
  demoToggleClientNetwork: document.getElementById("demoToggleClientNetwork"),
  goSettingsBtn: document.getElementById("goSettingsBtn"),
  resetClientDemo: document.getElementById("resetClientDemo"),
  globalAlerts: document.getElementById("globalAlerts"),

  navItems: Array.from(document.querySelectorAll(".nav-item")),
  pages: Array.from(document.querySelectorAll("[data-page-panel]")),

  toolOverviewPanel: document.getElementById("toolOverviewPanel"),
  toolBuilderPanel: document.getElementById("toolBuilderPanel"),
  toolRuntimePanel: document.getElementById("toolRuntimePanel"),
  toolCardGrid: document.getElementById("toolCardGrid"),
  builderToolTitle: document.getElementById("builderToolTitle"),
  backToToolOverview: document.getElementById("backToToolOverview"),
  renameToolBtn: document.getElementById("renameToolBtn"),
  deleteToolBtn: document.getElementById("deleteToolBtn"),
  builderSteps: Array.from(document.querySelectorAll(".wizard-step")),
  builderStepBody: document.getElementById("builderStepBody"),
  prevBuilderStep: document.getElementById("prevBuilderStep"),
  nextBuilderStep: document.getElementById("nextBuilderStep"),
  finishBuilderBtn: document.getElementById("finishBuilderBtn"),
  runtimeToolTitle: document.getElementById("runtimeToolTitle"),
  runtimeModeSummary: document.getElementById("runtimeModeSummary"),
  runtimeConfigAlert: document.getElementById("runtimeConfigAlert"),
  backToToolOverviewFromRuntime: document.getElementById("backToToolOverviewFromRuntime"),
  resetCurrentRunBtn: document.getElementById("resetCurrentRunBtn"),
  stopToolRunBtn: document.getElementById("stopToolRunBtn"),
  startToolRun: document.getElementById("startToolRun"),
  runtimePrimaryResult: document.getElementById("runtimePrimaryResult"),
  runtimeCycleTime: document.getElementById("runtimeCycleTime"),
  runtimeTagCount: document.getElementById("runtimeTagCount"),
  runtimeTagInfo: document.getElementById("runtimeTagInfo"),
  runtimeCameraInfo: document.getElementById("runtimeCameraInfo"),
  runtimeCurrentImageResult: document.getElementById("runtimeCurrentImageResult"),
  runtimeImageStage: document.getElementById("runtimeImageStage"),
  runtimeImageResultList: document.getElementById("runtimeImageResultList"),
  runtimeImageCaption: document.getElementById("runtimeImageCaption"),

  cameraKeywordInput: document.getElementById("cameraKeywordInput"),
  cameraVendorFilter: document.getElementById("cameraVendorFilter"),
  searchCameraBtn: document.getElementById("searchCameraBtn"),
  resetCameraFilterBtn: document.getElementById("resetCameraFilterBtn"),
  refreshCameraBtn: document.getElementById("refreshCameraBtn"),
  openAddCameraBtn: document.getElementById("openAddCameraBtn"),
  cameraTableBody: document.getElementById("cameraTableBody"),
  cameraEmptyState: document.getElementById("cameraEmptyState"),

  recordToolFilter: document.getElementById("recordToolFilter"),
  recordBusinessFilter: document.getElementById("recordBusinessFilter"),
  recordStartTimeInput: document.getElementById("recordStartTimeInput"),
  recordEndTimeInput: document.getElementById("recordEndTimeInput"),
  recordKeywordInput: document.getElementById("recordKeywordInput"),
  resetRecordFilterBtn: document.getElementById("resetRecordFilterBtn"),
  searchRecordBtn: document.getElementById("searchRecordBtn"),
  exportRecordBtn: document.getElementById("exportRecordBtn"),
  recordTableBody: document.getElementById("recordTableBody"),
  recordEmptyState: document.getElementById("recordEmptyState"),
  recordTableFooter: document.getElementById("recordTableFooter"),
  recordPaginationSummary: document.getElementById("recordPaginationSummary"),
  recordPaginationControls: document.getElementById("recordPaginationControls"),

  settingsTabs: Array.from(document.querySelectorAll(".settings-tab")),
  settingsPanels: Array.from(document.querySelectorAll(".settings-panel")),
  clientInfoMeta: document.getElementById("clientInfoMeta"),
  editClientNameBtn: document.getElementById("editClientNameBtn"),
  unbindClientBtn: document.getElementById("unbindClientBtn"),
  storageSummaryGrid: document.getElementById("storageSummaryGrid"),
  warningThresholdInput: document.getElementById("warningThresholdInput"),
  blockThresholdInput: document.getElementById("blockThresholdInput"),
  thresholdMessage: document.getElementById("thresholdMessage"),
  saveStorageThresholdBtn: document.getElementById("saveStorageThresholdBtn"),
  simulateConsumeBtn: document.getElementById("simulateConsumeBtn"),
  simulateReleaseBtn: document.getElementById("simulateReleaseBtn"),

  modalBackdrop: document.getElementById("modalBackdrop"),
  sharedModal: document.getElementById("sharedModal"),
  sharedModalTitle: document.getElementById("sharedModalTitle"),
  sharedModalBody: document.getElementById("sharedModalBody"),
  sharedModalFooter: document.getElementById("sharedModalFooter"),
  sharedModalCancel: document.getElementById("sharedModalCancel"),
  sharedModalConfirm: document.getElementById("sharedModalConfirm"),
  closeSharedModal: document.getElementById("closeSharedModal"),

  addCameraModal: document.getElementById("addCameraModal"),
  closeAddCameraModal: document.getElementById("closeAddCameraModal"),
  cancelAddCameraBtn: document.getElementById("cancelAddCameraBtn"),
  cameraDiscoveryKeyword: document.getElementById("cameraDiscoveryKeyword"),
  searchDiscoveryBtn: document.getElementById("searchDiscoveryBtn"),
  scanDiscoveryBtn: document.getElementById("scanDiscoveryBtn"),
  cameraDiscoveryBody: document.getElementById("cameraDiscoveryBody"),
  confirmAddCameraBtn: document.getElementById("confirmAddCameraBtn"),

  paramModal: document.getElementById("paramModal"),
  closeParamModal: document.getElementById("closeParamModal"),
  paramModalTitle: document.getElementById("paramModalTitle"),
  addParamGroupBtn: document.getElementById("addParamGroupBtn"),
  paramGroupList: document.getElementById("paramGroupList"),
  paramPreviewStage: document.getElementById("paramPreviewStage"),
  paramPreviewCaption: document.getElementById("paramPreviewCaption"),
  paramFormScroll: document.getElementById("paramFormScroll"),
  paramFormFields: document.getElementById("paramFormFields"),

  modelDrawer: document.getElementById("modelDrawer"),
  closeModelDrawer: document.getElementById("closeModelDrawer"),
  openCloudModelDrawerBtn: document.getElementById("openCloudModelDrawerBtn"),
  importModelBtn: document.getElementById("importModelBtn"),
  importModelFileInput: document.getElementById("importModelFileInput"),
  localModelKeywordFilter: document.getElementById("localModelKeywordFilter"),
  localSceneFilter: document.getElementById("localSceneFilter"),
  resetLocalFiltersBtn: document.getElementById("resetLocalFiltersBtn"),
  applyLocalFiltersBtn: document.getElementById("applyLocalFiltersBtn"),
  localModelTableBody: document.getElementById("localModelTableBody"),
  localModelEmpty: document.getElementById("localModelEmpty"),
  modelSelectPanel: document.getElementById("modelSelectPanel"),
  selectorModelKeywordFilter: document.getElementById("selectorModelKeywordFilter"),
  selectorModelSceneFilter: document.getElementById("selectorModelSceneFilter"),
  resetSelectorModelFiltersBtn: document.getElementById("resetSelectorModelFiltersBtn"),
  applySelectorModelFiltersBtn: document.getElementById("applySelectorModelFiltersBtn"),
  selectorModelTableBody: document.getElementById("selectorModelTableBody"),
  selectorModelEmpty: document.getElementById("selectorModelEmpty"),
  cloudModelPanel: document.getElementById("cloudModelPanel"),
  cloudModelKeywordFilter: document.getElementById("cloudModelKeywordFilter"),
  cloudSceneFilter: document.getElementById("cloudSceneFilter"),
  resetCloudFiltersBtn: document.getElementById("resetCloudFiltersBtn"),
  applyCloudFiltersBtn: document.getElementById("applyCloudFiltersBtn"),
  cloudModelList: document.getElementById("cloudModelList"),
  modelDrawerFooter: document.getElementById("modelDrawerFooter"),
  cancelModelSelectBtn: document.getElementById("cancelModelSelectBtn"),
  confirmModelSelectBtn: document.getElementById("confirmModelSelectBtn"),

  toastStack: document.getElementById("toastStack"),
};

function init() {
  bindStaticEvents();
  syncUiSelections();
  renderAll();
  window.addEventListener("storage", handleStorageSync);
}

function bindStaticEvents() {
  els.loginScenarioFirstBindBtn.addEventListener("click", () => applyLoginDemoScenario("first-bind"));
  els.loginScenarioQuotaFullBtn.addEventListener("click", () => applyLoginDemoScenario("quota-full"));
  els.loginScenarioOfflineBtn.addEventListener("click", () => applyLoginDemoScenario("offline"));
  els.resetClientDemoFromLogin.addEventListener("click", resetDemoState);
  els.loginSubmit.addEventListener("click", submitLogin);
  els.demoToggleClientNetwork.addEventListener("click", toggleNetworkState);
  els.goSettingsBtn.addEventListener("click", () => switchPage("settings"));
  els.resetClientDemo.addEventListener("click", resetDemoState);
  els.globalAlerts.addEventListener("click", handleGlobalAlertClick);

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => switchPage(item.dataset.page));
  });

  els.backToToolOverview.addEventListener("click", () => switchToolView("overview"));
  els.backToToolOverviewFromRuntime.addEventListener("click", () => switchToolView("overview"));
  els.renameToolBtn.addEventListener("click", renameActiveTool);
  els.deleteToolBtn.addEventListener("click", deleteActiveTool);
  els.prevBuilderStep.addEventListener("click", moveBuilderStep.bind(null, -1));
  els.nextBuilderStep.addEventListener("click", moveBuilderStep.bind(null, 1));
  els.finishBuilderBtn.addEventListener("click", () => switchToolView("overview"));
  els.builderSteps.forEach((button) => {
    button.addEventListener("click", () => setBuilderStep(button.dataset.builderStep));
  });
  els.resetCurrentRunBtn.addEventListener("click", resetCurrentRunTask);
  els.stopToolRunBtn.addEventListener("click", stopToolRunSession);
  els.startToolRun.addEventListener("click", startDetectionRun);

  els.toolCardGrid.addEventListener("click", handleToolCardClick);
  els.builderStepBody.addEventListener("click", handleBuilderBodyClick);
  els.toolRuntimePanel.addEventListener("click", handleToolRuntimeClick);
  els.toolRuntimePanel.addEventListener("keydown", handleToolRuntimeKeydown);
  els.runtimeImageResultList.addEventListener("click", handleRuntimeImageResultClick);

  els.searchCameraBtn.addEventListener("click", applyCameraFilters);
  els.resetCameraFilterBtn.addEventListener("click", resetCameraFilters);
  els.refreshCameraBtn.addEventListener("click", refreshCameraList);
  els.openAddCameraBtn.addEventListener("click", openAddCameraModal);
  els.cameraTableBody.addEventListener("click", handleCameraTableClick);

  els.resetRecordFilterBtn.addEventListener("click", resetRecordFilters);
  els.searchRecordBtn.addEventListener("click", applyRecordFilters);
  els.exportRecordBtn.addEventListener("click", openRecordExportModal);
  els.recordTableBody.addEventListener("click", handleRecordTableClick);
  els.recordPaginationControls.addEventListener("click", handleRecordPaginationClick);

  els.settingsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      ui.settingsTab = tab.dataset.settingsTab;
      renderSettingsPanels();
    });
  });
  els.editClientNameBtn.addEventListener("click", editClientName);
  els.unbindClientBtn.addEventListener("click", confirmUnbindClient);
  els.saveStorageThresholdBtn.addEventListener("click", saveStorageThresholds);
  els.storageSummaryGrid.addEventListener("click", handleStorageSummaryClick);
  els.simulateConsumeBtn.addEventListener("click", () => mutateStorage(-4));
  els.simulateReleaseBtn.addEventListener("click", () => mutateStorage(6));

  els.closeSharedModal.onclick = closeSharedModal;
  els.sharedModalCancel.onclick = closeSharedModal;
  els.sharedModalConfirm.onclick = submitSharedModal;

  els.closeAddCameraModal.addEventListener("click", closeAddCameraModal);
  els.cancelAddCameraBtn.addEventListener("click", closeAddCameraModal);
  els.searchDiscoveryBtn.addEventListener("click", applyDiscoveryFilters);
  els.scanDiscoveryBtn.addEventListener("click", scanDiscoveryDevices);
  els.confirmAddCameraBtn.addEventListener("click", confirmAddCamera);

  els.closeParamModal.addEventListener("click", closeParamModal);
  els.addParamGroupBtn.addEventListener("click", addParamGroup);
  els.paramGroupList.addEventListener("click", handleParamGroupClick);
  els.paramFormFields.addEventListener("input", handleParamFieldChange);
  els.paramFormFields.addEventListener("change", handleParamFieldChange);
  els.paramFormFields.addEventListener("wheel", handleParamFieldWheel);

  els.openCloudModelDrawerBtn.addEventListener("click", openCloudModelDrawer);
  els.closeModelDrawer.addEventListener("click", closeModelDrawer);
  els.cancelModelSelectBtn.addEventListener("click", closeModelDrawer);
  els.confirmModelSelectBtn.addEventListener("click", confirmModelSelection);
  els.importModelBtn.addEventListener("click", openImportModelModal);
  els.importModelFileInput.addEventListener("change", handleImportModelFileChange);
  els.resetLocalFiltersBtn.addEventListener("click", resetLocalFilters);
  els.applyLocalFiltersBtn.addEventListener("click", applyLocalFilters);
  els.resetSelectorModelFiltersBtn.addEventListener("click", resetModelSelectorFilters);
  els.applySelectorModelFiltersBtn.addEventListener("click", applyModelSelectorFilters);
  els.resetCloudFiltersBtn.addEventListener("click", resetCloudFilters);
  els.applyCloudFiltersBtn.addEventListener("click", applyCloudFilters);
  els.localModelKeywordFilter.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyLocalFilters();
  });
  els.selectorModelKeywordFilter.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyModelSelectorFilters();
  });
  els.cloudModelKeywordFilter.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyCloudFilters();
  });
  els.localModelTableBody.addEventListener("click", handleLocalModelTableClick);
  els.selectorModelTableBody.addEventListener("click", handleSelectorModelTableClick);
  els.cloudModelList.addEventListener("click", handleCloudModelListClick);
}

function resetDemoState() {
  clearPendingTasks();
  state = Demo.resetState();
  ui.activePage = "detect-tools";
  ui.toolView = "overview";
  ui.builderStep = "acquire";
  ui.settingsTab = "client";
  ui.activeToolId = state.tools[0]?.id || null;
  ui.activeRecordId = state.detectionRecords[0]?.id || null;
  ui.activeRuntimeImageId = null;
  ui.runtimePlaybackRecordId = null;
  ui.runtimeInitialToolId = null;
  ui.activeCameraId = state.cameras[0]?.id || null;
  ui.activeParamGroupId = state.cameras[0]?.paramGroups?.[0]?.id || null;
  ui.cameraFilters = { keyword: "", vendor: "all" };
  ui.recordFilters = { toolId: "all", business: "all", startAt: "", endAt: "", keyword: "" };
  ui.discoveryKeyword = "";
  ui.localFilters = { keyword: "", scene: "all" };
  ui.cloudFilters = { keyword: "", scene: "all" };
  ui.modelDrawerMode = "cloud-add";
  ui.modelSelectorFilters = { keyword: "", scene: "all" };
  ui.selectedModelId = null;
  ui.modelTarget = null;
  ui.modalConfig = null;
  ui.pendingDownload = null;
  ui.pendingDetectionToolId = null;
  ui.pendingDetectionStartedAt = 0;
  closeAllPanels();
  syncUiSelections();
  renderAll();
  showToast("数据已重置");
}

function clearPendingTasks() {
  if (timers.download) clearTimeout(timers.download);
  if (timers.detection) clearTimeout(timers.detection);
  if (timers.runtimeCarousel) clearTimeout(timers.runtimeCarousel);
  timers.download = null;
  timers.detection = null;
  timers.runtimeCarousel = null;
  ui.pendingDetectionToolId = null;
  ui.pendingDetectionStartedAt = 0;
}

function handleStorageSync(event) {
  if (event.key !== Demo.STORAGE_KEY) return;
  state = Demo.loadState();
  syncUiSelections();
  renderAll();
}

function syncUiSelections() {
  syncRuntimeSessionState();
  const validPages = new Set(els.pages.map((page) => page.dataset.pagePanel));
  if (!validPages.has(ui.activePage)) ui.activePage = "detect-tools";

  const activeToolExists = state.tools.some((tool) => tool.id === ui.activeToolId);
  if (!activeToolExists) ui.activeToolId = state.tools[0]?.id || null;
  if (ui.runtimeInitialToolId && !state.tools.some((tool) => tool.id === ui.runtimeInitialToolId)) {
    ui.runtimeInitialToolId = null;
  }

  const activeRecordExists = state.detectionRecords.some((record) => record.id === ui.activeRecordId);
  if (!activeRecordExists) ui.activeRecordId = state.detectionRecords[0]?.id || null;
  if (ui.runtimePlaybackRecordId && !state.detectionRecords.some((record) => record.id === ui.runtimePlaybackRecordId)) {
    ui.runtimePlaybackRecordId = null;
  }

  const activeCameraExists = state.cameras.some((camera) => camera.id === ui.activeCameraId);
  if (!activeCameraExists) ui.activeCameraId = state.cameras[0]?.id || null;

  const camera = getActiveCamera();
  const activeParamExists = camera?.paramGroups?.some((group) => group.id === ui.activeParamGroupId);
  if (!activeParamExists) ui.activeParamGroupId = camera?.paramGroups?.[0]?.id || null;

  const activeTool = getActiveTool();
  const activeRuntimeRecord = getActiveRuntimeRecord();
  const runtimeImages = isRuntimeInitialState(activeTool) ? getRuntimeInitialImageResults(activeTool) : getRecordImageResults(activeRuntimeRecord);
  const runtimeImageExists = runtimeImages.some((item) => item.id === ui.activeRuntimeImageId);
  if (!runtimeImageExists) ui.activeRuntimeImageId = runtimeImages[0]?.id || null;

  if (ui.activePage === "settings") renderSettingsPanels();
}

function syncRuntimeSessionState() {
  const runtimeClient = Demo.getRuntimeClient(state);
  if (runtimeClient?.bound) {
    state.session.loggedIn = true;
    state.session.clientId = runtimeClient.id;
    state.session.account = state.enterprise.account;
    return;
  }

  state.session.loggedIn = false;
  state.session.clientId = null;
  state.session.account = "";
}

function persistState(message) {
  Demo.syncOfflineAt(state);
  let saveError = null;
  try {
    Demo.saveState(state);
    state = Demo.loadState();
  } catch (error) {
    saveError = error;
  }
  syncUiSelections();
  renderAll();
  if (saveError) {
    showToast(message ? `${message}，但浏览器本地缓存已满，刷新后可能丢失` : "浏览器本地缓存已满，当前修改仅在本次页面内生效");
    return;
  }
  if (message) showToast(message);
}

function renderAll() {
  syncUiSelections();
  renderShellVisibility();
  renderLoginScreen();
  renderTopbar();
  renderGlobalAlerts();
  renderNavigation();
  renderTools();
  renderCameraPage();
  renderModelManagePage();
  renderRecords();
  renderSettings();
  renderAddCameraModal();
  renderParamModal();
  renderModelDrawer();
  updateOverlay();
}

function renderShellVisibility() {
  const loggedIn = hasUsableSession();
  els.loginShell.hidden = loggedIn;
  els.clientShell.hidden = !loggedIn;
}

function renderLoginScreen() {
  const client = Demo.getRuntimeClient(state);
  const activeScenario = getActiveLoginDemoMode();
  els.loginClientName.value = client?.name || state.runtimeDevice.name;
  els.loginAccount.value = state.enterprise.account;
  els.loginPassword.value = state.enterprise.password;
  renderLoginScenarioButtons();
  els.loginHint.className = "login-text-hint";
  els.loginHint.textContent = getLoginScenarioHint(activeScenario);
  clearLoginErrors();
  els.loginSubmit.disabled = false;
  els.loginSubmit.textContent = "登录";
}

function clearLoginErrors() {
  [
    [els.loginClientNameField, els.loginClientNameError],
    [els.loginAccountField, els.loginAccountError],
    [els.loginPasswordField, els.loginPasswordError],
  ].forEach(([field, errorEl]) => {
    field?.classList.remove("is-error");
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
  });
  els.loginError.hidden = true;
  els.loginError.textContent = "";
}

function showLoginFieldErrors(errors = {}) {
  clearLoginErrors();
  const fieldMap = {
    clientName: [els.loginClientNameField, els.loginClientNameError],
    account: [els.loginAccountField, els.loginAccountError],
    password: [els.loginPasswordField, els.loginPasswordError],
  };
  Object.entries(errors).forEach(([key, message]) => {
    if (!message || !fieldMap[key]) return;
    const [field, errorEl] = fieldMap[key];
    field?.classList.add("is-error");
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = message;
    }
  });
}

function renderLoginScenarioButtons() {
  const activeScenario = getActiveLoginDemoMode();
  const buttonMap = {
    "first-bind": els.loginScenarioFirstBindBtn,
    "quota-full": els.loginScenarioQuotaFullBtn,
    offline: els.loginScenarioOfflineBtn,
  };

  Object.entries(buttonMap).forEach(([scenario, button]) => {
    button.classList.toggle("is-active", scenario === activeScenario);
  });
}

function getActiveLoginDemoMode() {
  const client = Demo.getRuntimeClient(state);
  if (!state.runtimeDevice.networkOnline) return "offline";
  if (!client && Demo.getQuotaUsage(state) >= state.enterprise.quota) return "quota-full";
  return "first-bind";
}

function getLoginScenarioHint(type) {
  if (type === "quota-full") {
    return "当前账号可用设备数已满，新设备暂时无法登录。";
  }
  if (type === "offline") {
    return "当前网络异常，暂时无法登录，请检查网络后重试。";
  }
  return "首次登录后，系统会自动绑定当前设备。";
}

function applyLoginDemoScenario(type) {
  clearPendingTasks();
  state = Demo.resetState();
  state.session.loggedIn = false;
  state.session.clientId = null;
  state.session.account = "";
  state.session.lastMessage = "";
  state.runtimeDevice.name = "苏州客户端03";
  state.runtimeDevice.networkOnline = true;
  state.clients = state.clients.filter((client) => client.hardwareCode !== state.runtimeDevice.hardwareCode);

  if (type === "quota-full") {
    state.enterprise.quota = Demo.getQuotaUsage(state);
  }

  if (type === "offline") {
    state.runtimeDevice.networkOnline = false;
  }

  Demo.saveState(state);
  syncUiSelections();
  renderAll();
}

function renderTopbar() {
  els.topbarCompanyName.textContent = state.enterprise.companyName;
  els.clientNetworkStatusPill.textContent = state.runtimeDevice.networkOnline ? "在线" : "离线";
  els.clientNetworkStatusPill.className = `client-network-status ${state.runtimeDevice.networkOnline ? "is-online" : "is-offline"}`;
  els.demoToggleClientNetwork.textContent = state.runtimeDevice.networkOnline ? "Demo: 切换离线" : "Demo: 切换在线";
}

function renderNavigation() {
  els.navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.page === ui.activePage);
  });
  els.pages.forEach((page) => {
    page.classList.toggle("is-active", page.dataset.pagePanel === ui.activePage);
  });
}

function renderModelManagePage() {
  renderLocalModels();
}

function renderGlobalAlerts() {
  if (!hasUsableSession()) {
    els.globalAlerts.innerHTML = "";
    return;
  }

  const alerts = [];
  if (Demo.isStorageBlocked(state)) {
    alerts.push(renderTopbarAlert("danger", "剩余空间过低，新的检测任务已暂停，请先清理数据。", "去清理", "open-storage-cleanup"));
  } else if (Demo.isStorageWarning(state)) {
    alerts.push(renderTopbarAlert("warning", "剩余空间不足，可能影响检测，请尽快清理数据。", "去清理", "open-storage-cleanup"));
  }

  if (!state.runtimeDevice.networkOnline) {
    alerts.push(renderTopbarAlert("neutral", "当前离线"));
  }

  els.globalAlerts.innerHTML = alerts.join("");
}

function handleGlobalAlertClick(event) {
  const actionEl = getClosestEventTarget(event, "[data-action]");
  if (!actionEl) return;
  if (actionEl.dataset.action !== "open-storage-cleanup") return;
  ui.settingsTab = "storage";
  switchPage("settings", { settingsTab: "storage" });
}

function renderTools() {
  els.toolOverviewPanel.hidden = ui.toolView !== "overview";
  els.toolBuilderPanel.hidden = ui.toolView !== "builder";
  els.toolRuntimePanel.hidden = ui.toolView !== "runtime";
  renderToolCardGrid();
  renderToolBuilder();
  renderToolRuntime();
}

function renderToolCardGrid() {
  els.toolCardGrid.innerHTML =
    state.tools
      .map((tool) => {
        const isRunning = isToolSessionRunning(tool) && tool.runtime?.status !== "未运行";
        return `
          <article class="tool-card ${tool.tone || "tone-blue"}" data-action="open-tool-runtime" data-id="${tool.id}">
            <div class="tool-card-top">
              <button class="tool-action-btn" data-action="edit-tool" data-id="${tool.id}" ${isRunning ? "disabled" : ""}>编辑</button>
            </div>
            <h3>${escapeHtml(tool.name)}</h3>
            ${isRunning ? `<div class="tool-card-runtime-row"><span class="tool-card-runtime-state">运行中</span></div>` : ""}
          </article>
        `;
      })
      .join("") +
    `<button class="tool-create-card" data-action="create-tool">+ 新建工具</button>`;
}

function renderToolBuilder() {
  const tool = getActiveTool();
  if (!tool) return;
  const editingLocked = isToolEditingLocked(tool);
  const invalidAcquireCount = getToolInvalidAcquireCount(tool);
  const invalidProcessCount = getToolInvalidProcessCount(tool);
  const invalidDetectCount = getToolInvalidDetectConfigCount(tool);
  els.builderToolTitle.textContent = tool.name;
  els.builderSteps.forEach((button) => {
    const step = button.dataset.builderStep;
    const hasInvalidConfig =
      (step === "acquire" && invalidAcquireCount > 0) ||
      (step === "process" && invalidProcessCount > 0) ||
      (step === "detect" && invalidDetectCount > 0);
    button.classList.toggle("is-active", button.dataset.builderStep === ui.builderStep);
    button.classList.toggle("is-invalid", hasInvalidConfig);
    if (hasInvalidConfig) {
      button.title = "配置失效";
    } else {
      button.removeAttribute("title");
    }
  });
  els.renameToolBtn.disabled = editingLocked;
  els.deleteToolBtn.disabled = editingLocked;

  if (ui.builderStep === "acquire") {
    els.builderStepBody.innerHTML = renderBuilderStepSection({
      title: "图像来源",
      limitText: getBuilderLimitText("acquire", tool.acquire.length),
      actionLabel: "添加图像来源",
      actionKey: "add-acquire",
      items: tool.acquire.map((item) => renderAcquireItem(tool, item)),
      emptyText: "当前还没有图像来源。",
      disabled: editingLocked || tool.acquire.length >= TOOL_ITEM_LIMITS.acquire,
    });
  }

  if (ui.builderStep === "process") {
    els.builderStepBody.innerHTML = renderBuilderStepSection({
      title: "图像处理步骤",
      limitText: getBuilderLimitText("process", tool.process.length),
      actionLabel: "添加处理步骤",
      actionKey: "add-process",
      items: tool.process.map((item) => renderProcessItem(tool, item)),
      emptyText: tool.acquire.length ? "当前还没有处理步骤。" : "当前没有可选图像，请前往上一步创建图像来源。",
      disabled: editingLocked || !tool.acquire.length || tool.process.length >= TOOL_ITEM_LIMITS.process,
    });
  }

  if (ui.builderStep === "detect") {
    els.builderStepBody.innerHTML = renderBuilderStepSection({
      title: "检测判断步骤",
      limitText: getBuilderLimitText("detect", tool.detect.length),
      actionLabel: "添加检测步骤",
      actionKey: "add-detect",
      items: tool.detect.map((item) => renderDetectItem(tool, item)),
      emptyText: tool.process.length ? "当前还没有检测步骤。" : "当前没有可选图像，请前往上一步创建处理步骤。",
      disabled: editingLocked || !tool.process.length || tool.detect.length >= TOOL_ITEM_LIMITS.detect,
    });
  }

  const stepIndex = getBuilderStepIndex(ui.builderStep);
  const canNext = canMoveNextFromStep(ui.builderStep);
  els.prevBuilderStep.disabled = stepIndex === 0;
  els.nextBuilderStep.disabled = stepIndex >= 2 || !canNext;
  els.nextBuilderStep.hidden = stepIndex >= 2;
  els.finishBuilderBtn.disabled =
    stepIndex < 2 ||
    !tool.acquire.length ||
    !tool.process.length ||
    !tool.detect.length ||
    invalidAcquireCount > 0 ||
    invalidProcessCount > 0 ||
    invalidDetectCount > 0;
}

function getBuilderLimitText(type, count) {
  return `${count}/${TOOL_ITEM_LIMITS[type]}`;
}

function isRuntimeInitialState(tool = getActiveTool()) {
  return Boolean(tool && ui.runtimeInitialToolId === tool.id);
}

function activateRuntimeInitialState(toolId = ui.activeToolId) {
  if (!toolId) return;
  stopRuntimeCarousel();
  ui.runtimeInitialToolId = toolId;
  ui.runtimePlaybackRecordId = null;
  ui.activeRuntimeImageId = null;
}

function clearRuntimeInitialState(toolId = "") {
  stopRuntimeCarousel();
  if (!toolId || ui.runtimeInitialToolId === toolId) ui.runtimeInitialToolId = null;
  if (!toolId || ui.activeToolId === toolId) {
    ui.runtimePlaybackRecordId = null;
    ui.activeRuntimeImageId = null;
  }
}

function getRuntimeInitialImageResults(tool) {
  if (!tool) return [];
  return (Array.isArray(tool.acquire) ? tool.acquire : []).map((acquire, index) => {
    const camera = acquire?.cameraId ? state.cameras.find((item) => item.id === acquire.cameraId) || null : null;
    return {
      id: `preview_${acquire.id || index}`,
      acquireId: acquire.id,
      acquireName: acquire.name || `图像来源 ${index + 1}`,
      imageLabel: getAcquireSampleName(acquire),
      sourceImageUrl: "",
      sourceImageName: "",
      sourceImageWidth: Number(acquire.sampleImageWidth || 0),
      sourceImageHeight: Number(acquire.sampleImageHeight || 0),
      result: "",
      subResults: [],
      inputSource:
        acquire?.type === "camera"
          ? `${Demo.getCameraLabel(camera)} / ${Demo.getParamGroupLabel(camera, acquire.paramGroupId)}`
          : acquire?.endpoint || "外部输入",
    };
  });
}

function renderToolRuntime() {
  const tool = getActiveTool();
  if (!tool) return;
  if (ui.activePage !== "detect-tools" || ui.toolView !== "runtime") {
    stopRuntimeCarousel();
    return;
  }
  if (ui.pendingDetectionToolId === tool.id && !timers.detection) {
    ui.pendingDetectionToolId = null;
    ui.pendingDetectionStartedAt = 0;
    if (tool.runtime?.status === "执行中") tool.runtime.status = "等待信号";
  }
  const sessionActive = isToolSessionRunning(tool);
  const initialState = isRuntimeInitialState(tool);
  const sessionRunMode = Demo.normalizeRunMode(tool.runtime?.sessionMode || getHighestAvailableRunMode(tool));
  const pendingCurrentTool = ui.pendingDetectionToolId === tool.id;
  const waitingForCurrentRun = initialState || pendingCurrentTool;
  const latestRecord = waitingForCurrentRun ? null : getActiveRuntimeRecord();
  const activeRunMode = getActiveRuntimeMode(tool, latestRecord);
  const showRuntimeResultBadge = sessionRunMode === "detect";
  const imageResults = waitingForCurrentRun ? getRuntimeInitialImageResults(tool) : getRecordImageResults(latestRecord);
  const activeImageResult = imageResults.find((item) => item.id === ui.activeRuntimeImageId) || imageResults[0] || null;
  const playing = isRuntimePlaybackActive(latestRecord);
  const runningBusy = pendingCurrentTool || playing;
  const visibleTags = getRuntimeVisibleTags(tool, latestRecord);
  const tagsEditable = canEditRuntimeTags(latestRecord, tool) && !playing;
  const sessionMode = tool.runtime?.sessionMode || getHighestAvailableRunMode(tool);
  const runActionLabel = getRunActionLabel(sessionMode);
  const waitingLabel = getRunWaitingLabel(sessionMode);
  if (activeImageResult) ui.activeRuntimeImageId = activeImageResult.id;

  els.runtimeToolTitle.textContent = tool.name;
  els.runtimeModeSummary.textContent = getRunModeLabel(sessionMode);
  els.runtimePrimaryResult.textContent = !sessionActive
    ? "未运行"
    : pendingCurrentTool
      ? "执行中"
      : playing
        ? "执行中"
        : latestRecord
          ? (activeRunMode === "detect" ? latestRecord.totalResult || latestRecord.businessResult || tool.runtime.primaryResult || "暂无结果" : "已完成")
          : waitingLabel;
  els.runtimeCycleTime.textContent = waitingForCurrentRun ? "-" : tool.runtime.cycleTime || "-";
  els.startToolRun.disabled = !sessionActive || Demo.isStorageBlocked(state) || !!ui.pendingDetectionToolId || playing;
  els.startToolRun.textContent = pendingCurrentTool ? `${runActionLabel}中...` : playing ? `${runActionLabel}中...` : runActionLabel;
  els.resetCurrentRunBtn.disabled = !sessionActive || (!pendingCurrentTool && !latestRecord);
  els.stopToolRunBtn.disabled = !sessionActive;
  const runtimeImageResultText = getDisplayResultText(activeImageResult?.result || "-");
  els.runtimeCurrentImageResult.hidden =
    !showRuntimeResultBadge || waitingForCurrentRun || !activeImageResult || runningBusy || runtimeImageResultText === "-";
  if (!els.runtimeCurrentImageResult.hidden) {
    renderStatusBadgeInto(els.runtimeCurrentImageResult, runtimeImageResultText);
  }
  els.runtimeTagCount.textContent = `已添加 ${visibleTags.length}/3`;
  els.runtimeTagInfo.innerHTML = renderRuntimeTagInfo(visibleTags, {
    editable: tagsEditable,
    hint: runningBusy ? `${runActionLabel}进行中，暂不能编辑标签` : "当前可添加标签",
  });
  els.runtimeCameraInfo.innerHTML = renderRuntimeCameraInfo(activeImageResult);

  if (!imageResults.length) {
    els.runtimeImageResultList.innerHTML = `<div class="builder-empty">${initialState ? "当前暂无图像来源" : "暂无运行记录"}</div>`;
    els.runtimeImageStage.innerHTML = `<div class="inspection-stage runtime-image-stage runtime-image-stage-empty"><div class="builder-empty">${initialState ? waitingLabel : "暂无图像结果"}</div></div>`;
    els.runtimeImageCaption.textContent = initialState ? "等待开始" : "暂无图像结果";
    els.runtimeCurrentImageResult.hidden = true;
    els.runtimeTagCount.textContent = `已添加 ${visibleTags.length}/3`;
    els.runtimeTagInfo.innerHTML = renderRuntimeTagInfo(visibleTags, {
      editable: tagsEditable,
      hint: runningBusy ? `${runActionLabel}进行中，暂不能编辑标签` : "当前可添加标签",
    });
    els.runtimeCameraInfo.innerHTML = `<div class="builder-empty builder-empty-compact">当前暂无相机信息</div>`;
    stopRuntimeCarousel();
    return;
  }

  els.runtimeImageResultList.innerHTML = imageResults
    .map((item, index) =>
      renderRuntimeImageResultItem(item, index, item.id === activeImageResult?.id, {
        showResultBadge: showRuntimeResultBadge,
        showSubResultButton: shouldShowRuntimeSubResultButton(item, tool, sessionRunMode),
        subResultButtonDisabled: waitingForCurrentRun,
      }),
    )
    .join("");
  if (waitingForCurrentRun) {
    els.runtimeImageStage.innerHTML = `<div class="inspection-stage runtime-image-stage runtime-image-stage-empty"><div class="builder-empty">${waitingLabel}</div></div>`;
    els.runtimeImageCaption.textContent = "等待开始";
    stopRuntimeCarousel();
    return;
  }
  els.runtimeImageStage.innerHTML = renderRuntimeImageStage(activeImageResult);
  els.runtimeImageCaption.textContent = activeImageResult
    ? activeImageResult.acquireName || activeImageResult.imageLabel || "当前图像"
    : initialState
      ? "等待开始"
      : activeRunMode === "detect"
        ? "等待检测结果"
        : "等待运行结果";
  syncRuntimeCarousel(latestRecord);
}

function renderRuntimeImageResultItem(item, index, active, options = {}) {
  const { showResultBadge = true, showSubResultButton = false, subResultButtonDisabled = false } = options;
  const badgeMarkup = showResultBadge ? renderBusinessBadge(item.result) : "";
  const subResultCount = Array.isArray(item.subResults) ? item.subResults.length : 0;
  const shouldRenderSubResultButton = showSubResultButton;
  const buttonDisabled = subResultButtonDisabled || subResultCount === 0;
  return `
    <div class="runtime-image-result-item ${active ? "is-active" : ""}">
      <button class="runtime-image-result-main" data-action="select-runtime-image" data-id="${item.id}" type="button">
        <div class="runtime-image-result-copy">
          <strong>${escapeHtml(item.acquireName || `图像来源 ${index + 1}`)}</strong>
        </div>
        ${badgeMarkup}
      </button>
      ${
        shouldRenderSubResultButton
          ? `<button class="table-btn" data-action="open-runtime-image-detail" data-id="${item.id}" type="button" ${buttonDisabled ? "disabled" : ""}>查看分区结果（${subResultCount}）</button>`
          : ""
      }
    </div>
  `;
}

function shouldShowRuntimeSubResultButton(imageResult, tool, sessionRunMode) {
  if (sessionRunMode === "acquire") return false;
  if (hasOnlyFullImageSubResults(imageResult)) return false;
  if (hasOnlyFullImageProcessOutputs(tool, imageResult?.acquireId)) return false;
  return true;
}

function getActiveRuntimeMode(tool = getActiveTool(), record = getActiveRuntimeRecord()) {
  return Demo.normalizeRunMode(record?.runMode || tool?.runtime?.sessionMode || getHighestAvailableRunMode(tool));
}

function getRuntimeCameraStatusText(camera) {
  if (!camera) return "-";
  return camera.status === "离线" ? "异常" : "已连接";
}

function renderRuntimeCameraInfo(imageResult) {
  const context = getRuntimeAcquireContext(imageResult);
  if (!context.acquire) {
    return `<div class="builder-empty builder-empty-compact">当前暂无相机信息</div>`;
  }
  if (context.acquire.type !== "camera" || !context.camera) {
    return `<div class="runtime-camera-empty">当前图像来自接口，不显示相机信息。</div>`;
  }
  const cameraStatusText = getRuntimeCameraStatusText(context.camera);
  return `
    <div class="runtime-camera-info">
      <div class="runtime-camera-main">
        <strong>${escapeHtml(Demo.getCameraLabel(context.camera))}</strong>
        ${renderStatusBadgeHtml(cameraStatusText)}
      </div>
      <div class="runtime-camera-meta">
        <span>参数组</span>
        <strong>${escapeHtml(context.paramGroup ? context.paramGroup.name : "-")}</strong>
      </div>
      <button class="secondary-btn" data-action="preview-runtime-camera" data-acquire-id="${context.acquire.id}" type="button">查看相机画面</button>
    </div>
  `;
}

function renderRuntimeTagInfo(tags = [], options = {}) {
  const { editable = false, hint = "当前可添加标签" } = options;
  if (!tags.length && !editable) {
    return `<div class="builder-empty builder-empty-compact">${hint}</div>`;
  }
  const tagCount = tags.length;
  return `
    <div class="runtime-tag-panel">
      <div class="runtime-tag-list ${tagCount ? "" : "is-empty"}">
        ${
          tagCount
            ? tags
                .map(
                  (tag, index) => `
                    <span class="runtime-tag-chip">
                      <span>${escapeHtml(tag)}</span>
                      ${
                        editable
                          ? `<button class="icon-btn runtime-tag-remove" data-action="remove-runtime-tag" data-index="${index}" type="button" aria-label="删除标签">×</button>`
                          : ""
                      }
                    </span>
                  `,
                )
                .join("")
            : `<span class="runtime-tag-empty">${editable ? "当前未添加标签" : hint}</span>`
        }
      </div>
      ${
        editable
          ? `
            <div class="runtime-tag-editor">
              <input
                id="runtimeTagInput"
                type="text"
                maxlength="12"
                placeholder="输入标签后添加"
                ${tagCount >= 3 ? "disabled" : ""}
              />
              <button class="secondary-btn" data-action="add-runtime-tag" type="button" ${tagCount >= 3 ? "disabled" : ""}>添加</button>
            </div>
          `
          : ""
      }
    </div>
  `;
}

function getRuntimeRecordTags(record) {
  return Array.isArray(record?.customTags) ? record.customTags.filter((item) => String(item || "").trim()) : [];
}

function getRuntimeDraftTags(tool = getActiveTool()) {
  return Array.isArray(tool?.runtime?.draftTags) ? tool.runtime.draftTags.filter((item) => String(item || "").trim()) : [];
}

function getRuntimeActiveTags(tool = getActiveTool()) {
  return Array.isArray(tool?.runtime?.activeTags) ? tool.runtime.activeTags.filter((item) => String(item || "").trim()) : [];
}

function getRuntimeVisibleTags(tool = getActiveTool(), record = getActiveRuntimeRecord()) {
  if (ui.pendingDetectionToolId === tool?.id) {
    const activeTags = getRuntimeActiveTags(tool);
    return activeTags.length ? activeTags : getRuntimeDraftTags(tool);
  }
  if (isRuntimeInitialState(tool) || !record) return getRuntimeDraftTags(tool);
  return getRuntimeRecordTags(record);
}

function getRuntimeTagTarget(tool = getActiveTool(), record = getActiveRuntimeRecord()) {
  if (!tool) return null;
  if (isRuntimeInitialState(tool) || !record) {
    if (!tool.runtime || typeof tool.runtime !== "object") tool.runtime = {};
    return { type: "draft", owner: tool.runtime };
  }
  return { type: "record", owner: record };
}

function canEditRuntimeTags(record = getActiveRuntimeRecord(), tool = getActiveTool()) {
  if (!tool) return false;
  if (ui.pendingDetectionToolId === tool.id) return false;
  return true;
}

function getSubResultDetectResults(item) {
  return Array.isArray(item?.detectResults) ? item.detectResults : [];
}

function getAggregatedBusinessResult(items = []) {
  const values = items.map((item) => getDisplayResultText(item?.businessResult || "-"));
  if (values.includes("NG")) return "NG";
  if (values.includes("OK")) return "OK";
  return "-";
}

function getSubResultBusinessResult(item) {
  const detectResults = getSubResultDetectResults(item);
  if (detectResults.length) return getAggregatedBusinessResult(detectResults);
  return getDisplayResultText(item?.businessResult || "-");
}

function getSubResultPrimaryDetectResult(item) {
  return getSubResultDetectResults(item)[0] || null;
}

function getDetectResultTitle(item, index = 0) {
  const detectName = String(item?.detectName || item?.name || "").trim();
  if (detectName) return detectName;
  const modelLabel = item?.modelId ? Demo.getModelLabel(state, item.modelId) : "";
  if (modelLabel && modelLabel !== "未选择模型") return modelLabel;
  return `检测结果 ${index + 1}`;
}

function getResultItemSceneType(item) {
  const primary = getSubResultPrimaryDetectResult(item) || item;
  return (primary?.modelSceneType || getModelSceneTypeById(primary?.modelId)) || "";
}

function buildDetectResultSummary(item, index = 0) {
  const title = getDetectResultTitle(item, index);
  const output = String(item?.algorithmOutput || "").trim();
  return output ? `${title} · ${output}` : title;
}

function renderRuntimeImageStage(imageResult) {
  if (!imageResult) {
    return `<div class="inspection-stage runtime-image-stage runtime-image-stage-empty"><div class="builder-empty">暂无图像结果</div></div>`;
  }
  const subResults = Array.isArray(imageResult.subResults) ? imageResult.subResults : [];
  const sourceUrl = getImageResultSourceUrl(imageResult, getActiveTool()?.id || "");
  const aspectRatio = getRuntimeImageAspectRatio(imageResult, getActiveTool()?.id || "");
  const sourceStyle = [
    `--runtime-source-aspect:${aspectRatio};`,
    sourceUrl ? `--runtime-source-image:url("${escapeAttribute(sourceUrl)}");` : "",
  ].join("");
  return `
    <div class="inspection-stage runtime-image-stage runtime-source-stage">
      <div class="runtime-source-stage-shell">
        <div class="runtime-source-canvas ${sourceUrl ? "has-source" : "is-fallback"}" style="${escapeAttribute(sourceStyle)}">
          <div class="runtime-source-grid"></div>
          <div class="runtime-mapped-layer">
            ${subResults.map((item, index) => renderRuntimeMappedResult(item, index, imageResult.id)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRuntimeMappedResult(item, index, imageResultId = "") {
  const style = getRuntimeMappedRegionStyle(item, index);
  const fullImage = isFullImageRegion(item?.regionBox);
  const toneClass = getResultToneModifier(getSubResultBusinessResult(item));
  const resultText = getSubResultBusinessResult(item);
  const showResultBadge = resultText !== "-";
  if (fullImage) {
    return `
      <div
        class="runtime-mapped-result record-roi-button ${toneClass} is-full-image"
        style="${escapeAttribute(style)}"
      >
        ${showResultBadge ? `<span class="runtime-mapped-result-badge ${toneClass}">${escapeHtml(resultText)}</span>` : ""}
        <div class="runtime-mapped-inner">
          ${renderRuntimeFullImageOverlay(item)}
        </div>
      </div>
    `;
  }
  return `
    <button
      class="runtime-mapped-result record-roi-button ${toneClass} ${fullImage ? "is-full-image" : "is-roi-only"}"
      style="${escapeAttribute(style)}"
      data-action="focus-runtime-subresult"
      data-image-id="${imageResultId}"
      data-sub-id="${item.id}"
      type="button"
      title="查看对应分区结果"
      aria-label="查看对应分区结果"
    >
      <span class="runtime-mapped-index">检测区域${index + 1}</span>
      ${showResultBadge ? `<span class="runtime-mapped-result-badge ${toneClass}">${escapeHtml(resultText)}</span>` : ""}
    </button>
  `;
}

function renderRuntimeFullImageOverlay(item) {
  const detectResults = getSubResultDetectResults(item);
  if (!detectResults.length) return "";
  return detectResults
    .map(
      (detectResult, detectIndex) => `
        <div class="runtime-vector-tag ${getResultToneModifier(detectResult.businessResult)}" style="top:${18 + detectIndex * 38}px;">
          ${escapeHtml(buildDetectResultSummary(detectResult, detectIndex))}
        </div>
      `,
    )
    .join("");
}

function getOverlayDisplayLabel(item) {
  const detectResults = getSubResultDetectResults(item);
  if (detectResults.length === 1) return getOverlayDisplayLabel(detectResults[0]);
  if (detectResults.length > 1) return detectResults.map((detectResult, index) => getDetectResultTitle(detectResult, index)).join(" / ");
  const raw = String(item?.algorithmOutput || item?.businessResult || "").trim();
  if (isDimensionModelResult(item)) return raw || "点点距离 12.84 mm";
  if (!raw) return "目标类别";
  const confidenceMatch = raw.match(/(\d+(?:\.\d+)?%)/);
  const confidence = confidenceMatch ? ` ${confidenceMatch[1]}` : "";
  if (/^OK\b/i.test(raw)) return `正常边界${confidence}`;
  if (/^分类通过/.test(raw)) return `目标类别${confidence}`;
  if (/^分类异常/.test(raw)) return `异常类别${confidence}`;
  return raw;
}

function getRuntimeImageAspectRatio(imageResult, toolId = "") {
  let width = Number(imageResult?.sourceImageWidth || 0);
  let height = Number(imageResult?.sourceImageHeight || 0);
  if (!(width > 0 && height > 0)) {
    const acquire = getImageResultAcquire(imageResult, toolId || getActiveTool()?.id || getActiveRecord()?.toolId || "");
    width = Number(acquire?.sampleImageWidth || width || 0);
    height = Number(acquire?.sampleImageHeight || height || 0);
    if (!(width > 0 && height > 0) && acquire?.cameraId && acquire?.paramGroupId) {
      const camera = state.cameras.find((item) => item.id === acquire.cameraId);
      const group = camera?.paramGroups?.find((item) => item.id === acquire.paramGroupId);
      width = Number(group?.settings?.width || width || 0);
      height = Number(group?.settings?.height || height || 0);
    }
  }
  if (width > 0 && height > 0) {
    return `${width} / ${height}`;
  }
  return "4 / 3";
}

function getRuntimeMappedRegionStyle(item, index) {
  const region = item?.regionBox;
  if (region && [region.x, region.y, region.w, region.h].every((value) => Number.isFinite(Number(value)))) {
    const leftValue = Math.max(0, Math.min(94, Number(region.x) * 100));
    const topValue = Math.max(0, Math.min(94, Number(region.y) * 100));
    const widthValue = Math.max(6, Math.min(100 - leftValue, Number(region.w) * 100));
    const heightValue = Math.max(6, Math.min(100 - topValue, Number(region.h) * 100));
    const left = `${leftValue}%`;
    const top = `${topValue}%`;
    const width = `${widthValue}%`;
    const height = `${heightValue}%`;
    return `left:${left};top:${top};width:${width};height:${height};`;
  }
  const preset = getRecordRoiPreset(index);
  return `left:${preset.left};top:${preset.top};width:${preset.width};height:${preset.height};`;
}

function findModelMetaById(modelId) {
  if (!modelId) return null;
  const localModel = state.localModels.find((item) => item.id === modelId);
  if (localModel) return localModel;
  for (const cloudModel of state.cloudModels) {
    const version = Array.isArray(cloudModel.versions) ? cloudModel.versions.find((item) => item.id === modelId) : null;
    if (version) {
      return {
        id: version.id,
        version: version.version,
        modelName: cloudModel.modelName,
        sceneType: cloudModel.sceneType,
      };
    }
  }
  return null;
}

function getModelCategoriesById(modelId) {
  const meta = findModelMetaById(modelId);
  return Demo.normalizeModelCategories(meta);
}

function getModelSceneTypeById(modelId) {
  return findModelMetaById(modelId)?.sceneType || "";
}

function isCategoryOutputModelId(modelId) {
  return getModelSceneTypeById(modelId) === "分类";
}

function isDimensionModelResult(item) {
  if (!item) return false;
  return getResultItemSceneType(item) === "尺寸";
}

function getRuntimeMeasurementShellStyle() {
  return "left:12%;top:18%;width:68%;height:46%;";
}

function getRecordMeasurementShellStyle(index) {
  const preset = getRecordRoiPreset(index);
  return `left:${preset.vectorLeft};top:${preset.vectorTop};width:${preset.vectorWidth};height:${preset.vectorHeight};`;
}

function renderMeasurementOverlay(label, style, options = {}) {
  const tone = options.tone || (options.isNg ? "ng" : "ok");
  const modifier = tone === "ng" ? "is-ng" : tone === "neutral" ? "is-neutral" : "is-ok";
  return `
    <div class="vector-measure-shell ${modifier}" style="${style}">
      <span class="vector-measure-line"></span>
      <span class="vector-measure-point is-start"></span>
      <span class="vector-measure-point is-end"></span>
      ${options.showLabel === false ? "" : `<span class="vector-measure-label ${modifier}">${label}</span>`}
    </div>
  `;
}

function getRuntimeAcquireContext(imageResult) {
  const tool = getActiveTool();
  const acquire = tool?.acquire?.find((item) => item.id === imageResult?.acquireId) || null;
  const camera = acquire?.cameraId ? state.cameras.find((item) => item.id === acquire.cameraId) || null : null;
  const paramGroup = camera?.paramGroups?.find((item) => item.id === acquire?.paramGroupId) || null;
  return { tool, acquire, camera, paramGroup };
}

function stopRuntimeCarousel() {
  if (timers.runtimeCarousel) clearTimeout(timers.runtimeCarousel);
  timers.runtimeCarousel = null;
}

function isRuntimePlaybackActive(record) {
  return Boolean(record && ui.runtimePlaybackRecordId === record.id);
}

function syncRuntimeCarousel(record) {
  stopRuntimeCarousel();
  if (!isRuntimePlaybackActive(record) || ui.activePage !== "detect-tools" || ui.toolView !== "runtime" || ui.pendingDetectionToolId) {
    return;
  }
  const imageResults = getRecordImageResults(record);
  if (imageResults.length <= 1) {
    ui.runtimePlaybackRecordId = null;
    renderToolRuntime();
    return;
  }
  timers.runtimeCarousel = window.setTimeout(() => {
    stepRuntimeImage(1, { silent: true, playbackRecordId: record.id });
  }, 1800);
}

function stepRuntimeImage(direction, options = {}) {
  const record = getActiveRuntimeRecord();
  const imageResults = getRecordImageResults(record);
  if (imageResults.length <= 1) return;
  const currentIndex = Math.max(
    0,
    imageResults.findIndex((item) => item.id === ui.activeRuntimeImageId),
  );
  if (options.playbackRecordId && options.playbackRecordId === record?.id && direction > 0 && currentIndex >= imageResults.length - 1) {
    ui.runtimePlaybackRecordId = null;
    renderToolRuntime();
    return;
  }
  const nextIndex = (currentIndex + direction + imageResults.length) % imageResults.length;
  ui.activeRuntimeImageId = imageResults[nextIndex]?.id || imageResults[0]?.id || null;
  renderToolRuntime();
  if (!options.silent) {
    showToast(direction > 0 ? "已切换到下一张图" : "已切换到上一张图");
  }
}

function openRuntimeImageResultsModal(imageResultId, activeSubId = "") {
  const record = getActiveRuntimeRecord();
  const imageResults = getRecordImageResults(record);
  const imageResult = imageResults.find((item) => item.id === imageResultId);
  if (!record || !imageResult) return;
  stopRuntimeCarousel();
  const subResults = Array.isArray(imageResult.subResults) ? imageResult.subResults : [];
  openSubResultViewerModal({
    title: `${imageResult.acquireName} · 分区结果（${subResults.length}）`,
    subResults,
    tool: state.tools.find((item) => item.id === record.toolId) || getActiveTool(),
    activeSubId,
  });
}

function openSubResultViewerModal({ title, subResults = [], tool = getActiveTool(), activeSubId = "", onCloseRestore = null }) {
  openSharedModal({
    title,
    panelClass: "modal-xl",
    bodyClass: "modal-body-subresult",
    body: `<div id="runtimeSubResultViewerRoot" class="runtime-subresult-root"></div>`,
    confirmText: "关闭",
    hideCancel: true,
    onOpen() {
      const closeWithRestore = () => {
        closeSharedModal();
        if (typeof onCloseRestore === "function") onCloseRestore();
      };
      els.closeSharedModal.onclick = closeWithRestore;
      els.sharedModalCancel.onclick = closeWithRestore;
      const root = document.getElementById("runtimeSubResultViewerRoot");
      if (!root) return;
      let currentId = subResults.find((item) => item.id === activeSubId)?.id || subResults[0]?.id || "";
      const render = () => {
        root.innerHTML = renderSubResultViewerLayout(subResults, currentId, tool);
      };
      root.addEventListener("click", (event) => {
        const button = getClosestEventTarget(event, "[data-action='select-runtime-subresult']");
        if (!button?.dataset.id) return;
        currentId = button.dataset.id;
        render();
      });
      render();
    },
    onConfirm() {
      closeSharedModal();
      if (typeof onCloseRestore === "function") onCloseRestore();
      return true;
    },
  });
}

function renderSubResultViewerLayout(subResults, activeId, tool = getActiveTool()) {
  if (!subResults.length) {
    return `<div class="runtime-subresult-dialog"><div class="builder-empty">当前暂无分区结果</div></div>`;
  }
  const activeIndex = Math.max(0, subResults.findIndex((item) => item.id === activeId));
  const activeItem = subResults[activeIndex] || subResults[0];
  const activeResultText = getSubResultBusinessResult(activeItem);
  return `
    <div class="runtime-subresult-viewer">
      <aside class="runtime-subresult-sidebar">
        <div class="runtime-subresult-sidebar-title">分区结果（${subResults.length}）</div>
        <div class="runtime-subresult-list">
          ${subResults
            .map((item, index) => renderSubResultViewerListItem(item, index, item.id === activeItem.id, tool))
            .join("")}
        </div>
      </aside>
      <section class="runtime-subresult-preview">
        <div class="runtime-subresult-preview-head">
          <strong>${escapeHtml(getRuntimeSubResultDisplayName(activeItem, activeIndex, tool))}</strong>
          ${activeResultText === "-" ? "" : renderBusinessBadge(activeResultText)}
        </div>
        ${renderSubResultViewerStage(activeItem, activeIndex)}
      </section>
    </div>
  `;
}

function renderSubResultViewerListItem(item, index, active, tool = getActiveTool()) {
  const displayName = getRuntimeSubResultDisplayName(item, index, tool);
  const resultText = getSubResultBusinessResult(item);
  return `
    <button
      class="runtime-subresult-list-item ${active ? "is-active" : ""}"
      data-action="select-runtime-subresult"
      data-id="${item.id}"
      type="button"
      title="${escapeAttribute(displayName)}"
      aria-label="查看${escapeAttribute(displayName)}"
    >
      <div
        class="inspection-stage inspection-stage-compact runtime-subresult-list-thumb"
        style="${escapeAttribute(getRecordSubStageStyle(index, "thumb"))}"
      >
        <div class="record-sub-image-grid"></div>
        <div class="record-overlay-layer record-thumb-overlay">${renderVectorOverlay(item, index, { showLabel: false })}</div>
        <span class="record-thumb-index">${index + 1}</span>
      </div>
      <div class="runtime-subresult-list-meta">
        <div class="runtime-subresult-list-copy">
          <strong>${escapeHtml(displayName)}</strong>
        </div>
        ${resultText === "-" ? "" : renderBusinessBadge(resultText)}
      </div>
    </button>
  `;
}

function renderSubResultViewerStage(item, index) {
  return `
    <div
      class="inspection-stage inspection-stage-compact runtime-subresult-stage runtime-subresult-stage-lg"
      style="${escapeAttribute(getRecordSubStageStyle(index, "main"))}"
    >
      <div class="record-sub-image-grid"></div>
      <div class="record-overlay-layer">${renderVectorOverlay(item, index, { showLabel: true })}</div>
    </div>
  `;
}

function getRuntimeSubResultDisplayName(item, index, tool = getActiveTool()) {
  const rawName = String(item?.name || "").trim();
  if (/ROI\s*\d+$/i.test(rawName)) return rawName.replace(/ROI/i, "检测区域");
  const processName = tool?.process?.find((process) => process.id === item?.processId)?.name || rawName || `处理步骤 ${index + 1}`;
  const roiMatch = String(item?.source || "").match(/ROI\s*#?\s*(\d+)/i);
  const roiIndex = roiMatch?.[1] || index + 1;
  return `${processName} 检测区域${roiIndex}`;
}

function updateSelectOptions(selectEl, options, selectedValue, emptyLabel) {
  if (!selectEl) return;
  const markup = options.length
    ? options
        .map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`)
        .join("")
    : `<option value="">${escapeHtml(emptyLabel || "暂无可选项")}</option>`;

  if (selectEl.dataset.renderMarkup !== markup) {
    selectEl.innerHTML = markup;
    selectEl.dataset.renderMarkup = markup;
  }

  const normalizedValue = selectedValue || "";
  const nextValue = options.some((option) => option.value === normalizedValue) ? normalizedValue : options[0]?.value || "";
  if (selectEl.value !== nextValue) {
    selectEl.value = nextValue;
  }
}

function getRunningToolNames(filterFn) {
  return state.tools.filter((tool) => isToolSessionRunning(tool) && filterFn(tool)).map((tool) => tool.name);
}

function getRunningToolNamesUsingCamera(cameraId) {
  return getRunningToolNames((tool) => tool.acquire.some((item) => item.type === "camera" && item.cameraId === cameraId));
}

function getRunningToolNamesUsingParamGroup(paramGroupId) {
  return getRunningToolNames((tool) => tool.acquire.some((item) => item.type === "camera" && item.paramGroupId === paramGroupId));
}

function getRunningToolNamesUsingModel(modelId) {
  return getRunningToolNames(
    (tool) =>
      tool.process.some((item) => item.modelId === modelId) ||
      tool.detect.some((item) => item.modelId === modelId),
  );
}

function renderCameraPage() {
  els.cameraKeywordInput.value = ui.cameraFilters.keyword;
  els.cameraVendorFilter.value = ui.cameraFilters.vendor;
  const rows = getFilteredCameras();
  els.cameraTableBody.innerHTML = rows
    .map((camera) => {
      const runningReferenceNames = getRunningToolNamesUsingCamera(camera.id);
      const canDelete = runningReferenceNames.length === 0;
      const canManageParam = camera.status === "空闲";
      return `
        <tr>
          <td>${escapeHtml(Demo.getCameraLabel(camera))}</td>
          <td>${escapeHtml(camera.id || camera.serial)}</td>
          <td>${escapeHtml(camera.vendor)}</td>
          <td>${escapeHtml(camera.model)}</td>
          <td>${renderStatusBadgeHtml(camera.status)}</td>
          <td>
            <div class="camera-row-actions">
              <button class="table-btn table-btn-primary" data-action="manage-param" data-id="${camera.id}" ${canManageParam ? "" : "disabled"}>参数组管理</button>
              <button class="table-btn table-btn-danger" data-action="delete-camera" data-id="${camera.id}" ${canDelete ? "" : "disabled"}>删除</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
  els.cameraEmptyState.hidden = rows.length > 0;
}

function renderRecords() {
  renderRecordFilters();
  renderRecordTable();
}

function renderRecordFilters() {
  const toolOptions = [`<option value="all">全部工具</option>`]
    .concat(state.tools.map((tool) => `<option value="${tool.id}">${escapeHtml(tool.name)}</option>`))
    .join("");
  els.recordToolFilter.innerHTML = toolOptions;
  els.recordToolFilter.value = ui.recordFilters.toolId;
  els.recordBusinessFilter.value = ui.recordFilters.business;
  els.recordStartTimeInput.value = ui.recordFilters.startAt;
  els.recordEndTimeInput.value = ui.recordFilters.endAt;
  els.recordKeywordInput.value = ui.recordFilters.keyword;
}

function renderRecordTable() {
  const rows = getFilteredRecords();
  const pagination = getRecordPaginationState(rows);
  const pageRows = rows.slice(pagination.startIndex, pagination.endIndex);

  els.recordTableBody.innerHTML = pageRows
    .map((record) => {
      return `
        <tr>
          <td>${escapeHtml(record.id)}</td>
          <td>${escapeHtml(record.toolName)}</td>
          <td>${escapeHtml(getRunModeLabel(record.runMode || "detect"))}</td>
          <td>${Demo.formatDateTime(record.triggeredAt)}</td>
          <td>${renderBusinessBadge(record.businessResult || record.totalResult || "-")}</td>
          <td>${renderRecordTagSummary(record)}</td>
          <td><button class="table-btn table-btn-primary" data-action="view-record-detail" data-id="${record.id}">查看详情</button></td>
        </tr>
      `;
    })
    .join("");
  els.recordEmptyState.hidden = rows.length > 0;
  renderRecordPagination(rows, pagination);
}

function renderRecordTagSummary(record) {
  const tags = getRuntimeRecordTags(record);
  if (!tags.length) {
    return `<span class="record-tag-empty">-</span>`;
  }
  return `
    <div class="record-tag-summary">
      ${tags.map((tag) => `<span class="record-tag-chip">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function getRecordPaginationState(rows = getFilteredRecords()) {
  const total = rows.length;
  const pageSize = ui.recordPagination.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, ui.recordPagination.page), totalPages);
  ui.recordPagination.page = page;
  const startIndex = total ? (page - 1) * pageSize : 0;
  const endIndex = total ? Math.min(startIndex + pageSize, total) : 0;
  return {
    total,
    page,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
  };
}

function renderRecordPagination(rows, pagination = getRecordPaginationState(rows)) {
  if (!els.recordTableFooter || !els.recordPaginationSummary || !els.recordPaginationControls) return;
  const { total, page, totalPages, startIndex, endIndex } = pagination;
  els.recordTableFooter.hidden = total === 0;
  if (!total) {
    els.recordPaginationSummary.textContent = "";
    els.recordPaginationControls.innerHTML = "";
    return;
  }

  els.recordPaginationSummary.textContent = `共 ${total} 条，第 ${startIndex + 1}-${endIndex} 条`;
  const pageNumbers = getRecordPaginationNumbers(page, totalPages);
  els.recordPaginationControls.innerHTML = `
    <button class="page-btn" data-action="prev-page" type="button" ${page <= 1 ? "disabled" : ""}>上一页</button>
    ${pageNumbers
      .map((value) =>
        value === "ellipsis"
          ? `<span class="pagination-ellipsis">...</span>`
          : `<button class="page-btn ${value === page ? "is-active" : ""}" data-action="go-page" data-page="${value}" type="button">${value}</button>`,
      )
      .join("")}
    <button class="page-btn" data-action="next-page" type="button" ${page >= totalPages ? "disabled" : ""}>下一页</button>
  `;
}

function getRecordPaginationNumbers(page, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }
  if (page >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

function renderSettings() {
  renderSettingsPanels();
  renderClientInfo();
  renderStoragePanel();
}

function renderSettingsPanels() {
  els.settingsTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.settingsTab === ui.settingsTab);
  });
  els.settingsPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.settingsPanel === ui.settingsTab);
  });
}

function renderClientInfo() {
  const client = Demo.getRuntimeClient(state);
  const clientStatus = client ? Demo.getClientStatus(client, state.meta.now) : "未绑定";
  els.clientInfoMeta.innerHTML = [
    ["设备名称", client?.name || state.runtimeDevice.name],
    ["客户端版本", "JetCheck Client v1.3"],
    ["设备编号", state.runtimeDevice.hardwareCode],
    ["绑定时间", Demo.formatDateTime(client?.boundAt)],
    ["登录手机号", state.enterprise.account],
    ["设备状态", clientStatus],
  ]
    .map(([label, value]) => `<span>${label}</span><span>${escapeHtml(String(value))}</span>`)
    .join("");
  els.editClientNameBtn.disabled = !hasUsableSession();
  els.unbindClientBtn.disabled = !hasUsableSession() || !state.runtimeDevice.networkOnline;
}

function editClientName() {
  const client = Demo.getRuntimeClient(state);
  const currentName = client?.name || state.runtimeDevice.name || "";
  openSharedModal({
    title: "编辑设备名称",
    body: `
      <label class="field">
        <span>设备名称</span>
        <input id="clientNameInput" type="text" maxlength="24" value="${escapeAttribute(currentName)}" placeholder="请输入设备名称" />
      </label>
    `,
    confirmText: "保存",
    onConfirm() {
      const nextName = document.getElementById("clientNameInput").value.trim();
      if (!nextName) {
        showToast("请输入设备名称");
        return false;
      }
      state.runtimeDevice.name = nextName;
      if (client) client.name = nextName;
      closeSharedModal();
      persistState("设备名称已更新");
      return true;
    },
  });
}

function renderStoragePanel() {
  els.warningThresholdInput.value = String(state.storage.warningGb);
  els.blockThresholdInput.value = String(state.storage.blockGb);
  els.thresholdMessage.hidden = true;
  els.thresholdMessage.textContent = "";
  els.storageSummaryGrid.innerHTML = [
    renderStorageSummaryCard("剩余可用空间", Demo.formatGb(state.storage.remainingGb)),
    renderStorageSummaryCard("检测记录", Demo.formatGb(state.storage.usage.detectImages), {
      actionType: "detectImages",
      actionLabel: "清理旧数据",
      disabled: getCleanupEntries("detectImages").length === 0,
    }),
  ].join("");
}

function handleStorageSummaryClick(event) {
  const trigger = getClosestEventTarget(event, "[data-clean-type]");
  if (!trigger) return;
  confirmCleanup(trigger.dataset.cleanType);
}

function renderAddCameraModal() {
  const keyword = ui.discoveryKeyword.toLowerCase();
  const rows = state.availableCameras.filter((camera) => {
    if (camera.status === "离线") return false;
    if (state.cameras.some((item) => item.id === camera.id)) return false;
    if (!keyword) return true;
    return [camera.name || "", camera.id, camera.vendor, camera.model, camera.serial].some((value) => value.toLowerCase().includes(keyword));
  });

  els.cameraDiscoveryBody.innerHTML = rows.length
    ? rows
        .map((camera) => {
          return `
            <tr>
              <td><input type="checkbox" value="${camera.id}" /></td>
              <td>${escapeHtml(Demo.getCameraLabel(camera))}</td>
              <td>${escapeHtml(camera.id)}</td>
              <td>${escapeHtml(camera.vendor)}</td>
              <td>${escapeHtml(camera.model)}</td>
              <td>${escapeHtml(camera.serial)}</td>
              <td>${escapeHtml(camera.ip)}</td>
            </tr>
          `;
        })
        .join("")
    : `
        <tr>
          <td colspan="7" class="empty-state">暂无数据</td>
        </tr>
      `;
}

function renderParamModal() {
  const camera = getActiveCamera();
  const referencedParamIds = Demo.getReferencedParamIds(state);
  els.paramModalTitle.textContent = "参数组管理";
  els.addParamGroupBtn.disabled = !camera;
  if (!camera) {
    els.paramGroupList.innerHTML = `<div class="builder-empty">暂无可管理的相机参数组。</div>`;
    els.paramFormFields.innerHTML = "";
    els.paramPreviewCaption.textContent = "相机画面";
    els.paramPreviewStage.style.aspectRatio = "2448 / 2048";
    return;
  }

  const group = getActiveParamGroup();
  els.paramGroupList.innerHTML = renderParamGroupList(camera, referencedParamIds);
  if (!group) {
    els.paramFormFields.innerHTML = "";
    els.paramPreviewCaption.textContent = "相机画面";
    els.paramPreviewStage.style.aspectRatio = "2448 / 2048";
    return;
  }

  els.paramFormFields.innerHTML = renderParamFields(camera, group);
  syncParamPreview(camera, group);
  els.paramFormScroll.scrollTop = 0;
}

function renderParamGroupList(camera, referencedParamIds) {
  return camera.paramGroups
    .map((item) => {
      const referenced = referencedParamIds.has(item.id);
      const active = item.id === ui.activeParamGroupId;
      const canDelete = camera.paramGroups.length > 1 && getRunningToolNamesUsingParamGroup(item.id).length === 0;
      return `
        <article class="param-group-item ${active ? "is-active" : ""}">
          <button class="param-group-main" data-group-id="${item.id}">
            <strong>${escapeHtml(getParamGroupDisplayName(item))}</strong>
          </button>
          <button
            class="table-btn table-btn-danger param-group-delete"
            data-action="delete-param-group"
            data-group-id="${item.id}"
            ${canDelete ? "" : "disabled"}
          >
            删除
          </button>
        </article>
      `;
    })
    .join("");
}

function syncParamPreview(camera, group) {
  els.paramPreviewStage.style.aspectRatio = getParamPreviewAspectRatio(group);
  els.paramPreviewCaption.textContent = getParamPreviewCaption(camera, group);
}

function renderModelDrawer() {
  els.modelDrawerFooter.hidden = ui.modelDrawerMode !== "select-local";
  els.modelSelectPanel.hidden = ui.modelDrawerMode !== "select-local";
  els.cloudModelPanel.hidden = ui.modelDrawerMode !== "cloud-add";
  els.modelDrawer.querySelector(".drawer-header h3").textContent =
    ui.modelDrawerMode === "select-local" ? ui.modelTarget?.title || "选择检测模型" : "从云端下载模型";
  if (ui.modelDrawerMode === "select-local") {
    renderSelectorModels();
    return;
  }
  renderCloudModels();
}

function getFilteredLocalModels() {
  const keyword = ui.localFilters.keyword.trim().toLowerCase();
  return state.localModels.filter((model) => {
    const keywordMatch =
      !keyword ||
      [model.modelName, model.version].some((value) => value.toLowerCase().includes(keyword));
    const sceneMatch = ui.localFilters.scene === "all" || model.sceneType === ui.localFilters.scene;
    return keywordMatch && sceneMatch;
  });
}

function renderLocalModels() {
  els.localModelKeywordFilter.value = ui.localFilters.keyword;
  els.localSceneFilter.value = ui.localFilters.scene;

  const rows = getFilteredLocalModels();
  const hasModels = rows.length > 0;
  els.localModelEmpty.hidden = hasModels;
  els.localModelEmpty.textContent = "暂无数据";
  els.localModelTableBody.innerHTML = hasModels
    ? rows
        .map((model) => {
          const referenceCount = getLocalModelReferenceCount(model.id);
          const runningReferenceNames = getRunningToolNamesUsingModel(model.id);
          return `
            <tr>
              <td>${escapeHtml(model.modelName)}</td>
              <td>${escapeHtml(model.sceneType)}</td>
              <td>${escapeHtml(model.version)}</td>
              <td>${escapeHtml(model.source)}</td>
              <td>${Demo.formatDateTime(model.addedAt)}</td>
              <td>${renderReferenceStatusHtml(referenceCount)}</td>
              <td><button class="table-btn table-btn-danger" data-action="delete-local-model" data-model-id="${model.id}" ${runningReferenceNames.length ? "disabled" : ""}>删除</button></td>
            </tr>
          `;
        })
        .join("")
    : "";
}

function getFilteredSelectorModels() {
  const keyword = ui.modelSelectorFilters.keyword.trim().toLowerCase();
  const allowedScenes = Array.isArray(ui.modelTarget?.allowedScenes) ? ui.modelTarget.allowedScenes : [];
  return state.localModels.filter((model) => {
    const keywordMatch =
      !keyword ||
      [model.modelName, model.version].some((value) => value.toLowerCase().includes(keyword));
    const fixedSceneMatch = !allowedScenes.length || allowedScenes.includes(model.sceneType);
    const sceneMatch = ui.modelSelectorFilters.scene === "all" || model.sceneType === ui.modelSelectorFilters.scene;
    return keywordMatch && fixedSceneMatch && sceneMatch;
  });
}

function renderSelectorModels() {
  const fixedScenes = Array.isArray(ui.modelTarget?.allowedScenes) ? ui.modelTarget.allowedScenes : [];
  if (fixedScenes.length === 1) {
    ui.modelSelectorFilters.scene = fixedScenes[0];
  }
  els.selectorModelKeywordFilter.value = ui.modelSelectorFilters.keyword;
  els.selectorModelSceneFilter.value = ui.modelSelectorFilters.scene;
  els.selectorModelSceneFilter.disabled = fixedScenes.length === 1;

  const rows = getFilteredSelectorModels();
  if (!rows.length) {
    ui.selectedModelId = null;
  } else if (!ui.selectedModelId || !rows.some((model) => model.id === ui.selectedModelId)) {
    ui.selectedModelId = rows[0].id;
  }

  const hasModels = rows.length > 0;
  els.confirmModelSelectBtn.disabled = !hasModels;
  els.selectorModelEmpty.hidden = hasModels;
  els.selectorModelEmpty.textContent = "暂无数据";
  els.selectorModelTableBody.innerHTML = hasModels
    ? rows
        .map((model) => {
          const selected = ui.selectedModelId === model.id;
          return `
            <tr data-action="select-selector-model" data-model-id="${model.id}" class="${selected ? "row-selected" : ""}">
              <td>${escapeHtml(model.modelName)}</td>
              <td>${escapeHtml(model.sceneType)}</td>
              <td>${escapeHtml(model.version)}</td>
              <td>${escapeHtml(model.source)}</td>
              <td>${Demo.formatDateTime(model.addedAt)}</td>
            </tr>
          `;
        })
        .join("")
    : "";
}

function renderCloudModels() {
  els.cloudModelKeywordFilter.value = ui.cloudFilters.keyword;
  els.cloudSceneFilter.value = ui.cloudFilters.scene;

  if (!state.runtimeDevice.networkOnline) {
    els.cloudModelList.innerHTML = `<p class="banner banner-neutral">当前离线</p>`;
    return;
  }

  const rows = state.cloudModels.filter((model) => {
    const keyword = ui.cloudFilters.keyword.trim().toLowerCase();
    const keywordMatch =
      !keyword ||
      model.modelName.toLowerCase().includes(keyword) ||
      model.versions.some((version) => version.version.toLowerCase().includes(keyword));
    const sceneMatch = ui.cloudFilters.scene === "all" || model.sceneType === ui.cloudFilters.scene;
    return keywordMatch && sceneMatch;
  });

  if (!rows.length) {
    els.cloudModelList.innerHTML = `<div class="builder-empty">暂无符合条件的云端模型</div>`;
    return;
  }

  els.cloudModelList.innerHTML = rows
    .map((model) => {
      return `
        <div class="cloud-model-card">
          <div class="cloud-model-card-head">
            <div class="cloud-model-card-copy">
              <div class="cloud-model-card-title-row">
                <h4>${escapeHtml(model.modelName)}</h4>
                <span class="cloud-model-count">${model.versions.length} 个版本</span>
              </div>
              <p class="muted">${escapeHtml(model.sceneType)} · 最近更新时间 ${Demo.formatDateTime(model.updatedAt)}</p>
            </div>
          </div>
          <div class="cloud-version-list">
            ${model.versions.map((version) => renderCloudVersionRow(model, version)).join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderNavigationState(page) {
  ui.activePage = page;
  renderNavigation();
}

function switchPage(page, options = {}) {
  ui.activePage = page;
  if (options.settingsTab) ui.settingsTab = options.settingsTab;
  renderAll();
}

function switchToolView(view) {
  if (view === "builder" && !hasUsableSession()) return;
  ui.toolView = view;
  if (view !== "runtime") {
    ui.runtimeInitialToolId = null;
    stopRuntimeCarousel();
  }
  if (view === "builder") {
    ui.builderStep = getRecommendedBuilderStep(getActiveTool(), ui.builderStep);
  }
  renderTools();
}

function setBuilderStep(step) {
  if (!canEnterBuilderStep(step)) {
    showToast("请先完成前一步的基础配置，再继续下一步");
    return;
  }
  ui.builderStep = step;
  renderToolBuilder();
}

function moveBuilderStep(direction) {
  const steps = ["acquire", "process", "detect"];
  const currentIndex = steps.indexOf(ui.builderStep);
  const nextStep = steps[currentIndex + direction];
  if (!nextStep) return;
  setBuilderStep(nextStep);
}

function openCreateToolModal() {
  openSharedModal({
    title: "新建检测工具",
    body: `
      <label class="field">
        <span>检测工具名称</span>
        <input id="createToolInput" type="text" maxlength="24" placeholder="请输入检测工具名称" />
      </label>
    `,
    confirmText: "创建",
    onOpen() {
      const input = document.getElementById("createToolInput");
      input?.focus();
    },
    onConfirm() {
      const input = document.getElementById("createToolInput");
      const name = input?.value.trim() || "";
      if (!name) {
        showToast("请输入检测工具名称");
        input?.focus();
        return false;
      }
      closeSharedModal();
      createTool(name);
      return true;
    },
  });
}

function createTool(name) {
  const tool = {
    id: Demo.makeId("tool"),
    name,
    tone: "tone-blue",
    acquire: [],
    process: [],
    detect: [],
    runtime: {
      lastRunAt: null,
      status: "未配置",
      primaryResult: "-",
      cycleTime: "-",
    },
  };
  state.tools.unshift(tool);
  ui.activeToolId = tool.id;
  ui.toolView = "builder";
  ui.builderStep = getRecommendedBuilderStep(tool, "acquire");
  persistState("已创建新的检测工具");
}

function isToolEditingLocked(tool = getActiveTool()) {
  return isToolSessionRunning(tool);
}

function renameActiveTool() {
  const tool = getActiveTool();
  if (!tool) return;
  if (isToolEditingLocked(tool)) {
    showToast("工具运行中，不能编辑配置，请先结束运行");
    return;
  }
  openSharedModal({
    title: "编辑检测工具名称",
    body: `
      <label class="field">
        <span>检测工具名称</span>
        <input id="renameToolInput" type="text" maxlength="24" value="${escapeAttribute(tool.name)}" />
      </label>
    `,
    confirmText: "保存",
    onConfirm() {
      const input = document.getElementById("renameToolInput");
      const name = input.value.trim();
      if (!name) {
        showToast("请输入检测工具名称");
        return false;
      }
      tool.name = name;
      closeSharedModal();
      persistState("检测工具名称已更新");
      return true;
    },
  });
}

function deleteActiveTool() {
  if (state.tools.length <= 1) {
    showToast("至少保留一个检测工具");
    return;
  }
  const tool = getActiveTool();
  if (!tool) return;
  if (isToolEditingLocked(tool)) {
    showToast("工具运行中，不能编辑配置，请先结束运行");
    return;
  }
  openSharedModal({
    title: "删除检测工具",
    body: `<p class="banner banner-danger">删除后该工具的配置会被移除，运行入口也会消失。是否继续删除“${escapeHtml(tool.name)}”？</p>`,
    confirmText: "确认删除",
    confirmClass: "danger-btn",
    onConfirm() {
      state.tools = state.tools.filter((item) => item.id !== tool.id);
      ui.activeToolId = state.tools[0]?.id || null;
      ui.toolView = "overview";
      closeSharedModal();
      persistState("检测工具已删除");
      return true;
    },
  });
}

function handleToolCardClick(event) {
  const actionEl = getClosestEventTarget(event, "[data-action]");
  if (!actionEl) return;
  const { action, id } = actionEl.dataset;
  if (action === "create-tool") return openCreateToolModal();
  if (action === "edit-tool") return openToolBuilder(id);
  if (action === "open-tool-runtime") return openToolRuntime(id);
}

function openToolBuilder(toolId) {
  const tool = state.tools.find((item) => item.id === toolId);
  if (isToolEditingLocked(tool)) {
    showToast("工具运行中，不能编辑配置，请先结束运行");
    return;
  }
  ui.activeToolId = toolId;
  ui.builderStep = getRecommendedBuilderStep(getActiveTool(), ui.builderStep);
  ui.toolView = "builder";
  ui.runtimeInitialToolId = null;
  renderAll();
}

function openToolRuntime(toolId) {
  const tool = state.tools.find((item) => item.id === toolId);
  if (!tool) return;
  if (!getToolAvailableRunModes(tool).length) {
    showToast("当前工具尚未完成配置");
    ui.activeToolId = toolId;
    ui.builderStep = getRecommendedBuilderStep(tool, ui.builderStep);
    ui.toolView = "builder";
    renderAll();
    return;
  }
  if (!isToolSessionRunning(tool)) {
    openLaunchToolModal(toolId);
    return;
  }
  ui.activeToolId = toolId;
  ui.toolView = "runtime";
  activateRuntimeInitialState(toolId);
  syncUiSelections();
  renderAll();
}

function openLaunchToolModal(toolId) {
  const tool = state.tools.find((item) => item.id === toolId);
  if (!tool) return;
  const availableModes = getToolAvailableRunModes(tool);
  if (!availableModes.length) {
    showToast("当前工具还没有可运行的模式");
    return;
  }
  openSharedModal({
    title: `开始检测 · ${tool.name}`,
    panelClass: "modal-launch",
    bodyClass: "modal-body-launch",
    hideConfirm: true,
    hideCancel: true,
    body: `
      <div class="launch-mode-grid">
        ${RUN_MODE_OPTIONS.map((item) => {
          const enabled = availableModes.some((modeItem) => modeItem.value === item.value);
          const toneClass = `launch-mode-card-${item.value}`;
          return `
            <button
              class="launch-mode-card ${toneClass} ${enabled ? "" : "is-disabled"}"
              data-run-mode="${item.value}"
              type="button"
              ${enabled ? "" : "disabled"}
            >
              <div class="launch-mode-head">
                <strong>${escapeHtml(item.label)}</strong>
              </div>
              <p>${escapeHtml(enabled ? item.hint : `当前设置未满足${item.label}要求`)}</p>
              ${enabled ? "" : `<span class="launch-mode-state">当前不可用</span>`}
            </button>
          `;
        }).join("")}
      </div>
    `,
    onOpen() {
      els.sharedModalBody.querySelectorAll("[data-run-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          startToolRunSession(toolId, button.dataset.runMode || "");
        });
      });
    },
  });
}

function startToolRunSession(toolId, runMode) {
  const tool = state.tools.find((item) => item.id === toolId);
  if (!tool) return;
  syncToolCompletionState(tool);
  if (!evaluateToolRunModeAvailability(tool, runMode)) {
    showToast("当前模式所需设置还不完整，请先补全后再开始。");
    return;
  }
  tool.runtime.sessionActive = true;
  tool.runtime.sessionMode = Demo.normalizeRunMode(runMode);
  tool.runtime.status = "等待信号";
  ui.activeToolId = toolId;
  ui.toolView = "runtime";
  closeSharedModal();
  activateRuntimeInitialState(toolId);
  syncUiSelections();
  persistState(`已开始：${getRunModeLabel(runMode)}`);
}

function handleBuilderBodyClick(event) {
  if (isToolEditingLocked(getActiveTool())) {
    showToast("工具运行中，不能编辑配置，请先结束运行");
    return;
  }
  const actionEl = getClosestEventTarget(event, "[data-action]");
  if (!actionEl) return;
  const { action, id } = actionEl.dataset;
  if (action === "add-acquire") return openAcquireModal();
  if (action === "edit-acquire") return openAcquireModal(id);
  if (action === "delete-acquire") return deleteAcquire(id);
  if (action === "add-process") return openProcessModal();
  if (action === "edit-process") return openProcessModal(id);
  if (action === "delete-process") return deleteProcess(id);
  if (action === "add-detect") return openDetectModal();
  if (action === "edit-detect") return openDetectModal(id);
  if (action === "delete-detect") return deleteDetect(id);
}

function ensureToolItemCapacity(type, currentId = "") {
  const tool = getActiveTool();
  if (!tool) return false;
  if (currentId || tool[type].length < TOOL_ITEM_LIMITS[type]) return true;
  showToast(`${getToolItemLabel(type)}最多支持 ${TOOL_ITEM_LIMITS[type]} 个`);
  return false;
}

function getToolItemLabel(type) {
  if (type === "acquire") return "图像来源";
  if (type === "process") return "处理步骤";
  return "检测步骤";
}

function openAcquireModal(acquireId) {
  if (!ensureToolItemCapacity("acquire", acquireId)) return;
  const tool = getActiveTool();
  const camera = getActiveCamera();
  const existing = tool.acquire.find((item) => item.id === acquireId);
  let draftSample = {
    name: getAcquireSampleName(existing),
    url: getAcquireSampleUrl(existing),
    width: Number(existing?.sampleImageWidth || 0),
    height: Number(existing?.sampleImageHeight || 0),
  };
  const defaultCameraId = existing?.cameraId || state.cameras[0]?.id || "";
  const defaultParamId =
    existing?.paramGroupId ||
    state.cameras.find((item) => item.id === defaultCameraId)?.paramGroups?.[0]?.id ||
    camera?.paramGroups?.[0]?.id ||
    "";

  openSharedModal({
    title: existing ? "编辑图像来源" : "添加图像来源",
    panelClass: "modal-param",
    body: `
      <div class="form-grid double-column">
        <label class="field">
          <span>图像名称</span>
          <input id="acquireNameInput" type="text" maxlength="24" value="${escapeAttribute(existing?.name || "")}" placeholder="请输入图像名称" />
        </label>
        <label class="field">
          <span>采集方式</span>
          <select id="acquireTypeSelect">
            <option value="camera" ${existing?.type !== "api" ? "selected" : ""}>相机</option>
            <option value="api" ${existing?.type === "api" ? "selected" : ""}>接口</option>
          </select>
        </label>
      </div>
      <div id="acquireCameraFields">
        <div class="form-grid double-column">
          <label class="field">
            <span>相机</span>
            <select id="acquireCameraSelect">
              ${state.cameras.map((item) => `<option value="${item.id}" ${item.id === defaultCameraId ? "selected" : ""}>${escapeHtml(Demo.getCameraLabel(item))}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>选择参数组</span>
            <select id="acquireParamSelect"></select>
          </label>
        </div>
      </div>
      <div id="acquireApiFields">
        <div class="form-grid double-column">
          <label class="field">
            <span>接口地址</span>
            <input id="acquireEndpointInput" type="text" value="${escapeAttribute(existing?.endpoint || "")}" placeholder="例如 tcp://plc-gateway/image/1" />
          </label>
        </div>
      </div>
      <div class="builder-sample-card">
        <div class="section-head section-head-tight">
          <div>
            <h4>示例图像</h4>
          </div>
          <button class="secondary-btn" type="button" id="acquireSampleUploadBtn">上传示例图像</button>
        </div>
        <input id="acquireSampleFileInput" type="file" accept="image/*" hidden />
        <div class="builder-sample-preview" id="acquireSamplePreview"></div>
      </div>
    `,
    confirmText: existing ? "保存" : "创建",
    onOpen() {
      const typeSelect = document.getElementById("acquireTypeSelect");
      const cameraSelect = document.getElementById("acquireCameraSelect");
      const paramSelect = document.getElementById("acquireParamSelect");
      const cameraFields = document.getElementById("acquireCameraFields");
      const apiFields = document.getElementById("acquireApiFields");
      const sampleUploadBtn = document.getElementById("acquireSampleUploadBtn");
      const sampleFileInput = document.getElementById("acquireSampleFileInput");
      const samplePreview = document.getElementById("acquireSamplePreview");

      function renderAcquireFields() {
        const isCamera = typeSelect.value === "camera";
        cameraFields.hidden = !isCamera;
        apiFields.hidden = isCamera;
        const selectedCamera = state.cameras.find((item) => item.id === cameraSelect.value);
        paramSelect.innerHTML = (selectedCamera?.paramGroups || [])
          .map((group) => `<option value="${group.id}" ${group.id === defaultParamId ? "selected" : ""}>${escapeHtml(group.name)}</option>`)
          .join("");
      }

      function renderAcquireSamplePreview() {
        samplePreview.innerHTML = `
          ${renderSamplePreviewHtml(draftSample.url, draftSample.name || "请上传示例图像")}
          <p class="muted">${escapeHtml(draftSample.name || "请上传示例图像")}</p>
        `;
      }

      typeSelect.addEventListener("change", renderAcquireFields);
      cameraSelect.addEventListener("change", renderAcquireFields);
      sampleUploadBtn.addEventListener("click", () => sampleFileInput.click());
      sampleFileInput.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        sampleUploadBtn.disabled = true;
        try {
          const preview = await readImageFileAsDemoPreview(file);
          draftSample = {
            name: file.name,
            url: preview.url,
            width: preview.width,
            height: preview.height,
          };
          renderAcquireSamplePreview();
        } catch (error) {
          showToast("示例画面处理失败，请重试");
        } finally {
          sampleUploadBtn.disabled = false;
          sampleFileInput.value = "";
        }
      });
      renderAcquireFields();
      renderAcquireSamplePreview();
    },
    onConfirm() {
      const name = document.getElementById("acquireNameInput").value.trim();
      const type = document.getElementById("acquireTypeSelect").value;
      if (!name) {
        showToast("请输入图像名称。");
        return false;
      }
      if (!draftSample.url) {
        showToast("请上传示例图像");
        return false;
      }
      if (type === "camera") {
        const cameraId = document.getElementById("acquireCameraSelect").value;
        const paramGroupId = document.getElementById("acquireParamSelect").value;
        if (!cameraId || !paramGroupId) {
          showToast("请选择相机和参数组。");
          return false;
        }
        const next = existing || { id: Demo.makeId("acq") };
        next.name = name;
        next.type = "camera";
        next.cameraId = cameraId;
        next.paramGroupId = paramGroupId;
        next.sampleImageName = draftSample.name;
        next.sampleImageUrl = draftSample.url;
        next.sampleImageWidth = draftSample.width || next.sampleImageWidth || 0;
        next.sampleImageHeight = draftSample.height || next.sampleImageHeight || 0;
        next.sampleImage = draftSample.name;
        delete next.endpoint;
        upsertToolItem("acquire", next);
      } else {
        const endpoint = document.getElementById("acquireEndpointInput").value.trim();
        if (!endpoint) {
          showToast("请输入接口地址。");
          return false;
        }
        const next = existing || { id: Demo.makeId("acq") };
        next.name = name;
        next.type = "api";
        next.endpoint = endpoint;
        next.sampleImageName = draftSample.name;
        next.sampleImageUrl = draftSample.url;
        next.sampleImageWidth = draftSample.width || next.sampleImageWidth || 0;
        next.sampleImageHeight = draftSample.height || next.sampleImageHeight || 0;
        next.sampleImage = draftSample.name;
        delete next.cameraId;
        delete next.paramGroupId;
        upsertToolItem("acquire", next);
      }
      closeSharedModal();
      persistState(existing ? "图像来源已更新" : "图像来源已添加");
      return true;
    },
  });
}

function openProcessModal(processId) {
  if (!ensureToolItemCapacity("process", processId)) return;
  const tool = getActiveTool();
  if (!tool.acquire.length) {
    showToast("请先添加图像来源");
    return;
  }
  const existing = tool.process.find((item) => item.id === processId);
  const initialMode = normalizeProcessMode(existing?.mode || "full-image");
  let draftMode = initialMode;
  let draftInputId = existing?.inputId || tool.acquire[0]?.id || "";
  let draftModelId = existing?.modelId || null;
  let draftRegions = getProcessRegions(existing).map((item) => ({ ...item }));
  let activeDrawType = draftRegions.find((item) => item.type === "ignore") ? "ignore" : "roi";
  let liveDraftRegion = null;
  openSharedModal({
    title: existing ? "编辑处理步骤" : "新增处理步骤",
    panelClass: "modal-param",
    body: `
      <div class="form-grid double-column">
        <label class="field">
          <span>处理步骤名称</span>
          <input id="processNameInput" type="text" maxlength="24" value="${escapeAttribute(existing?.name || "")}" placeholder="请输入处理步骤名称" />
        </label>
        <label class="field">
          <span>关联图像</span>
          <select id="processInputSelect">
            ${tool.acquire.map((item) => `<option value="${item.id}" ${item.id === draftInputId ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="form-grid double-column">
        <label class="field">
          <span>处理方式</span>
          <select id="processModeSelect">
            <option value="full-image" ${initialMode === "full-image" ? "selected" : ""}>整图处理</option>
            <option value="manual-roi" ${initialMode === "manual-roi" ? "selected" : ""}>手动划区</option>
            <option value="model-roi" ${initialMode === "model-roi" ? "selected" : ""}>自动分区</option>
          </select>
        </label>
      </div>
      <div id="processModelSection" hidden>
        <label class="field">
          <span>模型</span>
          <div class="model-picker-row">
            <div class="model-picker-value" id="processModelSummary">${escapeHtml(Demo.getModelLabel(state, draftModelId) || "未选择模型")}</div>
            <button class="secondary-btn" id="openProcessModelDrawer" type="button">选择模型</button>
          </div>
          <input id="processModelValue" type="hidden" value="${escapeAttribute(draftModelId || "")}" />
        </label>
        <div class="muted" id="processModelCategories" hidden></div>
      </div>
      <div id="processRoiSection" hidden class="roi-editor-layout">
        <div class="roi-toolbar">
          <div class="roi-toolbar-group">
            <button class="secondary-btn" type="button" id="drawRoiBtn">绘制检测区域</button>
            <button class="ghost-btn" type="button" id="drawIgnoreBtn">绘制排除区域</button>
            <button class="ghost-btn" type="button" id="clearProcessRegionsBtn">清空区域</button>
          </div>
          <div class="roi-toolbar-group">
            <button class="ghost-btn" type="button" id="split4RoiBtn">4 等分</button>
            <button class="ghost-btn" type="button" id="split9RoiBtn">9 等分</button>
            <button class="ghost-btn" type="button" id="split16RoiBtn">16 等分</button>
          </div>
        </div>
        <div class="roi-editor-content">
          <article class="card roi-stage-card">
            <div class="section-head section-head-tight">
              <div>
                <h4>检测区域</h4>
              </div>
            </div>
            <div class="roi-stage-shell">
              <div class="roi-stage" id="processRoiStage"></div>
            </div>
          </article>
          <article class="card roi-region-card">
            <div class="section-head section-head-tight">
              <div>
                <h4>已设置区域</h4>
              </div>
            </div>
            <div class="roi-region-list" id="processRegionList"></div>
          </article>
        </div>
      </div>
    `,
    confirmText: existing ? "保存" : "创建",
    onOpen() {
      const modeSelect = document.getElementById("processModeSelect");
      const inputSelect = document.getElementById("processInputSelect");
      const modelSection = document.getElementById("processModelSection");
      const roiSection = document.getElementById("processRoiSection");
      const processModelValue = document.getElementById("processModelValue");
      const processModelSummary = document.getElementById("processModelSummary");
      const processModelCategories = document.getElementById("processModelCategories");
      const openProcessModelDrawerBtn = document.getElementById("openProcessModelDrawer");
      const drawRoiBtn = document.getElementById("drawRoiBtn");
      const drawIgnoreBtn = document.getElementById("drawIgnoreBtn");
      const clearProcessRegionsBtn = document.getElementById("clearProcessRegionsBtn");
      const split4RoiBtn = document.getElementById("split4RoiBtn");
      const split9RoiBtn = document.getElementById("split9RoiBtn");
      const split16RoiBtn = document.getElementById("split16RoiBtn");
      const processRoiStage = document.getElementById("processRoiStage");
      const processRegionList = document.getElementById("processRegionList");
      let drawSession = null;

      function syncProcessDraftFromFields() {
        draftMode = normalizeProcessMode(modeSelect.value || draftMode);
        draftInputId = inputSelect.value || draftInputId;
        draftModelId = processModelValue.value || draftModelId || null;
      }

      function getSourceAcquire() {
        return tool.acquire.find((item) => item.id === draftInputId) || null;
      }

      function isRoiMode() {
        return draftMode === "manual-roi";
      }

      function isModelRoiMode() {
        return draftMode === "model-roi";
      }

      function getRegionLabel(region) {
        if (isFullImageRegion(region)) {
          return "全图";
        }
        const sameType = draftRegions.filter((item) => item.type === region.type);
        const index = sameType.findIndex((item) => item.id === region.id);
        if (index < 0) {
          return region.type === "ignore" ? "排除区域" : "检测区域";
        }
        return region.type === "ignore" ? `排除区域 ${index + 1}` : `检测区域 ${index + 1}`;
      }

      function renderRegionBox(region, draft = false) {
        return `
          <div
            class="roi-box ${region.type === "ignore" ? "is-ignore" : "is-roi"} ${draft ? "is-draft" : ""}"
            style="left:${region.x * 100}%;top:${region.y * 100}%;width:${region.w * 100}%;height:${region.h * 100}%"
          >
            <span>${escapeHtml(getRegionLabel(region))}</span>
          </div>
        `;
      }

      function renderProcessRegionList() {
        if (!draftRegions.length) {
          processRegionList.innerHTML = `<div class="builder-empty">还没有检测区域</div>`;
          return;
        }
        processRegionList.innerHTML = draftRegions
          .map((region) => {
            return `
              <div class="roi-region-item">
                <div>
                  <strong>${escapeHtml(getRegionLabel(region))}</strong>
                  <p>${region.type === "ignore" ? "该区域不参与判断" : isFullImageRegion(region) ? "整张图片参与判断" : "该区域参与判断"}</p>
                </div>
                <button class="table-btn table-btn-danger" type="button" data-remove-region="${region.id}">删除</button>
              </div>
            `;
          })
          .join("");
      }

      function applyPresetRegions(nextRegions, message) {
        draftRegions = nextRegions;
        liveDraftRegion = null;
        activeDrawType = "roi";
        renderDrawButtons();
        renderProcessRegionList();
        renderProcessRoiStage();
        if (message) showToast(message);
      }

      function renderProcessRoiStage() {
        const sourceAcquire = getSourceAcquire();
        const sampleUrl = getAcquireSampleUrl(sourceAcquire);
        processRoiStage.innerHTML = `
          <div class="roi-stage-surface ${sampleUrl ? "" : "is-placeholder"}" id="processRoiSurface">
            ${sampleUrl ? `<img src="${escapeAttribute(sampleUrl)}" alt="${escapeAttribute(getAcquireSampleName(sourceAcquire))}" />` : `<div class="sample-preview-frame is-placeholder"><div class="sample-preview-grid"></div><span>请先为当前图像来源上传示例图像</span></div>`}
            <div class="roi-overlay-layer">
              ${draftRegions.map((region) => renderRegionBox(region)).join("")}
              ${liveDraftRegion ? renderRegionBox(liveDraftRegion, true) : ""}
            </div>
          </div>
        `;
        const surface = document.getElementById("processRoiSurface");
        if (!surface || !sampleUrl) return;
        surface.addEventListener("mousedown", (event) => {
          if (!isRoiMode()) return;
          const bounds = surface.getBoundingClientRect();
          const startX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
          const startY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
          drawSession = { bounds, startX, startY };
          liveDraftRegion = {
            id: "draft",
            type: activeDrawType,
            x: startX,
            y: startY,
            w: 0,
            h: 0,
          };
          renderProcessRoiStage();
          function handleMove(moveEvent) {
            if (!drawSession) return;
            const currentX = Math.min(1, Math.max(0, (moveEvent.clientX - bounds.left) / bounds.width));
            const currentY = Math.min(1, Math.max(0, (moveEvent.clientY - bounds.top) / bounds.height));
            liveDraftRegion = {
              id: "draft",
              type: activeDrawType,
              x: Math.min(drawSession.startX, currentX),
              y: Math.min(drawSession.startY, currentY),
              w: Math.abs(currentX - drawSession.startX),
              h: Math.abs(currentY - drawSession.startY),
            };
            renderProcessRoiStage();
          }
          function handleUp(upEvent) {
            const currentX = Math.min(1, Math.max(0, (upEvent.clientX - bounds.left) / bounds.width));
            const currentY = Math.min(1, Math.max(0, (upEvent.clientY - bounds.top) / bounds.height));
            const nextRegion = {
              id: Demo.makeId(activeDrawType === "ignore" ? "ignore" : "roi"),
              type: activeDrawType,
              x: Math.min(drawSession.startX, currentX),
              y: Math.min(drawSession.startY, currentY),
              w: Math.abs(currentX - drawSession.startX),
              h: Math.abs(currentY - drawSession.startY),
            };
            if (nextRegion.w >= 0.03 && nextRegion.h >= 0.03) {
              draftRegions.push(nextRegion);
            }
            drawSession = null;
            liveDraftRegion = null;
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
            renderProcessRegionList();
            renderProcessRoiStage();
          }
          window.addEventListener("mousemove", handleMove);
          window.addEventListener("mouseup", handleUp);
        });
      }

      function renderDrawButtons() {
        drawRoiBtn.classList.toggle("secondary-btn", activeDrawType === "roi");
        drawRoiBtn.classList.toggle("ghost-btn", activeDrawType !== "roi");
        drawIgnoreBtn.classList.toggle("secondary-btn", activeDrawType === "ignore");
        drawIgnoreBtn.classList.toggle("ghost-btn", activeDrawType !== "ignore");
      }

      function renderProcessSections() {
        modeSelect.value = draftMode;
        inputSelect.value = draftInputId;
        const roiMode = isRoiMode();
        roiSection.hidden = !roiMode;
        modelSection.hidden = !isModelRoiMode();
        renderDrawButtons();
        if (roiMode) {
          renderProcessRegionList();
          renderProcessRoiStage();
        }
        if (isModelRoiMode()) {
          let modelId = processModelValue.value || draftModelId || null;
          if (modelId && !isCategoryOutputModelId(modelId)) {
            modelId = null;
            draftModelId = null;
            processModelValue.value = "";
          }
          const categories = getModelCategoriesById(modelId);
          processModelSummary.textContent = Demo.getModelLabel(state, modelId) || "未选择模型";
          processModelCategories.hidden = !categories.length;
          processModelCategories.textContent = categories.length ? `可识别类别：${categories.join(" / ")}` : "";
        }
      }

      openProcessModelDrawerBtn.addEventListener("click", () => {
        syncProcessDraftFromFields();
        openModelSelector({
          valueId: "processModelValue",
          summaryId: "processModelSummary",
          selectedModelId: processModelValue.value || draftModelId || null,
          title: "选择模型",
          allowedScenes: ["分类"],
        });
      });
      drawRoiBtn.addEventListener("click", () => {
        activeDrawType = "roi";
        renderDrawButtons();
      });
      drawIgnoreBtn.addEventListener("click", () => {
        activeDrawType = "ignore";
        renderDrawButtons();
      });
      clearProcessRegionsBtn.addEventListener("click", () => {
        draftRegions = [];
        renderProcessRegionList();
        renderProcessRoiStage();
      });
      split4RoiBtn.addEventListener("click", () => {
        applyPresetRegions(buildSplitRegions(4), "已生成 4 等分 ROI");
      });
      split9RoiBtn.addEventListener("click", () => {
        applyPresetRegions(buildSplitRegions(9), "已生成 9 等分 ROI");
      });
      split16RoiBtn.addEventListener("click", () => {
        applyPresetRegions(buildSplitRegions(16), "已生成 16 等分 ROI");
      });
      processRegionList.addEventListener("click", (event) => {
        const removeBtn = getClosestEventTarget(event, "[data-remove-region]");
        if (!removeBtn) return;
        draftRegions = draftRegions.filter((region) => region.id !== removeBtn.dataset.removeRegion);
        renderProcessRegionList();
        renderProcessRoiStage();
      });
      const handleModeOrInputChange = () => {
        syncProcessDraftFromFields();
        renderProcessSections();
      };
      modeSelect.addEventListener("input", handleModeOrInputChange);
      modeSelect.addEventListener("change", handleModeOrInputChange);
      inputSelect.addEventListener("input", handleModeOrInputChange);
      inputSelect.addEventListener("change", handleModeOrInputChange);
      processModelValue.addEventListener("input", () => {
        syncProcessDraftFromFields();
        renderProcessSections();
      });
      processModelValue.addEventListener("change", () => {
        syncProcessDraftFromFields();
        renderProcessSections();
      });
      renderProcessSections();
      processModelSummary.textContent = Demo.getModelLabel(state, draftModelId) || "未选择模型";
    },
    onConfirm() {
      const modeSelect = document.getElementById("processModeSelect");
      const inputSelect = document.getElementById("processInputSelect");
      const processModelValue = document.getElementById("processModelValue");
      const name = document.getElementById("processNameInput").value.trim();
      const inputId = inputSelect?.value || draftInputId;
      const mode = normalizeProcessMode(modeSelect?.value || draftMode);
      if (!name) {
        showToast("请输入处理步骤名称");
        return false;
      }
      if (!inputId) {
        showToast("请选择关联图像");
        return false;
      }
      const selectedModelId = String(processModelValue?.value || draftModelId || "").trim() || null;
      const selectedCategories = mode === "model-roi" ? getModelCategoriesById(selectedModelId) : [];
      if (mode === "model-roi" && !selectedModelId) {
        showToast("请选择模型");
        return false;
      }
      if (mode === "model-roi" && !isCategoryOutputModelId(selectedModelId)) {
        showToast("自动分区只支持分类模型");
        return false;
      }
      if (mode === "model-roi" && !selectedCategories.length) {
        showToast("当前模型没有可识别类别");
        return false;
      }
      if (mode === "manual-roi" && !draftRegions.some((item) => item.type !== "ignore")) {
        showToast("请至少绘制一个检测区域");
        return false;
      }
      const next = existing || { id: Demo.makeId("proc") };
      next.name = name;
      next.inputId = inputId;
      next.mode = mode;
      next.type = mode;
      next.modelId = mode === "model-roi" ? selectedModelId : null;
      next.modelSceneType = mode === "model-roi" ? getModelSceneTypeById(selectedModelId) : "";
      next.categoryOptions = mode === "model-roi" ? [...selectedCategories] : [];
      next.categories = mode === "model-roi" ? [...selectedCategories] : [];
      next.regions = mode === "manual-roi" ? draftRegions : [];
      delete next.details;
      upsertToolItem("process", next);
      closeSharedModal();
      persistState(existing ? "处理步骤已更新" : "处理步骤已添加");
      return true;
    },
  });
}

function openDetectModal(detectId) {
  if (!ensureToolItemCapacity("detect", detectId)) return;
  const tool = getActiveTool();
  if (!tool.process.length) {
    showToast("请先添加处理步骤");
    return;
  }
  const existing = tool.detect.find((item) => item.id === detectId);
  openSharedModal({
    title: existing ? "编辑检测步骤" : "新建检测步骤",
    panelClass: "modal-param",
    body: `
      <label class="field">
        <span>检测项名称</span>
        <input id="detectNameInput" type="text" maxlength="24" value="${escapeAttribute(existing?.name || "")}" placeholder="请输入检测项名称" />
      </label>
      <div class="field">
        <span>关联处理结果图像</span>
        <div class="detect-process-group-list">
          ${tool.acquire
            .map((acquire) => {
              const processList = tool.process.filter((item) => item.inputId === acquire.id);
              return `
                <div class="detect-process-group">
                  <div class="detect-process-group-title">
                    <strong>${escapeHtml(acquire.name)}</strong>
                  </div>
                  ${
                    processList.length
                      ? `
                        <div class="selection-list detect-selection-list">
                          ${processList
                            .map((item) => {
                              const mode = normalizeProcessMode(item.mode);
                              const selectedTargets = getDetectTargets(existing).filter((target) => target.processId === item.id);
                              if (mode === "model-roi") {
                                const categories = getProcessCategoryOptions(item);
                                return `
                                  <div class="detect-process-group">
                                    <div class="detect-process-group-title">
                                      <strong>${escapeHtml(item.name)}</strong>
                                      <span class="chip">${escapeHtml(getProcessModeLabel(mode))}</span>
                                    </div>
                                    ${
                                      categories.length
                                        ? `
                                          <div class="selection-list detect-selection-list">
                                            ${categories
                                              .map((category) => {
                                                const checked = selectedTargets.some((target) => target.categoryKey === category);
                                                return `
                                                  <label class="selection-item detect-selection-item ${checked ? "is-selected" : ""}">
                                                    <div class="selection-item-copy">
                                                      <strong>${escapeHtml(category)}</strong>
                                                      <p>${escapeHtml(Demo.getModelLabel(state, item.modelId))}</p>
                                                    </div>
                                                    <input
                                                      class="selection-item-check"
                                                      type="checkbox"
                                                      data-process-checkbox
                                                      data-process-id="${item.id}"
                                                      data-category-key="${escapeAttribute(category)}"
                                                      data-category-label="${escapeAttribute(category)}"
                                                      value="${item.id}::${escapeAttribute(category)}"
                                                      ${checked ? "checked" : ""}
                                                    />
                                                  </label>
                                                `;
                                              })
                                              .join("")}
                                          </div>
                                        `
                                        : `<div class="builder-empty builder-empty-compact">当前没有可选图像，请前往上一步创建处理步骤。</div>`
                                    }
                                  </div>
                                `;
                              }
                              const checked = selectedTargets.some((target) => !target.categoryKey);
                              const desc = mode === "manual-roi" ? getProcessRoiSummary(item) : "使用整张图片";
                              return `
                                <label class="selection-item detect-selection-item ${checked ? "is-selected" : ""}">
                                  <div class="selection-item-copy">
                                    <strong>${escapeHtml(item.name)}</strong>
                                    <p>${escapeHtml(desc)}</p>
                                  </div>
                                  <input
                                    class="selection-item-check"
                                    type="checkbox"
                                    data-process-checkbox
                                    data-process-id="${item.id}"
                                    data-category-key=""
                                    data-category-label=""
                                    value="${item.id}"
                                    ${checked ? "checked" : ""}
                                  />
                                </label>
                              `;
                            })
                            .join("")}
                        </div>
                      `
                      : `<div class="builder-empty builder-empty-compact">当前没有可选图像，请前往上一步创建处理步骤。</div>`
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
      <div class="field">
        <span>检测模型</span>
        <div class="model-picker-row">
          <div class="model-picker-value" id="detectModelSummary">${escapeHtml(Demo.getModelLabel(state, existing?.modelId) || "未选择模型")}</div>
          <button class="secondary-btn" id="openDetectModelDrawer" type="button">选择模型</button>
        </div>
        <input id="detectModelValue" type="hidden" value="${escapeAttribute(existing?.modelId || "")}" />
      </div>
    `,
    confirmText: existing ? "保存" : "创建",
    onOpen() {
      const button = document.getElementById("openDetectModelDrawer");
      const groupList = document.querySelector(".detect-process-group-list");
      button.addEventListener("click", () => {
        const select = document.getElementById("detectModelValue");
        openModelSelector({
          valueId: "detectModelValue",
          summaryId: "detectModelSummary",
          selectedModelId: select.value || existing?.modelId || null,
        });
      });
      groupList?.addEventListener("change", (event) => {
        const checkbox = getClosestEventTarget(event, "[data-process-checkbox]");
        if (!checkbox) return;
        const item = checkbox.closest(".detect-selection-item");
        item?.classList.toggle("is-selected", checkbox.checked);
      });
    },
    onConfirm() {
      const name = document.getElementById("detectNameInput").value.trim();
      const modelId = document.getElementById("detectModelValue").value;
      const targets = Array.from(document.querySelectorAll("[data-process-checkbox]:checked")).map((input) => ({
        processId: input.dataset.processId || input.value,
        categoryKey: input.dataset.categoryKey || "",
        categoryLabel: input.dataset.categoryLabel || "",
      }));
      if (!name) {
        showToast("请输入检测项名称");
        return false;
      }
      if (!targets.length) {
        showToast("请至少选择一个处理结果图像。");
        return false;
      }
      if (!modelId) {
        showToast("请选择检测模型");
        return false;
      }
      const next = existing || { id: Demo.makeId("det") };
      next.name = name;
      next.targets = targets;
      next.processIds = Array.from(new Set(targets.map((target) => target.processId)));
      next.modelId = modelId;
      upsertToolItem("detect", next);
      closeSharedModal();
      persistState(existing ? "检测步骤已更新" : "检测步骤已添加");
      return true;
    },
  });
}

function deleteAcquire(id) {
  const tool = getActiveTool();
  const referenced = tool.process.some((item) => item.inputId === id);
  if (!referenced) {
    tool.acquire = tool.acquire.filter((item) => item.id !== id);
    syncToolCompletionState(tool);
    persistState("图像来源已删除");
    return;
  }
  openSharedModal({
    title: "删除图像来源",
    body: `<p class="banner banner-danger">当前图像已被引用，删除后会清空相关设置，确认删除？</p>`,
    confirmText: "确认删除",
    confirmClass: "danger-btn",
    onConfirm() {
      tool.acquire = tool.acquire.filter((item) => item.id !== id);
      tool.process.forEach((item) => {
        if (item.inputId === id) item.inputId = "";
      });
      syncToolCompletionState(tool);
      closeSharedModal();
      persistState("图像来源已删除，相关配置已清空。");
      return true;
    },
  });
}

function deleteProcess(id) {
  const tool = getActiveTool();
  const referenced = tool.detect.some((item) => item.processIds.includes(id));
  if (!referenced) {
    tool.process = tool.process.filter((item) => item.id !== id);
    syncToolCompletionState(tool);
    persistState("处理步骤已删除");
    return;
  }
  openSharedModal({
    title: "删除处理步骤",
    body: `<p class="banner banner-danger">当前处理结果图像已被引用，删除后会清空相关设置，确认删除？</p>`,
    confirmText: "确认删除",
    confirmClass: "danger-btn",
    onConfirm() {
      tool.process = tool.process.filter((item) => item.id !== id);
      syncToolCompletionState(tool);
      closeSharedModal();
      persistState("处理步骤已删除，相关配置已清空。");
      return true;
    },
  });
}

function deleteDetect(id) {
  const tool = getActiveTool();
  tool.detect = tool.detect.filter((item) => item.id !== id);
  syncToolCompletionState(tool);
  persistState("检测步骤已删除");
}

function upsertToolItem(type, nextItem) {
  const tool = getActiveTool();
  const list = tool[type];
  const index = list.findIndex((item) => item.id === nextItem.id);
  if (index >= 0) {
    list[index] = nextItem;
  } else {
    list.push(nextItem);
  }
  syncToolCompletionState(tool);
}

function startDetectionRun() {
  const tool = getActiveTool();
  if (!tool || !isToolSessionRunning(tool)) {
    showToast("请先进入检测状态。");
    return;
  }
  if (Demo.isStorageBlocked(state)) {
    showToast("剩余空间不足，暂时不能开始新的检测，请先清理数据。");
    return;
  }
  if (ui.pendingDetectionToolId) {
    showToast("已有任务进行中，请稍后再试");
    return;
  }

  const runToolId = tool.id;
  const runMode = tool.runtime?.sessionMode || getHighestAvailableRunMode(tool);
  const runActionLabel = getRunActionLabel(runMode);
  clearRuntimeInitialState(runToolId);
  if (!tool.runtime || typeof tool.runtime !== "object") tool.runtime = {};
  tool.runtime.activeTags = getRuntimeDraftTags(tool);
  ui.pendingDetectionToolId = runToolId;
  ui.pendingDetectionStartedAt = Date.now();
  tool.runtime.status = "执行中";
  renderAll();
  showToast(`开始${runActionLabel}`);

  timers.detection = window.setTimeout(() => {
    timers.detection = null;
    const runtimeTool = state.tools.find((item) => item.id === runToolId);
    try {
      if (Demo.isStorageBlocked(state)) {
        abortDetectionRun("剩余空间不足，当前任务已中断。", { toolId: runToolId });
        return;
      }

      if (!runtimeTool) {
        ui.pendingDetectionToolId = null;
        ui.pendingDetectionStartedAt = 0;
        persistState("运行已结束，当前工具不存在");
        return;
      }

      Demo.advanceDemoClock(state, 2);
      const latestRecord = buildDetectionRecord(runtimeTool, runtimeTool.runtime.sessionMode || "detect");
      state.detectionRecords.unshift(latestRecord);
      runtimeTool.runtime.lastRunAt = state.meta.now;
      runtimeTool.runtime.status = "等待信号";
      runtimeTool.runtime.primaryResult = latestRecord.totalResult || latestRecord.businessResult;
      runtimeTool.runtime.cycleTime =
        latestRecord.runMode === "detect" ? ((latestRecord.totalResult || latestRecord.businessResult) === "OK" ? "0.82s" : "1.07s") : "-";
      runtimeTool.runtime.draftTags = [];
      runtimeTool.runtime.activeTags = [];
      ui.activeRecordId = latestRecord.id;
      ui.activeRuntimeImageId = latestRecord.imageResults?.[0]?.id || null;
      ui.runtimePlaybackRecordId = latestRecord.id;
      ui.pendingDetectionToolId = null;
      ui.pendingDetectionStartedAt = 0;
      persistState(runMode === "detect" ? "检测完成。" : "采图完成。");
    } catch (error) {
      console.error("[JetCheck Demo] detection run failed", error);
      ui.pendingDetectionToolId = null;
      ui.pendingDetectionStartedAt = 0;
      if (runtimeTool?.runtime) {
        runtimeTool.runtime.status = "等待信号";
        runtimeTool.runtime.activeTags = [];
      }
      persistState("运行异常，已返回待检测状态。");
    }
  }, 1800);
}

function abortDetectionRun(message, options = {}) {
  const { keepSession = true, toolId = ui.pendingDetectionToolId || ui.activeToolId } = options;
  if (timers.detection) clearTimeout(timers.detection);
  timers.detection = null;
  const tool = state.tools.find((item) => item.id === toolId) || getActiveTool();
  if (tool) {
    tool.runtime.status = keepSession ? "等待信号" : "未运行";
    const activeTags = getRuntimeActiveTags(tool);
    if (activeTags.length) tool.runtime.draftTags = activeTags;
    tool.runtime.activeTags = [];
    if (!keepSession) {
      endToolRunSessionState(tool);
      if (ui.activeToolId === tool.id && ui.toolView === "runtime") {
        ui.toolView = "overview";
      }
    }
  }
  ui.pendingDetectionToolId = null;
  ui.pendingDetectionStartedAt = 0;
  if (keepSession && tool) activateRuntimeInitialState(tool.id);
  persistState(message);
}

function resetCurrentRunTask() {
  const tool = getActiveTool();
  if (!tool || !isToolSessionRunning(tool)) return;
  openSharedModal({
    title: "重置",
    body: `<p class="banner banner-warning">将会清空本条${getRunActionLabel(tool.runtime?.sessionMode || "detect")}结果，确认重置？</p>`,
    confirmText: "确认重置",
    onConfirm() {
      closeSharedModal();
      if (ui.pendingDetectionToolId === tool.id) {
        abortDetectionRun("当前结果已重置，等待重新开始。");
        return true;
      }
      removeLatestRuntimeRecord(tool.id);
      tool.runtime.status = "等待信号";
      tool.runtime.primaryResult = "-";
      tool.runtime.cycleTime = "-";
      tool.runtime.draftTags = [];
      tool.runtime.activeTags = [];
      activateRuntimeInitialState(tool.id);
      persistState("当前结果已重置，等待重新开始。");
      return true;
    },
  });
}

function stopToolRunSession() {
  const tool = getActiveTool();
  if (!tool || !isToolSessionRunning(tool)) return;
  openSharedModal({
    title: "退出工具",
    body: `<p class="banner banner-danger">确认结束运行并退出当前工具？</p>`,
    confirmText: "确认退出",
    confirmClass: "danger-btn",
    onConfirm() {
      closeSharedModal();
      if (ui.pendingDetectionToolId === tool.id) {
        abortDetectionRun("已退出当前工具。", { keepSession: false });
      } else {
        endToolRunSessionState(tool);
        ui.toolView = "overview";
        persistState("已退出当前工具。");
      }
      return true;
    },
  });
}

function applyCameraFilters() {
  ui.cameraFilters.keyword = els.cameraKeywordInput.value.trim();
  ui.cameraFilters.vendor = els.cameraVendorFilter.value;
  renderCameraPage();
}

function resetCameraFilters() {
  ui.cameraFilters.keyword = "";
  ui.cameraFilters.vendor = "all";
  renderCameraPage();
}

function refreshCameraList() {
  Demo.advanceDemoClock(state, 1);
  const offlineCamera = state.cameras.find((camera) => camera.status === "离线");
  if (offlineCamera) offlineCamera.status = "空闲";
  persistState("相机列表已刷新");
}

function handleCameraTableClick(event) {
  const actionEl = getClosestEventTarget(event, "[data-action]");
  if (!actionEl) return;
  const { action, id } = actionEl.dataset;
  if (action === "manage-param") return openParamModal(id);
  if (action === "delete-camera") return deleteCamera(id);
}

function previewCamera(cameraId) {
  const camera = state.cameras.find((item) => item.id === cameraId);
  if (!camera) return;
  if (camera.status !== "空闲") {
    showToast("仅空闲相机支持预览");
    return;
  }
  openSharedModal({
    title: `${Demo.getCameraLabel(camera)} · 预览`,
    body: `
      <div class="inspection-stage inspection-stage-compact">
        <div class="stage-overlay"></div>
        <div class="stage-caption">${escapeHtml(Demo.getCameraLabel(camera))} / ${escapeHtml(camera.vendor)} / ${escapeHtml(camera.model)}</div>
      </div>
      <div class="meta-list">
        <span>相机编号</span>
        <span>${escapeHtml(camera.id)}</span>
        <span>设备序列号</span>
        <span>${escapeHtml(camera.serial)}</span>
        <span>当前状态</span>
        <span>${escapeHtml(camera.status)}</span>
      </div>
    `,
    confirmText: "关闭",
    hideCancel: true,
    onConfirm() {
      closeSharedModal();
      return true;
    },
  });
}

function openRuntimeCameraPreview(acquireId) {
  const tool = getActiveTool();
  const acquire = tool?.acquire?.find((item) => item.id === acquireId) || null;
  const camera = acquire?.cameraId ? state.cameras.find((item) => item.id === acquire.cameraId) || null : null;
  if (!acquire || acquire.type !== "camera" || !camera) {
    showToast("当前图像来源不是相机");
    return;
  }
  const paramGroup = camera.paramGroups?.find((item) => item.id === acquire.paramGroupId) || null;
  const fields = paramGroup ? getParamFieldSchema(camera.brand).slice(0, 6) : [];
  const cameraStatusText = getRuntimeCameraStatusText(camera);
  openSharedModal({
    title: `${Demo.getCameraLabel(camera)} · 相机画面`,
    panelClass: "modal-xl",
    body: `
      <div class="runtime-camera-preview-dialog">
        <div class="sample-preview-frame runtime-camera-preview-frame ${getAcquireSampleUrl(acquire) ? "" : "is-placeholder"}">
          ${
            getAcquireSampleUrl(acquire)
              ? `<img src="${escapeAttribute(getAcquireSampleUrl(acquire))}" alt="${escapeAttribute(getAcquireSampleName(acquire))}" />`
              : `<div class="sample-preview-grid"></div><span>${escapeHtml(getAcquireSampleName(acquire))}</span>`
          }
        </div>
        <div class="runtime-camera-preview-side">
          <div class="runtime-camera-preview-summary">
            <span>相机状态</span>
            <strong>${escapeHtml(cameraStatusText)}</strong>
            <span>相机编号</span>
            <strong>${escapeHtml(camera.id)}</strong>
            <span>参数组</span>
            <strong>${escapeHtml(paramGroup?.name || "-")}</strong>
          </div>
          <div class="runtime-camera-preview-meta-card">
            <h4>参数信息</h4>
            ${
              fields.length
                ? `<div class="meta-list runtime-camera-preview-meta">
                    ${fields
                      .map((field) => {
                        const value = paramGroup?.settings?.[field.key] ?? field.defaultValue;
                        return `<span>${escapeHtml(field.label)}</span><span>${escapeHtml(String(value))}</span>`;
                      })
                      .join("")}
                  </div>`
                : `<div class="builder-empty builder-empty-compact">当前暂无参数信息</div>`
            }
          </div>
        </div>
      </div>
    `,
    confirmText: "关闭",
    hideCancel: true,
    onConfirm() {
      closeSharedModal();
      return true;
    },
  });
}

function deleteCamera(cameraId) {
  const runningToolNames = getRunningToolNamesUsingCamera(cameraId);
  if (runningToolNames.length) {
    showToast(`相机正在被检测工具“${runningToolNames[0]}”运行，无法删除。`);
    return;
  }
  const camera = state.cameras.find((item) => item.id === cameraId);
  if (!camera) return;
  const referenced = Demo.getReferencedCameraIds(state).has(cameraId);
  openSharedModal({
    title: "删除相机",
    body: `<p class="banner banner-danger">${
      referenced
        ? `相机被检测工具引用，删除相机将清空相应配置，确认删除？`
        : `确认删除相机“${escapeHtml(Demo.getCameraLabel(camera))}”？`
    }</p>`,
    confirmText: "确认删除",
    confirmClass: "danger-btn",
    onConfirm() {
      state.tools.forEach((tool) => {
        tool.acquire.forEach((item) => {
          if (item.type === "camera" && item.cameraId === cameraId) {
            item.cameraId = "";
            item.paramGroupId = "";
          }
        });
        syncToolCompletionState(tool);
      });
      state.cameras = state.cameras.filter((item) => item.id !== cameraId);
      closeSharedModal();
      persistState(referenced ? "相机已删除，相关配置已清空。" : "相机已删除");
      return true;
    },
  });
}

function openAddCameraModal() {
  ui.discoveryKeyword = "";
  els.cameraDiscoveryKeyword.value = "";
  openPanel(els.addCameraModal);
  renderAddCameraModal();
}

function closeAddCameraModal() {
  closePanel(els.addCameraModal);
}

function applyDiscoveryFilters() {
  ui.discoveryKeyword = els.cameraDiscoveryKeyword.value.trim();
  renderAddCameraModal();
}

function scanDiscoveryDevices() {
  Demo.advanceDemoClock(state, 1);
  ui.discoveryKeyword = els.cameraDiscoveryKeyword.value.trim();
  renderAddCameraModal();
  showToast("已完成网络设备搜索");
}

function confirmAddCamera() {
  const selectedIds = Array.from(els.cameraDiscoveryBody.querySelectorAll("input:checked")).map((input) => input.value);
  if (!selectedIds.length) {
    showToast("请至少选择一台相机");
    return;
  }
  selectedIds.forEach((id) => {
    const source = state.availableCameras.find((item) => item.id === id);
    if (!source || state.cameras.some((item) => item.id === id)) return;
    state.cameras.push({
      id: source.id,
      name: source.name || "",
      vendor: source.vendor,
      brand: source.brand,
      model: source.model,
      serial: source.serial,
      ip: source.ip,
      status: source.status === "离线" ? "离线" : "空闲",
      paramGroups: [
        {
          id: Demo.makeId("pg"),
          name: "默认参数组",
          settings: getDefaultParamSettings(source.brand),
        },
      ],
    });
  });
  closeAddCameraModal();
  persistState("相机已添加到管理列表");
}

function openParamModal(cameraId) {
  const camera = state.cameras.find((item) => item.id === cameraId);
  if (!camera) return;
  if (camera.status !== "空闲") {
    showToast("相机正在使用中，暂时不能设置参数组。");
    return;
  }
  ui.activeCameraId = cameraId;
  ui.activeParamGroupId = camera.paramGroups?.[0]?.id || null;
  openPanel(els.paramModal);
  renderParamModal();
}

function closeParamModal() {
  closePanel(els.paramModal);
  renderTools();
}

function handleParamGroupClick(event) {
  const deleteBtn = getClosestEventTarget(event, "[data-action='delete-param-group']");
  if (deleteBtn) {
    deleteParamGroup(deleteBtn.dataset.groupId);
    return;
  }

  const button = getClosestEventTarget(event, "[data-group-id]");
  if (!button) return;
  ui.activeParamGroupId = button.dataset.groupId;
  renderParamModal();
}

function addParamGroup() {
  const camera = getActiveCamera();
  if (!camera) return;
  const next = {
    id: Demo.makeId("pg"),
    name: `新参数组 ${camera.paramGroups.length + 1}`,
    settings: getDefaultParamSettings(camera.brand),
  };
  camera.paramGroups.push(next);
  ui.activeParamGroupId = next.id;
  persistState("参数组已新增");
  window.requestAnimationFrame(() => {
    const nameInput = document.getElementById("param_field_name");
    nameInput?.focus();
    nameInput?.select();
  });
}

function handleParamFieldChange(event) {
  const field = getClosestEventTarget(event, "input, select");
  if (!field || !field.id || !field.id.startsWith("param_field_")) return;

  const camera = getActiveCamera();
  const group = getActiveParamGroup();
  if (!camera || !group) return;

  const fieldKey = field.id.replace("param_field_", "");
  if (fieldKey === "name") {
    group.name = field.value.trim() || "未命名参数组";
  } else {
    const schema = getParamFieldSchema(camera.brand).find((item) => item.key === fieldKey);
    if (!schema) return;
    if (schema.type === "boolean") {
      group.settings[fieldKey] = field.value === "true";
    } else if (schema.type === "number") {
      group.settings[fieldKey] = Number(field.value || 0);
    } else {
      group.settings[fieldKey] = field.value;
    }
  }

  syncParamPreview(camera, group);
  if (fieldKey === "name") {
    els.paramGroupList.innerHTML = renderParamGroupList(camera, Demo.getReferencedParamIds(state));
  }
  Demo.syncOfflineAt(state);
  Demo.saveState(state);
}

function handleParamFieldWheel(event) {
  const field = getClosestEventTarget(event, "input[type='number']");
  if (!field) return;
  if (document.activeElement === field) {
    field.blur();
  }
}

function deleteParamGroup(groupId = ui.activeParamGroupId) {
  const camera = getActiveCamera();
  const group = camera?.paramGroups?.find((item) => item.id === groupId) || null;
  const referenced = Demo.getReferencedParamIds(state);
  if (!camera || !group) return;
  const runningToolNames = getRunningToolNamesUsingParamGroup(group.id);
  if (runningToolNames.length) {
    showToast(`参数组正在被检测工具“${runningToolNames[0]}”运行，无法删除。`);
    return;
  }
  if (camera.paramGroups.length <= 1) {
    showToast("至少保留一个参数组");
    return;
  }
  const isReferenced = referenced.has(group.id);
  openSharedModal({
    title: "删除参数组",
    body: `<p class="banner banner-danger">${
      isReferenced ? "参数组被检测工具引用，删除参数组将清空对应配置，确认删除？" : `确认删除参数组“${escapeHtml(getParamGroupDisplayName(group))}”？`
    }</p>`,
    confirmText: "确认删除",
    confirmClass: "danger-btn",
    onConfirm() {
      state.tools.forEach((tool) => {
        tool.acquire.forEach((item) => {
          if (item.type === "camera" && item.paramGroupId === group.id) {
            item.paramGroupId = "";
          }
        });
        syncToolCompletionState(tool);
      });
      camera.paramGroups = camera.paramGroups.filter((item) => item.id !== group.id);
      ui.activeParamGroupId = camera.paramGroups[0]?.id || null;
      closeSharedModal();
      persistState(isReferenced ? "参数组已删除，相关配置已清空。" : "参数组已删除");
      return true;
    },
  });
}

function openModelSelector(target) {
  const returnToSharedModal = !els.sharedModal.hidden;
  ui.modelTarget = target ? { ...target, returnToSharedModal } : null;
  ui.selectedModelId = target?.selectedModelId || state.localModels[0]?.id || null;
  ui.modelDrawerMode = "select-local";
  ui.modelSelectorFilters = { keyword: "", scene: target?.allowedScenes?.[0] || "all" };
  if (returnToSharedModal) {
    closePanel(els.sharedModal);
  }
  openPanel(els.modelDrawer);
  renderModelDrawer();
}

function openCloudModelDrawer() {
  ui.modelTarget = null;
  ui.modelDrawerMode = "cloud-add";
  openPanel(els.modelDrawer);
  renderModelDrawer();
}

function closeModelDrawer() {
  const shouldRestoreSharedModal = Boolean(ui.modelDrawerMode === "select-local" && ui.modelTarget?.returnToSharedModal);
  if (ui.modelDrawerMode === "select-local") {
    ui.modelTarget = null;
  }
  closePanel(els.modelDrawer);
  if (shouldRestoreSharedModal) {
    openPanel(els.sharedModal);
  }
}

function handleLocalModelTableClick(event) {
  const deleteButton = getClosestEventTarget(event, "[data-action='delete-local-model']");
  if (deleteButton) {
    deleteLocalModel(deleteButton.dataset.modelId);
  }
}

function handleSelectorModelTableClick(event) {
  const row = getClosestEventTarget(event, "[data-action='select-selector-model']");
  if (!row) return;
  ui.selectedModelId = row.dataset.modelId;
  renderSelectorModels();
}

function handleCloudModelListClick(event) {
  const button = getClosestEventTarget(event, "[data-action='download-model']");
  if (!button) return;
  startModelDownload(button.dataset.modelId, button.dataset.versionId);
}

function startModelDownload(modelId, versionId) {
  if (!state.runtimeDevice.networkOnline) {
    showToast("当前离线，无法下载云端模型");
    return;
  }
  if (Demo.isStorageBlocked(state)) {
    showToast("剩余空间不足，暂时无法下载模型。");
    return;
  }
  if (ui.pendingDownload) return;

  const model = state.cloudModels.find((item) => item.id === modelId);
  const version = model?.versions.find((item) => item.id === versionId);
  if (!model || !version) return;
  const alreadyDownloaded = state.localModels.some((item) => item.version === version.version);
  if (alreadyDownloaded) {
    showToast("当前版本已下载到本地");
    return;
  }

  ui.pendingDownload = { modelId, versionId };
  renderModelDrawer();
  showToast("开始下载模型。");

  timers.download = window.setTimeout(() => {
    timers.download = null;
    if (!state.runtimeDevice.networkOnline) {
      abortModelDownload("客户端离线，云端模型下载已中断");
      return;
    }
    if (Demo.isStorageBlocked(state)) {
      abortModelDownload("剩余空间不足，模型下载已中断。");
      return;
    }

    Demo.advanceDemoClock(state, 3);
    state.localModels.unshift({
      id: version.id,
      version: version.version,
      modelName: model.modelName,
      sceneType: model.sceneType,
      categories: model.sceneType === "分类" ? Demo.normalizeModelCategories(model) : [],
      source: "云端同步",
      addedAt: state.meta.now,
    });
    ui.pendingDownload = null;
    ui.selectedModelId = version.id;
    persistState("模型已下载到本地");
  }, 1800);
}

function abortModelDownload(message) {
  if (timers.download) clearTimeout(timers.download);
  timers.download = null;
  ui.pendingDownload = null;
  persistState(message);
}

function openImportModelModal() {
  if (Demo.isStorageBlocked(state)) {
    showToast("剩余空间不足，暂时无法导入模型。");
    return;
  }
  els.importModelFileInput.value = "";
  els.importModelFileInput.click();
}

function handleImportModelFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (Demo.isStorageBlocked(state)) {
    showToast("剩余空间不足，暂时无法导入模型。");
    event.target.value = "";
    return;
  }

  const meta = inferImportedModelMeta(file.name);
  const duplicated = state.localModels.some((item) => item.version === meta.version);
  if (duplicated) {
    showToast("模型版本编号已存在，上传被拒绝");
    event.target.value = "";
    return;
  }

  Demo.advanceDemoClock(state, 2);
  const id = Demo.makeId("mdl_local");
  state.localModels.unshift({
    id,
    version: meta.version,
    modelName: meta.modelName,
    sceneType: meta.sceneType,
    categories: meta.sceneType === "分类" ? Demo.normalizeModelCategories(meta) : [],
    source: "导入本地模型",
    addedAt: state.meta.now,
  });
  ui.selectedModelId = id;
  event.target.value = "";
  persistState(`模型已导入：${file.name}`);
}

function inferImportedModelMeta(fileName) {
  const baseName = String(fileName || "")
    .replace(/\.(zip|7z|rar|tar|gz|tgz)$/i, "")
    .trim();
  const normalizedName = baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || "检测模型";
  const matched = normalizedName.match(/^(.*?)[\s]+([A-Za-z]?\d[\w.-]{5,})$/);
  const modelName = (matched?.[1] || normalizedName).trim();
  const fallbackVersion = `UP${state.meta.now.slice(0, 19).replace(/[-:T]/g, "")}`;
  const version = (matched?.[2] || fallbackVersion).trim();
  return {
    modelName,
    version,
    sceneType: inferSceneTypeFromModelName(modelName),
  };
}

function inferSceneTypeFromModelName(modelName) {
  const text = String(modelName || "");
  if (/尺寸/.test(text)) return "尺寸";
  if (/分类|识别/.test(text)) return "分类";
  return "缺陷检测";
}

function buildMockAlgorithmOutput(output, businessResult, modelSceneType = "") {
  if (modelSceneType === "尺寸") {
    return businessResult === "NG" ? "点点距离 14.20 mm" : "点点距离 12.84 mm";
  }
  if (output.outputType === "classifier") {
    return businessResult === "NG" ? "异常类别 84.7%" : "目标类别 97.5%";
  }
  return businessResult === "NG" ? "缺陷 84.7%" : "正常边界 97.5%";
}

function deleteLocalModel(modelId) {
  const runningToolNames = getRunningToolNamesUsingModel(modelId);
  if (runningToolNames.length) {
    showToast(`模型正在被检测工具“${runningToolNames[0]}”运行，无法删除。`);
    return;
  }
  const model = state.localModels.find((item) => item.id === modelId);
  if (!model) return;
  const referenceCount = getLocalModelReferenceCount(modelId);
  openSharedModal({
    title: "删除模型",
    body: `<p class="banner banner-danger">${
      referenceCount ? "模型被检测工具引用，删除模型将清空相应配置，确认删除？" : `确认删除模型“${escapeHtml(model.modelName)}”？`
    }</p>`,
    confirmText: "确认删除",
    confirmClass: "danger-btn",
    onConfirm() {
      state.tools.forEach((tool) => {
        tool.process.forEach((item) => {
          if (item.modelId === modelId) item.modelId = null;
        });
        tool.detect.forEach((item) => {
          if (item.modelId === modelId) item.modelId = null;
        });
        syncToolCompletionState(tool);
      });
      state.localModels = state.localModels.filter((item) => item.id !== modelId);
      if (ui.selectedModelId === modelId) {
        ui.selectedModelId = state.localModels[0]?.id || null;
      }
      closeSharedModal();
      persistState(referenceCount ? "模型已删除，相关配置已清空。" : "模型已删除");
      return true;
    },
  });
}

function confirmModelSelection() {
  if (!ui.selectedModelId) {
    showToast("请先选择一个模型");
    return;
  }
  let targetInput = null;
  if (ui.modelTarget?.valueId) {
    const input = document.getElementById(ui.modelTarget.valueId);
    if (input) {
      input.value = ui.selectedModelId;
      targetInput = input;
    }
  }
  if (ui.modelTarget?.summaryId) {
    const summary = document.getElementById(ui.modelTarget.summaryId);
    if (summary) summary.textContent = Demo.getModelLabel(state, ui.selectedModelId) || "未选择模型";
  }
  if (targetInput) {
    targetInput.dispatchEvent(new Event("input", { bubbles: true }));
    targetInput.dispatchEvent(new Event("change", { bubbles: true }));
  }
  closeModelDrawer();
  showToast("模型已回填");
}

function resetLocalFilters() {
  ui.localFilters = {
    keyword: "",
    scene: "all",
  };
  renderLocalModels();
}

function applyLocalFilters() {
  ui.localFilters = {
    keyword: els.localModelKeywordFilter.value.trim(),
    scene: els.localSceneFilter.value,
  };
  renderLocalModels();
}

function resetModelSelectorFilters() {
  ui.modelSelectorFilters = {
    keyword: "",
    scene: "all",
  };
  renderSelectorModels();
}

function applyModelSelectorFilters() {
  ui.modelSelectorFilters = {
    keyword: els.selectorModelKeywordFilter.value.trim(),
    scene: els.selectorModelSceneFilter.value,
  };
  renderSelectorModels();
}

function resetCloudFilters() {
  ui.cloudFilters = {
    keyword: "",
    scene: "all",
  };
  renderCloudModels();
}

function applyCloudFilters() {
  ui.cloudFilters = {
    keyword: els.cloudModelKeywordFilter.value.trim(),
    scene: els.cloudSceneFilter.value,
  };
  renderCloudModels();
}

function applyRecordFilters() {
  const startAt = els.recordStartTimeInput.value;
  const endAt = els.recordEndTimeInput.value;
  if (startAt && endAt) {
    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime();
    if (Number.isFinite(startMs) && Number.isFinite(endMs) && startMs > endMs) {
      showToast("开始时间不能晚于结束时间");
      return;
    }
  }
  ui.recordFilters.toolId = els.recordToolFilter.value;
  ui.recordFilters.business = els.recordBusinessFilter.value;
  ui.recordFilters.startAt = startAt;
  ui.recordFilters.endAt = endAt;
  ui.recordFilters.keyword = els.recordKeywordInput.value.trim();
  ui.recordPagination.page = 1;
  renderRecords();
}

function resetRecordFilters() {
  ui.recordFilters = {
    toolId: "all",
    business: "all",
    startAt: "",
    endAt: "",
    keyword: "",
  };
  ui.recordPagination.page = 1;
  renderRecords();
}

function handleRecordTableClick(event) {
  const button = getClosestEventTarget(event, "[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (!id) return;
  if (action === "view-record-detail") {
    openRecordDetailModal(id);
  }
}

function handleRecordPaginationClick(event) {
  const button = getClosestEventTarget(event, "[data-action]");
  if (!button) return;
  const { action, page } = button.dataset;
  const pagination = getRecordPaginationState();
  if (action === "prev-page" && pagination.page > 1) {
    ui.recordPagination.page -= 1;
    renderRecords();
    return;
  }
  if (action === "next-page" && pagination.page < pagination.totalPages) {
    ui.recordPagination.page += 1;
    renderRecords();
    return;
  }
  if (action === "go-page" && Number.isInteger(Number(page))) {
    ui.recordPagination.page = Number(page);
    renderRecords();
  }
}

function handleRuntimeImageResultClick(event) {
  const detailButton = getClosestEventTarget(event, "[data-action='open-runtime-image-detail']");
  if (detailButton?.dataset.id) {
    openRuntimeImageResultsModal(detailButton.dataset.id);
    return;
  }
  const button = getClosestEventTarget(event, "[data-action='select-runtime-image']");
  if (!button) return;
  ui.activeRuntimeImageId = button.dataset.id;
  renderToolRuntime();
}

function handleToolRuntimeClick(event) {
  const subResultButton = getClosestEventTarget(event, "[data-action='focus-runtime-subresult']");
  if (subResultButton?.dataset.imageId && subResultButton?.dataset.subId) {
    openRuntimeImageResultsModal(subResultButton.dataset.imageId, subResultButton.dataset.subId);
    return;
  }
  const previewButton = getClosestEventTarget(event, "[data-action='preview-runtime-camera']");
  if (previewButton?.dataset.acquireId) {
    openRuntimeCameraPreview(previewButton.dataset.acquireId);
    return;
  }
  if (getClosestEventTarget(event, "[data-action='add-runtime-tag']")) {
    addRuntimeTag();
    return;
  }
  const removeButton = getClosestEventTarget(event, "[data-action='remove-runtime-tag']");
  if (removeButton) {
    removeRuntimeTag(removeButton.dataset.index);
  }
}

function handleToolRuntimeKeydown(event) {
  const input = getClosestEventTarget(event, "#runtimeTagInput");
  if (!input || event.key !== "Enter") return;
  event.preventDefault();
  addRuntimeTag();
}

function addRuntimeTag() {
  const tool = getActiveTool();
  const record = getActiveRuntimeRecord();
  const input = document.getElementById("runtimeTagInput");
  const target = getRuntimeTagTarget(tool, record);
  if (!target || !input) return;
  if (!canEditRuntimeTags(record, tool)) {
    showToast("运行执行中，暂不可编辑标签");
    return;
  }
  const nextTag = input.value.trim();
  const tags = target.type === "draft" ? getRuntimeDraftTags(tool) : getRuntimeRecordTags(record);
  if (!nextTag) {
    showToast("请输入标签内容");
    return;
  }
  if (tags.includes(nextTag)) {
    showToast("标签已存在");
    return;
  }
  if (tags.length >= 3) {
    showToast("最多支持 3 个标签");
    return;
  }
  if (target.type === "draft") {
    target.owner.draftTags = [...tags, nextTag];
  } else {
    target.owner.customTags = [...tags, nextTag];
  }
  persistState("标签已添加");
}

function removeRuntimeTag(index) {
  const tool = getActiveTool();
  const record = getActiveRuntimeRecord();
  const target = getRuntimeTagTarget(tool, record);
  if (!target) return;
  if (!canEditRuntimeTags(record, tool)) {
    showToast("运行执行中，暂不可编辑标签");
    return;
  }
  const tags = target.type === "draft" ? getRuntimeDraftTags(tool) : getRuntimeRecordTags(record);
  const removeIndex = Number(index);
  if (!Number.isInteger(removeIndex) || removeIndex < 0 || removeIndex >= tags.length) return;
  if (target.type === "draft") {
    target.owner.draftTags = tags.filter((_, itemIndex) => itemIndex !== removeIndex);
  } else {
    target.owner.customTags = tags.filter((_, itemIndex) => itemIndex !== removeIndex);
  }
  persistState("标签已删除");
}

function openRecordDetailModal(recordId) {
  openRecordDetailModalWithState(recordId);
}

function openRecordDetailModalWithState(recordId, viewerState = {}) {
  const record = state.detectionRecords.find((item) => item.id === recordId);
  if (!record) return;
  ui.activeRecordId = recordId;
  const imageResults = getRecordImageResults(record);
  const targetImageId = viewerState.imageResultId || ui.recordImageViewer?.imageResultId || "";
  const activeImageResult = imageResults.find((item) => item.id === targetImageId) || imageResults[0] || null;
  ui.recordImageViewer = {
    recordId,
    imageResultId: activeImageResult?.id || "",
    activeSubId: "",
    showRoi: viewerState.showRoi !== false,
    showOverlay: true,
  };
  openSharedModal({
    title: `记录详情 · ${record.id}`,
    panelClass: "modal-record-result",
    bodyClass: "modal-body-record-detail",
    body: renderRecordDetailModal(record),
    onOpen() {
      bindRecordDetailModal(recordId);
    },
    confirmText: "关闭",
    hideCancel: true,
    onConfirm() {
      closeSharedModal();
      return true;
    },
  });
}

function renderRecordDetailModal(record) {
  const imageResults = getRecordImageResults(record);
  const activeImageResult = imageResults.find((item) => item.id === ui.recordImageViewer?.imageResultId) || imageResults[0] || null;
  if (activeImageResult) {
    ui.recordImageViewer.imageResultId = activeImageResult.id;
  }
  return `
    <div class="record-detail-runtime-layout" id="recordDetailModalBody">
      <div class="record-detail-runtime-split">
        <aside class="record-detail-section record-detail-image-list-panel">
          <div class="record-detail-image-list-head">
            <h4>图像列表</h4>
          </div>
          <div class="record-detail-image-list">
            ${
              imageResults.length
                ? imageResults
                    .map((imageResult, index) => renderRecordDetailImageItem(record, imageResult, index, imageResult.id === activeImageResult?.id))
                    .join("")
                : `<div class="builder-empty builder-empty-compact">当前暂无图像记录</div>`
            }
          </div>
        </aside>
        <section class="record-detail-section record-detail-image-view-panel">
          ${
            activeImageResult
              ? `
                <div class="record-detail-image-view-head">
                  <h4>当前图像</h4>
                </div>
                <div class="record-detail-image-stage-shell">
                  ${renderRecordImageSourceStage(activeImageResult, { showRoi: true })}
                </div>
              `
              : `<div class="builder-empty">当前暂无图像结果</div>`
          }
        </section>
      </div>
    </div>
  `;
}

function renderRecordDetailImageItem(record, imageResult, index, active) {
  const subResults = Array.isArray(imageResult.subResults) ? imageResult.subResults : [];
  const showResultBadge = Demo.normalizeRunMode(record?.runMode || "detect") === "detect";
  const resultBadge = showResultBadge ? renderBusinessBadge(imageResult.result || "-") : "";
  const showSubResultButton = Demo.normalizeRunMode(record?.runMode || "detect") !== "acquire" && !hasOnlyFullImageSubResults(imageResult);
  return `
    <article class="record-detail-image-item ${active ? "is-active" : ""}">
      <button
        class="record-detail-image-main"
        data-action="select-record-detail-image"
        data-record-id="${record.id}"
        data-image-id="${imageResult.id}"
        type="button"
      >
        <div class="record-detail-image-copy">
          <strong>${escapeHtml(imageResult.acquireName || `图像来源 ${index + 1}`)}</strong>
        </div>
        ${resultBadge}
      </button>
      ${
        showSubResultButton
          ? `
            <div class="record-detail-image-foot">
              <button
                class="table-btn"
                data-action="view-record-image-subresults"
                data-record-id="${record.id}"
                data-image-id="${imageResult.id}"
                type="button"
                ${subResults.length ? "" : "disabled"}
              >
                查看分区结果（${subResults.length}）
              </button>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function bindRecordDetailModal(recordId) {
  const root = document.getElementById("recordDetailModalBody");
  if (!root) return;
  const rerender = () => {
    const record = state.detectionRecords.find((item) => item.id === recordId);
    if (!record) return;
    els.sharedModalBody.innerHTML = renderRecordDetailModal(record);
    bindRecordDetailModal(recordId);
  };
  root.querySelectorAll("[data-action='select-record-detail-image']").forEach((button) => {
    button.addEventListener("click", () => {
      ui.recordImageViewer.imageResultId = button.dataset.imageId || "";
      ui.recordImageViewer.showRoi = true;
      rerender();
    });
  });
  root.querySelectorAll("[data-action='view-record-image-subresults']").forEach((button) => {
    button.addEventListener("click", () => {
      openRecordImageSubResultsModal(recordId, button.dataset.imageId || "");
    });
  });
  root.querySelectorAll("[data-action='focus-record-subresult']").forEach((button) => {
    button.addEventListener("click", () => {
      openRecordImageSubResultsModal(recordId, ui.recordImageViewer?.imageResultId || "", button.dataset.subId || "");
    });
  });
}

function openRecordImageSubResultsModal(recordId, imageResultId, activeSubId = "") {
  const record = state.detectionRecords.find((item) => item.id === recordId);
  const imageResult = getRecordImageResults(record).find((item) => item.id === imageResultId);
  if (!record || !imageResult) return;
  const tool = state.tools.find((item) => item.id === record.toolId) || null;
  const subResults = Array.isArray(imageResult.subResults) ? imageResult.subResults : [];
  const currentShowRoi = ui.recordImageViewer?.showRoi !== false;
  openSubResultViewerModal({
    title: `${imageResult.acquireName} · 分区结果（${subResults.length}）`,
    subResults,
    tool,
    activeSubId,
    onCloseRestore: () => {
      openRecordDetailModalWithState(recordId, {
        imageResultId,
        showRoi: currentShowRoi,
      });
    },
  });
}

function openRecordResultImageViewer(recordId = ui.activeRecordId, imageResultId = "", focusedSubId = "") {
  const record = state.detectionRecords.find((item) => item.id === recordId);
  if (!record) return;
  const imageResults = getRecordImageResults(record);
  const activeImageResult = imageResults.find((item) => item.id === imageResultId) || imageResults[0] || null;
  if (!activeImageResult) return;
  ui.activeRecordId = recordId;
  ui.recordImageViewer = {
    recordId,
    imageResultId: activeImageResult.id,
    activeSubId: focusedSubId || "",
    showRoi: true,
    showOverlay: true,
  };
  openSharedModal({
    title: `${record.id} · ${activeImageResult.acquireName || "图像结果"}`,
    panelClass: "modal-record-result",
    body: renderRecordResultImageViewer(record, activeImageResult.id, focusedSubId),
    onOpen() {
      bindRecordResultViewer(recordId);
    },
    confirmText: "关闭",
    hideCancel: true,
    onConfirm() {
      closeSharedModal();
      return true;
    },
  });
}

function getRecordViewerTool() {
  const record = getActiveRecord();
  return state.tools.find((tool) => tool.id === record?.toolId) || getActiveTool();
}

function openRecordExportModal() {
  const rows = getFilteredRecords();
  if (!rows.length) {
    showToast("当前没有可导出的记录。");
    return;
  }
  const availability = getRecordExportAvailability(rows);
  const exportFileName = `检测记录导出_${formatExportFileTimestamp(state.meta.now)}.zip`;

  openSharedModal({
    title: "导出记录",
    panelClass: "modal-lg",
    body: `
      <p class="record-export-note">将导出当前筛选范围内的记录。</p>
      <section class="record-export-section">
        <div class="section-head section-head-tight">
          <div><h4>检测记录</h4></div>
        </div>
        <div class="selection-list selection-list-inline">
          ${renderRecordExportOption({
            id: "exportRecordExcel",
            title: "检测记录.xlsx",
            checked: true,
          })}
        </div>
      </section>
      <section class="record-export-section">
        <div class="section-head section-head-tight">
          <div><h4>图像</h4></div>
        </div>
        <div class="selection-list selection-list-inline">
          ${renderRecordExportOption({
            id: "exportImageOriginal",
            title: "原图",
            checked: true,
          })}
          ${renderRecordExportOption({
            id: "exportImageSub",
            title: "分区图",
            desc: availability.subImageEnabled ? "" : "当前筛选记录不包含处理结果采样或完整检测",
            disabled: !availability.subImageEnabled,
          })}
          ${renderRecordExportOption({
            id: "exportImageRendered",
            title: "结果标注图",
            desc: availability.renderedEnabled ? "" : "当前筛选记录不包含完整检测",
            disabled: !availability.renderedEnabled,
          })}
        </div>
      </section>
    `,
    confirmText: "开始导出",
    onConfirm() {
      const selection = getRecordExportSelection();
      if (!selection.length) {
        showToast("请至少选择一种导出内容");
        return false;
      }
      const labels = selection.map((item) => item.title).join("、");
      closeSharedModal();
      showToast(`导出成功`);
      return true;
    },
  });
}

function getRecordNgCount(record) {
  if (!record) return 0;
  if (Number.isFinite(record.ngCount)) return record.ngCount;
  return getRecordImageResults(record).reduce(
    (count, imageResult) => count + (Array.isArray(imageResult.subResults) ? imageResult.subResults.filter((item) => item.businessResult === "NG").length : 0),
    0,
  );
}

function getRecordExportAvailability(rows) {
  const normalizedModes = rows.map((record) => Demo.normalizeRunMode(record?.runMode || "detect"));
  const hasProcess = normalizedModes.includes("process");
  const hasDetect = normalizedModes.includes("detect");
  return {
    subImageEnabled: hasProcess || hasDetect,
    renderedEnabled: hasDetect,
  };
}

function formatExportFileTimestamp(value) {
  const date = new Date(value || state.meta.now || Date.now());
  if (Number.isNaN(date.getTime())) return "00000000_000000";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function renderRecordExportOption({ id, title, desc = "", checked = false, disabled = false }) {
  return `
    <label class="selection-item selection-item-compact" for="${id}">
      <div class="selection-item-copy">
        <strong>${escapeHtml(title)}</strong>
        ${desc ? `<p>${escapeHtml(desc)}</p>` : ""}
      </div>
      <input class="selection-item-check" id="${id}" type="checkbox" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
    </label>
  `;
}

function getRecordExportSelection() {
  const options = [
    { id: "exportRecordExcel", title: "检测记录.xlsx" },
    { id: "exportImageOriginal", title: "图像 / 原图" },
    { id: "exportImageSub", title: "图像 / 分区图" },
    { id: "exportImageRendered", title: "图像 / 结果标注图" },
  ];
  return options.filter((item) => document.getElementById(item.id)?.checked);
}

function renderRecordResultImageViewer(
  record,
  imageResultId = ui.recordImageViewer?.imageResultId || "",
  focusedSubId = ui.recordImageViewer?.activeSubId || "",
) {
  const imageResults = getRecordImageResults(record);
  const activeImageResult = imageResults.find((item) => item.id === imageResultId) || imageResults[0] || null;
  const subResults = Array.isArray(activeImageResult?.subResults) ? activeImageResult.subResults : [];
  const activeSubId = focusedSubId || "";
  const activeItem = subResults.find((item) => item.id === activeSubId) || null;
  const showRoi = true;
  const showOverlay = true;

  return `
    <div class="record-image-viewer record-image-viewer-split" id="recordResultViewer">
      <div class="record-result-layout">
        <section class="record-detail-section record-result-main-panel">
          <div class="record-result-main-toolbar">
            <div class="record-result-toolbar-group">
              ${activeItem ? `<button class="table-btn table-btn-primary" data-action="show-source" type="button">返回原图</button>` : ""}
            </div>
          </div>
          ${renderRecordResultMainViewport(activeImageResult, activeItem, {
            showRoi,
            showOverlay,
          })}
        </section>
        <aside class="record-detail-section record-result-side-panel">
          <div class="record-result-side-head">
            <h4>子结果图像</h4>
          </div>
          <div class="record-thumb-list">
            ${
              subResults.length
                ? subResults.map((item, index) => renderRecordResultThumb(item, index, item.id === activeSubId)).join("")
                : `<div class="builder-empty builder-empty-compact">当前暂无分区结果</div>`
            }
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderRecordResultMainViewport(imageResult, activeItem, options = {}) {
  if (!imageResult) {
    return `<div class="inspection-stage runtime-image-stage runtime-image-stage-empty"><div class="builder-empty">暂无图像结果</div></div>`;
  }
  if (!activeItem) {
    return renderRecordImageSourceStage(imageResult, { showRoi: options.showRoi !== false });
  }

  const subResults = Array.isArray(imageResult.subResults) ? imageResult.subResults : [];
  const activeIndex = subResults.findIndex((item) => item.id === activeItem.id);
  return `
    <div
      class="inspection-stage inspection-stage-compact record-sub-stage record-result-main-stage"
      style="${escapeAttribute(getRecordSubStageStyle(activeIndex, "main"))}"
    >
      <div class="record-sub-image-grid"></div>
      ${options.showOverlay === false ? "" : `<div class="record-overlay-layer">${renderVectorOverlay(activeItem, activeIndex, { showLabel: true })}</div>`}
    </div>
  `;
}

function renderRecordImageSourceStage(imageResult, options = {}) {
  const subResults = Array.isArray(imageResult.subResults) ? imageResult.subResults : [];
  const sourceUrl = getImageResultSourceUrl(imageResult, getActiveRecord()?.toolId || "");
  const aspectRatio = getRuntimeImageAspectRatio(imageResult, getActiveRecord()?.toolId || "");
  const sourceStyle = [
    `--runtime-source-aspect:${aspectRatio};`,
    sourceUrl ? `--runtime-source-image:url("${escapeAttribute(sourceUrl)}");` : "",
  ].join("");
  return `
    <div class="inspection-stage runtime-image-stage runtime-source-stage record-result-main-stage">
      <div class="runtime-source-stage-shell">
        <div class="runtime-source-canvas ${sourceUrl ? "has-source" : "is-fallback"}" style="${escapeAttribute(sourceStyle)}">
          <div class="runtime-source-grid"></div>
          ${
            options.showRoi === false
              ? ""
              : `<div class="runtime-mapped-layer">${subResults.map((item, index) => renderRecordFocusableMappedResult(item, index)).join("")}</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderRecordFocusableMappedResult(item, index) {
  const style = getRuntimeMappedRegionStyle(item, index);
  const fullImage = isFullImageRegion(item?.regionBox);
  const toneClass = getResultToneModifier(getSubResultBusinessResult(item));
  const resultText = getSubResultBusinessResult(item);
  const showResultBadge = resultText !== "-";
  if (fullImage) {
    return `
      <div
        class="runtime-mapped-result record-roi-button ${toneClass} is-full-image"
        style="${escapeAttribute(style)}"
      >
        ${showResultBadge ? `<span class="runtime-mapped-result-badge ${toneClass}">${escapeHtml(resultText)}</span>` : ""}
        <div class="runtime-mapped-inner">
          ${renderRecordFullImageOverlay(item)}
        </div>
      </div>
    `;
  }
  return `
    <button
      class="runtime-mapped-result record-roi-button ${toneClass} ${fullImage ? "is-full-image" : "is-roi-only"}"
      style="${escapeAttribute(style)}"
      data-action="focus-record-subresult"
      data-sub-id="${item.id}"
      type="button"
      title="查看对应分区结果"
      aria-label="查看对应分区结果"
    >
      <span class="runtime-mapped-index">检测区域${index + 1}</span>
      ${showResultBadge ? `<span class="runtime-mapped-result-badge ${toneClass}">${escapeHtml(resultText)}</span>` : ""}
    </button>
  `;
}

function renderRecordFullImageOverlay(item) {
  const detectResults = getSubResultDetectResults(item);
  if (!detectResults.length) return "";
  return detectResults
    .map(
      (detectResult, detectIndex) => `
        <div class="record-vector-tag ${getResultToneModifier(detectResult.businessResult)}" style="top:${18 + detectIndex * 38}px;">
          ${escapeHtml(buildDetectResultSummary(detectResult, detectIndex))}
        </div>
      `,
    )
    .join("");
}

function renderRecordResultThumb(item, index, active) {
  const displayName = getRuntimeSubResultDisplayName(item, index, getRecordViewerTool());
  return `
    <button
      class="record-thumb-item ${active ? "is-active" : ""}"
      data-action="focus-subresult"
      data-sub-id="${item.id}"
      type="button"
      title="${escapeAttribute(displayName)}"
      aria-label="查看${escapeAttribute(displayName)}"
    >
      <div
        class="inspection-stage inspection-stage-compact record-sub-stage record-thumb-stage"
        style="${escapeAttribute(getRecordSubStageStyle(index, "thumb"))}"
      >
        <div class="record-sub-image-grid"></div>
        <div class="record-overlay-layer record-thumb-overlay">${renderVectorOverlay(item, index, { showLabel: false })}</div>
        <span class="record-thumb-index">${index + 1}</span>
      </div>
    </button>
  `;
}

function bindRecordResultViewer(recordId) {
  const root = document.getElementById("recordResultViewer");
  if (!root) return;

  const rerender = () => {
    const record = state.detectionRecords.find((item) => item.id === recordId);
    if (!record) return;
    const activeImageResult = getRecordImageResults(record).find((item) => item.id === ui.recordImageViewer?.imageResultId) || getRecordImageResults(record)[0];
    els.sharedModalTitle.textContent = `${record.id} · ${activeImageResult?.acquireName || "图像结果"}`;
    els.sharedModalBody.innerHTML = renderRecordResultImageViewer(record);
    bindRecordResultViewer(recordId);
  };

  const focusSubResult = (subId) => {
    ui.recordImageViewer.activeSubId = subId || "";
    ui.recordImageViewer.showOverlay = true;
    rerender();
  };

  root.querySelectorAll("[data-action='focus-subresult']").forEach((button) => {
    button.addEventListener("click", () => {
      focusSubResult(button.dataset.subId);
    });
  });

  root.querySelectorAll("[data-action='focus-record-subresult']").forEach((button) => {
    button.addEventListener("click", () => {
      focusSubResult(button.dataset.subId);
    });
  });

  root.querySelectorAll("[data-action='show-source']").forEach((button) => {
    button.addEventListener("click", () => {
      ui.recordImageViewer.activeSubId = "";
      rerender();
    });
  });
}

function getRecordSubStageStyle(index, mode) {
  const preset = getRecordRoiPreset(index);
  const backgroundSize = mode === "main" ? "188% 188%" : "172% 172%";
  return `--record-background-size:${backgroundSize};--record-background-position:${preset.focusX} ${preset.focusY};`;
}

function getRecordRoiPreset(index) {
  const presets = [
    {
      left: "10%",
      top: "17%",
      width: "23%",
      height: "34%",
      focusX: "14%",
      focusY: "22%",
      vectorLeft: "19%",
      vectorTop: "26%",
      vectorWidth: "54%",
      vectorHeight: "34%",
    },
    {
      left: "41%",
      top: "21%",
      width: "22%",
      height: "30%",
      focusX: "50%",
      focusY: "25%",
      vectorLeft: "21%",
      vectorTop: "20%",
      vectorWidth: "56%",
      vectorHeight: "40%",
    },
    {
      left: "68%",
      top: "28%",
      width: "17%",
      height: "26%",
      focusX: "76%",
      focusY: "34%",
      vectorLeft: "24%",
      vectorTop: "24%",
      vectorWidth: "48%",
      vectorHeight: "36%",
    },
    {
      left: "24%",
      top: "58%",
      width: "22%",
      height: "20%",
      focusX: "28%",
      focusY: "74%",
      vectorLeft: "18%",
      vectorTop: "24%",
      vectorWidth: "58%",
      vectorHeight: "34%",
    },
  ];
  return presets[index % presets.length];
}

function renderRecordRoiBoxes(record) {
  return record.subResults
    .map((item, index) => {
      const preset = getRecordRoiPreset(index);
      const toneClass = getResultToneModifier(item.businessResult);
      return `
        <button
          class="record-roi-box ${toneClass}"
          style="left:${preset.left};top:${preset.top};width:${preset.width};height:${preset.height};"
          data-action="focus-roi"
          data-sub-id="${item.id}"
          type="button"
          title="双击查看对应子结果"
          aria-label="双击查看${escapeAttribute(item.name)}"
        >
          <span>${index + 1}</span>
        </button>
      `;
    })
    .join("");
}

function renderVectorOverlay(item, index, options = {}) {
  const detectResults = getSubResultDetectResults(item);
  if (detectResults.length) {
    return detectResults.map((detectResult, detectIndex) => renderSingleVectorOverlay(detectResult, detectIndex, options)).join("");
  }
  return renderSingleVectorOverlay(item, index, options);
}

function renderSingleVectorOverlay(item, index, options = {}) {
  const preset = getRecordRoiPreset(index);
  const rawLabel = getOverlayDisplayLabel(item);
  const label = escapeHtml(rawLabel);
  const showLabelTag = options.showLabel !== false && rawLabel !== "-";
  const toneClass = getResultToneModifier(item.businessResult);
  if (isDimensionModelResult(item)) {
    return renderMeasurementOverlay(label, getRecordMeasurementShellStyle(index), {
      tone: getResultTone(item.businessResult),
      showLabel: showLabelTag,
    });
  }
  return `
    <div
      class="record-vector-box ${toneClass}"
      style="left:${preset.vectorLeft};top:${preset.vectorTop};width:${preset.vectorWidth};height:${preset.vectorHeight};"
    ></div>
    ${showLabelTag ? `<div class="record-vector-tag ${toneClass}">${label}</div>` : ""}
  `;
}

function openExportModal(type) {
  const scopeOptions = getExportScopeOptions(type);
  const contentOptions = getExportContentOptions(type);
  openSharedModal({
    title: "导出设置",
    body: `
      <p class="banner banner-neutral">导出完成后将直接触发浏览器下载。</p>
      <label class="field">
        <span>导出范围</span>
        <select id="exportScopeSelect">
          ${scopeOptions.map((item) => `<option value="${item.value}">${escapeHtml(item.label)}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>导出内容</span>
        <select id="exportContentSelect">
          ${contentOptions.map((item) => `<option value="${item.value}">${escapeHtml(item.label)}</option>`).join("")}
        </select>
      </label>
    `,
    confirmText: "开始导出",
    onConfirm() {
      const scope = document.getElementById("exportScopeSelect").value;
      const content = document.getElementById("exportContentSelect").value;
      closeSharedModal();
      showToast("导出成功");
      return true;
    },
  });
}

function confirmUnbindClient() {
  const client = Demo.getRuntimeClient(state);
  if (!client || !client.bound) {
    showToast("当前客户端尚未绑定");
    return;
  }
  if (!state.runtimeDevice.networkOnline) {
    showToast("请联网后再解绑当前设备");
    return;
  }
  openSharedModal({
    title: "解绑当前设备",
    body: `<p class="banner banner-danger">解绑后当前设备将退出可用状态，需重新登录并重新绑定后才能继续使用。是否确认解绑？</p>`,
    confirmText: "确认解绑",
    confirmClass: "danger-btn",
    onConfirm() {
      Demo.advanceDemoClock(state, 1);
      state.clients = state.clients.filter((item) => item.id !== client.id);
      state.session.loggedIn = false;
      state.session.clientId = null;
      state.session.account = "";
      state.session.lastMessage = "";
      closeSharedModal();
      persistState("解绑成功");
      return true;
    },
  });
}

function saveStorageThresholds() {
  const warning = Number(els.warningThresholdInput.value);
  const block = Number(els.blockThresholdInput.value);
  if (Number.isNaN(warning) || Number.isNaN(block)) {
    els.thresholdMessage.hidden = false;
    els.thresholdMessage.textContent = "请输入有效的阈值数字。";
    return;
  }
  if (block < 10) {
    els.thresholdMessage.hidden = false;
    els.thresholdMessage.textContent = "阻断阈值不得小于 10GB。";
    return;
  }
  if (warning <= block) {
    els.thresholdMessage.hidden = false;
    els.thresholdMessage.textContent = "提醒阈值必须大于阻断阈值。";
    return;
  }
  els.thresholdMessage.hidden = true;
  els.thresholdMessage.textContent = "";
  Demo.advanceDemoClock(state, 1);
  state.storage.warningGb = warning;
  state.storage.blockGb = block;
  checkRunningOperationGuard();
  persistState(`阈值设置已更新：提醒 ${warning}GB / 阻断 ${block}GB`);
}

function confirmCleanup(type) {
  const meta = getCleanupMeta(type);
  if (!meta) return;
  const defaultMode = getDefaultCleanupMode(type);
  const defaultRange = getDefaultCleanupCustomRange();

  openSharedModal({
    title: meta.title,
    panelClass: "modal-lg",
    body: `
      <p class="banner banner-danger">${escapeHtml(meta.warningText)}</p>
      <label class="field">
        <span>清理时间</span>
        <select id="cleanupCutoffSelect">
          ${CLEANUP_CUTOFF_OPTIONS.map((option) => `<option value="${option.value}" ${option.value === defaultMode ? "selected" : ""}>${option.label}</option>`).join("")}
        </select>
      </label>
      <div class="form-grid double-column cleanup-custom-range" id="cleanupCustomRangeField" hidden>
        <label class="field">
          <span>开始时间</span>
          <input id="cleanupCustomStartInput" type="datetime-local" value="${escapeAttribute(defaultRange.start)}" max="${escapeAttribute(defaultRange.max)}" />
        </label>
        <label class="field">
          <span>结束时间</span>
          <input id="cleanupCustomEndInput" type="datetime-local" value="${escapeAttribute(defaultRange.end)}" max="${escapeAttribute(defaultRange.max)}" />
        </label>
      </div>
      <div id="cleanupPreviewCard"></div>
    `,
    confirmText: "下一步",
    onOpen() {
      const cutoffSelect = document.getElementById("cleanupCutoffSelect");
      const customField = document.getElementById("cleanupCustomRangeField");
      const customStartInput = document.getElementById("cleanupCustomStartInput");
      const customEndInput = document.getElementById("cleanupCustomEndInput");
      const previewCard = document.getElementById("cleanupPreviewCard");

      const updatePreview = () => {
        customField.hidden = cutoffSelect.value !== "custom";
        customStartInput.disabled = cutoffSelect.value !== "custom";
        customEndInput.disabled = cutoffSelect.value !== "custom";
        const plan = getCleanupPlan(type, {
          mode: cutoffSelect.value,
          customStartValue: customStartInput.value,
          customEndValue: customEndInput.value,
        });
        previewCard.innerHTML = renderCleanupPreview(plan);
        els.sharedModalConfirm.disabled = !plan?.valid || !plan.matchCount;
      };
      cutoffSelect.addEventListener("change", updatePreview);
      customStartInput.addEventListener("input", updatePreview);
      customEndInput.addEventListener("input", updatePreview);
      updatePreview();
    },
    onConfirm() {
      const cutoffSelect = document.getElementById("cleanupCutoffSelect");
      const customStartInput = document.getElementById("cleanupCustomStartInput");
      const customEndInput = document.getElementById("cleanupCustomEndInput");
      const plan = getCleanupPlan(type, {
        mode: cutoffSelect?.value || defaultMode,
        customStartValue: customStartInput?.value || "",
        customEndValue: customEndInput?.value || "",
      });
      if (!plan?.valid) {
        showToast(plan?.invalidReason || "请选择有效的清理时间");
        return false;
      }
      if (!plan?.matchCount) {
        showToast("当前所选时间条件下没有可清理数据");
        return false;
      }
      closeSharedModal();
      openCleanupConfirmModal(plan);
      return true;
    },
  });
}

function openCleanupConfirmModal(plan) {
  openSharedModal({
    title: `确认${plan.meta.title}`,
    panelClass: "modal-lg",
    body: renderCleanupPreview(plan),
    confirmText: "确认清理",
    confirmClass: "danger-btn",
    onConfirm() {
      const latestPlan = getCleanupPlan(plan.type, {
        mode: plan.cutoffMode,
        customStartValue: plan.customStartValue,
        customEndValue: plan.customEndValue,
      });
      if (!latestPlan?.valid) {
        closeSharedModal();
        showToast(latestPlan?.invalidReason || "当前清理时间无效");
        return false;
      }
      if (!latestPlan?.matchCount) {
        closeSharedModal();
        showToast("当前所选时间条件下已无可清理数据");
        return false;
      }
      closeSharedModal();
      applyCleanupPlan(latestPlan);
      return true;
    },
  });
}

function applyCleanupPlan(plan) {
  Demo.advanceDemoClock(state, 1);
  const released = plan.releasedGb;
  if (plan.type === "detectImages") {
    state.detectionRecords = state.detectionRecords.filter((record) => !plan.itemIds.includes(record.id));
    state.storage.usage.detectImages = Demo.roundGb(Math.max(0, state.storage.usage.detectImages - released));
  }
  if (plan.type === "captureImages") {
    state.captureRecords = state.captureRecords.filter((record) => !plan.itemIds.includes(record.id));
    state.storage.usage.captureImages = Demo.roundGb(Math.max(0, state.storage.usage.captureImages - released));
  }
  state.storage.remainingGb = Demo.roundGb(state.storage.remainingGb + released);
  persistState(`${plan.meta.title}已完成，清理 ${plan.matchCount} 项，释放 ${released.toFixed(1)} GB`);
}

function mutateStorage(delta) {
  Demo.advanceDemoClock(state, 1);
  state.storage.remainingGb = Demo.roundGb(Math.max(1, state.storage.remainingGb + delta));
  checkRunningOperationGuard();
  persistState(delta > 0 ? `已模拟释放 ${delta} GB 空间` : `已模拟写入 ${Math.abs(delta)} GB 数据`);
}

function getCleanupMeta(type) {
  return {
    detectImages: {
      type,
      title: "清理检测记录",
      usageKey: "detectImages",
      itemLabel: "条检测记录及关联图片",
      warningText: "清理前请先备份数据。确认后将删除本次选定范围内的检测记录及关联图片，操作无法撤回。",
    },
    captureImages: {
      type,
      title: "清理采图记录",
      usageKey: "captureImages",
      itemLabel: "条采图记录及关联图片",
      warningText: "清理前请先备份数据。确认后将删除本次选定范围内的采图记录及关联图片，操作无法撤回。",
    },
  }[type] || null;
}

function getCleanupEntries(type) {
  if (type === "detectImages") {
    return state.detectionRecords
      .map((record) => ({
        id: record.id,
        time: record.triggeredAt,
      }));
  }
  if (type === "captureImages") {
    return state.captureRecords
      .map((record) => ({
        id: record.id,
        time: record.startedAt,
      }));
  }
  return [];
}

function getCleanupPlan(type, selection = {}) {
  const meta = getCleanupMeta(type);
  if (!meta) return null;

  const eligibleItems = getCleanupEntries(type);
  const timeSelection = resolveCleanupSelection(selection);
  if (!timeSelection.valid) {
    return {
      type,
      meta,
      valid: false,
      invalidReason: timeSelection.invalidReason,
      cutoffMode: timeSelection.mode,
      customStartValue: timeSelection.customStartValue,
      customEndValue: timeSelection.customEndValue,
      cutoffLabel: timeSelection.label,
      selectionKind: timeSelection.selectionKind,
      itemIds: [],
      totalCount: eligibleItems.length,
      matchCount: 0,
      actualFrom: null,
      actualTo: null,
      releasedGb: 0,
    };
  }

  const matchedItems = eligibleItems
    .filter((item) => {
      const itemTime = new Date(item.time).getTime();
      if (!Number.isFinite(itemTime)) return false;
      if (timeSelection.selectionKind === "range") {
        return itemTime >= timeSelection.rangeStartMs && itemTime <= timeSelection.rangeEndMs;
      }
      return itemTime <= timeSelection.cutoffMs;
    })
    .sort((left, right) => new Date(left.time).getTime() - new Date(right.time).getTime());

  const releasedGb = estimateCleanupRelease(meta, matchedItems.length, eligibleItems.length);

  return {
    type,
    meta,
    valid: true,
    cutoffMode: timeSelection.mode,
    customStartValue: timeSelection.customStartValue,
    customEndValue: timeSelection.customEndValue,
    cutoffIso: timeSelection.cutoffIso,
    cutoffLabel: timeSelection.label,
    selectionKind: timeSelection.selectionKind,
    itemIds: matchedItems.map((item) => item.id),
    totalCount: eligibleItems.length,
    matchCount: matchedItems.length,
    actualFrom: matchedItems[0]?.time || null,
    actualTo: matchedItems[matchedItems.length - 1]?.time || null,
    releasedGb,
  };
}

function estimateCleanupRelease(meta, matchCount, totalCount) {
  if (!meta || !matchCount || !totalCount) return 0;
  const usage = Number(state.storage.usage[meta.usageKey] || 0);
  return Demo.roundGb(Math.min(usage, usage * (matchCount / totalCount)));
}

function renderCleanupPreview(plan) {
  if (!plan) return "";
  if (!plan.valid) {
    return `<p class="banner banner-warning">${escapeHtml(plan.invalidReason || "请选择有效的清理时间")}</p>`;
  }
  const hasMatches = plan.matchCount > 0;
  const impactText = hasMatches ? `${plan.matchCount} ${plan.meta.itemLabel}` : "0 项";
  const selectionLabel = plan.selectionKind === "range" ? "清理时间范围" : "清理时间点";
  const selectionText = plan.selectionKind === "range" ? plan.cutoffLabel : `${plan.cutoffLabel}之前`;

  return `
    <div class="cleanup-preview-card">
      <div class="meta-list cleanup-preview-meta">
        <span>清理对象</span>
        <span>${escapeHtml(plan.meta.title)}</span>
        <span>${selectionLabel}</span>
        <span>${escapeHtml(selectionText)}</span>
        <span>影响数据</span>
        <span>${escapeHtml(impactText)}</span>
      </div>
    </div>
  `;
}

function resolveCleanupSelection(selection = {}) {
  const mode = selection.mode || "3m";
  const customStartValue = selection.customStartValue || "";
  const customEndValue = selection.customEndValue || "";
  const systemNow = getCurrentCleanupSystemTime();
  const nowMs = systemNow.getTime();

  if (mode === "custom") {
    if (!customStartValue || !customEndValue) {
      return {
        valid: false,
        invalidReason: "请选择完整的自定义时间范围",
        mode,
        customStartValue,
        customEndValue,
        selectionKind: "range",
        label: "自定义时间范围",
      };
    }
    const rangeStartMs = parseDateTimeLocalToMs(customStartValue);
    const rangeEndMs = parseDateTimeLocalToMs(customEndValue);
    if (!Number.isFinite(rangeStartMs) || !Number.isFinite(rangeEndMs)) {
      return {
        valid: false,
        invalidReason: "自定义时间范围格式无效",
        mode,
        customStartValue,
        customEndValue,
        selectionKind: "range",
        label: "自定义时间范围",
      };
    }
    if (rangeStartMs > rangeEndMs) {
      return {
        valid: false,
        invalidReason: "开始时间不能晚于结束时间",
        mode,
        customStartValue,
        customEndValue,
        selectionKind: "range",
        label: "自定义时间范围",
      };
    }
    if (rangeEndMs > nowMs) {
      return {
        valid: false,
        invalidReason: "结束时间不得晚于当前系统时间",
        mode,
        customStartValue,
        customEndValue,
        selectionKind: "range",
        label: "自定义时间范围",
      };
    }
    const rangeStartIso = new Date(rangeStartMs).toISOString();
    const rangeEndIso = new Date(rangeEndMs).toISOString();
    return {
      valid: true,
      mode,
      customStartValue,
      customEndValue,
      selectionKind: "range",
      rangeStartMs,
      rangeEndMs,
      rangeStartIso,
      rangeEndIso,
      label: `${Demo.formatDateTime(rangeStartIso)} 至 ${Demo.formatDateTime(rangeEndIso)}`,
    };
  }

  const option = CLEANUP_CUTOFF_OPTIONS.find((item) => item.value === mode) || CLEANUP_CUTOFF_OPTIONS[2];
  const cutoffDate = getRelativeCleanupCutoffDate(option.value, systemNow);
  const cutoffMs = cutoffDate.getTime();
  const cutoffIso = cutoffDate.toISOString();
  return {
    valid: true,
    mode: option.value,
    customStartValue,
    customEndValue,
    selectionKind: "before",
    cutoffMs,
    cutoffIso,
    label: `${option.label}（${Demo.formatDateTime(cutoffIso)}）`,
  };
}

function getRelativeCleanupCutoffDate(mode, baseDate) {
  const next = new Date(baseDate);
  if (mode === "1y") {
    next.setFullYear(next.getFullYear() - 1);
    return next;
  }
  if (mode === "6m") {
    next.setMonth(next.getMonth() - 6);
    return next;
  }
  if (mode === "1m") {
    next.setMonth(next.getMonth() - 1);
    return next;
  }
  next.setMonth(next.getMonth() - 3);
  return next;
}

function getDefaultCleanupCustomRange() {
  const endDate = getCurrentCleanupSystemTime();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 1);
  const max = formatDateTimeLocalInput(endDate);
  return {
    start: formatDateTimeLocalInput(startDate),
    end: max,
    max,
  };
}

function getCurrentCleanupSystemTime() {
  return new Date();
}

function formatDateTimeLocalInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateTimeLocalToMs(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] || "0");
  const parsed = new Date(year, month, day, hour, minute, second, 0);
  return parsed.getTime();
}

function getDefaultCleanupMode(type) {
  return "3m";
}

function checkRunningOperationGuard() {
  if (Demo.isStorageBlocked(state)) {
    if (ui.pendingDownload) abortModelDownload("剩余空间不足，模型下载已中断。");
    if (ui.pendingDetectionToolId) abortDetectionRun("剩余空间不足，当前任务已中断。");
  }
  if (!state.runtimeDevice.networkOnline && ui.pendingDownload) {
    abortModelDownload("客户端离线，云端模型下载已中断");
  }
}

function toggleNetworkState() {
  state.runtimeDevice.networkOnline = !state.runtimeDevice.networkOnline;
  const client = Demo.getRuntimeClient(state);
  if (state.runtimeDevice.networkOnline) {
    Demo.advanceDemoClock(state, 1);
    if (client?.bound) {
      client.lastLoginAt = state.meta.now;
      client.lastHeartbeatAt = state.meta.now;
      client.offlineAt = null;
      state.session.lastMessage = "客户端已恢复在线，可继续访问云端能力。";
    }
  } else {
    Demo.advanceDemoClock(state, 12);
    if (client?.bound) {
      client.offlineAt = state.meta.now;
      state.session.lastMessage = "客户端已切换为离线状态，首次绑定和云端模型能力暂不可用。";
    }
  }
  checkRunningOperationGuard();
  persistState(state.runtimeDevice.networkOnline ? "已切换为在线状态" : "已切换为离线状态");
}

function submitLogin() {
  const clientName = els.loginClientName.value.trim();
  const account = els.loginAccount.value.trim();
  const password = els.loginPassword.value.trim();
  const errors = {};
  if (!clientName) errors.clientName = "请输入设备名称";
  if (!account) {
    errors.account = "请输入正确的手机号码";
  } else if (!/^1\d{10}$/.test(account)) {
    errors.account = "请输入正确的手机号码";
  }
  if (!password) errors.password = "登录密码不能为空";
  if (Object.keys(errors).length) {
    showLoginFieldErrors(errors);
    return;
  }
  clearLoginErrors();
  if (!state.runtimeDevice.networkOnline) {
    return showLoginError("当前网络异常，暂时无法登录，请检查网络后重试。");
  }
  if (account !== state.enterprise.account || password !== state.enterprise.password) {
    showLoginFieldErrors({ password: "密码错误" });
    return;
  }

  Demo.advanceDemoClock(state, 1);
  let client = Demo.getRuntimeClient(state);
  state.runtimeDevice.name = clientName;

  const quotaFull = Demo.getQuotaUsage(state) >= state.enterprise.quota;
  if (!client && quotaFull) {
    state.session.lastMessage = "当前账号可用设备数已满，请联系销售。";
    Demo.saveState(state);
    renderAll();
    return showLoginError("当前账号可用设备数已满，请联系销售。");
  }

  if (!client) {
    client = {
      id: Demo.makeId("client"),
      name: clientName,
      enterpriseAccount: account,
      hardwareCode: state.runtimeDevice.hardwareCode,
      bound: true,
      boundAt: state.meta.now,
      lastLoginAt: state.meta.now,
      lastHeartbeatAt: state.meta.now,
      offlineAt: null,
      token: `token_${Demo.makeId("bind")}`,
    };
    state.clients.push(client);
  } else {
    client.bound = true;
    client.enterpriseAccount = account;
    client.name = clientName;
    client.boundAt = client.boundAt || state.meta.now;
    client.lastLoginAt = state.meta.now;
    client.lastHeartbeatAt = state.meta.now;
    client.offlineAt = null;
    client.token = `token_${Demo.makeId("bind")}`;
  }

  state.session.loggedIn = true;
  state.session.clientId = client.id;
  state.session.account = account;
  state.session.lastMessage = "登录成功，当前设备已绑定。";
  persistState("登录成功，当前设备已绑定。");
}

function showLoginError(message) {
  clearLoginErrors();
  els.loginError.hidden = false;
  els.loginError.textContent = message;
}

function openSharedModal(config) {
  ui.modalConfig = config;
  els.sharedModal.className = ["modal", config.panelClass].filter(Boolean).join(" ");
  els.sharedModalTitle.textContent = config.title || "提示";
  els.sharedModalBody.className = ["modal-body", config.bodyClass].filter(Boolean).join(" ");
  els.sharedModalBody.innerHTML = config.body || "";
  els.sharedModalConfirm.textContent = config.confirmText || "确认";
  els.sharedModalConfirm.className = config.confirmClass || "primary-btn";
  els.sharedModalConfirm.disabled = false;
  els.sharedModalCancel.hidden = Boolean(config.hideCancel);
  els.sharedModalConfirm.hidden = Boolean(config.hideConfirm);
  els.sharedModalFooter.hidden = Boolean(config.hideCancel) && Boolean(config.hideConfirm);
  els.closeSharedModal.onclick = closeSharedModal;
  els.sharedModalCancel.onclick = closeSharedModal;
  els.sharedModalConfirm.onclick = submitSharedModal;
  openPanel(els.sharedModal);
  if (typeof config.onOpen === "function") config.onOpen();
}

function submitSharedModal() {
  if (!ui.modalConfig?.onConfirm) {
    closeSharedModal();
    return;
  }
  ui.modalConfig.onConfirm();
}

function closeSharedModal() {
  ui.modalConfig = null;
  ui.recordImageViewer = null;
  els.sharedModal.className = "modal";
  els.sharedModalBody.className = "modal-body";
  els.sharedModalFooter.hidden = false;
  els.sharedModalConfirm.hidden = false;
  closePanel(els.sharedModal);
  if (ui.activePage === "detect-tools" && ui.toolView === "runtime") {
    renderToolRuntime();
  }
}

function openPanel(element) {
  element.hidden = false;
  updateOverlay();
}

function closePanel(element) {
  element.hidden = true;
  updateOverlay();
}

function closeAllPanels() {
  closePanel(els.sharedModal);
  closePanel(els.addCameraModal);
  closePanel(els.paramModal);
  closePanel(els.modelDrawer);
}

function updateOverlay() {
  const visible = [els.sharedModal, els.addCameraModal, els.paramModal, els.modelDrawer].some((element) => element && !element.hidden);
  els.modalBackdrop.hidden = !visible;
}

function hasUsableSession() {
  const client = Demo.getRuntimeClient(state);
  return Boolean(client?.bound);
}

function getActiveTool() {
  return state.tools.find((tool) => tool.id === ui.activeToolId) || null;
}

function getActiveRuntimeRecord() {
  const tool = getActiveTool();
  if (!tool) return null;
  return state.detectionRecords.find((record) => record.toolId === tool.id) || null;
}

function removeLatestRuntimeRecord(toolId) {
  const index = state.detectionRecords.findIndex((record) => record.toolId === toolId);
  if (index < 0) return null;
  const [removedRecord] = state.detectionRecords.splice(index, 1);
  if (ui.activeRecordId === removedRecord.id) {
    ui.activeRecordId = state.detectionRecords[0]?.id || null;
  }
  if (ui.runtimePlaybackRecordId === removedRecord.id) {
    ui.runtimePlaybackRecordId = null;
  }
  if (ui.recordImageViewer?.recordId === removedRecord.id) {
    ui.recordImageViewer = null;
  }
  return removedRecord;
}

function getRecordImageResults(record) {
  if (!record) return [];
  if (Array.isArray(record.imageResults) && record.imageResults.length) {
    return record.imageResults;
  }
  if (!Array.isArray(record.subResults) || !record.subResults.length) {
    return [];
  }
  const tool = state.tools.find((item) => item.id === record.toolId);
  const acquire = tool?.acquire?.[0] || null;
  return [
    {
      id: `${record.id}_img_1`,
      acquireId: acquire?.id || "",
      acquireName: acquire?.name || record.inputSource || "图像 1",
      imageLabel: acquire ? getAcquireSampleName(acquire) : record.inputSource || "图像 1",
      sourceImageUrl: getAcquireSampleUrl(acquire),
      sourceImageName: acquire ? getAcquireSampleName(acquire) : "",
      sourceImageWidth: Number(acquire?.sampleImageWidth || 0),
      sourceImageHeight: Number(acquire?.sampleImageHeight || 0),
      result: record.totalResult || record.businessResult || "-",
      subResults: record.subResults,
    },
  ];
}

function getActiveRecord() {
  return state.detectionRecords.find((record) => record.id === ui.activeRecordId) || null;
}

function getActiveCamera() {
  return state.cameras.find((camera) => camera.id === ui.activeCameraId) || null;
}

function getActiveParamGroup() {
  const camera = getActiveCamera();
  return camera?.paramGroups?.find((group) => group.id === ui.activeParamGroupId) || null;
}

function getFilteredCameras() {
  return state.cameras.filter((camera) => {
    const keyword = ui.cameraFilters.keyword.toLowerCase();
    const keywordMatch =
      !keyword ||
      [camera.name || "", camera.id, camera.vendor, camera.model, camera.serial].some((value) => value.toLowerCase().includes(keyword));
    const vendorMatch = ui.cameraFilters.vendor === "all" || camera.brand === ui.cameraFilters.vendor;
    return keywordMatch && vendorMatch;
  });
}

function getFilteredRecords() {
  return state.detectionRecords.filter((record) => {
    const toolMatch = ui.recordFilters.toolId === "all" || record.toolId === ui.recordFilters.toolId;
    const businessMatch = ui.recordFilters.business === "all" || (record.businessResult || record.totalResult) === ui.recordFilters.business;
    const keyword = ui.recordFilters.keyword.toLowerCase();
    const tagKeyword = getRuntimeRecordTags(record).join(" ").toLowerCase();
    const keywordMatch =
      !keyword ||
      record.id.toLowerCase().includes(keyword) ||
      record.toolName.toLowerCase().includes(keyword) ||
      tagKeyword.includes(keyword);
    const recordTime = new Date(record.triggeredAt).getTime();
    const startMs = ui.recordFilters.startAt ? new Date(ui.recordFilters.startAt).getTime() : null;
    const endMs = ui.recordFilters.endAt ? new Date(ui.recordFilters.endAt).getTime() : null;
    const startMatch = !Number.isFinite(startMs) || recordTime >= startMs;
    const endMatch = !Number.isFinite(endMs) || recordTime <= endMs;
    return toolMatch && businessMatch && keywordMatch && startMatch && endMatch;
  });
}

function getBuilderStepIndex(step) {
  return ["acquire", "process", "detect"].indexOf(step);
}

function canEnterBuilderStepForTool(tool, step) {
  if (!tool) return false;
  if (step === "acquire") return true;
  if (step === "process") return tool.acquire.length > 0;
  if (step === "detect") return tool.acquire.length > 0 && tool.process.length > 0;
  return false;
}

function canEnterBuilderStep(step) {
  return canEnterBuilderStepForTool(getActiveTool(), step);
}

function getRecommendedBuilderStep(tool, preferredStep = "acquire") {
  if (!tool) return "acquire";
  if (!tool.acquire.length) return "acquire";
  if (!tool.process.length) {
    return canEnterBuilderStepForTool(tool, preferredStep) && preferredStep !== "detect" ? preferredStep : "process";
  }
  if (!tool.detect.length) {
    return canEnterBuilderStepForTool(tool, preferredStep) ? preferredStep : "detect";
  }
  return canEnterBuilderStepForTool(tool, preferredStep) ? preferredStep : "detect";
}

function getRunModeMeta(mode) {
  return RUN_MODE_OPTIONS.find((item) => item.value === mode) || RUN_MODE_OPTIONS[2];
}

function getRunModeLabel(mode) {
  return getRunModeMeta(mode).label;
}

function getRunActionLabel(mode) {
  return Demo.normalizeRunMode(mode) === "detect" ? "检测" : "采图";
}

function getRunWaitingLabel(mode) {
  return Demo.normalizeRunMode(mode) === "detect" ? "等待开始检测" : "等待开始采图";
}

function isAcquireReady(acquire) {
  if (!acquire) return false;
  if (acquire.type === "api") return Boolean(String(acquire.endpoint || "").trim());
  const camera = state.cameras.find((item) => item.id === acquire.cameraId);
  if (!camera) return false;
  return camera.paramGroups.some((group) => group.id === acquire.paramGroupId);
}

function getToolInvalidAcquireCount(tool) {
  return Array.isArray(tool?.acquire) ? tool.acquire.filter((item) => !isAcquireReady(item)).length : 0;
}

function isProcessInputValid(tool, process) {
  const sourceTool = tool || getActiveTool();
  const input = sourceTool?.acquire?.find((item) => item.id === process?.inputId) || null;
  return isAcquireReady(input);
}

function getProcessCategoryOptions(process) {
  if (normalizeProcessMode(process?.mode) === "model-roi" && process?.modelId) {
    const modelCategories = getModelCategoriesById(process.modelId);
    if (modelCategories.length) return modelCategories;
  }
  return Demo.normalizeModelCategories(process);
}

function isProcessReady(process, tool = getActiveTool()) {
  if (!isProcessInputValid(tool, process)) return false;
  const mode = normalizeProcessMode(process?.mode);
  if (mode === "model-roi") return Boolean(process?.modelId) && getProcessCategoryOptions(process).length > 0;
  if (mode === "manual-roi") return getProcessRegions(process).some((item) => item.type !== "ignore");
  return true;
}

function getToolInvalidProcessCount(tool) {
  return Array.isArray(tool?.process) ? tool.process.filter((item) => !isProcessReady(item, tool)).length : 0;
}

function isDetectTargetValid(tool, target) {
  const process = tool?.process?.find((item) => item.id === target?.processId);
  if (!process) return false;
  if (!isProcessReady(process, tool)) return false;
  const mode = normalizeProcessMode(process.mode);
  if (mode !== "model-roi") return true;
  return Boolean(target?.categoryKey) && getProcessCategoryOptions(process).includes(target.categoryKey);
}

function getDetectTargets(detect) {
  if (Array.isArray(detect?.targets) && detect.targets.length) return detect.targets;
  return Array.isArray(detect?.processIds) ? detect.processIds.filter(Boolean).map((processId) => ({ processId, categoryKey: "", categoryLabel: "" })) : [];
}

function isDetectReady(tool, detect) {
  if (!detect?.modelId) return false;
  const targets = getDetectTargets(detect);
  if (!targets.length) return false;
  return targets.every((target) => isDetectTargetValid(tool, target));
}

function getToolInvalidDetectConfigCount(tool) {
  return Array.isArray(tool?.detect) ? tool.detect.filter((item) => !isDetectReady(tool, item)).length : 0;
}

function evaluateToolRunModeAvailability(tool, mode) {
  if (!tool) return false;
  if (mode === "acquire") {
    return Array.isArray(tool.acquire) && tool.acquire.some((item) => isAcquireReady(item));
  }
  if (mode === "process") {
    return Array.isArray(tool.acquire) && tool.acquire.some((item) => isAcquireReady(item)) && Array.isArray(tool.process) && tool.process.some((item) => isProcessReady(item, tool));
  }
  if (mode === "detect") {
    if (!Array.isArray(tool.acquire) || !tool.acquire.some((item) => isAcquireReady(item))) return false;
    if (!Array.isArray(tool.process) || !tool.process.some((item) => isProcessReady(item, tool))) return false;
    return tool.detect.some((detect) => isDetectReady(tool, detect));
  }
  return false;
}

function getToolAvailableRunModes(tool) {
  return RUN_MODE_OPTIONS.filter((item) => evaluateToolRunModeAvailability(tool, item.value));
}

function getHighestAvailableRunMode(tool) {
  if (evaluateToolRunModeAvailability(tool, "detect")) return "detect";
  if (evaluateToolRunModeAvailability(tool, "process")) return "process";
  if (evaluateToolRunModeAvailability(tool, "acquire")) return "acquire";
  return "detect";
}

function isToolSessionRunning(tool) {
  if (!tool?.runtime?.sessionActive) return false;
  return !["未运行", "未配置"].includes(String(tool.runtime.status || "").trim());
}

function endToolRunSessionState(tool) {
  const toolId = typeof tool === "string" ? tool : tool?.id;
  if (!toolId) return null;
  let nextTool = null;
  state.tools = state.tools.map((item) => {
    if (item.id !== toolId) return item;
    nextTool = {
      ...item,
      runtime: {
        ...(item.runtime && typeof item.runtime === "object" ? item.runtime : {}),
        sessionActive: false,
        status: "未运行",
        activeTags: [],
        draftTags: [],
      },
    };
    syncToolCompletionState(nextTool);
    return nextTool;
  });
  if (ui.pendingDetectionToolId === toolId) {
    ui.pendingDetectionToolId = null;
    ui.pendingDetectionStartedAt = 0;
  }
  clearRuntimeInitialState(toolId);
  return nextTool;
}

function syncToolCompletionState(tool) {
  if (!tool) return;
  if (!tool.runtime) {
    tool.runtime = {
      lastRunAt: null,
      status: "未配置",
      primaryResult: "-",
      cycleTime: "-",
      draftTags: [],
      activeTags: [],
      sessionActive: false,
      sessionMode: "detect",
    };
  }
  if (!Array.isArray(tool.runtime.draftTags)) tool.runtime.draftTags = [];
  if (!Array.isArray(tool.runtime.activeTags)) tool.runtime.activeTags = [];
  if (typeof tool.runtime.sessionActive !== "boolean") tool.runtime.sessionActive = false;
  tool.runtime.sessionMode = Demo.normalizeRunMode(tool.runtime.sessionMode || "detect");

  const hasAnyMode = RUN_MODE_OPTIONS.some((item) => evaluateToolRunModeAvailability(tool, item.value));
  if (!hasAnyMode) {
    tool.runtime.lastRunAt = null;
    tool.runtime.status = "未配置";
    tool.runtime.primaryResult = "-";
    tool.runtime.cycleTime = "-";
    tool.runtime.sessionActive = false;
    tool.runtime.sessionMode = "detect";
    if (ui.activeToolId === tool.id) {
      ui.builderStep = getRecommendedBuilderStep(tool, ui.builderStep);
    }
    return;
  }

  if (!tool.runtime.sessionActive) {
    tool.runtime.status = "未运行";
    tool.runtime.sessionMode = getHighestAvailableRunMode(tool);
  } else if (ui.pendingDetectionToolId !== tool.id && tool.runtime.status !== "已中断") {
    tool.runtime.status = "等待信号";
  }
  if (ui.activeToolId === tool.id) {
    ui.builderStep = getRecommendedBuilderStep(tool, ui.builderStep);
  }
}

function canMoveNextFromStep(step) {
  const tool = getActiveTool();
  if (!tool) return false;
  if (step === "acquire") return tool.acquire.length > 0;
  if (step === "process") return tool.process.length > 0;
  if (step === "detect") return tool.detect.length > 0 && getToolInvalidAcquireCount(tool) === 0 && getToolInvalidProcessCount(tool) === 0 && getToolInvalidDetectConfigCount(tool) === 0;
  return false;
}

function renderBuilderStepSection({ title, limitText, actionLabel, actionKey, items, emptyText, disabled = false }) {
  return `
    <div class="section-head">
      <div>
        <h3>${title}</h3>
      </div>
      <div class="section-head-actions">
        ${limitText ? `<span class="inline-metric">${escapeHtml(limitText)}</span>` : ""}
        <button class="primary-btn" data-action="${actionKey}" ${disabled ? "disabled" : ""}>${actionLabel}</button>
      </div>
    </div>
    <div class="builder-list">
      ${items.length ? items.join("") : `<div class="builder-empty">${emptyText}</div>`}
    </div>
  `;
}

function renderAcquireItem(tool, item) {
  const editingLocked = isToolEditingLocked(tool);
  const camera = state.cameras.find((cameraItem) => cameraItem.id === item.cameraId);
  const hasInvalidConfig = !isAcquireReady(item);
  const sourceText =
    item.type === "camera"
      ? `${Demo.getCameraLabel(camera)} / ${Demo.getParamGroupLabel(camera, item.paramGroupId)}`
      : item.endpoint;
  return `
    <article class="builder-item">
      <div class="builder-thumb builder-thumb-sample">
        ${renderSamplePreviewHtml(item.sampleImageUrl, getAcquireSampleName(item), true)}
      </div>
      <div class="builder-item-main">
        <div class="builder-item-title">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="chip">${item.type === "camera" ? "相机" : "接口"}</span>
        </div>
        <div class="builder-meta">
          <span>输入来源：${escapeHtml(sourceText || "-")}</span>
          <span>示例图像：${escapeHtml(getAcquireSampleName(item))}</span>
        </div>
      </div>
      <div class="builder-actions">
        ${hasInvalidConfig ? `<span class="config-error-mark" title="配置失效" aria-label="配置失效">!</span>` : ""}
        <button class="table-btn table-btn-primary" data-action="edit-acquire" data-id="${item.id}" ${editingLocked ? "disabled" : ""}>编辑</button>
        <button class="table-btn table-btn-danger" data-action="delete-acquire" data-id="${item.id}" ${editingLocked ? "disabled" : ""}>删除</button>
      </div>
    </article>
  `;
}

function renderProcessItem(tool, item) {
  const editingLocked = isToolEditingLocked(tool);
  const source = tool.acquire.find((acquire) => acquire.id === item.inputId);
  const mode = normalizeProcessMode(item.mode);
  const categoryText = getProcessCategoryOptions(item).join(" / ");
  const hasInvalidConfig = !isProcessReady(item, tool);
  return `
    <article class="builder-item">
      <div class="builder-item-main">
        <div class="builder-item-title">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="chip">${escapeHtml(getProcessModeLabel(mode))}</span>
        </div>
        <div class="builder-meta">
          <span>关联图像：${escapeHtml(source?.name || "-")}</span>
          ${
            mode === "manual-roi"
              ? `<span>${escapeHtml(getProcessRoiSummary(item))}</span>`
              : mode === "model-roi"
                ? `<span>模型：${escapeHtml(Demo.getModelLabel(state, item.modelId))}</span><span>识别类别：${escapeHtml(categoryText || "-")}</span>`
                : `<span>直接使用整张图片，不额外分区</span>`
          }
        </div>
      </div>
      <div class="builder-actions">
        ${hasInvalidConfig ? `<span class="config-error-mark" title="配置失效" aria-label="配置失效">!</span>` : ""}
        <button class="table-btn table-btn-primary" data-action="edit-process" data-id="${item.id}" ${editingLocked ? "disabled" : ""}>编辑</button>
        <button class="table-btn table-btn-danger" data-action="delete-process" data-id="${item.id}" ${editingLocked ? "disabled" : ""}>删除</button>
      </div>
    </article>
  `;
}

function renderDetectItem(tool, item) {
  const editingLocked = isToolEditingLocked(tool);
  const targetLabels = getDetectTargets(item).map((target) => getDetectTargetLabel(tool, target)).filter(Boolean);
  const hasInvalidTarget = !isDetectReady(tool, item);
  return `
    <article class="builder-item">
      <div class="builder-item-main">
        <div class="builder-item-title">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="chip">检测模型</span>
        </div>
        <div class="builder-meta">
          <span>关联处理结果图像：${escapeHtml(targetLabels.join(" / ") || "-")}</span>
          <span>检测模型：${escapeHtml(Demo.getModelLabel(state, item.modelId))}</span>
        </div>
      </div>
      <div class="builder-actions">
        ${hasInvalidTarget ? `<span class="config-error-mark" title="配置失效" aria-label="配置失效">!</span>` : ""}
        <button class="table-btn table-btn-primary" data-action="edit-detect" data-id="${item.id}" ${editingLocked ? "disabled" : ""}>编辑</button>
        <button class="table-btn table-btn-danger" data-action="delete-detect" data-id="${item.id}" ${editingLocked ? "disabled" : ""}>删除</button>
      </div>
    </article>
  `;
}

function getProcessModeLabel(mode) {
  if (mode === "manual-roi") return "手动划区";
  if (mode === "model-roi") return "自动分区";
  return "整图处理";
}

function getDetectTargetLabel(tool, target) {
  const process = tool?.process?.find((item) => item.id === target?.processId);
  if (!process) return "";
  const base = process.name || "未命名输入";
  if (normalizeProcessMode(process.mode) !== "model-roi") return base;
  return `${base} / ${target.categoryLabel || target.categoryKey || "未指定类别"}`;
}

function getInvalidDetectTargetCount(tool, detect) {
  return getDetectTargets(detect).filter((target) => !isDetectTargetValid(tool, target)).length;
}

function getToolInvalidDetectTargetCount(tool) {
  if (!Array.isArray(tool?.detect) || !tool.detect.length) return 0;
  return tool.detect.reduce((count, detect) => count + getInvalidDetectTargetCount(tool, detect), 0);
}

function getAcquireSampleName(item) {
  return String(item?.sampleImageName || item?.sampleImage || "").trim() || "未上传";
}

function getAcquireSampleUrl(item) {
  return String(item?.sampleImageUrl || "").trim();
}

function getImageResultAcquire(imageResult, toolId = "") {
  const tool = toolId ? state.tools.find((item) => item.id === toolId) || null : getActiveTool();
  return tool?.acquire?.find((item) => item.id === imageResult?.acquireId) || null;
}

function getImageResultSourceUrl(imageResult, toolId = "") {
  const directUrl = String(imageResult?.sourceImageUrl || "").trim();
  if (directUrl) return directUrl;
  return getAcquireSampleUrl(getImageResultAcquire(imageResult, toolId));
}

function readImageFileAsDemoPreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const sourceUrl = typeof reader.result === "string" ? reader.result : "";
      if (!sourceUrl) {
        reject(new Error("empty_image"));
        return;
      }
      const image = new Image();
      image.onload = () => {
        const naturalWidth = Number(image.naturalWidth || image.width) || 1;
        const naturalHeight = Number(image.naturalHeight || image.height) || 1;
        const maxWidth = 960;
        const maxHeight = 720;
        const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
        const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
        const targetHeight = Math.max(1, Math.round(naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve({
            url: sourceUrl,
            width: naturalWidth,
            height: naturalHeight,
          });
          return;
        }
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve({
          url: canvas.toDataURL("image/jpeg", 0.68),
          width: naturalWidth,
          height: naturalHeight,
        });
      };
      image.onerror = () => reject(new Error("image_decode_failed"));
      image.src = sourceUrl;
    };
    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function renderSamplePreviewHtml(imageUrl, imageName, compact = false) {
  if (imageUrl) {
    return `
      <div class="sample-preview-frame ${compact ? "is-compact" : ""}">
        <img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(imageName || "示例图片")}" />
      </div>
    `;
  }
  return `
    <div class="sample-preview-frame is-placeholder ${compact ? "is-compact" : ""}">
      <div class="sample-preview-grid"></div>
      <span>${escapeHtml(imageName || "未上传示例图片")}</span>
    </div>
  `;
}

function normalizeProcessMode(mode) {
  return Demo.normalizeToolProcessMode(mode);
}

function getProcessRegions(process) {
  return Array.isArray(process?.regions)
    ? process.regions
    : Array.isArray(process?.roiRegions)
      ? process.roiRegions
      : [];
}

function getProcessRoiRegionCount(process) {
  return getProcessRegions(process).filter((item) => item.type !== "ignore").length;
}

function getProcessIgnoreRegionCount(process) {
  return getProcessRegions(process).filter((item) => item.type === "ignore").length;
}

function isFullImageRegion(region) {
  if (!region || region.type === "ignore") return false;
  return Number(region.x) <= 0.001 && Number(region.y) <= 0.001 && Number(region.w) >= 0.999 && Number(region.h) >= 0.999;
}

function hasOnlyFullImageSubResults(imageResult) {
  const subResults = Array.isArray(imageResult?.subResults) ? imageResult.subResults : [];
  if (!subResults.length) return false;
  return subResults.every((subResult) => isFullImageRegion(subResult?.regionBox));
}

function hasOnlyFullImageProcessOutputs(tool, acquireId) {
  if (!tool || !acquireId) return false;
  const processList = Array.isArray(tool.process) ? tool.process.filter((process) => process.inputId === acquireId && isProcessReady(process, tool)) : [];
  if (!processList.length) return false;
  return processList.every((process) => normalizeProcessMode(process.mode) === "full-image");
}

function buildSplitRegions(count) {
  const side = Math.sqrt(count);
  if (!Number.isInteger(side) || side <= 0) return [];
  const regions = [];
  for (let row = 0; row < side; row += 1) {
    for (let col = 0; col < side; col += 1) {
      regions.push({
        id: Demo.makeId("roi"),
        type: "roi",
        x: col / side,
        y: row / side,
        w: 1 / side,
        h: 1 / side,
      });
    }
  }
  return regions;
}

function getProcessRoiSummary(process) {
  const roiRegions = getProcessRegions(process).filter((item) => item.type !== "ignore");
  const ignoreCount = getProcessIgnoreRegionCount(process);
  return `检测区域：${roiRegions.length} 个${ignoreCount ? `，排除区域：${ignoreCount} 个` : ""}`;
}

function buildClassifierPreviewRegion(index, total) {
  const safeTotal = Math.max(1, Number(total) || 1);
  const presets = [
    { x: 0.12, y: 0.18, w: 0.34, h: 0.42 },
    { x: 0.54, y: 0.22, w: 0.28, h: 0.38 },
    { x: 0.22, y: 0.56, w: 0.26, h: 0.24 },
    { x: 0.58, y: 0.58, w: 0.22, h: 0.22 },
  ];
  if (safeTotal === 1) {
    return { x: 0.22, y: 0.18, w: 0.52, h: 0.5 };
  }
  return presets[index % presets.length];
}

function renderCloudVersionRow(model, version) {
  const downloaded = state.localModels.some((item) => item.version === version.version);
  const downloading = ui.pendingDownload?.versionId === version.id;
  return `
    <div class="cloud-version-row">
      <div class="cloud-version-code">${escapeHtml(version.version)}</div>
      <div class="cloud-version-time">训练完成时间：${Demo.formatDateTime(version.completedAt)}</div>
      <div class="cloud-version-action">
        <button
          class="table-btn ${downloaded ? "table-btn-neutral" : "table-btn-primary"}"
          data-action="download-model"
          data-model-id="${model.id}"
          data-version-id="${version.id}"
          ${downloaded || downloading || Demo.isStorageBlocked(state) ? "disabled" : ""}
        >
          ${downloaded ? "已下载" : downloading ? "下载中..." : "下载到本地"}
        </button>
      </div>
    </div>
  `;
}

function renderParamFields(camera, group) {
  const fields = getParamFieldSchema(camera.brand);
  const rows = [
    `
      <label class="field field-span-full param-name-field">
        <span>参数组名称</span>
        <input id="param_field_name" type="text" maxlength="24" value="${escapeAttribute(getParamGroupDisplayName(group))}" />
      </label>
    `,
  ];

  fields.forEach((field) => {
    const value = group.settings?.[field.key] ?? field.defaultValue;
    if (field.type === "boolean") {
      rows.push(`
        <label class="field">
          <span>${field.label}</span>
          <select id="param_field_${field.key}">
            <option value="true" ${value ? "selected" : ""}>开启</option>
            <option value="false" ${!value ? "selected" : ""}>关闭</option>
          </select>
        </label>
      `);
      return;
    }

    if (field.type === "select") {
      rows.push(`
        <label class="field">
          <span>${field.label}</span>
          <select id="param_field_${field.key}">
            ${field.options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`).join("")}
          </select>
        </label>
      `);
      return;
    }

    rows.push(`
      <label class="field">
        <span>${field.label}</span>
        <input id="param_field_${field.key}" type="number" value="${value}" />
      </label>
    `);
  });

  return rows.join("");
}

function getParamFieldSchema(brand) {
  if (brand === "Basler") {
    return [
      { key: "exposure", label: "曝光时间", type: "number", defaultValue: 1600 },
      { key: "gamma", label: "Gamma", type: "number", defaultValue: 1.2 },
      { key: "packetSize", label: "网络包大小", type: "number", defaultValue: 1500 },
      { key: "triggerMode", label: "触发模式", type: "select", options: ["Line1", "Line2", "Software"], defaultValue: "Line1" },
      { key: "reverseX", label: "水平翻转", type: "boolean", defaultValue: false },
      { key: "reverseY", label: "垂直翻转", type: "boolean", defaultValue: false },
    ];
  }
  return [
    { key: "autoExposure", label: "自动曝光", type: "boolean", defaultValue: true },
    { key: "exposure", label: "曝光时间", type: "number", defaultValue: 1200 },
    { key: "gain", label: "增益值", type: "number", defaultValue: 3 },
    { key: "width", label: "图像宽度", type: "number", defaultValue: 2448 },
    { key: "height", label: "图像高度", type: "number", defaultValue: 2048 },
    { key: "offsetX", label: "水平偏移", type: "number", defaultValue: 0 },
    { key: "offsetY", label: "垂直偏移", type: "number", defaultValue: 0 },
  ];
}

function getDefaultParamSettings(brand) {
  return getParamFieldSchema(brand).reduce((result, field) => {
    result[field.key] = field.defaultValue;
    return result;
  }, {});
}

function getParamGroupDisplayName(group) {
  return String(group?.name || "").trim() || "未命名参数组";
}

function getParamPreviewAspectRatio(group) {
  const width = Number(group?.settings?.width) || 2448;
  const height = Number(group?.settings?.height) || 2048;
  return `${Math.max(1, width)} / ${Math.max(1, height)}`;
}

function getParamPreviewCaption(camera, group) {
  const width = Number(group?.settings?.width) || 2448;
  const height = Number(group?.settings?.height) || 2048;
  return `${Demo.getCameraLabel(camera)} · ${width} × ${height}`;
}

function getAcquireInputSource(acquire) {
  return acquire?.type === "camera"
    ? `${Demo.getCameraLabel(state.cameras.find((camera) => camera.id === acquire.cameraId))} / ${Demo.getParamGroupLabel(state.cameras.find((camera) => camera.id === acquire.cameraId), acquire.paramGroupId)}`
    : acquire?.endpoint || "外部输入";
}

function buildFullImageRegion() {
  return { x: 0, y: 0, w: 1, h: 1 };
}

function buildProcessOutputs(process) {
  const mode = normalizeProcessMode(process.mode);
  if (mode === "full-image") {
    return [
      {
        name: process.name,
        source: "全图",
        modelId: process.modelId || "",
        imageLabel: process.name,
        outputType: "full-image",
        processId: process.id,
        categoryKey: "",
        regionBox: buildFullImageRegion(),
      },
    ];
  }
  if (mode === "model-roi") {
    return getProcessCategoryOptions(process).map((category, index, list) => ({
      name: `${process.name} ${category}`,
      source: category,
      modelId: process.modelId || "",
      imageLabel: process.name,
      outputType: "roi",
      processId: process.id,
      regionId: `${process.id}_${category}`,
      categoryKey: category,
      regionBox: buildClassifierPreviewRegion(index, list.length),
    }));
  }
  const roiRegions = getProcessRegions(process).filter((item) => item.type !== "ignore");
  const effectiveRegions = roiRegions.length ? roiRegions : [{ id: `${process.id}_roi_1`, x: 0.18, y: 0.18, w: 0.32, h: 0.24 }];
  return effectiveRegions.map((region, index) => ({
    name: `${process.name} 检测区域${index + 1}`,
    source: `检测区域${index + 1}`,
    modelId: process.modelId || "",
    imageLabel: process.name,
    outputType: "roi",
    processId: process.id,
    regionId: region.id,
    categoryKey: "",
    regionBox: {
      x: Number(region.x) || 0,
      y: Number(region.y) || 0,
      w: Number(region.w) || 1,
      h: Number(region.h) || 1,
    },
  }));
}

function buildDetectOutputs(tool, acquire) {
  return tool.detect.flatMap((detect) =>
    getDetectTargets(detect).flatMap((target) => {
      const process = tool.process.find((item) => item.id === target.processId && item.inputId === acquire.id);
      if (!process) return [];
      const mode = normalizeProcessMode(process.mode);
      if (mode === "model-roi") {
        if (!target.categoryKey || !getProcessCategoryOptions(process).includes(target.categoryKey)) return [];
        const outputs = buildProcessOutputs(process, detect);
        return outputs.filter((output) => output.categoryKey === target.categoryKey);
      }
      return buildProcessOutputs(process, detect);
    }),
  );
}

function buildProcessSampleOutputs(tool, acquire) {
  return tool.process
    .filter((process) => process.inputId === acquire.id && isProcessReady(process, tool))
    .flatMap((process) => buildProcessOutputs(process));
}

function doesDetectTargetMatchOutput(target, process, output) {
  if (!target || target.processId !== output.processId) return false;
  if (normalizeProcessMode(process?.mode) !== "model-roi") return true;
  return Boolean(target.categoryKey) && target.categoryKey === output.categoryKey;
}

function buildDetectionRecord(tool, runMode = "detect") {
  const normalizedRunMode = Demo.normalizeRunMode(runMode);
  const detectItems = Array.isArray(tool.detect) ? tool.detect : [];
  const primaryDetect = detectItems[0] || null;

  const imageResults = (Array.isArray(tool.acquire) ? tool.acquire : []).map((acquire) => {
    const outputs = normalizedRunMode === "acquire" ? [] : buildProcessSampleOutputs(tool, acquire);
    const seedNg = normalizedRunMode === "detect" && Math.random() > 0.58;
    let detectResultCursor = 0;
    const subResults = outputs.map((output, index) => {
      const process = tool.process.find((item) => item.id === output.processId && item.inputId === acquire.id) || null;
      const detectResults =
        normalizedRunMode === "detect"
          ? detectItems
              .filter((detect) => getDetectTargets(detect).some((target) => doesDetectTargetMatchOutput(target, process, output)))
              .map((detect, detectIndex) => {
                const businessResult = seedNg && detectResultCursor === 0 ? "NG" : "OK";
                detectResultCursor += 1;
                const modelSceneType = getModelSceneTypeById(detect.modelId);
                return {
                  id: Demo.makeId("detres"),
                  name: detect.name || `检测结果 ${detectIndex + 1}`,
                  detectId: detect.id || "",
                  detectName: detect.name || "",
                  modelId: detect.modelId || "",
                  modelSceneType,
                  businessResult,
                  algorithmOutput: buildMockAlgorithmOutput(output, businessResult, modelSceneType),
                  suspicious: businessResult === "NG",
                };
              })
          : [];
      const subResultBusinessResult = normalizedRunMode === "detect" ? getAggregatedBusinessResult(detectResults) : "-";
      return {
        id: Demo.makeId("sub"),
        name: output.name || `分区结果 ${index + 1}`,
        source: output.source,
        modelId: output.modelId || "",
        modelSceneType: getModelSceneTypeById(output.modelId),
        businessResult: subResultBusinessResult,
        algorithmOutput: detectResults.length === 1 ? detectResults[0].algorithmOutput : "",
        imageLabel: output.imageLabel,
        suspicious: detectResults.some((item) => item.suspicious),
        processId: output.processId,
        regionId: output.regionId || "",
        regionBox: output.regionBox || null,
        outputType: output.outputType,
        categoryKey: output.categoryKey || "",
        detectResults,
      };
    });

    return {
      id: Demo.makeId("img"),
      acquireId: acquire.id,
      acquireName: acquire.name,
      imageLabel: getAcquireSampleName(acquire),
      sourceImageUrl: "",
      sourceImageName: "",
      sourceImageWidth: Number(acquire.sampleImageWidth || 0),
      sourceImageHeight: Number(acquire.sampleImageHeight || 0),
      result: normalizedRunMode === "detect" ? getAggregatedBusinessResult(subResults) : "-",
      subResults,
      inputSource: getAcquireInputSource(acquire),
    };
  });

  const flatSubResults = imageResults.flatMap((item) => item.subResults);
  const flatDetectResults = flatSubResults.flatMap((item) => getSubResultDetectResults(item));
  const totalResult =
    normalizedRunMode === "detect" ? getAggregatedBusinessResult(imageResults) : "-";

  return {
    id: `REC-${state.meta.now.slice(0, 10).replace(/-/g, "")}-${String(state.detectionRecords.length + 1).padStart(3, "0")}`,
    toolId: tool.id,
    toolName: tool.name,
    detectId: normalizedRunMode === "detect" && detectItems.length === 1 ? primaryDetect?.id || "" : "",
    detectName: normalizedRunMode === "detect" && detectItems.length === 1 ? primaryDetect?.name || "" : getRunModeLabel(normalizedRunMode),
    triggeredAt: state.meta.now,
    inputSource: imageResults.map((item) => item.inputSource).join(" / "),
    executionStatus: "已完成",
    runMode: normalizedRunMode,
    completedStages:
      normalizedRunMode === "acquire" ? ["acquire"] : normalizedRunMode === "process" ? ["acquire", "process"] : ["acquire", "process", "detect"],
    totalResult,
    businessResult: totalResult,
    customTags: getRuntimeActiveTags(tool).length ? getRuntimeActiveTags(tool) : getRuntimeDraftTags(tool),
    imageResults,
    ngCount: flatDetectResults.filter((item) => item.businessResult === "NG").length,
    suspiciousCount: flatDetectResults.filter((item) => item.suspicious).length,
    subResults: flatSubResults,
  };
}

function renderStorageSummaryCard(label, value, options = {}) {
  return `
    <article class="summary-card">
      <div class="summary-card-body">
        <span class="summary-label">${escapeHtml(label)}</span>
        <strong class="summary-value">${escapeHtml(value)}</strong>
        ${options.meta ? `<span class="summary-meta">${escapeHtml(options.meta)}</span>` : ""}
      </div>
      ${
        options.actionType
          ? `
            <div class="summary-card-actions">
              <button class="secondary-btn summary-action-btn" data-clean-type="${options.actionType}" ${options.disabled ? "disabled" : ""}>
                ${escapeHtml(options.actionLabel || "清理数据")}
              </button>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function renderTopbarAlert(tone, text, actionLabel = "", action = "") {
  return `
    <span class="topbar-inline-alert topbar-inline-alert-${tone}">
      <span>${escapeHtml(text)}</span>
      ${actionLabel && action ? `<button class="topbar-inline-alert-action" data-action="${escapeAttribute(action)}" type="button">${escapeHtml(actionLabel)}</button>` : ""}
    </span>
  `;
}

function renderStatusBadgeHtml(text) {
  return `<span class="status-badge ${getStatusClass(text)}">${escapeHtml(text)}</span>`;
}

function renderStatusBadgeInto(element, text) {
  element.textContent = text;
  element.className = `status-badge ${getStatusClass(text)}`;
}

function renderBusinessBadge(text) {
  const value = getDisplayResultText(text);
  if (value === "-") return "";
  const cls = value === "OK" ? "status-online" : value === "NG" ? "status-danger" : "status-offline";
  return `<span class="status-badge ${cls}">${escapeHtml(value)}</span>`;
}

function getDisplayResultText(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "未判定") return "-";
  return text;
}

function getResultTone(value) {
  const text = getDisplayResultText(value);
  if (text === "NG") return "ng";
  if (text === "OK") return "ok";
  return "neutral";
}

function getResultToneModifier(value) {
  const tone = getResultTone(value);
  return tone === "ng" ? "is-ng" : tone === "ok" ? "is-ok" : "is-neutral";
}

function getLocalModelReferenceCount(modelId) {
  return state.tools.reduce((count, tool) => {
    const processCount = Array.isArray(tool.process) ? tool.process.filter((item) => item.modelId === modelId).length : 0;
    const detectCount = Array.isArray(tool.detect) ? tool.detect.filter((item) => item.modelId === modelId).length : 0;
    return count + processCount + detectCount;
  }, 0);
}

function renderReferenceStatusHtml(referenceCount) {
  const referenced = Number(referenceCount) > 0;
  return `<span class="reference-status ${referenced ? "is-referenced" : "is-idle"}">${referenced ? "使用中" : "未使用"}</span>`;
}

function getBusinessBannerHtml(result) {
  if (result === "放行") {
    return `<p class="banner banner-success">外部控制系统业务判定结果：放行。JetCheck 本身仅负责记录算法结果和外部业务结论。</p>`;
  }
  if (result === "拦截") {
    return `<p class="banner banner-danger">外部控制系统业务判定结果：拦截。详情中保留本次算法执行结果及子结果图像。</p>`;
  }
  return `<p class="banner banner-warning">外部控制系统业务判定结果：复检。可在子结果列表中继续标记可疑并导出图像。</p>`;
}

function getExportScopeOptions(type) {
  if (type === "records-list") {
    return [
      { value: "当前筛选结果", label: "当前筛选结果下的全部记录" },
      { value: "当前页记录", label: "当前页可见记录" },
    ];
  }
  if (type === "record-detail") {
    return [
      { value: "当前总记录", label: "当前总记录详情" },
    ];
  }
  if (type === "record-images") {
    return [
      { value: "当前记录全部子结果图像", label: "当前记录全部子结果图像" },
      { value: "当前已标记可疑图像", label: "当前已标记可疑的子结果图像" },
      { value: "当前选中子结果图像", label: "当前筛选结果下的子结果图像" },
    ];
  }
  if (type === "records-images") {
    return [
      { value: "当前筛选结果下的全部子结果图像", label: "当前筛选结果下的全部子结果图像" },
      { value: "当前筛选结果下的可疑图像", label: "当前筛选结果下已标记可疑的图像" },
    ];
  }
  return [
    { value: "当前筛选采图记录", label: "当前筛选采图记录" },
  ];
}

function getExportContentOptions(type) {
  if (type === "records-list" || type === "record-detail") {
    return [
      { value: "总记录+子结果信息", label: "总记录信息 + 子结果信息" },
      { value: "总记录摘要", label: "仅总记录摘要" },
    ];
  }
  return [
    { value: "仅图像", label: "仅图像" },
    { value: "图像+子结果信息", label: "图像 + 子结果信息" },
    { value: "图像+人工标记结果", label: "图像 + 人工标记结果" },
  ];
}

function getStatusClass(text) {
  if (["OK"].includes(text)) return "status-online";
  if (["NG"].includes(text)) return "status-danger";
  if (["在线", "空闲", "可用", "已完成", "已连接"].includes(text)) return "status-online";
  if (["离线", "待机", "未运行", "未绑定", "已添加", "未配置", "-"].includes(text)) return "status-offline";
  if (["拦截", "已阻断", "已中断", "异常"].includes(text)) return "status-danger";
  if (["放行", "已引用", "运行中", "等待信号", "下载中...", "执行中"].includes(text)) return "status-primary";
  if (["未判定"].includes(text)) return "status-offline";
  return "status-pending";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function getEventTargetElement(event) {
  const target = event?.target;
  if (target instanceof Element) return target;
  return target?.parentElement instanceof Element ? target.parentElement : null;
}

function getClosestEventTarget(event, selector) {
  const element = getEventTargetElement(event);
  return element ? element.closest(selector) : null;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

init();
