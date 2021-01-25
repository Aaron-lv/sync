// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs");
const fs = require('fs')
const file_buffer  = fs.readFileSync('./myfile.zip');
const contents_in_base64 = file_buffer.toString('base64');

const ScfClient = tencentcloud.scf.v20180416.Client;

const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: process.env.TENCENT_REGION, // 区域参考，https://cloud.tencent.com/document/product/213/6091
  profile: {
    httpProfile: {
      endpoint: "scf.tencentcloudapi.com",
    },
  },
};

const client = new ScfClient(clientConfig);
const params = {
  "Handler": "index.main_handler",
  "FunctionName": process.env.TENCENT_FUNCTION_NAME, // 云函数程序名，例如 jd_scripts
  "ZipFile": contents_in_base64
};
client.UpdateFunctionCode(params).then(
  (data) => {
    console.log(data);
  },
  (err) => {
    console.error("error", err);
  }
);
