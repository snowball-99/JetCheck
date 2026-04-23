const TABS = [
  {
    key: "calibration",
    label: "标定",
    title: "标定",
    desc: "选择标定模板，导入标定图并完成自动标定。",
    note: "标定允许后置。当前窗口以配置链路为主，不在进入步骤时做强阻断。",
    modeLabel: "当前模式：标定",
  },
  {
    key: "roi",
    label: "模版图",
    title: "模版图配置",
    desc: "上传模版图，并完成检测对象与出现范围的 ROI 配置。",
    note: "模版图是后续测量的基础，检测对象 ROI 与出现范围 ROI 都需要完成。",
    modeLabel: "当前模式：模版图配置",
  },
  {
    key: "measure",
    label: "测量项",
    title: "测量项配置",
    desc: "在 ROI 基础上新增测量项，必要时补充上下限。",
    note: "公差不再单独成步，测量类工具可在本步直接填写上下限。",
    modeLabel: "当前模式：测量项",
  },
  {
    key: "validate",
    label: "验证",
    title: "验证",
    desc: "选择验证样本并查看当前工程配置在样本上的输出结果。",
    note: "验证允许跳过，发布前检查会统一提示当前工程是否已完成验证。",
    modeLabel: "当前模式：验证",
  },
  {
    key: "release",
    label: "发布",
    title: "发布",
    desc: "集中做发布前检查，生成发布版本并推送到客户端可消费目录。",
    note: "主要约束集中在发布前检查，而不是分散到步骤切换里。",
    modeLabel: "当前模式：发布",
  },
];

const MEASURE_TOOL_SECTIONS = [
  {
    key: "element",
    title: "元素",
    tools: [
      { key: "anchor_point", label: "定位点", icon: "PT" },
      { key: "edge_line", label: "边缘线", icon: "LN" },
      { key: "circle_feature", label: "圆特征", icon: "CR" },
    ],
  },
  {
    key: "construct",
    title: "构造",
    tools: [
      { key: "center_axis", label: "中心轴", icon: "AX" },
      { key: "midline", label: "中分线", icon: "ML" },
      { key: "baseline_box", label: "基准框", icon: "BX" },
    ],
  },
  {
    key: "measure",
    title: "测量",
    tools: [
      { key: "measure_length", label: "长度", icon: "LG" },
      { key: "measure_angle", label: "角度", icon: "AG" },
      { key: "measure_diameter", label: "直径", icon: "DM" },
    ],
  },
];

const MEASURE_TOOL_META = {
  anchor_point: {
    name: "定位点",
    category: "元素",
    itemName: "基准点 A",
    drawHint: "单击图像放置定位点",
  },
  edge_line: {
    name: "边缘线",
    category: "元素",
    itemName: "外轮廓边缘",
    drawHint: "沿目标边缘拖拽画线",
  },
  circle_feature: {
    name: "圆特征",
    category: "元素",
    itemName: "头部圆特征",
    drawHint: "围绕目标区域拖拽画圆",
  },
  center_axis: {
    name: "中心轴",
    category: "构造",
    itemName: "主体中心轴",
    drawHint: "依次选择两条参考边生成轴线",
  },
  midline: {
    name: "中分线",
    category: "构造",
    itemName: "槽位中分线",
    drawHint: "选择两条边后生成中分线",
  },
  baseline_box: {
    name: "基准框",
    category: "构造",
    itemName: "基准检测框",
    drawHint: "拖拽画出基准参考框",
  },
  measure_length: {
    name: "长度",
    category: "测量",
    itemName: "总长",
    drawHint: "在起点与终点之间拖拽画线",
  },
  measure_angle: {
    name: "角度",
    category: "测量",
    itemName: "偏转角",
    drawHint: "依次选择两条线计算夹角",
  },
  measure_diameter: {
    name: "直径",
    category: "测量",
    itemName: "头部直径",
    drawHint: "圈选圆特征后输出直径",
  },
};

const PROJECTS = [
  {
    id: "proj_001",
    name: "安全卡扣A01型号左件",
    product: "安全座椅卡扣",
    station: "Line-A / Station-02",
    version: "Draft 0.4",
    releaseState: "未发布草稿",
    status: "本地工程",
    updatedAt: "今天 14:20",
    owner: "Operator-A",
    workflowState: {
      calibration: false,
      template: true,
      roi: true,
      measure: false,
      validate: false,
    },
    measureCount: 2,
    roiCount: 1,
    validationState: "待验证",
    calibrationState: "已补齐",
    assets: [
      { id: "asset_cal_01", group: "标定图", label: "标定板图像", sampleId: "cal_board" },
      { id: "asset_ref_01", group: "参考图", label: "螺杆定位图", sampleId: "screw_main" },
      { id: "asset_val_01", group: "验证图", label: "验证样本 A", sampleId: "val_ok" },
      { id: "asset_val_02", group: "验证图", label: "验证样本 B", sampleId: "val_warn" },
    ],
    samples: [
      {
        id: "cal_board",
        name: "标定板图像",
        image: "./sample-images/标定板图像.png",
        status: "ok",
        statusLabel: "已导入",
        summary: "板型 A-10mm",
      },
      {
        id: "screw_main",
        name: "螺杆图像",
        image: "./sample-images/螺杆图像.bmp",
        status: "ok",
        statusLabel: "参考图",
        summary: "主样本",
      },
      {
        id: "val_ok",
        name: "验证样本 A",
        image: "./sample-images/螺杆图像.bmp",
        status: "ok",
        statusLabel: "OK 样本",
        summary: "",
        metric: "长度 16.443 mm",
      },
      {
        id: "val_warn",
        name: "验证样本 B",
        image: "./sample-images/螺杆图像.bmp",
        status: "warn",
        statusLabel: "NG 样本",
        summary: "",
        metric: "长度 16.701 mm",
      },
      {
        id: "val_error",
        name: "验证样本 C",
        image: "./sample-images/螺杆图像.bmp",
        status: "error",
        statusLabel: "异常样本",
        summary: "",
        metric: "",
      },
    ],
    tabState: {
      calibration: {
        sampleIds: ["cal_board"],
        defaultSampleId: "cal_board",
        overlays: {
          cal_board: [
            { type: "roi", x: 16, y: 18, w: 68, h: 54, label: "标定板搜索区" },
            { type: "box", x: 33, y: 28, w: 28, h: 22, label: "标定板识别结果" },
            { type: "tag", x: 33, y: 56, text: "0.021 mm/px" },
          ],
        },
        results: [
          { label: "标定板", value: "标准板 A-10mm" },
          { label: "像素尺寸", value: "0.021 mm/px" },
        ],
        fields: [
          { label: "标定板类型", value: "标准板 A-10mm" },
          { label: "识别方式", value: "内置算子 / 自动识别" },
          { label: "输出记录", value: "CAL-20260409-01" },
          { label: "适用条件", value: "Cam-Top-02 / 2448x2048" },
        ],
      },
      roi: {
        sampleIds: ["screw_main"],
        defaultSampleId: "screw_main",
        overlays: {
          screw_main: [
            { type: "roi", x: 12, y: 18, w: 72, h: 58 },
            { type: "box", x: 42, y: 34, w: 16, h: 20 },
          ],
        },
        results: [
          { label: "模版图", value: "螺杆图像" },
          { label: "检测对象", value: "已框选" },
          { label: "出现范围", value: "已框选" },
        ],
        fields: [
          { label: "模版图文件", value: "螺杆图像.bmp" },
          { label: "检测对象 ROI", value: "已配置" },
          { label: "出现范围 ROI", value: "已配置" },
        ],
      },
      measure: {
        sampleIds: ["screw_main"],
        defaultSampleId: "screw_main",
        overlays: {
          screw_main: [
            { type: "line", x: 26, y: 45, len: 42, angle: 6, label: "长度" },
            { type: "circle", x: 48, y: 37, d: 13, label: "头部直径" },
            { type: "tag", x: 44, y: 57, text: "mm" },
          ],
        },
        results: [
          { label: "测量项数量", value: "2" },
          { label: "测量类型", value: "长度 / 圆直径" },
          { label: "单位", value: "mm" },
          { label: "精度", value: "0.001" },
        ],
        fields: [
          { label: "当前测量项", value: "长度" },
          { label: "对象关系", value: "点到点 / 轴向" },
          { label: "输出单位", value: "mm" },
          { label: "显示精度", value: "0.001" },
        ],
      },
      tolerance: {
        sampleIds: ["screw_main"],
        defaultSampleId: "screw_main",
        overlays: {
          screw_main: [
            { type: "line", x: 26, y: 45, len: 42, angle: 6, label: "长度 16.443" },
            { type: "tag", x: 20, y: 24, text: "LSL 16.200 / USL 16.700" },
            { type: "circle", x: 48, y: 37, d: 13, label: "头部直径 5.091" },
          ],
        },
        results: [
          { label: "已配公差项", value: "2 / 2" },
          { label: "长度上限", value: "16.700 mm" },
          { label: "长度下限", value: "16.200 mm" },
          { label: "超差输出", value: "已开启" },
        ],
        fields: [
          { label: "当前项", value: "长度" },
          { label: "标称值", value: "16.450 mm" },
          { label: "上限", value: "16.700 mm" },
          { label: "下限", value: "16.200 mm" },
        ],
      },
      validate: {
        sampleIds: ["val_ok", "val_warn", "val_error"],
        defaultSampleId: "val_ok",
        overlays: {
          val_ok: [
            { type: "roi", x: 12, y: 18, w: 72, h: 58 },
            { type: "box", x: 42, y: 34, w: 16, h: 20 },
            { type: "line", x: 26, y: 45, len: 42, angle: 6, label: "长度" },
            { type: "tag", x: 42, y: 56, text: "16.443 mm" },
          ],
          val_warn: [
            { type: "roi", x: 12, y: 18, w: 72, h: 58 },
            { type: "box", x: 42, y: 34, w: 16, h: 20 },
            { type: "line", x: 24, y: 47, len: 42, angle: 9, label: "长度" },
            { type: "tag", x: 40, y: 58, text: "16.701 mm" },
          ],
          val_error: [
            { type: "roi", x: 12, y: 18, w: 72, h: 58 },
            { type: "box", x: 42, y: 34, w: 16, h: 20 },
          ],
        },
        results: [
          { label: "验证样本", value: "3" },
          { label: "通过", value: "1" },
          { label: "告警", value: "1" },
          { label: "异常", value: "1" },
        ],
        fields: [
          { label: "验证方式", value: "单次 + 轻量批量" },
          { label: "样本集", value: "螺杆验证集 A" },
          { label: "告警处理", value: "允许继续发布" },
          { label: "结果记录", value: "VAL-20260409-02" },
        ],
      },
      release: {
        sampleIds: ["screw_main"],
        defaultSampleId: "screw_main",
        overlays: {
          screw_main: [
            { type: "box", x: 12, y: 18, w: 72, h: 58, label: "发布范围" },
            { type: "tag", x: 20, y: 24, text: "REL-SeatBuckel-0.4" },
          ],
        },
        results: [
          { label: "尺寸方案", value: "SeatBuckel-DIM" },
          { label: "发布版本", value: "REL-SeatBuckel-0.4" },
          { label: "客户端目标", value: "JetCheck Client" },
          { label: "验证状态", value: "可跳过" },
        ],
        fields: [
          { label: "版本号", value: "REL-SeatBuckel-0.4" },
          { label: "方案名称", value: "SeatBuckel-DIM" },
          { label: "发布目标", value: "JetCheck Client 可消费目录" },
          { label: "发布说明", value: "允许未验证发布" },
        ],
      },
    },
    releaseChecks: [
      { label: "工程基础信息", tone: "ok" },
      { label: "ROI 已配置", tone: "ok" },
      { label: "测量项已配置", tone: "ok" },
      { label: "公差可选", tone: "neutral" },
      { label: "验证允许跳过", tone: "neutral" },
      { label: "标定建议补齐", tone: "warn" },
    ],
  },
  {
    id: "proj_002",
    name: "安全卡扣A02型号左件",
    product: "螺杆尺寸检测",
    station: "Line-B / Xray-01",
    version: "Draft 0.2",
    releaseState: "草稿工程",
    status: "本地工程",
    updatedAt: "昨天 18:05",
    owner: "Operator-A",
    workflowState: {
      calibration: false,
      template: true,
      roi: false,
      measure: false,
      validate: false,
    },
    measureCount: 1,
    roiCount: 1,
    validationState: "未验证",
    calibrationState: "未补齐",
    assets: [
      { id: "asset_ref_11", group: "参考图", label: "X 光 ROI 图", sampleId: "xray_main" },
      { id: "asset_val_11", group: "验证图", label: "X 光验证样本", sampleId: "xray_warn" },
    ],
    samples: [
      {
        id: "xray_main",
        name: "X 光 ROI 图",
        image: "./sample-images/螺杆图像.bmp",
        status: "ok",
        statusLabel: "参考图",
        summary: "草稿中",
      },
      {
        id: "xray_warn",
        name: "X 光验证样本",
        image: "./sample-images/螺杆图像.bmp",
        status: "error",
        statusLabel: "异常样本",
        summary: "",
        metric: "",
      },
    ],
    tabState: {
      calibration: {
        sampleIds: ["xray_main"],
        defaultSampleId: "xray_main",
        overlays: {
          xray_main: [{ type: "tag", x: 20, y: 24, text: "当前工程尚未补标定" }],
        },
        results: [
          { label: "标定状态", value: "未补齐" },
          { label: "发布阻断", value: "待发布前检查确认" },
        ],
        fields: [
          { label: "当前状态", value: "草稿" },
          { label: "说明", value: "允许先完成 ROI 与测量项" },
        ],
      },
      roi: {
        sampleIds: ["xray_main"],
        defaultSampleId: "xray_main",
        overlays: {
          xray_main: [
            { type: "roi", x: 14, y: 16, w: 70, h: 60, label: "X 光 ROI" },
            { type: "line", x: 30, y: 46, len: 38, angle: 4, label: "定位轴线" },
          ],
        },
        results: [
          { label: "ROI 数量", value: "1" },
          { label: "参考对象", value: "加热丝轴线" },
        ],
        fields: [
          { label: "ROI 名称", value: "X 光主 ROI" },
          { label: "参考对象", value: "加热丝主体" },
        ],
      },
      measure: {
        sampleIds: ["xray_main"],
        defaultSampleId: "xray_main",
        overlays: {
          xray_main: [{ type: "line", x: 30, y: 46, len: 38, angle: 4, label: "长度" }],
        },
        results: [
          { label: "测量项数量", value: "1" },
          { label: "当前项", value: "长度" },
        ],
        fields: [
          { label: "单位", value: "mm" },
          { label: "精度", value: "0.001" },
        ],
      },
      tolerance: {
        sampleIds: ["xray_main"],
        defaultSampleId: "xray_main",
        overlays: {
          xray_main: [{ type: "tag", x: 20, y: 24, text: "尚未配置公差" }],
        },
        results: [{ label: "公差状态", value: "未配置" }],
        fields: [{ label: "当前口径", value: "允许先发布无公差版本" }],
      },
      validate: {
        sampleIds: ["xray_warn"],
        defaultSampleId: "xray_warn",
        overlays: {
          xray_warn: [
            { type: "roi", x: 14, y: 16, w: 70, h: 60 },
            { type: "box", x: 40, y: 35, w: 16, h: 20 },
          ],
        },
        results: [{ label: "验证状态", value: "未执行" }],
        fields: [{ label: "说明", value: "当前项目允许未验证直接发布" }],
      },
      release: {
        sampleIds: ["xray_main"],
        defaultSampleId: "xray_main",
        overlays: {
          xray_main: [{ type: "tag", x: 20, y: 24, text: "REL-Master-0.2" }],
        },
        results: [{ label: "发布版本", value: "REL-Master-0.2" }],
        fields: [{ label: "发布说明", value: "当前为草稿发布示意" }],
      },
    },
    releaseChecks: [
      { label: "工程基础信息", tone: "ok" },
      { label: "ROI 已配置", tone: "ok" },
      { label: "测量项已配置", tone: "ok" },
      { label: "标定未补齐", tone: "warn" },
      { label: "验证未执行", tone: "neutral" },
    ],
  },
  {
    id: "proj_003",
    name: "安全卡扣B03型号左件",
    product: "卡扣尺寸 B 型",
    station: "Line-C / Station-01",
    version: "Release 1.0",
    releaseState: "已发布版本",
    status: "本地工程",
    updatedAt: "昨天 09:12",
    owner: "Engineer-Li",
    workflowState: {
      calibration: true,
      template: true,
      roi: true,
      measure: true,
      validate: true,
    },
    measureCount: 3,
    roiCount: 2,
    validationState: "已验证",
    calibrationState: "已补齐",
    assets: [
      { id: "asset_cal_31", group: "标定图", label: "标定板图像", sampleId: "buckle_cal" },
      { id: "asset_ref_31", group: "参考图", label: "卡扣参考图", sampleId: "buckle_ref" },
    ],
    samples: [
      {
        id: "buckle_cal",
        name: "标定板图像",
        image: "./sample-images/标定板图像.png",
        status: "ok",
        statusLabel: "已导入",
        summary: "板型 B-20mm",
      },
      {
        id: "buckle_ref",
        name: "卡扣参考图",
        image: "./sample-images/螺杆图像.bmp",
        status: "ok",
        statusLabel: "参考图",
        summary: "已发布",
      },
    ],
    tabState: {},
    releaseChecks: [
      { label: "工程基础信息", tone: "ok" },
      { label: "ROI 已配置", tone: "ok" },
      { label: "测量项已配置", tone: "ok" },
      { label: "已验证", tone: "ok" },
      { label: "已发布", tone: "ok" },
    ],
  },
];

const state = {
  startupVisible: true,
  projectId: PROJECTS[0]?.id || "",
  managerSelectedProjectId: PROJECTS[0]?.id || "",
  tabKey: TABS[0].key,
  sampleByTab: {},
  measureToolSectionKey: "measure",
  measureToolKey: "measure_length",
  activeWindow: "manager",
  editorOpen: false,
  managerQuery: "",
  managerMenuProjectId: "",
  managerMessage: "",
  modal: null,
  settingsOpen: false,
  localSettings: {
    autoSave: true,
    paths: [
      { key: "project_root", label: "工程根目录", value: "D:\\JetCheck\\Projects" },
      { key: "import_root", label: "导入目录", value: "D:\\JetCheck\\Import" },
      { key: "export_root", label: "导出目录", value: "D:\\JetCheck\\Export" },
      { key: "log_root", label: "日志目录", value: "D:\\JetCheck\\Logs" },
    ],
  },
};

const refs = {
  desktop: document.getElementById("dtDesktop"),
  startupEnterBtn: document.getElementById("dtStartupEnterBtn"),
  desktopStage: document.getElementById("dtDesktopStage"),
  projectList: document.getElementById("dtProjectList"),
  managerEmpty: document.getElementById("dtManagerEmpty"),
  managerHint: document.getElementById("dtManagerHint"),
  managerMessage: document.getElementById("dtManagerMessage"),
  openSettingsBtn: document.getElementById("dtOpenSettingsBtn"),
  emptyTitle: document.getElementById("dtEmptyTitle"),
  emptyDesc: document.getElementById("dtEmptyDesc"),
  createProjectBtn: document.getElementById("dtCreateProjectBtn"),
  importProjectBtn: document.getElementById("dtImportProjectBtn"),
  projectSearch: document.getElementById("dtProjectSearch"),
  editorWindowTitle: document.getElementById("dtEditorWindowTitle"),
  workspace: document.getElementById("dtWorkspace"),
  leftPanel: document.getElementById("dtLeftPanel"),
  stageUpload: document.getElementById("dtStageUpload"),
  stageContent: document.getElementById("dtStageContent"),
  rightPanel: document.getElementById("dtRightPanel"),
  projectCard: document.getElementById("dtProjectCard"),
  projectNav: document.getElementById("dtProjectNav"),
  assetTree: document.getElementById("dtAssetTree"),
  tabList: document.getElementById("dtTabList"),
  prevStepBtn: document.getElementById("dtPrevStepBtn"),
  nextStepBtn: document.getElementById("dtNextStepBtn"),
  skipStepBtn: document.getElementById("dtSkipStepBtn"),
  stageImage: document.getElementById("dtStageImage"),
  overlay: document.getElementById("dtOverlay"),
  sampleList: document.getElementById("dtSampleList"),
  resultBoard: document.getElementById("dtResultBoard"),
  fieldList: document.getElementById("dtFieldList"),
  checkList: document.getElementById("dtCheckList"),
  noteCard: document.getElementById("dtNoteCard"),
  taskbarApps: Array.from(document.querySelectorAll("[data-window-target]")),
  editorTaskbarBtn: document.getElementById("dtEditorTaskbarBtn"),
  editorCloseBtn: document.getElementById("dtEditorCloseBtn"),
  projectModal: document.getElementById("dtProjectModal"),
  settingsModal: document.getElementById("dtSettingsModal"),
  modalTitle: document.getElementById("dtModalTitle"),
  modalDesc: document.getElementById("dtModalDesc"),
  modalCloseBtn: document.getElementById("dtModalCloseBtn"),
  modalCancelBtn: document.getElementById("dtModalCancelBtn"),
  projectForm: document.getElementById("dtProjectForm"),
  projectNameInput: document.getElementById("dtProjectNameInput"),
  projectNoteInput: document.getElementById("dtProjectNoteInput"),
  modalError: document.getElementById("dtModalError"),
  modalSubmitBtn: document.getElementById("dtModalSubmitBtn"),
  settingsCloseBtn: document.getElementById("dtSettingsCloseBtn"),
  settingsCancelBtn: document.getElementById("dtSettingsCancelBtn"),
  settingsSaveBtn: document.getElementById("dtSettingsSaveBtn"),
  settingsPathList: document.getElementById("dtSettingsPathList"),
  settingsAutoSaveInput: document.getElementById("dtSettingsAutoSaveInput"),
  windows: Array.from(document.querySelectorAll("[data-window]")),
};

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatNowLabel() {
  const now = new Date();
  const hh = `${now.getHours()}`.padStart(2, "0");
  const mm = `${now.getMinutes()}`.padStart(2, "0");
  return `今天 ${hh}:${mm}`;
}

function buildProjectId() {
  return `proj_${Date.now().toString(36)}`;
}

function makeCopyName(baseName) {
  const existing = new Set(PROJECTS.map((project) => project.name));
  let nextName = `${baseName}-副本`;
  let index = 2;
  while (existing.has(nextName)) {
    nextName = `${baseName}-副本${index}`;
    index += 1;
  }
  return nextName;
}

function createBaseProjectTemplate() {
  if (PROJECTS[0]) return cloneDeep(PROJECTS[0]);
  return {
    id: "",
    name: "",
    product: "尺寸检测",
    station: "Windows 工作站",
    version: "Draft 0.1",
    releaseState: "草稿工程",
    status: "本地工程",
    updatedAt: formatNowLabel(),
    owner: "Operator-A",
    measureCount: 0,
    roiCount: 0,
    validationState: "未验证",
    calibrationState: "未补齐",
    assets: [],
    samples: [],
    tabState: {},
    releaseChecks: [
      { label: "工程基础信息", tone: "ok" },
      { label: "ROI 待配置", tone: "warn" },
      { label: "测量项待配置", tone: "warn" },
    ],
  };
}

function buildDraftProject(name, note) {
  const project = createBaseProjectTemplate();
  project.id = buildProjectId();
  project.name = name;
  project.version = "Draft 0.1";
  project.releaseState = "草稿工程";
  project.updatedAt = formatNowLabel();
  project.owner = "Operator-A";
  project.note = note || "";
  return project;
}

function normalizeProjectState(project) {
  return /已发布/.test(project.releaseState) ? "已发布" : "草稿";
}

function findProject(projectId) {
  return PROJECTS.find((item) => item.id === projectId) || null;
}

function getProject() {
  return findProject(state.projectId) || PROJECTS[0] || null;
}

function getTab() {
  return TABS.find((item) => item.key === state.tabKey) || TABS[0];
}

function getTabState(project = getProject(), tabKey = state.tabKey) {
  if (!project) {
    return { sampleIds: [], defaultSampleId: "", overlays: {}, results: [], fields: [] };
  }
  return project.tabState?.[tabKey] || {
    sampleIds: project.samples?.slice(0, 1).map((item) => item.id) || [],
    defaultSampleId: project.samples?.[0]?.id || "",
    overlays: {},
    results: [],
    fields: [],
  };
}

function getSamplesForTab(project = getProject(), tabKey = state.tabKey) {
  if (!project) return [];
  const tabState = getTabState(project, tabKey);
  return (tabState.sampleIds || [])
    .map((sampleId) => project.samples.find((item) => item.id === sampleId))
    .filter(Boolean);
}

function getActiveSample(project = getProject(), tabKey = state.tabKey) {
  if (!project) return null;
  const tabState = getTabState(project, tabKey);
  const allowedSampleIds = new Set(tabState.sampleIds || []);
  const sampleId = state.sampleByTab[tabKey] || tabState.defaultSampleId;
  return (
    project.samples.find((item) => item.id === sampleId && allowedSampleIds.has(item.id)) ||
    getSamplesForTab(project, tabKey)[0] ||
    project.samples[0] ||
    null
  );
}

function getMeasureToolMeta() {
  return MEASURE_TOOL_META[state.measureToolKey] || MEASURE_TOOL_META.measure_length;
}

function getMeasureSection() {
  return (
    MEASURE_TOOL_SECTIONS.find((section) => section.key === state.measureToolSectionKey) ||
    MEASURE_TOOL_SECTIONS[0]
  );
}

function getReleaseChecks(project) {
  const workflowState = project?.workflowState || {};
  const calibrationReady = workflowState.calibration === true;
  const templateReady = workflowState.template === true;
  const roiReady = workflowState.roi === true;
  const measureReady = workflowState.measure === true;
  const validateReady = workflowState.validate === true;

  return [
    {
      key: "calibration",
      label: "标定",
      status: calibrationReady ? "done" : "skip",
      statusLabel: calibrationReady ? "已完成" : "可跳过",
      required: false,
    },
    {
      key: "template",
      label: "模版图配置",
      status: templateReady ? "done" : "missing",
      statusLabel: templateReady ? "已完成" : "未完成",
      required: true,
      targetTab: "roi",
    },
    {
      key: "roi",
      label: "ROI 配置",
      status: roiReady ? "done" : "missing",
      statusLabel: roiReady ? "已完成" : "未完成",
      required: true,
      targetTab: "roi",
    },
    {
      key: "measure",
      label: "测量项配置",
      status: measureReady ? "done" : "missing",
      statusLabel: measureReady ? "已完成" : "未完成",
      required: true,
      targetTab: "measure",
    },
    {
      key: "validate",
      label: "验证",
      status: validateReady ? "done" : "skip",
      statusLabel: validateReady ? "已完成" : "可跳过",
      required: false,
      targetTab: "validate",
    },
  ];
}

function getReleaseReadiness(project) {
  const checks = getReleaseChecks(project);
  const missingRequired = checks.filter((item) => item.required && item.status === "missing");
  return {
    checks,
    canRelease: missingRequired.length === 0,
    blockingMessage:
      missingRequired.length > 0
        ? `还需完成${missingRequired.map((item) => item.label).join("、")}后才能发布`
        : "可以发布",
  };
}

function ensureProjectSelection() {
  if (!PROJECTS.length) {
    state.projectId = "";
    state.managerSelectedProjectId = "";
    state.activeWindow = "manager";
    state.editorOpen = false;
    return;
  }
  if (!findProject(state.projectId)) {
    state.projectId = PROJECTS[0].id;
  }
  if (!findProject(state.managerSelectedProjectId)) {
    state.managerSelectedProjectId = state.projectId;
  }
}

function ensureSampleState() {
  const project = getProject();
  if (!project) return;
  TABS.forEach((tab) => {
    const tabState = getTabState(project, tab.key);
    if (!state.sampleByTab[tab.key]) {
      state.sampleByTab[tab.key] = tabState.defaultSampleId || "";
    }
  });
}

function getRelativeTimeRank(text) {
  const match = /(\d{1,2}):(\d{2})/.exec(text || "");
  const minutes = match ? Number(match[1]) * 60 + Number(match[2]) : 0;
  if ((text || "").startsWith("今天")) return 3 * 1440 + minutes;
  if ((text || "").startsWith("昨天")) return 2 * 1440 + minutes;
  if ((text || "").startsWith("前天")) return 1 * 1440 + minutes;
  return minutes;
}

function getFilteredProjects() {
  const query = state.managerQuery.trim().toLowerCase();
  const filtered = PROJECTS.filter((project) => {
    const queryMatch = !query || project.name.toLowerCase().includes(query);
    return queryMatch;
  });

  filtered.sort((left, right) => getRelativeTimeRank(right.updatedAt) - getRelativeTimeRank(left.updatedAt));

  return filtered;
}

function setManagerMessage(message) {
  state.managerMessage = message;
}

function clearManagerMessage() {
  state.managerMessage = "";
}

function openProject(projectId) {
  if (!findProject(projectId)) return;
  state.projectId = projectId;
  state.managerSelectedProjectId = projectId;
  state.editorOpen = true;
  state.activeWindow = "editor";
  clearManagerMessage();
  render();
}

function closeEditorWindow() {
  state.editorOpen = false;
  state.activeWindow = "manager";
  state.managerMenuProjectId = "";
  render();
}

function selectProject(projectId) {
  if (!findProject(projectId)) return;
  state.managerSelectedProjectId = projectId;
  state.managerMenuProjectId = "";
  render();
}

function renderManagerToolbar() {
  refs.projectSearch.value = state.managerQuery;
}

function renderManagerMessage() {
  refs.managerMessage.hidden = !state.managerMessage;
  refs.managerMessage.textContent = state.managerMessage;
}

function renderProjectList() {
  const projects = getFilteredProjects();
  const total = PROJECTS.length;
  const hasAnyProject = total > 0;

  refs.projectList.hidden = !projects.length;
  refs.managerEmpty.hidden = projects.length > 0;

  if (!hasAnyProject) {
    refs.emptyTitle.textContent = "当前还没有尺寸工程";
    refs.emptyDesc.textContent = "先新建一个工程，或者导入已有工程。";
    refs.managerHint.textContent = "";
    refs.projectList.innerHTML = "";
    return;
  }

  if (!projects.length) {
    refs.emptyTitle.textContent = "没有符合条件的工程";
    refs.emptyDesc.textContent = "可以修改搜索词，查看完整工程列表。";
    refs.managerHint.textContent = "";
    refs.projectList.innerHTML = "";
    return;
  }

  refs.managerHint.textContent = "";

  refs.projectList.innerHTML = projects
    .map((project) => {
      const selected = project.id === state.managerSelectedProjectId ? "is-active" : "";
      const projectState = normalizeProjectState(project);
      const showMenu = project.id === state.managerMenuProjectId;
      return `
        <article class="dt-project-row ${selected}" data-project-id="${project.id}">
          <div class="dt-project-row-name">
            <strong>${project.name}</strong>
          </div>
          <div class="dt-project-row-note">${project.note || "—"}</div>
          <div class="dt-project-row-status">
            <span class="dt-project-row-tag is-${projectState === "已发布" ? "published" : "draft"}">${projectState}</span>
          </div>
          <div class="dt-project-row-time">${project.updatedAt}</div>
          <div class="dt-project-row-actions">
            <button type="button" class="dt-row-btn is-primary" data-action="open-project" data-project-id="${project.id}">进入配置</button>
          </div>
          <div class="dt-project-row-actions">
            <button type="button" class="dt-row-btn is-quiet" data-action="toggle-menu" data-project-id="${project.id}">···</button>
            ${showMenu ? `
              <div class="dt-project-menu">
                <button type="button" data-action="rename-project" data-project-id="${project.id}">重命名</button>
                <button type="button" data-action="duplicate-project" data-project-id="${project.id}">复制工程</button>
                <button type="button" data-action="export-project" data-project-id="${project.id}">导出工程</button>
                <button type="button" class="is-danger" data-action="delete-project" data-project-id="${project.id}">删除工程</button>
              </div>
            ` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderEditorHeader(project) {
  refs.editorWindowTitle.textContent = project ? `工程配置 - ${project.name}` : "工程配置";
}

function renderProjectCard(project) {
  if (!refs.projectCard) return;
  if (!project) {
    refs.projectCard.innerHTML = `<div class="dt-project-card-row"><span>当前工程</span><strong>未选择</strong></div>`;
    return;
  }
  refs.projectCard.innerHTML = `
    <div class="dt-project-card-row"><span>工程名称</span><strong>${project.name}</strong></div>
    <div class="dt-project-card-row"><span>负责人</span><strong>${project.owner}</strong></div>
    <div class="dt-project-card-row"><span>最近修改</span><strong>${project.updatedAt}</strong></div>
    <div class="dt-project-card-row"><span>发布状态</span><strong>${normalizeProjectState(project)}</strong></div>
  `;
}

function renderProjectNav(project, tab) {
  if (!refs.projectNav) return;
  if (!project) {
    refs.projectNav.innerHTML = "";
    return;
  }
  refs.projectNav.innerHTML = `
    <button type="button" class="dt-tree-node is-branch" style="--tree-depth:0" disabled>工程概览</button>
    <button type="button" class="dt-tree-node is-leaf" style="--tree-depth:1" disabled>${project.version}</button>
    <button type="button" class="dt-tree-node is-branch ${tab.key === "calibration" ? "is-active" : ""}" data-tab-key="calibration" style="--tree-depth:0">标定</button>
    <button type="button" class="dt-tree-node is-branch ${tab.key === "roi" ? "is-active" : ""}" data-tab-key="roi" style="--tree-depth:0">ROI</button>
    <button type="button" class="dt-tree-node is-branch ${tab.key === "measure" ? "is-active" : ""}" data-tab-key="measure" style="--tree-depth:0">测量项</button>
    <button type="button" class="dt-tree-node is-leaf" style="--tree-depth:1" disabled>长度</button>
    <button type="button" class="dt-tree-node is-leaf" style="--tree-depth:1" disabled>头部直径</button>
    <button type="button" class="dt-tree-node is-branch ${tab.key === "validate" ? "is-active" : ""}" data-tab-key="validate" style="--tree-depth:0">验证</button>
    <button type="button" class="dt-tree-node is-branch ${tab.key === "release" ? "is-active" : ""}" data-tab-key="release" style="--tree-depth:0">发布版本</button>
  `;
}

function renderAssetTree(project) {
  if (!refs.assetTree) return;
  if (!project) {
    refs.assetTree.innerHTML = "";
    return;
  }
  const groups = (project.assets || []).reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  refs.assetTree.innerHTML = Object.entries(groups)
    .map(([group, items]) => {
      const children = items
        .map((item) => {
          const activeSample = getActiveSample(project);
          const active = item.sampleId === activeSample?.id ? "is-active" : "";
          return `<button type="button" class="dt-tree-node is-leaf ${active}" data-sample-id="${item.sampleId}" style="--tree-depth:1">${item.label}</button>`;
        })
        .join("");
      return `
        <button type="button" class="dt-tree-node is-branch" style="--tree-depth:0" disabled>${group}</button>
        ${children}
      `;
    })
    .join("");
}

function renderTabs(tab) {
  const currentIndex = TABS.findIndex((item) => item.key === tab.key);
  refs.tabList.innerHTML = TABS.map((item, index) => {
    const stateClass = index === currentIndex ? "is-active" : index < currentIndex ? "is-done" : "";
    return `
      <button type="button" class="dt-tab-btn ${stateClass}" data-tab-key="${item.key}">
        <span class="dt-tab-btn-index">${index + 1}</span>
        <span class="dt-tab-btn-label">${item.label}</span>
      </button>
    `;
  }).join("");
}

function renderStepScaffold(project, tab) {
  const tabState = getTabState(project, tab.key);
  const isCalibration = tab.key === "calibration";
  const isTemplateConfig = tab.key === "roi";
  const isMeasureConfig = tab.key === "measure";
  const isValidateConfig = tab.key === "validate";
  const isReleaseConfig = tab.key === "release";
  const pixelSize = (tabState.results || []).find((item) => item.label === "像素尺寸")?.value || "--";
  const boardType = (tabState.results || []).find((item) => item.label === "标定板")?.value || "标准板 A-10mm";
  const measureTool = getMeasureToolMeta();
  const measureSection = getMeasureSection();
  const isMeasureTool = measureTool.category === "测量";
  const validateSamples = getSamplesForTab(project, tab.key);
  const activeSample = getActiveSample(project, tab.key);
  const validateResultMap = {
    ok: "OK",
    warn: "NG",
    error: "异常",
  };
  const releaseState = getReleaseReadiness(project);

  if (!refs.workspace || !refs.stageUpload || !refs.rightPanel || !refs.leftPanel || !refs.stageContent) return;

  refs.workspace.classList.toggle("is-calibration", isCalibration);
  refs.workspace.classList.toggle("is-template-config", isTemplateConfig);
  refs.workspace.classList.toggle("is-measure-config", isMeasureConfig);
  refs.workspace.classList.toggle("is-validate-config", isValidateConfig);
  refs.workspace.classList.toggle("is-release-config", isReleaseConfig);
  refs.leftPanel.hidden = !isMeasureConfig && !isValidateConfig && !isReleaseConfig;
  refs.stageUpload.hidden = !isCalibration && !isTemplateConfig && !isMeasureConfig && !isValidateConfig && !isReleaseConfig;
  refs.stageContent.hidden = !isReleaseConfig;
  refs.rightPanel.hidden = !isCalibration && !isTemplateConfig && !isMeasureConfig;
  refs.stageImage.hidden = isReleaseConfig;
  refs.overlay.hidden = isReleaseConfig;

  if (!isCalibration && !isTemplateConfig && !isMeasureConfig && !isValidateConfig && !isReleaseConfig) {
    refs.leftPanel.innerHTML = "";
    refs.stageUpload.innerHTML = "";
    refs.stageContent.innerHTML = "";
    refs.rightPanel.innerHTML = "";
    return;
  }

  if (isCalibration) {
    refs.leftPanel.innerHTML = "";
    refs.stageUpload.innerHTML = `
      <button type="button" class="dt-stage-upload-btn">导入标定图</button>
    `;

    refs.rightPanel.innerHTML = `
      <label class="dt-side-field">
        <span class="dt-side-field-label">标定模板</span>
        <select class="dt-side-select">
          <option selected>${boardType}</option>
          <option>标准板 B-20mm</option>
        </select>
      </label>
      <button type="button" class="dt-step-tool-btn is-primary dt-side-action">自动标定</button>
      <div class="dt-side-field">
        <span class="dt-side-field-label">像素尺寸</span>
        <strong class="dt-side-metric">${pixelSize}</strong>
      </div>
    `;
    return;
  }

  if (isTemplateConfig) {
    refs.leftPanel.innerHTML = "";
    refs.stageUpload.innerHTML = `
      <button type="button" class="dt-stage-upload-btn">上传模版图</button>
    `;

    refs.rightPanel.innerHTML = `
      <button type="button" class="dt-step-tool-btn dt-side-action">框检测对象</button>
      <button type="button" class="dt-step-tool-btn dt-side-action">框出现范围</button>
    `;
    return;
  }

  if (isReleaseConfig) {
    refs.leftPanel.innerHTML = `
      <div class="dt-release-list">
        ${releaseState.checks
          .map((item) => {
            return `
              <div class="dt-release-check-row">
                <div class="dt-release-check-copy">
                  <strong>${item.label}</strong>
                  <span class="dt-release-check-state is-${item.status}">${item.statusLabel}</span>
                </div>
                ${item.status === "missing" ? `<button type="button" class="dt-row-btn" data-release-tab="${item.targetTab}">去处理</button>` : ""}
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    refs.stageUpload.innerHTML = "";
    refs.rightPanel.innerHTML = "";
    refs.stageContent.innerHTML = `
      <div class="dt-release-card">
        <div class="dt-release-card-head">
          <strong>发布前检查</strong>
          <span class="${releaseState.canRelease ? "is-tone-ok" : "is-tone-warn"}">${releaseState.blockingMessage}</span>
        </div>
        <div class="dt-release-meta">
          <div class="dt-release-meta-item">
            <span>工程名称</span>
            <strong>${project?.name || "--"}</strong>
          </div>
          <div class="dt-release-meta-item">
            <span>发布版本号</span>
            <strong>Release 1.0</strong>
          </div>
        </div>
        <button
          type="button"
          class="dt-toolbar-btn is-primary dt-release-btn"
          data-release-action="publish"
          ${releaseState.canRelease ? "" : "disabled"}
        >
          发布
        </button>
      </div>
    `;
    return;
  }

  refs.leftPanel.innerHTML = `
    <div class="dt-toolbox-tabs">
      ${MEASURE_TOOL_SECTIONS.map((section) => {
        const active = section.key === measureSection.key ? "is-active" : "";
        return `<button type="button" class="dt-toolbox-tab ${active}" data-measure-section="${section.key}">${section.title}</button>`;
      }).join("")}
    </div>
    <div class="dt-toolbox-icon-grid">
      ${measureSection.tools
        .map((tool) => {
          const active = tool.key === state.measureToolKey ? "is-active" : "";
          return `
            <button type="button" class="dt-toolbox-icon-btn ${active}" data-measure-tool="${tool.key}">
              <span class="dt-toolbox-icon-mark">${tool.icon}</span>
              <strong>${tool.label}</strong>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  refs.stageUpload.innerHTML = `
    <div class="dt-stage-floating">
      <strong>${measureTool.name}</strong>
      <span>${measureTool.drawHint}</span>
    </div>
  `;

  refs.rightPanel.innerHTML = `
    <div class="dt-toolbox-head">
      <strong>测量项参数</strong>
    </div>
    <label class="dt-side-field">
      <span class="dt-side-field-label">测量项名称</span>
      <input class="dt-side-input" type="text" value="${measureTool.itemName}" />
    </label>
    ${isMeasureTool ? `
      <label class="dt-side-field">
        <span class="dt-side-field-label">上限（可选）</span>
        <input class="dt-side-input" type="text" placeholder="例如 16.700" />
      </label>
      <label class="dt-side-field">
        <span class="dt-side-field-label">下限（可选）</span>
        <input class="dt-side-input" type="text" placeholder="例如 16.200" />
      </label>
    ` : ""}
  `;

  if (!isValidateConfig) {
    return;
  }

  refs.leftPanel.innerHTML = `
    <div class="dt-validate-toolbar">
      <button type="button" class="dt-step-tool-btn is-primary">上传验证图</button>
      <button type="button" class="dt-step-tool-btn">开始验证</button>
    </div>
    <div class="dt-validate-list">
      ${validateSamples
        .map((sample) => {
          const active = sample.id === activeSample?.id ? "is-active" : "";
          const tone =
            sample.status === "error" ? "is-error" : sample.status === "warn" ? "is-warn" : "is-ok";
          const resultText = validateResultMap[sample.status] || "OK";
          return `
            <button type="button" class="dt-validate-card ${active}" data-sample-id="${sample.id}">
              <img src="${sample.image}" alt="${sample.name}" />
              <div class="dt-validate-card-copy">
                <strong>${sample.name}</strong>
                ${sample.summary ? `<span>${sample.summary}</span>` : ""}
                ${sample.metric ? `<em>${sample.metric}</em>` : ""}
              </div>
              <span class="dt-validate-card-result ${tone}">${resultText}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  refs.stageUpload.innerHTML = "";
  refs.rightPanel.innerHTML = "";

  if (!isValidateConfig) {
    refs.stageContent.innerHTML = "";
    return;
  }
}

function renderMain(project, tab, sample) {
  const currentIndex = TABS.findIndex((item) => item.key === tab.key);
  if (!project) {
    refs.prevStepBtn.disabled = true;
    refs.nextStepBtn.disabled = true;
    refs.nextStepBtn.textContent = "下一步";
    refs.nextStepBtn.hidden = false;
    refs.skipStepBtn.hidden = true;
    refs.skipStepBtn.textContent = "跳过";
    refs.stageImage.removeAttribute("src");
    return;
  }
  refs.prevStepBtn.disabled = currentIndex <= 0;
  refs.nextStepBtn.disabled = currentIndex >= TABS.length - 1;
  refs.nextStepBtn.textContent = currentIndex >= TABS.length - 1 ? "完成" : "下一步";
  refs.nextStepBtn.hidden = tab.key === "release";
  refs.skipStepBtn.hidden = !["calibration", "validate"].includes(tab.key);
  refs.skipStepBtn.textContent = tab.key === "validate" ? "跳过验证" : "跳过标定";
  refs.stageImage.src = sample?.image || "";
}

function moveStep(offset) {
  const currentIndex = TABS.findIndex((item) => item.key === state.tabKey);
  const nextIndex = Math.max(0, Math.min(TABS.length - 1, currentIndex + offset));
  state.tabKey = TABS[nextIndex].key;
  state.activeWindow = "editor";
  render();
}

function renderOverlay(project, tab, sample) {
  if (tab.key === "calibration" || tab.key === "measure" || tab.key === "release") {
    refs.overlay.innerHTML = "";
    return;
  }
  const tabState = getTabState(project, tab.key);
  const nodes = tabState.overlays?.[sample?.id] || [];
  refs.overlay.innerHTML = "";
  nodes.forEach((node) => {
    const el = document.createElement("div");
    if (node.type === "tag") {
      el.className = "dt-tag";
      el.textContent = node.text || "";
      el.style.left = `${node.x}%`;
      el.style.top = `${node.y}%`;
      refs.overlay.appendChild(el);
      return;
    }

    el.className = node.type === "roi" ? "dt-shape dt-roi" : "dt-shape";
    el.style.left = `${node.x}%`;
    el.style.top = `${node.y}%`;

    if (node.type === "line") {
      el.className = "dt-shape dt-line";
      el.style.width = `${node.len}%`;
      el.style.transform = `rotate(${node.angle || 0}deg)`;
    } else if (node.type === "circle") {
      el.className = "dt-shape dt-circle";
      el.style.width = `${node.d}%`;
      el.style.height = `${node.d}%`;
    } else {
      el.style.width = `${node.w}%`;
      el.style.height = `${node.h}%`;
    }

    if (node.label) {
      const label = document.createElement("span");
      label.className = "dt-shape-label";
      label.textContent = node.label;
      el.appendChild(label);
    }
    refs.overlay.appendChild(el);
  });
}

function renderSamples(project, tab, activeSample) {
  if (!refs.sampleList) return;
  const samples = getSamplesForTab(project, tab.key);
  refs.sampleList.innerHTML = samples
    .map((sample) => {
      const active = sample.id === activeSample?.id ? "is-active" : "";
      return `
        <button type="button" class="dt-sample-card ${active}" data-sample-id="${sample.id}">
          <img src="${sample.image}" alt="${sample.name}" />
          <div class="dt-sample-copy">
            <strong>${sample.name}</strong>
            <span>${sample.summary}</span>
            <span class="dt-sample-status is-${sample.status}">${sample.statusLabel}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderResults(project, tab) {
  if (!refs.resultBoard) return;
  const tabState = getTabState(project, tab.key);
  refs.resultBoard.innerHTML = (tabState.results || [])
    .map((item) => `<div class="dt-result-card"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");
}

function renderFields(project, tab) {
  if (!refs.fieldList) return;
  const tabState = getTabState(project, tab.key);
  refs.fieldList.innerHTML = (tabState.fields || [])
    .map((item) => `<div class="dt-field-item"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");
}

function renderChecks(project) {
  if (!refs.checkList) return;
  refs.checkList.innerHTML = (project?.releaseChecks || [])
    .map((item) => `<span class="dt-status-item is-${item.tone}">${item.label}</span>`)
    .join("");
}

function renderNote(tab) {
  if (!refs.noteCard) return;
  refs.noteCard.textContent = tab.note;
}

function renderModal() {
  const modal = state.modal;
  refs.projectModal.hidden = !modal;
  refs.modalError.hidden = true;
  refs.modalError.textContent = "";

  if (!modal) return;

  if (modal.mode === "rename") {
    const project = findProject(modal.projectId);
    refs.modalTitle.textContent = "重命名工程";
    refs.modalDesc.textContent = "修改工程名称，不改变当前草稿或已发布状态。";
    refs.modalSubmitBtn.textContent = "保存名称";
    refs.projectNameInput.value = project?.name || "";
    refs.projectNoteInput.value = project?.note || "";
  } else {
    refs.modalTitle.textContent = "新建工程";
    refs.modalDesc.textContent = "填写工程名称后，创建一个新的尺寸工程草稿。";
    refs.modalSubmitBtn.textContent = "创建并打开";
    refs.projectNameInput.value = "";
    refs.projectNoteInput.value = "";
  }
}

function renderSettingsModal() {
  refs.settingsModal.hidden = !state.settingsOpen;
  refs.settingsAutoSaveInput.checked = state.localSettings.autoSave;
  refs.settingsPathList.innerHTML = state.localSettings.paths
    .map((item) => {
      return `
        <div class="dt-settings-path-row">
          <div class="dt-settings-path-copy">
            <strong>${item.label}</strong>
            <span>${item.value}</span>
          </div>
          <div class="dt-settings-path-actions">
            <button type="button" class="dt-row-btn" data-settings-action="open-path" data-settings-key="${item.key}">打开文件夹</button>
            <button type="button" class="dt-row-btn" data-settings-action="copy-path" data-settings-key="${item.key}">复制路径</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function syncWindowState() {
  refs.windows.forEach((windowEl) => {
    const isStartupWindow = windowEl.dataset.window === "startup";
    const isEditorWindow = windowEl.dataset.window === "editor";
    let shouldShow = false;

    if (state.startupVisible) {
      shouldShow = isStartupWindow;
    } else if (windowEl.dataset.window === "manager") {
      shouldShow = state.activeWindow === "manager";
    } else if (isEditorWindow) {
      shouldShow = state.editorOpen && state.activeWindow === "editor";
    }

    windowEl.hidden = !shouldShow;
    windowEl.classList.toggle("is-active", shouldShow);
  });
  refs.taskbarApps.forEach((button) => {
    if (state.startupVisible) {
      button.hidden = true;
      button.classList.remove("is-active");
      return;
    }
    const isEditorButton = button.dataset.windowTarget === "editor";
    const isOpen = isEditorButton ? state.editorOpen : true;
    button.hidden = !isOpen;
    button.classList.toggle("is-active", isOpen && button.dataset.windowTarget === state.activeWindow);
  });
}

function render() {
  ensureProjectSelection();
  ensureSampleState();

  const project = getProject();
  const tab = getTab();
  const sample = getActiveSample(project, tab.key);

  renderManagerToolbar();
  renderManagerMessage();
  renderProjectList();
  renderEditorHeader(project);
  renderProjectCard(project);
  renderProjectNav(project, tab);
  renderAssetTree(project);
  renderTabs(tab);
  renderStepScaffold(project, tab);
  renderMain(project, tab, sample);
  renderOverlay(project, tab, sample);
  renderSamples(project, tab, sample);
  renderResults(project, tab);
  renderFields(project, tab);
  renderChecks(project);
  renderNote(tab);
  renderModal();
  renderSettingsModal();
  syncWindowState();
}

function openCreateModal() {
  state.modal = { mode: "create" };
  state.managerMenuProjectId = "";
  render();
  refs.projectNameInput.focus();
}

function openRenameModal(projectId) {
  state.modal = { mode: "rename", projectId };
  state.managerMenuProjectId = "";
  render();
  refs.projectNameInput.focus();
  refs.projectNameInput.select();
}

function closeModal() {
  state.modal = null;
  render();
}

function openSettingsModal() {
  state.settingsOpen = true;
  render();
}

function closeSettingsModal() {
  state.settingsOpen = false;
  render();
}

function handleDuplicateProject(projectId) {
  const source = findProject(projectId);
  if (!source) return;
  const project = cloneDeep(source);
  project.id = buildProjectId();
  project.name = makeCopyName(source.name);
  project.releaseState = "草稿工程";
  project.version = "Draft 0.1";
  project.updatedAt = formatNowLabel();
  PROJECTS.unshift(project);
  state.managerSelectedProjectId = project.id;
  state.projectId = project.id;
  state.editorOpen = true;
  state.activeWindow = "editor";
  state.managerMenuProjectId = "";
  setManagerMessage(`已复制工程“${source.name}”，新草稿为“${project.name}”`);
  render();
}

function handleImportProject() {
  const source = cloneDeep(PROJECTS[2] || PROJECTS[0] || createBaseProjectTemplate());
  source.id = buildProjectId();
  source.name = makeCopyName(source.name || "导入工程");
  source.updatedAt = formatNowLabel();
  PROJECTS.unshift(source);
  state.managerSelectedProjectId = source.id;
  state.projectId = source.id;
  state.editorOpen = true;
  state.activeWindow = "editor";
  setManagerMessage(`已导入工程“${source.name}”，当前保留原状态为“${normalizeProjectState(source)}”`);
  render();
}

function handleDeleteProject(projectId) {
  const project = findProject(projectId);
  if (!project) return;
  const shouldDelete = window.confirm(`确认删除工程“${project.name}”吗？此处仅为 demo 操作。`);
  if (!shouldDelete) return;
  const index = PROJECTS.findIndex((item) => item.id === projectId);
  if (index >= 0) PROJECTS.splice(index, 1);
  state.managerMenuProjectId = "";
  ensureProjectSelection();
  setManagerMessage(`已删除工程“${project.name}”`);
  render();
}

refs.createProjectBtn.addEventListener("click", openCreateModal);
refs.importProjectBtn.addEventListener("click", handleImportProject);
refs.openSettingsBtn.addEventListener("click", openSettingsModal);

refs.projectSearch.addEventListener("input", (event) => {
  state.managerQuery = event.target.value || "";
  state.managerMenuProjectId = "";
  render();
});

refs.projectList.addEventListener("click", (event) => {
  const actionEl = event.target.closest("[data-action]");
  const row = event.target.closest("[data-project-id]");
  if (!row) return;
  const projectId = row.dataset.projectId || "";

  if (!actionEl) {
    selectProject(projectId);
    return;
  }

  const action = actionEl.dataset.action;
  if (action === "open-project") {
    openProject(projectId);
    return;
  }
  if (action === "toggle-menu") {
    state.managerSelectedProjectId = projectId;
    state.managerMenuProjectId = state.managerMenuProjectId === projectId ? "" : projectId;
    render();
    return;
  }
  if (action === "rename-project") {
    openRenameModal(projectId);
    return;
  }
  if (action === "duplicate-project") {
    handleDuplicateProject(projectId);
    return;
  }
  if (action === "export-project") {
    state.managerMenuProjectId = "";
    setManagerMessage(`已导出工程“${findProject(projectId)?.name || ""}”到本地文件包（demo 提示）`);
    render();
    return;
  }
  if (action === "delete-project") {
    handleDeleteProject(projectId);
  }
});

refs.projectList.addEventListener("dblclick", (event) => {
  const row = event.target.closest("[data-project-id]");
  if (!row) return;
  openProject(row.dataset.projectId || "");
});

refs.managerEmpty.addEventListener("click", (event) => {
  const button = event.target.closest("[data-empty-action]");
  if (!button) return;
  if (button.dataset.emptyAction === "create") {
    openCreateModal();
  } else {
    handleImportProject();
  }
});

if (refs.projectNav) {
  refs.projectNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab-key]");
    if (!button) return;
    state.tabKey = button.dataset.tabKey || state.tabKey;
    state.activeWindow = "editor";
    render();
  });
}

if (refs.assetTree) {
  refs.assetTree.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sample-id]");
    if (!button) return;
    state.sampleByTab[state.tabKey] = button.dataset.sampleId || state.sampleByTab[state.tabKey];
    render();
  });
}

refs.tabList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab-key]");
  if (!button) return;
  state.tabKey = button.dataset.tabKey || state.tabKey;
  state.activeWindow = "editor";
  render();
});

if (refs.leftPanel) {
  refs.leftPanel.addEventListener("click", (event) => {
    const releaseTabButton = event.target.closest("[data-release-tab]");
    if (releaseTabButton) {
      state.tabKey = releaseTabButton.dataset.releaseTab || state.tabKey;
      render();
      return;
    }

    const sampleButton = event.target.closest("[data-sample-id]");
    if (sampleButton && state.tabKey === "validate") {
      state.sampleByTab[state.tabKey] = sampleButton.dataset.sampleId || state.sampleByTab[state.tabKey];
      render();
      return;
    }
    const tabButton = event.target.closest("[data-measure-section]");
    if (tabButton) {
      state.measureToolSectionKey = tabButton.dataset.measureSection || state.measureToolSectionKey;
      render();
      return;
    }
    const button = event.target.closest("[data-measure-tool]");
    if (!button) return;
    state.measureToolKey = button.dataset.measureTool || state.measureToolKey;
    const matchedSection = MEASURE_TOOL_SECTIONS.find((section) =>
      section.tools.some((tool) => tool.key === state.measureToolKey)
    );
    if (matchedSection) {
      state.measureToolSectionKey = matchedSection.key;
    }
    render();
  });
}

if (refs.stageContent) {
  refs.stageContent.addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-release-tab]");
    if (tabButton) {
      state.tabKey = tabButton.dataset.releaseTab || state.tabKey;
      render();
      return;
    }

    const publishButton = event.target.closest("[data-release-action='publish']");
    if (!publishButton) return;
    const project = getProject();
    const releaseState = getReleaseReadiness(project);
    if (!project || !releaseState.canRelease) return;
    project.releaseState = "已发布版本";
    project.version = "Release 1.0";
    project.updatedAt = formatNowLabel();
    setManagerMessage(`已发布工程“${project.name}”`);
    render();
  });
}

refs.prevStepBtn.addEventListener("click", () => {
  moveStep(-1);
});

refs.nextStepBtn.addEventListener("click", () => {
  moveStep(1);
});

refs.skipStepBtn.addEventListener("click", () => {
  if (!["calibration", "validate"].includes(state.tabKey)) return;
  moveStep(1);
});

if (refs.sampleList) {
  refs.sampleList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sample-id]");
    if (!button) return;
    state.sampleByTab[state.tabKey] = button.dataset.sampleId || state.sampleByTab[state.tabKey];
    render();
  });
}

refs.taskbarApps.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.windowTarget === "editor" && !state.editorOpen) return;
    state.activeWindow = button.dataset.windowTarget || state.activeWindow;
    syncWindowState();
  });
});

refs.editorCloseBtn.addEventListener("click", closeEditorWindow);

refs.startupEnterBtn.addEventListener("click", () => {
  state.startupVisible = false;
  state.editorOpen = false;
  state.activeWindow = "manager";
  render();
});

refs.modalCloseBtn.addEventListener("click", closeModal);
refs.modalCancelBtn.addEventListener("click", closeModal);
refs.projectModal.addEventListener("click", (event) => {
  if (event.target === refs.projectModal) closeModal();
});

refs.settingsCloseBtn.addEventListener("click", closeSettingsModal);
refs.settingsCancelBtn.addEventListener("click", closeSettingsModal);
refs.settingsSaveBtn.addEventListener("click", () => {
  state.localSettings.autoSave = refs.settingsAutoSaveInput.checked;
  setManagerMessage(`本地设置已保存，自动保存已${state.localSettings.autoSave ? "开启" : "关闭"}`);
  closeSettingsModal();
});
refs.settingsModal.addEventListener("click", (event) => {
  if (event.target === refs.settingsModal) closeSettingsModal();
});
refs.settingsPathList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-settings-action]");
  if (!button) return;
  const pathItem = state.localSettings.paths.find((item) => item.key === button.dataset.settingsKey);
  if (!pathItem) return;
  if (button.dataset.settingsAction === "open-path") {
    setManagerMessage(`已定位到 ${pathItem.label}（demo 提示）：${pathItem.value}`);
  } else {
    setManagerMessage(`已复制路径（demo 提示）：${pathItem.value}`);
  }
  closeSettingsModal();
});

refs.projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const modal = state.modal;
  if (!modal) return;

  const name = refs.projectNameInput.value.trim();
  const note = refs.projectNoteInput.value.trim();
  const duplicate = PROJECTS.find((project) => {
    if (modal.mode === "rename" && project.id === modal.projectId) return false;
    return project.name === name;
  });

  if (!name) {
    refs.modalError.hidden = false;
    refs.modalError.textContent = "工程名称不能为空。";
    return;
  }
  if (duplicate) {
    refs.modalError.hidden = false;
    refs.modalError.textContent = "已存在同名工程，请换一个名称。";
    return;
  }

  if (modal.mode === "rename") {
    const project = findProject(modal.projectId);
    if (project) {
      project.name = name;
      project.note = note;
      project.updatedAt = formatNowLabel();
      state.projectId = project.id;
      state.managerSelectedProjectId = project.id;
      setManagerMessage(`已更新工程名称为“${name}”`);
    }
    closeModal();
    return;
  }

  const project = buildDraftProject(name, note);
  PROJECTS.unshift(project);
  state.sampleByTab = {};
  state.projectId = project.id;
  state.managerSelectedProjectId = project.id;
  state.editorOpen = true;
  state.activeWindow = "editor";
  setManagerMessage(`已创建工程“${name}”并打开配置窗口`);
  closeModal();
});

document.addEventListener("click", (event) => {
  const insideMenu = event.target.closest(".dt-project-menu");
  const toggleButton = event.target.closest('[data-action="toggle-menu"]');
  if (!insideMenu && !toggleButton && state.managerMenuProjectId) {
    state.managerMenuProjectId = "";
    render();
  }
});

refs.windows.forEach((windowEl) => {
  windowEl.addEventListener("mousedown", () => {
    state.activeWindow = windowEl.dataset.window || state.activeWindow;
    syncWindowState();
  });
});

render();
