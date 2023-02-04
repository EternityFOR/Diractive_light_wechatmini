Component({
  data: {
    color: "#7A7E83",
    selectedColor: "#1382f1",
    list: [{
      pagePath: "/pages/index/home/home",
      iconPath: "/images/home.png",
      selectedIconPath: "/images/home.png",
      text: "首页"
    }, {
      pagePath: "/pages/index/data/data",
      iconPath: "/images/data.png",
      selectedIconPath: "/images/data.png",
      text: "监控"
      },
      {
      pagePath: "/pages/index/user/user",
      iconPath: "/images/user.png",
      selectedIconPath: "/images/user.png",
      text: "我的"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
    }
  }
})