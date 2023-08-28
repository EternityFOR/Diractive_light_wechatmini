import mqtt from './mqtt.min.js';
import pscreate from './hex_hmac_sha1';
//三元组
const devicesecret = {
  productKey: "i4zinsLongD",
  deviceName: "wechatmini",
  deviceSecret: "503e7f8b610ce19d046ebf672e0005c0",
  regionId: "cn-shanghai"
}
let optionsinit = function(devicesecret) {
  const params = {
    productKey: devicesecret.productKey,
    deviceName: devicesecret.deviceName,
    timestamp: Date.now(),
    clientId: Math.random().toString(36).substr(2),
  }
  //CONNECT参数
  const options = {
    reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
    connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
    resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
    clean: false,
    protocolVersion: 4
  }
  //1.生成clientId，username，password
  options.password = passwordcreate(params, devicesecret.deviceSecret);
  options.clientId = `${params.clientId}|securemode=2,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
  options.username = `${params.deviceName}&${params.productKey}`;

  return options;
}
let passwordcreate = function(params, deviceSecret) {
  let keys = Object.keys(params).sort();
  // 按字典序排序
  keys = keys.sort();
  const list = [];
  keys.map((key) => {
    list.push(`${key}${params[key]}`);
  });
  const contentStr = list.join('');
  return pscreate.hex_hmac_sha1(deviceSecret, contentStr);
}

//连接的服务器域名，注意格式！！！
const host = 'wxs://iot-06z00cttbpxocf9.mqtt.iothub.aliyuncs.com/mqtt';
//MQTT连接的配置
const options = optionsinit(devicesecret);
//连接雷达相关topic
const radar_topic = '/i4zinsLongD/wechatmini/user/wechatmini_radar_get';
//连接RGB灯相关topic
const rgb_topic = '/i4zinsLongD/wechatmini/user/wechatmini_light_update';
//初始化client
let client;

let connect = function() {
  if(client == null){
    client = mqtt.connect(host, options);
  }
  else{
    console.log("已连接mqtt服务器");
  }
  //服务器下发消息的回调
  client.on("message", function (topic, payload) {
    console.log(" 收到 topic:" + topic + " , payload :" + payload)
    // wx.showModal({
    //   content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
    //   showCancel: false,
    // });
    var json_obj = JSON.parse(payload);
    let target = json_obj['目标状态'];
    console.log(target); // 输出 1
    const app = getApp();
    app.globalData.payload = target;
  })
  
  //服务器连接异常的回调
  client.on("error", function (error) {
    console.log(" 服务器 error 的回调" + error)
    wx.showToast({
      title: 'MQTT服务器连接失败'
    })
  })
  
  //服务器重连连接异常的回调
  client.on("reconnect", function () {
    console.log(" 服务器 reconnect的回调")
  })
  
  //服务器连接异常的回调
  client.on("offline", function (errr) {
    console.log(" 服务器offline的回调")
  })
  return client;
}

let light_control = function( message,topic = rgb_topic) {
  client.publish(topic, message);
};

let radar_data_subscribe = function(topic = radar_topic) {client.on('connect', function (connack) {
  client.subscribe(topic, function (err, granted) { })
  console.log(" 服务器 connect ok")
})};

let disconnect = function() {
  client.end();
}

module.exports = {    
  connect: connect,
  light_control: light_control,
  radar_data_subscribe: radar_data_subscribe,
  disconnect: disconnect,
}