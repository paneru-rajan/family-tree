function init (jsonData) {
  var $ = go.GraphObject.make;
  myDiagram =
    $(go.Diagram, 'myDiagramDiv',
      {
        initialAutoScale: go.Diagram.Uniform,
        // when a node is selected, draw a big yellow circle behind it
        nodeSelectionAdornmentTemplate:
          $(go.Adornment, 'Auto',
            { layerName: 'Grid' },  // the predefined layer that is behind everything else
            $(go.Shape, 'Circle', { fill: 'yellow', stroke: null }),
            $(go.Placeholder)
          ),
        layout:  // use a custom layout, defined below
          $(GenogramLayout, { direction: 90, layerSpacing: 30, columnSpacing: 10 })
      });

  // determine the color for each attribute shape
  function attrFill (a) {
    switch (a) {
      case 'A':
        return 'green';
      case 'B':
        return 'orange';
      case 'C':
        return 'red';
      case 'D':
        return 'cyan';
      case 'E':
        return 'gold';
      case 'F':
        return 'pink';
      case 'G':
        return 'blue';
      case 'H':
        return 'brown';
      case 'I':
        return 'purple';
      case 'J':
        return 'chartreuse';
      case 'K':
        return 'lightgray';
      case 'L':
        return 'magenta';
      case 'S':
        return 'red';
      default:
        return 'transparent';
    }
  }

  // determine the geometry for each attribute shape in a male;
  // except for the slash these are all squares at each of the four corners of the overall square
  var tlsq = go.Geometry.parse('F M1 1 l19 0 0 19 -19 0z');
  var trsq = go.Geometry.parse('F M20 1 l19 0 0 19 -19 0z');
  var brsq = go.Geometry.parse('F M20 20 l19 0 0 19 -19 0z');
  var blsq = go.Geometry.parse('F M1 20 l19 0 0 19 -19 0z');
  var slash = go.Geometry.parse('F M38 0 L40 0 40 2 2 40 0 40 0 38z');

  function maleGeometry (a) {
    switch (a) {
      case 'A':
        return tlsq;
      case 'B':
        return tlsq;
      case 'C':
        return tlsq;
      case 'D':
        return trsq;
      case 'E':
        return trsq;
      case 'F':
        return trsq;
      case 'G':
        return brsq;
      case 'H':
        return brsq;
      case 'I':
        return brsq;
      case 'J':
        return blsq;
      case 'K':
        return blsq;
      case 'L':
        return blsq;
      case 'S':
        return slash;
      default:
        return tlsq;
    }
  }

  // determine the geometry for each attribute shape in a female;
  // except for the slash these are all pie shapes at each of the four quadrants of the overall circle
  var tlarc = go.Geometry.parse('F M20 20 B 180 90 20 20 19 19 z');
  var trarc = go.Geometry.parse('F M20 20 B 270 90 20 20 19 19 z');
  var brarc = go.Geometry.parse('F M20 20 B 0 90 20 20 19 19 z');
  var blarc = go.Geometry.parse('F M20 20 B 90 90 20 20 19 19 z');

  function femaleGeometry (a) {
    switch (a) {
      case 'A':
        return tlarc;
      case 'B':
        return tlarc;
      case 'C':
        return tlarc;
      case 'D':
        return trarc;
      case 'E':
        return trarc;
      case 'F':
        return trarc;
      case 'G':
        return brarc;
      case 'H':
        return brarc;
      case 'I':
        return brarc;
      case 'J':
        return blarc;
      case 'K':
        return blarc;
      case 'L':
        return blarc;
      case 'S':
        return slash;
      default:
        return tlarc;
    }
  }

  // two different node templates, one for each sex,
  // named by the category value in the node data object
  myDiagram.nodeTemplateMap.add('M',  // male
    $(go.Node, 'Vertical',
      { locationSpot: go.Spot.Center, locationObjectName: 'ICON' },
      $(go.Panel,
        { name: 'ICON' },
        $(go.Shape, 'Square',
          { width: 40, height: 40, strokeWidth: 2, fill: 'white', portId: '' }),
        $(go.Panel,
          { // for each attribute show a Shape at a particular place in the overall square
            itemTemplate:
              $(go.Panel,
                $(go.Shape,
                  { stroke: null, strokeWidth: 0 },
                  new go.Binding('fill', '', attrFill),
                  new go.Binding('geometry', '', maleGeometry))
              ),
            margin: 1
          },
          new go.Binding('itemArray', 'a')
        )
      ),
      $(go.TextBlock,
        { textAlign: 'center', maxSize: new go.Size(80, NaN) },
        new go.Binding('text', 'n'))
    ));

  myDiagram.nodeTemplateMap.add('F',  // female
    $(go.Node, 'Vertical',
      { locationSpot: go.Spot.Center, locationObjectName: 'ICON' },
      $(go.Panel,
        { name: 'ICON' },
        $(go.Shape, 'Circle',
          { width: 40, height: 40, strokeWidth: 2, fill: 'white', portId: '' }),
        $(go.Panel,
          { // for each attribute show a Shape at a particular place in the overall circle
            itemTemplate:
              $(go.Panel,
                $(go.Shape,
                  { stroke: null, strokeWidth: 0 },
                  new go.Binding('fill', '', attrFill),
                  new go.Binding('geometry', '', femaleGeometry))
              ),
            margin: 1
          },
          new go.Binding('itemArray', 'a')
        )
      ),
      $(go.TextBlock,
        { textAlign: 'center', maxSize: new go.Size(80, NaN) },
        new go.Binding('text', 'n'))
    ));

  // the representation of each label node -- nothing shows on a Marriage Link
  myDiagram.nodeTemplateMap.add('LinkLabel',
    $(go.Node, { selectable: false, width: 1, height: 1, fromEndSegmentLength: 20 }));

  myDiagram.linkTemplate =  // for parent-child relationships
    $(TwinLink,  // custom routing for same birth siblings
      {
        routing: go.Link.Orthogonal, curviness: 10,
        layerName: 'Background', selectable: false,
        fromSpot: go.Spot.Bottom, toSpot: go.Spot.Top
      },
      $(go.Shape, { strokeWidth: 2 })
    );

  myDiagram.linkTemplateMap.add('Marriage',  // for marriage relationships
    $(go.Link, { selectable: false, isTreeLink: false },
      $(go.Shape, { strokeWidth: 2, stroke: 'darkgreen' })
    ));

  myDiagram.linkTemplateMap.add('TwinLink',  // for connecting twins/triplets
    $(go.Link,
      { selectable: false, isTreeLink: false, isLayoutPositioned: false },
      { fromSpot: go.Spot.Top, fromEndSegmentLength: 0, toSpot: go.Spot.Top, toEndSegmentLength: 0 },
      $(go.Shape, { strokeWidth: 2, stroke: 'blue' })
    ));

  setupDiagram(myDiagram, jsonData, 4 /* focus on this person */);
  return myDiagram.makeImageData();
}

// create and initialize the Diagram.model given an array of node data representing people
function setupDiagram (diagram, array, focusId) {
  diagram.model =
    go.GraphObject.make(go.GraphLinksModel,
      { // declare support for link label nodes
        linkLabelKeysProperty: 'labelKeys',
        // this property determines which template is used
        nodeCategoryProperty: 's',
        // create all of the nodes for people
        nodeDataArray: array
      });
  setupMarriages(diagram);
  setupParents(diagram);
  setupIdenticalTwins(diagram);

  var node = diagram.findNodeForKey(focusId);
  if (node !== null) {
    diagram.select(node);
    node.linksConnected.each(function (l) {
      if (!l.isLabeledLink) return;
      l.opacity = 0;
      var spouse = l.getOtherNode(node);
      spouse.opacity = 0;
      spouse.pickable = false;
    });
  }
}

function findMarriage (diagram, a, b) {  // A and B are node keys
  var nodeA = diagram.findNodeForKey(a);
  var nodeB = diagram.findNodeForKey(b);
  if (nodeA !== null && nodeB !== null) {
    var it = nodeA.findLinksBetween(nodeB);  // in either direction
    while (it.next()) {
      var link = it.value;
      if (link.data !== null && link.category === 'Marriage') return link;
    }
  }
  return null;
}

function findParentsMarriage (diagram, a) {  // A is a node key
  var node = diagram.findNodeForKey(a);
  if (node !== null) {
    var it = node.findLinksInto();
    while (it.next()) {
      var link = it.value;
      if (link.category !== '') continue;
      var labelnode = link.fromNode;  // the label node for the marriage relationship
      return labelnode.labeledLink;  // return the Marriage link
    }
  }
  return null;
}

// now process the node data to determine marriages
function setupMarriages (diagram) {
  var model = diagram.model;
  var nodeDataArray = model.nodeDataArray;
  for (var i = 0; i < nodeDataArray.length; i++) {
    var data = nodeDataArray[i];
    var key = data.key;
    var uxs = data.ux;
    if (uxs !== undefined) {
      if (typeof uxs === 'number') uxs = [uxs];
      for (var j = 0; j < uxs.length; j++) {
        var wife = uxs[j];
        if (key === wife) {
          // or warn no reflexive marriages
          continue;
        }
        var link = findMarriage(diagram, key, wife);
        if (link === null) {
          // add a label node for the marriage link
          var mlab = { s: 'LinkLabel' };
          model.addNodeData(mlab);
          // add the marriage link itself, also referring to the label node
          var mdata = { from: key, to: wife, labelKeys: [mlab.key], category: 'Marriage' };
          model.addLinkData(mdata);
        }
      }
    }
    var virs = data.vir;
    if (virs !== undefined) {
      if (typeof virs === 'number') virs = [virs];
      for (var j = 0; j < virs.length; j++) {
        var husband = virs[j];
        if (key === husband) {
          // or warn no reflexive marriages
          continue;
        }
        var link = findMarriage(diagram, key, husband);
        if (link === null) {
          // add a label node for the marriage link
          var mlab = { s: 'LinkLabel' };
          model.addNodeData(mlab);
          // add the marriage link itself, also referring to the label node
          var mdata = { from: key, to: husband, labelKeys: [mlab.key], category: 'Marriage' };
          model.addLinkData(mdata);
        }
      }
    }
  }
}

// process parent-child relationships once all marriages are known
function setupParents (diagram) {
  var model = diagram.model;
  var nodeDataArray = model.nodeDataArray;
  for (var i = 0; i < nodeDataArray.length; i++) {
    var data = nodeDataArray[i];
    var key = data.key;
    var mother = data.m;
    var father = data.f;
    if (mother !== undefined && father !== undefined) {
      var link = findMarriage(diagram, mother, father);
      if (link === null) {
        // or warn no known mother or no known father or no known marriage between them
        if (window.console) window.console.log('unknown marriage: ' + mother + ' & ' + father);
        continue;
      }
      var mdata = link.data;
      var mlabkey = mdata.labelKeys[0];
      var cdata = { from: mlabkey, to: key };
      myDiagram.model.addLinkData(cdata);
    }
  }
}

function setupIdenticalTwins (diagram) {
  var model = diagram.model;
  var nodeDataArray = model.nodeDataArray;
  for (var i = 0; i < nodeDataArray.length; i++) {
    var data = nodeDataArray[i];
    if (typeof data.identical === 'number') {
      var key = data.key;
      var ikey = data.identical;
      var idata = model.findNodeDataForKey(ikey);
      if (idata !== null && data.m === idata.m && data.f === idata.f) {
        var node = diagram.findNodeForData(data);
        var inode = diagram.findNodeForData(idata);
        if (node !== null && inode !== null) {
          var tlinktempl = diagram.linkTemplateMap.get('TwinLink');
          var tlink = tlinktempl.copy();
          tlink.fromNode = node;
          tlink.toNode = inode;
          diagram.add(tlink);
        }
      }
    }
  }
}

function addParents (diagram) {
  var person = diagram.selection.first();
  if (person === null) return;  // no one is selected
  if (findParentsMarriage(diagram, person.data.key) !== null) {  // already has parents
    alert(person.data.n + ' already has parents');
    return;
  }
  diagram.startTransaction('add parents');
  var model = myDiagram.model;
  // add a mother
  var mom = { n: 'New Mother', s: 'F', a: ['A'] };
  model.addNodeData(mom);
  // add a father
  var dad = { n: 'New Father', s: 'M', a: ['B'] };
  model.addNodeData(dad);
  // add a label node for the marriage link
  var mlab = { s: 'LinkLabel' };
  model.addNodeData(mlab);
  // add the marriage link itself, referring to the parents' keys, and also referring to the label node
  var mdata = { from: mom.key, to: dad.key, labelKeys: [mlab.key], category: 'Marriage' };
  model.addLinkData(mdata);
  // add child link
  var cdata = { from: mlab.key, to: person.data.key };
  model.addLinkData(cdata);
  diagram.commitTransaction('add parents');
}

// A custom layout that shows the two families related to a person's parents
function GenogramLayout () {
  go.LayeredDigraphLayout.call(this);
  this.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn;
}

go.Diagram.inherit(GenogramLayout, go.LayeredDigraphLayout);

GenogramLayout.prototype.makeNetwork = function (coll) {
  // generate LayoutEdges for each parent-child Link
  var net = this.createNetwork();
  if (coll instanceof go.Diagram) {
    this.add(net, coll.nodes, true);
    this.add(net, coll.links, true);
  } else if (coll instanceof go.Group) {
    this.add(net, coll.memberParts, false);
  } else if (coll.iterator) {
    this.add(net, coll.iterator, false);
  }
  return net;
};

// internal method for creating LayeredDigraphNetwork where husband/wife pairs are represented
// by a single LayeredDigraphVertex corresponding to the label Node on the marriage Link
GenogramLayout.prototype.add = function (net, coll, nonmemberonly) {
  // consider all Nodes in the given collection
  var it = coll.iterator;
  while (it.next()) {
    var node = it.value;
    if (!(node instanceof go.Node)) continue;
    if (!node.isLayoutPositioned || !node.isVisible()) continue;
    if (nonmemberonly && node.containingGroup !== null) continue;
    // if it's an unmarried Node, or if it's a Link Label Node, create a LayoutVertex for it
    if (node.isLinkLabel) {
      // get marriage Link
      var link = node.labeledLink;
      var spouseA = link.fromNode;
      var spouseB = link.toNode;
      // create vertex representing both husband and wife
      var vertex = net.addNode(node);
      // now define the vertex size to be big enough to hold both spouses
      vertex.width = spouseA.actualBounds.width + 30 + spouseB.actualBounds.width;
      vertex.height = Math.max(spouseA.actualBounds.height, spouseB.actualBounds.height);
      vertex.focus = new go.Point(spouseA.actualBounds.width + 30 / 2, vertex.height / 2);
    } else {
      // don't add a vertex for any married person!
      // instead, code above adds label node for marriage link
      // assume a marriage Link has a label Node
      if (!node.linksConnected.any(function (l) { return l.isLabeledLink; })) {
        var vertex = net.addNode(node);
      }
    }
  }
  // now do all Links
  it.reset();
  while (it.next()) {
    var link = it.value;
    if (!(link instanceof go.Link)) continue;
    if (!link.isLayoutPositioned || !link.isVisible()) continue;
    if (nonmemberonly && link.containingGroup !== null) continue;
    // if it's a parent-child link, add a LayoutEdge for it
    if (!link.isLabeledLink) {
      var parent = net.findVertex(link.fromNode);  // should be a label node
      var child = net.findVertex(link.toNode);
      if (child !== null) {  // an unmarried child
        net.linkVertexes(parent, child, link);
      } else {  // a married child
        link.toNode.linksConnected.each(function (l) {
          if (!l.isLabeledLink) return;  // if it has no label node, it's a parent-child link
          // found the Marriage Link, now get its label Node
          var mlab = l.labelNodes.first();
          // parent-child link should connect with the label node,
          // so the LayoutEdge should connect with the LayoutVertex representing the label node
          var mlabvert = net.findVertex(mlab);
          if (mlabvert !== null) {
            net.linkVertexes(parent, mlabvert, link);
          }
        });
      }
    }
  }
};

GenogramLayout.prototype.assignLayers = function () {
  go.LayeredDigraphLayout.prototype.assignLayers.call(this);
  var horiz = this.direction == 0.0 || this.direction == 180.0;
  // for every vertex, record the maximum vertex width or height for the vertex's layer
  var maxsizes = [];
  this.network.vertexes.each(function (v) {
    var lay = v.layer;
    var max = maxsizes[lay];
    if (max === undefined) max = 0;
    var sz = (horiz ? v.width : v.height);
    if (sz > max) maxsizes[lay] = sz;
  });
  // now make sure every vertex has the maximum width or height according to which layer it is in,
  // and aligned on the left (if horizontal) or the top (if vertical)
  this.network.vertexes.each(function (v) {
    var lay = v.layer;
    var max = maxsizes[lay];
    if (horiz) {
      v.focus = new go.Point(0, v.height / 2);
      v.width = max;
    } else {
      v.focus = new go.Point(v.width / 2, 0);
      v.height = max;
    }
  });
  // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
  // (other than the ones that are the widest or tallest in their respective layer).
};

GenogramLayout.prototype.commitNodes = function () {
  go.LayeredDigraphLayout.prototype.commitNodes.call(this);
  // position regular nodes
  this.network.vertexes.each(function (v) {
    if (v.node !== null && !v.node.isLinkLabel) {
      v.node.position = new go.Point(v.x, v.y);
    }
  });
  // position the spouses of each marriage vertex
  var layout = this;
  this.network.vertexes.each(function (v) {
    if (v.node === null) return;
    if (!v.node.isLinkLabel) return;
    var labnode = v.node;
    var lablink = labnode.labeledLink;
    // In case the spouses are not actually moved, we need to have the marriage link
    // position the label node, because LayoutVertex.commit() was called above on these vertexes.
    // Alternatively we could override LayoutVetex.commit to be a no-op for label node vertexes.
    lablink.invalidateRoute();
    var spouseA = lablink.fromNode;
    var spouseB = lablink.toNode;
    // prefer fathers on the left, mothers on the right
    if (spouseA.data.s === 'F') {  // sex is female
      var temp = spouseA;
      spouseA = spouseB;
      spouseB = temp;
    }
    // see if the parents are on the desired sides, to avoid a link crossing
    var aParentsNode = layout.findParentsMarriageLabelNode(spouseA);
    var bParentsNode = layout.findParentsMarriageLabelNode(spouseB);
    if (aParentsNode !== null && bParentsNode !== null && aParentsNode.position.x > bParentsNode.position.x) {
      // swap the spouses
      var temp = spouseA;
      spouseA = spouseB;
      spouseB = temp;
    }
    spouseA.position = new go.Point(v.x, v.y);
    spouseB.position = new go.Point(v.x + spouseA.actualBounds.width + 30, v.y);
    if (spouseA.opacity === 0) {
      var pos = new go.Point(v.centerX - spouseA.actualBounds.width / 2, v.y);
      spouseA.position = pos;
      spouseB.position = pos;
    } else if (spouseB.opacity === 0) {
      var pos = new go.Point(v.centerX - spouseB.actualBounds.width / 2, v.y);
      spouseA.position = pos;
      spouseB.position = pos;
    }
  });
};

GenogramLayout.prototype.findParentsMarriageLabelNode = function (node) {
  var it = node.findNodesInto();
  while (it.next()) {
    var n = it.value;
    if (n.isLinkLabel) return n;
  }
  return null;
};

// end GenogramLayout class

// custom routing for same birth siblings
function TwinLink () {
  go.Link.call(this);
}

go.Diagram.inherit(TwinLink, go.Link);

TwinLink.prototype.computePoints = function () {
  var result = go.Link.prototype.computePoints.call(this);
  var pts = this.points;
  if (pts.length >= 4) {
    var birthId = this.toNode.data['birth'];
    if (birthId) {
      var parents = this.fromNode;
      var sameBirth = 0;
      var sumX = 0;
      var it = parents.findNodesOutOf();
      while (it.next()) {
        var child = it.value;
        if (child.data['birth'] === birthId) {
          sameBirth++;
          sumX += child.location.x;
        }
      }
      if (sameBirth > 0) {
        var midX = sumX / sameBirth;
        var oldp = pts.elt(pts.length - 3);
        pts.setElt(pts.length - 3, new go.Point(midX, oldp.y));
        pts.setElt(pts.length - 2, pts.elt(pts.length - 1));
      }
    }
  }
  return result;
};
// end TwinLink class
