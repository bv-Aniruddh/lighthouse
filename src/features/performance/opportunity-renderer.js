
import React from "react"
import DetailsRenderer from "../details-renderer"

class OpportunityRenderer extends React.Component{   
  loadStackpacks = ( audit ) => {
    if( !audit.stackPacks ){
      return null
    }
    const collection = []
    audit.stackPacks.forEach((pack) => {
      collection.push(
        
        <div className="lh-audit__stackpack">
          <img className='lh-audit__stackpack__img' src={pack.iconDataURL} alt={pack.title}></img>
          <span>{DetailsRenderer.convertMarkdownLinkSnippets(pack.description)}</span>
        </div>
        
      )
    })
    return (<div className="lh-audit__stackpacks">{collection}</div>)
  }
  selectClass( score ){
    score=parseFloat( score );
    if(score < 0.5) return "lh-audit lh-audit--load-opportunity lh-audit--numeric lh-audit--fail"
    else return "lh-audit lh-audit--load-opportunity lh-audit--numeric lh-audit--average"
  }
  generateStyle( details,scale ){
    const sparklineWidthPct = `${(details.overallSavingsMs / scale) * 100}%`;
    return {width:sparklineWidthPct}; 
  }
  getNumeric( value ){
    value=(parseFloat(value)/1000).toFixed(2);
    return value;
  }
  render(){
    if(!this.props.opportunityAudits.length)
    {
        return (null);
    }
    const opportunityloader = this.props.opportunityAudits.map((opportunity)=>(
        <div class={this.selectClass(opportunity.result.score)}>
        <details class="lh-expandable-details" open="">
        <summary>
          <div class="lh-audit__header lh-expandable-details__summary">
          

            <div class="lh-load-opportunity__cols">
              <div class="lh-load-opportunity__col lh-load-opportunity__col--one">
                <span class="lh-audit__score-icon"></span>
                <div class="lh-audit__title"><span>{DetailsRenderer.convertMarkdownLinkSnippets(opportunity.result.title)}</span></div>
              </div>
              <div class="lh-load-opportunity__col lh-load-opportunity__col--two">
                <div class="lh-load-opportunity__sparkline" title={opportunity.result.displayValue}>
                  <div class="lh-sparkline"><div class="lh-sparkline__bar" style={this.generateStyle(opportunity.result.details,this.props.scale)}></div></div>
                </div>
                <div class="lh-audit__display-text" title={opportunity.result.displayValue}>{this.getNumeric(opportunity.result.numericValue,this.props.scale)}</div>
                <div class="lh-chevron-container"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <g class="lh-chevron__lines">
                <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                </g>
                </svg>
                </div>
              </div>
              
            </div>
          </div>
        </summary>
        <div class="lh-audit__description"><span>{DetailsRenderer.convertMarkdownLinkSnippets(opportunity.result.description)}</span></div>
        {this.loadStackpacks( opportunity )}
        <table class="lh-table lh-details">
            <thead><tr>{DetailsRenderer.renderTableHeader(opportunity.result.details)}</tr></thead>
            <tbody>{DetailsRenderer.tablerender(opportunity.result.details)}</tbody>
            <tbody></tbody>
        </table>    
        </details>
        </div>
    ))
    return(
      <div class="lh-audit-group lh-audit-group--load-opportunities">
        <div class="lh-audit-group__header">
          <span class="lh-audit-group__title">Opportunities</span>
          <span class="lh-audit-group__description">These suggestions can help your page load faster. They don't <a rel="noopener" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=node">directly affect</a> the Performance score.
          </span>
        </div>
        <div class="lh-load-opportunity__header lh-load-opportunity__cols">
          <div class="lh-load-opportunity__col lh-load-opportunity__col--one">Opportunity</div>
          <div class="lh-load-opportunity__col lh-load-opportunity__col--two">Estimated Savings</div>
        </div>
        {opportunityloader}
      </div>
    )
  }  
}

export default OpportunityRenderer