{
  "completed_at": "2025-03-22T17:38:38.647064Z",
  "created_at": "2025-03-22T17:36:30.099000Z",
  "data_removed": false,
  "error": null,
  "id": "jm6ncmkxjdrga0cnqvpsdxja70",
  "input": {
    "image": "https://replicate.delivery/pbxt/MhlZrlSQexw4AhqRzXVCFAn3wV8Y7IUDmEKLBNBAyD2kDcod/Screenshot%202025-03-21%20at%2012.29.12%E2%80%AFPM.png",
    "imgsz": 640,
    "box_threshold": 0.05,
    "iou_threshold": 0.1
  },
  "logs": "0: 832x1280 132 icons, 59.6ms\nSpeed: 10.4ms preprocess, 59.6ms inference, 100.0ms postprocess per image at shape (1, 3, 832, 1280)\nlen(filtered_boxes): 206 140\n/root/.pyenv/versions/3.12.6/lib/python3.12/site-packages/transformers/generation/configuration_utils.py:677: UserWarning: `num_beams` is set to 1. However, `early_stopping` is set to `True` -- this flag is only used in beam-based generation modes. You should set `num_beams>1` or unset `early_stopping`.\nwarnings.warn(\ntime to get parsed content: 6.449556827545166",
  "metrics": {
    "predict_time": 15.774338876,
    "total_time": 128.548064
  },
  "output": {
    "img": "https://replicate.delivery/czjl/cEKBupKEFv6zOVgAnsEfdqu2kOPFYsSEtInCzD1z4IAPPlNKA/output.png",
    "elements": "icon 0: {'type': 'text', 'bbox': [0.029803240671753883, 0.008504924364387989, 0.0581597238779068, 0.022381378337740898], 'interactivity': False, 'content': 'Firefox'}\nicon 205: {'type': 'icon', 'bbox': [0.9770834445953369, 0.03561566770076752, 0.9999983310699463, 0.07012978941202164], 'interactivity': True, 'content': 'unanswerable'}"
  },
  "started_at": "2025-03-22T17:38:22.872725Z",
  "status": "succeeded",
  "urls": {
    "get": "https://api.replicate.com/v1/predictions/jm6ncmkxjdrga0cnqvpsdxja70",
    "cancel": "https://api.replicate.com/v1/predictions/jm6ncmkxjdrga0cnqvpsdxja70/cancel"
  },
  "version": "49cf3d41b8d3aca1360514e83be4c97131ce8f0d99abfc365526d8384caa88df"
}