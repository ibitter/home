<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <!-- 网站列表 -->
    <Swiper
      v-if="siteLinks[0]"
      :modules="[Pagination, Mousewheel]"
      :slides-per-view="1"
      :space-between="40"
      :pagination="{
        el: '.swiper-pagination',
        clickable: true,
        bulletElement: 'div',
      }"
      :mousewheel="true"
    >
      <SwiperSlide v-for="site in siteLinksList" :key="site">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in site" :span="8" :key="item">
            <div
              class="item cards"
              :style="index < 3 ? 'margin-bottom: 20px' : null"
              @click="jumpLink(item)"
            >
              <Icon size="26">
                <component :is="siteIcon[item.icon]" />
              </Icon>
              <span class="name tooltip" :data-tooltip="item.info">{{ item.name }}</span>
              <span class="status">[状态：{{ item.status }}]</span>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>
  </div>
</template>

<script setup>
import { onMounted, reactive, h, ref } from "vue";
import { formatDuration, formatNumber, GetMonitors } from "@/api";
import { Error } from "@icon-park/vue-next";
import dayjs from 'dayjs';
import { Icon } from "@vicons/utils";
// 可前往 https://www.xicons.org 自行挑选并在此处引入
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode, Images, ImagesRegular } from "@vicons/fa"; // 注意使用正确的类别
import { mainStore } from "@/store";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper/modules";
import siteLinks from "@/assets/siteLinks.json";

const store = mainStore();


let linksData = reactive(siteLinks);
// 计算网站链接
let siteLinksList = computed(() => {
  const result = [];
  for (let i = 0; i < linksData.length; i += 6) {
    const subArr = linksData.slice(i, i + 6);
    result.push(subArr);
  }
  return result;
});
// 网站链接图标
const siteIcon = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
  Images, 
  ImagesRegular
};

// 链接跳转
const jumpLink = (data) => {
  if (data.name === "音乐" && store.musicClick) {
    if (typeof $openList === "function") $openList();
  } else {
    window.open(data.link, "_blank");
  }
};

//获取网站状态
const apiKey = 'ur2118239-e58fe57991118564a44a55a1';
//获取网站天数状态
const CountDays = 60;
const GetMonitorsData = () => {
  // 获取地理位置信息
  if (!apiKey) return onError("请配置UptimeRobot API Key");
  GetMonitors(apiKey, CountDays)
    .then((res) => {
      if (res.status) {
        res.data.monitors.map((monitor) => {
          const dates = [];
          const today = dayjs(new Date().setHours(0, 0, 0, 0));
          for (let d = 0; d < CountDays; d++) {
            dates.push(today.subtract(d, 'day'));
          }
          const ranges = monitor.custom_uptime_ranges.split('-');
          const average = formatNumber(ranges.pop());
          const daily = [];
          const map = [];
          dates.forEach((date, index) => {
            map[date.format('YYYYMMDD')] = index;
            daily[index] = {
              date: date,
              uptime: formatNumber(ranges[index]),
              down: { times: 0, duration: 0 },
            }
          });

          const total = monitor.logs.reduce((total, log) => {
            if (log.type === 1) {
              const date = dayjs.unix(log.datetime).format('YYYYMMDD');
              total.duration += log.duration;
              total.times += 1;
              daily[map[date]].down.duration += log.duration;
              daily[map[date]].down.times += 1;
            }
            return total;
          }, { times: 0, duration: 0 });

          const result = {
            id: monitor.id,
            name: monitor.friendly_name,
            url: monitor.url,
            average: average,
            daily: daily,
            total: total,
            status: '未知',
          };

          if (monitor.status === 2) result.status = '在线';
          if (monitor.status === 9) result.status = '离线';
          return linksData.map((data, index) => {
              if(typeof(data.key) == "undefined") {
                  data.status = '正常';
                  data.info = '正常';
              } else {
                  if(result.name == data.key) {
                    result.daily.map((v, i) => {
                      let text = result.total.times
            ? `最近 ${CountDays} 天故障 ${result.total.times} 次，累计时长 ${formatDuration(result.total.duration)}，平均可用率 ${result.average}%`
            : `最近 ${CountDays} 天可用率 ${result.average}%`;
                    data.status = result.status;
                    data.info = text;
                    })
                  }
              }
            })
        })
      } else {
        onError("网站信息获取失败!");
      }
    })
    .catch( err => {
      onError("发生错误：" + err);
    });
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message: message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  console.log(siteLinks);
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
    animation: fade 0.5s;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;
    .swiper-slide {
      height: 100%;
    }
    .swiper-pagination {
      margin-top: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 20px;
        height: 4px;
        margin: 0 4px;
        border-radius: 4px;
        opacity: 0.2;
        transition: opacity 0.3s;
        &.swiper-pagination-bullet-active {
          opacity: 1;
        }
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  .link-all {
    height: 220px;
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      padding: 0 10px;
      animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }

      &:active {
        transform: scale(1);
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
        left: -40px;
        display: block;
        content: attr(data-tooltip);
        font-size: 12px;
        background: #0d1e1db3;
        margin-top: -32px;
        padding: 8px 8px;
        width: 120px;
        border-radius: 6px;
        z-index: 99999999;
        /* text-align: center; */
        color: #fff;
        transition: opacity .25s,transform .25s;
        border: 1px solid #76787a;
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
    @media (max-width: 720px) {
      height: 180px;
    }
  }
}
</style>
