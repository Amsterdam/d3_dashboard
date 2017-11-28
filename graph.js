Graph = function(data_to_plot, varObj, width, height, left, top, parentSelector){
    var self = this;
    this.varObj = varObj;
    this.variabele = varObj.variabele;
    this.label = varObj.label;
    this.width = width;
    this.height = height;
    this.currentYear = data.getHuidigJaar(this.variabele);
    this.data = data_to_plot;
    
    this.parent = d3.select(parentSelector);
    var svg = this.parent.append("g").attr("transform", "translate(" +left + "," + top + ")");
    
    if(varObj.type == "bar"){
        this.plotBar(svg, varObj);     
    }else if(varObj.type == "line"){
        this.plotLine(svg, varObj)
    }
    
    /*
    if(width < 200){
        //var box = this.parent.append("div").attr("class","box small");
        //var header = box.append("div").attr("class","header");
        var svg = this.parent.append("svg");
        //header.html(variabele.titel);
        this.loadData(svg, "small");
    } else if(width < 640){
        //var box = this.parent.append("div").attr("class","box medium");
        //var header = box.append("div").attr("class","header");
        //var current = box.append("div").attr("class","current");
        //header.html(variabele.titel);
        this.loadLineData(svg, "medium"); //, current);
    } else {
        var box = this.parent.append("div").attr("class","box");
        var header = box.append("div").attr("class","header");
        var svg = box.append("svg");
        var footer = box.append("div").attr("id","footer" + this.variabele).attr("class","footer");
        var footer = d3.select("#meta")
        this.loadMeta(header,footer, false);
        this.loadData(svg, "large");
    }
    */
    
}

Graph.prototype.plotLine = function(svg, options){
    var self = this;
    var margin = {top: 0.3 * self.width, right: 0.15 * self.height, bottom: 0.2 * self.height, left: 0.15 * self.width},
        width = self.width - margin.left - margin.right,
        height = self.height - margin.top - margin.bottom;
               
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return x(d.datum); })
        .y(function(d) { return y(d.waarde); });
        
    // Adds the svg canvas
    svg.append("circle")
        .attr("class", "variabele " + self.variabele)
        .attr("cx", self.width / 2)
        .attr("cy", self.height /2)
        .attr("r",self.width/2)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1)
        .attr("fill", "#fff");
    
    svg.append("text")
        .attr("dy",0)
        .attr("dx",0)
        .attr("transform","translate(" + self.width/2 +","+ 1.25 * self.height+")")
        .attr("text-anchor","middle")
        .attr("class", "cirkellabel "+ self.variabele)
        .text(self.label)
        .call(wrap, 1.2 * self.width);
    
    svg.on('click', function(d){ dashboard.nextSlide(self.variabele);});

    var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
    var data = this.data;
      
    var points = [];
    var parseDate = d3.time.format("%d-%m-%Y").parse;

    for(var i in data.results){
        points.push({"jaar" : data.results[i].jaar, "waarde": data.results[i].waarde, "datum": parseDate("01-01-"+data.results[i].jaar)});
    }
            
    // Scale the range of the data
    x.domain(d3.extent(points, function(d) { return d.datum; }));
    y.domain([0, d3.max(points, function(d) { return d.waarde; })]);    

    // Add the valueline path.
    g.append("path")
        .attr("class", "line")
        .attr("d", valueline(points));
}

Graph.prototype.plotBar = function(svg, options){
    
    var self = this;
    var margin = {top: 20, right: 0.2 * self.width, bottom: 0, left: 0},
        width = self.width - margin.left - margin.right,
        height = self.height - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0,width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([40, 0])
      .html(function(d) {
        return d.jaar + ":<br>" + d.waarde;
      })
          
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class","bargraph")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    var data = this.data
      
    values = [];
    xArr = [];
    yArr = [];
    var points = [];
    var parseDate = d3.time.format("%d-%m-%Y").parse;

    for(var i in data.results){
      values.push(data.results[i]);
      xArr.push(data.results[i].jaar);
      yArr.push(data.results[i].waarde);
      points.push({"jaar" : data.results[i].jaar, "waarde": data.results[i].waarde, "datum": parseDate("01-01-"+data.results[i].jaar)});
    }
    var xMin = Math.min.apply(Math, xArr);
    var xMax = Math.max.apply(Math, xArr);
    var xAantal = (xMax - xMin) + 1;
    x.domain([xMin, xMax]);
    y.domain([0, 1.05 * Math.max.apply(Math, yArr)]);

    if(true){
      barwidth = (width / Math.min(4,Math.max(12,xAantal))) * 0.2;
      x.range([0 + barwidth ,width - barwidth]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(d3.format(""))
          .ticks(xAantal,"");

      var yAxis = d3.svg.axis()
          .scale(y)
          .tickSize(width)
          .orient("right")
          .ticks(10,"");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
    } else {
      barwidth = (width / Math.max(4,Math.min(12,xAantal))) * 0.78;
      x.range([0 + barwidth ,width - barwidth]);
    }

    svg.append("text")
        .attr("class", "subtitle")
        .attr("x", 0)
        .attr("y", -20)
        .text(options.label);

    svg.append("text")
        .attr("class", "currentvalue")
        .attr("x", width - (0.5 * barwidth))
        .attr("y", -20)
        .attr("text-anchor","end")
        .text(correct_number(yArr[yArr.length-1],options.variabele));

    svg.append("text")
        .attr("class", "year")
        .attr("x", width - (0.5 * barwidth))
        .attr("y", -8)
        .attr("text-anchor","end")
        .text(xArr[xArr.length-1]);
    
    
    svg.selectAll(".bar")
    .data(values)
    .enter().append("rect")
      .attr("class", function(d){return "jaar jaar"+ d.jaar})
      .attr("x", function(d) { 
            return x(d.jaar) - (0.5 * barwidth); 
      })
      .attr("width", barwidth)
      //.attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.waarde); })
      .attr("height", function(d) { return height - y(d.waarde); })
      .style("cursor","pointer")
      .on('click', function(d){ 
            dashboard.showJaar(self.variabele, d.jaar, this);
            }
      )
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
}