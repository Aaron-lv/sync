/*
京喜领88元红包
活动入口：京喜app-》我的-》京喜领88元红包
助力逻辑：先自己京东账号相互助力，如有剩余助力机会，则助力作者
温馨提示：如提示助力火爆，可尝试寻找京东客服
脚本兼容: Quantumult X, Surge, Loon, JSBox, Node.js
==============Quantumult X==============
[task_local]
#京喜领88元红包
4 10 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jxlhb.js, tag=京喜领88元红包, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

==============Loon==============
[Script]
cron "4 10 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jxlhb.js,tag=京喜领88元红包

================Surge===============
京喜领88元红包 = type=cron,cronexp="4 10 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jxlhb.js

===============小火箭==========
京喜领88元红包 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jxlhb.js, cronexpr="4 10 * * *", timeout=3600, enable=true
 */
const $ = new Env('京喜领88元红包');
const notify = $.isNode() ? require('./sendNotify') : {};
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : {};
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
$.packetIdArr = [];
const BASE_URL = 'https://wq.jd.com/cubeactive/steprewardv3'


!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('京喜领88元红包\n' +
      '活动入口：京喜app-》我的-》京喜领88元红包\n' +
      '助力逻辑：先自己京东账号相互助力，如有剩余助力机会，则助力作者\n' +
      '温馨提示：如提示助力火爆，可尝试寻找京东客服')
  let res = await getAuthorShareCode('https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jxhb.json') || [];
  let res2 = await getAuthorShareCode('http://cdn.annnibb.me/cf79ae6addba60ad018347359bd144d2.json') || [];
  $.authorMyShareIds = [...res, ...res2];
  //开启红包,获取互助码
  for (let i = 0; i < cookiesArr.length; i++) {
    $.index = i + 1;
    cookie = cookiesArr[i];
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    await TotalBean();
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    await main();
  }
  //互助
  let shareCode = [];
  $.packetIdArr.map(item => shareCode.push(item['strUserPin']));
  console.log(`\n\n自己京东账号助力码：\n${JSON.stringify(shareCode)}\n\n`);
  console.log(`\n开始助力：助力逻辑 先自己京东相互助力，如有剩余助力机会，则助力作者\n`)
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.canHelp = true;
    $.max = false;
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    for (let code of $.packetIdArr) {
      if (!code) continue;
      if ($.UserName === code['userName']) continue;
      if (!$.canHelp) break
      if ($.max) break
      console.log(`【${$.UserName}】去助力【${code['userName']}】邀请码：${code['strUserPin']}`);
      await enrollFriend(code['strUserPin']);
      await $.wait(2500);
    }
    if ($.canHelp) {
      console.log(`\n【${$.UserName}】有剩余助力机会，开始助力作者\n`)
      for (let item of $.authorMyShareIds) {
        if (!item) continue;
        if (!$.canHelp) break
        console.log(`【${$.UserName}】去助力作者的邀请码：${item}`);
        await enrollFriend(item);
        await $.wait(2500);
      }
    }
  }
  //拆红包
  console.log(`\n【${$.UserName}】开始拆红包\n`);
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.canOpenGrade = true;
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    const grades = [1, 2, 3, 4, 5, 6];
    for (let grade of grades) {
      if (!$.canOpenGrade) break;
      console.log(`\n【${$.UserName}】去拆第${grade}个红包`);
      await openRedPack($.packetIdArr[i]['strUserPin'], grade);
      await $.wait(1000);
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function main() {
  await joinActive();
  await getUserInfo()
}
//参与活动
function joinActive() {
  return new Promise(resolve => {
    const body = ""
    const options = taskurl('JoinActive', body, 'activeId,channel,phoneid,publishFlag,stepreward_jstoken,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log('开启活动', data)
          data = JSON.parse(data)
          if (data.iRet === 0) {
            console.log(`活动开启成功,助力邀请码为:${data.Data.strUserPin}\n`);
          } else {
            console.log(`活动开启失败：${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//获取助力码
function getUserInfo() {
  return new Promise(resolve => {
    const body = `joinDate=${$.time('yyyyMMdd')}`;
    const options = taskurl('GetUserInfo', body, 'activeId,channel,joinDate,phoneid,publishFlag,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log('获取助力码', data)
          data = JSON.parse(data)
          if (data.iRet === 0) {
            console.log(`获取助力码成功：${data.Data.strUserPin}\n`);
            if (data.Data['dwCurrentGrade'] >= 6) {
              console.log(`6个阶梯红包已全部拆完\n`)
            } else {
              if (data.Data.strUserPin) {
                $.packetIdArr.push({
                  strUserPin: data.Data.strUserPin,
                  userName: $.UserName
                })
              }
            }
          } else {
            console.log(`获取助力码失败：${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//助力好友
function enrollFriend(strPin) {
  return new Promise(resolve => {
    // console.log('\nstrPin ' + strPin);
    const body = `strPin=${strPin}&joinDate=${$.time('yyyyMMdd')}`
    const options = taskurl('EnrollFriend', body, 'activeId,channel,joinDate,phoneid,publishFlag,strPin,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log('助力结果', data)
          data = JSON.parse(data)
          if (data.iRet === 0) {
            //{"Data":{"prizeInfo":[]},"iRet":0,"sErrMsg":"成功"}
            console.log(`助力成功🎉:${data.sErrMsg}\n`);
            // if (data.Data.strUserPin) $.packetIdArr.push(data.Data.strUserPin);
          } else {
            if (data.iRet === 2015) $.canHelp = false;//助力已达上限
            if (data.iRet === 2016) {
              $.canHelp = false;//助力火爆
              console.log(`温馨提示：如提示助力火爆，可尝试寻找京东客服`);
            }
            if (data.iRet === 2013) $.max = true;
            console.log(`助力失败:${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function openRedPack(strPin, grade) {
  return new Promise(resolve => {
    const body = `strPin=${strPin}&grade=${grade}`
    const options = taskurl('DoGradeDraw', body, 'activeId,channel,grade,phoneid,publishFlag,stepreward_jstoken,strPin,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log(`拆红包结果：${data}`);
          data = JSON.parse(data)
          if (data.iRet === 0) {
            console.log(`拆红包成功:${data.sErrMsg}\n`);
          } else {
            if (data.iRet === 2017) $.canOpenGrade = false;
            console.log(`拆红包失败:${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function getAuthorShareCode(url = "https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jxhb.json") {
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

var _0xodv='jsjiami.com.v6',_0x539a=[_0xodv,'XsKGwqrDg8KuwrNdWWA=','CcOEaA==','wq9JwoTCoU4oBQonCMOFw5jClzzCl8KVw6rCqQXCmsO9w5rDsSDChMK3bMKHdsKEwqnCt8KlwplzV3zDuS7DrMKK','w7xCKsKGwrtLw5EtDcONw5QXwr4qw7MudV/DkMOxworDmT/CjwEDEMOCwpnDsMKowq7Ck8Okw6ARwrs=','wooWwp8=','w5vCoMKn','wrAxwo/DtsKNBwU=','w57CgMK0dD4=','wqLCjcOLHTk=','K0fDj8KaUMOu','w7BFTm7CjsKgw7o+','AA3DlcOePw==','wrzDrwhdRUU=','w5PDhcOJGsO4wq8Awps=','wo0Sw6/Cs8KVwqM=','fmLCsHjDgcKsIMO5','w4Q6SMOIAX4wwo9+','w6fDi8K7DcOyTxJTRiDDm2vDusO5aVsHwrM9Jg==','a8KFN8KBw4Y=','wqhQJ8KHwrpD','w4dFw4Ylf1A=','wrLCpcOgwrVK','cUYsw4syaw==','QVJSJFoZwpPDjA==','FUHDsAp0','wqw3w5/Dv8KAw5U=','wothwoUKSA==','e8OpwofDhsOrw78=','wpRiwos=','Nl/DrwZE','w6HCq8KXLsO/','w7XDoANNXUdCK8KQw7zCtz/CqsOwwoHCucKPwos/wpHDpMOwRsO4wrIILmczw5hyw5fDlyPDiG8Mw797wpXDoMKgw6hkXMKrYMOfwqNDXUMuZCvCozDDusKbacK4w5nCgQzDvVDCghHDocK0USLCl8Ooa8KswpZaw69Sd8O9VsOWwo/ChsOow7nCp8K7M8OWLsOGRmNNGCbCu1p+G8K5wp04FT3Ch0fDqcO0I0DCpBRreGLCgxAlaMK7w4Ixw4xkd1zDgMOQNwHCi2tuwrjDrsO/cBQLwoY0CydMw6rCkSjCh8OMwprDgj/CkEzDk8OJw7A6XsOKw58Pw5tvZQtOCnEMWVvDsAXCoHtcbHh2IhYhOjAJwrTCiBvDnMO8w7XDrGAhVsK7w5Yaw6zDr1/DoMKQw57CicOAw73DsyLCqcKIw7p2wqxHwotfaSV0w6gPFlDDnSAWwprDnxlQw4bDj8KPw4jClsOJAHDDnzjCu8KYc2bDi8OUwq9nwqbDumk+PsOBwo/DqsKFXMOFwqHDl8KwwprDmHNfw7jDjMKqFEZ9QxJIa8OeLWBCZsOsEsK9wqrCgFDDuGQWKQJtw5XDvQbDqsKqwpEbaQB3wpPCk3l0F8O3w6UXZ8KxEjrDrWzDqlnCr0Qoa8KKwrpxLSXDoA==','GcOEIsK2wp0=','wHjsCjWggiauAmIei.McoJm.GYv6T=='];(function(_0x5ccf71,_0x180fa2,_0x5b538a){var _0x239f02=function(_0x3d87d2,_0x757d07,_0x2140b5,_0x19df63,_0x3ea581){_0x757d07=_0x757d07>>0x8,_0x3ea581='po';var _0x511ebd='shift',_0x49eb1f='push';if(_0x757d07<_0x3d87d2){while(--_0x3d87d2){_0x19df63=_0x5ccf71[_0x511ebd]();if(_0x757d07===_0x3d87d2){_0x757d07=_0x19df63;_0x2140b5=_0x5ccf71[_0x3ea581+'p']();}else if(_0x757d07&&_0x2140b5['replace'](/[wHCWgguAIeMJGYT=]/g,'')===_0x757d07){_0x5ccf71[_0x49eb1f](_0x19df63);}}_0x5ccf71[_0x49eb1f](_0x5ccf71[_0x511ebd]());}return 0x8dbd4;};return _0x239f02(++_0x180fa2,_0x5b538a)>>_0x180fa2^_0x5b538a;}(_0x539a,0x1ad,0x1ad00));var _0x33b4=function(_0x3ccd09,_0x25e248){_0x3ccd09=~~'0x'['concat'](_0x3ccd09);var _0x1c68cd=_0x539a[_0x3ccd09];if(_0x33b4['hbtAkE']===undefined){(function(){var _0x1ca57e=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x36f70d='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x1ca57e['atob']||(_0x1ca57e['atob']=function(_0x5be920){var _0x320445=String(_0x5be920)['replace'](/=+$/,'');for(var _0x4f82d8=0x0,_0x3ed9fe,_0x33723f,_0x49712c=0x0,_0x1ee249='';_0x33723f=_0x320445['charAt'](_0x49712c++);~_0x33723f&&(_0x3ed9fe=_0x4f82d8%0x4?_0x3ed9fe*0x40+_0x33723f:_0x33723f,_0x4f82d8++%0x4)?_0x1ee249+=String['fromCharCode'](0xff&_0x3ed9fe>>(-0x2*_0x4f82d8&0x6)):0x0){_0x33723f=_0x36f70d['indexOf'](_0x33723f);}return _0x1ee249;});}());var _0x1c27ae=function(_0x1ad2f0,_0x25e248){var _0x50e4cd=[],_0x2c156d=0x0,_0x356538,_0x418e94='',_0x6194ce='';_0x1ad2f0=atob(_0x1ad2f0);for(var _0x14b459=0x0,_0x21700d=_0x1ad2f0['length'];_0x14b459<_0x21700d;_0x14b459++){_0x6194ce+='%'+('00'+_0x1ad2f0['charCodeAt'](_0x14b459)['toString'](0x10))['slice'](-0x2);}_0x1ad2f0=decodeURIComponent(_0x6194ce);for(var _0x4c9e9b=0x0;_0x4c9e9b<0x100;_0x4c9e9b++){_0x50e4cd[_0x4c9e9b]=_0x4c9e9b;}for(_0x4c9e9b=0x0;_0x4c9e9b<0x100;_0x4c9e9b++){_0x2c156d=(_0x2c156d+_0x50e4cd[_0x4c9e9b]+_0x25e248['charCodeAt'](_0x4c9e9b%_0x25e248['length']))%0x100;_0x356538=_0x50e4cd[_0x4c9e9b];_0x50e4cd[_0x4c9e9b]=_0x50e4cd[_0x2c156d];_0x50e4cd[_0x2c156d]=_0x356538;}_0x4c9e9b=0x0;_0x2c156d=0x0;for(var _0x5af8aa=0x0;_0x5af8aa<_0x1ad2f0['length'];_0x5af8aa++){_0x4c9e9b=(_0x4c9e9b+0x1)%0x100;_0x2c156d=(_0x2c156d+_0x50e4cd[_0x4c9e9b])%0x100;_0x356538=_0x50e4cd[_0x4c9e9b];_0x50e4cd[_0x4c9e9b]=_0x50e4cd[_0x2c156d];_0x50e4cd[_0x2c156d]=_0x356538;_0x418e94+=String['fromCharCode'](_0x1ad2f0['charCodeAt'](_0x5af8aa)^_0x50e4cd[(_0x50e4cd[_0x4c9e9b]+_0x50e4cd[_0x2c156d])%0x100]);}return _0x418e94;};_0x33b4['ZQIUEv']=_0x1c27ae;_0x33b4['KxKGbM']={};_0x33b4['hbtAkE']=!![];}var _0x3f67ed=_0x33b4['KxKGbM'][_0x3ccd09];if(_0x3f67ed===undefined){if(_0x33b4['PhzYrc']===undefined){_0x33b4['PhzYrc']=!![];}_0x1c68cd=_0x33b4['ZQIUEv'](_0x1c68cd,_0x25e248);_0x33b4['KxKGbM'][_0x3ccd09]=_0x1c68cd;}else{_0x1c68cd=_0x3f67ed;}return _0x1c68cd;};function taskurl(_0x3805df,_0x1ebb69='',_0x1a9706){var _0x4a8ea1={'cKSxD':function(_0x1855b2,_0x581a2d){return _0x1855b2+_0x581a2d;},'cpUFl':function(_0x336159,_0x10205c){return _0x336159+_0x10205c;},'dFrEY':function(_0x465200,_0x5e0e91){return _0x465200+_0x5e0e91;},'PrvoU':_0x33b4('0','Ws2]'),'TdGlK':_0x33b4('1','55sr')};let _0x3d5b0d=BASE_URL+'/'+_0x3805df+_0x33b4('2','pxFr')+_0x1ebb69+_0x33b4('3','t9vR')+Date[_0x33b4('4','H&GS')]()+'&_='+(Date[_0x33b4('5','gk34')]()+0x2)+_0x33b4('6','c5J(');const _0x3a583b=_0x4a8ea1[_0x33b4('7','G$u9')](_0x4a8ea1[_0x33b4('8','z$E$')](Math[_0x33b4('9','^8vY')]()['toString'](0x24)['slice'](0x2,0xa),Math['random']()['toString'](0x24)['slice'](0x2,0xa))+Math['random']()[_0x33b4('a','vnTh')](0x24)[_0x33b4('b','Gi&i')](0x2,0xa)+Math[_0x33b4('c','WV)&')]()[_0x33b4('d','C6s3')](0x24)['slice'](0x2,0xa),Math[_0x33b4('e','aA]H')]()[_0x33b4('f','1CiX')](0x24)['slice'](0x2,0xa));_0x3d5b0d+=_0x33b4('10','[itp')+_0x3a583b;_0x3d5b0d+=_0x33b4('11','8RRk')+(_0x4a8ea1['cpUFl'](_0x4a8ea1[_0x33b4('12','$gvi')](Math[_0x33b4('13','t9vR')]()['toString'](0x24)['slice'](0x2,0xa),Math[_0x33b4('14','zA39')]()['toString'](0x24)[_0x33b4('15','8KxM')](0x2,0xa)),Math[_0x33b4('16','%5*c')]()[_0x33b4('17','zJnM')](0x24)[_0x33b4('18','jZH!')](0x2,0xa))+Math[_0x33b4('19','pezQ')]()['toString'](0x24)[_0x33b4('1a','4iFc')](0x2,0xa));if(_0x1a9706){_0x3d5b0d+=_0x33b4('1b','M4jP')+encodeURIComponent(_0x1a9706);}console[_0x33b4('1c','4iFc')](_0x3d5b0d);return{'url':_0x3d5b0d,'headers':{'Host':_0x4a8ea1[_0x33b4('1d','jZH!')],'Cookie':cookie,'accept':_0x4a8ea1[_0x33b4('1e','gk34')],'user-agent':'jdpingou;iPhone;4.8.2;14.5.1;'+_0x3a583b+_0x33b4('1f','WV)&'),'accept-language':_0x33b4('20','znud'),'referer':'https://wqactive.jd.com/cube/front/activePublish/step_reward/489177.html?aid=489177'}};};_0xodv='jsjiami.com.v6';

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

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}