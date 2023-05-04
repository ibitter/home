<template>
  <div class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <el-row class="link-all" :gutter="20">
      <el-col
        :span="8"
        v-for="(item, index) in linksData"
        :key="item"
        @click="jumpLink(item.link)"
      >
        <div
          class="item cards"
          :style="index < 3 ? 'margin-bottom: 20px' : null"
        >
          <Icon size="26">
            <component :is="item.icon" />
          </Icon>
          <span class="name">{{ item.name }}</span>
          <span class="status">[状态：{{ item.status }}]</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { GetMonitors } from "@/api";
import { Icon } from "@vicons/utils";
import {
  Link,
  Blog,
  CompactDisc,
  Cloud,
  Compass,
  Book,
  Fire,
} from "@vicons/fa";

// 网站链接数据
// 建议不要超出6个，若需要超出请自行调整样式
let linksData = [
  {
    icon: Blog,
    name: "博客",
    link: "https://wp.ibit.cf/",
    key: 'm794288793-aa52550d7d6d20dcd10c0e76'
  },
  {
    icon: Fire,
    name: "JD快车",
    link: "https://jd.ibit.cf/",
    key: 'm794289772-64f14355832bfd361a75cb7f'
  },
  {
    icon: Cloud,
    name: "网盘",
    link: "https://pan.ibit.cf/",
    key: 'm794289776-c2996f8b9c65135ffffafb79'
  },
  {
    icon: CompactDisc,
    name: "图床",
    link: "https://img.ibit.cf/",
    key: 'm794289777-b0a5b73833e31d4bfa91c5e6'
  },
  {
    icon: Book,
    name: "在线PS",
    link: "https://ps.ibit.cf/",
    key: 'm794289780-2cfaaebf2e80a79df1e72584'
  },
  {
    icon: Cloud,
    name: "站点监测",
    link: "https://stats.uptimerobot.com/g9RpmtqoD0",
  },
];

// 链接跳转
const jumpLink = (url) => {
  window.open(url, "_blank");
};
//获取网站状态
const GetMonitorsData = () => {
  linksData = linksData.map((data) => {
    if (typeof(data.key) == "undefined") {
      data['status'] = "正常";
    };
    data['status'] = GetMonitors(data.key);
  })
};
onMounted(() => {
  // 调用网站状态
  GetMonitorsData();
});
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    animation: fade;
    -webkit-animation: fade 0.5s;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }
  .link-all {
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      animation: fade;
      -webkit-animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }
      .name {
        font-size: 1.1rem;
      }
      .status {
        font-size: 0.8rem;
      }
      @media (min-width: 720px) and (max-width: 820px) {
        .name {
          display: none;
        }
      }
      @media (max-width: 720px) {
        height: 80px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        .name {
          font-size: 1rem;
          margin-left: 0;
          margin-top: 8px;
        }
      }
    }
  }
}
</style>
