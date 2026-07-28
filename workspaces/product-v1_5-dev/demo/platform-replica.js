const Demo = window.JetCheckDemo || {};
const STORAGE_KEY = "jetcheck-platform-replica-v4";
const UI_STORAGE_KEY = "jetcheck-platform-replica-ui-v4";
const CLIENT_CLOUD_SYNC_QUEUE_KEY = "jetcheck-client-cloud-sync-v1";
const CLIENT_DATA_RETURN_QUEUE_KEY = "jetcheck-client-data-return-v1";

const IMAGE_KAKOU = "./sample-images/安全座椅-卡扣kakou.png";
const IMAGE_LUOGAN = "./sample-images/安全座椅-螺杆.bmp";
const IMAGE_XRAY = "./sample-images/马斯特X光.bmp";
const IMAGE_GEAR = "./sample-images/齿轮.jpg";
const IMAGE_BACKPLATE_UPPER = "./sample-images/背板-上.png";
const IMAGE_BACKPLATE_LOWER = "./sample-images/背板-下.png";
const IMAGE_CALIBRATION_BLOCK = "./sample-images/标定块图像.bmp";
const IMAGE_CALIBRATION_BOARD = "./sample-images/标定板图像.png";
const IMAGE_GAUZE = "./sample-images/血氧纱布.jpg";
const PLATFORM_GEAR_ANGLES = [0, 30, 60, 90, 120, 150];
const PLATFORM_GEAR_SAMPLE_IDS = PLATFORM_GEAR_ANGLES.flatMap((angle) => [`img_gear_a_${String(angle).padStart(3, "0")}`, `img_gear_b_${String(angle).padStart(3, "0")}`]);
const PLATFORM_BACKPLATE_VERSION_V1_IDS = ["img_backplate_upper", "img_backplate_lower"];
const PLATFORM_BACKPLATE_SAMPLE_IDS = [
  ...PLATFORM_BACKPLATE_VERSION_V1_IDS,
  "img_backplate_upper_capture_01",
  "img_backplate_lower_capture_01",
  "img_backplate_upper_detect_01",
  "img_backplate_lower_detect_01",
];

const LABEL_COLORS = ["#f5222d", "#fa8c16", "#52c41a", "#1677ff", "#722ed1"];
const DEFAULT_LIBRARY_TAGS = [
  { id: "tag_ng", name: "NG", color: "#f5222d" },
  { id: "tag_ok", name: "OK", color: "#52c41a" },
];

const MODEL_ALGORITHM_TYPES = ["目标检测", "目标检测 OBB", "图像分类", "字符识别 OCR"];
const ACTIVE_SCENE_TEMPLATE_IDS = ["gear_surface_defect", "backplate_surface_defect"];

const SCENE_TEMPLATES = [
  {
    id: "gear_surface_defect",
    name: "齿轮表面气泡/划痕检测",
    category: "指定区域缺陷检测",
    industries: ["汽车零部件", "金属加工"],
    object: "齿轮",
    image: IMAGE_GEAR,
    complexity: "较复杂",
    stepCount: 7,
    modelCount: 2,
    description: "适用于先定位齿面区域，再检测齿面气泡、划痕等缺陷的工业场景。",
    dataNeed: "完整齿轮原图；需要先找到稳定的齿面区域，再在齿面区域内判断气泡、划痕等缺陷。",
    useCase: "当客户端工具需要严格落在“图像获取 → 图像处理 → 图像检测”三步内，并且检测前必须先定位/裁剪有效区域时使用。齿面定位算子放在图像处理步，气泡/划痕检测算子放在图像检测步。",
    idealFlow: [
      "选择该模板创建场景骨架",
      "在图像获取步确认齿轮相机或上传入口",
      "图像处理步选择未归属的独立算子、创建新算子，或复制官方齿面定位算子",
      "进入定位算子样本池，确认齿面 ROI 标注和默认使用权重",
      "图像检测步选择未归属的独立算子、创建新算子，或复制气泡/划痕检测算子",
      "进入缺陷检测算子样本池，处理裁剪图标注和回流推理结果",
      "发布场景配置，客户端在联网时主动拉取并生成本地检测工具",
    ],
    labels: ["齿面", "气泡", "划痕"],
    defaultSceneName: "齿轮A线气泡/划痕检测",
    workflow: [
      { id: "bind-roi", title: "配置齿面定位算子", user: "选择已有算子、创建新算子或复制算子。", system: "建立齿面定位节点与算子实例的绑定关系。" },
      { id: "prepare-roi", title: "准备齿面定位样本", user: "进入对应算子样本池补充样本和标注。", system: "样本、标注和推理结果持续保留在齿面定位算子内。" },
      { id: "connect-crop", title: "配置齿面裁剪连接", user: "确认齿面定位输出作为下游输入。", system: "把齿面 ROI 输出连接到气泡/划痕检测节点。" },
      { id: "bind-defect", title: "配置缺陷检测算子", user: "选择或创建气泡/划痕检测算子。", system: "建立缺陷检测节点与算子实例的绑定关系。" },
      { id: "prepare-defect", title: "准备缺陷检测样本", user: "进入对应算子样本池补充裁剪图和标注。", system: "下游样本归属于缺陷检测算子。" },
      { id: "default-weights", title: "确认默认使用权重", user: "确认每个节点被客户端拉取时使用的权重。", system: "记录场景发布配置，不改变算子自身的持续更新关系。" },
      { id: "publish-scene", title: "发布场景配置", user: "发布可被客户端拉取的场景配置。", system: "客户端按节点执行，回流图像在图像库可见，处理归属对应算子。" },
    ],
  },
  {
    id: "backplate_surface_defect",
    name: "背板外观缺陷检测",
    category: "表面缺陷检测",
    industries: ["电子制造", "金属加工"],
    object: "背板",
    image: IMAGE_BACKPLATE_UPPER,
    complexity: "简单",
    stepCount: 5,
    modelCount: 1,
    description: "适用于固定工位下检测背板上表面、下表面的划伤、压伤、脏污、黑点等外观缺陷。",
    dataNeed: "同一工位的背板外观图像；样本应覆盖 OK、NG、轻微缺陷，以及上/下半面差异。",
    useCase: "当客户端工具仍然按“图像获取 → 图像处理 → 图像检测”三步运行，但中间不需要额外定位/裁剪，一个检测算子就能完成识别时使用。模板主要用于标准化工具结构、算子归属和客户端拉取配置。",
    idealFlow: [
      "选择该模板创建场景骨架",
      "在图像获取步确认背板相机或上传入口",
      "图像处理步保持无额外处理或基础预处理",
      "图像检测步选择未归属的独立算子、创建新算子，或复制官方背板缺陷检测算子",
      "进入算子样本池，处理未标注、待确认和已标注数据",
      "确认该算子的默认使用权重",
      "发布场景配置，客户端在联网时主动拉取并生成本地检测工具",
      "客户端回流图像和推理结果继续进入该算子样本池",
    ],
    labels: ["划伤", "压伤", "脏污", "黑点", "缺料"],
    defaultSceneName: "背板外观缺陷检测",
    example: {
      dataSource: "客户端示例-背板相机回流",
      datasetId: "dataset_backplate_defect",
      datasetVersionId: "dsv_backplate_v1",
      modelId: "model_backplate_defect",
      modelVersionId: "mv_backplate_v1",
      clientTool: "背板外观缺陷检测工具",
    },
    workflow: [
      { id: "bind-defect", title: "配置背板缺陷检测算子", user: "选择已有算子、创建新算子或复制算子。", system: "建立场景节点与背板缺陷检测算子的绑定关系。" },
      { id: "prepare-samples", title: "准备算子样本", user: "进入算子样本池处理未标注、待确认和已标注数据。", system: "样本、标注、推理结果持续保留在算子内。" },
      { id: "default-weight", title: "确认默认使用权重", user: "确认客户端拉取后使用的权重。", system: "场景只记录发布配置，不直接拥有权重。" },
      { id: "publish-scene", title: "发布场景配置", user: "发布可被客户端拉取的场景配置。", system: "客户端运行后，图像库可见回流资产，算子样本池负责处理。" },
      { id: "monitor-return", title: "查看回流概览", user: "在场景中查看回流概览，点击进入算子样本池处理。", system: "场景提供聚合视角，数据仍归属算子。" },
    ],
  },
  {
    id: "assembly_presence",
    name: "汽车卡扣装配完整性检测",
    category: "有无/装配完整性检测",
    industries: ["汽车零部件", "电子制造"],
    object: "卡扣、螺丝、垫片",
    image: IMAGE_KAKOU,
    complexity: "简单",
    stepCount: 4,
    modelCount: 1,
    description: "适用于检测零件是否漏装、错装或安装不到位。",
    dataNeed: "装配后的产品图像；标注应出现的关键零件。",
    labels: ["卡扣", "螺丝", "垫片"],
    defaultSceneName: "卡扣装配完整性检测",
    workflow: [
      { id: "import-images", title: "配置装配完整性检测算子", user: "上传或选择客户端回流图像。", system: "创建或绑定装配完整性检测算子。" },
      { id: "annotate-target", title: "标注应检测零件", user: "框选卡扣、螺丝等目标。", system: "保存目标标注。" },
      { id: "train-model", title: "训练检测权重", user: "点击开始训练。", system: "训练有无检测算子权重。" },
      { id: "export-models", title: "下发算子", user: "下发算子给客户端使用。", system: "生成客户端可拉取的运行描述。" },
    ],
  },
  {
    id: "pcb_solder_defect",
    name: "PCB焊点缺陷检测",
    category: "表面缺陷检测",
    industries: ["电子制造", "半导体"],
    object: "PCB焊点",
    image: IMAGE_XRAY,
    complexity: "较复杂",
    stepCount: 5,
    modelCount: 1,
    description: "适用于焊点虚焊、连锡、缺锡等缺陷识别；首版作为模板展示。",
    dataNeed: "清晰焊点图像；建议先由专家确认缺陷标签。",
    labels: ["虚焊", "连锡", "缺锡"],
    defaultSceneName: "PCB焊点缺陷检测",
    workflow: [],
  },
  {
    id: "ocr_code",
    name: "喷码/OCR识别检测",
    category: "OCR/字符识别",
    industries: ["包装印刷", "食品饮料", "医药制造"],
    object: "喷码、批号、标签",
    image: IMAGE_GAUZE,
    complexity: "中等",
    stepCount: 5,
    modelCount: 1,
    description: "适用于喷码有无、清晰度和字符识别；首版作为模板展示。",
    dataNeed: "包含喷码区域的图像；必要时先定位字符区域。",
    labels: ["喷码区域"],
    defaultSceneName: "喷码识别检测",
    workflow: [],
  },
  {
    id: "part_dimension",
    name: "零件尺寸测量检测",
    category: "尺寸/几何测量",
    industries: ["金属加工", "新能源电池"],
    object: "孔位、边缘、轮廓",
    image: IMAGE_CALIBRATION_BLOCK,
    complexity: "中等",
    stepCount: 5,
    modelCount: 0,
    description: "适用于孔径、间距、边缘距离等几何测量；后续将与尺寸工具联动。",
    dataNeed: "稳定采图和标定信息；需要配置测量元素。",
    labels: ["测量元素"],
    defaultSceneName: "零件尺寸测量检测",
    workflow: [],
  },
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
  ...PLATFORM_GEAR_ANGLES.flatMap((angle, index) => {
    const padded = String(angle).padStart(3, "0");
    return [
      { id: `img_gear_a_${padded}`, name: `示例-齿轮A_${padded}.jpg`, folderId: "dataset_gear_surface", url: IMAGE_GEAR, size: "1920 × 1200", device: "示例-齿轮A相机", tag: index < 4 ? "已确认" : "待确认", capturedAt: `2026-07-07T14:${String(18 + index).padStart(2, "0")}:07+08:00` },
      { id: `img_gear_b_${padded}`, name: `示例-齿轮B_${padded}.jpg`, folderId: "dataset_gear_surface", url: IMAGE_GEAR, size: "1920 × 1200", device: "示例-齿轮B相机", tag: angle === 90 ? "待复核" : index < 3 ? "已确认" : "待确认", capturedAt: `2026-07-07T14:${String(18 + index).padStart(2, "0")}:17+08:00` },
    ];
  }),
  { id: "img_backplate_upper", name: "示例-背板-上半面.jpg", folderId: "dataset_backplate_defect", url: IMAGE_BACKPLATE_UPPER, size: "1920 × 1200", device: "示例-背板相机", tag: "已确认", capturedAt: "2026-07-08T10:15:00+08:00", operatorAddedAt: "2026-07-08T10:16:00+08:00", feedbackType: "history" },
  { id: "img_backplate_lower", name: "示例-背板-下半面.jpg", folderId: "dataset_backplate_defect", url: IMAGE_BACKPLATE_LOWER, size: "1920 × 1200", device: "示例-背板相机", tag: "已确认", capturedAt: "2026-07-08T10:15:12+08:00", operatorAddedAt: "2026-07-08T10:16:12+08:00", feedbackType: "history" },
  { id: "img_backplate_upper_capture_01", name: "背板上半面_采图回流_0720.jpg", folderId: "dataset_backplate_defect", url: IMAGE_BACKPLATE_UPPER, size: "1920 × 1200", device: "背板A线客户端", tag: "", capturedAt: "2026-07-20T15:21:08+08:00", operatorAddedAt: "2026-07-20T15:21:18+08:00", feedbackType: "capture" },
  { id: "img_backplate_lower_capture_01", name: "背板下半面_采图回流_0720.jpg", folderId: "dataset_backplate_defect", url: IMAGE_BACKPLATE_LOWER, size: "1920 × 1200", device: "背板A线客户端", tag: "", capturedAt: "2026-07-20T15:21:16+08:00", operatorAddedAt: "2026-07-20T15:21:26+08:00", feedbackType: "capture" },
  { id: "img_backplate_upper_detect_01", name: "背板上半面_检测回流_0721.jpg", folderId: "dataset_backplate_defect", url: IMAGE_BACKPLATE_UPPER, size: "1920 × 1200", device: "背板A线检测工具", tag: "", capturedAt: "2026-07-21T09:42:03+08:00", operatorAddedAt: "2026-07-21T09:42:12+08:00", feedbackType: "inspection", predictionCount: 2 },
  { id: "img_backplate_lower_detect_01", name: "背板下半面_检测回流_0721.jpg", folderId: "dataset_backplate_defect", url: IMAGE_BACKPLATE_LOWER, size: "1920 × 1200", device: "背板A线检测工具", tag: "", capturedAt: "2026-07-21T09:42:11+08:00", operatorAddedAt: "2026-07-21T09:42:20+08:00", feedbackType: "inspection", predictionCount: 1 },
];

function buildSeedState() {
  const baseImages = SAMPLE_IMAGES.slice(0, 4).map((image) => image.id);
  const gearImages = PLATFORM_GEAR_SAMPLE_IDS;
  const gearSurfaceConfirmed = PLATFORM_GEAR_SAMPLE_IDS.slice(0, 7);
  const gearSurfaceReview = ["img_gear_b_090"];
  const gearBubbleSamples = PLATFORM_GEAR_SAMPLE_IDS.filter((id) => /_(060|090|120)/.test(id));
  return {
    version: 4,
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
        id: "model_gear_surface",
        name: "示例-齿轮齿面识别",
        sceneType: "目标检测",
        description: "来自客户端示例-齿轮工具，用于识别齿面区域并生成下游气泡检测样本。",
        createdAt: "2026-07-08T09:30:00+08:00",
        updatedAt: "2026-07-13T10:12:00+08:00",
      },
      {
        id: "model_gear_bubble",
        name: "示例-齿轮气泡检测",
        sceneType: "目标检测",
        description: "关联齿面裁剪派生数据集，持续优化气泡缺陷识别。",
        createdAt: "2026-07-08T10:00:00+08:00",
        updatedAt: "2026-07-13T10:00:00+08:00",
      },
      {
        id: "model_backplate_defect",
        name: "示例-背板缺陷检测",
        sceneType: "目标检测",
        description: "来自客户端示例-背板工具，覆盖上半面和下半面全图检测。",
        createdAt: "2026-07-08T11:00:00+08:00",
        updatedAt: "2026-07-13T11:00:00+08:00",
      },
      {
        id: "model_codex",
        name: "codex-test",
        sceneType: "目标检测",
        description: "旧平台算子样例，保留用于对比迁移前后流程。",
        createdAt: "2026-06-10T09:30:00+08:00",
        updatedAt: "2026-06-10T10:12:00+08:00",
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
      model_gear_surface: [],
      model_gear_bubble: [],
      model_backplate_defect: [],
    },
    datasets: [
      {
        id: "dataset_gear_surface",
        name: "示例-齿轮齿面识别数据集",
        taskType: "目标检测",
        source: "客户端示例-齿轮 12 个采图项回流",
        linkedModelId: "model_gear_surface",
        sampleIds: gearImages,
        pendingIds: gearImages.filter((id) => !gearSurfaceConfirmed.includes(id) && !gearSurfaceReview.includes(id)),
        confirmedIds: gearSurfaceConfirmed,
        reviewIds: gearSurfaceReview,
        excludedIds: [],
        versionIds: ["dsv_gear_surface_v1"],
        latestVersionId: "dsv_gear_surface_v1",
        updatedAt: "2026-07-13T10:00:00+08:00",
      },
      {
        id: "dataset_gear_bubble_crop",
        name: "示例-齿轮气泡检测派生数据集",
        taskType: "目标检测",
        source: "由示例-齿轮齿面识别算子 ROI 裁剪生成",
        linkedModelId: "model_gear_bubble",
        sampleIds: gearBubbleSamples,
        pendingIds: gearBubbleSamples.slice(3),
        confirmedIds: gearBubbleSamples.slice(0, 3),
        reviewIds: gearBubbleSamples.slice(3, 4),
        excludedIds: [],
        versionIds: ["dsv_gear_bubble_v1"],
        latestVersionId: "dsv_gear_bubble_v1",
        derivedFrom: { datasetId: "dataset_gear_surface", method: "算子推理 ROI", modelId: "model_gear_surface" },
        updatedAt: "2026-07-13T10:30:00+08:00",
      },
      {
        id: "dataset_backplate_defect",
        name: "示例-背板缺陷检测数据集",
        taskType: "目标检测",
        source: "客户端示例-背板上下半面采图回流",
        linkedModelId: "model_backplate_defect",
        sampleIds: PLATFORM_BACKPLATE_SAMPLE_IDS,
        pendingIds: PLATFORM_BACKPLATE_SAMPLE_IDS.filter((id) => !PLATFORM_BACKPLATE_VERSION_V1_IDS.includes(id)),
        confirmedIds: PLATFORM_BACKPLATE_VERSION_V1_IDS,
        reviewIds: [],
        excludedIds: [],
        versionIds: ["dsv_backplate_v2", "dsv_backplate_v1"],
        latestVersionId: "dsv_backplate_v2",
        updatedAt: "2026-07-13T11:00:00+08:00",
      },
      {
        id: "dataset_codex",
        name: "codex-test-data",
        taskType: "目标检测",
        source: "旧图像库文件夹升级",
        linkedModelId: "model_codex",
        sampleIds: baseImages,
        pendingIds: ["img_03", "img_04"],
        confirmedIds: ["img_01", "img_02"],
        reviewIds: [],
        excludedIds: [],
        versionIds: ["dsv_codex_v1"],
        latestVersionId: "dsv_codex_v1",
        updatedAt: "2026-06-10T18:00:00+08:00",
      },
    ],
    datasetVersions: [
      { id: "dsv_gear_surface_v1", datasetId: "dataset_gear_surface", name: "示例-齿轮齿面识别数据集 v1", sampleCount: 7, annotationCount: 7, qualityScore: 86, createdAt: "2026-07-12T18:30:00+08:00" },
      { id: "dsv_gear_bubble_v1", datasetId: "dataset_gear_bubble_crop", name: "示例-齿轮气泡检测派生数据集 v1", sampleCount: 3, annotationCount: 3, qualityScore: 82, createdAt: "2026-07-13T09:30:00+08:00" },
      { id: "dsv_backplate_v1", datasetId: "dataset_backplate_defect", name: "示例-背板外观缺陷检测数据集 v1", sampleCount: 2, annotationCount: 4, qualityScore: 84, status: "已发布", publishedAt: "2026-07-13T11:36:00+08:00", createdAt: "2026-07-13T11:30:00+08:00", sampleIds: PLATFORM_BACKPLATE_VERSION_V1_IDS, confirmedIds: PLATFORM_BACKPLATE_VERSION_V1_IDS, pendingIds: [], reviewIds: [], annotationSummary: [{ label: "划伤", count: 2 }, { label: "压伤", count: 1 }, { label: "脏污", count: 1 }] },
      { id: "dsv_backplate_v2", datasetId: "dataset_backplate_defect", name: "示例-背板外观缺陷检测数据集 v2", sampleCount: 6, annotationCount: 4, qualityScore: null, status: "草稿", createdAt: "2026-07-21T10:05:00+08:00", sampleIds: PLATFORM_BACKPLATE_SAMPLE_IDS, confirmedIds: PLATFORM_BACKPLATE_VERSION_V1_IDS, pendingIds: PLATFORM_BACKPLATE_SAMPLE_IDS.filter((id) => !PLATFORM_BACKPLATE_VERSION_V1_IDS.includes(id)), reviewIds: [], annotationSummary: [{ label: "划伤", count: 2 }, { label: "压伤", count: 1 }, { label: "脏污", count: 1 }], split: { train: 4, val: 1, test: 1 } },
      { id: "dsv_codex_v1", datasetId: "dataset_codex", name: "codex-test-data v1", sampleCount: 4, annotationCount: 2, qualityScore: 78, createdAt: "2026-06-10T10:10:00+08:00" },
    ],
    modelVersions: [
      { id: "mv_gear_surface_v1", modelId: "model_gear_surface", version: "v1", datasetVersionId: "dsv_gear_surface_v1", status: "训练完成", sampleCount: 7, createdAt: "2026-07-13T09:42:00+08:00", metrics: { precision: 93, recall: 88, falseAlarm: 2.6 }, recommended: true },
      { id: "mv_gear_bubble_v1", modelId: "model_gear_bubble", version: "v1", datasetVersionId: "dsv_gear_bubble_v1", status: "训练完成", sampleCount: 3, createdAt: "2026-07-13T10:42:00+08:00", metrics: { precision: 91, recall: 84, falseAlarm: 3.8 }, recommended: true },
      { id: "mv_backplate_v1", modelId: "model_backplate_defect", version: "v1", datasetVersionId: "dsv_backplate_v1", status: "训练完成", sampleCount: 2, createdAt: "2026-07-13T11:42:00+08:00", metrics: { precision: 90, recall: 83, falseAlarm: 3.9 }, recommended: true },
      { id: "mv_codex_v1", modelId: "model_codex", version: "v1", datasetVersionId: "dsv_codex_v1", status: "训练完成", sampleCount: 4, createdAt: "2026-06-10T11:03:46+08:00", metrics: { precision: 89, recall: 81, falseAlarm: 5.2 }, recommended: true },
    ],
    scenes: [
      {
        id: "scene_gear_trial",
        templateId: "gear_surface_defect",
        name: "齿轮A线气泡/划痕检测",
        status: "搭建中",
        currentStepIndex: 1,
        datasetIds: ["dataset_gear_surface"],
        modelIds: [],
        inputs: { objectName: "齿轮", targets: ["气泡", "划痕"], imageSource: "客户端回流" },
        createdAt: "2026-07-14T09:30:00+08:00",
        updatedAt: "2026-07-14T10:10:00+08:00",
      },
      {
        id: "scene_backplate_done",
        templateId: "backplate_surface_defect",
        name: "背板外观缺陷检测",
        status: "训练完成",
        currentStepIndex: 4,
        datasetIds: ["dataset_backplate_defect"],
        modelIds: ["model_backplate_defect"],
        inputs: { objectName: "背板", targets: ["划伤", "压伤", "脏污"], imageSource: "客户端示例-背板相机回流" },
        createdAt: "2026-07-13T09:00:00+08:00",
        updatedAt: "2026-07-13T11:42:00+08:00",
      },
    ],
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
let operatorSplitResizeSession = null;
let operatorSamplePanelJustOpened = false;

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
  els.main.addEventListener("pointerdown", handleOperatorSplitPointerDown);
  window.addEventListener("pointermove", handleOperatorSplitPointerMove);
  window.addEventListener("pointerup", handleOperatorSplitPointerUp);
  window.addEventListener("pointercancel", handleOperatorSplitPointerUp);
  els.sidebar.addEventListener("click", handleClick);
  modalRoot.addEventListener("click", handleModalClick);
  modalRoot.addEventListener("input", handleModalInput);
  modalRoot.addEventListener("change", handleModalChange);
  demoController.addEventListener("click", handleDemoClick);
  demoController.addEventListener("input", handleDemoChange);
  demoController.addEventListener("change", handleDemoChange);
  window.addEventListener("storage", handleClientDataStorageChange);
  render();
}

function handleClientDataStorageChange(event) {
  if (![CLIENT_CLOUD_SYNC_QUEUE_KEY, CLIENT_DATA_RETURN_QUEUE_KEY].includes(event.key)) return;
  const beforeImageCount = state.images.length;
  applyClientCloudSyncQueue(state);
  applyClientDataReturnQueue(state);
  if (state.images.length !== beforeImageCount) {
    showToast(`已接收客户端回流数据，新增 ${state.images.length - beforeImageCount} 张图像`);
    render();
  }
}

function handleClick(event) {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) {
    const modelRow = event.target.closest(".model-main-row[data-model-id]");
    if (modelRow) return toggleModelVersions(modelRow.dataset.modelId || "");
    return;
  }
  const action = actionEl.dataset.action;
  const id = actionEl.dataset.id || "";

  if (action === "set-view") return setView(id);
  if (action === "set-scene-tab") {
    ui.sceneTab = id || "templates";
    return setView("scenes");
  }
  if (action === "open-scene-template") {
    ui.selectedSceneTemplateId = id;
    return openSceneTemplateModal(id);
  }
  if (action === "open-scene-template-modal") return openSceneTemplateModal(id);
  if (action === "create-scene-from-template") return createSceneFromTemplate(id);
  if (action === "open-scene") {
    ui.selectedSceneId = id;
    return setView("scene-detail");
  }
  if (action === "reset-model-filter") {
    ui.modelScene = "all";
    ui.modelQuery = "";
    return render();
  }
  if (action === "search-models") return render();
  if (action === "search-operator-pool") {
    ui.operatorPoolScrollTop = 0;
    saveUi();
    return render();
  }
  if (action === "reset-operator-pool") {
    ui.operatorPoolQuery = "";
    ui.operatorPoolSource = "all";
    ui.operatorDataStatus = "all";
    ui.operatorPoolScrollTop = 0;
    saveUi();
    return render();
  }
  if (action === "operator-add-library-images") return openOperatorImagePicker(id || ui.selectedModelId);
  if (action === "new-model") return openModelModal();
  if (action === "edit-model") return openModelModal(id);
  if (action === "delete-model") return deleteModel(id);
  if (action === "training-records") {
    ui.selectedModelId = id || ui.selectedModelId;
    return setView("operator-detail");
  }
  if (action === "toggle-model-versions") {
    return toggleModelVersions(id);
  }
  if (action === "toggle-operator-version") {
    const operator = getSelectedOperator();
    const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
    const latestVersionId = dataset ? getDatasetVersions(dataset.id)[0]?.id || "" : "";
    const currentExpandedId = ui.operatorVersionExpansionTouched ? ui.expandedOperatorVersionId : latestVersionId;
    ui.expandedOperatorVersionId = currentExpandedId === id ? "" : id;
    ui.operatorVersionExpansionTouched = true;
    saveUi();
    return render();
  }
  if (action === "operator-version-detail-tab") {
    if (!ui.operatorVersionDetailTabs || typeof ui.operatorVersionDetailTabs !== "object") ui.operatorVersionDetailTabs = {};
    ui.operatorVersionDetailTabs[id] = actionEl.dataset.tab || "data";
    ui.expandedOperatorVersionId = id;
    ui.operatorVersionExpansionTouched = true;
    saveUi();
    return render();
  }
  if (action === "train-operator-version") return openTrainModelModal(id);
  if (action === "open-operator-version-list") return openOperatorVersionListModal(id);
  if (action === "prepare-operator-new-version") return prepareOperatorNewVersion(id);
  if (action === "set-operator-data-filter") {
    ui.operatorDataVersionId = id || "all";
    ui.operatorDataSplit = actionEl.dataset.split || "all";
    saveUi();
    return render();
  }
  if (action === "operator-sample-view-mode") {
    ui.operatorDataViewMode = id || "overview";
    saveUi();
    return render();
  }
  if (action === "toggle-operator-annotation-version") {
    toggleOperatorAnnotationVersion(id);
    return render();
  }
  if (action === "select-operator-sample") {
    ui.operatorDataActiveImageId = id;
    ui.operatorDataViewMode = "detail";
    saveUi();
    return render();
  }
  if (action === "step-operator-sample") return stepOperatorSample(Number(actionEl.dataset.direction || 1));
  if (action === "open-operator-sample-drawer") {
    ui.operatorPoolScrollTop = els.main.querySelector(".operator-pool-timeline")?.scrollTop || ui.operatorPoolScrollTop || 0;
    ui.operatorDataActiveImageId = id;
    if (els.main.querySelector(".operator-sample-panel")) {
      saveUi();
      return refreshOperatorSamplePanel();
    }
    saveUi();
    return render();
  }
  if (action === "toggle-operator-predictions") {
    ui.operatorShowPredictions = ui.operatorShowPredictions === false;
    saveUi();
    return refreshOperatorSamplePanel();
  }
  if (action === "step-operator-sample-drawer") return stepOperatorPoolDrawer(Number(actionEl.dataset.direction || 1));
  if (action === "open-version-preannotation") return openVersionPreannotationModal();
  if (action === "model-more") {
    ui.openModelMenu = ui.openModelMenu === id ? "" : id;
    saveUi();
    return render();
  }
  if (action === "open-dataset-version") return openDatasetVersion(id);
  if (action === "delete-model-version") return deleteModelVersion(id);
  if (action === "test-model-version") return showToast("Demo 中可在客户端联调或算子测试页验证该版本");
  if (action === "download-model-version") return showToast("已模拟生成算子版本下载文件");
  if (action === "new-training") return openTrainModelModal();
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
  if (action === "open-public-folder") {
    ui.selectedFolderId = id;
    ui.libraryQuery = "";
    ui.libraryDevice = "all";
    librarySelection = new Set();
    return setView("public-data-folder");
  }
  if (action === "back-public-data") {
    ui.selectedFolderId = "";
    ui.libraryQuery = "";
    ui.libraryDevice = "all";
    librarySelection = new Set();
    return setView("public-data");
  }
  if (action === "dataset-detail-tab") {
    ui.datasetDetailTab = id || "pool";
    librarySelection = new Set();
    saveUi();
    return render();
  }
  if (action === "open-library-folder") {
    ui.selectedDatasetId = id;
    ui.selectedFolderId = id;
    ui.libraryQuery = "";
    ui.datasetDetailTab = "pool";
    librarySelection = new Set();
    const linkedModel = getDatasetLinkedModels(id)[0] || state.models.find((model) => model.linkedDatasetId === id);
    if (linkedModel) ui.selectedModelId = linkedModel.id;
    return linkedModel ? setView("operator-detail") : setView("public-data");
  }
  if (action === "open-dataset-versions") {
    ui.selectedDatasetId = id;
    ui.selectedFolderId = id;
    ui.libraryQuery = "";
    ui.datasetDetailTab = "versions";
    librarySelection = new Set();
    const linkedModel = getDatasetLinkedModels(id)[0] || state.models.find((model) => model.linkedDatasetId === id);
    if (linkedModel) ui.selectedModelId = linkedModel.id;
    return linkedModel ? setView("operator-detail") : setView("public-data");
  }
  if (action === "back-library") {
    ui.selectedDatasetId = "";
    ui.selectedFolderId = "";
    librarySelection = new Set();
    return setView("public-data");
  }
  if (action === "dataset-annotate") {
    ui.selectedDatasetId = id || ui.selectedDatasetId;
    ui.activeImageId = "";
    return setView("dataset-annotation");
  }
  if (action === "dataset-quality") {
    ui.selectedDatasetId = id || ui.selectedDatasetId;
    return setView("dataset-quality");
  }
  if (action === "dataset-derive") {
    ui.selectedDatasetId = id || ui.selectedDatasetId;
    return setView("dataset-derive");
  }
  if (action === "dataset-version") return openDatasetVersionCreateModal(id || ui.selectedDatasetId);
  if (action === "annotate-dataset-version") {
    return openDatasetVersionAnnotation(id);
  }
  if (action === "evaluate-dataset-version") return evaluateDatasetVersion(id);
  if (action === "show-dataset-version-quality") return openDatasetVersionQuality(id);
  if (action === "publish-dataset-version") return publishDatasetVersion(id);
  if (action === "train-dataset") return createModelVersionFromDataset(id || ui.selectedDatasetId);
  if (action === "select-dataset-sample") {
    ui.activeImageId = id;
    return render();
  }
  if (action === "select-dataset-annotation-tab") {
    ui.datasetAnnotationStatus = id || "pending";
    if (ui.datasetAnnotationStatus !== "annotated") ui.datasetAnnotationSplit = "all";
    ui.activeImageId = "";
    saveUi();
    return render();
  }
  if (action === "select-dataset-annotation-split") {
    ui.datasetAnnotationSplit = id || "all";
    ui.activeImageId = "";
    saveUi();
    return render();
  }
  if (action === "toggle-dataset-annotation-source") {
    const collapsed = new Set(ui.datasetAnnotationCollapsedSources || []);
    if (collapsed.has(id)) collapsed.delete(id);
    else collapsed.add(id);
    ui.datasetAnnotationCollapsedSources = Array.from(collapsed);
    saveUi();
    return render();
  }
  if (action === "confirm-assist") return confirmDatasetSample(ui.activeImageId);
  if (action === "complete-sample-next") return completeDatasetSampleAndNext();
  if (action === "train-annotated-version") return trainAnnotatedOperatorVersion(id);
  if (action === "mark-review") return markDatasetSampleForReview(ui.activeImageId);
  if (action === "exclude-sample") return excludeDatasetSample(ui.activeImageId);
  if (action === "derive-model-roi") return createDerivedDataset("算子推理 ROI");
  if (action === "derive-manual-roi") return createDerivedDataset("人工绘制 ROI");
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
  if (action === "back-models") return setView("operators");
  if (action === "back-records") return setView("operator-detail");
  if (action === "noop") return;
}

function handleOperatorSplitPointerDown(event) {
  const resizer = event.target.closest("[data-operator-split-resizer]");
  if (!resizer) return;
  const split = resizer.closest(".operator-pool-split");
  if (!split) return;
  event.preventDefault();
  resizer.setPointerCapture?.(event.pointerId);
  operatorSplitResizeSession = {
    split,
    pointerId: event.pointerId,
    startX: event.clientX,
    startWidth: split.querySelector(".operator-sample-panel")?.getBoundingClientRect().width || Number(ui.operatorSamplePanelWidth || 520),
  };
  split.classList.add("is-resizing");
}

function handleOperatorSplitPointerMove(event) {
  if (!operatorSplitResizeSession || event.pointerId !== operatorSplitResizeSession.pointerId) return;
  const { split, startX, startWidth } = operatorSplitResizeSession;
  const splitWidth = split.getBoundingClientRect().width;
  const minDetailWidth = Math.min(360, Math.max(280, splitWidth * 0.38));
  const maxDetailWidth = Math.max(minDetailWidth, splitWidth - Math.min(420, splitWidth * 0.46));
  const nextWidth = Math.round(clamp(startWidth + startX - event.clientX, minDetailWidth, maxDetailWidth));
  split.style.setProperty("--operator-sample-panel-width", `${nextWidth}px`);
  operatorSplitResizeSession.nextWidth = nextWidth;
}

function handleOperatorSplitPointerUp(event) {
  if (!operatorSplitResizeSession || event.pointerId !== operatorSplitResizeSession.pointerId) return;
  const { split, nextWidth, startWidth } = operatorSplitResizeSession;
  split.classList.remove("is-resizing");
  ui.operatorSamplePanelWidth = nextWidth || Math.round(startWidth);
  operatorSplitResizeSession = null;
  saveUi();
}

function handleInput(event) {
  if (event.target.id === "modelQueryInput") {
    ui.modelQuery = event.target.value;
  }
  if (event.target.id === "datasetAnnotationQueryInput") {
    ui.datasetAnnotationQuery = event.target.value;
    render();
  }
  if (event.target.id === "libraryQueryInput") {
    ui.libraryQuery = event.target.value;
  }
  if (event.target.id === "clientQueryInput") {
    ui.clientQuery = event.target.value;
  }
  if (event.target.id === "operatorPoolQueryInput") {
    ui.operatorPoolQuery = event.target.value;
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
  if (event.target.id === "operatorDataStatusSelect") {
    ui.operatorDataStatus = event.target.value;
    saveUi();
    render();
  }
  if (event.target.id === "operatorPoolSourceSelect") {
    ui.operatorPoolSource = event.target.value;
    saveUi();
    render();
  }
  if (event.target.id === "sceneCategorySelect") {
    ui.sceneCategory = event.target.value;
    render();
  }
  if (event.target.id === "sceneIndustrySelect") {
    ui.sceneIndustry = event.target.value;
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
  if (action === "confirm-train-model") return confirmTrainModelFromModal();
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
  if (action === "select-train-dataset") {
    modal.datasetId = actionEl.dataset.id;
    const publishedVersion = getDatasetVersions(modal.datasetId).find((version) => getDatasetVersionStatus(version) === "已发布");
    modal.datasetVersionId = publishedVersion?.id || "";
    return renderModal();
  }
  if (action === "select-train-version") {
    modal.datasetVersionId = actionEl.dataset.id;
    return renderModal();
  }
  if (action === "save-label") return saveLabelFromModal();
  if (action === "save-folder") return saveFolderFromModal();
  if (action === "create-dataset-version") return confirmCreateDatasetVersion();
  if (action === "confirm-upload") return confirmLibraryUpload();
  if (action === "export-detail-image") return exportLibraryImages([modal.imageId]);
  if (action === "save-detail-tag") return saveDetailImageTag();
  if (action === "add-library-tag") return addLibraryTag();
  if (action === "delete-library-tag") return deleteLibraryTag(actionEl.dataset.id);
  if (action === "confirm-assign-tag") return assignLibraryTag();
  if (action === "confirm-version-preannotation") return confirmVersionPreannotation();
  if (action === "create-scene-from-template") {
    const templateId = actionEl.dataset.id || modal?.templateId || "";
    modal = null;
    return createSceneFromTemplate(templateId);
  }
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
  if (event.target.id === "modalTrainDatasetSelect" && modal?.type === "train-model") {
    modal.datasetId = event.target.value;
    const publishedVersion = getDatasetVersions(modal.datasetId).find((version) => getDatasetVersionStatus(version) === "已发布");
    modal.datasetVersionId = publishedVersion?.id || "";
    return renderModal();
  }
  if (event.target.id === "modalTrainVersionSelect" && modal?.type === "train-model") {
    modal.datasetVersionId = event.target.value;
  }
  if (event.target.name === "modalDatasetVersionSource" && modal?.type === "create-dataset-version") {
    modal.sourceMode = event.target.value;
    if (modal.sourceMode === "latest") {
      modal.sourceVersionId = getDatasetVersions(modal.datasetId)[0]?.id || "";
    }
    return renderModal();
  }
  if (event.target.id === "modalDatasetVersionSourceId" && modal?.type === "create-dataset-version") {
    modal.sourceVersionId = event.target.value;
  }
  if (event.target.id === "modalDatasetVersionPoolScope" && modal?.type === "create-dataset-version") {
    modal.poolScope = event.target.value;
  }
  if (event.target.name === "modalModelScene" && modal?.type === "model") {
    modalRoot.querySelectorAll(".algorithm-radio").forEach((item) => {
      const input = item.querySelector("input");
      item.classList.toggle("is-selected", Boolean(input?.checked));
    });
  }
  if (event.target.name === "modalDatasetAlgorithm" && modal?.type === "folder") {
    modalRoot.querySelectorAll(".algorithm-radio").forEach((item) => {
      const input = item.querySelector("input");
      item.classList.toggle("is-selected", Boolean(input?.checked));
    });
  }
}

function handleModalInput(event) {
  if (event.target.id === "pickerQueryInput" && modal?.type === "picker") {
    modal.query = event.target.value;
  }
  if (event.target.id === "modalDatasetVersionName" && modal?.type === "create-dataset-version") {
    modal.name = event.target.value;
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
  ui.openModelMenu = "";
  ui.accountMenuOpen = false;
  saveUi();
  render();
}

function render() {
  const topView = normalizeTopView(ui.view);
  els.navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.view === topView));
  els.main.classList.toggle("is-annotation-view", ui.view === "model-training-workspace" || ui.view === "dataset-annotation");
  els.main.classList.toggle("is-operator-detail-view", ui.view === "operator-detail" || ui.view === "model-training-records" || ui.view === "library-folder");
  renderSidebar(topView);
  if (ui.view === "home") renderHome();
  else if (ui.view === "scenes") renderScenes();
  else if (ui.view === "scene-template-detail") renderSceneTemplateDetail();
  else if (ui.view === "scene-detail") renderSceneDetail();
  else if (ui.view === "operators" || ui.view === "models") renderOperators();
  else if (ui.view === "operator-detail" || ui.view === "model-training-records") renderOperatorDetail();
  else if (ui.view === "model-training-workspace") renderTrainingWorkspace();
  else if (ui.view === "model-test") renderTestWorkspace();
  else if (ui.view === "public-data" || ui.view === "library") renderPublicData();
  else if (ui.view === "public-data-folder") renderPublicDataFolder();
  else if (ui.view === "library-folder") renderOperatorDetail();
  else if (ui.view === "dataset-annotation") renderDatasetAnnotation();
  else if (ui.view === "dataset-quality") renderDatasetQuality();
  else if (ui.view === "dataset-derive") renderDatasetDerive();
  else if (ui.view === "clients") renderClients();
  else if (ui.view === "user-center") renderUserCenter();
  else setView("operators");
  renderAccountMenu();
  renderModal();
  renderDemoController();
  saveUi();
}

function normalizeTopView(view) {
  if (view.startsWith("scene")) return "scenes";
  if (view === "dataset-annotation") return "operators";
  if (view === "operators" || view.startsWith("operator-") || view.startsWith("model-")) return "operators";
  if (view === "public-data" || view === "public-data-folder" || view.startsWith("dataset-") || view.startsWith("library-")) return "public-data";
  if (view === "user-center") return "user-center";
  return view;
}

function renderSidebar(topView) {
  els.sidebar.hidden = true;
  els.sidebar.innerHTML = "";
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
          <span>2步完成算子定制，小白也能轻松上手~</span>
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
    hand: '<path d="M8 12V7a2 2 0 1 1 4 0v4M12 11V5a2 2 0 1 1 4 0v7M16 12V8a2 2 0 1 1 4 0v6c0 4-2.5 7-7 7h-1a6 6 0 0 1-5-3L4 13a2 2 0 0 1 3.5-2L9 13"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    box: '<rect x="4" y="5" width="16" height="14" rx="1"/>',
    stamp: '<path d="M9 4h6v5l2 3v3H7v-3l2-3z"/><path d="M5 20h14M7 15h10"/>',
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

function renderScenes() {
  const tab = ui.sceneTab || "templates";
  if (tab === "mine") return renderMyScenes();
  return renderSceneTemplates();
}

function renderSceneTabs() {
  const tab = ui.sceneTab || "templates";
  return `
    <div class="scene-tabs">
      <button class="${tab === "templates" ? "is-active" : ""}" data-action="set-scene-tab" data-id="templates">场景模板</button>
      <button class="${tab === "mine" ? "is-active" : ""}" data-action="set-scene-tab" data-id="mine">我的场景</button>
    </div>
  `;
}

function renderSceneTemplates() {
  ui.sceneTab = "templates";
  const filteredTemplates = getActiveSceneTemplates();
  els.main.innerHTML = `
    <section class="platform-table-page scene-page">
      <div class="scene-sticky-head">
        <div class="scene-page-head">
          <div class="scene-title-group">
            <h1>场景库</h1>
            ${renderSceneTabs()}
          </div>
          <p class="scene-page-subtitle">先只开放两个模板：复杂的“两段式齿轮检测”和简单的“单算子背板检测”。模板用于创建完整客户端检测场景，不替代算子自己的样本池和训练入口。</p>
        </div>
      </div>
      ${
        filteredTemplates.length
          ? `<div class="scene-template-grid">${filteredTemplates.map(renderSceneTemplateCard).join("")}</div>`
          : `<div class="empty-state"><strong>暂无匹配场景模板</strong><span>可以调整检测任务或行业筛选。</span></div>`
      }
    </section>
  `;
}

function getActiveSceneTemplates() {
  return SCENE_TEMPLATES.filter((template) => ACTIVE_SCENE_TEMPLATE_IDS.includes(template.id));
}

function renderSceneTemplateCard(template) {
  const nodes = getSceneOperatorBlueprints(template.id);
  return `
    <article class="scene-template-card" data-action="open-scene-template-modal" data-id="${escapeAttr(template.id)}" tabindex="0" role="button" aria-label="查看${escapeAttr(template.name)}模板">
      <div class="scene-template-cover">
        <img src="${escapeAttr(template.image || IMAGE_CALIBRATION_BOARD)}" alt="${escapeAttr(template.name)}示意图" />
        <span>${escapeHtml(template.object)}</span>
      </div>
      <div class="scene-card-top">
        <span>${escapeHtml(template.category)}</span>
        <em>${escapeHtml(template.complexity)}</em>
      </div>
      <h2>${escapeHtml(template.name)}</h2>
      <p>${escapeHtml(template.useCase || template.description)}</p>
      <dl>
        <div><dt>什么时候用</dt><dd>${nodes.length > 1 ? "多算子串联" : "单算子标准场景"}</dd></div>
        <div><dt>理想结果</dt><dd>${nodes.length || template.modelCount || "待定"} 个节点 · 客户端可拉取</dd></div>
      </dl>
      <div class="scene-card-tags">
        ${template.labels.slice(0, 4).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderMyScenes() {
  ui.sceneTab = "mine";
  const scenes = getScenes().filter((scene) => ACTIVE_SCENE_TEMPLATE_IDS.includes(scene.templateId));
  els.main.innerHTML = `
    <section class="platform-table-page scene-page">
      <div class="scene-page-head">
        <div class="scene-title-group">
          <h1>场景库</h1>
          ${renderSceneTabs()}
        </div>
      </div>
      ${
        scenes.length
          ? `<div class="scene-instance-grid">${scenes.map(renderSceneInstanceCard).join("")}</div>`
          : `<div class="empty-state"><strong>暂无已创建场景</strong><span>可以先从场景模板创建一个客户端三步工具结构。</span></div>`
      }
    </section>
  `;
}

function renderSceneInstanceCard(scene) {
  const template = getSceneTemplate(scene.templateId);
  const nodes = getSceneOperatorNodes(scene);
  const configuredCount = nodes.filter((node) => node.operator).length;
  const defaultWeightCount = nodes.filter((node) => getOperatorDefaultWeight(node.operator)).length;
  const progress = nodes.length ? Math.round(configuredCount / nodes.length * 100) : 0;
  const deploymentStatus = getSceneDeploymentStatus(scene, nodes);
  return `
    <article class="scene-instance-card">
      <div class="scene-card-top">
        <span>${escapeHtml(deploymentStatus)}</span>
        <em>${escapeHtml(template?.category || "自定义场景")}</em>
      </div>
      <h2>${escapeHtml(scene.name)}</h2>
      <p>来源模板：${escapeHtml(template?.name || "未知模板")}</p>
      <div class="scene-progress">
        <b style="width:${progress}%"></b>
      </div>
      <dl>
        <div><dt>算子节点</dt><dd>${nodes.length || 0} 个</dd></div>
        <div><dt>已配置</dt><dd>${configuredCount} / ${nodes.length || 0}</dd></div>
        <div><dt>默认使用</dt><dd>${defaultWeightCount} / ${nodes.length || 0}</dd></div>
        <div><dt>更新</dt><dd>${formatDateTime(scene.updatedAt)}</dd></div>
      </dl>
      <button class="primary-btn" data-action="open-scene" data-id="${escapeAttr(scene.id)}">配置场景</button>
    </article>
  `;
}

function extractVersionLabel(name) {
  const matched = String(name || "").match(/\bv\d+\b/i);
  return matched ? matched[0] : name || "版本";
}

function getSceneOperatorBlueprints(templateId) {
  const blueprints = {
    gear_surface_defect: [
      { id: "gear-roi", role: "齿面定位", type: "目标检测", operatorId: "model_gear_surface", input: "完整齿轮图像", output: "齿面 ROI" },
      { id: "gear-defect", role: "气泡/划痕检测", type: "目标检测", operatorId: "model_gear_bubble", input: "齿面裁剪图", output: "缺陷框" },
    ],
    backplate_surface_defect: [
      { id: "backplate-defect", role: "背板外观缺陷检测", type: "目标检测", operatorId: "model_backplate_defect", input: "背板上/下半面图像", output: "缺陷框" },
    ],
    assembly_presence: [
      { id: "assembly-presence", role: "装配完整性检测", type: "目标检测", operatorId: "", input: "装配后产品图像", output: "零件框 / 缺失判断" },
    ],
    pcb_solder_defect: [
      { id: "pcb-solder", role: "焊点缺陷检测", type: "目标检测", operatorId: "", input: "PCB 焊点图像", output: "缺陷框" },
    ],
    ocr_code: [
      { id: "ocr-code", role: "喷码/OCR识别", type: "字符识别 OCR", operatorId: "", input: "喷码区域图像", output: "字符结果" },
    ],
    gauze_defect: [
      { id: "gauze-defect", role: "纱布异物检测", type: "目标检测", operatorId: "", input: "纱布表面图像", output: "异物框" },
    ],
  };
  const template = getSceneTemplate(templateId);
  const fallbackCount = Math.max(Number(template?.modelCount || 1), 1);
  return (blueprints[templateId] || Array.from({ length: fallbackCount }, (_, index) => ({
    id: `${templateId || "scene"}-node-${index + 1}`,
    role: index === 0 ? `${template?.object || "检测对象"}检测` : `算子节点 ${index + 1}`,
    type: template?.category || "目标检测",
    operatorId: "",
    input: index === 0 ? "图像输入" : "上游节点输出",
    output: "检测结果",
  }))).map((node) => ({ ...node }));
}

function getSceneOperatorNodes(sceneOrTemplate) {
  const templateId = sceneOrTemplate?.templateId || sceneOrTemplate?.id || "";
  const blueprints = getSceneOperatorBlueprints(templateId);
  const explicitNodes = Array.isArray(sceneOrTemplate?.operatorNodes) ? sceneOrTemplate.operatorNodes : [];
  const sceneModelIds = Array.isArray(sceneOrTemplate?.modelIds) ? sceneOrTemplate.modelIds : [];
  return blueprints.map((blueprint, index) => {
    const explicit = explicitNodes[index] || {};
    const operatorId = explicit.operatorId || sceneModelIds[index] || "";
    const operator = operatorId ? getModelById(operatorId) : null;
    const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
    const sampleStats = dataset ? getDatasetStats(dataset) : null;
    return {
      ...blueprint,
      ...explicit,
      operatorId,
      operator,
      dataset,
      sampleStats,
      status: getSceneOperatorNodeStatus(operator, dataset),
    };
  });
}

function getSceneToolSteps(sceneOrTemplate, nodes = getSceneOperatorNodes(sceneOrTemplate)) {
  const templateId = sceneOrTemplate?.templateId || sceneOrTemplate?.id || "";
  const template = getSceneTemplate(templateId);
  const imageSource = sceneOrTemplate?.inputs?.imageSource || (templateId === "gear_surface_defect" ? "齿轮相机 / 图像上传" : "背板相机 / 图像上传");
  if (templateId === "gear_surface_defect") {
    return [
      { id: "acquire", title: "图像获取", description: imageSource, mode: "客户端固定步骤", node: null },
      { id: "process", title: "图像处理", description: "定位齿面 ROI，并输出裁剪区域给检测步。", mode: "算子槽位", node: nodes[0] || null },
      { id: "detect", title: "图像检测", description: "在齿面裁剪图中检测气泡、划痕等缺陷。", mode: "算子槽位", node: nodes[1] || null },
    ];
  }
  return [
    { id: "acquire", title: "图像获取", description: imageSource, mode: "客户端固定步骤", node: null },
    { id: "process", title: "图像处理", description: "无额外处理，保留客户端基础预处理。", mode: "固定配置", node: null },
    { id: "detect", title: "图像检测", description: `${template?.object || "目标"}外观缺陷检测。`, mode: "算子槽位", node: nodes[0] || null },
  ];
}

function getSceneOperatorNodeStatus(operator, dataset) {
  if (!operator) return "未配置";
  if (!dataset || !(dataset.sampleIds || []).length) return "待准备样本";
  const stats = getDatasetStats(dataset);
  if (stats.review > 0) return "待确认";
  if (stats.confirmed > 0) return "已标注";
  return "未标注";
}

function getOperatorDefaultWeight(operator) {
  if (!operator) return null;
  return getModelVersions(operator.id).find((version) => version.recommended) || getModelVersions(operator.id)[0] || null;
}

function getSceneDeploymentStatus(scene, nodes = getSceneOperatorNodes(scene)) {
  if (!nodes.length) return "待配置";
  const configured = nodes.filter((node) => node.operator).length;
  if (!configured) return "待配置";
  if (configured < nodes.length) return "配置中";
  return nodes.every((node) => getOperatorDefaultWeight(node.operator)) ? "可发布" : "待确认权重";
}

function renderSceneOperatorPipeline(nodes, options = {}) {
  if (!nodes.length) return `<div class="empty-state"><strong>暂无算子节点</strong><span>该模板的算子编排暂未开放。</span></div>`;
  return `<div class="scene-operator-pipeline ${options.compact ? "is-compact" : ""}">
    ${nodes.map((node, index) => `${index ? `<div class="scene-pipeline-connector"><span>${escapeHtml(nodes[index - 1].output || "输出")} → ${escapeHtml(node.input || "输入")}</span></div>` : ""}${renderSceneOperatorNodeCard(node, options)}`).join("")}
  </div>`;
}

function renderSceneToolStructure(steps, options = {}) {
  return `<div class="scene-tool-steps">
    ${steps.map((step, index) => `${index ? '<div class="scene-tool-step-arrow">→</div>' : ""}${renderSceneToolStepCard(step, options)}`).join("")}
  </div>`;
}

function renderSceneToolStepCard(step, options = {}) {
  const node = step.node;
  return `<article class="scene-tool-step-card ${node ? "has-node" : ""}">
    <div class="scene-node-head">
      <span>${escapeHtml(step.mode)}</span>
      <em>${node ? escapeHtml(node.status || "未配置") : "固定"}</em>
    </div>
    <h3>${escapeHtml(step.title)}</h3>
    <p>${escapeHtml(step.description || "")}</p>
    ${node ? renderSceneOperatorNodeCard(node, options) : ""}
  </article>`;
}

function renderSceneOperatorNodeCard(node, options = {}) {
  const operator = node.operator;
  const defaultWeight = getOperatorDefaultWeight(operator);
  const stats = node.sampleStats;
  const editableVersion = node.dataset ? getEditableTrainingDataVersion(node.dataset) : null;
  const actions = options.readonly
    ? ""
    : `<div class="scene-node-actions">
        ${operator ? `<button class="secondary-btn" data-action="training-records" data-id="${escapeAttr(operator.id)}">查看算子</button>` : `<button class="secondary-btn" data-action="noop">选择独立算子</button>`}
        ${operator && editableVersion ? `<button class="primary-btn" data-action="annotate-dataset-version" data-id="${escapeAttr(editableVersion.id)}">进入标注</button>` : operator ? `<button class="primary-btn" data-action="training-records" data-id="${escapeAttr(operator.id)}">查看样本池</button>` : `<button class="primary-btn" data-action="new-model">创建/复制算子</button>`}
      </div>`;
  return `<article class="scene-operator-node-card ${operator ? "is-bound" : "is-empty"}">
    <div class="scene-node-head">
      <span>${escapeHtml(node.type || "算子")}</span>
      <em>${escapeHtml(node.status || "未配置")}</em>
    </div>
    <h3>${escapeHtml(node.role || "算子节点")}</h3>
    <dl>
      <div><dt>绑定算子</dt><dd>${operator ? escapeHtml(getOperatorName(operator)) : "未绑定"}</dd></div>
      <div><dt>默认使用</dt><dd>${defaultWeight ? escapeHtml(String(defaultWeight.version || "").toUpperCase()) : "未设置"}</dd></div>
      <div><dt>输入</dt><dd>${escapeHtml(node.input || "图像输入")}</dd></div>
      <div><dt>输出</dt><dd>${escapeHtml(node.output || "检测结果")}</dd></div>
      ${stats ? `<div><dt>样本状态</dt><dd>${stats.pending || 0} 未标注 / ${stats.review || 0} 待确认 / ${stats.confirmed || 0} 已标注</dd></div>` : ""}
    </dl>
    <p class="scene-node-rule">${operator ? "该算子已归属当前场景；其他场景如需使用必须复制。" : "只能选择未归属独立算子；已归属其他场景的算子需要复制后使用。"}</p>
    ${actions}
  </article>`;
}

function renderSceneConnectionSummary(nodes) {
  if (nodes.length <= 1) return `<p>单算子场景，客户端运行后按该算子的归属关系回流数据。</p>`;
  return `<ol class="scene-connection-list">
    ${nodes.slice(1).map((node, index) => `<li><strong>${escapeHtml(nodes[index].role)}</strong><span>${escapeHtml(nodes[index].output || "输出")} → ${escapeHtml(node.role)} · ${escapeHtml(node.input || "输入")}</span></li>`).join("")}
  </ol>`;
}

function renderSceneIdealFlow(template) {
  const flow = Array.isArray(template?.idealFlow) ? template.idealFlow : [];
  if (!flow.length) return "";
  return `<ol class="scene-ideal-flow">
    ${flow.map((step, index) => `<li><span>${index + 1}</span><p>${escapeHtml(step)}</p></li>`).join("")}
  </ol>`;
}

function renderSceneTemplateDetail() {
  const template = getSceneTemplate(ui.selectedSceneTemplateId) || SCENE_TEMPLATES[0];
  ui.selectedSceneTemplateId = template.id;
  const nodes = getSceneOperatorBlueprints(template.id).map((node) => ({ ...node, operatorId: "", operator: null, status: "待配置" }));
  const toolSteps = getSceneToolSteps(template, nodes);
  els.main.innerHTML = `
    <section class="platform-table-page scene-detail-page">
      <div class="scene-detail-head">
        <button class="secondary-btn" data-action="set-scene-tab" data-id="templates">返回模板</button>
        <div>
          <h1>${escapeHtml(template.name)}</h1>
        </div>
        <button class="primary-btn" data-action="create-scene-from-template" data-id="${escapeAttr(template.id)}">创建场景</button>
      </div>
      <div class="scene-detail-grid">
        <section class="scene-info-panel">
          <h2>什么情况下用这个模板</h2>
          <p>${escapeHtml(template.useCase || template.description)}</p>
          <dl>
            <div><dt>检测任务</dt><dd>${escapeHtml(template.category)}</dd></div>
            <div><dt>行业</dt><dd>${template.industries.map(escapeHtml).join("、")}</dd></div>
            <div><dt>检测对象</dt><dd>${escapeHtml(template.object)}</dd></div>
            <div><dt>需要样本</dt><dd>${escapeHtml(template.dataNeed)}</dd></div>
          </dl>
        </section>
        <section class="scene-info-panel">
          <h2>最理想流程</h2>
          ${renderSceneIdealFlow(template)}
        </section>
      </div>
      ${renderSceneTemplateExample(template)}
      <section class="scene-workflow-panel">
        <h2>创建后形成的客户端工具结构</h2>
        ${renderSceneToolStructure(toolSteps, { readonly: true })}
      </section>
    </section>
  `;
}

function openSceneTemplateModal(templateId) {
  const template = getSceneTemplate(templateId);
  if (!template) return showToast("未找到场景模板");
  ui.selectedSceneTemplateId = template.id;
  modal = { type: "scene-template", templateId: template.id };
  renderModal();
}

function renderSceneTemplateExample(template) {
  if (!template.example) return "";
  const model = getModelById(template.example.modelId);
  const modelVersion = getModelVersions(model?.id || "").find((version) => version.id === template.example.modelVersionId);
  const modelMetric = modelVersion?.metrics ? `P ${modelVersion.metrics.precision}% · R ${modelVersion.metrics.recall}%` : "暂无指标";
  return `
    <section class="scene-template-example">
      <div class="scene-template-example-cover">
        <img src="${escapeAttr(template.image || IMAGE_CALIBRATION_BOARD)}" alt="${escapeAttr(template.name)}示例图" />
      </div>
      <div class="scene-template-example-content">
        <h2>示例闭环</h2>
        <div class="scene-example-steps">
          <article>
            <span>1</span>
            <strong>图像来源</strong>
            <p>${escapeHtml(template.example.dataSource || "客户端回流 / 本地上传")}</p>
          </article>
          <article>
            <span>2</span>
            <strong>算子节点</strong>
            <p>${escapeHtml(getSceneOperatorBlueprints(template.id).map((node) => node.role).join(" → ") || "待配置算子节点")}</p>
          </article>
          <article>
            <span>3</span>
            <strong>默认使用权重</strong>
            <p>${model ? escapeHtml(getOperatorName(model)) : "待绑定算子"} · ${modelVersion ? `${escapeHtml(String(modelVersion.version || "").toUpperCase())} · ${modelMetric}` : "未设置"}</p>
          </article>
          <article>
            <span>4</span>
            <strong>客户端拉取</strong>
            <p>发布配置后，由客户端拉取生成「${escapeHtml(template.example.clientTool || "检测工具")}」</p>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderSceneDetail() {
  const scene = getScene(ui.selectedSceneId) || getScenes()[0];
  if (!scene) {
    ui.sceneTab = "mine";
    return renderMyScenes();
  }
  ui.selectedSceneId = scene.id;
  const template = getSceneTemplate(scene.templateId);
  const nodes = getSceneOperatorNodes(scene);
  const toolSteps = getSceneToolSteps(scene, nodes);
  const deploymentStatus = getSceneDeploymentStatus(scene, nodes);
  els.main.innerHTML = `
    <section class="platform-table-page scene-detail-page">
      <div class="scene-detail-head">
        <button class="secondary-btn" data-action="set-scene-tab" data-id="mine">返回我的场景</button>
        <div>
          <h1>${escapeHtml(scene.name)}</h1>
          <p>${escapeHtml(template?.category || "自定义场景")} · 客户端三步工具结构</p>
        </div>
        <div class="scene-detail-actions">
          <span class="scene-status-pill">${escapeHtml(deploymentStatus)}</span>
          <button class="primary-btn" data-action="set-view" data-id="clients">发布配置</button>
        </div>
      </div>
      <div class="scene-orchestration-layout">
        <section class="scene-workflow-panel scene-node-panel">
          <h2>客户端工具结构</h2>
          ${renderSceneToolStructure(toolSteps)}
        </section>
        <aside class="scene-deploy-panel">
          <section class="scene-info-panel">
            <h2>三步关系</h2>
            ${renderSceneConnectionSummary(nodes)}
          </section>
          <section class="scene-info-panel">
            <h2>客户端拉取配置</h2>
            <dl>
              <div><dt>场景工具</dt><dd>${escapeHtml(scene.inputs?.objectName || template?.object || "检测")}检测工具</dd></div>
              <div><dt>同步方式</dt><dd>客户端主动拉取</dd></div>
              <div><dt>默认权重</dt><dd>${nodes.filter((node) => getOperatorDefaultWeight(node.operator)).length} / ${nodes.length}</dd></div>
              <div><dt>回流归属</dt><dd>图像库可见，处理归算子</dd></div>
            </dl>
            <p class="scene-return-note">平台只发布可拉取的场景配置；客户端联网后主动拉取。回流图像作为资产在图像库可查，同时按算子归属进入对应样本池。</p>
          </section>
        </aside>
      </div>
    </section>
  `;
}

function renderSceneWorkflow(steps, currentIndex, scene = null) {
  if (!steps.length) return `<div class="empty-state"><strong>该模板的完整流程暂未开放</strong><span>首版仅用于展示场景库扩展能力。</span></div>`;
  return `<ol class="scene-workflow-list">
    ${steps
      .map((step, index) => {
        const stateClass = currentIndex < 0 ? "" : index < currentIndex ? " is-done" : index === currentIndex ? " is-current" : "";
        return `<li class="${stateClass}">
          <span>${index + 1}</span>
          <div>
            <strong>${escapeHtml(step.title)}</strong>
            <p><b>用户：</b>${escapeHtml(step.user)}</p>
            <p><b>系统：</b>${escapeHtml(step.system)}</p>
            ${scene ? renderSceneStepObjects(scene, step, index) : ""}
            ${scene && index === currentIndex ? renderSceneStepAction(scene, step) : ""}
          </div>
        </li>`;
      })
      .join("")}
  </ol>`;
}

function renderSceneStepObjects(scene, step, index) {
  if (step.id === "import-images") {
    return renderSceneStepObjectBlock("本步骤算子数据", renderSceneDatasets(scene, { range: "source" }));
  }
  if (step.id === "create-version-annotate" || step.id === "quality-release") {
    return renderSceneStepObjectBlock("本步骤算子版本", renderSceneDatasets(scene, { range: "source", showVersion: true }));
  }
  if (step.id === "train-roi") {
    return renderSceneStepObjectBlock("本步骤算子", renderSceneModels(scene, { range: "roi" }));
  }
  if (step.id === "derive-crop") {
    return renderSceneStepObjectBlock("派生算子数据", renderSceneDatasets(scene, { range: "derived" }));
  }
  if (step.id === "train-defect" || step.id === "train-model") {
    return renderSceneStepObjectBlock("本步骤算子", renderSceneModels(scene, { range: "defect" }));
  }
  if (step.id === "export-models") {
    const modelContent = renderSceneModels(scene, { range: "all" });
    return renderSceneStepObjectBlock("导出对象", modelContent);
  }
  if (step.id === "configure-client") {
    return renderSceneStepObjectBlock("客户端检测工具", renderSceneClientTool(scene));
  }
  return "";
}

function renderSceneStepObjectBlock(title, content) {
  return `<div class="scene-step-objects"><span>${escapeHtml(title)}</span>${content}</div>`;
}

function renderSceneStepAction(scene, step) {
  if (step.id === "annotate-roi" && scene.datasetIds?.[0]) {
    return `<button class="primary-btn" data-action="dataset-annotate" data-id="${escapeAttr(scene.datasetIds[0])}">继续标注齿面区域</button>`;
  }
  if (step.id === "create-version-annotate" && scene.datasetIds?.[0]) {
    const dataset = getDataset(scene.datasetIds[0]);
    const versionId = dataset?.latestVersionId || "";
    return versionId
      ? `<button class="primary-btn" data-action="annotate-dataset-version" data-id="${escapeAttr(versionId)}">进入数据标注</button>`
      : `<button class="primary-btn" data-action="dataset-version" data-id="${escapeAttr(scene.datasetIds[0])}">创建算子版本</button>`;
  }
  if (step.id === "quality-release" && scene.datasetIds?.[0]) {
    return `<button class="primary-btn" data-action="open-dataset-versions" data-id="${escapeAttr(scene.datasetIds[0])}">查看算子版本</button>`;
  }
  if (step.id === "train-roi" && scene.datasetIds?.[0]) {
    return `<button class="primary-btn" data-action="train-dataset" data-id="${escapeAttr(scene.datasetIds[0])}">训练齿面定位算子版本</button>`;
  }
  if (step.id === "derive-crop" && scene.datasetIds?.[0]) {
    return `<button class="primary-btn" data-action="dataset-derive" data-id="${escapeAttr(scene.datasetIds[0])}">生成裁剪算子数据</button>`;
  }
  if (step.id === "annotate-defect" && scene.datasetIds?.[1]) {
    return `<button class="primary-btn" data-action="dataset-annotate" data-id="${escapeAttr(scene.datasetIds[1])}">继续标注缺陷</button>`;
  }
  if (step.id === "train-defect" && scene.datasetIds?.[0]) {
    return `<button class="primary-btn" data-action="train-dataset" data-id="${escapeAttr(scene.datasetIds[0])}">训练算子版本</button>`;
  }
  if (step.id === "configure-client") {
    return `<button class="primary-btn" data-action="set-view" data-id="clients">查看客户端管理</button>`;
  }
  return `<button class="secondary-btn" data-action="noop">该步骤将在后续 Demo 中补全</button>`;
}

function renderSceneDatasets(scene, options = {}) {
  let datasetIds = scene.datasetIds || [];
  if (options.range === "source") datasetIds = datasetIds.slice(0, 1);
  if (options.range === "derived") datasetIds = datasetIds.slice(1, 2);
  const datasets = datasetIds.map(getDataset).filter(Boolean);
  if (!datasets.length) return `<p class="scene-empty-copy">还没有算子数据。</p>`;
  return datasets
    .map((dataset) => {
      const stats = getDatasetStats(dataset);
      const latestVersion = getDatasetVersion(dataset.latestVersionId);
      return `<article class="scene-object-card">
        <strong>${escapeHtml(dataset.name)}</strong>
        <span>${escapeHtml(dataset.taskType)} · ${stats.total} 张算子数据${options.showVersion && latestVersion ? ` · ${escapeHtml(extractVersionLabel(latestVersion.name))} ${escapeHtml(getDatasetVersionStatus(latestVersion))}` : ""}</span>
        <button class="secondary-btn" data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}">查看算子数据</button>
      </article>`;
    })
    .join("");
}

function renderSceneModels(scene, options = {}) {
  let modelIds = scene.modelIds || [];
  if (options.range === "roi") modelIds = modelIds.slice(0, 1);
  if (options.range === "defect") modelIds = modelIds.length > 1 ? modelIds.slice(1, 2) : modelIds.slice(0, 1);
  const models = modelIds.map(getModelById).filter(Boolean);
  if (!models.length) return `<p class="scene-empty-copy">还没有可用算子。</p>`;
  return models
    .map((model) => `<article class="scene-object-card">
      <strong>${escapeHtml(getOperatorName(model))}</strong>
      <span>${escapeHtml(model.sceneType)} · ${getModelVersions(model.id).length} 套权重</span>
      <button class="secondary-btn" data-action="training-records" data-id="${escapeAttr(model.id)}">查看算子</button>
    </article>`)
    .join("");
}

function renderSceneClientTool(scene) {
  const sceneModels = (scene.modelIds || []).map(getModelById).filter(Boolean);
  const model = sceneModels[sceneModels.length - 1];
  if (!model) return `<p class="scene-empty-copy">还没有可配置到客户端的算子。</p>`;
  const latestVersion = getModelVersions(model.id)[0];
  return `<article class="scene-object-card">
    <strong>${escapeHtml(scene.inputs?.objectName || "检测")}检测工具</strong>
    <span>${escapeHtml(getOperatorName(model))}${latestVersion ? ` · ${escapeHtml(latestVersion.version)}` : ""}</span>
    <button class="secondary-btn" data-action="set-view" data-id="clients">查看客户端</button>
  </article>`;
}

function renderOperators() {
  const rows = getOperators()
    .filter((operator) => ui.modelScene === "all" || operator.type === ui.modelScene)
    .filter((operator) => !ui.modelQuery || operator.name.toLowerCase().includes(ui.modelQuery.toLowerCase()));
  els.main.innerHTML = `
    <section class="platform-table-page model-list-page operator-list-page">
      <div class="model-page-head">
        <div><h1>算子库</h1></div>
      </div>
      <div class="platform-toolbar">
        <div class="toolbar-left">
          <select id="modelSceneSelect">
            <option value="all"${ui.modelScene === "all" ? " selected" : ""}>请选择算子类别</option>
            ${MODEL_ALGORITHM_TYPES.map((type) => `<option value="${escapeAttr(type)}"${ui.modelScene === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
          </select>
          <input id="modelQueryInput" value="${escapeAttr(ui.modelQuery)}" placeholder="请输入算子名称" />
        </div>
        <div class="toolbar-right">
          <button class="secondary-btn" data-action="reset-model-filter">重置</button>
          <button class="primary-btn" data-action="search-models">查询</button>
          <button class="primary-btn" data-action="new-model">新建算子</button>
        </div>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table operator-table">
          <thead><tr><th style="width:70px"></th><th>算子名称</th><th>算子类别</th><th>归属</th><th>图像数量</th><th>当前权重</th><th style="width:160px">操作</th></tr></thead>
          <tbody>
            ${rows
              .map((operator, index) => {
                const versions = getOperatorWeightVersions(operator.id);
                const currentVersion = versions.find((version) => version.recommended) || versions[0];
                return `
                <tr class="model-main-row operator-main-row${ui.expandedModelId === operator.id ? " is-expanded" : ""}" data-model-id="${escapeAttr(operator.id)}">
                  <td><span class="model-row-toggle" aria-hidden="true">${ui.expandedModelId === operator.id ? "▾" : "▸"}</span><span class="model-row-index">${index + 1}</span></td>
                  <td>${escapeHtml(operator.name)}</td>
                  <td>${escapeHtml(operator.type)}</td>
                  <td>${escapeHtml(operator.ownerLabel)}</td>
                  <td>${operator.imageCount} 张</td>
                  <td>${currentVersion ? escapeHtml(String(currentVersion.version || "").toUpperCase()) : "暂无"}</td>
                  <td class="table-actions">
                    <button data-action="training-records" data-id="${escapeAttr(operator.id)}">查看详情</button>
                    <span class="record-more">
                      ${renderIconButton({ icon: "more", label: "更多", className: "table-icon-btn", attrs: `data-action="model-more" data-id="${escapeAttr(operator.id)}"` })}
                      ${
                        ui.openModelMenu === operator.id
                          ? `<span class="record-menu operator-record-menu">
                              <button data-action="edit-model" data-id="${escapeAttr(operator.id)}">编辑算子</button>
                              <button data-action="noop">复制算子</button>
                              <button class="danger-link" data-action="delete-model" data-id="${escapeAttr(operator.id)}">删除算子</button>
                            </span>`
                          : ""
                      }
                    </span>
                  </td>
                </tr>
                ${ui.expandedModelId === operator.id ? renderOperatorWeightsPreview(operator, versions) : ""}`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      ${renderPager(rows.length)}
    </section>
  `;
}

function renderOperatorWeightsPreview(operator, versions) {
  const recentVersions = versions.slice(0, 3);
  return `
    <tr class="model-version-preview-row">
      <td colspan="9">
        <div class="model-version-preview operator-version-preview">
          <div class="model-version-preview-head"><strong>最近训练结果</strong></div>
          ${
            recentVersions.length
              ? `<div class="model-version-preview-list">
                  ${recentVersions
                    .map((version) => {
                      const datasetVersion = getDatasetVersion(version.datasetVersionId);
                      return `<article>
                        <header>
                          <strong>${escapeHtml(version.version)}</strong>
                          ${renderModelVersionStatus(version.status)}
                        </header>
                        <div class="version-card-field">
                          <span>训练数据</span>
                          ${renderTrainingDataVersionLink(datasetVersion)}
                        </div>
                        <div class="version-card-grid">
                          <div><span>样本</span><b>${version.sampleCount || 0}</b></div>
                          <div><span>指标</span><b>${version.metrics ? `P ${version.metrics.precision}% · R ${version.metrics.recall}%` : "--"}</b></div>
                        </div>
                        <div class="version-card-field"><span>创建时间</span><b>${formatDateTime(version.createdAt)}</b></div>
                      </article>`;
                    })
                    .join("")}
                </div>`
              : `<div class="empty-state"><strong>暂无训练结果</strong><span>请先完成算子版本的数据准备，再开始训练。</span></div>`
          }
        </div>
      </td>
    </tr>
  `;
}

function renderModels() {
  const rows = state.models
    .filter((model) => ui.modelScene === "all" || model.sceneType === ui.modelScene)
    .filter((model) => !ui.modelQuery || model.name.toLowerCase().includes(ui.modelQuery.toLowerCase()));
  els.main.innerHTML = `
    <section class="platform-table-page model-list-page">
      <div class="model-page-head">
        <div>
          <h1>算子管理</h1>
        </div>
      </div>
      <div class="platform-toolbar">
        <div class="toolbar-left">
          <select id="modelSceneSelect">
            <option value="all"${ui.modelScene === "all" ? " selected" : ""}>请选择算法类型</option>
            ${MODEL_ALGORITHM_TYPES.map((type) => `<option value="${escapeAttr(type)}"${ui.modelScene === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
          </select>
          <input id="modelQueryInput" value="${escapeAttr(ui.modelQuery)}" placeholder="请输入算子名称" />
        </div>
        <div class="toolbar-right">
          <button class="secondary-btn" data-action="reset-model-filter">重置</button>
          <button class="primary-btn" data-action="search-models">查询</button>
          <button class="primary-btn" data-action="new-model">新建算子</button>
        </div>
      </div>
      <div class="platform-table-wrap">
        <table class="platform-data-table">
          <thead><tr><th style="width:70px"></th><th>算子名称</th><th>算法类型</th><th>最新版本</th><th>场景描述</th><th>更新时间</th><th style="width:180px">操作</th></tr></thead>
          <tbody>
            ${rows
              .map((model, index) => {
                const versions = getModelVersions(model.id);
                const latestVersion = versions[0];
                return `
                <tr class="model-main-row${ui.expandedModelId === model.id ? " is-expanded" : ""}" data-model-id="${escapeAttr(model.id)}">
                  <td><span class="model-row-toggle" aria-hidden="true">${ui.expandedModelId === model.id ? "▾" : "▸"}</span><span class="model-row-index">${index + 1}</span></td>
                  <td>${escapeHtml(model.name)}</td>
                  <td>${escapeHtml(model.sceneType)}</td>
                  <td>${latestVersion ? `${escapeHtml(latestVersion.version)} · ${escapeHtml(latestVersion.status)} · 共 ${versions.length} 个版本` : "暂无"}</td>
                  <td>${escapeHtml(model.description || "")}</td>
                  <td>${formatDateTime(model.updatedAt)}</td>
                  <td class="table-actions">
                    <button data-action="training-records" data-id="${escapeAttr(model.id)}">查看详情</button>
                    <span class="record-more">
                      ${renderIconButton({ icon: "more", label: "更多", className: "table-icon-btn", attrs: `data-action="model-more" data-id="${escapeAttr(model.id)}"` })}
                      ${
                        ui.openModelMenu === model.id
                          ? `<span class="record-menu">
                              <button data-action="edit-model" data-id="${escapeAttr(model.id)}">编辑算子</button>
                              <button class="danger-link" data-action="delete-model" data-id="${escapeAttr(model.id)}">删除算子</button>
                            </span>`
                          : ""
                      }
                    </span>
                  </td>
                </tr>
                ${ui.expandedModelId === model.id ? renderModelVersionsPreview(model, versions) : ""}`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      ${renderPager(rows.length)}
    </section>
  `;
}

function toggleModelVersions(modelId) {
  if (!modelId) return;
  ui.expandedModelId = ui.expandedModelId === modelId ? "" : modelId;
  ui.openModelMenu = "";
  saveUi();
  render();
}

function renderModelVersionsPreview(model, versions) {
  const recentVersions = versions.slice(0, 3);
  return `
    <tr class="model-version-preview-row">
      <td colspan="7">
        <div class="model-version-preview">
          <div class="model-version-preview-head">
            <strong>最近版本</strong>
          </div>
          ${
            recentVersions.length
              ? `<div class="model-version-preview-list">
                  ${recentVersions
                    .map((version) => {
                      const datasetVersion = getDatasetVersion(version.datasetVersionId);
                      return `<article>
                        <header>
                          <strong>${escapeHtml(version.version)}</strong>
                          ${renderModelVersionStatus(version.status)}
                        </header>
                        <div class="version-card-field">
                          <span>训练数据</span>
                          ${renderDatasetVersionLink(datasetVersion)}
                        </div>
                        <div class="version-card-grid">
                          <div><span>样本</span><b>${version.sampleCount || 0}</b></div>
                          <div><span>指标</span><b>${version.metrics ? `P ${version.metrics.precision}% · R ${version.metrics.recall}%` : "--"}</b></div>
                        </div>
                        <div class="version-card-field"><span>创建时间</span><b>${formatDateTime(version.createdAt)}</b></div>
                      </article>`;
                    })
                    .join("")}
                </div>`
              : `<div class="empty-state"><strong>暂无算子版本</strong><span>请选择数据集版本训练后生成。</span></div>`
          }
        </div>
      </td>
    </tr>
  `;
}

function renderOperatorDetail() {
  const operator = getSelectedOperator();
  if (!operator) return setView("operators");
  ui.selectedModelId = operator.id;
  const datasets = getOperatorDatasets(operator.id);
  const primaryDataset = datasets[0];
  const trainingDataVersions = primaryDataset ? getDatasetVersions(primaryDataset.id) : [];
  const weightVersions = getOperatorWeightVersions(operator.id);
  const currentWeight = weightVersions.find((version) => version.status === "训练完成") || weightVersions[0] || null;
  const currentOperatorVersion = currentWeight ? getDatasetVersion(currentWeight.datasetVersionId) : null;
  const editableOperatorVersion = trainingDataVersions.find((version) => getDatasetVersionStatus(version) !== "已发布") || null;
  const ownerScene = getScenes().find((scene) => (scene.modelIds || []).includes(operator.id));
  const allOperatorImages = primaryDataset ? getDatasetImages(primaryDataset.id) : [];
  const operatorImages = getOperatorPoolImages(primaryDataset, allOperatorImages, trainingDataVersions);
  const hasOperatorDetail = Boolean(operatorImages.length);
  if (hasOperatorDetail && !operatorImages.some((image) => image.id === ui.operatorDataActiveImageId)) {
    ui.operatorDataActiveImageId = operatorImages[0].id;
  }
  const currentSnapshotLabel = currentOperatorVersion ? getDatasetVersionShortName(currentOperatorVersion).toUpperCase() : "暂无";
  els.main.innerHTML = `
    <section class="platform-table-page training-record-page model-detail-page operator-detail-page">
      <header class="operator-profile-header">
        <div class="operator-profile-main">
          <div class="operator-profile-copy">
            <button class="operator-profile-back" data-action="back-models">← 返回算子库</button>
            <h1>${escapeHtml(operator.name)}</h1>
          </div>
          <div class="operator-profile-meta">
            <span class="operator-profile-tag">${escapeHtml(operator.type)}</span>
            ${ownerScene ? `<button class="operator-profile-scene" data-action="open-scene" data-id="${escapeAttr(ownerScene.id)}">场景：${escapeHtml(ownerScene.name)}</button>` : '<span class="operator-profile-scene is-muted">场景：未关联</span>'}
            <span class="operator-current-version">默认使用 ${escapeHtml(currentSnapshotLabel)}${renderIconButton({ icon: "list", label: "查看快照记录", className: "operator-current-version-list", attrs: `data-action="open-operator-version-list" data-id="${escapeAttr(operator.id)}"` })}</span>
            <button class="primary-btn operator-profile-train" data-action="annotate-dataset-version" data-id="${escapeAttr(editableOperatorVersion?.id || primaryDataset?.latestVersionId || "")}"${primaryDataset && allOperatorImages.length ? "" : " disabled"}>进入标注</button>
          </div>
        </div>
      </header>
      <section class="detail-panel operator-sample-pool-panel">
        <div class="operator-pool-split${hasOperatorDetail ? " has-detail" : ""}" style="--operator-sample-panel-width: ${Number(ui.operatorSamplePanelWidth || 520)}px">
          <section class="operator-training-pool">
            ${renderOperatorPoolToolbar(allOperatorImages, operatorImages, primaryDataset)}
            ${renderOperatorPoolGrid(primaryDataset, operatorImages, trainingDataVersions)}
          </section>
          ${hasOperatorDetail ? '<div class="operator-pool-resizer" data-operator-split-resizer role="separator" aria-label="拖动调整图像池与图像详情的宽度" aria-orientation="vertical"><span></span></div>' : ""}
          ${renderOperatorSampleDrawer(operator, primaryDataset, operatorImages, trainingDataVersions)}
        </div>
      </section>
    </section>
  `;
  const poolTimeline = els.main.querySelector(".operator-pool-timeline");
  if (poolTimeline) poolTimeline.scrollTop = Number(ui.operatorPoolScrollTop || 0);
  operatorSamplePanelJustOpened = false;
}

function getOperatorPoolImages(dataset, images, versions) {
  if (!dataset) return [];
  const query = String(ui.operatorPoolQuery || "").trim().toLowerCase();
  return images
    .filter((image) => {
      const source = getOperatorSampleSource(image, dataset);
      const stateKey = getOperatorSampleStateKey(image, dataset, versions);
      if (query && !`${image.name} ${source} ${image.device || ""}`.toLowerCase().includes(query)) return false;
      const sourceFilter = normalizeOperatorPoolSourceFilter(ui.operatorPoolSource);
      if (sourceFilter && sourceFilter !== "all" && source !== sourceFilter) return false;
      if (ui.operatorDataStatus && ui.operatorDataStatus !== "all" && stateKey !== ui.operatorDataStatus) return false;
      return true;
    })
    .sort((a, b) => getOperatorSampleAddedAt(dataset, b).localeCompare(getOperatorSampleAddedAt(dataset, a)));
}

function renderOperatorPoolToolbar(allImages, visibleImages, dataset) {
  const sources = Array.from(new Set(allImages.map((image) => getOperatorSampleSource(image, dataset)))).filter(Boolean);
  const selectedSource = normalizeOperatorPoolSourceFilter(ui.operatorPoolSource);
  return `
    <div class="operator-pool-toolbar">
      <div class="operator-pool-search">
        <span class="operator-pool-search-icon">⌕</span>
        <input id="operatorPoolQueryInput" value="${escapeAttr(ui.operatorPoolQuery || "")}" placeholder="搜索图像名称" />
        ${renderIconButton({ icon: "search", label: "查询", className: "operator-pool-search-submit", attrs: 'data-action="search-operator-pool"' })}
      </div>
      <select id="operatorPoolSourceSelect" aria-label="来源">
        <option value="all">全部来源</option>
        ${sources.map((source) => `<option value="${escapeAttr(source)}"${selectedSource === source ? " selected" : ""}>${escapeHtml(source)}</option>`).join("")}
      </select>
      <select id="operatorDataStatusSelect" aria-label="样本状态">
        ${[["all", "全部状态"], ["unlabeled", "未标注"], ["prediction", "待确认"], ["annotated", "已标注"]].map(([value, label]) => `<option value="${value}"${ui.operatorDataStatus === value ? " selected" : ""}>${label}</option>`).join("")}
      </select>
      <button class="operator-pool-reset-link" data-action="reset-operator-pool">清空</button>
      <span class="operator-pool-result-count">${visibleImages.length}/${allImages.length}</span>
    </div>
  `;
}

function normalizeOperatorPoolSourceFilter(source) {
  if (source === "回流" || source === "客户端采图回流" || source === "客户端检测回流") return "客户端回流";
  return source || "all";
}

function renderOperatorPoolGrid(dataset, images, versions) {
  const allImages = dataset ? getDatasetImages(dataset.id) : [];
  if (!dataset || !allImages.length) return `<div class="operator-pool-empty operator-pool-onboarding">
    <div class="operator-pool-onboarding-icon">▧</div>
    <strong>样本池还是空的</strong>
    <span>从图像库选择已有图像，加入后即可创建算子版本并开始标注。</span>
    <button class="primary-btn" data-action="operator-add-library-images" data-id="${escapeAttr(ui.selectedModelId || "")}">从图像库选择</button>
    <small>图像文件仍保留在图像库中，这里只建立与当前算子的关联。</small>
  </div>`;
  if (!images.length) return `<div class="operator-pool-empty"><strong>没有符合条件的样本</strong><span>可调整搜索或筛选条件。</span></div>`;
  const batches = [];
  images.forEach((image) => {
    const addedAt = getOperatorSampleAddedAt(dataset, image);
    const minuteKey = addedAt ? addedAt.slice(0, 16) : "unknown";
    const relationType = dataset?.sampleMeta?.[image.id]?.feedbackType || image.feedbackType || "history";
    const batchKey = `${relationType}|${minuteKey}`;
    let batch = batches.find((item) => item.key === batchKey);
    if (!batch) {
      batch = { key: batchKey, addedAt, source: getOperatorAdditionSource(image, dataset), images: [] };
      batches.push(batch);
    }
    batch.images.push(image);
  });
  return `<div class="operator-pool-timeline">${batches.map((batch) => `<section class="operator-pool-batch">
    <header class="operator-pool-batch-head">
      <span class="operator-pool-timeline-dot"></span>
      <time>${formatDateTime(batch.addedAt)}</time>
      <strong>${escapeHtml(batch.source)}</strong>
      <em>${batch.images.length}</em>
    </header>
    <div class="operator-pool-grid">${renderOperatorPoolCards(dataset, batch.images, versions)}</div>
  </section>`).join("")}</div>`;
}

function getOperatorSampleAddedAt(dataset, image) {
  return String(dataset?.sampleMeta?.[image.id]?.addedAt || image.operatorAddedAt || image.capturedAt || "");
}

function getOperatorAdditionSource(image, dataset) {
  const feedbackType = dataset?.sampleMeta?.[image.id]?.feedbackType || image.feedbackType;
  const meta = dataset?.sampleMeta?.[image.id] || {};
  const context = image.sourceContext || {};
  if (feedbackType === "inspection" || feedbackType === "capture") {
    const clientName = context.clientName || meta.clientName || inferOperatorReturnClientName(image);
    const toolName = context.toolName || meta.toolName || inferOperatorReturnToolName(image, dataset);
    return ["客户端回流", clientName || "未知客户端", toolName || "未关联工具"].filter(Boolean).join(" · ");
  }
  const device = image.device ? ` · ${image.device}` : "";
  if (feedbackType === "derived") return `算子派生数据${device}`;
  if (feedbackType === "library") return `从图像库选择${device}`;
  return `图像库 · ${getImageFolderDisplayName(image, dataset)}`;
}

function inferOperatorReturnClientName(image) {
  if (String(image.device || "").includes("背板A线")) return "检测工位A";
  if (String(image.device || "").includes("齿轮")) return "客户端";
  return image.device || "";
}

function inferOperatorReturnToolName(image, dataset) {
  const text = `${image.name || ""} ${image.device || ""} ${dataset?.name || ""}`;
  if (text.includes("背板")) return "示例-背板";
  if (text.includes("齿轮")) return "示例-齿轮";
  return getModelById(dataset?.linkedModelId)?.name || dataset?.name || "";
}

function getImageFolderDisplayName(image, dataset = null) {
  const folder = (state.folders || []).find((item) => item.id === image.folderId);
  if (folder?.name) return folder.name;
  if (dataset?.name) return dataset.name.replace(/数据集|算子数据/g, "") || dataset.name;
  return image.folderId || "未命名文件夹";
}

function renderOperatorPoolCards(dataset, images, versions) {
  return images.map((image) => {
    const stateKey = getOperatorSampleStateKey(image, dataset, versions);
    const stateLabel = stateKey === "prediction" ? "待确认" : stateKey === "annotated" ? "已标注" : "未标注";
    const stateClass = stateKey === "prediction" ? "is-prediction" : stateKey === "annotated" ? "is-annotated" : "is-unlabeled";
    return `<article class="operator-pool-card${image.id === ui.operatorDataActiveImageId ? " is-active" : ""}">
      <button class="operator-pool-card-image" data-action="open-operator-sample-drawer" data-id="${escapeAttr(image.id)}">
        <img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.name)}" />
        <span class="operator-pool-state ${stateClass}">${stateLabel}</span>
      </button>
      <div class="operator-pool-card-body">
        <strong title="${escapeAttr(image.name)}">${escapeHtml(image.name)}</strong>
        <span>${escapeHtml(image.device || getOperatorSampleSource(image, dataset))}</span>
        <small>${formatDateTime(getOperatorSampleAddedAt(dataset, image))}</small>
      </div>
    </article>`;
  }).join("");
}

function renderOperatorSampleDrawer(operator, dataset, images, versions) {
  if (!dataset || !images.length) return "";
  const activeImage = images.find((image) => image.id === ui.operatorDataActiveImageId) || images[0];
  if (!activeImage) return "";
  ui.operatorDataActiveImageId = activeImage.id;
  const activeIndex = images.findIndex((image) => image.id === activeImage.id);
  const versionEntries = getOperatorSampleVersionEntries(activeImage, versions, versions.map((version) => version.id));
  const source = getOperatorSampleSource(activeImage, dataset);
  const clientTool = getOperatorSampleClientToolLabel(activeImage, dataset);
  const weightLabel = getOperatorSampleWeightLabel(activeImage, operator);
  const hasPrediction = hasOperatorSamplePrediction(activeImage);
  const showPredictions = ui.operatorShowPredictions !== false;
  const editableVersion = getEditableTrainingDataVersion(dataset);
  return `
    <aside class="operator-sample-panel${operatorSamplePanelJustOpened ? " is-opening" : ""}" aria-label="样本详情">
      <header class="operator-sample-drawer-head">
        <div><strong title="${escapeAttr(activeImage.name)}">${escapeHtml(activeImage.name)}</strong></div>
      </header>
      <div class="operator-sample-drawer-scroll">
        <div class="operator-sample-detail-layout">
          <div class="operator-sample-drawer-canvas">${renderOperatorSampleCanvas(activeImage, versionEntries, showPredictions)}</div>
          <section class="operator-sample-drawer-summary">
            <div><span>状态</span>${renderOperatorSampleState(activeImage, dataset, versions)}</div>
            <dl>
              <div><dt>图像名称</dt><dd>${escapeHtml(activeImage.name)}</dd></div>
              <div><dt>来源</dt><dd>${escapeHtml(source)}</dd></div>
              <div><dt>客户端/工具</dt><dd>${escapeHtml(clientTool)}</dd></div>
              <div><dt>权重版本</dt><dd>${escapeHtml(weightLabel)}</dd></div>
              <div><dt>采集时间</dt><dd>${formatDateTime(activeImage.capturedAt)}</dd></div>
              <div><dt>图像尺寸</dt><dd>${escapeHtml(activeImage.size || "-")}</dd></div>
              ${hasPrediction ? `<div><dt>推理结果</dt><dd><button class="operator-prediction-switch${showPredictions ? " is-on" : ""}" data-action="toggle-operator-predictions" role="switch" aria-checked="${showPredictions ? "true" : "false"}"><span></span></button></dd></div>` : ""}
            </dl>
            <div class="operator-sample-summary-actions">
              <button class="secondary-btn operator-drawer-annotate" data-action="annotate-dataset-version" data-id="${escapeAttr(editableVersion?.id || "")}"${editableVersion ? "" : " disabled"}>进入标注调整</button>
            </div>
          </section>
        </div>
      </div>
      <div class="operator-sample-drawer-nav">
        <button class="secondary-btn" data-action="step-operator-sample-drawer" data-direction="-1"${activeIndex <= 0 ? " disabled" : ""}>上一张</button>
        <span>${activeIndex + 1} / ${images.length}</span>
        <button class="secondary-btn" data-action="step-operator-sample-drawer" data-direction="1"${activeIndex >= images.length - 1 ? " disabled" : ""}>下一张</button>
      </div>
    </aside>`;
}

function refreshOperatorSamplePanel() {
  const operator = getSelectedOperator();
  const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
  const versions = dataset ? getDatasetVersions(dataset.id) : [];
  const images = dataset ? getOperatorPoolImages(dataset, getDatasetImages(dataset.id), versions) : [];
  const currentPanel = els.main.querySelector(".operator-sample-panel");
  if (!currentPanel) return render();
  currentPanel.outerHTML = renderOperatorSampleDrawer(operator, dataset, images, versions);
  els.main.querySelectorAll(".operator-pool-card.is-active").forEach((card) => card.classList.remove("is-active"));
  const activeButton = els.main.querySelector(`.operator-pool-card-image[data-id="${CSS.escape(ui.operatorDataActiveImageId)}"]`);
  activeButton?.closest(".operator-pool-card")?.classList.add("is-active");
}

function stepOperatorPoolDrawer(direction) {
  const operator = getSelectedOperator();
  const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
  const versions = dataset ? getDatasetVersions(dataset.id) : [];
  const images = dataset ? getOperatorPoolImages(dataset, getDatasetImages(dataset.id), versions) : [];
  const activeIndex = images.findIndex((image) => image.id === ui.operatorDataActiveImageId);
  const nextIndex = Math.max(0, Math.min(images.length - 1, activeIndex + direction));
  if (!images[nextIndex] || nextIndex === activeIndex) return;
  ui.operatorDataActiveImageId = images[nextIndex].id;
  saveUi();
  refreshOperatorSamplePanel();
}

function renderOperatorSampleViewer(operator, dataset, images, versions, visibleVersionIds) {
  if (!dataset || !images.length) return `<div class="empty-state"><strong>暂无符合条件的样本</strong><span>调整筛选条件后重试。</span></div>`;
  const activeImage = images.find((image) => image.id === ui.operatorDataActiveImageId) || images[0];
  ui.operatorDataActiveImageId = activeImage.id;
  const activeIndex = images.findIndex((image) => image.id === activeImage.id);
  const versionEntries = getOperatorSampleVersionEntries(activeImage, versions, visibleVersionIds);
  const showPredictions = ui.operatorShowPredictions !== false;
  const editableVersion = getEditableTrainingDataVersion(dataset);
  return `<div class="operator-sample-viewer">
    <aside class="operator-sample-list">
      <header><strong>${images.length} 张样本</strong></header>
      ${images.map((image) => `<button class="${image.id === activeImage.id ? "is-active" : ""}" data-action="select-operator-sample" data-id="${escapeAttr(image.id)}"><img src="${escapeAttr(image.url)}" alt="" /><span>${escapeHtml(image.name)}</span>${hasOperatorSamplePrediction(image) ? '<i>待确认</i>' : ""}</button>`).join("")}
    </aside>
    <section class="operator-sample-canvas-panel">
      <div class="operator-sample-nav">
        <button class="secondary-btn" data-action="step-operator-sample" data-direction="-1"${activeIndex <= 0 ? " disabled" : ""}>上一张</button>
        <strong>${escapeHtml(activeImage.name)}</strong>
        <button class="secondary-btn" data-action="step-operator-sample" data-direction="1"${activeIndex >= images.length - 1 ? " disabled" : ""}>下一张</button>
      </div>
      ${renderOperatorSampleCanvas(activeImage, versionEntries, showPredictions)}
    </section>
    <aside class="operator-sample-inspector">
      <header><strong>样本信息</strong></header>
      <dl><dt>来源</dt><dd>${escapeHtml(getOperatorSampleSource(activeImage, dataset))}</dd><dt>客户端/工具</dt><dd>${escapeHtml(getOperatorSampleClientToolLabel(activeImage, dataset))}</dd>${hasOperatorSamplePrediction(activeImage) ? `<dt>推理结果</dt><dd><button class="operator-prediction-switch${showPredictions ? " is-on" : ""}" data-action="toggle-operator-predictions" role="switch" aria-checked="${showPredictions ? "true" : "false"}"><span></span></button></dd>` : ""}</dl>
      <button class="secondary-btn operator-inspector-annotate" data-action="annotate-dataset-version" data-id="${escapeAttr(editableVersion?.id || "")}"${editableVersion ? "" : " disabled"}>进入标注调整</button>
    </aside>
  </div>`;
}

function renderUnifiedOperatorVersionTable(dataVersions, weightVersions) {
  if (!dataVersions.length) return `<div class="empty-state"><strong>暂无算子版本</strong><span>创建第一个算子版本后，可准备数据并训练权重。</span></div>`;
  const expandedVersionId = ui.operatorVersionExpansionTouched ? ui.expandedOperatorVersionId : dataVersions[0].id;
  return `<div class="platform-table-wrap operator-version-table-wrap">
    <table class="platform-data-table unified-operator-version-table">
      <thead><tr><th style="width:150px">算子版本</th><th style="width:140px">状态</th><th>数据划分</th><th style="width:130px">数据质量</th><th>训练结果</th><th style="width:180px">创建时间</th><th style="width:210px">操作</th></tr></thead>
      <tbody>${dataVersions.map((dataVersion) => {
        const weights = weightVersions.filter((weight) => weight.datasetVersionId === dataVersion.id);
        const latestWeight = weights[0] || null;
        const expanded = expandedVersionId === dataVersion.id;
        const status = getUnifiedOperatorVersionStatus(dataVersion, latestWeight);
        return `<tr class="operator-version-main-row${expanded ? " is-expanded" : ""}" data-action="toggle-operator-version" data-id="${escapeAttr(dataVersion.id)}">
          <td><button class="operator-version-expand" data-action="toggle-operator-version" data-id="${escapeAttr(dataVersion.id)}" aria-label="${expanded ? "收起" : "展开"}">${expanded ? "▾" : "▸"}</button><strong>${escapeHtml(getDatasetVersionShortName(dataVersion))}</strong>${weights.length > 1 ? `<small>${weights.length} 次训练</small>` : ""}</td>
          <td>${renderUnifiedOperatorVersionStatus(status)}</td>
          <td>${renderClickableDatasetSplit(dataVersion)}</td>
          <td>${dataVersion.qualityScore ? `<button class="table-link" data-action="quality-detail" data-id="${escapeAttr(dataVersion.id)}">${dataVersion.qualityScore}</button>` : '<span class="table-muted">未评估</span>'}</td>
          <td class="model-version-metrics">${latestWeight?.metrics ? `P ${latestWeight.metrics.precision}% · R ${latestWeight.metrics.recall}% · 误检率 ${latestWeight.metrics.falseAlarm}%` : latestWeight ? escapeHtml(latestWeight.status) : '<span class="table-muted">尚未训练</span>'}</td>
          <td>${formatDateTime(dataVersion.createdAt)}</td>
          <td class="table-actions">${renderUnifiedOperatorVersionActions(dataVersion, latestWeight)}</td>
        </tr>${expanded ? `<tr class="operator-version-detail-row"><td colspan="7">${renderUnifiedOperatorVersionDetail(dataVersion, weights)}</td></tr>` : ""}`;
      }).join("")}</tbody>
    </table>
  </div>`;
}

function getUnifiedOperatorVersionStatus(dataVersion, latestWeight) {
  const dataStatus = getDatasetVersionStatus(dataVersion);
  if (dataStatus !== "已发布") return "数据准备中";
  if (!latestWeight) return "待训练";
  return latestWeight.status || "待训练";
}

function renderUnifiedOperatorVersionStatus(status) {
  if (status === "数据准备中") return '<span class="training-status is-pending">数据准备中</span>';
  return renderModelVersionStatus(status);
}

function renderUnifiedOperatorVersionActions(dataVersion, latestWeight) {
  const dataStatus = getDatasetVersionStatus(dataVersion);
  if (dataStatus !== "已发布") return `<button data-action="annotate-dataset-version" data-id="${escapeAttr(dataVersion.id)}">继续准备</button><button data-action="toggle-operator-version" data-id="${escapeAttr(dataVersion.id)}">查看</button>`;
  if (!latestWeight) return `<button data-action="train-operator-version" data-id="${escapeAttr(dataVersion.id)}">开始训练</button><button data-action="toggle-operator-version" data-id="${escapeAttr(dataVersion.id)}">查看</button>`;
  return `<button data-action="test-model-version" data-id="${escapeAttr(latestWeight.id)}"${latestWeight.status === "训练完成" ? "" : " disabled"}>测试</button><button data-action="download-model-version" data-id="${escapeAttr(latestWeight.id)}"${latestWeight.status === "训练完成" ? "" : " disabled"}>下发</button><button data-action="toggle-operator-version" data-id="${escapeAttr(dataVersion.id)}">查看</button>`;
}

function renderUnifiedOperatorVersionDetail(dataVersion, weights) {
  const selectedTab = ui.operatorVersionDetailTabs?.[dataVersion.id] || "data";
  const status = getDatasetVersionStatus(dataVersion);
  return `<div class="unified-version-detail">
    <div class="scene-tabs unified-version-detail-tabs">
      <button class="${selectedTab === "data" ? "is-active" : ""}" data-action="operator-version-detail-tab" data-id="${escapeAttr(dataVersion.id)}" data-tab="data">训练数据</button>
      <button class="${selectedTab === "results" ? "is-active" : ""}" data-action="operator-version-detail-tab" data-id="${escapeAttr(dataVersion.id)}" data-tab="results">训练结果${weights.length ? `（${weights.length}）` : ""}</button>
    </div>
    ${selectedTab === "results" ? renderUnifiedOperatorTrainingResults(dataVersion, weights) : `<div class="unified-version-data-grid">
      <article><span>数据划分</span><strong>${renderClickableDatasetSplit(dataVersion)}</strong></article>
      <article><span>标注类别</span>${renderDatasetVersionAnnotationSummary(dataVersion)}</article>
      <article><span>质量评估</span><strong>${dataVersion.qualityScore || "未评估"}</strong></article>
      <article><span>数据状态</span><strong>${escapeHtml(status)}</strong></article>
      <div class="unified-version-data-actions">
        ${status === "已发布" ? '<span class="table-muted">数据快照已冻结</span>' : `<button class="secondary-btn" data-action="annotate-dataset-version" data-id="${escapeAttr(dataVersion.id)}">继续标注</button><button class="secondary-btn" data-action="evaluate-dataset-version" data-id="${escapeAttr(dataVersion.id)}">质量评估</button><button class="primary-btn" data-action="publish-dataset-version" data-id="${escapeAttr(dataVersion.id)}"${dataVersion.qualityScore ? "" : " disabled"}>发布并进入待训练</button>`}
      </div>
    </div>`}
  </div>`;
}

function renderUnifiedOperatorTrainingResults(dataVersion, weights) {
  if (!weights.length) return `<div class="unified-version-empty-result"><span>该算子版本尚未训练。</span>${getDatasetVersionStatus(dataVersion) === "已发布" ? `<button class="primary-btn" data-action="train-operator-version" data-id="${escapeAttr(dataVersion.id)}">开始训练</button>` : '<span class="table-muted">发布数据后可开始训练</span>'}</div>`;
  return `<div class="unified-training-result-list">${weights.map((weight, index) => `<article>
    <div><strong>训练 ${weights.length - index}</strong>${renderModelVersionStatus(weight.status)}</div>
    <span>训练配置：默认参数</span>
    <span>指标：${weight.metrics ? `P ${weight.metrics.precision}% · R ${weight.metrics.recall}% · 误检率 ${weight.metrics.falseAlarm}%` : "--"}</span>
    <span>完成时间：${formatDateTime(weight.createdAt)}</span>
    <div class="table-actions"><button data-action="test-model-version" data-id="${escapeAttr(weight.id)}"${weight.status === "训练完成" ? "" : " disabled"}>测试</button><button data-action="download-model-version" data-id="${escapeAttr(weight.id)}"${weight.status === "训练完成" ? "" : " disabled"}>下发</button></div>
  </article>`).join("")}</div>`;
}

function renderOperatorVersionListModalTable(dataVersions, weightVersions) {
  if (!dataVersions.length) return `<div class="empty-state"><strong>暂无算子版本</strong><span>创建算子版本后会显示在这里。</span></div>`;
  return `<div class="platform-table-wrap operator-version-modal-table-wrap">
    <table class="platform-data-table operator-version-modal-table">
      <thead><tr><th>版本</th><th>状态</th><th>数据划分</th><th>数据质量</th><th>训练结果</th><th>创建时间</th></tr></thead>
      <tbody>${dataVersions.map((dataVersion, index) => {
        const weights = weightVersions.filter((weight) => weight.datasetVersionId === dataVersion.id);
        const latestWeight = weights[0] || null;
        const split = dataVersion.split || {};
        return `<tr>
          <td><strong>${escapeHtml(getDatasetVersionShortName(dataVersion))}</strong>${index === 0 ? '<span class="operator-version-latest-tag">当前</span>' : ""}</td>
          <td>${renderUnifiedOperatorVersionStatus(getUnifiedOperatorVersionStatus(dataVersion, latestWeight))}</td>
          <td>训练 ${split.train || 0} / 验证 ${split.val || 0} / 测试 ${split.test || 0}</td>
          <td>${dataVersion.qualityScore || "未评估"}</td>
          <td class="model-version-metrics">${latestWeight?.metrics ? `P ${latestWeight.metrics.precision}% · R ${latestWeight.metrics.recall}% · 误检率 ${latestWeight.metrics.falseAlarm}%` : latestWeight ? escapeHtml(latestWeight.status) : "尚未训练"}</td>
          <td>${formatDateTime(dataVersion.createdAt)}</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  </div>`;
}

function renderOperatorDeployDescriptor(operator, currentWeight) {
  const descriptor = [
    ["平台算子实例 ID", operator.id],
    ["算子配置修订号", `op-rev-${operator.updatedAt?.slice(0, 10) || "demo"}`],
    ["算子类别", operator.type],
    ["输入输出契约", operator.type === "图像分类" ? "输入图像，输出类别与置信度" : "输入图像，输出目标框/类别/置信度"],
    ["当前权重 ID", currentWeight?.id || "暂无"],
    ["权重文件", currentWeight ? `${operator.id}-${currentWeight.version}.onnx · sha256: demo-${currentWeight.id.slice(-6)}` : "待训练"],
  ];
  return `<div class="operator-deploy-grid">${descriptor.map(([key, value]) => `<article><span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}</div>`;
}

function renderTrainingRecords() {
  const model = getSelectedModel();
  const versions = getModelVersions(model.id);
  els.main.innerHTML = `
    <section class="platform-table-page training-record-page model-detail-page">
      <div class="scene-detail-head">
        <div class="model-breadcrumb">
          <button data-action="back-models">算子管理</button>
          <span>›</span>
          <strong>${escapeHtml(model.name)}</strong>
        </div>
        <button class="primary-btn" data-action="new-training">选择数据集训练</button>
      </div>
      <section class="detail-panel">
        <div class="detail-panel-head">
          <h2>算子版本</h2>
        </div>
        ${renderModelVersionTable(versions)}
      </section>
    </section>
  `;
}

function renderModelVersionTable(versions) {
  if (!versions.length) return `<div class="empty-state"><strong>暂无算子版本</strong><span>请选择数据集版本并开始训练。</span></div>`;
  return `
      <div class="platform-table-wrap">
        <table class="platform-data-table model-version-table">
          <thead><tr><th style="width:90px">版本</th><th style="width:130px">状态</th><th>引用数据集版本</th><th style="width:90px">样本数</th><th style="width:280px">指标</th><th style="width:170px">创建时间</th><th style="width:230px">操作</th></tr></thead>
          <tbody>
            ${versions
              .map((version) => {
                const datasetVersion = getDatasetVersion(version.datasetVersionId);
                const canDelete = !version.recommended && versions.length > 1;
                return `<tr>
                  <td>${escapeHtml(version.version)}</td>
                  <td>${renderModelVersionStatus(version.status)}</td>
                  <td>${renderDatasetVersionLink(datasetVersion)}</td>
                  <td>${version.sampleCount || 0}</td>
                  <td class="model-version-metrics">${version.metrics ? `Precision ${version.metrics.precision}% · Recall ${version.metrics.recall}% · 误检率 ${version.metrics.falseAlarm}%` : "--"}</td>
                  <td>${formatDateTime(version.createdAt)}</td>
                  <td class="table-actions">${renderModelVersionActions(version, datasetVersion, canDelete)}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
  `;
}

function renderDatasetVersionLink(datasetVersion) {
  if (!datasetVersion) return "未关联";
  return `<button class="table-link dataset-version-link" data-action="open-dataset-version" data-id="${escapeAttr(datasetVersion.id)}">${escapeHtml(datasetVersion.name)}</button>`;
}

function renderTrainingDataVersionLink(datasetVersion) {
  if (!datasetVersion) return "未关联";
  return `<button class="table-link dataset-version-link" data-action="open-dataset-version" data-id="${escapeAttr(datasetVersion.id)}">${escapeHtml(getDatasetVersionShortName(datasetVersion))}</button>`;
}

function renderModelVersionStatus(status) {
  if (status === "排队中") return `<span class="training-status is-queued">排队中</span>`;
  if (status === "训练中") return `<span class="training-status is-training">训练中</span>`;
  if (status === "训练完成") return `<span class="training-status is-done">训练完成</span>`;
  if (status === "训练失败") return `<span class="training-status is-failed">训练失败</span>`;
  return `<span class="training-status is-pending">待训练</span>`;
}

function renderModelVersionActions(version, datasetVersion, canDelete) {
  const isDone = version.status === "训练完成";
  const activeTraining = version.status === "排队中" || version.status === "训练中";
  return `
    <button data-action="open-dataset-version" data-id="${escapeAttr(datasetVersion?.id || "")}"${datasetVersion ? "" : " disabled"}>查看训练数据</button>
    <button data-action="test-model-version" data-id="${escapeAttr(version.id)}"${isDone ? "" : " disabled"}>测试</button>
    <button data-action="download-model-version" data-id="${escapeAttr(version.id)}"${isDone ? "" : " disabled"}>下载权重</button>
    <button class="danger-link" data-action="delete-model-version" data-id="${escapeAttr(version.id)}"${canDelete && !activeTraining ? "" : ' disabled title="当前推荐版本、唯一版本或训练中的版本暂不支持删除"'}>删除</button>
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

function renderPublicData() {
  const keyword = (ui.libraryQuery || "").trim().toLowerCase();
  const folders = getPublicImageFolders()
    .map((folder) => {
      const images = getPublicFolderImages(folder.id);
      return {
        ...folder,
        count: images.length,
        cover: images[0]?.url || folder.cover || "",
        latestAt: images.map((image) => image.capturedAt || "").sort().reverse()[0] || folder.updatedAt || folder.createdAt || "",
      };
    })
    .filter((folder) => !keyword || `${folder.name}`.toLowerCase().includes(keyword));
  const allFolders = getPublicImageFolders();
  const totalImages = allFolders.reduce((sum, folder) => sum + getPublicFolderImages(folder.id).length, 0);
  els.main.innerHTML = `
    <section class="platform-table-page library-root-page public-data-page">
      <div class="library-page-head">
        <div><h1>图像库</h1></div>
      </div>
      <div class="library-actionbar">
        <div class="segmented-control">
          ${renderIconButton({ icon: "list", label: "列表", className: ui.libraryMode === "list" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="list"' })}
          ${renderIconButton({ icon: "grid", label: "宫格", className: ui.libraryMode === "grid" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="grid"' })}
        </div>
        <span>${allFolders.length} 个文件夹 · ${totalImages} 张图像</span>
        <span class="library-action-spacer"></span>
        <input id="libraryQueryInput" value="${escapeAttr(ui.libraryQuery)}" placeholder="请输入文件夹名称" />
        <button class="secondary-btn" data-action="search-library">查询</button>
        <button class="ghost-btn" data-action="reset-library-search">重置</button>
      </div>
      ${
        ui.libraryMode === "grid"
          ? `<div class="library-folder-grid">${folders.map(renderPublicFolderCard).join("")}</div>`
          : renderPublicFolderTable(folders)
      }
      ${folders.length ? renderPager(folders.length) : `<div class="empty-state"><strong>暂无匹配文件夹</strong></div>`}
    </section>
  `;
}

function renderPublicFolderTable(folders) {
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table public-folder-table">
        <thead><tr><th>文件夹名称</th><th>图像数量</th><th>最近图像时间</th><th style="width:120px">操作</th></tr></thead>
        <tbody>${folders
          .map((folder) => `<tr>
            <td><button class="library-folder-name" data-action="open-public-folder" data-id="${escapeAttr(folder.id)}"><span class="library-folder-icon"></span>${escapeHtml(folder.name)}</button></td>
            <td>${folder.count}</td>
            <td>${formatDateTime(folder.latestAt) || "—"}</td>
            <td class="table-actions"><button data-action="open-public-folder" data-id="${escapeAttr(folder.id)}">打开</button></td>
          </tr>`)
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderPublicFolderCard(folder) {
  return `
    <article class="library-folder-tile" data-action="open-public-folder" data-id="${escapeAttr(folder.id)}">
      <div class="library-folder-cover">
        ${folder.cover ? `<img src="${escapeAttr(folder.cover)}" alt="" />` : `<span class="library-folder-icon is-large"></span>`}
      </div>
      <div class="library-folder-meta">
        <strong>${escapeHtml(folder.name)}</strong>
        <span>${folder.count} 张图像</span>
        <small>${formatDateTime(folder.latestAt) || "暂无图像"}</small>
      </div>
    </article>
  `;
}

function renderPublicDataFolder() {
  const folder = getPublicImageFolders().find((item) => item.id === ui.selectedFolderId);
  if (!folder) return setView("public-data");
  const images = getPublicDataImages(folder.id);
  const allSelected = images.length > 0 && images.every((image) => librarySelection.has(image.id));
  const devices = Array.from(new Set(getPublicFolderImages(folder.id).map((image) => image.device || image.sourceContext?.clientName || "").filter(Boolean)));
  const isReturnFolder = folder.id === "folder_operator_returns";
  els.main.innerHTML = `
    <section class="platform-table-page library-folder-page public-data-page">
      <div class="library-page-head">
        <div class="model-breadcrumb">
          <button data-action="back-public-data">图像库</button>
          <span>›</span>
          <strong>${escapeHtml(folder.name)}</strong>
        </div>
      </div>
      <div class="library-actionbar">
        <div class="segmented-control">
          ${renderIconButton({ icon: "list", label: "列表", className: ui.libraryMode === "list" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="list"' })}
          ${renderIconButton({ icon: "grid", label: "宫格", className: ui.libraryMode === "grid" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="grid"' })}
        </div>
        <select id="libraryDeviceSelect" aria-label="数据来源">
          <option value="all">请选择来源</option>
          ${devices.map((device) => `<option value="${escapeAttr(device)}"${ui.libraryDevice === device ? " selected" : ""}>${escapeHtml(device)}</option>`).join("")}
        </select>
        <button class="secondary-btn" data-action="toggle-library-all">${allSelected ? "取消全选" : "全选当前结果"}</button>
        ${isReturnFolder ? `<span class="library-scope-note">已归属算子的回流资产；处理请进入对应算子样本池</span>` : `<button class="primary-btn" data-action="new-model">创建独立算子</button><button class="secondary-btn" data-action="noop"${librarySelection.size ? "" : " disabled"}>加入已有算子</button>`}
        <span class="library-action-spacer"></span>
        <input id="libraryQueryInput" value="${escapeAttr(ui.libraryQuery)}" placeholder="请输入图像名称" />
        <button class="secondary-btn" data-action="search-library">查询</button>
        <button class="ghost-btn" data-action="reset-library-search">重置</button>
      </div>
      ${images.length ? (ui.libraryMode === "grid" ? renderPublicDataGrid(images) : renderPublicDataTable(images)) : `<div class="empty-state"><strong>当前文件夹暂无图像</strong></div>`}
      ${renderPager(images.length)}
    </section>
  `;
}

function getPublicDataImages(folderId) {
  const keyword = (ui.libraryQuery || "").trim().toLowerCase();
  return getPublicFolderImages(folderId)
    .map((image) => ({ ...image, publicSource: getPublicImageSource(image) }))
    .filter((image) => ui.libraryDevice === "all" || image.device === ui.libraryDevice || image.sourceContext?.clientName === ui.libraryDevice)
    .filter((image) => !keyword || `${image.name} ${image.device || ""}`.toLowerCase().includes(keyword));
}

function getPublicImageFolders() {
  const operatorReturnImages = getOperatorReturnImages();
  const folders = (state.folders || []).slice();
  if (operatorReturnImages.length) {
    folders.unshift({
      id: "folder_operator_returns",
      name: "算子回流",
      cover: operatorReturnImages[0]?.url || "",
      createdAt: operatorReturnImages[0]?.capturedAt || "",
      updatedAt: operatorReturnImages[0]?.capturedAt || "",
    });
  }
  return folders;
}

function getPublicFolderImages(folderId) {
  if (folderId === "folder_operator_returns") return getOperatorReturnImages();
  return getFolderImages(folderId);
}

function getOperatorReturnImages() {
  const imageMap = new Map();
  getDatasets().forEach((dataset) => {
    (dataset.sampleIds || []).forEach((imageId) => {
      const image = getImage(imageId);
      if (!image || image.libraryDeleted) return;
      const meta = dataset.sampleMeta?.[imageId] || {};
      const feedbackType = meta.feedbackType || image.feedbackType || "";
      const isReturn = ["capture", "inspection"].includes(feedbackType) || image.sourceContext?.clientName || String(image.source || "").includes("client");
      if (!isReturn) return;
      imageMap.set(image.id, {
        ...image,
        operatorDatasetId: dataset.id,
        operatorDatasetName: dataset.name,
        operatorId: dataset.linkedModelId || "",
      });
    });
  });
  return Array.from(imageMap.values()).sort((a, b) => String(b.capturedAt || "").localeCompare(String(a.capturedAt || "")));
}

function getPublicImageSource(image) {
  if (image.source === "client-unlinked-operator") return "客户端未关联算子回流";
  if (image.sourceContext?.clientName || String(image.source || "").includes("client")) return "客户端回流";
  if (image.device) return "检测记录手动上传";
  return "本地上传";
}

function getPublicImageOwnership(image) {
  const dataset = getDatasets().find((item) => (item.sampleIds || []).includes(image.id));
  if (!dataset) return { label: "未归属", operatorId: "", datasetName: "" };
  return { label: "已归属", operatorId: dataset.linkedModelId || image.operatorId || "", datasetName: dataset.name };
}

function renderPublicPrediction(image) {
  const count = Number(image.predictionCount || 0);
  if (image.hasPrediction || count > 0) return `<span class="training-status is-training">检测框 ${count} 个</span>`;
  return '<span class="table-muted">无</span>';
}

function renderPublicDataTable(images) {
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table public-data-table">
        <thead><tr><th style="width:48px"></th><th>图像</th><th>来源</th><th>采集时间</th><th>推理结果</th><th>归属状态</th><th style="width:180px">操作</th></tr></thead>
        <tbody>${images
          .map((image) => {
            const ownership = getPublicImageOwnership(image);
            return `<tr class="${librarySelection.has(image.id) ? "is-selected" : ""}">
              <td><input type="checkbox" data-action="toggle-library-image" data-id="${escapeAttr(image.id)}"${librarySelection.has(image.id) ? " checked" : ""} /></td>
              <td><button class="library-image-name" data-action="open-image-detail" data-id="${escapeAttr(image.id)}"><img src="${escapeAttr(image.url)}" alt="" /><span>${escapeHtml(image.name)}</span></button></td>
              <td>${escapeHtml(image.publicSource)}</td>
              <td>${formatDateTime(image.capturedAt)}</td>
              <td>${renderPublicPrediction(image)}</td>
              <td><span class="training-status ${ownership.label === "已归属" ? "is-done" : "is-pending"}">${escapeHtml(ownership.label)}${ownership.datasetName ? ` · ${escapeHtml(ownership.datasetName.replace(/数据集|算子数据/g, ""))}` : ""}</span></td>
              <td class="table-actions">${ownership.operatorId ? `<button data-action="training-records" data-id="${escapeAttr(ownership.operatorId)}">进入算子</button>` : `<button data-action="new-model">创建算子</button><button data-action="noop">加入算子</button>`}</td>
            </tr>`;
          })
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderPublicDataGrid(images) {
  return `
    <div class="library-image-grid public-data-grid">
      ${images
        .map((image) => {
          const ownership = getPublicImageOwnership(image);
          return `<article class="library-image-tile${librarySelection.has(image.id) ? " is-selected" : ""}">
            <input type="checkbox" data-action="toggle-library-image" data-id="${escapeAttr(image.id)}"${librarySelection.has(image.id) ? " checked" : ""} aria-label="选择 ${escapeAttr(image.name)}" />
            <button class="library-image-preview" data-action="open-image-detail" data-id="${escapeAttr(image.id)}">
              <img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.name)}" />
              <span><strong title="${escapeAttr(image.name)}">${escapeHtml(image.name)}</strong><small>${escapeHtml(image.publicSource)} · ${escapeHtml(ownership.label)}</small></span>
            </button>
          </article>`;
        })
        .join("")}
    </div>
  `;
}

function renderLibrary() {
  const datasets = getDatasets();
  els.main.innerHTML = `
    <section class="platform-table-page library-root-page">
      <div class="library-page-head">
        <div><h1>数据集</h1></div>
      </div>
      <div class="library-actionbar">
        <div class="segmented-control">
          ${renderIconButton({ icon: "list", label: "列表", className: ui.libraryMode === "list" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="list"' })}
          ${renderIconButton({ icon: "grid", label: "宫格", className: ui.libraryMode === "grid" ? "is-active" : "", attrs: 'data-action="library-mode" data-id="grid"' })}
        </div>
        <span>${datasets.length} 个数据集 · ${datasets.reduce((sum, dataset) => sum + dataset.sampleIds.length, 0)} 张图像</span>
        <div class="library-action-spacer"></div>
        <button class="primary-btn" data-action="new-folder">新建数据集</button>
      </div>
      ${
        ui.libraryMode === "grid"
          ? `<div class="library-folder-grid">${datasets.map(renderDatasetCard).join("")}</div>`
          : `<div class="platform-table-wrap">
              <table class="platform-data-table">
                <thead><tr><th>数据集名称</th><th>算法类型</th><th>图像池</th><th>版本数</th><th>最新版本</th><th>关联算子数</th><th>更新时间</th><th style="width:140px">操作</th></tr></thead>
                <tbody>${datasets
                  .map(
                    (dataset) => {
                      const stats = getDatasetStats(dataset);
                      const latestVersion = getDatasetVersion(dataset.latestVersionId);
                      const linkedModels = getDatasetLinkedModels(dataset.id);
                      return `<tr>
                      <td><button class="library-folder-name" data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}"><span class="library-folder-icon"></span>${escapeHtml(dataset.name)}</button></td>
                      <td>${escapeHtml(dataset.taskType)}</td>
                      <td>${stats.total}</td>
                      <td>${getDatasetVersions(dataset.id).length}</td>
                      <td>${latestVersion ? escapeHtml(getDatasetVersionShortName(latestVersion)) : "暂无"}</td>
                      <td>${linkedModels.length}</td>
                      <td>${formatDateTime(dataset.updatedAt)}</td>
                      <td class="table-actions">
                        <button data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}">查看详情</button>
                      </td>
                    </tr>`;
                    },
                  )
                  .join("")}</tbody>
              </table>
            </div>`
      }
      ${renderPager(datasets.length)}
    </section>
  `;
}

function renderDatasetCard(dataset) {
  const stats = getDatasetStats(dataset);
  const linkedModels = getDatasetLinkedModels(dataset.id);
  return `
    <article class="library-folder-tile dataset-card" data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}">
      <div class="library-folder-cover">
        ${getDatasetCover(dataset) ? `<img src="${escapeAttr(getDatasetCover(dataset))}" alt="" />` : `<span class="library-folder-icon is-large"></span>`}
      </div>
      <div class="library-folder-meta">
        <strong>${escapeHtml(dataset.name)}</strong>
        <span>${stats.total} 张图像 · ${getDatasetVersions(dataset.id).length} 个版本</span>
        <small>${escapeHtml(dataset.taskType)} · 关联算子 ${linkedModels.length} 个</small>
      </div>
      <div class="library-tile-actions">
        ${renderIconButton({ icon: "edit", label: `智能标注 ${dataset.name}`, className: "library-tile-action", attrs: `data-action="dataset-annotate" data-id="${escapeAttr(dataset.id)}"` })}
        ${renderIconButton({ icon: "check", label: `数据体检 ${dataset.name}`, className: "library-tile-action", attrs: `data-action="dataset-quality" data-id="${escapeAttr(dataset.id)}"` })}
      </div>
    </article>
  `;
}

function renderLibraryFolderCard(folder) {
  return renderDatasetCard(getDataset(folder.id) || { id: folder.id, name: folder.name, taskType: "目标检测", sampleIds: getFolderImages(folder.id).map((image) => image.id), pendingIds: [], confirmedIds: [], reviewIds: [], excludedIds: [] });
}

function renderDatasetVersionTable(versions) {
  if (!versions.length) return `<div class="empty-state"><strong>暂无数据集版本</strong><span>从图像池选择已标注图像后，可生成一个冻结版本。</span></div>`;
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table dataset-version-table">
        <thead><tr><th>版本名称</th><th>状态</th><th>数据划分</th><th>标注类别</th><th>质量评估</th><th>创建时间</th><th>用途</th><th style="width:160px">操作</th></tr></thead>
        <tbody>
          ${versions
            .map((version) => {
              const status = getDatasetVersionStatus(version);
              const evaluated = Boolean(version.qualityScore);
              const usedModels = getModelVersionsByDatasetVersion(version.id)
                .map((modelVersion) => {
                  const model = getModelById(modelVersion.modelId);
                  return model ? `${escapeHtml(model.name)} ${escapeHtml(modelVersion.version)}` : escapeHtml(modelVersion.version);
                })
                .join("、");
              return `<tr>
                <td>${escapeHtml(version.name)}</td>
                <td>${renderDatasetVersionStatus(status)}</td>
                <td>${renderDatasetSplit(version)}</td>
                <td>${renderDatasetVersionAnnotationSummary(version)}</td>
                <td>${renderDatasetVersionQualityCell(version)}</td>
                <td>${formatDateTime(version.createdAt)}</td>
                <td>${usedModels || "暂未训练"}</td>
                <td class="table-actions">
                  ${
                    status === "已发布"
                      ? '<span class="table-muted">—</span>'
                      : `<button data-action="annotate-dataset-version" data-id="${escapeAttr(version.id)}">继续标注</button><button class="dataset-version-publish" data-action="publish-dataset-version" data-id="${escapeAttr(version.id)}"${evaluated ? "" : ' disabled title="请先完成质量评估"'}>发布</button>`
                  }
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDatasetSplit(version) {
  const split = version.split || createVersionSplit(version.sampleCount || 0);
  return `训练 ${split.train || 0} / 验证 ${split.val || 0} / 测试 ${split.test || 0}`;
}

function renderDatasetVersionAnnotationSummary(version) {
  const summary = getDatasetVersionAnnotationSummary(version);
  if (!summary.length) return '<span class="table-muted">暂无标注</span>';
  return `<div class="annotation-summary">${summary.map((item) => `<span><b>${escapeHtml(item.label)}</b>${item.count}</span>`).join("")}</div>`;
}

function renderDatasetVersionQualityCell(version) {
  if (!version.qualityScore) {
    return `<button class="table-link dataset-quality-action" data-action="evaluate-dataset-version" data-id="${escapeAttr(version.id)}">质量评估</button>`;
  }
  return `<button class="dataset-quality-score" data-action="show-dataset-version-quality" data-id="${escapeAttr(version.id)}"><strong>${version.qualityScore}</strong><span>查看详情</span></button>`;
}

function getDatasetVersionAnnotationSummary(version) {
  if (Array.isArray(version?.annotationSummary) && version.annotationSummary.length) return version.annotationSummary;
  const dataset = getDataset(version?.datasetId);
  const total = Number(version?.annotationCount || version?.sampleCount || 0);
  return createDatasetVersionAnnotationSummary(dataset, total, version);
}

function createDatasetVersionAnnotationSummary(dataset, total, version = null) {
  if (!total) return [];
  const name = `${dataset?.name || ""} ${version?.name || ""}`;
  if (/气泡|划痕|划伤/.test(name)) {
    const bubble = Math.max(1, Math.round(total * 0.65));
    const scratch = Math.max(0, total - bubble);
    return [
      { label: "气泡", count: bubble },
      { label: /划伤/.test(name) ? "划伤" : "划痕", count: scratch },
    ].filter((item) => item.count > 0);
  }
  if (/齿面/.test(name)) return [{ label: "齿面", count: total }];
  if (/背板|缺陷|codex|NG/i.test(name)) return [{ label: /codex|NG/i.test(name) ? "NG" : "缺陷", count: total }];
  if (/OCR|字符|喷码/.test(name)) return [{ label: "字符区域", count: total }];
  if (/分类/.test(dataset?.taskType || "")) return [{ label: "类别样本", count: total }];
  return [{ label: "目标", count: total }];
}

function getDatasetVersionQualityItems(version) {
  const split = version.split || createVersionSplit(version.sampleCount || 0);
  const annotationSummary = getDatasetVersionAnnotationSummary(version);
  const sampleCount = Number(version.sampleCount || 0);
  const annotationCount = Number(version.annotationCount || 0);
  const baseScore = Number(version.qualityScore || 0);
  return [
    {
      title: "样本划分",
      score: split.train && split.val && split.test ? Math.min(96, baseScore + 4) : Math.max(60, baseScore - 12),
      desc: `训练 ${split.train || 0} / 验证 ${split.val || 0} / 测试 ${split.test || 0}`,
    },
    {
      title: "标注覆盖",
      score: sampleCount ? Math.min(98, Math.round((annotationCount / sampleCount) * 100)) : 0,
      desc: `${annotationCount} 个标注 / ${sampleCount} 张样本`,
    },
    {
      title: "类别分布",
      score: annotationSummary.length > 1 ? Math.max(70, baseScore - 3) : Math.max(68, baseScore - 6),
      desc: annotationSummary.map((item) => `${item.label} ${item.count}`).join("，") || "暂无类别统计",
    },
    {
      title: "异常风险",
      score: Math.max(60, baseScore - 2),
      desc: "检查空标注、越界框、重复样本等基础风险",
    },
  ];
}

function openDatasetVersionQuality(versionId) {
  const version = getDatasetVersion(versionId);
  if (!version) return;
  modal = { type: "dataset-version-quality", versionId };
  renderModal();
}

function openDatasetVersionAnnotation(versionId) {
  const version = getDatasetVersion(versionId);
  const dataset = version ? getDataset(version.datasetId) : null;
  if (!version || !dataset) return showToast("未找到数据集版本");
  if (getDatasetVersionStatus(version) === "已发布") return showToast("已发布版本不可修改，请创建新版本");
  const workState = getDatasetVersionWorkState(version, dataset);
  ui.selectedDatasetId = dataset.id;
  ui.selectedFolderId = dataset.id;
  ui.selectedDatasetVersionId = version.id;
  ui.datasetAnnotationQuery = "";
  ui.datasetAnnotationStatus = "pending";
  ui.activeImageId = (workState.pendingIds[0] || workState.reviewIds[0] || workState.confirmedIds[0] || workState.sampleIds[0] || "");
  saveUi();
  setView("dataset-annotation");
}

function openVersionPreannotationModal() {
  const dataset = getDataset(ui.selectedDatasetId);
  const operator = dataset ? getModelById(dataset.linkedModelId) || getDatasetLinkedModels(dataset.id)[0] : null;
  if (!dataset || !operator) return showToast("未找到当前算子");
  const versions = getOperatorWeightVersions(operator.id).filter((version) => version.status === "训练完成");
  if (!versions.length) return showToast("当前算子还没有可用于预标注的已训练版本");
  const workState = getDatasetVersionWorkState(getActiveDatasetVersion(dataset.id), dataset);
  const query = (ui.datasetAnnotationQuery || "").trim().toLowerCase();
  const imageIds = workState.pendingIds.filter((id) => {
    const image = getImage(id);
    return image && (!query || `${image.name} ${image.device || ""}`.toLowerCase().includes(query));
  });
  if (!imageIds.length) return showToast("当前待标注列表为空");
  modal = {
    type: "version-preannotation",
    operatorId: operator.id,
    imageIds,
    weightVersionId: versions[0].id,
  };
  renderModal();
}

function confirmVersionPreannotation() {
  if (modal?.type !== "version-preannotation") return;
  const dataset = getDataset(ui.selectedDatasetId);
  const weightVersionId = document.getElementById("modalPreannotationVersion")?.value || modal.weightVersionId;
  const weightVersion = getOperatorWeightVersions(modal.operatorId).find((version) => version.id === weightVersionId);
  if (!dataset || !weightVersion) return showToast("请选择可用的算子版本");
  const dataVersion = getActiveDatasetVersion(dataset.id);
  const workState = getDatasetVersionWorkState(dataVersion, dataset);
  const targetIds = modal.imageIds.filter((id) => workState.pendingIds.includes(id));
  targetIds.forEach((id, index) => {
    workState.pendingIds = workState.pendingIds.filter((item) => item !== id);
    if (!workState.reviewIds.includes(id)) workState.reviewIds.push(id);
    workState.preannotationCounts = { ...(workState.preannotationCounts || {}), [id]: 1 + (index % 2) };
    workState.preannotationVersionIds = { ...(workState.preannotationVersionIds || {}), [id]: weightVersion.id };
  });
  syncDatasetVersionWorkState(dataVersion, workState);
  dataVersion.preannotationCounts = { ...(dataVersion.preannotationCounts || {}), ...(workState.preannotationCounts || {}) };
  dataVersion.preannotationVersionIds = { ...(dataVersion.preannotationVersionIds || {}), ...(workState.preannotationVersionIds || {}) };
  dataset.updatedAt = new Date().toISOString();
  ui.datasetAnnotationStatus = "confirm";
  ui.activeImageId = targetIds[0] || "";
  saveState();
  closeModal();
  saveUi();
  showToast(`已使用 ${String(weightVersion.version || "").toUpperCase()} 为 ${targetIds.length} 张图像生成预标注，请逐张确认`);
  render();
}

function prepareOperatorNewVersion(datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) return showToast("未找到算子样本池");
  const sampleIds = (dataset.sampleIds || []).filter((id) => Boolean(getImage(id)));
  if (!sampleIds.length) return showToast("算子样本池为空，请先添加样本");
  let draft = getDatasetVersions(dataset.id).find((version) => getDatasetVersionStatus(version) !== "已发布") || null;
  if (!draft) {
    const latest = getDatasetVersions(dataset.id)[0] || null;
    draft = createDatasetVersion(dataset.id, {
      name: `${dataset.name} v${getDatasetVersions(dataset.id).length + 1}`,
      sourceMode: latest ? "latest" : "pool",
      sourceVersionId: latest?.id || "",
      poolScope: "all",
    });
  }
  if (!draft) return;
  const current = getDatasetVersionWorkState(draft, dataset);
  const confirmedIds = current.confirmedIds.filter((id) => sampleIds.includes(id));
  const reviewIds = current.reviewIds.filter((id) => sampleIds.includes(id));
  const excludedIds = current.excludedIds.filter((id) => sampleIds.includes(id));
  const pendingIds = sampleIds.filter((id) => !confirmedIds.includes(id) && !reviewIds.includes(id) && !excludedIds.includes(id));
  syncDatasetVersionWorkState(draft, { sampleIds, pendingIds, confirmedIds, reviewIds, excludedIds });
  dataset.latestVersionId = draft.id;
  dataset.updatedAt = new Date().toISOString();
  saveState();
  openDatasetVersionAnnotation(draft.id);
}

function getDatasetVersionShortName(version) {
  if (!version?.name) return "";
  const match = version.name.match(/\bv\d+$/i);
  return match ? match[0] : version.name;
}

function getDatasetLinkedModels(datasetId) {
  const versionIds = new Set(getDatasetVersions(datasetId).map((version) => version.id));
  const modelIds = new Set(
    (state.modelVersions || [])
      .filter((version) => versionIds.has(version.datasetVersionId))
      .map((version) => version.modelId),
  );
  const dataset = getDataset(datasetId);
  if (dataset?.linkedModelId) modelIds.add(dataset.linkedModelId);
  return Array.from(modelIds).map(getModelById).filter(Boolean);
}

function getDatasetVersionStatus(version) {
  if (!version) return "草稿";
  if (version.status) return version.status;
  return getModelVersionsByDatasetVersion(version.id).length ? "已发布" : "草稿";
}

function getActiveDatasetVersion(datasetId) {
  const selected = getDatasetVersion(ui.selectedDatasetVersionId);
  if (selected?.datasetId === datasetId) return selected;
  const versions = getDatasetVersions(datasetId);
  return versions.find((version) => getDatasetVersionStatus(version) !== "已发布") || versions[0] || null;
}

function getDatasetVersionWorkState(version, dataset) {
  const sampleIds = getDatasetVersionSampleIds(version, dataset);
  const confirmedIds = Array.isArray(version?.confirmedIds)
    ? version.confirmedIds.filter((id) => sampleIds.includes(id))
    : Array.isArray(version?.sampleIds)
      ? []
      : (dataset?.confirmedIds || []).filter((id) => sampleIds.includes(id));
  const reviewIds = Array.isArray(version?.reviewIds)
    ? version.reviewIds.filter((id) => sampleIds.includes(id))
    : Array.isArray(version?.sampleIds)
      ? []
      : (dataset?.reviewIds || []).filter((id) => sampleIds.includes(id));
  const excludedIds = Array.isArray(version?.excludedIds)
    ? version.excludedIds.filter((id) => sampleIds.includes(id))
    : Array.isArray(version?.sampleIds)
      ? []
      : (dataset?.excludedIds || []).filter((id) => sampleIds.includes(id));
  const pendingIds = Array.isArray(version?.pendingIds)
    ? version.pendingIds.filter((id) => sampleIds.includes(id))
    : sampleIds.filter((id) => !confirmedIds.includes(id) && !reviewIds.includes(id) && !excludedIds.includes(id));
  return { sampleIds, pendingIds, confirmedIds, reviewIds, excludedIds };
}

function getDatasetVersionSampleIds(version, dataset) {
  if (Array.isArray(version?.sampleIds)) return version.sampleIds.slice();
  if (Array.isArray(dataset?.confirmedIds) && dataset.confirmedIds.length && version?.id) return dataset.confirmedIds.slice();
  return (dataset?.sampleIds || []).slice();
}

function syncDatasetVersionWorkState(version, workState) {
  if (!version) return;
  version.sampleIds = workState.sampleIds.slice();
  version.pendingIds = workState.pendingIds.slice();
  version.confirmedIds = workState.confirmedIds.slice();
  version.reviewIds = workState.reviewIds.slice();
  version.excludedIds = workState.excludedIds.slice();
  version.sampleCount = version.sampleIds.length;
  version.split = createVersionSplit(version.sampleIds.length);
  version.annotationCount = version.confirmedIds.length;
  version.annotationSummary = createDatasetVersionAnnotationSummary(getDataset(version.datasetId), version.annotationCount, version);
  version.qualityScore = null;
  if (version.status === "已评估") version.status = "草稿";
}

function renderDatasetVersionStatus(status) {
  const className = status === "已发布" ? "is-done" : status === "已评估" ? "is-training" : "is-pending";
  return `<span class="training-status ${className}">${escapeHtml(status)}</span>`;
}

function createVersionSplit(sampleCount) {
  const train = Math.max(0, Math.round(sampleCount * 0.7));
  const val = Math.max(0, Math.round(sampleCount * 0.2));
  return { train, val, test: Math.max(0, sampleCount - train - val) };
}

function renderLibraryFolder() {
  const dataset = getDataset(ui.selectedDatasetId || ui.selectedFolderId) || getDatasets()[0];
  if (!dataset) return setView("library");
  const images = getFilteredDatasetImages(dataset.id);
  const allSelected = images.length > 0 && images.every((image) => librarySelection.has(image.id));
  const devices = Array.from(new Set(getDatasetImages(dataset.id).map((image) => image.device).filter(Boolean)));
  const stats = getDatasetStats(dataset);
  const versions = getDatasetVersions(dataset.id);
  const tab = ui.datasetDetailTab || "pool";
  els.main.innerHTML = `
    <section class="platform-table-page library-folder-page">
      <div class="library-page-head">
        <div class="dataset-title-row">
          <div class="model-breadcrumb">
            <button data-action="back-library">数据集</button>
            <span>›</span>
            <strong>${escapeHtml(dataset.name)}</strong>
          </div>
          <div class="scene-tabs dataset-inline-tabs">
            <button class="${tab === "pool" ? "is-active" : ""}" data-action="dataset-detail-tab" data-id="pool">图像池</button>
            <button class="${tab === "versions" ? "is-active" : ""}" data-action="dataset-detail-tab" data-id="versions">数据集版本</button>
          </div>
        </div>
      </div>
      ${tab === "versions" ? renderDatasetVersionsPanel(dataset, versions) : renderDatasetPoolPanel(dataset, images, allSelected, devices)}
    </section>
  `;
}

function renderDatasetPoolPanel(dataset, images, allSelected, devices) {
  return `
    <section class="detail-panel dataset-pool-panel">
      <div class="detail-panel-head">
        <h2>图像池</h2>
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
        <button class="secondary-btn" data-action="toggle-library-all">${allSelected ? "取消全选" : "全选当前结果"}</button>
        <button class="secondary-btn" data-action="export-library-selection"${librarySelection.size ? "" : " disabled"}>导出所选</button>
        <button class="secondary-btn danger-outline" data-action="delete-library-selection"${librarySelection.size ? "" : " disabled"}>删除所选</button>
        <span class="library-action-spacer"></span>
        <input id="libraryQueryInput" value="${escapeAttr(ui.libraryQuery)}" placeholder="请输入图像名称" />
        <button class="secondary-btn" data-action="search-library">查询</button>
        <button class="ghost-btn" data-action="reset-library-search">重置</button>
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

function renderDatasetVersionsPanel(dataset, versions) {
  return `
    <section class="detail-panel">
      <div class="detail-panel-head">
        <h2>数据集版本</h2>
        <button class="secondary-btn" data-action="dataset-version" data-id="${escapeAttr(dataset.id)}">创建版本</button>
      </div>
      ${renderDatasetVersionTable(versions)}
    </section>
  `;
}

function renderLibraryImageTable(images) {
  return `
    <div class="platform-table-wrap">
      <table class="platform-data-table library-image-table">
        <thead><tr><th style="width:48px"></th><th>名称</th><th>图像尺寸</th><th>采集时间</th><th>采集设备</th><th style="width:100px">操作</th></tr></thead>
        <tbody>${images
          .map(
            (image) => `<tr class="${librarySelection.has(image.id) ? "is-selected" : ""}">
              <td><input type="checkbox" data-action="toggle-library-image" data-id="${escapeAttr(image.id)}"${librarySelection.has(image.id) ? " checked" : ""} /></td>
              <td><button class="library-image-name" data-action="open-image-detail" data-id="${escapeAttr(image.id)}"><img src="${escapeAttr(image.url)}" alt="" /><span>${escapeHtml(image.name)}</span></button></td>
              <td>${escapeHtml(image.size || "1920 × 1080")}</td>
              <td>${formatDateTime(image.capturedAt) || ""}</td>
              <td>${escapeHtml(image.device || "")}</td>
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
              <span><strong title="${escapeAttr(image.name)}">${escapeHtml(image.name)}</strong><small>${escapeHtml(image.device || "未关联设备")}</small></span>
            </button>
          </article>`,
        )
        .join("")}
    </div>
  `;
}

function renderDatasetAnnotation() {
  const dataset = getDataset(ui.selectedDatasetId) || getDatasets()[0];
  if (!dataset) return setView("library");
  const version = getActiveDatasetVersion(dataset.id);
  const workState = getDatasetVersionWorkState(version, dataset);
  const query = (ui.datasetAnnotationQuery || "").trim().toLowerCase();
  const allowedStatuses = new Set(["pending", "confirm", "annotated"]);
  const statusFilter = allowedStatuses.has(ui.datasetAnnotationStatus) ? ui.datasetAnnotationStatus : "pending";
  const querySamples = workState.sampleIds
    .map(getImage)
    .filter((image) => image && !workState.excludedIds.includes(image.id))
    .filter((image) => !query || `${image.name} ${image.device || ""}`.toLowerCase().includes(query));
  const statusCounts = querySamples.reduce((counts, image) => {
    const key = getDatasetSampleStatusKey(workState, image.id);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, { pending: 0, confirm: 0, annotated: 0 });
  const splitFilter = statusFilter === "annotated" ? (ui.datasetAnnotationSplit || "all") : "all";
  const splitIds = splitFilter === "all" ? null : new Set(getDatasetAnnotationSplitIds(version, dataset, splitFilter));
  const samples = querySamples
    .filter((image) => getDatasetSampleStatusKey(workState, image.id) === statusFilter)
    .filter((image) => !splitIds || splitIds.has(image.id));
  const collapsedSources = new Set(ui.datasetAnnotationCollapsedSources || []);
  const sourceGroups = samples.reduce((groups, image) => {
    const source = getOperatorAdditionSource(image, dataset);
    let group = groups.find((item) => item.source === source);
    if (!group) {
      group = { source, images: [] };
      groups.push(group);
    }
    group.images.push(image);
    return groups;
  }, []);
  const activeQueue = samples.filter((image) => !workState.confirmedIds.includes(image.id));
  if (!ui.activeImageId || !samples.some((image) => image.id === ui.activeImageId)) {
    ui.activeImageId = (activeQueue[0] || samples[0] || {}).id || "";
  }
  const activeImage = getImage(ui.activeImageId);
  const activePreannotationVersionId = version?.preannotationVersionIds?.[ui.activeImageId];
  const activePreannotationVersion = activePreannotationVersionId
    ? getOperatorWeightVersions((getModelById(dataset.linkedModelId) || getDatasetLinkedModels(dataset.id)[0])?.id || "").find((item) => item.id === activePreannotationVersionId)
    : null;
  const readonly = getDatasetVersionStatus(version) === "已发布";
  const unfinishedCount = workState.pendingIds.length + workState.reviewIds.length;
  const canTrainVersion = Boolean(version && !readonly && workState.sampleIds.length && unfinishedCount === 0 && workState.confirmedIds.length === workState.sampleIds.length);
  const operator = getModelById(dataset.linkedModelId) || getDatasetLinkedModels(dataset.id)[0] || null;
  const contextTitle = `${operator ? getOperatorName(operator) : dataset.name.replace(/数据集|算子数据/g, "算子")} ${version ? `· ${getDatasetVersionShortName(version)}` : ""}`.trim();
  const canvasWidth = ui.canvasZoom === 1 ? "min(100%, 1120px)" : `${Math.round(1120 * ui.canvasZoom)}px`;
  els.main.innerHTML = `
    <section class="training-workspace dataset-annotation-workspace">
      <div class="dataset-annotation-list-head">
        <button class="dataset-annotation-exit" data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}">← 返回上级</button>
        <strong title="${escapeAttr(contextTitle)}">${escapeHtml(contextTitle)}</strong>
        <button class="primary-btn dataset-annotation-train" data-action="train-annotated-version" data-id="${escapeAttr(version?.id || "")}"${canTrainVersion ? "" : ` disabled title="${unfinishedCount ? `还有 ${unfinishedCount} 张样本未完成标注` : "请先完成全部样本标注"}"`}>开始训练</button>
      </div>
      <div class="training-body">
        <aside class="training-image-list">
          <div class="dataset-annotation-filterbar">
            <div class="dataset-annotation-tabs" role="tablist" aria-label="标注状态">
              ${[["pending", "待标注"], ["confirm", "待确认"], ["annotated", "已标注"]].map(([value, label]) => `<button role="tab" aria-selected="${statusFilter === value}" class="${statusFilter === value ? "is-active" : ""}" data-action="select-dataset-annotation-tab" data-id="${value}">${label}<span>${statusCounts[value] || 0}</span></button>`).join("")}
            </div>
            <input id="datasetAnnotationQueryInput" value="${escapeAttr(ui.datasetAnnotationQuery || "")}" placeholder="搜索图像名称" />
            ${statusFilter === "pending" && statusCounts.pending ? '<button class="secondary-btn dataset-version-preannotation" data-action="open-version-preannotation">版本预标注</button>' : ""}
            ${statusFilter === "annotated" ? `<div class="dataset-annotation-split-filter" aria-label="数据划分">
              ${[["all", "全部"], ["train", "训练集"], ["test", "测试集"]].map(([value, label]) => `<button class="${splitFilter === value ? "is-active" : ""}" data-action="select-dataset-annotation-split" data-id="${value}">${label}</button>`).join("")}
            </div>` : ""}
          </div>
          <div class="training-image-scroll">
            ${sourceGroups.map((group) => `<section class="dataset-annotation-source-group">
              <button class="dataset-annotation-source-head" data-action="toggle-dataset-annotation-source" data-id="${escapeAttr(group.source)}" aria-expanded="${!collapsedSources.has(group.source)}">
                <i>${collapsedSources.has(group.source) ? "▸" : "▾"}</i><strong>${escapeHtml(group.source)}</strong><span>${group.images.length} 张</span>
              </button>
              ${collapsedSources.has(group.source) ? "" : group.images.map((image) => `
                <div class="dataset-sample-row${image.id === ui.activeImageId ? " is-active" : ""}" data-action="select-dataset-sample" data-id="${escapeAttr(image.id)}">
                  <img src="${escapeAttr(image.url)}" alt="" />
                  <span><strong title="${escapeAttr(image.name)}">${escapeHtml(shortenName(image.name))}</strong><small>${escapeHtml(image.device || "未关联设备")}${statusFilter === "annotated" ? ` · ${escapeHtml(getDatasetAnnotationSplitLabel(version, dataset, image.id))}` : ""}</small></span>
                </div>`).join("")}
            </section>`).join("")}
          </div>
        </aside>
        <section class="annotation-stage">
          ${
            activeImage
              ? `<div class="annotation-toolbar">
                  ${renderIconButton({ icon: "minus", label: "缩小", className: "canvas-tool", attrs: 'data-action="canvas-zoom-out"', disabled: ui.canvasZoom <= 0.5 })}
                  ${renderIconButton({ icon: "plus", label: "放大", className: "canvas-tool", attrs: 'data-action="canvas-zoom-in"', disabled: ui.canvasZoom >= 2 })}
                  ${renderIconButton({ icon: "maximize", label: "适配窗口", className: "canvas-tool", attrs: 'data-action="canvas-fit"' })}
                  ${renderIconButton({ icon: "hand", label: "拖动画布", className: `canvas-tool${ui.canvasTool === "select" ? " is-active" : ""}`, attrs: 'data-action="canvas-tool" data-id="select"' })}
                  ${renderIconButton({ icon: "eye", label: "显示标注", className: "canvas-tool", attrs: 'data-action="noop"' })}
                  <span class="toolbar-divider"></span>
                  ${renderIconButton({ icon: "box", label: "矩形标注", className: `canvas-tool${ui.canvasTool === "rect" ? " is-active" : ""}`, attrs: 'data-action="canvas-tool" data-id="rect"', disabled: readonly })}
                  <span class="toolbar-divider"></span>
                  ${renderIconButton({ icon: "undo", label: "撤销", className: "canvas-tool", attrs: 'data-action="noop"', disabled: readonly })}
                  ${renderIconButton({ icon: "redo", label: "重做", className: "canvas-tool", attrs: 'data-action="noop"', disabled: readonly })}
                  ${renderIconButton({ icon: "stamp", label: "应用工具", className: "canvas-tool", attrs: 'data-action="noop"', disabled: readonly })}
                  ${activePreannotationVersion ? `<span class="annotation-version-chip">${escapeHtml(String(activePreannotationVersion.version || "").toUpperCase())} 预标注</span>` : ""}
                  <span class="annotation-toolbar-spacer"></span>
                  <button class="primary-btn annotation-complete-next" data-action="complete-sample-next"${activeImage && !readonly ? "" : " disabled"}>完成并下一张</button>
                </div>
                <div class="annotation-layout dataset-annotation-layout">
                  <div class="annotation-canvas-wrap">
                    <svg class="annotation-canvas" style="width:${canvasWidth}" viewBox="0 0 1000 625" aria-label="算子标注画布">
                      <image href="${escapeAttr(activeImage.url)}" x="0" y="0" width="1000" height="625" preserveAspectRatio="xMidYMid slice"></image>
                      ${workState.reviewIds.includes(activeImage.id) ? renderAssistBox(getAssistSuggestion(dataset, activeImage.id)) : ""}
                      <rect class="draw-surface" x="0" y="0" width="1000" height="625"></rect>
                    </svg>
                  </div>
                </div>`
              : `<div class="empty-state"><strong>${statusFilter === "pending" ? "暂无待标注样本" : statusFilter === "confirm" ? "暂无待确认样本" : "暂无已标注样本"}</strong></div>`
          }
        </section>
      </div>
    </section>
  `;
}

function renderDatasetQuality() {
  const dataset = getDataset(ui.selectedDatasetId) || getDatasets()[0];
  if (!dataset) return setView("library");
  const stats = getDatasetStats(dataset);
  const latestVersion = getDatasetVersion(dataset.latestVersionId);
  const warnings = [
    { title: "待标注样本", value: stats.pending, desc: "建议训练前完成确认或排除。" },
    { title: "待复核样本", value: stats.review, desc: "低置信度、疑似异常或抽检样本需要复核。" },
    { title: "小框/越界风险", value: dataset.reviewIds.length ? 1 : 0, desc: "Demo 模拟质量规则命中。" },
    { title: "相似样本", value: Math.max(0, stats.total - 3), desc: "固定相机位下可优先抽代表样本。" },
  ];
  els.main.innerHTML = `
    <section class="platform-table-page dataset-quality-page">
      <div class="library-page-head">
        <div class="library-folder-heading">
          ${renderIconButton({ icon: "back", label: "返回数据集", className: "library-back-btn", attrs: `data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}"` })}
          <div><h1>${escapeHtml(dataset.name)} · 数据体检</h1></div>
        </div>
        <button class="primary-btn" data-action="dataset-version" data-id="${escapeAttr(dataset.id)}">创建数据集版本</button>
      </div>
      <div class="dataset-metric-strip">
        ${renderDatasetMetric("样本", stats.total)}
        ${renderDatasetMetric("已确认", stats.confirmed)}
        ${renderDatasetMetric("待标注", stats.pending)}
        ${renderDatasetMetric("待复核", stats.review)}
        ${renderDatasetMetric("质量评分", latestVersion?.qualityScore || 76)}
      </div>
      <div class="quality-grid">
        <section class="quality-panel">
          <h2>质量风险</h2>
          ${warnings
            .map(
              (item) => `<div class="quality-row"><strong>${escapeHtml(item.title)}</strong><span>${item.value}</span><em>${escapeHtml(item.desc)}</em></div>`,
            )
            .join("")}
        </section>
        <section class="quality-panel">
          <h2>类别分布</h2>
          <div class="quality-bars">
            <div><span>OK</span><b style="width:42%"></b><em>42%</em></div>
            <div><span>NG</span><b style="width:38%"></b><em>38%</em></div>
            <div><span>待确认</span><b style="width:20%"></b><em>20%</em></div>
          </div>
          <p>Demo 以样本标签和确认状态模拟类别分布，正式实现应读取数据集标注统计。</p>
        </section>
        <section class="quality-panel">
          <h2>训练建议</h2>
          <p>建议先处理 ${stats.pending} 个待标注样本和 ${stats.review} 个待复核样本，再生成新的数据集版本。</p>
          <p>当前最新版本：${latestVersion ? escapeHtml(latestVersion.name) : "暂无"}</p>
          <button class="secondary-btn" data-action="train-dataset" data-id="${escapeAttr(dataset.id)}">基于当前数据集训练算子</button>
        </section>
      </div>
    </section>
  `;
}

function renderDatasetDerive() {
  const dataset = getDataset(ui.selectedDatasetId) || getDatasets()[0];
  if (!dataset) return setView("library");
  els.main.innerHTML = `
    <section class="platform-table-page dataset-derive-page">
      <div class="library-page-head">
        <div class="library-folder-heading">
          ${renderIconButton({ icon: "back", label: "返回数据集", className: "library-back-btn", attrs: `data-action="open-library-folder" data-id="${escapeAttr(dataset.id)}"` })}
          <div><h1>生成派生数据集</h1></div>
        </div>
      </div>
      <div class="derive-grid">
        <article class="derive-card">
          <strong>使用算子推理 ROI</strong>
          <p>由已有算子输出候选区域，再裁剪生成下游训练数据。适合齿面识别后生成气泡检测样本。</p>
          <button class="primary-btn" data-action="derive-model-roi">生成算子 ROI 派生数据集</button>
        </article>
        <article class="derive-card">
          <strong>使用人工绘制 ROI</strong>
          <p>由用户手动画出有效检测区域，排除背景干扰后生成训练样本。适合固定相机位和强背景干扰场景。</p>
          <button class="primary-btn" data-action="derive-manual-roi">生成人工 ROI 派生数据集</button>
        </article>
      </div>
      <div class="derive-preview">
        <h2>派生预览</h2>
        ${getDatasetImages(dataset.id)
          .slice(0, 3)
          .map(
            (image) => `<figure><img src="${escapeAttr(image.url)}" alt=""><figcaption>${escapeHtml(shortenName(image.name))}<br>裁剪区域 720 × 480</figcaption></figure>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderClients() {
  const rows = getFilteredClients();
  els.main.innerHTML = `
    <section class="platform-table-page client-page">
      <div class="client-title-row">
        <div class="client-title-group">
          <h1>客户端管理</h1>
          <span class="inline-metric">客户端配额：${state.terminals.length}/${state.enterprise.clientQuota}</span>
        </div>
      </div>
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
    <div class="model-context" aria-label="当前算子信息">
      <span>算子</span>
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

function openOperatorVersionListModal(operatorId = "") {
  const operator = getOperators().find((item) => item.id === operatorId) || getSelectedOperator();
  if (!operator) return;
  modal = { type: "operator-version-list", operatorId: operator.id };
  renderModal();
}

function openTrainModelModal(datasetVersionId = "") {
  const model = getSelectedModel();
  const requestedVersion = datasetVersionId ? getDatasetVersion(datasetVersionId) : null;
  const linkedDataset = requestedVersion
    ? getDataset(requestedVersion.datasetId)
    : getDatasets().find((dataset) => dataset.linkedModelId === model.id) || getDatasets()[0];
  const publishedVersion = requestedVersion || (linkedDataset ? getDatasetVersions(linkedDataset.id).find((version) => getDatasetVersionStatus(version) === "已发布") : null);
  modal = {
    type: "train-model",
    modelId: model.id,
    datasetId: linkedDataset?.id || "",
    datasetVersionId: publishedVersion?.id || "",
  };
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

function openOperatorImagePicker(operatorId = "") {
  const operator = getModelById(operatorId) || getSelectedOperator();
  if (!operator) return;
  const dataset = getOperatorDatasets(operator.id)[0] || null;
  pickerSelection = new Set();
  modal = {
    type: "picker",
    mode: "operator-pool",
    operatorId: operator.id,
    datasetId: dataset?.id || "",
    folderId: state.folders[0]?.id || "",
    query: "",
  };
  renderModal();
}

function renderModal() {
  if (!modal) {
    modalRoot.innerHTML = "";
    return;
  }
  if (modal.type === "scene-template") {
    const template = getSceneTemplate(modal.templateId);
    if (!template) return closeModal();
    const nodes = getSceneOperatorBlueprints(template.id).map((node) => ({ ...node, operatorId: "", operator: null, status: "待配置" }));
    const toolSteps = getSceneToolSteps(template, nodes);
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal scene-template-modal is-wide" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>${escapeHtml(template.name)}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="scene-template-modal-hero">
              <img src="${escapeAttr(template.image || IMAGE_CALIBRATION_BOARD)}" alt="${escapeAttr(template.name)}示意图" />
              <div>
                <span>${escapeHtml(template.category)} · ${escapeHtml(template.complexity)}</span>
                <p>${escapeHtml(template.description)}</p>
                <div class="scene-card-tags">${template.labels.slice(0, 5).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}</div>
              </div>
            </div>
            <div class="scene-detail-grid">
              <section class="scene-info-panel">
                <h2>什么情况下用这个模板</h2>
                <p>${escapeHtml(template.useCase || template.description)}</p>
                <dl>
                  <div><dt>检测任务</dt><dd>${escapeHtml(template.category)}</dd></div>
                  <div><dt>行业</dt><dd>${template.industries.map(escapeHtml).join("、")}</dd></div>
                  <div><dt>检测对象</dt><dd>${escapeHtml(template.object)}</dd></div>
                  <div><dt>需要样本</dt><dd>${escapeHtml(template.dataNeed)}</dd></div>
                </dl>
              </section>
              <section class="scene-info-panel">
                <h2>最理想流程</h2>
                ${renderSceneIdealFlow(template)}
              </section>
            </div>
            ${renderSceneTemplateExample(template)}
            <section class="scene-workflow-panel">
              <h2>创建后形成的客户端工具结构</h2>
              ${renderSceneToolStructure(toolSteps, { readonly: true })}
            </section>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="create-scene-from-template" data-id="${escapeAttr(template.id)}">创建场景</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "operator-version-list") {
    const operator = getOperators().find((item) => item.id === modal.operatorId) || getSelectedOperator();
    const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
    const versions = dataset ? getDatasetVersions(dataset.id) : [];
    const weights = operator ? getOperatorWeightVersions(operator.id) : [];
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal is-wide operator-version-list-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>算子版本</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="operator-version-list-title"><strong>${escapeHtml(operator?.name || "")}</strong><span>共 ${versions.length} 个版本</span></div>
            ${renderOperatorVersionListModalTable(versions, weights)}
          </div>
          <footer class="modal-footer"><button class="primary-btn" data-modal-action="close">关闭</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "model") {
    const model = modal.model || { name: "", sceneType: "目标检测", description: "" };
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>${modal.modelId ? "编辑算子" : "新建算子"}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label class="required">算子名称</label><input id="modalModelName" value="${escapeAttr(getOperatorName(model))}" maxlength="30" /></div>
              <div class="form-field model-algorithm-field"><label class="required">算子类别</label><div class="algorithm-radio-group" id="modalModelScene">
                ${MODEL_ALGORITHM_TYPES.map(
                  (type) => `<label class="algorithm-radio${model.sceneType === type ? " is-selected" : ""}"><input type="radio" name="modalModelScene" value="${escapeAttr(type)}"${model.sceneType === type ? " checked" : ""} /><span>${escapeHtml(type)}</span></label>`,
                ).join("")}
              </div></div>
              <div class="form-field"><label>算子说明</label><textarea id="modalModelDescription" maxlength="100">${escapeHtml(model.description || "")}</textarea></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="save-model">确定</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "train-model") {
    const model = getModelById(modal.modelId) || getSelectedModel();
    const dataset = getDataset(modal.datasetId);
    const datasetVersions = (state.datasetVersions || []).filter((version) => version.datasetId === modal.datasetId && getDatasetVersionStatus(version) === "已发布");
    const datasets = getDatasets();
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal train-model-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>训练算子版本</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="train-cascade">
              <section>
                <h3>算子数据</h3>
                <div class="train-cascade-list">
                  ${datasets
                    .map((item) => `<button class="${item.id === modal.datasetId ? "is-selected" : ""}" data-modal-action="select-train-dataset" data-id="${escapeAttr(item.id)}">
                      <strong>${escapeHtml(item.name)}</strong>
                      <span>${escapeHtml(item.taskType)} · ${getDatasetVersions(item.id).filter((version) => getDatasetVersionStatus(version) === "已发布").length} 个已发布版本</span>
                    </button>`)
                    .join("")}
                </div>
              </section>
              <section>
                <h3>算子版本</h3>
                <div class="train-cascade-list">
                  ${
                    datasetVersions.length
                      ? datasetVersions
                          .map((version) => `<button class="${version.id === modal.datasetVersionId ? "is-selected" : ""}" data-modal-action="select-train-version" data-id="${escapeAttr(version.id)}">
                            <strong>${escapeHtml(getDatasetVersionShortName(version))}</strong>
                            <span>${version.sampleCount || 0} 样本 · 质量 ${version.qualityScore || "--"} · ${formatDateTime(version.publishedAt || version.createdAt)}</span>
                          </button>`)
                          .join("")
                      : `<div class="train-cascade-empty">当前数据集暂无已发布版本</div>`
                  }
                </div>
              </section>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="confirm-train-model">开始训练</button></footer>
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
    const dataset = getDataset(modal.folderId);
    const algorithm = dataset?.taskType || "目标检测";
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>${folder || dataset ? "修改数据集" : "新建数据集"}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label class="required">数据集名称</label><input id="modalFolderName" value="${escapeAttr(dataset?.name || folder?.name || "")}" maxlength="24" placeholder="请输入数据集名称" /></div>
              <div class="form-field model-algorithm-field"><label class="required">算法类型</label><div class="algorithm-radio-group" id="modalDatasetAlgorithm">
                ${MODEL_ALGORITHM_TYPES.map(
                  (type) => `<label class="algorithm-radio${algorithm === type ? " is-selected" : ""}"><input type="radio" name="modalDatasetAlgorithm" value="${escapeAttr(type)}"${algorithm === type ? " checked" : ""} /><span>${escapeHtml(type)}</span></label>`,
                ).join("")}
              </div></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="save-folder">确定</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "create-dataset-version") {
    const dataset = getDataset(modal.datasetId);
    if (!dataset) return closeModal();
    const versions = getDatasetVersions(dataset.id);
    const latestVersion = versions[0] || null;
    const sourceMode = modal.sourceMode || (versions.length ? "latest" : "pool");
    const defaultSourceId = modal.sourceVersionId || latestVersion?.id || "";
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal create-version-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>创建算子版本</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field"><label class="required">版本名称</label><input id="modalDatasetVersionName" value="${escapeAttr(modal.name || `${dataset.name} v${(dataset.versionIds || []).length + 1}`)}" maxlength="36" /></div>
              <div class="form-field"><label class="required">创建起点</label><div class="version-source-options">
                <label><input type="radio" name="modalDatasetVersionSource" value="latest"${sourceMode === "latest" ? " checked" : ""}${versions.length ? "" : " disabled"} /> <span>从最新版本继续</span></label>
                <label><input type="radio" name="modalDatasetVersionSource" value="version"${sourceMode === "version" ? " checked" : ""}${versions.length ? "" : " disabled"} /> <span>从指定版本复制</span></label>
                <label><input type="radio" name="modalDatasetVersionSource" value="pool"${sourceMode === "pool" ? " checked" : ""} /> <span>从图像池创建</span></label>
              </div></div>
              ${
                sourceMode === "pool"
                  ? `<div class="form-field"><label class="required">图像池范围</label><select id="modalDatasetVersionPoolScope">
                      <option value="all"${modal.poolScope !== "confirmed" ? " selected" : ""}>全部图像池（${dataset.sampleIds.length} 张）</option>
                      <option value="confirmed"${modal.poolScope === "confirmed" ? " selected" : ""}>已确认图像（${(dataset.confirmedIds || []).length} 张）</option>
                    </select></div>`
                  : `<div class="form-field"><label class="required">${sourceMode === "latest" ? "最新版本" : "指定版本"}</label><select id="modalDatasetVersionSourceId"${sourceMode === "latest" ? " disabled" : ""}>
                      ${versions.map((version) => `<option value="${escapeAttr(version.id)}"${version.id === (sourceMode === "latest" ? latestVersion?.id : defaultSourceId) ? " selected" : ""}>${escapeHtml(version.name)} · ${escapeHtml(getDatasetVersionStatus(version))}</option>`).join("")}
                    </select></div>`
              }
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="create-dataset-version">创建并标注</button></footer>
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
  if (modal.type === "version-preannotation") {
    const operator = getModelById(modal.operatorId);
    const versions = getOperatorWeightVersions(modal.operatorId).filter((version) => version.status === "训练完成");
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal version-preannotation-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>使用已有版本预标注</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <p class="banner banner-neutral">将对当前待标注列表中的 ${modal.imageIds.length} 张图像生成预标注。结果会进入“待确认”，不会直接成为正式标注。</p>
            <div class="form-grid">
              <div class="form-field"><label>当前算子</label><input value="${escapeAttr(operator ? getOperatorName(operator) : "-")}" disabled /></div>
              <div class="form-field"><label class="required">预标注版本</label><select id="modalPreannotationVersion">${versions.map((version) => `<option value="${escapeAttr(version.id)}"${version.id === modal.weightVersionId ? " selected" : ""}>${escapeHtml(String(version.version || "").toUpperCase())} · ${escapeHtml(version.status)}</option>`).join("")}</select></div>
            </div>
          </div>
          <footer class="modal-footer"><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="confirm-version-preannotation">开始预标注</button></footer>
        </section>
      </div>`;
    return;
  }
  if (modal.type === "dataset-version-quality") {
    const version = getDatasetVersion(modal.versionId);
    if (!version) return closeModal();
    const dataset = getDataset(version.datasetId);
    const qualityItems = getDatasetVersionQualityItems(version);
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="platform-modal dataset-quality-modal" role="dialog" aria-modal="true">
          <header class="modal-header"><h2>质量评估详情</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
          <div class="modal-body">
            <div class="quality-detail-summary">
              <div>
                <strong>${escapeHtml(version.name)}</strong>
                <span>${escapeHtml(dataset?.name || "")}</span>
              </div>
              <b>${version.qualityScore || "--"}</b>
            </div>
            <div class="quality-detail-list">
              ${qualityItems
                .map(
                  (item) => `<div class="quality-detail-item">
                    <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.desc)}</span></div>
                    <em>${item.score}</em>
                  </div>`,
                )
                .join("")}
            </div>
            <p class="quality-detail-note">评估依据为数据集版本的样本划分、标注覆盖、类别分布和基础异常风险；这是入训前的数据质量检查，不等同于算子训练后的 Precision / Recall。</p>
          </div>
          <footer class="modal-footer"><button class="primary-btn" data-modal-action="close">关闭</button></footer>
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
          <header class="modal-header"><h2>${modal.mode === "operator-pool" ? "选择图像加入样本池" : "从图像库添加图像"}</h2>${renderIconButton({ icon: "close", label: "关闭", className: "modal-close", attrs: 'data-modal-action="close"' })}</header>
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
          <footer class="modal-footer"><span class="selection-summary">已选择 ${pickerSelection.size} 张</span><button class="secondary-btn" data-modal-action="close">取消</button><button class="primary-btn" data-modal-action="confirm-picker"${pickerSelection.size ? "" : " disabled"}>${modal.mode === "operator-pool" ? "加入样本池" : "确定"}</button></footer>
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
  if (!name) return showToast("请输入算子名称");
  const isEditing = Boolean(modal.modelId);
  const sceneType = document.querySelector('input[name="modalModelScene"]:checked')?.value || "目标检测";
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
  showToast(isEditing ? "算子已更新" : "算子已创建");
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
  const algorithm = document.querySelector('input[name="modalDatasetAlgorithm"]:checked')?.value || "目标检测";
  if (!name) return showToast("请输入数据集名称");
  const now = new Date().toISOString();
  const folder = state.folders.find((item) => item.id === modal.folderId);
  const dataset = getDataset(modal.folderId);
  if (dataset) {
    dataset.name = name;
    dataset.taskType = algorithm;
    dataset.updatedAt = now;
    if (folder) {
      folder.name = name;
      folder.updatedAt = now;
    }
  } else if (folder) {
    folder.name = name;
    folder.updatedAt = now;
  } else {
    const id = `dataset_${Date.now()}`;
    state.datasets.unshift({
      id,
      name,
      taskType: algorithm,
      source: "手动创建，等待上传图像",
      linkedModelId: "",
      sampleIds: [],
      pendingIds: [],
      confirmedIds: [],
      reviewIds: [],
      excludedIds: [],
      versionIds: [],
      latestVersionId: "",
      updatedAt: now,
    });
    state.folders.unshift({
      id,
      name,
      count: 0,
      cover: "",
      createdAt: now,
      updatedAt: now,
    });
    ui.selectedDatasetId = id;
    ui.selectedFolderId = id;
  }
  saveState();
  closeModal();
  if (!dataset && !folder) setView("library-folder");
  else render();
  showToast(dataset || folder ? "数据集已修改" : "数据集已创建");
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
  const dataset = getDataset(ui.selectedDatasetId || ui.selectedFolderId);
  const folder = state.folders.find((item) => item.id === (dataset?.id || ui.selectedFolderId));
  if (!dataset || !modal.uploads.length) return;
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
    const image = {
      id: `image_${Date.now()}_${index}`,
      name: upload.name,
      folderId: dataset.id,
      url: upload.persistUrl,
      size: "待识别",
      device: "本地上传",
      tag: "",
      capturedAt: now,
    };
    state.images.unshift(image);
    dataset.sampleIds.unshift(image.id);
    dataset.pendingIds.unshift(image.id);
  });
  if (folder) {
    folder.cover = folder.cover || uploads[0].persistUrl;
    folder.count = dataset.sampleIds.length;
    folder.updatedAt = now;
  }
  dataset.updatedAt = now;
  const count = uploads.length;
  saveState();
  closeModal();
  render();
  showToast(uploadMode === "zip" ? `压缩包已解析为 ${count} 张图像并加入图像池` : `已上传 ${count} 张图像并加入图像池`);
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
  if (modal.mode === "operator-pool") return confirmOperatorImagePicker();
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

function confirmOperatorImagePicker() {
  const operator = getModelById(modal.operatorId) || getSelectedOperator();
  const ids = Array.from(pickerSelection).filter((id) => Boolean(getImage(id)));
  if (!operator || !ids.length) return showToast("请至少选择一张图像");
  const dataset = ensureOperatorDataset(operator);
  const existing = new Set(dataset.sampleIds || []);
  const addedIds = ids.filter((id) => !existing.has(id));
  const addedAt = new Date().toISOString();
  if (!dataset.sampleMeta || typeof dataset.sampleMeta !== "object") dataset.sampleMeta = {};
  addedIds.forEach((id, index) => {
    dataset.sampleIds.push(id);
    if (!(dataset.pendingIds || []).includes(id)) dataset.pendingIds.push(id);
    dataset.sampleMeta[id] = {
      addedAt: new Date(Date.parse(addedAt) + index * 1000).toISOString(),
      feedbackType: "library",
    };
  });
  dataset.updatedAt = addedAt;
  ui.selectedModelId = operator.id;
  saveState();
  closeModal();
  render();
  showToast(addedIds.length ? `已向样本池加入 ${addedIds.length} 张图像` : "所选图像已在当前样本池中");
}

function ensureOperatorDataset(operator) {
  const existing = getOperatorDatasets(operator.id)[0];
  if (existing) return existing;
  const now = new Date().toISOString();
  const dataset = {
    id: `dataset_operator_${operator.id}_${Date.now()}`,
    name: `${operator.name}样本池`,
    taskType: operator.sceneType || "目标检测",
    source: "算子样本池",
    linkedModelId: operator.id,
    sampleIds: [],
    pendingIds: [],
    confirmedIds: [],
    reviewIds: [],
    excludedIds: [],
    versionIds: [],
    latestVersionId: "",
    sampleMeta: {},
    updatedAt: now,
  };
  state.datasets.unshift(dataset);
  return dataset;
}

function requestConfirmation(action, payload = {}) {
  const configs = {
    "delete-model": {
      title: "删除算子",
      message: "确定删除这个算子吗？",
      detail: "算子下的训练记录和测试结果也会一并删除。",
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
    "delete-model-version": {
      title: "删除算子版本",
      message: "确定删除这个算子版本吗？",
      detail: "删除后，该版本的训练指标和导出入口会从当前算子下移除；关联的数据集版本不会被删除。",
    },
    "reset-demo": {
      title: "重置 Demo",
      message: "确定恢复最初的演示数据吗？",
      detail: "当前浏览器中新增的算子、标注和测试结果都会被清除。",
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
  if (request.action === "delete-model-version") return performDeleteModelVersion(request.payload.versionId);
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

function confirmTrainModelFromModal() {
  if (!modal || modal.type !== "train-model") return;
  const dataset = getDataset(modal.datasetId);
  const model = getModelById(modal.modelId) || getSelectedModel();
  if (!dataset || !model) return showToast("请选择算子数据");

  let datasetVersionId = modal.datasetVersionId;
  let datasetVersion = getDatasetVersion(datasetVersionId);
  if (!datasetVersion) {
    return showToast("请先完成算子版本的数据准备，再开始训练");
  }

  const versionCount = getModelVersions(model.id).length + 1;
  const qualityScore = Number(datasetVersion.qualityScore || 80);
  const version = {
    id: `mv_${model.id}_${Date.now()}`,
    modelId: model.id,
    version: `v${versionCount}`,
    datasetVersionId,
    status: "训练完成",
    sampleCount: datasetVersion.sampleCount,
    createdAt: new Date().toISOString(),
    metrics: {
      precision: Math.min(99, Math.round(qualityScore + 7)),
      recall: Math.min(99, Math.round(qualityScore + 3)),
      falseAlarm: Math.max(0.6, Number((7 - qualityScore / 20).toFixed(1))),
    },
    recommended: false,
  };
  state.modelVersions.unshift(version);
  ui.selectedModelId = model.id;
  saveState();
  closeModal();
  setView("operator-detail");
  showToast(`已基于「${dataset.name}」生成 ${getOperatorName(model)} 权重 ${version.version}`);
}

function openDatasetVersion(versionId) {
  const datasetVersion = getDatasetVersion(versionId);
  const dataset = datasetVersion ? getDataset(datasetVersion.datasetId) : null;
  if (!dataset) return showToast("未找到关联的算子版本");
  ui.selectedDatasetId = dataset.id;
  ui.selectedFolderId = dataset.id;
  ui.selectedDatasetVersionId = datasetVersion.id;
  ui.datasetDetailTab = "versions";
  librarySelection = new Set();
  const linkedModel = getDatasetLinkedModels(dataset.id)[0] || state.models.find((model) => model.linkedDatasetId === dataset.id);
  if (linkedModel) ui.selectedModelId = linkedModel.id;
  setView(linkedModel ? "operator-detail" : "public-data");
  showToast(`已定位算子版本 ${getDatasetVersionShortName(datasetVersion)}`);
}

function deleteModelVersion(versionId) {
  const version = (state.modelVersions || []).find((item) => item.id === versionId);
  if (!version) return showToast("未找到训练结果");
  const versions = getModelVersions(version.modelId);
  if (version.recommended || versions.length <= 1) {
    return showToast("当前推荐版本或唯一版本暂不支持删除");
  }
  requestConfirmation("delete-model-version", { versionId });
}

function performDeleteModelVersion(versionId) {
  const version = (state.modelVersions || []).find((item) => item.id === versionId);
  if (!version) return;
  state.modelVersions = (state.modelVersions || []).filter((item) => item.id !== versionId);
  saveState();
  setView("model-training-records");
  showToast(`已删除算子版本 ${version.version}`);
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

function openDatasetVersionCreateModal(datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) return;
  const latestVersion = getDatasetVersions(dataset.id)[0] || null;
  modal = {
    type: "create-dataset-version",
    datasetId: dataset.id,
    sourceMode: latestVersion ? "latest" : "pool",
    sourceVersionId: latestVersion?.id || "",
    poolScope: "all",
    name: `${dataset.name} v${(dataset.versionIds || []).length + 1}`,
  };
  renderModal();
}

function confirmCreateDatasetVersion() {
  const dataset = getDataset(modal?.datasetId);
  if (!dataset) return;
  const name = document.getElementById("modalDatasetVersionName").value.trim();
  if (!name) return showToast("请输入版本名称");
  const sourceMode = modal.sourceMode || document.querySelector('input[name="modalDatasetVersionSource"]:checked')?.value || "pool";
  const sourceVersionId = modal.sourceVersionId || document.getElementById("modalDatasetVersionSourceId")?.value || "";
  const poolScope = modal.poolScope || document.getElementById("modalDatasetVersionPoolScope")?.value || "all";
  const version = createDatasetVersion(dataset.id, { name, sourceMode, sourceVersionId, poolScope });
  if (!version) return;
  closeModal();
  ui.selectedDatasetId = dataset.id;
  ui.selectedFolderId = dataset.id;
  ui.selectedDatasetVersionId = version.id;
  ui.activeImageId = (version.pendingIds || version.sampleIds || [])[0] || "";
  saveUi();
  showToast(`已创建 ${version.name}，请继续完成数据标注`);
  setView("dataset-annotation");
}

function createDatasetVersion(datasetId, options = {}) {
  const dataset = getDataset(datasetId);
  if (!dataset) return;
  const sourceVersion = options.sourceMode === "latest" ? getDatasetVersions(dataset.id)[0] : getDatasetVersion(options.sourceVersionId);
  const sampleIds = resolveDatasetVersionSampleIds(dataset, sourceVersion, options);
  if (!sampleIds.length) return showToast("当前起点没有可用于创建版本的图像");
  const nextIndex = (dataset.versionIds || []).length + 1;
  const split = createVersionSplit(sampleIds.length);
  const clonedState = sourceVersion ? getDatasetVersionWorkState(sourceVersion, dataset) : null;
  const confirmedIds = sourceVersion ? (clonedState.confirmedIds || []).filter((id) => sampleIds.includes(id)) : [];
  const reviewIds = sourceVersion ? (clonedState.reviewIds || []).filter((id) => sampleIds.includes(id)) : [];
  const excludedIds = sourceVersion ? (clonedState.excludedIds || []).filter((id) => sampleIds.includes(id)) : [];
  const pendingIds = sampleIds.filter((id) => !confirmedIds.includes(id) && !reviewIds.includes(id) && !excludedIds.includes(id));
  const version = {
    id: `dsv_${dataset.id}_${Date.now()}`,
    datasetId: dataset.id,
    name: options.name || `${dataset.name} v${nextIndex}`,
    source: sourceVersion ? `复制自 ${sourceVersion.name}` : "从图像池创建",
    sampleIds,
    pendingIds,
    confirmedIds,
    reviewIds,
    excludedIds,
    sampleCount: sampleIds.length,
    annotationCount: confirmedIds.length,
    annotationSummary: createDatasetVersionAnnotationSummary(dataset, confirmedIds.length, null),
    qualityScore: null,
    status: "草稿",
    split,
    createdAt: new Date().toISOString(),
  };
  state.datasetVersions.unshift(version);
  dataset.versionIds = [version.id, ...(dataset.versionIds || [])];
  dataset.latestVersionId = version.id;
  dataset.updatedAt = version.createdAt;
  saveState();
  return version;
}

function resolveDatasetVersionSampleIds(dataset, sourceVersion, options = {}) {
  const trainingPoolIds = (dataset.sampleIds || []).slice();
  if (sourceVersion && options.sourceMode !== "pool") {
    const sourceIds = getDatasetVersionSampleIds(sourceVersion, dataset).filter((id) => trainingPoolIds.includes(id));
    const sourceSet = new Set(sourceIds);
    const appendedIds = trainingPoolIds.filter((id) => !sourceSet.has(id));
    return [...sourceIds, ...appendedIds];
  }
  if (options.poolScope === "confirmed") return (dataset.confirmedIds || []).filter((id) => trainingPoolIds.includes(id));
  return trainingPoolIds;
}

function evaluateDatasetVersion(versionId) {
  const version = getDatasetVersion(versionId);
  if (!version) return;
  if (getDatasetVersionStatus(version) === "已发布") return showToast("已发布版本不能重新评估");
  const dataset = getDataset(version.datasetId);
  const stats = version ? getDatasetVersionWorkState(version, dataset) : { pendingIds: [], reviewIds: [] };
  version.annotationSummary = Array.isArray(version.annotationSummary) && version.annotationSummary.length ? version.annotationSummary : createDatasetVersionAnnotationSummary(dataset, version.annotationCount || version.sampleCount || 0);
  version.qualityScore = Math.max(60, Math.min(98, 94 - stats.pendingIds.length * 4 - stats.reviewIds.length * 3));
  version.status = "已评估";
  version.evaluatedAt = new Date().toISOString();
  saveState();
  showToast(`${version.name} 质量评估完成`);
  render();
}

function publishDatasetVersion(versionId) {
  const version = getDatasetVersion(versionId);
  if (!version) return;
  if (getDatasetVersionStatus(version) === "已发布") return showToast("该版本已发布");
  if (!version.qualityScore) return showToast("请先完成质量评估，再发布该版本");
  version.status = "已发布";
  version.publishedAt = new Date().toISOString();
  const dataset = getDataset(version.datasetId);
  if (dataset) {
    dataset.latestVersionId = version.id;
    dataset.updatedAt = version.publishedAt;
  }
  saveState();
  showToast(`${version.name} 已发布，后续调整请创建新版本`);
  render();
}

function createModelVersionFromDataset(datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) return;
  const datasetVersion = getDatasetVersions(dataset.id).find((version) => getDatasetVersionStatus(version) === "已发布");
  if (!datasetVersion) return showToast("请先完成算子版本的数据准备，再开始训练");
  const model = getModelById(dataset.linkedModelId) || state.models[0];
  const versionCount = getModelVersions(model.id).length + 1;
  const modelVersion = {
    id: `mv_${model.id}_${Date.now()}`,
    modelId: model.id,
    version: `v${versionCount}`,
    datasetVersionId: datasetVersion.id,
    status: "训练完成",
    sampleCount: datasetVersion.sampleCount,
    createdAt: new Date().toISOString(),
    metrics: {
      precision: Math.min(97, 86 + datasetVersion.sampleCount * 2),
      recall: Math.min(96, 78 + datasetVersion.sampleCount * 2),
      falseAlarm: Math.max(1.2, 6.4 - datasetVersion.sampleCount * 0.4),
    },
    recommended: false,
  };
  state.modelVersions.unshift(modelVersion);
  ui.selectedModelId = model.id;
  saveState();
  showToast(`已基于 ${getDatasetVersionShortName(datasetVersion)} 生成权重 ${modelVersion.version}`);
  setView("operator-detail");
}

function confirmDatasetSample(imageId) {
  const dataset = getDataset(ui.selectedDatasetId);
  if (!dataset || !imageId) return;
  const version = getActiveDatasetVersion(dataset.id);
  if (!version) return showToast("请先创建一个数据集版本");
  if (getDatasetVersionStatus(version) === "已发布") return showToast("已发布版本不可修改，请创建新版本");
  const workState = getDatasetVersionWorkState(version, dataset);
  workState.pendingIds = workState.pendingIds.filter((id) => id !== imageId);
  workState.reviewIds = workState.reviewIds.filter((id) => id !== imageId);
  workState.excludedIds = workState.excludedIds.filter((id) => id !== imageId);
  if (!workState.confirmedIds.includes(imageId)) workState.confirmedIds.push(imageId);
  syncDatasetVersionWorkState(version, workState);
  dataset.updatedAt = new Date().toISOString();
  saveState();
  showToast("辅助建议已确认为当前版本标注");
  render();
}

function completeDatasetSampleAndNext() {
  const dataset = getDataset(ui.selectedDatasetId);
  if (!dataset) return;
  const version = getActiveDatasetVersion(dataset.id);
  confirmDatasetSample(ui.activeImageId);
  const workState = getDatasetVersionWorkState(version, dataset);
  const next = workState.sampleIds.map(getImage).filter(Boolean).find((image) => !workState.confirmedIds.includes(image.id) && !workState.excludedIds.includes(image.id));
  ui.activeImageId = next?.id || "";
  saveUi();
  render();
}

function trainAnnotatedOperatorVersion(versionId) {
  const version = getDatasetVersion(versionId);
  const dataset = version ? getDataset(version.datasetId) : null;
  if (!version || !dataset) return showToast("未找到当前算子版本");
  if (getDatasetVersionStatus(version) === "已发布") return showToast("该版本已经完成训练");
  const workState = getDatasetVersionWorkState(version, dataset);
  const unfinishedCount = workState.pendingIds.length + workState.reviewIds.length;
  if (!workState.sampleIds.length) return showToast("当前版本还没有训练样本");
  if (unfinishedCount || workState.confirmedIds.length !== workState.sampleIds.length) {
    return showToast(`还有 ${Math.max(unfinishedCount, workState.sampleIds.length - workState.confirmedIds.length)} 张样本未完成标注`);
  }
  version.qualityScore = version.qualityScore || 90;
  version.status = "已发布";
  version.publishedAt = new Date().toISOString();
  dataset.latestVersionId = version.id;
  dataset.updatedAt = version.publishedAt;
  saveState();
  createModelVersionFromDataset(dataset.id);
}

function markDatasetSampleForReview(imageId) {
  const dataset = getDataset(ui.selectedDatasetId || ui.selectedFolderId);
  if (!dataset) return;
  const version = getActiveDatasetVersion(dataset.id);
  if (ui.view === "dataset-annotation" && !version) return showToast("请先创建一个数据集版本");
  if (version && getDatasetVersionStatus(version) === "已发布") return showToast("已发布版本不可修改，请创建新版本");
  const ids = librarySelection.size ? Array.from(librarySelection) : [imageId].filter(Boolean);
  const workState = version ? getDatasetVersionWorkState(version, dataset) : null;
  ids.forEach((id) => {
    if (workState) {
      workState.pendingIds = workState.pendingIds.filter((item) => item !== id);
      workState.confirmedIds = workState.confirmedIds.filter((item) => item !== id);
      if (!workState.reviewIds.includes(id)) workState.reviewIds.push(id);
    } else {
      dataset.pendingIds = (dataset.pendingIds || []).filter((item) => item !== id);
      dataset.confirmedIds = (dataset.confirmedIds || []).filter((item) => item !== id);
      if (!dataset.reviewIds.includes(id)) dataset.reviewIds.push(id);
    }
  });
  if (version && workState) syncDatasetVersionWorkState(version, workState);
  librarySelection = new Set();
  saveState();
  showToast(`已将 ${ids.length} 个样本标记为待复核`);
  render();
}

function excludeDatasetSample(imageId) {
  const dataset = getDataset(ui.selectedDatasetId);
  if (!dataset || !imageId) return;
  const version = getActiveDatasetVersion(dataset.id);
  if (!version) return showToast("请先创建一个数据集版本");
  if (getDatasetVersionStatus(version) === "已发布") return showToast("已发布版本不可修改，请创建新版本");
  const workState = getDatasetVersionWorkState(version, dataset);
  workState.pendingIds = workState.pendingIds.filter((id) => id !== imageId);
  workState.confirmedIds = workState.confirmedIds.filter((id) => id !== imageId);
  workState.reviewIds = workState.reviewIds.filter((id) => id !== imageId);
  if (!workState.excludedIds.includes(imageId)) workState.excludedIds.push(imageId);
  syncDatasetVersionWorkState(version, workState);
  saveState();
  showToast("样本已排除，不参与当前版本");
  render();
}

function createDerivedDataset(method) {
  const source = getDataset(ui.selectedDatasetId);
  if (!source) return;
  const id = `dataset_derived_${Date.now()}`;
  const sampleIds = source.sampleIds.slice(0, 3);
  const dataset = {
    id,
    name: `${source.name}-${method === "人工绘制 ROI" ? "人工ROI" : "算子ROI"}派生`,
    taskType: "目标检测",
    source: `由 ${source.name} 通过${method}生成`,
    linkedModelId: source.linkedModelId,
    sampleIds,
    pendingIds: sampleIds.slice(1),
    confirmedIds: sampleIds.slice(0, 1),
    reviewIds: method === "人工绘制 ROI" ? [] : sampleIds.slice(2, 3),
    excludedIds: [],
    versionIds: [],
    latestVersionId: "",
    derivedFrom: { datasetId: source.id, method },
    updatedAt: new Date().toISOString(),
  };
  state.datasets.unshift(dataset);
  ui.selectedDatasetId = id;
  saveState();
  showToast(`已生成${method}派生数据集`);
  setView("library-folder");
}

function createSceneFromTemplate(templateId) {
  const template = getSceneTemplate(templateId);
  if (!template) return showToast("未找到场景模板");
  const now = new Date().toISOString();
  const preset = getSceneTemplateDemoPreset(template.id);
  const scene = {
    id: `scene_${template.id}_${Date.now()}`,
    templateId: template.id,
    name: template.defaultSceneName || template.name,
    status: "未开始",
    currentStepIndex: 0,
    datasetIds: [],
    modelIds: [],
    inputs: { objectName: template.object, targets: template.labels.slice(0, 3), imageSource: "待选择" },
    createdAt: now,
    updatedAt: now,
    ...preset,
  };
  getScenes().unshift(scene);
  ui.selectedSceneId = scene.id;
  ui.sceneTab = "mine";
  saveState();
  setView("scene-detail");
  showToast(`已创建场景：${scene.name}`);
}

function getSceneTemplateDemoPreset(templateId) {
  if (templateId !== "backplate_surface_defect") return {};
  return {
    status: "搭建中",
    currentStepIndex: 1,
    datasetIds: ["dataset_backplate_defect"],
    modelIds: [],
    inputs: { objectName: "背板", targets: ["划伤", "压伤", "脏污"], imageSource: "客户端示例-背板相机回流" },
  };
}

function getSceneTemplate(templateId) {
  return SCENE_TEMPLATES.find((template) => template.id === templateId);
}

function getScenes() {
  if (!Array.isArray(state.scenes)) state.scenes = [];
  return state.scenes;
}

function getScene(sceneId) {
  return getScenes().find((scene) => scene.id === sceneId);
}

function getSceneWorkflow(scene) {
  return getSceneTemplate(scene.templateId)?.workflow || [];
}

function getSelectedModel() {
  return state.models.find((model) => model.id === ui.selectedModelId) || state.models[0];
}

function getSelectedOperator() {
  return getOperators().find((operator) => operator.id === ui.selectedModelId) || getOperators()[0];
}

function getOperators() {
  return state.models.map((model) => {
    const datasets = getOperatorDatasets(model.id);
    const imageCount = datasets.reduce((sum, dataset) => sum + (dataset.sampleIds || []).length, 0);
    const scene = getScenes().find((item) => (item.modelIds || []).includes(model.id));
    const lastFeedbackAt = datasets
      .flatMap((dataset) => getDatasetImages(dataset.id))
      .map((image) => image.capturedAt || image.updatedAt || model.updatedAt)
      .sort()
      .pop();
    return {
      ...model,
      name: getOperatorName(model),
      type: model.sceneType,
      ownerLabel: scene ? `场景：${scene.name}` : "-",
      imageCount,
      lastFeedbackAt: lastFeedbackAt || model.updatedAt,
    };
  });
}

function getOperatorName(model) {
  const map = {
    model_gear_surface: "齿轮齿面定位算子",
    model_gear_bubble: "齿面气泡/划痕检测算子",
    model_backplate_defect: "背板外观缺陷检测算子",
    model_codex: "历史迁移-目标检测算子",
  };
  return map[model.id] || String(model.name || "").replace(/算子/g, "算子");
}

function getOperatorDatasets(operatorId) {
  return getDatasets().filter((dataset) => {
    if (dataset.linkedModelId === operatorId) return true;
    const versionIds = new Set(getDatasetVersions(dataset.id).map((version) => version.id));
    return getModelVersions(operatorId).some((version) => versionIds.has(version.datasetVersionId));
  });
}

function getOperatorWeightVersions(operatorId) {
  return getModelVersions(operatorId);
}

function resolveOperatorDataVersion(dataset, versions = []) {
  if (!dataset) return null;
  if (!ui.operatorDataVersionId || ui.operatorDataVersionId === "all") return null;
  const selected = getDatasetVersion(ui.operatorDataVersionId);
  if (selected?.datasetId === dataset.id) return selected;
  return null;
}

function getOperatorFilteredImages(dataset, version, versions = []) {
  if (!dataset) return [];
  const split = ui.operatorDataSplit || "all";
  const sampleIds = version ? getDatasetVersionSampleIds(version, dataset) : (dataset.sampleIds || []);
  const filteredIds = split === "all" ? sampleIds : getDatasetVersionSplitIds(version, dataset, split);
  const allowed = new Set(filteredIds);
  return getDatasetImages(dataset.id)
    .filter((image) => allowed.has(image.id))
    .filter((image) => {
      const status = getOperatorSampleStateKey(image, dataset, versions);
      return !ui.operatorDataStatus || ui.operatorDataStatus === "all" || ui.operatorDataStatus === status;
    })
    .sort((a, b) => String(b.operatorAddedAt || b.capturedAt || "").localeCompare(String(a.operatorAddedAt || a.capturedAt || "")));
}

function getOperatorAnnotationVersionIds(versions = []) {
  if (!Array.isArray(ui.operatorAnnotationVersionIds)) ui.operatorAnnotationVersionIds = versions.map((version) => version.id);
  const valid = new Set(versions.map((version) => version.id));
  ui.operatorAnnotationVersionIds = ui.operatorAnnotationVersionIds.filter((id) => valid.has(id));
  if (!ui.operatorAnnotationVersionIds.length && versions.length && !ui.operatorAnnotationVersionsTouched) {
    ui.operatorAnnotationVersionIds = versions.map((version) => version.id);
  }
  return ui.operatorAnnotationVersionIds;
}

function toggleOperatorAnnotationVersion(versionId) {
  const operator = getSelectedOperator();
  const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
  const versions = dataset ? getDatasetVersions(dataset.id) : [];
  const allIds = versions.map((version) => version.id);
  const selected = new Set(getOperatorAnnotationVersionIds(versions));
  if (versionId === "all") {
    ui.operatorAnnotationVersionIds = selected.size === allIds.length ? [] : allIds;
  } else if (selected.has(versionId)) {
    selected.delete(versionId);
    ui.operatorAnnotationVersionIds = Array.from(selected);
  } else {
    selected.add(versionId);
    ui.operatorAnnotationVersionIds = Array.from(selected);
  }
  ui.operatorAnnotationVersionsTouched = true;
  saveUi();
}

function getOperatorSampleStateKey(image, dataset, versions = []) {
  const inConfirmedVersion = versions.some((version) => (version.confirmedIds || getDatasetVersionSampleIds(version, dataset)).includes(image.id));
  if (inConfirmedVersion) return "annotated";
  if (hasOperatorSamplePrediction(image)) return "prediction";
  return "unlabeled";
}

function renderOperatorSampleState(image, dataset, versions = []) {
  const stateKey = getOperatorSampleStateKey(image, dataset, versions);
  if (stateKey === "annotated") return '<span class="training-status is-done">已标注</span>';
  if (stateKey === "prediction") return '<span class="training-status is-training">待确认</span>';
  return '<span class="training-status is-pending">未标注</span>';
}

function getOperatorSampleSource(image, dataset = null) {
  const feedbackType = dataset?.sampleMeta?.[image.id]?.feedbackType || image.feedbackType;
  if (feedbackType === "capture" || feedbackType === "inspection") return "客户端回流";
  if (feedbackType === "derived") return "派生数据";
  if (feedbackType === "library") return "从图像库选择";
  return image.device || "历史样本";
}

function hasOperatorSamplePrediction(image) {
  return image?.feedbackType === "inspection" && Boolean(image.hasPrediction || (image.predictionCount || 0) > 0 || (image.predictions || []).length);
}

function getOperatorSampleClientToolLabel(image, dataset = null) {
  const meta = dataset?.sampleMeta?.[image.id] || {};
  const context = image.sourceContext || {};
  const clientName = context.clientName || meta.clientName || "";
  const toolName = context.toolName || meta.toolName || "";
  const parts = [clientName, toolName].filter(Boolean);
  if (parts.length) return parts.join(" / ");
  return image.device || "-";
}

function getOperatorSampleWeightLabel(image, operator = null) {
  const ids = Array.isArray(image?.weightIds) ? image.weightIds : [];
  const weights = operator ? getOperatorWeightVersions(operator.id) : (state.modelVersions || []);
  const labels = ids
    .map((id) => weights.find((weight) => weight.id === id))
    .filter(Boolean)
    .map((weight) => (weight.version || weight.id || "").toUpperCase());
  if (labels.length) return Array.from(new Set(labels)).join(" / ");
  return "未记录";
}

function getOperatorSampleVersionEntries(image, versions = [], visibleVersionIds = []) {
  const visible = new Set(visibleVersionIds);
  return versions
    .filter((version) => visible.has(version.id))
    .map((version, index) => {
      const sampleIds = getDatasetVersionSampleIds(version, getDataset(version.datasetId));
      if (!sampleIds.includes(image.id)) return { versionId: version.id, versionName: getDatasetVersionShortName(version), status: "未纳入", count: 0, index };
      const confirmed = (version.confirmedIds || sampleIds).includes(image.id);
      const pending = (version.pendingIds || []).includes(image.id);
      const confirmedCount = Number(version.preannotationCounts?.[image.id] || 0) || 1 + ((sampleIds.indexOf(image.id) + index) % 2);
      return { versionId: version.id, versionName: getDatasetVersionShortName(version), status: confirmed ? "已标注" : pending ? "待标注" : "已纳入", count: confirmed ? confirmedCount : 0, index };
    });
}

function renderOperatorVersionAnnotationOverview(image, versions, visibleVersionIds) {
  const entries = getOperatorSampleVersionEntries(image, versions, visibleVersionIds);
  if (!entries.length) return '<span class="table-muted">未显示版本标注</span>';
  return `<div class="operator-version-annotation-tags">${entries.map((entry) => `<span class="${entry.status === "已标注" ? "has-annotation" : ""}">${escapeHtml(entry.versionName)} · ${escapeHtml(entry.status)}${entry.count ? ` ${entry.count}框` : ""}</span>`).join("")}</div>`;
}

function getOperatorSampleDateGroup(image, mode = "day") {
  const date = String(image.operatorAddedAt || image.capturedAt || "未知日期");
  if (mode === "month") return date.slice(0, 7);
  if (mode === "none") return "";
  return date.slice(0, 10);
}

function renderOperatorSampleCanvas(image, versionEntries, showPredictions = true) {
  const formalEntries = versionEntries.filter((entry) => entry.count > 0).slice(0, 1);
  const formalBoxes = formalEntries.flatMap((entry, entryIndex) => Array.from({ length: entry.count }, (_, boxIndex) => ({
    x: 245 + entryIndex * 95 + boxIndex * 155,
    y: 205 + entryIndex * 70 + boxIndex * 35,
    w: 210,
    h: 145,
    label: "标注",
  })));
  const returnedPredictionBoxes = (image.predictions || [])
    .filter((prediction) => prediction?.box)
    .map((prediction, index) => {
      const box = prediction.box;
      const normalized = [box.x, box.y, box.w, box.h].every((value) => Number(value) >= 0 && Number(value) <= 1);
      return {
        x: normalized ? Number(box.x) * 1000 : Number(box.x) || 330 + index * 210,
        y: normalized ? Number(box.y) * 625 : Number(box.y) || 250 + index * 55,
        w: normalized ? Number(box.w) * 1000 : Number(box.w) || 190,
        h: normalized ? Number(box.h) * 625 : Number(box.h) || 130,
        label: prediction.label || `推理 ${index + 1}`,
      };
    });
  const predictionBoxes = hasOperatorSamplePrediction(image) && showPredictions
    ? returnedPredictionBoxes.length
      ? returnedPredictionBoxes
      : Array.from({ length: image.predictionCount || 0 }, (_, index) => ({ x: 330 + index * 210, y: 250 + index * 55, w: 190, h: 130, label: `推理 ${index + 1}` }))
    : [];
  return `<svg class="operator-sample-canvas" viewBox="0 0 1000 625" aria-label="样本标注查看">
    <image href="${escapeAttr(image.url)}" x="0" y="0" width="1000" height="625" preserveAspectRatio="xMidYMid slice"></image>
    ${formalBoxes.map((box) => `<rect class="operator-formal-box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"></rect><text class="operator-formal-label" x="${box.x + 8}" y="${box.y - 10}">${escapeHtml(box.label)}</text>`).join("")}
    ${predictionBoxes.map((box) => `<rect class="operator-prediction-box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"></rect><text class="operator-prediction-label" x="${box.x + 8}" y="${box.y - 10}">${escapeHtml(box.label)}</text>`).join("")}
  </svg>`;
}

function stepOperatorSample(direction) {
  const operator = getSelectedOperator();
  const dataset = operator ? getOperatorDatasets(operator.id)[0] : null;
  const versions = dataset ? getDatasetVersions(dataset.id) : [];
  const activeVersion = resolveOperatorDataVersion(dataset, versions);
  const images = getOperatorFilteredImages(dataset, activeVersion, versions);
  const index = images.findIndex((image) => image.id === ui.operatorDataActiveImageId);
  const target = images[Math.max(0, Math.min(images.length - 1, index + direction))];
  if (!target) return;
  ui.operatorDataActiveImageId = target.id;
  saveUi();
  render();
}

function getDatasetVersionSplitIds(version, dataset, splitKey) {
  const sampleIds = version ? getDatasetVersionSampleIds(version, dataset) : (dataset?.sampleIds || []);
  const split = version?.split || createVersionSplit(sampleIds.length);
  const trainEnd = split.train || 0;
  const valEnd = trainEnd + (split.val || 0);
  if (splitKey === "train") return sampleIds.slice(0, trainEnd);
  if (splitKey === "val") return sampleIds.slice(trainEnd, valEnd);
  if (splitKey === "test") return sampleIds.slice(valEnd);
  return sampleIds;
}

function getDatasetAnnotationSplitIds(version, dataset, splitKey) {
  const sampleIds = getDatasetVersionSampleIds(version, dataset);
  const trainCount = Math.max(0, Math.min(sampleIds.length, Number(version?.split?.train ?? Math.round(sampleIds.length * 0.7))));
  if (splitKey === "train") return sampleIds.slice(0, trainCount);
  if (splitKey === "test") return sampleIds.slice(trainCount);
  return sampleIds;
}

function getDatasetAnnotationSplitLabel(version, dataset, imageId) {
  return getDatasetAnnotationSplitIds(version, dataset, "train").includes(imageId) ? "训练集" : "测试集";
}

function renderClickableDatasetSplit(version) {
  const split = version.split || createVersionSplit(version.sampleCount || 0);
  const activeVersion = ui.operatorDataVersionId === version.id;
  const activeSplit = ui.operatorDataSplit || "all";
  return `<div class="dataset-split-links">
    <button class="${activeVersion && activeSplit === "train" ? "is-active" : ""}" data-action="set-operator-data-filter" data-id="${escapeAttr(version.id)}" data-split="train">训练 ${split.train || 0}</button>
    <span>/</span>
    <button class="${activeVersion && activeSplit === "val" ? "is-active" : ""}" data-action="set-operator-data-filter" data-id="${escapeAttr(version.id)}" data-split="val">验证 ${split.val || 0}</button>
    <span>/</span>
    <button class="${activeVersion && activeSplit === "test" ? "is-active" : ""}" data-action="set-operator-data-filter" data-id="${escapeAttr(version.id)}" data-split="test">测试 ${split.test || 0}</button>
  </div>`;
}

function getEditableTrainingDataVersion(dataset) {
  if (!dataset) return null;
  return getDatasetVersions(dataset.id).find((version) => getDatasetVersionStatus(version) !== "已发布") || getDatasetVersions(dataset.id)[0] || null;
}

function getModelById(modelId) {
  return state.models.find((model) => model.id === modelId);
}

function getDatasets() {
  if (!Array.isArray(state.datasets)) state.datasets = [];
  return state.datasets;
}

function getDataset(datasetId) {
  return getDatasets().find((dataset) => dataset.id === datasetId);
}

function getDatasetVersion(versionId) {
  return (state.datasetVersions || []).find((version) => version.id === versionId);
}

function getDatasetVersions(datasetId) {
  return (state.datasetVersions || []).filter((version) => version.datasetId === datasetId);
}

function getModelVersions(modelId) {
  return (state.modelVersions || []).filter((version) => version.modelId === modelId);
}

function getModelVersionsByDatasetVersion(datasetVersionId) {
  return (state.modelVersions || []).filter((version) => version.datasetVersionId === datasetVersionId);
}

function getDatasetImages(datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) return [];
  return dataset.sampleIds.map(getImage).filter((image) => image && !image.libraryDeleted);
}

function getDatasetStats(dataset) {
  return {
    total: dataset.sampleIds.length,
    pending: (dataset.pendingIds || []).length,
    confirmed: (dataset.confirmedIds || []).length,
    review: (dataset.reviewIds || []).length,
    excluded: (dataset.excludedIds || []).length,
  };
}

function getDatasetCover(dataset) {
  return getDatasetImages(dataset.id)[0]?.url || "";
}

function renderDatasetMetric(label, value) {
  return `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`;
}

function renderDatasetSampleStatus(dataset, imageId) {
  if (!dataset || !imageId) return '<span class="dataset-status">未归属</span>';
  if ((dataset.excludedIds || []).includes(imageId)) return '<span class="dataset-status is-muted">已排除</span>';
  if ((dataset.confirmedIds || []).includes(imageId)) return '<span class="dataset-status is-confirmed">已标注</span>';
  if (getDatasetSampleStatusKey(dataset, imageId) === "confirm") return '<span class="dataset-status is-review">待确认</span>';
  return '<span class="dataset-status is-pending">待标注</span>';
}

function getDatasetSampleStatusKey(dataset, imageId) {
  if (!dataset || !imageId) return "pending";
  if ((dataset.confirmedIds || []).includes(imageId)) return "annotated";
  const image = getImage(imageId);
  if ((dataset.reviewIds || []).includes(imageId) || image?.feedbackType === "inspection" || image?.hasPrediction || Number(image?.predictionCount || 0) > 0) return "confirm";
  return "pending";
}

function renderDatasetQualityTag(dataset, imageId) {
  if (!dataset || !imageId) return "";
  if ((dataset.reviewIds || []).includes(imageId)) return '<span class="quality-tag is-risk">规则命中</span>';
  if ((dataset.confirmedIds || []).includes(imageId)) return '<span class="quality-tag is-pass">可入集</span>';
  return '<span class="quality-tag">待检查</span>';
}

function getAssistSuggestion(dataset, imageId) {
  const index = Math.max(0, dataset.sampleIds.indexOf(imageId));
  const sources = ["算子建议", "人工 ROI", "固定模板", "相似样本复用"];
  return {
    source: sources[index % sources.length],
    confidence: [91, 84, 67, 88][index % 4],
    reason: ["历史算子 v1 推理", "人工绘制有效检测区域", "固定相机位模板", "复用上一张相似样本"][index % 4],
    box: { x: 260 + index * 32, y: 175 + index * 18, w: 310, h: 210 },
  };
}

function renderAssistBox(assist) {
  const box = assist.box;
  return `
    <rect class="assist-box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"></rect>
    <rect class="assist-label-bg" x="${box.x}" y="${Math.max(0, box.y - 30)}" width="180" height="30"></rect>
    <text class="assist-label" x="${box.x + 10}" y="${Math.max(21, box.y - 10)}">${escapeHtml(assist.source)} ${assist.confidence}%</text>
  `;
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, "");
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

function getFilteredDatasetImages(datasetId) {
  const keyword = (ui.libraryQuery || "").trim().toLowerCase();
  const dataset = getDataset(datasetId);
  return getDatasetImages(datasetId).filter((image) => {
    if (ui.libraryDevice !== "all" && image.device !== ui.libraryDevice) return false;
    if (ui.libraryTag !== "all" && image.tag !== ui.libraryTag) return false;
    if (ui.datasetStatus === "pending" && !(dataset.pendingIds || []).includes(image.id)) return false;
    if (ui.datasetStatus === "confirmed" && !(dataset.confirmedIds || []).includes(image.id)) return false;
    if (ui.datasetStatus === "review" && !(dataset.reviewIds || []).includes(image.id)) return false;
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
    if (parsed?.version === 2 || parsed?.version === 3 || parsed?.version === 4) {
      const seed = buildSeedState();
      const metadata = new Map(SAMPLE_IMAGES.map((image) => [image.id, image]));
      const existingImages = new Set((parsed.images || []).map((image) => image.id));
      parsed.images = (parsed.images || []).map((image) => ({ ...(metadata.get(image.id) || {}), ...image }));
      parsed.images.push(...seed.images.filter((image) => !existingImages.has(image.id)));
      parsed.folders = (parsed.folders || []).map((folder) => ({
        createdAt: "2026-05-01T09:00:00+08:00",
        updatedAt: "2026-06-10T18:00:00+08:00",
        ...folder,
      }));
      parsed.version = 4;
      const codexModel = parsed.models?.find((model) => model.id === "model_codex");
      if (codexModel) codexModel.description = "";
      const modelIds = new Set((parsed.models || []).map((model) => model.id));
      parsed.models = [...(parsed.models || []), ...seed.models.filter((model) => !modelIds.has(model.id))];
      parsed.account = { ...seed.account, ...(parsed.account || {}) };
      parsed.libraryTags = Array.isArray(parsed.libraryTags) && parsed.libraryTags.length ? parsed.libraryTags : clone(DEFAULT_LIBRARY_TAGS);
      parsed.datasets = Array.isArray(parsed.datasets) && parsed.datasets.length ? parsed.datasets : clone(seed.datasets);
      parsed.datasetVersions = Array.isArray(parsed.datasetVersions) && parsed.datasetVersions.length ? parsed.datasetVersions : clone(seed.datasetVersions);
      parsed.modelVersions = Array.isArray(parsed.modelVersions) && parsed.modelVersions.length ? parsed.modelVersions : clone(seed.modelVersions);
      parsed.scenes = Array.isArray(parsed.scenes) && parsed.scenes.length ? parsed.scenes : clone(seed.scenes);
      parsed.records = { ...seed.records, ...(parsed.records || {}) };
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
  (nextState.datasets || []).forEach((dataset) => delete dataset.typicalAnnotationState);
  nextState = applyBackplateTemplatePolish(nextState);
  return applyClientDataReturnQueue(applyClientCloudSyncQueue(nextState));
}

function applyBackplateTemplatePolish(nextState) {
  let changed = false;
  const dataset = (nextState.datasets || []).find((item) => item.id === "dataset_backplate_defect");
  if (dataset) {
    const patch = {
      name: "示例-背板外观缺陷检测数据集",
      source: "客户端示例-背板相机回流",
      sampleIds: PLATFORM_BACKPLATE_SAMPLE_IDS,
      pendingIds: PLATFORM_BACKPLATE_SAMPLE_IDS.filter((id) => !PLATFORM_BACKPLATE_VERSION_V1_IDS.includes(id)),
      confirmedIds: PLATFORM_BACKPLATE_VERSION_V1_IDS,
      reviewIds: [],
      versionIds: ["dsv_backplate_v2", "dsv_backplate_v1"],
      latestVersionId: "dsv_backplate_v2",
    };
    Object.entries(patch).forEach(([key, value]) => {
      if (JSON.stringify(dataset[key]) !== JSON.stringify(value)) {
        dataset[key] = clone(value);
        changed = true;
      }
    });
  }
  const version = (nextState.datasetVersions || []).find((item) => item.id === "dsv_backplate_v1");
  if (version) {
    const patch = {
      name: "示例-背板外观缺陷检测数据集 v1",
      sampleCount: 2,
      annotationCount: 4,
      qualityScore: 84,
      status: "已发布",
      publishedAt: "2026-07-13T11:36:00+08:00",
      sampleIds: PLATFORM_BACKPLATE_VERSION_V1_IDS,
      confirmedIds: PLATFORM_BACKPLATE_VERSION_V1_IDS,
      pendingIds: [],
      reviewIds: [],
      annotationSummary: [
        { label: "划伤", count: 2 },
        { label: "压伤", count: 1 },
        { label: "脏污", count: 1 },
      ],
    };
    Object.entries(patch).forEach(([key, value]) => {
      if (JSON.stringify(version[key]) !== JSON.stringify(value)) {
        version[key] = clone(value);
        changed = true;
      }
    });
  }
  let draftVersion = (nextState.datasetVersions || []).find((item) => item.id === "dsv_backplate_v2");
  if (!draftVersion) {
    draftVersion = {
      id: "dsv_backplate_v2",
      datasetId: "dataset_backplate_defect",
      name: "示例-背板外观缺陷检测数据集 v2",
      sampleCount: PLATFORM_BACKPLATE_SAMPLE_IDS.length,
      annotationCount: 4,
      qualityScore: null,
      status: "草稿",
      createdAt: "2026-07-21T10:05:00+08:00",
      sampleIds: PLATFORM_BACKPLATE_SAMPLE_IDS,
      confirmedIds: PLATFORM_BACKPLATE_VERSION_V1_IDS,
      pendingIds: PLATFORM_BACKPLATE_SAMPLE_IDS.filter((id) => !PLATFORM_BACKPLATE_VERSION_V1_IDS.includes(id)),
      reviewIds: [],
      annotationSummary: [{ label: "划伤", count: 2 }, { label: "压伤", count: 1 }, { label: "脏污", count: 1 }],
      split: { train: 4, val: 1, test: 1 },
    };
    nextState.datasetVersions.unshift(draftVersion);
    changed = true;
  }
  const modelVersion = (nextState.modelVersions || []).find((item) => item.id === "mv_backplate_v1");
  if (modelVersion) {
    const patch = {
      sampleCount: 2,
      metrics: { precision: 90, recall: 83, falseAlarm: 3.9 },
    };
    Object.entries(patch).forEach(([key, value]) => {
      if (JSON.stringify(modelVersion[key]) !== JSON.stringify(value)) {
        modelVersion[key] = clone(value);
        changed = true;
      }
    });
  }
  const scene = (nextState.scenes || []).find((item) => item.id === "scene_backplate_done");
  if (scene) {
    const patch = {
      name: "背板外观缺陷检测",
      status: "训练完成",
      currentStepIndex: 4,
      datasetIds: ["dataset_backplate_defect"],
      modelIds: ["model_backplate_defect"],
      inputs: { objectName: "背板", targets: ["划伤", "压伤", "脏污"], imageSource: "客户端示例-背板相机回流" },
    };
    Object.entries(patch).forEach(([key, value]) => {
      if (JSON.stringify(scene[key]) !== JSON.stringify(value)) {
        scene[key] = clone(value);
        changed = true;
      }
    });
  }
  const backplateLower = (nextState.images || []).find((image) => image.id === "img_backplate_lower");
  if (backplateLower && backplateLower.tag !== "已确认") {
    backplateLower.tag = "已确认";
    changed = true;
  }
  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (_error) {
      // The migrated state is still used in memory when browser storage cannot be updated.
    }
  }
  return nextState;
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

function makeClientReturnImageId(sampleId) {
  return `client_return_${String(sampleId || Date.now()).replace(/[^a-zA-Z0-9_-]+/g, "_")}`;
}

function ensureOperatorReturnDataset(nextState, operator) {
  let dataset = (nextState.datasets || []).find((item) => item.linkedModelId === operator.id);
  if (dataset) return dataset;
  const now = new Date().toISOString();
  dataset = {
    id: `dataset_return_${operator.id}`,
    name: `${getOperatorName(operator)}数据集`,
    taskType: operator.sceneType || "目标检测",
    source: "客户端算子数据回流",
    linkedModelId: operator.id,
    sampleIds: [],
    pendingIds: [],
    confirmedIds: [],
    reviewIds: [],
    excludedIds: [],
    versionIds: [],
    latestVersionId: "",
    sampleMeta: {},
    updatedAt: now,
  };
  nextState.datasets.unshift(dataset);
  return dataset;
}

function ensureReturnDraftVersion(nextState, dataset, operator) {
  let version = (nextState.datasetVersions || []).find(
    (item) => item.datasetId === dataset.id && ["草稿", "数据准备中"].includes(item.status),
  );
  if (version) return version;
  const versionNumber = Math.max(1, (nextState.datasetVersions || []).filter((item) => item.datasetId === dataset.id).length + 1);
  version = {
    id: `${dataset.id}_v${versionNumber}`,
    datasetId: dataset.id,
    name: `${getOperatorName(operator)}数据集 v${versionNumber}`,
    sampleCount: 0,
    annotationCount: 0,
    qualityScore: null,
    status: "草稿",
    createdAt: new Date().toISOString(),
    sampleIds: [],
    confirmedIds: [],
    pendingIds: [],
    reviewIds: [],
    annotationSummary: [],
    split: { train: 0, val: 0, test: 0 },
  };
  nextState.datasetVersions.unshift(version);
  dataset.versionIds = [version.id, ...(dataset.versionIds || []).filter((id) => id !== version.id)];
  dataset.latestVersionId = version.id;
  return version;
}

function appendReturnSampleToDraftVersion(nextState, dataset, operator, imageId, needsConfirmation) {
  const version = ensureReturnDraftVersion(nextState, dataset, operator);
  version.sampleIds = Array.from(new Set([...(version.sampleIds || []), imageId]));
  version.confirmedIds = (version.confirmedIds || []).filter((id) => id !== imageId);
  version.pendingIds = Array.from(new Set([...(version.pendingIds || []), ...(needsConfirmation ? [] : [imageId])])).filter((id) => id !== imageId || !needsConfirmation);
  version.reviewIds = Array.from(new Set([...(version.reviewIds || []), ...(needsConfirmation ? [imageId] : [])])).filter((id) => id !== imageId || needsConfirmation);
  version.sampleCount = version.sampleIds.length;
  version.split = createVersionSplit(version.sampleCount);
}

function applyClientDataReturnQueue(nextState) {
  try {
    const queue = JSON.parse(localStorage.getItem(CLIENT_DATA_RETURN_QUEUE_KEY) || "[]");
    if (!Array.isArray(queue) || !queue.length) return nextState;
    const remaining = [];
    let changed = false;
    queue.forEach((entry) => {
      const operator = (nextState.models || []).find((item) => item.id === entry.operatorId);
      const samples = Array.isArray(entry.samples) ? entry.samples : [];
      if (!operator || !samples.length) {
        remaining.push({ ...entry, status: "failed", failureReason: operator ? "回流批次没有图像数据" : "平台算子不存在或已删除" });
        return;
      }
      const dataset = ensureOperatorReturnDataset(nextState, operator);
      dataset.sampleMeta = dataset.sampleMeta && typeof dataset.sampleMeta === "object" ? dataset.sampleMeta : {};
      const existingReturnKeys = new Set((nextState.images || []).map((image) => image.returnKey).filter(Boolean));
      samples.forEach((sample) => {
        if (!sample?.id || existingReturnKeys.has(sample.id)) return;
        const input = sample.input || {};
        const predictions = Array.isArray(sample.predictions) ? sample.predictions : [];
        const hasPrediction = Boolean(sample.hasPrediction || predictions.length);
        const predictionCount = predictions.filter((prediction) => prediction?.box).length;
        const imageId = makeClientReturnImageId(sample.id);
        const source = sample.source || {};
        const image = {
          id: imageId,
          returnKey: sample.id,
          returnBatchId: entry.batchId || entry.id,
          name: input.name || `${getOperatorName(operator)}回流图像.jpg`,
          folderId: dataset.id,
          url: input.url || "",
          size: input.width && input.height ? `${input.width} × ${input.height}` : "-",
          device: [source.clientName, source.toolName, source.instanceName].filter(Boolean).join(" / ") || "客户端",
          tag: "",
          capturedAt: input.capturedAt || entry.createdAt || new Date().toISOString(),
          operatorAddedAt: entry.createdAt || new Date().toISOString(),
          feedbackType: hasPrediction ? "inspection" : "capture",
          hasPrediction,
          predictionCount,
          predictions,
          inputType: input.inputType || "original-image",
          cropBox: input.cropBox || null,
          operatorId: operator.id,
          weightIds: entry.weightIds || [],
          deploymentIds: entry.deploymentIds || [],
          configRevisions: entry.configRevisions || [],
          sourceContext: source,
        };
        nextState.images.push(image);
        dataset.sampleIds = Array.from(new Set([...(dataset.sampleIds || []), imageId]));
        dataset.pendingIds = (dataset.pendingIds || []).filter((id) => id !== imageId);
        dataset.reviewIds = (dataset.reviewIds || []).filter((id) => id !== imageId);
        if (hasPrediction) dataset.reviewIds.push(imageId);
        else dataset.pendingIds.push(imageId);
        dataset.sampleMeta[imageId] = {
          feedbackType: image.feedbackType,
          clientName: source.clientName || "",
          toolName: source.toolName || "",
          instanceName: source.instanceName || "",
          inputType: image.inputType,
          weightIds: entry.weightIds || [],
        };
        appendReturnSampleToDraftVersion(nextState, dataset, operator, imageId, hasPrediction);
        existingReturnKeys.add(sample.id);
        changed = true;
      });
      dataset.updatedAt = entry.createdAt || new Date().toISOString();
      operator.updatedAt = dataset.updatedAt;
    });
    if (remaining.length) localStorage.setItem(CLIENT_DATA_RETURN_QUEUE_KEY, JSON.stringify(remaining));
    else localStorage.removeItem(CLIENT_DATA_RETURN_QUEUE_KEY);
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (_error) {
    // Keep the queue for the next platform load when it cannot be merged.
  }
  return nextState;
}

function loadUi() {
  const defaults = {
    view: "scenes",
    sceneTab: "templates",
    sceneCategory: "all",
    sceneIndustry: "all",
    selectedSceneTemplateId: "gear_surface_defect",
    selectedSceneId: "scene_gear_trial",
    modelScene: "all",
    modelQuery: "",
    selectedModelId: "model_gear_surface",
    expandedModelId: "",
    openModelMenu: "",
    selectedRecordId: "",
    trainingTab: "pending",
    activeImageId: "img_gear_a_000",
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
    datasetDetailTab: "pool",
    operatorDataVersionId: "all",
    operatorDataSplit: "all",
    operatorDataStatus: "all",
    operatorPoolQuery: "",
    operatorPoolSource: "all",
    operatorPoolScrollTop: 0,
    operatorDataDateGroup: "day",
    operatorDataViewMode: "overview",
    operatorDataActiveImageId: "",
    operatorSamplePanelWidth: 520,
    operatorShowPredictions: true,
    expandedOperatorVersionId: "",
    operatorVersionExpansionTouched: false,
    operatorVersionDetailTabs: {},
    operatorAnnotationVersionIds: null,
    operatorAnnotationVersionsTouched: false,
    selectedDatasetVersionId: "",
    datasetAnnotationQuery: "",
    datasetAnnotationStatus: "pending",
    datasetAnnotationSplit: "all",
    datasetAnnotationCollapsedSources: [],
    libraryQuery: "",
    libraryDevice: "all",
    libraryTag: "all",
    selectedFolderId: "",
    selectedDatasetId: "dataset_gear_surface",
    datasetStatus: "all",
    clientStatus: "all",
    clientQuery: "",
    accountMenuOpen: false,
    accountEditingPassword: false,
    accountEditingCompany: false,
  };
  try {
    const persisted = JSON.parse(localStorage.getItem(UI_STORAGE_KEY) || "{}");
    const loaded = { ...defaults, ...persisted, testRunning: false, accountMenuOpen: false };
    delete loaded.operatorPoolVersionId;
    delete loaded.operatorPoolVersionInitializedFor;
    delete loaded.operatorPoolInitializedLatestVersionId;
    delete loaded.operatorSamplePoolSchema;
    delete loaded.starredOperatorSamples;
    delete loaded.operatorDataStarredOnly;
    delete loaded.datasetAnnotationScope;
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
