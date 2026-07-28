const Demo = window.JetCheckDemo || {};
const PLATFORM_STORAGE_KEY = "jetcheck-platform-v141-state-v1";

const IMAGE_KAKOU = "./sample-images/安全座椅-卡扣kakou.png";
const IMAGE_LUOGAN = "./sample-images/安全座椅-螺杆.bmp";
const IMAGE_XRAY = "./sample-images/马斯特X光.bmp";

const DEFAULT_PLATFORM_STATE = {
  enterprise: {
    name: "雪球",
    clientQuota: 15,
  },
  terminals: [
    { id: "terminal_ww", name: "ww", boundAt: "2026-05-08T14:24:53+08:00", status: "离线", offlineAt: "2026-05-15T01:30:18+08:00", hardwareCode: "a011cc88877948a4f5c634f7ca3ec3970f368b1c0cd868dbb34551d9e51f4759" },
    { id: "terminal_sanyang", name: "三羊", boundAt: "2026-05-08T11:42:41+08:00", status: "离线", offlineAt: "2026-05-15T00:20:04+08:00", hardwareCode: "ff584812de225e4d7cd0333b8c1637709af9c2de60b931c9bb1faed1852bb708" },
    { id: "terminal_sss", name: "sss", boundAt: "2026-04-29T16:42:23+08:00", status: "离线", offlineAt: "2026-05-14T15:39:34+08:00", hardwareCode: "3f7cd480fc0aeb3acdeb82dc2a6d3c361757a92c8c6179e0d79ad690a81c5911" },
    { id: "terminal_233", name: "233", boundAt: "2026-04-29T15:22:23+08:00", status: "离线", offlineAt: "2026-05-13T17:34:25+08:00", hardwareCode: "76cf8c66042a3c01602c071a76570f5493a883d370c073040c6ef92f19ddaed8" },
  ],
  models: [
    { id: "model_test", name: "test", sceneType: "分类", description: "", createdAt: "2026-05-21T13:13:31+08:00", updatedAt: "2026-05-21T13:13:31+08:00" },
    { id: "model_tianchuang", name: "安全卡扣-天阁", sceneType: "分类", description: "", createdAt: "2026-05-01T11:47:36+08:00", updatedAt: "2026-05-01T11:47:36+08:00" },
    { id: "model_white_blue", name: "开来-装配检测-白蓝", sceneType: "分类", description: "", createdAt: "2026-04-29T11:25:34+08:00", updatedAt: "2026-04-29T11:25:34+08:00" },
    { id: "model_black", name: "开来-装配检测-黑粉", sceneType: "分类", description: "", createdAt: "2026-04-29T11:22:20+08:00", updatedAt: "2026-04-29T11:22:20+08:00" },
    { id: "model_phone_cross", name: "安全卡扣-手机-横屏拍摄", sceneType: "分类", description: "", createdAt: "2026-04-08T10:14:25+08:00", updatedAt: "2026-04-08T10:14:25+08:00" },
    { id: "model_phone_code", name: "安全卡扣-手机-代码旋转", sceneType: "分类", description: "", createdAt: "2026-04-07T10:56:56+08:00", updatedAt: "2026-04-08T09:25:41+08:00" },
    { id: "model_phone_native", name: "安全卡扣-手机-本地旋转", sceneType: "分类", description: "", createdAt: "2026-04-02T17:48:29+08:00", updatedAt: "2026-04-08T09:18:22+08:00" },
    { id: "model_kakou", name: "安全卡扣-分类", sceneType: "分类", description: "", createdAt: "2026-03-10T16:03:05+08:00", updatedAt: "2026-03-10T16:03:05+08:00" },
    { id: "model_backplate", name: "背板", sceneType: "缺陷检测", description: "", createdAt: "2026-01-06T10:20:05+08:00", updatedAt: "2026-01-06T10:20:05+08:00" },
    { id: "model_shell_whole", name: "压壳-分类-整个产品", sceneType: "分类", description: "", createdAt: "2025-12-29T18:13:28+08:00", updatedAt: "2025-12-29T18:13:28+08:00" },
    { id: "model_shell_cls", name: "压壳-分类", sceneType: "分类", description: "", createdAt: "2025-12-29T10:58:34+08:00", updatedAt: "2025-12-29T10:58:34+08:00" },
    { id: "model_shell_defect", name: "压壳-缺陷", sceneType: "缺陷检测", description: "", createdAt: "2025-12-29T10:58:21+08:00", updatedAt: "2025-12-29T10:58:21+08:00" },
    { id: "model_xray", name: "X光", sceneType: "缺陷检测", description: "", createdAt: "2025-12-23T14:34:06+08:00", updatedAt: "2025-12-23T14:34:06+08:00" },
    { id: "model_luogan", name: "螺杆视觉检测", sceneType: "缺陷检测", description: "", createdAt: "2025-12-21T09:12:18+08:00", updatedAt: "2025-12-21T09:12:18+08:00" },
  ],
  trainingRecords: {
    model_tianchuang: [
      { id: "2026052616451", code: "2026052616451", createdAt: "2026-05-26T10:48:16+08:00", status: "训练完成", completedAt: "2026-05-26T11:03:46+08:00", duration: "15分钟26秒" },
      { id: "2026051213307", code: "2026051213307", createdAt: "2026-05-12T12:41:13+08:00", status: "待训练", completedAt: "", duration: "" },
      { id: "2026051129012", code: "2026051129012", createdAt: "2026-05-11T18:10:29+08:00", status: "训练完成", completedAt: "2026-05-11T18:27:33+08:00", duration: "13分钟15秒" },
      { id: "2026050138229", code: "2026050138229", createdAt: "2026-05-01T11:47:38+08:00", status: "训练完成", completedAt: "2026-05-01T15:19:46+08:00", duration: "17分钟8秒" },
    ],
  },
  folders: [
    { id: "folder_kakou", name: "kakou-test", createdAt: "2026-05-26T14:06:21+08:00", updatedAt: "2026-05-26T14:06:45+08:00", count: 60, cover: IMAGE_KAKOU },
    { id: "folder_sy", name: "sy-test-upload", createdAt: "2026-05-21T13:10:37+08:00", updatedAt: "2026-05-26T15:13:26+08:00", count: 20, cover: IMAGE_LUOGAN },
    { id: "folder_ok", name: "安全卡扣-OK", createdAt: "2026-05-01T14:43:51+08:00", updatedAt: "2026-05-01T14:45:13+08:00", count: 80, cover: IMAGE_KAKOU },
    { id: "folder_ng", name: "安全卡扣-NG", createdAt: "2026-05-01T14:36:40+08:00", updatedAt: "2026-05-01T14:42:49+08:00", count: 80, cover: IMAGE_KAKOU },
    { id: "folder_black_ng", name: "kl-黑粉-NG", createdAt: "2026-04-28T18:07:29+08:00", updatedAt: "2026-04-29T09:06:53+08:00", count: 18, cover: IMAGE_LUOGAN },
    { id: "folder_black_ok", name: "kl-黑粉-OK", createdAt: "2026-04-28T18:07:18+08:00", updatedAt: "2026-04-29T11:18:32+08:00", count: 10, cover: IMAGE_LUOGAN },
    { id: "folder_white_ok", name: "kl-白蓝-OK", createdAt: "2026-04-28T18:07:03+08:00", updatedAt: "2026-04-29T11:19:31+08:00", count: 10, cover: IMAGE_LUOGAN },
    { id: "folder_white_ng", name: "kl-白蓝-NG", createdAt: "2026-04-28T18:06:50+08:00", updatedAt: "2026-04-29T11:21:03+08:00", count: 18, cover: IMAGE_LUOGAN },
    { id: "folder_phone_test", name: "安全卡扣-手机-横屏拍摄-test压缩", createdAt: "2026-04-08T15:32:29+08:00", updatedAt: "2026-04-08T15:42:13+08:00", count: 18, cover: IMAGE_KAKOU },
    { id: "folder_xray", name: "X光缺陷样本", createdAt: "2026-03-28T10:02:29+08:00", updatedAt: "2026-03-29T12:12:13+08:00", count: 46, cover: IMAGE_XRAY },
  ],
  images: {
    folder_kakou: Array.from({ length: 60 }, (_, index) => {
      const serial = String(112501778 + index * 1083).padStart(9, "0");
      return {
        id: `kakou_${index + 1}`,
        name: `Image_20260501${serial}.jpg`,
        size: index % 3 === 0 ? "1920 x 1080" : "",
        capturedAt: index < 12 ? "" : `2026-05-01T${String(11 + Math.floor(index / 6)).padStart(2, "0")}:25:${String(index % 60).padStart(2, "0")}+08:00`,
        device: index % 2 === 0 ? "ww" : "",
        tag: index % 4 === 0 ? "ng" : "",
        url: IMAGE_KAKOU,
      };
    }),
  },
};

const ui = {
  view: "home",
  modelScene: "all",
  modelQuery: "",
  selectedModelId: "model_tianchuang",
  imageMode: "list",
  selectedFolderId: "",
  clientStatus: "all",
  clientQuery: "",
  folderDevice: "all",
  folderTag: "all",
};

let state = loadPlatformState();

const els = {
  main: document.getElementById("platformMain"),
  sidebar: document.getElementById("platformSidebar"),
  navItems: Array.from(document.querySelectorAll(".platform-system-nav-item")),
  accountBtn: document.getElementById("platformAccountBtn"),
  toastStack: document.getElementById("toastStack"),
};

function init() {
  bindEvents();
  render();
}

function bindEvents() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      ui.view = item.dataset.view || "home";
      ui.selectedFolderId = "";
      render();
    });
  });

  els.accountBtn.addEventListener("click", () => showToast("当前账号：雪球"));

  els.main.addEventListener("click", handleMainClick);
  els.main.addEventListener("input", handleMainInput);
  els.main.addEventListener("change", handleMainChange);
}

function handleMainClick(event) {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const id = actionEl.dataset.id || "";

  if (action === "set-view") {
    ui.view = id;
    ui.selectedFolderId = "";
    render();
    return;
  }

  if (action === "reset-model-filter") {
    ui.modelScene = "all";
    ui.modelQuery = "";
    render();
    return;
  }

  if (action === "search-models") {
    syncFilterInputs();
    render();
    return;
  }

  if (action === "new-model") {
    createModel();
    return;
  }

  if (action === "delete-model") {
    deleteModel(id);
    return;
  }

  if (action === "training-records") {
    ui.view = "model-training-records";
    ui.selectedModelId = id;
    render();
    return;
  }

  if (action === "back-models") {
    ui.view = "models";
    render();
    return;
  }

  if (action === "open-training") {
    ui.view = "model-training-workspace";
    render();
    return;
  }

  if (action === "new-training") {
    createTrainingRecord();
    return;
  }

  if (action === "finish-annotation") {
    showToast("已保存当前图像标注");
    return;
  }

  if (action === "library-mode") {
    ui.imageMode = id;
    render();
    return;
  }

  if (action === "open-folder") {
    ui.selectedFolderId = id;
    ui.view = "library-folder";
    render();
    return;
  }

  if (action === "back-library") {
    ui.selectedFolderId = "";
    ui.view = "library";
    render();
    return;
  }

  if (action === "create-folder") {
    createFolder();
    return;
  }

  if (action === "upload-image") {
    uploadImage();
    return;
  }

  if (action === "delete-image") {
    deleteImage(id);
    return;
  }

  if (action === "reset-clients") {
    ui.clientStatus = "all";
    ui.clientQuery = "";
    render();
    return;
  }

  if (action === "search-clients") {
    syncFilterInputs();
    render();
    return;
  }

  if (action === "noop") {
    showToast(actionEl.dataset.message || "该操作用于占位演示");
  }
}

function handleMainInput(event) {
  const target = event.target;
  if (target.id === "modelQueryInput") ui.modelQuery = target.value;
  if (target.id === "clientQueryInput") ui.clientQuery = target.value;
}

function handleMainChange(event) {
  const target = event.target;
  if (target.id === "modelSceneSelect") {
    ui.modelScene = target.value;
    render();
  }
  if (target.id === "clientStatusSelect") {
    ui.clientStatus = target.value;
    render();
  }
  if (target.id === "folderDeviceSelect") {
    ui.folderDevice = target.value;
    render();
  }
  if (target.id === "folderTagSelect") {
    ui.folderTag = target.value;
    render();
  }
}

function syncFilterInputs() {
  const modelQuery = document.getElementById("modelQueryInput");
  const modelScene = document.getElementById("modelSceneSelect");
  const clientQuery = document.getElementById("clientQueryInput");
  const clientStatus = document.getElementById("clientStatusSelect");
  if (modelQuery) ui.modelQuery = modelQuery.value.trim();
  if (modelScene) ui.modelScene = modelScene.value;
  if (clientQuery) ui.clientQuery = clientQuery.value.trim();
  if (clientStatus) ui.clientStatus = clientStatus.value;
}

function render() {
  els.navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.view === normalizeTopView(ui.view)));
  renderSidebar();
  if (ui.view === "home") renderHome();
  if (ui.view === "models") renderModels();
  if (ui.view === "model-training-records") renderTrainingRecords();
  if (ui.view === "model-training-workspace") renderTrainingWorkspace();
  if (ui.view === "library") renderLibrary();
  if (ui.view === "library-folder") renderFolderDetail();
  if (ui.view === "clients") renderClients();
}

function normalizeTopView(view) {
  if (view.startsWith("model-")) return "models";
  if (view.startsWith("library-")) return "library";
  return view;
}

function renderSidebar() {
  const topView = normalizeTopView(ui.view);
  const sidebarItems = {
    models: [{ id: "models", label: "快捷模型" }],
    clients: [{ id: "clients", label: "客户端列表" }],
  }[topView];

  if (!sidebarItems) {
    els.sidebar.hidden = true;
    els.sidebar.innerHTML = "";
    return;
  }

  els.sidebar.hidden = false;
  const title = topView === "models" ? "模型管理" : "客户端管理";
  els.sidebar.innerHTML = `
    <h2>${escapeHtml(title)}</h2>
    <div class="platform-side-list">
      ${sidebarItems
        .map(
          (item) => `
            <button class="platform-side-item is-active" data-action="set-view" data-id="${escapeAttr(item.id)}">
              <span class="side-dot"></span>${escapeHtml(item.label)}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderHome() {
  const folderCount = state.folders.length;
  const imageCount = state.folders.reduce((sum, folder) => sum + Number(folder.count || 0), 0);
  els.main.innerHTML = `
    <section class="platform-hero">
      <div>
        <h1>点击开启 AI 智能检测之旅</h1>
        <p>更准确，更高效，更有性价比的检测方式</p>
      </div>
      <div class="platform-hero-card">
        <strong>全民模式</strong>
        <span>2步完成模型定制，小白也能轻松上手~</span>
        <b>Base</b>
      </div>
    </section>

    <section class="platform-home-grid">
      <div class="platform-home-panel">
        <h2>我的终端</h2>
        <div class="platform-count-strip"><strong>${state.terminals.length}</strong><span>个 终端</span></div>
        <div class="terminal-card-grid">
          ${state.terminals
            .map(
              (client) => `
                <article class="terminal-mini-card">
                  <div>
                    <strong>${escapeHtml(client.name)}</strong>
                    <span>绑定时间：${formatDateTime(client.boundAt)}</span>
                  </div>
                  <span class="plain-status">${escapeHtml(client.status)}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>

      <div class="platform-home-panel">
        <h2>我的图像库</h2>
        <div class="platform-count-strip"><strong>${folderCount}</strong><span>个 图片集</span><i></i><strong>${imageCount}</strong><span>个 图像</span></div>
        <div class="library-card-grid home-library-grid">
          ${state.folders
            .slice(0, 6)
            .map((folder) => renderFolderCard(folder))
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderModels() {
  const rows = getFilteredModels();
  els.main.innerHTML = `
    ${renderBreadcrumb(["模型管理", "快捷模型"])}
    <section class="platform-table-page">
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
          <thead>
            <tr>
              <th>序号</th>
              <th>模型名称</th>
              <th>场景类型</th>
              <th>场景描述</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
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
                      <button data-action="noop" data-message="编辑功能会在后续版本细化">编辑</button>
                      <button class="danger-link" data-action="delete-model" data-id="${escapeAttr(model.id)}">删除</button>
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="platform-table-footer"><span>共 ${rows.length} 条</span><span class="pager-current">1</span><span>20条/页</span></div>
    </section>
  `;
}

function renderTrainingRecords() {
  const model = getSelectedModel();
  const rows = getTrainingRecords(model.id);
  els.main.innerHTML = `
    ${renderBreadcrumb(["模型管理", "快捷模型", model.name])}
    <section class="platform-table-page">
      <div class="platform-toolbar">
        <button class="secondary-btn" data-action="back-models">返回</button>
        <button class="primary-btn" data-action="new-training">新建训练</button>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>模型编号</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (record, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(record.code)}</td>
                    <td>${formatDateTime(record.createdAt)}</td>
                    <td>${renderTrainingStatus(record)}</td>
                    <td class="table-actions">
                      <button data-action="open-training" data-id="${escapeAttr(record.id)}">查看</button>
                      <button data-action="open-training" data-id="${escapeAttr(record.id)}">测试</button>
                      <button data-action="noop" data-message="下载模型包为占位演示">下载</button>
                      <button data-action="noop" data-message="更多操作会在后续补充">更多</button>
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="platform-table-footer"><span>共 ${rows.length} 条</span><span class="pager-current">1</span><span>20条/页</span></div>
    </section>
  `;
}

function renderTrainingWorkspace() {
  const model = getSelectedModel();
  const images = state.images.folder_kakou || [];
  els.main.innerHTML = `
    ${renderBreadcrumb(["模型管理", "快捷模型", model.name, "训练"])}
    <section class="training-workspace">
      <div class="training-top-actions">
        <button class="secondary-btn" data-action="training-records" data-id="${escapeAttr(model.id)}">退出训练</button>
        <span class="training-tip">在每张图像上把检测目标标注出来~</span>
        <button class="primary-btn" data-action="upload-image">添加图像</button>
        <button class="primary-btn is-disabled" data-action="noop" data-message="已进入训练准备态">开始训练</button>
      </div>
      <div class="training-body">
        <aside class="training-image-list">
          <div class="training-tabs">
            <button class="is-active">待处理 <span>(17)</span></button>
            <button>已完成 <span>(3)</span></button>
          </div>
          <div class="training-list-header"><span>序号</span><span>名称</span><span>操作</span></div>
          <div class="training-group">upload (17)</div>
          ${images
            .slice(0, 13)
            .map(
              (image, index) => `
                <div class="training-image-row${index === 0 ? " is-active" : ""}">
                  <span>No.${index + 1}</span>
                  <span>${escapeHtml(shorten(image.id))}</span>
                  <button class="danger-link" data-action="delete-image" data-id="${escapeAttr(image.id)}">删</button>
                </div>
              `,
            )
            .join("")}
          <button class="training-batch-btn" data-action="noop" data-message="批量处理会在后续细化">批量处理</button>
        </aside>
        <section class="annotation-stage">
          <div class="annotation-toolbar">
            <span>−</span><span>＋</span><span>1:1</span><span>拖拽</span><span>显示</span><span class="active-tool">框选</span><span>撤销</span><span>重做</span>
          </div>
          <div class="annotation-canvas">
            <img src="${IMAGE_KAKOU}" alt="安全卡扣训练图像" />
            <div class="annotation-label">
              <div><span class="red-dot"></span><strong>ng</strong><button>改</button><button>删</button></div>
              <button>＋ 添加新项</button>
            </div>
          </div>
          <button class="annotation-finish-btn" data-action="finish-annotation"><strong>完成</strong><span>点击按钮保存</span></button>
        </section>
      </div>
    </section>
  `;
}

function renderLibrary() {
  els.main.innerHTML = `
    <section class="platform-library-page">
      <div class="library-title-row"><h1>图像库</h1><button class="primary-btn" data-action="create-folder">新建文件夹</button></div>
      ${renderLibraryToolbar()}
      ${ui.imageMode === "grid" ? renderLibraryGrid() : renderLibraryTable()}
      <div class="platform-table-footer"><span>共 ${state.folders.length} 条</span><span class="pager-current">1</span><span>2</span><span>20条/页</span></div>
    </section>
  `;
}

function renderLibraryToolbar() {
  return `
    <div class="library-toolbar">
      <div class="segmented-control">
        <button class="${ui.imageMode === "list" ? "is-active" : ""}" data-action="library-mode" data-id="list">列表</button>
        <button class="${ui.imageMode === "grid" ? "is-active" : ""}" data-action="library-mode" data-id="grid">宫格</button>
      </div>
    </div>
  `;
}

function renderLibraryTable() {
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>图像数量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${state.folders
            .map(
              (folder) => `
                <tr>
                  <td><button class="folder-name-btn" data-action="open-folder" data-id="${escapeAttr(folder.id)}"><span class="folder-icon"></span>${escapeHtml(folder.name)}</button></td>
                  <td>${formatDateTime(folder.createdAt)}</td>
                  <td>${formatDateTime(folder.updatedAt)}</td>
                  <td>${folder.count}</td>
                  <td class="table-actions">
                    <button data-action="open-folder" data-id="${escapeAttr(folder.id)}">修改</button>
                    <button data-action="noop" data-message="导出图像集为占位演示">导出</button>
                    <button class="danger-link" data-action="noop" data-message="删除文件夹会在后续增加二次确认">删除</button>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderLibraryGrid() {
  return `<div class="library-card-grid">${state.folders.map((folder) => renderFolderCard(folder)).join("")}</div>`;
}

function renderFolderDetail() {
  const folder = getSelectedFolder();
  const images = getFilteredImages(folder.id);
  els.main.innerHTML = `
    <section class="folder-detail-page">
      <div class="folder-title-row">
        <button class="back-icon-btn" data-action="back-library">‹</button>
        <h1>${escapeHtml(folder.name)}</h1>
      </div>
      <div class="folder-toolbar">
        <div class="segmented-control">
          <button class="${ui.imageMode === "list" ? "is-active" : ""}" data-action="library-mode" data-id="list">列表</button>
          <button class="${ui.imageMode === "grid" ? "is-active" : ""}" data-action="library-mode" data-id="grid">宫格</button>
        </div>
        <button class="secondary-btn" data-action="noop" data-message="批量处理为占位演示">批量处理</button>
        <select id="folderDeviceSelect">
          <option value="all"${ui.folderDevice === "all" ? " selected" : ""}>请选择设备</option>
          <option value="ww"${ui.folderDevice === "ww" ? " selected" : ""}>ww</option>
        </select>
        <select id="folderTagSelect">
          <option value="all"${ui.folderTag === "all" ? " selected" : ""}>请选择标签</option>
          <option value="ng"${ui.folderTag === "ng" ? " selected" : ""}>ng</option>
        </select>
        <button class="secondary-btn" data-action="noop" data-message="标签库会在后续细化">标签库</button>
        <button class="primary-btn" data-action="upload-image">上传图像</button>
      </div>
      ${ui.imageMode === "grid" ? renderFolderGrid(images) : renderFolderTable(images)}
      <div class="platform-table-footer"><span>共 ${images.length} 条</span><span class="pager-current">1</span><span>2</span><span>3</span><span>20条/页</span></div>
    </section>
  `;
}

function renderFolderTable(images) {
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>图像尺寸</th>
            <th>采集时间</th>
            <th>采集设备</th>
            <th>标签</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${images
            .map(
              (image) => `
                <tr>
                  <td><span class="image-file-cell"><img src="${escapeAttr(image.url)}" alt="" />${escapeHtml(image.name)}</span></td>
                  <td>${escapeHtml(image.size || "")}</td>
                  <td>${formatDateTime(image.capturedAt)}</td>
                  <td>${escapeHtml(image.device || "")}</td>
                  <td>${escapeHtml(image.tag || "")}</td>
                  <td class="table-actions"><button class="danger-link" data-action="delete-image" data-id="${escapeAttr(image.id)}">删除</button></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFolderGrid(images) {
  return `
    <div class="folder-image-grid">
      ${images
        .map(
          (image) => `
            <article class="folder-image-card">
              <img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.name)}" />
              <strong>${escapeHtml(image.name)}</strong>
              <span>${escapeHtml(image.tag || "未标注")}</span>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderClients() {
  const rows = getFilteredClients();
  els.main.innerHTML = `
    ${renderBreadcrumb(["客户端管理", "客户端列表"])}
    <section class="platform-table-page">
      <div class="client-title-row">
        <h1>客户端管理</h1>
        <span class="inline-metric">客户端配额：${state.terminals.length}/${state.enterprise.clientQuota}</span>
      </div>
      <div class="platform-toolbar">
        <div class="toolbar-left">
          <select id="clientStatusSelect">
            <option value="all"${ui.clientStatus === "all" ? " selected" : ""}>请选择客户端状态</option>
            <option value="在线"${ui.clientStatus === "在线" ? " selected" : ""}>在线</option>
            <option value="离线"${ui.clientStatus === "离线" ? " selected" : ""}>离线</option>
          </select>
          <input id="clientQueryInput" value="${escapeAttr(ui.clientQuery)}" placeholder="请输入客户端名称或硬件识别码" />
        </div>
        <div class="toolbar-right">
          <button class="secondary-btn" data-action="reset-clients">重置</button>
          <button class="primary-btn" data-action="search-clients">查询</button>
        </div>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table">
          <thead>
            <tr>
              <th>客户端名称</th>
              <th>硬件识别码</th>
              <th>绑定时间</th>
              <th>客户端状态</th>
              <th>最近离线时间</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (client) => `
                  <tr>
                    <td>${escapeHtml(client.name)}</td>
                    <td class="hardware-code">${escapeHtml(client.hardwareCode)}</td>
                    <td>${formatDateTime(client.boundAt)}</td>
                    <td>${renderStatusBadge(client.status)}</td>
                    <td>${formatDateTime(client.offlineAt)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderFolderCard(folder) {
  return `
    <article class="library-folder-card" data-action="open-folder" data-id="${escapeAttr(folder.id)}">
      <strong>${escapeHtml(folder.name)}</strong>
      <span>${folder.count}张图片</span>
      <div></div>
      <img src="${escapeAttr(folder.cover)}" alt="${escapeAttr(folder.name)}" />
    </article>
  `;
}

function renderBreadcrumb(items) {
  return `<div class="platform-breadcrumb">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderTrainingStatus(record) {
  if (record.status === "训练完成") {
    return `<span class="training-status is-done">训练完成</span><span class="training-meta">完成时间：${formatDateTime(record.completedAt)}　训练耗时：${escapeHtml(record.duration)}</span>`;
  }
  return `<span class="training-status is-pending">待训练</span>`;
}

function renderStatusBadge(status) {
  return `<span class="platform-status-badge ${status === "在线" ? "is-online" : "is-offline"}">${escapeHtml(status)}</span>`;
}

function getFilteredModels() {
  return state.models
    .filter((model) => ui.modelScene === "all" || model.sceneType === ui.modelScene)
    .filter((model) => !ui.modelQuery || model.name.toLowerCase().includes(ui.modelQuery.toLowerCase()))
    .sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));
}

function getFilteredClients() {
  const keyword = ui.clientQuery.toLowerCase();
  return state.terminals.filter((client) => {
    const statusMatch = ui.clientStatus === "all" || client.status === ui.clientStatus;
    const keywordMatch = !keyword || client.name.toLowerCase().includes(keyword) || client.hardwareCode.toLowerCase().includes(keyword);
    return statusMatch && keywordMatch;
  });
}

function getFilteredImages(folderId) {
  const images = state.images[folderId] || buildFallbackImages(getSelectedFolder());
  return images.filter((image) => {
    const deviceMatch = ui.folderDevice === "all" || image.device === ui.folderDevice;
    const tagMatch = ui.folderTag === "all" || image.tag === ui.folderTag;
    return deviceMatch && tagMatch;
  });
}

function getSelectedModel() {
  return state.models.find((model) => model.id === ui.selectedModelId) || state.models[0];
}

function getSelectedFolder() {
  return state.folders.find((folder) => folder.id === ui.selectedFolderId) || state.folders[0];
}

function getTrainingRecords(modelId) {
  if (!state.trainingRecords[modelId]) {
    state.trainingRecords[modelId] = [
      { id: `${Date.now()}`, code: "2026052616451", createdAt: "2026-05-26T10:48:16+08:00", status: "训练完成", completedAt: "2026-05-26T11:03:46+08:00", duration: "15分钟26秒" },
    ];
  }
  return state.trainingRecords[modelId];
}

function buildFallbackImages(folder) {
  const image = folder.cover || IMAGE_KAKOU;
  return Array.from({ length: folder.count }, (_, index) => ({
    id: `${folder.id}_${index + 1}`,
    name: `Image_${folder.name}_${String(index + 1).padStart(3, "0")}.jpg`,
    size: "",
    capturedAt: "",
    device: "",
    tag: "",
    url: image,
  }));
}

function createModel() {
  const index = state.models.length + 1;
  state.models.unshift({
    id: `model_created_${Date.now()}`,
    name: `新建模型-${index}`,
    sceneType: "分类",
    description: "",
    createdAt: "2026-05-26T16:00:00+08:00",
    updatedAt: "2026-05-26T16:00:00+08:00",
  });
  savePlatformState();
  render();
  showToast("已创建一个示例模型");
}

function deleteModel(id) {
  state.models = state.models.filter((model) => model.id !== id);
  delete state.trainingRecords[id];
  savePlatformState();
  render();
  showToast("模型已删除");
}

function createTrainingRecord() {
  const model = getSelectedModel();
  const records = getTrainingRecords(model.id);
  records.unshift({
    id: `record_${Date.now()}`,
    code: "2026052617001",
    createdAt: "2026-05-26T17:00:01+08:00",
    status: "待训练",
    completedAt: "",
    duration: "",
  });
  savePlatformState();
  render();
  showToast("已创建待训练记录");
}

function createFolder() {
  const index = state.folders.length + 1;
  const folder = {
    id: `folder_created_${Date.now()}`,
    name: `新建文件夹-${index}`,
    createdAt: "2026-05-26T16:30:00+08:00",
    updatedAt: "2026-05-26T16:30:00+08:00",
    count: 0,
    cover: IMAGE_KAKOU,
  };
  state.folders.unshift(folder);
  state.images[folder.id] = [];
  savePlatformState();
  render();
  showToast("已创建文件夹");
}

function uploadImage() {
  const folder = getSelectedFolder();
  const image = {
    id: `uploaded_${Date.now()}`,
    name: `Image_202605261650${String((state.images[folder.id] || []).length + 1).padStart(2, "0")}.jpg`,
    size: "1920 x 1080",
    capturedAt: "2026-05-26T16:50:00+08:00",
    device: "ww",
    tag: "",
    url: folder.cover || IMAGE_KAKOU,
  };
  if (!state.images[folder.id]) state.images[folder.id] = [];
  state.images[folder.id].unshift(image);
  folder.count += 1;
  folder.updatedAt = "2026-05-26T16:50:00+08:00";
  savePlatformState();
  render();
  showToast("已添加一张示例图像");
}

function deleteImage(id) {
  Object.entries(state.images).forEach(([folderId, images]) => {
    const nextImages = images.filter((image) => image.id !== id);
    if (nextImages.length !== images.length) {
      state.images[folderId] = nextImages;
      const folder = state.folders.find((item) => item.id === folderId);
      if (folder) folder.count = Math.max(0, folder.count - 1);
    }
  });
  savePlatformState();
  render();
  showToast("图像已删除");
}

function loadPlatformState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PLATFORM_STORAGE_KEY) || "");
    if (parsed && parsed.version === 1) {
      return mergeState(parsed);
    }
  } catch (_error) {
    // Ignore invalid browser cache and rebuild from defaults.
  }
  return clone(DEFAULT_PLATFORM_STATE);
}

function mergeState(cached) {
  const next = clone(DEFAULT_PLATFORM_STATE);
  next.enterprise = { ...next.enterprise, ...(cached.enterprise || {}) };
  next.terminals = Array.isArray(cached.terminals) ? cached.terminals : next.terminals;
  next.models = Array.isArray(cached.models) ? cached.models : next.models;
  next.trainingRecords = cached.trainingRecords && typeof cached.trainingRecords === "object" ? cached.trainingRecords : next.trainingRecords;
  next.folders = Array.isArray(cached.folders) ? cached.folders : next.folders;
  next.images = cached.images && typeof cached.images === "object" ? cached.images : next.images;
  return next;
}

function savePlatformState() {
  localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify({ version: 1, ...state }));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseTime(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function formatDateTime(value) {
  if (!value) return "";
  if (typeof Demo.formatDateTime === "function") return Demo.formatDateTime(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function shorten(value) {
  return String(value).replace(/^(.{8}).*(.{4})$/, "$1-...");
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
  window.setTimeout(() => toast.remove(), 2600);
}

init();
