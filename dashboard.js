Dashboard = function(width, height,parentSelector){
    var self = this;
    
    this.width = width,
    this.height = height,
    this.variabele = null;
    this.thema = 0;
    this.slide = 0;
    this.play = false;
    
    this.scale = Math.min((this.width / 1920),(this.height / 900));

    this.parent = d3.select(parentSelector);
    this.doc = this.parent.append("svg")
        .attr('width', 1920 * this.scale)
        .attr('height', 930 * this.scale);
    
    this.svg = this.doc.append("g")
        .attr("id","mapsvg")
        .attr('width', 1920)
        .attr('height', 1080)
        .attr("transform", "scale("+ this.scale +")")
        .attr("x",0)
        .attr("y",0);

    this.map = new Map(1920, 930,"#mapsvg");
    
    //this.svg.append("rect").attr("x",0).attr("y",0).attr("width",1920).attr("height",1000).attr("fill","none").attr("stroke","black");
    
    
    //this.leftwidth = this.scale * 800;
    
    this.left = d3.select("#mapsvg").append("g").attr("id","leftpane")
      .attr("transform", "translate(-1200,0)");

    this.right = d3.select("#mapsvg").append("g").attr("id","rightpane")
      .attr("transform", "translate("+ (1920 - 450) +",0)");
      
    this.footer = d3.select("#mapsvg").append("g").attr("id","footer")
      .attr("transform", "translate(0,800)");
    
    this.progress = d3.select("#mapsvg").append("rect").attr("id","progressbar").attr("x",0).attr("y",925);
}

Dashboard.prototype.start = function(){
    var self = this;
    this.play = true;
    this.progress.attr("width",1920).attr("height",5).style("fill","#DD0000").transition()
        .duration(30000)
        .ease("linear")
        .attr("width", "0")
        .each("end", function(){
            self.next();
        });
}

Dashboard.prototype.stop = function(){
    this.play = false;
    this.progress.attr("height",0).attr("width",1920).transition();
}

Dashboard.prototype.next = function(){
    if(this.play){
        this.slide++;
        if(this.slide  < data.themas[this.thema].variabelen.length){
            this.nextSlide(data.themas[this.thema].variabelen[this.slide].variabele);
        } else {
            this.thema++;
            if(this.thema < data.themas.length){
                this.showThema(this.thema);
            } else {
                this.showThema(0);
            }
        }
        this.start();
    }
}


Dashboard.prototype.showThemas = function(){
    var list = $("#themalist");
    
    for(i in data.themas){  
        list.append('<li class="thema'+ i +'"><a onClick="showThema('+ i +')"><i class="fa '+ data.themas[i].icon +'"></i><span>'+ data.themas[i].thema + '</span></a></li>');
    }
}
    
Dashboard.prototype.showThema = function(num){
    var self = this;
    this.thema = num;
    
    this.variabele = data.themas[num].variabelen[0].variabele;
    $("ul.themas li").removeClass("active");
    $("ul.themas li.thema" + num).addClass("active");
    
    this.clearBoard(function(){
        self.showThumbnails(data.themas[num].variabelen);
        self.showSlide(data.themas[num].variabelen[0].variabele);
    });
}
    
Dashboard.prototype.showThumbnails = function(arr){
    var self = this;
    var width = 80;
    var margin = {left: 20, right: 40};
    
    var footerwidth = (arr.length + 1) * (margin.right + width);

    this.footer
        .append("path")
        .attr("class","footerkader")
        .attr("d","M0 740 L" + footerwidth + " 740 L" + (footerwidth - width) + " 900 L0 900 Z");

    this.footer
        .append("path")
        .attr("class","themakader")
        .attr("d","M0 900 L400 900 L380 930 L0 930 Z");
    this.footer
        .append("text")
        .text("Thema: "+ data.themas[self.thema].thema)
        .attr("x",20)
        .attr("y",922)
        .attr("class","thema")
        .style("cursor","pointer")
        .on("click", function(){ toggleThemas()});

    arr.forEach(function(element, index){
        data.getCijfersStad(element.variabele, function(data){
            new Graph(data, {variabele: element.variabele, type: "line", label: element.label}, width, width, margin.left + (index * (margin.right + width)),760, "#footer");        
            self.updateSelectedThumbnail();
        })        
    })
}

Dashboard.prototype.updateSelectedThumbnail = function(){
    d3.selectAll("circle.variabele").style("fill","white");
    d3.selectAll("circle.variabele").style("stroke","#bbb");
    d3.selectAll("circle.variabele").style("stroke-width","1");
    d3.selectAll("text.cirkellabel").style("font-weight","normal");

    d3.selectAll("circle." + this.variabele).style("fill","#D1E3FF");
    d3.selectAll("circle." + this.variabele).style("stroke","black");
    d3.selectAll("circle." + this.variabele).style("stroke-width","2");
    d3.selectAll("text." + this.variabele).style("font-weight","bold");
}


Dashboard.prototype.clearBoard = function(func){
    var self = this;

    self.clearSlide();
    self.footer.transition()
        .duration(750)
        .attr("transform", "translate(-1800,0)")
        .each("end", function(){
            self.footer.selectAll("*").remove();
            func();
            self.footer.transition()
                .duration(750)
                .attr("transform", "translate(0,0)")
        });
}

Dashboard.prototype.clearSlide = function(func){
    var self = this;
    self.map.clearMap();
    self.left.transition()
        .duration(750)
        .attr("transform", "translate(-1200,0)")
        .each("end", function(){ 
            self.left.selectAll("*").remove();
            if(func) func()
        })
    self.right.selectAll("*").remove();
}

Dashboard.prototype.clearMap = function(){
    var self = this;
    self.map.clearMap();
    self.right.selectAll("*").remove();
}

Dashboard.prototype.nextSlide = function(variabele){
    var self = this;
    this.variabele = variabele;
    
    self.updateSelectedThumbnail();
    self.clearSlide(function(){
        self.showSlide(variabele);  
    });
}

Dashboard.prototype.showSlide = function(variabele){
    var self = this;
    this.variabele = variabele;

    for(var i in data.themas[this.thema].variabelen){
        if(data.themas[this.thema].variabelen[i].variabele == variabele){
            this.slide = i;
        }
    }
    
    //self.map.unZoom();
    
    data.getCijfersStad(variabele, function(data_received){
        new Graph(data_received,{variabele: variabele, type: "bar", label: "Amsterdam"}, 500, 160, 20,250, "#leftpane");

        self.setJaarColors(variabele);
        
        //na Cijfers stad, want die haalt de jaren op, zodat je weet wat het laatste Jaar is;
        data.getCijfersGebieden(variabele, null, function(points){
           self.map.showData(points);
           dashboard.showTopTables(points, variabele); 
           data.getCijfersGebieden(variabele, data.getVorigJaar(variabele), function(points_prev){
               dashboard.showDiffTables(points, points_prev, variabele);
           });
        });
    });

    data.getMeta(variabele, function(data){
          if(data.results.length = 1){
            var title = self.left.append("g")
              .style("text-anchor", "start");
            title.append("path")
                .attr("class","titelkader")
                .attr("d","M0 20 L1240 20 L1200 110 L0 110 Z");
            
            title.append("text")
                .attr("dx",20)
                .attr("dy","1.5em")
                .attr("class", "title")
                .text(data.results[0].label);
            
            title.append("text")
                .attr("class", "subtitle")
                .attr("x", 0)
                .attr("y", 0)
                .text(data.results[0].definitie)
                .attr("transform","translate(20,140)")
                .call(wrap, 500, 4); 
            self.left.transition()
                .duration(750)
                .attr("transform", "translate(0,0)");
           
            var gebied = self.left.append("g")
               .attr("id", "gebiedgraph")
               .attr("transform", "translate(0,470)");
           
            if(self.gebied){
               self.showGebied(self.gebied);
            }
          }
    });
    
}

Dashboard.prototype.showTopTables = function(points, variabele, jaar){
      var self = this;
      if(!points.length > 0) return null;
      
      if(!jaar) jaar = data.getHuidigJaar(variabele);
    
      var right = d3.select("#rightpane");
      var toplist = right.append("g").attr("transform", "translate(0,140)");;
        toplist.append("rect").attr("width",400).attr("height","1.8em").style("fill","red").attr("y","-1.4em");
        toplist.append("rect").attr("width",400).attr("height","10em").style("stroke","red").attr("y","-1.4em").style("stroke-weight",1).style("fill","none");
        toplist.append("text")
        .attr("class","listheader")
        .text("Top 5: Buurten met hoogste waarde ("+ jaar +")")
        .style("fill","white")
        .attr("dx",5);
        
        var i = points.length - 1;
        var count = 0;
        while(count < 5 && i >= 0){
            if(points[i].waarde){
            toplist.append("text")
                .attr("class","listitem listitem-"+ points[i].vollcode)
                .attr("dy",((count + 1.25) * 1.5) + "em")
                .attr("dx", 10)
                .text(this.map.gebieden[points[i].vollcode].naam)
                .style("cursor","pointer")
                .attr("code",points[i].vollcode)
                .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
            toplist.append("text")
                .attr("class","listitem listitem-"+ points[i].vollcode)
                .attr("dy",((count + 1.25) * 1.5) + "em")
                .attr("dx", 390)
                .attr("text-anchor","end")
                .text(correct_number(points[i].waarde, variabele))                
                .style("cursor","pointer")
                .attr("code",points[i].vollcode)
                .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
            count++;
            }
            i--;
        }

      var bottomlist = right.append("g").attr("transform", "translate(0,280)");
        bottomlist.append("rect").attr("width",400).attr("height","1.8em").style("fill","red").attr("y","-1.4em");
        bottomlist.append("rect").attr("width",400).attr("height","10em").style("stroke","red").attr("y","-1.4em").style("stroke-weight",1).style("fill","none");
        bottomlist.append("text")
        .attr("class","listheader")
        .text("Top 5: Buurten met laagste waarde ("+ jaar +")")
        .style("fill","white")
        .attr("dx",5);
        var i = 0;
        var count = 0;
        while(count < 5 && i >= 0){
            if(points[i].waarde){
            bottomlist.append("text")
                .attr("class","listitem listitem-"+ points[i].vollcode)
                .attr("dy",((count + 1.25) * 1.5) + "em")
                .attr("dx", 10)
                .text(this.map.gebieden[points[i].vollcode].naam)
                .style("cursor","pointer")
                .attr("code",points[i].vollcode)
                .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
            bottomlist.append("text")
                .attr("class","listitem listitem-"+ points[i].vollcode)
                .attr("dy",((count + 1.25) * 1.5) + "em")
                .attr("dx", 390)
                .attr("text-anchor","end")
                .text(correct_number(points[i].waarde, variabele))
                .style("cursor","pointer")
                .attr("code",points[i].vollcode)
                .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
            count++;
            }
            i++;
        }
}

Dashboard.prototype.showDiffTables = function(p, p_prev, variabele){
    var self = this;
      if(!p.length > 0) return null;
    
      var jaar = data.getHuidigJaar(variabele);
      var prev_jaar = data.getVorigJaar(variabele);
      
      if(prev_jaar > jaar){
          var temp = jaar;
          jaar = prev_jaar;
          prev_jaar = temp;
          var points = p_prev;
          var points_prev = p;
      } else {
          var points = p;
          var points_prev = p_prev;
      }
      
      if(jaar && prev_jaar && points && points_prev){
          
          var diff = [];
      
          for(var i in points){
              for(var j in points_prev){
                if(points[i].vollcode == points_prev[j].vollcode){
                    var temp = {"vollcode": points[i].vollcode};
                    temp.huidig = points[i].waarde;
                    temp.vorig = points_prev[j].waarde;
                    if(points[i].waarde && points_prev[j].waarde && points_prev[j].waarde != 0){
                        temp.waarde = ((temp.huidig - temp.vorig) /  temp.vorig) * 100;
                    } else {
                        temp.waarde = null;
                    }
                    diff.push(temp);
                }
              }
          }
          
          diff.sort(function(a,b){ return a.waarde - b.waarde});
        
          var right = d3.select("#rightpane");
          var topdifflist = right.append("g").attr("transform", "translate(0,480)");;
            topdifflist.append("rect").attr("width",400).attr("height","1.8em").style("fill","red").attr("y","-1.4em");
            topdifflist.append("rect").attr("width",400).attr("height","10em").style("stroke","red").attr("y","-1.4em").style("stroke-weight",1).style("fill","none");
          var header = topdifflist.append("text")
            .attr("class","listheader")
            .text("Top 5: Snelste stijgers ("+ prev_jaar + " - " + jaar +")")
            .style("fill","white")
            .attr("dx",5);
            
            var i = diff.length - 1;
            var count = 0;
            while(count < 5 && i >= 0){
                if(diff[i].waarde){
                    if(count == 0 && diff[i].waarde < 0) header.text("Top 5: Minst snelle dalers ("+ prev_jaar + " - " + jaar +")")
                    topdifflist.append("text")
                        .attr("class","listitem listitem-"+ diff[i].vollcode)
                        .attr("dy",((count + 1.25) * 1.5) + "em")
                        .attr("dx", 10)
                        .text(this.map.gebieden[diff[i].vollcode].naam)
                        .style("cursor","pointer")
                        .attr("code",diff[i].vollcode)
                        .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
                     topdifflist.append("text")
                        .attr("class","listitem listitem-"+ diff[i].vollcode)
                        .attr("dy",((count + 1.25) * 1.5) + "em")
                        .attr("dx", 390)
                        .attr("text-anchor","end")
                        .text(format_number(diff[i].waarde,1)+"%")
                        .style("cursor","pointer")
                        .attr("code",diff[i].vollcode)
                        .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
                     count++;
                }
                i--;
            }

          var bottomdifflist = right.append("g").attr("transform", "translate(0,620)");
            bottomdifflist.append("rect").attr("width",400).attr("height","1.8em").style("fill","red").attr("y","-1.4em");
            bottomdifflist.append("rect").attr("width",400).attr("height","10em").style("stroke","red").attr("y","-1.4em").style("stroke-weight",1).style("fill","none");
          var header2 = bottomdifflist.append("text")
            .attr("class","listheader")
            .text("Top 5: Snelste dalers ("+ prev_jaar + " - " + jaar +")")
            .style("fill","white")
            .attr("dx",5);
            var i = 0;
            var count = 0;
            while(count < 5 && i >= 0){
                if(diff[i].waarde){
                    if(count == 0 && diff[i].waarde > 0) header2.text("Top 5: Minst snelle stijgers ("+ prev_jaar + " - " + jaar +")")
                    bottomdifflist.append("text")
                        .attr("class","listitem listitem-"+ diff[i].vollcode)
                        .attr("dy",((count + 1.25) * 1.5) + "em")
                        .attr("dx", 10)
                        .text(this.map.gebieden[diff[i].vollcode].naam)
                        .style("cursor","pointer")
                        .attr("code",diff[i].vollcode)
                        .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
                    bottomdifflist.append("text")
                        .attr("class","listitem listitem-"+ diff[i].vollcode)
                        .attr("dy",((count + 1.25) * 1.5) + "em")
                        .attr("dx", 390)
                        .attr("text-anchor","end")
                        .text(format_number(diff[i].waarde,1)+"%")
                        .style("cursor","pointer")
                        .attr("code",diff[i].vollcode)
                        .on("click",function(d){self.showGebiedCode(d3.select(this).attr("code"))});
                     count++;
                }
                i++;
            }
      }
        
}


Dashboard.prototype.showJaar = function(variabele, jaar, element){
    var self = this;
   

    this.clearMap();
    data.setHuidigJaar(variabele,jaar);

    data.getCijfersGebieden(variabele, jaar, function(points){
           self.map.showData(points);
           self.setJaarColors(variabele);
           dashboard.showTopTables(points, variabele, jaar);        
           data.getCijfersGebieden(variabele, data.getVorigJaar(variabele), function(points_prev){
               dashboard.showDiffTables(points, points_prev, variabele);
           });
    });
}

Dashboard.prototype.setJaarColors = function(variabele){
    d3.selectAll(".jaar").attr("fill","red").attr("stroke","none");
    d3.selectAll(".jaar"+ data.getHuidigJaar(variabele)).attr("fill","#990000").attr("stroke","black");
    d3.selectAll(".jaar"+ data.getVorigJaar(variabele)).attr("fill","#BB0000");  
    if(this.gebied){
        d3.selectAll(".mappath").style("stroke","#aaa").style("stroke-width",1);
        d3.selectAll("#path-" + this.gebied.vollcode).style("stroke","red").style("stroke-width",3);
    }  
}
                


Dashboard.prototype.clearGebied = function(){
    d3.select("#gebiedgraph").selectAll("*").remove();
    this.gebied = null;
    d3.selectAll(".mappath").style("stroke","#aaa").style("stroke-width",1);
}

Dashboard.prototype.showGebiedCode = function(code){
    var gebied = this.map.getGebiedByCode(code);
    this.showGebied(gebied);
}

Dashboard.prototype.showGebied = function(gebied){
    var self = this;
    
    this.clearGebied();    
    this.gebied = gebied;
    
    d3.selectAll(".mappath").style("stroke","#aaa").style("stroke-width",1);
    d3.selectAll("#path-" + gebied.vollcode).style("stroke","red").style("stroke-width",3);
    d3.selectAll(".listitem").style("fill","black").style("font-weight","normal");
    d3.selectAll(".listitem-" + gebied.vollcode).style("fill","red").style("font-weight","bold");
              
    //console.log(gebied);
    data.getCijfersGebied(self.variabele, gebied.vollcode, function(data_received){
        //console.log(self.variabele);
        //console.log(data_received);
        new Graph(data_received,{variabele: self.variabele, type: "bar", label: gebied.naam}, 500, 160, 20,10, "#gebiedgraph");
        self.setJaarColors(self.variabele);
    });

}
    
function wrap(text, width, maxLines) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.3, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("dx", 0).attr("dy", y).attr("dy", "0em"),
        anchor = text.attr("text-anchor");
    while (word = words.pop()) {
      if(!maxLines || lineNumber < maxLines){
      line.push(word);
      tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", 0).attr("dy", (++lineNumber * lineHeight) + "em").text(word).attr("text-anchor",anchor);
          }
      } else {
        tspan.text("(..)");
        break;
      }
    }
  });
}


