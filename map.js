Map = function(width, height,parentSelector){
    var self = this;
    this.width = width,
    this.height = height,
    this.centered;
    this.gebieden = {};

// Define color scale   
    this.color = d3.scale.linear()
    .domain([1, 20])
    .clamp(true)
    .range(['#fff', '#409A99']);

    this.projection = d3.geo.mercator()
    .scale(this.width / 0.016)
    // Center the Map
    .center([4.89414219, 52.36])
    .translate([width / 2, height / 2]);

    this.path = d3.geo.path()
    .projection(this.projection);

// Set svg width & height
    this.svg = d3.select(parentSelector);

// Add background
    this.svg.append('rect')
        .attr('class', 'background')
        .attr('width', self.width)
        .attr('height', self.height)
        .on('click', function(d){ self.clicked(self,d);})

    this.g = this.svg.append('g');
    this.mapLayer = this.g.append('g')
        .classed('map-layer', true);

    // Load map data
    d3.json('buurtcombinaties.geojson', function(error, mapData) {
      var features = mapData.features;
      // Draw each province as a path
      self.mapLayer.selectAll('path')
          .data(features)
        .enter().append('path')
          .attr('d', self.path)
          .attr("id", function(d) { return "path-" + d.properties.vollcode; })
          .attr("class", "mappath")
          .attr('vector-effect', 'non-scaling-stroke')
          .style('fill', '#F0F0F0')
          .style("cursor","pointer")
          .on('click', function(d){ self.clicked(self, d);});
      
      for(var i in features){
          self.gebieden[features[i].properties.vollcode] = features[i].properties;
      }
    });
}

// When clicked, zoom in
Map.prototype.clicked = function(self, d) {
  var x, y, k;

  // Compute centroid of the selected path
  if (d && self.centered !== d) {
    var centroid = this.path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    self.centered = d;
    dashboard.showGebied(d.properties);
  } else {
    x = this.width / 2;
    y = this.height / 2;
    k = 1;
    self.centered = null;
    dashboard.clearGebied();
  }

  // Highlight the clicked province
  //self.mapLayer.selectAll('path')
    //.style('stroke', function(d){return self.centered && d===self.centered ? 'white' : 'grey';});

  // Zoom
  /*
  self.g.transition()
    .duration(750)
    .attr('transform', 'translate(' + self.width / 2 + ',' + self.height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
  */
}

Map.prototype.showData = function(points){      
      var avg = d3.mean(points, function(d){ return d.waarde});
      var stdev = d3.deviation(points, function(d){ return d.waarde});
      
      var color = d3.scale.linear()
        .domain([avg - (1.5 * stdev), avg + (1.5 * stdev)])
        .clamp(true)
        .range(['#A0D1F3', '#014699']);
        //.range(['#F0F0F0', '#878787']);

      for(i in points){
          d3.select("#path-"+ points[i].vollcode).transition().duration(750)
          .style("fill", function(d){ return color(points[i].waarde)});
      }
}

Map.prototype.unZoom = function(){      
    this.g.transition()
    .duration(750).attr('transform', 'scale(1)translate(0,0)');      
}

Map.prototype.clearMap = function(){
    var self = this;
    self.mapLayer.selectAll('path').transition().duration(750)
        .style('fill','white'); 
}

Map.prototype.getGebiedByCode = function(code){
    for(var i in this.gebieden){
        if(this.gebieden[i].vollcode == code){
            return this.gebieden[i];
        }
    }
}