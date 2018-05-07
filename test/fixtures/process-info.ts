const processStartTime = Date.now() - process.uptime() * 1000;

export function getPid() {
  return process.pid;
}

export function getStartTime() {
  return processStartTime;
}
