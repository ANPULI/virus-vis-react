import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ChartCom from './components/ChartCom'

const myUrl = "https://virus-spider.now.sh/api";
const qqDataUrl = "http://localhost:8080/api/";


class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myData: null,
      qqData: null,
    };
  }

  fetchData = () => {
    fetch(myUrl).then(response => response.json()).then(data => {
      this.setState({myData: data});
      sessionStorage.setItem("myData", JSON.stringify(data));
    });
    fetch(qqDataUrl).then(response => response.json()).then(data => {
      this.setState({qqData: data});
      sessionStorage.setItem("qqData", JSON.stringify(data));
      console.log(data)
    });
  }

  componentDidMount() {
    let myData = sessionStorage.getItem('myData');
    if (!myData) {
      this.fetchData();
    } else {
      this.setState({myData: JSON.parse(myData)});
    }
  }

  componentWillUnmount() {}

  render() {
    return (
      <ChartCom data={this.state.myData}/>
    );
  }
}

ReactDOM.render(
    <Main />,
    document.querySelector('#root')
);