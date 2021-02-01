# 每3天的23:50分清理一次日志
50 23 */3 * * rm -rf /scripts/logs/*.log

##############短期活动##############
# 年货节(活动时间：2021年1月9日-2021年2月9日)
10 8 * * * node /scripts/jd_nh.js >> /scripts/logs/jd_nh.log 2>&1
# 京东炸年兽集爆竹(活动时间:2021-1-18至2021-2-11)怕有遗漏故多运行几次
0 * * * * node /scripts/jd_nian.js >> /scripts/logs/jd_nian.log 2>&1
# 专门收集每秒产生的爆竹(1小时运行一次)
30 * * * * node /scripts/jd_nianCollect.js >> /scripts/logs/jd_nianCollect.log 2>&1
# 京东炸年兽签到任务🧨
50 0,1 * * * node /scripts/jd_nian_sign.js >> /scripts/logs/jd_nian_sign.log 2>&1
# 京东炸年兽AR
50 0,1,8 * * * node /scripts/jd_nian_ar.js >> /scripts/logs/jd_nian_ar.log 2>&1
# 京东炸年兽小程序
50 0,1,8 * * * node /scripts/jd_nian_wechat.js >> /scripts/logs/jd_nian_wechat.log 2>&1
# 京东神仙书院(活动时间:2021-1-20至2021-2-5)
30 6 * * * node /scripts/jd_immortal.js >> /scripts/logs/jd_immortal.log 2>&1
# 京东神仙书院答题(活动时间:2021-1-20至2021-2-5)
5 1 * * * node /scripts/jd_immortal_answer.js >> /scripts/logs/jd_immortal_answer.log 2>&1
# 5G狂欢城(2021-1-30至2021-2-4)
0 */6 * * * node /scripts/jd_5g.js >> /scripts/logs/jd_5g.log 2>&1
0 */6 * * * node /scripts/jd_818.js >> /scripts/logs/jd_818.log 2>&1
# 小鸽有礼(活动时间：2021年1月15日至2021年2月19日)
5 7 * * * node /scripts/jd_xg.js >> /scripts/logs/jd_xg.log 2>&1
# 小鸽有礼2(活动时间：2021年1月28日～2021年2月28日)
34 9 * * * node /scripts/jd_xgyl.js >> /scripts/logs/jd_jd_xgyl.log 2>&1
# 京东手机年终奖(活动时间：2021年1月26日～2021年2月8日)
15 0 * * * node /scripts/jd_festival.js >> /scripts/logs/jd_festival.log 2>&1
# 盲盒抽京豆(活动时间：2021年1月6日～2021年2月5日)
1 7 * * * node /scripts/jd_mh.js >> /scripts/logs/jd_mh.log 2>&1
# 京东压岁钱(活动时间：2021-2-1至2021-2-11)
20 8,12 * * * node /scripts/jd_newYearMoney.js >> /scripts/logs/jd_newYearMoney.log 2>&1
# 京东压岁钱抢百元卡(活动时间：2021-2-1至2021-2-11)
0 9,12,16,20 * * * node /scripts/jd_newYearMoney_lottery.js >> /scripts/logs/jd_newYearMoney_lottery.log 2>&1


##############长期活动##############
# 签到
0 0,18 * * * cd /scripts && node jd_bean_sign.js >> /scripts/logs/jd_bean_sign.log 2>&1
# 东东超市兑换奖品
0,30 0 * * * node /scripts/jd_blueCoin.js >> /scripts/logs/jd_blueCoin.log 2>&1
# 摇京豆
0 0 * * * node /scripts/jd_club_lottery.js >> /scripts/logs/jd_club_lottery.log 2>&1
# 东东农场
5 6-18/6 * * * node /scripts/jd_fruit.js >> /scripts/logs/jd_fruit.log 2>&1
# 宠汪汪
15 */2 * * * node /scripts/jd_joy.js >> /scripts/logs/jd_joy.log 2>&1
# 宠汪汪喂食
15 */1 * * * node /scripts/jd_joy_feedPets.js >> /scripts/logs/jd_joy_feedPets.log 2>&1
# 宠汪汪积分兑换奖品
0 0-16/8 * * * node /scripts/jd_joy_reward.js >> /scripts/logs/jd_joy_reward.log 2>&1
# 宠汪汪偷好友积分与狗粮
0 0-10/2 * * * node /scripts/jd_joy_steal.js >> /scripts/logs/jd_joy_steal.log 2>&1
# 摇钱树
0 */2 * * * node /scripts/jd_moneyTree.js >> /scripts/logs/jd_moneyTree.log 2>&1
# 东东萌宠
5 6-18/6 * * * node /scripts/jd_pet.js >> /scripts/logs/jd_pet.log 2>&1
# 京东种豆得豆
0 7-22/1 * * * node /scripts/jd_plantBean.js >> /scripts/logs/jd_plantBean.log 2>&1
# 京东全民开红包
1 1 * * * node /scripts/jd_redPacket.js >> /scripts/logs/jd_redPacket.log 2>&1
# 进店领豆
10 0 * * * node /scripts/jd_shop.js >> /scripts/logs/jd_shop.log 2>&1
# 京东天天加速
8 */3 * * * node /scripts/jd_speed.js >> /scripts/logs/jd_speed.log 2>&1
# 东东超市
11 1-23/5 * * * node /scripts/jd_superMarket.js >> /scripts/logs/jd_superMarket.log 2>&1
# 取关京东店铺商品
55 23 * * * node /scripts/jd_unsubscribe.js >> /scripts/logs/jd_unsubscribe.log 2>&1
# 京豆变动通知
0 10 * * * node /scripts/jd_bean_change.js >> /scripts/logs/jd_bean_change.log 2>&1
# 京东抽奖机
11 1 * * * node /scripts/jd_lotteryMachine.js >> /scripts/logs/jd_lotteryMachine.log 2>&1
# 京东排行榜
11 9 * * * node /scripts/jd_rankingList.js >> /scripts/logs/jd_rankingList.log 2>&1
# 天天提鹅
18 * * * * node /scripts/jd_daily_egg.js >> /scripts/logs/jd_daily_egg.log 2>&1
# 金融养猪
12 * * * * node /scripts/jd_pigPet.js >> /scripts/logs/jd_pigPet.log 2>&1
# 点点券
20 0,20 * * * node /scripts/jd_necklace.js >> /scripts/logs/jd_necklace.log 2>&1
# 京喜工厂
20 * * * * node /scripts/jd_dreamFactory.js >> /scripts/logs/jd_dreamFactory.log 2>&1
# 东东小窝
16 6,23 * * * node /scripts/jd_small_home.js >> /scripts/logs/jd_small_home.log 2>&1
# 东东工厂
36 * * * * node /scripts/jd_jdfactory.js >> /scripts/logs/jd_jdfactory.log 2>&1
# 十元街
36 8,18 * * * node /scripts/jd_syj.js >> /scripts/logs/jd_syj.log 2>&1
# 京东快递签到
23 1 * * * node /scripts/jd_kd.js >> /scripts/logs/jd_kd.log 2>&1
# 京东汽车(签到满500赛点可兑换500京豆)
0 0 * * * node /scripts/jd_car.js >> /scripts/logs/jd_car.log 2>&1
# 领京豆额外奖励(每日可获得3京豆)
33 4 * * * node /scripts/jd_bean_home.js >> /scripts/logs/jd_bean_home.log 2>&1
# 京东直播(每日18豆)
10-20/5 11 * * * node /scripts/jd_live.js >> /scripts/logs/jd_live.log 2>&1
# 微信小程序京东赚赚
10 11 * * * node /scripts/jd_jdzz.js >> /scripts/logs/jd_jdzz.log 2>&1
# 宠汪汪邀请助力
10 10,11 * * * node /scripts/jd_joy_run.js >> /scripts/logs/jd_joy_run.log 2>&1
# 注销京东已开的店铺会员，不是注销京东plus会员，个别店铺无法注销
44 4 * * 6 node /scripts/jd_unbind.js >> /scripts/logs/jd_unbind.log 2>&1
# crazyJoy自动每日任务
10 7 * * * node /scripts/jd_crazy_joy.js >> /scripts/logs/jd_crazy_joy.log 2>&1
# 京东汽车旅程赛点兑换金豆
0 0 * * * node /scripts/jd_car_exchange.js >> /scripts/logs/jd_car_exchange.log 2>&1
# 导到所有互助码
47 7 * * * node /scripts/jd_get_share_code.js >> /scripts/logs/jd_get_share_code.log 2>&1
# 口袋书店
7 8,12,18 * * * node /scripts/jd_bookshop.js >> /scripts/logs/jd_bookshop.log 2>&1
# 京喜农场
0 9,12,18 * * * node /scripts/jd_jxnc.js >> /scripts/logs/jd_jxnc.log 2>&1
# 签到领现金
27 7 * * * node /scripts/jd_cash.js >> /scripts/logs/jd_cash.log 2>&1
# 京喜app签到
39 7 * * * node /scripts/jx_sign.js >> /scripts/logs/jx_sign.log 2>&1
# 京东家庭号(暂不知最佳cron)
# */20 * * * * node /scripts/jd_family.js >> /scripts/logs/jd_family.log 2>&1
# 闪购盲盒
27 8 * * * node /scripts/jd_sgmh.js >> /scripts/logs/jd_sgmh.log 2>&1
# 源头好物红包
0 0 * * *  node /scripts/jd_coupon.js >> /scripts/logs/jd_coupon.log 2>&1
# 京东秒秒币
10 7 * * * node /scripts/jd_ms.js >> /scripts/logs/jd_ms.log 2>&1
# 京东超级盒子
20 7 * * * node /scripts/jd_super_box.js >> /scripts/logs/jd_super_box.log 2>&1
