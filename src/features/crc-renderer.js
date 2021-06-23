import DetailsRenderer from "./details-renderer"
import React from "react"
import Util from "./utils"
class CriticalRequestChainRenderer {
    static initTree( tree ) {
        let startTime = 0
        const rootNodes = Object.keys(tree)
        if (rootNodes.length > 0) {
            const node = tree[rootNodes[0]]
            startTime = node.request.startTime
        }

        return { tree, startTime, transferSize: 0 }
    }

    static nodeValue( segment ) {
        const url = segment.node.request.url
        if( !url ) return null
        if ( segment.hasChildren ) {
            return (
                <span className='crc-node__tree-value'>{DetailsRenderer.renderTextURL(url)} </span>
            )
        }
        else {

            const { startTime, endTime, transferSize } = segment.node.request
            return (
                <span className='crc-node__tree-value'>
                    {DetailsRenderer.renderTextURL(url)}
                    <span className='crc-node__chain-duration'> - {Util.i18n.formatMilliseconds((endTime - startTime) * 1000)}, </span>
                    <span className='crc-node__chain-duration'>{Util.i18n.formatBytesToKiB(transferSize, 0.01)}</span>
                </span>

            )
        }
    }

    static createChainNode( segment ) {

        const treeMarkeEl = []

        // Construct lines and add spacers for sub requests.
        segment.treeMarkers.forEach(( separator ) => {
            if ( separator ) {
                treeMarkeEl.push(<span class="tree-marker vert"></span>)
                treeMarkeEl.push(<span class="tree-marker"></span>)
            } 
            else {
                treeMarkeEl.push(<span class="tree-marker"></span>)
                treeMarkeEl.push(<span class="tree-marker"></span>)
            }
        });

        if ( segment.isLastChild ) {
            treeMarkeEl.push(<span class="tree-marker up-right"></span>)
            treeMarkeEl.push(<span class="tree-marker right"></span>)
        } 
        else {
            treeMarkeEl.push(<span class="tree-marker vert-right"></span>)
            treeMarkeEl.push(<span class="tree-marker right"></span>)
        }

        if ( segment.hasChildren ) {
            treeMarkeEl.push(<span class="tree-marker horiz-down"></span>)
        } 
        else {
            treeMarkeEl.push(<span class="tree-marker right"></span>)
        }


        return (
            <div className="crc-node" title={segment.node.request.url}>
                <div className="crc-node__tree-marker">
                    {treeMarkeEl}
                </div>
                {CRCRenderer.nodeValue(segment)}
            </div>
        )
    }

    static createSegment(
        parent,
        id,
        startTime,
        transferSize,
        treeMarkers,
        parentIsLastChild
    ) {
        const node = parent[id];
        const siblings = Object.keys(parent);
        const isLastChild = siblings.indexOf(id) === siblings.length - 1;
        const hasChildren =
            !!node.children && Object.keys(node.children).length > 0;

        // Copy the tree markers so that we don't change by reference.
        const newTreeMarkers = Array.isArray(treeMarkers)
            ? treeMarkers.slice(0)
            : [];

        // Add on the new entry.
        if (typeof parentIsLastChild !== 'undefined') {
            newTreeMarkers.push(!parentIsLastChild);
        }

        return {
            node,
            isLastChild,
            hasChildren,
            startTime,
            transferSize: transferSize + node.request.transferSize,
            treeMarkers: newTreeMarkers,
        };
    }
    
    static buildTree( segment, details ) {
        let arr = []
        arr.push(
            CRCRenderer.createChainNode(segment)
        );
        if ( segment.node.children ) {
            for (const key of Object.keys(segment.node.children)) {
                const childSegment = CRCRenderer.createSegment(
                    segment.node.children,
                    key,
                    segment.startTime,
                    segment.transferSize,
                    segment.treeMarkers,
                    segment.isLastChild
                );
                let new_array = CRCRenderer.buildTree(
                    childSegment,
                    details
                );
                for (let element in new_array) {
                    arr.push(new_array[element]);
                }
            }
        }
        return arr;
    }
    static render( details ) {
        let result = []
        const root = CRCRenderer.initTree(details.chains);
        for (const key of Object.keys(root.tree)) {
            const segment = CRCRenderer.createSegment(
                root.tree,
                key,
                root.startTime,
                root.transferSize
            );
            let r = CRCRenderer.buildTree(
                segment,
                details
            );
            for (let element in r) {
                result.push(r[element])
            }
        }

        return (
            <div className="lh-crc-container lh-details">
                
                <div class="lh-crc__summary-value">
                    <span class="lh-crc__longest_duration_label">Maximum critical path latency:</span> <b class="lh-crc__longest_duration">{Util.i18n.formatMilliseconds(details.longestChain.duration)}</b>
                </div>
                <div className="lh-crc">
                    <div className="crc-intial-nav">Initial Navigation</div>
                    {result}
                </div>
            </div>


        )
    }
}
const CRCRenderer = CriticalRequestChainRenderer;

export default CriticalRequestChainRenderer; 