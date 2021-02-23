const notify = require('../sendNotify');
const fs = require('fs');
const notifyPath = '/scripts/logs/notify.txt';
async function image_update_notify() {
  if (fs.existsSync(notifyPath)) {
    //notify.txt文件存在
    const content = await fs.readFileSync(`${notifyPath}`, 'utf8');//读取notify.txt内容
    if (!content.match(process.env.NOTIFY_CONTENT) && process.env.NOTIFY_CONTENT) {
      await notify.sendNotify("⚠️Docker镜像版本更新通知⚠️", process.env.NOTIFY_CONTENT);
      //把通知内容写入notify.txt文件
      await fs.writeFileSync(`${notifyPath}`, JSON.stringify(process.env.NOTIFY_CONTENT));
    }
  } else {
    if (process.env.NOTIFY_CONTENT) {
      notify.sendNotify("⚠️Docker镜像版本更新通知⚠️", process.env.NOTIFY_CONTENT)
      //把通知内容写入notify.txt文件
      await fs.writeFileSync(`${notifyPath}`, JSON.stringify(process.env.NOTIFY_CONTENT));
    }
  }
}
!(async() => {
  await image_update_notify();
})().catch((e) => console.log(e))