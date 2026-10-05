export type Module = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  lab: string;
  level: "Foundation" | "Core" | "Production";
};

export const curriculum: Module[] = [
  {
    id: "linux-shell",
    title: "Linux & Shell",
    description: "Hiểu filesystem, process, permissions, pipes và troubleshooting từ terminal.",
    skills: ["filesystem", "permissions", "processes", "bash", "network tools"],
    lab: "Khôi phục một service bị lỗi quyền và xác minh health.",
    level: "Foundation"
  },
  {
    id: "git-ci",
    title: "Git & CI",
    description: "Từ commit đến pipeline có kiểm thử, artifact và quality gate.",
    skills: ["git", "branching", "CI", "artifacts", "quality gates"],
    lab: "Điều tra artifact delivery và release acceptance trong mô phỏng; pipeline xanh chưa đủ để hoàn tất.",
    level: "Foundation"
  },
  {
    id: "docker",
    title: "Docker",
    description: "Image, container, network, volume, multi-stage build và hardening.",
    skills: ["Dockerfile", "Compose", "networking", "volumes", "security"],
    lab: "Tối ưu image và debug container không khởi động.",
    level: "Core"
  },
  {
    id: "kubernetes",
    title: "Kubernetes",
    description: "Deploy workload, service discovery, config, probes, rollout và debugging.",
    skills: ["Pod", "Deployment", "Service", "ConfigMap", "Secret", "probes"],
    lab: "Khắc phục CrashLoopBackOff và rollout an toàn.",
    level: "Core"
  },
  {
    id: "iac-cloud",
    title: "IaC & Cloud",
    description: "Thiết kế hạ tầng có thể lặp lại, review được và quản trị drift.",
    skills: ["Terraform", "state", "modules", "IAM", "cloud primitives"],
    lab: "Phát hiện drift và sửa một thay đổi hạ tầng sai.",
    level: "Production"
  },
  {
    id: "observability",
    title: "Observability & SRE",
    description: "Metrics, logs, traces, SLI/SLO, alerting và incident response.",
    skills: ["metrics", "logs", "traces", "SLO", "incident response"],
    lab: "Điều tra latency spike bằng evidence thay vì đoán.",
    level: "Production"
  }
];
