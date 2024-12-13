let connectionIdCount = 10000
function createConnections(item) {
    
    const createMxCell = (item) => {
        const idFrom = item.from
        const idTo = item.to
        connectionIdCount++;
        let style = 'style="edgeStyle=orthogonalEdgeStyle;shape=connector;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;strokeColor=#6c8ebf;align=center;verticalAlign=middle;fontFamily=Helvetica;fontSize=11;fontColor=default;labelBackgroundColor=none;endArrow=none;endFill=0;fillColor=#dae8fc;"'
        return `
        <mxCell id="${connectionIdCount}" ${style} edge="1" source="${idFrom}" target="${idTo}" parent="1">
            <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
    };

    return createMxCell(item)
}


function createConnectionsOld(items) {
    
    const createMxCell = (item) => {
        const idFrom = item.from.id
        const idTo = item.to.id
        connectionIdCount++;
        return `
        <mxCell id="${connectionIdCount}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;curved=1;endArrow=none;endFill=0;fillColor=#dae8fc;strokeColor=#2C85DE;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" edge="1" source="${idFrom}" target="${idTo}" parent="1">
            <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
    };
    
    let result = "";
    items.forEach((item) => {
        result += createMxCell(item);
    });
    return result
}