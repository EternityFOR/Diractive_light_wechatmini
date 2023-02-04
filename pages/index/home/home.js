//index.js
//获取应用实例
const app = getApp();
const util = require('../../../utils/util.js');

Component({
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
      }
    }
  },
  data: {

  },
  methods: {
    bindViewBlue: function () {
      wx.closeBluetoothAdapter()
      wx.openBluetoothAdapter({
        success(res) {
          console.log(res)
          wx.startBluetoothDevicesDiscovery({
            success: function (res) {
              wx.navigateTo({
                url: '/pages/blueDevices/blueDevices',
              })
            }
          })
        },
        fail(res) {
          util.showToast("请打开手机蓝牙功能");
        }
      })
    },
    bindViewWifi: function () {
      wx.navigateTo({
        url: '/pages/operate/search/search',
      })
    },
    onLoad: function (option) {
      wx.getSystemInfo({
        success(res) {
          app.data.system = res.platform
        }
      })
    }
  }
})