const Demo = window.JetCheckDemo || {};
const STORAGE_KEY = "jetcheck-platform-replica-v2";
const UI_STORAGE_KEY = "jetcheck-platform-replica-ui-v2";
const CLIENT_CLOUD_SYNC_QUEUE_KEY = "jetcheck-client-cloud-sync-v1";

const IMAGE_KAKOU = "./sample-images/安全座椅-卡扣kakou.png";
const IMAGE_LUOGAN = "./sample-images/安全座椅-螺杆.bmp";
const IMAGE_XRAY = "./sample-images/马斯特X光.bmp";

const LABEL_COLORS = ["#f5222d", "#fa8c16", "#52c41a", "#1677ff", "#722ed1"];
const DEFAULT_LIBRARY_TAGS = [
  { id: "tag_ng", name: "NG", color: "#f5222d" },
  { id: "tag_ok", name: "OK", color: "#52c41a" },
];

const SAMPLE_IMAGES = [
  { id: "img_01", name: "Image_20260501112501.jpg", folderId: "folder_codex", url: IMAGE_KAKOU, size: "1920 × 1080", device: "ww", tag: "NG", capturedAt: "2026-05-01T11:25:01+08:00" },
  { id: "img_02", name: "Image_20260501112614.jpg", folderId: "folder_codex", url: IMAGE_KAKOU, size: "1920 × 1080", device: "ww", tag: "NG", capturedAt: "2026-05-01T11:26:14+08:00" },
  { id: "img_03", name: "Image_20260501112738.jpg", folderId: "folder_codex", url: IMAGE_KAKOU, size: "1920 × 1080", device: "ww", tag: "", capturedAt: "2026-05-01T11:27:38+08:00" },
  { id: "img_04", name: "Image_20260501112902.jpg", folderId: "folder_codex", url: IMAGE_KAKOU, size: "1920 × 1080", device: "ww", tag: "", capturedAt: "2026-05-01T11:29:02+08:00" },
  { id: "img_05", name: "Image_20260501113027.jpg", folderId: "folder_codex", url: IMAGE_KAKOU, size: "1920 × 1080", device: "三羊", tag: "OK", capturedAt: "2026-05-01T11:30:27+08:00" },
  { id: "img_06", name: "Image_20260501113140.jpg", folderId: "folder_codex", url: IMAGE_KAKOU, size: "1920 × 1080", device: "三羊", tag: "OK", capturedAt: "2026-05-01T11:31:40+08:00" },
  { id: "img_07", name: "Image_螺杆_001.bmp", folderId: "folder_parts", url: IMAGE_LUOGAN, size: "2448 × 2048", device: "ww", tag: "NG", capturedAt: "2026-04-22T10:16:08+08:00" },
  { id: "img_08", name: "Image_X光_001.bmp", folderId: "folder_xray", url: IMAGE_XRAY, size: "1536 × 1536", device: "", tag: "NG", capturedAt: "2026-03-28T14:08:21+08:00" },
];

function buildSeedState() {
  const baseImages = SAMPLE_IMAGES.slice(0, 4).map((image) => image.id);
  return {
    version: 2,
    enterprise: { name: "雪球", clientQuota: 15 },
    account: {
      nickname: "雪球",
      phone: "173****7082",
      enterpriseName: "雪球",
      industry: "智能制造",
      contactName: "雪球",
      contactPhone: "17357197082",
      role: "管理员",
      createdAt: "2026-04-29T09:00:00+08:00",
    },
    libraryTags: clone(DEFAULT_LIBRARY_TAGS),
    models: [
      {
        id: "model_codex",
        name: "codex-test",
        sceneType: "缺陷检测",
        description: "",
        createdAt: "2026-06-10T09:30:00+08:00",
        updatedAt: "2026-06-10T10:12:00+08:00",
      },
      {
        id: "model_kakou",
        name: "安全卡扣-缺陷检测",
        sceneType: "缺陷检测",
        description: "",
        createdAt: "2026-05-01T11:47:36+08:00",
        updatedAt: "2026-05-26T11:03:46+08:00",
      },
      {
        id: "model_assembly",
        name: "开来-装配检测-白蓝",
        sceneType: "分类",
        description: "",
        createdAt: "2026-04-29T11:25:34+08:00",
        updatedAt: "2026-04-29T11:25:34+08:00",
      },
    ],
    records: {
      model_codex: [
        {
          id: "record_pending",
          code: "2026061009301",
          createdAt: "2026-06-10T09:31:16+08:00",
          status: "待训练",
          imageIds: baseImages,
          completedImageIds: ["img_01", "img_02"],
          labels: [
            { id: "label_ng", name: "NG", color: "#f5222d" },
            { id: "label_ok", name: "OK", color: "#52c41a" },
          ],
          annotations: {
            img_01: [{ x: 320, y: 220, w: 250, h: 180, labelId: "label_ng" }],
            img_02: [{ x: 410, y: 250, w: 180, h: 145, labelId: "label_ng" }],
          },
          testImageIds: [],
          testResults: {},
        },
        {
          id: "record_queued",
          code: "2026061008427",
          createdAt: "2026-06-10T08:42:27+08:00",
          status: "排队中",
          queuePosition: 2,
          waitText: "预计等待 24 分钟",
          imageIds: baseImages,
          completedImageIds: baseImages,
          labels: [{ id: "label_ng", name: "NG", color: "#f5222d" }],
          annotations: buildDefaultAnnotations(baseImages),
          testImageIds: [],
          testResults: {},
        },
        {
          id: "record_training",
          code: "2026061008013",
          createdAt: "2026-06-10T08:01:13+08:00",
          status: "训练中",
          startedAt: "2026-06-10T10:01:00+08:00",
          elapsedText: "已训练 8 分钟",
          remainingText: "预计剩余 7 分钟",
          imageIds: baseImages,
          completedImageIds: baseImages,
          labels: [{ id: "label_ng", name: "NG", color: "#f5222d" }],
          annotations: buildDefaultAnnotations(baseImages),
          testImageIds: [],
          testResults: {},
        },
        {
          id: "record_done",
          code: "2026060916451",
          createdAt: "2026-06-09T16:45:11+08:00",
          status: "训练完成",
          completedAt: "2026-06-09T17:00:37+08:00",
          duration: "15分钟26秒",
          imageIds: baseImages,
          completedImageIds: baseImages,
          labels: [{ id: "label_ng", name: "NG", color: "#f5222d" }],
          annotations: buildDefaultAnnotations(baseImages),
          testImageIds: SAMPLE_IMAGES.slice(0, 6).map((image) => image.id),
          testResults: buildTestResults(),
        },
      ],
      model_kakou: [],
      model_assembly: [],
    },
    folders: [
      { id: "folder_codex", name: "codex-test-data", count: 6, cover: IMAGE_KAKOU },
      { id: "folder_parts", name: "螺杆样本", count: 1, cover: IMAGE_LUOGAN },
      { id: "folder_xray", name: "X光缺陷样本", count: 1, cover: IMAGE_XRAY },
    ],
    images: SAMPLE_IMAGES,
    terminals: [
      { id: "terminal_ww", name: "ww", status: "离线", boundAt: "2026-05-08T14:24:53+08:00", offlineAt: "2026-05-15T01:30:18+08:00", hardwareCode: "a011cc88877948a4f5c634f7ca3ec3970f368b1c0cd868dbb34551d9e51f4759" },
      { id: "terminal_sanyang", name: "三羊", status: "离线", boundAt: "2026-05-08T11:42:41+08:00", offlineAt: "2026-05-15T00:20:04+08:00", hardwareCode: "ff584812de225e4d7cd0333b8c1637709af9c2de60b931c9bb1faed1852bb708" },
      { id: "terminal_sss", name: "sss", status: "在线", boundAt: "2026-04-29T16:42:23+08:00", offlineAt: "", hardwareCode: "3f7cd480fc0aeb3acdeb82dc2a6d3c361757a92c8c6179e0d79ad690a81c5911" },
      { id: "terminal_233", name: "233", status: "离线", boundAt: "2026-04-29T15:22:23+08:00", offlineAt: "2026-05-13T17:34:25+08:00", hardwareCode: "76cf8c66042a3c01602c071a76570f5493a883d370c073040c6ef92f19ddaed8" },
    ],
  };
}

function buildDefaultAnnotations(imageIds) {
  return Object.fromEntries(
    imageIds.map((imageId, index) => [
      imageId,
      [{ x: 270 + index * 28, y: 190 + index * 12, w: 260, h: 190, labelId: "label_ng" }],
    ]),
  );
}

function buildTestResults() {
  const results = {};
  SAMPLE_IMAGES.slice(0, 6).forEach((image, index) => {
    results[image.id] = {
      status: "检测完成",
      boxes:
        index === 0 || index === 3
          ? [{ x: 300 + index * 20, y: 205, w: 250, h: 185, label: "NG", score: index === 0 ? 0.96 : 0.91 }]
          : [],
    };
  });
  return results;
}

const state = loadState();
const ui = loadUi();
const histories = {};
let modal = null;
let pickerSelection = new Set();
let librarySelection = new Set();
let trainingSelection = new Set();
let pointerSession = null;

const els = {
  main: document.getElementById("platformMain"),
  sidebar: document.getElementById("platformSidebar"),
  navItems: Array.from(document.querySelectorAll(".platform-system-nav-item")),
  account: document.getElementById("platformAccount"),
  accountBtn: document.getElementById("platformAccountBtn"),
  accountMenu: document.getElementById("platformAccountMenu"),
  toastStack: document.getElementById("toastStack"),
};

const modalRoot = document.createElement("div");
modalRoot.id = "platformModalRoot";
document.body.appendChild(modalRoot);

const demoController = document.createElement("div");
demoController.id = "demoController";
document.body.appendChild(demoController);

function init() {
  els.accountBtn.querySelector("span:last-child").textContent = state.account.nickname;
  els.accountBtn.querySelector(".platform-user-avatar").textContent = state.account.nickname.slice(0, 1);
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      setView(item.dataset.view || "home");
    });
  });
  els.accountBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    ui.accountMenuOpen = !ui.accountMenuOpen;
    renderAccountMenu();
  });
  els.accountMenu.addEventListener("click", handleAccountMenuClick);
  document.addEventListener("click", (event) => {
    if (ui.accountMenuOpen && !els.account.contains(event.target)) {
      ui.accountMenuOpen = false;
      renderAccountMenu();
    }
  });
  els.main.addEventListener("click", handleClick);
  els.main.addEventListener("input", handleInput);
  els.main.addEventListener("change", handleChange);
  modalRoot.addEventListener("click", handleModalClick);
  modalRoot.addEventListener("input", handleModalInput);
  modalRoot.addEventListener("change", handleModalChange);
  demoController.addEventListener("click", handleDemoClick);
  demoController.addEventListener("input", handleDemoChange);
  demoController.addEventListener("change", handleDemoChange);
  render();
}

function handleClick(event) {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const id = actionEl.dataset.id || "";

  if (action === "set-view") return setView(id);
  if (action === "reset-model-filter") {
    ui.modelScene = "all";
    ui.modelQuery = "";
    return render();
  }
  if (action === "search-models") return render();
  if (action === "new-model") return openModelModal();
  if (action === "edit-model") return openModelModal(id);
  if (action === "delete-model") return deleteModel(id);
  if (action === "training-records") {
    ui.selectedModelId = id || ui.selectedModelId;
    return setView("model-training-records");
  }
  if (action === "new-training") return createTrainingRecord();
  if (action === "open-training") return openTraining(id);
  if (action === "open-test") return openTest(id);
  if (action === "record-more") {
    ui.openRecordMenu = ui.openRecordMenu === id ? "" : id;
    return render();
  }
  if (action === "cancel-training") return cancelTraining(id);
  if (action === "delete-record") return deleteRecord(id);
  if (action === "download-model") return downloadModel(id);
  if (action === "select-training-tab") {
    ui.trainingTab = id;
    ui.activeImageId = "";
    trainingSelection = new Set();
    return render();
  }
  if (action === "toggle-training-batch") {
    ui.trainingBatchMode = !ui.trainingBatchMode;
    trainingSelection = new Set();
    return render();
  }
  if (action === "toggle-training-selection") {
    if (trainingSelection.has(id)) trainingSelection.delete(id);
    else trainingSelection.add(id);
    return render();
  }
  if (action === "toggle-training-visible") return toggleTrainingVisibleSelection();
  if (action === "delete-training-selection") {
    return requestConfirmation("delete-training-images", { imageIds: Array.from(trainingSelection) });
  }
  if (action === "select-training-image") {
    ui.activeImageId = id;
    ui.selectedAnnotation = -1;
    saveUi();
    return render();
  }
  if (action === "delete-training-image") return deleteTrainingImage(id);
  if (action === "open-image-picker") return openImagePicker(actionEl.dataset.mode || "training");
  if (action === "select-label") {
    ui.activeLabelId = id;
    return render();
  }
  if (action === "add-label") return openLabelModal();
  if (action === "complete-image") return completeCurrentImage();
  if (action === "start-training") return startTraining();
  if (action === "canvas-tool") {
    ui.canvasTool = id;
    return render();
  }
  if (action === "canvas-zoom-in") return updateCanvasZoom(0.25);
  if (action === "canvas-zoom-out") return updateCanvasZoom(-0.25);
  if (action === "canvas-fit") return fitAnnotationCanvas();
  if (action === "undo-annotation") return undoAnnotation();
  if (action === "redo-annotation") return redoAnnotation();
  if (action === "delete-selected-box") return deleteSelectedBox();
  if (action === "select-test-image") {
    ui.activeTestImageId = id;
    return render();
  }
  if (action === "run-test") return runTest();
  if (action === "library-mode") {
    ui.libraryMode = id;
    return render();
  }
  if (action === "open-library-folder") {
    ui.selectedFolderId = id;
    ui.libraryQuery = "";
    librarySelection = new Set();
    return setView("library-folder");
  }
  if (action === "back-library") {
    ui.selectedFolderId = "";
    librarySelection = new Set();
    return setView("library");
  }
  if (action === "toggle-library-image") {
    if (librarySelection.has(id)) librarySelection.delete(id);
    else librarySelection.add(id);
    return render();
  }
  if (action === "toggle-library-all") return toggleLibrarySelectAll();
  if (action === "search-library") return render();
  if (action === "reset-library-search") {
    ui.libraryQuery = "";
    ui.libraryDevice = "all";
    ui.libraryTag = "all";
    librarySelection = new Set();
    return render();
  }
  if (action === "delete-library-selection") return requestConfirmation("delete-library-images", { imageIds: Array.from(librarySelection) });
  if (action === "delete-library-image") return requestConfirmation("delete-library-images", { imageIds: [id] });
  if (action === "export-library-selection") return exportLibraryImages(Array.from(librarySelection));
  if (action === "new-folder") return openFolderModal();
  if (action === "upload-library-image") return openUploadModal();
  if (action === "open-image-detail") return openImageDetail(id);
  if (action === "rename-folder") return openFolderModal(id);
  if (action === "export-folder") return exportLibraryFolder(id);
  if (action === "open-label-library") return openLabelLibrary();
  if (action === "open-assign-tag") return openAssignTagModal();
  if (action === "delete-folder") return requestConfirmation("delete-folder", { folderId: id });
  if (action === "edit-account-password") {
    ui.accountEditingPassword = true;
    return render();
  }
  if (action === "cancel-account-password") {
    ui.accountEditingPassword = false;
    return render();
  }
  if (action === "save-password") return saveAccountPassword();
  if (action === "edit-company") {
    ui.accountEditingCompany = true;
    return render();
  }
  if (action === "cancel-company") {
    ui.accountEditingCompany = false;
    return render();
  }
  if (action === "save-company") return saveCompanyInfo();
  if (action === "reset-clients") {
    ui.clientStatus = "all";
    ui.clientQuery = "";
    return render();
  }
  if (action === "search-clients") return render();
  if (action === "back-models") return setView("models");
  if (action === "back-records") return setView("model-training-records");
  if (action === "noop") return;
}

function handleInput(event) {
  if (event.target.id === "modelQueryInput") {
    ui.modelQuery = event.target.value;
  }
  if (event.target.id === "libraryQueryInput") {
    ui.libraryQuery = event.target.value;
  }
  if (event.target.id === "clientQueryInput") {
    ui.clientQuery = event.target.value;
  }
  if (event.target.id === "pickerQueryInput" && modal?.type === "picker") {
    modal.query = event.target.value;
  }
}

function handleChange(event) {
  if (event.target.id === "modelSceneSelect") {
    ui.modelScene = event.target.value;
    render();
  }
  if (event.target.id === "libraryDeviceSelect") {
    ui.libraryDevice = event.target.value;
    librarySelection = new Set();
    render();
  }
  if (event.target.id === "libraryTagSelect") {
    ui.libraryTag = event.target.value;
    librarySelection = new Set();
    render();
  }
  if (event.target.id === "clientStatusSelect") {
    ui.clientStatus = event.target.value;
    render();
  }
}

function handleModalClick(event) {
  if (event.target.classList.contains("modal-backdrop") || event.target.closest('[data-modal-action="close"]')) {
    return closeModal();
  }
  const actionEl = event.target.closest("[data-modal-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.modalAction;
  if (action === "save-model") return saveModelFromModal();
  if (action === "picker-folder") {
    modal.folderId = actionEl.dataset.id;
    return renderModal();
  }
  if (action === "confirm-picker") return confirmImagePicker();
  if (action === "picker-select-folder") return togglePickerFolderSelection();
  if (action === "picker-search") return renderModal();
  if (action === "picker-reset-search") {
    modal.query = "";
    return renderModal();
  }
  if (action === "save-label") return saveLabelFromModal();
  if (action === "save-folder") return saveFolderFromModal();
  if (action === "confirm-upload") return confirmLibraryUpload();
  if (action === "export-detail-image") return exportLibraryImages([modal.imageId]);
  if (action === "save-detail-tag") return saveDetailImageTag();
  if (action === "add-library-tag") return addLibraryTag();
  if (action === "delete-library-tag") return deleteLibraryTag(actionEl.dataset.id);
  if (action === "confirm-assign-tag") return assignLibraryTag();
  if (action === "confirm-action") return confirmRequestedAction();
}

function handleModalChange(event) {
  if (event.target.matches("[data-picker-image]")) {
    const imageId = event.target.dataset.pickerImage;
    if (event.target.checked) pickerSelection.add(imageId);
    else pickerSelection.delete(imageId);
    renderModal();
  }
  if (event.target.id === "modalUploadImagesInput") {
    return prepareUploadFiles(event.target.files, "images");
  }
  if (event.target.id === "modalUploadZipInput") {
    return prepareUploadFiles(event.target.files, "zip");
  }
}

function handleModalInput(event) {
  if (event.target.id === "pickerQueryInput" && modal?.type === "picker") {
    modal.query = event.target.value;
  }
}

function handleDemoClick(event) {
  const actionEl = event.target.closest("[data-demo-action]");
  if (!actionEl) return;
  if (actionEl.dataset.demoAction === "toggle") {
    ui.demoOpen = !ui.demoOpen;
    saveUi();
    return renderDemoController();
  }
  if (actionEl.dataset.demoAction === "apply") {
    const select = document.getElementById("demoScenarioSelect");
    return applyScenario(select?.value || "");
  }
  if (actionEl.dataset.demoAction === "advance") advanceSelectedRecord();
  if (actionEl.dataset.demoAction === "reset") resetDemo();
}

function handleDemoChange(event) {
  if (event.target.id === "demoScenarioSelect") {
    applyScenario(event.target.value);
  }
}

function setView(view) {
  ui.view = view;
  ui.openRecordMenu = "";
  ui.accountMenuOpen = false;
  saveUi();
  render();
}

function render() {
  const topView = normalizeTopView(ui.view);
  els.navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.view === topView));
  els.main.classList.toggle("is-annotation-view", ui.view === "model-training-workspace");
  renderSidebar(topView);
  if (ui.view === "home") renderHome();
  else if (ui.view === "models") renderModels();
  else if (ui.view === "model-training-records") renderTrainingRecords();
  else if (ui.view === "model-training-workspace") renderTrainingWorkspace();
  else if (ui.view === "model-test") renderTestWorkspace();
  else if (ui.view === "library") renderLibrary();
  else if (ui.view === "library-folder") renderLibraryFolder();
  else if (ui.view === "clients") renderClients();
  else if (ui.view === "user-center") renderUserCenter();
  else setView("models");
  renderAccountMenu();
  renderModal();
  renderDemoController();
  saveUi();
}

function normalizeTopView(view) {
  if (view.startsWith("model-")) return "models";
  if (view.startsWith("library-")) return "library";
  if (view === "user-center") return "user-center";
  return view;
}

function renderSidebar(topView) {
  if (topView !== "models" || ui.view === "model-training-workspace") {
    els.sidebar.hidden = true;
    els.sidebar.innerHTML = "";
    return;
  }
  els.sidebar.hidden = false;
  els.sidebar.innerHTML = `
    <h2>模型管理</h2>
    <div class="platform-side-list">
      <button class="platform-side-item is-active" data-action="set-view" data-id="models">
        <span class="side-dot"></span>快捷模型
      </button>
    </div>
  `;
}

function handleAccountMenuClick(event) {
  const actionEl = event.target.closest("[data-account-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.accountAction;
  ui.accountMenuOpen = false;
  if (action === "user-center") return setView("user-center");
  if (action === "logout") {
    renderAccountMenu();
    return requestConfirmation("logout");
  }
}

function renderAccountMenu() {
  els.accountBtn.setAttribute("aria-expanded", String(Boolean(ui.accountMenuOpen)));
  els.accountMenu.hidden = !ui.accountMenuOpen;
  els.accountMenu.innerHTML = `
    <button class="account-menu-profile" role="menuitem" data-account-action="user-center">
      <span class="platform-user-avatar">${escapeHtml(state.account.nickname.slice(0, 1) || "雪")}</span>
      <strong>${escapeHtml(state.account.enterpriseName || state.account.nickname)}</strong>
      <span class="account-menu-arrow">›</span>
    </button>
    <button class="account-menu-logout" role="menuitem" data-account-action="logout">退出账号</button>
  `;
}

function renderHome() {
  const folders = state.folders.map((folder) => ({ ...folder, count: getFolderImages(folder.id).length }));
  els.main.innerHTML = `
    <section class="replica-home">
      <section class="home-journey-banner">
        <div class="home-journey-copy">
          <h1>点击开启 AI 智能检测之旅</h1>
          <p>更准确，更高效，更有性价比的检测方式</p>
        </div>
        <div class="home-mode-card">
          <strong>全民模式</strong>
          <span>2步完成模型定制，小白也能轻松上手~</span>
          <b>Base</b>
        </div>
      </section>
      <section class="home-overview-grid">
        <div class="home-overview-panel">
          <header><h2>我的终端</h2><span><b>${state.terminals.length}</b> 个终端</span></header>
          <div class="home-terminal-grid">
            ${state.terminals
              .map(
                (terminal) => `<article class="home-terminal-card">
                  <div><strong>${escapeHtml(terminal.name)}</strong><span>绑定时间：${formatDateTime(terminal.boundAt)}</span></div>
                  <em>${escapeHtml(terminal.status)}</em>
                </article>`,
              )
              .join("")}
          </div>
        </div>
        <div class="home-overview-panel">
          <header><h2>我的图像库</h2><span><b>${folders.length}</b> 个图片集　<b>${state.images.filter((image) => !image.libraryDeleted).length}</b> 个图像</span></header>
          <div class="home-folder-grid">
            ${folders
              .slice(0, 6)
              .map(
                (folder) => `<article class="home-folder-card" data-action="open-library-folder" data-id="${escapeAttr(folder.id)}">
                  <div><strong>${escapeHtml(folder.name)}</strong><span>${folder.count}张图片</span></div>
                  ${folder.cover ? `<img src="${escapeAttr(folder.cover)}" alt="" />` : `<span class="library-folder-icon is-large"></span>`}
                </article>`,
              )
              .join("")}
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderIconButton({ icon, label, className = "icon-btn", attrs = "", disabled = false }) {
  return `<button class="${className}" aria-label="${escapeAttr(label)}" title="${escapeAttr(label)}" ${attrs}${disabled ? " disabled" : ""}>${renderIcon(icon)}</button>`;
}

function renderIcon(name) {
  const paths = {
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3m13 5h3a2 2 0 0 0 2-2v-3"/>',
    pointer: '<path d="m5 3 14 9-6 2-3 6z"/>',
    box: '<rect x="4" y="5" width="16" height="14" rx="1"/>',
    undo: '<path d="M9 7 4 12l5 5"/><path d="M20 17a8 8 0 0 0-13-5"/>',
    redo: '<path d="m15 7 5 5-5 5"/><path d="M4 17a8 8 0 0 1 13-5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 10v7m4-7v7"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    download: '<path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 16V4m0 0 5 5m-5-5L7 9"/><path d="M5 20h14"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.more}</svg>`;
}

function renderModels() {
  const rows = state.models
    .filter((model) => ui.modelScene === "all" || model.sceneType === ui.modelScene)
    .filter((model) => !ui.modelQuery || model.name.toLowerCase().includes(ui.modelQuery.toLowerCase()));
  els.main.innerHTML = `
    <section class="platform-table-page model-list-page">
      <div class="platform-toolbar">
        <div class="toolbar-left">
          <select id="modelSceneSelect">
            <option value="all"${ui.modelScene === "all" ? " selected" : ""}>请选择场景类型</option>
            <option value="分类"${ui.modelScene === "分类" ? " selected" : ""}>分类</option>
            <option value="缺陷检测"${ui.modelScene === "缺陷检测" ? " selected" : ""}>缺陷检测</option>
          </select>
          <input id="modelQueryInput" value="${escapeAttr(ui.modelQuery)}" placeholder="请输入模型名称" />
        </div>
        <div class="toolbar-right">
          <button class="secondary-btn" data-action="reset-model-filter">重置</button>
          <button class="primary-btn" data-action="search-models">查询</button>
          <button class="primary-btn" data-action="new-model">新建模型</button>
        </div>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table">
          <thead><tr><th style="width:70px">序号</th><th>模型名称</th><th>场景类型</th><th>场景描述</th><th>创建时间</th><th>更新时间</th><th style="width:210px">操作</th></tr></thead>
          <tbody>
            ${rows
              .map(
                (model, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(model.name)}</td>
                  <td>${escapeHtml(model.sceneType)}</td>
                  <td>${escapeHtml(model.description || "")}</td>
                  <td>${formatDateTime(model.createdAt)}</td>
                  <td>${formatDateTime(model.updatedAt)}</td>
                  <td class="table-actions">
                    <button data-action="training-records" data-id="${escapeAttr(model.id)}">训练记录</button>
                    <button data-action="edit-model" data-id="${escapeAttr(model.id)}">编辑</button>
                    <button class="danger-link" data-action="delete-model" data-id="${escapeAttr(model.id)}">删除</button>
                  </td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      ${renderPager(rows.length)}
    </section>
  `;
}

function renderTrainingRecords() {
  const model = getSelectedModel();
  const rows = getRecords(model.id);
  els.main.innerHTML = `
    <section class="platform-table-page training-record-page">
      <div class="platform-toolbar">
        <div class="toolbar-context-group">
          <button class="secondary-btn" data-action="back-models">返回</button>
          ${renderModelContext(model)}
        </div>
        <button class="primary-btn" data-action="new-training">新建训练</button>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table">
          <thead><tr><th style="width:70px">序号</th><th>模型编号</th><th>创建时间</th><th style="width:340px">状态</th><th style="width:290px">操作</th></tr></thead>
          <tbody>
            ${
              rows.length
                ? rows.map((record, index) => renderRecordRow(record, index)).join("")
                : `<tr><td colspan="5"><div class="empty-state"><strong>暂无训练记录</strong></div></td></tr>`
            }
          </tbody>
        </table>
      </div>
      ${renderPager(rows.length)}
    </section>
  `;
}

function renderRecordRow(record, index) {
  const done = record.status === "训练完成";
  const pending = record.status === "待训练";
  const activeTraining = record.status === "排队中" || record.status === "训练中";
  return `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(record.code)}</td>
      <td>${formatDateTime(record.createdAt)}</td>
      <td>${renderTrainingStatus(record)}</td>
      <td class="table-actions">
        <button data-action="open-training" data-id="${escapeAttr(record.id)}">${pending ? "标注" : "查看标注"}</button>
        <button data-action="open-test" data-id="${escapeAttr(record.id)}"${done ? "" : " disabled"}>测试</button>
        <button data-action="download-model" data-id="${escapeAttr(record.id)}"${done ? "" : " disabled"}>下载</button>
        <span class="record-more">
          ${renderIconButton({ icon: "more", label: "更多", className: "table-icon-btn", attrs: `data-action="record-more" data-id="${escapeAttr(record.id)}"` })}
          ${
            ui.openRecordMenu === record.id
              ? `<span class="record-menu">
                  ${activeTraining ? `<button data-action="cancel-training" data-id="${escapeAttr(record.id)}">取消训练</button>` : ""}
                  <button class="danger-link" data-action="delete-record" data-id="${escapeAttr(record.id)}"${activeTraining ? ' disabled title="请先取消训练"' : ""}>${activeTraining ? "请先取消训练" : "删除记录"}</button>
                </span>`
              : ""
          }
        </span>
      </td>
    </tr>
  `;
}

function renderTrainingStatus(record) {
  if (record.status === "排队中") {
    return `<span class="training-status is-queued">排队中</span><span class="training-meta">前方 ${record.queuePosition || 1} 个任务 · ${escapeHtml(record.waitText || "等待时间计算中")}</span>`;
  }
  if (record.status === "训练中") {
    return `<span class="training-status is-training">训练中</span><span class="training-meta">${escapeHtml(record.elapsedText || "正在训练")} · ${escapeHtml(record.remainingText || "剩余时间计算中")}</span>`;
  }
  if (record.status === "训练完成") {
    return `<span class="training-status is-done">训练完成</span><span class="training-meta">完成时间：${formatDateTime(record.completedAt)} · 训练耗时：${escapeHtml(record.duration || "")}</span>`;
  }
  return `<span class="training-status is-pending">待训练</span>`;
}

function renderTrainingWorkspace() {
  const model = getSelectedModel();
  const record = getSelectedRecord();
  if (!record) return setView("model-training-records");
  const images = record.imageIds.map(getImage).filter(Boolean);
  const completed = new Set(record.completedImageIds || []);
  const visibleImages = images.filter((image) => (ui.trainingTab === "completed" ? completed.has(image.id) : !completed.has(image.id)));
  const batchEditable = record.status === "待训练";
  const allVisibleSelected = visibleImages.length > 0 && visibleImages.every((image) => trainingSelection.has(image.id));
  if (!ui.activeImageId || !visibleImages.some((image) => image.id === ui.activeImageId)) {
    ui.activeImageId = (visibleImages[0] || {}).id || "";
  }
  const activeImage = getImage(ui.activeImageId);
  const canStart = record.status === "待训练" && images.length >= 2 && images.every((image) => completed.has(image.id));
  els.main.innerHTML = `
    <section class="training-workspace">
      <div class="training-top-actions">
        <button class="secondary-btn" data-action="back-records">退出训练</button>
        ${renderModelContext(model, record)}
        <span class="training-spacer"></span>
        <button class="secondary-btn" data-action="open-image-picker" data-mode="training"${record.status === "待训练" ? "" : " disabled"}>添加图像</button>
        <button class="primary-btn" data-action="start-training"${canStart ? "" : " disabled"}>开始训练</button>
      </div>
      <div class="training-body">
        <aside class="training-image-list">
          <div class="training-tabs">
            <button class="${ui.trainingTab === "pending" ? "is-active" : ""}" data-action="select-training-tab" data-id="pending">待处理 <span>(${images.length - completed.size})</span></button>
            <button class="${ui.trainingTab === "completed" ? "is-active" : ""}" data-action="select-training-tab" data-id="completed">已完成 <span>(${completed.size})</span></button>
          </div>
          <div class="training-list-header${ui.trainingBatchMode ? " is-batch" : ""}>
            ${ui.trainingBatchMode ? '<span class="training-check-placeholder"></span>' : ""}
            <span>序号</span><span>名称</span><span>操作</span>
          </div>
          <div class="training-group">codex-test-data (${visibleImages.length})</div>
          <div class="training-image-scroll">
            ${
              visibleImages.length
                ? visibleImages
                    .map(
                      (image, index) => `
                        <div class="training-image-row${ui.trainingBatchMode ? " is-batch" : ""}${image.id === ui.activeImageId ? " is-active" : ""}${trainingSelection.has(image.id) ? " is-selected" : ""}" data-action="select-training-image" data-id="${escapeAttr(image.id)}">
                          ${ui.trainingBatchMode ? `<input type="checkbox" data-action="toggle-training-selection" data-id="${escapeAttr(image.id)}"${trainingSelection.has(image.id) ? " checked" : ""} aria-label="选择 ${escapeAttr(image.name)}" />` : ""}
                          <span>No.${index + 1}</span>
                          <span title="${escapeAttr(image.name)}">${escapeHtml(shortenName(image.name))}${completed.has(image.id) ? ' <b class="complete-mark">✓</b>' : ""}</span>
                          ${
                            ui.trainingBatchMode
                              ? '<span class="training-row-selection-state"></span>'
                              : renderIconButton({ icon: "trash", label: "删除图像", className: "row-icon-btn danger-icon", attrs: `data-action="delete-training-image" data-id="${escapeAttr(image.id)}"`, disabled: !batchEditable })
                          }
                        </div>`,
                    )
                    .join("")
                : `<div class="empty-state"><strong>${ui.trainingTab === "pending" ? "所有图像均已完成" : "暂无已完成图像"}</strong></div>`
            }
          </div>
          ${
            ui.trainingBatchMode
              ? `<div class="training-batch-actions">
                  <span>已选 ${trainingSelection.size} 张</span>
                  <button data-action="toggle-training-visible">${allVisibleSelected ? "取消全选" : "当前列表全选"}</button>
                  <button class="danger-link" data-action="delete-training-selection"${trainingSelection.size ? "" : " disabled"}>删除所选</button>
                  <button data-action="toggle-training-batch">退出</button>
                </div>`
              : `<button class="training-batch-btn" data-action="toggle-training-batch"${visibleImages.length && batchEditable ? "" : " disabled"}>批量处理</button>`
          }
        </aside>
        <section class="annotation-stage">
          ${activeImage ? renderAnnotationEditor(record, activeImage) : renderAnnotationEmpty(record)}
        </section>
      </div>
    </section>
  `;
  if (activeImage) bindAnnotationCanvas();
}

function renderAnnotationEditor(record, image) {
  const editable = record.status === "待训练";
  const canvasWidth = ui.canvasZoom === 1 ? "min(100%, 1120px)" : `${Math.round(1120 * ui.canvasZoom)}px`;
  return `
    <div class="annotation-toolbar">
      ${renderIconButton({ icon: "minus", label: "缩小", className: "canvas-tool", attrs: 'data-action="canvas-zoom-out"', disabled: ui.canvasZoom <= 0.5 })}
      <span class="canvas-zoom-value">${Math.round(ui.canvasZoom * 100)}%</span>
      ${renderIconButton({ icon: "plus", label: "放大", className: "canvas-tool", attrs: 'data-action="canvas-zoom-in"', disabled: ui.canvasZoom >= 2 })}
      ${renderIconButton({ icon: "maximize", label: "适配窗口", className: "canvas-tool", attrs: 'data-action="canvas-fit"' })}
      ${renderIconButton({ icon: "pointer", label: "选择", className: `canvas-tool${ui.canvasTool === "select" ? " is-active" : ""}`, attrs: 'data-action="canvas-tool" data-id="select"' })}
      ${renderIconButton({ icon: "box", label: "矩形标注", className: `canvas-tool${ui.canvasTool === "rect" ? " is-active" : ""}`, attrs: 'data-action="canvas-tool" data-id="rect"', disabled: !editable })}
      ${renderIconButton({ icon: "undo", label: "撤销", className: "canvas-tool", attrs: 'data-action="undo-annotation"', disabled: !editable })}
      ${renderIconButton({ icon: "redo", label: "重做", className: "canvas-tool", attrs: 'data-action="redo-annotation"', disabled: !editable })}
      ${renderIconButton({ icon: "trash", label: "删除标注框", className: "canvas-tool danger-icon", attrs: 'data-action="delete-selected-box"', disabled: !editable || ui.selectedAnnotation < 0 })}
    </div>
    <div class="annotation-layout">
      <div class="annotation-canvas-wrap">
        <svg class="annotation-canvas" id="annotationCanvas" style="width:${canvasWidth}" viewBox="0 0 1000 625" aria-label="标注画布">
          <image href="${escapeAttr(image.url)}" x="0" y="0" width="1000" height="625" preserveAspectRatio="xMidYMid slice"></image>
          <rect class="draw-surface" data-draw-surface="true" x="0" y="0" width="1000" height="625"></rect>
          <g id="annotationOverlay">${renderAnnotationBoxes(record, image.id)}</g>
          <rect id="draftBox" x="0" y="0" width="0" height="0" fill="rgba(245,34,45,.08)" stroke="#f5222d" stroke-width="3" hidden></rect>
        </svg>
      </div>
      <aside class="label-panel">
        <div class="label-panel-header">标签</div>
        <div class="label-list">
          ${record.labels
            .map((label) => {
              const count = (record.annotations[image.id] || []).filter((box) => box.labelId === label.id).length;
              return `
                <button class="label-item${ui.activeLabelId === label.id ? " is-active" : ""}" data-action="select-label" data-id="${escapeAttr(label.id)}">
                  <span class="label-swatch" style="background:${escapeAttr(label.color)}"></span>
                  <span>${escapeHtml(label.name)}</span>
                  <span class="label-count">${count}</span>
                </button>`;
            })
            .join("")}
        </div>
        <div class="label-panel-actions"><button data-action="add-label"${editable ? "" : " disabled"}>${renderIcon("plus")}<span>添加标签</span></button></div>
      </aside>
    </div>
    <div class="annotation-footer">
      <button class="primary-btn" data-action="complete-image"${editable ? "" : " disabled"}>${record.completedImageIds.includes(image.id) ? "保存修改" : "完成"}</button>
    </div>
  `;
}

function renderAnnotationBoxes(record, imageId) {
  const boxes = record.annotations[imageId] || [];
  return boxes
    .map((box, index) => {
      const label = record.labels.find((item) => item.id === box.labelId) || record.labels[0];
      const selected = index === ui.selectedAnnotation;
      return `
        <g data-box-group="${index}">
          <rect class="annotation-box${selected ? " is-selected" : ""}" data-box-index="${index}" data-box-shape="${index}" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" stroke="${escapeAttr(label.color)}"></rect>
          <rect class="annotation-caption-bg" data-caption-bg="${index}" x="${box.x}" y="${Math.max(0, box.y - 27)}" width="${Math.max(64, label.name.length * 17 + 24)}" height="27" fill="${escapeAttr(label.color)}"></rect>
          <text class="annotation-caption" data-caption-text="${index}" x="${box.x + 8}" y="${Math.max(19, box.y - 8)}">${escapeHtml(label.name)}</text>
          ${
            selected
              ? [
                  ["nw", box.x, box.y],
                  ["ne", box.x + box.w, box.y],
                  ["sw", box.x, box.y + box.h],
                  ["se", box.x + box.w, box.y + box.h],
                ]
                  .map(
                    ([handle, x, y]) =>
                      `<rect class="annotation-handle" data-box-index="${index}" data-handle="${handle}" x="${x - 6}" y="${y - 6}" width="12" height="12" stroke="${escapeAttr(label.color)}"></rect>`,
                  )
                  .join("")
              : ""
          }
        </g>`;
    })
    .join("");
}

function renderAnnotationEmpty(record) {
  return `
    <div class="empty-state">
      <strong>暂无图像</strong>
      <button class="primary-btn" data-action="open-image-picker" data-mode="training"${record.status === "待训练" ? "" : " disabled"}>添加图像</button>
    </div>
  `;
}

function bindAnnotationCanvas() {
  const svg = document.getElementById("annotationCanvas");
  if (!svg) return;
  svg.addEventListener("pointerdown", annotationPointerDown);
  svg.addEventListener("pointermove", annotationPointerMove);
  svg.addEventListener("pointerup", annotationPointerUp);
  svg.addEventListener("pointercancel", annotationPointerUp);
}

function annotationPointerDown(event) {
  const record = getSelectedRecord();
  if (!record || record.status !== "待训练") return;
  const svg = event.currentTarget;
  const point = svgPoint(svg, event);
  const boxIndex = Number(event.target.dataset.boxIndex);
  const hasBoxIndex = Number.isInteger(boxIndex) && boxIndex >= 0;
  const boxes = record.annotations[ui.activeImageId] || [];

  if (hasBoxIndex && boxes[boxIndex]) {
    ui.selectedAnnotation = boxIndex;
    pushHistory();
    pointerSession = {
      type: event.target.dataset.handle ? "resize" : "move",
      handle: event.target.dataset.handle || "",
      boxIndex,
      start: point,
      original: { ...boxes[boxIndex] },
    };
  } else if (ui.canvasTool === "rect") {
    pointerSession = { type: "draw", start: point, drawing: false };
  } else {
    ui.selectedAnnotation = -1;
    render();
    return;
  }
  svg.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function annotationPointerMove(event) {
  if (!pointerSession) return;
  const svg = event.currentTarget;
  const point = svgPoint(svg, event);
  const record = getSelectedRecord();
  const boxes = record.annotations[ui.activeImageId] || [];

  if (pointerSession.type === "draw") {
    const movedEnough = Math.abs(point.x - pointerSession.start.x) + Math.abs(point.y - pointerSession.start.y) > 3;
    if (!movedEnough) return;
    pointerSession.drawing = true;
    const draft = normalizeBox(pointerSession.start, point);
    const draftEl = document.getElementById("draftBox");
    draftEl.hidden = false;
    setRectAttributes(draftEl, draft);
    return;
  }

  const box = boxes[pointerSession.boxIndex];
  if (!box) return;
  const dx = point.x - pointerSession.start.x;
  const dy = point.y - pointerSession.start.y;
  if (pointerSession.type === "move") {
    box.x = clamp(pointerSession.original.x + dx, 0, 1000 - box.w);
    box.y = clamp(pointerSession.original.y + dy, 0, 625 - box.h);
  } else {
    applyResize(box, pointerSession.original, pointerSession.handle, dx, dy);
  }
  updateBoxDom(svg, pointerSession.boxIndex, box, record);
}

function annotationPointerUp(event) {
  if (!pointerSession) return;
  const record = getSelectedRecord();
  const point = svgPoint(event.currentTarget, event);
  if (pointerSession.type === "draw" && pointerSession.drawing) {
    const box = normalizeBox(pointerSession.start, point);
    if (box.w >= 8 && box.h >= 8) {
      pushHistory();
      if (!record.annotations[ui.activeImageId]) record.annotations[ui.activeImageId] = [];
      record.annotations[ui.activeImageId].push({
        ...box,
        labelId: ui.activeLabelId || record.labels[0].id,
      });
      ui.selectedAnnotation = record.annotations[ui.activeImageId].length - 1;
    }
  }
  pointerSession = null;
  saveState();
  render();
}

function applyResize(box, original, handle, dx, dy) {
  let left = original.x;
  let top = original.y;
  let right = original.x + original.w;
  let bottom = original.y + original.h;
  if (handle.includes("w")) left = clamp(original.x + dx, 0, right - 8);
  if (handle.includes("e")) right = clamp(original.x + original.w + dx, left + 8, 1000);
  if (handle.includes("n")) top = clamp(original.y + dy, 0, bottom - 8);
  if (handle.includes("s")) bottom = clamp(original.y + original.h + dy, top + 8, 625);
  box.x = left;
  box.y = top;
  box.w = right - left;
  box.h = bottom - top;
}

function updateBoxDom(svg, index, box, record) {
  const shape = svg.querySelector(`[data-box-shape="${index}"]`);
  if (shape) setRectAttributes(shape, box);
  const captionBg = svg.querySelector(`[data-caption-bg="${index}"]`);
  const captionText = svg.querySelector(`[data-caption-text="${index}"]`);
  if (captionBg) {
    captionBg.setAttribute("x", box.x);
    captionBg.setAttribute("y", Math.max(0, box.y - 27));
  }
  if (captionText) {
    captionText.setAttribute("x", box.x + 8);
    captionText.setAttribute("y", Math.max(19, box.y - 8));
  }
  const handlePoints = {
    nw: [box.x, box.y],
    ne: [box.x + box.w, box.y],
    sw: [box.x, box.y + box.h],
    se: [box.x + box.w, box.y + box.h],
  };
  Object.entries(handlePoints).forEach(([handle, [x, y]]) => {
    const element = svg.querySelector(`[data-box-index="${index}"][data-handle="${handle}"]`);
    if (element) {
      element.setAttribute("x", x - 6);
      element.setAttribute("y", y - 6);
    }
  });
}

function renderTestWorkspace() {
  const model = getSelectedModel();
  const record = getSelectedRecord();
  if (!record || record.status !== "训练完成") return setView("model-training-records");
  const images = (record.testImageIds || []).map(getImage).filter(Boolean);
  if (!ui.activeTestImageId || !images.some((image) => image.id === ui.activeTestImageId)) {
    ui.activeTestImageId = (images[0] || {}).id || "";
  }
  const activeImage = getImage(ui.activeTestImageId);
  els.main.innerHTML = `
    <section class="test-workspace">
      <div class="training-top-actions">
        <button class="secondary-btn" data-action="back-records">退出测试</button>
        <button class="primary-btn" data-action="open-image-picker" data-mode="test">添加图像</button>
        <span class="training-spacer"></span>
        <button class="primary-btn" data-action="run-test"${images.length && !ui.testRunning ? "" : " disabled"}>${ui.testRunning ? "测试中..." : Object.keys(record.testResults || {}).length ? "重新测试" : "开始测试"}</button>
      </div>
      <div class="test-body">
        <aside class="test-list">
          <div class="test-list-header"><span>序号</span><span>名称</span><span>结果</span></div>
          <div class="training-image-scroll">
            ${
              images.length
                ? images
                    .map((image, index) => {
                      const result = record.testResults[image.id];
                      return `
                        <div class="test-image-row${image.id === ui.activeTestImageId ? " is-active" : ""}" data-action="select-test-image" data-id="${escapeAttr(image.id)}">
                          <span>${index + 1}</span>
                          <span title="${escapeAttr(image.name)}">${escapeHtml(shortenName(image.name))}</span>
                          <span class="${result ? "test-result-done" : "test-result-wait"}">${result ? "检测完成" : "未测试"}</span>
                        </div>`;
                    })
                    .join("")
                : `<div class="empty-state"><strong>暂无测试图像</strong></div>`
            }
          </div>
        </aside>
        <section class="test-viewer">
          ${activeImage ? renderTestCanvas(activeImage, record.testResults[activeImage.id]) : `<div class="empty-state"><strong>请选择测试图像</strong></div>`}
        </section>
      </div>
    </section>
  `;
}

function renderTestCanvas(image, result) {
  return `
    <svg class="test-canvas" viewBox="0 0 1000 625" aria-label="测试结果">
      <image href="${escapeAttr(image.url)}" x="0" y="0" width="1000" height="625" preserveAspectRatio="xMidYMid slice"></image>
      ${(result?.boxes || [])
        .map(
          (box) => `
            <rect class="result-box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"></rect>
            <rect class="result-label-bg" x="${box.x}" y="${Math.max(0, box.y - 28)}" width="112" height="28"></rect>
            <text x="${box.x + 8}" y="${Math.max(20, box.y - 8)}">${escapeHtml(box.label)} ${Math.round(box.score * 100)}%</text>`,
        )
        .join("")}
    </svg>
  `;
}

function renderLibrary() {
  const folders = state.folders.map((folder) => ({ ...folder, count: getFolderImages(folder.id).length }));
  els.main.innerHTML = `
    <section class="platform-table-page library-root-page">
      <div class="library-page-head">
        <div><h1>图像库</h1></div>
        <button class="primary-btn" data-action="new-folder">新建文件夹</button>
      </div>
      <div class="library-actionbar">
        <div class="segmented-control">
          ${renderIconButton({ icon: "list", label: "列表", className: ui.libraryMode === "list" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="list"' })}
          ${renderIconButton({ icon: "grid", label: "宫格", className: ui.libraryMode === "grid" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="grid"' })}
        </div>
        <span>${folders.length} 个文件夹 · ${state.images.filter((image) => !image.libraryDeleted).length} 张图像</span>
      </div>
      ${
        ui.libraryMode === "grid"
          ? `<div class="library-folder-grid">${folders.map(renderLibraryFolderCard).join("")}</div>`
          : `<div class="platform-table-wrap">
              <table class="platform-data-table">
                <thead><tr><th>名称</th><th>图像数量</th><th>最近更新</th><th style="width:190px">操作</th></tr></thead>
                <tbody>${folders
                  .map(
                    (folder) => `<tr>
                      <td><button class="library-folder-name" data-action="open-library-folder" data-id="${escapeAttr(folder.id)}"><span class="library-folder-icon"></span>${escapeHtml(folder.name)}</button></td>
                      <td>${folder.count}</td>
                      <td>${formatDateTime(folder.updatedAt || folder.createdAt || "") || "2026-06-11 09:00:00"}</td>
                      <td class="table-actions">
                        <button data-action="rename-folder" data-id="${escapeAttr(folder.id)}">修改</button>
                        <button data-action="export-folder" data-id="${escapeAttr(folder.id)}">导出</button>
                        <button class="danger-link" data-action="delete-folder" data-id="${escapeAttr(folder.id)}">删除</button>
                      </td>
                    </tr>`,
                  )
                  .join("")}</tbody>
              </table>
            </div>`
      }
      ${renderPager(folders.length)}
    </section>
  `;
}

function renderLibraryFolderCard(folder) {
  return `
    <article class="library-folder-tile" data-action="open-library-folder" data-id="${escapeAttr(folder.id)}">
      <div class="library-folder-cover">
        ${folder.cover ? `<img src="${escapeAttr(folder.cover)}" alt="" />` : `<span class="library-folder-icon is-large"></span>`}
      </div>
      <div class="library-folder-meta">
        <strong>${escapeHtml(folder.name)}</strong>
        <span>${folder.count} 张图像</span>
      </div>
      <div class="library-tile-actions">
        ${renderIconButton({ icon: "edit", label: `修改 ${folder.name}`, className: "library-tile-action", attrs: `data-action="rename-folder" data-id="${escapeAttr(folder.id)}"` })}
        ${renderIconButton({ icon: "download", label: `导出 ${folder.name}`, className: "library-tile-action", attrs: `data-action="export-folder" data-id="${escapeAttr(folder.id)}"` })}
      </div>
      ${renderIconButton({ icon: "trash", label: `删除 ${folder.name}`, className: "library-tile-delete", attrs: `data-action="delete-folder" data-id="${escapeAttr(folder.id)}"` })}
    </article>
  `;
}

function renderLibraryFolder() {
  const folder = state.folders.find((item) => item.id === ui.selectedFolderId) || state.folders[0];
  if (!folder) return setView("library");
  const images = getFilteredLibraryImages(folder.id);
  const allSelected = images.length > 0 && images.every((image) => librarySelection.has(image.id));
  const devices = Array.from(new Set(getFolderImages(folder.id).map((image) => image.device).filter(Boolean)));
  els.main.innerHTML = `
    <section class="platform-table-page library-folder-page">
      <div class="library-page-head">
        <div class="library-folder-heading">
          ${renderIconButton({ icon: "back", label: "返回图像库", className: "library-back-btn", attrs: 'data-action="back-library"' })}
          <div><h1>${escapeHtml(folder.name)}</h1><p>${getFolderImages(folder.id).length} 张图像</p></div>
        </div>
        <button class="primary-btn" data-action="upload-library-image">上传图像</button>
      </div>
      <div class="library-actionbar">
        <div class="segmented-control">
          ${renderIconButton({ icon: "list", label: "列表", className: ui.libraryMode === "list" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="list"' })}
          ${renderIconButton({ icon: "grid", label: "宫格", className: ui.libraryMode === "grid" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="grid"' })}
        </div>
        <select id="libraryDeviceSelect" aria-label="采集设备">
          <option value="all">请选择设备</option>
          ${devices.map((device) => `<option value="${escapeAttr(device)}"${ui.libraryDevice === device ? " selected" : ""}>${escapeHtml(device)}</option>`).join("")}
        </select>
        <select id="libraryTagSelect" aria-label="图像标签">
          <option value="all">请选择标签</option>
          ${(state.libraryTags || []).map((tag) => `<option value="${escapeAttr(tag.name)}"${ui.libraryTag === tag.name ? " selected" : ""}>${escapeHtml(tag.name)}</option>`).join("")}
        </select>
        <button class="secondary-btn" data-action="open-label-library">标签库</button>
        <span class="library-action-spacer"></span>
        <input id="libraryQueryInput" value="${escapeAttr(ui.libraryQuery)}" placeholder="请输入图像名称" />
        <button class="secondary-btn" data-action="search-library">查询</button>
        <button class="ghost-btn" data-action="reset-library-search">重置</button>
      </div>
      <div class="library-batchbar">
        <button class="secondary-btn" data-action="toggle-library-all">${allSelected ? "取消全选" : "全选当前结果"}</button>
        <button class="secondary-btn" data-action="open-assign-tag"${librarySelection.size ? "" : " disabled"}>设置标签 (${librarySelection.size})</button>
        <button class="secondary-btn" data-action="export-library-selection"${librarySelection.size ? "" : " disabled"}>导出所选</button>
        <button class="secondary-btn danger-outline" data-action="delete-library-selection"${librarySelection.size ? "" : " disabled"}>删除所选</button>
      </div>
      ${
        images.length
          ? ui.libraryMode === "grid"
            ? renderLibraryImageGrid(images)
            : renderLibraryImageTable(images)
          : `<div class="empty-state"><strong>暂无图像</strong></div>`
      }
      ${renderPager(images.length)}
    </section>
  `;
}

function renderLibraryImageTable(images) {
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table library-image-table">
        <thead><tr><th style="width:48px"></th><th>名称</th><th>图像尺寸</th><th>采集时间</th><th>采集设备</th><th>标签</th><th style="width:100px">操作</th></tr></thead>
        <tbody>${images
          .map(
            (image) => `<tr class="${librarySelection.has(image.id) ? "is-selected" : ""}">
              <td><input type="checkbox" data-action="toggle-library-image" data-id="${escapeAttr(image.id)}"${librarySelection.has(image.id) ? " checked" : ""} /></td>
              <td><button class="library-image-name" data-action="open-image-detail" data-id="${escapeAttr(image.id)}"><img src="${escapeAttr(image.url)}" alt="" /><span>${escapeHtml(image.name)}</span></button></td>
              <td>${escapeHtml(image.size || "1920 × 1080")}</td>
              <td>${formatDateTime(image.capturedAt) || ""}</td>
              <td>${escapeHtml(image.device || "")}</td>
              <td>${image.tag ? `<span class="image-tag">${escapeHtml(image.tag)}</span>` : ""}</td>
              <td class="table-actions"><button class="danger-link" data-action="delete-library-image" data-id="${escapeAttr(image.id)}">删除</button></td>
            </tr>`,
          )
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderLibraryImageGrid(images) {
  return `
    <div class="library-image-grid">
      ${images
        .map(
          (image) => `<article class="library-image-tile${librarySelection.has(image.id) ? " is-selected" : ""}">
            <input type="checkbox" data-action="toggle-library-image" data-id="${escapeAttr(image.id)}"${librarySelection.has(image.id) ? " checked" : ""} aria-label="选择 ${escapeAttr(image.name)}" />
            ${renderIconButton({ icon: "trash", label: `删除 ${image.name}`, className: "library-image-delete", attrs: `data-action="delete-library-image" data-id="${escapeAttr(image.id)}"` })}
            <button class="library-image-preview" data-action="open-image-detail" data-id="${escapeAttr(image.id)}">
              <img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.name)}" />
              <span><strong title="${escapeAttr(image.name)}">${escapeHtml(image.name)}</strong><small>${escapeHtml(image.device || "未关联设备")} · ${escapeHtml(image.tag || "无标签")}</small></span>
            </button>
          </article>`,
        )
        .join("")}
    </div>
  `;
}

function renderClients() {
  const rows = getFilteredClients();
  els.main.innerHTML = `
    <section class="platform-table-page client-page">
      <div class="client-title-row"><h1>客户端管理</h1><span class="inline-metric">客户端配额：${state.terminals.length}/${state.enterprise.clientQuota}</span></div>
      <div class="platform-toolbar client-toolbar">
        <div class="toolbar-left">
          <select id="clientStatusSelect" aria-label="客户端状态">
            <option value="all"${ui.clientStatus === "all" ? " selected" : ""}>请选择客户端状态</option>
            <option value="离线"${ui.clientStatus === "离线" ? " selected" : ""}>离线</option>
            <option value="在线"${ui.clientStatus === "在线" ? " selected" : ""}>在线</option>
          </select>
          <input id="clientQueryInput" value="${escapeAttr(ui.clientQuery)}" placeholder="请输入客户端名称或硬件识别码" />
        </div>
        <div class="toolbar-right">
          <button class="secondary-btn" data-action="reset-clients">重置</button>
          <button class="primary-btn" data-action="search-clients">查询</button>
        </div>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table client-table">
          <thead><tr><th>客户端名称</th><th>硬件识别码</th><th>绑定时间</th><th>客户端状态</th><th>最近离线时间</th></tr></thead>
          <tbody>${rows
            .map(
              (terminal) => `<tr>
                <td>${escapeHtml(terminal.name)}</td>
                <td class="hardware-code" title="${escapeAttr(terminal.hardwareCode)}">${escapeHtml(terminal.hardwareCode)}</td>
                <td>${formatDateTime(terminal.boundAt)}</td>
                <td>${renderClientStatus(terminal.status)}</td>
                <td>${terminal.status === "在线" ? "-" : formatDateTime(terminal.offlineAt)}</td>
              </tr>`,
            )
            .join("")}</tbody>
        </table>
      </div>
      ${renderPager(rows.length)}
    </section>
  `;
}

function renderUserCenter() {
  const account = state.account;
  els.main.innerHTML = `
    <section class="user-center-page">
      <div class="user-center-shell">
        <header class="user-center-hero">
          <img src="./logo&icon/Group@2x.png" alt="" />
          <h1>个人中心</h1>
        </header>
        <div class="user-center-content">
          <h2>账号信息：</h2>
          <section class="user-info-card">
            <div class="user-info-form">
              <label><span>账号：</span><input value="${escapeAttr(account.phone)}" disabled /></label>
              <label><span>密码：</span><input id="accountNewPassword" type="${ui.accountEditingPassword ? "password" : "text"}" value="${ui.accountEditingPassword ? "" : "******"}" ${ui.accountEditingPassword ? 'placeholder="请输入新密码" maxlength="16"' : "disabled"} /></label>
              ${ui.accountEditingPassword ? '<p class="password-rule">请输入 8-16 位字符，至少包含数字、大/小写字母、特殊字符中的任意 2 种</p>' : ""}
            </div>
            ${
              ui.accountEditingPassword
                ? `<div class="user-card-actions is-split">
                    <button data-action="cancel-account-password">${renderIcon("close")}<span>取消</span></button>
                    <button data-action="save-password">${renderIcon("check")}<span>确认</span></button>
                  </div>`
                : `<div class="user-card-actions"><button data-action="edit-account-password">${renderIcon("edit")}<span>修改密码</span></button></div>`
            }
          </section>
          <h2>企业信息：</h2>
          <section class="company-info-card">
            ${
              ui.accountEditingCompany
                ? `<div class="company-edit-form">
                    <label><span>企业名称：</span><input id="companyNameInput" value="${escapeAttr(account.enterpriseName)}" maxlength="20" /></label>
                    <label><span>行业分类：</span><select id="companyIndustryInput">
                      ${["智能制造", "汽车制造", "电子制造", "其他"].map((industry) => `<option value="${industry}"${account.industry === industry ? " selected" : ""}>${industry}</option>`).join("")}
                    </select></label>
                    <label><span>联系人：</span><input id="companyContactInput" value="${escapeAttr(account.contactName)}" maxlength="20" /></label>
                    <label><span>联系方式：</span><input id="companyPhoneInput" value="${escapeAttr(account.contactPhone)}" maxlength="20" /></label>
                  </div>
                  <div class="user-card-actions is-split">
                    <button data-action="cancel-company">${renderIcon("close")}<span>取消</span></button>
                    <button data-action="save-company">${renderIcon("check")}<span>保存</span></button>
                  </div>`
                : `<dl class="company-info-list">
                    <div><dt>企业名称：</dt><dd>${escapeHtml(account.enterpriseName)}</dd></div>
                    <div><dt>行业分类：</dt><dd>${escapeHtml(account.industry)}</dd></div>
                    <div><dt>联系人：</dt><dd>${escapeHtml(account.contactName)}</dd></div>
                    <div><dt>联系方式：</dt><dd>${escapeHtml(account.contactPhone)}</dd></div>
                  </dl>
                  <div class="user-card-actions"><button data-action="edit-company">${renderIcon("edit")}<span>编辑</span></button></div>`
            }
          </section>
        </div>
      </div>
    </section>
  `;
}

function renderClientStatus(status) {
  return `<span class="client-status ${status === "在线" ? "is-online" : "is-offline"}">${escapeHtml(status)}</span>`;
}

function renderModelContext(model, record = null) {
  return `
    <div class="model-context" aria-label="当前模型信息">
      <span>模型</span>
      <strong title="${escapeAttr(model.name)}">${escapeHtml(model.name)}</strong>
      ${record ? `<i></i><span>版本</span><strong>${escapeHtml(record.code)}</strong>` : ""}
    </div>
  `;
}

function renderPager(total) {
  return `<div class="platform-table-footer"><span>共 ${total} 条</span><span class="pager-current">1</span><span>20条/页</span></div>`;
}

function renderDemoController() {
  const selected = getSelectedRecord();
  demoController.className = `demo-controller${ui.demoOpen ? " is-open" : ""}`;
  if (!ui.demoOpen) {
    demoController.innerHTML = renderIconButton({ icon: "sliders", label: "演示场景", className: "demo-toggle-btn", attrs: 'data-demo-action="toggle"' });
    return;
  }
  demoController.innerHTML = `
    <div class="demo-controller-head"><strong>演示场景</strong>${renderIconButton({ icon: "close", label: "收起", className: "demo-close-btn", attrs: 'data-demo-action="toggle"' })}</div>
    <select id="demoScenarioSelect" aria-label="切换演示场景">
      <option value="">选择场景</option>
      <option value="pending">标注未完成</option>
      <option value="ready">可开始训练</option>
      <option value="queued">排队中</option>
      <option value="training">训练中</option>
      <option value="done">训练完成</option>
      <option value="test">测试结果</option>
    </select>
    <button data-demo-action="apply">切换</button>
    <button data-demo-action="advance"${selected && (selected.status === "排队中" || selected.status === "训练中") ? "" : " disabled"}>推进状态</button>
    <button data-demo-action="reset">重置</button>
  `;
}

function openModelModal(modelId = "") {
  const model = state.models.find((item) => item.id === modelId);
  modal = { type: "model", modelId, model: model ? { ...model } : null };
  renderModal();
}

function openLabelModal() {
  modal = { type: "label" };
  renderModal();
}

function openFolderModal(folderId = "") {
  modal = { type: "folder", folderId };
  renderModal();
}

function openUploadModal() {
  modal = { type: "upload", mode: "", uploads: [] };
  renderModal();
}

function openImageDetail(imageId) {
  modal = { type: "image-detail", imageId };
  renderModal();
}

function openLabelLibrary() {
  modal = { type: "library-tags" };
  renderModal();
}

function openAssignTagModal() {
  if (!librarySelection.size) return;
  modal = { type: "assign-tag", imageIds: Array.from(librarySelection) };
  renderModal();
}

function openImagePicker(mode) {
  const record = getSelectedRecord();
  const selectedIds = (mode === "test" ? record.testImageIds || [] : record.imageIds || []).filter((imageId) => !getImage(imageId)?.libraryDeleted);
  pickerSelection = new Set(selectedIds);
  modal = { type: "picker", mode, folderId: state.folders[0].id, query: "" };
  renderModal();
}

function renderModal() {
  if (!modal) {
    modalRoot.innerHTML = "";
    return;
  }
  if (modal.type === "model") {
    const model = modal.model || { name: "", sceneType: "缺陷检测", description: "" };
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>${modal.modelId ? "编辑模型" : "新建模型"}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label class="required">模型名称</label><input id="modalModelName" value="${escapeAttr(model.name)}" maxlength="30" /></div>
              <div class="form-field"><label class="required">场景类型</label><select id="modalModelScene"><option value="缺陷检测"${model.sceneType === "缺陷检测" ? " selected" : ""}>缺陷检测</option><option value="分类"${model.sceneType === "分类" ? " selected" : ""}>分类</option></select></div>
              <div class="form-field"><label>场景描述</label><textarea id="modalModelDescription" maxlength="100">${escapeHtml(model.description || "")}</textarea></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="save-model">确定</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "label") {
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>添加标签</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label class="required">标签名称</label><input id="modalLabelName" value="" maxlength="12" placeholder="例如：划痕" /></div>
              <div class="form-field"><label>标签颜色</label><select id="modalLabelColor">${LABEL_COLORS.map((color) => `<option value="${color}">${color}</option>`).join("")}</select></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="save-label">确定</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "folder") {
    const folder = state.folders.find((item) => item.id === modal.folderId);
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>${folder ? "修改文件夹" : "新建文件夹"}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label class="required">文件夹名称</label><input id="modalFolderName" value="${escapeAttr(folder?.name || "")}" maxlength="24" placeholder="请输入文件夹名称" /></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="save-folder">确定</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "upload") {
    const imageRules = [
      "支持 JPG/JPEG/PNG/BMP 格式",
      "单次上传图像数量 ≤ 1000 张",
      "单张图像文件大小 ≤ 20MB",
      "图像名称长度 1 ~ 100 字符",
      "64px × 64px ≤ 图像分辨率 ≤ 7680px × 5120px",
    ];
    const zipRules = [
      "支持 ZIP 格式",
      "压缩包文件大小 ≤ 5GB",
      "单张图像文件大小 ≤ 20MB",
      "图像名称长度 1 ~ 100 字符",
      "64px × 64px ≤ 图像分辨率 ≤ 7680px × 5120px",
    ];
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal upload-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>上传图像</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="upload-methods">
              <label class="upload-method-card${modal.mode === "images" ? " is-selected" : ""}">
                <span class="upload-method-icon">${renderIcon("upload")}</span>
                <span class="upload-method-copy">
                  <strong>点击上传图像</strong>
                  <small>或拖拽文件到此处</small>
                  <span>${imageRules.map((rule) => `<i>·${rule}</i>`).join("")}</span>
                </span>
                <input id="modalUploadImagesInput" type="file" accept=".jpg,.jpeg,.png,.bmp" multiple />
              </label>
              <label class="upload-method-card${modal.mode === "zip" ? " is-selected" : ""}">
                <span class="upload-method-icon zip-icon">ZIP</span>
                <span class="upload-method-copy">
                  <strong>点击上传压缩包</strong>
                  <small>或拖拽文件到此处</small>
                  <span>${zipRules.map((rule) => `<i>·${rule}</i>`).join("")}</span>
                </span>
                <input id="modalUploadZipInput" type="file" accept=".zip,application/zip" />
              </label>
            </div>
            ${
              modal.uploads.length
                ? `<div class="upload-file-list">${modal.uploads
                    .map(
                      (file) => `<div>${file.mode === "zip" ? '<span class="upload-file-zip">ZIP</span>' : `<img src="${escapeAttr(file.previewUrl)}" alt="" />`}<span><strong>${escapeHtml(file.name)}</strong><small>${formatFileSize(file.bytes)}</small></span></div>`,
                    )
                    .join("")}</div>`
                : ""
            }
          </div>
          <footer class="modal-footer"><span class="selection-summary">${modal.uploads.length ? `已选择 ${modal.uploads.length} 个文件` : "请选择上传方式"}</span><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="confirm-upload"${modal.uploads.length ? "" : " disabled"}>开始上传</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "image-detail") {
    const image = getImage(modal.imageId);
    if (!image) return closeModal();
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal image-detail-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>图像详情</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body image-detail-body">
            <div class="image-detail-preview"><img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.name)}" /></div>
            <dl class="image-detail-meta">
              <div><dt>图像名称</dt><dd>${escapeHtml(image.name)}</dd></div>
              <div><dt>图像尺寸</dt><dd>${escapeHtml(image.size || "1920 × 1080")}</dd></div>
              <div><dt>采集时间</dt><dd>${escapeHtml(formatDateTime(image.capturedAt))}</dd></div>
              <div><dt>采集设备</dt><dd>${escapeHtml(image.device || "-")}</dd></div>
              <div class="image-detail-tag-row"><dt>标签</dt><dd><select id="modalDetailTag"><option value="">无标签</option>${(state.libraryTags || []).map((tag) => `<option value="${escapeAttr(tag.name)}"${image.tag === tag.name ? " selected" : ""}>${escapeHtml(tag.name)}</option>`).join("")}</select><button class="secondary-btn" data-modal-action="save-detail-tag">保存标签</button></dd></div>
            </dl>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="export-detail-image">${renderIcon("download")}<span>导出图像</span></button><button class="primary-btn" data-modal-action="close">关闭</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "library-tags") {
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal tag-library-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>标签库</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="tag-create-row">
              <input id="modalLibraryTagName" maxlength="12" placeholder="请输入标签名称" />
              <select id="modalLibraryTagColor">${LABEL_COLORS.map((color) => `<option value="${color}">${color}</option>`).join("")}</select>
              <button class="primary-btn" data-modal-action="add-library-tag">添加</button>
            </div>
            <div class="tag-library-list">
              ${(state.libraryTags || [])
                .map(
                  (tag) => `<div><span class="label-swatch" style="background:${escapeAttr(tag.color)}"></span><strong>${escapeHtml(tag.name)}</strong><span>${state.images.filter((image) => !image.libraryDeleted && image.tag === tag.name).length} 张图像</span>${renderIconButton({ icon: "trash", label: `删除 ${tag.name}`, className: "row-icon-btn danger-icon", attrs: `data-modal-action="delete-library-tag" data-id="${escapeAttr(tag.id)}"` })}</div>`,
                )
                .join("")}
            </div>
          </div>
          <footer class="modal-footer"><button class="primary-btn" data-modal-action="close">完成</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "assign-tag") {
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal assign-tag-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>设置标签</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label>已选图像</label><input value="${modal.imageIds.length} 张" disabled /></div>
              <div class="form-field"><label class="required">图像标签</label><select id="modalAssignTag"><option value="">请选择标签</option>${(state.libraryTags || []).map((tag) => `<option value="${escapeAttr(tag.name)}">${escapeHtml(tag.name)}</option>`).join("")}</select></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="confirm-assign-tag">确定</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "confirm") {
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal confirm-modal" role="alertdialog" aria-modal="true">
          <header class="modal-header"><h2>${escapeHtml(modal.title)}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="confirm-content">
              <span class="confirm-icon">!</span>
              <div><strong>${escapeHtml(modal.message)}</strong></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="danger-btn" data-modal-action="confirm-action">${escapeHtml(modal.confirmText || "删除")}</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "picker") {
    const folderImages = state.images
      .filter((image) => image.folderId === modal.folderId && !image.libraryDeleted)
      .filter((image) => !modal.query || `${image.name} ${image.device || ""} ${image.tag || ""}`.toLowerCase().includes(modal.query.toLowerCase()));
    const allFolderSelected = folderImages.length > 0 && folderImages.every((image) => pickerSelection.has(image.id));
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal is-wide" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>从图像库添加图像</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="image-picker">
              <aside class="picker-folders">${state.folders
                .map(
                  (folder) => `<button class="picker-folder${folder.id === modal.folderId ? " is-active" : ""}" data-modal-action="picker-folder" data-id="${escapeAttr(folder.id)}">${escapeHtml(folder.name)} (${getFolderImages(folder.id).length})</button>`,
                )
                .join("")}</aside>
              <div class="picker-images">
                <div class="picker-toolbar">
                  <input id="pickerQueryInput" value="${escapeAttr(modal.query || "")}" placeholder="搜索当前文件夹" />
                  <button class="secondary-btn" data-modal-action="picker-search">查询</button>
                  <button class="ghost-btn" data-modal-action="picker-reset-search">重置</button>
                  <button class="secondary-btn" data-modal-action="picker-select-folder">${allFolderSelected ? "取消当前结果" : "全选当前结果"}</button>
                </div>
                ${
                  folderImages.length
                    ? `<div class="picker-image-grid">${folderImages
                        .map(
                          (image) => `<label class="picker-image${pickerSelection.has(image.id) ? " is-selected" : ""}">
                            <input type="checkbox" data-picker-image="${escapeAttr(image.id)}"${pickerSelection.has(image.id) ? " checked" : ""} />
                            <img src="${escapeAttr(image.url)}" alt="" />
                            <span title="${escapeAttr(image.name)}">${escapeHtml(image.name)}</span>
                            <small>${escapeHtml(image.device || "未关联设备")} · ${escapeHtml(image.tag || "无标签")}</small>
                          </label>`,
                        )
                        .join("")}</div>`
                    : `<div class="empty-state"><strong>当前文件夹没有匹配图像</strong></div>`
                }
              </div>
            </div>
          </div>
          <footer class="modal-footer"><span class="selection-summary">已选择 ${pickerSelection.size} 张</span><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="confirm-picker">确定</button></footer>
        </section>
      </div>`;
  }
}

function closeModal() {
  modal = null;
  renderModal();
}

function saveModelFromModal() {
  const name = document.getElementById("modalModelName").value.trim();
  if (!name) return showToast("请输入模型名称");
  const isEditing = Boolean(modal.modelId);
  const sceneType = document.getElementById("modalModelScene").value;
  const description = document.getElementById("modalModelDescription").value.trim();
  const now = new Date().toISOString();
  if (modal.modelId) {
    const model = state.models.find((item) => item.id === modal.modelId);
    Object.assign(model, { name, sceneType, description, updatedAt: now });
  } else {
    const id = `model_${Date.now()}`;
    state.models.unshift({ id, name, sceneType, description, createdAt: now, updatedAt: now });
    state.records[id] = [];
  }
  saveState();
  closeModal();
  render();
  showToast(isEditing ? "模型已更新" : "模型已创建");
}

function saveLabelFromModal() {
  const name = document.getElementById("modalLabelName").value.trim();
  if (!name) return showToast("请输入标签名称");
  const record = getSelectedRecord();
  const label = { id: `label_${Date.now()}`, name, color: document.getElementById("modalLabelColor").value };
  record.labels.push(label);
  ui.activeLabelId = label.id;
  saveState();
  closeModal();
  render();
}

function saveFolderFromModal() {
  const name = document.getElementById("modalFolderName").value.trim();
  if (!name) return showToast("请输入文件夹名称");
  const now = new Date().toISOString();
  const folder = state.folders.find((item) => item.id === modal.folderId);
  if (folder) {
    folder.name = name;
    folder.updatedAt = now;
  } else {
    state.folders.unshift({
      id: `folder_${Date.now()}`,
      name,
      count: 0,
      cover: "",
      createdAt: now,
      updatedAt: now,
    });
  }
  saveState();
  closeModal();
  render();
  showToast(folder ? "文件夹名称已修改" : "文件夹已创建");
}

function prepareUploadFiles(fileList, mode) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  if (mode === "images" && files.length > 1000) return showToast("单次最多上传 1000 张图像");
  if (mode === "zip" && files.length > 1) return showToast("每次请选择 1 个 ZIP 压缩包");
  const invalid = files.find((file) => {
    if (file.name.length > 100) return true;
    if (mode === "images") return !/\.(jpe?g|png|bmp)$/i.test(file.name) || file.size > 20 * 1024 * 1024;
    return !/\.zip$/i.test(file.name) || file.size > 5 * 1024 * 1024 * 1024;
  });
  if (invalid) {
    return showToast(mode === "images" ? "请检查图像格式、名称和 20MB 大小限制" : "请选择不超过 5GB 的 ZIP 压缩包");
  }
  if (mode === "zip") {
    modal.mode = "zip";
    modal.uploads = files.map((file) => ({ mode, name: file.name, bytes: file.size }));
    renderModal();
    return;
  }
  Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const previewUrl = String(reader.result || "");
            resolve({
              mode,
              name: file.name,
              bytes: file.size,
              previewUrl,
              persistUrl: file.size <= 500 * 1024 ? previewUrl : IMAGE_KAKOU,
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        }),
    ),
  ).then((uploads) => {
    if (!modal || modal.type !== "upload") return;
    modal.mode = "images";
    modal.uploads = uploads.filter(Boolean);
    renderModal();
  });
}

function confirmLibraryUpload() {
  const folder = state.folders.find((item) => item.id === ui.selectedFolderId);
  if (!folder || !modal.uploads.length) return;
  const now = new Date().toISOString();
  const uploadMode = modal.mode;
  const uploads =
    modal.mode === "zip"
      ? Array.from({ length: 3 }, (_, index) => ({
          name: `${modal.uploads[0].name.replace(/\.zip$/i, "")}_${String(index + 1).padStart(3, "0")}.jpg`,
          persistUrl: [IMAGE_KAKOU, IMAGE_LUOGAN, IMAGE_XRAY][index],
        }))
      : modal.uploads;
  uploads.forEach((upload, index) => {
    state.images.unshift({
      id: `image_${Date.now()}_${index}`,
      name: upload.name,
      folderId: folder.id,
      url: upload.persistUrl,
      size: "待识别",
      device: "本地上传",
      tag: "",
      capturedAt: now,
    });
  });
  folder.cover = folder.cover || uploads[0].persistUrl;
  folder.updatedAt = now;
  const count = uploads.length;
  saveState();
  closeModal();
  render();
  showToast(uploadMode === "zip" ? `压缩包已解析为 ${count} 张演示图像` : `已上传 ${count} 张图像`);
}

function addLibraryTag() {
  const name = document.getElementById("modalLibraryTagName").value.trim();
  if (!name) return showToast("请输入标签名称");
  if ((state.libraryTags || []).some((tag) => tag.name === name)) return showToast("标签名称已存在");
  state.libraryTags.push({
    id: `tag_${Date.now()}`,
    name,
    color: document.getElementById("modalLibraryTagColor").value,
  });
  saveState();
  renderModal();
}

function deleteLibraryTag(tagId) {
  const tag = state.libraryTags.find((item) => item.id === tagId);
  if (!tag) return;
  state.libraryTags = state.libraryTags.filter((item) => item.id !== tagId);
  state.images.forEach((image) => {
    if (image.tag === tag.name) image.tag = "";
  });
  if (ui.libraryTag === tag.name) ui.libraryTag = "all";
  saveState();
  renderModal();
}

function assignLibraryTag() {
  const tagName = document.getElementById("modalAssignTag").value;
  if (!tagName) return showToast("请选择标签");
  const ids = new Set(modal.imageIds);
  state.images.forEach((image) => {
    if (ids.has(image.id)) image.tag = tagName;
  });
  librarySelection = new Set();
  saveState();
  closeModal();
  render();
  showToast("图像标签已更新");
}

function saveDetailImageTag() {
  const image = getImage(modal.imageId);
  if (!image) return;
  image.tag = document.getElementById("modalDetailTag").value;
  saveState();
  renderModal();
  render();
  showToast("图像标签已更新");
}

function saveAccountPassword() {
  const newPassword = document.getElementById("accountNewPassword").value;
  if (!isValidPassword(newPassword)) return showToast("请输入符合规则的 8-16 位新密码");
  ui.accountEditingPassword = false;
  render();
  showToast("密码修改成功");
}

function isValidPassword(value) {
  if (value.length < 8 || value.length > 16) return false;
  const categories = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^a-zA-Z0-9]/].filter((pattern) => pattern.test(value)).length;
  return categories >= 2;
}

function saveCompanyInfo() {
  const enterpriseName = document.getElementById("companyNameInput").value.trim();
  const contactName = document.getElementById("companyContactInput").value.trim();
  const contactPhone = document.getElementById("companyPhoneInput").value.trim();
  if (!enterpriseName || !contactName || !contactPhone) return showToast("请填写完整企业信息");
  Object.assign(state.account, {
    enterpriseName,
    industry: document.getElementById("companyIndustryInput").value,
    contactName,
    contactPhone,
  });
  state.enterprise.name = enterpriseName;
  ui.accountEditingCompany = false;
  saveState();
  render();
  showToast("企业信息已保存");
}

function exportLibraryFolder(folderId) {
  exportLibraryImages(getFolderImages(folderId).map((image) => image.id));
}

function exportLibraryImages(imageIds) {
  const images = imageIds.map(getImage).filter(Boolean);
  if (!images.length) return showToast("暂无可导出的图像");
  images.forEach((image, index) => {
    window.setTimeout(() => {
      const anchor = document.createElement("a");
      anchor.href = image.url;
      anchor.download = image.name;
      anchor.click();
    }, index * 120);
  });
  showToast(`正在导出 ${images.length} 张图像`);
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function togglePickerFolderSelection() {
  const images = state.images
    .filter((image) => image.folderId === modal.folderId && !image.libraryDeleted)
    .filter((image) => !modal.query || `${image.name} ${image.device || ""} ${image.tag || ""}`.toLowerCase().includes(modal.query.toLowerCase()));
  const shouldSelect = images.some((image) => !pickerSelection.has(image.id));
  images.forEach((image) => {
    if (shouldSelect) pickerSelection.add(image.id);
    else pickerSelection.delete(image.id);
  });
  renderModal();
}

function confirmImagePicker() {
  const record = getSelectedRecord();
  const ids = Array.from(pickerSelection);
  if (modal.mode === "test") {
    record.testImageIds = ids;
    record.testResults = {};
    ui.activeTestImageId = ids[0] || "";
  } else {
    record.imageIds = ids;
    record.completedImageIds = record.completedImageIds.filter((id) => ids.includes(id));
    Object.keys(record.annotations).forEach((id) => {
      if (!ids.includes(id)) delete record.annotations[id];
    });
    ids.forEach((id) => {
      if (!record.annotations[id]) record.annotations[id] = [];
    });
    ui.activeImageId = ids[0] || "";
    ui.trainingTab = "pending";
  }
  saveState();
  closeModal();
  render();
}

function requestConfirmation(action, payload = {}) {
  const configs = {
    "delete-model": {
      title: "删除模型",
      message: "确定删除这个模型吗？",
      detail: "模型下的训练记录和测试结果也会一并删除。",
    },
    "delete-record": {
      title: "删除训练记录",
      message: "确定删除这条训练记录吗？",
      detail: "已保存的图像标注和测试结果将无法恢复。",
    },
    "delete-library-images": {
      title: "删除图像",
      message: `确定删除选中的 ${payload.imageIds?.length || 0} 张图像吗？`,
      detail: "已被训练任务引用的图像会从图像库移除，但现有任务中的标注演示数据仍会保留。",
    },
    "delete-training-images": {
      title: "删除训练图像",
      message: `确定删除选中的 ${payload.imageIds?.length || 0} 张图像吗？`,
      detail: "这些图像及其标注会从当前训练任务中移除。",
    },
    "delete-folder": {
      title: "删除文件夹",
      message: "确定删除这个文件夹吗？",
      detail: "文件夹内的所有图像也会从图像库移除。",
    },
    "reset-demo": {
      title: "重置 Demo",
      message: "确定恢复最初的演示数据吗？",
      detail: "当前浏览器中新增的模型、标注和测试结果都会被清除。",
      confirmText: "重置",
    },
    logout: {
      title: "提示",
      message: "确认退出吗？",
      confirmText: "退出",
    },
  };
  modal = { type: "confirm", action, payload, ...configs[action] };
  renderModal();
}

function confirmRequestedAction() {
  const request = modal;
  closeModal();
  if (request.action === "delete-model") return performDeleteModel(request.payload.modelId);
  if (request.action === "delete-record") return performDeleteRecord(request.payload.recordId);
  if (request.action === "delete-library-images") return deleteLibraryImages(request.payload.imageIds || []);
  if (request.action === "delete-training-images") return deleteTrainingImages(request.payload.imageIds || []);
  if (request.action === "delete-folder") return deleteLibraryFolder(request.payload.folderId);
  if (request.action === "reset-demo") return performResetDemo();
  if (request.action === "logout") {
    setView("home");
    return showToast("已退出当前账号");
  }
}

function createTrainingRecord() {
  const model = getSelectedModel();
  const record = {
    id: `record_${Date.now()}`,
    code: formatRecordCode(),
    createdAt: new Date().toISOString(),
    status: "待训练",
    imageIds: [],
    completedImageIds: [],
    labels: [{ id: "label_ng", name: "NG", color: "#f5222d" }],
    annotations: {},
    testImageIds: [],
    testResults: {},
  };
  getRecords(model.id).unshift(record);
  ui.selectedRecordId = record.id;
  ui.trainingTab = "pending";
  saveState();
  setView("model-training-workspace");
}

function openTraining(recordId) {
  ui.selectedRecordId = recordId;
  ui.trainingTab = "pending";
  ui.trainingBatchMode = false;
  trainingSelection = new Set();
  ui.activeImageId = "";
  ui.selectedAnnotation = -1;
  const record = getSelectedRecord();
  ui.activeLabelId = record?.labels?.[0]?.id || "";
  setView("model-training-workspace");
}

function openTest(recordId) {
  ui.selectedRecordId = recordId;
  ui.activeTestImageId = "";
  setView("model-test");
}

function completeCurrentImage() {
  const record = getSelectedRecord();
  const boxes = record.annotations[ui.activeImageId] || [];
  if (!boxes.length) return showToast("请先绘制至少一个标注框");
  const wasCompleted = record.completedImageIds.includes(ui.activeImageId);
  if (!wasCompleted) record.completedImageIds.push(ui.activeImageId);
  saveState();
  showToast(wasCompleted ? "标注修改已保存" : "当前图像标注已保存");
  if (!wasCompleted) {
    ui.trainingTab = "pending";
    ui.activeImageId = "";
  }
  ui.selectedAnnotation = -1;
  render();
}

function startTraining() {
  const record = getSelectedRecord();
  const completed = new Set(record.completedImageIds);
  if (record.imageIds.length < 2 || !record.imageIds.every((id) => completed.has(id))) {
    return showToast("至少需要 2 张图像，并完成全部标注");
  }
  record.status = "排队中";
  record.queuePosition = 2;
  record.waitText = "预计等待 24 分钟";
  saveState();
  setView("model-training-records");
  showToast("训练任务已提交，当前正在排队");
}

function advanceSelectedRecord() {
  const record = getSelectedRecord();
  if (!record) return;
  if (record.status === "排队中") {
    record.status = "训练中";
    record.startedAt = new Date().toISOString();
    record.elapsedText = "已训练 1 分钟";
    record.remainingText = "预计剩余 14 分钟";
    showToast("任务已开始训练");
  } else if (record.status === "训练中") {
    record.status = "训练完成";
    record.completedAt = new Date().toISOString();
    record.duration = "15分钟26秒";
    record.testImageIds = SAMPLE_IMAGES.slice(0, 6).map((image) => image.id);
    record.testResults = {};
    showToast("训练已完成");
  }
  saveState();
  render();
}

function cancelTraining(recordId) {
  const record = findRecord(recordId);
  if (!record) return;
  record.status = "待训练";
  delete record.queuePosition;
  delete record.waitText;
  delete record.elapsedText;
  delete record.remainingText;
  saveState();
  render();
  showToast("训练已取消，可继续编辑标注");
}

function deleteRecord(recordId) {
  const record = findRecord(recordId);
  if (record?.status === "排队中" || record?.status === "训练中") {
    return showToast("请先取消训练，再删除记录");
  }
  requestConfirmation("delete-record", { recordId });
}

function performDeleteRecord(recordId) {
  const record = findRecord(recordId);
  if (record?.status === "排队中" || record?.status === "训练中") {
    return showToast("请先取消训练，再删除记录");
  }
  const records = getRecords(ui.selectedModelId);
  state.records[ui.selectedModelId] = records.filter((record) => record.id !== recordId);
  if (ui.selectedRecordId === recordId) ui.selectedRecordId = "";
  saveState();
  render();
}

function deleteModel(modelId) {
  requestConfirmation("delete-model", { modelId });
}

function performDeleteModel(modelId) {
  state.models = state.models.filter((model) => model.id !== modelId);
  delete state.records[modelId];
  if (ui.selectedModelId === modelId) ui.selectedModelId = state.models[0]?.id || "";
  saveState();
  render();
}

function toggleLibrarySelectAll() {
  const images = getFilteredLibraryImages(ui.selectedFolderId);
  const shouldSelect = images.some((image) => !librarySelection.has(image.id));
  images.forEach((image) => {
    if (shouldSelect) librarySelection.add(image.id);
    else librarySelection.delete(image.id);
  });
  render();
}

function deleteLibraryImages(imageIds) {
  if (!imageIds.length) return;
  const deleted = new Set(imageIds);
  state.images.forEach((image) => {
    if (deleted.has(image.id)) image.libraryDeleted = true;
  });
  librarySelection = new Set();
  syncFolderCovers();
  saveState();
  render();
  showToast(`已删除 ${imageIds.length} 张图像`);
}

function deleteLibraryFolder(folderId) {
  state.folders = state.folders.filter((folder) => folder.id !== folderId);
  state.images.forEach((image) => {
    if (image.folderId === folderId) image.libraryDeleted = true;
  });
  if (ui.selectedFolderId === folderId) {
    ui.selectedFolderId = "";
    ui.view = "library";
  }
  librarySelection = new Set();
  saveState();
  render();
  showToast("文件夹已删除");
}

function syncFolderCovers() {
  state.folders.forEach((folder) => {
    const firstImage = getFolderImages(folder.id)[0];
    folder.count = getFolderImages(folder.id).length;
    folder.cover = firstImage?.url || "";
    folder.updatedAt = new Date().toISOString();
  });
}

function deleteTrainingImage(imageId) {
  const record = getSelectedRecord();
  if (!record || record.status !== "待训练") return;
  record.imageIds = record.imageIds.filter((id) => id !== imageId);
  record.completedImageIds = record.completedImageIds.filter((id) => id !== imageId);
  delete record.annotations[imageId];
  ui.activeImageId = "";
  saveState();
  render();
}

function deleteTrainingImages(imageIds) {
  const record = getSelectedRecord();
  if (!record || record.status !== "待训练" || !imageIds.length) return;
  const deleted = new Set(imageIds);
  record.imageIds = record.imageIds.filter((id) => !deleted.has(id));
  record.completedImageIds = record.completedImageIds.filter((id) => !deleted.has(id));
  imageIds.forEach((imageId) => delete record.annotations[imageId]);
  if (deleted.has(ui.activeImageId)) ui.activeImageId = "";
  trainingSelection = new Set();
  saveState();
  render();
  showToast(`已从训练任务删除 ${imageIds.length} 张图像`);
}

function toggleTrainingVisibleSelection() {
  const record = getSelectedRecord();
  if (!record || record.status !== "待训练") return;
  const completed = new Set(record.completedImageIds || []);
  const visibleImages = record.imageIds
    .map(getImage)
    .filter(Boolean)
    .filter((image) => (ui.trainingTab === "completed" ? completed.has(image.id) : !completed.has(image.id)));
  const shouldSelect = visibleImages.some((image) => !trainingSelection.has(image.id));
  visibleImages.forEach((image) => {
    if (shouldSelect) trainingSelection.add(image.id);
    else trainingSelection.delete(image.id);
  });
  render();
}

function updateCanvasZoom(delta) {
  ui.canvasZoom = clamp(Number((ui.canvasZoom + delta).toFixed(2)), 0.5, 2);
  saveUi();
  render();
}

function fitAnnotationCanvas() {
  ui.canvasZoom = 1;
  saveUi();
  render();
}

function deleteSelectedBox() {
  const record = getSelectedRecord();
  const boxes = record.annotations[ui.activeImageId] || [];
  if (ui.selectedAnnotation < 0 || !boxes[ui.selectedAnnotation]) return;
  pushHistory();
  boxes.splice(ui.selectedAnnotation, 1);
  ui.selectedAnnotation = -1;
  saveState();
  render();
}

function runTest() {
  const record = getSelectedRecord();
  if (!record.testImageIds.length) return;
  ui.testRunning = true;
  record.testResults = {};
  render();
  window.setTimeout(() => {
    record.testResults = {};
    record.testImageIds.forEach((imageId, index) => {
      record.testResults[imageId] = {
        status: "检测完成",
        boxes:
          index === 0 || index === 3
            ? [{ x: 300 + index * 20, y: 205, w: 250, h: 185, label: "NG", score: index === 0 ? 0.96 : 0.91 }]
            : [],
      };
    });
    ui.testRunning = false;
    saveState();
    render();
    showToast("测试完成，共发现 2 张 NG 图像");
  }, 900);
}

function downloadModel(recordId) {
  const record = findRecord(recordId);
  if (!record || record.status !== "训练完成") return;
  const content = JSON.stringify({ model: getSelectedModel().name, record: record.code, type: "JetCheck demo model package" }, null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${getSelectedModel().name}-${record.code}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function applyScenario(scenario) {
  const mapping = {
    pending: ["record_pending", "model-training-workspace"],
    ready: ["record_pending", "model-training-workspace"],
    queued: ["record_queued", "model-training-records"],
    training: ["record_training", "model-training-records"],
    done: ["record_done", "model-training-records"],
    test: ["record_done", "model-test"],
  };
  const target = mapping[scenario];
  if (!target) return;
  const seedRecords = buildSeedState().records.model_codex;
  const sourceId = scenario === "ready" ? "record_pending" : target[0];
  const sourceRecord = seedRecords.find((record) => record.id === sourceId);
  const targetIndex = getRecords("model_codex").findIndex((record) => record.id === target[0]);
  if (sourceRecord) {
    if (targetIndex >= 0) getRecords("model_codex")[targetIndex] = clone(sourceRecord);
    else getRecords("model_codex").unshift(clone(sourceRecord));
  }
  ui.selectedModelId = "model_codex";
  ui.selectedRecordId = target[0];
  if (scenario === "ready") {
    const record = findRecord("record_pending");
    record.completedImageIds = [...record.imageIds];
    record.imageIds.forEach((id) => {
      if (!record.annotations[id]?.length) {
        record.annotations[id] = [{ x: 300, y: 210, w: 250, h: 180, labelId: "label_ng" }];
      }
    });
    saveState();
  }
  ui.trainingTab = scenario === "ready" ? "completed" : "pending";
  ui.activeImageId = "";
  ui.activeTestImageId = "";
  ui.selectedAnnotation = -1;
  ui.activeLabelId = "label_ng";
  saveState();
  setView(target[1]);
}

function resetDemo() {
  requestConfirmation("reset-demo");
}

function performResetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(UI_STORAGE_KEY);
  window.location.reload();
}

function pushHistory() {
  const record = getSelectedRecord();
  if (!record || !ui.activeImageId) return;
  const key = `${record.id}:${ui.activeImageId}`;
  if (!histories[key]) histories[key] = { undo: [], redo: [] };
  histories[key].undo.push(clone(record.annotations[ui.activeImageId] || []));
  histories[key].undo = histories[key].undo.slice(-30);
  histories[key].redo = [];
}

function undoAnnotation() {
  const record = getSelectedRecord();
  const key = `${record.id}:${ui.activeImageId}`;
  const history = histories[key];
  if (!history?.undo.length) return showToast("没有可撤销的操作");
  history.redo.push(clone(record.annotations[ui.activeImageId] || []));
  record.annotations[ui.activeImageId] = history.undo.pop();
  ui.selectedAnnotation = -1;
  saveState();
  render();
}

function redoAnnotation() {
  const record = getSelectedRecord();
  const key = `${record.id}:${ui.activeImageId}`;
  const history = histories[key];
  if (!history?.redo.length) return showToast("没有可重做的操作");
  history.undo.push(clone(record.annotations[ui.activeImageId] || []));
  record.annotations[ui.activeImageId] = history.redo.pop();
  ui.selectedAnnotation = -1;
  saveState();
  render();
}

function getSelectedModel() {
  return state.models.find((model) => model.id === ui.selectedModelId) || state.models[0];
}

function getRecords(modelId) {
  if (!state.records[modelId]) state.records[modelId] = [];
  return state.records[modelId];
}

function getSelectedRecord() {
  return findRecord(ui.selectedRecordId) || getRecords(ui.selectedModelId)[0] || null;
}

function findRecord(recordId) {
  return Object.values(state.records)
    .flat()
    .find((record) => record.id === recordId);
}

function getImage(imageId) {
  return state.images.find((image) => image.id === imageId);
}

function getFolderImages(folderId) {
  return state.images.filter((image) => image.folderId === folderId && !image.libraryDeleted);
}

function getFilteredLibraryImages(folderId) {
  const keyword = (ui.libraryQuery || "").trim().toLowerCase();
  return getFolderImages(folderId).filter((image) => {
    if (ui.libraryDevice !== "all" && image.device !== ui.libraryDevice) return false;
    if (ui.libraryTag !== "all" && image.tag !== ui.libraryTag) return false;
    if (!keyword) return true;
    return image.name.toLowerCase().includes(keyword);
  });
}

function getFilteredClients() {
  const keyword = (ui.clientQuery || "").trim().toLowerCase();
  return state.terminals.filter((terminal) => {
    if (ui.clientStatus !== "all" && terminal.status !== ui.clientStatus) return false;
    if (!keyword) return true;
    return terminal.name.toLowerCase().includes(keyword) || (terminal.hardwareCode || "").toLowerCase().includes(keyword);
  });
}

function loadState() {
  let nextState = null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
    if (parsed?.version === 2) {
      const seed = buildSeedState();
      const metadata = new Map(SAMPLE_IMAGES.map((image) => [image.id, image]));
      parsed.images = (parsed.images || []).map((image) => ({ ...(metadata.get(image.id) || {}), ...image }));
      parsed.folders = (parsed.folders || []).map((folder) => ({
        createdAt: "2026-05-01T09:00:00+08:00",
        updatedAt: "2026-06-10T18:00:00+08:00",
        ...folder,
      }));
      const codexModel = parsed.models?.find((model) => model.id === "model_codex");
      if (codexModel) codexModel.description = "";
      parsed.account = { ...seed.account, ...(parsed.account || {}) };
      parsed.libraryTags = Array.isArray(parsed.libraryTags) && parsed.libraryTags.length ? parsed.libraryTags : clone(DEFAULT_LIBRARY_TAGS);
      const terminalDefaults = new Map(seed.terminals.map((terminal) => [terminal.id, terminal]));
      parsed.terminals = (parsed.terminals || []).map((terminal) => ({ ...(terminalDefaults.get(terminal.id) || {}), ...terminal }));
      const terminalIds = new Set(parsed.terminals.map((terminal) => terminal.id));
      parsed.terminals.push(...seed.terminals.filter((terminal) => !terminalIds.has(terminal.id)));
      nextState = parsed;
    }
  } catch (_error) {
    // Rebuild invalid demo cache.
  }
  nextState ||= buildSeedState();
  return applyClientCloudSyncQueue(nextState);
}

function applyClientCloudSyncQueue(nextState) {
  try {
    const queue = JSON.parse(localStorage.getItem(CLIENT_CLOUD_SYNC_QUEUE_KEY) || "[]");
    if (!Array.isArray(queue) || !queue.length) return nextState;
    queue.forEach((entry) => {
      const queuedFolder = entry.folder || {};
      let folder = nextState.folders.find((item) => item.id === queuedFolder.id);
      if (!folder) {
        folder = {
          id: queuedFolder.id || `folder_${Date.now()}`,
          name: queuedFolder.name || "客户端采图",
          count: 0,
          cover: "",
          createdAt: entry.syncedAt || new Date().toISOString(),
          updatedAt: entry.syncedAt || new Date().toISOString(),
        };
        nextState.folders.unshift(folder);
      }
      const existingIds = new Set(nextState.images.map((image) => image.id));
      (entry.images || []).forEach((image) => {
        if (!existingIds.has(image.id)) nextState.images.push({ ...image, folderId: folder.id });
      });
      const folderImages = nextState.images.filter((image) => image.folderId === folder.id);
      folder.count = folderImages.length;
      folder.cover = folderImages[0]?.url || folder.cover || "";
      folder.updatedAt = entry.syncedAt || new Date().toISOString();
    });
    localStorage.removeItem(CLIENT_CLOUD_SYNC_QUEUE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (_error) {
    // Keep the queue for the next platform load when it cannot be merged.
  }
  return nextState;
}

function loadUi() {
  const defaults = {
    view: "models",
    modelScene: "all",
    modelQuery: "",
    selectedModelId: "model_codex",
    selectedRecordId: "record_pending",
    trainingTab: "pending",
    activeImageId: "img_03",
    activeLabelId: "label_ng",
    selectedAnnotation: -1,
    canvasTool: "rect",
    canvasZoom: 1,
    trainingBatchMode: false,
    activeTestImageId: "",
    openRecordMenu: "",
    testRunning: false,
    demoOpen: false,
    libraryMode: "list",
    libraryQuery: "",
    libraryDevice: "all",
    libraryTag: "all",
    selectedFolderId: "",
    clientStatus: "all",
    clientQuery: "",
    accountMenuOpen: false,
    accountEditingPassword: false,
    accountEditingCompany: false,
  };
  try {
    const loaded = { ...defaults, ...JSON.parse(localStorage.getItem(UI_STORAGE_KEY) || "{}"), testRunning: false, accountMenuOpen: false };
    if (loaded.view === "account-info" || loaded.view === "account-password") loaded.view = "user-center";
    return loaded;
  } catch (_error) {
    return defaults;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveUi() {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ ...ui, testRunning: false }));
}

function formatRecordCode() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function formatDateTime(value) {
  if (!value) return "";
  if (typeof Demo.formatDateTime === "function") return Demo.formatDateTime(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function svgPoint(svg, event) {
  const rect = svg.getBoundingClientRect();
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 1000, 0, 1000),
    y: clamp(((event.clientY - rect.top) / rect.height) * 625, 0, 625),
  };
}

function normalizeBox(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
  };
}

function setRectAttributes(element, box) {
  element.setAttribute("x", box.x);
  element.setAttribute("y", box.y);
  element.setAttribute("width", box.w);
  element.setAttribute("height", box.h);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function shortenName(value) {
  return value.length > 22 ? `${value.slice(0, 17)}...` : value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}

init();
