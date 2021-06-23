import React from "react"
import Util from "../utils"
import DetailsRenderer from "../details-renderer"
import {useSelector} from "react-redux"
const _getGroupIds = ( auditRefs ) =>{
    const groupIds = auditRefs
      .map((ref) => ref.group)
      .filter((g) => !!g);
    return new Set(groupIds);
  }

const _getPassingGroupIds = ( auditRefs )=>{
    const uniqueGroupIds = _getGroupIds(auditRefs);
    for (const auditRef of auditRefs) {
      if (!Util.showAsPassed(auditRef.result) && auditRef.group) {
        uniqueGroupIds.delete(auditRef.group);
      }
    }

    return uniqueGroupIds;
  }
  const loadStackpacks = ( audit ) => {
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
  const renderAudit = ( audit )=>{
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
              <div class="lh-chevron-container"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <g class="lh-chevron__lines">
                <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                </g>
              </svg></div>
            </div>
            </summary>
            <div class="lh-audit__description"><span>{DetailsRenderer.convertMarkdownLinkSnippets(audit.result.description)}</span></div>
            {loadStackpacks(audit)}
            <table class="lh-table lh-details">

            <thead><tr>{DetailsRenderer.renderTableHeader(audit.result.details)}</tr></thead>
            <tbody>{DetailsRenderer.tablerender(audit.result.details)}</tbody>
            
            </table>    
            </details>
            </div>
    )
}
const getClassNameForGroup = ( groupId,regularAuditRefs ) => {
    const passedGroups=_getPassingGroupIds(regularAuditRefs)
    if( passedGroups.has(groupId) )
    {
        return `lh-audit-group lh-audit-group--${groupId} lh-badged`
    }
    return `lh-audit-group lh-audit-group--${groupId}`
}
const renderGroupAudits = ( grouped,groups,regularAuditRefs )=>{
    const auditsGroups = []
    for (const [groupId, groupAuditRefs] of grouped){
        const auditsGroup=groupAuditRefs.map((audit)=>renderAudit(audit))
        auditsGroups.push(
            <div className={getClassNameForGroup(groupId,regularAuditRefs)}>
            <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">{groups[groupId].title}</span>
            <span class="lh-audit-group__description">{groups[groupId].description}</span>
            </div>
            {auditsGroup}
            </div>
        )
    }
    return auditsGroups
}
const renderDescription = ( description,clumpId ) =>{
    if(clumpId!=='manual') return null;
    return(
      <span class="lh-audit-group__description">{DetailsRenderer.convertMarkdownLinkSnippets(description)}</span>
    )
  }
const PwaRenderer = ( props ) =>{
    const data = useSelector((state)=>state.data.lighthouseData);
    const clone = (JSON.parse(JSON.stringify(data)));
    for (const category of Object.values(clone.categories)) {
        category.auditRefs.forEach((auditRef) => {
          const result = clone.audits[auditRef.id];
          auditRef.result = result;
        });
    } 
    const pwaCategory=clone.categories.pwa.auditRefs;
    const regularAuditRefs = pwaCategory.filter(
        (ref) => ref.result.scoreDisplayMode !== 'manual'
      );

    const grouped = new Map();    
    const notAGroup = 'NotAGroup';
    grouped.set(notAGroup, []);
    for(const auditRef of regularAuditRefs) {
        const groupId = auditRef.group || notAGroup;
        const groupAuditRefs = grouped.get(groupId) || [];
        groupAuditRefs.push(auditRef);
        grouped.set(groupId, groupAuditRefs);
      }
      grouped.delete(notAGroup);
    const allGroups = _getGroupIds(regularAuditRefs);  
    const passedGroupIds = _getPassingGroupIds(regularAuditRefs)
      let s = 'lh-gauge__wrapper lh-gauge--pwa__wrapper'
      if(passedGroupIds.size === allGroups.size){
          s = s + ' lh-baged--all'
      }
      else{
          for(const passedGroupId of passedGroupIds){
              s = s + ` lh-badged--${passedGroupId}`
          }
      }
    const manualAuditRefs = pwaCategory.filter(
        (ref) => ref.result.scoreDisplayMode === 'manual'
      );  
    const manualRenderer=manualAuditRefs.map((audit)=>renderAudit(audit))  
    return(
        <div class="lh-category-wrapper">
        <div class="lh-category">
        <div class="lh-category-header">
        <div class="lh-score__gauge" role="heading" aria-level="2">
  

    <a href="#pwa" class={s} title="Installable: 0/1, PWA Optimized: 3/8">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" class="lh-gauge lh-gauge--pwa">
      <defs>
        <linearGradient id="lh-gauge--pwa__check-circle__gradient-2" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop stop-color="#00C852" offset="0%"></stop>
          <stop stop-color="#009688" offset="100%"></stop>
        </linearGradient>
        <linearGradient id="lh-gauge--pwa__installable__shadow-gradient-2" x1="76.056%" x2="24.111%" y1="82.995%" y2="24.735%">
          <stop stop-color="#A5D6A7" offset="0%"></stop>
          <stop stop-color="#80CBC4" offset="100%"></stop>
        </linearGradient>
        <linearGradient id="lh-gauge--pwa__fast-reliable__shadow-gradient-2" x1="76.056%" y1="82.995%" x2="25.678%" y2="26.493%">
          <stop stop-color="#64B5F6" offset="0%"></stop>
          <stop stop-color="#2979FF" offset="100%"></stop>
        </linearGradient>

        <g id="lh-gauge--pwa__fast-reliable-badge-2">
          <circle fill="#FFFFFF" cx="10" cy="10" r="10"></circle>
          <path fill="#304FFE" d="M10 3.58l5.25 2.34v3.5c0 3.23-2.24 6.26-5.25 7-3.01-.74-5.25-3.77-5.25-7v-3.5L10 3.58zm-.47 10.74l2.76-4.83.03-.07c.04-.08 0-.24-.22-.24h-1.64l.47-3.26h-.47l-2.7 4.77c-.02.01.05-.1-.04.05-.09.16-.1.31.18.31h1.63l-.47 3.27h.47z"></path>
        </g>
        <g id="lh-gauge--pwa__installable-badge-2">
          <circle fill="#FFFFFF" cx="10" cy="10" r="10"></circle>
          <path fill="#009688" d="M10 4.167A5.835 5.835 0 0 0 4.167 10 5.835 5.835 0 0 0 10 15.833 5.835 5.835 0 0 0 15.833 10 5.835 5.835 0 0 0 10 4.167zm2.917 6.416h-2.334v2.334H9.417v-2.334H7.083V9.417h2.334V7.083h1.166v2.334h2.334v1.166z"></path>
        </g>
        </defs>

        <g stroke="none" fill-rule="nonzero">
        <circle class="lh-gauge--pwa__disc" cx="30" cy="30" r="30"></circle>
        <g class="lh-gauge--pwa__logo">
          <path class="lh-gauge--pwa__logo--secondary-color" d="M35.66 19.39l.7-1.75h2L37.4 15 38.6 12l3.4 9h-2.51l-.58-1.61z"></path>
          <path class="lh-gauge--pwa__logo--primary-color" d="M33.52 21l3.65-9h-2.42l-2.5 5.82L30.5 12h-1.86l-1.9 5.82-1.35-2.65-1.21 3.72L25.4 21h2.38l1.72-5.2 1.64 5.2z"></path>
          <path class="lh-gauge--pwa__logo--secondary-color" fill-rule="nonzero" d="M20.3 17.91h1.48c.45 0 .85-.05 1.2-.15l.39-1.18 1.07-3.3a2.64 2.64 0 0 0-.28-.37c-.55-.6-1.36-.91-2.42-.91H18v9h2.3V17.9zm1.96-3.84c.22.22.33.5.33.87 0 .36-.1.65-.29.87-.2.23-.59.35-1.15.35h-.86v-2.41h.87c.52 0 .89.1 1.1.32z"></path>
        </g>

        
        <rect class="lh-gauge--pwa__component lh-gauge--pwa__na-line" fill="#FFFFFF" x="20" y="32" width="20" height="4" rx="2"></rect>

        
        <g class="lh-gauge--pwa__component lh-gauge--pwa__fast-reliable-badge" transform="translate(20, 29)">
          <path fill="url(#lh-gauge--pwa__fast-reliable__shadow-gradient-2)" d="M33.63 19.49A30 30 0 0 1 16.2 30.36L3 17.14 17.14 3l16.49 16.49z"></path>
          <use href="#lh-gauge--pwa__fast-reliable-badge-2"></use>
        </g>

        
        <g class="lh-gauge--pwa__component lh-gauge--pwa__installable-badge" transform="translate(20, 29)">
          <path fill="url(#lh-gauge--pwa__installable__shadow-gradient-2)" d="M33.629 19.487c-4.272 5.453-10.391 9.39-17.415 10.869L3 17.142 17.142 3 33.63 19.487z"></path>
          <use href="#lh-gauge--pwa__installable-badge-2"></use>
        </g>

        <g class="lh-gauge--pwa__component lh-gauge--pwa__fast-reliable-installable-badges">
          <g transform="translate(8, 29)"> 
            <path fill="url(#lh-gauge--pwa__fast-reliable__shadow-gradient-2)" d="M16.321 30.463L3 17.143 17.142 3l22.365 22.365A29.864 29.864 0 0 1 22 31c-1.942 0-3.84-.184-5.679-.537z"></path>
            <use href="#lh-gauge--pwa__fast-reliable-badge-2"></use>
          </g>
          <g transform="translate(32, 29)"> 
            <path fill="url(#lh-gauge--pwa__installable__shadow-gradient-2)" d="M25.982 11.84a30.107 30.107 0 0 1-13.08 15.203L3 17.143 17.142 3l8.84 8.84z"></path>
            <use href="#lh-gauge--pwa__installable-badge-2"></use>
          </g>
        </g>

        
        <g class="lh-gauge--pwa__component lh-gauge--pwa__check-circle" transform="translate(18, 28)">
          <circle fill="#FFFFFF" cx="12" cy="12" r="12"></circle>
          <path fill="url(#lh-gauge--pwa__check-circle__gradient-2)" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
        </g>
        </g>
        </svg>

        <div class="lh-gauge__label">Progressive Web App</div>
        </a>
        </div>
        <div class="lh-category-header__description"><span>These checks validate the aspects of a Progressive Web App. <a rel="noopener" target="_blank" href="https://developers.google.com/web/progressive-web-apps/checklist?utm_source=lighthouse&amp;utm_medium=node">Learn more</a>.</span></div>
        </div>
        {renderGroupAudits(grouped,clone.categoryGroups,regularAuditRefs)}
        <details className='lh-clump lh-audit-group lh-clump--manual' open="">
            <summary>   
            <div className="lh-audit-group__summary">    
            <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">{Util.i18n.strings.manualAuditsGroupTitle }</span>
            <span class="lh-audit-group__itemcount">({manualAuditRefs.length})</span>
            {renderDescription(clone.categories.pwa.manualDescription,'manual')}
            </div>
            </div>
            </summary>
            {manualRenderer}
            </details>
        </div>    
        </div>
    )
}
export default PwaRenderer