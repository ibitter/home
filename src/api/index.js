import axios from "axios";
import dayjs from 'dayjs';
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url
      .split("@")
      .slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      title: v.name || v.title,
      artist: v.artist || v.author,
      src: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      pic: v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      title: v.name || v.title,
      artist: v.artist || v.author,
      src: v.url,
      pic: v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * Monitors
 */

// 获取Monitors数据
export function formatNumber(value) {
  return (Math.floor(value * 100) / 100).toString();
}

export function formatDuration(seconds) {
  let s = parseInt(seconds);
  let m = 0;
  let h = 0;
  if (s >= 60) {
    m = parseInt(s / 60);
    s = parseInt(s % 60);
    if (m >= 60) {
      h = parseInt(m / 60);
      m = parseInt(m % 60);
    }
  }
  let text = `${s} 秒`;
  if (m > 0) text = `${m} 分 ${text}`;
  if (h > 0) text = `${h} 小时 ${text}`;
  return text;
}
export const GetMonitors = async (apikey) => {
  const dates = [];
  const today = dayjs(new Date().setHours(0, 0, 0, 0));
  for (let d = 0; d < 60; d++) {
    dates.push(today.subtract(d, 'day'));
  }

  const ranges = dates.map((date) => `${date.unix()}_${date.add(1, 'day').unix()}`);
  const start = dates[dates.length - 1].unix();
  const end = dates[0].add(1, 'day').unix();
  ranges.push(`${start}_${end}`);

  const postdata = {
    api_key: apikey,
    format: 'json',
    logs: 1,
    log_types: '1-2',
    logs_start_date: start,
    logs_end_date: end,
    custom_uptime_ranges: ranges.join('-'),
  };
  const response = await axios.post('https://api.uptimerobot.com/v2/getMonitors', postdata, {
    timeout: 10000
  });
  if (response.data.stat !== 'ok') {
    throw response.data.error;
  };
  return response.data.monitors.map((monitor) => {

    const ranges = monitor.custom_uptime_ranges.split('-');
    const average = formatNumber(ranges.pop());
    const daily = [];
    const map = [];
    dates.forEach((date, index) => {
      map[date.format('YYYYMMDD')] = index;
      daily[index] = {
        date: date,
        uptime: formatNumber(ranges[index]),
        down: {
          times: 0,
          duration: 0
        },
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
    }, {
      times: 0,
      duration: 0
    });

    const result = {
      id: monitor.id,
      name: monitor.friendly_name,
      url: monitor.url,
      average: average,
      daily: daily,
      total: total,
      status: '未知',
    };
    if (monitor.status === 2) {
      result.status = '正常';
    };
    if (monitor.status === 9) {
      result.status = '离线';
    };
    return result;
  });
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`
  );
  return await res.json();
};

/**
 * 获取配置
 */

// 获取社交链接
export const getSocialLinks = async () => {
  const res = await fetch("/socialLinks.json");
  return await res.json();
};
