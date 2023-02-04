import mqtt from './mqtt.min.js';
//连接的服务器域名，注意格式！！！
const host = 'wxs://iot-06z00cttbpxocf9.mqtt.iothub.aliyuncs.com/mqtt';
//MQTT连接的配置
const options= {
  protocolVersion: 4, //MQTT连接协议版本
  clientId: 'i4zinsLongD.wechatmini|securemode=2,signmethod=hmacsha256,timestamp=1673788133944|',
  clean: false,
  password: 'fa11be7d048e773ff6ca1de58f18198a7742c93f9cd4f892929254eb0ba25d59',
  username: 'wechatmini&i4zinsLongD',
  reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
  connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
  resubscribe: true //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
}
//连接雷达相关topic
const radar_topic = '/i4zinsLongD/wechatmini/user/wechetmini_radar_get';
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
    var obj = JSON.parse(payload);
    //获取app.js中的雷达信息全局变量
    const app = getApp();
    app.globalData.payload = obj;
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

let radar_get = function(topic = radar_topic) {client.on('connect', function (connack) {
  client.subscribe(topic, function (err, granted) { })
  console.log(" 服务器 connect ok")
})};

let disconnect = function() {
  client.end();
}

module.exports = {    
  connect: connect,
  light_control: light_control,
  radar_get: radar_get,
  disconnect: disconnect,
}