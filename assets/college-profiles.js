(function () {
  'use strict';
  const data = [
    ['01','建筑学院','建筑','arch','jianzhu jz 建院'],
    ['02','机械工程学院','机械','me','jixie jx 机械工程'],
    ['03','能源与环境学院','能环','power','nengyuanhuanjing nyhj nh 能源 环境'],
    ['04','信息科学与工程学院','信息','radio','xinxi xx 信息工程 通信'],
    ['05','土木工程学院','土木','civil','tumu tm'],
    ['06','电子科学与工程学院','电子','electronic','dianzi dz'],
    ['07','数学学院','数学','math','shuxue sx'],
    ['08','自动化学院','自动化','automation','zidonghua zdh 自控'],
    ['09','计算机科学与工程学院','计算机','cs','jisuanji jsj cse 计科 计院'],
    ['10','物理学院','物理','physics','wuli wl'],
    ['11','生物科学与医学工程学院','生医','bme','shengyi sy shengwukexueyuyixuegongcheng 生物医学工程 生物医学工程学院 生医学院'],
    ['12','材料科学与工程学院','材料','smse','cailiao cl'],
    ['13','人文学院','人文','rwxy','renwen rw'],
    ['14','经济管理学院','经管','em','jingjiguanli jjgl jg 经济 管理'],
    ['15','电气工程学院','电气','ee','dianqi dq'],
    ['16','外国语学院','外语','sfl','waiguoyu wgy wy 外国语 外院'],
    ['17','体育系','体育','tyx','tiyu ty'],
    ['18','化学化工学院','化工','chem','huaxuehuagong hxhg hg 化学'],
    ['19','交通学院','交通','tc','jiaotong jt'],
    ['20','仪器科学与工程学院','仪器','ins','yiqi yq 仪科'],
    ['21','艺术学院','艺术','arts','yishu ys'],
    ['22','法学院','法学','law','faxue fx 法院'],
    ['23','医学院','医学','med','yixue yx 医院'],
    ['24','公共卫生学院','公卫','sph','gonggongweisheng ggws gw 公共卫生'],
    ['25','吴健雄学院','吴院','wjx','wujianxiong wjxx 吴健雄 荣誉'],
    ['26','海外教育学院','海外','cis','haiwaijiaoyu hwjy hw 留学生 国际教育'],
    ['27','软件学院','软件','cose','ruanjian rj'],
    ['28','集成电路学院','集电','ic','jichengdianlu jcdl jd 微电子 芯片'],
    ['29','马克思主义学院','马院','marxism','makesizhuyi mkszy my 马克思'],
    ['30','网络空间安全学院','网安','cyber','wangluokongjiananquan wlkjaq wa 网络安全'],
    ['31','人工智能学院','人工智能','ai','rengongzhineng rgzn 智能'],
    ['32','东南大学雷恩研究生学院','雷恩','srjgs','leien le rennes 雷恩研究生院'],
    ['33','东南大学—蒙纳士大学国际学院（苏州）','东蒙','smjgs','dongmeng dm monash mengnashi mns 苏州联合研究生院 蒙纳士'],
    ['34','生命科学与技术学院','生命','ils','shengming sm 生命科学 生科'],
    ['35','国家卓越工程师学院','卓工','gjzygcs','guojiazhuoyuegongchengshi gjzygcs zg 卓越工程师'],
    ['36','未来技术学院','未来','futuretech','weilaijishu wljs wl 未来技术'],
    ['37','新生学院','新生','xsxy','xinsheng xs'],
    ['38','统计与数据科学学院','统计','stat','tongjiyushujukexue tjysjkx tj 统计 数据科学']
  ];
  const fullPinyin=['jianzhuxueyuan','jixiegongchengxueyuan','nengyuanyuhuanjingxueyuan','xinxikexueyugongchengxueyuan','tumugongchengxueyuan','dianzikexueyugongchengxueyuan','shuxuexueyuan','zidonghuaxueyuan','jisuanjikexueyugongchengxueyuan','wulixueyuan','shengwukexueyuyixuegongchengxueyuan','cailiaokexueyugongchengxueyuan','renwenxueyuan','jingjiguanlixueyuan','dianqigongchengxueyuan','waiguoyuxueyuan','tiyuxi','huaxuehuagongxueyuan','jiaotongxueyuan','yiqikexueyugongchengxueyuan','yishuxueyuan','faxueyuan','yixueyuan','gonggongweishengxueyuan','wujianxiongxueyuan','haiwaijiaoyuxueyuan','ruanjianxueyuan','jichengdianluxueyuan','makesizhuyixueyuan','wangluokongjiananquanxueyuan','rengongzhinengxueyuan','dongnandaxueleienyanjiushengxueyuan','dongnandaxuemengnashidaxueguojixueyuansuzhou','shengmingkexueyujishuxueyuan','guojiazhuoyuegongchengshixueyuan','weilaijishuxueyuan','xinshengxueyuan','tongjiyushujukexuexueyuan'];
  const profiles = data.map(([id,name,short,host,aliases],index) => Object.freeze({id,name,short,url:'https://'+host+'.seu.edu.cn/',title:short+'常用网址',linkName:id==='17'?'体育系':short+'学院',aliases:[...aliases.split(' '),fullPinyin[index]]}));
  const normalize = text => String(text || '').trim().toLowerCase().replace(/[\s·—（）()_-]/g,'');
  function search(query) {
    const needle=normalize(query);
    return profiles.map(profile=>{
      const terms=[profile.name,profile.short,profile.linkName,...profile.aliases,profile.url.split('//')[1].split('.')[0]].map(normalize);
      const score=!needle?1:terms.some(x=>x===needle)?100:terms.some(x=>x.startsWith(needle))?70:terms.some(x=>x.includes(needle))?50:0;
      return {profile,score};
    }).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.profile.id.localeCompare(b.profile.id)).map(x=>x.profile);
  }
  window.BmeColleges={profiles,search,get:id=>profiles.find(x=>x.id===id)||profiles.find(x=>x.id==='11')};
})();
