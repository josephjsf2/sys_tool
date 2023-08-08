import { EncryptUtils } from 'src/common/utils/encrypt.utils';
export default (): any => ({
  port: process.env.PORT,
  runningEnv: process.env.RUNNING_ENV,
  backendUrl: process.env.BACKEND_SERVER_URL,
  pm2ProcessId: process.env.pm_id,
  enableMemberSchedule: JSON.parse(process.env.ENABLE_MEMBER_SCHEDULE),
  serverUrl: process.env.SERVER_URL,
  pm2ProcessIdList: process.env.PM2_PROCESS_ID?.split(','),
  proxyProtocol: process.env.PROXY_PROTOCOL,
  proxyHost: process.env.PROXY_HOST,
  proxyPort: process.env.PROXY_PORT,
  proxyAuthName: process.env.PROXY_AUTH_NAME,
  proxyAuthPsd: EncryptUtils.aesDecrypt(process.env.PROXY_AUTH_PSD),
});
