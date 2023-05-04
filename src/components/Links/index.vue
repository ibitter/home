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
          <span class="name tooltip" data-tooltip="{{ item.info }}">{{ item.name }}</span>
          <span class="status">[状态：{{ item.status }}]</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { formatDuration, formatNumber, GetMonitors } from "@/api";
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
    key: 'blog'
  },
  {
    icon: Fire,
    name: "JD快车",
    link: "https://jd.ibit.cf/",
    key: 'JD'
  },
  {
    icon: Cloud,
    name: "网盘",
    link: "https://pan.ibit.cf/",
    key: 'pan'
  },
  {
    icon: CompactDisc,
    name: "图床",
    link: "https://img.ibit.cf/",
    key: 'IMG'
  },
  {
    icon: Book,
    name: "在线PS",
    link: "https://ps.ibit.cf/",
    key: 'PS'
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
const apiKey = 'u2118239-d7fde8699b14499972c152e3';
const GetMonitorsData = () => {
  try {
    const siteData = GetMonitors(apiKey);
    siteData.map((site) => {
      linksData = linksData.map((data, index) => {
          if(typeof(data.key) == "undefined") {
              data.status = "正常";
              data.info = "";
          } else {
              if(site.name == data.key) {
                site.daily.map((v, i) => {
                  let text = v.date.format('YYYY-MM-DD ');
                  if (v.uptime >= 100) {
                    text += `可用率 ${formatNumber(v.uptime)}%`;
                  }
                  else if (v.uptime <= 0 && v.down.times === 0) {
                    text += '无数据';
                  }
                  else {
                    text += `故障 ${v.down.times} 次，累计 ${formatDuration(v.down.duration)}，可用率 ${formatNumber(v.uptime)}%`;
                  }
                })
                data.status =  site.status;
                data.info =  text;
              }
          }
        })
     })
     return linksData;
  } catch(e) {
      console.log(e)
  }
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
      .tooltip {
        position: relative;
      }

      .tooltip:before {
        opacity: 0;
      }

      .tooltip:hover:before {
        opacity: 1;
      }

      .tooltip:before {
        position: absolute;
        left: -20px;
        display: block;
        content: attr(data-tooltip);
        font-size: 12px;
        background: #e6e6e6;
        margin-top: 32px;
        padding: 8px 4px;
        width: 120px;
        border-radius: 6px;
        z-index: 99999;
        text-align: center;
        color: #000;
        transition: opacity 0.25s, transform 0.25s;
        border: 1px solid #409eff;
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
