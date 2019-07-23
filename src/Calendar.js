import React, { Component } from 'react';
import Moment from 'moment';
import "./css/calendar.css";
import axios from "axios";

class Calendar extends Component {
    state = {
        // initDate : Moment().format("YYYY/MM/DD"),
        initDate : Moment().format("2018/12/06"),
        weekText : [{text:"星期日",en:"Sunday"},{text:"星期一",en:"Monday"},{text:"星期二",en:"Tuesday"},{text:"星期三",en:"Wednesday"},{text:"星期四",en:"Thursday"},{text:"星期五",en:"Friday"},{text:"星期六",en:"Saturday"}],
        weekToatalDay : 7,
        tableGrid : 35,
        jsonUrl : '/json/data2.json',
        jsonData : [],
        isSelectList : true
    }
    componentDidMount = () => {
        this.getJsonData()
        .then(this.sortJsonData)      
    }
    getJsonData = () => {
        return axios.get(this.state.jsonUrl)
        .then( res => res.data.sort((a, b) => Moment(b.date).diff(Moment(a.date))))
        .catch((error) => {console.log(error)});
    }
    sortJsonData = (res) => {
        const newRes = res.map(o=>{
            if(Object.keys(o).includes('certain')){
                o["availableVancancy"] = o["onsell"];
                delete o["onsell"];
                o["guaranteed"] = o["certain"];
                delete o["certain"];
                o["totalVacnacy"] = o["total"];
                delete o["total"];
                o["status"] = o["state"];
                delete o["state"];
                return o
            }
            return o    
        })
        this.setState({jsonData:newRes})
        return newRes
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
                <div onClick={this.ckickMothTitle} data-info={preDataInfo + '/01'} className={this.activeTitle(preDataInfo + '/01')}>{pre}</div>
                <div onClick={this.ckickMothTitle} data-info={nowDataInfo + '/01'} className={this.activeTitle(nowDataInfo + '/01')}>{now}</div>
                <div onClick={this.ckickMothTitle} data-info={next2DataInfo + '/01'} className={this.activeTitle(nextDataInfo + '/01')}>{next}</div>
                <div className="next">{'▶'}</div>
            </div> 
        )
    }
    ckickMothTitle = e => {
        console.log(e.currentTarget.dataset.info.split('/',2).join(''))
        this.state.jsonData.map(o=>{
            // console.log(o.date.split('/',2).join(''))
        })

        this.setState({initDate:e.currentTarget.dataset.info})
    }
    activeTitle = (title) => {
        return this.state.initDate.split('/',2).join('') === title.split('/',2).join('') ?
        'monthBlock active' : 'monthBlock'
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
                    week_en:Moment(Moment(initDate).format('YYYY') + "/" + Moment(initDate).format('MM') + "/" + d).subtract(1, 'days').format("dddd"),
                    week_ch : this.state.weekText.filter(o=>(o.en === Moment(Moment(initDate)
                        .format('YYYY') + "/" + Moment(initDate).format('MM') + "/" + d).subtract(1, 'days').format("dddd") ? o.text : ''))[0].text,
                    empty:false
                })
            }
            if((i+1)%weekToatalDay === 0){
                monthDataArr.push(weekDataArr);
                weekDataArr = [];
            }
        }
        return monthDataArr.map((obj,i) => <div key={i} className="div_tr">{obj.map((days,j)=>
                <div key={j} className={days.empty ? 'div_td noDay noGroup' : this.renderContent(days) ? 'div_td hasData' : 'div_td noGroup'}>
                    <div className="right_block">
                        <div className="dayText">{days.empty ? '' : days.day}</div>
                        <div className="week_ch">{days.week_ch}</div>
                    </div>
                    <div className="content">{this.renderContent(days)}</div>
                </div>)}</div>)
    }
    renderContent = (days) => {
        if(!days.empty && this.state.jsonData.length != 0){
           let date = days.year + "/" + days.month + "/" + ((days.day) < 10 ? '0' + days.day : days.day);
           let info = this.state.jsonData.filter(obj => obj.date === date);
           if(info.length != 0){
            return ([
                <div className={info[0].guaranteed ? 'guaranteed' : 'guaranteed no'} key={'guaranteed'}>成團</div>,
                <div className={this.statusStyle(info[0].status)} key={'status'}>{info[0].status}</div>,
                <div className="availableVancancy" key={'availableVancancy'}>可賣 : {info[0].availableVancancy}</div>,
                <div className="totalVacnacy" key={'totalVacnacy'}>團位 : {info[0].totalVacnacy}</div>,
                <div className="price" key={'price'}>${this.moneyFormat(info[0].price)}</div>
            ])
           }
           return false
        }
    }
    statusStyle = (status) => {
        const style = 'status ';
        switch(status){
            case '報名' :
                return style + 'o'
            case '請洽專員' :
            case '後補' :
                return style + 'g'
            case '關團' :
            case '額滿' :
                return style    
            default :
                return style 
        }
    }
    moneyFormat = (money) => {
        if(money && money!=null){
            money = String(money);
            let left=money.split('.')[0],right=money.split('.')[1];
            right = right ? (right.length>=2 ? '.'+right.substr(0,2) : '.'+right+'0') : '';
            let temp = left.split('').reverse().join('').match(/(\d{1,3})/g);
            return (Number(money)<0?"-":"") + temp.join(',').split('').reverse().join('')+right;
        }
    }
    changeSelectList = () => {
        this.setState({isSelectList : !this.state.isSelectList})
    }
    render() {
        return (
            <div>
                <div className="changeBtn" onClick={this.changeSelectList}>{this.state.isSelectList ? "切換列表顯示" : "切換日歷顯示"}</div>
                <div className="main_container">
                    {this.renderTitle()}
                    <div className={this.state.isSelectList ? "div_table" : "div_table selectList"}>
                        <div className="div_tr weekBlock">
                            {this.state.weekText.map((obj,i) => <div className="div_td weekText" key={i}>{obj.text}</div>)}
                        </div>
                        {this.renderDay()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Calendar;