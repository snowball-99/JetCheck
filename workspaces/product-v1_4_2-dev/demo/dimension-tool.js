const TABS = [
  {
    key: "roi",
    label: "ROI",
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
    key: "calibration",
    label: "标定",
    title: "标定",
    desc: "选择标定模板，导入标定图并完成自动标定。",
    note: "标定允许后置。当前窗口以配置链路为主，不在进入步骤时做强阻断。",
    modeLabel: "当前模式：标定",
  },
  {
    key: "validate",
    label: "测试",
    title: "测试",
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
      { key: "line_segment", label: "直线段", icon: "LN" },
      { key: "circle", label: "圆", icon: "CR" },
      { key: "point", label: "点", icon: "PT" },
      { key: "contour", label: "轮廓", icon: "CT" },
      { key: "corner_point", label: "拐点", icon: "CP" },
    ],
  },
  {
    key: "construct",
    title: "构造",
    tools: [
      { key: "point_to_line", label: "两点连线", icon: "PL" },
      { key: "line_intersection", label: "线线交点", icon: "LI" },
      { key: "contour_line_intersection", label: "轮廓线交点", icon: "CI" },
      { key: "center_line", label: "中线", icon: "CL" },
      { key: "contour_inner_cut", label: "轮廓内切圆", icon: "IC" },
      { key: "three_point_circle", label: "三点画圆", icon: "3C" },
      { key: "circle_center", label: "圆点", icon: "OC" },
    ],
  },
  {
    key: "measure",
    title: "测量",
    tools: [
      { key: "line_distance", label: "线线距离", icon: "LD" },
      { key: "circle_diameter", label: "圆直径", icon: "CD" },
      { key: "circle_distance", label: "圆圆距离", icon: "CC" },
      { key: "line_circle_distance", label: "线圆距离", icon: "LC" },
      { key: "point_circle_distance", label: "点圆距离", icon: "PC" },
      { key: "point_line_distance", label: "点线距离", icon: "PD" },
      { key: "point_point_distance", label: "点点距离", icon: "PP" },
    ],
  },
];

const MEASURE_TOOL_META = {
  line_segment: {
    name: "直线段",
    category: "元素",
    itemName: "直线段1",
    drawHint: "在图像上拖拽绘制直线段",
  },
  circle: {
    name: "圆",
    category: "元素",
    itemName: "圆1",
    drawHint: "围绕目标区域拖拽绘制圆",
  },
  point: {
    name: "点",
    category: "元素",
    itemName: "点1",
    drawHint: "单击图像放置点",
  },
  contour: {
    name: "轮廓",
    category: "元素",
    itemName: "轮廓1",
    drawHint: "沿目标边缘绘制轮廓",
  },
  corner_point: {
    name: "拐点",
    category: "元素",
    itemName: "拐点1",
    drawHint: "单击选择轮廓上的拐点",
  },
  point_to_line: {
    name: "两点连线",
    category: "构造",
    itemName: "两点连线1",
    drawHint: "依次选择两个点生成连线",
  },
  line_intersection: {
    name: "线线交点",
    category: "构造",
    itemName: "线线交点1",
    drawHint: "选择两条直线生成交点",
  },
  contour_line_intersection: {
    name: "轮廓线交点",
    category: "构造",
    itemName: "轮廓线交点1",
    drawHint: "选择轮廓和直线生成交点",
  },
  center_line: {
    name: "中线",
    category: "构造",
    itemName: "中线1",
    drawHint: "选择两条参考线生成中线",
  },
  contour_inner_cut: {
    name: "轮廓内切圆",
    category: "构造",
    itemName: "轮廓内切圆1",
    drawHint: "选择轮廓后生成内切圆",
  },
  three_point_circle: {
    name: "三点画圆",
    category: "构造",
    itemName: "三点圆1",
    drawHint: "依次选择三个点生成圆",
  },
  circle_center: {
    name: "圆点",
    category: "构造",
    itemName: "圆点1",
    drawHint: "选择圆后生成圆心点",
  },
  line_distance: {
    name: "线线距离",
    category: "测量",
    itemName: "线线距离1",
    drawHint: "选择两条线输出距离",
  },
  circle_diameter: {
    name: "圆直径",
    category: "测量",
    itemName: "圆直径1",
    drawHint: "选择圆输出直径",
  },
  circle_distance: {
    name: "圆圆距离",
    category: "测量",
    itemName: "圆圆距离1",
    drawHint: "选择两个圆输出圆心距离",
  },
  line_circle_distance: {
    name: "线圆距离",
    category: "测量",
    itemName: "线圆距离1",
    drawHint: "选择线和圆输出距离",
  },
  point_circle_distance: {
    name: "点圆距离",
    category: "测量",
    itemName: "点圆距离1",
    drawHint: "选择点和圆输出距离",
  },
  point_line_distance: {
    name: "点线距离",
    category: "测量",
    itemName: "点线距离1",
    drawHint: "选择点和线输出距离",
  },
  point_point_distance: {
    name: "点点距离",
    category: "测量",
    itemName: "点点距离1",
    drawHint: "选择两个点输出距离",
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
      template: false,
      roi: true,
      measure: false,
      validate: false,
    },
    measureCount: 0,
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
        overlays: { screw_main: [] },
        results: [],
        fields: [],
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
      template: false,
      roi: false,
      measure: false,
      validate: false,
    },
    measureCount: 0,
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
        overlays: { xray_main: [] },
        results: [],
        fields: [],
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
      template: false,
      roi: true,
      measure: true,
      validate: true,
    },
    measureCount: 0,
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
  startupVisible: false,
  projectId: PROJECTS[0]?.id || "",
  managerSelectedProjectId: PROJECTS[0]?.id || "",
  tabKey: "measure",
  sampleByTab: {},
  roiVisible: true,
  stageZoom: 1,
  calibrationMode: "auto",
  measureToolSectionKey: "element",
  measureToolKey: "line_segment",
  measureElementSelected: false,
  activeWindow: "manager",
  editorOpen: false,
  managerQuery: "",
  managerMenuProjectId: "",
  managerMessage: "",
  modal: null,
  settingsOpen: false,
  paramModal: null,
  releaseModal: null,
  localSettings: {
    modelServiceUrl: "http://127.0.0.1:8080",
    workspacePath: "C:\\Users\\16095\\Desktop\\MeasureWorkspace",
    logPath: "C:\\Users\\16095\\Desktop\\MeasureWorkspace\\logs",
    cachePath: "C:\\Users\\16095\\Desktop\\MeasureWorkspace\\cache",
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
  openSettingsBtns: Array.from(document.querySelectorAll("[data-open-settings]")),
  emptyTitle: document.getElementById("dtEmptyTitle"),
  emptyDesc: document.getElementById("dtEmptyDesc"),
  createProjectBtn: document.getElementById("dtCreateProjectBtn"),
  importProjectBtn: document.getElementById("dtImportProjectBtn"),
  importProjectInput: document.getElementById("dtImportProjectInput"),
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
  editorBackBtn: document.getElementById("dtEditorBackBtn"),
  runTestBtn: document.getElementById("dtRunTestBtn"),
  resetViewBtn: document.getElementById("dtResetViewBtn"),
  fitViewBtn: document.getElementById("dtFitViewBtn"),
  toggleRoiInput: document.getElementById("dtToggleRoiInput"),
  calibrationEntryBtn: document.getElementById("dtCalibrationEntryBtn"),
  uploadTemplateBtn: document.getElementById("dtUploadTemplateBtn"),
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
  settingsModelServiceInput: document.getElementById("dtSettingsModelServiceInput"),
  settingsWorkspaceInput: document.getElementById("dtSettingsWorkspaceInput"),
  settingsLogInput: document.getElementById("dtSettingsLogInput"),
  settingsCacheInput: document.getElementById("dtSettingsCacheInput"),
  settingsClearCacheBtn: document.getElementById("dtSettingsClearCacheBtn"),
  releaseModal: document.getElementById("dtReleaseModal"),
  releaseModalTitle: document.getElementById("dtReleaseModalTitle"),
  releaseModalDesc: document.getElementById("dtReleaseModalDesc"),
  releaseModalBody: document.getElementById("dtReleaseModalBody"),
  releaseCloseBtn: document.getElementById("dtReleaseCloseBtn"),
  shapeMatchModal: document.getElementById("dtShapeMatchModal"),
  preprocessModal: document.getElementById("dtPreprocessModal"),
  shapeAngleFromInput: document.getElementById("dtShapeAngleFromInput"),
  shapeAngleToInput: document.getElementById("dtShapeAngleToInput"),
  shapeAngleStepInput: document.getElementById("dtShapeAngleStepInput"),
  shapeAccuracyInput: document.getElementById("dtShapeAccuracyInput"),
  shapeMatchInput: document.getElementById("dtShapeMatchInput"),
  shapeScaleInput: document.getElementById("dtShapeScaleInput"),
  binaryThresholdInput: document.getElementById("dtBinaryThresholdInput"),
  medianThresholdInput: document.getElementById("dtMedianThresholdInput"),
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
  const key = MEASURE_TOOL_META[state.measureToolKey] ? state.measureToolKey : "line_segment";
  return { ...MEASURE_TOOL_META[key], key };
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

function hasTemplateImage(project = getProject()) {
  return project?.workflowState?.template === true;
}

function hasCalibrationImage(project = getProject()) {
  return project?.workflowState?.calibrationImage === true || project?.workflowState?.calibration === true;
}

function hasValidateImages(project = getProject()) {
  return project?.workflowState?.validateImages === true;
}

function getPixelSizeValue(tabState) {
  const rawValue = (tabState.results || []).find((item) => item.label === "像素尺寸")?.value || "0.021 mm/px";
  return String(rawValue).replace(/\s*mm\/px\s*/i, "");
}

function getMeasureRows(sampleId = "") {
  if (sampleId === "val_error" || sampleId === "xray_warn") {
    return [
      { name: "螺杆1总长", lower: "16.200", upper: "16.700", value: "--", result: "异常" },
      { name: "螺杆1螺纹长", lower: "6.000", upper: "6.400", value: "--", result: "异常" },
      { name: "头部直径", lower: "4.900", upper: "5.200", value: "--", result: "异常" },
    ];
  }
  if (sampleId === "val_warn") {
    return [
      { name: "螺杆1总长", lower: "16.200", upper: "16.700", value: "16.701", result: "NG" },
      { name: "螺杆1螺纹长", lower: "6.000", upper: "6.400", value: "6.214", result: "OK" },
      { name: "头部直径", lower: "4.900", upper: "5.200", value: "5.091", result: "OK" },
    ];
  }
  return [
    { name: "螺杆1总长", lower: "16.200", upper: "16.700", value: "16.443", result: "OK" },
    { name: "螺杆1螺纹长", lower: "6.000", upper: "6.400", value: "6.214", result: "OK" },
    { name: "头部直径", lower: "4.900", upper: "5.200", value: "5.091", result: "OK" },
  ];
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
  state.tabKey = "measure";
  state.measureElementSelected = false;
  state.editorOpen = true;
  state.activeWindow = "editor";
  clearManagerMessage();
  render();
}

function closeEditorWindow() {
  state.editorOpen = false;
  state.activeWindow = "manager";
  state.managerMenuProjectId = "";
  clearManagerMessage();
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
      const showMenu = project.id === state.managerMenuProjectId;
      return `
        <article class="dt-project-row ${selected}" data-project-id="${project.id}">
          <div class="dt-project-row-name">
            <strong>${project.name}</strong>
          </div>
          <div class="dt-project-row-note">${project.note || "—"}</div>
          <div class="dt-project-row-time">${project.updatedAt}</div>
          <div class="dt-project-row-actions">
            <button type="button" class="dt-row-btn is-primary" data-action="open-project" data-project-id="${project.id}">进入配置</button>
          </div>
          <div class="dt-project-row-actions">
            <button type="button" class="dt-row-btn is-quiet" data-action="toggle-menu" data-project-id="${project.id}">···</button>
            ${showMenu ? `
              <div class="dt-project-menu">
                <button type="button" data-action="rename-project" data-project-id="${project.id}">编辑信息</button>
                <button type="button" data-action="duplicate-project" data-project-id="${project.id}">复制工程</button>
                <button type="button" data-action="export-project" data-project-id="${project.id}">导出工程</button>
                <button type="button" data-action="export-model" data-project-id="${project.id}">导出模型</button>
                <button type="button" data-action="publish-model" data-project-id="${project.id}">发布模型</button>
                <span class="dt-project-menu-separator"></span>
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
  refs.editorWindowTitle.textContent = project ? project.name : "";
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
    <button type="button" class="dt-tree-node is-branch ${tab.key === "validate" ? "is-active" : ""}" data-tab-key="validate" style="--tree-depth:0">验证</button>
    <button type="button" class="dt-tree-node is-branch" data-release-open style="--tree-depth:0">发布版本</button>
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
  const tabItems = [
    { key: "measure", label: "测量项配置" },
    { key: "calibration", label: "标定" },
    { key: "validate", label: "批量测试" },
  ];
  refs.tabList.innerHTML = `
    <div class="dt-work-tab-group">
      ${tabItems.map((item) => {
    const stateClass = item.key === tab.key ? "is-active" : "";
    return `
          <button type="button" class="dt-work-tab ${stateClass}" data-tab-key="${item.key}">
        <span class="dt-tab-btn-label">${item.label}</span>
      </button>
    `;
      }).join("")}
    </div>
    <button type="button" class="dt-work-action is-primary" data-release-open>
      <span class="dt-tab-btn-label">发布</span>
    </button>
  `;
}

function getDefaultRoiNodes() {
  return [
    { type: "roiRange", x: 10, y: 10, w: 80, h: 80 },
    { type: "roiTarget", x: 20, y: 20, w: 60, h: 60 },
  ];
}

function renderToolboxPanel(options = {}) {
  const toolsDisabled = options.toolsDisabled === true;
  const measureSection = getMeasureSection();
  return `
    <section class="dt-workbench-panel dt-toolbox-panel">
      <div class="dt-workbench-panel-head">
        <strong>工具箱</strong>
      </div>
      <div class="dt-toolbox-tabs">
        ${MEASURE_TOOL_SECTIONS.map((section) => {
          const active = section.key === measureSection.key ? "is-active" : "";
          return `<button type="button" class="dt-toolbox-tab ${active}" data-measure-section="${section.key}">${section.title}</button>`;
        }).join("")}
      </div>
      <div class="dt-toolbox-scroll">
        <div class="dt-toolbox-icon-grid">
          ${measureSection.tools
            .map((tool) => {
              const active = state.measureElementSelected && tool.key === state.measureToolKey ? "is-active" : "";
              return `
                <button type="button" class="dt-toolbox-icon-btn ${active}" data-measure-tool="${tool.key}" ${toolsDisabled ? "disabled" : ""}>
                  <span class="dt-toolbox-icon-mark">${tool.icon}</span>
                  <strong>${tool.label}</strong>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFieldHint(text) {
  return `<span class="dt-field-hint" tabindex="0" title="${text}">?</span>`;
}

function renderInfoInput(label, value, hint, type = "text") {
  return `
    <label class="dt-side-field">
      <span class="dt-side-field-label">${label}${renderFieldHint(hint)}</span>
      <input class="dt-side-input" type="${type}" value="${value}" />
    </label>
  `;
}

function renderInfoSelect(label, value, hint, options = []) {
  const selectOptions = options.length ? options : [value];
  return `
    <label class="dt-side-field">
      <span class="dt-side-field-label">${label}${renderFieldHint(hint)}</span>
      <select class="dt-side-select">
        ${selectOptions
          .map((option) => `<option ${option === value ? "selected" : ""}>${option}</option>`)
          .join("")}
      </select>
    </label>
  `;
}

function getElementInfoFields(measureTool) {
  if (measureTool.key === "line_segment") {
    return [
      { label: "元素名称", value: measureTool.itemName, hint: "用于在测量项、构造关系和结果中识别该直线段。" },
      { label: "段长度", value: "1", hint: "直线段的最小有效长度，低于该值时不生成有效元素。", type: "number" },
      { label: "残差阈值", value: "1.00", hint: "拟合直线允许的最大残差，值越小越严格。", type: "number" },
    ];
  }
  if (measureTool.category === "元素") {
    return [
      { label: "元素名称", value: measureTool.itemName, hint: "用于在后续构造和测量中引用该元素。" },
      { label: "搜索范围", value: "自动", hint: "限制该元素在模板图中的搜索区域。" },
      { label: "识别阈值", value: "0.80", hint: "元素识别的置信阈值，值越高越严格。", type: "number" },
    ];
  }
  if (measureTool.category === "构造") {
    return [
      { label: "元素名称", value: measureTool.itemName, hint: "构造元素的名称，用于后续测量引用。" },
      { label: "输入元素", value: "未选择", hint: "构造该元素所依赖的上游元素。" },
      { label: "输出类型", value: measureTool.name, hint: "当前构造工具生成的元素类型。" },
    ];
  }
  if (measureTool.key === "line_distance") {
    return [
      {
        label: "选择第一条线",
        value: "未选择",
        hint: "选择参与距离计算的第一条线。",
        type: "select",
        options: ["未选择", "直线段1", "中线1"],
      },
      {
        label: "选择第二条线",
        value: "未选择",
        hint: "选择参与距离计算的第二条线。",
        type: "select",
        options: ["未选择", "直线段2", "中线1"],
      },
      { label: "元素名称", value: measureTool.itemName, hint: "该线线距离测量项的输出名称。" },
      { label: "上限", value: "", hint: "测量值允许的最大值，留空表示不限制上限。", type: "number" },
      { label: "下限", value: "", hint: "测量值允许的最小值，留空表示不限制下限。", type: "number" },
      { label: "偏移量", value: "0", hint: "对测量输出进行固定补偿，可输入正值或负值。", type: "number" },
    ];
  }
  return [
    { label: "测量项名称", value: measureTool.itemName, hint: "最终输出到测量结果中的名称。" },
    { label: "上限（可选）", value: "16.700", hint: "测量值允许的最大值，超出时输出 NG。", type: "number" },
    { label: "下限（可选）", value: "16.200", hint: "测量值允许的最小值，低于时输出 NG。", type: "number" },
    { label: "输出精度", value: "0.001", hint: "测量结果显示和输出的小数精度。", type: "number" },
  ];
}

function renderElementInfoPanel() {
  const measureTool = getMeasureToolMeta();
  if (!state.measureElementSelected) {
    return `
      <section class="dt-workbench-panel dt-config-panel">
        <div class="dt-workbench-panel-head">
          <strong>元素信息</strong>
        </div>
        <div class="dt-panel-scroll">
          <div class="dt-empty-mini">未选中元素</div>
        </div>
      </section>
    `;
  }
  return `
    <section class="dt-workbench-panel dt-config-panel">
      <div class="dt-workbench-panel-head">
        <strong>元素信息</strong>
      </div>
      <div class="dt-panel-scroll">
        ${getElementInfoFields(measureTool)
          .map((field) =>
            field.type === "select"
              ? renderInfoSelect(field.label, field.value, field.hint, field.options)
              : renderInfoInput(field.label, field.value, field.hint, field.type || "text")
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPixelSizePanel(tabState) {
  const pixelSize = getPixelSizeValue(tabState);
  return `
    <section class="dt-workbench-panel dt-config-panel">
      <div class="dt-workbench-panel-head">
        <strong>像素尺寸</strong>
      </div>
      <div class="dt-panel-scroll">
        <label class="dt-side-field">
          <span class="dt-side-field-label">mm/px</span>
          <input class="dt-side-input" type="number" value="${pixelSize}" step="0.001" data-pixel-size-input />
        </label>
      </div>
    </section>
  `;
}

function renderCalibrationPanel(tabState, calibrationImageReady = true) {
  const mode = state.calibrationMode === "manual" ? "manual" : "auto";
  const calibrationUploadText = mode === "manual" ? "请先上传一张标定块或标准件图像" : "请先上传一张棋盘格图像";
  const actionText = mode === "manual" ? "计算并应用" : "自动标定";
  const actionType = mode === "manual" ? "manual" : "auto";
  const boardType = (tabState.results || []).find((item) => item.label === "标定板")?.value || "标准板 A-10mm";
  return `
    <section class="dt-workbench-panel dt-config-panel">
      <div class="dt-workbench-panel-head">
        <strong>标定配置</strong>
      </div>
      <div class="dt-panel-scroll">
        <div class="dt-calibration-action-row">
          <div class="dt-calibration-mode-tabs is-compact">
            <button type="button" class="${mode === "auto" ? "is-active" : ""}" data-calibration-mode="auto">自动</button>
            <button type="button" class="${mode === "manual" ? "is-active" : ""}" data-calibration-mode="manual">手动</button>
          </div>
          <button type="button" class="dt-step-tool-btn is-primary dt-side-action" data-calibration-action="${actionType}" ${calibrationImageReady ? "" : "disabled"}>${actionText}</button>
        </div>
        ${!calibrationImageReady ? `
          <div class="dt-side-field">
            <span class="dt-side-field-label">标定图</span>
            <span class="dt-side-field-value">${calibrationUploadText}</span>
          </div>
        ` : mode === "auto" ? `
          <label class="dt-side-field">
            <span class="dt-side-field-label">标定板型号</span>
            <select class="dt-side-select">
              <option selected>${boardType}</option>
              <option>标准板 B-20mm</option>
            </select>
          </label>
        ` : `
          <label class="dt-side-field">
            <span class="dt-side-field-label">测量项</span>
            <select class="dt-side-select">
              <option selected>螺杆1总长</option>
              <option>螺杆1螺纹长</option>
              <option>头部直径</option>
            </select>
          </label>
          <label class="dt-side-field">
            <span class="dt-side-field-label">实际尺寸（mm）</span>
            <input class="dt-side-input" type="number" value="10.000000" step="0.000001" />
          </label>
        `}
      </div>
    </section>
  `;
}

function renderCalibrationUploadGuide() {
  return `
    <section class="dt-workbench-panel dt-config-panel">
      <div class="dt-workbench-panel-head">
        <strong>标定配置</strong>
      </div>
      <div class="dt-panel-scroll">
        <div class="dt-side-field">
          <span class="dt-side-field-label">标定图</span>
          <span class="dt-side-field-value">请先上传一张标定图像</span>
        </div>
      </div>
    </section>
  `;
}

function renderValidateListPanel(project, tab) {
  const validateImagesReady = hasValidateImages(project);
  const validateSamples = getSamplesForTab(project, tab.key);
  const activeSample = getActiveSample(project, tab.key);
  const validateResultMap = { ok: "OK", warn: "NG", error: "异常" };
  return `
    <section class="dt-workbench-panel dt-config-panel">
      <div class="dt-workbench-panel-head">
        <strong>待测列表</strong>
      </div>
      <div class="dt-validate-panel-body">
        <div class="dt-validate-toolbar">
          <button type="button" class="dt-step-tool-btn is-primary" data-validate-action="upload">上传测试图</button>
          <button type="button" class="dt-step-tool-btn" data-validate-action="run" ${validateImagesReady ? "" : "disabled"}>执行批量测试</button>
        </div>
        <div class="dt-validate-list">
          ${validateImagesReady ? validateSamples
            .map((sample) => {
              const active = sample.id === activeSample?.id ? "is-active" : "";
              const tone = sample.status === "error" ? "is-error" : sample.status === "warn" ? "is-warn" : "is-ok";
              const resultText = validateResultMap[sample.status] || "OK";
              return `
                <button type="button" class="dt-validate-card ${active}" data-sample-id="${sample.id}">
                  <img src="${sample.image}" alt="${sample.name}" />
                  <div class="dt-validate-card-copy">
                    <strong>${sample.name}</strong>
                    <span>${sample.summary || "待测图像"}</span>
                  </div>
                  <span class="dt-validate-card-result ${tone}">${resultText}</span>
                </button>
              `;
            })
            .join("") : `<div class="dt-empty-mini">暂无测试图</div>`}
        </div>
      </div>
    </section>
  `;
}

function renderConfigPanel(project, tab, tabState) {
  const measureTool = getMeasureToolMeta();
  const isMeasureTool = measureTool.category === "测量";
  const pixelSize = (tabState.results || []).find((item) => item.label === "像素尺寸")?.value || "--";
  const boardType = (tabState.results || []).find((item) => item.label === "标定板")?.value || "标准板 A-10mm";
  const releaseState = getReleaseReadiness(project);
  const titleMap = {
    roi: "工具配置 - ROI",
    measure: `工具配置 - ${measureTool.name}`,
    calibration: "工具配置 - 标定",
    validate: "工具配置 - 测试",
    release: "发布前检查",
  };

  if (tab.key === "release") {
    return `
      <section class="dt-workbench-panel dt-config-panel">
        <div class="dt-workbench-panel-head">
          <strong>${titleMap.release}</strong>
        </div>
        <div class="dt-panel-scroll">
          <div class="dt-release-list">
            ${releaseState.checks
              .map((item) => `
                <div class="dt-release-check-row">
                  <div class="dt-release-check-copy">
                    <strong>${item.label}</strong>
                    <span class="dt-release-check-state is-${item.status}">${item.statusLabel}</span>
                  </div>
                  ${item.status === "missing" ? `<button type="button" class="dt-row-btn" data-release-tab="${item.targetTab}">去处理</button>` : ""}
                </div>
              `)
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  if (tab.key === "calibration") {
    const mode = state.calibrationMode || "auto";
    return `
      <section class="dt-workbench-panel dt-config-panel">
        <div class="dt-workbench-panel-head">
          <strong>${titleMap.calibration}</strong>
        </div>
        <div class="dt-panel-scroll">
          <div class="dt-calibration-mode-tabs">
            <button type="button" class="${mode === "auto" ? "is-active" : ""}" data-calibration-mode="auto">自动标定</button>
            <button type="button" class="${mode === "manual" ? "is-active" : ""}" data-calibration-mode="manual">手动标定</button>
            <button type="button" class="${mode === "direct" ? "is-active" : ""}" data-calibration-mode="direct">直接输入</button>
          </div>
          ${mode === "auto" ? `
            <label class="dt-side-field">
              <span class="dt-side-field-label">标定模板</span>
              <select class="dt-side-select">
                <option selected>${boardType}</option>
                <option>标准板 B-20mm</option>
              </select>
            </label>
            <button type="button" class="dt-step-tool-btn is-primary dt-side-action" data-calibration-action="auto">自动标定</button>
          ` : ""}
          ${mode === "manual" ? `
            <label class="dt-side-field">
              <span class="dt-side-field-label">选择测量项</span>
              <select class="dt-side-select">
                <option selected>DistanceValueShape_0</option>
                <option>螺杆1总长</option>
              </select>
            </label>
            <label class="dt-side-field">
              <span class="dt-side-field-label">实际尺寸（mm）</span>
              <input class="dt-side-input" type="number" value="10.000000" step="0.000001" />
            </label>
            <button type="button" class="dt-step-tool-btn is-primary dt-side-action" data-calibration-action="manual">计算并应用</button>
          ` : ""}
          ${mode === "direct" ? `
            <label class="dt-side-field">
              <span class="dt-side-field-label">标定值（mm/px）</span>
              <input class="dt-side-input" type="number" value="0.021" step="0.001" />
            </label>
            <button type="button" class="dt-step-tool-btn is-primary dt-side-action" data-calibration-action="direct">应用标定值</button>
          ` : ""}
          <div class="dt-side-field">
            <span class="dt-side-field-label">当前像素尺寸</span>
            <strong class="dt-side-metric">${pixelSize}</strong>
          </div>
        </div>
      </section>
    `;
  }

  if (tab.key === "roi") {
    const templateReady = hasTemplateImage(project);
    return `
      <section class="dt-workbench-panel dt-config-panel">
        <div class="dt-workbench-panel-head">
          <strong>${titleMap.roi}</strong>
        </div>
        <div class="dt-panel-scroll">
          <div class="dt-side-field">
            <span class="dt-side-field-label">模版图</span>
            <span class="dt-side-field-value">${templateReady ? "已上传，可在画布中更换" : "未上传"}</span>
          </div>
          <div class="dt-side-field">
            <span class="dt-side-field-label">出现范围</span>
            <span class="dt-side-field-value">蓝色大框，限制检测对象可能出现的区域</span>
          </div>
          <div class="dt-side-field">
            <span class="dt-side-field-label">检测对象</span>
            <span class="dt-side-field-value">绿色小框，表示当前模板中的检测对象</span>
          </div>
        </div>
      </section>
    `;
  }

  if (tab.key === "validate") {
    const validateSamples = getSamplesForTab(project, tab.key);
    const activeSample = getActiveSample(project, tab.key);
    const validateResultMap = { ok: "OK", warn: "NG", error: "异常" };
    return `
      <section class="dt-workbench-panel dt-config-panel">
        <div class="dt-workbench-panel-head">
          <strong>批量测试</strong>
        </div>
        <div class="dt-panel-scroll">
          <div class="dt-validate-toolbar">
            <button type="button" class="dt-step-tool-btn is-primary" data-validate-action="upload">上传测试图</button>
            <button type="button" class="dt-step-tool-btn" data-validate-action="run">执行批量测试</button>
          </div>
          <div class="dt-validate-list">
            ${validateSamples
              .map((sample) => {
                const active = sample.id === activeSample?.id ? "is-active" : "";
                const tone = sample.status === "error" ? "is-error" : sample.status === "warn" ? "is-warn" : "is-ok";
                const resultText = validateResultMap[sample.status] || "OK";
                return `
                  <button type="button" class="dt-validate-card ${active}" data-sample-id="${sample.id}">
                    <img src="${sample.image}" alt="${sample.name}" />
                    <div class="dt-validate-card-copy">
                      <strong>${sample.name}</strong>
                      ${sample.metric ? `<em>${sample.metric}</em>` : ""}
                    </div>
                    <span class="dt-validate-card-result ${tone}">${resultText}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="dt-workbench-panel dt-config-panel">
      <div class="dt-workbench-panel-head">
        <strong>${titleMap.measure}</strong>
      </div>
      <div class="dt-panel-scroll">
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
      </div>
    </section>
  `;
}

function renderMeasureValuePanel(tabState, tab) {
  const activeProject = getProject();
  const activeSample = getActiveSample(activeProject, tab.key);
  const rows = tab.key === "validate" && hasValidateImages(activeProject) ? getMeasureRows(activeSample?.id) : [];
  const results = tabState.results || [];
  const imageStatus = tab.key === "release" ? "待发布" : tab.key === "validate" ? "已运行测试" : "配置中";
  return `
    <section class="dt-workbench-panel dt-value-panel">
      <div class="dt-workbench-panel-head">
        <strong>${tab.key === "measure" ? "测量项" : "测量值"}</strong>
      </div>
      <div class="dt-workbench-value-list">
        ${rows.length
          ? rows.map((item) => `
            <div class="dt-measure-row">
              <div>
                <strong>${item.name}</strong>
                <span>${item.lower} - ${item.upper} mm</span>
              </div>
              <em>${item.value}</em>
              <b class="is-${item.result === "OK" ? "ok" : item.result === "NG" ? "ng" : "error"}">${item.result}</b>
            </div>
          `).join("")
          : tab.key === "measure"
            ? `<div class="dt-empty-mini">暂无测量项</div>`
            : results.length
            ? results.map((item) => `<div class="dt-result-card"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("")
            : `<div class="dt-empty-mini">暂无测量值</div>`}
      </div>
      <div class="dt-image-state-row" ${tab.key === "measure" || tab.key === "validate" ? "hidden" : ""}>
        <span>当前图像状态：</span>
        <strong>${imageStatus}</strong>
      </div>
    </section>
  `;
}

function renderStepScaffold(project, tab) {
  const tabState = getTabState(project, tab.key);
  const isCalibration = tab.key === "calibration";
  const isTemplateConfig = tab.key === "roi";
  const isMeasureConfig = tab.key === "measure";
  const isValidateConfig = tab.key === "validate";
  const isReleaseConfig = tab.key === "release";
  const templateReady = hasTemplateImage(project);
  const calibrationImageReady = hasCalibrationImage(project);
  const validateImagesReady = hasValidateImages(project);
  const showTemplateEmptyState = (isTemplateConfig || isMeasureConfig) && !templateReady;
  const showCalibrationEmptyState = isCalibration && !calibrationImageReady;
  const showValidateEmptyState = isValidateConfig && !validateImagesReady;
  const releaseState = getReleaseReadiness(project);

  if (!refs.workspace || !refs.stageUpload || !refs.rightPanel || !refs.leftPanel || !refs.stageContent) return;

  refs.workspace.classList.add("is-workbench");
  refs.workspace.classList.toggle("is-calibration", isCalibration);
  refs.workspace.classList.toggle("is-template-config", isTemplateConfig);
  refs.workspace.classList.toggle("is-measure-config", isMeasureConfig);
  refs.workspace.classList.toggle("is-validate-config", isValidateConfig);
  refs.workspace.classList.toggle("is-release-config", isReleaseConfig);
  refs.workspace.classList.toggle("is-calibration-manual", isCalibration && state.calibrationMode === "manual" && calibrationImageReady);
  refs.workspace.classList.toggle("is-calibration-auto", isCalibration && state.calibrationMode !== "manual" && calibrationImageReady);
  refs.leftPanel.hidden = true;
  refs.stageUpload.hidden = false;
  refs.stageContent.hidden = !isReleaseConfig && !showTemplateEmptyState && !showCalibrationEmptyState && !showValidateEmptyState;
  refs.rightPanel.hidden = false;
  refs.stageImage.hidden = isReleaseConfig || showTemplateEmptyState || showCalibrationEmptyState || showValidateEmptyState;
  refs.overlay.hidden = isReleaseConfig || showTemplateEmptyState || showCalibrationEmptyState || showValidateEmptyState;
  refs.leftPanel.innerHTML = "";
  refs.stageImage.style.transform = `translate(-50%, -50%) scale(${state.stageZoom})`;
  refs.overlay.style.transform = `translate(-50%, -50%) scale(${state.stageZoom})`;
  if (refs.uploadTemplateBtn) {
    refs.uploadTemplateBtn.hidden = isReleaseConfig;
  }
  const currentImageReady = isCalibration ? calibrationImageReady : isValidateConfig ? validateImagesReady : templateReady;
  if (refs.toggleRoiInput) {
    refs.toggleRoiInput.disabled = !currentImageReady;
    refs.toggleRoiInput.classList.toggle("is-active", state.roiVisible);
    refs.toggleRoiInput.classList.toggle("is-hidden-roi", !state.roiVisible);
  }
  if (refs.resetViewBtn) {
    refs.resetViewBtn.disabled = !currentImageReady;
  }

  if (!isCalibration && !isTemplateConfig && !isMeasureConfig && !isValidateConfig && !isReleaseConfig) {
    refs.leftPanel.innerHTML = "";
    refs.stageUpload.innerHTML = "";
    refs.stageContent.innerHTML = "";
    refs.rightPanel.innerHTML = "";
    return;
  }

  if (isReleaseConfig) {
    refs.stageUpload.innerHTML = "";
    refs.rightPanel.innerHTML = `
      ${renderConfigPanel(project, tab, tabState)}
      ${renderMeasureValuePanel(tabState, tab)}
    `;
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

  const uploadLabel = isCalibration
    ? calibrationImageReady ? "更换标定图" : "上传标定图"
    : isValidateConfig
      ? "上传测试图"
      : templateReady
        ? "更换模版图"
        : "上传模版图";
  if (refs.uploadTemplateBtn) {
    refs.uploadTemplateBtn.textContent = uploadLabel;
  }
  refs.stageUpload.hidden = showTemplateEmptyState || showCalibrationEmptyState || showValidateEmptyState || isValidateConfig;
  refs.stageUpload.innerHTML = `<button type="button" class="dt-stage-upload-btn">${uploadLabel}</button>`;
  if (isValidateConfig) {
    refs.rightPanel.innerHTML = `
      ${renderValidateListPanel(project, tab)}
      ${renderMeasureValuePanel(tabState, tab)}
    `;
  } else if (isCalibration) {
    if (!calibrationImageReady) {
      refs.rightPanel.innerHTML = `
        ${renderPixelSizePanel(tabState)}
        ${renderCalibrationPanel(tabState, false)}
      `;
    } else if (state.calibrationMode === "manual") {
      refs.rightPanel.innerHTML = `
        ${renderPixelSizePanel(tabState)}
        ${renderCalibrationPanel(tabState, true)}
        ${renderToolboxPanel()}
        ${renderElementInfoPanel()}
      `;
    } else {
      refs.rightPanel.innerHTML = `
        ${renderPixelSizePanel(tabState)}
        ${renderCalibrationPanel(tabState, true)}
      `;
    }
  } else if (isMeasureConfig) {
    refs.rightPanel.innerHTML = `
      ${renderToolboxPanel({ toolsDisabled: !templateReady })}
      ${renderElementInfoPanel()}
      ${renderMeasureValuePanel(tabState, tab)}
    `;
  } else {
    refs.rightPanel.innerHTML = `
      ${renderToolboxPanel()}
      ${renderConfigPanel(project, tab, tabState)}
      ${renderMeasureValuePanel(tabState, tab)}
    `;
  }
  const zoomPercent = Math.round(state.stageZoom * 100);
  refs.stageContent.innerHTML = showTemplateEmptyState || showCalibrationEmptyState || showValidateEmptyState
    ? `
      <button type="button" class="dt-template-empty-card" data-template-upload>
        <strong>${showCalibrationEmptyState ? "上传标定图" : showValidateEmptyState ? "上传测试图" : "上传模版图"}</strong>
        <span>${showCalibrationEmptyState ? state.calibrationMode === "manual" ? "请先上传一张标定块或标准件图像" : "请先上传一张棋盘格图像" : showValidateEmptyState ? "请先上传若干测试图，用于批量测试" : "请先上传一张标准模版图像，用于测量项配置"}</span>
      </button>
    `
    : `
      <div class="dt-stage-zoom">
        <button type="button" data-stage-zoom="out">-</button>
        <span>${zoomPercent}%</span>
        <button type="button" data-stage-zoom="in">+</button>
      </div>
    `;
}

function renderMain(project, tab, sample) {
  const currentIndex = TABS.findIndex((item) => item.key === tab.key);
  refs.prevStepBtn.hidden = true;
  refs.nextStepBtn.hidden = true;
  refs.skipStepBtn.hidden = true;
  if (!project) {
    refs.prevStepBtn.disabled = true;
    refs.nextStepBtn.disabled = true;
    refs.skipStepBtn.textContent = "跳过";
    refs.stageImage.removeAttribute("src");
    return;
  }
  refs.prevStepBtn.disabled = currentIndex <= 0;
  refs.nextStepBtn.disabled = currentIndex >= TABS.length - 1;
  refs.nextStepBtn.textContent = currentIndex >= TABS.length - 1 ? "完成" : "下一步";
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
  if (tab.key === "release") {
    refs.overlay.innerHTML = "";
    return;
  }
  const tabState = getTabState(project, tab.key);
  const tabNodes = (tabState.overlays?.[sample?.id] || []).filter((node) => !["roi", "box"].includes(node.type));
  const nodes = state.roiVisible ? [...getDefaultRoiNodes(), ...tabNodes] : tabNodes;
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

    el.className =
      node.type === "roiRange"
        ? "dt-shape dt-roi-range"
        : node.type === "roiTarget"
          ? "dt-shape dt-roi-target"
          : node.type === "roi"
            ? "dt-shape dt-roi"
            : "dt-shape";
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
    refs.modalTitle.textContent = "编辑工程信息";
    refs.modalDesc.textContent = "";
    refs.modalSubmitBtn.textContent = "保存信息";
    refs.projectNameInput.value = project?.name || "";
    refs.projectNoteInput.value = project?.note || "";
  } else {
    refs.modalTitle.textContent = "新建工程";
    refs.modalDesc.textContent = "";
    refs.modalSubmitBtn.textContent = "创建并打开";
    refs.projectNameInput.value = "";
    refs.projectNoteInput.value = "";
  }
}

function renderSettingsModal() {
  refs.settingsModal.hidden = !state.settingsOpen;
  refs.settingsModelServiceInput.value = state.localSettings.modelServiceUrl;
  refs.settingsWorkspaceInput.value = state.localSettings.workspacePath;
  refs.settingsLogInput.value = state.localSettings.logPath;
  refs.settingsCacheInput.value = state.localSettings.cachePath;
}

function renderReleaseModal() {
  const modal = state.releaseModal;
  const project = getProject();
  refs.releaseModal.hidden = !modal;
  if (!modal) return;

  refs.releaseModalTitle.textContent = modal.success ? "发布成功" : "确认发布";
  refs.releaseModalDesc.textContent = modal.success ? "工程已发布完成。" : "请确认发布信息无误。";
  refs.releaseModalBody.innerHTML = modal.success
    ? `
      <div class="dt-release-success">
        <strong>发布成功</strong>
        <span>${project?.name || "--"} 已发布为版本 ${modal.version}</span>
      </div>
      <div class="dt-modal-actions">
        <button type="button" class="dt-toolbar-btn is-primary" data-release-close>完成</button>
      </div>
    `
    : `
      <div class="dt-release-confirm-list">
        <div class="dt-release-confirm-row">
          <span>工程名称</span>
          <strong>${project?.name || "--"}</strong>
        </div>
        <div class="dt-release-confirm-row">
          <span>发布版本号</span>
          <strong>${modal.version}</strong>
        </div>
      </div>
      <div class="dt-modal-actions">
        <button type="button" class="dt-toolbar-btn" data-release-close>取消</button>
        <button type="button" class="dt-toolbar-btn is-primary" data-release-confirm>发布</button>
      </div>
    `;
}

function renderParamModals() {
  refs.shapeMatchModal.hidden = state.paramModal !== "shape";
  refs.preprocessModal.hidden = state.paramModal !== "preprocess";
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
  renderReleaseModal();
  renderParamModals();
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

function buildReleaseVersion() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % 100000).padStart(5, "0");
  return `${datePart}${suffix}`;
}

function openReleaseModal() {
  state.releaseModal = {
    success: false,
    version: buildReleaseVersion(),
  };
  render();
}

function closeReleaseModal() {
  state.releaseModal = null;
  render();
}

function openParamModal(type) {
  state.paramModal = type;
  render();
}

function closeParamModal() {
  state.paramModal = null;
  render();
}

function resetShapeParams() {
  refs.shapeAngleFromInput.value = "-180";
  refs.shapeAngleToInput.value = "180";
  refs.shapeAngleStepInput.value = "1";
  refs.shapeAccuracyInput.value = "1.00";
  refs.shapeMatchInput.value = "0.40";
  refs.shapeScaleInput.value = "0.10";
}

function resetPreprocessParams() {
  refs.binaryThresholdInput.value = "-1";
  refs.medianThresholdInput.value = "5";
}

function markWorkflowDone(key) {
  const project = getProject();
  if (!project) return;
  project.workflowState = { ...(project.workflowState || {}), [key]: true };
  project.updatedAt = formatNowLabel();
}

function handleWorkbenchUpload() {
  const tab = getTab();
  if (tab.key === "calibration") {
    markWorkflowDone("calibrationImage");
    render();
    return;
  }
  if (tab.key === "validate") {
    markWorkflowDone("validateImages");
    render();
    return;
  }
  markWorkflowDone("template");
  render();
}

function getBatchTestBlocker(project = getProject()) {
  const workflowState = project?.workflowState || {};
  if (workflowState.template !== true) return "请先上传模版图";
  if (workflowState.roi !== true) return "请先完成 ROI 配置";
  if (workflowState.measure !== true) return "请先配置测量项";
  return "";
}

function setStageZoom(nextZoom) {
  state.stageZoom = Math.min(2.6, Math.max(0.45, Number(nextZoom) || 1));
  render();
}

function handleBatchTest() {
  const blocker = getBatchTestBlocker();
  if (blocker) {
    setManagerMessage(`${blocker}，再执行批量测试`);
    render();
    return;
  }
  if (!hasValidateImages()) {
    setManagerMessage("请先上传测试图，再执行批量测试");
    render();
    return;
  }
  state.tabKey = "validate";
  markWorkflowDone("validate");
  setManagerMessage("已执行批量测试（demo 示意）");
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
  refs.importProjectInput?.click();
}

function handleImportProjectFile(file) {
  if (!file) return;
  const source = cloneDeep(PROJECTS[2] || PROJECTS[0] || createBaseProjectTemplate());
  source.id = buildProjectId();
  source.name = file.name ? file.name.replace(/\.[^.]+$/, "") : "导入工程";
  source.updatedAt = formatNowLabel();
  PROJECTS.unshift(source);
  state.managerSelectedProjectId = source.id;
  state.projectId = source.id;
  state.editorOpen = true;
  state.activeWindow = "editor";
  clearManagerMessage();
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
refs.importProjectInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  handleImportProjectFile(file);
  event.target.value = "";
});
refs.openSettingsBtns.forEach((button) => {
  button.addEventListener("click", openSettingsModal);
});

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
  if (action === "export-model") {
    state.managerMenuProjectId = "";
    setManagerMessage(`已导出模型“${findProject(projectId)?.name || ""}”（demo 提示）`);
    render();
    return;
  }
  if (action === "publish-model") {
    state.managerMenuProjectId = "";
    setManagerMessage(`已发布模型“${findProject(projectId)?.name || ""}”（demo 提示）`);
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
    const releaseOpenButton = event.target.closest("[data-release-open]");
    if (releaseOpenButton) {
      openReleaseModal();
      return;
    }
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

if (refs.stageUpload) {
  refs.stageUpload.addEventListener("click", (event) => {
    const button = event.target.closest(".dt-stage-upload-btn");
    if (!button) return;
    handleWorkbenchUpload();
  });
}

refs.tabList.addEventListener("click", (event) => {
  const releaseOpenButton = event.target.closest("[data-release-open]");
  if (releaseOpenButton) {
    openReleaseModal();
    return;
  }

  const actionButton = event.target.closest("[data-editor-action='batch-test']");
  if (actionButton) {
    handleBatchTest();
    return;
  }
  const button = event.target.closest("[data-tab-key]");
  if (!button) return;
  state.tabKey = button.dataset.tabKey || state.tabKey;
  if (state.tabKey === "calibration") {
    state.calibrationMode = "auto";
  }
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
    state.measureElementSelected = true;
    const matchedSection = MEASURE_TOOL_SECTIONS.find((section) =>
      section.tools.some((tool) => tool.key === state.measureToolKey)
    );
    if (matchedSection) {
      state.measureToolSectionKey = matchedSection.key;
    }
    render();
  });
}

if (refs.rightPanel) {
  refs.rightPanel.addEventListener("click", (event) => {
    const releaseTabButton = event.target.closest("[data-release-tab]");
    if (releaseTabButton) {
      state.tabKey = releaseTabButton.dataset.releaseTab || state.tabKey;
      render();
      return;
    }

    const calibrationModeButton = event.target.closest("[data-calibration-mode]");
    if (calibrationModeButton) {
      state.calibrationMode = calibrationModeButton.dataset.calibrationMode || state.calibrationMode;
      render();
      return;
    }

    const roiButton = event.target.closest("[data-roi-action]");
    if (roiButton) {
      markWorkflowDone("roi");
      render();
      return;
    }

    const calibrationButton = event.target.closest("[data-calibration-action]");
    if (calibrationButton) {
      markWorkflowDone("calibration");
      render();
      return;
    }

    const validateButton = event.target.closest("[data-validate-action]");
    if (validateButton) {
      if (validateButton.dataset.validateAction === "run") {
        handleBatchTest();
      } else {
        markWorkflowDone("validateImages");
        render();
      }
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

    const toolButton = event.target.closest("[data-measure-tool]");
    if (!toolButton) return;
    state.measureToolKey = toolButton.dataset.measureTool || state.measureToolKey;
    state.measureElementSelected = true;
    const matchedSection = MEASURE_TOOL_SECTIONS.find((section) =>
      section.tools.some((tool) => tool.key === state.measureToolKey)
    );
    if (matchedSection) {
      state.measureToolSectionKey = matchedSection.key;
    }
    render();
  });
}

refs.editorBackBtn.addEventListener("click", closeEditorWindow);
refs.uploadTemplateBtn?.addEventListener("click", handleWorkbenchUpload);
refs.runTestBtn?.addEventListener("click", handleBatchTest);
refs.resetViewBtn.addEventListener("click", () => {
  state.stageZoom = 1;
  setManagerMessage("已重置画布视图（demo 示意）");
  render();
});
refs.fitViewBtn?.addEventListener("click", () => {
  setManagerMessage("已适应窗口显示（demo 示意）");
  render();
});
refs.toggleRoiInput.addEventListener("click", () => {
  if (refs.toggleRoiInput.disabled) return;
  state.roiVisible = !state.roiVisible;
  render();
});

document.querySelectorAll("[data-title-menu-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.titleMenuAction;
    if (action === "shape-match") {
      openParamModal("shape");
      return;
    }
    if (action === "preprocess") {
      openParamModal("preprocess");
      return;
    }
    setManagerMessage(`${button.textContent.trim()}（demo 示意）`);
    render();
  });
});

document.querySelectorAll("[data-param-close]").forEach((button) => {
  button.addEventListener("click", closeParamModal);
});

document.querySelectorAll("[data-param-reset]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.paramReset === "shape") {
      resetShapeParams();
      return;
    }
    resetPreprocessParams();
  });
});

document.querySelectorAll("[data-param-save]").forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.dataset.paramSave === "shape" ? "形状匹配参数" : "预处理参数";
    setManagerMessage(`${label}已保存`);
    closeParamModal();
  });
});

[refs.shapeMatchModal, refs.preprocessModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) return;
  });
});

if (refs.stageContent) {
  refs.stageContent.addEventListener("click", (event) => {
    const templateUploadButton = event.target.closest("[data-template-upload]");
    if (templateUploadButton) {
      handleWorkbenchUpload();
      return;
    }

    const zoomButton = event.target.closest("[data-stage-zoom]");
    if (zoomButton) {
      const offset = zoomButton.dataset.stageZoom === "in" ? 0.12 : -0.12;
      setStageZoom(state.stageZoom + offset);
      return;
    }

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

refs.stageImage.addEventListener("wheel", (event) => {
  event.preventDefault();
  const offset = event.deltaY < 0 ? 0.08 : -0.08;
  setStageZoom(state.stageZoom + offset);
}, { passive: false });

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
  state.localSettings.modelServiceUrl = refs.settingsModelServiceInput.value.trim();
  setManagerMessage("全局设置已保存");
  closeSettingsModal();
});

refs.releaseCloseBtn.addEventListener("click", closeReleaseModal);
refs.releaseModal.addEventListener("click", (event) => {
  if (event.target === refs.releaseModal) return;
  const closeButton = event.target.closest("[data-release-close]");
  if (closeButton) {
    closeReleaseModal();
    return;
  }
  const confirmButton = event.target.closest("[data-release-confirm]");
  if (!confirmButton) return;
  const project = getProject();
  if (project) {
    project.releaseState = "已发布版本";
    project.version = state.releaseModal?.version || project.version;
    project.updatedAt = formatNowLabel();
    project.workflowState = { ...(project.workflowState || {}), release: true };
  }
  state.releaseModal = { ...(state.releaseModal || {}), success: true };
  render();
});
refs.settingsModal.addEventListener("click", (event) => {
  if (event.target === refs.settingsModal) closeSettingsModal();
});
refs.settingsClearCacheBtn.addEventListener("click", () => {
  setManagerMessage("缓存已清除（demo 示意）");
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
  if (name.length > 20) {
    refs.modalError.hidden = false;
    refs.modalError.textContent = "工程名称不能超过 20 个字符。";
    return;
  }
  if (note.length > 120) {
    refs.modalError.hidden = false;
    refs.modalError.textContent = "备注不能超过 120 个字符。";
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
