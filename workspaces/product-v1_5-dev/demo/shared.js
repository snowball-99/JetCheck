(function () {
  const STORAGE_KEY = "jetcheck-demo-state-v2";
  const ONLINE_THRESHOLD_MS = 10 * 60 * 1000;
  const DISPLAY_TIME_ZONE = "Asia/Shanghai";
  const MOBILE_ACCOUNT_PATTERN = /^1\d{10}$/;
  const VALID_MODEL_SCENE_TYPES = new Set(["尺寸", "分类", "缺陷检测"]);
  const BUSINESS_RESULT_MAP = {
    OK: "OK",
    NG: "NG",
    放行: "OK",
    拦截: "NG",
    复检: "NG",
    未判定: "未判定",
  };
  const GEAR_ANGLES = [0, 30, 60, 90, 120, 150];
  const GEAR_EXAMPLE_TOOL_NAME = "示例-齿轮";
  const GEAR_EXAMPLE_SURFACE_MODEL_NAME = "示例-齿轮齿面识别";
  const GEAR_EXAMPLE_BUBBLE_MODEL_NAME = "示例-齿轮气泡检测";
  const BACKPLATE_EXAMPLE_TOOL_NAME = "示例-背板";
  const BACKPLATE_EXAMPLE_MODEL_NAME = "示例-背板缺陷检测";
  const EXAMPLE_PREFIX = "示例-";

  function withExamplePrefix(value) {
    const text = String(value || "").trim();
    if (!text) return text;
    return text.startsWith(EXAMPLE_PREFIX) ? text : `${EXAMPLE_PREFIX}${text}`;
  }

  function prefixExampleRecord(record) {
    if (!record || typeof record !== "object") return;
    record.toolName = withExamplePrefix(record.toolName);
    record.detectName = withExamplePrefix(record.detectName);
    (record.imageResults || []).forEach((imageResult) => {
      imageResult.acquireName = withExamplePrefix(imageResult.acquireName);
      imageResult.imageLabel = withExamplePrefix(imageResult.imageLabel);
      (imageResult.subResults || []).forEach((subResult) => {
        subResult.name = withExamplePrefix(subResult.name);
        subResult.imageLabel = withExamplePrefix(subResult.imageLabel);
        (subResult.detectResults || []).forEach((detectResult) => {
          detectResult.name = withExamplePrefix(detectResult.name);
          detectResult.detectName = withExamplePrefix(detectResult.detectName);
        });
      });
    });
    (record.subResults || []).forEach((subResult) => {
      subResult.name = withExamplePrefix(subResult.name);
      subResult.imageLabel = withExamplePrefix(subResult.imageLabel);
      (subResult.detectResults || []).forEach((detectResult) => {
        detectResult.name = withExamplePrefix(detectResult.name);
        detectResult.detectName = withExamplePrefix(detectResult.detectName);
      });
    });
  }

  function applyExamplePrefixes(state) {
    (state.localModels || []).forEach((model) => {
      model.modelName = withExamplePrefix(model.modelName);
    });
    (state.cloudModels || []).forEach((model) => {
      model.modelName = withExamplePrefix(model.modelName);
      (model.versions || []).forEach((version, index) => {
        version.displayVersion = `V${index + 1}`;
      });
    });
    (state.localModels || []).forEach((model) => {
      const cloudVersion = (state.cloudModels || [])
        .flatMap((cloudModel) => cloudModel.versions || [])
        .find((version) => version.id === model.id || version.version === model.version);
      model.displayVersion = cloudVersion?.displayVersion || model.displayVersion || "V1";
    });
    (state.cameras || []).forEach((camera) => {
      camera.name = withExamplePrefix(camera.name);
      (camera.paramGroups || []).forEach((group) => {
        group.name = withExamplePrefix(group.name);
      });
    });
    (state.availableCameras || []).forEach((camera) => {
      camera.name = withExamplePrefix(camera.name);
    });
    (state.ioModules || []).forEach((module) => {
      module.name = withExamplePrefix(module.name);
      (module.inputs || []).forEach((point) => {
        point.name = withExamplePrefix(point.name);
      });
      (module.outputs || []).forEach((point) => {
        point.name = withExamplePrefix(point.name);
      });
    });
    (state.tools || []).forEach((tool) => {
      tool.name = withExamplePrefix(tool.name);
      (tool.acquire || []).forEach((acquire) => {
        acquire.name = withExamplePrefix(acquire.name);
        acquire.sampleImageName = withExamplePrefix(acquire.sampleImageName);
        acquire.sampleImage = withExamplePrefix(acquire.sampleImage);
      });
      (tool.process || []).forEach((process) => {
        process.name = withExamplePrefix(process.name);
      });
      (tool.detect || []).forEach((detect) => {
        detect.name = withExamplePrefix(detect.name);
      });
      (tool.ioConfig?.input || []).forEach((item) => {
        item.name = withExamplePrefix(item.name);
      });
      (tool.ioConfig?.output || []).forEach((item) => {
        item.name = withExamplePrefix(item.name);
      });
    });
    (state.detectionRecords || []).forEach(prefixExampleRecord);
    (state.captureRecords || []).forEach((record) => {
      record.toolName = withExamplePrefix(record.toolName);
      (record.items || []).forEach((item) => {
        item.acquireName = withExamplePrefix(item.acquireName);
        (item.images || []).forEach((image) => {
          image.fileName = withExamplePrefix(image.fileName);
        });
      });
    });
    return state;
  }

  function formatGearAngle(angle) {
    return String(angle).padStart(3, "0");
  }

  function buildGearAcquireItems() {
    return GEAR_ANGLES.flatMap((angle) => {
      const padded = formatGearAngle(angle);
      return [
        {
          id: `acq_gear_a_${padded}`,
          name: `示例-相机A ${angle}°`,
          type: "camera",
          cameraId: "cam_gear_a",
          paramGroupId: "cam_gear_a_pg_01",
          sampleImageName: `示例-齿轮A_${padded}.png`,
          sampleImageUrl: "./sample-images/齿轮.jpg",
          sampleImageWidth: 1920,
          sampleImageHeight: 1200,
          sampleImage: `示例-齿轮A_${padded}.png`,
        },
        {
          id: `acq_gear_b_${padded}`,
          name: `示例-相机B ${angle}°`,
          type: "camera",
          cameraId: "cam_gear_b",
          paramGroupId: "cam_gear_b_pg_01",
          sampleImageName: `示例-齿轮B_${padded}.png`,
          sampleImageUrl: "./sample-images/齿轮.jpg",
          sampleImageWidth: 1920,
          sampleImageHeight: 1200,
          sampleImage: `示例-齿轮B_${padded}.png`,
        },
      ];
    });
  }

  function buildGearProcessItems() {
    return buildGearAcquireItems().map((acquire) => ({
      id: `proc_${acquire.id.replace(/^acq_/, "")}_surface`,
      name: `${acquire.name} 齿面识别`,
      inputId: acquire.id,
      mode: "model-roi",
      modelId: "mdl_local_gear_surface",
      modelSceneType: "分类",
      categoryOptions: ["齿面"],
      categories: ["齿面"],
      regions: [],
    }));
  }

  function buildGearDetectTargets() {
    return buildGearProcessItems().map((process) => ({
      processId: process.id,
      categoryKey: "齿面",
      categoryLabel: "齿面",
    }));
  }

  function getGearSurfaceRegions() {
    return [
      { x: 0.25, y: 0.30, w: 0.42, h: 0.12 },
      { x: 0.255, y: 0.41, w: 0.425, h: 0.12 },
      { x: 0.26, y: 0.52, w: 0.425, h: 0.12 },
      { x: 0.26, y: 0.63, w: 0.43, h: 0.12 },
      { x: 0.26, y: 0.74, w: 0.43, h: 0.12 },
    ];
  }

  function getGearBubbleDefectBox(index) {
    const boxes = [
      { x: 0.48, y: 0.12, w: 0.08, h: 0.72 },
      { x: 0.28, y: 0.12, w: 0.08, h: 0.72 },
      { x: 0.58, y: 0.12, w: 0.08, h: 0.72 },
      { x: 0.42, y: 0.12, w: 0.08, h: 0.72 },
      { x: 0.62, y: 0.12, w: 0.08, h: 0.72 },
    ];
    return boxes[index % boxes.length];
  }

  function buildGearIoInputs() {
    const anglePairs = GEAR_ANGLES.flatMap((angle, angleIndex) => {
      const captureIndex = angleIndex * 2 + 1;
      const point = `DI-${angleIndex + 1}`;
      return [
        {
          id: `io_in_gear_${formatGearAngle(angle)}_a`,
          type: `capture:${captureIndex}`,
          name: `触发示例-相机A ${angle}°`,
          moduleId: "io_002",
          point,
          priority: angleIndex + 2,
        },
        {
          id: `io_in_gear_${formatGearAngle(angle)}_b`,
          type: `capture:${captureIndex + 1}`,
          name: `触发示例-相机B ${angle}°`,
          moduleId: "io_002",
          point,
          priority: angleIndex + 2,
        },
      ];
    });
    return [
      { id: "io_in_gear_start", type: "new-cycle", name: "示例-周期开始", moduleId: "io_002", point: "DI-1", priority: 1 },
      ...anglePairs,
    ];
  }

  function buildGearImageResults(recordId, ngAcquireIds = []) {
    const ngSet = new Set(ngAcquireIds);
    const surfaceRegions = getGearSurfaceRegions();
    return buildGearAcquireItems().map((acquire, index) => {
      const isNg = ngSet.has(acquire.id);
      const processId = `proc_${acquire.id.replace(/^acq_/, "")}_surface`;
      const ngSurfaceIndex = isNg ? (index % surfaceRegions.length) : -1;
      const subResults = surfaceRegions.map((regionBox, surfaceIndex) => {
        const surfaceNg = surfaceIndex === ngSurfaceIndex;
        const surfaceLabel = "齿面";
        return {
          id: `${recordId}_sub_${index + 1}_${surfaceIndex + 1}`,
          name: `${GEAR_EXAMPLE_SURFACE_MODEL_NAME} ${surfaceLabel}${surfaceIndex + 1}`,
          source: surfaceLabel,
          modelId: "mdl_local_gear_bubble",
          modelSceneType: "缺陷检测",
          businessResult: surfaceNg ? "NG" : "OK",
          algorithmOutput: surfaceNg ? "气泡缺陷 91.8%" : "未发现气泡缺陷",
          imageLabel: `${acquire.sampleImageName} / ${surfaceLabel}${surfaceIndex + 1}`,
          suspicious: surfaceNg,
          processId,
          regionId: `${processId}_${surfaceLabel}${surfaceIndex + 1}`,
          regionBox,
          outputType: "roi",
          categoryKey: "齿面",
          detectResults: [
            {
              id: `${recordId}_det_${index + 1}_${surfaceIndex + 1}`,
              name: GEAR_EXAMPLE_BUBBLE_MODEL_NAME,
              detectId: "det_gear_bubble",
              detectName: GEAR_EXAMPLE_BUBBLE_MODEL_NAME,
              modelId: "mdl_local_gear_bubble",
              modelSceneType: "缺陷检测",
              businessResult: surfaceNg ? "NG" : "OK",
              algorithmOutput: surfaceNg ? "气泡缺陷 91.8%" : "未发现气泡缺陷",
              suspicious: surfaceNg,
              detectionBox: surfaceNg ? getGearBubbleDefectBox(surfaceIndex) : null,
            },
          ],
        };
      });
      return {
        id: `${recordId}_img_${index + 1}`,
        acquireId: acquire.id,
        acquireName: acquire.name,
        imageLabel: acquire.sampleImageName,
        result: isNg ? "NG" : "OK",
        subResults,
      };
    });
  }

  function buildGearDetectionRecord({ id, triggeredAt, result = "OK", ngAcquireIds = [] }) {
    const imageResults = buildGearImageResults(id, ngAcquireIds);
    const subResults = imageResults.flatMap((item) => item.subResults);
    return {
      id,
      toolId: "tool_gear",
      toolName: GEAR_EXAMPLE_TOOL_NAME,
      detectId: "det_gear_bubble",
      detectName: GEAR_EXAMPLE_BUBBLE_MODEL_NAME,
      triggeredAt,
      inputSource: "双相机转盘输入",
      executionStatus: "已完成",
      runMode: "detect",
      completedStages: ["acquire", "process", "detect"],
      totalResult: result,
      businessResult: result,
      imageResults,
      subResults,
      ngCount: subResults.filter((item) => item.businessResult === "NG").length,
      suspiciousCount: subResults.filter((item) => item.suspicious).length,
    };
  }

  function buildGearCaptureRecord() {
    return {
      id: "CAP-20260323-GEAR-001",
      toolId: "tool_gear",
      toolName: GEAR_EXAMPLE_TOOL_NAME,
      status: "已结束",
      startedAt: "2026-03-23T08:30:00+08:00",
      completedAt: "2026-03-23T08:41:20+08:00",
      appendMode: false,
      items: buildGearAcquireItems().map((acquire, acquireIndex) => ({
        acquireId: acquire.id,
        acquireName: acquire.name,
        enabled: true,
        targetCount: null,
        availableTags: ["OK", "NG"],
        selectedTag: "",
        selectedTags: [],
        tagSelectMode: "single",
        images: [1, 2].map((imageIndex) => ({
          id: `CAP_GEAR_${acquireIndex + 1}_${imageIndex}`,
          acquireId: acquire.id,
          capturedAt: `2026-03-23T08:${String(30 + imageIndex + Math.floor(acquireIndex / 2)).padStart(2, "0")}:00+08:00`,
          fileName: `${acquire.sampleImageName.replace(/\.[^.]+$/, "")}_${String(imageIndex).padStart(3, "0")}.png`,
          imageUrl: acquire.sampleImageUrl,
          tags: imageIndex === 2 && acquire.id === "acq_gear_b_090" ? ["NG"] : ["OK"],
        })),
      })),
    };
  }

  function buildBackplateAcquireItems() {
    return [
      {
        id: "acq_backplate_upper",
        name: "示例-上半面",
        type: "camera",
        cameraId: "cam_backplate",
        paramGroupId: "cam_backplate_pg_01",
        sampleImageName: "示例-背板-上.png",
        sampleImageUrl: "./sample-images/背板-上.png",
        sampleImageWidth: 3072,
        sampleImageHeight: 2048,
        sampleImage: "示例-背板-上.png",
      },
      {
        id: "acq_backplate_lower",
        name: "示例-下半面",
        type: "camera",
        cameraId: "cam_backplate",
        paramGroupId: "cam_backplate_pg_01",
        sampleImageName: "示例-背板-下.png",
        sampleImageUrl: "./sample-images/背板-下.png",
        sampleImageWidth: 3072,
        sampleImageHeight: 2048,
        sampleImage: "示例-背板-下.png",
      },
    ];
  }

  function buildBackplateProcessItems() {
    return [
      {
        id: "proc_backplate_upper_full",
        name: "示例-上半面全图处理",
        inputId: "acq_backplate_upper",
        mode: "full-image",
        regions: [],
      },
      {
        id: "proc_backplate_lower_full",
        name: "示例-下半面全图处理",
        inputId: "acq_backplate_lower",
        mode: "full-image",
        regions: [],
      },
    ];
  }

  function buildBackplateImageResults(recordId, ngAcquireIds = []) {
    const ngSet = new Set(ngAcquireIds);
    return buildBackplateAcquireItems().map((acquire, index) => {
      const isNg = ngSet.has(acquire.id);
      const processId = index === 0 ? "proc_backplate_upper_full" : "proc_backplate_lower_full";
      return {
        id: `${recordId}_img_${index + 1}`,
        acquireId: acquire.id,
        acquireName: acquire.name,
        imageLabel: acquire.sampleImageName,
        result: isNg ? "NG" : "OK",
        subResults: [
          {
            id: `${recordId}_sub_${index + 1}`,
            name: BACKPLATE_EXAMPLE_MODEL_NAME,
            source: "全图",
            modelId: "mdl_local_backplate_defect",
            modelSceneType: "缺陷检测",
            businessResult: isNg ? "NG" : "OK",
            algorithmOutput: isNg ? "边缘压痕缺陷 89.6%" : "无明显缺陷 98.9%",
            imageLabel: acquire.sampleImageName,
            suspicious: isNg,
            processId,
            outputType: "full-image",
            detectResults: [
              {
                id: `${recordId}_det_${index + 1}`,
                name: BACKPLATE_EXAMPLE_MODEL_NAME,
                detectId: "det_backplate_defect",
                detectName: BACKPLATE_EXAMPLE_MODEL_NAME,
                modelId: "mdl_local_backplate_defect",
                modelSceneType: "缺陷检测",
                businessResult: isNg ? "NG" : "OK",
                algorithmOutput: isNg ? "边缘压痕缺陷 89.6%" : "无明显缺陷 98.9%",
                suspicious: isNg,
              },
            ],
          },
        ],
      };
    });
  }

  function buildBackplateDetectionRecord({ id, triggeredAt, result = "OK", ngAcquireIds = [] }) {
    const imageResults = buildBackplateImageResults(id, ngAcquireIds);
    const subResults = imageResults.flatMap((item) => item.subResults);
    return {
      id,
      toolId: "tool_backplate",
      toolName: BACKPLATE_EXAMPLE_TOOL_NAME,
      detectId: "det_backplate_defect",
      detectName: BACKPLATE_EXAMPLE_MODEL_NAME,
      triggeredAt,
      inputSource: "单相机翻面输入",
      executionStatus: "已完成",
      runMode: "detect",
      completedStages: ["acquire", "process", "detect"],
      totalResult: result,
      businessResult: result,
      imageResults,
      subResults,
      ngCount: subResults.filter((item) => item.businessResult === "NG").length,
      suspiciousCount: subResults.filter((item) => item.suspicious).length,
    };
  }

  const DEFAULT_STATE = {
    version: 26,
    meta: {
      now: "2026-03-23T09:16:00+08:00",
    },
    enterprise: {
      account: "13800138000",
      password: "JetCheck#2026",
      contactName: "张晓岚",
      companyName: "浙江一木智能科技有限公司",
      quota: 6,
    },
    runtimeDevice: {
      name: "苏州客户端03",
      hardwareCode: "98-FF-21-AB-49-10",
      networkOnline: true,
    },
    session: {
      loggedIn: false,
      clientId: null,
      account: "",
      lastMessage: "请输入手机号和密码，系统会在登录后自动校验当前设备并完成绑定。",
    },
    clients: [
      {
        id: "client_001",
        name: "插板检测工位A",
        enterpriseAccount: "13800138000",
        hardwareCode: "8C-4B-14-72-1E-10",
        bound: true,
        boundAt: "2026-03-19T09:20:12+08:00",
        lastLoginAt: "2026-03-23T09:10:28+08:00",
        lastHeartbeatAt: "2026-03-23T09:12:40+08:00",
        offlineAt: null,
        token: "token_client_001",
      },
      {
        id: "client_002",
        name: "压板复检工位",
        enterpriseAccount: "13800138000",
        hardwareCode: "30-A5-3A-41-9F-C2",
        bound: true,
        boundAt: "2026-03-18T17:42:08+08:00",
        lastLoginAt: "2026-03-23T08:45:04+08:00",
        lastHeartbeatAt: "2026-03-23T08:58:04+08:00",
        offlineAt: "2026-03-23T09:08:44+08:00",
        token: "token_client_002",
      },
      {
        id: "client_004",
        name: "样本标注工作站",
        enterpriseAccount: "13800138000",
        hardwareCode: "70-AD-5A-91-3E-01",
        bound: true,
        boundAt: "2026-03-20T11:11:20+08:00",
        lastLoginAt: "2026-03-23T08:58:16+08:00",
        lastHeartbeatAt: "2026-03-23T09:06:10+08:00",
        offlineAt: null,
        token: "token_client_004",
      },
    ],
    storage: {
      remainingGb: 80,
      warningGb: 20,
      blockGb: 10,
      usage: {
        detectImages: 132.4,
        captureImages: 0,
        models: 24.8,
        other: 16.2,
      },
    },
    localModels: [
      {
        id: "mdl_local_gear_surface",
        operatorId: "model_gear_surface",
        weightId: "mv_gear_surface_v1",
        deploymentId: "deploy_gear_surface_v1",
        configRevision: "1",
        version: "20260323011",
        modelName: GEAR_EXAMPLE_SURFACE_MODEL_NAME,
        sceneType: "分类",
        source: "云端同步",
        addedAt: "2026-03-23T08:18:10+08:00",
        categories: ["齿面"],
      },
      {
        id: "mdl_local_gear_bubble",
        operatorId: "model_gear_bubble",
        weightId: "mv_gear_bubble_v1",
        deploymentId: "deploy_gear_bubble_v1",
        configRevision: "1",
        version: "20260323021",
        modelName: GEAR_EXAMPLE_BUBBLE_MODEL_NAME,
        sceneType: "缺陷检测",
        source: "云端同步",
        addedAt: "2026-03-23T08:24:42+08:00",
      },
      {
        id: "mdl_local_backplate_defect",
        operatorId: "model_backplate_defect",
        weightId: "mv_backplate_v1",
        deploymentId: "deploy_backplate_v1",
        configRevision: "1",
        version: "20260324011",
        modelName: BACKPLATE_EXAMPLE_MODEL_NAME,
        sceneType: "缺陷检测",
        source: "云端同步",
        addedAt: "2026-03-24T10:28:36+08:00",
      },
      {
        id: "mdl_local_001",
        version: "20260318001",
        modelName: "卡扣外观分类",
        sceneType: "分类",
        source: "云端同步",
        addedAt: "2026-03-18T16:35:18+08:00",
        categories: ["卡扣正常", "卡扣缺失", "卡扣破损"],
      },
      {
        id: "mdl_local_002",
        version: "20260320021",
        modelName: "卡扣安装有无检测",
        sceneType: "分类",
        source: "导入本地算子",
        addedAt: "2026-03-20T10:12:10+08:00",
        categories: ["卡扣已安装", "卡扣缺失"],
      },
      {
        id: "mdl_local_003",
        version: "20260320031",
        modelName: "焊点焊接有无检测",
        sceneType: "分类",
        source: "导入本地算子",
        addedAt: "2026-03-20T11:08:36+08:00",
        categories: ["焊点完整", "焊点缺失"],
      },
      {
        id: "mdl_local_004",
        version: "20260322041",
        modelName: "K11螺杆左模版",
        sceneType: "尺寸",
        source: "导入本地算子",
        addedAt: "2026-03-22T10:18:06+08:00",
        categories: ["螺杆1总长", "螺杆1螺纹长", "螺杆2总长", "螺杆2台阶高", "螺杆间距", "边缘到螺杆1"],
      },
      {
        id: "mdl_local_005",
        version: "20260322042",
        modelName: "K11螺杆右模版",
        sceneType: "尺寸",
        source: "导入本地算子",
        addedAt: "2026-03-22T10:24:18+08:00",
        categories: ["螺杆1总长", "螺杆1螺纹长", "螺杆2总长", "螺杆2台阶高", "螺杆间距", "边缘到螺杆2"],
      },
      {
        id: "mdl_local_006",
        version: "20260322061",
        modelName: "X光加热丝零件识别",
        sceneType: "分类",
        source: "导入本地算子",
        addedAt: "2026-03-22T14:12:26+08:00",
        categories: ["加热丝主体", "连接端子", "定位夹片"],
      },
      {
        id: "mdl_local_007",
        version: "20260322071",
        modelName: "X光零件缺陷检测",
        sceneType: "缺陷检测",
        source: "导入本地算子",
        addedAt: "2026-03-22T15:06:14+08:00",
      },
      {
        id: "mdl_local_008",
        version: "20260322081",
        modelName: "纱布缺陷检测",
        sceneType: "缺陷检测",
        source: "导入本地算子",
        addedAt: "2026-03-22T16:28:44+08:00",
      },
    ],
    cloudModels: [
      {
        id: "cloud_model_gear_surface",
        operatorId: "model_gear_surface",
        modelName: GEAR_EXAMPLE_SURFACE_MODEL_NAME,
        sceneType: "分类",
        updatedAt: "2026-03-23T08:18:10+08:00",
        versions: [
          {
            id: "mdl_local_gear_surface",
            weightId: "mv_gear_surface_v1",
            deploymentId: "deploy_gear_surface_v1",
            configRevision: "1",
            version: "20260323011",
            completedAt: "2026-03-23T08:18:10+08:00",
          },
        ],
      },
      {
        id: "cloud_model_gear_bubble",
        operatorId: "model_gear_bubble",
        modelName: GEAR_EXAMPLE_BUBBLE_MODEL_NAME,
        sceneType: "缺陷检测",
        updatedAt: "2026-03-23T08:24:42+08:00",
        versions: [
          {
            id: "mdl_local_gear_bubble",
            weightId: "mv_gear_bubble_v1",
            deploymentId: "deploy_gear_bubble_v1",
            configRevision: "1",
            version: "20260323021",
            completedAt: "2026-03-23T08:24:42+08:00",
          },
        ],
      },
      {
        id: "cloud_model_backplate_defect",
        operatorId: "model_backplate_defect",
        modelName: BACKPLATE_EXAMPLE_MODEL_NAME,
        sceneType: "缺陷检测",
        updatedAt: "2026-03-24T10:28:36+08:00",
        versions: [
          {
            id: "mdl_local_backplate_defect",
            weightId: "mv_backplate_v1",
            deploymentId: "deploy_backplate_v1",
            configRevision: "1",
            version: "20260324011",
            completedAt: "2026-03-24T10:28:36+08:00",
          },
        ],
      },
      {
        id: "cloud_model_a",
        modelName: "卡扣外观分类",
        sceneType: "分类",
        updatedAt: "2026-03-21T11:22:10+08:00",
        versions: [
          {
            id: "mdl_local_001",
            version: "20260318001",
            completedAt: "2026-03-18T16:20:18+08:00",
          },
          {
            id: "mdl_cloud_004",
            version: "20260321003",
            completedAt: "2026-03-21T11:22:10+08:00",
          },
        ],
      },
      {
        id: "cloud_model_b",
        modelName: "卡扣安装有无检测",
        sceneType: "分类",
        updatedAt: "2026-03-22T09:18:42+08:00",
        versions: [
          {
            id: "mdl_local_002",
            version: "20260320021",
            completedAt: "2026-03-20T10:05:12+08:00",
          },
          {
            id: "mdl_cloud_012",
            version: "20260322002",
            completedAt: "2026-03-22T09:18:42+08:00",
          },
        ],
      },
      {
        id: "cloud_model_c",
        modelName: "焊点焊接有无检测",
        sceneType: "分类",
        updatedAt: "2026-03-22T13:36:52+08:00",
        versions: [
          {
            id: "mdl_local_003",
            version: "20260320031",
            completedAt: "2026-03-20T11:01:09+08:00",
          },
          {
            id: "mdl_cloud_017",
            version: "20260322009",
            completedAt: "2026-03-22T13:36:52+08:00",
          },
        ],
      },
      {
        id: "cloud_model_d",
        modelName: "X光加热丝零件识别",
        sceneType: "分类",
        updatedAt: "2026-03-22T14:05:10+08:00",
        versions: [
          {
            id: "mdl_local_006",
            version: "20260322061",
            completedAt: "2026-03-22T14:05:10+08:00",
          },
        ],
      },
      {
        id: "cloud_model_e",
        modelName: "X光零件缺陷检测",
        sceneType: "缺陷检测",
        updatedAt: "2026-03-22T15:00:14+08:00",
        versions: [
          {
            id: "mdl_local_007",
            version: "20260322071",
            completedAt: "2026-03-22T15:00:14+08:00",
          },
        ],
      },
      {
        id: "cloud_model_f",
        modelName: "纱布缺陷检测",
        sceneType: "缺陷检测",
        updatedAt: "2026-03-22T16:22:44+08:00",
        versions: [
          {
            id: "mdl_local_008",
            version: "20260322081",
            completedAt: "2026-03-22T16:22:44+08:00",
          },
        ],
      },
    ],
    cameras: [
      {
        id: "cam_gear_a",
        name: "示例-齿轮A相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-GEAR-A001",
        ip: "192.168.1.31",
        status: "空闲",
        paramGroups: [
          {
            id: "cam_gear_a_pg_01",
            name: "示例-齿面高亮参数",
            settings: {
              autoExposure: false,
              exposure: 9000,
              autoGain: false,
              gain: 0,
              width: 1920,
              height: 1200,
              offsetX: 0,
              offsetY: 0,
            },
          },
        ],
      },
      {
        id: "cam_gear_b",
        name: "示例-齿轮B相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-GEAR-B001",
        ip: "192.168.1.32",
        status: "空闲",
        paramGroups: [
          {
            id: "cam_gear_b_pg_01",
            name: "示例-侧面补光参数",
            settings: {
              autoExposure: false,
              exposure: 10500,
              autoGain: false,
              gain: 0,
              width: 1920,
              height: 1200,
              offsetX: 0,
              offsetY: 0,
            },
          },
        ],
      },
      {
        id: "cam_backplate",
        name: "示例-背板相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-BACK-PLATE-001",
        ip: "192.168.1.33",
        status: "空闲",
        paramGroups: [
          {
            id: "cam_backplate_pg_01",
            name: "示例-背板面光源参数",
            settings: {
              autoExposure: false,
              exposure: 10000,
              autoGain: false,
              gain: 0,
              width: 1920,
              height: 1200,
              offsetX: 0,
              offsetY: 0,
            },
          },
        ],
      },
      {
        id: "cam_01",
        name: "上料位相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-HIK-0001",
        ip: "192.168.1.21",
        status: "空闲",
        paramGroups: [
          {
            id: "cam_01_pg_01",
            name: "默认参数组1",
            settings: {
              autoGain: false,
              exposure: 10000,
              offsetX: 0,
              height: 1200,
              offsetY: 0,
              autoExposure: false,
              width: 1920,
              gain: 0,
            },
          },
          {
            id: "cam_01_pg_02",
            name: "低曝光方案",
            settings: {
              autoGain: false,
              exposure: 8000,
              offsetX: 0,
              height: 1200,
              offsetY: 0,
              autoExposure: false,
              width: 1920,
              gain: 0,
            },
          },
        ],
      },
      {
        id: "cam_02",
        name: "示例-螺杆相机",
        vendor: "Basler",
        brand: "Basler",
        model: "a2A2448-75uc",
        serial: "SN-BAS-0018",
        ip: "192.168.1.22",
        status: "占用",
        paramGroups: [
          {
            id: "cam_02_pg_01",
            name: "默认参数组1",
            settings: {
              autoGain: false,
              exposure: 10000,
              offsetX: 0,
              height: 1200,
              offsetY: 0,
              autoExposure: false,
              width: 1920,
              gain: 0,
            },
          },
        ],
      },
      {
        id: "cam_03",
        name: "复检位相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CE120-10UM",
        serial: "SN-HIK-0020",
        ip: "192.168.1.23",
        status: "离线",
        paramGroups: [
          {
            id: "cam_03_pg_01",
            name: "默认参数组1",
            settings: {
              autoGain: false,
              exposure: 10000,
              offsetX: 0,
              height: 1200,
              offsetY: 0,
              autoExposure: false,
              width: 1920,
              gain: 0,
            },
          },
        ],
      },
    ],
    availableCameras: [
      {
        id: "cam_gear_a",
        name: "示例-齿轮A相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-GEAR-A001",
        ip: "192.168.1.31",
        status: "空闲",
      },
      {
        id: "cam_gear_b",
        name: "示例-齿轮B相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-GEAR-B001",
        ip: "192.168.1.32",
        status: "空闲",
      },
      {
        id: "cam_backplate",
        name: "示例-背板相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-BACK-PLATE-001",
        ip: "192.168.1.33",
        status: "空闲",
      },
      {
        id: "cam_01",
        name: "上料位相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-HIK-0001",
        ip: "192.168.1.21",
        status: "空闲",
      },
      {
        id: "cam_02",
        name: "示例-螺杆相机",
        vendor: "Basler",
        brand: "Basler",
        model: "a2A2448-75uc",
        serial: "SN-BAS-0018",
        ip: "192.168.1.22",
        status: "占用",
      },
      {
        id: "cam_04",
        name: "补光位相机",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA050-11UM",
        serial: "SN-HIK-0024",
        ip: "192.168.1.24",
        status: "空闲",
      },
      {
        id: "cam_05",
        name: "二次复检相机",
        vendor: "Basler",
        brand: "Basler",
        model: "a2A1920-51gc",
        serial: "SN-BAS-0021",
        ip: "192.168.1.25",
        status: "空闲",
      },
      {
        id: "cam_06",
        name: "",
        vendor: "HIKROBOT",
        brand: "HIK",
        model: "MV-CA032-10UC",
        serial: "SN-HIK-0032",
        ip: "192.168.1.26",
        status: "离线",
      },
    ],
    ioModules: [
      {
        id: "io_001",
        name: "IO模块1",
        model: "USR-IO424T",
        ip: "",
        port: 28899,
        deviceId: "17",
        status: "在线",
        inputs: [
          { point: "DI-1", name: "" },
          { point: "DI-2", name: "" },
          { point: "DI-3", name: "" },
          { point: "DI-4", name: "" },
        ],
        outputs: [
          { point: "DO-1", name: "" },
          { point: "DO-2", name: "" },
          { point: "DO-3", name: "" },
          { point: "DO-4", name: "" },
        ],
      },
      {
        id: "io_002",
        name: "示例-齿轮转盘IO",
        model: "USR-IO808",
        ip: "192.168.1.41",
        port: 28899,
        deviceId: "17",
        status: "在线",
        inputs: [
          { point: "DI-1", name: "示例-按钮 / 0°到位" },
          { point: "DI-2", name: "示例-30°到位" },
          { point: "DI-3", name: "示例-60°到位" },
          { point: "DI-4", name: "示例-90°到位" },
          { point: "DI-5", name: "示例-120°到位" },
          { point: "DI-6", name: "示例-150°到位" },
          { point: "DI-7", name: "" },
          { point: "DI-8", name: "" },
        ],
        outputs: [
          { point: "DO-1", name: "示例-周期NG红灯" },
          { point: "DO-2", name: "示例-周期OK绿灯" },
          { point: "DO-3", name: "示例-周期异常黄灯" },
          { point: "DO-4", name: "" },
          { point: "DO-5", name: "" },
          { point: "DO-6", name: "" },
          { point: "DO-7", name: "" },
          { point: "DO-8", name: "" },
        ],
      },
      {
        id: "io_backplate",
        name: "示例-背板翻面IO",
        model: "USR-IO808",
        ip: "192.168.1.42",
        port: 28899,
        deviceId: "18",
        status: "在线",
        inputs: [
          { point: "DI-1", name: "示例-按钮 / 上半面触发" },
          { point: "DI-2", name: "示例-转180°到位" },
          { point: "DI-3", name: "" },
          { point: "DI-4", name: "" },
          { point: "DI-5", name: "" },
          { point: "DI-6", name: "" },
          { point: "DI-7", name: "" },
          { point: "DI-8", name: "" },
        ],
        outputs: [
          { point: "DO-1", name: "示例-周期NG红灯" },
          { point: "DO-2", name: "示例-周期OK绿灯" },
          { point: "DO-3", name: "示例-周期异常黄灯" },
          { point: "DO-4", name: "示例-气缸旋转信号" },
          { point: "DO-5", name: "示例-气缸复位信号" },
          { point: "DO-6", name: "" },
          { point: "DO-7", name: "" },
          { point: "DO-8", name: "" },
        ],
      },
    ],
    tools: [
      {
        id: "tool_gear",
        name: GEAR_EXAMPLE_TOOL_NAME,
        tone: "tone-blue",
        acquire: buildGearAcquireItems(),
        process: buildGearProcessItems(),
        detect: [
          {
            id: "det_gear_bubble",
            name: GEAR_EXAMPLE_BUBBLE_MODEL_NAME,
            processIds: buildGearDetectTargets().map((target) => target.processId),
            targets: buildGearDetectTargets(),
            modelId: "mdl_local_gear_bubble",
          },
        ],
        runtime: {
          lastRunAt: "2026-03-23T09:12:40+08:00",
          status: "未运行",
          primaryResult: "-",
          cycleTime: "-",
          sessionActive: false,
          sessionMode: "detect",
        },
        ioConfig: {
          moduleIds: ["io_002"],
          input: buildGearIoInputs(),
          output: [
            { id: "io_out_gear_ng", type: "cycle-ng", name: "示例-周期NG红灯", moduleId: "io_002", point: "DO-1", duration: 1 },
            { id: "io_out_gear_ok", type: "cycle-ok", name: "示例-周期OK绿灯", moduleId: "io_002", point: "DO-2", duration: 1 },
            { id: "io_out_gear_error", type: "cycle-error", name: "示例-周期异常黄灯", moduleId: "io_002", point: "DO-3", duration: 1 },
          ],
        },
      },
      {
        id: "tool_backplate",
        name: BACKPLATE_EXAMPLE_TOOL_NAME,
        tone: "tone-green",
        acquire: buildBackplateAcquireItems(),
        process: buildBackplateProcessItems(),
        detect: [
          {
            id: "det_backplate_defect",
            name: BACKPLATE_EXAMPLE_MODEL_NAME,
            processIds: ["proc_backplate_upper_full", "proc_backplate_lower_full"],
            targets: [
              { processId: "proc_backplate_upper_full", categoryKey: "", categoryLabel: "" },
              { processId: "proc_backplate_lower_full", categoryKey: "", categoryLabel: "" },
            ],
            modelId: "mdl_local_backplate_defect",
          },
        ],
        runtime: {
          lastRunAt: "2026-03-24T11:02:18+08:00",
          status: "未运行",
          primaryResult: "-",
          cycleTime: "-",
          sessionActive: false,
          sessionMode: "detect",
        },
        ioConfig: {
          moduleIds: ["io_backplate"],
          input: [
            { id: "io_in_backplate_start", type: "new-cycle", name: "示例-周期开始", moduleId: "io_backplate", point: "DI-1", priority: 1 },
            { id: "io_in_backplate_upper", type: "capture:1", name: "示例-触发上半面采图", moduleId: "io_backplate", point: "DI-1", priority: 2 },
            { id: "io_in_backplate_lower", type: "capture:2", name: "示例-触发下半面采图", moduleId: "io_backplate", point: "DI-2", priority: 3 },
          ],
          output: [
            { id: "io_out_backplate_ng", type: "cycle-ng", name: "示例-周期NG红灯", moduleId: "io_backplate", point: "DO-1", duration: 1 },
            { id: "io_out_backplate_ok", type: "cycle-ok", name: "示例-周期OK绿灯", moduleId: "io_backplate", point: "DO-2", duration: 1 },
            { id: "io_out_backplate_error", type: "cycle-error", name: "示例-周期异常黄灯", moduleId: "io_backplate", point: "DO-3", duration: 1 },
            { id: "io_out_backplate_rotate", type: "capture-complete:1", name: "示例-上半面完成旋转", moduleId: "io_backplate", point: "DO-4", duration: 1 },
            { id: "io_out_backplate_reset", type: "capture-complete:2", name: "示例-下半面完成复位", moduleId: "io_backplate", point: "DO-5", duration: 1 },
          ],
        },
      },
      {
        id: "tool_001",
        name: "安全座椅",
        tone: "tone-blue",
        acquire: [
          {
            id: "acq_safe_buckle",
            name: "卡扣图像",
            type: "camera",
            cameraId: "cam_01",
            paramGroupId: "cam_01_pg_01",
            sampleImageName: "安全座椅-卡扣kakou.png",
            sampleImageUrl: "./sample-images/安全座椅-卡扣kakou.png",
            sampleImageWidth: 1280,
            sampleImageHeight: 960,
            sampleImage: "安全座椅-卡扣kakou.png",
          },
          {
            id: "acq_safe_screw",
            name: "螺杆图像",
            type: "camera",
            cameraId: "cam_02",
            paramGroupId: "cam_02_pg_01",
            sampleImageName: "安全座椅-螺杆.bmp",
            sampleImageUrl: "./sample-images/安全座椅-螺杆.bmp",
            sampleImageWidth: 3072,
            sampleImageHeight: 2048,
            sampleImage: "安全座椅-螺杆.bmp",
          },
        ],
        process: [
          {
            id: "proc_safe_buckle_full",
            name: "卡扣全图处理",
            inputId: "acq_safe_buckle",
            mode: "full-image",
            regions: [],
          },
          {
            id: "proc_safe_screw_full",
            name: "螺杆全图处理",
            inputId: "acq_safe_screw",
            mode: "full-image",
            regions: [],
          },
        ],
        detect: [
          {
            id: "det_safe_buckle_cls",
            name: "卡扣外观分类",
            processIds: ["proc_safe_buckle_full"],
            targets: [{ processId: "proc_safe_buckle_full", categoryKey: "", categoryLabel: "" }],
            modelId: "mdl_local_001",
          },
          {
            id: "det_safe_screw_left",
            name: "螺杆尺寸左模版检测",
            processIds: ["proc_safe_screw_full"],
            targets: [{ processId: "proc_safe_screw_full", categoryKey: "", categoryLabel: "" }],
            modelId: "mdl_local_004",
          },
          {
            id: "det_safe_screw_right",
            name: "螺杆尺寸右模版检测",
            processIds: ["proc_safe_screw_full"],
            targets: [{ processId: "proc_safe_screw_full", categoryKey: "", categoryLabel: "" }],
            modelId: "mdl_local_005",
          },
        ],
        runtime: {
          lastRunAt: null,
          status: "未运行",
          primaryResult: "-",
          cycleTime: "-",
          sessionActive: false,
          sessionMode: "detect",
        },
        ioConfig: {
          input: [
            { id: "io_in_safe_start", type: "new-cycle", name: "开始检测", moduleId: "io_001", point: "DI-1", priority: 1 },
            { id: "io_in_safe_reset", type: "reset-cycle", name: "复位", moduleId: "io_001", point: "DI-2", priority: 2 },
          ],
          output: [
            { id: "io_out_safe_ok", type: "cycle-ok", name: "OK输出", moduleId: "io_001", point: "DO-1", duration: 1 },
            { id: "io_out_safe_ng", type: "cycle-ng", name: "NG输出", moduleId: "io_001", point: "DO-2", duration: 1 },
            { id: "io_out_safe_error", type: "cycle-error", name: "异常输出", moduleId: "io_001", point: "DO-3", duration: 1 },
          ],
        },
      },
      {
        id: "tool_002",
        name: "马斯特X光",
        tone: "tone-green",
        acquire: [
          {
            id: "acq_xray_part",
            name: "X光接口图像",
            type: "api",
            endpoint: "tcp://xray-line/image/part",
            sampleImageName: "马斯特X光.bmp",
            sampleImageUrl: "./sample-images/马斯特X光.bmp",
            sampleImageWidth: 3072,
            sampleImageHeight: 3072,
            sampleImage: "马斯特X光.bmp",
          },
        ],
        process: [
          {
            id: "proc_xray_component_roi",
            name: "加热丝零件算子ROI",
            inputId: "acq_xray_part",
            mode: "model-roi",
            modelId: "mdl_local_006",
            categoryOptions: ["加热丝主体", "连接端子", "定位夹片"],
            categories: ["加热丝主体", "连接端子", "定位夹片"],
            regions: [],
          },
        ],
        detect: [
          {
            id: "det_xray_defect",
            name: "零件缺陷检测",
            processIds: ["proc_xray_component_roi"],
            targets: [{ processId: "proc_xray_component_roi", categoryKey: "加热丝主体", categoryLabel: "加热丝主体" }],
            modelId: "mdl_local_007",
          },
        ],
        runtime: {
          lastRunAt: null,
          status: "未运行",
          primaryResult: "-",
          cycleTime: "-",
          sessionActive: false,
          sessionMode: "detect",
        },
      },
      {
        id: "tool_003",
        name: "血氧纱布",
        tone: "tone-orange",
        acquire: [
          {
            id: "acq_gauze_main",
            name: "纱布图像",
            type: "camera",
            cameraId: "cam_03",
            paramGroupId: "cam_03_pg_01",
            sampleImageName: "血氧纱布.jpg",
            sampleImageUrl: "./sample-images/血氧纱布.jpg",
            sampleImageWidth: 2000,
            sampleImageHeight: 1258,
            sampleImage: "血氧纱布.jpg",
          },
        ],
        process: [
          {
            id: "proc_gauze_split16",
            name: "纱布手绘ROI(16等分)",
            inputId: "acq_gauze_main",
            mode: "manual-roi",
            regions: [
              { id: "proc_gauze_split16_roi_01", type: "roi", x: 0, y: 0, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_02", type: "roi", x: 0.25, y: 0, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_03", type: "roi", x: 0.5, y: 0, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_04", type: "roi", x: 0.75, y: 0, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_05", type: "roi", x: 0, y: 0.25, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_06", type: "roi", x: 0.25, y: 0.25, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_07", type: "roi", x: 0.5, y: 0.25, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_08", type: "roi", x: 0.75, y: 0.25, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_09", type: "roi", x: 0, y: 0.5, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_10", type: "roi", x: 0.25, y: 0.5, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_11", type: "roi", x: 0.5, y: 0.5, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_12", type: "roi", x: 0.75, y: 0.5, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_13", type: "roi", x: 0, y: 0.75, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_14", type: "roi", x: 0.25, y: 0.75, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_15", type: "roi", x: 0.5, y: 0.75, w: 0.25, h: 0.25 },
              { id: "proc_gauze_split16_roi_16", type: "roi", x: 0.75, y: 0.75, w: 0.25, h: 0.25 },
            ],
          },
        ],
        detect: [
          {
            id: "det_gauze_defect",
            name: "纱布缺陷检测",
            processIds: ["proc_gauze_split16"],
            targets: [{ processId: "proc_gauze_split16", categoryKey: "", categoryLabel: "" }],
            modelId: "mdl_local_008",
          },
        ],
        runtime: {
          lastRunAt: null,
          status: "未运行",
          primaryResult: "-",
          cycleTime: "-",
          sessionActive: false,
          sessionMode: "detect",
        },
      },
      {
        id: "tool_004",
        name: "瑾辰汽车饰件",
        tone: "tone-gray",
        acquire: [
          {
            id: "acq_jc_left",
            name: "左侧图像",
            type: "camera",
            cameraId: "cam_01",
            paramGroupId: "cam_01_pg_01",
            sampleImageName: "瑾辰-左.png",
            sampleImageUrl: "./sample-images/瑾辰-左.png",
            sampleImageWidth: 2102,
            sampleImageHeight: 1400,
            sampleImage: "瑾辰-左.png",
          },
          {
            id: "acq_jc_right",
            name: "右侧图像",
            type: "camera",
            cameraId: "cam_02",
            paramGroupId: "cam_02_pg_01",
            sampleImageName: "瑾辰-右.png",
            sampleImageUrl: "./sample-images/瑾辰-右.png",
            sampleImageWidth: 2102,
            sampleImageHeight: 1400,
            sampleImage: "瑾辰-右.png",
          },
        ],
        process: [
          {
            id: "proc_jc_left_buckle",
            name: "左图卡扣ROI",
            inputId: "acq_jc_left",
            mode: "manual-roi",
            regions: [{ id: "proc_jc_left_buckle_roi_01", type: "roi", x: 0.14, y: 0.3, w: 0.18, h: 0.25 }],
          },
          {
            id: "proc_jc_left_weld",
            name: "左图焊点ROI",
            inputId: "acq_jc_left",
            mode: "manual-roi",
            regions: [{ id: "proc_jc_left_weld_roi_01", type: "roi", x: 0.52, y: 0.4, w: 0.16, h: 0.2 }],
          },
          {
            id: "proc_jc_right_buckle",
            name: "右图卡扣ROI",
            inputId: "acq_jc_right",
            mode: "manual-roi",
            regions: [{ id: "proc_jc_right_buckle_roi_01", type: "roi", x: 0.18, y: 0.28, w: 0.2, h: 0.24 }],
          },
          {
            id: "proc_jc_right_weld",
            name: "右图焊点ROI",
            inputId: "acq_jc_right",
            mode: "manual-roi",
            regions: [{ id: "proc_jc_right_weld_roi_01", type: "roi", x: 0.58, y: 0.42, w: 0.15, h: 0.2 }],
          },
        ],
        detect: [
          {
            id: "det_jc_buckle_presence",
            name: "卡扣安装有无检测",
            processIds: ["proc_jc_left_buckle", "proc_jc_right_buckle"],
            targets: [
              { processId: "proc_jc_left_buckle", categoryKey: "", categoryLabel: "" },
              { processId: "proc_jc_right_buckle", categoryKey: "", categoryLabel: "" },
            ],
            modelId: "mdl_local_002",
          },
          {
            id: "det_jc_weld_presence",
            name: "焊点焊接有无检测",
            processIds: ["proc_jc_left_weld", "proc_jc_right_weld"],
            targets: [
              { processId: "proc_jc_left_weld", categoryKey: "", categoryLabel: "" },
              { processId: "proc_jc_right_weld", categoryKey: "", categoryLabel: "" },
            ],
            modelId: "mdl_local_003",
          },
        ],
        runtime: {
          lastRunAt: null,
          status: "未运行",
          primaryResult: "-",
          cycleTime: "-",
          sessionActive: false,
          sessionMode: "detect",
        },
      },
    ],
    detectionRecords: [
      buildGearDetectionRecord({
        id: "REC-GEAR-20260323-001",
        triggeredAt: "2026-03-23T09:12:40+08:00",
        result: "NG",
        ngAcquireIds: ["acq_gear_b_090", "acq_gear_a_120"],
      }),
      buildGearDetectionRecord({
        id: "REC-GEAR-20260323-002",
        triggeredAt: "2026-03-23T09:08:12+08:00",
        result: "OK",
        ngAcquireIds: [],
      }),
      buildGearDetectionRecord({
        id: "REC-GEAR-20260323-003",
        triggeredAt: "2026-03-23T09:03:58+08:00",
        result: "OK",
        ngAcquireIds: [],
      }),
      buildBackplateDetectionRecord({
        id: "REC-BACKPLATE-20260324-001",
        triggeredAt: "2026-03-24T11:02:18+08:00",
        result: "NG",
        ngAcquireIds: ["acq_backplate_lower"],
      }),
      buildBackplateDetectionRecord({
        id: "REC-BACKPLATE-20260324-002",
        triggeredAt: "2026-03-24T10:56:44+08:00",
        result: "OK",
        ngAcquireIds: [],
      }),
      {
        id: "REC-20260323-101",
        toolId: "tool_001",
        toolName: "安全座椅",
        detectId: "det_safe_buckle_cls",
        detectName: "安全座椅整套检测",
        triggeredAt: "2026-03-23T09:05:40+08:00",
        inputSource: "双相机输入",
        executionStatus: "已完成",
        runMode: "detect",
        completedStages: ["acquire", "process", "detect"],
        businessResult: "OK",
        imageResults: [
          {
            id: "REC-20260323-101_img_1",
            acquireId: "acq_safe_buckle",
            acquireName: "卡扣图像",
            imageLabel: "安全座椅-卡扣kakou.png",
            result: "OK",
            subResults: [
              {
                id: "SUB-safe-001",
                name: "卡扣外观分类",
                source: "全图",
                modelId: "mdl_local_001",
                businessResult: "OK",
                algorithmOutput: "卡扣正常 98.6%",
                imageLabel: "安全座椅-卡扣kakou.png",
                suspicious: false,
              },
            ],
          },
          {
            id: "REC-20260323-101_img_2",
            acquireId: "acq_safe_screw",
            acquireName: "螺杆图像",
            imageLabel: "安全座椅-螺杆.bmp",
            result: "OK",
            subResults: [
              {
                id: "SUB-safe-002",
                name: "左模版尺寸检测",
                source: "全图",
                modelId: "mdl_local_004",
                businessResult: "OK",
                algorithmOutput: "点点距离 12.84 mm",
                imageLabel: "安全座椅-螺杆.bmp",
                suspicious: false,
              },
              {
                id: "SUB-safe-003",
                name: "右模版尺寸检测",
                source: "全图",
                modelId: "mdl_local_005",
                businessResult: "OK",
                algorithmOutput: "点点距离 12.80 mm",
                imageLabel: "安全座椅-螺杆.bmp",
                suspicious: false,
              },
            ],
          },
        ],
      },
      {
        id: "REC-20260323-102",
        toolId: "tool_002",
        toolName: "马斯特X光",
        detectId: "det_xray_defect",
        detectName: "零件缺陷检测",
        triggeredAt: "2026-03-23T08:58:12+08:00",
        inputSource: "接口图像输入",
        executionStatus: "已完成",
        runMode: "detect",
        completedStages: ["acquire", "process", "detect"],
        businessResult: "NG",
        imageResults: [
          {
            id: "REC-20260323-102_img_1",
            acquireId: "acq_xray_part",
            acquireName: "X光接口图像",
            imageLabel: "马斯特X光.bmp",
            result: "NG",
            subResults: [
              {
                id: "SUB-xray-001",
                name: "加热丝主体",
                source: "算子ROI",
                modelId: "mdl_local_007",
                businessResult: "NG",
                algorithmOutput: "气泡熔断 92.1%",
                imageLabel: "马斯特X光.bmp",
                suspicious: true,
              },
            ],
          },
        ],
      },
      {
        id: "REC-20260323-103",
        toolId: "tool_004",
        toolName: "瑾辰汽车饰件",
        detectId: "det_jc_weld_presence",
        detectName: "饰件卡扣焊点综合检测",
        triggeredAt: "2026-03-23T08:42:09+08:00",
        inputSource: "双相机输入",
        executionStatus: "已完成",
        runMode: "detect",
        completedStages: ["acquire", "process", "detect"],
        businessResult: "NG",
        imageResults: [
          {
            id: "REC-20260323-103_img_1",
            acquireId: "acq_jc_left",
            acquireName: "左侧图像",
            imageLabel: "瑾辰-左.png",
            result: "OK",
            subResults: [
              {
                id: "SUB-jc-001",
                name: "左图卡扣",
                source: "ROI #1",
                modelId: "mdl_local_002",
                businessResult: "OK",
                algorithmOutput: "卡扣已安装 97.4%",
                imageLabel: "瑾辰-左.png",
                suspicious: false,
              },
              {
                id: "SUB-jc-002",
                name: "左图焊点",
                source: "ROI #1",
                modelId: "mdl_local_003",
                businessResult: "OK",
                algorithmOutput: "焊点完整 96.2%",
                imageLabel: "瑾辰-左.png",
                suspicious: false,
              },
            ],
          },
          {
            id: "REC-20260323-103_img_2",
            acquireId: "acq_jc_right",
            acquireName: "右侧图像",
            imageLabel: "瑾辰-右.png",
            result: "NG",
            subResults: [
              {
                id: "SUB-jc-003",
                name: "右图卡扣",
                source: "ROI #1",
                modelId: "mdl_local_002",
                businessResult: "OK",
                algorithmOutput: "卡扣已安装 95.1%",
                imageLabel: "瑾辰-右.png",
                suspicious: false,
              },
              {
                id: "SUB-jc-004",
                name: "右图焊点",
                source: "ROI #1",
                modelId: "mdl_local_003",
                businessResult: "NG",
                algorithmOutput: "焊点缺失 88.6%",
                imageLabel: "瑾辰-右.png",
                suspicious: true,
              },
            ],
          },
        ],
      },
    ],
    captureRecords: [buildGearCaptureRecord()],
  };

  function cloneDefaultState() {
    return applyExamplePrefixes(JSON.parse(JSON.stringify(DEFAULT_STATE)));
  }

  function normalizeAccount(value) {
    const next = String(value || "").trim();
    return MOBILE_ACCOUNT_PATTERN.test(next) ? next : DEFAULT_STATE.enterprise.account;
  }

  function normalizeModelSceneType(value) {
    const next = String(value || "").trim();
    return VALID_MODEL_SCENE_TYPES.has(next) ? next : "缺陷检测";
  }

  function normalizeModelSource(value) {
    const next = String(value || "").trim();
    return next === "云端同步" ? "云端同步" : "导入本地算子";
  }

  function normalizeBusinessResult(value) {
    const next = String(value || "").trim();
    if (!next || next === "-" || next === "—") return "-";
    return BUSINESS_RESULT_MAP[next] || "NG";
  }

  function normalizeToolProcessMode(value) {
    const next = String(value || "").trim();
    if (["full-image", "manual-roi", "model-roi"].includes(next)) return next;
    if (next === "roi") return "manual-roi";
    if (next === "classifier" || next === "detector") return "model-roi";
    return "full-image";
  }

  function normalizeRunMode(value) {
    const next = String(value || "").trim();
    return next === "acquire" || next === "process" || next === "detect" ? next : "detect";
  }

  function normalizeSampleImageUrl(value) {
    const url = String(value || "").trim();
    return url.replace(/^\.\.\/sample-images\//, "./sample-images/");
  }

  function inferRunModeFromCompletedStages(value) {
    const stages = Array.isArray(value) ? value.map((item) => String(item || "").trim()) : [];
    if (stages.includes("detect")) return "detect";
    if (stages.includes("process")) return "process";
    if (stages.includes("acquire")) return "acquire";
    return "";
  }

  function inferDetectBusinessResult(value, algorithmOutput = "", fallback = "-") {
    const normalized = normalizeBusinessResult(value);
    if (normalized !== "-") return normalized;
    const text = String(algorithmOutput || "").trim();
    if (!text) return fallback;
    if (/NG/i.test(text) || /异常|缺陷|拦截/.test(text)) return "NG";
    if (/OK/i.test(text) || /正常|放行/.test(text)) return "OK";
    return fallback;
  }

  function getSuggestedModelCategories(model) {
    const sceneType = normalizeModelSceneType(model?.sceneType || model?.modelSceneType);
    if (sceneType !== "分类") return [];
    const text = String(model?.modelName || "").trim();
    if (/卡扣/.test(text)) return ["顶部卡扣", "左侧边缘", "右侧边缘"];
    if (/齿轮|齿面/.test(text)) return ["齿面"];
    if (/加热丝|零件/.test(text)) return ["加热丝主体", "连接端子", "定位夹片"];
    if (/极耳/.test(text)) return ["左极耳", "右极耳"];
    if (/纱布/.test(text)) return ["纱布主体", "边缘褶皱", "污染点"];
    return ["类别A", "类别B", "类别C"];
  }

  function isCategoryOutputModel(model) {
    return normalizeModelSceneType(model?.sceneType || model?.modelSceneType) === "分类";
  }

  function normalizeModelCategories(model) {
    const source = Array.isArray(model?.categories) ? model.categories : Array.isArray(model?.categoryOptions) ? model.categoryOptions : [];
    const normalized = source.map((item) => String(item || "").trim()).filter(Boolean);
    return normalized.length ? normalized : getSuggestedModelCategories(model);
  }

  function getDefaultModelCategories(modelId) {
    const source = DEFAULT_STATE.localModels.find((model) => model.id === modelId);
    return normalizeModelCategories(source);
  }

  function prependMissingDefaults(targetItems, defaultItems, ids) {
    const current = Array.isArray(targetItems) ? targetItems : [];
    const existingIds = new Set(current.map((item) => item?.id).filter(Boolean));
    const missing = ids
      .map((id) => defaultItems.find((item) => item.id === id))
      .filter((item) => item && !existingIds.has(item.id))
      .map((item) => JSON.parse(JSON.stringify(item)));
    return missing.length ? missing.concat(current) : current;
  }

  function syncDefaultItemById(targetItems, defaultItems, id) {
    const current = Array.isArray(targetItems) ? targetItems : [];
    const defaultItem = defaultItems.find((item) => item.id === id);
    const index = current.findIndex((item) => item?.id === id);
    if (!defaultItem || index < 0) return current;
    current[index] = { ...current[index], ...JSON.parse(JSON.stringify(defaultItem)) };
    return current;
  }

  function applyGearScenarioDefaults(next) {
    const defaults = cloneDefaultState();
    next.localModels = prependMissingDefaults(next.localModels, defaults.localModels, ["mdl_local_gear_surface", "mdl_local_gear_bubble"]);
    next.cloudModels = prependMissingDefaults(next.cloudModels, defaults.cloudModels, ["cloud_model_gear_surface", "cloud_model_gear_bubble"]);
    next.cameras = prependMissingDefaults(next.cameras, defaults.cameras, ["cam_gear_a", "cam_gear_b"]);
    next.availableCameras = prependMissingDefaults(next.availableCameras, defaults.availableCameras, ["cam_gear_a", "cam_gear_b"]);
    next.ioModules = prependMissingDefaults(next.ioModules, defaults.ioModules, ["io_002"]);
    next.ioModules = syncDefaultItemById(next.ioModules, defaults.ioModules, "io_002");
    next.tools = prependMissingDefaults(next.tools, defaults.tools, ["tool_gear"]);
    next.detectionRecords = prependMissingDefaults(next.detectionRecords, defaults.detectionRecords, [
      "REC-GEAR-20260323-001",
      "REC-GEAR-20260323-002",
      "REC-GEAR-20260323-003",
    ]);
    next.captureRecords = prependMissingDefaults(next.captureRecords, defaults.captureRecords, ["CAP-20260323-GEAR-001"]);
  }

  function applyBackplateScenarioDefaults(next) {
    const defaults = cloneDefaultState();
    next.localModels = prependMissingDefaults(next.localModels, defaults.localModels, ["mdl_local_backplate_defect"]);
    next.cloudModels = prependMissingDefaults(next.cloudModels, defaults.cloudModels, ["cloud_model_backplate_defect"]);
    next.cameras = prependMissingDefaults(next.cameras, defaults.cameras, ["cam_backplate"]);
    next.availableCameras = prependMissingDefaults(next.availableCameras, defaults.availableCameras, ["cam_backplate"]);
    next.ioModules = prependMissingDefaults(next.ioModules, defaults.ioModules, ["io_backplate"]);
    next.ioModules = syncDefaultItemById(next.ioModules, defaults.ioModules, "io_backplate");
    next.tools = prependMissingDefaults(next.tools, defaults.tools, ["tool_backplate"]);
    next.detectionRecords = prependMissingDefaults(next.detectionRecords, defaults.detectionRecords, [
      "REC-BACKPLATE-20260324-001",
      "REC-BACKPLATE-20260324-002",
    ]);
  }

  function filterDefaultItems(currentItems, defaultItems) {
    const defaultIds = new Set((defaultItems || []).map((item) => item?.id).filter(Boolean));
    return (currentItems || []).filter((item) => defaultIds.has(item?.id));
  }

  function applyExamplePrefixesToDefaultItems(next) {
    applyExamplePrefixes({
      localModels: filterDefaultItems(next.localModels, DEFAULT_STATE.localModels),
      cloudModels: filterDefaultItems(next.cloudModels, DEFAULT_STATE.cloudModels),
      cameras: filterDefaultItems(next.cameras, DEFAULT_STATE.cameras),
      availableCameras: filterDefaultItems(next.availableCameras, DEFAULT_STATE.availableCameras),
      ioModules: filterDefaultItems(next.ioModules, DEFAULT_STATE.ioModules),
      tools: filterDefaultItems(next.tools, DEFAULT_STATE.tools),
      detectionRecords: filterDefaultItems(next.detectionRecords, DEFAULT_STATE.detectionRecords),
      captureRecords: filterDefaultItems(next.captureRecords, DEFAULT_STATE.captureRecords),
    });
    return next;
  }

  function normalizeLegacyExampleNames(next) {
    const fixCameraName = (camera) => {
      if (!camera || camera.id !== "cam_02") return;
      const name = String(camera.name || "").trim();
      if (!name || name === "cam_02") camera.name = "示例-螺杆相机";
    };
    (next.cameras || []).forEach(fixCameraName);
    (next.availableCameras || []).forEach(fixCameraName);
    return next;
  }

  function applyGearImageAssetDefaults(next) {
    const defaults = cloneDefaultState();
    const defaultGearTool = defaults.tools.find((tool) => tool.id === "tool_gear");
    const currentGearTool = (next.tools || []).find((tool) => tool.id === "tool_gear");
    if (defaultGearTool && currentGearTool) {
      (currentGearTool.acquire || []).forEach((acquire) => {
        const defaultAcquire = defaultGearTool.acquire.find((item) => item.id === acquire.id);
        if (!defaultAcquire) return;
        acquire.sampleImageName = defaultAcquire.sampleImageName;
        acquire.sampleImageUrl = defaultAcquire.sampleImageUrl;
        acquire.sampleImage = defaultAcquire.sampleImage;
        acquire.sampleImageWidth = defaultAcquire.sampleImageWidth;
        acquire.sampleImageHeight = defaultAcquire.sampleImageHeight;
      });
    }
    const defaultGearCapture = defaults.captureRecords.find((record) => record.id === "CAP-20260323-GEAR-001");
    const currentGearCapture = (next.captureRecords || []).find((record) => record.id === "CAP-20260323-GEAR-001");
    if (defaultGearCapture && currentGearCapture) {
      (currentGearCapture.items || []).forEach((item) => {
        const defaultItem = defaultGearCapture.items.find((entry) => entry.acquireId === item.acquireId);
        if (!defaultItem) return;
        (item.images || []).forEach((image) => {
          image.imageUrl = defaultItem.images[0]?.imageUrl || image.imageUrl;
        });
      });
    }
    return next;
  }

  function applyBackplateImageAssetDefaults(next) {
    const defaults = cloneDefaultState();
    const defaultBackplateTool = defaults.tools.find((tool) => tool.id === "tool_backplate");
    const currentBackplateTool = (next.tools || []).find((tool) => tool.id === "tool_backplate");
    const defaultAcquireItems = defaultBackplateTool?.acquire || buildBackplateAcquireItems();
    const findDefaultAcquire = (acquireId) => defaultAcquireItems.find((item) => item.id === acquireId);

    if (currentBackplateTool) {
      (currentBackplateTool.acquire || []).forEach((acquire) => {
        const defaultAcquire = findDefaultAcquire(acquire.id);
        if (!defaultAcquire) return;
        acquire.sampleImageName = defaultAcquire.sampleImageName;
        acquire.sampleImageUrl = defaultAcquire.sampleImageUrl;
        acquire.sampleImage = defaultAcquire.sampleImage;
        acquire.sampleImageWidth = defaultAcquire.sampleImageWidth;
        acquire.sampleImageHeight = defaultAcquire.sampleImageHeight;
      });
    }

    (next.detectionRecords || []).forEach((record) => {
      if (record?.toolId !== "tool_backplate") return;
      (record.imageResults || []).forEach((imageResult) => {
        const defaultAcquire = findDefaultAcquire(imageResult.acquireId);
        if (!defaultAcquire) return;
        imageResult.imageLabel = defaultAcquire.sampleImageName;
        imageResult.imageUrl = defaultAcquire.sampleImageUrl;
        imageResult.sourceImageWidth = defaultAcquire.sampleImageWidth;
        imageResult.sourceImageHeight = defaultAcquire.sampleImageHeight;
        (imageResult.subResults || []).forEach((subResult) => {
          subResult.imageLabel = defaultAcquire.sampleImageName;
        });
      });
      (record.subResults || []).forEach((subResult) => {
        const relatedImage = (record.imageResults || []).find((imageResult) =>
          (imageResult.subResults || []).some((item) => item.id === subResult.id),
        );
        const defaultAcquire = relatedImage ? findDefaultAcquire(relatedImage.acquireId) : null;
        if (defaultAcquire) subResult.imageLabel = defaultAcquire.sampleImageName;
      });
    });
    return next;
  }

  function applyGearResultStructureDefaults(next) {
    const defaults = cloneDefaultState();
    const defaultGearRecordIds = ["REC-GEAR-20260323-001", "REC-GEAR-20260323-002", "REC-GEAR-20260323-003"];
    next.detectionRecords = (Array.isArray(next.detectionRecords) ? next.detectionRecords : []).map((record) => {
      if (!defaultGearRecordIds.includes(record?.id)) return record;
      const defaultRecord = defaults.detectionRecords.find((item) => item.id === record.id);
      return defaultRecord ? JSON.parse(JSON.stringify(defaultRecord)) : record;
    });
  }

  function applyGearResultGeometryDefaults(next) {
    const surfaceRegions = getGearSurfaceRegions();
    const updateSubResults = (subResults = []) => {
      subResults.forEach((subResult, index) => {
        if (!/^齿面\d*$/i.test(String(subResult?.source || ""))) return;
        subResult.regionBox = { ...surfaceRegions[index % surfaceRegions.length] };
        (subResult.detectResults || []).forEach((detectResult) => {
          if ((detectResult.businessResult || subResult.businessResult) !== "NG") return;
          detectResult.detectionBox = getGearBubbleDefectBox(index);
        });
      });
    };
    (next.detectionRecords || []).forEach((record) => {
      if (record?.toolId !== "tool_gear") return;
      (record.imageResults || []).forEach((imageResult) => updateSubResults(imageResult.subResults || []));
      updateSubResults(record.subResults || []);
    });
  }

  function getNormalizedProcessRegions(process) {
    const source = Array.isArray(process?.regions) ? process.regions : Array.isArray(process?.roiRegions) ? process.roiRegions : [];
    return source
      .map((item, index) => ({
        id: item?.id || `${process?.id || "proc"}_region_${index + 1}`,
        type: item?.type === "ignore" ? "ignore" : "roi",
        x: Number.isFinite(Number(item?.x)) ? Number(item.x) : 0.18,
        y: Number.isFinite(Number(item?.y)) ? Number(item.y) : 0.18,
        w: Number.isFinite(Number(item?.w)) ? Number(item.w) : 0.32,
        h: Number.isFinite(Number(item?.h)) ? Number(item.h) : 0.24,
      }))
      .filter((item) => item.w > 0 && item.h > 0);
  }

  function getIoModulePointCount(model) {
    const normalized = String(model || "").trim() === "USR-IO424808" ? "USR-IO808" : String(model || "").trim();
    if (normalized === "USR-IO808") return 8;
    return 4;
  }

  function normalizeIoPointList(points, prefix, count) {
    const byPoint = new Map((Array.isArray(points) ? points : []).map((item) => [String(item?.point || "").trim(), item]));
    return Array.from({ length: count }, (_, index) => {
      const point = `${prefix}-${index + 1}`;
      const source = byPoint.get(point) || {};
      return {
        point,
        name: String(source.name || ""),
      };
    });
  }

  function normalizeToolIoConfig(config) {
    const source = config && typeof config === "object" ? config : {};
    const normalizeItems = (items, direction) =>
      (Array.isArray(items) ? items : []).map((item, index) => ({
        id: item?.id || `io_${direction}_${index + 1}`,
        type: String(item?.type || ""),
        name: String(item?.name || ""),
        moduleId: String(item?.moduleId || ""),
        point: String(item?.point || ""),
        priority: Number.isFinite(Number(item?.priority)) ? Number(item.priority) : index + 1,
        duration: Number.isFinite(Number(item?.duration)) ? Number(item.duration) : 1,
      }));
    const input = normalizeItems(source.input, "input");
    const output = normalizeItems(source.output, "output");
    const moduleIds = Array.isArray(source.moduleIds) ? source.moduleIds.map((item) => String(item || "")).filter(Boolean) : [];
    [...input, ...output].forEach((item) => {
      if (item.moduleId && !moduleIds.includes(item.moduleId)) moduleIds.push(item.moduleId);
    });
    return {
      moduleIds,
      input,
      output,
    };
  }

  function normalizeLoadedState(parsed) {
    const next = parsed && typeof parsed === "object" ? parsed : cloneDefaultState();
    const loadedVersion = Number.isFinite(Number(next.version)) ? Number(next.version) : 0;

    next.version = DEFAULT_STATE.version;
    next.meta = next.meta && typeof next.meta === "object" ? next.meta : { now: DEFAULT_STATE.meta.now };
    next.meta.now = next.meta.now || DEFAULT_STATE.meta.now;

    next.enterprise = next.enterprise && typeof next.enterprise === "object" ? next.enterprise : {};
    next.enterprise.account = normalizeAccount(next.enterprise.account);
    next.enterprise.password = String(next.enterprise.password || DEFAULT_STATE.enterprise.password);
    next.enterprise.contactName = String(next.enterprise.contactName || DEFAULT_STATE.enterprise.contactName);
    next.enterprise.companyName = String(next.enterprise.companyName || DEFAULT_STATE.enterprise.companyName);
    next.enterprise.quota = Number.isFinite(Number(next.enterprise.quota)) ? Number(next.enterprise.quota) : DEFAULT_STATE.enterprise.quota;

    next.runtimeDevice = next.runtimeDevice && typeof next.runtimeDevice === "object" ? next.runtimeDevice : {};
    next.runtimeDevice.name = next.runtimeDevice.name || DEFAULT_STATE.runtimeDevice.name;
    next.runtimeDevice.hardwareCode = next.runtimeDevice.hardwareCode || DEFAULT_STATE.runtimeDevice.hardwareCode;
    next.runtimeDevice.networkOnline = typeof next.runtimeDevice.networkOnline === "boolean" ? next.runtimeDevice.networkOnline : DEFAULT_STATE.runtimeDevice.networkOnline;

    next.session = next.session && typeof next.session === "object" ? next.session : {};
    next.session.loggedIn = Boolean(next.session.loggedIn);
    next.session.clientId = next.session.clientId || null;
    next.session.account = next.session.loggedIn ? next.enterprise.account : "";
    next.session.lastMessage =
      !next.session.lastMessage || String(next.session.lastMessage).includes("企业账号")
        ? DEFAULT_STATE.session.lastMessage
        : String(next.session.lastMessage);

    next.clients = Array.isArray(next.clients) ? next.clients : cloneDefaultState().clients;
    next.clients = next.clients
      .filter((client) => client && client.bound)
      .map((client) => ({
        ...client,
        enterpriseAccount: next.enterprise.account,
        bound: true,
        name: client.name || client.hardwareCode || DEFAULT_STATE.runtimeDevice.name,
        hardwareCode: client.hardwareCode || "",
        boundAt: client.boundAt || next.meta.now,
        lastLoginAt: client.lastLoginAt || client.boundAt || next.meta.now,
        lastHeartbeatAt: client.lastHeartbeatAt || client.lastLoginAt || client.boundAt || next.meta.now,
        offlineAt: Object.prototype.hasOwnProperty.call(client, "offlineAt") ? client.offlineAt : null,
        token: client.token || null,
      }))
      .filter((client) => client.hardwareCode);

    next.storage = next.storage && typeof next.storage === "object" ? next.storage : {};
    next.storage.remainingGb = Number.isFinite(Number(next.storage.remainingGb)) ? Number(next.storage.remainingGb) : DEFAULT_STATE.storage.remainingGb;
    next.storage.warningGb = Number.isFinite(Number(next.storage.warningGb)) ? Number(next.storage.warningGb) : DEFAULT_STATE.storage.warningGb;
    next.storage.blockGb = Number.isFinite(Number(next.storage.blockGb)) ? Number(next.storage.blockGb) : DEFAULT_STATE.storage.blockGb;
    if (loadedVersion < 15 && next.storage.remainingGb <= 10) {
      next.storage.remainingGb = DEFAULT_STATE.storage.remainingGb;
    }
    next.storage.usage = next.storage.usage && typeof next.storage.usage === "object" ? next.storage.usage : {};
    next.storage.usage.detectImages = Number.isFinite(Number(next.storage.usage.detectImages))
      ? Number(next.storage.usage.detectImages)
      : DEFAULT_STATE.storage.usage.detectImages;
    next.storage.usage.captureImages = 0;
    next.storage.usage.models = Number.isFinite(Number(next.storage.usage.models)) ? Number(next.storage.usage.models) : DEFAULT_STATE.storage.usage.models;
    next.storage.usage.other = Number.isFinite(Number(next.storage.usage.other)) ? Number(next.storage.usage.other) : DEFAULT_STATE.storage.usage.other;

    next.localModels = Array.isArray(next.localModels) ? next.localModels : cloneDefaultState().localModels;
    next.localModels = next.localModels.map((model) => {
      const defaultModel = cloneDefaultState().localModels.find((item) => item.id === model.id) || {};
      const mergedModel = { ...defaultModel, ...model };
      return {
        ...mergedModel,
        displayVersion: defaultModel.displayVersion || (/^v\d+$/i.test(String(mergedModel.displayVersion || "")) ? String(mergedModel.displayVersion).toUpperCase() : "V1"),
        sceneType: normalizeModelSceneType(mergedModel.sceneType),
        source: normalizeModelSource(mergedModel.source),
        categories: normalizeModelCategories(mergedModel),
      };
    });
    if (loadedVersion < 4) {
      cloneDefaultState().localModels.forEach((defaultModel) => {
        if (next.localModels.some((model) => model.version === defaultModel.version)) return;
        next.localModels.push({ ...defaultModel });
      });
    }
    if (loadedVersion < 9) {
      cloneDefaultState().localModels.forEach((defaultModel) => {
        const current = next.localModels.find((model) => model.id === defaultModel.id);
        if (!current) return;
        if ((!Array.isArray(current.categories) || !current.categories.length) && Array.isArray(defaultModel.categories) && defaultModel.categories.length) {
          current.categories = [...defaultModel.categories];
        }
      });
    }

    next.cloudModels = Array.isArray(next.cloudModels) ? next.cloudModels : cloneDefaultState().cloudModels;
    next.cloudModels = next.cloudModels.map((model) => {
      const defaultModel = cloneDefaultState().cloudModels.find((item) => item.id === model.id) || {};
      const mergedModel = { ...defaultModel, ...model };
      const defaultVersions = new Map((defaultModel.versions || []).map((version) => [version.id, version]));
      return {
        ...mergedModel,
        sceneType: normalizeModelSceneType(mergedModel.sceneType),
        versions: (Array.isArray(mergedModel.versions) ? mergedModel.versions : []).map((version, index) => ({
          ...(defaultVersions.get(version.id) || {}),
          ...version,
          displayVersion: defaultVersions.get(version.id)?.displayVersion || (/^v\d+$/i.test(String(version.displayVersion || "")) ? String(version.displayVersion).toUpperCase() : `V${index + 1}`),
        })),
      };
    });

    next.ioModules = Array.isArray(next.ioModules) ? next.ioModules : cloneDefaultState().ioModules;
    next.ioModules = next.ioModules.map((module, index) => {
      const model = String(module?.model || "USR-IO424T").trim() === "USR-IO424808" ? "USR-IO808" : String(module?.model || "USR-IO424T").trim();
      const count = getIoModulePointCount(model);
      return {
        id: module?.id || `io_${index + 1}`,
        name: String(module?.name || `IO模块 ${index + 1}`),
        model,
        ip: String(module?.ip || ""),
        port: Number.isFinite(Number(module?.port)) ? Number(module.port) : 28899,
        deviceId: String(module?.deviceId || "17"),
        status: module?.status === "离线" ? "离线" : "在线",
        inputs: normalizeIoPointList(module?.inputs, "DI", count),
        outputs: normalizeIoPointList(module?.outputs, "DO", count),
      };
    });
    if (loadedVersion < 12) {
      next.ioModules.forEach((module, index) => {
        if (module.id === "io_001" || module.id === "io_002") {
          module.name = `IO模块${index + 1}`;
          module.ip = "";
          module.port = 28899;
          module.deviceId = "17";
          module.inputs = normalizeIoPointList([], "DI", getIoModulePointCount(module.model));
          module.outputs = normalizeIoPointList([], "DO", getIoModulePointCount(module.model));
        }
      });
    }
    if (loadedVersion < 13) {
      next.ioModules.forEach((module) => {
        module.inputs = normalizeIoPointList([], "DI", getIoModulePointCount(module.model));
        module.outputs = normalizeIoPointList([], "DO", getIoModulePointCount(module.model));
      });
    }

    const fallbackRoiModelId = next.localModels.find((model) => isCategoryOutputModel(model) && normalizeModelCategories(model).length)?.id || null;
    next.tools = Array.isArray(next.tools) && next.tools.length ? next.tools : cloneDefaultState().tools;
    next.tools = next.tools.map((tool, toolIndex) => ({
      ...tool,
      id: tool.id || `tool_${toolIndex + 1}`,
      name: tool.name || `检测工具 ${toolIndex + 1}`,
      tone: tool.tone || "tone-blue",
      acquire: Array.isArray(tool.acquire)
        ? tool.acquire.map((item, index) => ({
            ...item,
            id: item.id || `acq_${toolIndex + 1}_${index + 1}`,
            name: item.name || `图像获取 ${index + 1}`,
            type: item.type === "api" ? "api" : "camera",
            sampleImageName: String(item.sampleImageName || item.sampleImage || ""),
            sampleImageUrl: normalizeSampleImageUrl(item.sampleImageUrl),
            sampleImage: String(item.sampleImageName || item.sampleImage || ""),
          }))
        : [],
      process: Array.isArray(tool.process)
        ? tool.process.map((item, index) => {
            const regions = getNormalizedProcessRegions(item);
            const hasManualRegions = regions.some((region) => region.type !== "ignore");
            const hasModelHints =
              Boolean(item.modelId) ||
              Boolean(String(item.modelSceneType || "").trim()) ||
              (Array.isArray(item.categoryOptions) && item.categoryOptions.length > 0) ||
              (Array.isArray(item.categories) && item.categories.length > 0);
            const processName = String(item.name || "").trim();
            let mode = normalizeToolProcessMode(item.mode);
            // Only repair legacy corrupted process mode data once.
            // After v8, mode is treated as explicit user selection and no longer inferred.
            if (loadedVersion < 8) {
              if (mode === "manual-roi" && !hasManualRegions && hasModelHints) {
                mode = "model-roi";
              } else if (mode === "model-roi" && !hasModelHints && hasManualRegions) {
                mode = "manual-roi";
              } else if (mode === "manual-roi" && !hasManualRegions) {
                if (/算子\s*ROI|model\s*roi/i.test(processName)) {
                  mode = "model-roi";
                } else if (/全图/.test(processName)) {
                  mode = "full-image";
                }
              }
            }
            const modelId = mode === "model-roi" ? item.modelId || fallbackRoiModelId : null;
            const modelSceneType =
              mode === "model-roi" ? normalizeModelSceneType(next.localModels.find((model) => model.id === modelId)?.sceneType) : "";
            return {
              ...item,
              id: item.id || `proc_${toolIndex + 1}_${index + 1}`,
              name: item.name || `图像处理 ${index + 1}`,
              inputId: item.inputId || tool.acquire?.[0]?.id || "",
              mode,
              type: mode,
              modelId,
              modelSceneType,
              categoryOptions: mode === "model-roi" ? (normalizeModelCategories(item).length ? normalizeModelCategories(item) : getDefaultModelCategories(modelId)) : [],
              regions:
                mode === "manual-roi"
                  ? (regions.length ? regions : loadedVersion < 5 ? [{ id: `${item.id || `proc_${toolIndex + 1}_${index + 1}`}_roi_1`, type: "roi", x: 0.18, y: 0.18, w: 0.32, h: 0.24 }] : [])
                  : [],
            };
          })
        : [],
      detect: Array.isArray(tool.detect)
        ? tool.detect.map((item, index) => {
            const rawTargets =
              Array.isArray(item.targets) && item.targets.length
                ? item.targets
                : (Array.isArray(item.processIds) ? item.processIds.filter(Boolean).map((processId) => ({ processId, categoryKey: "", categoryLabel: "" })) : []);
            const targets = rawTargets
              .map((target) => ({
                processId: String(target?.processId || "").trim(),
                categoryKey: String(target?.categoryKey || "").trim(),
                categoryLabel: String(target?.categoryLabel || target?.categoryKey || "").trim(),
              }))
              .filter((target) => target.processId);
            return {
              ...item,
              id: item.id || `det_${toolIndex + 1}_${index + 1}`,
              name: item.name || `图像检测 ${index + 1}`,
              targets,
              processIds: Array.from(new Set(targets.map((target) => target.processId))),
              modelId: item.modelId || null,
            };
          })
        : [],
      runtime: {
        ...(tool.runtime && typeof tool.runtime === "object" ? tool.runtime : {}),
        lastRunAt: tool.runtime?.lastRunAt || null,
        status:
          tool.runtime?.status === "待机"
            ? "未运行"
            : String(tool.runtime?.status || (tool.acquire?.length || tool.process?.length || tool.detect?.length ? "未运行" : "未配置")),
        primaryResult: tool.runtime?.primaryResult || "-",
        cycleTime: tool.runtime?.cycleTime || "-",
        sessionActive: Boolean(tool.runtime?.sessionActive),
        sessionMode: normalizeRunMode(tool.runtime?.sessionMode || tool.runtime?.selectedRunMode || "detect"),
        sessionStartedAt:
          tool.runtime?.sessionStartedAt != null && Number.isFinite(Number(tool.runtime.sessionStartedAt))
            ? Number(tool.runtime.sessionStartedAt)
            : null,
        sessionRecordBaseline:
          tool.runtime?.sessionRecordBaseline != null && Number.isFinite(Number(tool.runtime.sessionRecordBaseline))
            ? Number(tool.runtime.sessionRecordBaseline)
            : null,
        sequenceCursor: Number.isFinite(Number(tool.runtime?.sequenceCursor)) ? Number(tool.runtime.sequenceCursor) : 0,
        pendingAcquireIndex:
          tool.runtime?.pendingAcquireIndex != null && Number.isFinite(Number(tool.runtime.pendingAcquireIndex))
            ? Number(tool.runtime.pendingAcquireIndex)
            : null,
        cycleActive: Boolean(tool.runtime?.cycleActive),
        cycleStartedAt:
          tool.runtime?.cycleStartedAt != null && Number.isFinite(Number(tool.runtime.cycleStartedAt))
            ? Number(tool.runtime.cycleStartedAt)
            : null,
        currentCycleTime: tool.runtime?.currentCycleTime || "-",
        currentCycleResult: tool.runtime?.currentCycleResult || "-",
        runToken: Number.isFinite(Number(tool.runtime?.runToken)) ? Number(tool.runtime.runToken) : 0,
      },
      ioConfig: normalizeToolIoConfig(tool.ioConfig),
    }));
    if (loadedVersion < 19) {
      applyGearScenarioDefaults(next);
    }
    if (loadedVersion < 20) {
      applyExamplePrefixesToDefaultItems(next);
    }
    if (loadedVersion < 21) {
      applyGearImageAssetDefaults(next);
    }
    if (loadedVersion < 22) {
      applyBackplateScenarioDefaults(next);
    }
    if (loadedVersion < 24) {
      applyGearResultStructureDefaults(next);
    }
    if (loadedVersion < 25) {
      applyBackplateImageAssetDefaults(next);
    }
    if (loadedVersion < 26) {
      applyGearResultGeometryDefaults(next);
    }
    normalizeLegacyExampleNames(next);

    next.detectionRecords = Array.isArray(next.detectionRecords) ? next.detectionRecords : cloneDefaultState().detectionRecords;
    next.detectionRecords = next.detectionRecords.map((record) => {
      const tool = next.tools.find((item) => item.id === record.toolId) || null;
      const rawRunMode = String(record?.runMode || "").trim();
      const hasExplicitRunMode = rawRunMode === "acquire" || rawRunMode === "process" || rawRunMode === "detect";
      const stageInferredRunMode = inferRunModeFromCompletedStages(record?.completedStages);
      const normalizedRunMode = normalizeRunMode(hasExplicitRunMode ? rawRunMode : stageInferredRunMode || "detect");
      const normalizeSubResults = (items) =>
        (Array.isArray(items) ? items : []).map((item) => ({
          ...item,
          businessResult:
            normalizedRunMode === "detect"
              ? inferDetectBusinessResult(item.businessResult, item.algorithmOutput)
              : "-",
          suspicious: normalizedRunMode === "detect" ? Boolean(item.suspicious) : false,
        }));

      const normalizedImageResults = (Array.isArray(record.imageResults) ? record.imageResults : []).map((imageResult, index) => {
        const acquire =
          tool?.acquire?.find((item) => item.id === imageResult?.acquireId) ||
          tool?.acquire?.[index] ||
          null;
        const imageSubResults = normalizeSubResults(imageResult?.subResults);
        const inferredImageResult =
          imageSubResults.length > 0
            ? imageSubResults.some((item) => item.businessResult === "NG")
              ? "NG"
              : imageSubResults.some((item) => item.businessResult === "OK")
                ? "OK"
                : "-"
            : "-";
        const imageResultBusiness =
          normalizedRunMode === "detect"
            ? inferDetectBusinessResult(imageResult?.result, "", inferredImageResult)
            : "-";
        return {
          ...imageResult,
          acquireId: imageResult?.acquireId || acquire?.id || "",
          acquireName: imageResult?.acquireName || acquire?.name || `图像 ${index + 1}`,
          imageLabel: String(imageResult?.imageLabel || imageResult?.sourceImageName || acquire?.sampleImageName || acquire?.sampleImage || ""),
          sourceImageUrl: "",
          sourceImageName: "",
          sourceImageWidth: Number(imageResult?.sourceImageWidth || acquire?.sampleImageWidth || 0),
          sourceImageHeight: Number(imageResult?.sourceImageHeight || acquire?.sampleImageHeight || 0),
          result: imageResultBusiness,
          inputSource: String(imageResult?.inputSource || ""),
          subResults: imageSubResults,
        };
      });

      const normalizedSubResults = normalizedImageResults.length
        ? normalizedImageResults.flatMap((imageResult) => imageResult.subResults)
        : normalizeSubResults(record.subResults);
      const inferredTotalResult =
        normalizedImageResults.length > 0
          ? normalizedImageResults.some((imageResult) => imageResult.result === "NG")
            ? "NG"
            : normalizedImageResults.some((imageResult) => imageResult.result === "OK")
              ? "OK"
              : "-"
          : normalizedSubResults.length > 0
            ? normalizedSubResults.some((item) => item.businessResult === "NG")
              ? "NG"
              : normalizedSubResults.some((item) => item.businessResult === "OK")
                ? "OK"
                : "-"
            : "-";
      const totalResult =
        normalizedRunMode === "detect"
          ? inferDetectBusinessResult(record.totalResult || record.businessResult, "", inferredTotalResult)
          : "-";
      const defaultCompletedStages =
        normalizedRunMode === "acquire"
          ? ["acquire"]
          : normalizedRunMode === "process"
            ? ["acquire", "process"]
            : ["acquire", "process", "detect"];

      return {
        ...record,
        businessResult: totalResult,
        totalResult,
        runMode: normalizedRunMode,
        completedStages: Array.isArray(record.completedStages) && record.completedStages.length ? record.completedStages : defaultCompletedStages,
        suspiciousCount: normalizedSubResults.filter((item) => item.suspicious).length,
        ngCount: normalizedSubResults.filter((item) => item.businessResult === "NG").length,
        imageResults: normalizedImageResults,
        subResults: normalizedSubResults,
      };
    });
    next.captureRecords = (Array.isArray(next.captureRecords) ? next.captureRecords : []).map((record, recordIndex) => {
      const tool = next.tools.find((item) => item.id === record.toolId) || null;
      const resetActiveCaptureDefaults = loadedVersion < 17 && record.status === "采集中";
      const items = (Array.isArray(record.items) ? record.items : []).map((item, itemIndex) => {
        const acquire = tool?.acquire?.find((entry) => entry.id === item.acquireId) || tool?.acquire?.[itemIndex] || null;
        const rawTargetCount = item.targetCount;
        const normalizedTargetCount =
          rawTargetCount === "" || rawTargetCount === null || rawTargetCount === undefined || Number(rawTargetCount) <= 0
            ? null
            : Math.max(1, Number(rawTargetCount));
        const images = (Array.isArray(item.images) ? item.images : []).map((image, imageIndex) => ({
          ...image,
          id: image.id || `CAP_IMG_${recordIndex + 1}_${itemIndex + 1}_${imageIndex + 1}`,
          acquireId: image.acquireId || item.acquireId || acquire?.id || "",
          capturedAt: image.capturedAt || record.startedAt || next.meta.now,
          fileName: image.fileName || `${acquire?.name || "采图"}_${String(imageIndex + 1).padStart(3, "0")}.png`,
          imageUrl: normalizeSampleImageUrl(image.imageUrl || acquire?.sampleImageUrl),
          tags: Array.isArray(image.tags) ? image.tags.filter(Boolean) : [],
        }));
        const availableTags = Array.from(
          new Set(
            (Array.isArray(item.availableTags) ? item.availableTags : ["OK", "NG"])
              .map((tag) => String(tag || "").trim())
              .filter(Boolean),
          ),
        );
        const selectedTag = String(item.selectedTag || images[0]?.tags?.[0] || availableTags[0] || "OK");
        if (!availableTags.includes(selectedTag)) availableTags.push(selectedTag);
        return {
          ...item,
          acquireId: item.acquireId || acquire?.id || "",
          acquireName: item.acquireName || acquire?.name || `图像获取 ${itemIndex + 1}`,
          enabled: resetActiveCaptureDefaults
            ? true
            : typeof item.enabled === "boolean"
              ? item.enabled
              : loadedVersion < 16
                ? Number(rawTargetCount) > 0
                : true,
          targetCount: resetActiveCaptureDefaults ? null : Number.isFinite(normalizedTargetCount) ? normalizedTargetCount : null,
          availableTags: availableTags.length ? availableTags : ["OK", "NG"],
          selectedTag,
          images,
        };
      });
      const targetTotal = items.reduce((sum, item) => sum + (item.targetCount || 0), 0);
      const capturedTotal = items.reduce((sum, item) => sum + item.images.length, 0);
      return {
        ...record,
        id: record.id || `CAP-${String(recordIndex + 1).padStart(3, "0")}`,
        toolId: record.toolId || tool?.id || "",
        toolName: record.toolName || tool?.name || "采图工具",
        status: record.status === "采集中" ? "采集中" : record.status === "异常" ? "异常" : "已结束",
        startedAt: record.startedAt || next.meta.now,
        completedAt: record.completedAt || "",
        targetTotal,
        capturedTotal,
        appendMode: Boolean(record.appendMode),
        items,
      };
    });

    if (next.session.loggedIn) {
      const runtimeClient =
        next.clients.find((client) => client.id === next.session.clientId) ||
        next.clients.find((client) => client.hardwareCode === next.runtimeDevice.hardwareCode) ||
        null;
      if (!runtimeClient) {
        next.session.loggedIn = false;
        next.session.clientId = null;
        next.session.account = "";
      } else {
        next.session.clientId = runtimeClient.id;
      }
    }

    return next;
  }

  function loadState() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const next = cloneDefaultState();
      saveState(next);
      return next;
    }

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeLoadedState(parsed);
      saveState(normalized);
      return normalized;
    } catch (error) {
      const resetState = cloneDefaultState();
      saveState(resetState);
      return resetState;
    }
  }

  function saveState(state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    window.localStorage.removeItem(STORAGE_KEY);
    const resetValue = cloneDefaultState();
    saveState(resetValue);
    return resetValue;
  }

  function parseTime(value) {
    return value ? new Date(value).getTime() : NaN;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const formatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: DISPLAY_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return formatter.format(new Date(value)).replace(/\//g, "-");
  }

  function formatGb(value) {
    return `${roundGb(value).toFixed(1)} GB`;
  }

  function roundGb(value) {
    return Math.round(Number(value) * 10) / 10;
  }

  function getNowMs(state) {
    return parseTime(state.meta.now);
  }

  function advanceDemoClock(state, minutes) {
    const base = getNowMs(state);
    const nextTime = new Date(base + Number(minutes || 0) * 60 * 1000);
    state.meta.now = nextTime.toISOString();
    return state.meta.now;
  }

  function getQuotaUsage(state) {
    return state.clients.filter((client) => client.bound).length;
  }

  function getClientStatus(client, nowValue) {
    if (!client || !client.bound) return "未绑定";
    const nowMs = parseTime(nowValue);
    const lastHeartbeatMs = parseTime(client.lastHeartbeatAt);
    if (!Number.isFinite(lastHeartbeatMs)) return "离线";
    return nowMs - lastHeartbeatMs <= ONLINE_THRESHOLD_MS ? "在线" : "离线";
  }

  function syncOfflineAt(state) {
    state.clients.forEach((client) => {
      const status = getClientStatus(client, state.meta.now);
      if (status === "在线") {
        client.offlineAt = null;
      } else if (status === "离线" && !client.offlineAt) {
        client.offlineAt = state.meta.now;
      }
    });
  }

  function getRuntimeClient(state) {
    return state.clients.find((client) => client.hardwareCode === state.runtimeDevice.hardwareCode) || null;
  }

  function getCameraLabel(camera) {
    if (!camera) return "-";
    return camera.name || camera.id || camera.serial || "-";
  }

  function getParamGroupLabel(camera, paramGroupId) {
    const group = camera?.paramGroups?.find((item) => item.id === paramGroupId);
    return group ? group.name : "-";
  }

  function getReferencedModelIds(state) {
    const referenced = new Set();
    state.tools.forEach((tool) => {
      tool.process.forEach((instance) => {
        if (instance.modelId) referenced.add(instance.modelId);
      });
      tool.detect.forEach((instance) => {
        if (instance.modelId) referenced.add(instance.modelId);
      });
    });
    return referenced;
  }

  function getReferencedCameraIds(state) {
    const referenced = new Set();
    state.tools.forEach((tool) => {
      tool.acquire.forEach((instance) => {
        if (instance.type === "camera" && instance.cameraId) referenced.add(instance.cameraId);
      });
    });
    return referenced;
  }

  function getReferencedParamIds(state) {
    const referenced = new Set();
    state.tools.forEach((tool) => {
      tool.acquire.forEach((instance) => {
        if (instance.type === "camera" && instance.paramGroupId) referenced.add(instance.paramGroupId);
      });
    });
    return referenced;
  }

  function evaluateToolCompletion(tool) {
    if (!tool) return false;
    if (!tool.acquire.length || !tool.process.length || !tool.detect.length) return false;
    const acquireIds = new Set(tool.acquire.map((item) => item.id));
    const processMap = new Map(tool.process.map((item) => [item.id, item]));
    const processReady = tool.process.every((item) => {
      if (!acquireIds.has(item.inputId)) return false;
      const mode = normalizeToolProcessMode(item.mode);
      if (mode === "model-roi") {
        return !item.modelId || (isCategoryOutputModel(item) && normalizeModelCategories(item).length > 0);
      }
      if (mode === "manual-roi") return getNormalizedProcessRegions(item).some((region) => region.type !== "ignore");
      return true;
    });
    if (!processReady) return false;
    return tool.detect.every((instance) => {
      if (!Array.isArray(instance.targets) || !instance.targets.length) return false;
      return instance.targets.every((target) => {
        const process = processMap.get(target.processId);
        if (!process) return false;
        if (normalizeToolProcessMode(process.mode) !== "model-roi") return true;
        return Boolean(target.categoryKey) && normalizeModelCategories(process).includes(target.categoryKey);
      });
    });
  }

  function isStorageBlocked(state) {
    return Number(state.storage.remainingGb) < Number(state.storage.blockGb);
  }

  function isStorageWarning(state) {
    return Number(state.storage.remainingGb) < Number(state.storage.warningGb);
  }

  function makeId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
  }

  function findModel(state, modelId) {
    return state.localModels.find((model) => model.id === modelId) || null;
  }

  function getModelLabel(state, modelId) {
    const model = findModel(state, modelId);
    return model ? `${model.modelName} / ${getModelVersionLabel(model)}` : "未选择算子";
  }

  function getModelVersionLabel(model) {
    const value = String(model?.displayVersion || model?.version || "").trim();
    return /^v\d+$/i.test(value) ? value.toUpperCase() : "V1";
  }

  function getToolById(state, toolId) {
    return state.tools.find((tool) => tool.id === toolId) || null;
  }

  window.JetCheckDemo = {
    STORAGE_KEY,
    ONLINE_THRESHOLD_MS,
    cloneDefaultState,
    loadState,
    saveState,
    resetState,
    formatDateTime,
    formatGb,
    roundGb,
    advanceDemoClock,
    getQuotaUsage,
    getClientStatus,
    syncOfflineAt,
    getRuntimeClient,
    getCameraLabel,
    getParamGroupLabel,
    getReferencedModelIds,
    getReferencedCameraIds,
    getReferencedParamIds,
    evaluateToolCompletion,
    isStorageBlocked,
    isStorageWarning,
    makeId,
    findModel,
    getModelLabel,
    getModelVersionLabel,
    getToolById,
    normalizeToolProcessMode,
    normalizeRunMode,
    normalizeModelCategories,
    getSuggestedModelCategories,
  };
})();
