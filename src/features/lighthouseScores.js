import React from "react"
import '../App.css'
export class LighthouseScores extends React.Component{
  render() {  
    const score=parseInt(parseFloat(this.props.category.score)*100)
    const degree=this.props.category.score*355
    const a=degree+" , 351.858"
    const strokeStyle={
                    transform:"rotate(-87.9537deg)",
                    strokeDasharray: a,    
                }
    let class1=null;
    if (score<50){
        class1="lh-gauge__wrapper lh-gauge__wrapper--fail"
    }
    else if (score>49 && score <90){
        class1="lh-gauge__wrapper lh-gauge__wrapper--average"
    }
    else{
        class1="lh-gauge__wrapper lh-gauge__wrapper--pass"
    }
    return (
        <React.Fragment>
          <div class={class1}>
            <div class="lh-gauge__svg-wrapper">
              <svg viewBox="0 0 120 120" class="lh-gauge">
                <circle class="lh-gauge-base" r="56" cx="60" cy="60" stroke-width="8" fill={this.props.category.color1}></circle>
                <circle class="lh-gauge-arc" r="56" cx="60" cy="60" stroke-width="8" style={strokeStyle}></circle>
              </svg>
            </div>
            <div class="lh-gauge__percentage">{score}</div>
            <div class="lh-gauge__label">{this.props.category.title}</div>
          </div>
        </React.Fragment>
        
    )
  }  
}