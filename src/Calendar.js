import React, { Component } from 'react';
import Moment from 'moment';
import "./css/calendar.css";
import axios from "axios";

class Calendar extends Component {
    state = {
        // initDate : Moment().format("YYYY/MM/DD"),
        initDate : Moment().format("2018/10/06"),
        weekText : [{text:"星期日",en:"Sunday"},{text:"星期一",en:"Monday"},{text:"星期二",en:"Tuesday"},{text:"星期三",en:"Wednesday"},{text:"星期四",en:"Thursday"},{text:"星期五",en:"Friday"},{text:"星期六",en:"Saturday"}],
        weekToatalDay : 7,
        tableGrid : 35,
        jsonUrl : '/json/data1.json',
        jsonData : []
    }
    componentDidMount = () => {
        this.getJsonData()
        .then(res => {this.setState({jsonData:res})})  
        .then(this.setJsonData)    
    }
    getJsonData = () => {
        return axios.get(this.state.jsonUrl)
        .then( res => res.data.sort((a, b) => Moment(b.date).diff(Moment(a.date))))
        .catch((error) => {console.log(error)});
    }
    setJsonData = () => {
        //get now date
        //set YYYY/MM data 
        // console.log(this.state.jsonData)
    }
    renderTitle = () => {
        const now = Moment(this.state.initDate).format("YYYY MM月"); 
        const pre = Moment(this.state.initDate).subtract(1, 'months').format("YYYY MM月");
        const next = Moment(this.state.initDate).add(1, 'months').format("YYYY MM月");
        const next2 = Moment(this.state.initDate).add(2, 'months').format("YYYY MM月");
        const nowDataInfo = Moment(this.state.initDate).format("YYYY/MM");
        const preDataInfo = Moment(this.state.initDate).subtract(1, 'months').format("YYYY/MM");
        const nextDataInfo = Moment(this.state.initDate).add(1, 'months').format("YYYY/MM");
        const next2DataInfo = Moment(this.state.initDate).add(2, 'months').format("YYYY/MM");

        return(
            <div className="changeMonthBlock">
                <div className="pre">{'◀'}</div>
                <div onClick={this.ckickMothTitle} data-info={nowDataInfo + '/01'} className="monthBlock active">{now}</div>
                <div onClick={this.ckickMothTitle} data-info={nextDataInfo + '/01'} className="monthBlock">{next}</div>
                <div onClick={this.ckickMothTitle} data-info={next2DataInfo + '/01'} className="monthBlock">{next2}</div>
                <div className="next">{'▶'}</div>
            </div> 
        )
    }
    ckickMothTitle = e => {
        this.setState({initDate:e.currentTarget.dataset.info})
        // console.log(e.currentTarget.dataset.info.split('/',2).join(''))
        // console.log(this.state.initDate.split('/',2).join(''))
    }
    renderDay = () => {
        const { initDate,weekText,weekToatalDay,tableGrid } = this.state;
        const endDay = parseInt(Moment(initDate).endOf('month').format('DD'),10); 
        const startDay = Moment(initDate).startOf('month').format('dddd');
        const monthDataArr = [];
        let weekDataArr = [];
        let startIndex = weekText.map(obj=>obj.en).indexOf(startDay);
        let d = 1;
        for(let i=0;i<=tableGrid-1;i++){
            if(i < startIndex || i >= endDay + startIndex){
                weekDataArr.push({empty:true})
            }else{
                weekDataArr.push({
                    year:Moment(initDate).format('YYYY'),
                    month:Moment(initDate).format('MM'),
                    day:d >= endDay ? d : d++,
                    week:Moment(Moment(initDate).format('YYYY') + "/" + Moment(initDate).format('MM') + "/" + d).format("dddd"),
                    empty:false
                })
            }
            if((i+1)%weekToatalDay === 0){
                monthDataArr.push(weekDataArr);
                weekDataArr = [];
            }
        }
        return monthDataArr.map((obj,i) => <div key={i} className="div_tr">{obj.map((day,j)=>
                <div key={j} className={day.empty ? 'div_td noDay' : 'div_td'}>
                    <div className="dayText">{day.empty ? '' : day.day}</div>
                    <div className="content">{this.renderContent(day)}</div>
                </div>)}</div>)
    }
    renderContent = (days) => {
        if(!days.empty && this.state.jsonData.length != 0){
           let date = days.year + "/" + days.month + "/" + ((days.day) < 10 ? '0' + days.day : days.day);
           let info = this.state.jsonData.filter(obj => obj.date === date);
           console.log(info)
           if(info.length != 0){
            return ([
                // <div>{info[0].date}</div>,
                <div>{info[0].status}</div>,
                <div>可賣 : {info[0].availableVancancy}</div>,
                <div>團位 : {info[0].totalVacnacy}</div>,
                <div>${info[0].price}</div>
            ])
           }
        }
    }
    render() {
        return (
            <div className="main_container">
                {this.renderTitle()}
                <div className="div_table">
                    <div className="div_tr weekBlock">
                        {this.state.weekText.map((obj,i) => <div className="div_td weekText" key={i}>{obj.text}</div>)}
                    </div>
                    {this.renderDay()}
                </div>
            </div>
        );
    }
}

export default Calendar;