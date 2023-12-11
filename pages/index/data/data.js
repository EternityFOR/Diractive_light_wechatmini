// pages/tab_pages/data/data.js
const mqtt_connect = require('../../../utils/mqtt_connect.js');
Component({
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    value: 20,
    gradientColor: {
      '0%': '#84fab0',
      '100%': '#8fd3f4',
    },
    state:"等待状态更新",
    client: null,
    name: '',
    connectedDeviceId: '',
    color: "#00ff00",
    status: null,
  },
  methods: {
  },  
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function() {
      const app = getApp();
      mqtt_connect.radar_data_subscribe();
      setInterval(() => {
        if(this.data.status != app.globalData.payload)
        {
          this.data.status = app.globalData.payload;
          if(this.data.status == 0){
            this.setData({ color: "#ff0000" });
            this.setData({ state: "无活动" });
          }
          else if(this.data.status == 1){
            this.setData({ color: "#ff0000" });
            this.setData({ state: "运动目标" });
          }
          else if (this.data.status == 2){
            this.setData({ color: "#00ff00" });
            this.setData({ state:"静止目标"});
          }
          else if (this.data.status == 3){
            this.setData({ color: "#ff9600" });
            this.setData({ state:"设备已连接"});
          }
        }
      }, 100);
    },
    // 在组件实例被从页面节点树移除时执行
    detached: function() {
    },
  },

})