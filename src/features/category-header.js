import React from "react"
import DetailsRenderer from "./details-renderer"

class CategoryHeader extends React.Component{
  getDescription = () =>{
    if( !this.props.category.description ){
        return null;
    }
    return (DetailsRenderer.convertMarkdownLinkSnippets(this.props.category.description))
  }  
  render(){  
    const score=parseInt(parseFloat(this.props.category.score)*100);
    const degree=score*355/100;
    const a=degree+" , 351.858";
    const todo={
                    transform:"rotate(-87.9537deg)",
                    strokeDasharray: a,    
                }
    let class1=null;
    if(score<50){
        class1="lh-gauge__wrapper lh-gauge__wrapper--fail"
    }
    else if (score>49 && score <90){
        class1="lh-gauge__wrapper lh-gauge__wrapper--average"
    }
    else{
        class1="lh-gauge__wrapper lh-gauge__wrapper--pass"
    }
    return(
        <div class="lh-category-header">
          <div class="lh-score__gauge" role="heading" aria-level="2">
            <a href="#" class={class1}>
              <div class="lh-gauge__svg-wrapper">
                <svg viewBox="0 0 120 120" class="lh-gauge">
                  <circle class="lh-gauge-base" r="56" cx="60" cy="60" stroke-width="8"></circle>
                  <circle class="lh-gauge-arc" r="56" cx="60" cy="60" stroke-width="8" style={todo}></circle>
                </svg>
              </div>
              <div class="lh-gauge__percentage">{score}</div>
              <div class="lh-gauge__label">{this.props.category.title}</div>
            </a>
          </div>
          <div class="lh-category-header__description">{this.getDescription()}</div>
        </div>
    )
  }    
}

export default CategoryHeader