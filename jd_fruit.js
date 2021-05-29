/*
东东水果:脚本更新地址 https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js
更新时间：2021-5-18
活动入口：京东APP我的-更多工具-东东农场
东东农场活动链接：https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
互助码shareCode请先手动运行脚本查看打印可看到
一天只能帮助3个人。多出的助力码无效
==========================Quantumultx=========================
[task_local]
#jd免费水果
5 6-18/6 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js, tag=东东农场, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdnc.png, enabled=true
=========================Loon=============================
[Script]
cron "5 6-18/6 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js,tag=东东农场

=========================Surge============================
东东农场 = type=cron,cronexp="5 6-18/6 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js

=========================小火箭===========================
东东农场 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js, cronexpr="5 6-18/6 * * *", timeout=3600, enable=true

jd免费水果 搬的https://github.com/liuxiaoyucc/jd-helper/blob/a6f275d9785748014fc6cca821e58427162e9336/fruit/fruit.js
*/
const $ = new Env('东东农场');
let cookiesArr = [], cookie = '', jdFruitShareArr = [], isBox = false, notify, newShareCodes, allMessage = '';
//助力好友分享码(最多3个,否则后面的助力失败),原因:京东农场每人每天只有3次助力机会
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // 这个列表填入你要助力的好友的shareCode
   //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  '0a74407df5df4fa99672a037eec61f7e@dbb21614667246fabcfd9685b6f448f3@6fbd26cc27ac44d6a7fed34092453f77@61ff5c624949454aa88561f2cd721bf6@56db8e7bc5874668ba7d5195230d067a@b9d287c974cc498d94112f1b064cf934@23b49f5a106b4d61b2ea505d5a4e1056@8107cad4b82847a698ca7d7de9115f36',
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  'b1638a774d054a05a30a17d3b4d364b8@f92cb56c6a1349f5a35f0372aa041ea0@9c52670d52ad4e1a812f894563c746ea@8175509d82504e96828afc8b1bbb9cb3@2673c3777d4443829b2a635059953a28@d2d5d435675544679413cb9145577e0f',
]
let message = '', subTitle = '', option = {}, isFruitFinished = false;
const retainWater = 100;//保留水滴大于多少g,默认100g;
let jdNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
let jdFruitBeanCard = false;//农场使用水滴换豆卡(如果出现限时活动时100g水换20豆,此时比浇水划算,推荐换豆),true表示换豆(不浇水),false表示不换豆(继续浇水),脚本默认是浇水
let randomCount = $.isNode() ? 20 : 5;
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const urlSchema = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html%22%20%7D`;
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      option = {};
      await shareCodesFormat();
      await jdFruit();
    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdFruit() {
  subTitle = `【京东账号${$.index}】${$.nickName}`;
  try {
    await helpAuthor();
    await initForFarm();
    if ($.farmInfo.farmUserPro) {
      // option['media-url'] = $.farmInfo.farmUserPro.goodsImage;
      message = `【水果名称】${$.farmInfo.farmUserPro.name}\n`;
      console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.farmInfo.farmUserPro.shareCode}\n`);
      console.log(`\n【已成功兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`);
      message += `【已兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`;
      await masterHelpShare();//助力好友
      if ($.farmInfo.treeState === 2 || $.farmInfo.treeState === 3) {
        option['open-url'] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看`);
        }
        return
      } else if ($.farmInfo.treeState === 1) {
        console.log(`\n${$.farmInfo.farmUserPro.name}种植中...\n`)
      } else if ($.farmInfo.treeState === 0) {
        //已下单购买, 但未开始种植新的水果
        option['open-url'] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】 ${$.nickName || $.UserName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 您忘了种植新的水果`, `京东账号${$.index} ${$.nickName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果`);
        }
        return
      }
      await doDailyTask();
      await doTenWater();//浇水十次
      await getFirstWaterAward();//领取首次浇水奖励
      await getTenWaterAward();//领取10浇水奖励
      await getWaterFriendGotAward();//领取为2好友浇水奖励
      await duck();
      await doTenWaterAgain();//再次浇水
      await predictionFruit();//预测水果成熟时间
    } else {
      console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify($.farmInfo)}`);
      message = `【数据异常】请手动登录京东app查看此账号${$.name}是否正常`;
    }
  } catch (e) {
    console.log(`任务执行异常，请检查执行日志 ‼️‼️`);
    $.logErr(e);
    const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;
    if ($.isNode()) await notify.sendNotify(`${$.name}`, errMsg);
    $.msg($.name, '', `${errMsg}`)
  }
  await showMsg();
}
async function doDailyTask() {
  await taskInitForFarm();
  console.log(`开始签到`);
  if (!$.farmTask.signInit.todaySigned) {
    await signForFarm(); //签到
    if ($.signResult.code === "0") {
      console.log(`【签到成功】获得${$.signResult.amount}g💧\\n`)
      //message += `【签到成功】获得${$.signResult.amount}g💧\n`//连续签到${signResult.signDay}天
    } else {
      // message += `签到失败,详询日志\n`;
      console.log(`签到结果:  ${JSON.stringify($.signResult)}`);
    }
  } else {
    console.log(`今天已签到,连续签到${$.farmTask.signInit.totalSigned},下次签到可得${$.farmTask.signInit.signEnergyEachAmount}g\n`);
  }
  // 被水滴砸中
  console.log(`被水滴砸中： ${$.farmInfo.todayGotWaterGoalTask.canPop ? '是' : '否'}`);
  if ($.farmInfo.todayGotWaterGoalTask.canPop) {
    await gotWaterGoalTaskForFarm();
    if ($.goalResult.code === '0') {
      console.log(`【被水滴砸中】获得${$.goalResult.addEnergy}g💧\\n`);
      // message += `【被水滴砸中】获得${$.goalResult.addEnergy}g💧\n`
    }
  }
  console.log(`签到结束,开始广告浏览任务`);
  if (!$.farmTask.gotBrowseTaskAdInit.f) {
    let adverts = $.farmTask.gotBrowseTaskAdInit.userBrowseTaskAds
    let browseReward = 0
    let browseSuccess = 0
    let browseFail = 0
    for (let advert of adverts) { //开始浏览广告
      if (advert.limit <= advert.hadFinishedTimes) {
        // browseReward+=advert.reward
        console.log(`${advert.mainTitle}+ ' 已完成`);//,获得${advert.reward}g
        continue;
      }
      console.log('正在进行广告浏览任务: ' + advert.mainTitle);
      await browseAdTaskForFarm(advert.advertId, 0);
      if ($.browseResult.code === '0') {
        console.log(`${advert.mainTitle}浏览任务完成`);
        //领取奖励
        await browseAdTaskForFarm(advert.advertId, 1);
        if ($.browseRwardResult.code === '0') {
          console.log(`领取浏览${advert.mainTitle}广告奖励成功,获得${$.browseRwardResult.amount}g`)
          browseReward += $.browseRwardResult.amount
          browseSuccess++
        } else {
          browseFail++
          console.log(`领取浏览广告奖励结果:  ${JSON.stringify($.browseRwardResult)}`)
        }
      } else {
        browseFail++
        console.log(`广告浏览任务结果:   ${JSON.stringify($.browseResult)}`);
      }
    }
    if (browseFail > 0) {
      console.log(`【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\\n`);
      // message += `【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\n`;
    } else {
      console.log(`【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`);
      // message += `【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`;
    }
  } else {
    console.log(`今天已经做过浏览广告任务\n`);
  }
  //定时领水
  if (!$.farmTask.gotThreeMealInit.f) {
    //
    await gotThreeMealForFarm();
    if ($.threeMeal.code === "0") {
      console.log(`【定时领水】获得${$.threeMeal.amount}g💧\n`);
      // message += `【定时领水】获得${$.threeMeal.amount}g💧\n`;
    } else {
      // message += `【定时领水】失败,详询日志\n`;
      console.log(`定时领水成功结果:  ${JSON.stringify($.threeMeal)}`);
    }
  } else {
    console.log('当前不在定时领水时间断或者已经领过\n')
  }
  //给好友浇水
  if (!$.farmTask.waterFriendTaskInit.f) {
    if ($.farmTask.waterFriendTaskInit.waterFriendCountKey < $.farmTask.waterFriendTaskInit.waterFriendMax) {
      await doFriendsWater();
    }
  } else {
    console.log(`给${$.farmTask.waterFriendTaskInit.waterFriendMax}个好友浇水任务已完成\n`)
  }
  // await Promise.all([
  //   clockInIn(),//打卡领水
  //   executeWaterRains(),//水滴雨
  //   masterHelpShare(),//助力好友
  //   getExtraAward(),//领取额外水滴奖励
  //   turntableFarm()//天天抽奖得好礼
  // ])
  await getAwardInviteFriend();
  await clockInIn();//打卡领水
  await executeWaterRains();//水滴雨
  await getExtraAward();//领取额外水滴奖励
  await turntableFarm()//天天抽奖得好礼
}
async function predictionFruit() {
  console.log('开始预测水果成熟时间\n');
  await initForFarm();
  await taskInitForFarm();
  let waterEveryDayT = $.farmTask.totalWaterTaskInit.totalWaterTaskTimes;//今天到到目前为止，浇了多少次水
  message += `【今日共浇水】${waterEveryDayT}次\n`;
  message += `【剩余 水滴】${$.farmInfo.farmUserPro.totalEnergy}g💧\n`;
  message += `【水果🍉进度】${(($.farmInfo.farmUserPro.treeEnergy / $.farmInfo.farmUserPro.treeTotalEnergy) * 100).toFixed(2)}%，已浇水${$.farmInfo.farmUserPro.treeEnergy / 10}次,还需${($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10}次\n`
  if ($.farmInfo.toFlowTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
    message += `【开花进度】再浇水${$.farmInfo.toFlowTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次开花\n`
  } else if ($.farmInfo.toFruitTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
    message += `【结果进度】再浇水${$.farmInfo.toFruitTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次结果\n`
  }
  // 预测n天后水果课可兑换功能
  let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10;//一共还需浇多少次水

  let waterD = Math.ceil(waterTotalT / waterEveryDayT);

  message += `【预测】${waterD === 1 ? '明天' : waterD === 2 ? '后天' : waterD + '天之后'}(${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日)可兑换水果🍉`
}
//浇水十次
async function doTenWater() {
  jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  await myCardInfoForFarm();
  const { fastCard, doubleCard, beanCard, signCard  } = $.myCardInfoRes;
  if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match(`限时翻倍`) && beanCard > 0) {
    console.log(`您设置的是使用水滴换豆卡，且背包有水滴换豆卡${beanCard}张, 跳过10次浇水任务`)
    return
  }
  if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    console.log(`\n准备浇水十次`);
    let waterCount = 0;
    isFruitFinished = false;
    for (; waterCount < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit - $.farmTask.totalWaterTaskInit.totalWaterTaskTimes; waterCount++) {
      console.log(`第${waterCount + 1}次浇水`);
      await waterGoodForFarm();
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log(`剩余水滴${$.waterResult.totalEnergy}g`);
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          if ($.waterResult.totalEnergy < 10) {
            console.log(`水滴不够，结束浇水`)
            break
          }
          await gotStageAward();//领取阶段性水滴奖励
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log('\n今日已完成10次浇水任务\n');
  }
}
//领取首次浇水奖励
async function getFirstWaterAward() {
  await taskInitForFarm();
  //领取首次浇水奖励
  if (!$.farmTask.firstWaterInit.f && $.farmTask.firstWaterInit.totalWaterTimes > 0) {
    await firstWaterTaskForFarm();
    if ($.firstWaterReward.code === '0') {
      console.log(`【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`);
      // message += `【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`;
    } else {
      // message += '【首次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取首次浇水奖励结果:  ${JSON.stringify($.firstWaterReward)}`);
    }
  } else {
    console.log('首次浇水奖励已领取\n')
  }
}
//领取十次浇水奖励
async function getTenWaterAward() {
  //领取10次浇水奖励
  if (!$.farmTask.totalWaterTaskInit.f && $.farmTask.totalWaterTaskInit.totalWaterTaskTimes >= $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    await totalWaterTaskForFarm();
    if ($.totalWaterReward.code === '0') {
      console.log(`【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`);
      // message += `【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`;
    } else {
      // message += '【十次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取10次浇水奖励结果:  ${JSON.stringify($.totalWaterReward)}`);
    }
  } else if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    // message += `【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`;
    console.log(`【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`);
  }
  console.log('finished 水果任务完成!');
}
//再次浇水
async function doTenWaterAgain() {
  console.log('开始检查剩余水滴能否再次浇水再次浇水\n');
  await initForFarm();
  let totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  console.log(`剩余水滴${totalEnergy}g\n`);
  await myCardInfoForFarm();
  const { fastCard, doubleCard, beanCard, signCard  } = $.myCardInfoRes;
  console.log(`背包已有道具:\n快速浇水卡:${fastCard === -1 ? '未解锁': fastCard + '张'}\n水滴翻倍卡:${doubleCard === -1 ? '未解锁': doubleCard + '张'}\n水滴换京豆卡:${beanCard === -1 ? '未解锁' : beanCard + '张'}\n加签卡:${signCard === -1 ? '未解锁' : signCard + '张'}\n`)
  if (totalEnergy >= 100 && doubleCard > 0) {
    //使用翻倍水滴卡
    for (let i = 0; i < new Array(doubleCard).fill('').length; i++) {
      await userMyCardForFarm('doubleCard');
      console.log(`使用翻倍水滴卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    await initForFarm();
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  if (signCard > 0) {
    //使用加签卡
    for (let i = 0; i < new Array(signCard).fill('').length; i++) {
      await userMyCardForFarm('signCard');
      console.log(`使用加签卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    await initForFarm();
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match('限时翻倍')) {
    console.log(`\n您设置的是水滴换豆功能,现在为您换豆`);
    if (totalEnergy >= 100 && $.myCardInfoRes.beanCard > 0) {
      //使用水滴换豆卡
      await userMyCardForFarm('beanCard');
      console.log(`使用水滴换豆卡结果:${JSON.stringify($.userMyCardRes)}`);
      if ($.userMyCardRes.code === '0') {
        message += `【水滴换豆卡】获得${$.userMyCardRes.beanCount}个京豆\n`;
        return
      }
    } else {
      console.log(`您目前水滴:${totalEnergy}g,水滴换豆卡${$.myCardInfoRes.beanCard}张,暂不满足水滴换豆的条件,为您继续浇水`)
    }
  }
  // if (totalEnergy > 100 && $.myCardInfoRes.fastCard > 0) {
  //   //使用快速浇水卡
  //   await userMyCardForFarm('fastCard');
  //   console.log(`使用快速浇水卡结果:${JSON.stringify($.userMyCardRes)}`);
  //   if ($.userMyCardRes.code === '0') {
  //     console.log(`已使用快速浇水卡浇水${$.userMyCardRes.waterEnergy}g`);
  //   }
  //   await initForFarm();
  //   totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  // }
  // 所有的浇水(10次浇水)任务，获取水滴任务完成后，如果剩余水滴大于等于60g,则继续浇水(保留部分水滴是用于完成第二天的浇水10次的任务)
  let overageEnergy = totalEnergy - retainWater;
  if (totalEnergy >= ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy)) {
    //如果现有的水滴，大于水果可兑换所需的对滴(也就是把水滴浇完，水果就能兑换了)
    isFruitFinished = false;
    for (let i = 0; i < ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; i++) {
      await waterGoodForFarm();
      console.log(`本次浇水结果(水果马上就可兑换了):   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log('\n浇水10g成功\n');
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          console.log(`目前水滴【${$.waterResult.totalEnergy}】g,继续浇水，水果马上就可以兑换了`)
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else if (overageEnergy >= 10) {
    console.log("目前剩余水滴：【" + totalEnergy + "】g，可继续浇水");
    isFruitFinished = false;
    for (let i = 0; i < parseInt(overageEnergy / 10); i++) {
      await waterGoodForFarm();
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log(`\n浇水10g成功,剩余${$.waterResult.totalEnergy}\n`)
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          await gotStageAward()
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log("目前剩余水滴：【" + totalEnergy + "】g,不再继续浇水,保留部分水滴用于完成第二天【十次浇水得水滴】任务")
  }
}
//领取阶段性水滴奖励
function gotStageAward() {
  return new Promise(async resolve => {
    if ($.waterResult.waterStatus === 0 && $.waterResult.treeEnergy === 10) {
      console.log('果树发芽了,奖励30g水滴');
      await gotStageAwardForFarm('1');
      console.log(`浇水阶段奖励1领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`;
        console.log(`【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`);
      }
    } else if ($.waterResult.waterStatus === 1) {
      console.log('果树开花了,奖励40g水滴');
      await gotStageAwardForFarm('2');
      console.log(`浇水阶段奖励2领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    } else if ($.waterResult.waterStatus === 2) {
      console.log('果树长出小果子啦, 奖励50g水滴');
      await gotStageAwardForFarm('3');
      console.log(`浇水阶段奖励3领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`)
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    }
    resolve()
  })
}
//天天抽奖活动
async function turntableFarm() {
  await initForTurntableFarm();
  if ($.initForTurntableFarmRes.code === '0') {
    //领取定时奖励 //4小时一次
    let {timingIntervalHours, timingLastSysTime, sysTime, timingGotStatus, remainLotteryTimes, turntableInfos} = $.initForTurntableFarmRes;

    if (!timingGotStatus) {
      console.log(`是否到了领取免费赠送的抽奖机会----${sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)}`)
      if (sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)) {
        await timingAwardForTurntableFarm();
        console.log(`领取定时奖励结果${JSON.stringify($.timingAwardRes)}`);
        await initForTurntableFarm();
        remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
      } else {
        console.log(`免费赠送的抽奖机会未到时间`)
      }
    } else {
      console.log('4小时候免费赠送的抽奖机会已领取')
    }
    if ($.initForTurntableFarmRes.turntableBrowserAds && $.initForTurntableFarmRes.turntableBrowserAds.length > 0) {
      for (let index = 0; index < $.initForTurntableFarmRes.turntableBrowserAds.length; index++) {
        if (!$.initForTurntableFarmRes.turntableBrowserAds[index].status) {
          console.log(`开始浏览天天抽奖的第${index + 1}个逛会场任务`)
          await browserForTurntableFarm(1, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
          if ($.browserForTurntableFarmRes.code === '0' && $.browserForTurntableFarmRes.status) {
            console.log(`第${index + 1}个逛会场任务完成，开始领取水滴奖励\n`)
            await browserForTurntableFarm(2, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
            if ($.browserForTurntableFarmRes.code === '0') {
              console.log(`第${index + 1}个逛会场任务领取水滴奖励完成\n`)
              await initForTurntableFarm();
              remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
            }
          }
        } else {
          console.log(`浏览天天抽奖的第${index + 1}个逛会场任务已完成`)
        }
      }
    }
    //天天抽奖助力
    console.log('开始天天抽奖--好友助力--每人每天只有三次助力机会.')
    for (let code of newShareCodes) {
      if (code === $.farmInfo.farmUserPro.shareCode) {
        console.log('天天抽奖-不能自己给自己助力\n')
        continue
      }
      await lotteryMasterHelp(code);
      // console.log('天天抽奖助力结果',lotteryMasterHelpRes.helpResult)
      if ($.lotteryMasterHelpRes.helpResult.code === '0') {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}成功\n`)
      } else if ($.lotteryMasterHelpRes.helpResult.code === '11') {
        console.log(`天天抽奖-不要重复助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}\n`)
      } else if ($.lotteryMasterHelpRes.helpResult.code === '13') {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}失败,助力次数耗尽\n`);
        break;
      }
    }
    console.log(`---天天抽奖次数remainLotteryTimes----${remainLotteryTimes}次`)
    //抽奖
    if (remainLotteryTimes > 0) {
      console.log('开始抽奖')
      let lotteryResult = '';
      for (let i = 0; i < new Array(remainLotteryTimes).fill('').length; i++) {
        await lotteryForTurntableFarm()
        console.log(`第${i + 1}次抽奖结果${JSON.stringify($.lotteryRes)}`);
        if ($.lotteryRes.code === '0') {
          turntableInfos.map((item) => {
            if (item.type === $.lotteryRes.type) {
              console.log(`lotteryRes.type${$.lotteryRes.type}`);
              if ($.lotteryRes.type.match(/bean/g) && $.lotteryRes.type.match(/bean/g)[0] === 'bean') {
                lotteryResult += `${item.name}个，`;
              } else if ($.lotteryRes.type.match(/water/g) && $.lotteryRes.type.match(/water/g)[0] === 'water') {
                lotteryResult += `${item.name}，`;
              } else {
                lotteryResult += `${item.name}，`;
              }
            }
          })
          //没有次数了
          if ($.lotteryRes.remainLotteryTimes === 0) {
            break
          }
        }
      }
      if (lotteryResult) {
        console.log(`【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`)
        // message += `【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`;
      }
    }  else {
      console.log('天天抽奖--抽奖机会为0次')
    }
  } else {
    console.log('初始化天天抽奖得好礼失败')
  }
}
//领取额外奖励水滴
async function getExtraAward() {
  await masterHelpTaskInitForFarm();
  if ($.masterHelpResult.code === '0') {
    if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length >= 5) {
      // 已有五人助力。领取助力后的奖励
      if (!$.masterHelpResult.masterGotFinal) {
        await masterGotFinishedTaskForFarm();
        if ($.masterGotFinished.code === '0') {
          console.log(`已成功领取好友助力奖励：【${$.masterGotFinished.amount}】g水`);
          message += `【额外奖励】${$.masterGotFinished.amount}g水领取成功\n`;
        }
      } else {
        console.log("已经领取过5好友助力额外奖励");
        message += `【额外奖励】已被领取过\n`;
      }
    } else {
      console.log("助力好友未达到5个");
      message += `【额外奖励】领取失败,原因：给您助力的人未达5个\n`;
    }
    if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length > 0) {
      let str = '';
      $.masterHelpResult.masterHelpPeoples.map((item, index) => {
        if (index === ($.masterHelpResult.masterHelpPeoples.length - 1)) {
          str += item.nickName || "匿名用户";
        } else {
          str += (item.nickName || "匿名用户") + ',';
        }
        let date = new Date(item.time);
        let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes();
        console.log(`\n京东昵称【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力\n`);
      })
      message += `【助力您的好友】${str}\n`;
    }
    console.log('领取额外奖励水滴结束\n');
  }
}
//助力好友
async function masterHelpShare() {
  console.log('开始助力好友')
  let salveHelpAddWater = 0;
  let remainTimes = 3;//今日剩余助力次数,默认3次（京东农场每人每天3次助力机会）。
  let helpSuccessPeoples = '';//成功助力好友
  console.log(`格式化后的助力码::${JSON.stringify(newShareCodes)}\n`);

  for (let code of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName}的好友: ${code}`);
    if (!code) continue;
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log('不能为自己助力哦，跳过自己的shareCode\n')
      continue
    }
    await masterHelp(code);
    if ($.helpResult.code === '0') {
      if ($.helpResult.helpResult.code === '0') {
        //助力成功
        salveHelpAddWater += $.helpResult.helpResult.salveHelpAddWater;
        console.log(`【助力好友结果】: 已成功给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力`);
        console.log(`给好友【${$.helpResult.helpResult.masterUserInfo.nickName}】助力获得${$.helpResult.helpResult.salveHelpAddWater}g水滴`)
        helpSuccessPeoples += ($.helpResult.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
      } else if ($.helpResult.helpResult.code === '8') {
        console.log(`【助力好友结果】: 助力【${$.helpResult.helpResult.masterUserInfo.nickName}】失败，您今天助力次数已耗尽`);
      } else if ($.helpResult.helpResult.code === '9') {
        console.log(`【助力好友结果】: 之前给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力过了`);
      } else if ($.helpResult.helpResult.code === '10') {
        console.log(`【助力好友结果】: 好友【${$.helpResult.helpResult.masterUserInfo.nickName}】已满五人助力`);
      } else {
        console.log(`助力其他情况：${JSON.stringify($.helpResult.helpResult)}`);
      }
      console.log(`【今日助力次数还剩】${$.helpResult.helpResult.remainTimes}次\n`);
      remainTimes = $.helpResult.helpResult.remainTimes;
      if ($.helpResult.helpResult.remainTimes === 0) {
        console.log(`您当前助力次数已耗尽，跳出助力`);
        break
      }
    } else {
      console.log(`助力失败::${JSON.stringify($.helpResult)}`);
    }
  }
  if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    let helpSuccessPeoplesKey = timeFormat() + $.farmInfo.farmUserPro.shareCode;
    if (!$.getdata(helpSuccessPeoplesKey)) {
      //把前一天的清除
      $.setdata('', timeFormat(Date.now() - 24 * 60 * 60 * 1000) + $.farmInfo.farmUserPro.shareCode);
      $.setdata('', helpSuccessPeoplesKey);
    }
    if (helpSuccessPeoples) {
      if ($.getdata(helpSuccessPeoplesKey)) {
        $.setdata($.getdata(helpSuccessPeoplesKey) + ',' + helpSuccessPeoples, helpSuccessPeoplesKey);
      } else {
        $.setdata(helpSuccessPeoples, helpSuccessPeoplesKey);
      }
    }
    helpSuccessPeoples = $.getdata(helpSuccessPeoplesKey);
  }
  if (helpSuccessPeoples && helpSuccessPeoples.length > 0) {
    message += `【您助力的好友👬】${helpSuccessPeoples.substr(0, helpSuccessPeoples.length - 1)}\n`;
  }
  if (salveHelpAddWater > 0) {
    // message += `【助力好友👬】获得${salveHelpAddWater}g💧\n`;
    console.log(`【助力好友👬】获得${salveHelpAddWater}g💧\n`);
  }
  message += `【今日剩余助力👬】${remainTimes}次\n`;
  console.log('助力好友结束，即将开始领取额外水滴奖励\n');
}
//水滴雨
async function executeWaterRains() {
  let executeWaterRain = !$.farmTask.waterRainInit.f;
  if (executeWaterRain) {
    console.log(`水滴雨任务，每天两次，最多可得10g水滴`);
    console.log(`两次水滴雨任务是否全部完成：${$.farmTask.waterRainInit.f ? '是' : '否'}`);
    if ($.farmTask.waterRainInit.lastTime) {
      if (Date.now() < ($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000)) {
        executeWaterRain = false;
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`;
        console.log(`\`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`);
      }
    }
    if (executeWaterRain) {
      console.log(`开始水滴雨任务,这是第${$.farmTask.waterRainInit.winTimes + 1}次，剩余${2 - ($.farmTask.waterRainInit.winTimes + 1)}次`);
      await waterRainForFarm();
      console.log('水滴雨waterRain');
      if ($.waterRain.code === '0') {
        console.log('水滴雨任务执行成功，获得水滴：' + $.waterRain.addEnergy + 'g');
        console.log(`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`);
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`;
      }
    }
  } else {
    // message += `【水滴雨】已全部完成，获得20g💧\n`;
  }
}
//打卡领水活动
async function clockInIn() {
  console.log('开始打卡领水活动（签到，关注，领券）');
  await clockInInitForFarm();
  if ($.clockInInit.code === '0') {
    // 签到得水滴
    if (!$.clockInInit.todaySigned) {
      console.log('开始今日签到');
      await clockInForFarm();
      console.log(`打卡结果${JSON.stringify($.clockInForFarmRes)}`);
      if ($.clockInForFarmRes.code === '0') {
        // message += `【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`;
        console.log(`【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`)
        if ($.clockInForFarmRes.signDay === 7) {
          //可以领取惊喜礼包
          console.log('开始领取--惊喜礼包38g水滴');
          await gotClockInGift();
          if ($.gotClockInGiftRes.code === '0') {
            // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
            console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
          }
        }
      }
    }
    if ($.clockInInit.todaySigned && $.clockInInit.totalSigned === 7) {
      console.log('开始领取--惊喜礼包38g水滴');
      await gotClockInGift();
      if ($.gotClockInGiftRes.code === '0') {
        // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
        console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
      }
    }
    // 限时关注得水滴
    if ($.clockInInit.themes && $.clockInInit.themes.length > 0) {
      for (let item of $.clockInInit.themes) {
        if (!item.hadGot) {
          console.log(`关注ID${item.id}`);
          await clockInFollowForFarm(item.id, "theme", "1");
          console.log(`themeStep1--结果${JSON.stringify($.themeStep1)}`);
          if ($.themeStep1.code === '0') {
            await clockInFollowForFarm(item.id, "theme", "2");
            console.log(`themeStep2--结果${JSON.stringify($.themeStep2)}`);
            if ($.themeStep2.code === '0') {
              console.log(`关注${item.name}，获得水滴${$.themeStep2.amount}g`);
            }
          }
        }
      }
    }
    // 限时领券得水滴
    if ($.clockInInit.venderCoupons && $.clockInInit.venderCoupons.length > 0) {
      for (let item of $.clockInInit.venderCoupons) {
        if (!item.hadGot) {
          console.log(`领券的ID${item.id}`);
          await clockInFollowForFarm(item.id, "venderCoupon", "1");
          console.log(`venderCouponStep1--结果${JSON.stringify($.venderCouponStep1)}`);
          if ($.venderCouponStep1.code === '0') {
            await clockInFollowForFarm(item.id, "venderCoupon", "2");
            if ($.venderCouponStep2.code === '0') {
              console.log(`venderCouponStep2--结果${JSON.stringify($.venderCouponStep2)}`);
              console.log(`从${item.name}领券，获得水滴${$.venderCouponStep2.amount}g`);
            }
          }
        }
      }
    }
  }
  console.log('开始打卡领水活动（签到，关注，领券）结束\n');
}
//
async function getAwardInviteFriend() {
  await friendListInitForFarm();//查询好友列表
  // console.log(`查询好友列表数据：${JSON.stringify($.friendList)}\n`)
  if ($.friendList) {
    console.log(`\n今日已邀请好友${$.friendList.inviteFriendCount}个 / 每日邀请上限${$.friendList.inviteFriendMax}个`);
    console.log(`开始删除${$.friendList.friends && $.friendList.friends.length}个好友,可拿每天的邀请奖励`);
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      for (let friend of $.friendList.friends) {
        console.log(`\n开始删除好友 [${friend.shareCode}]`);
        const deleteFriendForFarm = await request('deleteFriendForFarm', { "shareCode": `${friend.shareCode}`,"version":8,"channel":1 });
        if (deleteFriendForFarm && deleteFriendForFarm.code === '0') {
          console.log(`删除好友 [${friend.shareCode}] 成功\n`);
        }
      }
    }
    await receiveFriendInvite();//为他人助力,接受邀请成为别人的好友
    if ($.friendList.inviteFriendCount > 0) {
      if ($.friendList.inviteFriendCount > $.friendList.inviteFriendGotAwardCount) {
        console.log('开始领取邀请好友的奖励');
        await awardInviteFriendForFarm();
        console.log(`领取邀请好友的奖励结果：：${JSON.stringify($.awardInviteFriendRes)}`);
      }
    } else {
      console.log('今日未邀请过好友')
    }
  } else {
    console.log(`查询好友列表失败\n`);
  }
}
//给好友浇水
async function doFriendsWater() {
  await friendListInitForFarm();
  console.log('开始给好友浇水...');
  await taskInitForFarm();
  const { waterFriendCountKey, waterFriendMax } = $.farmTask.waterFriendTaskInit;
  console.log(`今日已给${waterFriendCountKey}个好友浇水`);
  if (waterFriendCountKey < waterFriendMax) {
    let needWaterFriends = [];
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      $.friendList.friends.map((item, index) => {
        if (item.friendState === 1) {
          if (needWaterFriends.length < (waterFriendMax - waterFriendCountKey)) {
            needWaterFriends.push(item.shareCode);
          }
        }
      });
      console.log(`需要浇水的好友列表shareCodes:${JSON.stringify(needWaterFriends)}`);
      let waterFriendsCount = 0, cardInfoStr = '';
      for (let index = 0; index < needWaterFriends.length; index ++) {
        await waterFriendForFarm(needWaterFriends[index]);
        console.log(`为第${index+1}个好友浇水结果:${JSON.stringify($.waterFriendForFarmRes)}\n`)
        if ($.waterFriendForFarmRes.code === '0') {
          waterFriendsCount ++;
          if ($.waterFriendForFarmRes.cardInfo) {
            console.log('为好友浇水获得道具了');
            if ($.waterFriendForFarmRes.cardInfo.type === 'beanCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴换豆卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'fastCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `快速浇水卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'doubleCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴翻倍卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'signCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `加签卡,`;
            }
          }
        } else if ($.waterFriendForFarmRes.code === '11') {
          console.log('水滴不够,跳出浇水')
        }
      }
      // message += `【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`;
      console.log(`【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`);
      if (cardInfoStr && cardInfoStr.length > 0) {
        // message += `【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`;
        console.log(`【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`);
      }
    } else {
      console.log('您的好友列表暂无好友,快去邀请您的好友吧!')
    }
  } else {
    console.log(`今日已为好友浇水量已达${waterFriendMax}个`)
  }
}
//领取给3个好友浇水后的奖励水滴
async function getWaterFriendGotAward() {
  await taskInitForFarm();
  const { waterFriendCountKey, waterFriendMax, waterFriendSendWater, waterFriendGotAward } = $.farmTask.waterFriendTaskInit
  if (waterFriendCountKey >= waterFriendMax) {
    if (!waterFriendGotAward) {
      await waterFriendGotAwardForFarm();
      console.log(`领取给${waterFriendMax}个好友浇水后的奖励水滴::${JSON.stringify($.waterFriendGotAwardRes)}`)
      if ($.waterFriendGotAwardRes.code === '0') {
        // message += `【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`;
        console.log(`【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`);
      }
    } else {
      console.log(`给好友浇水的${waterFriendSendWater}g水滴奖励已领取\n`);
      // message += `【给${waterFriendMax}好友浇水】奖励${waterFriendSendWater}g水滴已领取\n`;
    }
  } else {
    console.log(`暂未给${waterFriendMax}个好友浇水\n`);
  }
}
//接收成为对方好友的邀请
async function receiveFriendInvite() {
  for (let code of newShareCodes) {
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log('自己不能邀请自己成为好友噢\n')
      continue
    }
    await inviteFriend(code);
    // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes)}`)
    if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '0') {
      console.log(`接收邀请成为好友结果成功,您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
    } else if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '17') {
      console.log(`接收邀请成为好友结果失败,对方已是您的好友`)
    }
  }
  // console.log(`开始接受6fbd26cc27ac44d6a7fed34092453f77的邀请\n`)
  // await inviteFriend('6fbd26cc27ac44d6a7fed34092453f77');
  // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes.helpResult)}`)
  // if ($.inviteFriendRes.helpResult.code === '0') {
  //   console.log(`您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
  // } else if ($.inviteFriendRes.helpResult.code === '17') {
  //   console.log(`对方已是您的好友`)
  // }
}
async function duck() {
  for (let i = 0; i < 10; i++) {
    //这里循环十次
    await getFullCollectionReward();
    if ($.duckRes.code === '0') {
      if (!$.duckRes.hasLimit) {
        console.log(`小鸭子游戏:${$.duckRes.title}`);
        // if ($.duckRes.type !== 3) {
        //   console.log(`${$.duckRes.title}`);
        //   if ($.duckRes.type === 1) {
        //     message += `【小鸭子】为你带回了水滴\n`;
        //   } else if ($.duckRes.type === 2) {
        //     message += `【小鸭子】为你带回快速浇水卡\n`
        //   }
        // }
      } else {
        console.log(`${$.duckRes.title}`)
        break;
      }
    } else if ($.duckRes.code === '10') {
      console.log(`小鸭子游戏达到上限`)
      break;
    }
  }
}
// ========================API调用接口========================
//鸭子，点我有惊喜
async function getFullCollectionReward() {
  return new Promise(resolve => {
    const body = {"type": 2, "version": 6, "channel": 2};
    $.post(taskUrl("getFullCollectionReward", body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东农场: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          if (safeGet(data)) {
            $.duckRes = JSON.parse(data);
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

/**
 * 领取10次浇水奖励API
 */
async function totalWaterTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.totalWaterReward = await request(functionId);
}
//领取首次浇水奖励API
async function firstWaterTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.firstWaterReward = await request(functionId);
}
//领取给3个好友浇水后的奖励水滴API
async function waterFriendGotAwardForFarm() {
  const functionId = arguments.callee.name.toString();
  $.waterFriendGotAwardRes = await request(functionId, {"version": 4, "channel": 1});
}
// 查询背包道具卡API
async function myCardInfoForFarm() {
  const functionId = arguments.callee.name.toString();
  $.myCardInfoRes = await request(functionId, {"version": 5, "channel": 1});
}
//使用道具卡API
async function userMyCardForFarm(cardType) {
  const functionId = arguments.callee.name.toString();
  $.userMyCardRes = await request(functionId, {"cardType": cardType});
}
/**
 * 领取浇水过程中的阶段性奖励
 * @param type
 * @returns {Promise<void>}
 */
async function gotStageAwardForFarm(type) {
  $.gotStageAwardForFarmRes = await request(arguments.callee.name.toString(), {'type': type});
}
//浇水API
async function waterGoodForFarm() {
  await $.wait(1000);
  console.log('等待了1秒');

  const functionId = arguments.callee.name.toString();
  $.waterResult = await request(functionId);
}
// 初始化集卡抽奖活动数据API
async function initForTurntableFarm() {
  $.initForTurntableFarmRes = await request(arguments.callee.name.toString(), {version: 4, channel: 1});
}
async function lotteryForTurntableFarm() {
  await $.wait(2000);
  console.log('等待了2秒');
  $.lotteryRes = await request(arguments.callee.name.toString(), {type: 1, version: 4, channel: 1});
}

async function timingAwardForTurntableFarm() {
  $.timingAwardRes = await request(arguments.callee.name.toString(), {version: 4, channel: 1});
}

async function browserForTurntableFarm(type, adId) {
  if (type === 1) {
    console.log('浏览爆品会场');
  }
  if (type === 2) {
    console.log('天天抽奖浏览任务领取水滴');
  }
  const body = {"type": type,"adId": adId,"version":4,"channel":1};
  $.browserForTurntableFarmRes = await request(arguments.callee.name.toString(), body);
  // 浏览爆品会场8秒
}
//天天抽奖浏览任务领取水滴API
async function browserForTurntableFarm2(type) {
  const body = {"type":2,"adId": type,"version":4,"channel":1};
  $.browserForTurntableFarm2Res = await request('browserForTurntableFarm', body);
}
/**
 * 天天抽奖拿好礼-助力API(每人每天三次助力机会)
 */
async function lotteryMasterHelp() {
  $.lotteryMasterHelpRes = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-3',
    babelChannel: "3",
    version: 4,
    channel: 1
  });
}

//领取5人助力后的额外奖励API
async function masterGotFinishedTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.masterGotFinished = await request(functionId);
}
//助力好友信息API
async function masterHelpTaskInitForFarm() {
  const functionId = arguments.callee.name.toString();
  $.masterHelpResult = await request(functionId);
}
//接受对方邀请,成为对方好友的API
async function inviteFriend() {
  $.inviteFriendRes = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-inviteFriend',
    version: 4,
    channel: 2
  });
}
// 助力好友API
async function masterHelp() {
  $.helpResult = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0],
    babelChannel: "3",
    version: 2,
    channel: 1
  });
}
/**
 * 水滴雨API
 */
async function waterRainForFarm() {
  const functionId = arguments.callee.name.toString();
  const body = {"type": 1, "hongBaoTimes": 100, "version": 3};
  $.waterRain = await request(functionId, body);
}
/**
 * 打卡领水API
 */
async function clockInInitForFarm() {
  const functionId = arguments.callee.name.toString();
  $.clockInInit = await request(functionId);
}

// 连续签到API
async function clockInForFarm() {
  const functionId = arguments.callee.name.toString();
  $.clockInForFarmRes = await request(functionId, {"type": 1});
}

//关注，领券等API
async function clockInFollowForFarm(id, type, step) {
  const functionId = arguments.callee.name.toString();
  let body = {
    id,
    type,
    step
  }
  if (type === 'theme') {
    if (step === '1') {
      $.themeStep1 = await request(functionId, body);
    } else if (step === '2') {
      $.themeStep2 = await request(functionId, body);
    }
  } else if (type === 'venderCoupon') {
    if (step === '1') {
      $.venderCouponStep1 = await request(functionId, body);
    } else if (step === '2') {
      $.venderCouponStep2 = await request(functionId, body);
    }
  }
}

// 领取连续签到7天的惊喜礼包API
async function gotClockInGift() {
  $.gotClockInGiftRes = await request('clockInForFarm', {"type": 2})
}

//定时领水API
async function gotThreeMealForFarm() {
  const functionId = arguments.callee.name.toString();
  $.threeMeal = await request(functionId);
}
/**
 * 浏览广告任务API
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
async function browseAdTaskForFarm(advertId, type) {
  const functionId = arguments.callee.name.toString();
  if (type === 0) {
    $.browseResult = await request(functionId, {advertId, type});
  } else if (type === 1) {
    $.browseRwardResult = await request(functionId, {advertId, type});
  }
}
// 被水滴砸中API
async function gotWaterGoalTaskForFarm() {
  $.goalResult = await request(arguments.callee.name.toString(), {type: 3});
}
//签到API
async function signForFarm() {
  const functionId = arguments.callee.name.toString();
  $.signResult = await request(functionId);
}
/**
 * 初始化农场, 可获取果树及用户信息API
 */
async function initForFarm() {
  return new Promise(resolve => {
    const option =  {
      url: `${JD_API_HOST}?functionId=initForFarm`,
      body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
      headers: {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "cookie": cookie,
        "origin": "https://home.m.jd.com",
        "pragma": "no-cache",
        "referer": "https://home.m.jd.com/myJd/newhome.action",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 10000,
    };
    $.post(option, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东农场: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          if (safeGet(data)) {
            $.farmInfo = JSON.parse(data)
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

// 初始化任务列表API
async function taskInitForFarm() {
  console.log('\n初始化任务列表')
  const functionId = arguments.callee.name.toString();
  $.farmTask = await request(functionId);
}
//获取好友列表API
async function friendListInitForFarm() {
  $.friendList = await request('friendListInitForFarm', {"version": 4, "channel": 1});
  // console.log('aa', aa);
}
// 领取邀请好友的奖励API
async function awardInviteFriendForFarm() {
  $.awardInviteFriendRes = await request('awardInviteFriendForFarm');
}
//为好友浇水API
async function waterFriendForFarm(shareCode) {
  const body = {"shareCode": shareCode, "version": 6, "channel": 1}
  $.waterFriendForFarmRes = await request('waterFriendForFarm', body);
}
async function showMsg() {
  if ($.isNode() && process.env.FRUIT_NOTIFY_CONTROL) {
    $.ctrTemp = `${process.env.FRUIT_NOTIFY_CONTROL}` === 'false';
  } else if ($.getdata('jdFruitNotify')) {
    $.ctrTemp = $.getdata('jdFruitNotify') === 'false';
  } else {
    $.ctrTemp = `${jdNotify}` === 'false';
  }
  if ($.ctrTemp) {
    $.msg($.name, subTitle, message, option);
    if ($.isNode()) {
      allMessage += `${subTitle}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
      // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `${subTitle}\n${message}`);
    }
  } else {
    $.log(`\n${message}\n`);
  }
}

function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
function readShareCode() {
  return new Promise(async resolve => {
    $.get({url: `http://share.turinglabs.net/api/v3/farm/query/${randomCount}/`, timeout: 10000,}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取个${randomCount}码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      // newShareCodes = newShareCodes.concat(readShareCodeRes.data || []);
      newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const jdFruitShareCodes = $.isNode() ? require('./jdFruitShareCodes.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(jdFruitShareCodes).forEach((item) => {
        if (jdFruitShareCodes[item]) {
          $.shareCodesArr.push(jdFruitShareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_fruit_inviter')) $.shareCodesArr = $.getdata('jd_fruit_inviter').split('\n').filter(item => !!item);
      console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata('jd_fruit_inviter') ? $.getdata('jd_fruit_inviter') : '暂无'}\n`);
    }
    // console.log(`$.shareCodesArr::${JSON.stringify($.shareCodesArr)}`)
    // console.log(`jdFruitShareArr账号长度::${$.shareCodesArr.length}`)
    console.log(`您提供了${$.shareCodesArr.length}个账号的农场助力码\n`);
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
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
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
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
function request(function_id, body = {}, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskUrl(function_id, body), (err, resp, data) => {
        try {
          if (err) {
            console.log('\n东东农场: API查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`function_id:${function_id}`)
            $.logErr(err);
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&body=${escape(JSON.stringify(body))}`,
    headers: {
      Cookie: cookie,
      UserAgent: $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    },
    timeout: 10000,
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
var _0xodT='jsjiami.com.v6',_0x57b1=[_0xodT,'w752Q8OA','TsOew5lvwpk=','w6RqFHwU','w483VB1q','IGvDpW1z','P2LDomliw54=','NijConrDhg==','GhlCwr3Dqg==','Py/DjsKgYGg=','wp5jBsKIPg==','ISvDjsKje20=','f8O7TW/DpQ==','woEGFQ4pw4k=','w4nDvcOJwoou','bCHDv2g/wowlN0rCj8OoKQ==','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','w6vDucO1woUC','wrscwrvDm8KOwrXChEYcMcObVMOkPMOiwqHDjcOgw7gZw5QuHnbDl8OfwqlMSTrDvMK/Dw==','RsOtw5rDnMOE','w6AEw4zDkcOnACjDnFrDjA==','HMOOXyV4','wpoJOQs0w4MwwrZZw7Ukwrc=','wpIlw4c9Ig==','wq7CjxvCu20PPGHDocKkbsOW','wr9kfsKEwqXCugzCl8KgwotIwrs=','VcOrwrXDnsOYPBzChsOrwpPChsK0','acOmaisV','JFXCnCYgPQ==','d1vDuDZUwp7CmsOmIsKYFCs=','dG/DicKuWw==','w7U+w6DDvcO1','woZBHcOZw67CiTHDgMO3w5rCi8KtwrTDgcOAw4ZZCmQKwqHDmsOkMcOSwqwyw7kiwrpzamfDjQ==','wrPCoX/CiSNoXg9QHMKYw74=','w7zCh8K/wrLDtsOhw4zDl8O2QsK3WlzDhMOHUMKAVMOf','wrFwVcKVw7vDvQnCm8Kowo5HwqjDuUzDrFhI','YcO7w5Bswps=','w6xKw5I1J8KGTyrDm8KLWG3CqBPCgQsowrEeIRI7wrwVw6h8wq/Dk8Kcwp0mw7bDr8KrA8KZw6YIw4jDsMOLScK5fUcVYMOKwoHCucKMK8K/cMKKw5fDg8O5w77Cph/DrUdBw47CignCgsO0T8KEw7s1wqZMwolFe8Kyw7TCkmvCkHVRw4nCvcKLw6w7ZcOAw51Kw5jCh8KqA1/Dhi9HA8O0w4nDqRpUQ8OnDRZxQBrCiMOpDMK8eSrCrMKvKzTDsChiQMOHLcOGwqUrw5XCsmzCu8OlwoLCox8Mw7/CmAxqwr3CiDnCu8O+MQzCksOnw4gbw44Hw6/CssKqwoJpw5PCh8KawqYZwph+cxLCksOKAcKYwp8fw6YGZMKCMy7CsMKrw5vDsH93dMOwMXo2Z8ODS8OiwpfDnnbDtsKcw5zDgMKPMD9qaFkuKcO1JMOdaMOzNmkmZMOBDX/DrMKkS8K1TwBdw7jDqCZlXcOwJcKwaMOpJQXCnkgOZMO5Ciohw6/Cul1YcQvDucKzAsOmT1rCjlXDnsKTQXDClXh5NG7Cqz18PRLCkcK3McKmBRYM','wpDDvcKjblcjT8KswqstAnrCrMKAw40Ww6UddCoJeX0gYE3ClEQ0CSU+w7fCj8Ktwp0gH8KRwplbR8O6UcOZwohgwqPDkCnCu8Kuw4FFHDo3TD5bbcK7EirDnG3DlsKow4s3TcK2VA==','IS/DrMKKRA==','wpnDicOjw49nwrB2w5TDsUDCjMOAexjCt8OND8KADQMKwr3DvlXDv8OwMQLDh8OxwrJww6jDq1vCm8Kxw7NuwpRrw67CtsOcFAc=','wqNOwqwBb1w=','wq1Fw43Di8O0GwzDjHDCigMyZ8OKEMOCQMOEw6p5w4EffWnDogHDnhDDlMKeO8OKw7JMRSdmUcKEwqRqw4hJwol/','w6YMUyg=','FsO5w4hsZQ==','ccKRL8Omwpg=','JCzDjsKufw==','H0PDg3lE','LnRFw6LDnj/CvhI=','bj3DvyM8w5ZyPgHCi8OmMMKowr8EHMOcw6bDqEh7WMOcLsOMJX9qw4rClMOpZcKdwpAaZsOrScOEI1vCqcK8OMOfw7J+SUZnw7XDiMKBw45vw5QqdzjClcKsOsOYwo1Xw6FxHMOrw5/DgTDCpsKuF8O5wqTChcOKVMKiFmMOw5RRw7/DqcKGPkfCg0JIYXtRWzrDosOhw6rDlcOdUcKgw5hJw4bDlgJ7w7LCun8pw7PCqMOOJsOSwroqwrfCti3DmGXDuhZww6vDqFTDviXCk8KIwonDuFrCvTwSZsK8JcKjU8OZSMO8e8KmXcOOwrldwp7Cp0NawpTCt0x8wrNEYy0EwqPDgsKXw7HDtsK5YAPCtA==','N2rDpcKVw5k=','wqjChsKTWRx/TcO7wrs=','XcO+woA=','wqhGRMKJ','w4zCqcKkwpfDrA==','w4LCtcKww4o=','BTxhwpPDrg==','w6kTw4zDiMOiU3PCinTDgU11IMKZVcOOQcKCw7x/w4xOZWLCvFTCkgnDjcKfNMOKw4F9UjViEcKYw7gsw4kUw4Ymw59bw5BaI8Kbwod8w4PDniLCqwJVFQ==','aznDtS11IQ==','w4x/dMOewqg=','bxMJwpnDtQ==','w5Q3w50dwo4=','w4VHN1Ub','w5sMWjVKw4hKCj4Pw73DvFXDp00dIsKKw5pmwqZbAMOSw6jDicOCwovDp8KcwotqKcOBLB0LHhrDqcONaMOUw6MDwr0HwpfDq8OFwpnDsMOFUmjChsKBwpAYDsKUwoZTwqQWQB9ZB192FzPCuHwtwqZUwotjw5/ClcKKUGTCn8Kqw7bCphBZTMKcEMOvw4LDo8KQJ8K+BsOvbW0/MWnCsFbDqgoxVlfClcO7w7DDs8OwwonCs8KGLkHDiVchwpRNwonCvMOWw43CkjdFVm43QMOqMQZfwp7ChAvDmcORwpnChmLDssKPwpnDsw==','wobDncOIw7Z4','w5Row6suDw==','wrEzw6IIMA==','wrLCgcKvXxZ9','PC1G','wqzDjsKITnZWOMOawpxQY0TDlg==','woRhwpwhdHfCrmklworCvXrDkQ==','OwTCoG/DhA==','dAHDqGhY','wrVwE8KjIA==','KFPDnsK3w55IfMKRFGsIHgE=','WcOrwoE=','cA/Dv1dU','NmnDug==','w4IbJMOfwrzCphkxw5rDj8OFLTs=','a8OmwqbDtsOw','w7lHJGE/wrPDpMKWDMKRwqrDu8Ob','NHR+w6fDow==','LV7ChA==','WsOreiwGw6fCn8OMGMKlCB8Q','eFTDrcKGXcOo','w5YSw4w=','w5Yuw4/DtsO9','woVAGMKxHA==','UBjDrE9z','wphMRsKCwoY=','wpsfKS4E','NMOHw61nVQ==','TGLDusKicw==','TQIbwrvDhg==','w6kTw4zDiMKrRnPDhnfDhhdxK8OZWMOITsOPwqF6w5ANaWTDo0LDm0/DmMKYbMKGwpAdBDFrD8Oaw706w5NJwpJ+woBAw5gLRMKOw4M5wpXCgmbCsh5U','K0XDqV5v','ScObZjoz','wqrDrsKSdlc=','wrg0w6MnPw==','ZCzCkMO3JDnDhElbfMKCwqzCrMKqSsKLw4bCmMKIMxzDv8K/w7AEwprDlgHDu8OBwoMb','wolvwrcIUQ==','w7XCkMK/wovDoQ==','CsOgZD5o','w5bDtMOOwo4/w7I=','w6wpw5g8wrUew6E/SMOg','IV7CkCUy','FMKvdcKjw6g=','wpZZPMOzw7Q=','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','wrrCgsKIHh82TsO5w6wgSMOR','BxDDpcKGXg==','w4wTPsOBwo8=','dDvDqSha','woHDqMKNSlY=','cFrDjQ==','D8Olw65fU8KDw7U0','wrdpSMKswrM=','WHjDgsOiKzDCkzcNwpzDksKnOi/CgAhiwrwpw5nCg0huXWpiVcOWw6ovwpLCg8Obw5JHw4HDgMKKw6VVNMOfdsOIw4ZQw73DmRDCvcK6c2bDmMKHWy/DgW13ScKuworCicKca8K2fHrCj8KJwpFvwoPDnsKNABpIwoAddMOUKMOKZzxLWTcPwrMXw7/Dk0lDTmoYwq7CkRpBwqddQ2HDqgweFMKSw4BCYMOkwo/DiMONw5bCgcOtwptIw4BGw6nCnsO/DMOdw7wJEE8VW3h9w5UAwonDl2J/WQvDv1HDvVnDoT9pRcOpMUI/QsOhw5U2QDHDlDPCvT/CtcKlEUfCrMOawqw2w5pq','bkTDjw==','XEPDpsOqBg==','w7sAw7Iewp0=','LjTusRJOKdjinaUmIeEbLZi.com.v6=='];(function(_0x49253b,_0x2fe206,_0x36460a){var _0x5d62f2=function(_0x586dcf,_0x4ef9fb,_0x8a15d3,_0x1e91b9,_0x20b741){_0x4ef9fb=_0x4ef9fb>>0x8,_0x20b741='po';var _0x573bb4='shift',_0x2f27e9='push';if(_0x4ef9fb<_0x586dcf){while(--_0x586dcf){_0x1e91b9=_0x49253b[_0x573bb4]();if(_0x4ef9fb===_0x586dcf){_0x4ef9fb=_0x1e91b9;_0x8a15d3=_0x49253b[_0x20b741+'p']();}else if(_0x4ef9fb&&_0x8a15d3['replace'](/[LTuRJOKdnUIeEbLZ=]/g,'')===_0x4ef9fb){_0x49253b[_0x2f27e9](_0x1e91b9);}}_0x49253b[_0x2f27e9](_0x49253b[_0x573bb4]());}return 0x8b84e;};return _0x5d62f2(++_0x2fe206,_0x36460a)>>_0x2fe206^_0x36460a;}(_0x57b1,0x80,0x8000));var _0x1979=function(_0xc809b9,_0x255717){_0xc809b9=~~'0x'['concat'](_0xc809b9);var _0x113ed8=_0x57b1[_0xc809b9];if(_0x1979['wgYrPA']===undefined){(function(){var _0x548683=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x14d826='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x548683['atob']||(_0x548683['atob']=function(_0x12c1c8){var _0x51ab55=String(_0x12c1c8)['replace'](/=+$/,'');for(var _0x12a6f1=0x0,_0xa18a75,_0x1d341a,_0x1a80e4=0x0,_0x268e7f='';_0x1d341a=_0x51ab55['charAt'](_0x1a80e4++);~_0x1d341a&&(_0xa18a75=_0x12a6f1%0x4?_0xa18a75*0x40+_0x1d341a:_0x1d341a,_0x12a6f1++%0x4)?_0x268e7f+=String['fromCharCode'](0xff&_0xa18a75>>(-0x2*_0x12a6f1&0x6)):0x0){_0x1d341a=_0x14d826['indexOf'](_0x1d341a);}return _0x268e7f;});}());var _0x457d9c=function(_0x3b6463,_0x255717){var _0x8f0099=[],_0x566f16=0x0,_0x38bceb,_0x1c156f='',_0x2a1d8c='';_0x3b6463=atob(_0x3b6463);for(var _0x142a8f=0x0,_0x16e40b=_0x3b6463['length'];_0x142a8f<_0x16e40b;_0x142a8f++){_0x2a1d8c+='%'+('00'+_0x3b6463['charCodeAt'](_0x142a8f)['toString'](0x10))['slice'](-0x2);}_0x3b6463=decodeURIComponent(_0x2a1d8c);for(var _0x503e09=0x0;_0x503e09<0x100;_0x503e09++){_0x8f0099[_0x503e09]=_0x503e09;}for(_0x503e09=0x0;_0x503e09<0x100;_0x503e09++){_0x566f16=(_0x566f16+_0x8f0099[_0x503e09]+_0x255717['charCodeAt'](_0x503e09%_0x255717['length']))%0x100;_0x38bceb=_0x8f0099[_0x503e09];_0x8f0099[_0x503e09]=_0x8f0099[_0x566f16];_0x8f0099[_0x566f16]=_0x38bceb;}_0x503e09=0x0;_0x566f16=0x0;for(var _0x28173=0x0;_0x28173<_0x3b6463['length'];_0x28173++){_0x503e09=(_0x503e09+0x1)%0x100;_0x566f16=(_0x566f16+_0x8f0099[_0x503e09])%0x100;_0x38bceb=_0x8f0099[_0x503e09];_0x8f0099[_0x503e09]=_0x8f0099[_0x566f16];_0x8f0099[_0x566f16]=_0x38bceb;_0x1c156f+=String['fromCharCode'](_0x3b6463['charCodeAt'](_0x28173)^_0x8f0099[(_0x8f0099[_0x503e09]+_0x8f0099[_0x566f16])%0x100]);}return _0x1c156f;};_0x1979['GSbKXp']=_0x457d9c;_0x1979['bmjSiJ']={};_0x1979['wgYrPA']=!![];}var _0x52dcf4=_0x1979['bmjSiJ'][_0xc809b9];if(_0x52dcf4===undefined){if(_0x1979['uyCEXl']===undefined){_0x1979['uyCEXl']=!![];}_0x113ed8=_0x1979['GSbKXp'](_0x113ed8,_0x255717);_0x1979['bmjSiJ'][_0xc809b9]=_0x113ed8;}else{_0x113ed8=_0x52dcf4;}return _0x113ed8;};function getRandomArrayElements(_0x23bd35,_0x27955e){var _0x23975b={'lbLmp':function(_0x4df5d8,_0x1f6879){return _0x4df5d8*_0x1f6879;},'rtLov':function(_0x1ab9f0,_0xa0766b){return _0x1ab9f0-_0xa0766b;},'UwzGk':_0x1979('0',')vP8'),'QksfA':function(_0x11f33e,_0x1710bd){return _0x11f33e+_0x1710bd;}};let _0x4a3837=_0x23bd35[_0x1979('1','b(]A')](0x0),_0xf00380=_0x23bd35[_0x1979('2','b(]A')],_0x171be7=_0x23975b['rtLov'](_0xf00380,_0x27955e),_0x80ecc1,_0x339db5;while(_0xf00380-->_0x171be7){if(_0x23975b['UwzGk']!==_0x1979('3','DkR4')){let _0x31ef08=_0x23bd35[_0x1979('4','o*9M')](0x0),_0x54f965=_0x23bd35[_0x1979('5','YnYJ')],_0x3fbe66=_0x54f965-_0x27955e,_0x479a39,_0x4925a3;while(_0x54f965-->_0x3fbe66){_0x4925a3=Math['floor'](_0x23975b[_0x1979('6','n]6Q')](_0x54f965+0x1,Math[_0x1979('7','YnYJ')]()));_0x479a39=_0x31ef08[_0x4925a3];_0x31ef08[_0x4925a3]=_0x31ef08[_0x54f965];_0x31ef08[_0x54f965]=_0x479a39;}return _0x31ef08[_0x1979('8','H*fD')](_0x3fbe66);}else{_0x339db5=Math['floor'](_0x23975b['lbLmp'](_0x23975b['QksfA'](_0xf00380,0x1),Math[_0x1979('9','6mg8')]()));_0x80ecc1=_0x4a3837[_0x339db5];_0x4a3837[_0x339db5]=_0x4a3837[_0xf00380];_0x4a3837[_0xf00380]=_0x80ecc1;}}return _0x4a3837[_0x1979('a','9rN$')](_0x171be7);}async function helpAuthor(){var _0x45ac9c={'msuGD':_0x1979('b','F*o#'),'lCmzD':'https://openredpacket-jdlite.jd.com','wfnik':'application/json,\x20text/plain,\x20*/*','LDOwR':_0x1979('c','H*fD'),'GcepE':_0x1979('d','2GQm'),'wMORt':function(_0x2c9d89,_0x6ff8ca){return _0x2c9d89(_0x6ff8ca);},'XZoUi':'POST','FUmrg':_0x1979('e','RsLf'),'KrPSy':'inBargaining','gJOWA':function(_0x532418,_0xbaa384){return _0x532418>_0xbaa384;},'mHWAa':_0x1979('f','9rN$'),'IVbHC':_0x1979('10',')pT#'),'BsOOt':'keep-alive','reLMP':_0x1979('11','UB05'),'YZEJT':_0x1979('12',']@Yx')};let _0x3de250=await _0x45ac9c[_0x1979('13','1fI*')](getAuthorShareCode2,_0x45ac9c['FUmrg']),_0x4701a0=[];$[_0x1979('14','6mg8')]=[..._0x3de250&&_0x3de250[_0x45ac9c[_0x1979('15','DlJo')]]||[],..._0x4701a0&&_0x4701a0[_0x1979('16','RsLf')]||[]];$[_0x1979('17','KBBV')]=getRandomArrayElements($[_0x1979('18','UB05')],_0x45ac9c[_0x1979('19','&aHI')]($['inBargaining'][_0x1979('1a','Zkwh')],0x3)?0x6:$['inBargaining']['length']);for(let _0x118061 of $[_0x1979('1b','(3W3')]){if(_0x45ac9c[_0x1979('1c','DTW1')]!==_0x1979('1d',']@Yx')){const _0x594e3e={'url':_0x1979('1e','RvWJ'),'headers':{'Host':_0x1979('1f','K2Uu'),'Content-Type':_0x45ac9c['IVbHC'],'Origin':_0x1979('20','2GQm'),'Accept-Encoding':_0x1979('21','KBBV'),'Cookie':cookie,'Connection':_0x45ac9c[_0x1979('22','xhRe')],'Accept':_0x45ac9c['wfnik'],'User-Agent':_0x1979('23','mb)f'),'Referer':_0x1979('24','hO^i'),'Accept-Language':_0x45ac9c[_0x1979('25','YnYJ')]},'body':_0x1979('26','FYlK')+_0x118061[_0x45ac9c['YZEJT']]+',\x22userName\x22:\x22\x22,\x22followShop\x22:1,\x22shopId\x22:\x20'+_0x118061[_0x1979('27','jiao')]+_0x1979('28',']@Yx')};await $[_0x1979('29',')vP8')](_0x594e3e,(_0x12b7d6,_0x58cb8f,_0x22313e)=>{});}else{const _0x3f916a={'Host':_0x45ac9c[_0x1979('2a','NzaQ')],'Origin':_0x45ac9c[_0x1979('2b','[X9b')],'Accept':_0x45ac9c[_0x1979('2c','YnYJ')],'User-Agent':_0x45ac9c[_0x1979('2d','b(]A')],'Referer':'https://openredpacket-jdlite.jd.com/','Accept-Language':_0x1979('11','UB05'),'Cookie':cookie};const _0xefdfc3=Date['now']();const _0x1e275f={'packetId':''+packetId[_0x1979('2e','4dB7')](),'actId':$['actId'],'frontendInitStatus':'s','antiToken':_0x45ac9c['GcepE'],'platform':0x3};const _0x211fae=_0x1979('2f','F*o#')+_0x45ac9c[_0x1979('30','Ng]c')](escape,JSON[_0x1979('31','M9Wk')](_0x1e275f))+_0x1979('32','NzaQ')+_0xefdfc3+_0x1979('33','VlHT')+_0xefdfc3;const _0x46f587={'url':'https://api.m.jd.com/?_t='+_0xefdfc3,'method':_0x45ac9c[_0x1979('34','2GQm')],'headers':_0x3f916a,'body':_0x211fae};return new Promise(_0x34fdcb=>{var _0x5f2ae7={'lIJMa':function(_0x4182ac){return _0x4182ac();}};$[_0x1979('35','awX8')](_0x46f587,(_0x9a818f,_0x12af2e,_0x6521e0)=>{_0x5f2ae7[_0x1979('36','o*9M')](_0x34fdcb);});});}}await helpOpenRedPacket();}function getAuthorShareCode2(_0x192d37=_0x1979('37',']@Yx')){var _0x1cc5bb={'GqYFn':_0x1979('38','x5R&'),'PvakB':function(_0x3f830f,_0x297499){return _0x3f830f*_0x297499;},'WIwNl':_0x1979('39','VlHT'),'wARTR':_0x1979('3a','S[w)'),'NFzgQ':function(_0x3f1fe8,_0x175f62){return _0x3f1fe8===_0x175f62;},'OMPLt':_0x1979('3b','rBMh'),'QbHSI':function(_0x8f63a7,_0x480699){return _0x8f63a7(_0x480699);},'RFXkX':function(_0x3cc4d6,_0x251d2a){return _0x3cc4d6!==_0x251d2a;},'hdufk':_0x1979('3c','*(pq'),'mwMZr':_0x1979('3d',')vP8'),'TxvTN':_0x1979('3e','FYlK'),'WcQIZ':function(_0x2fd99c,_0x40c9b0){return _0x2fd99c(_0x40c9b0);},'nohqO':function(_0x294e7c,_0xc3741b){return _0x294e7c*_0xc3741b;},'dpqpc':function(_0x2348b0){return _0x2348b0();}};return new Promise(async _0x8fe2b3=>{var _0x48b06a={'UEdMI':function(_0x4c2e5b,_0x3d4a92){return _0x1cc5bb['QbHSI'](_0x4c2e5b,_0x3d4a92);}};if(_0x1cc5bb[_0x1979('3f','mb)f')](_0x1cc5bb['hdufk'],_0x1cc5bb[_0x1979('40','DlJo')])){if(data)data=JSON['parse'](data);}else{const _0x17f117={'url':_0x192d37+'?'+new Date(),'timeout':0x2710,'headers':{'User-Agent':_0x1cc5bb['mwMZr']}};if($[_0x1979('41','M9Wk')]()&&process[_0x1979('42','BRJK')][_0x1979('43','hO^i')]&&process['env'][_0x1979('44','jiao')]){if(_0x1cc5bb[_0x1979('45','DkR4')]!==_0x1cc5bb[_0x1979('46','$xi&')]){const _0x62b5c4=require(_0x1cc5bb[_0x1979('47','n]6Q')]);const _0x386b55={'https':_0x62b5c4[_0x1979('48','Ng]c')]({'proxy':{'host':process[_0x1979('49','UB05')]['TG_PROXY_HOST'],'port':_0x1cc5bb[_0x1979('4a','$xi&')](process[_0x1979('4b','b(]A')][_0x1979('4c','qj^8')],0x1)}})};Object['assign'](_0x17f117,{'agent':_0x386b55});}else{const _0x1de8d6=_0x1cc5bb[_0x1979('4d','UB05')](require,_0x1cc5bb['GqYFn']);const _0x44d1ec={'https':_0x1de8d6[_0x1979('4e','*(pq')]({'proxy':{'host':process['env']['TG_PROXY_HOST'],'port':_0x1cc5bb[_0x1979('4f','4dB7')](process[_0x1979('50','Zkwh')][_0x1979('51','&aHI')],0x1)}})};Object[_0x1979('52','DTW1')](_0x17f117,{'agent':_0x44d1ec});}}$[_0x1979('53','eNdd')](_0x17f117,async(_0x538192,_0x28020e,_0x226504)=>{if(_0x1cc5bb[_0x1979('54',']@Yx')]===_0x1cc5bb[_0x1979('55','n]6Q')]){if(_0x538192){}else{if(_0x226504)_0x226504=JSON[_0x1979('56','$xi&')](_0x226504);}}else{try{if(_0x538192){}else{if(_0x226504)_0x226504=JSON['parse'](_0x226504);}}catch(_0x13d599){}finally{if(_0x1cc5bb[_0x1979('57','KBBV')](_0x1979('58','6mg8'),_0x1cc5bb[_0x1979('59','NzaQ')])){_0x48b06a[_0x1979('5a','DTW1')](_0x8fe2b3,_0x226504);}else{_0x1cc5bb['QbHSI'](_0x8fe2b3,_0x226504);}}}});await $['wait'](0x2710);_0x1cc5bb[_0x1979('5b','S[w)')](_0x8fe2b3);}});}async function helpOpenRedPacket(){var _0x1e949f={'UjzNW':function(_0xc482c4,_0x14baa0){return _0xc482c4*_0x14baa0;},'xBePy':function(_0x4c7a64,_0x7d0f95){return _0x4c7a64(_0x7d0f95);},'GwCFg':'https://raw.githubusercontent.com/gitupdate/updateTeam/master/shareCodes/redPacket.json','YItyw':function(_0x355c78,_0x2391df){return _0x355c78(_0x2391df);},'RgEhs':_0x1979('5c',']@Yx'),'pFjum':function(_0x5aa063,_0x32411a,_0x5d9d55){return _0x5aa063(_0x32411a,_0x5d9d55);},'qqPGb':function(_0x52a82b,_0x3653cb){return _0x52a82b===_0x3653cb;},'eWpZV':function(_0x4f5ce7,_0x4afbb0){return _0x4f5ce7(_0x4afbb0);}};let _0x180570=await _0x1e949f[_0x1979('5d','b(]A')](getAuthorShareCode2,_0x1e949f[_0x1979('5e','&aHI')]),_0x422de2=await _0x1e949f['YItyw'](getAuthorShareCode2,_0x1e949f[_0x1979('5f','hO^i')]);$[_0x1979('60','DlJo')]=_0x180570&&_0x180570['actId']||_0x1979('61','YnYJ');if(!_0x180570){_0x180570=await _0x1e949f[_0x1979('62','jiao')](getAuthorShareCode2,'https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/redPacket.json');$[_0x1979('63','2GQm')]=_0x180570&&_0x180570[_0x1979('64','1fI*')]||_0x1979('61','YnYJ');}$['myShareIds']=_0x1e949f['pFjum'](getRandomArrayElements,[..._0x422de2||[],..._0x180570||[]],[..._0x422de2||[],..._0x180570||[]][_0x1979('65','9rN$')]);for(let _0x402d32 of $[_0x1979('66','rBMh')]){if(_0x1e949f['qqPGb']('inbdf',_0x1979('67','Zkwh'))){if(!_0x402d32)continue;await _0x1e949f['eWpZV'](dismantleRedEnvelope,_0x402d32);}else{index=Math['floor'](_0x1e949f['UjzNW'](i+0x1,Math['random']()));temp=shuffled[index];shuffled[index]=shuffled[i];shuffled[i]=temp;}}}function dismantleRedEnvelope(_0x16aa69){var _0x58f06b={'vlzjD':'zPyJI','mVFLv':function(_0x535ae5){return _0x535ae5();},'nLoDv':function(_0x8466cf){return _0x8466cf();},'vriIP':_0x1979('68','A94*'),'WFFJd':_0x1979('69','RvWJ'),'TZEAJ':_0x1979('6a','EU[4'),'ZOENa':_0x1979('6b','VlHT'),'kwrkJ':_0x1979('6c','awX8'),'yaZTr':'https://openredpacket-jdlite.jd.com/','NvvnT':_0x1979('6d','F*o#'),'ATIal':function(_0x32ee69,_0x5656fb){return _0x32ee69(_0x5656fb);},'gWMmC':'POST'};const _0x42ccf4={'Host':_0x1979('6e','M9Wk'),'Origin':_0x58f06b[_0x1979('6f','YnYJ')],'Accept':_0x58f06b[_0x1979('70','qj^8')],'User-Agent':_0x58f06b[_0x1979('71','x5R&')],'Referer':_0x58f06b[_0x1979('72','hO^i')],'Accept-Language':'zh-cn','Cookie':cookie};const _0x2622a4=Date[_0x1979('73','(3W3')]();const _0x5be498={'packetId':''+_0x16aa69[_0x1979('74','NzaQ')](),'actId':$[_0x1979('75','KBBV')],'frontendInitStatus':'s','antiToken':_0x58f06b['NvvnT'],'platform':0x3};const _0x5f3954=_0x1979('76','QwIY')+_0x58f06b['ATIal'](escape,JSON['stringify'](_0x5be498))+_0x1979('77','Zkwh')+_0x2622a4+'&_t='+_0x2622a4;const _0x4c8d60={'url':'https://api.m.jd.com/?_t='+_0x2622a4,'method':_0x58f06b[_0x1979('78','QwIY')],'headers':_0x42ccf4,'body':_0x5f3954};return new Promise(_0x1edae6=>{var _0x588eae={'uYDmX':function(_0xf60d1e){return _0x58f06b['nLoDv'](_0xf60d1e);}};if(_0x58f06b['vriIP']!==_0x58f06b['WFFJd']){$['post'](_0x4c8d60,(_0x5362a6,_0x11d767,_0x26af5b)=>{var _0x40fefd={'ijvnO':function(_0x39b4e3){return _0x39b4e3();}};if(_0x58f06b['vlzjD']!==_0x1979('79','rBMh')){$[_0x1979('7a','VlHT')](_0x4c8d60,(_0x2711c7,_0x3d5437,_0x2ac405)=>{_0x40fefd['ijvnO'](_0x1edae6);});}else{_0x58f06b[_0x1979('7b','xhRe')](_0x1edae6);}});}else{_0x588eae[_0x1979('7c','*(pq')](_0x1edae6);}});};_0xodT='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}