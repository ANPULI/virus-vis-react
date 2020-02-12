import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import geoCoordMap from './assets/geoCoordCity.json'
import './index.css'
require('echarts/map/js/china')

const url = "https://virus-spider.now.sh/api";

function convertData(data) {
  if (data === null) {
    return null;
  }
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var province = data[i].name.slice(0, 2)
    var geoCoord = geoCoordMap[province];
    if (!geoCoord) {
      province = data[i].name.slice(0, 3)
      geoCoord = geoCoordMap[province];
    }
    if (geoCoord) {
      let value = data[i].value;
      if (value.length === 2) { value.push(0); }
      res.push({
          name: province,
          value: geoCoord.concat(value.reverse())
      });
    }
  }
  console.log(res)
  return res;
}

function getAccData(data) {
  if (data === null) { return null; }
  console.log(data)
  let res = data.slice(0, 1);
  for (let i = 1; i < data.length; i++) {
    res.push(res[res.length - 1] + data[i]);
  }
  return res;
}

function Map(props) {

  const formattedSubtext = () => "数据来源：维基百科 | " + new Date().toLocaleString('zh').slice(0, -3);

  const getOption = (data) => {
    return ({
      title: {
        text: "内地新冠肺炎疫情实时动态",
        subtext: formattedSubtext(),
        sublink: "https://zh.wikipedia.org/wiki/%E6%96%B0%E5%9E%8B%E5%86%A0%E7%8B%80%E7%97%85%E6%AF%92%E8%82%BA%E7%82%8E%E4%B8%AD%E5%9C%8B%E5%A4%A7%E9%99%B8%E7%96%AB%E6%83%85%E7%97%85%E4%BE%8B",
        left: "center",
      },
      tooltip: {
        trigger: 'item',
        showDelay: 0,
        transitionDuration: 0.2
      },
      visualMap: {
        type: 'piecewise',
        min: 0,
        max: 10000,
        maxOpen: true,
        left: 'left',
        realtime: true,
        calculable: true,
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 3,
        inRange: {
          color: ['#F8D199', '#FFD20A', '#EA3300', '#8B0000'],
          symbol: 'circle',
        },
        pieces: [
          {gte: 10000},
          {gte: 1000, lte: 9999},
          {gte: 500, lte: 999},
          {gte: 100, lte: 499},
          {gte: 1, lte: 99},
        ],
      },
      toolbox: {
        show: true,
        left: 'left',
        top: 'top',
        feature: {
          saveAsImage: {},
        },
      },
      series: [
        {
          name: '影响人数',
          type: 'map',
          mapType: 'china',
          roam: false,
          zoom: 1.2,
          label: {
            normal: {
              show: true,
              fontFamily: 'STHeiti',
            },
            emphasis: {
              show: true
            },
            fontFamily: 'STHeiti',
          },
          itemStyle: {
            borderColor: 'darkgray',
            // borderWidth: 1,
            emphasis: {
              areaColor: 'skyblue',
              show: true
            }
          },
          data: data,
          tooltip: {
            formatter: function (params) {
              if (params.data === undefined) { return undefined; }
              const value = params.data.value;
              return (
                `<b>${params.name}</b>
                <br /> - 确诊：${value[4]}
                <br /> - 死亡：${value[3]}
                <br /> - 治愈：${value[2]}`
              );
            },
          }
        }
      ]
    });
  }

  return (
    <ReactEcharts
      option={getOption(convertData(props.data))}
      className='map-chart' />
  );
}

function Line(props) {

  const getOption = (data, type) => {
    let getData = (cat, type) => {
      if (data === null) { return null; }
      return (type === 'new') ? data[cat] : getAccData(data[cat]);
    }
    return ({
      title: {
        text: `${(type === 'new') ? '每日新增' : '全国累计'}`,
        left: "left",
        textStyle: {
          fontWeight: 'bold',
          fontSize: 14,
          fontFamily: 'Microsoft Yahei',
        }
      },
      tooltip: {
          trigger: 'axis',
          showDelay: 0,
          transitionDuration: 0.2
      },
      legend: {
        data: ['确诊', '死亡', '治愈'],
        orient: 'horizontal',
        left: 'right',
        top: 'top',
        itemHeight: 9,
        itemGap: 3,
      },
      series: [{
        name: '确诊',
        type: 'line',
        yAxisIndex: 1,
        data: getData('确诊', type)
      }, {
        name: '死亡',
        type: 'line',
        data: getData('死亡', type)
      }, {
        name: '治愈',
        type: 'line',
        data: getData('治愈', type)
      }],
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: (data === null) ? data : data.日期.slice(0, -1)
      },
      yAxis: [{
        name: '死亡/治愈',
        type: 'value',
        splitLine: {show: false},
        max: function (value) {return Math.ceil(value.max / 60) * 100}
      }, {
        name: '确诊',
        type: 'value'
      },]
    });
  };

  return (
    <ReactEcharts
      option={getOption(props.data, props.type)}
      className={"line-chart-" + props.type} />
  )
}

class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: null};
  }
  timeTicket = null;

  fetchData = () => {
    fetch(url).then(response => response.json()).then(data => {
      this.setState({data: data});
      sessionStorage.setItem('data', JSON.stringify(data));
    });
  }

  componentDidMount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket);
    }
    let data = sessionStorage.getItem('data');
    if (!data) {
      this.fetchData();
    } else {
      this.setState({data: JSON.parse(data)});
    }
    this.timeTicket = setInterval(() => {
      this.fetchData();
    }, 1000*60*30);
  };

  componentWillUnmount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket);
    }
  };

  render() {
    const dataMap = (this.state.data === null) ? null : this.state.data.省级.累计;
    const dataLine = (this.state.data === null) ? null : this.state.data.每日;
    return ( 
      <div className="charts">
        <div className="parent">
          {/* <label> Map Chart </label> */}
          <Map data={dataMap} />
          {/* <label> Line Chart 1</label> */}
          <Line data={dataLine} type={"acc"}/>
          {/* <label> Line Chart 2</label> */}
          <Line data={dataLine} type={"new"}/>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Charts /> , document.querySelector('#root')
)