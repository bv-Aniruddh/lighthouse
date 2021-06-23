import React from "react"
import Util from "../utils"
import DetailsRenderer from "../details-renderer"

class RenderOtherClumps extends React.Component{ 
  loadStackpacks = ( audit ) => {
    if (!audit.stackPacks){
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

  renderGroupAudits = ( clumps,description )=>{
    const auditsGroups = []

    for (const [clumpId, groupAuditRefs] of clumps){
        const renderedAudits=groupAuditRefs.map((audit)=>this.renderAudit(audit))
        let Class="lh-clump lh-audit-group lh-clump--"+clumpId
        const title=this._clumpTitles(clumpId)

        auditsGroups.push(
            <details className={Class} open="">
              <summary>   
                <div className="lh-audit-group__summary">    
                  <div class="lh-audit-group__header">
                    <span class="lh-audit-group__title">{title}</span>
                    <span class="lh-audit-group__itemcount">({groupAuditRefs.length})</span>
                    {this.renderDescription(description,clumpId)}
                  </div>
                </div>
              </summary>
              {renderedAudits}
            </details>
        )
    }

    return auditsGroups
  }

  renderDescription = (description,clumpId) =>{
    if( clumpId!=='manual' ) return null
    return(
      <span class="lh-audit-group__description">{DetailsRenderer.convertMarkdownLinkSnippets(description)}</span>
    )
  }
  renderAudit = (audit)=>{
    return(
        <div class={Util._setRatingClass(audit.result.score,audit.result.scoreDisplayMode)} id={audit.result.id}>
          <details class="lh-expandable-details" open="">
            <summary>
              <div class="lh-audit__header lh-expandable-details__summary">
                <span class="lh-audit__score-icon"></span>
                <span class="lh-audit__title-and-text">
                  <span class="lh-audit__title"><span>{DetailsRenderer.convertMarkdownCodeSnippets(audit.result.title)}</span></span>
                  <span class="lh-audit__display-text">{audit.result.displayValue}</span>
                </span>
                <div class="lh-chevron-container">
                  <svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <g class="lh-chevron__lines">
                      <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                      <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                    </g>
                  </svg>
                </div>
              </div>
            </summary>
            <div class="lh-audit__description">
              <span>{DetailsRenderer.convertMarkdownLinkSnippets(audit.result.description)}</span>
            </div>
            {this.loadStackpacks(audit)}
            <table class="lh-table lh-details">

            <thead><tr>{DetailsRenderer.renderTableHeader(audit.result.details)}</tr></thead>
            <tbody>{DetailsRenderer.tablerender(audit.result.details)}</tbody>
            
            </table>
          </details>
        </div>
    )
  }
  _clumpTitles(clumpId) {
    switch (clumpId){
        case 'warning': 
            return Util.i18n.strings.warningAuditsGroupTitle
        case 'manual': 
            return Util.i18n.strings.manualAuditsGroupTitle 
        case 'passed': 
            return Util.i18n.strings.passedAuditsGroupTitle  
        default: 
            return Util.i18n.strings.notApplicableAuditsGroupTitle         
    }
  }
  render(){   
    const clumps = new Map()

    for(const [clumpId, groupAuditRefs] of this.props.clumps){
        if(groupAuditRefs.length===0){
            continue;
        }
        clumps.set(clumpId,groupAuditRefs)
    }
    
    return (this.renderGroupAudits(clumps,this.props.description))
  }  
}

export default RenderOtherClumps