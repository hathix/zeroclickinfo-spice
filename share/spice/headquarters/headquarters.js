(function (env) {
    "use strict";
    env.ddg_spice_headquarters = function(api_result){
        console.log("api", api_result);
        
        // grab content
        var query = api_result.query;
        if(!query) return Spice.failed('headquarters');
        var pages = query.pages;
        if(!pages) return Spice.failed('headquarters');

        // grab first page
        var page;
        for(var pageId in pages){
          page = pages[pageId];
          break;
        }
        
        if (!page) {
            return Spice.failed('headquarters');
        }
        
        var companyName = page.title;
        if(!companyName) return Spice.failed('headquarters');
        var revisions = page.revisions;
        if(!revisions) return Spice.failed('headquarters');
        var revision = revisions[0];
        if(!revision) return Spice.failed('headquarters');
        var content = revision["*"];
        if(!content) return Spice.failed('headquarters');
 
        // find each set of {{ ... }}
        var stack = []; 
        var sets = [];
        var length = content.length;

        for (var i = 0; i < length; /* nothing */){
          if (content.charAt(i) + content.charAt(i+1) === "{{"){
            // beginning of a set
            stack.push(i);
            i += 2;
          }
          else if(content.charAt(i) + content.charAt(i-1) === "}}"){
            // found the ending of a set; start of it was stack.pop()
            var start = stack.pop();
            var end = i;

            var set = content.substring(start, end+1);
            sets.push(set);

            i += 2;
          }
          else {
            // neither start nor finish
            i++;
          }
        }

        // find the first infobox, which is the set that begins with the harbinger
        var harbinger = "{{Infobox";
        var infoboxText = null;
        for (var i = 0; i < sets.length; i++){
            var set = sets[i];
            if (set.indexOf(harbinger) === 0){
                infoboxText = set;
                break;
            }
        }

        // must have infobox
        if (!infoboxText){
            return Spice.failed('headquarters');
        }

        // split infobox into items
        var items = infoboxText.split("\n");
        var infobox = {}; // each item is { title: text }
        for (var i = 0; i < items.length; i++){
            var item = items[i];
            var divide = item.indexOf("=");
            if (divide > -1) {
                var left = item.substring(0, divide);
                var right = item.substring(divide + 1);
                var titleArray = left.match(/\w+/);
                var title = titleArray[0];
                var text = right.trim();
                infobox[title] = text;
            }
        }

        /* ** BEGIN HEADQUARTERS-SPECIFIC CODE ** */
        
        console.log("info", infobox);

        // Cleans up a Wikipedia-formatted string, which can contain [[ ... ]] and <ref>'s.
        var cleanse = function(str){
            // get rid of <ref>'s
            str = str.replace(/<ref[\S\s]+<\/ref>/g, "");
            
            // get rid of {{cite}}'s
            str = str.replace(/{{cite[^}]+}}/g, "");            

            // get rid of any {{nowrap|...}}} stuff
            str = str.replace(/{{ *nowrap *\| *([^}]+)}}/g, function(match, group){
                return group;
            });
           

            // replace stuff in [[ ... ]] with original
            str = str.replace(/\[\[([^\]]+)]]/g, function(match, group){
                // if group has a |, return what's on the right side (that's the "display" version
                var barIndex = group.indexOf("|");
                if (barIndex > -1){
                    return group.substring(barIndex + 1).trim();
                }
                else {
                    return group;
                }
            });

            return str;
        };

        var location = null;
        // walk down preference gradient until location found
        if (infobox.hq_location_city && infobox.hq_location_country){
            location = cleanse(infobox.hq_location_city) + ", " + cleanse(infobox.hq_location_country);
        }
        else if (infobox.hq_location_city){
            location = cleanse(infobox.hq_location_city);
        }
        else if(infobox.hq_location){
            location = cleanse(infobox.hq_location);
        }
        else if (infobox.location_city && infobox.location_country){
            location = cleanse(infobox.location_city) + ", " + cleanse(infobox.location_country);
        }
        else if (infobox.location_city){
            location = cleanse(infobox.location_city);
        }
        else if(infobox.location){
            location = cleanse(infobox.location);
        }
        else {
            // nothing found
            return Spice.failed('headquarters');
        }

        // answer = location
        if(location){
            // Success!
            
            var data = {
                name: companyName,
                headquarters: location,
                mapUrl: 'https://www.google.com/maps?q=' + location
            };

            Spice.add({
                id: "headquarters",
                name: "Headquarters",
                data: data,
                meta: {
                    // sourceName: "Wikipedia",
                    // sourceUrl: 'https://en.wikipedia.org/wiki/' + companyName
                },
                templates: {
                    group: 'base',
                    options:{
                        content: Spice.headquarters.content,
                        moreAt: false
                    }
                }
            });
        }
        else {
            return Spice.failed('headquarters');
        }
    };
}(this));