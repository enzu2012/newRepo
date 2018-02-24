var sample_graph = [
    {
        id : 'graph0',
        nodes: [[1, 'node 1'], [2, 'node 2'], [3, 'node 3'], [4, 'node 4'], [5, 'node 5']],
        edges: [[1, 3], [1, 2], [2, 4], [2, 5], [3, 2]]
    }
];

function draw_graph(eid, nodes_data, edges_data) {
    var container = document.getElementById(eid);
    var nodes = new vis.DataSet(nodes_data);
    var edges = new vis.DataSet(edges_data);
    var options = {};
    var network = new vis.Network(container, {
        nodes: nodes, edges: edges
    }, options);
}

function draw(graphs) {
    for (var i = 0; i < graphs.length; i++) {
        var eid = graphs[i].id;
        var ns = [];
        for (var k = 0; k < graphs[i].nodes.length; k++) {
            var node = graphs[i].nodes[k];
            ns.push({id: node[0], label: node[1], font: {size: 18}});
        }
        var es = [];
        for (var k = 0; k < graphs[i].edges.length; k++) {
            var edge = graphs[i].edges[k];
            es.push({from: edge[0], to: edge[1], arrows: "to", label: edge[2], length: 20});
        }
        draw_graph(eid, ns, es);
    }
}
