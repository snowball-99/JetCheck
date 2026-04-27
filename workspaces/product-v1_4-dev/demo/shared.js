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

  const DEFAULT_STATE = {
    version: 9,
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
      remainingGb: 9.4,
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
        source: "导入本地模型",
        addedAt: "2026-03-20T10:12:10+08:00",
        categories: ["卡扣已安装", "卡扣缺失"],
      },
      {
        id: "mdl_local_003",
        version: "20260320031",
        modelName: "焊点焊接有无检测",
        sceneType: "分类",
        source: "导入本地模型",
        addedAt: "2026-03-20T11:08:36+08:00",
        categories: ["焊点完整", "焊点缺失"],
      },
      {
        id: "mdl_local_004",
        version: "20260322041",
        modelName: "K11螺杆左模版",
        sceneType: "尺寸",
        source: "导入本地模型",
        addedAt: "2026-03-22T10:18:06+08:00",
        categories: ["螺杆1总长", "螺杆1螺纹长", "螺杆2总长", "螺杆2台阶高", "螺杆间距", "边缘到螺杆1"],
      },
      {
        id: "mdl_local_005",
        version: "20260322042",
        modelName: "K11螺杆右模版",
        sceneType: "尺寸",
        source: "导入本地模型",
        addedAt: "2026-03-22T10:24:18+08:00",
        categories: ["螺杆1总长", "螺杆1螺纹长", "螺杆2总长", "螺杆2台阶高", "螺杆间距", "边缘到螺杆2"],
      },
      {
        id: "mdl_local_006",
        version: "20260322061",
        modelName: "X光加热丝零件识别",
        sceneType: "分类",
        source: "导入本地模型",
        addedAt: "2026-03-22T14:12:26+08:00",
        categories: ["加热丝主体", "连接端子", "定位夹片"],
      },
      {
        id: "mdl_local_007",
        version: "20260322071",
        modelName: "X光零件缺陷检测",
        sceneType: "缺陷检测",
        source: "导入本地模型",
        addedAt: "2026-03-22T15:06:14+08:00",
      },
      {
        id: "mdl_local_008",
        version: "20260322081",
        modelName: "纱布缺陷检测",
        sceneType: "缺陷检测",
        source: "导入本地模型",
        addedAt: "2026-03-22T16:28:44+08:00",
      },
    ],
    cloudModels: [
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
            name: "默认参数组",
            settings: {
              autoExposure: true,
              exposure: 1200,
              gain: 3,
              width: 2448,
              height: 2048,
              offsetX: 0,
              offsetY: 0,
            },
          },
          {
            id: "cam_01_pg_02",
            name: "低曝光方案",
            settings: {
              autoExposure: false,
              exposure: 800,
              gain: 2,
              width: 2448,
              height: 2048,
              offsetX: 0,
              offsetY: 0,
            },
          },
        ],
      },
      {
        id: "cam_02",
        name: "",
        vendor: "Basler",
        brand: "Basler",
        model: "a2A2448-75uc",
        serial: "SN-BAS-0018",
        ip: "192.168.1.22",
        status: "占用",
        paramGroups: [
          {
            id: "cam_02_pg_01",
            name: "默认参数组",
            settings: {
              exposure: 1600,
              gamma: 1.2,
              packetSize: 1500,
              triggerMode: "Line1",
              reverseX: false,
              reverseY: false,
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
            name: "默认参数组",
            settings: {
              autoExposure: true,
              exposure: 1500,
              gain: 4,
              width: 2448,
              height: 2048,
              offsetX: 0,
              offsetY: 0,
            },
          },
        ],
      },
    ],
    availableCameras: [
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
        name: "",
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
    tools: [
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
            sampleImageUrl: "../sample-images/安全座椅-卡扣kakou.png",
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
            sampleImageUrl: "../sample-images/安全座椅-螺杆.bmp",
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
            sampleImageUrl: "../sample-images/马斯特X光.bmp",
            sampleImageWidth: 3072,
            sampleImageHeight: 3072,
            sampleImage: "马斯特X光.bmp",
          },
        ],
        process: [
          {
            id: "proc_xray_component_roi",
            name: "加热丝零件模型ROI",
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
            sampleImageUrl: "../sample-images/血氧纱布.jpg",
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
            sampleImageUrl: "../sample-images/瑾辰-左.png",
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
            sampleImageUrl: "../sample-images/瑾辰-右.png",
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
                source: "模型ROI",
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
    captureRecords: [],
  };

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
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
    return next === "云端同步" ? "云端同步" : "导入本地模型";
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
    next.cloudModels = next.cloudModels.map((model) => ({
      ...model,
      sceneType: normalizeModelSceneType(model.sceneType),
      versions: Array.isArray(model.versions) ? model.versions : [],
    }));

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
            sampleImageUrl: String(item.sampleImageUrl || ""),
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
                if (/模型\s*ROI|model\s*roi/i.test(processName)) {
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
        runToken: Number.isFinite(Number(tool.runtime?.runToken)) ? Number(tool.runtime.runToken) : 0,
      },
    }));

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
    next.captureRecords = [];

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
        return Boolean(item.modelId) && isCategoryOutputModel(item) && normalizeModelCategories(item).length > 0;
      }
      if (mode === "manual-roi") return getNormalizedProcessRegions(item).some((region) => region.type !== "ignore");
      return true;
    });
    if (!processReady) return false;
    return tool.detect.every((instance) => {
      if (!instance.modelId) return false;
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
    return model ? `${model.modelName} / ${model.version}` : "未选择模型";
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
    getToolById,
    normalizeToolProcessMode,
    normalizeRunMode,
    normalizeModelCategories,
    getSuggestedModelCategories,
  };
})();
