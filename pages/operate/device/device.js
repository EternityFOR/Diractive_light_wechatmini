const app = getApp();
const mqtt_connect = require('../../../utils/mqtt_connect.js');
const util = require('../../../utils/color_util.js');
let colorPickerCtx = {};
let sliderCtx = {};
let _this = null;
Page({
  data: {
    pickColor: null,
    lightness:50,
    radius: 550, //这里最大为750rpx铺满屏幕
    valueWidthOrHerght: 0,
    inputText: 'Hello World!',
    receiveText: '',
    receiveArry: [],
    name: '',
    connectedDeviceId: '',
    serviceId: 0,
    characteristics: {},
    connected: true,
    recieveDatas: "",
    nums: 0,
    isCheckOutControl: false,
    currentControlWays: '蓝牙',
    client: null,
    //记录重连的次数
    reconnectCounts: 0,
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
  },
  RGBValue: function(value,lightness){
    var pickColor = JSON.parse(value);
    var redValue = pickColor.red;
    var greenValue = pickColor.green;
    var blueValue = pickColor.blue;
    let hsl = util.rgb2hsl(redValue, greenValue, blueValue);
    let rgb = util.hslToRgb(hsl[0],hsl[1],lightness/100);
    return rgb;
  },
  SendTap: function (red, green, blue) {
    console.log(this.data.pickColor, this.data.isCheckOutControl)
    var that = this
    if (!this.data.isCheckOutControl) {
      if (this.data.connected) {
        var buffer = new ArrayBuffer(that.data.inputText.length)
        var dataView = new Uint8Array(buffer)
        dataView[0] = red; dataView[1] = green; dataView[2] = blue;
        wx.writeBLECharacteristicValue({
          deviceId: that.data.connectedDeviceId,
          serviceId: that.data.serviceId,
          characteristicId: "0000ABF1-0000-1000-8000-00805F9B34FB",
          value: buffer,
          success: function (res) {
            console.log('发送成功')
          }, fail() {
            wx.showModal({
              title: '提示',
              content: '蓝牙已断开',
              showCancel: false,
              success: function (res) {
              }
            })
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '蓝牙已断开',
          showCancel: false,
          success: function (res) {
            that.setData({
              searching: false
            })
          }
        })
      }
    } else {
      mqtt_connect.light_control(JSON.stringify({red,green,blue}));
      console.log('mqtt_light控制命令发送成功')
    }
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      name: options.name,
      connectedDeviceId: options.connectedDeviceId
    });
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log("res.services:", JSON.stringify(res.services))
        var all_UUID = res.services;
        var index_uuid = -1;
        var UUID_lenght = all_UUID.length;
        /* 遍历服务数组 */
        for (var index = 0; index < UUID_lenght; index++) {
          var ergodic_UUID = all_UUID[index].uuid; //取出服务里面的UUID
          /* 判断是否是我们需要的00010203-0405-0607-0809-0A0B0C0D1910*/
          if (ergodic_UUID == '0000ABF0-0000-1000-8000-00805F9B34FB') {
            index_uuid = index;
          };
        };
        if (index_uuid == -1) {
          wx.showModal({
            title: '提示',
            content: '非我方出售的设备',
            showCancel: false,
            success: function (res) {
              that.setData({
                searching: false
              })
            }
          })
        }
        that.setData({
          serviceId: res.services[index_uuid].uuid
        })
        wx.getBLEDeviceCharacteristics({
          deviceId: options.connectedDeviceId,
          serviceId: res.services[index_uuid].uuid,
          success: function (res) {
            console.log("characteristics ID:", res.characteristics)
            that.setData({
              characteristics: res.characteristics
            })
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId: options.connectedDeviceId,
              serviceId: that.data.serviceId,
              characteristicId: "0000ABF2-0000-1000-8000-00805F9B34FB",
              success: function (res) {
                console.log('启用notify成功')
              },
              fail(res) {
                console.log(res)
              }
            })
          }
        })
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })
    wx.onBLECharacteristicValueChange(function (res) {
      var recieveData = app.buf2hex(res.value);
    })
    _this = this
      _this.createSelectorQuery()
        .select('#colorPicker') // 在 WXML 中填入的 id
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          // Canvas 对象
          const canvas = res[0].node
          // Canvas 画布的实际绘制宽高  
          const renderWidth = res[0].width
          const renderHeight = res[0].height
          // Canvas 绘制上下文
          colorPickerCtx = canvas.getContext('2d');

          // 初始化画布大小
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = renderWidth * dpr
          canvas.height = renderHeight * dpr
          colorPickerCtx.scale(dpr, dpr)

          _this.setData({
            valueWidthOrHerght: renderWidth,
          })
            colorPickerCtx.fillStyle = "#ffffff";
            colorPickerCtx.fillRect(0, 0, renderWidth, renderHeight);
            util.drawRing(colorPickerCtx, renderWidth, renderHeight);
          _this.setData({
            pickColor: JSON.stringify({
              red: 255,
              green: 0,
              blue: 0
            })
          })
      })

      _this.createSelectorQuery()
        .select('#colorPickerSlider') // 在 WXML 中填入的 id
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          // Canvas 对象
          const canvas = res[0].node
          // Canvas 画布的实际绘制宽高  
          const renderWidth = res[0].width
          const renderHeight = res[0].height
          // Canvas 绘制上下文
          sliderCtx = canvas.getContext('2d');
          // 初始化画布大小
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = renderWidth * dpr
          canvas.height = renderHeight * dpr
          sliderCtx.scale(dpr, dpr)
          util.drawSlider(sliderCtx, renderWidth, renderHeight, 1.0);
      })

  },
  onUnload: function () {
    wx.closeBLEConnection({
      deviceId: this.data.connectedDeviceId,
      success: function (res) { },
    })
  },
  SendCleanTap: function () {
    this.setData({
      inputText: ''
    })
  },
  RecvCleanTap: function () {
    this.setData({
      receiveText: '',
      nums: 0
    })
  },
  SendValue: function (e) {
    this.setData({
      inputText: e.detail.value
    })
  },
  getNowTime: function () {
    // 加0
    function add_10(num) {
      if (num < 10) {
        num = '0' + num
      }
      return num;
    }
    var myDate = new Date();
    myDate.getYear(); //获取当前年份(2位)
    myDate.getFullYear(); //获取完整的年份(4位,1970-????)
    myDate.getMonth(); //获取当前月份(0-11,0代表1月)
    myDate.getDate(); //获取当前日(1-31)
    myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
    myDate.getTime(); //获取当前时间(从1970.1.1开始的毫秒数)
    myDate.getHours(); //获取当前小时数(0-23)
    myDate.getMinutes(); //获取当前分钟数(0-59)
    myDate.getSeconds(); //获取当前秒数(0-59)
    myDate.getMilliseconds(); //获取当前毫秒数(0-999)
    myDate.toLocaleDateString(); //获取当前日期
    var nowTime = add_10(myDate.getHours()) + '时' + add_10(myDate.getMinutes()) + '分' + add_10(myDate.getSeconds()) + '秒 收到：';
    return nowTime;
  },
  onSlide: function (e) {
    let that = this;
    if (e.touches && (e.type === 'touchend')) {
      console.log("ok");
      let x = e.changedTouches[0].x;
      let y = e.changedTouches[0].y;
      if (e.type !== 'touchend') {
        x = e.touches[0].x; 
        y = e.touches[0].y;
      }
      //复制画布上指定矩形的像素数据
      const dpr = wx.getSystemInfoSync().pixelRatio
      const imageData = colorPickerCtx.getImageData(x * dpr, y * dpr, 1, 1)
      let h = util.rgb2hsl(imageData.data[0], imageData.data[1], imageData.data[2]);
      that.setData({
        pickColor: JSON.stringify({
          red: imageData.data[0],
          green: imageData.data[1],
          blue: imageData.data[2]
        })
      })
      let rgb = this.RGBValue(this.data.pickColor,this.data.lightness);
      that.SendTap(rgb[0], rgb[1], rgb[2]);
      that.setData({
        pickColor: JSON.stringify({
          red: rgb[0],
          green: rgb[1],
          blue: rgb[2]
        })
      })
      // 判断是否在圈内
      if (h[1] !== 1.0) {
        return;
      }
      util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
      // 设置设备
      if (e.type !== 'touchEnd') {
        return;
      }
    }
  },
  lightadujust: function(event) {
    let that = this;
    console.log(`当前值：${event.detail}`);
    let rgb = this.RGBValue(this.data.pickColor,event.detail);
    that.setData({
      pickColor: JSON.stringify({
        red: rgb[0],
        green: rgb[1],
        blue: rgb[2]
      }),
      lightness:event.detail,
    });
    that.SendTap(rgb[0], rgb[1], rgb[2]);
  },
  onChangeCheckOutControl({ detail }) {
    let ways = '蓝牙'
    if (detail) {
      ways = 'WiFi'
    }
    this.setData({ isCheckOutControl: detail, currentControlWays: ways });
  }
})