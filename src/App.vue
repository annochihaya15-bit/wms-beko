<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 这里通常什么都不用写，或者只引入一些全局样式
</script>

<style>
/* 这里是你的一些全局样式 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
/* 一个通用的卡片样式 */
.main-box {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px; /* 圆角 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 淡淡的阴影 */
    transition: all 0.3s; /* 鼠标放上去时的过渡动画 */
}

/* 鼠标悬停时，稍微浮起来一点点 */
.main-box:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}
/* 干掉所有元素点击后的默认黑边框 */
:focus {
    outline: none !important;
}

/* 针对按钮的额外处理 */
button:focus, .el-button:focus {
    outline: none !important;
    /* 如果你想保留一点点效果，可以换成淡蓝色阴影，或者什么都不加 */
}
</style>
