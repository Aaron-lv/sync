/*
燃动夏季
活动时间：2021-07-08至2021-08-08

===================quantumultx================
[task_local]
#燃动夏季
7 0,6-23/2 * * * jd_summer_movement.js, tag=燃动夏季, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

=====================Loon================
[Script]
cron "7 0,6-23/2 * * *" script-path=jd_summer_movement.js, tag=燃动夏季

====================Surge================
燃动夏季 = type=cron,cronexp="7 0,6-23/2 * * *",wake-system=1,timeout=3600,script-path=jd_summer_movement.js

============小火箭=========
燃动夏季 = type=cron,script-path=jd_summer_movement.js, cronexpr="7 0,6-23/2 * * *", timeout=3600, enable=true
*/
const $ = new Env('燃动夏季');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const ShHelpFlag = true;//是否SH助力  true 助力，false 不助力
const ShHelpAuthorFlag = true;//是否助力作者SH  true 助力，false 不助力
const OPEN_MEMBERCARD = (process.env.OPEN_MEMBERCARD && process.env.OPEN_MEMBERCARD === "true") ? true : false //默认不开通会员卡
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], uuid = '', UA = '', joyToken = '';
$.cookie = '';
$.inviteList = [];
$.secretpInfo = {};
$.ShInviteList = [];
$.innerShInviteList = [];
$.groupInviteIdList = [];
$.appid = 'o2_act';
let UAInfo = {}, joyTokenInfo = {}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  console.log('活动入口：京东APP-》 首页-》 右边小窗口（点我赢千元）\n' +
      '邀请好友助力：内部账号自行互助(排名靠前账号得到的机会多)\n' +
      'SH互助：内部账号自行互助(排名靠前账号得到的机会多),多余的助力次数会默认助力作者内置助力码\n' +
      '店铺任务：已添加\n' +
      '微信任务：已添加\n' +
      '入会任务：已添加，默认不开通会员卡，如做入会任务需添加环境OPEN_MEMBERCARD变量为true\n' +
      '活动时间：2021-07-08至2021-08-08\n' +
      '脚本更新时间：2021-07-14 06:00\n'
      );
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      UA = `jdapp;android;10.0.2;9;${randomString(28)}-73D2164353034363465693662666;network/wifi;model/MI 8;addressid/138087843;aid/0a4fc8ec9548a7f9;oaid/3ac46dd4d42fa41c;osVer/28;appBuild/88569;partner/jingdong;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 9; MI 8 Build/PKQ1.180729.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045715 Mobile Safari/537.36;`
      uuid = UA.split(';') && UA.split(';')[4] || ''
      await getToken();
      $.cookie = cookiesArr[i] + `joyytoken=50085${joyToken};`;
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = ''
      $.hotFlag = false; //是否火爆
      $.taskHotFlag = false
      await TotalBean();
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
      console.log(`\n如有未完成的任务，请多执行几次\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await movement()
      UAInfo[$.UserName] = UA
      joyTokenInfo[$.UserName] = joyToken
      if($.hotFlag) $.secretpInfo[$.UserName] = false;//火爆账号不执行助力
    }
  }
  // 助力
  let res = await getAuthorShareCode('https://raw.githubusercontent.com/Aaron-lv/updateTeam/master/shareCodes/jd_summer_movement_sh.json')
  if (!res) {
    $.http.get({url: 'https://purge.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_summer_movement_sh.json'}).then((resp) => {}).catch((e) => $.log('刷新CDN异常', e));
    await $.wait(1000)
    res = await getAuthorShareCode('https://cdn.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_summer_movement_sh.json') || []
  }
  let res2 = await getAuthorShareCode('https://raw.githubusercontent.com/Aaron-lv/updateTeam/master/shareCodes/jd_summer_movement.json')
  if (!res2) {
    $.http.get({url: 'https://purge.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_summer_movement.json'}).then((resp) => {}).catch((e) => $.log('刷新CDN异常', e));
    await $.wait(1000)
    res2 = await getAuthorShareCode('https://cdn.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_summer_movement.json') || []
  }
  if (ShHelpAuthorFlag) {
    $.innerShInviteList = getRandomArrayElements([...$.innerShInviteList, ...res], [...$.innerShInviteList, ...res].length);
    $.ShInviteList.push(...$.innerShInviteList);
    $.inviteList.push(...res2);
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    $.canHelp = true;
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    UA = UAInfo[$.UserName]
    uuid = UA.split(';') && UA.split(';')[4] || ''
    joyToken = joyTokenInfo[$.UserName];
    $.cookie = cookiesArr[i] + `joyytoken=50085${joyToken};`;
    $.index = i + 1;

    if (!$.secretpInfo[$.UserName]) {
      continue;
    }

    if (new Date().getUTCHours() + 8 >= 8) {
      if ($.ShInviteList && $.ShInviteList.length) {
        console.log(`\n******开始内部京东账号【百元守卫站SH】助力*********\n`);
        for (let i = 0; i < $.ShInviteList.length && ShHelpFlag && $.canHelp; i++) {
          console.log(`${$.UserName} 去助力SH码 ${$.ShInviteList[i]}`);
          $.inviteId = $.ShInviteList[i];
          await takePostRequest('shHelp');
          await $.wait(2000);
        }
      }
      $.canHelp = true;
    }
    if ($.inviteList && $.inviteList.length) {
      console.log(`\n******开始内部京东账号【邀请好友助力】*********\n`);
      for (let j = 0; j < $.inviteList.length && $.canHelp; j++) {
        $.oneInviteInfo = $.inviteList[j];
        if ($.oneInviteInfo.ues === $.UserName || $.oneInviteInfo.max) {
          continue;
        }
        $.inviteId = $.oneInviteInfo.inviteId;
        console.log(`${$.UserName}去助力${$.oneInviteInfo.ues},助力码${$.inviteId}`);
        await takePostRequest('help');
        await $.wait(2000);
      }
      $.canHelp = true;
    }
    if ($.groupInviteIdList && $.groupInviteIdList.length) {
      console.log(`\n******开始内部京东账号【团队运动】助力*********\n`);
      for (let j = 0; j < $.groupInviteIdList.length && $.canHelp; j++) {
        $.oneGroupInviteIdInfo = $.groupInviteIdList[j];
        if ($.oneGroupInviteIdInfo.ues === $.UserName || $.oneGroupInviteIdInfo.max) {
          continue;
        }
        $.inviteId = $.oneGroupInviteIdInfo.groupInviteId;
        console.log(`${$.UserName}去助力${$.oneGroupInviteIdInfo.ues},团队运动助力码${$.inviteId}`);
        await takePostRequest('help');
        await $.wait(2000);
      }
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function movement() {
  try {
    $.signSingle = {};
    $.homeData = {};
    $.secretp = ``;
    $.taskList = [];
    $.shopSign = ``;
    $.userInfo = ''
    await takePostRequest('olympicgames_home');
    if (!$.secretpInfo[$.UserName]) {
      console.log(`账户火爆还是去买买买吧`)
      return
    }
    if($.homeData.result.popWindows) {
      let res = $.homeData.result.popWindows
      if(res.type == 'continued_sign_pop'){
        console.log(`签到获得: ${JSON.stringify($.homeData.result.popWindows.data || '')}`)
      }else if(res.type == 'limited_time_hundred_pop'){
        console.log(`百元守卫战: ${JSON.stringify($.homeData.result.popWindows || '')}`)
      }else{
        console.log(`弹窗信息: ${JSON.stringify($.homeData.result.popWindows)}`)
      }
    }
    $.userInfo = $.homeData.result.userActBaseInfo;
    console.log(`\n签到${$.homeData.result.continuedSignDays}天 待兑换金额：${Number($.userInfo.poolMoney)} 当前等级:${$.userInfo.medalLevel}  ${$.userInfo.poolCurrency}/${$.userInfo.exchangeThreshold}(攒卡领${Number($.userInfo.cash)}元)\n`);
    await $.wait(1000);
    if($.userInfo && typeof $.userInfo.sex == 'undefined') {
      await takePostRequest('olympicgames_tiroGuide');
      await $.wait(2000);
      await takePostRequest('olympicgames_home');
      await $.wait(1000);
    }
    $.userInfo = $.homeData.result.userActBaseInfo;
    if (Number($.userInfo.poolCurrency) >= Number($.userInfo.exchangeThreshold)) {
      console.log(`满足升级条件，去升级`);
      await takePostRequest('olympicgames_receiveCash');
      await $.wait(1000);
    }
    bubbleInfos = $.homeData.result.bubbleInfos;
    for(let item of bubbleInfos){
      if(item.type != 7){
        $.collectId = item.type
        await takePostRequest('olympicgames_collectCurrency');
        await $.wait(1000);
      }
    }
    if($.homeData.result.pawnshopInfo && $.homeData.result.pawnshopInfo.betGoodsList) {
      $.Reward = []
      for(let i in $.homeData.result.pawnshopInfo.betGoodsList){
        $.Reward = $.homeData.result.pawnshopInfo.betGoodsList[i]
        if($.Reward.status == 1){
          console.log(`开奖：${$.Reward.skuName}`)
          await takePostRequest('olympicgames_pawnshopRewardPop');
          await $.wait(1000);
        }
      }
    }
    console.log('\n运动\n')
    $.speedTraining = true;
    await takePostRequest('olympicgames_startTraining');
    await $.wait(1000);
    for(let i=0; i<=3; i++){
      if($.speedTraining) {
        await takePostRequest('olympicgames_speedTraining');
        await $.wait(1000);
      } else {
        break;
      }
    }
    console.log(`\n做任务\n`);
    if(!$.hotFlag) await takePostRequest('olympicgames_getTaskDetail');
    await $.wait(1000);
    //做任务
    for (let i = 0; i < $.taskList.length && !$.hotFlag; i++) {
      $.oneTask = $.taskList[i];
      if ([1, 3, 5, 7, 9, 21, 26].includes($.oneTask.taskType) && $.oneTask.status === 1) {
        $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
        for (let j = 0; j < $.activityInfoList.length && !$.hotFlag; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
          if ($.oneTask.taskType === 21 && OPEN_MEMBERCARD) {
            let channel = $.oneActivityInfo.memberUrl.match(/channel=(\d+)/) ? $.oneActivityInfo.memberUrl.match(/channel=(\d+)/)[1] : '';
            const body = {
              venderId: $.oneActivityInfo.vendorIds,
              shopId: $.oneActivityInfo.ext.shopId,
              bindByVerifyCodeFlag: 1,
              registerExtend: {},
              writeChildFlag: 0,
              channel: channel
            }
            let url = `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body=${encodeURIComponent(JSON.stringify(body))}&client=h5&clientVersion=9.2.0&uuid=88888`
            await openMemberCard(url, $.oneActivityInfo.memberUrl)
            await $.wait(2000);
          }
          await takePostRequest('olympicgames_doTaskDetail');
          if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
            await $.wait(getRndInteger(7000, 8000));
            let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
            await callbackResult(sendInfo)
          } else if ($.oneTask.taskType === 5 || $.oneTask.taskType === 3 || $.oneTask.taskType === 26) {
            await $.wait(getRndInteger(1000, 2000));
            console.log(`任务完成`);
          } else if ($.oneTask.taskType === 21) {
            let data = $.callbackInfo
            if(data.data && data.data.bizCode === 0) {
              console.log(`获得：${data.data.result.score}`);
            } else if(data.data && data.data.bizMsg) {
              console.log(data.data.bizMsg);
            } else {
              console.log(JSON.stringify($.callbackInfo));
            }
            await $.wait(getRndInteger(1000, 2000));
          } else {
            console.log($.callbackInfo);
            console.log(`任务失败`);
            await $.wait(getRndInteger(2000, 3000));
          }
          if($.taskHotFlag) break
        }
      } else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 2){
        console.log(`做任务：${$.oneTask.taskName};等待完成 (实际不会添加到购物车)`);
        $.taskId = $.oneTask.taskId;
        $.feedDetailInfo = {};
        await takePostRequest('olympicgames_getFeedDetail');
        let productList = $.feedDetailInfo.productInfoVos;
        let needTime = Number($.feedDetailInfo.maxTimes) - Number($.feedDetailInfo.times);
        for (let j = 0; j < productList.length && needTime > 0; j++) {
          if(productList[j].status !== 1){
            continue;
          }
          $.taskToken = productList[j].taskToken;
          console.log(`加购：${productList[j].skuName}`);
          await takePostRequest('add_car');
          await $.wait(getRndInteger(1000, 2000));
          needTime --;
        }
      }else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 0){
        $.activityInfoList = $.oneTask.productInfoVos ;
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：浏览${$.oneActivityInfo.skuName};等待完成`);
          await takePostRequest('olympicgames_doTaskDetail');
          if ($.oneTask.taskType === 2) {
            await $.wait(getRndInteger(1000, 2000));
            console.log(`任务完成`);
          } else {
            console.log($.callbackInfo);
            console.log(`任务失败`);
            await $.wait(getRndInteger(2000, 3000));
          }
          if($.taskHotFlag) break
        }
      }
      if($.taskHotFlag) break
    }
    //==================================微信任务========================================================================
    $.wxTaskList = [];
    if(!$.hotFlag) await takePostRequest('wxTaskDetail');
    for (let i = 0; i < $.wxTaskList.length; i++) {
      $.oneTask = $.wxTaskList[i];
      if($.oneTask.taskType === 2 || $.oneTask.status !== 1){continue;} //不做加购
      $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
      for (let j = 0; j < $.activityInfoList.length; j++) {
        $.oneActivityInfo = $.activityInfoList[j];
        if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
          continue;
        }
        $.callbackInfo = {};
        console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
        await takePostRequest('olympicgames_doTaskDetail');
        if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
          await $.wait(getRndInteger(7000, 9000));
          let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
          await callbackResult(sendInfo)
        } else  {
          await $.wait(getRndInteger(1000, 2000));
          console.log(`任务完成`);
        }
        if($.taskHotFlag) break
      }
      if($.taskHotFlag) break
    }

    // 店铺
    console.log(`\n去做店铺任务\n`);
    $.shopInfoList = [];
    if(!$.hotFlag) await takePostRequest('qryCompositeMaterials');
    for (let i = 0; i < $.shopInfoList.length; i++) {
      let taskbool = false
      $.shopSign = $.shopInfoList[i].extension.shopId;
      console.log(`执行第${i+1}个店铺任务：${$.shopInfoList[i].name} ID:${$.shopSign}`);
      $.shopResult = {};
      await takePostRequest('olympicgames_shopLotteryInfo');
      await $.wait(getRndInteger(1000, 2000));
      if(JSON.stringify($.shopResult) === `{}`) continue;
      $.shopTask = $.shopResult.taskVos || [];
      for (let i = 0; i < $.shopTask.length; i++) {
        $.oneTask = $.shopTask[i];
        if($.oneTask.taskType === 21 || $.oneTask.taskType === 14 || $.oneTask.status !== 1){continue;} //不做入会，不做邀请
        taskbool = true
        $.activityInfoList = $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.shoppingActivityVos || $.oneTask.browseShopVo || $.oneTask.simpleRecordInfoVo;
        if($.oneTask.taskType === 12){//签到
          if($.shopResult.dayFirst === 0){
            $.oneActivityInfo =  $.activityInfoList;
            console.log(`店铺签到`);
            await takePostRequest('olympicgames_bdDoTask');
          }
          continue;
        }
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：${$.oneActivityInfo.subtitle || $.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
          await takePostRequest('olympicgames_doTaskDetail');
          if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
            await $.wait(getRndInteger(7000, 9000));
            let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
            await callbackResult(sendInfo)
          } else  {
            await $.wait(getRndInteger(2000, 3000));
            console.log(`任务完成`);
          }
          if($.taskHotFlag) break
        }
        if($.taskHotFlag) break
      }
      if(taskbool) await $.wait(1000);
      let boxLotteryNum = $.shopResult.boxLotteryNum;
      for (let j = 0; j < boxLotteryNum; j++) {
        console.log(`开始第${j+1}次拆盒`)
        //抽奖
        await takePostRequest('olympicgames_boxShopLottery');
        await $.wait(3000);
      }
      // let wishLotteryNum = $.shopResult.wishLotteryNum;
      // for (let j = 0; j < wishLotteryNum; j++) {
      //   console.log(`开始第${j+1}次能量抽奖`)
      //   //抽奖
      //   await takePostRequest('zoo_wishShopLottery');
      //   await $.wait(3000);
      // }
      if(taskbool) await $.wait(3000);
    }

    $.Shend = false
    await $.wait(1000);
    console.log('\n百元守卫战')
    await takePostRequest('olypicgames_guradHome');
    await $.wait(1000);
    if($.Shend){
      await takePostRequest('olympicgames_receiveCash');
      await $.wait(1000);
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function takePostRequest(type) {
  let body = ``;
  let myRequest = ``;
  switch (type) {
    case 'olympicgames_home':
      body = `functionId=olympicgames_home&body={}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_home`, body);
      break
    case 'olympicgames_collectCurrency':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_collectCurrency`, body);
      break
    case 'olympicgames_receiveCash':
      let id = 6
      if ($.Shend) id = 4
      body = `functionId=olympicgames_receiveCash&body={"type":${id}}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_receiveCash`, body);
      break
    case 'olypicgames_guradHome':
      body = `functionId=olypicgames_guradHome&body={}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olypicgames_guradHome`, body);
      break
    case 'olympicgames_getTaskDetail':
      body = `functionId=${type}&body={"taskId":"","appSign":"1"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_getTaskDetail`, body);
      break;
    case 'olympicgames_doTaskDetail':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_doTaskDetail`, body);
      break;
    case 'olympicgames_getFeedDetail':
      body = `functionId=olympicgames_getFeedDetail&body={"taskId":"${$.taskId}"}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_getFeedDetail`, body);
      break;
    case 'add_car':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_doTaskDetail`, body);
      break;
    case 'shHelp':
    case 'help':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`zoo_collectScore`, body);
      break;
    case 'olympicgames_startTraining':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_startTraining`, body);
      break;
    case 'olympicgames_speedTraining':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_speedTraining`, body);
      break;
    case 'olympicgames_tiroGuide':
      let sex = getRndInteger(0, 2)
      let sportsGoal = getRndInteger(1, 4)
      body = `functionId=olympicgames_tiroGuide&body={"sex":${sex},"sportsGoal":${sportsGoal}}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_tiroGuide`, body);
      break;
    case 'olympicgames_shopLotteryInfo':
      body = `functionId=olympicgames_shopLotteryInfo&body={"channelSign":"1","shopSign":${$.shopSign}}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_shopLotteryInfo`, body);
      break;
    case 'qryCompositeMaterials':
      body = `functionId=qryCompositeMaterials&body={"qryParam":"[{\\"type\\":\\"advertGroup\\",\\"id\\":\\"05371960\\",\\"mapTo\\":\\"logoData\\"}]","openid":-1,"applyKey":"big_promotion"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`qryCompositeMaterials`, body);
      break;
    case 'olympicgames_bdDoTask':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_bdDoTask`, body);
      break;
    case 'olympicgames_boxShopLottery':
      body = `functionId=olympicgames_boxShopLottery&body={"shopSign":${$.shopSign}}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_boxShopLottery`,body);
      break;
    case 'wxTaskDetail':
      body = `functionId=olympicgames_getTaskDetail&body={"taskId":"","appSign":"2"}&client=wh5&clientVersion=1.0.0&loginWQBiz=businesst1&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_getTaskDetail`,body);
      break;
    case 'olympicgames_pawnshopRewardPop':
      body = `functionId=olympicgames_pawnshopRewardPop&body={"skuId":${$.Reward.skuId}}&client=wh5&clientVersion=1.0.0&uuid=${uuid}&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_pawnshopRewardPop`,body);
      break;
    default:
      console.log(`错误${type}`);
  }
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        // console.log(data);
        dealReturn(type, data);
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

async function dealReturn(type, data) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    console.log(`返回异常：${data}`);
    return;
  }
  switch (type) {
    case 'olympicgames_home':
      if (data.code === 0 && data.data && data.data.result) {
        if (data.data['bizCode'] === 0) {
          $.homeData = data.data;
          $.secretpInfo[$.UserName] = true
          console.log(`团队运动互助码：${$.homeData.result && $.homeData.result.groupInfoVO.groupInviteId || '助力已满，获取助力码失败'}\n`);
          if ($.homeData.result && $.homeData.result.groupInfoVO.groupInviteId) {
            $.groupInviteIdList.push({
              'ues': $.UserName,
              'groupInviteId': $.homeData.result.groupInfoVO.groupInviteId,
              'max': false
            });
          }
        }
      } else if (data.data && data.data.bizMsg) {
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_collectCurrency':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`收取成功，当前卡币：${data.data.result.poolCurrency}`);
      } else if (data.data && data.data.bizMsg) {
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      if (data.code === 0 && data.data && data.data.bizCode === -1002) {
        $.hotFlag = true;
        console.log(`该账户脚本执行任务火爆，暂停执行任务，请手动做任务或者等待解决脚本火爆问题`)
      }
      break;
    case 'olympicgames_receiveCash':
      if (data.code === 0 && data.data && data.data.result) {
        if (data.data.result.couponVO) {
          console.log('升级成功')
          let res = data.data.result.couponVO
          console.log(`获得[${res.couponName}]优惠券：${res.usageThreshold} 优惠：${res.quota} 时间：${res.useTimeRange}`);
        }else if(data.data.result.userActBaseVO){
          console.log('结算结果')
          let res = data.data.result.userActBaseVO
          console.log(`当前金额：${res.poolMoney}\n${JSON.stringify(res)}`);
        }
      } else if (data.data && data.data.bizMsg) {
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_getTaskDetail':
      if (data.data && data.data.bizCode === 0) {
        console.log(`互助码：${data.data.result && data.data.result.inviteId || '助力已满，获取助力码失败'}\n`);
        if (data.data.result && data.data.result.inviteId) {
          $.inviteList.push({
            'ues': $.UserName,
            // 'secretp': $.secretp,
            'inviteId': data.data.result.inviteId,
            'max': false
          });
        }
        $.taskList = data.data.result && data.data.result.taskVos || [];
      } else if (data.data && data.data.bizMsg) {
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olypicgames_guradHome':
      if (data.data && data.data.bizCode === 0) {
        console.log(`SH互助码：${data.data.result && data.data.result.inviteId || '助力已满，获取助力码失败\n'}`);
        if (data.data.result && data.data.result.inviteId) {
          if (data.data.result.inviteId) $.ShInviteList.push(data.data.result.inviteId);
          console.log(`守护金额：${Number(data.data.result.activityLeftAmount || 0)} 护盾剩余：${timeFn(Number(data.data.result.guardLeftSeconds || 0) * 1000)} 离结束剩：${timeFn(Number(data.data.result.activityLeftSeconds || 0) * 1000)}`)
          if(data.data.result.activityLeftSeconds == 0) $.Shend = true
        }
        $.taskList = data.data.result && data.data.result.taskVos || [];
      } else if (data.data && data.data.bizMsg) {
        if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.hotFlag = true;
        }
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_doTaskDetail':
      if (data.data && data.data.bizCode === 0) {
        if (data.data.result && data.data.result.taskToken) {
          $.callbackInfo = data;
        }else if(data.data.result && data.data.result.successToast){
          console.log(data.data.result.successToast);
        }
      } else if (data.data && data.data.bizMsg) {
        if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.taskHotFlag = true;
        }
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_getFeedDetail':
      if (data.code === 0) {
        $.feedDetailInfo = data.data.result.addProductVos[0] || [];
      } else if(data.data && data.data.bizMsg){
        console.log(data.data.bizMsg);
        if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.taskHotFlag = true;
        }
      }
      break;
    case 'add_car':
      if (data.code === 0) {
        if (data.data && data.data.bizCode === 0 && data.data.result && data.data.result.acquiredScore) {
          let acquiredScore = data.data.result.acquiredScore;
          if (Number(acquiredScore) > 0) {
            console.log(`加购成功,获得金币:${acquiredScore}`);
          } else {
            console.log(`加购成功`);
          }
        } else if (data.data && data.data.bizMsg) {
          console.log(data.data.bizMsg);
        } else {
          console.log(JSON.stringify(data));
        }
      }
      break
    case 'shHelp':
    case 'help':
      if (data.data && data.data.bizCode === 0) {
        let cash = ''
        if (data.data.result.hongBaoVO && data.data.result.hongBaoVO.withdrawCash) cash = `，并获得${Number(data.data.result.hongBaoVO.withdrawCash)}红包`
        console.log(`助力成功${cash}`);
      } else if (data.data && data.data.bizMsg) {
        if(data.data.bizCode === -405 || data.data.bizCode === -411){
          $.canHelp = false;
        }
        if(data.data.bizCode === -404 && $.oneInviteInfo){
          $.oneInviteInfo.max = true;
        }
        if (data.data.bizMsg.indexOf('今天用完所有') > -1) {
          $.canHelp = false;
        }
        if (data.data.bizMsg.indexOf('组过队') > -1 || data.data.bizMsg.indexOf('你已经有团队') > -1) {
          $.canHelp = false;
        }
        if (data.data.bizMsg.indexOf('不需要助力') > -1) {
          $.oneGroupInviteIdInfo.max = true
        }
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_speedTraining':
      if (data.data && data.data.bizCode === 0 && data.data.result) {
        let res = data.data.result
        console.log(`获得[${res.couponName}]优惠券：${res.usageThreshold} 优惠：${res.quota} 时间：${res.useTimeRange}`);
      } else if (data.data && data.data.bizMsg) {
        if (data.data.bizMsg.indexOf('不在运动中') > -1) {
          $.speedTraining = false;
        } else if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.hotFlag = true;
        }
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_startTraining':
      if (data.data && data.data.bizCode === 0 && data.data.result) {
        let res = data.data.result
        console.log(`倒计时${res.countdown}s ${res.currencyPerSec}卡币/s`);
      } else if (data.data && data.data.bizMsg) {
        if (data.data.bizMsg.indexOf('运动量已经够啦') > -1) {
          $.speedTraining = false;
        } else if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.hotFlag = true;
        }
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    case 'olympicgames_tiroGuide':
      console.log(JSON.stringify(data));
      break;
    case 'olympicgames_shopLotteryInfo':
      if (data.code === 0) {
        $.shopResult = data.data.result;
      } else if(data.data && data.data.bizMsg){
        console.log(data.data.bizMsg);
        if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.taskHotFlag = true;
        }
      }
      break;
    case 'qryCompositeMaterials':
      //console.log(data);
      if (data.code === '0') {
        $.shopInfoList = data.data.logoData.list;
        console.log(`获取到${$.shopInfoList.length}个店铺`);
      }
      break
    case 'olympicgames_bdDoTask':
      if(data.data && data.data.bizCode === 0){
        console.log(`签到获得：${data.data.result.score}`);
      }else if(data.data && data.data.bizMsg){
        console.log(data.data.bizMsg);
        if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.taskHotFlag = true;
        }
      }else{
        console.log(data);
      }
      break;
    case 'olympicgames_boxShopLottery':
      if(data.data && data.data.result){
        let result = data.data.result;
        switch (result.awardType) {
          case 8:
            console.log(`获得金币：${result.rewardScore}`);
            break;
          case 5:
            console.log(`获得：adidas能量`);
            break;
          case 2:
          case 3:
            console.log(`获得优惠券：${result.couponInfo.usageThreshold} 优惠：${result.couponInfo.quota}，${result.couponInfo.useRange}`);
            break;
          default:
            console.log(`抽奖获得未知`);
            console.log(JSON.stringify(data));
        }
      } else if (data.data && data.data.bizMsg) {
        console.log(data.data.bizMsg);
        if(data.data.bizMsg.indexOf('活动太火爆') > -1){
          $.taskHotFlag = true;
        }
      } else {
        console.log(JSON.stringify(data));
      }
      break
    case 'wxTaskDetail':
      if (data.code === 0) {
        $.wxTaskList = data.data.result && data.data.result.taskVos || [];
      }
      break;
    case 'olympicgames_pawnshopRewardPop':
      if (data.data && data.data.bizCode === 0 && data.data.result) {
        console.log(JSON.stringify(data));
        console.log(`结果：${data.data.result.currencyReward && '额外奖励' + data.data.result.currencyReward + '卡币' || ''}`)
      } else if (data.data && data.data.bizMsg) {
        console.log(data.data.bizMsg);
      } else {
        console.log(JSON.stringify(data));
      }
      break;
    default:
      console.log(`未判断的异常${type}`);
  }
}
//领取奖励
function callbackResult(info) {
  return new Promise((resolve) => {
    let url = {
      url: `https://api.m.jd.com/?functionId=qryViewkitCallbackResult&client=wh5&clientVersion=1.0.0&body=${info}&_timestamp=` + Date.now(),
      headers: {
        'Origin': `https://bunearth.m.jd.com`,
        'Cookie': $.cookie,
        'Connection': `keep-alive`,
        'Accept': `*/*`,
        'Host': `api.m.jd.com`,
        'User-Agent': UA,
        'Accept-Encoding': `gzip, deflate, br`,
        'Accept-Language': `zh-cn`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://bunearth.m.jd.com'
      }
    }
    $.get(url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(data.toast.subTitle)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}

// 入会
function openMemberCard(url, Referer) {
  return new Promise(resolve => {
    const option = {
      url,
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        // "Content-Type": "application/x-www-form-urlencoded",
        "Host": "api.m.jd.com",
        "Referer": Referer,
        "Cookie": $.cookie,
        "User-Agent": UA,
      }
    }
    $.get(option, async(err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} 入会 API请求失败，请检查网路重试`)
        } else {
          console.log(data)
          if(data) {
            data = JSON.parse(data)
            console.log(data.message || JSON.stringify(data))
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
async function getPostRequest(type, body) {
  let url = `https://api.m.jd.com/client.action?advId=${type}`;
  const method = `POST`;
  const headers = {
    'Accept': `application/json`,
    'Origin': `https://wbbny.m.jd.com`,
    'Accept-Encoding': `gzip, deflate, br`,
    'Cookie': $.cookie,
    'Content-Type': `application/x-www-form-urlencoded`,
    'Host': `api.m.jd.com`,
    'Connection': `keep-alive`,
    'User-Agent': UA,
    'Referer': `https://wbbny.m.jd.com`,
    'Accept-Language': `zh-cn`
  };
  return {url: url, method: method, headers: headers, body: body};
}

async function getPostBody(type) {
  let taskBody = '';
  let ss = await getBody(UA)
  if (type === 'help' || type === 'shHelp') {
    taskBody = `functionId=olympicgames_assist&body=${JSON.stringify({"inviteId":$.inviteId,"type": "confirm", ss})}&client=wh5&clientVersion=1.0.0`
  } else if (type === 'olympicgames_collectCurrency') {
    taskBody = `functionId=olympicgames_collectCurrency&body=${JSON.stringify({"type": $.collectId, ss})}&client=wh5&clientVersion=1.0.0`;
  } else if(type === 'olympicgames_startTraining' || type === 'olympicgames_speedTraining') {
    taskBody = `functionId=${type}&body=${JSON.stringify({ss})}&client=wh5&clientVersion=1.0.0`;
  } else if(type === 'add_car'){
    taskBody = `functionId=olympicgames_doTaskDetail&body=${JSON.stringify({"taskId": $.taskId,"taskToken":$.taskToken, ss})}&client=wh5&clientVersion=1.0.0`
  } else {
    let actionType = 0
    if([1, 3, 5, 6, 8, 9, 14, 22, 23, 24, 25, 26].includes($.oneTask.taskId)) actionType = 1
    taskBody = `functionId=${type}&body=${JSON.stringify({"taskId": $.oneTask.taskId,"taskToken": $.oneActivityInfo.taskToken, ss,"shopSign":$.shopSign,"actionType":actionType,"showErrorToast":false})}&client=wh5&clientVersion=1.0.0`
  }
  return taskBody + `&uuid=${uuid}` + `&appid=${$.appid}`
}

/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

function randomString(e) {
  e = e || 32;
  let t = "abcdefhijkmnprstwxyz2345678", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

// 随机数
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

// 计算时间
function timeFn(dateBegin) {
  //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
  var dateEnd = new Date(0);//获取当前时间
  var dateDiff = dateBegin - dateEnd.getTime();//时间差的毫秒数
  var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000))//计算出小时数
  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000))//计算相差分钟数
  //计算相差秒数
  var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
  var seconds = Math.round(leave3 / 1000)

  var timeFn = hours + ":" + minutes + ":" + seconds;
  return timeFn;
}


function getAuthorShareCode(url) {
  return new Promise(resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 10000, headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      const tunnel = require("tunnel");
      const agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (data) data = JSON.parse(data)
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getToken(timeout = 0){
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `https://bh.m.jd.com/gettoken`,
        headers : {
          'Content-Type' : `text/plain;charset=UTF-8`
        },
        body : `content={"appname":"50085","whwswswws":"-a45046de9fbf-0a4fc8ec9548a7f9","jdkey":"${uuid}","body":{"platform":"1"}}`
      }
      $.post(url, async (err, resp, data) => {
        try {
          data = JSON.parse(data);
          joyToken = data.joyytoken;
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://wq.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2",
      headers: {
        Host: "wq.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 1001) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === 0 && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
var _0xodB='jsjiami.com.v6',_0x1d0f=[_0xodB,'PMOZwpvDqFU=','ZMO8wqPDkEQ=','Sn9FwqzDoA==','IF4WAB8=','biE3TRE=','w5DDt8KkwpUl','wqBgbADCgw==','BMO/wr3Djns=','b8OmwrzCizE=','w7zCs8OVwpDCvw==','Z8OPQ1bDnFs=','aWJ7Dg==','wrtTwp9ndw==','w5IUHcKwXg==','wrjDj8ONRw4=','FcKZwoJmw6Y=','wojCvMOaw4B3','w4AQFMOCw5U=','w63DuHfDoMO0w6XDsQ==','w4LDoMK4bsOV','C8OVw5Uiw5s=','eMKFblV6','w6zDucKXU8O0','wrDChz7Cl8KQ','bXhbEsOVL8Ocw4I=','ZcKgfATCrQ==','wowCQ8OJRA==','WCAxYzc=','wpLCmcOJw5o=','w6PCicK2TCg=','wp7CqcK/w7JBwpzDhTrDgw==','w5nCncKoWhw=','wr7Dh1LDqXU=','fMKGVizCqg==','dk7CnUHDkA==','A8KRw4PCp8OU','G8OnTTLCng==','wpXChQXCvcKt','w6wWEsKvRjI=','w4DDnMOrw7XDkg==','w7xfwqQjOw==','b05iwo/DmQ==','w5HDhcKFwrcr','wrdnw7M7bBvDuVbClw==','WT8QdTE=','woNuFcOHwro=','wo1+ZMK/w50=','E8OMw59nwqQ=','IcKDwpV3w5w=','wqo1SMOBXg==','wqADbMONZQA0I0LDriTDohMiMmTClcKz','w5TCuMOLwpTCgw==','wpN8T8KPw6/CsA==','wrvDrsOjTSU=','a8KdJMK9Sg==','w4l0wqMgCQ==','LsK8w7vCl8Oc','YcOwwpLCihc=','cgF/wr1e','HcO5wpnDiE0=','wplvesO0w5VDGg==','wrzCuxTCpMK2wrzCr8O5','en4QwoYewqVpw509J1JsWw==','CcOywq7DnVAiDm0RDsK6FMOD','wrMCw5zCjB0=','w6fCrHDDoDY=','CMOkwrTDi1cEFF0RE8Kh','w6XCnsOMw5s5','R8KPF8KIXQ==','ScK4dm9Y','woFzJmjCuQ==','TMK7dH5C','wpFuPHTChw==','w7HDpHcHZzA=','wpEbXMOAZQ==','XFrCsFzDmg==','w7NMV8OPw5U=','eFtpwqbDhA==','w7YmBMKxYw==','w6UFEcKSYA==','w57DhhnDqD0=','WcKGbXVQw5nDgsKqesOE','w7nDssK/dMOU','ZUtmwp/DhA==','wq10aQvClA==','U15lM8Oy','JsORRx7Cjg==','wqtKwpTDtn8=','SsKbf28=','wrl6woVZbg==','K8Okw78qw7w=','N1ocDCk=','woRHwoV2','JMOMTxjCuQ==','worCgcOVw6Vu','woFZwrHDt0LDrA==','AcKMaMKMHQ==','cUUcwqkq','DsOWfxM=','eXlGwpPDtw==','w4/Dq3UjQA==','LsK9w4XCjE4=','ZAAJTx0=','H8Orw713wrw=','Y8O+T2jDuQ==','IsOtw4nCkw==','w6nCgWbDvB0=','JsOGw7Apw78=','wprDncOfVw==','w6EbF8KQRg==','AsKJw5HCgcO3','Z8OSSUTDgg==','w7nDgGwlUQ==','w7HCjcK0dzk=','aWQNwpg=','wqFSwrPDkH4=','w4N1wpIGLw==','w7PClmLDhhw=','ZMObwrfDt1M=','wogiQsOPRg==','XMKrXSLCsw==','wok8w67CsQ==','PcOsw7lxwqA=','w5/ClcO2wqDCnw==','G8OCwo3Dvmo=','YcOkeHXDig==','wrFcwqVfTA==','w4jDs8KgwrQo','OcKkw47ClMO3','CsOEwoLDm2w=','w4bDncKrbcOO','CcOQw6cew4c=','wrZZI8OG','w7jDsDXDjS8=','NMOqSD3CtA==','w4hsfcOcw4k=','w55swpYjIg==','wqkPw7/CnCQ=','w6fClMOqw7gg','w7zCisOgwrnCpw==','w7bCukjDnQQ=','wrnCsRPChsKt','ZwBWwoxl','LcOOCSUq','csK9N3DDi8OcZMO/wo7Cnn5y','TsKyQxDCkA==','wqxbRwHCqQ==','GzPDpcKvwoo=','WcORKHTCscKYdcOMw4XDjlB0w73ChMKhwqdiw5l/w4g=','w6Isw6xyFUvCi3jCiztkw4xrwrHCnMObacOnOQM=','wp7Do8K/wrhIw5fDgXPDiMKzw73CusKAOcKCfTo=','esOhwpbDh0U=','w7zCncORwpXCnMKjwr0w','w67CtGLDuU53wpvDv8KzPgFOw73Dv3fDn3TDrnLDoSTChMONciHCn1llIG97w5s=','ccKNazTChMKUVcO/wpvCmH5xw6U=','RD3CpMO0w57Cu8KjwrvCoG3CqiAmacKLUcOSw6bCqsKIw4fCqsOJwr7CsVU+wrc+wqQ=','DcOLVcODAkZQwq/CjGATczDCnMK4w71bw4zDhsOTZVvCrMOJDA==','wq3Dh8ODWA7DvUTCjcKiwqRa','ISlLw4ZC','G8KCwqPDmA==','w57DrcKnwpESRMOK','wodST8K1wqJ+','BcK9wodrw7cvwrTCrg==','w4FRT8K0wqJ8','IMO5w5TCn8KUMcOb','P8Kjw5DChQjCvsOmw5/CqA3CtmnDsDlbfcKgAhDDjMK8BlI1wqrDjcKVU8K7XsKJOsOtQ8OQchVMw4nCh8OfenPCr8OKwovChlzCrmzClmHClMOJw5HCryrCs8KhMQcjw7XDtw1IAsKZTQVnwobDpF5ow7F/wpPDjMKse8OFTUgJG8Kpw6tzwpnDjcO2w5fCssOnP8K4N8O0wpFqwqrDmw1RbUEOwqUEw5HCmcOUwpTClcKJwpnCmg3CocOBQcKCNVE+w6jCqsKmGsK1w54FFRxOCWbCm05OB8OlP0HDicOEEBJPcC8=','w4o1Ew==','SD8LeDTDkQ==','w7wSHsKrVj/CtxJI','GznDoMKtwo/DrMOw','I8OLw71KwoA=','woTDh8Ob','JMOUw4JXwobDs8KhwoI=','HcOpwqzDn2Y=','egcEUyM=','w7vDrXYPYQ==','AE40Hwk=','SUs3wp85','IsOaw79HwpvDtw==','w4vDrMKQwpcPRMOAZg==','w5grN8OOw6I=','w5xSwoUFIg==','w6gaJMKJRA==','ahl7wp5z','I8Ovw6/CtMKp','IsO4w5U6w58=','a3AQwpQUwro=','w57DmR7DuyM=','wpvDscOvbhA=','w6d1XcOgw6g=','eQETWRE=','b8OSwoHCsA4=','wplTwoY=','w5PDgsOiw4/Dj2jDvlI=','QMKpYVRL','D8K+wo9qw6Uh','S2HCuW3DuA==','wq06w47Cqjw=','wpHCm8OIw5t8','BcORw4gow4k=','wphXwph5T8O9','w5XDrMKqwo0=','AcKQc8Ka','M8O9w7/CjMKv','cxB9wrBFbcKH','RcKvwo5mw7Qnw70=','wqYHFcKlV2c=','NWTCs2bDscKqUynCjVjDnQ==','WMOIaQLDoQ==','w4zDgcOfYBbDqhHCt8K4w7pF','MTXDk8Kqwpo=','F8K0wrJ5w6Mgwq7CvQ==','TsKBWXdjw5PDlMKMWsODwoA=','wr/CpsOIw5B1','w4zCpkfDlzU=','HT3DvcKxwqs=','wpDCjQzCm8KM','RGV1wobDjg==','DcO3w5gjw54=','TxtewpBT','GMOrw6oyw4A=','UsKsT0xw','w4TCgFXDkAA=','wrd6wpLDplk=','wqZRTRfCvg==','L8OIwr7DgnU=','wr4lQMOqYg==','IQzDqcKGwos=','VXgZwqgc','wplSecOfw5A=','wpMMw6TCvC0=','w6vCoMOlw7cJ','w4/DlcKOwo4K','w6fCkMO/w6g5','asOawq7CjBM=','F8Ohw53Ct8K4','RQR7wq1S','T8OfRUjDkA==','DcK0wpY=','Zx18wrtY','aGNSwr/Dow==','w6g6CMKKQQ==','w4tzTcO/w65Kw6/Ckg==','bxQLXy0=','UGPCuFvDnw==','woBwRyLCkA==','w5nCksOBwrLCpQ==','McO3w5TCmMKaKA==','wrhfIX7CrQ==','wpMBw7DCtBw=','Qhh3wodn','V8KsaCzCtQ==','wrBRwrvDgGA=','C8Kbw7TCncOE','wrdbwpJNdg==','w6vCnWnDiAU=','LEUfFSbCkg==','eULCsWXDmw==','wrt1XMOew6w=','w7fDiXQNWg==','ecKHaFRe','H8OUw67CrMKy','ScKpWFVp','YMKPNMK3dnfDlMOTw5g=','ZwN8wrlpaMObwqJww4Ngw6w=','IcOsw4jCksKVO8KPbcKx','PMOew79EwoDDsg==','McO5wo3DqW0=','YsOwwozDlEXDoQ==','w6AhJsOKw7o=','THdnwp3Dnw==','SDgEaRbDisKBwqY2w7M=','DsK2wqVPw4E=','CMOjwrvDimAZBVskCA==','Y8OHwozCjjY=','UsKWa3Ji','w6ZvWcO6w60=','wrJ6wpzDl2jDh0rCqcOdw6XDtmfDusOrN8KrwoAte2NPCQ5RTcODD09zakLDrQx3w407N0TCg8K1wr1yAsKBRsKtc1zDgmtpwocSXx9Dwo7DvHoRwrBIB8OBw4o=','wr3CnMOIw7VE','wq7DhMODchY=','wqfCmcOqU33CtcK1cMKlwp0Dw5/CiDnDmWNW','wo5oKsO3wrU=','RMK+KMKmfA==','dMKbV3prZA==','wr5KfMOUw7Y=','wp13YsO+w5E=','wojDoVnDuVQ=','PcOfwr7DrEw=','woxpTcKBw68=','AMKzwoB/w5ImwqTCv8OUNQ==','wpBhRxzCqg==','O3o2PAE=','wqJhwqXDhm4=','dMKUS2lK','YcK/U3d6','AsK6w7jCn8OB','d8OUwojDmVQ=','wpNXcMKBw6o=','dVlZD8OW','wqHDuW/DqXA=','Z8OkfFjDmQ==','wqVEMcOcwr1R','w5UKAMO3w404','aMOXworCiQbChw==','wpxxQMKaw5rCrA==','en9pFMOkKcOWw4DCnH0=','WkbCm0HDpQ==','w7HDucKEwo0k','HxPDp8KVwqg=','w6fDiCTDlCo=','w5zDq8KiwpE+QsOKZGME','wpDCvsOSw7p/','RzU1dhA=','wq3CvTTCuA==','dR5AwqBYacOUwrc=','KMOTworDoVM=','w7VuwqM0LBXCo0TDgA==','w7LCoGbDljgawo/DksOz','wrdTTcOrw7M=','dXJmAcOTLg==','wr/Dkm7DukI=','w4PCsMOjw6kFwog=','w6rCjUfDtSs=','L8OWXivCkA==','TFhWwqzDmg==','SVNnIsOk','asKqY0NQ','YMKLKsK3bA==','ZsOLXQ==','e8KWWG9cY3DCpirDnA==','wqHCl8O4w4Fa','cmZGM8OC','cGLCvXrDkcKgaD/CuF4=','wpohw7zCqxZlBwPCpmc=','w63CsGrDgjgA','VMKYDMKGcg==','SMOyfWjDmA==','wot2csKcw6nCscKRwrU=','w4QHEcOpw60vw6w=','PcOpw5LDjwDDtcOiwpbCrQ==','A8OLw5ADw78=','PFodHzM=','w6/DmMO8w5XDmA==','wpJyVcOjw7g=','TD9YwrFB','woFKFcOgwpE=','RUHCkl7DkA==','w6zDicKbW8Oo','w6xawpA9Cg==','w6k0DMKtdQ==','dsKHV2RJ','fntVwqTDgA==','LlkzDzPCg1Q=','w7HClsKMWz/CoMOjaw==','HcOMYg3CuRPCvx7CswpIRxU=','w4XDlMOFw57DjlXDv2ZFw77DlMKpPg==','IcOYw5Zmwpk=','KcK3wo14w5I=','LEUfBTPClFLDmQ3DjXg=','wol/f8OIw4w=','wp50dsKQw5M=','OsKuw63Ch1Zj','w6TDlw/DuAA=','w6vDsm8JQg==','w7nDsyDDsys=','WCAJciE=','w7fCmsOV','wqVEMcOcwr9KQETCtyM=','BsOqwqo=','wp0CScOYewA+ZA==','R8KNJ8KpTg==','DcK2w7fCl8O5wqA=','Q8OPwrfDvnc=','IMK7w6HCqVA=','WsO3wrvCuCA=','wq/DjMOibSM=','OsOUw7hN','wpMmw7TCtw==','wqN2bCXCrg==','UcKBaybCiMOc','wrIww7nCuw8=','wqzDuk/DqVU=','wo0Ya8OAfg==','SX8swqg+','WcO3w6rDhBcKVkJUAMOrBsKRw5lmwo9U','PVoBBz4=','OMOzwp/DiFE=','woh+I0nCoQ==','cxs9eDM=','wo9qdcKmw7M=','LGgJBAU=','J8OAw5s4w6U=','wozCmsOJw7hI','w4vDrsK5wpUb','w4IJMsKDRA==','wrrCjMOuw79Z','wrrDmU3DqnE=','BcKTw5PCimY=','EcKFw43CkW4=','JsKdw5fCgcOB','wot0W8Kew70=','wp1WWSXCqQ==','HTHDqsK3wog=','wooqfcOBRA==','wqsfw6nCljY=','ClgAFQg=','YlvCsXvDqg==','w4UTE8Ox','HcKOa8K8EQ==','w7jDqD7DiQA=','ZcKwSxnCig==','wpxnwp9tdA==','wp7Cm8Otw4xV','w49zaQ==','G8Oiw4gUw68=','SsKOFMK9fA==','w7tEZsOYw70=','wodCwpp3Tw==','wonDgMONTSHDtwDCocKNwrM=','N8OUw5/CgsKT','w7nDkF0OSg==','JsOiaTfCmA==','AMKRw7vCjWQ=','cMKTJ8KsW3/DmcOQw6DDnQ==','RyBLwrZe','w7LCv8Onwq7CrQ==','w5x0f8O5w59Mw6XCkMO7aQ==','csKaT2Vs','w7vCn8Kdahc=','wpfCmQLCmcK0','wrFnAGTCkA==','YsKNe2pG','wpBQwr7DoWzDtQ==','wpheJF/CocKb','w5x0f8O5w51X','wpohw7zCqxR+','wplqT8OHw60=','w4LDocOUw4LDlQ==','wo7DucOoUTs=','X8KLE8Kqew==','w7PDgMK9fsOF','w57ChMOgw70J','SsKZNcKVdA==','Z0hcwq7DnQ==','w53CtcOrwpDCpA==','w5nDrsKOwpsH','f3wzwogB','VmFQFcOD','wqVOcjzCvQ==','R8OTwq/CsDU=','SkRXwp/Dmw==','PjXDg8KiwqM=','woJ5YMOfw6o=','ccKscFVU','TX1MEsOh','w7rDrsKCbsO3','AsKtU8K8HQ==','P8Ohwp7DjGU=','U1txwrbDng==','w6bDpsKXRMOG','WMOWwq7Dtl4=','GWk9Myg=','w5V4wpsPHQ==','WcK4AcK/XA==','wpXCsMOpw5tA','OnwmJQ8=','AVwEPA8=','c8KScAvCtA==','ISzDqMKswoE=','wqV7wpPDlkI=','wovCiwvClcKr','w4vCksO9wrLCgw==','H8O7w4ojw4U=','ejk9SD4=','E8KBw7XCj08=','w4rDiiDDtRc=','wr58M0LCjQ==','PRLDksKywo8=','w6fDoxvDuR0=','wr1owoV9aA==','O8Kgw5vCncO5','IcOJw7nCvMKx','w5TCjcOQwqvCoA==','YMO5T0HDhg==','wqhqfj7CjQ==','AcOHwrPDsko=','O8Oow7NTwpo=','FMKZw5fCkXY=','EcOSwpnDjnI=','Rx4MUCA=','CMOlw4gfw6k=','YxpSwodj','wr1jC27Ciw==','VcKlaHVg','w4XCk8KOQyw=','d8K1XW9s','woHDu3rDqmc=','c1ctwpcc','J8KUwqh+w5k=','w6pqT8Onw70=','wo/DpWrDsVU=','w6fDmFoWQg==','w4YQAsOcw48=','w5/Dk00RRw==','JMKzw7vCkEE=','PWg3Gyk=','wrLCoxbCssKV','GcOzwqLDiEA=','w7RZwocqNg==','w49IwoQtNA==','YcK5AMKzdg==','CcOwWA3Ckg==','w7zCqsK3fBo=','wrF/BMOYwrI=','WEJ+PMOr','woRrwovDpWM=','KjsjiafmtIhi.RtKDJETcoMmUw.v6=='];(function(_0x281e6a,_0x32a08c,_0xd808f8){var _0x5a8b05=function(_0x14f176,_0x40ec5c,_0x38fae8,_0x1cffad,_0x3a2013){_0x40ec5c=_0x40ec5c>>0x8,_0x3a2013='po';var _0x12e62f='shift',_0x14917f='push';if(_0x40ec5c<_0x14f176){while(--_0x14f176){_0x1cffad=_0x281e6a[_0x12e62f]();if(_0x40ec5c===_0x14f176){_0x40ec5c=_0x1cffad;_0x38fae8=_0x281e6a[_0x3a2013+'p']();}else if(_0x40ec5c&&_0x38fae8['replace'](/[KftIhRtKDJETMUw=]/g,'')===_0x40ec5c){_0x281e6a[_0x14917f](_0x1cffad);}}_0x281e6a[_0x14917f](_0x281e6a[_0x12e62f]());}return 0x99b37;};return _0x5a8b05(++_0x32a08c,_0xd808f8)>>_0x32a08c^_0xd808f8;}(_0x1d0f,0x8f,0x8f00));var _0x2c52=function(_0x1196c6,_0x44e6fa){_0x1196c6=~~'0x'['concat'](_0x1196c6);var _0x2490e8=_0x1d0f[_0x1196c6];if(_0x2c52['fiOxQt']===undefined){(function(){var _0x527750=function(){var _0x264467;try{_0x264467=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x256e58){_0x264467=window;}return _0x264467;};var _0x4cab0c=_0x527750();var _0x14f178='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4cab0c['atob']||(_0x4cab0c['atob']=function(_0x1eba85){var _0x1039ed=String(_0x1eba85)['replace'](/=+$/,'');for(var _0x39b447=0x0,_0xcd84,_0x2096cf,_0x43e664=0x0,_0x41bbb3='';_0x2096cf=_0x1039ed['charAt'](_0x43e664++);~_0x2096cf&&(_0xcd84=_0x39b447%0x4?_0xcd84*0x40+_0x2096cf:_0x2096cf,_0x39b447++%0x4)?_0x41bbb3+=String['fromCharCode'](0xff&_0xcd84>>(-0x2*_0x39b447&0x6)):0x0){_0x2096cf=_0x14f178['indexOf'](_0x2096cf);}return _0x41bbb3;});}());var _0x5a55a3=function(_0x585166,_0x44e6fa){var _0x3ff8df=[],_0x5b9b89=0x0,_0x43bca1,_0x364286='',_0x8196ed='';_0x585166=atob(_0x585166);for(var _0x577834=0x0,_0x5e15e6=_0x585166['length'];_0x577834<_0x5e15e6;_0x577834++){_0x8196ed+='%'+('00'+_0x585166['charCodeAt'](_0x577834)['toString'](0x10))['slice'](-0x2);}_0x585166=decodeURIComponent(_0x8196ed);for(var _0x3f8b6f=0x0;_0x3f8b6f<0x100;_0x3f8b6f++){_0x3ff8df[_0x3f8b6f]=_0x3f8b6f;}for(_0x3f8b6f=0x0;_0x3f8b6f<0x100;_0x3f8b6f++){_0x5b9b89=(_0x5b9b89+_0x3ff8df[_0x3f8b6f]+_0x44e6fa['charCodeAt'](_0x3f8b6f%_0x44e6fa['length']))%0x100;_0x43bca1=_0x3ff8df[_0x3f8b6f];_0x3ff8df[_0x3f8b6f]=_0x3ff8df[_0x5b9b89];_0x3ff8df[_0x5b9b89]=_0x43bca1;}_0x3f8b6f=0x0;_0x5b9b89=0x0;for(var _0x227c63=0x0;_0x227c63<_0x585166['length'];_0x227c63++){_0x3f8b6f=(_0x3f8b6f+0x1)%0x100;_0x5b9b89=(_0x5b9b89+_0x3ff8df[_0x3f8b6f])%0x100;_0x43bca1=_0x3ff8df[_0x3f8b6f];_0x3ff8df[_0x3f8b6f]=_0x3ff8df[_0x5b9b89];_0x3ff8df[_0x5b9b89]=_0x43bca1;_0x364286+=String['fromCharCode'](_0x585166['charCodeAt'](_0x227c63)^_0x3ff8df[(_0x3ff8df[_0x3f8b6f]+_0x3ff8df[_0x5b9b89])%0x100]);}return _0x364286;};_0x2c52['MDOEls']=_0x5a55a3;_0x2c52['RkIhNj']={};_0x2c52['fiOxQt']=!![];}var _0x39f43a=_0x2c52['RkIhNj'][_0x1196c6];if(_0x39f43a===undefined){if(_0x2c52['EsRtRM']===undefined){_0x2c52['EsRtRM']=!![];}_0x2490e8=_0x2c52['MDOEls'](_0x2490e8,_0x44e6fa);_0x2c52['RkIhNj'][_0x1196c6]=_0x2490e8;}else{_0x2490e8=_0x39f43a;}return _0x2490e8;};function getBody(_0x5c3903){var _0x10a4bd={'QYHaY':function(_0x45c9a6,_0x22c431){return _0x45c9a6>_0x22c431;},'qYCQr':function(_0xbecae9,_0x53bc9f){return _0xbecae9+_0x53bc9f;},'XiCkt':function(_0x9374bf,_0x43ba55){return _0x9374bf(_0x43ba55);},'RQvBD':function(_0x38b2c8,_0x58e004){return _0x38b2c8+_0x58e004;},'dmjKI':function(_0x33d935,_0x183b52){return _0x33d935-_0x183b52;},'vbvgE':_0x2c52('0','Jze@'),'QWaHv':_0x2c52('1','Z[^%'),'OdEiN':function(_0x142b3b,_0x1ecf1f){return _0x142b3b+_0x1ecf1f;},'PZIoB':function(_0x21a7eb,_0xe74766){return _0x21a7eb*_0xe74766;},'nIVKn':function(_0x3f836e,_0x46151d){return _0x3f836e<_0x46151d;},'ZIDBz':function(_0x290f7f,_0x28850f){return _0x290f7f!==_0x28850f;},'hiXAv':_0x2c52('2','Z[^%'),'khhJY':_0x2c52('3','64jp'),'qwUOR':_0x2c52('4','(LOl'),'ljGJq':function(_0x4cdf70,_0x583b17){return _0x4cdf70*_0x583b17;},'aeEwT':function(_0x1314f5,_0xadec22,_0x54b632){return _0x1314f5(_0xadec22,_0x54b632);},'GPhdZ':function(_0x578cc9,_0x4418d4){return _0x578cc9(_0x4418d4);},'MsCry':_0x2c52('5','Z[^%'),'tampE':_0x2c52('6','VABv'),'MEKKH':_0x2c52('7','$K@r'),'YHqzX':_0x2c52('8','3rxq'),'CeJSp':_0x2c52('9','NsH8'),'NjMDy':_0x2c52('a','dCuC'),'VyxBn':_0x2c52('b','Z[^%'),'hBCKc':_0x2c52('c','(LOl'),'EUQuL':_0x2c52('d','e9kP'),'DBMut':_0x2c52('e','epvv'),'LigXg':_0x2c52('f','PI3P'),'DCdzV':_0x2c52('10','Vby['),'WHZFk':_0x2c52('11','%Uh$'),'HPyGe':_0x2c52('12','5AHr'),'aNARq':_0x2c52('13','vuGg'),'jEyex':_0x2c52('14','5AHr'),'Duhyx':function(_0x1bae2a,_0x29b414){return _0x1bae2a+_0x29b414;},'pVMmw':_0x2c52('15','yAXd'),'HErfH':_0x2c52('16','3rxq'),'EygLC':function(_0x21c568,_0x1c886d){return _0x21c568(_0x1c886d);},'uNVCu':function(_0x52f4cd,_0x218c53){return _0x52f4cd+_0x218c53;},'hItBs':function(_0x2cabb7,_0x2cc8fb){return _0x2cabb7*_0x2cc8fb;},'DDnDx':_0x2c52('17','$PD5'),'CidSM':_0x2c52('18','3ve5'),'jHmmI':_0x2c52('19','DVA('),'MLTWI':_0x2c52('1a','(LOl')};let _0x4fde32=_0x5c3903[_0x2c52('1b','*!&A')](';')[0x4];let _0xfde1c9=Date[_0x2c52('1c','epvv')]()[_0x2c52('1d','*!&A')]();let _0x4b8814={'appid':_0x10a4bd[_0x2c52('1e','bFIi')],'ids':[],'sceneid':_0x10a4bd[_0x2c52('1f','3ve5')],'uid':uuid};let _0x3ac0c5=Math[_0x2c52('20','f)%V')](_0x10a4bd[_0x2c52('21','iLXO')](0x989680,_0x10a4bd[_0x2c52('22','PI3P')](0x55d4a80,Math[_0x2c52('23','*!&A')]())))[_0x2c52('24','%Uh$')]();let _0x41b7cd='';let _0x175e44=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];for(let _0x4fd814=0x0;_0x10a4bd[_0x2c52('25','5AHr')](_0x4fd814,0xa);_0x4fd814++){if(_0x10a4bd[_0x2c52('26','VABv')](_0x10a4bd[_0x2c52('27','DVA(')],_0x10a4bd[_0x2c52('28','@r)e')])){_0x41b7cd+=_0x175e44[Math[_0x10a4bd[_0x2c52('29','yAXd')]](_0x10a4bd[_0x2c52('2a','i]!7')](Math[_0x2c52('2b','PI3P')](),0x3d))];}else{var _0x2484e0={'zGmSX':function(_0x4b64c1,_0x138468){return _0x10a4bd[_0x2c52('2c','dCuC')](_0x4b64c1,_0x138468);},'Xkeej':function(_0x1c05d8,_0x3f1d69){return _0x10a4bd[_0x2c52('2d','epvv')](_0x1c05d8,_0x3f1d69);},'TsSsi':function(_0x3a4ee4,_0x198871){return _0x10a4bd[_0x2c52('2e','LlZw')](_0x3a4ee4,_0x198871);},'imhoS':function(_0x59e55f,_0x51a533){return _0x10a4bd[_0x2c52('2f','3ve5')](_0x59e55f,_0x51a533);},'KCZXg':function(_0x4b872f,_0x51439d){return _0x10a4bd[_0x2c52('30','$(gp')](_0x4b872f,_0x51439d);}};return _0xb1ee78[_0x2c52('31','4Sdp')](function(_0x4dca55){return _0x2babfa=_0x4dca55[_0x2c52('32','b!4Q')](0x10),_0x4dca55=0x2,_0x2484e0[_0x2c52('33','*hfU')](_0x2babfa[_0x2c52('34','vuGg')],_0x4dca55)?_0x2babfa:_0x2484e0[_0x2c52('35','wN$9')](_0x2484e0[_0x2c52('36','Z2Ur')](Array,_0x2484e0[_0x2c52('37','^q0S')](_0x2484e0[_0x2c52('38','i]!7')](_0x4dca55,_0x2babfa[_0x2c52('39','4Sdp')]),0x1))[_0x2c52('3a','%Uh$')]('0'),_0x2babfa);var _0x2babfa;})[_0x2c52('3b','e9kP')]('');}}let _0x269870=_0x10a4bd[_0x2c52('3c','yAXd')](getKey,_0xfde1c9,_0x41b7cd);let _0x2ed8e0=_0x2c52('3d','@r)e')+_0x3ac0c5+_0x2c52('3e','vuGg')+joyToken+_0x2c52('3f','DVA(')+_0xfde1c9+_0x2c52('40','wN$9')+_0x41b7cd+_0x2c52('41','bAWe')+_0x269870+_0x2c52('42','epvv');let _0x5bc7be=_0x10a4bd[_0x2c52('43','(LOl')](getSign,_0x2ed8e0)[_0x2c52('44','vuGg')]()[_0x2c52('45','*hfU')]();let _0xb920d3=_0x10a4bd[_0x2c52('46','^q0S')](getCrcCode,_0x5bc7be);let _0x12bc47={'tm':[],'tnm':[_0x10a4bd[_0x2c52('47','mEzA')],_0x10a4bd[_0x2c52('48','(LOl')]],'grn':0x1,'ss':_0x10a4bd[_0x2c52('49','FOBd')],'wed':_0x10a4bd[_0x2c52('4a','dSN0')],'wea':_0x10a4bd[_0x2c52('4b','i]!7')],'pdn':[0xd,0xa4,0x5,0x7,0x1,0x5],'jj':0x1,'cs':_0x10a4bd[_0x2c52('4c','@r)e')],'np':_0x10a4bd[_0x2c52('4d','i]!7')],'t':_0xfde1c9,'jk':_0x10a4bd[_0x2c52('4e','*hfU')],'fpb':_0x10a4bd[_0x2c52('4f','mEzA')],'nv':_0x10a4bd[_0x2c52('50','NitO')],'nav':_0x10a4bd[_0x2c52('51','64jp')],'scr':[0x332,0x189],'ro':[_0x10a4bd[_0x2c52('52','bFIi')],_0x10a4bd[_0x2c52('53','&f!p')],'9',_0x10a4bd[_0x2c52('54','(LOl')],_0x10a4bd[_0x2c52('55','PI3P')],_0x4fde32,'1'],'ioa':_0x10a4bd[_0x2c52('56','Hu[U')],'aj':'u','ci':_0x10a4bd[_0x2c52('57','Z2Ur')],'cf_v':'01','bd':_0x10a4bd[_0x2c52('58','$K@r')](_0x10a4bd[_0x2c52('59','%Uh$')],_0x3ac0c5),'mj':[0x1,0x0,0x0],'blog':_0x10a4bd[_0x2c52('5a','$K@r')],'msg':''};let _0x3274e5=_0x10a4bd[_0x2c52('5b','$(gp')](xorEncrypt,_0x12bc47,_0x269870);let _0x371d33=_0x10a4bd[_0x2c52('5c','yAXd')](getCrcCode,_0x3274e5);let t=_0x10a4bd[_0x2c52('5d','@r)e')](_0x10a4bd[_0x2c52('5e','*UL$')](Date[_0x2c52('5f','vuGg')](),''),Math[_0x2c52('60','@r)e')](_0x10a4bd[_0x2c52('61','dSN0')](0x3e8,_0x10a4bd[_0x2c52('62','DVA(')](0x2327,Math[_0x2c52('2b','PI3P')]())))[_0x2c52('63','LlZw')]());let _0x436540=_0x10a4bd[_0x2c52('64','3ve5')];let _0xb1ee78='C';let _0xc1b234=0x1;var _0x2fedd3=(_0x2fedd3=''[_0x10a4bd[_0x2c52('65','wN$9')]](_0xfde1c9,_0x10a4bd[_0x2c52('66','64jp')])[_0x10a4bd[_0x2c52('67','NsH8')]](_0xc1b234)[_0x2c52('68','yAXd')](_0x41b7cd)[_0x10a4bd[_0x2c52('69','So*0')]](joyToken,_0x10a4bd[_0x2c52('6a','Z2Ur')])[_0x10a4bd[_0x2c52('6b','@r)e')]](_0x436540,_0x10a4bd[_0x2c52('6c','Z[^%')])[_0x10a4bd[_0x2c52('6d','NitO')]](_0x5bc7be,_0x10a4bd[_0x2c52('6e','3f#n')])[_0x10a4bd[_0x2c52('6f','4Sdp')]](_0xb920d3,_0x10a4bd[_0x2c52('70','mEzA')])[_0x2c52('71','iLXO')](_0xb1ee78,_0x10a4bd[_0x2c52('72','wN$9')])[_0x10a4bd[_0x2c52('73','Hu[U')]](_0x3274e5,_0x10a4bd[_0x2c52('74','f)%V')])[_0x10a4bd[_0x2c52('75','*hfU')]](_0x371d33))[_0x10a4bd[_0x2c52('76','yAXd')]](/\|abcdefg\|/g,'~');_0xc1b234++;let _0x1eb975={'extraData':{'log':_0x2fedd3,'sceneid':_0x10a4bd[_0x2c52('77','Jze@')]},'random':_0x3ac0c5};return JSON[_0x2c52('78','2][u')](_0x1eb975);}function xorEncrypt(_0x1a6759,_0x319247){var _0x5e82c5={'ZrWQN':function(_0x33e566,_0x4e4c9d){return _0x33e566<_0x4e4c9d;},'VCGOv':_0x2c52('79','@r)e'),'QZcaI':function(_0x547bb1,_0x4a7d6a){return _0x547bb1^_0x4a7d6a;},'mmDBP':function(_0x95b79e,_0x235f31){return _0x95b79e%_0x235f31;},'hxguq':function(_0x18e70e,_0x3687cc){return _0x18e70e(_0x3687cc);},'YsGqq':function(_0x48fd59,_0x1e95dc){return _0x48fd59(_0x1e95dc);}};_0x1a6759=JSON[_0x2c52('7a','yAXd')](_0x1a6759);for(var _0x25a6ab=_0x319247[_0x2c52('7b','*!&A')],_0x3a5856='',_0xd0c146=0x0;_0x5e82c5[_0x2c52('7c','bFIi')](_0xd0c146,_0x1a6759[_0x2c52('7d','3rxq')]);_0xd0c146++)_0x3a5856+=String[_0x5e82c5[_0x2c52('7e','5AHr')]](_0x5e82c5[_0x2c52('7f','dSN0')](_0x1a6759[_0xd0c146][_0x2c52('80','3ve5')](),_0x319247[_0x5e82c5[_0x2c52('81','vuGg')](_0xd0c146,_0x25a6ab)][_0x2c52('82','bFIi')]()));return _0x5e82c5[_0x2c52('83','$(gp')](encode,_0x5e82c5[_0x2c52('84','*hfU')](unescape,_0x5e82c5[_0x2c52('85','LlZw')](encodeURIComponent,_0x3a5856)));}function encode(_0x4371ad){var _0x182010={'HDzYI':_0x2c52('86','NitO'),'WEnxd':function(_0x323586,_0x23b517){return _0x323586<_0x23b517;},'FVDYW':function(_0x49926a,_0x14835d){return _0x49926a===_0x14835d;},'ekZsp':_0x2c52('87','^q0S'),'EVgyU':_0x2c52('88','epvv'),'VTdTo':_0x2c52('89','MvbD'),'zYmSs':function(_0x17be08,_0x4abe91){return _0x17be08(_0x4abe91);},'tPGJF':function(_0x2ba2f4,_0x3de6eb){return _0x2ba2f4(_0x3de6eb);},'QYzUC':function(_0x757d18,_0x398aee){return _0x757d18|_0x398aee;},'NzGnY':function(_0x43f98f,_0x46aa08){return _0x43f98f<<_0x46aa08;},'yAjje':function(_0x4f4360,_0x3c4237){return _0x4f4360&_0x3c4237;},'ciaoL':function(_0x11494c,_0x53cfa9){return _0x11494c>>_0x53cfa9;},'lNQiq':function(_0x26839a,_0x2315b3){return _0x26839a+_0x2315b3;},'ILGIw':function(_0x96f626,_0x203c90){return _0x96f626|_0x203c90;},'vOwTF':function(_0x2b16dc,_0x3831a1){return _0x2b16dc&_0x3831a1;},'hHrNP':function(_0x5bd4a7,_0x3e920d){return _0x5bd4a7>>_0x3e920d;}};let _0x1efa78=_0x182010[_0x2c52('8a','XSgs')];let _0x20827c='';let _0x30d7bf,_0x52e39e,_0x354d04,_0xdfcfb1,_0x4b07ad,_0x1ee9c7,_0x1c7f46;let _0x3ae84c=0x0;while(_0x182010[_0x2c52('8b','2][u')](_0x3ae84c,_0x4371ad[_0x2c52('8c','Jze@')])){if(_0x182010[_0x2c52('8d','Hu[U')](_0x182010[_0x2c52('8e','Hu[U')],_0x182010[_0x2c52('8f','veL*')])){_0x1ee9c7=_0x1c7f46=0x40;}else{var _0x3f30bb=_0x182010[_0x2c52('90','bFIi')][_0x2c52('91','$PD5')]('|'),_0x5c47db=0x0;while(!![]){switch(_0x3f30bb[_0x5c47db++]){case'0':_0x354d04=_0x4371ad[_0x2c52('92','vuGg')](_0x3ae84c++);continue;case'1':if(_0x182010[_0x2c52('93','64jp')](isNaN,_0x52e39e)){_0x1ee9c7=_0x1c7f46=0x40;}else if(_0x182010[_0x2c52('94','iLXO')](isNaN,_0x354d04)){_0x1c7f46=0x40;}continue;case'2':_0x4b07ad=_0x182010[_0x2c52('95','NitO')](_0x182010[_0x2c52('96','*hfU')](_0x182010[_0x2c52('97','Jze@')](_0x30d7bf,0x3),0x4),_0x182010[_0x2c52('98','3f#n')](_0x52e39e,0x4));continue;case'3':_0x1c7f46=_0x182010[_0x2c52('99','3rxq')](_0x354d04,0x3f);continue;case'4':_0x20827c=_0x182010[_0x2c52('9a','$PD5')](_0x182010[_0x2c52('9b','XdN)')](_0x182010[_0x2c52('9c','veL*')](_0x182010[_0x2c52('9d','*UL$')](_0x20827c,_0x1efa78[_0x2c52('9e','XSgs')](_0xdfcfb1)),_0x1efa78[_0x2c52('9f','5AHr')](_0x4b07ad)),_0x1efa78[_0x2c52('a0','$(gp')](_0x1ee9c7)),_0x1efa78[_0x2c52('a1','$PD5')](_0x1c7f46));continue;case'5':_0x52e39e=_0x4371ad[_0x2c52('a2','XdN)')](_0x3ae84c++);continue;case'6':_0x1ee9c7=_0x182010[_0x2c52('a3','wN$9')](_0x182010[_0x2c52('a4','%Uh$')](_0x182010[_0x2c52('a5','(LOl')](_0x52e39e,0xf),0x2),_0x182010[_0x2c52('a6','dCuC')](_0x354d04,0x6));continue;case'7':_0x30d7bf=_0x4371ad[_0x2c52('a7','%Uh$')](_0x3ae84c++);continue;case'8':_0xdfcfb1=_0x182010[_0x2c52('a8','^q0S')](_0x30d7bf,0x2);continue;}break;}}}return _0x20827c;}function getKey(_0x381110,_0xb37480){var _0x4a555c={'PDoDC':function(_0x6f6399,_0x4332c6){return _0x6f6399(_0x4332c6);},'CXPYp':function(_0x124f31,_0x26552f){return _0x124f31+_0x26552f;},'OOufR':function(_0x154058,_0xcfd38a){return _0x154058<_0xcfd38a;},'rePzC':function(_0x41a953,_0x3d8da0){return _0x41a953===_0x3d8da0;},'kXCPg':function(_0x310821,_0x582d0d){return _0x310821!==_0x582d0d;},'QuRPL':_0x2c52('a9','3ve5'),'YaXuu':function(_0x8b163f,_0x2c1d65){return _0x8b163f%_0x2c1d65;},'kqNUe':function(_0x23bd25,_0x264e93){return _0x23bd25^_0x264e93;},'GcJXj':_0x2c52('aa','FOBd')};_0x381110=_0x381110[_0x2c52('ab','@r)e')]();let _0x36d203=_0x4a555c[_0x2c52('ac','bFIi')](_0x4a555c[_0x2c52('ac','bFIi')](_0x381110[_0x2c52('ad','VABv')](0x7,0xd),''),_0x381110[_0x2c52('ae','mEzA')](0x0,0x7));let _0x4a7489=[];let _0x27141b=0x0;for(let _0xa813d1=0x0;_0x4a555c[_0x2c52('af','Hu[U')](_0xa813d1,_0x381110[_0x2c52('b0','XdN)')]);_0xa813d1++){if(_0x4a555c[_0x2c52('b1','veL*')](_0x27141b,_0xb37480[_0x2c52('b2','$K@r')])){if(_0x4a555c[_0x2c52('b3','mEzA')](_0x4a555c[_0x2c52('b4','bAWe')],_0x4a555c[_0x2c52('b5','dSN0')])){_0xb37480=_0x4a555c[_0x2c52('b6','XdN)')](unescape,_0x4a555c[_0x2c52('b7','*hfU')](encodeURIComponent,_0xb37480));return _0xb37480[_0x2c52('b8','2][u')]('')[_0x2c52('b9','*UL$')](function(_0x695eaa){return _0x695eaa[_0x2c52('ba','Jze@')](0x0);});}else{_0x27141b%=_0xb37480[_0x2c52('8c','Jze@')];}}let _0x60c9f3=_0x4a555c[_0x2c52('bb','^q0S')](_0x4a555c[_0x2c52('bc','XdN)')](_0x36d203[_0x2c52('bd','wN$9')](_0xa813d1),_0xb37480[_0x2c52('be','Z2Ur')](_0x27141b)),_0xb37480[_0x2c52('bf','mEzA')]);_0x4a7489[_0x4a555c[_0x2c52('c0','2][u')]](_0x60c9f3);_0x27141b=_0x4a555c[_0x2c52('c1','*UL$')](_0x27141b,0x1);}return _0x4a7489[_0x2c52('c2','$PD5')]()[_0x2c52('c3','5AHr')](/,/g,'');}function getSign(_0x20912d,_0x552f45){var _0x3cc19d={'MYBsQ':_0x2c52('c4','3rxq'),'HuMne':function(_0x16e6c8,_0x2e7161){return _0x16e6c8(_0x2e7161);},'jnmnY':function(_0x5a892a,_0xcb0d6f){return _0x5a892a>>_0xcb0d6f;},'MNKek':function(_0x446793,_0x1a513d){return _0x446793*_0x1a513d;},'GfENm':function(_0x473aa3,_0x399d8c){return _0x473aa3<<_0x399d8c;},'VKNVB':function(_0x24c79e,_0x31d1f4){return _0x24c79e-_0x31d1f4;},'lBAgT':function(_0x531493,_0x5f1a08){return _0x531493%_0x5f1a08;},'jAQzR':function(_0x5c6d27,_0x3069de){return _0x5c6d27+_0x3069de;},'iGpeG':function(_0x594b2d,_0x41a04f){return _0x594b2d<<_0x41a04f;},'nynyV':function(_0x55b51f,_0x361fe5){return _0x55b51f>>_0x361fe5;},'cVQXV':function(_0x25a5ec,_0x12ff9a){return _0x25a5ec(_0x12ff9a);},'qcGEm':function(_0x35c5af,_0x39b139){return _0x35c5af(_0x39b139);},'JlluC':function(_0x2306c1,_0xc84afb){return _0x2306c1===_0xc84afb;},'amWxH':function(_0x161d7a,_0x3ba175){return _0x161d7a<_0x3ba175;},'kWYbz':function(_0x148357,_0x4fcb06,_0x545216,_0x20d406){return _0x148357(_0x4fcb06,_0x545216,_0x20d406);}};var _0x496210=_0x3cc19d[_0x2c52('c5','i]!7')][_0x2c52('c6','iLXO')]('|'),_0x33bbd7=0x0;while(!![]){switch(_0x496210[_0x33bbd7++]){case'0':var _0x368e9e=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],_0x902543=_0x3cc19d[_0x2c52('c7','b!4Q')](c,_0x20912d);continue;case'1':_0x902543[_0x3cc19d[_0x2c52('c8','Hu[U')](_0x20912d=_0x3cc19d[_0x2c52('c9','@r)e')](0x8,_0x20912d[_0x2c52('8c','Jze@')]),0x5)]|=_0x3cc19d[_0x2c52('ca','XSgs')](0x80,_0x3cc19d[_0x2c52('cb','wN$9')](0x18,_0x3cc19d[_0x2c52('cc',')]%)')](_0x20912d,0x20))),_0x902543[_0x3cc19d[_0x2c52('cd','VABv')](0xf,_0x3cc19d[_0x2c52('ce','DVA(')](_0x3cc19d[_0x2c52('cf','Jze@')](_0x3cc19d[_0x2c52('cd','VABv')](0x40,_0x20912d),0x9),0x4))]=_0x20912d;continue;case'2':return _0x20912d=_0x3cc19d[_0x2c52('d0','dSN0')](iaa,_0x368e9e),_0x552f45&&_0x552f45[_0x2c52('d1','iLXO')]?_0x20912d:_0x552f45&&_0x552f45[_0x2c52('d2','MvbD')]?_[_0x2c52('d3','bAWe')][_0x2c52('d4','b!4Q')](_0x20912d):_0x3cc19d[_0x2c52('d5','*!&A')](bytesToHex,_0x20912d);case'3':_0x3cc19d[_0x2c52('d6','vuGg')](_0x20912d[_0x2c52('d7','iLXO')],String)&&(_0x20912d=_0x3cc19d[_0x2c52('d8','Hu[U')](stringToBytes,_0x20912d));continue;case'4':for(var _0x5abb31=0x0;_0x3cc19d[_0x2c52('d9','$PD5')](_0x5abb31,_0x902543[_0x2c52('da','Vby[')]);_0x5abb31+=0x10)_0x3cc19d[_0x2c52('db','dCuC')](u,_0x368e9e,_0x902543,_0x5abb31);continue;}break;}}function stringToBytes(_0x5037c9){var _0x3650b6={'vsviQ':function(_0x223265,_0xafcbf){return _0x223265(_0xafcbf);}};_0x5037c9=_0x3650b6[_0x2c52('dc','f)%V')](unescape,_0x3650b6[_0x2c52('dd','dCuC')](encodeURIComponent,_0x5037c9));return _0x5037c9[_0x2c52('de','3ve5')]('')[_0x2c52('df','NsH8')](function(_0x5037c9){return _0x5037c9[_0x2c52('e0','XSgs')](0x0);});}function bytesToHex(_0x88179e){var _0x3bb4df={'TvawV':function(_0x5dd57e,_0xe5e140){return _0x5dd57e>_0xe5e140;},'MZUMF':function(_0x472cba,_0x49878c){return _0x472cba+_0x49878c;},'vpbIr':function(_0x552c41,_0x4f0b93){return _0x552c41(_0x4f0b93);},'QHPCg':function(_0x2f3c64,_0x332cc9){return _0x2f3c64+_0x332cc9;},'EdNRA':function(_0x5ebdf3,_0x338a02){return _0x5ebdf3-_0x338a02;}};return _0x88179e[_0x2c52('e1','bFIi')](function(_0x88179e){return _0x11349c=_0x88179e[_0x2c52('e2','&f!p')](0x10),_0x88179e=0x2,_0x3bb4df[_0x2c52('e3','2][u')](_0x11349c[_0x2c52('e4','3f#n')],_0x88179e)?_0x11349c:_0x3bb4df[_0x2c52('e5','3rxq')](_0x3bb4df[_0x2c52('e6','Vby[')](Array,_0x3bb4df[_0x2c52('e7','$(gp')](_0x3bb4df[_0x2c52('e8','epvv')](_0x88179e,_0x11349c[_0x2c52('7d','3rxq')]),0x1))[_0x2c52('e9','*!&A')]('0'),_0x11349c);var _0x11349c;})[_0x2c52('ea','Z2Ur')]('');}function c(_0x1ead7f){var _0x186999={'INFjw':function(_0x4cbc76,_0x4a7bb9){return _0x4cbc76<_0x4a7bb9;},'KydbZ':function(_0x3af47a,_0x3de746){return _0x3af47a>>>_0x3de746;},'aMqiT':function(_0x73965a,_0x52ba0c){return _0x73965a<<_0x52ba0c;},'duqlw':function(_0x2d8b66,_0x5ea768){return _0x2d8b66-_0x5ea768;},'PnRXE':function(_0x3fbd55,_0x3c0ac3){return _0x3fbd55%_0x3c0ac3;}};for(var _0x322e74=[],_0x203444=0x0,_0x5ddeb1=0x0;_0x186999[_0x2c52('eb','64jp')](_0x203444,_0x1ead7f[_0x2c52('ec','Z[^%')]);_0x203444++,_0x5ddeb1+=0x8)_0x322e74[_0x186999[_0x2c52('ed','Z2Ur')](_0x5ddeb1,0x5)]|=_0x186999[_0x2c52('ee','veL*')](_0x1ead7f[_0x203444],_0x186999[_0x2c52('ef','&f!p')](0x18,_0x186999[_0x2c52('f0','PI3P')](_0x5ddeb1,0x20)));return _0x322e74;}function u(_0xb1173e,_0x3cdffc,_0x3e170e){var _0x25be2f={'sHfdA':function(_0xe247f5,_0x21b88d){return _0xe247f5<=_0x21b88d;},'XKXcf':function(_0x2f80f8,_0x4325c3){return _0x2f80f8%_0x4325c3;},'psTNh':_0x2c52('f1','bFIi'),'cBxrB':function(_0x492a9b,_0x243c8e){return _0x492a9b|_0x243c8e;},'iRIHK':function(_0x3a10a5,_0x26c279){return _0x3a10a5<<_0x26c279;},'tliLg':function(_0x49e643,_0xb6ce65){return _0x49e643&_0xb6ce65;},'tmzvf':function(_0x2c10c6,_0x21cd02){return _0x2c10c6>>_0x21cd02;},'BzNKv':function(_0x25b9c9,_0x56028e){return _0x25b9c9(_0x56028e);},'wnsjp':function(_0x347f82,_0x1998af){return _0x347f82&_0x1998af;},'SXPjD':function(_0x487cdd,_0x2b0eca){return _0x487cdd+_0x2b0eca;},'GNNqL':function(_0x37a98f,_0x167410){return _0x37a98f+_0x167410;},'cGgmM':function(_0x4e0810,_0x1f48a8){return _0x4e0810!==_0x1f48a8;},'RVtOc':_0x2c52('f2','iLXO'),'ErqcO':_0x2c52('f3','bFIi'),'qQmsx':function(_0x4d8641,_0x2e156b){return _0x4d8641<_0x2e156b;},'XTNXv':function(_0x1d5475,_0x10a96d){return _0x1d5475|_0x10a96d;},'hUisO':function(_0x4e920c,_0x11dfa6){return _0x4e920c*_0x11dfa6;},'fmMxz':function(_0x100c54,_0x19516b){return _0x100c54-_0x19516b;},'UpZdA':function(_0x5284f6,_0x5acf9e){return _0x5284f6/_0x5acf9e;},'YuRcd':function(_0x4a8523,_0x502525){return _0x4a8523|_0x502525;},'YbsKl':function(_0x3f989d,_0x53d234){return _0x3f989d<_0x53d234;},'zeXRK':function(_0x5211f6,_0x552f92){return _0x5211f6|_0x552f92;},'OvXsd':function(_0x42b0e5,_0x37b1d5){return _0x42b0e5+_0x37b1d5;},'LlDKr':function(_0x2bf519,_0x38bab8){return _0x2bf519+_0x38bab8;},'WiScM':function(_0x3992eb,_0x437c11){return _0x3992eb^_0x437c11;},'TjDtF':function(_0x22e845,_0x69d5e1){return _0x22e845>>>_0x69d5e1;},'NvuJH':function(_0x46d5a6,_0x179b2f){return _0x46d5a6>>>_0x179b2f;},'VCLEo':function(_0x47e629,_0x3a4df3){return _0x47e629^_0x3a4df3;},'ScZHE':function(_0x22df67,_0x596a49){return _0x22df67|_0x596a49;},'JCGaD':function(_0x5e6661,_0x56a714){return _0x5e6661<<_0x56a714;},'mFIoo':function(_0x1432fe,_0x2093a4){return _0x1432fe|_0x2093a4;},'uVWSH':function(_0xbebb05,_0x50eed7){return _0xbebb05<<_0x50eed7;},'Hpxmo':function(_0x595a1e,_0x2ece17){return _0x595a1e-_0x2ece17;},'QiXSk':function(_0x339b9a,_0xdf8a1d){return _0x339b9a&_0xdf8a1d;},'EJvom':function(_0x456e6c,_0x1f8270){return _0x456e6c+_0x1f8270;},'TNBsa':function(_0x32f515,_0x524475){return _0x32f515+_0x524475;},'hcMcg':function(_0x59dd82,_0x509e7a){return _0x59dd82^_0x509e7a;},'IZscS':function(_0xbeedbe,_0x48ebbc){return _0xbeedbe^_0x48ebbc;},'ZsBmt':function(_0x4f374c,_0x2c14bf){return _0x4f374c|_0x2c14bf;},'sQCGJ':function(_0x2eb356,_0x344eb8){return _0x2eb356<<_0x344eb8;},'kSbpn':function(_0x1522b5,_0x57c610){return _0x1522b5|_0x57c610;},'BRTqT':function(_0x50ded7,_0xae2625){return _0x50ded7<<_0xae2625;},'jLiJi':function(_0x5eaa5d,_0x529f3e){return _0x5eaa5d>>>_0x529f3e;},'zYCvQ':function(_0x97c098,_0x17f2a6){return _0x97c098>>>_0x17f2a6;},'lNiKu':function(_0x40b506,_0x5ba26a){return _0x40b506^_0x5ba26a;},'FwZoG':function(_0x37543b,_0x2c922a){return _0x37543b&_0x2c922a;},'bkASI':function(_0x464a3d,_0x497ebd){return _0x464a3d&_0x497ebd;},'FUNCk':function(_0x5520f6,_0x169bc8){return _0x5520f6|_0x169bc8;},'oKdrs':function(_0x519cf7,_0x21c10b){return _0x519cf7+_0x21c10b;},'UvQla':function(_0x6a168c,_0x4771dc){return _0x6a168c|_0x4771dc;},'LLDjf':function(_0xd7710a,_0x2a8866){return _0xd7710a+_0x2a8866;},'jFSgg':function(_0x1f9880,_0x9caa47){return _0x1f9880^_0x9caa47;},'DOIsH':function(_0x4a6d3a,_0x3b8684){return _0x4a6d3a^_0x3b8684;},'prcYC':function(_0x3675e8,_0xfcff8d){return _0x3675e8|_0xfcff8d;},'rxxpc':function(_0x633d01,_0x14794b){return _0x633d01>>>_0x14794b;},'rBFmn':function(_0x6eae25,_0x720772){return _0x6eae25|_0x720772;},'okQbQ':function(_0x10ac40,_0x13e0cc){return _0x10ac40<<_0x13e0cc;},'ISEjl':function(_0x5d401a,_0x311bb4){return _0x5d401a+_0x311bb4;},'wSTvN':function(_0x24f6ba,_0x244e8a){return _0x24f6ba+_0x244e8a;},'lOhSW':function(_0x555464,_0x46b677){return _0x555464|_0x46b677;},'AUvZL':function(_0x3bf38b,_0x2e541d){return _0x3bf38b|_0x2e541d;},'WRAPv':function(_0x263698,_0x7c8a78){return _0x263698|_0x7c8a78;},'jiAcu':function(_0x495cf1,_0x5b8f6e){return _0x495cf1+_0x5b8f6e;},'otgvX':function(_0x19f6c7,_0x51a3d2){return _0x19f6c7+_0x51a3d2;},'EqRVD':function(_0x1969f7,_0x5dc9b5){return _0x1969f7|_0x5dc9b5;},'JXFOZ':function(_0x1f7ad9,_0xca6896){return _0x1f7ad9|_0xca6896;}};var _0x1093b7=[];var _0x19ad61=[];!function(){var _0x7d3554={'vqqHG':function(_0x41d295,_0x1f9e30){return _0x25be2f[_0x2c52('f4','So*0')](_0x41d295,_0x1f9e30);},'whhSz':function(_0x30f880,_0x3b15b2){return _0x25be2f[_0x2c52('f5','3ve5')](_0x30f880,_0x3b15b2);},'DXxSa':_0x25be2f[_0x2c52('f6','$PD5')],'eLeyh':function(_0xb4bf57,_0x195c2b){return _0x25be2f[_0x2c52('f7','iLXO')](_0xb4bf57,_0x195c2b);},'dQDnY':function(_0xaba9c2,_0x516053){return _0x25be2f[_0x2c52('f8','i]!7')](_0xaba9c2,_0x516053);},'XAeLD':function(_0x216c16,_0x23a20c){return _0x25be2f[_0x2c52('f9','^q0S')](_0x216c16,_0x23a20c);},'VZxmF':function(_0x43fc90,_0x1b7961){return _0x25be2f[_0x2c52('fa','%Uh$')](_0x43fc90,_0x1b7961);},'FQXbt':function(_0x4e6c1a,_0x5750c6){return _0x25be2f[_0x2c52('fb','DVA(')](_0x4e6c1a,_0x5750c6);},'hDBOE':function(_0x20ee03,_0x18a9de){return _0x25be2f[_0x2c52('fc','^q0S')](_0x20ee03,_0x18a9de);},'jdvxs':function(_0x330fdb,_0x1383d4){return _0x25be2f[_0x2c52('fd','veL*')](_0x330fdb,_0x1383d4);},'kzBEZ':function(_0x87cec4,_0x4ec295){return _0x25be2f[_0x2c52('fe','Vby[')](_0x87cec4,_0x4ec295);},'JQEIp':function(_0x56ac42,_0x33c870){return _0x25be2f[_0x2c52('ff','Vby[')](_0x56ac42,_0x33c870);},'XcwmU':function(_0x305e4c,_0x50e35e){return _0x25be2f[_0x2c52('100','3f#n')](_0x305e4c,_0x50e35e);},'avwJL':function(_0x59df6d,_0x13a531){return _0x25be2f[_0x2c52('101','$PD5')](_0x59df6d,_0x13a531);},'LpUtc':function(_0x6de7fd,_0xee8c21){return _0x25be2f[_0x2c52('102','64jp')](_0x6de7fd,_0xee8c21);},'sKgBy':function(_0x418419,_0x58782b){return _0x25be2f[_0x2c52('103','(LOl')](_0x418419,_0x58782b);}};if(_0x25be2f[_0x2c52('104','&f!p')](_0x25be2f[_0x2c52('105','Z2Ur')],_0x25be2f[_0x2c52('106','iLXO')])){for(var _0xb1173e,_0x3cdffc=0x2,_0x3e170e=0x0;_0x25be2f[_0x2c52('107','wN$9')](_0x3e170e,0x40);)!function(_0xb1173e){for(var _0x3cdffc=Math[_0x2c52('108','5AHr')](_0xb1173e),_0x3e170e=0x2;_0x7d3554[_0x2c52('109','e9kP')](_0x3e170e,_0x3cdffc);_0x3e170e++)if(!_0x7d3554[_0x2c52('10a','dCuC')](_0xb1173e,_0x3e170e))return;return 0x1;}(_0x3cdffc)||(_0x19ad61[_0x3e170e]=_0x25be2f[_0x2c52('10b','Z[^%')](_0x25be2f[_0x2c52('10c','4Sdp')](0x100000000,_0x25be2f[_0x2c52('10d','^q0S')](_0xb1173e=Math[_0x2c52('10e','LlZw')](_0x3cdffc,_0x25be2f[_0x2c52('10f','i]!7')](0x1,0x3)),_0x25be2f[_0x2c52('110','2][u')](0x0,_0xb1173e))),0x0),_0x3e170e++),_0x3cdffc++;}else{var _0x206686=_0x7d3554[_0x2c52('111','LlZw')][_0x2c52('112','4Sdp')]('|'),_0x447cdc=0x0;while(!![]){switch(_0x206686[_0x447cdc++]){case'0':chr2=input[_0x2c52('113','epvv')](i++);continue;case'1':enc2=_0x7d3554[_0x2c52('114','yAXd')](_0x7d3554[_0x2c52('115','f)%V')](_0x7d3554[_0x2c52('116','bAWe')](chr1,0x3),0x4),_0x7d3554[_0x2c52('117','Vby[')](chr2,0x4));continue;case'2':chr1=input[_0x2c52('118','2][u')](i++);continue;case'3':if(_0x7d3554[_0x2c52('119','@r)e')](isNaN,chr2)){enc3=enc4=0x40;}else if(_0x7d3554[_0x2c52('11a','NsH8')](isNaN,chr3)){enc4=0x40;}continue;case'4':chr3=input[_0x2c52('11b','LlZw')](i++);continue;case'5':enc4=_0x7d3554[_0x2c52('11c','Jze@')](chr3,0x3f);continue;case'6':output=_0x7d3554[_0x2c52('11d','MvbD')](_0x7d3554[_0x2c52('11e','FOBd')](_0x7d3554[_0x2c52('11f','So*0')](_0x7d3554[_0x2c52('120','*hfU')](output,_keyStr[_0x2c52('121','NitO')](enc1)),_keyStr[_0x2c52('122','So*0')](enc2)),_keyStr[_0x2c52('123','LlZw')](enc3)),_keyStr[_0x2c52('124','Z2Ur')](enc4));continue;case'7':enc1=_0x7d3554[_0x2c52('125','Hu[U')](chr1,0x2);continue;case'8':enc3=_0x7d3554[_0x2c52('126','b!4Q')](_0x7d3554[_0x2c52('127','epvv')](_0x7d3554[_0x2c52('128','2][u')](chr2,0xf),0x2),_0x7d3554[_0x2c52('129',')]%)')](chr3,0x6));continue;}break;}}}();for(var _0x2c1ca1=_0xb1173e[0x0],_0x3b82a6=_0xb1173e[0x1],_0x4496b7=_0xb1173e[0x2],_0x595b03=_0xb1173e[0x3],_0x1c0a3d=_0xb1173e[0x4],_0x2174df=_0xb1173e[0x5],_0x23f4b7=_0xb1173e[0x6],_0x4d89e2=_0xb1173e[0x7],_0x2e9141=0x0;_0x25be2f[_0x2c52('12a','$K@r')](_0x2e9141,0x40);_0x2e9141++){_0x25be2f[_0x2c52('12b','2][u')](_0x2e9141,0x10)?_0x1093b7[_0x2e9141]=_0x25be2f[_0x2c52('12c','dSN0')](0x0,_0x3cdffc[_0x25be2f[_0x2c52('12d','NsH8')](_0x3e170e,_0x2e9141)]):(_0x23e5b7=_0x1093b7[_0x25be2f[_0x2c52('12e','%Uh$')](_0x2e9141,0xf)],_0x3ccf05=_0x1093b7[_0x25be2f[_0x2c52('12f','PI3P')](_0x2e9141,0x2)],_0x1093b7[_0x2e9141]=_0x25be2f[_0x2c52('130','XdN)')](_0x25be2f[_0x2c52('131','64jp')](_0x25be2f[_0x2c52('132','$(gp')](_0x25be2f[_0x2c52('133','dSN0')](_0x25be2f[_0x2c52('134','(LOl')](_0x25be2f[_0x2c52('135','Hu[U')](_0x25be2f[_0x2c52('136','Jze@')](_0x23e5b7,0x19),_0x25be2f[_0x2c52('137','XdN)')](_0x23e5b7,0x7)),_0x25be2f[_0x2c52('138',')]%)')](_0x25be2f[_0x2c52('139','e9kP')](_0x23e5b7,0xe),_0x25be2f[_0x2c52('13a','bFIi')](_0x23e5b7,0x12))),_0x25be2f[_0x2c52('13b','dSN0')](_0x23e5b7,0x3)),_0x1093b7[_0x25be2f[_0x2c52('13c',')]%)')](_0x2e9141,0x7)]),_0x25be2f[_0x2c52('13d','3rxq')](_0x25be2f[_0x2c52('13e','iLXO')](_0x25be2f[_0x2c52('13f','VABv')](_0x25be2f[_0x2c52('140','2][u')](_0x3ccf05,0xf),_0x25be2f[_0x2c52('13b','dSN0')](_0x3ccf05,0x11)),_0x25be2f[_0x2c52('141','^q0S')](_0x25be2f[_0x2c52('142','iLXO')](_0x3ccf05,0xd),_0x25be2f[_0x2c52('143','iLXO')](_0x3ccf05,0x13))),_0x25be2f[_0x2c52('144','Z[^%')](_0x3ccf05,0xa))),_0x1093b7[_0x25be2f[_0x2c52('145','(LOl')](_0x2e9141,0x10)]));var _0x23e5b7=_0x25be2f[_0x2c52('146','NitO')](_0x25be2f[_0x2c52('147','FOBd')](_0x25be2f[_0x2c52('148','NsH8')](_0x2c1ca1,_0x3b82a6),_0x25be2f[_0x2c52('149','i]!7')](_0x2c1ca1,_0x4496b7)),_0x25be2f[_0x2c52('14a','3ve5')](_0x3b82a6,_0x4496b7)),_0x3ccf05=_0x25be2f[_0x2c52('14b','Vby[')](_0x25be2f[_0x2c52('14c','dCuC')](_0x25be2f[_0x2c52('14d','So*0')](_0x25be2f[_0x2c52('14e','(LOl')](_0x4d89e2,_0x25be2f[_0x2c52('14f','dCuC')](_0x25be2f[_0x2c52('150','4Sdp')](_0x25be2f[_0x2c52('151','3f#n')](_0x25be2f[_0x2c52('152','yAXd')](_0x1c0a3d,0x1a),_0x25be2f[_0x2c52('153','NsH8')](_0x1c0a3d,0x6)),_0x25be2f[_0x2c52('154','*UL$')](_0x25be2f[_0x2c52('155','64jp')](_0x1c0a3d,0x15),_0x25be2f[_0x2c52('156','bFIi')](_0x1c0a3d,0xb))),_0x25be2f[_0x2c52('157','*!&A')](_0x25be2f[_0x2c52('158','Vby[')](_0x1c0a3d,0x7),_0x25be2f[_0x2c52('159','bFIi')](_0x1c0a3d,0x19)))),_0x25be2f[_0x2c52('15a','3ve5')](_0x25be2f[_0x2c52('15b','i]!7')](_0x1c0a3d,_0x2174df),_0x25be2f[_0x2c52('15c','@r)e')](~_0x1c0a3d,_0x23f4b7))),_0x19ad61[_0x2e9141]),_0x1093b7[_0x2e9141]);_0x4d89e2=_0x23f4b7,_0x23f4b7=_0x2174df,_0x2174df=_0x1c0a3d,_0x1c0a3d=_0x25be2f[_0x2c52('15d','So*0')](_0x25be2f[_0x2c52('15e','*hfU')](_0x595b03,_0x3ccf05),0x0),_0x595b03=_0x4496b7,_0x4496b7=_0x3b82a6,_0x3b82a6=_0x2c1ca1,_0x2c1ca1=_0x25be2f[_0x2c52('15f','MvbD')](_0x25be2f[_0x2c52('160','Jze@')](_0x3ccf05,_0x25be2f[_0x2c52('161','veL*')](_0x25be2f[_0x2c52('162','PI3P')](_0x25be2f[_0x2c52('163','vuGg')](_0x25be2f[_0x2c52('164','LlZw')](_0x25be2f[_0x2c52('165','veL*')](_0x2c1ca1,0x1e),_0x25be2f[_0x2c52('166','f)%V')](_0x2c1ca1,0x2)),_0x25be2f[_0x2c52('167','5AHr')](_0x25be2f[_0x2c52('168','f)%V')](_0x2c1ca1,0x13),_0x25be2f[_0x2c52('169','Vby[')](_0x2c1ca1,0xd))),_0x25be2f[_0x2c52('16a','iLXO')](_0x25be2f[_0x2c52('16b','FOBd')](_0x2c1ca1,0xa),_0x25be2f[_0x2c52('16c','bFIi')](_0x2c1ca1,0x16))),_0x23e5b7)),0x0);}_0xb1173e[0x0]=_0x25be2f[_0x2c52('16d','VABv')](_0x25be2f[_0x2c52('16e','VABv')](_0xb1173e[0x0],_0x2c1ca1),0x0),_0xb1173e[0x1]=_0x25be2f[_0x2c52('16f','2][u')](_0x25be2f[_0x2c52('170','bAWe')](_0xb1173e[0x1],_0x3b82a6),0x0),_0xb1173e[0x2]=_0x25be2f[_0x2c52('171','MvbD')](_0x25be2f[_0x2c52('172','XSgs')](_0xb1173e[0x2],_0x4496b7),0x0),_0xb1173e[0x3]=_0x25be2f[_0x2c52('173','XdN)')](_0x25be2f[_0x2c52('174','NitO')](_0xb1173e[0x3],_0x595b03),0x0),_0xb1173e[0x4]=_0x25be2f[_0x2c52('175','bFIi')](_0x25be2f[_0x2c52('176','3rxq')](_0xb1173e[0x4],_0x1c0a3d),0x0),_0xb1173e[0x5]=_0x25be2f[_0x2c52('177','dSN0')](_0x25be2f[_0x2c52('178','iLXO')](_0xb1173e[0x5],_0x2174df),0x0),_0xb1173e[0x6]=_0x25be2f[_0x2c52('179','3ve5')](_0x25be2f[_0x2c52('17a','%Uh$')](_0xb1173e[0x6],_0x23f4b7),0x0),_0xb1173e[0x7]=_0x25be2f[_0x2c52('17b','64jp')](_0x25be2f[_0x2c52('17c','bFIi')](_0xb1173e[0x7],_0x4d89e2),0x0);}function iaa(_0xe43d06){var _0x4826ba={'dYWpv':function(_0x823f67,_0x3d52e0){return _0x823f67<_0x3d52e0;},'fHpqW':function(_0x2c8ad4,_0x4c86ef){return _0x2c8ad4*_0x4c86ef;},'OaiyL':function(_0x935810,_0x307f02){return _0x935810&_0x307f02;},'Rgaxl':function(_0x523efe,_0x4afc73){return _0x523efe>>>_0x4afc73;},'vBckw':function(_0x299cab,_0x34a0b7){return _0x299cab-_0x34a0b7;},'pJztX':function(_0x3ee33d,_0x166a06){return _0x3ee33d%_0x166a06;}};for(var _0x2a703c=[],_0x2c4c0f=0x0;_0x4826ba[_0x2c52('17d','$(gp')](_0x2c4c0f,_0x4826ba[_0x2c52('17e','NsH8')](0x20,_0xe43d06[_0x2c52('17f','*UL$')]));_0x2c4c0f+=0x8)_0x2a703c[_0x2c52('180','XdN)')](_0x4826ba[_0x2c52('181','4Sdp')](_0x4826ba[_0x2c52('182','DVA(')](_0xe43d06[_0x4826ba[_0x2c52('183','epvv')](_0x2c4c0f,0x5)],_0x4826ba[_0x2c52('184','vuGg')](0x18,_0x4826ba[_0x2c52('185','^q0S')](_0x2c4c0f,0x20))),0xff));return _0x2a703c;}function getCrcCode(_0x52b21f){var _0x21c27e={'BkbRi':_0x2c52('186','5AHr'),'EGGRu':_0x2c52('187','FOBd'),'lrMoH':function(_0x3e259c,_0xd5610d){return _0x3e259c>>>_0xd5610d;},'mOyGT':function(_0x30bad4,_0x2d5fe7){return _0x30bad4(_0x2d5fe7);},'XDyEQ':function(_0x5dd264,_0x55f961,_0x1d26ac){return _0x5dd264(_0x55f961,_0x1d26ac);}};(_0x319d21={})[_0x21c27e[_0x2c52('188',')]%)')]]=_0x21c27e[_0x2c52('189','i]!7')];var _0x3ad912=_0x319d21[_0x21c27e[_0x2c52('18a','*hfU')]],_0x319d21='';try{_0x319d21=_0x21c27e[_0x2c52('18b',')]%)')](_0x21c27e[_0x2c52('18c','FOBd')](getaaa,_0x52b21f),0x0)[_0x2c52('18d','XdN)')](0x24);}catch(_0x2d7bd7){}return _0x21c27e[_0x2c52('18e','Z[^%')](PrefixZero,_0x319d21,0x7);}function PrefixZero(_0x3a92fe,_0x321d39){var _0x20d772={'eoYeM':function(_0x3c7586,_0x15f6f5){return _0x3c7586+_0x15f6f5;},'spTxb':function(_0x59b8e6,_0x416db3){return _0x59b8e6(_0x416db3);}};return _0x20d772[_0x2c52('18f','&f!p')](_0x20d772[_0x2c52('190','3ve5')](Array,_0x321d39)[_0x2c52('191','^q0S')](0x0),_0x3a92fe)[_0x2c52('192','MvbD')](-_0x321d39);}function getaaa(_0x532310){var _0x25e022={'IxwuQ':_0x2c52('193','$K@r'),'AbSmV':function(_0x166b63,_0x22c2e1,_0x521b88){return _0x166b63(_0x22c2e1,_0x521b88);},'eDAIB':function(_0x16cf75,_0x45868c){return _0x16cf75^_0x45868c;},'bBZWY':function(_0x41b9fe,_0x2adfd6){return _0x41b9fe===_0x2adfd6;},'HMBmi':function(_0x5a57a1,_0x63c585){return _0x5a57a1<_0x63c585;},'gqZNo':function(_0x57e934,_0x22b1f1){return _0x57e934^_0x22b1f1;},'zDedc':function(_0x3a8120,_0x4ee6e9){return _0x3a8120&_0x4ee6e9;},'rcfsO':function(_0x3781ae,_0x20eb3d){return _0x3781ae^_0x20eb3d;},'nFFTV':function(_0x41ee20,_0x3f419a){return _0x41ee20>>>_0x3f419a;}};var _0x31b61b=_0x25e022[_0x2c52('194','MvbD')][_0x2c52('195','veL*')]('|'),_0x98b66b=0x0;while(!![]){switch(_0x31b61b[_0x98b66b++]){case'0':_0x532310=_0x25e022[_0x2c52('196','Z[^%')](sdsde,_0x532310,_0x20de72);continue;case'1':var _0x20de72=undefined;continue;case'2':var _0x594005=[0x0,0x77073096,0xee0e612c,0x990951ba,0x76dc419,0x706af48f,0xe963a535,0x9e6495a3,0xedb8832,0x79dcb8a4,0xe0d5e91e,0x97d2d988,0x9b64c2b,0x7eb17cbd,0xe7b82d07,0x90bf1d91,0x1db71064,0x6ab020f2,0xf3b97148,0x84be41de,0x1adad47d,0x6ddde4eb,0xf4d4b551,0x83d385c7,0x136c9856,0x646ba8c0,0xfd62f97a,0x8a65c9ec,0x14015c4f,0x63066cd9,0xfa0f3d63,0x8d080df5,0x3b6e20c8,0x4c69105e,0xd56041e4,0xa2677172,0x3c03e4d1,0x4b04d447,0xd20d85fd,0xa50ab56b,0x35b5a8fa,0x42b2986c,0xdbbbc9d6,0xacbcf940,0x32d86ce3,0x45df5c75,0xdcd60dcf,0xabd13d59,0x26d930ac,0x51de003a,0xc8d75180,0xbfd06116,0x21b4f4b5,0x56b3c423,0xcfba9599,0xb8bda50f,0x2802b89e,0x5f058808,0xc60cd9b2,0xb10be924,0x2f6f7c87,0x58684c11,0xc1611dab,0xb6662d3d,0x76dc4190,0x1db7106,0x98d220bc,0xefd5102a,0x71b18589,0x6b6b51f,0x9fbfe4a5,0xe8b8d433,0x7807c9a2,0xf00f934,0x9609a88e,0xe10e9818,0x7f6a0dbb,0x86d3d2d,0x91646c97,0xe6635c01,0x6b6b51f4,0x1c6c6162,0x856530d8,0xf262004e,0x6c0695ed,0x1b01a57b,0x8208f4c1,0xf50fc457,0x65b0d9c6,0x12b7e950,0x8bbeb8ea,0xfcb9887c,0x62dd1ddf,0x15da2d49,0x8cd37cf3,0xfbd44c65,0x4db26158,0x3ab551ce,0xa3bc0074,0xd4bb30e2,0x4adfa541,0x3dd895d7,0xa4d1c46d,0xd3d6f4fb,0x4369e96a,0x346ed9fc,0xad678846,0xda60b8d0,0x44042d73,0x33031de5,0xaa0a4c5f,0xdd0d7cc9,0x5005713c,0x270241aa,0xbe0b1010,0xc90c2086,0x5768b525,0x206f85b3,0xb966d409,0xce61e49f,0x5edef90e,0x29d9c998,0xb0d09822,0xc7d7a8b4,0x59b33d17,0x2eb40d81,0xb7bd5c3b,0xc0ba6cad,0xedb88320,0x9abfb3b6,0x3b6e20c,0x74b1d29a,0xead54739,0x9dd277af,0x4db2615,0x73dc1683,0xe3630b12,0x94643b84,0xd6d6a3e,0x7a6a5aa8,0xe40ecf0b,0x9309ff9d,0xa00ae27,0x7d079eb1,0xf00f9344,0x8708a3d2,0x1e01f268,0x6906c2fe,0xf762575d,0x806567cb,0x196c3671,0x6e6b06e7,0xfed41b76,0x89d32be0,0x10da7a5a,0x67dd4acc,0xf9b9df6f,0x8ebeeff9,0x17b7be43,0x60b08ed5,0xd6d6a3e8,0xa1d1937e,0x38d8c2c4,0x4fdff252,0xd1bb67f1,0xa6bc5767,0x3fb506dd,0x48b2364b,0xd80d2bda,0xaf0a1b4c,0x36034af6,0x41047a60,0xdf60efc3,0xa867df55,0x316e8eef,0x4669be79,0xcb61b38c,0xbc66831a,0x256fd2a0,0x5268e236,0xcc0c7795,0xbb0b4703,0x220216b9,0x5505262f,0xc5ba3bbe,0xb2bd0b28,0x2bb45a92,0x5cb36a04,0xc2d7ffa7,0xb5d0cf31,0x2cd99e8b,0x5bdeae1d,0x9b64c2b0,0xec63f226,0x756aa39c,0x26d930a,0x9c0906a9,0xeb0e363f,0x72076785,0x5005713,0x95bf4a82,0xe2b87a14,0x7bb12bae,0xcb61b38,0x92d28e9b,0xe5d5be0d,0x7cdcefb7,0xbdbdf21,0x86d3d2d4,0xf1d4e242,0x68ddb3f8,0x1fda836e,0x81be16cd,0xf6b9265b,0x6fb077e1,0x18b74777,0x88085ae6,0xff0f6a70,0x66063bca,0x11010b5c,0x8f659eff,0xf862ae69,0x616bffd3,0x166ccf45,0xa00ae278,0xd70dd2ee,0x4e048354,0x3903b3c2,0xa7672661,0xd06016f7,0x4969474d,0x3e6e77db,0xaed16a4a,0xd9d65adc,0x40df0b66,0x37d83bf0,0xa9bcae53,0xdebb9ec5,0x47b2cf7f,0x30b5ffe9,0xbdbdf21c,0xcabac28a,0x53b39330,0x24b4a3a6,0xbad03605,0xcdd70693,0x54de5729,0x23d967bf,0xb3667a2e,0xc4614ab8,0x5d681b02,0x2a6f2b94,0xb40bbe37,0xc30c8ea1,0x5a05df1b,0x2d02ef8d];continue;case'3':return _0x25e022[_0x2c52('197','wN$9')](-0x1,_0x52646e);case'4':for(var _0x52646e=_0x25e022[_0x2c52('198','3f#n')](0x0,_0x20de72)?0x0:_0x25e022[_0x2c52('199','bAWe')](-0x1,~~_0x20de72),_0x1985d=0x0;_0x25e022[_0x2c52('19a','FOBd')](_0x1985d,_0x532310[_0x2c52('19b','DVA(')]);_0x1985d++){var _0x2cb10f=_0x532310[_0x1985d];_0x52646e=_0x25e022[_0x2c52('19c','b!4Q')](_0x594005[_0x25e022[_0x2c52('19d','VABv')](0xff,_0x25e022[_0x2c52('19e','dSN0')](_0x52646e,_0x2cb10f))],_0x25e022[_0x2c52('19f','%Uh$')](_0x52646e,0x8));}continue;}break;}}function sdsde(_0x151140,_0x5edadc){var _0x31b2b6={'jOyqP':_0x2c52('1a0','VABv'),'vrCpn':function(_0xe94b2d,_0x56bcc1){return _0xe94b2d(_0x56bcc1);},'JKAUH':function(_0x198c30,_0x4ccfa5){return _0x198c30(_0x4ccfa5);},'fytEz':function(_0x38929d,_0x4a387a){return _0x38929d===_0x4a387a;},'TtQVE':function(_0x5ea412,_0x5d67a0){return _0x5ea412(_0x5d67a0);},'QFOrG':function(_0x8e4c60,_0x1b2bff){return _0x8e4c60<_0x1b2bff;},'zEcEY':function(_0x2447f6,_0x4a53da,_0x41830f,_0x33bba7){return _0x2447f6(_0x4a53da,_0x41830f,_0x33bba7);},'vUxyQ':function(_0x43a28f,_0x52693c){return _0x43a28f>>_0x52693c;},'jXyYg':function(_0x2c208a,_0x54aa57){return _0x2c208a*_0x54aa57;},'xvFll':function(_0x583441,_0x102545){return _0x583441<<_0x102545;},'OPlTH':function(_0x53fa37,_0x2be5ad){return _0x53fa37-_0x2be5ad;},'LPIDI':function(_0x23d591,_0x3b9ff8){return _0x23d591%_0x3b9ff8;},'evmZR':function(_0x527d56,_0xe6340b){return _0x527d56+_0xe6340b;},'ZoCce':_0x2c52('1a1','3ve5'),'rwuQA':function(_0x251683,_0x1cfd9c){return _0x251683*_0x1cfd9c;},'NCnuk':function(_0x2e614f,_0x503429){return _0x2e614f/_0x503429;},'xfbcR':function(_0x227fa2,_0x4e00ee){return _0x227fa2!==_0x4e00ee;},'OobgQ':_0x2c52('1a2','XSgs'),'yyeHh':function(_0x298c22,_0xf421f4){return _0x298c22<_0xf421f4;},'GLCDM':_0x2c52('1a3','$PD5'),'JImUU':_0x2c52('1a4','*!&A'),'XrKeR':function(_0x4ec943,_0x58a00f){return _0x4ec943<_0x58a00f;},'MHsGU':function(_0x5d5eda,_0x26a506){return _0x5d5eda===_0x26a506;},'xpmzn':function(_0x4e68c9,_0x37a0b5){return _0x4e68c9<_0x37a0b5;},'jsrxK':function(_0x3b1757,_0x1fb889){return _0x3b1757<_0x1fb889;},'hTbYQ':function(_0x3ec373,_0x51423d){return _0x3ec373<_0x51423d;},'dTBoa':function(_0x960567,_0x5449bc){return _0x960567+_0x5449bc;},'RjlCS':function(_0x780b6,_0x38de4f){return _0x780b6|_0x38de4f;},'ahkXt':function(_0x39519a,_0x157ae6){return _0x39519a<_0x157ae6;},'cZHqz':function(_0x1caede,_0x5e566c){return _0x1caede!==_0x5e566c;},'lxduj':_0x2c52('1a5','vuGg'),'dAuEB':_0x2c52('1a6','&f!p'),'EnSAw':function(_0x3e25ef,_0x373a20){return _0x3e25ef>>_0x373a20;},'rCfcP':function(_0xf94759,_0x595f04){return _0xf94759|_0x595f04;},'jNUDb':function(_0x3fff64,_0x3cb802){return _0x3fff64&_0x3cb802;},'aOXcO':function(_0x496fcf,_0x45ab97){return _0x496fcf<_0x45ab97;},'mWhRT':function(_0x2496b7,_0x3da4e2){return _0x2496b7|_0x3da4e2;},'pIWFI':function(_0x64ea39,_0x522457){return _0x64ea39|_0x522457;},'wpcWU':function(_0x1d69a3,_0x4b02c4){return _0x1d69a3|_0x4b02c4;},'XwWdz':function(_0x1e1ba9,_0x28acf7){return _0x1e1ba9&_0x28acf7;},'FVqQr':_0x2c52('1a7','&f!p'),'GBuni':function(_0x5ba85e,_0x362ba8){return _0x5ba85e<_0x362ba8;},'JIDFh':function(_0x7008f2,_0x1a604f){return _0x7008f2>>_0x1a604f;},'PFbEq':function(_0x5a7100,_0x343c45){return _0x5a7100>>_0x343c45;},'HAgvQ':function(_0x504ed6,_0x380346){return _0x504ed6|_0x380346;},'fqEXO':function(_0x3739b5,_0x557072){return _0x3739b5&_0x557072;},'woLxH':function(_0x9d3a76,_0x2c877c){return _0x9d3a76>>_0x2c877c;},'dyTVi':function(_0x4dd9ca,_0x3e2e1d){return _0x4dd9ca|_0x3e2e1d;}};var _0x305ee2;_0x5edadc=_0x5edadc||_0x31b2b6[_0x2c52('1a8','NsH8')](0x1,0x0);for(var _0x3b1d7c=_0x151140[_0x2c52('1a9','$PD5')],_0x5a84c6=null,_0x332b09=[],_0x5978a6=0x0;_0x31b2b6[_0x2c52('1aa','epvv')](_0x5978a6,_0x3b1d7c);++_0x5978a6){if(_0x31b2b6[_0x2c52('1ab','2][u')](_0x31b2b6[_0x2c52('1ac','VABv')],_0x31b2b6[_0x2c52('1ad','3f#n')])){var _0x41eb42=_0x31b2b6[_0x2c52('1ae','$(gp')][_0x2c52('1af','@r)e')]('|'),_0x241d7a=0x0;while(!![]){switch(_0x41eb42[_0x241d7a++]){case'0':return _0x151140=_0x31b2b6[_0x2c52('1b0','bFIi')](iaa,_0x2b815f),_0x5edadc&&_0x5edadc[_0x2c52('1b1','Hu[U')]?_0x151140:_0x5edadc&&_0x5edadc[_0x2c52('1b2','FOBd')]?_0x3b1d7c[_0x2c52('1b3','PI3P')][_0x2c52('1b4','bFIi')](_0x151140):_0x31b2b6[_0x2c52('1b5','Z2Ur')](bytesToHex,_0x151140);case'1':_0x31b2b6[_0x2c52('1b6','mEzA')](_0x151140[_0x2c52('1b7','bFIi')],String)&&(_0x151140=_0x31b2b6[_0x2c52('1b8','$K@r')](stringToBytes,_0x151140));continue;case'2':var _0x2b815f=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],_0x133324=_0x31b2b6[_0x2c52('1b9','2][u')](c,_0x151140);continue;case'3':for(var _0x40724d=0x0;_0x31b2b6[_0x2c52('1ba','Jze@')](_0x40724d,_0x133324[_0x2c52('bf','mEzA')]);_0x40724d+=0x10)_0x31b2b6[_0x2c52('1bb','So*0')](u,_0x2b815f,_0x133324,_0x40724d);continue;case'4':_0x133324[_0x31b2b6[_0x2c52('1bc','*hfU')](_0x151140=_0x31b2b6[_0x2c52('1bd','So*0')](0x8,_0x151140[_0x2c52('1be','f)%V')]),0x5)]|=_0x31b2b6[_0x2c52('1bf','&f!p')](0x80,_0x31b2b6[_0x2c52('1c0','wN$9')](0x18,_0x31b2b6[_0x2c52('1c1','LlZw')](_0x151140,0x20))),_0x133324[_0x31b2b6[_0x2c52('1c2','dSN0')](0xf,_0x31b2b6[_0x2c52('1bf','&f!p')](_0x31b2b6[_0x2c52('1c3','DVA(')](_0x31b2b6[_0x2c52('1c4','DVA(')](0x40,_0x151140),0x9),0x4))]=_0x151140;continue;}break;}}else{if(_0x31b2b6[_0x2c52('1c5','dCuC')](0xd7ff,_0x305ee2=_0x151140[_0x2c52('1c6','*hfU')](_0x5978a6))&&_0x31b2b6[_0x2c52('1c7',')]%)')](_0x305ee2,0xe000)){if(!_0x5a84c6){if(_0x31b2b6[_0x2c52('1c8','dSN0')](_0x31b2b6[_0x2c52('1c9','64jp')],_0x31b2b6[_0x2c52('1ca','XdN)')])){if(_0x31b2b6[_0x2c52('1cb','bAWe')](0xdbff,_0x305ee2)){_0x31b2b6[_0x2c52('1cc','NitO')](-0x1,_0x5edadc-=0x3)&&_0x332b09[_0x2c52('1cd','*hfU')](0xef,0xbf,0xbd);continue;}if(_0x31b2b6[_0x2c52('1ce','4Sdp')](_0x31b2b6[_0x2c52('1cf','i]!7')](_0x5978a6,0x1),_0x3b1d7c)){_0x31b2b6[_0x2c52('1d0','iLXO')](-0x1,_0x5edadc-=0x3)&&_0x332b09[_0x2c52('1d1','4Sdp')](0xef,0xbf,0xbd);continue;}_0x5a84c6=_0x305ee2;continue;}else{nonce_str+=aa[Math[_0x31b2b6[_0x2c52('1d2','bAWe')]](_0x31b2b6[_0x2c52('1d3','^q0S')](Math[_0x2c52('1d4','NitO')](),0x3d))];}}if(_0x31b2b6[_0x2c52('1d5','e9kP')](_0x305ee2,0xdc00)){_0x31b2b6[_0x2c52('1d6','PI3P')](-0x1,_0x5edadc-=0x3)&&_0x332b09[_0x2c52('1d7','bAWe')](0xef,0xbf,0xbd),_0x5a84c6=_0x305ee2;continue;}_0x305ee2=_0x31b2b6[_0x2c52('1d8','dSN0')](0x10000,_0x31b2b6[_0x2c52('1d9','f)%V')](_0x31b2b6[_0x2c52('1da','Vby[')](_0x31b2b6[_0x2c52('1db','3ve5')](_0x5a84c6,0xd800),0xa),_0x31b2b6[_0x2c52('1dc','*!&A')](_0x305ee2,0xdc00)));}else _0x5a84c6&&_0x31b2b6[_0x2c52('1dd','*UL$')](-0x1,_0x5edadc-=0x3)&&_0x332b09[_0x2c52('1de','yAXd')](0xef,0xbf,0xbd);if(_0x5a84c6=null,_0x31b2b6[_0x2c52('1df','mEzA')](_0x305ee2,0x80)){if(_0x31b2b6[_0x2c52('1e0','i]!7')](--_0x5edadc,0x0))break;_0x332b09[_0x2c52('1e1','epvv')](_0x305ee2);}else if(_0x31b2b6[_0x2c52('1e2','DVA(')](_0x305ee2,0x800)){if(_0x31b2b6[_0x2c52('1e3','3f#n')](_0x31b2b6[_0x2c52('1e4','*UL$')],_0x31b2b6[_0x2c52('1e5','f)%V')])){if(_0x31b2b6[_0x2c52('1e6','MvbD')](_0x5edadc-=0x2,0x0))break;_0x332b09[_0x2c52('1e7','PI3P')](_0x31b2b6[_0x2c52('1e8','NitO')](_0x31b2b6[_0x2c52('1e9','VABv')](_0x305ee2,0x6),0xc0),_0x31b2b6[_0x2c52('1ea','mEzA')](_0x31b2b6[_0x2c52('1eb','3rxq')](0x3f,_0x305ee2),0x80));}else{return _0x151140[_0x2c52('1c6','*hfU')](0x0);}}else if(_0x31b2b6[_0x2c52('1ec','&f!p')](_0x305ee2,0x10000)){if(_0x31b2b6[_0x2c52('1ed','Z[^%')](_0x5edadc-=0x3,0x0))break;_0x332b09[_0x2c52('1ee','Z2Ur')](_0x31b2b6[_0x2c52('1ef','*!&A')](_0x31b2b6[_0x2c52('1f0','NsH8')](_0x305ee2,0xc),0xe0),_0x31b2b6[_0x2c52('1f1','bFIi')](_0x31b2b6[_0x2c52('1f2','*UL$')](_0x31b2b6[_0x2c52('1f3','4Sdp')](_0x305ee2,0x6),0x3f),0x80),_0x31b2b6[_0x2c52('1f4','%Uh$')](_0x31b2b6[_0x2c52('1f5','3f#n')](0x3f,_0x305ee2),0x80));}else{if(!_0x31b2b6[_0x2c52('1f6','bFIi')](_0x305ee2,0x110000))throw new Error(_0x31b2b6[_0x2c52('1f7',')]%)')]);if(_0x31b2b6[_0x2c52('1f8','i]!7')](_0x5edadc-=0x4,0x0))break;_0x332b09[_0x2c52('1f9','XSgs')](_0x31b2b6[_0x2c52('1fa','dCuC')](_0x31b2b6[_0x2c52('1fb','bAWe')](_0x305ee2,0x12),0xf0),_0x31b2b6[_0x2c52('1fc','LlZw')](_0x31b2b6[_0x2c52('1fd','VABv')](_0x31b2b6[_0x2c52('1fe','Z2Ur')](_0x305ee2,0xc),0x3f),0x80),_0x31b2b6[_0x2c52('1ff','$K@r')](_0x31b2b6[_0x2c52('200','NsH8')](_0x31b2b6[_0x2c52('201','mEzA')](_0x305ee2,0x6),0x3f),0x80),_0x31b2b6[_0x2c52('202','FOBd')](_0x31b2b6[_0x2c52('203','@r)e')](0x3f,_0x305ee2),0x80));}}}return _0x332b09;};_0xodB='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
