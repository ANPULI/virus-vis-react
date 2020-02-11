import React from 'react';
import ReactDOM from 'react-dom';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import geoCoordMap from './assets/geoCoordCity.json'
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
          res.push({
              name: province,
              value: geoCoord.concat(data[i].value.reverse())
          });
      }
  }
  console.log(res)
  return res;
}

class VisualMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  timeTicket = null;

  getInitialState = () => ({data: null, option: this.getOption(null),});

  componentDidMount() {
    
    
    // if (this.timeTicket) {
    //   clearInterval(this.timeTicket);
    // }
    // this.timeTicket = setInterval(() => {
    //   fetch(url).then(response => response.json).then(data => {
    //     console.log(data);
    //     let option = this.getOption(data);
    //     option.title.text += this.formattedDateTime();
    //     this.setState({data: data, option: option});
    //   });
    // }, 100000);
    fetch(url).then(response => response.json()).then(data => {
      window.data = data;
      console.log(data);
      let option = this.getOption(convertData(data.省级.累计));
      option.title.subtext = this.formattedSubtext();
      this.setState({data: data, option: option});
    });
  };

  componentWillUnmount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket);
    }
  };

  formattedDateTime = () => new Date().toLocaleString('zh').slice(0, -3);
  formattedSubtext = () => "数据来源：维基百科 | " + this.formattedDateTime();

  getOption = (data) => {
    return ({
      title: {
        text: "全国新型肺炎疫情实时动态",
        subtext: this.formattedSubtext(),
        sublink: "https://zh.wikipedia.org/wiki/%E6%96%B0%E5%9E%8B%E5%86%A0%E7%8B%80%E7%97%85%E6%AF%92%E8%82%BA%E7%82%8E%E4%B8%AD%E5%9C%8B%E5%A4%A7%E9%99%B8%E7%96%AB%E6%83%85%E7%97%85%E4%BE%8B",
        left: "center",
      },
      tooltip: {
        trigger: 'item',
        showDelay: 0,
        transitionDuration: 0.2,
        formatter: function (params) {
          const value = params.data.value;
          return params.seriesName + ` - <em>${params.name}</em><br />确诊: ` + value[4] + '<br/>死亡: ' + value[3] + '<br/>治愈: ' + value[2];
        },
      },
      visualMap: {
        min: 0,
        max: 1000,
        text: ['High', 'Low'],
        left: 'right',
        realtime: true,
        calculable: true,
        inRange: {
          color: ['#FFFFFF', '#FFF6CE', '#FFD20A', '#EA3300', '#8B0000']
        },
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
          roam: true,
          label: {
            normal: {
              show: true
            },
            emphasis: {
              areaColor: 'skyblue',
              show: true
            }
          },
          itemStyle: {
            emphasis: {
              areaColor: 'skyblue',
              show: true
            }
          },
          aspectScale: 0.85,
          data: data
        }
      ]
    });
  }

  render() {
    return ( 
      <div className="charts">
        {this.formattedDateTime()}
        <div className="parent">
          <label> Map Chart </label>
          <ReactEcharts
            option={this.state.option}
            style={{height: '500px', width: '1000px'}}
            className='geo_chart' />
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <VisualMap /> , document.querySelector('#root')
)