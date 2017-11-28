Data = function(){
    this.themas = [];
    this.cache = {};
    this.baseurl = "https://api.datapunt.amsterdam.nl/bbga/";
}

Data.prototype.getThemas = function(func){
    var self = this;
    d3.json("themas.json", function(error, data) {
        self.themas = data;
        func();
    });
}

Data.prototype.getMeta = function(variabele, func){
    var self = this;
    if(this.cache[variabele] && this.cache[variabele].meta){
        func(this.cache[variabele].meta);
    } else {
        d3.json(this.baseurl + "meta/?format=json&gebiedcode15=STAD&variabele="+ variabele, function(error, data) {
            if (error) throw error;
            if(!error && data){
               if(!self.cache[variabele]) self.cache[variabele] = {};
               self.cache[variabele].meta = data; 
            } 
            func(data);
        });       
    }
}

Data.prototype.getCijfersStad = function(variabele, func){
    var self = this;
    if(this.cache[variabele] && this.cache[variabele].stad){
        func(this.cache[variabele].stad);
    } else {
        d3.json(this.baseurl + "cijfers/?format=json&gebiedcode15=STAD&variabele="+ variabele, function(error, data) {
            if (error) throw error;
            if(!error && data){
               if(!self.cache[variabele]) self.cache[variabele] = {};
               self.cache[variabele].stad = data;
               self.cache[variabele].jaren = [];
               for(var i in data.results){
                    self.cache[variabele].jaren.push(data.results[i].jaar);
               }
               self.cache[variabele].jaren.sort()
               self.cache[variabele].recentJaar = self.cache[variabele].jaren[self.cache[variabele].jaren.length - 1];
               self.cache[variabele].huidigJaar = self.cache[variabele].recentJaar;
            } 
            func(data);
        });       
    }
}

Data.prototype.getCijfersGebied = function(variabele, gebied, func){
    var self = this;
    
    if(this.cache[variabele] && this.cache[variabele].gebied && this.cache[variabele].gebied[gebied]){
        func(this.cache[variabele].gebied[gebied]);
    } else {
        d3.json(this.baseurl + "cijfers/?format=json&gebiedcode15="+ gebied +"&variabele="+ variabele, function(error, data) {
            if (error) throw error;
            if(!error && data){
               if(!self.cache[variabele]) self.cache[variabele] = {};
               if(!self.cache[variabele].gebied) self.cache[variabele].gebied = {};
               self.cache[variabele].gebied[gebied] = data;
            } 
            func(data);
        });       
    }
}

Data.prototype.getCijfersGebieden = function(variabele, jaar, func){
    var self = this;

    if(!jaar) jaar = this.getHuidigJaar(variabele);
    
    if(this.cache[variabele] && this.cache[variabele].gebieden && this.cache[variabele].gebieden[jaar]){
        func(this.cache[variabele].gebieden[jaar]);
    } else {
        d3.json(this.baseurl + "cijfers/?format=json&jaar="+ jaar +"&variabele="+ variabele +"&page_size=5000", function(error, data) {
            if (error) throw error;
            if(!error && data){
                var buurtcombinaties = [];
                  for(var i in data.results){
                      var patt = new RegExp("^[A-Z]{1}[0-9]{2}$"); // Wijk/buurtcombinatie
                      if(patt.test(data.results[i].gebiedcode15)){
                          buurtcombinaties.push({"waarde": data.results[i].waarde, "vollcode": data.results[i].gebiedcode15});
                      }
                  }                
                  buurtcombinaties.sort(function(a,b){ return(a.waarde - b.waarde)});
               
                  if(!self.cache[variabele]) self.cache[variabele] = {};
                  if(!self.cache[variabele].gebieden) self.cache[variabele].gebieden = {};
                  self.cache[variabele].gebieden[jaar] = buurtcombinaties; 
            } 
            func(buurtcombinaties);
        });       
    }
}



Data.prototype.getRecentJaar = function (variabele){
    if(this.cache[variabele]) return this.cache[variabele].recentJaar;
}

Data.prototype.setHuidigJaar = function (variabele, jaar){
    if(this.cache[variabele].huidigJaar && this.cache[variabele].huidigJaar != jaar) this.cache[variabele].vorigJaar = this.cache[variabele].huidigJaar;    
    if(this.cache[variabele]) this.cache[variabele].huidigJaar = jaar;
}

Data.prototype.getHuidigJaar = function (variabele){
    if(this.cache[variabele]) return this.cache[variabele].huidigJaar;
}

Data.prototype.getVorigJaar = function (variabele, jaar){
    if(this.cache[variabele] && this.cache[variabele].vorigJaar) return this.cache[variabele].vorigJaar;
    if(!jaar) jaar = this.getHuidigJaar(variabele);
    var vorigJaar = null;
    if(this.cache[variabele] && this.cache[variabele].jaren){
        for(i in this.cache[variabele].jaren){
            if(this.cache[variabele].jaren[i] == jaar){
                return vorigJaar;
            }
            vorigJaar = this.cache[variabele].jaren[i];
        }
    }
}