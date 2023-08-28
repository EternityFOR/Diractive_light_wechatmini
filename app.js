//app.js

App({
  data: {
    //Bluetooth连接的配置
    service_uuid: "0000FFFF-0000-1000-8000-00805F9B34FB",
    characteristic_write_uuid: "0000FF01-0000-1000-8000-00805F9B34FB",
    characteristic_read_uuid: "0000FF02-0000-1000-8000-00805F9B34FB",
    name: "BLE",
    md5Key: "",
    system: 'ios',
    connectedDeviceId: '',
  },
  globalData: {
    SystemInfo: {},
    userInfo: null,
    payload: null,
  },
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
  },
  buf2string: function (buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    var str = ''
    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i])
    }
    return str
  }, 
  onLaunch: function (buffer) {
    const mqtt_connect = require('./utils/mqtt_connect.js');
    this.globalData.SystemInfo = wx.getSystemInfoSync();
    this.data.client = mqtt_connect.connect();
    this.data.client.on('connect', function (connack) {
      console.log("成功连接mqtt服务器")
    });
  }
})